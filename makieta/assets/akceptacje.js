/* ============================================================================
   Akceptacje LDIT: formularze zgloszeniowe (D-105, D-223) i zmiany danych
   zgloszone przez instytucje (D-224).

   Instytucja i jej handlowiec niczego nie zmieniaja od razu. Zglaszaja klienta
   formularzem albo zmiane danych (swoich i swoich klientow), a pracownik LDIT
   lub administrator zatwierdza albo odrzuca z powodem. Uprawnienia sprawdza
   straznik zapisow (assets/straznik.js), ten modul tylko sklada operacje.
   Kazda operacja trafia do rejestru aktywnosci.

   kto = { czas: "RRRR-MM-DD GG:MM", uzytkownik: id konta, imie: nazwa do rejestru }

   API:  Akceptacje.zglosFormularz(dane, kto)            nowy formularz, zwraca wiersz
         Akceptacje.zaakceptujFormularz(id, kto, poprawki, opcje)  klient w bazie, zwraca id klienta;
                                                opcje.polaczZInnaInstytucja potwierdza klienta wspolnego
         Akceptacje.klientInnejInstytucji(klientId, instytucjaId)  czy klient jest juz u innej instytucji
         Akceptacje.odrzucFormularz(id, powod, kto)
         Akceptacje.klientWZakresieZNip(nip)             id klienta o tym NIP w zakresie konta albo null
         Akceptacje.zglosZmiane(tabela, id, instytucja, nowe, uzasadnienie, kto)
         Akceptacje.zatwierdzZmiane(id, kto), odrzucZmiane(id, powod, kto)
         Akceptacje.POLA                                 pola zglaszane, z etykietami
   ============================================================================ */

(function (global) {
  "use strict";

  var S = global.Store;

  var POLA = {
    instytucje: { nazwa: "Nazwa", skrot: "Skrót", siedziba_miejscowosc: "Miejscowość siedziby", nip: "NIP",
                  strona_www: "Strona www", osoba_kontaktowa: "Osoba kontaktowa", email: "E-mail", telefon: "Telefon",
                  opis_dzialalnosci: "Opis działalności", standard_godzinowy: "Standard godzinowy" },
    klienci: { nazwa: "Nazwa", nip: "NIP", wielkosc_przedsiebiorstwa: "Wielkość", osoba_kontaktowa: "Osoba kontaktowa",
               telefon: "Telefon", email: "E-mail", miasto: "Miasto", adres_siedziby: "Adres siedziby", pup_id: "Urząd pracy" }
  };

  function AkceptacjeError(kod, komunikat) { this.name = "AkceptacjeError"; this.kod = kod; this.message = komunikat; }
  AkceptacjeError.prototype = Object.create(Error.prototype);
  AkceptacjeError.prototype.constructor = AkceptacjeError;
  function blad(kod, tresc) { throw new AkceptacjeError(kod, tresc); }

  function doRejestru(kto, typ, obiekt, pole, przed, po) {
    S.insert("rejestr_aktywnosci", { czas: kto.czas, kto: kto.imie, typ: typ, obiekt: obiekt, pole: pole,
                                     przed: przed == null || przed === "" ? "brak" : String(przed),
                                     po: po == null || po === "" ? "brak" : String(po) }, "AKT-");
  }

  function oczekujacy(tabela, id) {
    var r = S.find(tabela, id);
    if (!r) blad("nie_ma", "Nie znaleziono zgłoszenia " + id + ".");
    if (r.status !== "oczekuje") blad("rozpatrzone", "Zgłoszenie " + id + " jest już rozpatrzone.");
    return r;
  }

  /* ------------------------------ formularze ------------------------------ */

  function zglosFormularz(dane, kto) {
    if (!dane.firma || !String(dane.firma).trim()) blad("brak_firmy", "Podaj nazwę firmy.");
    if (!dane.instytucja_id) blad("brak_instytucji", "Formularz musi wskazywać instytucję.");
    var handlowiec = global.Auth.handlowiec();
    var wiersz = {};
    Object.keys(dane).forEach(function (k) { wiersz[k] = dane[k] === "" ? null : dane[k]; });
    wiersz.firma = String(dane.firma).trim();
    wiersz.data = kto.czas.slice(0, 10);
    wiersz.wypelnil = handlowiec ? "handlowiec" : "instytucja";
    wiersz.handlowiec_id = handlowiec || null;
    wiersz.zglosil_id = kto.uzytkownik;
    wiersz.status = "oczekuje";
    var nowy = S.insert("formularze_oczekujace", wiersz, "FO-");
    doRejestru(kto, "Zgłoszenie formularza", nowy.id, "Firma", null, wiersz.firma);
    return nowy;
  }

  function klientZNip(nip) {
    var czysty = String(nip || "").replace(/\D/g, "");
    if (!czysty) return null;
    return S.query("SELECT id, nazwa, nip FROM klienci").filter(function (k) {
      return String(k.nip || "").replace(/\D/g, "") === czysty;
    })[0] || null;
  }

  /* Klient o tym samym NIP juz jest: dopisujemy go do instytucji (D-144). Konto z ograniczonym
     zakresem nie widzi cudzego klienta, wiec wtedy powstaje nowy rekord w jego zakresie. */
  function klientDoPowiazania(f) {
    var istniejacy = klientZNip(f.nip);
    if (!istniejacy) return null;
    var widoczni = global.Auth.klienciWZakresie();
    return widoczni === null || widoczni.indexOf(istniejacy.id) >= 0 ? istniejacy.id : null;
  }

  /* Klient wspolny (D-144): po polaczeniu instytucja zobaczy dane wpisane przez inna
     instytucje, dlatego zatwierdzajacy musi to swiadomie potwierdzic (D-150) */
  function klientInnejInstytucji(klientId, instytucjaId) {
    var k = S.find("klienci", klientId);
    if (k && k.instytucja_id && k.instytucja_id !== instytucjaId) return true;
    return S.query("SELECT 1 AS x FROM klient_instytucja WHERE klient_id = ? AND instytucja_id <> ?",
                   [klientId, instytucjaId]).length > 0;
  }

  function nowyKlient(f, kto) {
    var maxNr = S.one("SELECT COALESCE(MAX(numer_klienta), 0) AS n FROM klienci").n;
    return S.insert("klienci", {
      numer_klienta: maxNr + 1, nazwa: f.firma, nip: f.nip, wielkosc_przedsiebiorstwa: f.wielkosc,
      osoba_kontaktowa: f.kontakt, telefon: f.telefon, email: f.email, miasto: f.miasto,
      instytucja_id: f.instytucja_id, pup_id: f.pup_id, zainteresowany_naborem: 1, utworzono: kto.czas.slice(0, 10)
    }, "KL-").id;
  }

  /* poprawki: pola formularza poprawione przez zatwierdzajacego przed akceptacja (np. NIP
     z bledna cyfra kontrolna). Zapisuja sie w formularzu, zeby bylo widac, co zmieniono. */
  function zaakceptujFormularz(id, kto, poprawki, opcje) {
    var f = oczekujacy("formularze_oczekujace", id);
    var zmienione = Object.keys(poprawki || {}).filter(function (k) { return String(poprawki[k]) !== String(f[k] == null ? "" : f[k]); });
    if (zmienione.length) {
      var patch = {};
      zmienione.forEach(function (k) { patch[k] = poprawki[k]; });
      S.update("formularze_oczekujace", id, patch);
      zmienione.forEach(function (k) { doRejestru(kto, "Poprawka formularza", id, k, f[k], poprawki[k]); });
      f = S.find("formularze_oczekujace", id);
    }
    var wspolny = klientDoPowiazania(f);
    if (wspolny && klientInnejInstytucji(wspolny, f.instytucja_id) && !(opcje && opcje.polaczZInnaInstytucja)) {
      blad("klient_wspolny", "Klient o tym NIP jest już u innej instytucji. Po połączeniu ta instytucja zobaczy jego dane. Potwierdź połączenie albo odrzuć formularz.");
    }
    var klientId = wspolny || nowyKlient(f, kto);
    var jest = S.query("SELECT 1 AS x FROM klient_instytucja WHERE klient_id = ? AND instytucja_id = ?", [klientId, f.instytucja_id]);
    if (!jest.length && f.instytucja_id) {
      S.insert("klient_instytucja", { klient_id: klientId, instytucja_id: f.instytucja_id, handlowiec_id: f.handlowiec_id || null });
    }
    S.update("formularze_oczekujace", id, { status: "zaakceptowany", rozpatrzyl_id: kto.uzytkownik,
                                            rozpatrzono: kto.czas, klient_id: klientId });
    doRejestru(kto, "Akceptacja formularza", id, "Status", "oczekuje", "zaakceptowany, klient " + klientId);
    return klientId;
  }

  function odrzucFormularz(id, powod, kto) {
    if (!powod || !String(powod).trim()) blad("brak_powodu", "Podaj powód odrzucenia, trafi do instytucji.");
    oczekujacy("formularze_oczekujace", id);
    S.update("formularze_oczekujace", id, { status: "odrzucony", rozpatrzyl_id: kto.uzytkownik,
                                            rozpatrzono: kto.czas, powod_odrzucenia: String(powod).trim() });
    doRejestru(kto, "Odrzucenie formularza", id, "Status", "oczekuje", "odrzucony: " + powod);
  }

  /* ------------------------------ zmiany danych ------------------------------ */

  /* nowe: {kolumna: wartosc}. Do propozycji trafiaja tylko pola, ktore naprawde sie zmieniaja. */
  function zglosZmiane(tabela, rekordId, instytucjaId, nowe, uzasadnienie, kto) {
    if (!POLA[tabela]) blad("zla_tabela", "Zmiany można zgłaszać dla instytucji i klientów.");
    var obecny = S.find(tabela, rekordId);
    if (!obecny) blad("nie_ma", "Nie znaleziono rekordu " + rekordId + ".");
    var zmiany = {};
    Object.keys(nowe).forEach(function (k) {
      var po = nowe[k] === "" ? null : nowe[k];
      if (String(obecny[k] == null ? "" : obecny[k]) !== String(po == null ? "" : po)) zmiany[k] = { przed: obecny[k], po: po };
    });
    if (!Object.keys(zmiany).length) blad("brak_zmian", "Nic się nie zmieniło, nie ma czego zgłaszać.");
    /* Nowe wartosci sprawdzamy od razu, a nie dopiero przy zatwierdzeniu (fail fast) */
    var patch = {};
    Object.keys(zmiany).forEach(function (k) { patch[k] = zmiany[k].po; });
    var bledy = global.Walidacja.bledy(tabela, patch);
    if (bledy.length) blad("walidacja", bledy.map(function (b) { return b.pole + ": " + b.komunikat; }).join("; "));
    var nowy = S.insert("propozycje_zmian", {
      instytucja_id: instytucjaId, tabela: tabela, rekord_id: rekordId, zmiany: JSON.stringify(zmiany),
      uzasadnienie: uzasadnienie || null, zglosil_id: kto.uzytkownik, zgloszono: kto.czas, status: "oczekuje"
    }, "PZ-");
    doRejestru(kto, "Zgłoszenie zmiany danych", rekordId, Object.keys(zmiany).join(", "), null, "do akceptacji " + nowy.id);
    return nowy;
  }

  function zatwierdzZmiane(id, kto) {
    var p = oczekujacy("propozycje_zmian", id);
    var zmiany = JSON.parse(p.zmiany);
    var patch = {};
    Object.keys(zmiany).forEach(function (k) { patch[k] = zmiany[k].po; });
    S.update(p.tabela, p.rekord_id, patch);
    S.update("propozycje_zmian", id, { status: "zatwierdzona", rozpatrzyl_id: kto.uzytkownik, rozpatrzono: kto.czas });
    Object.keys(zmiany).forEach(function (k) {
      doRejestru(kto, "Zatwierdzenie zmiany danych", p.rekord_id, (POLA[p.tabela][k] || k), zmiany[k].przed, zmiany[k].po);
    });
  }

  function odrzucZmiane(id, powod, kto) {
    if (!powod || !String(powod).trim()) blad("brak_powodu", "Podaj powód odrzucenia, trafi do instytucji.");
    oczekujacy("propozycje_zmian", id);
    S.update("propozycje_zmian", id, { status: "odrzucona", rozpatrzyl_id: kto.uzytkownik, rozpatrzono: kto.czas,
                                       powod_odrzucenia: String(powod).trim() });
    doRejestru(kto, "Odrzucenie zmiany danych", id, "Status", "oczekuje", "odrzucona: " + powod);
  }

  /* Kto wykonuje operacje, z zalogowanej sesji */
  function ktoTeraz() {
    var d = new Date(), p = function (n) { return String(n).padStart(2, "0"); };
    var s = global.Auth.sesja();
    return { czas: d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes()),
             uzytkownik: s.uzytkownik_id, imie: s.imie };
  }

  global.Akceptacje = {
    POLA: POLA, AkceptacjeError: AkceptacjeError, ktoTeraz: ktoTeraz,
    /* Duplikat NIP tylko w zakresie konta: nie zdradza klientow innych instytucji */
    klientWZakresieZNip: function (nip) { return klientDoPowiazania({ nip: nip }); },
    klientInnejInstytucji: klientInnejInstytucji,
    zglosFormularz: zglosFormularz, zaakceptujFormularz: zaakceptujFormularz, odrzucFormularz: odrzucFormularz,
    zglosZmiane: zglosZmiane, zatwierdzZmiane: zatwierdzZmiane, odrzucZmiane: odrzucZmiane
  };
})(window);
