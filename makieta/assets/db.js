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
    var progi = S.query("SELECT * FROM progi_prowizyjne ORDER BY od_kwoty");
    var progiPoWarunku = {};
    progi.forEach(function (p) {
      (progiPoWarunku[p.warunki_id] = progiPoWarunku[p.warunki_id] || [])
        .push({ od: p.od_kwoty, st: p.stawka });
    });
    var warunkiPoInst = indexBy(warunki, "instytucja_id");

    return S.get("instytucje").map(function (i) {
      var w = warunkiPoInst[i.id];
      var prowizja = w
        ? { model: w.model, kumulacja: w.rodzaj_kumulacji, sposob: w.sposob_liczenia,
            stala: w.stawka_stala, progi: progiPoWarunku[w.id] || [] }
        : { model: "D", kumulacja: "brak", sposob: "stala", stala: 20, progi: [] };
      return {
        id: i.id, nazwa: i.nazwa, skrot: i.skrot, miasto: i.siedziba_miejscowosc, nip: i.nip,
        kontakt: i.osoba_kontaktowa, mail: i.email, tel: i.telefon, opis: i.opis_dzialalnosci,
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
        return { imie: u.imie_nazwisko, pesel: u.pesel, szkolenie: u.szkolenie_id,
                 szkNazwa: s.nazwa || "-", kwota: u.kwota, status: u.status_kwalifikacji,
                 powod: u.powod_niezakwalifikowania || "" };
      });

      var pozytywna = w.status_decyzji === "Pozytywna";
      var koszt = f.koszt_calkowity_efektywny;
      var procent = f.procent_dofinansowania != null ? f.procent_dofinansowania : 70;
      var przyznaneZReguly = pozytywna && koszt != null
        ? Math.round(koszt * procent) / 100 : null;

      return {
        id: w.id, nr: w.numer, rok: w.rok, etap: w.etap,
        klient: w.klient_id, klNazwa: kl.nazwa, nip: kl.nip,
        wielkosc: f.wielkosc || kl.wielkosc_przedsiebiorstwa,
        is: w.instytucja_id, isNazwa: inst.nazwa || "-",
        pup: w.pup_id, pupNazwa: (pupById[w.pup_id] || {}).nazwa,
        szkolenie: szkG.nazwa || "-", szkId: w.szkolenie_glowne_id,
        uczestnicy: ucz, osob: ucz.length,
        osobZakw: f.uczestnikow_zakwalifikowanych || 0,
        wartosc: ucz.reduce(function (s, u) { return s + (u.kwota || 0); }, 0),
        calkowita: f.calkowita_wartosc_szkolenia || 0,
        kosztCalkowity: pozytywna ? koszt : null,
        /* Przyznano: regula albo reczne nadpisanie (D-135) */
        przyznano: w.przyznano_regula_aktywna ? przyznaneZReguly : w.przyznano,
        przyznanoRegula: w.przyznano_regula_aktywna !== 0,
        przyznanoZReguly: przyznaneZReguly,
        wkladProc: Math.round(100 - procent),
        doplata: w.kwota_doplaty_dodatkowej || 0,
        /* Podstawa prowizji LDIT: koszt calkowity z doplata (D-64) */
        kosztZDoplata: pozytywna ? w.koszt_calkowity_z_doplata : null,
        statusSkl: w.status_skladania, statusDec: w.status_decyzji, rozliczenie: w.status_finansowy,
        dataWniosku: w.data_wniosku, dataFormularza: w.data_wplyniecia_formularza,
        dataFaktury: w.data_wystawienia_faktury,
        /* Nadpisanie prowizji per wniosek: procent albo kwota (D-136), tylko admin (D-93) */
        prowizjaRegula: w.prowizja_regula_aktywna !== 0,
        prowizjaTyp: w.prowizja_typ_nadpisania,
        prowizjaProcent: w.prowizja_typ_nadpisania === "procent" ? w.prowizja_wartosc : null,
        prowizjaKwota: w.prowizja_typ_nadpisania === "kwota" ? w.prowizja_wartosc : null,
        opiekun: inst.opiekun_ldit || "-"
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
    DB.WNIOSKI_2026 = wszystkie.filter(function (w) { return w.rok === "2026"; });
    DB.WNIOSKI_2025 = wszystkie.filter(function (w) { return w.rok === "2025"; });
    DB.WNIOSKI = DB.WNIOSKI_2026;

    DB.INSTYTUCJE = instytucjeView();
    DB.PUPY = S.get("urzedy_pracy").map(function (p) {
      return { id: p.id, nazwa: p.nazwa, woj: p.wojewodztwo, powiat: p.powiat };
    });
    DB.SZKOLENIA = S.get("katalog_szkolen").map(function (s) {
      return { id: s.id, is: s.instytucja_id, nazwa: s.nazwa, godz: s.liczba_godzin,
               dni: s.liczba_dni, tryb: s.tryb, cena: s.cena };
    });
    DB.KLIENCI = S.get("klienci").map(function (k) {
      return { id: k.id, nr: k.numer_klienta, nazwa: k.nazwa, nip: k.nip,
               wielkosc: k.wielkosc_przedsiebiorstwa, zatrudnienie: k.liczba_zatrudnionych,
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
      return { pup: p.nazwa || "-", woj: p.wojewodztwo || "", rodzaj: n.rodzaj, status: n.status,
               od: n.data_od, do: n.data_do, prognoza: n.data_prognozowana, klientow: n.liczba_klientow };
    });
    DB.FAKTURY = S.get("faktury").map(function (f) {
      var i = instById[f.instytucja_id] || {};
      return { nr: f.numer, is: i.nazwa || "-", isId: f.instytucja_id, kwota: f.kwota, vat: f.vat,
               wystawiona: f.data_wystawienia, termin: f.termin_platnosci, status: f.status,
               projekty: f.liczba_projektow };
    });
    DB.KOLEJKA = S.get("formularze_oczekujace").map(function (k) {
      return { data: k.data, firma: k.firma, nip: k.nip, osob: k.osob, szkolenie: k.szkolenie,
               kontakt: k.kontakt, is: (instById[k.instytucja_id] || {}).nazwa || "-" };
    });
    DB.MAILE = S.get("korespondencja").map(function (k) {
      return { data: k.data, kier: k.kierunek === "przychodzacy" ? "in" : "out",
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
