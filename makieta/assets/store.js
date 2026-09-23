/* ============================================================================
   Warstwa dostepu do danych. Pod spodem jest SQLite (assets/sqlite.js),
   na wierzchu to samo API, ktorego uzywaly strony makiety wczesniej.

   Dwa sposoby czytania:
     Store.get("klienci")                       cala tabela jako tablica obiektow
     Store.query("SELECT ... WHERE x = ?", [x]) dowolne zapytanie SQL

   Zapis idzie zawsze przez SQL (INSERT / UPDATE / DELETE), wiec ograniczenia
   z schema.sql (klucze obce, CHECK) sa egzekwowane naprawde, a nie na slowo.

   API:  get / find / query / one / insert / update / remove / replaceTable
         subscribe / save / reset / exportJSON / download / import / nextId
   ============================================================================ */

(function (global) {
  "use strict";

  var listeners = [];
  var cache = {};

  function db() {
    if (!global.KFS || !global.KFS.db) {
      throw new Error("Baza nie jest jeszcze gotowa. Uzyj KFS.gotowa albo assets/boot.js");
    }
    return global.KFS.db;
  }

  function wynikNaObiekty(res) {
    if (!res.length) return [];
    var kolumny = res[0].columns, wiersze = res[0].values, out = [];
    for (var i = 0; i < wiersze.length; i++) {
      var o = {};
      for (var j = 0; j < kolumny.length; j++) o[kolumny[j]] = wiersze[i][j];
      out.push(o);
    }
    return out;
  }

  function query(sql, params) {
    var stmt = db().prepare(sql);
    try {
      if (params) stmt.bind(params);
      var out = [];
      while (stmt.step()) out.push(stmt.getAsObject());
      return out;
    } finally {
      stmt.free();
    }
  }

  function exec(sql, params) {
    var stmt = db().prepare(sql);
    try {
      stmt.run(params || []);
    } finally {
      stmt.free();
    }
  }

  function kolumnyTabeli(tabela) {
    return query("PRAGMA table_info(" + tabela + ")").map(function (r) { return r.name; });
  }

  function notify(tabela) {
    cache = {};
    if (global.KFS) global.KFS.zapisz();
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](tabela); } catch (e) { /* jeden bledny listener nie blokuje reszty */ }
    }
  }

  /* Nowe id: najwyzszy numer w tabeli plus jeden, z zachowaniem prefiksu. */
  function nextId(tabela, prefix) {
    var wiersze = query("SELECT id FROM " + tabela);
    var max = 0, pref = prefix || null;
    for (var i = 0; i < wiersze.length; i++) {
      var raw = String(wiersze[i].id == null ? "" : wiersze[i].id);
      var m = raw.match(/(\d+)(?!.*\d)/);
      if (m) {
        max = Math.max(max, parseInt(m[1], 10));
        if (pref == null) pref = raw.slice(0, m.index);
      }
    }
    if (pref == null) pref = tabela.slice(0, 3).toUpperCase() + "-";
    return pref + String(max + 1).padStart(4, "0");
  }

  var Store = {
    query: query,
    exec: exec,

    one: function (sql, params) {
      var r = query(sql, params);
      return r.length ? r[0] : null;
    },

    tables: function () {
      return query("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
        .map(function (r) { return r.name; });
    },

    get: function (tabela) {
      if (!cache[tabela]) cache[tabela] = query("SELECT * FROM " + tabela);
      return cache[tabela];
    },

    find: function (tabela, id) {
      return this.one("SELECT * FROM " + tabela + " WHERE id = ?", [id]);
    },

    nextId: nextId,

    insert: function (tabela, row, prefix) {
      var dozwolone = kolumnyTabeli(tabela);
      var dane = {};
      dozwolone.forEach(function (k) {
        if (Object.prototype.hasOwnProperty.call(row, k)) {
          dane[k] = typeof row[k] === "boolean" ? (row[k] ? 1 : 0) : row[k];
        }
      });
      if (dozwolone.indexOf("id") >= 0 && dane.id == null) dane.id = nextId(tabela, prefix);

      var klucze = Object.keys(dane);
      exec("INSERT INTO " + tabela + " (" + klucze.join(", ") + ") VALUES (" +
           klucze.map(function () { return "?"; }).join(", ") + ")",
           klucze.map(function (k) { return dane[k]; }));
      notify(tabela);
      return dane;
    },

    update: function (tabela, id, patch) {
      var dozwolone = kolumnyTabeli(tabela);
      var klucze = Object.keys(patch).filter(function (k) {
        return dozwolone.indexOf(k) >= 0 && k !== "id";
      });
      if (!klucze.length) return this.find(tabela, id);
      exec("UPDATE " + tabela + " SET " +
           klucze.map(function (k) { return k + " = ?"; }).join(", ") + " WHERE id = ?",
           klucze.map(function (k) {
             var v = patch[k];
             return typeof v === "boolean" ? (v ? 1 : 0) : v;
           }).concat([id]));
      notify(tabela);
      return this.find(tabela, id);
    },

    remove: function (tabela, id) {
      exec("DELETE FROM " + tabela + " WHERE id = ?", [id]);
      var zostal = this.find(tabela, id);
      notify(tabela);
      return zostal === null;
    },

    replaceTable: function (tabela, rows) {
      exec("DELETE FROM " + tabela);
      var self = this;
      rows.forEach(function (r) { self.insert(tabela, r); });
      notify(tabela);
    },

    subscribe: function (fn) {
      listeners.push(fn);
      return function () {
        var i = listeners.indexOf(fn);
        if (i >= 0) listeners.splice(i, 1);
      };
    },

    save: function () { if (global.KFS) global.KFS.zapisz(); },
    reset: function () { if (global.KFS) global.KFS.reset(); },

    /* Eksport calej bazy do JSON: podglad zawartosci i kopia zapasowa. */
    exportJSON: function () {
      var out = {};
      this.tables().forEach(function (t) {
        if (t.indexOf("sqlite_") === 0) return;
        out[t] = query("SELECT * FROM " + t);
      });
      return JSON.stringify(out, null, 2);
    },

    download: function (nazwa) {
      if (nazwa && /\.sqlite$/i.test(nazwa)) return global.KFS.pobierzPlik(nazwa);
      var blob = new Blob([this.exportJSON()], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = nazwa || "kfs-db.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      global.setTimeout(function () { URL.revokeObjectURL(url); }, 500);
    },

    import: function (dane) {
      if (dane instanceof ArrayBuffer || dane instanceof Uint8Array) {
        global.KFS.wczytajPlik(dane);
        notify(null);
        return;
      }
      var parsed = typeof dane === "string" ? JSON.parse(dane) : dane;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Niepoprawny plik: oczekiwano obiektu z tabelami albo pliku .sqlite");
      }
      var self = this;
      db().run("PRAGMA foreign_keys = OFF");
      Object.keys(parsed).forEach(function (t) {
        if (self.tables().indexOf(t) < 0) return;
        exec("DELETE FROM " + t);
        parsed[t].forEach(function (r) { self.insert(t, r); });
      });
      db().run("PRAGMA foreign_keys = ON");
      notify(null);
    }
  };

  global.Store = Store;
})(window);
