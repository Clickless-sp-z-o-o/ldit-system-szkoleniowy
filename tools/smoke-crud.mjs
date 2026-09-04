/* ============================================================
   Smoke test warstwy danych: seed -> store -> adapter.
   Sprawdza kontrakt, na ktorym opieraja sie strony z inline CRUD:
   insert/update/remove przebudowuja window.DB i emituja "db:changed".

   Uruchomienie:  node tools/smoke-crud.mjs   (kod 1 przy bledzie)
   ============================================================ */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const A = path.resolve(dir, "..", "makieta", "assets");

/* Minimalny shim window: zdarzenia + localStorage, bez DOM */
function makeWindow() {
  const handlers = {};
  const mem = {};
  const win = {
    addEventListener: (t, fn) => { (handlers[t] = handlers[t] || []).push(fn); },
    dispatchEvent: (e) => { (handlers[e.type] || []).forEach((fn) => fn(e)); return true; },
    CustomEvent: class { constructor(type) { this.type = type; } },
    localStorage: {
      getItem: (k) => (k in mem ? mem[k] : null),
      setItem: (k, v) => { mem[k] = String(v); },
      removeItem: (k) => { delete mem[k]; }
    }
  };
  return win;
}

const sandbox = { window: makeWindow(), console };
vm.createContext(sandbox);
for (const f of ["db.seed.js", "store.js", "db.js"]) {
  vm.runInContext(fs.readFileSync(path.join(A, f), "utf8"), sandbox, { filename: f });
}
const win = sandbox.window;

let bledy = 0, zmian = 0;
win.addEventListener("db:changed", () => { zmian++; });
function ok(warunek, opis) {
  if (warunek) { console.log("  OK " + opis); } else { console.error("  FAIL " + opis); bledy++; }
}

const startLen = win.DB.TERMINY.length;
ok(startLen === win.Store.get("terminy").length, "spojnosc liczby terminow na starcie (" + startLen + ")");

/* INSERT */
const nowy = win.Store.insert("terminy", {
  instytucja_id: "IS-01", szkolenie_id: "SZ-101", nazwa: "Test termin",
  data_od: "2026-12-01", data_do: "2026-12-02", miejsce: "Online",
  status_realizacji: "Wolny", zapisani: 0, limit: 10
}, "TR-");
ok(win.DB.TERMINY.length === startLen + 1, "insert zwieksza liczbe terminow");
const widok = win.DB.TERMINY.filter((t) => t.id === nowy.id)[0];
ok(!!widok, "nowy termin widoczny w adapterze (" + nowy.id + ")");
ok(widok && widok.od === "2026-12-01" && widok.status === "Wolny" && widok.is === "IS-01",
   "adapter mapuje pola snake_case na widok (od/status/is)");
ok(zmian >= 1, "insert wyemitowal db:changed");

/* UPDATE */
win.Store.update("terminy", nowy.id, { zapisani: 5, status_realizacji: "Zaplanowany" });
const po = win.DB.TERMINY.filter((t) => t.id === nowy.id)[0];
ok(po && po.zapisani === 5 && po.status === "Zaplanowany", "update odzwierciedlony w widoku");

/* REMOVE */
win.Store.remove("terminy", nowy.id);
ok(win.DB.TERMINY.length === startLen, "remove przywraca liczbe terminow");
ok(win.DB.TERMINY.filter((t) => t.id === nowy.id).length === 0, "usuniety termin znika z widoku");

/* Trwalosc: zmiana zapisala sie do localStorage */
ok(win.localStorage.getItem(win.Store.KEY) != null, "stan zapisany w localStorage");

if (bledy) { console.error("\nSMOKE CRUD: " + bledy + " bledow"); process.exit(1); }
console.log("\nSmoke CRUD OK (" + zmian + " zdarzen db:changed)");
