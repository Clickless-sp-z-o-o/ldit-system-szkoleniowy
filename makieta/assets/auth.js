/* ============================================================================
   Sesja i uprawnienia.

   Rola nie jest wybierana przelacznikiem, tylko wynika z zalogowanego konta
   (D-125). Uprawnienia czytamy z bazy, z tabel role, moduly, uprawnienia
   i uprawnienia_pol, a nie z list zaszytych w kodzie stron (D-35, D-36).

   Trzy poziomy kontroli:
     1. modul   Auth.poziom("admin")  czy rola w ogole widzi zakladke
     2. pole    Auth.moze("finanse.prowizja")  czy widzi dana kolumne lub kwote
     3. wiersz  Auth.instytucje()  ktore instytucje sa w zasiegu konta

   Trzeci poziom jest najwazniejszy: separacja danych ma byc egzekwowana na
   danych, nie na interfejsie. Filtr wierszy zakladany jest w adapterze
   assets/db.js, zanim jakakolwiek strona zobaczy dane.
   ============================================================================ */

(function (global) {
  "use strict";

  var KLUCZ_SESJI = "kfs_sesja_v1";
  var S = global.Store;
  if (!S) throw new Error("Brak window.Store. Dolacz assets/store.js przed auth.js");

  var sesja = null;

  function wczytajSesje() {
    try {
      var raw = global.localStorage && global.localStorage.getItem(KLUCZ_SESJI);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function zapiszSesje(s) {
    try {
      if (s) global.localStorage.setItem(KLUCZ_SESJI, JSON.stringify(s));
      else global.localStorage.removeItem(KLUCZ_SESJI);
    } catch (e) {
      /* brak localStorage: sesja zyje tylko w pamieci karty */
    }
    sesja = s;
  }

  function teraz() {
    var d = new Date();
    var p = function (n) { return String(n).padStart(2, "0"); };
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) +
           " " + p(d.getHours()) + ":" + p(d.getMinutes());
  }

  /* Zmiana sesji zmienia zakres widocznych danych, wiec adapter musi je przeliczyc */
  function przebudujDane() {
    if (global.DB && global.DB.przebuduj) global.DB.przebuduj();
  }

  function zapiszLogowanie(login, wynik) {
    S.insert("logowania", {
      czas: teraz(), kto: login, ip: "10.0.0.1", wynik: wynik, urzadzenie: "Przegladarka (makieta)"
    }, "LOG-");
  }

  var Auth = {
    KLUCZ_SESJI: KLUCZ_SESJI,

    /* --------------------------- logowanie --------------------------- */

    zaloguj: function (login, haslo) {
      var u = S.one(
        "SELECT u.*, r.nazwa AS rola_nazwa, r.zakres AS rola_zakres, i.nazwa AS instytucja_nazwa " +
        "FROM uzytkownicy u JOIN role r ON r.id = u.rola_id " +
        "LEFT JOIN instytucje i ON i.id = u.instytucja_id " +
        "WHERE lower(u.login) = lower(?)", [String(login || "").trim()]);

      if (!u) {
        zapiszLogowanie(login, "blad hasla");
        return { ok: false, blad: "Nie ma konta o takim adresie." };
      }
      if (u.zablokowane) {
        zapiszLogowanie(login, "zablokowane");
        return { ok: false, blad: "Konto zablokowane przez administratora." };
      }
      if (String(haslo) !== String(u.haslo_demo)) {
        zapiszLogowanie(login, "blad hasla");
        return { ok: false, blad: "Nieprawidlowe haslo." };
      }

      zapiszSesje({
        uzytkownik_id: u.id, login: u.login, imie: u.imie_nazwisko,
        rola_id: u.rola_id, rola_nazwa: u.rola_nazwa, rola_zakres: u.rola_zakres,
        instytucja_id: u.instytucja_id, instytucja_nazwa: u.instytucja_nazwa,
        klient_id: u.klient_id,
        wszystkie_instytucje: !!u.wszystkie_instytucje, zalogowano: teraz()
      });
      S.update("uzytkownicy", u.id, { ostatnie_logowanie: teraz() });
      zapiszLogowanie(login, "sukces");
      przebudujDane();
      return { ok: true, sesja: sesja };
    },

    wyloguj: function () {
      zapiszSesje(null);
      przebudujDane();
    },

    sesja: function () {
      if (sesja === null) sesja = wczytajSesje();
      return sesja;
    },

    zalogowany: function () { return !!this.sesja(); },

    rola: function () {
      var s = this.sesja();
      return s ? s.rola_id : null;
    },

    inicjaly: function () {
      var s = this.sesja();
      if (!s) return "??";
      return s.imie.split(/\s+/).map(function (c) { return c[0]; }).join("").slice(0, 2).toUpperCase();
    },

    /* ------------------------ uprawnienia: moduly ------------------------ */

    poziom: function (modulId) {
      var s = this.sesja();
      if (!s) return "brak";
      var r = S.one("SELECT poziom FROM uprawnienia WHERE rola_id = ? AND modul_id = ?",
                    [s.rola_id, modulId]);
      return r ? r.poziom : "brak";
    },

    widziModul: function (modulId) { return this.poziom(modulId) !== "brak"; },
    edytujeModul: function (modulId) { return this.poziom(modulId) === "edycja"; },

    moduly: function () {
      var s = this.sesja();
      if (!s) return [];
      return S.query(
        "SELECT m.*, u.poziom FROM moduly m JOIN uprawnienia u ON u.modul_id = m.id " +
        "WHERE u.rola_id = ? AND u.poziom <> 'brak' ORDER BY m.kolejnosc", [s.rola_id]);
    },

    /* -------------------------- uprawnienia: pola -------------------------- */

    moze: function (klucz) {
      var s = this.sesja();
      if (!s) return false;
      var r = S.one("SELECT widoczne FROM uprawnienia_pol WHERE rola_id = ? AND klucz = ?",
                    [s.rola_id, klucz]);
      return !!(r && r.widoczne);
    },

    /* ------------------------- uprawnienia: wiersze ------------------------- */

    /* Lista instytucji, ktorych dane konto moze w ogole zobaczyc (D-113, D-35).
       Konto LDIT z flaga wszystkie_instytucje widzi wszystko, pozostale tylko
       przypisane. Zwraca null, gdy ograniczenia nie ma. */
    instytucje: function () {
      var s = this.sesja();
      if (!s) return [];
      if (s.wszystkie_instytucje) return null;
      return S.query("SELECT instytucja_id FROM v_zakres_uzytkownika WHERE uzytkownik_id = ?",
                     [s.uzytkownik_id]).map(function (r) { return r.instytucja_id; });
    },

    wZakresie: function (instytucjaId) {
      var lista = this.instytucje();
      return lista === null || lista.indexOf(instytucjaId) >= 0;
    },

    /* Klient nalezy do zakresu, jesli ma znacznik ktorejkolwiek z instytucji
       konta (D-144). Sprawdzane po tabeli laczacej, nie po polu instytucja_id. */
    klienciWZakresie: function () {
      var lista = this.instytucje();
      if (lista === null) return null;
      if (!lista.length) return [];
      var puste = lista.map(function () { return "?"; }).join(", ");
      return S.query("SELECT DISTINCT klient_id FROM klient_instytucja WHERE instytucja_id IN (" +
                     puste + ")", lista).map(function (r) { return r.klient_id; });
    },

    /* Klient koncowy widzi wylacznie wlasne wnioski. W makiecie konto klienta
       nie jest powiazane z rekordem klienta, wiec zakres jest pusty. P-33. */
    tylkoWlasnyWniosek: function () {
      var s = this.sesja();
      return !!s && s.rola_zakres === "klient";
    },

    /* --------------------------- brama dostepu --------------------------- */

    /* Wywolywane przez strony w ramce. Brak sesji albo brak uprawnienia do
       modulu konczy renderowanie i pokazuje komunikat zamiast danych. */
    wymagaj: function (modulId) {
      if (!this.zalogowany()) {
        this.pokazBlokade("Sesja wygasla", "Zaloguj sie ponownie, zeby zobaczyc te strone.");
        return false;
      }
      if (modulId && !this.widziModul(modulId)) {
        var s = this.sesja();
        this.pokazBlokade("Brak dostepu",
          "Rola <b>" + s.rola_nazwa + "</b> nie ma dostepu do tego modulu. " +
          "Uprawnienia nadawane sa per rola, nie per osoba (D-35, D-36).");
        return false;
      }
      return true;
    },

    pokazBlokade: function (tytul, tresc) {
      document.body.innerHTML =
        '<div class="blokada-dostepu">' +
        '<div class="blokada-ikona">&#9888;</div>' +
        '<h2>' + tytul + '</h2><p>' + tresc + '</p></div>';
    }
  };

  global.Auth = Auth;
})(window);
