/* ============================================================================
   Silnik bazy danych makiety: prawdziwe SQLite w przegladarce (sql.js).

   Struktura lezy w makieta/db/schema.sql, reguly wyliczen w views.sql, dane
   startowe w seed.sql. Do przegladarki trafia gotowe binarium (seed-db.js),
   zeby start byl natychmiastowy.

   Makieta dziala z dwukliku na index.html, bo binarium WebAssembly jest
   wklejone jako base64 (db/sql-wasm-data.js), a nie pobierane przez fetch,
   ktory na protokole file:// jest blokowany.

   Stan roboczy zapisuje sie w localStorage, wiec zmiany w makiecie przezywaja
   odswiezenie strony. KFS.reset() wraca do bazy startowej.

   API:  KFS.gotowa            Promise, spelniona gdy baza jest zaladowana
         KFS.db                obiekt bazy sql.js (po spelnieniu gotowa)
         KFS.zapisz()          zapis stanu do localStorage (z opoznieniem)
         KFS.reset()           powrot do bazy startowej
         KFS.pobierzPlik()     pobranie pliku .sqlite na dysk
   ============================================================================ */

(function (global) {
  "use strict";

  var KLUCZ = "kfs_sqlite_v2";
  var OPOZNIENIE_ZAPISU = 250;

  function base64NaBajty(b64) {
    var binarny = global.atob(b64);
    var bajty = new Uint8Array(binarny.length);
    for (var i = 0; i < binarny.length; i++) bajty[i] = binarny.charCodeAt(i);
    return bajty;
  }

  function bajtyNaBase64(bajty) {
    var kawalki = [], rozmiar = 0x8000;
    for (var i = 0; i < bajty.length; i += rozmiar) {
      kawalki.push(String.fromCharCode.apply(null, bajty.subarray(i, i + rozmiar)));
    }
    return global.btoa(kawalki.join(""));
  }

  function wczytajZapisany() {
    try {
      var raw = global.localStorage && global.localStorage.getItem(KLUCZ);
      return raw ? base64NaBajty(raw) : null;
    } catch (e) {
      /* localStorage bywa niedostepny na file:// w trybie prywatnym */
      return null;
    }
  }

  var KFS = {
    db: null,
    KLUCZ: KLUCZ,
    zapisany: false
  };

  var timerZapisu = null;

  KFS.zapisz = function () {
    if (timerZapisu) global.clearTimeout(timerZapisu);
    timerZapisu = global.setTimeout(function () {
      timerZapisu = null;
      if (!KFS.db) return;
      try {
        global.localStorage.setItem(KLUCZ, bajtyNaBase64(KFS.db.export()));
        KFS.zapisany = true;
      } catch (e) {
        /* Przekroczony limit albo brak localStorage: pracujemy w pamieci sesji */
        KFS.zapisany = false;
      }
    }, OPOZNIENIE_ZAPISU);
  };

  KFS.reset = function () {
    try { global.localStorage.removeItem(KLUCZ); } catch (e) { /* brak localStorage */ }
    global.location.reload();
  };

  KFS.pobierzPlik = function (nazwa) {
    var blob = new Blob([KFS.db.export()], { type: "application/x-sqlite3" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = nazwa || "kfs.sqlite";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    global.setTimeout(function () { URL.revokeObjectURL(url); }, 500);
  };

  KFS.wczytajPlik = function (bajty) {
    KFS.db = new global.SQL.Database(new Uint8Array(bajty));
    KFS.zapisz();
  };

  KFS.gotowa = (function () {
    if (!global.initSqlJs) {
      return Promise.reject(new Error("Brak sql.js. Dolacz db/sql-wasm.js przed assets/sqlite.js"));
    }
    if (!global.SQL_WASM_BASE64) {
      return Promise.reject(new Error("Brak binarium WASM. Dolacz db/sql-wasm-data.js"));
    }
    return global.initSqlJs({ wasmBinary: base64NaBajty(global.SQL_WASM_BASE64) })
      .then(function (SQL) {
        global.SQL = SQL;
        var zapisany = wczytajZapisany();
        if (zapisany) {
          KFS.db = new SQL.Database(zapisany);
          KFS.zapisany = true;
        } else {
          if (!global.KFS_SEED_DB) throw new Error("Brak bazy startowej. Dolacz db/seed-db.js");
          KFS.db = new SQL.Database(base64NaBajty(global.KFS_SEED_DB));
        }
        KFS.db.run("PRAGMA foreign_keys = ON");
        return KFS.db;
      });
  })();

  global.KFS = KFS;
})(window);
