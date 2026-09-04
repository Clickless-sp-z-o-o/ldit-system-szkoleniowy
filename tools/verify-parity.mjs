/* ============================================================
   Bramka jakosci: sprawdza, ze adapter (assets/db.js) odtwarza
   window.DB dokladnie tak, jak stary generator (legacy-data-gen.js).

   Laduje wygenerowany seed + store.js + db.js w izolowanym kontekscie
   (window bez localStorage/document, wystarczaja strazniki w kodzie),
   po czym porownuje kazda tabele widoku ze zrodlem.

   Wymaga wczesniejszego:  node tools/build-db.mjs
   Uruchomienie:           node tools/verify-parity.mjs
   Kod wyjscia 1 przy rozjezdzie.
   ============================================================ */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, "..");
const A = path.join(root, "makieta", "assets");

function run(files, extraGlobals) {
  const sandbox = Object.assign({ window: {}, console }, extraGlobals || {});
  vm.createContext(sandbox);
  for (const f of files) {
    vm.runInContext(fs.readFileSync(f, "utf8"), sandbox, { filename: path.basename(f) });
  }
  return sandbox.window;
}

/* Stary generator */
const legacy = run([path.join(dir, "legacy-data-gen.js")]).DB;

/* Nowa sciezka: seed -> store -> adapter */
const nowe = run([
  path.join(A, "db.seed.js"),
  path.join(A, "store.js"),
  path.join(A, "db.js")
]).DB;

/* Porownanie "podzbioru": adapter MUSI wiernie odtworzyc kazde pole legacy,
   ale wolno mu dodac nowe pola (intencjonalne rozszerzenia, np. nadpisanie
   prowizji per wniosek). Zwraca sciezke pierwszej roznicy albo null. */
function diffPath(legacy, actual, path) {
  if (Array.isArray(legacy)) {
    if (!Array.isArray(actual)) return path + " (oczekiwano tablicy)";
    if (legacy.length !== actual.length) return path + " (dlugosc " + legacy.length + " != " + actual.length + ")";
    for (let i = 0; i < legacy.length; i++) {
      const d = diffPath(legacy[i], actual[i], path + "[" + i + "]");
      if (d) return d;
    }
    return null;
  }
  if (legacy && typeof legacy === "object") {
    if (!actual || typeof actual !== "object") return path + " (oczekiwano obiektu)";
    for (const k of Object.keys(legacy)) {
      const d = diffPath(legacy[k], actual[k], path + "." + k);
      if (d) return d;
    }
    return null;
  }
  if (legacy === actual) return null;
  if (typeof legacy === "number" && typeof actual === "number" && Math.abs(legacy - actual) < 1e-9) return null;
  return path + " (" + JSON.stringify(legacy) + " != " + JSON.stringify(actual) + ")";
}

const TABELE = ["INSTYTUCJE", "PUPY", "SZKOLENIA", "KLIENCI", "WNIOSKI", "WNIOSKI_2025",
  "NABORY", "FAKTURY", "TERMINY", "UZYTKOWNICY", "MODULY", "AKTYWNOSC", "LOGOWANIA",
  "ZGLOSZENIA", "SZABLONY", "KOLEJKA", "MAILE", "CELE"];

let bledy = 0;
for (const t of TABELE) {
  const a = legacy[t], b = nowe[t];
  if (!Array.isArray(a) || !Array.isArray(b)) { console.error("  " + t + ": brak tabeli po jednej ze stron"); bledy++; continue; }
  if (a.length !== b.length) { console.error("  " + t + ": rozna liczba wierszy " + a.length + " vs " + b.length); bledy++; continue; }
  let rozne = 0, pierwszy = null;
  for (let i = 0; i < a.length; i++) {
    const d = diffPath(a[i], b[i], t + "[" + i + "]");
    if (d) { rozne++; if (!pierwszy) pierwszy = d; }
  }
  if (rozne) {
    console.error("  " + t + ": rozne wiersze " + rozne + "/" + a.length + ", pierwsza roznica: " + pierwszy);
    bledy++;
  } else {
    console.log("  OK " + t + " (" + a.length + ")");
  }
}

if (bledy) { console.error("\nPARYTET ZLAMANY w " + bledy + " tabelach"); process.exit(1); }
console.log("\nParytet OK: adapter odtwarza wszystkie tabele 1:1");
