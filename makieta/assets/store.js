/* ============================================================
   Warstwa danych makiety KFS/LDIT.

   Jedno zrodlo danych wejsciowych to window.DB_SEED (assets/db.seed.js),
   ktore odwzorowuje schemat z docs/03-model-danych.md.

   Store trzyma roboczą kopie w localStorage, wiec edycje w makiecie
   (dodanie wiersza, zmiana pola) sa trwale miedzy odswiezeniami
   ("nadpisuje mi sie"). Mozna je wyeksportowac do pliku db.json,
   zaimportowac inny plik albo cofnac do wersji bazowej.

   API:  Store.get(tabela) / find / insert / update / remove
         Store.subscribe(fn) / save / reset
         Store.exportJSON / download / import
   ============================================================ */

(function (global) {
  "use strict";

  var KEY = "kfs_db_v1";
  var listeners = [];

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function loadSeed() {
    if (!global.DB_SEED) {
      throw new Error("Brak window.DB_SEED. Dolacz assets/db.seed.js przed store.js");
    }
    return clone(global.DB_SEED);
  }

  /* Robocza kopia: localStorage jesli istnieje, inaczej swiezy seed */
  function load() {
    try {
      var raw = global.localStorage && global.localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      /* localStorage bywa zablokowany dla file:// w niektorych przegladarkach */
    }
    return loadSeed();
  }

  var data = load();

  function persist() {
    try {
      if (global.localStorage) global.localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      /* brak trwalosci, pracujemy tylko w pamieci sesji */
    }
  }

  function notify(tabela) {
    persist();
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](tabela); } catch (e) { /* jeden bledny listener nie blokuje reszty */ }
    }
  }

  function table(nazwa) {
    if (!data[nazwa]) data[nazwa] = [];
    return data[nazwa];
  }

  /* Nowe id na podstawie najwyzszego numeru w tabeli, z zachowaniem prefiksu */
  function nextId(nazwa, prefix) {
    var t = table(nazwa), max = 0, pref = prefix || null;
    for (var i = 0; i < t.length; i++) {
      var raw = String(t[i].id == null ? "" : t[i].id);
      var m = raw.match(/(\d+)(?!.*\d)/);
      if (m) {
        max = Math.max(max, parseInt(m[1], 10));
        if (pref == null) pref = raw.slice(0, m.index);
      }
    }
    if (pref == null) pref = nazwa.slice(0, 3).toUpperCase() + "-";
    return pref + String(max + 1).padStart(4, "0");
  }

  var Store = {
    KEY: KEY,

    all: function () { return data; },
    tables: function () { return Object.keys(data); },
    get: function (nazwa) { return table(nazwa); },
    find: function (nazwa, id) {
      var t = table(nazwa);
      for (var i = 0; i < t.length; i++) if (t[i].id === id) return t[i];
      return null;
    },
    nextId: nextId,

    insert: function (nazwa, row, prefix) {
      var t = table(nazwa);
      if (row.id == null) row.id = nextId(nazwa, prefix);
      t.push(row);
      notify(nazwa);
      return row;
    },
    update: function (nazwa, id, patch) {
      var r = this.find(nazwa, id);
      if (!r) return null;
      for (var k in patch) if (Object.prototype.hasOwnProperty.call(patch, k)) r[k] = patch[k];
      notify(nazwa);
      return r;
    },
    remove: function (nazwa, id) {
      var t = table(nazwa);
      for (var i = 0; i < t.length; i++) {
        if (t[i].id === id) { t.splice(i, 1); notify(nazwa); return true; }
      }
      return false;
    },
    replaceTable: function (nazwa, rows) { data[nazwa] = rows; notify(nazwa); },

    subscribe: function (fn) {
      listeners.push(fn);
      return function () {
        var i = listeners.indexOf(fn);
        if (i >= 0) listeners.splice(i, 1);
      };
    },
    save: persist,

    reset: function () {
      data = loadSeed();
      try { if (global.localStorage) global.localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
      notify(null);
    },

    exportJSON: function () { return JSON.stringify(data, null, 2); },

    download: function (filename) {
      var blob = new Blob([this.exportJSON()], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = filename || "db.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 500);
    },

    import: function (text) {
      var parsed = typeof text === "string" ? JSON.parse(text) : text;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Niepoprawny plik: oczekiwano obiektu z tabelami");
      }
      data = parsed;
      notify(null);
    }
  };

  /* Zmiana w innej karcie lub iframe (ten sam localStorage) odswieza dane */
  if (global.addEventListener) {
    global.addEventListener("storage", function (e) {
      if (e.key === KEY) {
        data = load();
        for (var i = 0; i < listeners.length; i++) {
          try { listeners[i](null); } catch (err) { /* ignore */ }
        }
      }
    });
  }

  global.Store = Store;
})(window);
