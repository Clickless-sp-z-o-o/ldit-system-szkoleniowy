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

function stable(v) {
  if (Array.isArray(v)) return "[" + v.map(stable).join(",") + "]";
  if (v && typeof v === "object") {
    return "{" + Object.keys(v).sort().map(function (k) { return JSON.stringify(k) + ":" + stable(v[k]); }).join(",") + "}";
  }
  return JSON.stringify(v);
}

const TABELE = ["INSTYTUCJE", "PUPY", "SZKOLENIA", "KLIENCI", "WNIOSKI", "WNIOSKI_2025",
  "NABORY", "FAKTURY", "TERMINY", "UZYTKOWNICY", "MODULY", "AKTYWNOSC", "LOGOWANIA",
  "ZGLOSZENIA", "SZABLONY", "KOLEJKA", "MAILE", "CELE"];

let bledy = 0;
for (const t of TABELE) {
  const a = legacy[t], b = nowe[t];
  if (!Array.isArray(a) || !Array.isArray(b)) { console.error("  " + t + ": brak tabeli po jednej ze stron"); bledy++; continue; }
  if (a.length !== b.length) { console.error("  " + t + ": rozna liczba wierszy " + a.length + " vs " + b.length); bledy++; continue; }
  let rozne = 0, pierwszy = -1;
  for (let i = 0; i < a.length; i++) {
    if (stable(a[i]) !== stable(b[i])) { rozne++; if (pierwszy < 0) pierwszy = i; }
  }
  if (rozne) {
    console.error("  " + t + ": rozne wiersze " + rozne + "/" + a.length + ", pierwszy indeks " + pierwszy);
    console.error("    legacy: " + stable(a[pierwszy]).slice(0, 300));
    console.error("    nowe:   " + stable(b[pierwszy]).slice(0, 300));
    bledy++;
  } else {
    console.log("  OK " + t + " (" + a.length + ")");
  }
}

if (bledy) { console.error("\nPARYTET ZLAMANY w " + bledy + " tabelach"); process.exit(1); }
console.log("\nParytet OK: adapter odtwarza wszystkie tabele 1:1");
