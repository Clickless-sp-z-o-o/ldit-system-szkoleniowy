/* ============================================================================
   Wspolne srodowisko dla testow warstwy danych makiety.

   Uruchamia w Node te same pliki, ktore laduje przegladarka: sqlite.js,
   store.js, auth.js, zakres.js, prowizja.js i db.js. Dzieki temu testy
   sprawdzaja kod produkcyjny makiety, a nie jego kopie.

   Silnik sql.js jest ladowany sciezka node'owa, a binarium WASM odczytywane
   z tego samego pliku base64, ktorego uzywa przegladarka.
   ============================================================================ */

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS = join(ROOT, "makieta", "assets");
const DB_DIR = join(ROOT, "makieta", "db");

const PLIKI = ["sqlite.js", "store.js", "auth.js", "zakres.js", "prowizja.js", "db.js"];

function stworzOkno() {
  const sluchacze = {};
  const pamiec = {};
  return {
    addEventListener: (t, fn) => { (sluchacze[t] = sluchacze[t] || []).push(fn); },
    dispatchEvent: (e) => { (sluchacze[e.type] || []).forEach((fn) => fn(e)); return true; },
    CustomEvent: class { constructor(type) { this.type = type; } },
    localStorage: {
      getItem: (k) => (k in pamiec ? pamiec[k] : null),
      setItem: (k, v) => { pamiec[k] = String(v); },
      removeItem: (k) => { delete pamiec[k]; }
    },
    atob: (s) => Buffer.from(s, "base64").toString("binary"),
    btoa: (s) => Buffer.from(s, "binary").toString("base64"),
    setTimeout, clearTimeout,
    location: { reload: () => {}, replace: () => {} }
  };
}

/* Zwraca gotowe okno makiety z zaladowana baza. */
export async function przygotuj() {
  const window = stworzOkno();
  const sandbox = { window, console, Promise, Uint8Array, Error, JSON, Math, Object, Array, String, Number, Date, RegExp, parseInt, parseFloat };
  sandbox.global = sandbox;
  vm.createContext(sandbox);

  const initSqlJs = require(join(DB_DIR, "sql-wasm.js"));
  const wasm = readFileSync(join(DB_DIR, "sql-wasm-data.js"), "utf8").match(/"([A-Za-z0-9+/=]+)"/)[1];
  const seed = readFileSync(join(DB_DIR, "seed-db.js"), "utf8").match(/"([A-Za-z0-9+/=]+)"/)[1];

  /* Silnik dostarczamy z Node; sqlite.js dostaje go pod ta sama nazwa,
     pod ktora znajduje go w przegladarce. */
  window.initSqlJs = (opcje) => initSqlJs(opcje);
  window.SQL_WASM_BASE64 = wasm;
  window.KFS_SEED_DB = seed;

  for (const plik of PLIKI) {
    vm.runInContext(readFileSync(join(ASSETS, plik), "utf8"), sandbox, { filename: plik });
  }

  await window.KFS.gotowa;
  window.DB.przebuduj();
  return window;
}

/* Minimalny licznik asercji. */
export function licznik(nazwa) {
  let bledy = 0, wszystkie = 0;
  return {
    ok(warunek, opis) {
      wszystkie++;
      if (warunek) console.log("  OK   " + opis);
      else { console.error("  BLAD " + opis); bledy++; }
    },
    rowne(a, b, opis) {
      this.ok(a === b, opis + " (oczekiwano " + JSON.stringify(b) + ", jest " + JSON.stringify(a) + ")");
    },
    podsumuj() {
      console.log("\n" + nazwa + ": " + (wszystkie - bledy) + "/" + wszystkie + " przeszlo");
      if (bledy) process.exit(1);
    }
  };
}
