/* ============================================================================
   Lokalny serwer makiety z baza danych w pliku na dysku.

     node tools/serwer.mjs            potem http://127.0.0.1:8080/
     KFS_PORT=9000 node tools/serwer.mjs

   Bez serwera makieta dziala z dwukliku, a baza zyje w pamieci przegladarki.
   Z serwerem baza lezy w pliku makieta/db/kfs.sqlite: wspolna dla wszystkich
   kart i przegladarek na tym komputerze, przezywa czyszczenie przegladarki
   i da sie ja skopiowac albo otworzyc w dowolnym narzedziu SQLite.

   API (odpowiedzi JSON w formacie { data, error: { code, message } }):
     GET    /api/baza   plik bazy (albo baza startowa, gdy pliku jeszcze nie ma)
     PUT    /api/baza   zapis calej bazy; naglowek X-Kfs-Wersja musi byc aktualny
     DELETE /api/baza   powrot do bazy startowej (plik trafia do kopii .bak)

   Zabezpieczenia: nasluch wylacznie na 127.0.0.1, kontrola naglowkow Host
   i Origin (ochrona przed DNS rebinding i zapisem z obcej strony), limit
   zapisow na minute, limit rozmiaru, kontrola naglowka pliku SQLite,
   blokada nadpisania nowszej wersji (409), zapis atomowy przez plik tymczasowy.
   To nadal makieta: separacja rol dziala w przegladarce (D-179).
   ============================================================================ */

import { createServer } from "node:http";
import { existsSync, readFileSync, renameSync, statSync, writeFileSync, copyFileSync, unlinkSync } from "node:fs";
import { dirname, extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const HOST = "127.0.0.1";
const PORT_DOMYSLNY = 8080;
const MAX_ROZMIAR = 50 * 1024 * 1024;
const LIMIT_ZAPISOW_NA_MINUTE = 120;
const MINUTA_MS = 60 * 1000;
const NAGLOWEK_SQLITE = Buffer.from("SQLite format 3\u0000", "latin1");
const KATALOGI_PUBLICZNE = ["makieta", "dokumentacja"];

const TYPY = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml",
  ".md": "text/markdown; charset=utf-8", ".wasm": "application/wasm"
};

/* Makieta uruchamia skrypty stron przez eval (assets/boot.js) i wasm, stad unsafe-eval */
const NAGLOWKI_BEZPIECZENSTWA = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; base-uri 'none'; form-action 'self'"
};

export class SerwerError extends Error {
  constructor(status, code, message) { super(message); this.name = "SerwerError"; this.status = status; this.code = code; }
}

function loguj(poziom, zdarzenie, pola) {
  process.stdout.write(JSON.stringify({ czas: new Date().toISOString(), poziom, zdarzenie, ...pola }) + "\n");
}

function odpowiedzJson(res, status, data, error) {
  res.writeHead(status, { ...NAGLOWKI_BEZPIECZENSTWA, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify({ data: data === undefined ? null : data, error: error || null }));
}

function bazaStartowa() {
  const src = readFileSync(join(ROOT, "makieta", "db", "seed-db.js"), "utf8");
  const m = src.match(/"([A-Za-z0-9+/=]+)"/);
  if (!m) throw new SerwerError(500, "brak_bazy_startowej", "Brak bazy startowej w seed-db.js");
  return Buffer.from(m[1], "base64");
}

function czytajCialo(req) {
  return new Promise((resolve, reject) => {
    const kawalki = [];
    let rozmiar = 0;
    req.on("data", (k) => {
      rozmiar += k.length;
      if (rozmiar > MAX_ROZMIAR) { reject(new SerwerError(413, "za_duzy", "Baza przekracza limit rozmiaru")); req.destroy(); return; }
      kawalki.push(k);
    });
    req.on("end", () => resolve(Buffer.concat(kawalki)));
    req.on("error", reject);
  });
}

/* Host musi wskazywac na nasz serwer; Origin (jesli jest) musi byc ten sam */
function sprawdzPochodzenie(req, port, zapis) {
  const dozwolone = [HOST + ":" + port, "localhost:" + port];
  if (!dozwolone.includes(String(req.headers.host || ""))) throw new SerwerError(403, "zly_host", "Nieprawidlowy naglowek Host");
  const origin = req.headers.origin;
  if (zapis && origin && !dozwolone.some((d) => origin === "http://" + d)) {
    throw new SerwerError(403, "obce_pochodzenie", "Zapis dozwolony wylacznie z tej samej strony");
  }
}

function plikStatyczny(req, res, sciezkaUrl) {
  const wzgledna = normalize(decodeURIComponent(sciezkaUrl === "/" ? "/makieta/index.html" : sciezkaUrl)).replace(/^[\\/]+/, "");
  const pierwszy = wzgledna.split(sep)[0].split("/")[0];
  if (!KATALOGI_PUBLICZNE.includes(pierwszy) || wzgledna.includes("..")) throw new SerwerError(404, "nie_znaleziono", "Nie ma takiego pliku");
  const plik = join(ROOT, wzgledna);
  if (!plik.startsWith(join(ROOT, pierwszy)) || !existsSync(plik) || !statSync(plik).isFile() || plik.endsWith(".sqlite") || plik.endsWith(".bak")) {
    throw new SerwerError(404, "nie_znaleziono", "Nie ma takiego pliku");
  }
  res.writeHead(200, { ...NAGLOWKI_BEZPIECZENSTWA, "Content-Type": TYPY[extname(plik)] || "application/octet-stream" });
  res.end(readFileSync(plik));
}

export function utworzSerwer({ port = PORT_DOMYSLNY, plikBazy = join(ROOT, "makieta", "db", "kfs.sqlite") } = {}) {
  let wersja = existsSync(plikBazy) ? statSync(plikBazy).mtimeMs : 0;
  const zapisy = new Map();

  function limitZapisow(ip) {
    const teraz = Date.now();
    const lista = (zapisy.get(ip) || []).filter((t) => teraz - t < MINUTA_MS);
    if (lista.length >= LIMIT_ZAPISOW_NA_MINUTE) throw new SerwerError(429, "za_duzo_zapisow", "Za duzo zapisow, sprobuj za chwile");
    lista.push(teraz);
    zapisy.set(ip, lista);
  }

  async function obsluzBaze(req, res) {
    if (req.method === "GET") {
      const dane = existsSync(plikBazy) ? readFileSync(plikBazy) : bazaStartowa();
      res.writeHead(200, { ...NAGLOWKI_BEZPIECZENSTWA, "Content-Type": "application/x-sqlite3", "Cache-Control": "no-store",
                           "X-Kfs-Wersja": String(wersja) });
      res.end(dane);
      return;
    }
    limitZapisow(req.socket.remoteAddress);
    if (req.method === "PUT") {
      if (String(req.headers["x-kfs-wersja"]) !== String(wersja)) {
        throw new SerwerError(409, "konflikt", "Baza zmienila sie w innym oknie. Odswiez strone.");
      }
      const dane = await czytajCialo(req);
      if (dane.length < NAGLOWEK_SQLITE.length || !dane.subarray(0, NAGLOWEK_SQLITE.length).equals(NAGLOWEK_SQLITE)) {
        throw new SerwerError(400, "to_nie_sqlite", "Przeslany plik nie jest baza SQLite");
      }
      const tymczasowy = plikBazy + ".tmp";
      writeFileSync(tymczasowy, dane);
      renameSync(tymczasowy, plikBazy);
      wersja = statSync(plikBazy).mtimeMs;
      loguj("info", "baza_zapisana", { bajtow: dane.length });
      odpowiedzJson(res, 200, { wersja: String(wersja) });
      return;
    }
    if (req.method === "DELETE") {
      if (existsSync(plikBazy)) { copyFileSync(plikBazy, plikBazy + ".bak"); unlinkSync(plikBazy); }
      wersja = 0;
      loguj("info", "baza_zresetowana", {});
      odpowiedzJson(res, 200, { wersja: "0" });
      return;
    }
    throw new SerwerError(405, "zla_metoda", "Metoda niedozwolona");
  }

  const serwer = createServer(async (req, res) => {
    const sciezka = new URL(req.url, "http://" + HOST).pathname;
    try {
      const zapis = !["GET", "HEAD"].includes(req.method);
      sprawdzPochodzenie(req, serwer.address().port, zapis);
      if (sciezka === "/api/baza") return await obsluzBaze(req, res);
      if (zapis) throw new SerwerError(405, "zla_metoda", "Metoda niedozwolona");
      plikStatyczny(req, res, sciezka);
    } catch (e) {
      if (!(e instanceof SerwerError)) {
        loguj("error", "blad_serwera", { sciezka, komunikat: String(e && e.message) });
        odpowiedzJson(res, 500, null, { code: "blad_serwera", message: "Wewnetrzny blad serwera" });
        return;
      }
      loguj("warn", "odmowa", { sciezka, status: e.status, kod: e.code });
      odpowiedzJson(res, e.status, null, { code: e.code, message: e.message });
    }
  });
  return { serwer, start: () => new Promise((r) => serwer.listen(port, HOST, () => r(serwer.address().port))) };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const port = parseInt(process.env.KFS_PORT || String(PORT_DOMYSLNY), 10);
  const { start } = utworzSerwer({ port });
  const nasluch = await start();
  loguj("info", "serwer_uruchomiony", { adres: "http://" + HOST + ":" + nasluch + "/" });
}
