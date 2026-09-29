/* ============================================================================
   Testy lokalnego serwera bazy (tools/serwer.mjs).

     node tools/test-serwer.mjs

   Serwer startuje na wolnym porcie z plikiem bazy w katalogu tymczasowym,
   wiec test nie dotyka prawdziwej bazy makieta/db/kfs.sqlite.
   ============================================================================ */

import { request } from "node:http";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { licznik } from "./harness.mjs";
import { utworzSerwer } from "./serwer.mjs";

const t = licznik("Serwer bazy");
const katalog = mkdtempSync(join(tmpdir(), "kfs-serwer-"));
const plikBazy = join(katalog, "kfs.sqlite");
const { serwer, start } = utworzSerwer({ port: 0, plikBazy });
const port = await start();
const LIMIT_ZAPISOW = 120;

function zapytaj(metoda, sciezka, { naglowki = {}, cialo = null, host = "127.0.0.1:" + port } = {}) {
  return new Promise((resolve, reject) => {
    const req = request({ host: "127.0.0.1", port, method: metoda, path: sciezka, headers: { host, ...naglowki } }, (res) => {
      const kawalki = [];
      res.on("data", (k) => kawalki.push(k));
      res.on("end", () => resolve({ status: res.statusCode, naglowki: res.headers, cialo: Buffer.concat(kawalki) }));
    });
    req.on("error", reject);
    if (cialo) req.write(cialo);
    req.end();
  });
}
const json = (r) => JSON.parse(r.cialo.toString("utf8"));

try {
  console.log("\nOdczyt i zapis bazy");
  const start1 = await zapytaj("GET", "/api/baza");
  t.rowne(start1.status, 200, "GET zwraca baze startowa, gdy pliku jeszcze nie ma");
  t.rowne(start1.cialo.subarray(0, 15).toString("latin1"), "SQLite format 3", "odpowiedz to plik SQLite");
  const wersja0 = start1.naglowki["x-kfs-wersja"];

  const zapis = await zapytaj("PUT", "/api/baza", { naglowki: { "x-kfs-wersja": wersja0 }, cialo: start1.cialo });
  t.rowne(zapis.status, 200, "PUT z aktualna wersja zapisuje baze");
  t.ok(existsSync(plikBazy), "baza lezy w pliku na dysku");
  const wersja1 = json(zapis).data.wersja;
  t.ok(wersja1 !== wersja0, "zapis podbija wersje");

  const przestarzaly = await zapytaj("PUT", "/api/baza", { naglowki: { "x-kfs-wersja": wersja0 }, cialo: start1.cialo });
  t.rowne(przestarzaly.status, 409, "zapis ze stara wersja jest odrzucany, nie nadpisuje cudzych zmian");
  t.rowne(json(przestarzaly).error.code, "konflikt", "odpowiedz ma format { data, error: { code, message } }");

  const nieSqlite = await zapytaj("PUT", "/api/baza", { naglowki: { "x-kfs-wersja": wersja1 }, cialo: Buffer.from("<html>") });
  t.rowne(nieSqlite.status, 400, "plik, ktory nie jest baza SQLite, jest odrzucany");

  console.log("\nPochodzenie zadania");
  t.rowne((await zapytaj("GET", "/api/baza", { host: "zly.example.com" })).status, 403, "obcy naglowek Host jest odrzucany (DNS rebinding)");
  const obcy = await zapytaj("PUT", "/api/baza", { naglowki: { "x-kfs-wersja": wersja1, origin: "http://zly.example.com" }, cialo: start1.cialo });
  t.rowne(obcy.status, 403, "zapis z obcej strony jest odrzucany");

  console.log("\nPliki statyczne");
  const strona = await zapytaj("GET", "/makieta/index.html");
  t.rowne(strona.status, 200, "serwer podaje makiete");
  t.ok(/default-src 'self'/.test(strona.naglowki["content-security-policy"] || ""), "strona ma naglowek Content-Security-Policy");
  t.rowne(strona.naglowki["x-content-type-options"], "nosniff", "strona ma naglowek nosniff");
  t.rowne((await zapytaj("GET", "/makieta/../tools/serwer.mjs")).status, 404, "wyjscie poza katalog makiety jest zablokowane");
  t.rowne((await zapytaj("GET", "/tools/serwer.mjs")).status, 404, "katalog tools nie jest publiczny");
  t.rowne((await zapytaj("GET", "/makieta/db/kfs.sqlite")).status, 404, "plik bazy nie jest podawany jako plik statyczny");

  console.log("\nReset i limit zapisow");
  const reset = await zapytaj("DELETE", "/api/baza");
  t.rowne(reset.status, 200, "DELETE przywraca baze startowa");
  t.ok(!existsSync(plikBazy) && existsSync(plikBazy + ".bak"), "poprzedni plik trafia do kopii .bak");
  let ostatni = 0;
  for (let i = 0; i < LIMIT_ZAPISOW; i++) ostatni = (await zapytaj("DELETE", "/api/baza")).status;
  t.rowne(ostatni, 429, "po przekroczeniu limitu zapisow na minute serwer odpowiada 429");
} finally {
  serwer.close();
  rmSync(katalog, { recursive: true, force: true });
}

t.podsumuj();
