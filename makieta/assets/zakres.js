/* ============================================================================
   Separacja danych. Jedno miejsce, w ktorym z kompletu danych zostaje to,
   co wolno zobaczyc zalogowanemu kontu.

   Dlaczego tutaj, a nie na stronach: instytucje szkoleniowe sa wobec siebie
   konkurencyjne, a wyciek do niewlasciwego katalogu to scenariusz krytyczny.
   Ukrycie kolumny w HTML nie jest zabezpieczeniem, bo dane i tak sa w pamieci
   strony. Dlatego filtr zaklada sie na wynik adaptera, zanim jakakolwiek
   strona go zobaczy (D-35, D-76, D-114, D-144).

   Filtr dziala na dwoch poziomach:
     wiersze  ktore instytucje, ktorzy klienci, ktore wnioski
     pola     prowizja, zysk firmy, PESEL uczestnika

   Zastosowanie:  Zakres.zastosuj(DB)  na koncu przebudowy DB.
   ============================================================================ */

(function (global) {
  "use strict";

  function nalezy(lista, wartosc) {
    return lista === null || lista.indexOf(wartosc) >= 0;
  }

  function filtruj(tablica, lista, pole) {
    if (lista === null) return tablica;
    return tablica.filter(function (r) { return lista.indexOf(r[pole]) >= 0; });
  }

  var Zakres = {

    zastosuj: function (DB) {
      var Auth = global.Auth;
      if (!Auth || !Auth.zalogowany()) {
        this.wyczysc(DB);
        return DB;
      }

      if (Auth.tylkoWlasnyWniosek()) return this.zakresKlienta(DB, Auth.sesja());

      var instytucje = Auth.instytucje();          /* null = brak ograniczenia */
      var klienci = Auth.klienciWZakresie();

      DB.INSTYTUCJE = filtruj(DB.INSTYTUCJE, instytucje, "id");

      DB.KLIENCI = filtruj(DB.KLIENCI, klienci, "id");
      DB.KLIENCI = this.wlasnyKontekstKlienta(DB.KLIENCI, instytucje);
      DB.SZKOLENIA = filtruj(DB.SZKOLENIA, instytucje, "is");
      DB.TERMINY = filtruj(DB.TERMINY, instytucje, "is");
      DB.FAKTURY = filtruj(DB.FAKTURY, instytucje, "isId");
      DB.WNIOSKI_WSZYSTKIE = filtruj(DB.WNIOSKI_WSZYSTKIE, instytucje, "is");
      DB.WNIOSKI_2026 = filtruj(DB.WNIOSKI_2026, instytucje, "is");
      DB.WNIOSKI_2025 = filtruj(DB.WNIOSKI_2025, instytucje, "is");
      DB.WNIOSKI_BEZ_ROKU = filtruj(DB.WNIOSKI_BEZ_ROKU, instytucje, "is");
      DB.WNIOSKI = DB.WNIOSKI_2026;
      DB.SZKOLENIOWCY = filtruj(DB.SZKOLENIOWCY, instytucje, "is");
      DB.KOLEJKA = filtruj(DB.KOLEJKA, instytucje, "isId");
      DB.PROPOZYCJE = filtruj(DB.PROPOZYCJE, instytucje, "isId");
      /* Korespondencja bez przypisanej instytucji nie trafia do konta z ograniczonym
         zakresem: brak przypisania oznacza brak dostepu, nie dostep dla wszystkich */
      DB.MAILE = filtruj(DB.MAILE, instytucje, "isId");
      DB.ZADANIA = this.zadaniaWZakresie(DB.ZADANIA, DB.WNIOSKI_WSZYSTKIE, instytucje);
      DB.PODSUMOWANIA = filtruj(DB.PODSUMOWANIA, instytucje, "isId");
      this.zakresHandlowca(DB, Auth.handlowiec());
      if (instytucje !== null) DB.KLIENCI = this.zatrudnienieZWidocznych(DB.KLIENCI, DB.WNIOSKI_WSZYSTKIE);
      /* Podsumowanie calej firmy (bez instytucji) to statystyka zbiorcza LDIT */
      if (!Auth.moze("statystyki.zbiorcze")) {
        DB.PODSUMOWANIA = DB.PODSUMOWANIA.filter(function (p) { return p.isId != null; });
      }

      /* Stawki prowizji widzi wylacznie administrator (D-07). Instytucja nie widzi
         nawet wlasnej (D-76), pracownik LDIT nie widzi zadnej (D-34, D-114). */
      if (!Auth.moze("finanse.prowizja")) {
        DB.INSTYTUCJE = DB.INSTYTUCJE.map(function (i) {
          var kopia = {};
          for (var k in i) if (k !== "prowizja") kopia[k] = i[k];
          kopia.prowizja = null;
          return kopia;
        });
        [DB.WNIOSKI_WSZYSTKIE, DB.WNIOSKI_2026, DB.WNIOSKI_2025].forEach(function (lista) {
          lista.forEach(function (w) {
            w.prowizjaProcent = null;
            w.prowizjaKwota = null;
            w.prowizjaTyp = null;
            w.podstawaProwizji = null;
          });
        });
      }

      /* PESEL uczestnika to dane wrazliwe. Handlowiec instytucji ich nie widzi,
         bo jego rola konczy sie na wypelnieniu formularza (D-75). */
      if (!Auth.moze("klient.pesel")) {
        DB.WNIOSKI_WSZYSTKIE.forEach(function (w) {
          w.uczestnicy.forEach(function (u) { u.pesel = null; });
        });
      }

      /* Kwoty wniosku: role bez tego uprawnienia dostaja wnioski bez finansow. */
      if (!Auth.moze("finanse.kwoty_wniosku")) {
        DB.WNIOSKI_WSZYSTKIE.forEach(function (w) {
          w.kosztCalkowity = null; w.przyznano = null; w.kosztZDoplata = null;
          w.calkowita = null; w.wartosc = null; w.doplata = null; w.wartoscWszystkich = null;
          w.przyznanoZReguly = null; w.wklad = null; w.wkladZReguly = null; w.podstawaProwizji = null;
          w.kosztZDoplataZapisany = null;
        });
      }

      if (!Auth.moze("finanse.faktury")) DB.FAKTURY = [];
      if (!Auth.moze("zgloszenia.dostep")) DB.ZGLOSZENIA = [];
      if (!Auth.moze("admin.rejestr")) { DB.AKTYWNOSC = []; DB.LOGOWANIA = []; }
      if (!Auth.moze("statystyki.zbiorcze")) DB.CELE = [];

      /* Liste kont widzi administrator LDIT. Administrator instytucji widzi
         wylacznie wlasnych pracownikow (D-126). */
      if (!Auth.moze("admin.konta")) {
        var s = Auth.sesja();
        var mojeInst = s.instytucja_nazwa;
        DB.UZYTKOWNICY = mojeInst
          ? DB.UZYTKOWNICY.filter(function (u) { return u.inst === mojeInst; })
          : [];
      }

      return DB;
    },

    /* Klient koncowy widzi wylacznie wlasny rekord i wlasne wnioski. Instytucje
       zostaja tylko te, ktore prowadza jego wnioski, zeby dalo sie pokazac nazwe
       szkoleniowca. Bez prowizji, bez faktur, bez kogokolwiek innego. P-33. */
    zakresKlienta: function (DB, sesja) {
      var id = sesja.klient_id;
      DB.KLIENCI = DB.KLIENCI.filter(function (k) { return k.id === id; });
      DB.WNIOSKI_WSZYSTKIE = DB.WNIOSKI_WSZYSTKIE.filter(function (w) { return w.klient === id; });
      DB.WNIOSKI_2026 = DB.WNIOSKI_2026.filter(function (w) { return w.klient === id; });
      DB.WNIOSKI_2025 = DB.WNIOSKI_2025.filter(function (w) { return w.klient === id; });
      DB.WNIOSKI = DB.WNIOSKI_2026;

      var moje = DB.WNIOSKI_WSZYSTKIE.map(function (w) { return w.is; });
      DB.INSTYTUCJE = DB.INSTYTUCJE
        .filter(function (i) { return moje.indexOf(i.id) >= 0; })
        .map(function (i) {
          var kopia = {};
          for (var k in i) if (Object.prototype.hasOwnProperty.call(i, k)) kopia[k] = i[k];
          kopia.prowizja = null;
          return kopia;
        });
      DB.TERMINY = DB.TERMINY.filter(function (t) { return moje.indexOf(t.is) >= 0; });
      DB.SZKOLENIA = DB.SZKOLENIA.filter(function (s) { return moje.indexOf(s.is) >= 0; });

      DB.WNIOSKI_BEZ_ROKU = DB.WNIOSKI_BEZ_ROKU.filter(function (w) { return w.klient === id; });
      DB.SZKOLENIOWCY = DB.SZKOLENIOWCY.filter(function (s) { return moje.indexOf(s.is) >= 0; });

      /* Klient widzi kwoty swojego wniosku, ale nie prowizje LDIT ani cudze PESEL-e
         innych uczestnikow szkolenia (D-148, D-192). */
      DB.WNIOSKI_WSZYSTKIE.forEach(function (w) {
        w.prowizjaProcent = null; w.prowizjaKwota = null; w.prowizjaTyp = null; w.podstawaProwizji = null;
        w.uczestnicy.forEach(function (u) { u.pesel = null; });
      });

      /* Klient widzi nazwisko szkoleniowca, ale nie jego prywatne kontakty ani opiekuna LDIT */
      DB.SZKOLENIOWCY = DB.SZKOLENIOWCY.map(function (s) {
        return { id: s.id, is: s.is, imie: s.imie, nazwisko: s.nazwisko, specjalizacja: s.specjalizacja,
                 aktywny: s.aktywny, tel: null, mail: null };
      });
      DB.INSTYTUCJE.forEach(function (i) { i.opiekun = null; });

      ["FAKTURY", "KOLEJKA", "PROPOZYCJE", "MAILE", "UZYTKOWNICY", "ZGLOSZENIA", "PODSUMOWANIA", "SZABLONY", "ROLE",
       "AKTYWNOSC", "LOGOWANIA", "CELE", "ZADANIA"].forEach(function (k) { DB[k] = []; });
      return DB;
    },

    /* Handlowiec instytucji widzi wylacznie swoje wnioski, formularze i korespondencje
       swoich klientow; klientow zaweza juz Auth.klienciWZakresie (D-210).
       Statystyk instytucji nie dostaje (D-209). */
    zakresHandlowca: function (DB, handlowiec) {
      if (!handlowiec) return;
      var moje = function (w) { return w.handlowiec === handlowiec; };
      ["WNIOSKI_WSZYSTKIE", "WNIOSKI_2026", "WNIOSKI_2025", "WNIOSKI_BEZ_ROKU"].forEach(function (k) { DB[k] = DB[k].filter(moje); });
      DB.WNIOSKI = DB.WNIOSKI_2026;
      DB.KOLEJKA = DB.KOLEJKA.filter(function (k) { return k.handlowiec === handlowiec; });
      DB.PROPOZYCJE = DB.PROPOZYCJE.filter(function (p) { return p.zglosil === handlowiec; });
      var klienci = {};
      DB.KLIENCI.forEach(function (k) { klienci[k.id] = true; });
      DB.MAILE = DB.MAILE.filter(function (m) { return m.klient && klienci[m.klient]; });
      var wnioski = {};
      DB.WNIOSKI_WSZYSTKIE.forEach(function (w) { wnioski[w.id] = true; });
      DB.ZADANIA = DB.ZADANIA.filter(function (z) { return z.wniosek_id && wnioski[z.wniosek_id]; });
      DB.PODSUMOWANIA = [];
    },

    /* Liczba zatrudnionych klienta z ostatniego WIDOCZNEGO wniosku. Bez tego klient
       wspolny pokazywalby liczbe z wniosku u konkurencyjnej instytucji (D-150). */
    zatrudnienieZWidocznych: function (klienci, wnioski) {
      var ostatnio = {};
      wnioski.slice().sort(function (a, b) { return (a.dataWniosku || "") < (b.dataWniosku || "") ? -1 : 1; })
        .forEach(function (w) { if (w.zatrudnienie != null) ostatnio[w.klient] = w.zatrudnienie; });
      return klienci.map(function (k) {
        var kopia = {};
        for (var p in k) if (Object.prototype.hasOwnProperty.call(k, p)) kopia[p] = k[p];
        kopia.zatrudnienie = ostatnio[k.id] == null ? null : ostatnio[k.id];
        return kopia;
      });
    },

    /* Zadanie jest widoczne, gdy dotyczy wniosku w zakresie konta. Zadanie bez
       wniosku (ogolne) widza tylko konta LDIT bez ograniczen. */
    zadaniaWZakresie: function (zadania, wnioski, instytucje) {
      if (instytucje === null) return zadania;
      var widoczne = {};
      wnioski.forEach(function (w) { widoczne[w.id] = true; });
      return zadania.filter(function (z) { return z.wniosek_id && widoczne[z.wniosek_id]; });
    },

    /* Jeden klient moze byc u kilku instytucji (D-144), ale kazda ma widziec go
       wylacznie we wlasnym kontekscie. Pole "is" niesie instytucje pozyskujaca,
       wiec bez podmiany instytucja dowiaduje sie, u kogo jeszcze jest jej klient.
       Dlatego dla konta o ograniczonym zakresie podmieniamy je na instytucje
       z zakresu tego konta. */
    wlasnyKontekstKlienta: function (klienci, instytucje) {
      if (instytucje === null || !instytucje.length) return klienci;
      var puste = instytucje.map(function () { return "?"; }).join(", ");
      var mapa = {};
      global.Store.query(
        "SELECT klient_id, instytucja_id FROM klient_instytucja WHERE instytucja_id IN (" +
        puste + ")", instytucje
      ).forEach(function (r) {
        if (!mapa[r.klient_id]) mapa[r.klient_id] = r.instytucja_id;
      });
      return klienci.map(function (k) {
        var kopia = {};
        for (var p in k) if (Object.prototype.hasOwnProperty.call(k, p)) kopia[p] = k[p];
        kopia.is = mapa[k.id] || k.is;
        return kopia;
      });
    },

    /* Brak sesji: zero danych. Strona i tak pokaze komunikat o wygasnieciu. */
    wyczysc: function (DB) {
      ["INSTYTUCJE", "KLIENCI", "SZKOLENIA", "TERMINY", "FAKTURY", "WNIOSKI",
       "WNIOSKI_WSZYSTKIE", "WNIOSKI_2026", "WNIOSKI_2025", "WNIOSKI_BEZ_ROKU", "KOLEJKA", "PROPOZYCJE", "MAILE",
       "SZKOLENIOWCY", "PODSUMOWANIA",
       "UZYTKOWNICY", "ZGLOSZENIA", "AKTYWNOSC", "LOGOWANIA", "CELE", "ZADANIA", "LATA"
      ].forEach(function (k) { DB[k] = []; });
      return DB;
    },

    nalezy: nalezy
  };

  global.Zakres = Zakres;
})(window);
