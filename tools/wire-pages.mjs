/* ============================================================
   Podmiana includu danych w stronach makiety.

   Zamienia pojedynczy <script src="../assets/data.js"> na lancuch:
     db.seed.js (dane) -> store.js (warstwa danych) -> db.js (adapter widoku)

   Idempotentne: jesli strona ma juz nowy lancuch, pomija.
   Uruchomienie:  node tools/wire-pages.mjs
   ============================================================ */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const stronyDir = path.resolve(dir, "..", "makieta", "strony");

const STARY = '<script src="../assets/data.js"></script>';
const NOWY =
  '<script src="../assets/db.seed.js"></script>\n' +
  '<script src="../assets/store.js"></script>\n' +
  '<script src="../assets/db.js"></script>';

const pliki = fs.readdirSync(stronyDir).filter((f) => f.endsWith(".html"));
let zmienione = 0, pominiete = 0, brak = 0;

for (const plik of pliki) {
  const p = path.join(stronyDir, plik);
  const tresc = fs.readFileSync(p, "utf8");
  if (tresc.includes('src="../assets/db.js"')) { pominiete++; continue; }
  if (!tresc.includes(STARY)) { brak++; console.warn("  brak includu w:", plik); continue; }
  fs.writeFileSync(p, tresc.replace(STARY, NOWY), "utf8");
  zmienione++;
}

console.log("Podmieniono:", zmienione, "| pominieto (juz nowe):", pominiete, "| bez includu:", brak);
