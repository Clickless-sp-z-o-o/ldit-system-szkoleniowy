/* ============================================================
   Dane demonstracyjne makiety KFS / LDIT
   Generowane deterministycznie, zeby widoki byly stabilne
   miedzy odswiezeniami. Wolumeny odpowiadaja realnym
   (docs/01-kontekst-i-cel.md, sekcja Skala).
   ============================================================ */

(function (global) {
  "use strict";

  /* Deterministyczny generator pseudolosowy */
  let _s = 20260825;
  function rnd() { _s = (_s * 1103515245 + 12345) & 0x7fffffff; return _s / 0x7fffffff; }
  function pick(a) { return a[Math.floor(rnd() * a.length)]; }
  function int(a, b) { return a + Math.floor(rnd() * (b - a + 1)); }
  function reset() { _s = 20260825; }

  /* ---------- Formatowanie ---------- */
  const fmtPLN = (n) => (n == null ? "" : Math.round(n).toLocaleString("pl-PL") + " zł");
  const fmtPLN2 = (n) => (n == null ? "" : n.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " zł");
  const fmtNum = (n) => (n == null ? "" : Math.round(n).toLocaleString("pl-PL"));
  const fmtPct = (n) => (n == null ? "" : n.toLocaleString("pl-PL", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + "%");
  const fmtDate = (d) => d;

  /* ---------- Instytucje szkoleniowe ---------- */
  /* Warunki prowizyjne wg czterech modeli z docs/07-silnik-prowizji.md */
  const INSTYTUCJE = [
    { id: "IS-01", nazwa: "Odczaruj Power BI", skrot: "OPB", miasto: "Poznań", nip: "7811955339",
      kontakt: "Paweł Czapiewski", mail: "biuro@odczarujpowerbi.pl", tel: "601 002 118",
      opis: "Szkolenia z Power BI, DAX, Power Query i automatyzacji.",
      standard: "9:00-16:00, wt/śr/czw", opiekun: "Martyna",
      prowizja: { model: "D", kumulacja: "brak", sposob: "stala", stala: 19.5, progi: [] } },

    { id: "IS-02", nazwa: "Metal Maniak", skrot: "MM", miasto: "Katowice", nip: "6342807480",
      kontakt: "Maciej Wrona", mail: "biuro@metalmaniak.pl", tel: "602 771 004",
      opis: "Szkolenia spawalnicze i uprawnienia zawodowe. Partner założycielski.",
      standard: "9:30-20:00, śr/czw/pt", opiekun: "Łucjan",
      prowizja: { model: "A", kumulacja: "miesieczny", sposob: "od_calosci", stala: null,
                  progi: [{ od: 0, st: 10 }, { od: 50000, st: 12 }] } },

    { id: "IS-03", nazwa: "Dron Fortech", skrot: "DF", miasto: "Warszawa", nip: "5252544120",
      kontakt: "Wioletta Sowa", mail: "kontakt@dronfortech.pl", tel: "603 118 220",
      opis: "Szkolenia UAV, technika dronowa, certyfikacja operatorów.",
      standard: "8:00-16:00, pn/wt", opiekun: "Martyna",
      prowizja: { model: "B", kumulacja: "roczny", sposob: "od_nadwyzki", stala: null,
                  progi: [{ od: 0, st: 20 }, { od: 500000, st: 17.5 }, { od: 1000000, st: 15 }] } },

    { id: "IS-04", nazwa: "Fit Akademia", skrot: "FA", miasto: "Gdańsk", nip: "5842747096",
      kontakt: "Robert Kwiatkowski", mail: "biuro@fitakademia.pl", tel: "604 220 447",
      opis: "Kursy zawodowe branży fitness, trener personalny, dietetyka.",
      standard: "9:00-17:00, pt/sb/nd", opiekun: "Łucja",
      prowizja: { model: "C", kumulacja: "miesieczny", sposob: "od_nadwyzki", stala: null,
                  progi: [{ od: 0, st: 18 }, { od: 100000, st: 14 }, { od: 200000, st: 10 }] } },

    { id: "IS-05", nazwa: "Cognity Center", skrot: "CC", miasto: "Kraków", nip: "6762385916",
      kontakt: "Anna Duda", mail: "szkolenia@cognity.pl", tel: "605 447 002",
      opis: "Szkolenia biurowe, IT, kompetencje miękkie.",
      standard: "9:00-16:00, pn-pt", opiekun: "Łucja",
      prowizja: { model: "D", kumulacja: "brak", sposob: "stala", stala: 20, progi: [] } },

    { id: "IS-06", nazwa: "Termex Serwis", skrot: "TX", miasto: "Łódź", nip: "7272812110",
      kontakt: "Jakub Grabowski", mail: "biuro@termex.pl", tel: "606 118 220",
      opis: "Szkolenia HVAC, chłodnictwo, uprawnienia F-gazowe.",
      standard: "8:00-15:00, pn/wt/śr", opiekun: "Martyna",
      prowizja: { model: "D", kumulacja: "brak", sposob: "stala", stala: 20, progi: [] } },

    { id: "IS-07", nazwa: "Bergo Logistyka", skrot: "BG", miasto: "Wrocław", nip: "8992765341",
      kontakt: "Rafał Adamczyk", mail: "szkolenia@bergo.pl", tel: "607 990 118",
      opis: "Transport, spedycja, ADR, czas pracy kierowcy.",
      standard: "8:00-16:00, pn-pt", opiekun: "Łucja",
      prowizja: { model: "A", kumulacja: "miesieczny", sposob: "od_calosci", stala: null,
                  progi: [{ od: 0, st: 18 }, { od: 60000, st: 20 }] } },

    { id: "IS-08", nazwa: "Prima Med", skrot: "PM", miasto: "Szczecin", nip: "8513177845",
      kontakt: "Ewa Michalska", mail: "biuro@primamed.pl", tel: "608 887 002",
      opis: "Szkolenia medyczne, opieka nad seniorem, pierwsza pomoc.",
      standard: "9:00-17:00, sb/nd", opiekun: "Łucjan",
      prowizja: { model: "D", kumulacja: "brak", sposob: "stala", stala: 20, progi: [] } }
  ];

  /* Pelna lista wg skali projektu (ok. 20 instytucji) */
  const INST_DALSZE = ["Akademia Kadr", "EduPro Group", "Safe Work Institute", "Green Energy Szkolenia",
    "Nova Gastro", "Techlab Automatyka", "Studio Kreacji", "Perfect Beauty Academy",
    "BHP Ekspert", "Kompas Biuro", "Vento Kursy", "Stalmet Training"];
  INST_DALSZE.forEach((n, i) => {
    INSTYTUCJE.push({
      id: "IS-" + String(9 + i).padStart(2, "0"), nazwa: n,
      skrot: n.split(" ").map(w => w[0]).join("").slice(0, 3).toUpperCase(),
      miasto: pick(["Poznań", "Warszawa", "Kraków", "Gdańsk", "Wrocław", "Lublin", "Bydgoszcz", "Rzeszów"]),
      nip: String(int(5200000000, 8999999999)),
      kontakt: pick(["Marta Sowa", "Piotr Lis", "Aldona Rybak", "Tomasz Nowak", "Iwona Zawadzka"]),
      mail: "biuro@" + n.toLowerCase().replace(/[^a-z]/g, "") + ".pl", tel: "60" + int(1, 9) + " " + int(100, 999) + " " + int(100, 999),
      opis: "Instytucja szkoleniowa we współpracy od 2026.",
      standard: "9:00-16:00, pn-pt", opiekun: pick(["Łucja", "Martyna", "Łucjan"]),
      prowizja: { model: "D", kumulacja: "brak", sposob: "stala", stala: 20, progi: [] }
    });
  });

  /* ---------- Urzedy pracy ---------- */
  const PUPY = [
    { id: "PUP-01", nazwa: "PUP Poznań", woj: "wielkopolskie", powiat: "poznański" },
    { id: "PUP-02", nazwa: "PUP Warszawa", woj: "mazowieckie", powiat: "m.st. Warszawa" },
    { id: "PUP-03", nazwa: "PUP Kraków", woj: "małopolskie", powiat: "krakowski" },
    { id: "PUP-04", nazwa: "PUP Gdańsk", woj: "pomorskie", powiat: "gdański" },
    { id: "PUP-05", nazwa: "PUP Katowice", woj: "śląskie", powiat: "katowicki" },
    { id: "PUP-06", nazwa: "PUP Wrocław", woj: "dolnośląskie", powiat: "wrocławski" },
    { id: "PUP-07", nazwa: "PUP Łódź", woj: "łódzkie", powiat: "łódzki" },
    { id: "PUP-08", nazwa: "PUP Szczecin", woj: "zachodniopomorskie", powiat: "szczeciński" },
    { id: "PUP-09", nazwa: "PUP Poddębice", woj: "łódzkie", powiat: "poddębicki" },
    { id: "PUP-10", nazwa: "PUP Kartuzy", woj: "pomorskie", powiat: "kartuski" },
    { id: "PUP-11", nazwa: "PUP Brzesko", woj: "małopolskie", powiat: "brzeski" },
    { id: "PUP-12", nazwa: "PUP Bydgoszcz", woj: "kujawsko-pomorskie", powiat: "bydgoski" }
  ];

  /* ---------- Katalog szkolen ---------- */
  const SZKOLENIA = [
    { id: "SZ-101", is: "IS-01", nazwa: "Power BI podstawowy", godz: 16, dni: 2, tryb: "Online", cena: 3200 },
    { id: "SZ-102", is: "IS-01", nazwa: "DAX w praktyce", godz: 16, dni: 2, tryb: "Online", cena: 3600 },
    { id: "SZ-103", is: "IS-01", nazwa: "Power Query i modelowanie", godz: 8, dni: 1, tryb: "Online", cena: 1900 },
    { id: "SZ-104", is: "IS-01", nazwa: "Power BI i AI", godz: 16, dni: 2, tryb: "Online", cena: 3800 },
    { id: "SZ-201", is: "IS-02", nazwa: "Spawanie MAG 135", godz: 120, dni: 15, tryb: "Stacjonarne", cena: 6000 },
    { id: "SZ-202", is: "IS-02", nazwa: "Spawanie TIG 141", godz: 120, dni: 15, tryb: "Stacjonarne", cena: 6400 },
    { id: "SZ-203", is: "IS-02", nazwa: "Uprawnienia UDT wózki", godz: 35, dni: 5, tryb: "Stacjonarne", cena: 2400 },
    { id: "SZ-301", is: "IS-03", nazwa: "Operator BSP VLOS", godz: 24, dni: 3, tryb: "Mieszane", cena: 4200 },
    { id: "SZ-302", is: "IS-03", nazwa: "Operator BSP BVLOS", godz: 40, dni: 5, tryb: "Mieszane", cena: 8900 },
    { id: "SZ-303", is: "IS-03", nazwa: "Fotogrametria z drona", godz: 16, dni: 2, tryb: "Stacjonarne", cena: 5100 },
    { id: "SZ-401", is: "IS-04", nazwa: "Trener personalny", godz: 40, dni: 5, tryb: "Stacjonarne", cena: 4200 },
    { id: "SZ-402", is: "IS-04", nazwa: "Dietetyka sportowa", godz: 24, dni: 3, tryb: "Mieszane", cena: 3100 },
    { id: "SZ-501", is: "IS-05", nazwa: "Excel zaawansowany", godz: 16, dni: 2, tryb: "Online", cena: 2100 },
    { id: "SZ-502", is: "IS-05", nazwa: "Zarządzanie projektami", godz: 16, dni: 2, tryb: "Stacjonarne", cena: 2400 },
    { id: "SZ-503", is: "IS-05", nazwa: "SQL dla analityków", godz: 16, dni: 2, tryb: "Online", cena: 2900 },
    { id: "SZ-601", is: "IS-06", nazwa: "Uprawnienia F-gazowe", godz: 24, dni: 3, tryb: "Stacjonarne", cena: 3400 },
    { id: "SZ-701", is: "IS-07", nazwa: "ADR przewóz towarów", godz: 24, dni: 3, tryb: "Stacjonarne", cena: 1800 },
    { id: "SZ-801", is: "IS-08", nazwa: "Opiekun osoby starszej", godz: 60, dni: 8, tryb: "Stacjonarne", cena: 3900 }
  ];

  /* ---------- Klienci i wnioski ---------- */
  const NAZWY_FIRM = ["Stalmet", "Nordika", "Vento Logistics", "Prima Druk", "Termex", "Bergo Serwis",
    "Fit Studio", "Body Line", "Elmax", "Kompas Biuro", "Agrotech", "Bimex", "Cardo",
    "Delta Plus", "Ekopol", "Fenix Group", "Gastro Mix", "Hydromel", "Interbud", "Jotpol",
    "Kalmar", "Lentex", "Marbud", "Novum", "Orion Tech", "Pomorska Kuźnia", "Quadro",
    "Renoma", "Silesia Auto", "Tramwar", "Unident", "Vitalis", "Wektor", "Zenit"];
  const SUFIKS = ["sp. z o.o.", "S.A.", "sp.j.", "sp. z o.o. sp.k."];
  const IMIONA = ["Mariusz", "Katarzyna", "Piotr", "Agnieszka", "Tomasz", "Marta", "Jakub", "Monika",
    "Rafał", "Łukasz", "Iwona", "Natalia", "Marek", "Aleksandra", "Damian", "Barbara",
    "Krzysztof", "Sylwia", "Ewa", "Michał", "Paulina", "Adam", "Joanna", "Grzegorz"];
  const NAZWISKA = ["Zieliński", "Wrona", "Lewandowski", "Bąk", "Nowak", "Kaczmarek", "Michalska",
    "Grabowski", "Sikora", "Adamczyk", "Dąbrowski", "Zawadzka", "Wójcik", "Sowiński",
    "Pawlak", "Król", "Nowicka", "Mazur", "Górska", "Witkowski", "Baran", "Kubiak"];
  const WIELKOSCI = ["mikro", "mały", "średni", "duży"];

  const ST_SKL = ["Złożony", "Niezłożony", "NW", "Rezygnacja"];
  const ST_DEC = ["Pozytywna", "Negatywna", "Rezygnacja po napisaniu", null];

  function wskaznik(w) { return w === "mikro" ? 0.9 : 0.7; }

  function genKlienci(n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const w = rnd() < 0.42 ? "mikro" : pick(["mały", "średni", "duży"]);
      const zatr = w === "mikro" ? int(2, 9) : w === "mały" ? int(10, 49) : w === "średni" ? int(50, 249) : int(250, 900);
      const nazwa = NAZWY_FIRM[i % NAZWY_FIRM.length] + (i >= NAZWY_FIRM.length ? " " + Math.ceil((i + 1) / NAZWY_FIRM.length) : "");
      out.push({
        id: "KL-" + String(i + 1).padStart(4, "0"),
        nr: i + 1,
        nazwa: nazwa + " " + pick(SUFIKS),
        nip: String(int(5200000000, 9999999999)),
        wielkosc: w, zatrudnienie: zatr,
        osoba: pick(IMIONA) + " " + pick(NAZWISKA),
        tel: "5" + int(10, 99) + " " + int(100, 999) + " " + int(100, 999),
        mail: "kontakt@" + nazwa.toLowerCase().replace(/[^a-z]/g, "") + ".pl",
        is: pick(INSTYTUCJE.slice(0, 8)).id,
        pup: pick(PUPY).id,
        miasto: pick(["Poznań", "Warszawa", "Kraków", "Gdańsk", "Katowice", "Wrocław", "Łódź", "Szczecin"])
      });
    }
    return out;
  }

  function genUczestnicy(wniosek, szk, ile, ileNiezakw) {
    const out = [];
    for (let i = 0; i < ile; i++) {
      const zakw = i < ile - ileNiezakw;
      out.push({
        imie: pick(IMIONA) + " " + pick(NAZWISKA),
        pesel: String(int(60, 99)) + String(int(10, 12)) + String(int(10, 28)) + String(int(10000, 99999)),
        szkolenie: szk.id, szkNazwa: szk.nazwa,
        kwota: szk.cena,
        status: zakw ? "zakwalifikowany" : "niezakwalifikowany",
        powod: zakw ? "" : pick(["prezes zarządu bez umowy o pracę", "brak umowy o pracę", "większościowy udziałowiec"])
      });
    }
    return out;
  }

  function genWnioski(klienci, rok, n) {
    const out = [];
    const mies = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    for (let i = 0; i < n; i++) {
      const kl = klienci[i % klienci.length];
      const inst = INSTYTUCJE.find(x => x.id === kl.is);
      const szkList = SZKOLENIA.filter(s => s.is === kl.is);
      const szk = szkList.length ? pick(szkList) : pick(SZKOLENIA);
      const ileOsob = int(1, 12);
      const ileNz = rnd() < 0.22 ? 1 : 0;
      const ucz = genUczestnicy(null, szk, ileOsob, ileNz);
      const zakw = ucz.filter(u => u.status === "zakwalifikowany");
      const wartosc = ucz.reduce((s, u) => s + u.kwota, 0);
      const calkowita = zakw.reduce((s, u) => s + u.kwota, 0);

      const r = rnd();
      let stSkl, stDec;
      if (r < 0.62) { stSkl = "Złożony"; stDec = rnd() < 0.74 ? "Pozytywna" : "Negatywna"; }
      else if (r < 0.80) { stSkl = "Złożony"; stDec = null; }
      else if (r < 0.90) { stSkl = "Niezłożony"; stDec = null; }
      else if (r < 0.96) { stSkl = "NW"; stDec = null; }
      else { stSkl = "Rezygnacja"; stDec = null; }

      /* Urzad czasem ucina koszt */
      const uciecie = stDec === "Pozytywna" && rnd() < 0.28 ? (0.75 + rnd() * 0.2) : 1;
      const kosztCalk = Math.round(calkowita * uciecie / 100) * 100;
      const wsk = wskaznik(kl.wielkosc);
      const przyznano = stDec === "Pozytywna" ? Math.round(kosztCalk * wsk * 100) / 100 : null;
      const doplata = stDec === "Pozytywna" && rnd() < 0.13 ? int(2, 20) * 1000 : 0;

      const mIdx = Math.min(11, Math.floor(i / (n / 11)));
      const dzien = String(int(1, 27)).padStart(2, "0");
      const dataWn = rok + "-" + mies[mIdx] + "-" + dzien;
      const mFakt = Math.min(11, mIdx + int(1, 3));
      const dataFakt = rok + "-" + mies[mFakt] + "-" + String(int(1, 27)).padStart(2, "0");

      let rozl = "Brak";
      if (stDec === "Pozytywna") {
        const rr = rnd();
        rozl = rr < 0.34 ? "Rozliczone" : rr < 0.58 ? "Zafakturowany" : "Oczekuje";
      }

      out.push({
        id: "PR-" + rok.slice(2) + "-" + String(i + 1).padStart(4, "0"),
        nr: i + 1, rok: rok,
        klient: kl.id, klNazwa: kl.nazwa, nip: kl.nip, wielkosc: kl.wielkosc,
        is: kl.is, isNazwa: inst ? inst.nazwa : "-",
        pup: kl.pup, pupNazwa: (PUPY.find(p => p.id === kl.pup) || {}).nazwa,
        szkolenie: szk.nazwa, szkId: szk.id,
        uczestnicy: ucz, osob: ileOsob, osobZakw: zakw.length,
        wartosc: wartosc, calkowita: calkowita,
        kosztCalkowity: kosztCalkStatus(stDec, kosztCalk),
        przyznano: przyznano,
        wkladProc: Math.round((1 - wsk) * 100),
        doplata: doplata,
        kosztZDoplata: stDec === "Pozytywna" ? kosztCalk + doplata : null,
        statusSkl: stSkl, statusDec: stDec, rozliczenie: rozl,
        dataWniosku: dataWn, dataFormularza: dataWn, dataFaktury: dataFakt,
        opiekun: inst ? inst.opiekun : "-"
      });
    }
    return out;
  }
  function kosztCalkStatus(dec, k) { return dec === "Pozytywna" ? k : null; }

  /* ---------- Generowanie ---------- */
  reset();
  const KLIENCI = genKlienci(240);
  reset();
  const WNIOSKI_2026 = genWnioski(KLIENCI, "2026", 174);
  const WNIOSKI_2025 = genWnioski(KLIENCI, "2025", 118);

  /* ---------- Nabory ---------- */
  const NABORY = [
    { pup: "PUP Poznań", woj: "wielkopolskie", rodzaj: "KFS", status: "Nabór ogłoszony", od: "2026-08-24", do: "2026-09-04", prognoza: "", klientow: 14 },
    { pup: "PUP Gdańsk", woj: "pomorskie", rodzaj: "KFS", status: "Nabór ogłoszony", od: "2026-09-01", do: "2026-09-08", prognoza: "", klientow: 9 },
    { pup: "PUP Kartuzy", woj: "pomorskie", rodzaj: "KFS", status: "Nabór ogłoszony", od: "2026-09-01", do: "2026-09-11", prognoza: "", klientow: 4 },
    { pup: "PUP Katowice", woj: "śląskie", rodzaj: "KFS", status: "W trakcie kontaktu", od: "", do: "", prognoza: "wrzesień 2026", klientow: 22 },
    { pup: "PUP Poddębice", woj: "łódzkie", rodzaj: "KFS", status: "W trakcie kontaktu", od: "", do: "", prognoza: "wrzesień 2026", klientow: 3 },
    { pup: "PUP Warszawa", woj: "mazowieckie", rodzaj: "KFS", status: "W trakcie kontaktu", od: "", do: "", prognoza: "połowa października 2026", klientow: 31 },
    { pup: "PUP Wrocław", woj: "dolnośląskie", rodzaj: "KFS", status: "W trakcie kontaktu", od: "", do: "", prognoza: "październik 2026", klientow: 12 },
    { pup: "PUP Łódź", woj: "łódzkie", rodzaj: "KFS", status: "Brak naboru", od: "", do: "", prognoza: "listopad 2026", klientow: 8 },
    { pup: "PUP Brzesko", woj: "małopolskie", rodzaj: "KFS", status: "Brak naboru", od: "", do: "", prognoza: "grudzień 2026", klientow: 2 },
    { pup: "PUP Kraków", woj: "małopolskie", rodzaj: "Powiatowy", status: "Brak naboru", od: "", do: "", prognoza: "styczeń 2027", klientow: 17 },
    { pup: "PUP Szczecin", woj: "zachodniopomorskie", rodzaj: "KFS", status: "Po naborze", od: "2026-06-01", do: "2026-06-12", prognoza: "", klientow: 6 },
    { pup: "PUP Bydgoszcz", woj: "kujawsko-pomorskie", rodzaj: "KFS", status: "Po naborze", od: "2026-05-11", do: "2026-05-22", prognoza: "", klientow: 5 }
  ];

  /* ---------- Uzytkownicy i role ---------- */
  const UZYTKOWNICY = [
    { login: "bartek@ldit.pl", imie: "Bartłomiej Olejnik", rola: "Administrator", inst: "wszystkie", ost: "2026-08-29 08:41", "2fa": true },
    { login: "lucja@ldit.pl", imie: "Łucja Wierzbicka", rola: "Pracownik LDIT", inst: "Fit Akademia, Cognity Center, Bergo Logistyka", ost: "2026-08-29 09:15", "2fa": true },
    { login: "martyna@ldit.pl", imie: "Martyna Kowal", rola: "Pracownik LDIT", inst: "Odczaruj Power BI, Dron Fortech, Termex Serwis", ost: "2026-08-29 08:02", "2fa": true },
    { login: "lucjan@ldit.pl", imie: "Łucjan Marek", rola: "Pracownik LDIT", inst: "Metal Maniak, Prima Med", ost: "2026-08-28 16:22", "2fa": false },
    { login: "asia@ldit.pl", imie: "Joanna Sadowska", rola: "Pracownik LDIT", inst: "Cognity Center", ost: "2026-08-27 11:40", "2fa": true },
    { login: "biuro@odczarujpowerbi.pl", imie: "Paweł Czapiewski", rola: "Instytucja szkoleniowa", inst: "Odczaruj Power BI", ost: "2026-08-29 07:55", "2fa": true },
    { login: "terminy@odczarujpowerbi.pl", imie: "Aldona Rybak", rola: "Pracownik IS", inst: "Odczaruj Power BI", ost: "2026-08-28 12:30", "2fa": false },
    { login: "kontakt@dronfortech.pl", imie: "Wioletta Sowa", rola: "Instytucja szkoleniowa", inst: "Dron Fortech", ost: "2026-08-29 10:11", "2fa": true },
    { login: "mirka@dronfortech.pl", imie: "Mirosława Kot", rola: "Pracownik IS", inst: "Dron Fortech", ost: "2026-08-29 09:34", "2fa": false },
    { login: "biuro@metalmaniak.pl", imie: "Maciej Wrona", rola: "Instytucja szkoleniowa", inst: "Metal Maniak", ost: "2026-08-26 14:03", "2fa": true }
  ];

  const MODULY = ["Dashboard", "Dofinansowania", "Zestawienia", "Baza klientów", "Nabory",
    "Instytucje szkoleniowe", "Konfigurator instytucji", "Administracja", "Wysyłka maili",
    "Zgłoszenia", "Konta i uprawnienia", "Rejestr aktywności", "Terminy", "Statystyki"];

  /* ---------- Rejestr aktywnosci ---------- */
  const AKTYWNOSC = [
    { czas: "2026-08-29 10:42", kto: "Łucja Wierzbicka", typ: "Zmiana kwoty", obiekt: "PR-26-0141", pole: "Kwota dopłaty dodatkowej", przed: "0 zł", po: "8 000 zł" },
    { czas: "2026-08-29 10:31", kto: "Bartłomiej Olejnik", typ: "Nadpisanie prowizji", obiekt: "PR-26-0138", pole: "Prowizja %", przed: "20% (reguła)", po: "15% (ręcznie)" },
    { czas: "2026-08-29 09:58", kto: "Martyna Kowal", typ: "Zmiana statusu", obiekt: "PR-26-0152", pole: "Status decyzji", przed: "brak", po: "Pozytywna" },
    { czas: "2026-08-29 09:22", kto: "Martyna Kowal", typ: "Zmiana statusu", obiekt: "PR-26-0150", pole: "Status decyzji", przed: "brak", po: "Negatywna" },
    { czas: "2026-08-29 08:47", kto: "Bartłomiej Olejnik", typ: "Akceptacja zgłoszenia", obiekt: "KL-0238", pole: "Status rekordu", przed: "Oczekuje", po: "W bazie" },
    { czas: "2026-08-28 16:15", kto: "Łucjan Marek", typ: "Zmiana kwoty", obiekt: "PR-26-0129", pole: "Koszt całkowity", przed: "72 000 zł", po: "68 000 zł" },
    { czas: "2026-08-28 15:02", kto: "Bartłomiej Olejnik", typ: "Zmiana warunków IS", obiekt: "IS-02 Metal Maniak", pole: "Próg miesięczny", przed: "45 000 zł", po: "50 000 zł" },
    { czas: "2026-08-28 14:38", kto: "Joanna Sadowska", typ: "Przywrócenie reguły", obiekt: "PR-26-0117", pole: "Przyznano", przed: "60 000 zł (ręcznie)", po: "63 000 zł (reguła)" },
    { czas: "2026-08-28 11:20", kto: "Łucja Wierzbicka", typ: "Wysyłka maila", obiekt: "KL-0201", pole: "Szablon", przed: "", po: "Instrukcja praca.gov.pl" },
    { czas: "2026-08-28 09:05", kto: "Bartłomiej Olejnik", typ: "Blokada konta", obiekt: "kacper@ldit.pl", pole: "Status konta", przed: "Aktywne", po: "Zablokowane" }
  ];

  const LOGOWANIA = [
    { czas: "2026-08-29 10:55", kto: "biuro@odczarujpowerbi.pl", ip: "83.24.11.204", wynik: "OK", urzadzenie: "Chrome / Windows" },
    { czas: "2026-08-29 09:15", kto: "lucja@ldit.pl", ip: "195.12.44.8", wynik: "OK", urzadzenie: "Edge / Windows" },
    { czas: "2026-08-29 08:41", kto: "bartek@ldit.pl", ip: "195.12.44.8", wynik: "OK", urzadzenie: "Chrome / Windows" },
    { czas: "2026-08-29 08:39", kto: "bartek@ldit.pl", ip: "195.12.44.8", wynik: "Błędne hasło", urzadzenie: "Chrome / Windows" },
    { czas: "2026-08-28 22:14", kto: "mirka@dronfortech.pl", ip: "37.47.201.77", wynik: "OK", urzadzenie: "Safari / iPhone" },
    { czas: "2026-08-28 16:22", kto: "lucjan@ldit.pl", ip: "195.12.44.8", wynik: "OK", urzadzenie: "Chrome / Windows" }
  ];

  /* ---------- Zgloszenia (incydenty) ---------- */
  const ZGLOSZENIA = [
    { id: "ZG-007", data: "2026-08-21", podmiot: "Dron Fortech", typ: "Instytucja", powod: "Próba zaniżenia prowizji",
      opis: "Instytucja obcięła prowizję do 5 tys. powołując się na rzekome życzenie klienta. Klient chciał, żeby inny trener realizował szkolenie, więc podjęli negocjacje z pominięciem nas.", autor: "Bartłomiej Olejnik", waga: "wysoka" },
    { id: "ZG-006", data: "2026-07-14", podmiot: "Nova Gastro", typ: "Instytucja", powod: "Spóźnione formularze",
      opis: "Trzeci raz w tym roku formularz od handlowca wpłynął w ostatnim dniu naboru. Klient miał pretensje do nas.", autor: "Łucja Wierzbicka", waga: "średnia" },
    { id: "ZG-005", data: "2026-06-30", podmiot: "Marbud sp. z o.o.", typ: "Klient", powod: "Podejrzenie wyłudzenia",
      opis: "Firma zgłosiła 11 uczestników, z czego 6 nie figuruje w ZUS jako zatrudnieni. Wniosek wstrzymany do wyjaśnienia.", autor: "Martyna Kowal", waga: "wysoka" },
    { id: "ZG-004", data: "2026-05-19", podmiot: "Safe Work Institute", typ: "Instytucja", powod: "Obniżenie ceny bez uzgodnienia",
      opis: "IS zeszła z ceny 6000 na 5000 w PUP Kraków. Precedens blokuje wyższe stawki dla kolejnych wniosków w tym urzędzie.", autor: "Bartłomiej Olejnik", waga: "wysoka" },
    { id: "ZG-003", data: "2026-04-08", podmiot: "Zenit sp.j.", typ: "Klient", powod: "Brak kontaktu po decyzji",
      opis: "Klient nie odbiera od 3 tygodni mimo pozytywnej decyzji. Termin realizacji mija 31.12.", autor: "Joanna Sadowska", waga: "niska" }
  ];

  /* ---------- Szablony maili ---------- */
  const SZABLONY = [
    { id: "SZB-01", nazwa: "Instrukcja zakładania konta na praca.gov.pl", odbiorca: "Klient końcowy", autor: "LDIT", uzyc: 412 },
    { id: "SZB-02", nazwa: "Instrukcja składania pisma", odbiorca: "Klient końcowy", autor: "LDIT", uzyc: 288 },
    { id: "SZB-03", nazwa: "Dane do faktury", odbiorca: "Instytucja szkoleniowa", autor: "LDIT", uzyc: 194 },
    { id: "SZB-04", nazwa: "Wniosek w trakcie przygotowania", odbiorca: "Klient końcowy", autor: "LDIT", uzyc: 331 },
    { id: "SZB-05", nazwa: "Prośba o ustalenie terminu", odbiorca: "Instytucja szkoleniowa", autor: "LDIT", uzyc: 156 },
    { id: "SZB-06", nazwa: "Termin ustalony, zgłoś do urzędu", odbiorca: "LDIT (wewnętrzny)", autor: "LDIT", uzyc: 148 },
    { id: "SZB-07", nazwa: "Szczegóły organizacyjne szkolenia", odbiorca: "Uczestnicy terminu", autor: "Instytucja", uzyc: 203 },
    { id: "SZB-08", nazwa: "Paczka rozliczeniowa i certyfikaty", odbiorca: "Klient końcowy", autor: "LDIT", uzyc: 121 },
    { id: "SZB-09", nazwa: "Prośba o opinię w Google", odbiorca: "Klient końcowy", autor: "LDIT", uzyc: 0 }
  ];

  /* ---------- Faktury ---------- */
  function genFaktury(n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const inst = pick(INSTYTUCJE.slice(0, 8));
      const kw = int(8, 260) * 100;
      const m = String(int(1, 8)).padStart(2, "0");
      const d = String(int(1, 28)).padStart(2, "0");
      out.push({
        nr: "FV/" + String(i + 1).padStart(3, "0") + "/2026",
        is: inst.nazwa, isId: inst.id,
        kwota: kw, vat: "ZW",
        wystawiona: "2026-" + m + "-" + d,
        termin: "2026-" + m + "-" + String(Math.min(28, parseInt(d) + 14)).padStart(2, "0"),
        status: rnd() < 0.68 ? "Opłacona" : rnd() < 0.6 ? "Oczekuje" : "Po terminie",
        projekty: int(1, 6)
      });
    }
    return out;
  }
  reset();
  const FAKTURY = genFaktury(64);

  /* ---------- Terminy szkolen ---------- */
  const TERMINY = [
    { id: "TR-0912", is: "IS-01", szk: "SZ-101", nazwa: "Power BI podstawowy", od: "2026-09-08", do: "2026-09-09", miejsce: "Online, MS Teams", status: "Zaplanowany", zapisani: 8, limit: 12 },
    { id: "TR-0913", is: "IS-01", szk: "SZ-102", nazwa: "DAX w praktyce", od: "2026-09-22", do: "2026-09-23", miejsce: "Online, MS Teams", status: "Zaplanowany", zapisani: 5, limit: 12 },
    { id: "TR-0914", is: "IS-01", szk: "SZ-103", nazwa: "Power Query i modelowanie", od: "2026-10-06", do: "2026-10-06", miejsce: "Online, MS Teams", status: "Wolny", zapisani: 2, limit: 12 },
    { id: "TR-0915", is: "IS-01", szk: "SZ-104", nazwa: "Power BI i AI", od: "2026-10-20", do: "2026-10-21", miejsce: "Online, MS Teams", status: "Wolny", zapisani: 0, limit: 12 },
    { id: "TR-0916", is: "IS-01", szk: "SZ-101", nazwa: "Power BI podstawowy", od: "2026-08-04", do: "2026-08-05", miejsce: "Online, MS Teams", status: "Odbyty", zapisani: 11, limit: 12 },
    { id: "TR-0921", is: "IS-02", szk: "SZ-201", nazwa: "Spawanie MAG 135", od: "2026-09-14", do: "2026-10-02", miejsce: "Katowice, ul. Hutnicza 4", status: "Zaplanowany", zapisani: 9, limit: 10 },
    { id: "TR-0922", is: "IS-02", szk: "SZ-203", nazwa: "Uprawnienia UDT wózki", od: "2026-09-28", do: "2026-10-02", miejsce: "Katowice, ul. Hutnicza 4", status: "Wolny", zapisani: 4, limit: 14 },
    { id: "TR-0931", is: "IS-03", szk: "SZ-301", nazwa: "Operator BSP VLOS", od: "2026-09-15", do: "2026-09-17", miejsce: "Warszawa, ul. Prosta 12", status: "Zaplanowany", zapisani: 7, limit: 8 },
    { id: "TR-0932", is: "IS-03", szk: "SZ-302", nazwa: "Operator BSP BVLOS", od: "2026-11-03", do: "2026-11-07", miejsce: "Warszawa, ul. Prosta 12", status: "Wolny", zapisani: 1, limit: 8 },
    { id: "TR-0941", is: "IS-04", szk: "SZ-401", nazwa: "Trener personalny", od: "2026-10-05", do: "2026-10-09", miejsce: "Gdańsk, al. Grunwaldzka 3", status: "Zaplanowany", zapisani: 12, limit: 15 },
    { id: "TR-0942", is: "IS-04", szk: "SZ-402", nazwa: "Dietetyka sportowa", od: "2026-11-06", do: "2026-11-08", miejsce: "Gdańsk, al. Grunwaldzka 3", status: "Wolny", zapisani: 3, limit: 15 },
    { id: "TR-0951", is: "IS-05", szk: "SZ-501", nazwa: "Excel zaawansowany", od: "2026-09-11", do: "2026-09-12", miejsce: "Online", status: "Zaplanowany", zapisani: 6, limit: 16 }
  ];

  /* ---------- Kolejka zgloszen z formularza ---------- */
  const KOLEJKA = [
    { data: "2026-08-29 09:12", firma: "Kalmar sp. z o.o.", nip: "7811234567", is: "Odczaruj Power BI", osob: 4, szkolenie: "Power BI podstawowy", kontakt: "Adam Baran" },
    { data: "2026-08-29 08:40", firma: "Renoma S.A.", nip: "6342877110", is: "Metal Maniak", osob: 7, szkolenie: "Spawanie MAG 135", kontakt: "Grzegorz Kubiak" },
    { data: "2026-08-28 17:55", firma: "Orion Tech sp.j.", nip: "5252099441", is: "Dron Fortech", osob: 2, szkolenie: "Operator BSP VLOS", kontakt: "Paulina Witkowska" },
    { data: "2026-08-28 14:03", firma: "Gastro Mix sp. z o.o.", nip: "8992001188", is: "Cognity Center", osob: 5, szkolenie: "Excel zaawansowany", kontakt: "Michał Górski" },
    { data: "2026-08-28 11:47", firma: "Vitalis sp. z o.o.", nip: "5842110098", is: "Fit Akademia", osob: 3, szkolenie: "Trener personalny", kontakt: "Joanna Nowicka" }
  ];

  /* ---------- Korespondencja ---------- */
  const MAILE = [
    { data: "2026-08-28 14:22", kier: "in", od: "kontakt@stalmet.pl", temat: "Stalmet - komplet dokumentów", skrz: "lucja@ldit.pl", zal: 2 },
    { data: "2026-08-27 09:14", kier: "out", od: "lucja@ldit.pl", temat: "Stalmet - instrukcja praca.gov.pl", skrz: "lucja@ldit.pl", zal: 1 },
    { data: "2026-08-24 16:40", kier: "in", od: "kontakt@stalmet.pl", temat: "Stalmet - pytanie o termin", skrz: "lucja@ldit.pl", zal: 0 },
    { data: "2026-08-20 11:05", kier: "out", od: "lucja@ldit.pl", temat: "Stalmet - wniosek w trakcie przygotowania", skrz: "lucja@ldit.pl", zal: 0 },
    { data: "2026-08-18 08:32", kier: "in", od: "biuro@odczarujpowerbi.pl", temat: "Stalmet - potwierdzenie terminu 08-09.09", skrz: "martyna@ldit.pl", zal: 0 },
    { data: "2026-08-12 13:19", kier: "out", od: "lucja@ldit.pl", temat: "Stalmet - formularz zgłoszeniowy", skrz: "lucja@ldit.pl", zal: 1 }
  ];

  /* ---------- Cele ---------- */
  const CELE = [
    { nazwa: "Wnioski złożone na 2 mln zł", cel: 2000000, obecnie: 1640000, premia: "Premia I stopnia", status: "w trakcie" },
    { nazwa: "Wnioski złożone na 1,5 mln zł", cel: 1500000, obecnie: 1640000, premia: "Premia bazowa", status: "osiągnięty" },
    { nazwa: "Wnioski złożone na 1 mln zł", cel: 1000000, obecnie: 1640000, premia: "Premia startowa", status: "osiągnięty" },
    { nazwa: "Skuteczność powyżej 70%", cel: 70, obecnie: 74, premia: "Bonus jakościowy", status: "osiągnięty" }
  ];

  /* ---------- Eksport ---------- */
  global.DB = {
    INSTYTUCJE, PUPY, SZKOLENIA, KLIENCI,
    WNIOSKI: WNIOSKI_2026, WNIOSKI_2025, WNIOSKI_2026,
    NABORY, UZYTKOWNICY, MODULY, AKTYWNOSC, LOGOWANIA,
    ZGLOSZENIA, SZABLONY, FAKTURY, TERMINY, KOLEJKA, MAILE, CELE,
    fmtPLN, fmtPLN2, fmtNum, fmtPct, fmtDate, wskaznik
  };

  /* ---------- Silnik prowizji (docs/07-silnik-prowizji.md) ---------- */
  /* Zwraca { kwota, stawkaEfektywna, rozbicie[] } */
  global.liczProwizje = function (warunki, obrotPrzed, kwotaFaktury) {
    const w = warunki;
    if (w.sposob === "stala" || !w.progi || !w.progi.length) {
      const st = w.stala != null ? w.stala : 20;
      return { kwota: kwotaFaktury * st / 100, stawka: st, rozbicie: [{ kwota: kwotaFaktury, st: st }] };
    }
    const progi = w.progi.slice().sort((a, b) => a.od - b.od);
    const stawkaDla = (suma) => {
      let s = progi[0].st;
      for (const p of progi) if (suma >= p.od) s = p.st;
      return s;
    };
    if (w.sposob === "od_calosci") {
      /* Model A: przekroczenie progu zmienia stawke dla CALEGO okresu */
      const st = stawkaDla(obrotPrzed + kwotaFaktury);
      return { kwota: kwotaFaktury * st / 100, stawka: st, rozbicie: [{ kwota: kwotaFaktury, st: st }] };
    }
    /* Modele B i C: od nadwyzki, faktura moze byc dzielona miedzy progi */
    let poz = obrotPrzed, zostalo = kwotaFaktury, suma = 0;
    const rozb = [];
    while (zostalo > 0.005) {
      const st = stawkaDla(poz);
      const nast = progi.find(p => p.od > poz);
      const doGranicy = nast ? Math.min(zostalo, nast.od - poz) : zostalo;
      suma += doGranicy * st / 100;
      rozb.push({ kwota: doGranicy, st: st });
      poz += doGranicy; zostalo -= doGranicy;
    }
    return { kwota: suma, stawka: kwotaFaktury ? (suma / kwotaFaktury * 100) : 0, rozbicie: rozb };
  };

  /* ------------------------------------------------------------------
     Rozliczenie CALEGO okresu.

     UWAGA, to nie jest to samo co suma liczProwizje() po fakturach.
     W modelu "od_calosci" przekroczenie progu podnosi stawke dla
     CALEGO obrotu okresu, takze dla faktur juz wystawionych.
     Przyklad z warsztatu: 26 000 + 25 000 = 51 000, obie pozycje
     rozliczane po 12%, razem 6 120 zl, a nie 2 600 + 3 000.

     Zwraca { pozycje:[{kwota,stawka,prowizja,rozbicie}], suma,
              obrot, stawkaEfektywna }
     ------------------------------------------------------------------ */
  global.liczOkres = function (warunki, faktury) {
    const w = warunki;
    const obrot = faktury.reduce((s, f) => s + (f.kwota || 0), 0);

    /* Stala stawka */
    if (w.sposob === "stala" || !w.progi || !w.progi.length) {
      const st = w.stala != null ? w.stala : 20;
      const poz = faktury.map(f => ({
        kwota: f.kwota, stawka: st, prowizja: f.kwota * st / 100,
        rozbicie: [{ kwota: f.kwota, st: st }]
      }));
      return { pozycje: poz, suma: poz.reduce((s, p) => s + p.prowizja, 0), obrot: obrot, stawkaEfektywna: st };
    }

    const progi = w.progi.slice().sort((a, b) => a.od - b.od);
    const stawkaDla = (suma) => {
      let s = progi[0].st;
      for (const p of progi) if (suma >= p.od) s = p.st;
      return s;
    };

    /* Model A: stawka wyznaczona przez CALY obrot okresu */
    if (w.sposob === "od_calosci") {
      const st = stawkaDla(obrot);
      const poz = faktury.map(f => ({
        kwota: f.kwota, stawka: st, prowizja: f.kwota * st / 100,
        rozbicie: [{ kwota: f.kwota, st: st }]
      }));
      return { pozycje: poz, suma: poz.reduce((s, p) => s + p.prowizja, 0), obrot: obrot, stawkaEfektywna: st };
    }

    /* Modele B i C: narastajaco, kolejnosc faktur ma znaczenie */
    let narastajaco = 0;
    const poz = faktury.map(f => {
      const r = global.liczProwizje(w, narastajaco, f.kwota || 0);
      narastajaco += (f.kwota || 0);
      return { kwota: f.kwota, stawka: r.stawka, prowizja: r.kwota, rozbicie: r.rozbicie };
    });
    const suma = poz.reduce((s, p) => s + p.prowizja, 0);
    return { pozycje: poz, suma: suma, obrot: obrot, stawkaEfektywna: obrot ? suma / obrot * 100 : 0 };
  };

})(window);
