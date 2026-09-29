/* ============================================================================
   Zgodnosc formularzy makiety ze schematem bazy.

     node tools/test-zgodnosc-pol.mjs

   Strony zapisuja dane przez Store.insert i Store.update. Store przepuszcza
   tylko kolumny, ktore istnieja w tabeli, wiec literowka albo stara nazwa pola
   nie wywala bledu, tylko po cichu gubi wartosc. Ten test wychwytuje takie
   przypadki: czyta literaly obiektow ze stron i porownuje klucze z PRAGMA
   table_info kazdej tabeli.
   ============================================================================ */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { przygotuj, licznik } from "./harness.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const STRONY = join(ROOT, "makieta", "strony");

const t = licznik("Zgodnosc pol formularzy ze schematem");
const w = await przygotuj();

function kolumny(tabela) {
  return w.Store.query("PRAGMA table_info(" + tabela + ")").map((r) => r.name);
}

/* Wycina literal obiektu zaczynajacy sie na podanej pozycji, liczac nawiasy.
   Pomija nawiasy wewnatrz apostrofow i cudzyslowow. */
function literalObiektu(tekst, od) {
  let glebokosc = 0, cudzyslow = null;
  for (let i = od; i < tekst.length; i++) {
    const z = tekst[i];
    if (cudzyslow) {
      if (z === "\\") i++;
      else if (z === cudzyslow) cudzyslow = null;
      continue;
    }
    if (z === '"' || z === "'") { cudzyslow = z; continue; }
    if (z === "{") glebokosc++;
    else if (z === "}") {
      glebokosc--;
      if (glebokosc === 0) return tekst.slice(od, i + 1);
    }
  }
  return null;
}

/* Klucze pierwszego poziomu literalu obiektu */
function kluczeNajwyzszego(literal) {
  const klucze = [];
  let glebokosc = 0, cudzyslow = null, bufor = "";
  for (let i = 0; i < literal.length; i++) {
    const z = literal[i];
    if (cudzyslow) {
      if (z === "\\") i++;
      else if (z === cudzyslow) cudzyslow = null;
      continue;
    }
    if (z === '"' || z === "'") { cudzyslow = z; bufor = ""; continue; }
    if (z === "{" || z === "[" || z === "(") { glebokosc++; bufor = ""; continue; }
    if (z === "}" || z === "]" || z === ")") { glebokosc--; bufor = ""; continue; }
    if (glebokosc !== 1) { bufor = ""; continue; }
    if (z === ",") { bufor = ""; continue; }
    if (z === ":") {
      const nazwa = bufor.trim();
      if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(nazwa)) klucze.push(nazwa);
      bufor = "";
      continue;
    }
    bufor += z;
  }
  return klucze;
}

const WZORZEC = /Store\.(insert|update)\(\s*"([a-z_]+)"\s*,/g;
let sprawdzonych = 0;

/* Strony i ich skrypty wydzielone do makieta/strony/js (pliki ponizej 300 linii) */
const KATALOG_JS = join(STRONY, "js");
const plikiStron = readdirSync(STRONY).filter((f) => f.endsWith(".html"))
  .concat(existsSync(KATALOG_JS) ? readdirSync(KATALOG_JS).filter((f) => f.endsWith(".js")).map((f) => "js/" + f) : []);

for (const plik of plikiStron) {
  const tresc = readFileSync(join(STRONY, plik), "utf8");
  let m;
  WZORZEC.lastIndex = 0;
  while ((m = WZORZEC.exec(tresc)) !== null) {
    const [, operacja, tabela] = m;
    const dozwolone = kolumny(tabela);
    if (!dozwolone.length) {
      t.ok(false, plik + ": " + operacja + " do nieistniejacej tabeli " + tabela);
      continue;
    }
    const start = tresc.indexOf("{", m.index + m[0].length);
    if (start < 0) continue;
    const literal = literalObiektu(tresc, start);
    if (!literal) continue;

    /* Literal budowany zmienna, a nie wpisany wprost, pomijamy */
    const klucze = kluczeNajwyzszego(literal);
    if (!klucze.length) continue;

    const obce = klucze.filter((k) => !dozwolone.includes(k));
    sprawdzonych++;
    t.ok(obce.length === 0,
      plik + ": " + operacja + " do " + tabela +
      (obce.length ? " zapisuje nieistniejace kolumny: " + obce.join(", ") : " uzywa wylacznie istniejacych kolumn"));
  }
}

console.log("\nSprawdzonych wywolan zapisu: " + sprawdzonych);
t.ok(sprawdzonych >= 8, "test objal sensowna liczbe miejsc zapisu");
t.podsumuj();
