/* ============================================================================
   Straznik zapisow. Kazdy INSERT, UPDATE i DELETE przez Store przechodzi
   tutaj, zanim trafi do bazy. Strona nie musi pamietac o uprawnieniach,
   bo zapis bez uprawnien po prostu sie nie wykona (D-148, D-179).

   Trzy sprawdzenia, jak trzy poziomy uprawnien z D-149:
     1. modul   rola ma poziom "edycja" w module, do ktorego nalezy tabela
     2. wiersz  zapisywany wiersz nalezy do instytucji z zakresu konta
     3. pole    kolumny wrazliwe (prowizja) zmienia tylko rola z uprawnieniem pola

   Na koniec dane przechodza walidacje (walidacja.js, odpowiednik Zod, D-211).

   Rejestr aktywnosci jest tylko do dopisywania: nikt go nie edytuje ani nie
   usuwa (D-189). W docelowej aplikacji te same reguly realizuja features
   frameworka Open Mercato i filtr organizacji w serwerze (D-176, D-179).
   ============================================================================ */

(function (global) {
  "use strict";

  var S = global.Store;
  if (!S || !S.ustawStraznika) throw new Error("Brak window.Store ze straznikiem. Dolacz assets/store.js");

  function StraznikError(kod, komunikat) {
    this.name = "StraznikError"; this.kod = kod; this.message = komunikat;
  }
  StraznikError.prototype = Object.create(Error.prototype);
  StraznikError.prototype.constructor = StraznikError;

  /* Tabela -> moduly, z ktorych wolno ja zmieniac (wystarczy jeden z edycja) */
  var MODUL_TABELI = {
    wnioski: ["dofin"], uczestnicy: ["dofin"], klienci: ["dofin"], klient_instytucja: ["dofin"],
    przebieg_wniosku: ["dofin"], notatki: ["dofin", "panelIS"], lata_zestawien: ["dofin"],
    formularze_oczekujace: ["dofin", "panelIS", "akcept"], propozycje_zmian: ["akcept"],
    instytucje: ["inst"], katalog_szkolen: ["inst"], pliki_szkolen: ["inst"], szkoleniowcy: ["inst", "panelIS"],
    terminy: ["terminy", "inst"], nabory: ["nabory"],
    warunki_prowizyjne: ["admin"], progi_dofinansowania: ["admin"], faktury: ["admin"],
    cele: ["admin"], podsumowania_historyczne: ["admin"], meta: ["admin"],
    uzytkownicy: ["ustaw"], uzytkownik_instytucja: ["ustaw"], role: ["ustaw"],
    funkcje: ["ustaw"], role_funkcje: ["ustaw"], moduly: ["ustaw"],
    zgloszenia: ["zglo"], zadania: ["zadania", "dofin"],
    szablony_maili: ["komun"], korespondencja: ["komun", "dofin"]
  };

  /* Dopisanie wiersza przez funkcje, bez edycji modulu: instytucja i jej handlowiec
     zglaszaja formularze i zmiany danych do akceptacji LDIT (D-223, D-224) */
  var FUNKCJA_DOPISANIA = { formularze_oczekujace: "formularze.zglaszanie", propozycje_zmian: "zmiany.zglaszanie" };

  /* Pola, ktore instytucja moze zglosic do zmiany. Zatwierdzajacy (zmiany.zatwierdzanie)
     moze je wprowadzic, nawet bez edycji modulu, ale tylko je (D-224). */
  var POLA_ZGLASZANE = {
    instytucje: ["nazwa", "skrot", "siedziba_miejscowosc", "nip", "strona_www", "osoba_kontaktowa", "email", "telefon",
                 "osoba_kontaktowa_2", "email_2", "telefon_2", "osoba_kontaktowa_3", "email_3", "telefon_3",
                 "opis_dzialalnosci", "standard_godzinowy"],
    klienci: ["nazwa", "nip", "wielkosc_przedsiebiorstwa", "osoba_kontaktowa", "telefon", "email",
              "osoba_kontaktowa_2", "telefon_2", "email_2", "osoba_kontaktowa_3", "telefon_3", "email_3",
              "miasto", "adres_siedziby", "pup_id"]
  };

  /* Uprawnienia pol wymagane do zmiany danych kolumn */
  var POLA_CHRONIONE = {
    wnioski: { prowizja_regula_aktywna: "finanse.prowizja", prowizja_typ_nadpisania: "finanse.prowizja",
               prowizja_wartosc: "finanse.prowizja" }
  };

  /* Skad wziac instytucje wiersza, zeby sprawdzic zakres konta */
  var INSTYTUCJA_PRZEZ = {
    uczestnicy: "SELECT w.instytucja_id AS i FROM uczestnicy u JOIN wnioski w ON w.id = u.wniosek_id WHERE u.id = ?",
    przebieg_wniosku: "SELECT w.instytucja_id AS i FROM przebieg_wniosku p JOIN wnioski w ON w.id = p.wniosek_id WHERE p.id = ?",
    zadania: "SELECT w.instytucja_id AS i FROM zadania z LEFT JOIN wnioski w ON w.id = z.wniosek_id WHERE z.id = ?",
    pliki_szkolen: "SELECT s.instytucja_id AS i FROM pliki_szkolen p JOIN katalog_szkolen s ON s.id = p.szkolenie_id WHERE p.id = ?"
  };
  /* Tabele wskazujace klienta: klient musi byc w zakresie konta, inaczej wpis
     rozszerzylby widocznosc o cudzego klienta (D-144, D-150) */
  var TABELE_KLIENTA = { klient_instytucja: true, notatki: true, korespondencja: true };
  var WNIOSEK_ROWNOWAZNY = { uczestnicy: "wniosek_id", przebieg_wniosku: "wniosek_id", zadania: "wniosek_id" };

  function odmowa(kod, tresc) { throw new StraznikError(kod, tresc); }

  function modulPozwala(tabela) {
    var moduly = MODUL_TABELI[tabela];
    if (!moduly) odmowa("nieznana_tabela", "Zapis do tabeli " + tabela + " nie jest dozwolony z interfejsu.");
    var ok = moduly.some(function (m) { return global.Auth.edytujeModul(m); });
    if (!ok) odmowa("brak_uprawnien", "Twoja rola nie ma prawa edycji w tym module.");
  }

  /* Instytucja z zapisywanych danych: wprost albo przez wniosek. undefined = nie dotyczy */
  function instytucjaNowych(tabela, dane) {
    if (!dane) return undefined;
    if (dane.instytucja_id !== undefined) return dane.instytucja_id;
    if (tabela === "pliki_szkolen" && dane.szkolenie_id) {
      var s = S.one("SELECT instytucja_id AS i FROM katalog_szkolen WHERE id = ?", [dane.szkolenie_id]);
      return s ? s.i : null;
    }
    var kolWniosku = WNIOSEK_ROWNOWAZNY[tabela];
    if (kolWniosku && dane[kolWniosku]) {
      var w = S.one("SELECT instytucja_id AS i FROM wnioski WHERE id = ?", [dane[kolWniosku]]);
      return w ? w.i : null;
    }
    return undefined;
  }

  /* Instytucja wiersza, ktory juz jest w bazie */
  function instytucjaIstniejacego(tabela, id) {
    if (id == null) return undefined;
    if (INSTYTUCJA_PRZEZ[tabela]) { var r = S.one(INSTYTUCJA_PRZEZ[tabela], [id]); return r ? r.i : undefined; }
    var kol = S.query("PRAGMA table_info(" + tabela + ")").some(function (c) { return c.name === "instytucja_id"; });
    if (!kol) return undefined;
    var wiersz = S.one("SELECT instytucja_id AS i FROM " + tabela + " WHERE id = ?", [id]);
    return wiersz ? wiersz.i : undefined;
  }

  /* Przy edycji sprawdzamy stary i nowy stan: rekordu nie da sie ani ruszyc
     w cudzej instytucji, ani przeniesc do cudzej instytucji. */
  function wierszPozwala(operacja, tabela, dane, id) {
    var Auth = global.Auth;
    if (Auth.instytucje() === null) return;
    var sprawdzane = [];
    if (operacja !== "insert") sprawdzane.push(instytucjaIstniejacego(tabela, id));
    if (operacja !== "remove") sprawdzane.push(instytucjaNowych(tabela, dane));
    sprawdzane.forEach(function (inst) {
      if (inst === undefined) return;
      if (inst === null || !Auth.wZakresie(inst)) {
        odmowa("poza_zakresem", "Ten rekord należy do instytucji spoza Twojego zakresu.");
      }
    });
    if (TABELE_KLIENTA[tabela] && operacja !== "remove" && dane && dane.klient_id) {
      var widoczni = Auth.klienciWZakresie();
      var nowy = S.one("SELECT instytucja_id AS i FROM klienci WHERE id = ?", [dane.klient_id]);
      var pozyskanyUMnie = nowy && nowy.i && Auth.wZakresie(nowy.i);
      if (widoczni !== null && widoczni.indexOf(dane.klient_id) < 0 && !pozyskanyUMnie) {
        odmowa("poza_zakresem", "Ten klient jest spoza Twojego zakresu.");
      }
    }
    /* Rekord instytucji to sama instytucja: pracownik z przydzialem zmienia tylko swoje (D-113) */
    if (tabela === "instytucje" && operacja !== "insert" && !Auth.wZakresie(id)) {
      odmowa("poza_zakresem", "Ta instytucja jest spoza Twojego zakresu.");
    }
    if (tabela === "klienci" && operacja !== "insert") {
      var zakres = Auth.klienciWZakresie();
      if (zakres !== null && zakres.indexOf(id) < 0) odmowa("poza_zakresem", "Ten klient jest spoza Twojego zakresu.");
    }
  }

  function polaPozwalaja(tabela, dane) {
    var chronione = POLA_CHRONIONE[tabela];
    if (!chronione || !dane) return;
    Object.keys(dane).forEach(function (k) {
      if (chronione[k] && !global.Auth.moze(chronione[k])) {
        odmowa("pole_chronione", "Twoja rola nie może zmieniać pola " + k + ".");
      }
    });
  }

  /* Handlowiec (D-210) nie zmienia cudzych rekordow ani nie przepisuje rekordu na kogos innego */
  var TABELE_HANDLOWCA = { wnioski: "id", formularze_oczekujace: "id" };
  function handlowiecPozwala(operacja, tabela, dane, id) {
    var h = global.Auth.handlowiec();
    if (!h) return;
    if (dane && dane.handlowiec_id !== undefined && dane.handlowiec_id !== h) {
      odmowa("poza_zakresem", "Handlowiec nie przypisuje rekordów innym osobom.");
    }
    if (TABELE_HANDLOWCA[tabela] && operacja !== "insert") {
      var r = S.one("SELECT handlowiec_id AS h FROM " + tabela + " WHERE id = ?", [id]);
      if (r && r.h !== h) odmowa("poza_zakresem", "Ten rekord prowadzi inny handlowiec.");
    }
  }

  /* Walidacja danych (walidacja.js). Przy edycji tylko pola, ktore sie zmieniaja. */
  function danePoprawne(operacja, tabela, dane, id) {
    if (!global.Walidacja || !dane || operacja === "remove") return;
    var doSprawdzenia = dane;
    if (operacja === "update") {
      var obecny = S.one("SELECT * FROM " + tabela + " WHERE id = ?", [id]) || {};
      doSprawdzenia = {};
      Object.keys(dane).forEach(function (k) { if (String(dane[k]) !== String(obecny[k])) doSprawdzenia[k] = dane[k]; });
    }
    var b = global.Walidacja.bledy(tabela, doSprawdzenia);
    if (b.length) odmowa("walidacja", b.map(function (x) { return x.pole + ": " + x.komunikat; }).join("; "));
  }

  /* Propozycja zmiany dotyczy wlasnej instytucji albo klienta z zakresu konta */
  function propozycjaPozwala(dane) {
    var Auth = global.Auth;
    if (dane.tabela === "instytucje" && dane.rekord_id !== dane.instytucja_id) {
      odmowa("poza_zakresem", "Instytucja zgłasza zmiany tylko własnych danych.");
    }
    /* Dane samej instytucji zmienia jej administrator; handlowiec zglasza klientow (D-75, D-210) */
    if (dane.tabela === "instytucje" && Auth.handlowiec()) {
      odmowa("brak_uprawnien", "Handlowiec nie zgłasza zmian danych instytucji.");
    }
    if (dane.tabela === "klienci") {
      var widoczni = Auth.klienciWZakresie();
      if (widoczni !== null && widoczni.indexOf(dane.rekord_id) < 0) odmowa("poza_zakresem", "Ten klient jest spoza Twojego zakresu.");
    }
    var pola = Object.keys(JSON.parse(dane.zmiany || "{}"));
    var dozwolone = POLA_ZGLASZANE[dane.tabela] || [];
    if (!pola.length || pola.some(function (k) { return dozwolone.indexOf(k) < 0; })) {
      odmowa("pole_chronione", "Tych pól nie można zgłosić do zmiany.");
    }
  }

  /* Zatwierdzajacy bez edycji modulu wprowadza wylacznie to, co instytucja zglosila:
     musi istniec oczekujaca propozycja dla tego rekordu z dokladnie tymi wartosciami.
     Poza zatwierdzeniem pracownik z podgladem nadal niczego tu nie zmieni. */
  function zatwierdzeniePozwala(operacja, tabela, dane, id) {
    if (operacja !== "update" || !POLA_ZGLASZANE[tabela] || !dane) return false;
    if (!global.Auth.moze("zmiany.zatwierdzanie")) return false;
    var klucze = Object.keys(dane);
    if (klucze.some(function (k) { return POLA_ZGLASZANE[tabela].indexOf(k) < 0; })) return false;
    var propozycje = S.query("SELECT zmiany FROM propozycje_zmian WHERE tabela = ? AND rekord_id = ? AND status = 'oczekuje'",
                             [tabela, id]);
    return propozycje.some(function (p) {
      var zmiany = JSON.parse(p.zmiany || "{}");
      return klucze.length === Object.keys(zmiany).length && klucze.every(function (k) {
        return zmiany[k] && String(zmiany[k].po == null ? "" : zmiany[k].po) === String(dane[k] == null ? "" : dane[k]);
      });
    });
  }

  /* Rozpatrzenie zmienia tylko status propozycji. Tresci zgloszenia (zmiany, rekord)
     nikt nie poprawia, bo zatwierdzenie wprowadza do danych dokladnie to, co w niej jest. */
  var POLA_ROZPATRZENIA = ["status", "rozpatrzyl_id", "rozpatrzono", "powod_odrzucenia"];
  function rozpatrzeniePozwala(dane) {
    if (Object.keys(dane || {}).some(function (k) { return POLA_ROZPATRZENIA.indexOf(k) < 0; })) {
      odmowa("pole_chronione", "Treści zgłoszonej zmiany nie można edytować, można ją zatwierdzić albo odrzucić.");
    }
  }

  /* Zgloszenie przez funkcje (bez edycji modulu) jest zawsze nowe, oczekujace i podpisane
     kontem, ktore je wysyla: nie da sie podszyc pod innego zglaszajacego ani od razu zaakceptowac */
  var POLA_ROZPATRZONEGO = ["rozpatrzyl_id", "rozpatrzono", "powod_odrzucenia", "klient_id"];
  function zgloszeniePozwala(dane) {
    var s = global.Auth.sesja();
    if (dane.zglosil_id !== s.uzytkownik_id) odmowa("brak_uprawnien", "Zgłoszenie musi być podpisane Twoim kontem.");
    if (dane.status !== "oczekuje") odmowa("brak_uprawnien", "Nowe zgłoszenie czeka na akceptację LDIT.");
    if (POLA_ROZPATRZONEGO.some(function (k) { return dane[k] != null; })) {
      odmowa("pole_chronione", "Nowe zgłoszenie nie może być rozpatrzone przy wysłaniu.");
    }
  }

  function straznik(operacja, tabela, dane, id) {
    var Auth = global.Auth;
    if (!Auth || !Auth.zalogowany()) odmowa("brak_sesji", "Sesja wygasła. Zaloguj się ponownie.");

    if (operacja === "sql" || operacja === "import" || operacja === "eksport") {
      if (!Auth.edytujeModul("ustaw")) odmowa("brak_uprawnien", "Operacje hurtowe na bazie wykonuje wyłącznie administrator.");
      return;
    }
    if (tabela === "rejestr_aktywnosci") {
      if (operacja !== "insert") odmowa("rejestr_tylko_dopisywanie", "Rejestru aktywności nie można zmieniać ani usuwać.");
      return;
    }
    if (tabela === "lata_zestawien" && operacja === "insert") {
      if (!Auth.moze("zestawienia.dodawanie_lat")) odmowa("brak_uprawnien", "Twoja rola nie dodaje zakładek lat.");
      return;
    }
    var przezFunkcje = operacja === "insert" && FUNKCJA_DOPISANIA[tabela] && Auth.moze(FUNKCJA_DOPISANIA[tabela]);
    if (!przezFunkcje && !zatwierdzeniePozwala(operacja, tabela, dane, id)) modulPozwala(tabela);
    if (tabela === "propozycje_zmian" && operacja === "insert") propozycjaPozwala(dane);
    if (przezFunkcje) zgloszeniePozwala(dane);
    if (tabela === "propozycje_zmian" && operacja === "update") rozpatrzeniePozwala(dane);
    wierszPozwala(operacja, tabela, dane, id);
    handlowiecPozwala(operacja, tabela, dane, id);
    polaPozwalaja(tabela, dane);
    danePoprawne(operacja, tabela, dane, id);
  }

  S.ustawStraznika(straznik);
  global.Straznik = { StraznikError: StraznikError, MODUL_TABELI: MODUL_TABELI };
})(window);
