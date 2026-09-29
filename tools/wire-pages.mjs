/* ============================================================================
   Podmiana lancucha skryptow w stronach makiety na wersje z baza SQLite.

     node tools/wire-pages.mjs

   Co robi w kazdej stronie modulu:
     1. wstawia komplet skryptow (silnik SQLite, dane, sesja, separacja, adapter)
     2. dopisuje boot.js z deklaracja modulu, ktory strona obsluguje
     3. zmienia wlasny skrypt strony na blok <script type="text/kfs-strona">,
        zeby uruchomil sie dopiero po wstaniu bazy

   Skrypt jest idempotentny: ponowne uruchomienie niczego nie duplikuje.
   ============================================================================ */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const STRONY = join(ROOT, "makieta", "strony");

/* Ktory modul obsluguje dana strona. Modul decyduje o dostepie (D-36). */
const MODUL_STRONY = {
  "01-dashboard.html": "dash",
  "02-zestawienia.html": "dofin",
  "03-wniosek.html": "dofin",
  "04-baza-klientow.html": "dofin",
  "05-nabory.html": "nabory",
  "06-instytucje.html": "inst",
  /* Konfigurator warunkow prowizyjnych jest ekranem administratora, mimo ze
     wchodzi sie do niego z zakladki Instytucje szkoleniowe (D-07, D-93). */
  "07-konfigurator-is.html": "admin",
  "08-administracja.html": "admin",
  "09-wysylka-maili.html": "komun",
  "10-zgloszenia.html": "zglo",
  "11-konta-uprawnienia.html": "ustaw",
  "12-rejestr-aktywnosci.html": "ustaw",
  "13-terminy.html": "terminy",
  "14-statystyki.html": "dash",
  "15-konfigurator-prowizji.html": "admin",
  "16-panel-is.html": "panelIS",
  "17-panel-klienta.html": "panelKL",
  "18-zadania.html": "zadania"
};

const ZNACZNIK = "<!-- kfs:skrypty -->";

function lancuch(prefix, modul) {
  return [
    ZNACZNIK,
    `<script src="${prefix}db/sql-wasm.js"></script>`,
    `<script src="${prefix}db/sql-wasm-data.js"></script>`,
    `<script src="${prefix}db/seed-db.js"></script>`,
    `<script src="${prefix}assets/sqlite.js"></script>`,
    `<script src="${prefix}assets/store.js"></script>`,
    `<script src="${prefix}assets/auth.js"></script>`,
    `<script src="${prefix}assets/zakres.js"></script>`,
    `<script src="${prefix}assets/prowizja.js"></script>`,
    `<script src="${prefix}assets/db.js"></script>`,
    `<script src="${prefix}assets/lata.js"></script>`,
    `<script src="${prefix}assets/tips.js"></script>`,
    `<script src="${prefix}assets/boot.js"${modul ? ` data-modul="${modul}"` : ""}></script>`
  ].join("\n");
}

/* Stary lancuch: ciag kolejnych includow zaczynajacy sie od pliku z danymi.
   Wzorzec konczy sie na pierwszym znaczniku, ktory nie jest <script src=...>,
   zeby nie polknac wlasnego skryptu strony (w czesci stron tips.js lezal
   dopiero za nim). */
const STARY = /<script src="\.\.\/assets\/(?:db\.seed|data)\.js"><\/script>(?:\s*<script src="[^"]+"><\/script>)*/;
const NOWY_ZNACZNIK = new RegExp(ZNACZNIK + "[\\s\\S]*?boot\\.js\"[^>]*></script>");
const OSIEROCONY_TIPS = /\s*<script src="\.\.\/assets\/tips\.js"><\/script>/g;

let zmienione = 0;

for (const plik of readdirSync(STRONY).filter((f) => f.endsWith(".html"))) {
  const sciezka = join(STRONY, plik);
  let tresc = readFileSync(sciezka, "utf8");
  const modul = MODUL_STRONY[plik];
  if (!modul) {
    console.warn("Pomijam, brak przypisania modulu: " + plik);
    continue;
  }

  const nowy = lancuch("../", modul);
  if (NOWY_ZNACZNIK.test(tresc)) {
    tresc = tresc.replace(NOWY_ZNACZNIK, nowy);
  } else if (STARY.test(tresc)) {
    /* tips.js wchodzi do nowego lancucha, wiec luzne wystapienia wypadaja */
    tresc = tresc.replace(OSIEROCONY_TIPS, "");
    tresc = tresc.replace(STARY, nowy);
  } else {
    console.warn("Nie znalazlem lancucha skryptow w " + plik);
    continue;
  }

  /* Skrypt strony ma czekac na baze */
  tresc = tresc.replace(/<script>(\r?\n)/g, '<script type="text/kfs-strona">$1');

  writeFileSync(sciezka, tresc, "utf8");
  zmienione++;
}

console.log("Przepieto stron: " + zmienione);
