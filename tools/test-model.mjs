/* ============================================================================
   Testy danych interaktywnego diagramu tabel (tools/build-model.mjs).

     node tools/test-model.mjs

   Diagram ma pokazywac dokladnie to, co jest w schema.sql: kazda tabele,
   kazda kolumne i kazdy klucz obcy, plus komentarze i uwagi z docs/03.
   ============================================================================ */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { komentarzeSchematu, ModelError, opisyDokumentacji, wczytajSilnik, zlozModel } from "./build-model.mjs";
import { licznik } from "./harness.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const t = licznik("Diagram tabel");

function zrodla(schemaTekst) {
  return {
    schemaTekst,
    widokiTekst: readFileSync(join(ROOT, "makieta", "db", "views.sql"), "utf8"),
    docsTekst: readFileSync(join(ROOT, "docs", "03-model-danych.md"), "utf8")
  };
}

const SQL = await wczytajSilnik();
const schema = readFileSync(join(ROOT, "makieta", "db", "schema.sql"), "utf8");
const { widokiTekst, docsTekst } = zrodla(schema);
const db = new SQL.Database();
db.exec(schema);
db.exec(widokiTekst);
const seed = new SQL.Database();
seed.exec(schema);

/* ------------------------------ kompletnosc ------------------------------ */
console.log("\nKompletnosc wzgledem schematu");
const model = zlozModel({ db, seed, schemaTekst: schema, widokiTekst, docsTekst });
const wBazie = db.exec("SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")[0].values[0][0];
t.rowne(model.tabele.length, wBazie, "diagram ma kazda tabele ze schematu");

const wnioski = model.tabele.find((x) => x.nazwa === "wnioski");
const kolumnWnioskow = db.exec("PRAGMA table_info(wnioski)")[0].values.length;
t.rowne(wnioski.kolumny.length, kolumnWnioskow, "wnioski maja komplet kolumn");
const rok = wnioski.kolumny.find((k) => k.nazwa === "rok");
t.ok(rok.fk && rok.fk.tabela === "lata_zestawien", "klucz obcy wnioski.rok -> lata_zestawien jest na diagramie");
t.ok(wnioski.widoki.includes("v_wniosek_finanse"), "wnioski wiedza, ze licza z nich widoki SQL");
t.rowne(model.grupy.length, 5, "piec grup tabel jak w schemacie");
t.rowne(model.grupy[0].nazwa, "Słowniki i konfiguracja", "nazwy grup z polskimi znakami z docs/03");

/* ---------------------------- komentarze i opisy ---------------------------- */
console.log("\nKomentarze i opisy");
const lata = model.tabele.find((x) => x.nazwa === "lata_zestawien");
t.ok(/administrator/.test(lata.opis), "komentarz nad tabela trafia do opisu");
const etap = wnioski.kolumny.find((k) => k.nazwa === "etap");
t.rowne(etap.check, "etap BETWEEN 1 AND 10", "CHECK kolumny jest odczytany");
const statusUcz = model.tabele.find((x) => x.nazwa === "uczestnicy").kolumny.find((k) => k.nazwa === "status_kwalifikacji");
t.rowne(statusUcz.wartosci.join("/"), "zakwalifikowany/niezakwalifikowany", "CHECK z drugiej linii daje liste dozwolonych wartosci");
const koszt = wnioski.kolumny.find((k) => k.nazwa === "koszt_calkowity");
t.ok(/wyliczane/.test(koszt.komentarz) && /Finanse/.test(koszt.grupa), "komentarz w linii i naglowek grupy kolumn");
const numerKlienta = model.tabele.find((x) => x.nazwa === "klienci").kolumny.find((k) => k.nazwa === "numer_klienta");
t.ok(/D-112/.test(numerKlienta.uwagi), "uwagi do kolumny pochodza z docs/03");
t.ok(!/\]\(/.test(JSON.stringify(model)), "linki Markdown nie przeciekaja jako surowy tekst");

/* ------------------------------ przypadki bledne ------------------------------ */
console.log("\nPrzypadki bledne");
t.rowne(Object.keys(komentarzeSchematu("-- sam komentarz\n")).length, 0, "tekst bez CREATE TABLE nie daje tabel");
t.rowne(Object.keys(opisyDokumentacji("#### BEZ NAZWY TABELI\n| a | b | c |").tabele).length, 0,
        "naglowek bez nazwy tabeli w backtickach jest pomijany");
const pusta = new SQL.Database();
let blad = null;
try { zlozModel({ db: pusta, seed: pusta, ...zrodla("") }); } catch (e) { blad = e; }
t.ok(blad instanceof ModelError, "pusty schemat rzuca ModelError");
const rozjazd = new SQL.Database();
rozjazd.exec("CREATE TABLE widmo (id TEXT PRIMARY KEY)");
blad = null;
try { zlozModel({ db: rozjazd, seed: rozjazd, ...zrodla("-- brak definicji\n") }); } catch (e) { blad = e; }
t.ok(blad instanceof ModelError && /widmo/.test(blad.message), "tabela bez definicji w schema.sql rzuca ModelError z nazwa");

t.podsumuj();
