/* ============================================================
   Adapter widoku: buduje window.DB w dotychczasowym ksztalcie
   ze znormalizowanego Store (assets/store.js).

   Dzieki temu 17 stron makiety czyta dokladnie te same pola co
   wczesniej, a pod spodem dane leza w jednym, edytowalnym JSON.

   Pola wyliczane wniosku (przyznano, calkowita_wartosc, koszt_z_doplata,
   wklad_procent) sa liczone tutaj z danych wejsciowych, zgodnie z zasada
   "pole wyliczane = regula + przechowana wartosc" (docs/03).

   Wystawia: window.DB (tabele + formatery), window.liczProwizje,
             window.liczOkres. Po zmianie danych emituje zdarzenie
             "db:changed" na window.
   ============================================================ */

(function (global) {
  "use strict";

  var S = global.Store;
  if (!S) throw new Error("Brak window.Store. Dolacz assets/store.js przed db.js");

  /* ---------- Formatowanie (identyczne jak w wersji poprzedniej) ---------- */
  var fmtPLN = function (n) { return n == null ? "" : Math.round(n).toLocaleString("pl-PL") + " zł"; };
  var fmtPLN2 = function (n) { return n == null ? "" : n.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " zł"; };
  var fmtNum = function (n) { return n == null ? "" : Math.round(n).toLocaleString("pl-PL"); };
  var fmtPct = function (n) { return n == null ? "" : n.toLocaleString("pl-PL", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + "%"; };
  var fmtDate = function (d) { return d; };
  function wskaznik(w) { return w === "mikro" ? 0.9 : 0.7; }

  /* ---------- Pomocnicze indeksy ---------- */
  function indexBy(rows, key) {
    var m = {};
    for (var i = 0; i < rows.length; i++) m[rows[i][key]] = rows[i];
    return m;
  }

  /* ---------- Instytucje: laczenie z aktywnymi warunkami prowizyjnymi ---------- */
  function aktywneWarunki(instId) {
    var wp = S.get("warunki_prowizyjne").filter(function (w) {
      return w.instytucja_id === instId && (w.obowiazuje_do == null || w.obowiazuje_do === "");
    });
    return wp.length ? wp[wp.length - 1] : null;
  }
  function instytucjeView() {
    return S.get("instytucje").map(function (i) {
      var w = aktywneWarunki(i.id);
      var prowizja = w
        ? { model: w.model, kumulacja: w.rodzaj_kumulacji, sposob: w.sposob_liczenia, stala: w.stawka_stala,
            progi: (w.progi || []).map(function (p) { return { od: p.od, st: p.stawka }; }) }
        : { model: "D", kumulacja: "brak", sposob: "stala", stala: 20, progi: [] };
      return {
        id: i.id, nazwa: i.nazwa, skrot: i.skrot, miasto: i.siedziba_miejscowosc, nip: i.nip,
        kontakt: i.osoba_kontaktowa, mail: i.email, tel: i.telefon, opis: i.opis_dzialalnosci,
        standard: i.standard_godzinowy, opiekun: i.opiekun_ldit, prowizja: prowizja
      };
    });
  }

  function szkoleniaView() {
    return S.get("katalog_szkolen").map(function (s) {
      return { id: s.id, is: s.instytucja_id, nazwa: s.nazwa, godz: s.liczba_godzin, dni: s.liczba_dni, tryb: s.tryb, cena: s.cena };
    });
  }

  function klienciView() {
    return S.get("klienci").map(function (k) {
      return {
        id: k.id, nr: k.numer_klienta, nazwa: k.nazwa, nip: k.nip,
        wielkosc: k.wielkosc_przedsiebiorstwa, zatrudnienie: k.liczba_zatrudnionych,
        osoba: k.osoba_kontaktowa, tel: k.telefon, mail: k.email,
        is: k.instytucja_id, pup: k.pup_id, miasto: k.miasto
      };
    });
  }

  function terminyView() {
    return S.get("terminy").map(function (t) {
      return { id: t.id, is: t.instytucja_id, szk: t.szkolenie_id, nazwa: t.nazwa, od: t.data_od, do: t.data_do,
               miejsce: t.miejsce, status: t.status_realizacji, zapisani: t.zapisani, limit: t.limit };
    });
  }

  function naboryView(pupById) {
    return S.get("nabory").map(function (n) {
      var p = pupById[n.pup_id] || {};
      return { pup: p.nazwa || "-", woj: p.wojewodztwo || "", rodzaj: n.rodzaj, status: n.status,
               od: n.data_od, do: n.data_do, prognoza: n.data_prognozowana, klientow: n.liczba_klientow };
    });
  }

  function fakturyView(instById) {
    return S.get("faktury").map(function (f) {
      var i = instById[f.instytucja_id] || {};
      return { nr: f.numer, is: i.nazwa || "-", isId: f.instytucja_id, kwota: f.kwota, vat: f.vat,
               wystawiona: f.data_wystawienia, termin: f.termin_platnosci, status: f.status, projekty: f.liczba_projektow };
    });
  }

  function uzytkownicyView() {
    return S.get("uzytkownicy").map(function (u) {
      return { login: u.login, imie: u.imie_nazwisko, rola: u.rola, inst: u.instytucje, ost: u.ostatnie_logowanie, "2fa": u.dwa_fa };
    });
  }

  /* ---------- Wnioski: pola wyliczane odtwarzane z danych wejsciowych ---------- */
  function wnioskiView(klById, instById, pupById, szkById, uczByWniosek) {
    return S.get("wnioski").map(function (w) {
      var kl = klById[w.klient_id] || {};
      var inst = instById[w.instytucja_id] || {};
      var szkG = szkById[w.szkolenie_glowne_id] || {};
      var ucz = (uczByWniosek[w.id] || []).map(function (u) {
        var s = szkById[u.szkolenie_id] || {};
        return { imie: u.imie_nazwisko, pesel: u.pesel, szkolenie: u.szkolenie_id, szkNazwa: s.nazwa || "-",
                 kwota: u.kwota, status: u.status_kwalifikacji, powod: u.powod_niezakwalifikowania || "" };
      });
      var zakw = ucz.filter(function (u) { return u.status === "zakwalifikowany"; });
      var wartosc = ucz.reduce(function (s, u) { return s + (u.kwota || 0); }, 0);
      var calkowita = zakw.reduce(function (s, u) { return s + (u.kwota || 0); }, 0);
      var wielkosc = kl.wielkosc_przedsiebiorstwa;
      var wsk = wskaznik(wielkosc);
      var pozytywna = w.status_decyzji === "Pozytywna";
      var kosztCalk = w.koszt_calkowity;
      var przyznano = pozytywna && kosztCalk != null ? Math.round(kosztCalk * wsk * 100) / 100 : null;
      var doplata = w.kwota_doplaty_dodatkowej || 0;
      return {
        id: w.id, nr: w.numer, rok: w.rok,
        klient: w.klient_id, klNazwa: kl.nazwa, nip: kl.nip, wielkosc: wielkosc,
        is: w.instytucja_id, isNazwa: inst.nazwa || "-",
        pup: w.pup_id, pupNazwa: (pupById[w.pup_id] || {}).nazwa,
        szkolenie: szkG.nazwa || "-", szkId: w.szkolenie_glowne_id,
        uczestnicy: ucz, osob: ucz.length, osobZakw: zakw.length,
        wartosc: wartosc, calkowita: calkowita,
        kosztCalkowity: pozytywna ? kosztCalk : null,
        przyznano: przyznano,
        wkladProc: Math.round((1 - wsk) * 100),
        doplata: doplata,
        kosztZDoplata: pozytywna && kosztCalk != null ? kosztCalk + doplata : null,
        statusSkl: w.status_skladania, statusDec: w.status_decyzji, rozliczenie: w.status_finansowy,
        dataWniosku: w.data_wniosku, dataFormularza: w.data_wplyniecia_formularza, dataFaktury: w.data_wystawienia_faktury,
        /* Nadpisanie prowizji per wniosek (D-93 zaktualizowane, tylko admin z karty wniosku).
           regula aktywna = licz wg warunkow IS; wylaczona = uzyj stawki indywidualnej. */
        prowizjaProcent: w.prowizja_procent != null ? w.prowizja_procent : null,
        prowizjaRegula: w.prowizja_regula_aktywna !== false,
        opiekun: inst.opiekun_ldit || "-"
      };
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
    var w2026 = wszystkie.filter(function (w) { return w.rok === "2026"; });
    var w2025 = wszystkie.filter(function (w) { return w.rok === "2025"; });

    DB.INSTYTUCJE = instytucjeView();
    DB.PUPY = S.get("urzedy_pracy").map(function (p) { return { id: p.id, nazwa: p.nazwa, woj: p.wojewodztwo, powiat: p.powiat }; });
    DB.SZKOLENIA = szkoleniaView();
    DB.KLIENCI = klienciView();
    DB.WNIOSKI = w2026;
    DB.WNIOSKI_2026 = w2026;
    DB.WNIOSKI_2025 = w2025;
    DB.NABORY = naboryView(pupById);
    DB.UZYTKOWNICY = uzytkownicyView();
    DB.MODULY = S.get("moduly");
    DB.AKTYWNOSC = S.get("rejestr_aktywnosci");
    DB.LOGOWANIA = S.get("logowania");
    DB.ZGLOSZENIA = S.get("zgloszenia");
    DB.SZABLONY = S.get("szablony_maili");
    DB.FAKTURY = fakturyView(instById);
    DB.TERMINY = terminyView();
    DB.KOLEJKA = S.get("kolejka_zgloszen");
    DB.MAILE = S.get("korespondencja");
    DB.CELE = S.get("cele");

    DB.fmtPLN = fmtPLN; DB.fmtPLN2 = fmtPLN2; DB.fmtNum = fmtNum;
    DB.fmtPct = fmtPct; DB.fmtDate = fmtDate; DB.wskaznik = wskaznik;
  }

  rebuild();
  global.DB = DB;

  /* Po kazdej zmianie danych przebuduj DB i powiadom strony */
  S.subscribe(function () {
    rebuild();
    if (global.dispatchEvent && global.CustomEvent) {
      global.dispatchEvent(new global.CustomEvent("db:changed"));
    }
  });

  /* ---------- Silnik prowizji (docs/07-silnik-prowizji.md) ---------- */
  global.liczProwizje = function (warunki, obrotPrzed, kwotaFaktury) {
    var w = warunki;
    if (w.sposob === "stala" || !w.progi || !w.progi.length) {
      var st0 = w.stala != null ? w.stala : 20;
      return { kwota: kwotaFaktury * st0 / 100, stawka: st0, rozbicie: [{ kwota: kwotaFaktury, st: st0 }] };
    }
    var progi = w.progi.slice().sort(function (a, b) { return a.od - b.od; });
    function stawkaDla(suma) {
      var s = progi[0].st;
      for (var i = 0; i < progi.length; i++) if (suma >= progi[i].od) s = progi[i].st;
      return s;
    }
    if (w.sposob === "od_calosci") {
      var st = stawkaDla(obrotPrzed + kwotaFaktury);
      return { kwota: kwotaFaktury * st / 100, stawka: st, rozbicie: [{ kwota: kwotaFaktury, st: st }] };
    }
    var poz = obrotPrzed, zostalo = kwotaFaktury, suma = 0, rozb = [];
    while (zostalo > 0.005) {
      var stp = stawkaDla(poz);
      var nast = progi.filter(function (p) { return p.od > poz; })[0];
      var doGranicy = nast ? Math.min(zostalo, nast.od - poz) : zostalo;
      suma += doGranicy * stp / 100;
      rozb.push({ kwota: doGranicy, st: stp });
      poz += doGranicy; zostalo -= doGranicy;
    }
    return { kwota: suma, stawka: kwotaFaktury ? (suma / kwotaFaktury * 100) : 0, rozbicie: rozb };
  };

  /* Rozliczenie calego okresu (model A wymaga tej funkcji, patrz docs/07) */
  global.liczOkres = function (warunki, faktury) {
    var w = warunki;
    var obrot = faktury.reduce(function (s, f) { return s + (f.kwota || 0); }, 0);
    if (w.sposob === "stala" || !w.progi || !w.progi.length) {
      var stC = w.stala != null ? w.stala : 20;
      var pozC = faktury.map(function (f) { return { kwota: f.kwota, stawka: stC, prowizja: f.kwota * stC / 100, rozbicie: [{ kwota: f.kwota, st: stC }] }; });
      return { pozycje: pozC, suma: pozC.reduce(function (s, p) { return s + p.prowizja; }, 0), obrot: obrot, stawkaEfektywna: stC };
    }
    var progi = w.progi.slice().sort(function (a, b) { return a.od - b.od; });
    function stawkaDla(suma) {
      var s = progi[0].st;
      for (var i = 0; i < progi.length; i++) if (suma >= progi[i].od) s = progi[i].st;
      return s;
    }
    if (w.sposob === "od_calosci") {
      var stA = stawkaDla(obrot);
      var pozA = faktury.map(function (f) { return { kwota: f.kwota, stawka: stA, prowizja: f.kwota * stA / 100, rozbicie: [{ kwota: f.kwota, st: stA }] }; });
      return { pozycje: pozA, suma: pozA.reduce(function (s, p) { return s + p.prowizja; }, 0), obrot: obrot, stawkaEfektywna: stA };
    }
    var narastajaco = 0;
    var poz = faktury.map(function (f) {
      var r = global.liczProwizje(w, narastajaco, f.kwota || 0);
      narastajaco += (f.kwota || 0);
      return { kwota: f.kwota, stawka: r.stawka, prowizja: r.kwota, rozbicie: r.rozbicie };
    });
    var suma = poz.reduce(function (s, p) { return s + p.prowizja; }, 0);
    return { pozycje: poz, suma: suma, obrot: obrot, stawkaEfektywna: obrot ? suma / obrot * 100 : 0 };
  };

})(window);
