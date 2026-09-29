/* ============================================================================
   Straznik zapisow. Kazdy INSERT, UPDATE i DELETE przez Store przechodzi
   tutaj, zanim trafi do bazy. Strona nie musi pamietac o uprawnieniach,
   bo zapis bez uprawnien po prostu sie nie wykona (D-148, D-179).

   Trzy sprawdzenia, jak trzy poziomy uprawnien z D-149:
     1. modul   rola ma poziom "edycja" w module, do ktorego nalezy tabela
     2. wiersz  zapisywany wiersz nalezy do instytucji z zakresu konta
     3. pole    kolumny wrazliwe (prowizja) zmienia tylko rola z uprawnieniem pola

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
    formularze_oczekujace: ["dofin", "panelIS"],
    instytucje: ["inst"], katalog_szkolen: ["inst"], szkoleniowcy: ["inst", "panelIS"],
    terminy: ["terminy", "inst"], nabory: ["nabory"],
    warunki_prowizyjne: ["admin"], progi_dofinansowania: ["admin"], faktury: ["admin"],
    cele: ["admin"], podsumowania_historyczne: ["admin"], meta: ["admin"],
    uzytkownicy: ["ustaw"], uzytkownik_instytucja: ["ustaw"], role: ["ustaw"],
    uprawnienia: ["ustaw"], uprawnienia_pol: ["ustaw"], moduly: ["ustaw"],
    zgloszenia: ["zglo"], zadania: ["zadania", "dofin"],
    szablony_maili: ["komun"], korespondencja: ["komun", "dofin"]
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
    zadania: "SELECT w.instytucja_id AS i FROM zadania z LEFT JOIN wnioski w ON w.id = z.wniosek_id WHERE z.id = ?"
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
    modulPozwala(tabela);
    wierszPozwala(operacja, tabela, dane, id);
    polaPozwalaja(tabela, dane);
  }

  S.ustawStraznika(straznik);
  global.Straznik = { StraznikError: StraznikError, MODUL_TABELI: MODUL_TABELI };
})(window);
