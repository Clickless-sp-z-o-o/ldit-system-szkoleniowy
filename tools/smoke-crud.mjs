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

/* KATALOG SZKOLEN (06-instytucje) */
const startSzk = win.DB.SZKOLENIA.length;
const nowySzk = win.Store.insert("katalog_szkolen",
  { instytucja_id: "IS-01", nazwa: "Test plan", liczba_godzin: 8, liczba_dni: 1, tryb: "Online", cena: 1500 }, "SZ-");
ok(win.DB.SZKOLENIA.length === startSzk + 1, "insert planu szkolenia zwieksza katalog");
const vSzk = win.DB.SZKOLENIA.filter((s) => s.id === nowySzk.id)[0];
ok(vSzk && vSzk.is === "IS-01" && vSzk.godz === 8 && vSzk.cena === 1500, "adapter mapuje plan (is/godz/cena)");
win.Store.update("katalog_szkolen", nowySzk.id, { cena: 1800 });
ok(win.DB.SZKOLENIA.filter((s) => s.id === nowySzk.id)[0].cena === 1800, "update ceny planu");
win.Store.remove("katalog_szkolen", nowySzk.id);
ok(win.DB.SZKOLENIA.length === startSzk, "remove planu przywraca katalog");

/* INSTYTUCJE (06-instytucje) */
const startIS = win.DB.INSTYTUCJE.length;
const nowaIS = win.Store.insert("instytucje",
  { nazwa: "Test IS", skrot: "TIS", siedziba_miejscowosc: "Poznań", nip: "1234567890",
    osoba_kontaktowa: "Jan Test", email: "t@t.pl", telefon: "600 000 000",
    opis_dzialalnosci: "x", standard_godzinowy: "9-16", opiekun_ldit: "Martyna" }, "IS-");
ok(win.DB.INSTYTUCJE.length === startIS + 1, "insert instytucji");
const vIS = win.DB.INSTYTUCJE.filter((x) => x.id === nowaIS.id)[0];
ok(vIS && vIS.miasto === "Poznań" && vIS.prowizja && vIS.prowizja.model === "D",
   "adapter mapuje instytucje + domyslne warunki prowizji (model D)");
win.Store.update("instytucje", nowaIS.id, { nazwa: "Test IS 2" });
ok(win.DB.INSTYTUCJE.filter((x) => x.id === nowaIS.id)[0].nazwa === "Test IS 2", "update nazwy instytucji");
win.Store.remove("instytucje", nowaIS.id);
ok(win.DB.INSTYTUCJE.length === startIS, "remove instytucji przywraca liczbe");

/* KLIENCI (04-baza-klientow) */
const startKl = win.DB.KLIENCI.length;
const nowyKl = win.Store.insert("klienci",
  { numer_klienta: 9999, nazwa: "Test Klient", nip: "9990001112", wielkosc_przedsiebiorstwa: "mikro",
    liczba_zatrudnionych: 5, osoba_kontaktowa: "Ala Test", telefon: "600 111 222", email: "k@k.pl",
    instytucja_id: "IS-01", pup_id: "PUP-01", miasto: "Poznań" }, "KL-");
ok(win.DB.KLIENCI.length === startKl + 1, "insert klienta");
const vKl = win.DB.KLIENCI.filter((k) => k.id === nowyKl.id)[0];
ok(vKl && vKl.nr === 9999 && vKl.wielkosc === "mikro" && vKl.is === "IS-01", "adapter mapuje klienta (nr/wielkosc/is)");
win.Store.update("klienci", nowyKl.id, { telefon: "601 999 999" });
ok(win.DB.KLIENCI.filter((k) => k.id === nowyKl.id)[0].tel === "601 999 999", "update telefonu klienta");
win.Store.remove("klienci", nowyKl.id);
ok(win.DB.KLIENCI.length === startKl, "remove klienta przywraca liczbe");

/* Trwalosc: zmiana zapisala sie do localStorage */
ok(win.localStorage.getItem(win.Store.KEY) != null, "stan zapisany w localStorage");

if (bledy) { console.error("\nSMOKE CRUD: " + bledy + " bledow"); process.exit(1); }
console.log("\nSmoke CRUD OK (" + zmian + " zdarzen db:changed)");
