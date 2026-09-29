/* ============================================================================
   Dane do interaktywnego diagramu tabel w klikalnej dokumentacji.

     node tools/build-model.mjs

   Wejscie:  makieta/db/schema.sql     struktura, komentarze, grupy tabel (zrodlo prawdy, D-151)
             makieta/db/views.sql      ktore widoki czytaja ktora tabele
             makieta/db/seed-db.js     liczba wierszy w bazie startowej
             docs/03-model-danych.md   opisy tabel i uwagi do kolumn
   Wyjscie:  dokumentacja/assets/model-dane.js   (window.MODEL_DANYCH)

   Strukture czyta silnik SQLite (PRAGMA), wiec typy, klucze i indeksy sa
   dokladnie takie, jak w bazie. Z tekstu schematu brane sa tylko komentarze.
   ============================================================================ */

import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { inline } from "./md-html.mjs";

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DB_DIR = join(ROOT, "makieta", "db");
const WCIECIE_KOLUMNY = 2;

export class ModelError extends Error {
  constructor(message) { super(message); this.name = "ModelError"; }
}

function base64Z(plik) {
  const m = readFileSync(plik, "utf8").match(/"([A-Za-z0-9+/=]+)"/);
  if (!m) throw new ModelError("Brak danych base64 w " + plik);
  return Buffer.from(m[1], "base64");
}

export async function wczytajSilnik() {
  const initSqlJs = require(join(DB_DIR, "sql-wasm.js"));
  return initSqlJs({ wasmBinary: base64Z(join(DB_DIR, "sql-wasm-data.js")) });
}

function wiersze(db, sql) {
  const res = db.exec(sql);
  if (!res.length) return [];
  return res[0].values.map((v) => Object.fromEntries(res[0].columns.map((c, i) => [c, v[i]])));
}

/* ------------------------- komentarze ze schema.sql ------------------------- */

function czyscKomentarz(linia) { return linia.replace(/^\s*--\s?/, "").trim(); }
function czySeparator(linia) { return /^\s*--\s*-{4,}/.test(linia) || /^\s*--\s*={4,}/.test(linia); }

/* Kolumna: zwraca definicje bez komentarza, komentarz, CHECK i dozwolone wartosci */
function opisKolumny(definicja, komentarz) {
  const def = definicja.replace(/,\s*$/, "").trim();
  const check = def.match(/CHECK\s*\((.*)\)\s*$/i) || def.match(/CHECK\s*\((.*)\)/i);
  const wartosci = check && check[1].match(/IN\s*\(([^)]*)\)/i);
  return {
    definicja: def,
    komentarz: komentarz || "",
    check: check ? check[1].trim() : "",
    wartosci: wartosci ? wartosci[1].split(",").map((w) => w.trim().replace(/^'|'$/g, "")) : []
  };
}

/* Przechodzi po schema.sql i zbiera: grupe tabeli, komentarz nad tabela,
   komentarze kolumn (w linii oraz naglowki grup kolumn) i ograniczenia tabeli. */
export function komentarzeSchematu(tekst) {
  const out = {};
  let grupa = null, bufor = [], tabela = null, naglowekKolumn = "";
  for (const linia of tekst.split(/\r?\n/)) {
    const sekcja = linia.match(/^--\s*(\d+)\.\s+(.+)$/);
    if (sekcja) { grupa = { nr: parseInt(sekcja[1], 10), nazwa: sekcja[2].trim() }; bufor = []; continue; }
    const start = linia.match(/^CREATE TABLE\s+(\w+)/i);
    if (start) {
      tabela = { nazwa: start[1], grupa, opis: bufor.join(" "), kolumny: {}, ograniczenia: [] };
      out[start[1]] = tabela; bufor = []; naglowekKolumn = ""; continue;
    }
    if (tabela) {
      if (/^\);/.test(linia)) { tabela = null; continue; }
      obsluzLinieTabeli(tabela, linia, naglowekKolumn, (n) => { naglowekKolumn = n; });
      continue;
    }
    if (/^\s*--/.test(linia) && !czySeparator(linia)) bufor.push(czyscKomentarz(linia));
    else if (!linia.trim()) bufor = [];
  }
  return out;
}

function obsluzLinieTabeli(tabela, linia, naglowek, ustawNaglowek) {
  if (/^\s*--/.test(linia)) { ustawNaglowek(czyscKomentarz(linia)); return; }
  if (!linia.trim()) return;
  const [kod, ...reszta] = linia.split("--");
  const komentarz = reszta.join("--").trim();
  const wciecie = linia.match(/^\s*/)[0].length;
  const kol = kod.match(/^\s*([a-z_][a-z0-9_]*)\s+(TEXT|INTEGER|REAL|NUMERIC|BLOB)\b/i);
  const ostatnia = tabela._ostatnia;
  if (wciecie > WCIECIE_KOLUMNY && ostatnia && !kol) {
    const k = tabela.kolumny[ostatnia];
    Object.assign(k, opisKolumny(k.definicja + " " + kod.trim(), k.komentarz || komentarz), { grupa: k.grupa });
    return;
  }
  if (kol) {
    tabela.kolumny[kol[1]] = Object.assign(opisKolumny(kod, komentarz), { grupa: naglowek });
    tabela._ostatnia = kol[1];
    return;
  }
  tabela.ograniczenia.push(kod.replace(/,\s*$/, "").trim());
}

/* ------------------------ opisy z docs/03-model-danych ------------------------ */

/* Linki do innych plikow docs/*.md nie dzialaja na stronie, zostaje sama etykieta */
function bezLinkow(t) { return t.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"); }
function tekst(t) { return inline(bezLinkow(t)); }

function komorki(linia) { return linia.split("|").slice(1, -1).map((c) => c.trim()); }

function nazwyPol(komorka) {
  return komorka.replace(/\*\*/g, "").replace(/`/g, "").split(",").map((n) => n.trim()).filter(Boolean);
}

/* Blok "#### NAZWA (`tabela`)" z tabela Pole | Typ | Uwagi i akapitami pod nia */
export function opisyDokumentacji(md) {
  const out = {}, grupy = {};
  for (const m of md.matchAll(/^### (\d+)\.\s+(.+)$/gm)) grupy[parseInt(m[1], 10)] = m[2].trim();
  const bloki = md.split(/^#### /m).slice(1);
  for (const blok of bloki) {
    const [naglowek, ...linie] = blok.split(/\r?\n/);
    const tabele = [...naglowek.matchAll(/`([a-z_]+)`/g)].map((m) => m[1]);
    if (!tabele.length) continue;
    const pola = {}, akapity = [];
    for (const linia of linie) {
      if (/^#{1,3} /.test(linia)) break;
      if (/^\|/.test(linia)) {
        const [pole, typ, uwagi] = komorki(linia);
        if (!pole || pole === "Pole" || /^-+$/.test(pole)) continue;
        for (const n of nazwyPol(pole)) pola[n] = { typ: tekst(typ || ""), uwagi: tekst(uwagi || "") };
      } else if (linia.trim() && linia.trim() !== "---") {
        const cytat = linia.startsWith(">");
        akapity.push({ cytat, html: tekst(linia.replace(/^>\s?/, "")) });
      }
    }
    const tytul = tekst(naglowek.replace(/\s*\[.*$/, "").trim());
    for (const t of tabele) out[t] = { tytul, pola, akapity };
  }
  return { tabele: out, grupy };
}

/* ------------------------------- skladanie ------------------------------- */

function strukturaTabeli(db, nazwa) {
  const kolumny = wiersze(db, "PRAGMA table_info(" + nazwa + ")");
  const fk = wiersze(db, "PRAGMA foreign_key_list(" + nazwa + ")");
  const indeksy = wiersze(db, "PRAGMA index_list(" + nazwa + ")")
    .filter((i) => i.origin === "c")
    .map((i) => ({ nazwa: i.name, unikalny: !!i.unique,
                   kolumny: wiersze(db, "PRAGMA index_info(" + i.name + ")").map((c) => c.name) }));
  return { kolumny, fk, indeksy };
}

export function zlozModel({ db, seed, schemaTekst, widokiTekst, docsTekst }) {
  const komentarze = komentarzeSchematu(schemaTekst);
  const docs = opisyDokumentacji(docsTekst);
  const nazwy = wiersze(db, "SELECT name FROM sqlite_master WHERE type = 'table' " +
                            "AND name NOT LIKE 'sqlite_%'").map((r) => r.name);
  const widoki = wiersze(db, "SELECT name, sql FROM sqlite_master WHERE type = 'view'");
  if (!nazwy.length) throw new ModelError("Schemat nie zawiera zadnej tabeli");

  const tabele = nazwy.map((nazwa) => {
    const k = komentarze[nazwa];
    if (!k) throw new ModelError("Tabela " + nazwa + " nie ma definicji CREATE TABLE w schema.sql");
    const s = strukturaTabeli(db, nazwa);
    const d = docs.tabele[nazwa] || { tytul: "", pola: {}, akapity: [] };
    const fkPoKolumnie = Object.fromEntries(s.fk.map((f) => [f.from, f]));
    return {
      nazwa, grupa: k.grupa ? k.grupa.nr : 0, opis: k.opis, tytul: d.tytul, akapity: d.akapity,
      wierszy: seed.exec("SELECT COUNT(*) FROM " + nazwa)[0].values[0][0],
      ograniczenia: k.ograniczenia, indeksy: s.indeksy,
      widoki: widoki.filter((w) => new RegExp("\\b" + nazwa + "\\b").test(w.sql)).map((w) => w.name),
      kolumny: s.kolumny.map((c) => {
        const kk = k.kolumny[c.name] || {};
        const f = fkPoKolumnie[c.name];
        const dp = d.pola[c.name] || {};
        return {
          nazwa: c.name, typ: c.type, wymagana: !!c.notnull || c.pk > 0, domyslnie: c.dflt_value,
          pk: c.pk > 0, fk: f ? { tabela: f.table, kolumna: f.to || null, usuwanie: f.on_delete } : null,
          komentarz: kk.komentarz || "", grupa: kk.grupa || "", check: kk.check || "",
          wartosci: kk.wartosci || [], uwagi: dp.uwagi || ""
        };
      })
    };
  });

  const grupy = [...new Set(tabele.map((t) => t.grupa))].sort((a, b) => a - b).map((nr) => {
    const zSchematu = Object.values(komentarze).find((k) => k.grupa && k.grupa.nr === nr);
    return { nr, nazwa: docs.grupy[nr] || (zSchematu ? zSchematu.grupa.nazwa : "Pozostale") };
  });
  return { wygenerowano: new Date().toISOString().slice(0, 10), grupy, tabele,
           widoki: widoki.map((w) => w.name), zrodloWidokow: widokiTekst.length > 0 };
}

async function main() {
  const SQL = await wczytajSilnik();
  const schemaTekst = readFileSync(join(DB_DIR, "schema.sql"), "utf8");
  const widokiTekst = readFileSync(join(DB_DIR, "views.sql"), "utf8");
  const db = new SQL.Database();
  db.exec(schemaTekst);
  db.exec(widokiTekst);
  const seed = new SQL.Database(base64Z(join(DB_DIR, "seed-db.js")));
  const docsTekst = readFileSync(join(ROOT, "docs", "03-model-danych.md"), "utf8");

  const model = zlozModel({ db, seed, schemaTekst, widokiTekst, docsTekst });
  writeFileSync(join(ROOT, "dokumentacja", "assets", "model-dane.js"),
    "/* Generowane przez tools/build-model.mjs ze schema.sql, views.sql, seed-db.js\n" +
    "   i docs/03-model-danych.md. Nie edytuj recznie. */\n" +
    "window.MODEL_DANYCH = " + JSON.stringify(model) + ";\n", "utf8");
  const kolumn = model.tabele.reduce((s, t) => s + t.kolumny.length, 0);
  const zOpisem = model.tabele.filter((t) => t.akapity.length || t.opis).length;
  process.stdout.write("Tabel: " + model.tabele.length + ", kolumn: " + kolumn +
                       ", tabel z opisem: " + zOpisem + ", widokow: " + model.widoki.length + "\n");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await main();
