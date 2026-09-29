/* ============================================================================
   Przenosi nowsze pozycje rejestrów z docs/*.md do klikalnej dokumentacji HTML.

     node tools/build-rejestry.mjs

   Sekcje Rejestr decyzji i Pytania otwarte na stronie powstały ręcznie i kończyły
   się na D-124 oraz P-54. Ten skrypt dokłada do nich to, co przybyło później,
   biorąc treść wprost z Markdowna, żeby nie utrzymywać dwóch kopii tego samego.

   Skrypt jest idempotentny: wstawiony blok jest otoczony znacznikiem i przy
   ponownym uruchomieniu podmieniany, a nie dokładany.
   ============================================================================ */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { escapuj, inline, referencje } from "./md-html.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = join(ROOT, "docs");
const SEKCJE = join(ROOT, "dokumentacja", "sekcje");

const OD = "<!-- rejestr:od -->";
const DO = "<!-- rejestr:do -->";

/* ------------------------- zamiana Markdown na HTML ------------------------- */

function pigulka(sila) {
  const s = sila.replace(/\*/g, "").trim();
  const klasa = s.startsWith("TWARDA") ? "pill tw"
    : s.startsWith("WSTĘPNA") ? "pill ws"
    : s.startsWith("ODRZUCONA") ? "pill od"
    : "pill";
  return '<span class="' + klasa + '">' + escapuj(s) + "</span>";
}

/* --------------------------- czytanie z Markdowna --------------------------- */

/* Wiersze tabeli decyzji o identyfikatorze mieszczącym się w podanym zakresie */
function decyzje(plik, od, do_) {
  const tresc = readFileSync(join(DOCS, plik), "utf8");
  const wiersze = [];
  for (const linia of tresc.split(/\r?\n/)) {
    const m = linia.match(/^\|\s*\*\*(D-(\d{2,3}))\*\*\s*\|(.*)\|\s*$/);
    if (!m) continue;
    const numer = parseInt(m[2], 10);
    if (numer < od || numer > do_) continue;
    const kol = m[3].split("|").map((c) => c.trim());
    if (kol.length < 4) continue;
    wiersze.push({ id: m[1], tresc: kol[0], sila: kol[1], kto: kol[2], powiazania: kol[3] });
  }
  if (!wiersze.length) throw new Error("Brak decyzji " + od + "-" + do_ + " w " + plik);
  return wiersze;
}

function tabelaDecyzji(wiersze, naglowekOstatniej) {
  return '  <div class="tbl-wrap">\n' +
    '    <table class="t">\n' +
    "      <thead><tr><th>ID</th><th>Decyzja</th><th>Siła</th><th>Kto</th><th>" +
    naglowekOstatniej + "</th></tr></thead>\n      <tbody>\n" +
    wiersze.map((w) =>
      "        <tr><td>" + referencje(w.id) + "</td><td>" + inline(w.tresc) + "</td><td>" +
      pigulka(w.sila) + "</td><td>" + inline(w.kto) + "</td><td>" + inline(w.powiazania) +
      "</td></tr>"
    ).join("\n") +
    "\n      </tbody>\n    </table>\n  </div>";
}

/* Pytania otwarte zapisane jako nagłówek "### P-NN. Tytuł" plus akapity pod nim */
function pytania(od, do_) {
  const tresc = readFileSync(join(DOCS, "14-pytania-otwarte.md"), "utf8");
  const bloki = tresc.split(/^### /m).slice(1);
  const out = [];
  for (const blok of bloki) {
    const m = blok.match(/^P-(\d{2,3})\.\s*([^\n]+)\n([\s\S]*?)$/);
    if (!m) continue;
    const numer = parseInt(m[1], 10);
    if (numer < od || numer > do_) continue;
    const tekst = m[3].split(/\n## |\n---/)[0].trim()
      .split(/\n\s*\n/).map((a) => a.replace(/\s*\n\s*/g, " ").trim()).filter(Boolean);
    out.push({ id: "P-" + m[1], tytul: m[2].trim(), akapity: tekst });
  }
  if (!out.length) throw new Error("Brak pytan " + od + "-" + do_);
  return out;
}

function listaPytan(lista) {
  return lista.map((p) =>
    "      <p>" + referencje(p.id) + " <b>" + inline(p.tytul) + "</b><br>\n        " +
    p.akapity.map(inline).join("<br>\n        ") + "</p>"
  ).join("\n");
}

/* ------------------------------ wstawianie ------------------------------ */

function wstaw(sciezka, kotwica, blok) {
  let tresc = readFileSync(sciezka, "utf8");
  tresc = tresc.replace(new RegExp("\\s*" + OD + "[\\s\\S]*?" + DO, "g"), "");
  const idx = tresc.indexOf(kotwica);
  if (idx < 0) throw new Error("Brak kotwicy w " + sciezka + ": " + kotwica);
  const pelny = "  " + OD + "\n" + blok + "\n  " + DO + "\n\n  ";
  writeFileSync(sciezka, tresc.slice(0, idx) + pelny + tresc.slice(idx), "utf8");
}

/* ------------------------------- decyzje ------------------------------- */

const warsztat0409 = decyzje("17-warsztat-2026-09-04.md", 125, 147);
const makieta = decyzje("13-rejestr-decyzji.md", 148, 157);
const feedback2909 = decyzje("13-rejestr-decyzji.md", 158, 160);
const panel2909 = decyzje("13-rejestr-decyzji.md", 161, 206);
const potwierdzenia2909 = decyzje("13-rejestr-decyzji.md", 207, 212);

const blokDecyzji =
  "  <h2>Warsztat doprecyzowujący (2026-09-04)</h2>\n" +
  '  <div class="callout ok">\n' +
  '    <span class="ct">' + warsztat0409.length + " decyzji, w tym 6 odwróceń wcześniejszych ustaleń</span>\n" +
  "    Drugi warsztat przeprowadzono na żywo na makiecie v2. Przyniósł powrót modułu zadań,\n" +
  "    edytowalne pola finansowe, konfigurowalne progi dofinansowania i rozdzielenie widoku\n" +
  "    Dofinansowań na Bazę danych i Wnioski. Kontekst, cytaty i sekcja konfliktów:\n" +
  "    <a href=\"15-warsztat-0904.html\" onclick=\"if(parent!==window){parent.docNav('15-warsztat-0904');return false}\">Warsztat 04.09.2026</a>.\n" +
  "  </div>\n" +
  tabelaDecyzji(warsztat0409, "Typ") + "\n\n" +
  "  <h2>Budowa makiety na bazie danych (2026-09-23)</h2>\n" +
  '  <div class="callout">\n' +
  '    <span class="ct">' + makieta.length + " decyzji wykonawczych, wszystkie autorstwa wykonawcy</span>\n" +
  "    Te decyzje nie padły na warsztacie. Powstały przy przenoszeniu makiety na bazę SQLite,\n" +
  "    przy wdrażaniu panelu logowania i przy egzekwowaniu separacji danych. Ustalenia z warsztatów\n" +
  "    mówiły, <b>co</b> system ma robić, ale nie rozstrzygały, <b>gdzie</b> ma to być egzekwowane.\n" +
  "    Szerzej: <a href=\"16-od-makiety.html\" onclick=\"if(parent!==window){parent.docNav('16-od-makiety');return false}\">Od makiety do aplikacji</a>.\n" +
  "  </div>\n" +
  tabelaDecyzji(makieta, "Dotyczy") + "\n\n" +
  "  <h2>Feedback klienta po makiecie na bazie danych (2026-09-29)</h2>\n" +
  '  <div class="callout ok">\n' +
  '    <span class="ct">' + feedback2909.length + " decyzje klienta po obejrzeniu makiety z zespołem</span>\n" +
  "    Ocena ogólna: czytelnie, kierunek dobry. Zmiany: kolory statusów identyczne z Excelem,\n" +
  "    zakładki roczne dodawane samodzielnie, test migracji tylko na danych z 2026 roku.\n" +
  "  </div>\n" +
  tabelaDecyzji(feedback2909, "Dotyczy") + "\n\n" +
  "  <h2>Panel decyzyjny i przegląd modelu danych (2026-09-29)</h2>\n" +
  '  <div class="callout">\n' +
  '    <span class="ct">' + panel2909.length + " decyzji: 38 punktów panelu i ustalenia z przeglądu diagramu tabel</span>\n" +
  "    Punkty, na które odpowiada klient, są zapisane jako wstępne i wymagają jego potwierdzenia.\n" +
  "    Wybory P-04 i P-02 wykonawca skorygował tego samego dnia: korekta faktury trafia do nowego\n" +
  "    okresu, a progi nie przeliczają się wstecz.\n" +
  "  </div>\n" +
  tabelaDecyzji(panel2909, "Dotyczy") + "\n\n" +
  "  <h2>Potwierdzenia i standardy Open Mercato (2026-09-29)</h2>\n" +
  '  <div class="callout ok">\n' +
  '    <span class="ct">' + potwierdzenia2909.length + " decyzji wykonawcy po przeglądzie makiety</span>\n" +
  "    Potwierdzony formularz natywny i log istotnych zdarzeń, bez statystyk per handlowiec, ale\n" +
  "    z filtrowaniem danych per handlowiec, standardy Open Mercato w makiecie i drill through.\n" +
  "  </div>\n" +
  tabelaDecyzji(potwierdzenia2909, "Dotyczy");

wstaw(join(SEKCJE, "13-decyzje.html"),
      "<h2>Decyzje unieważnione w trakcie warsztatu</h2>", blokDecyzji);

/* ------------------------------- pytania ------------------------------- */

const pytania0409 = pytania(55, 58);
const pytaniaMakiety = pytania(59, 63);

const blokPytan =
  "  <h3>Pytania z warsztatu doprecyzowującego (2026-09-04)</h3>\n" +
  '  <details class="acc">\n' +
  "    <summary>" + pytania0409.length + " pytania otwarte po drugim warsztacie</summary>\n" +
  '    <div class="acc-body">\n' +
  listaPytan(pytania0409) + "\n" +
  "    </div>\n  </details>\n\n" +
  "  <h3>Pytania z budowy makiety na bazie danych (2026-09-23)</h3>\n" +
  '  <details class="acc">\n' +
  "    <summary>" + pytaniaMakiety.length + " pytań technicznych przed startem implementacji</summary>\n" +
  '    <div class="acc-body">\n' +
  '      <p class="muted">Żadne z nich nie jest blokadą, ale dwa z nich stoją przed startem\n' +
  "        implementacji: gdzie egzekwować separację w aplikacji i czy powstaje osobna\n" +
  "        specyfikacja ekranów.</p>\n" +
  listaPytan(pytaniaMakiety) + "\n" +
  "    </div>\n  </details>";

wstaw(join(SEKCJE, "12-pytania-ryzyka.html"), "<h3>Podsumowanie pytań</h3>", blokPytan);

console.log("Decyzje: D-125 - D-147 (" + warsztat0409.length + "), D-148 - D-157 (" + makieta.length +
            "), D-158 - D-160 (" + feedback2909.length + "), D-161 - D-206 (" + panel2909.length + "), D-207 - D-212 (" + potwierdzenia2909.length + ")");
console.log("Pytania: P-55 - P-58 (" + pytania0409.length + "), P-59 - P-63 (" + pytaniaMakiety.length + ")");
