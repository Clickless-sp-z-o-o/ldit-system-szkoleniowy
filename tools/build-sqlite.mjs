/* ============================================================================
   Budowa bazy SQLite makiety.

     node tools/build-sqlite.mjs

   Wejscie:  makieta/data/db.json        (stare dane demonstracyjne)
             makieta/db/schema.sql       (struktura)
             makieta/db/views.sql        (reguly biznesowe)
   Wyjscie:  makieta/db/seed.sql         (dane do czytania i recznej edycji)
             makieta/db/seed-db.js       (ta sama baza jako binarium base64,
                                          zeby makieta startowala natychmiast)

   Na koniec skrypt sprawdza integralnosc: klucze obce, liczby wierszy oraz
   parytet pol wyliczanych wzgledem starego db.json.
   ============================================================================ */

import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { migruj } from "./sqlite-migracja.mjs";

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DB_DIR = join(ROOT, "makieta", "db");

function wczytajSilnik() {
  const initSqlJs = require(join(DB_DIR, "sql-wasm.js"));
  const src = readFileSync(join(DB_DIR, "sql-wasm-data.js"), "utf8");
  const b64 = src.match(/"([A-Za-z0-9+/=]+)"/)[1];
  return initSqlJs({ wasmBinary: Buffer.from(b64, "base64") });
}

function literal(v) {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "1" : "0";
  return "'" + String(v).replace(/'/g, "''") + "'";
}

function kolumny(db, tabela) {
  const res = db.exec("PRAGMA table_info(" + tabela + ")");
  if (!res.length) throw new Error("Tabela nie istnieje w schemacie: " + tabela);
  return res[0].values.map((r) => r[1]);
}

function wstaw(db, tabela, kols, rows) {
  if (!rows.length) return;
  const sql = "INSERT INTO " + tabela + " (" + kols.join(", ") + ") VALUES (" +
    kols.map(() => "?").join(", ") + ")";
  const stmt = db.prepare(sql);
  for (const row of rows) {
    stmt.run(kols.map((k) => {
      const v = row[k];
      if (v === undefined) return null;
      if (typeof v === "boolean") return v ? 1 : 0;
      return v;
    }));
  }
  stmt.free();
}

function seedSql(tabela, kols, rows) {
  if (!rows.length) return "-- " + tabela + ": brak danych startowych\n\n";
  const head = "-- " + tabela + " (" + rows.length + ")\n";
  const body = rows.map((row) =>
    "INSERT INTO " + tabela + " (" + kols.join(", ") + ") VALUES (" +
    kols.map((k) => literal(row[k] === undefined ? null : row[k])).join(", ") + ");"
  ).join("\n");
  return head + body + "\n\n";
}

function sprawdzKlucze(db) {
  const res = db.exec("PRAGMA foreign_key_check");
  if (res.length) {
    const bledy = res[0].values.slice(0, 10).map((r) => r.join(" | ")).join("\n  ");
    throw new Error("Naruszone klucze obce:\n  " + bledy);
  }
}

/* Parytet: kwoty wyliczane z widoku musza sie zgadzac z tym, co liczyla
   poprzednia wersja makiety na danych z db.json. */
function sprawdzParytet(db, src) {
  const wskaznik = (w) => (w === "mikro" ? 0.9 : 0.7);
  const klById = Object.fromEntries(src.klienci.map((k) => [k.id, k]));
  const res = db.exec(
    "SELECT wniosek_id, koszt_calkowity_efektywny, procent_dofinansowania FROM v_wniosek_finanse"
  );
  const wyliczone = Object.fromEntries(res[0].values.map((r) => [r[0], { koszt: r[1], proc: r[2] }]));
  let bledy = 0;
  for (const w of src.wnioski) {
    const v = wyliczone[w.id];
    const oczekiwanyKoszt = w.koszt_calkowity == null ? 0 : w.koszt_calkowity;
    if (Math.abs((v.koszt || 0) - oczekiwanyKoszt) > 0.01) bledy++;
    const oczekiwanyProc = wskaznik(klById[w.klient_id].wielkosc_przedsiebiorstwa) * 100;
    if (Math.abs(v.proc - oczekiwanyProc) > 0.01) bledy++;
  }
  if (bledy) throw new Error("Parytet pol wyliczanych nie zgadza sie w " + bledy + " przypadkach");
}

async function main() {
  const SQL = await wczytajSilnik();
  const src = JSON.parse(readFileSync(join(ROOT, "makieta", "data", "db.json"), "utf8"));
  const dane = migruj(src);
  delete dane._instById;

  const db = new SQL.Database();
  db.exec(readFileSync(join(DB_DIR, "schema.sql"), "utf8"));

  let sql = "-- Dane startowe makiety, generowane przez tools/build-sqlite.mjs.\n" +
            "-- Nie edytuj recznie bez przegenerowania seed-db.js.\n\n" +
            "PRAGMA foreign_keys = OFF;\nBEGIN TRANSACTION;\n\n";

  let wierszy = 0;
  for (const [tabela, rows] of Object.entries(dane)) {
    const kols = kolumny(db, tabela);
    wstaw(db, tabela, kols, rows);
    sql += seedSql(tabela, kols, rows);
    wierszy += rows.length;
  }
  sql += "COMMIT;\nPRAGMA foreign_keys = ON;\n";

  db.exec(readFileSync(join(DB_DIR, "views.sql"), "utf8"));

  sprawdzKlucze(db);
  sprawdzParytet(db, src);

  const bin = Buffer.from(db.export());
  writeFileSync(join(DB_DIR, "seed.sql"), sql, "utf8");
  writeFileSync(join(DB_DIR, "seed-db.js"),
    "/* Baza startowa makiety jako binarium SQLite w base64.\n" +
    "   Generowane przez tools/build-sqlite.mjs ze schema.sql, views.sql i seed.sql.\n" +
    "   Wersja czytelna dla czlowieka lezy w seed.sql. */\n" +
    "window.KFS_SEED_DB = \"" + bin.toString("base64") + "\";\n", "utf8");

  const tabel = Object.keys(dane).length;
  console.log("Tabel: " + tabel + ", wierszy: " + wierszy);
  console.log("seed.sql:    " + (sql.length / 1024 / 1024).toFixed(2) + " MB");
  console.log("seed-db.js:  " + (bin.length * 1.37 / 1024 / 1024).toFixed(2) + " MB (base64)");
  console.log("Klucze obce i parytet pol wyliczanych: OK");
  db.close();
}

main().catch((e) => { console.error(e.message); process.exit(1); });
