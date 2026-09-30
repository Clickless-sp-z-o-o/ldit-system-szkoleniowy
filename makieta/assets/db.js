/* ============================================================================
   Adapter widoku: buduje window.DB w ksztalcie, ktorego oczekuja strony makiety,
   czytajac znormalizowane tabele z SQLite (assets/store.js).

   Pola wyliczane wniosku (koszt calkowity, przyznano, wklad wlasny) pochodza
   z widoku v_wniosek_finanse, czyli z SQL, a nie z JavaScriptu. Regula ma jedno
   miejsce. Szczegoly w makieta/db/views.sql.

   Po kazdej zmianie danych DB jest przebudowywane i na window leci "db:changed".
   ============================================================================ */

(function (global) {
  "use strict";

  var S = global.Store;
  if (!S) throw new Error("Brak window.Store. Dolacz assets/store.js przed db.js");

  var fmtPLN = function (n) { return n == null ? "" : Math.round(n).toLocaleString("pl-PL") + " zł"; };
  var fmtPLN2 = function (n) { return n == null ? "" : n.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " zł"; };
  var fmtNum = function (n) { return n == null ? "" : Math.round(n).toLocaleString("pl-PL"); };
  var fmtPct = function (n) { return n == null ? "" : n.toLocaleString("pl-PL", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + "%"; };
  var fmtDate = function (d) { return d; };

  /* Wskaznik dofinansowania pochodzi z konfigurowalnej tabeli progow (D-131),
     nie z liczby zaszytej w kodzie. */
  function wskaznik(wielkosc) {
    var r = S.one(
      "SELECT procent_dofinansowania AS p FROM progi_dofinansowania " +
      "WHERE wielkosc = ? AND (obowiazuje_do IS NULL OR obowiazuje_do = '') " +
      "ORDER BY obowiazuje_od DESC LIMIT 1", [wielkosc]);
    return r ? r.p / 100 : 0.7;
  }

  function indexBy(rows, key) {
    var m = {};
    for (var i = 0; i < rows.length; i++) m[rows[i][key]] = rows[i];
    return m;
  }

  /* ---------- Instytucje z aktualnymi warunkami prowizyjnymi (D-22) ---------- */
  function instytucjeView() {
    var warunki = S.query(
      "SELECT w.*, i.id AS inst FROM v_warunki_aktywne w JOIN instytucje i ON i.id = w.instytucja_id");
    /* Progi leza przy warunkach jako lista JSON (D-168) */
    var warunkiPoInst = indexBy(warunki, "instytucja_id");

    return S.get("instytucje").map(function (i) {
      var w = warunkiPoInst[i.id];
      /* Instytucja bez warunkow nie dostaje po cichu stawki domyslnej: brak = null */
      var prowizja = w
        ? { model: w.model, kumulacja: w.rodzaj_kumulacji, sposob: w.sposob_liczenia,
            stala: w.stawka_stala, progi: JSON.parse(w.progi || "[]"), od: w.obowiazuje_od }
        : null;
      return {
        id: i.id, nazwa: i.nazwa, skrot: i.skrot, miasto: i.siedziba_miejscowosc, nip: i.nip,
        kontakt: i.osoba_kontaktowa, mail: i.email, tel: i.telefon, opis: i.opis_dzialalnosci,
        www: i.strona_www,
        kontakty: [1, 2, 3].map(function (n) {
          var sfx = n === 1 ? "" : "_" + n;
          return { osoba: i["osoba_kontaktowa" + sfx], tel: i["telefon" + sfx], mail: i["email" + sfx] };
        }).filter(function (k) { return k.osoba || k.tel || k.mail; }),
        standard: i.standard_godzinowy, opiekun: i.opiekun_ldit,
        modelTerminow: i.model_terminow, prowizja: prowizja
      };
    });
  }

  /* ---------- Wnioski: liczby pochodza z widoku SQL ---------- */
  function wnioskiView(klById, instById, pupById, szkById, uczByWniosek) {
    var finanse = indexBy(S.query("SELECT * FROM v_wniosek_finanse"), "wniosek_id");

    return S.get("wnioski").map(function (w) {
      var f = finanse[w.id] || {};
      var kl = klById[w.klient_id] || {};
      var inst = instById[w.instytucja_id] || {};
      var szkG = szkById[w.szkolenie_glowne_id] || {};

      var ucz = (uczByWniosek[w.id] || []).map(function (u) {
        var s = szkById[u.szkolenie_id] || {};
        return { id: u.id, termin: u.termin_id, imie: u.imie_nazwisko, pesel: u.pesel, szkolenie: u.szkolenie_id,
                 szkNazwa: s.nazwa || "-", kwota: u.kwota, status: u.status_kwalifikacji,
                 powod: u.powod_niezakwalifikowania || "" };
      });

      /* Wszystkie kwoty wyliczane pochodza z widoku v_wniosek_finanse (D-152) */
      var pozytywna = w.status_decyzji === "Pozytywna";
      var koszt = f.koszt_calkowity_efektywny;
      var procent = f.procent_dofinansowania;

      return {
        id: w.id, nr: w.numer, rok: w.rok, etap: w.etap,
        klient: w.klient_id, klNazwa: kl.nazwa, nip: kl.nip,
        wielkosc: f.wielkosc || kl.wielkosc_przedsiebiorstwa,
        is: w.instytucja_id, isNazwa: inst.nazwa || "-",
        pup: w.pup_id, pupNazwa: (pupById[w.pup_id] || {}).nazwa,
        szkolenie: szkG.nazwa || "-", szkId: w.szkolenie_glowne_id,
        uczestnicy: ucz, osob: ucz.length,
        osobZakw: f.uczestnikow_zakwalifikowanych || 0,
        /* Do wartosci wchodza wylacznie zakwalifikowani (D-61, D-79) */
        wartosc: f.calkowita_wartosc_szkolenia || 0,
        wartoscWszystkich: ucz.reduce(function (s, u) { return s + (u.kwota || 0); }, 0),
        calkowita: f.calkowita_wartosc_szkolenia || 0,
        kosztCalkowity: pozytywna ? koszt : null,
        /* Przyznano i wklad: regula albo reczne nadpisanie (D-135, D-172) */
        przyznano: f.przyznano_efektywne,
        przyznanoRegula: w.przyznano_regula_aktywna !== 0,
        przyznanoZReguly: f.przyznano_wyliczone,
        wklad: f.wklad_wlasny_efektywny,
        wkladRegula: w.wklad_regula_aktywna !== 0,
        wkladZReguly: f.wklad_wlasny_wyliczony,
        procent: procent,
        wkladProc: Math.round(100 - procent),
        progId: f.prog_efektywny_id, progRegula: w.prog_regula_aktywna !== 0,
        zatrudnienie: w.liczba_zatrudnionych,
        kontakty: [1, 2].map(function (n) {
          var sfx = n === 1 ? "" : "_" + n;
          return { osoba: w["osoba_kontaktowa" + sfx], tel: w["telefon" + sfx], mail: w["email" + sfx] };
        }).filter(function (k) { return k.osoba || k.tel || k.mail; }),
        doplata: w.kwota_doplaty_dodatkowej || 0,
        /* Podstawa prowizji LDIT: z doplata albo bez, wg znacznika (D-64, D-174) */
        kosztZDoplata: pozytywna ? w.koszt_calkowity_z_doplata : null,
        kosztZDoplataZapisany: w.koszt_calkowity_z_doplata,
        podstawaProwizji: pozytywna ? f.podstawa_prowizji : null,
        doplataNaFakturze: w.doplata_na_fakturze_kfs !== 0,
        statusSkl: w.status_skladania, statusDec: w.status_decyzji, rozliczenie: w.status_finansowy,
        dataWniosku: w.data_wniosku, dataFormularza: w.data_wplyniecia_formularza,
        dataFaktury: w.data_wystawienia_faktury,
        /* Nadpisanie prowizji per wniosek: procent albo kwota (D-136), tylko admin (D-93) */
        prowizjaRegula: w.prowizja_regula_aktywna !== 0,
        prowizjaTyp: w.prowizja_typ_nadpisania,
        prowizjaProcent: w.prowizja_typ_nadpisania === "procent" ? w.prowizja_wartosc : null,
        prowizjaKwota: w.prowizja_typ_nadpisania === "kwota" ? w.prowizja_wartosc : null,
        opiekun: inst.opiekun_ldit || "-",
        fakturaId: w.faktura_id,
        handlowiec: w.handlowiec_id
      };
    });
  }

  function uzytkownicyView() {
    return S.query(
      "SELECT u.login, u.imie_nazwisko, u.dwa_fa, u.ostatnie_logowanie, u.zablokowane, " +
      "       r.nazwa AS rola_nazwa, u.rola_id, u.wszystkie_instytucje, " +
      "       COALESCE((SELECT GROUP_CONCAT(i.nazwa, ', ') FROM uzytkownik_instytucja ui " +
      "                 JOIN instytucje i ON i.id = ui.instytucja_id " +
      "                 WHERE ui.uzytkownik_id = u.id), '') AS instytucje " +
      "FROM uzytkownicy u JOIN role r ON r.id = u.rola_id"
    ).map(function (u) {
      return { login: u.login, imie: u.imie_nazwisko, rola: u.rola_nazwa, rolaId: u.rola_id,
               inst: u.wszystkie_instytucje ? "wszystkie" : u.instytucje,
               ost: u.ostatnie_logowanie, "2fa": !!u.dwa_fa, zablokowane: !!u.zablokowane };
    });
  }

  /* ---------- Zlozenie window.DB ---------- */
  var DB = {};

  function rebuild() {
    var pupById = indexBy(S.get("urzedy_pracy"), "id");
    var instById = indexBy(S.get("instytucje"), "id");
    var klById = indexBy(S.get("klienci"), "id");
    var szkById = indexBy(S.get("katalog_szkolen"), "id");

    var uczByWniosek = {};
    S.get("uczestnicy").forEach(function (u) {
      (uczByWniosek[u.wniosek_id] = uczByWniosek[u.wniosek_id] || []).push(u);
    });

    var wszystkie = wnioskiView(klById, instById, pupById, szkById, uczByWniosek);
    DB.WNIOSKI_WSZYSTKIE = wszystkie;
    DB.WNIOSKI_BEZ_ROKU = wszystkie.filter(function (w) { return !w.rok; });
    DB.WNIOSKI_2026 = wszystkie.filter(function (w) { return w.rok === "2026"; });
    DB.WNIOSKI_2025 = wszystkie.filter(function (w) { return w.rok === "2025"; });
    DB.WNIOSKI = DB.WNIOSKI_2026;
    DB.LATA = S.query("SELECT rok, opis FROM lata_zestawien ORDER BY rok");
    DB.PROGI_DOFINANSOWANIA = S.query("SELECT * FROM progi_dofinansowania ORDER BY wielkosc, obowiazuje_od");
    DB.SZKOLENIOWCY = S.get("szkoleniowcy").map(function (z) {
      return { id: z.id, is: z.instytucja_id, imie: z.imie, nazwisko: z.nazwisko, tel: z.telefon,
               mail: z.email, specjalizacja: z.specjalizacja, aktywny: !!z.aktywny };
    });
    /* Porownania rok do roku na dashboardzie: lata przeniesione z wnioskow,
       nieprzeniesione z podsumowan historycznych (D-175) */
    DB.PODSUMOWANIA = S.query("SELECT rok, instytucja_id AS isId, miara, wartosc, zrodlo FROM v_podsumowanie_roku");

    DB.INSTYTUCJE = instytucjeView();
    DB.PUPY = S.get("urzedy_pracy").map(function (p) {
      return { id: p.id, nazwa: p.nazwa, woj: p.wojewodztwo, powiat: p.powiat };
    });
    DB.SZKOLENIA = S.get("katalog_szkolen").map(function (s) {
      return { id: s.id, is: s.instytucja_id, nazwa: s.nazwa, godz: s.liczba_godzin,
               dni: s.liczba_dni, tryb: s.tryb, cena: s.cena };
    });
    /* Liczba zatrudnionych lezy we wniosku (D-169); przy kliencie pokazujemy te z ostatniego */
    var zatrudnieniOstatnio = {};
    wszystkie.slice().sort(function (a, b) { return (a.dataWniosku || "") < (b.dataWniosku || "") ? -1 : 1; })
      .forEach(function (w) { if (w.zatrudnienie != null) zatrudnieniOstatnio[w.klient] = w.zatrudnienie; });
    DB.KLIENCI = S.get("klienci").map(function (k) {
      return { id: k.id, nr: k.numer_klienta, nazwa: k.nazwa, nip: k.nip,
               wielkosc: k.wielkosc_przedsiebiorstwa,
               zatrudnienie: zatrudnieniOstatnio[k.id] == null ? null : zatrudnieniOstatnio[k.id],
               kontakty: [1, 2, 3].map(function (n) {
                 var sfx = n === 1 ? "" : "_" + n;
                 return { osoba: k["osoba_kontaktowa" + sfx], tel: k["telefon" + sfx], mail: k["email" + sfx] };
               }).filter(function (c) { return c.osoba || c.tel || c.mail; }),
               osoba: k.osoba_kontaktowa, tel: k.telefon, mail: k.email,
               is: k.instytucja_id, pup: k.pup_id, miasto: k.miasto,
               zainteresowany: !!k.zainteresowany_naborem };
    });
    DB.TERMINY = S.get("terminy").map(function (t) {
      return { id: t.id, is: t.instytucja_id, szk: t.szkolenie_id, nazwa: t.nazwa,
               od: t.data_od, do: t.data_do, miejsce: t.miejsce,
               status: t.status_realizacji, zapisani: t.zapisani, limit: t.limit_miejsc };
    });
    DB.NABORY = S.get("nabory").map(function (n) {
      var p = pupById[n.pup_id] || {};
      return { id: n.id, pupId: n.pup_id, pup: p.nazwa || "-", woj: p.wojewodztwo || "", rodzaj: n.rodzaj, status: n.status,
               od: n.data_od, do: n.data_do, prognoza: n.data_prognozowana, klientow: n.liczba_klientow };
    });
    var szczegolyFaktur = indexBy(S.query("SELECT * FROM v_faktura_szczegoly"), "faktura_id");
    DB.FAKTURY = S.get("faktury").map(function (f) {
      var i = instById[f.instytucja_id] || {};
      var sz = szczegolyFaktur[f.id] || {};
      return { id: f.id, nr: f.numer, is: i.nazwa || "-", isId: f.instytucja_id, kwota: f.kwota, vat: f.vat,
               wystawiona: f.data_wystawienia, termin: f.termin_platnosci, status: f.status,
               projekty: f.liczba_projektow,
               /* Korekta trafia do okresu swojej daty wystawienia (D-161) */
               rodzaj: f.rodzaj, korygowana: f.faktura_pierwotna_id, okres: sz.okres_rozliczeniowy,
               klient: sz.klient_id || null, szkolenia: sz.szkolenia || "", wnioskow: sz.liczba_wnioskow || 0 };
    });
    DB.KOLEJKA = S.get("formularze_oczekujace").map(function (k) {
      return { id: k.id, data: k.data, firma: k.firma, nip: k.nip, osob: k.osob, szkolenie: k.szkolenie,
               kontakt: k.kontakt, is: (instById[k.instytucja_id] || {}).nazwa || "-",
               isId: k.instytucja_id, status: k.status, wypelnil: k.wypelnil, handlowiec: k.handlowiec_id,
               miasto: k.miasto, pup: k.pup_id, wielkosc: k.wielkosc, email: k.email, telefon: k.telefon,
               uwagi: k.uwagi, zglosil: k.zglosil_id, rozpatrzyl: k.rozpatrzyl_id, rozpatrzono: k.rozpatrzono,
               powod: k.powod_odrzucenia, klientId: k.klient_id };
    });
    /* Zmiany danych zgloszone przez instytucje, czekajace na zatwierdzenie LDIT (D-224) */
    DB.PROPOZYCJE = S.get("propozycje_zmian").map(function (p) {
      return { id: p.id, isId: p.instytucja_id, is: (instById[p.instytucja_id] || {}).nazwa || "-",
               tabela: p.tabela, rekord: p.rekord_id, zmiany: JSON.parse(p.zmiany || "{}"),
               uzasadnienie: p.uzasadnienie, zglosil: p.zglosil_id, zgloszono: p.zgloszono, status: p.status,
               rozpatrzyl: p.rozpatrzyl_id, rozpatrzono: p.rozpatrzono, powod: p.powod_odrzucenia };
    });
    DB.MAILE = S.get("korespondencja").map(function (k) {
      return { klient: k.klient_id, isId: k.instytucja_id,
               data: k.data, kier: k.kierunek === "przychodzacy" ? "in" : "out",
               od: k.od_kogo, temat: k.temat, skrz: k.skrzynka, zal: k.zalaczniki };
    });

    DB.UZYTKOWNICY = uzytkownicyView();
    DB.MODULY = S.query("SELECT nazwa FROM moduly ORDER BY kolejnosc").map(function (m) { return m.nazwa; });
    DB.MODULY_ROWS = S.query("SELECT * FROM moduly ORDER BY kolejnosc");
    DB.ROLE = S.get("role");
    DB.AKTYWNOSC = S.get("rejestr_aktywnosci");
    DB.LOGOWANIA = S.get("logowania");
    DB.ZGLOSZENIA = S.get("zgloszenia");
    DB.SZABLONY = S.get("szablony_maili");
    DB.CELE = S.get("cele");
    DB.ZADANIA = S.get("zadania");

    DB.fmtPLN = fmtPLN; DB.fmtPLN2 = fmtPLN2; DB.fmtNum = fmtNum;
    DB.fmtPct = fmtPct; DB.fmtDate = fmtDate; DB.wskaznik = wskaznik;

    /* Separacja danych zaklada sie tutaj, zanim strona zobaczy cokolwiek.
       Szczegoly i uzasadnienie: assets/zakres.js */
    if (global.Zakres) global.Zakres.zastosuj(DB);
  }

  DB.przebuduj = rebuild;
  global.DB = DB;

  S.subscribe(function () {
    rebuild();
    if (global.dispatchEvent && global.CustomEvent) {
      global.dispatchEvent(new global.CustomEvent("db:changed"));
    }
  });
})(window);
