/* ============================================================================
   Migracja danych makiety: db.json (stara, plaska struktura) -> tabele SQLite
   opisane w makieta/db/schema.sql.

   Zasada nadrzedna: liczby widoczne w makiecie nie moga sie zmienic. Dlatego
   przy odwroceniu wyliczen (D-134) przepisujemy stary "koszt_calkowity" na nowy
   "koszt_calkowity_z_doplata" powiekszony o doplate, zeby roznica dala z powrotem
   dokladnie te sama wartosc.
   ============================================================================ */

const HASLO_DEMO = "demo";

/* Role systemowe (D-36). zakres okresla, czyje dane rola moze w ogole dotknac. */
export const ROLE = [
  { id: "admin", nazwa: "Administrator", zakres: "ldit", systemowa: 1,
    opis: "Pelen dostep, jedyna rola widzaca stawki prowizji (D-07)" },
  { id: "pracownik", nazwa: "Pracownik LDIT", zakres: "ldit", systemowa: 1,
    opis: "Praca operacyjna na przypisanych instytucjach, bez finansow firmy (D-34, D-114)" },
  { id: "is", nazwa: "Instytucja szkoleniowa", zakres: "instytucja", systemowa: 1,
    opis: "Wylacznie wlasni klienci, bez wgladu we wlasna stawke prowizji (D-76)" },
  { id: "pracownikIS", nazwa: "Pracownik IS", zakres: "instytucja", systemowa: 1,
    opis: "Handlowiec instytucji, rola konczy sie na wypelnieniu formularza (D-72, D-75)" },
  { id: "klient", nazwa: "Klient koncowy", zakres: "klient", systemowa: 1,
    opis: "Odczyt wlasnego wniosku, status modulu otwarty (P-33)" }
];

/* Moduly = pozycje menu. plik wskazuje strone makiety. */
export const MODULY = [
  { id: "dash",    nazwa: "Dashboard",              plik: "01-dashboard.html",            grupa: "Praca operacyjna", ikona: "&#9632;", kolejnosc: 10 },
  { id: "dofin",   nazwa: "Dofinansowania",         plik: "02-zestawienia.html",          grupa: "Praca operacyjna", ikona: "&#9673;", kolejnosc: 20 },
  { id: "nabory",  nazwa: "Nabory",                 plik: "05-nabory.html",               grupa: "Praca operacyjna", ikona: "&#9200;", kolejnosc: 30 },
  { id: "zadania", nazwa: "Zadania i powiadomienia", plik: "18-zadania.html",             grupa: "Praca operacyjna", ikona: "&#9745;", kolejnosc: 40 },
  { id: "inst",    nazwa: "Instytucje szkoleniowe", plik: "06-instytucje.html",           grupa: "Konfiguracja",     ikona: "&#9638;", kolejnosc: 50 },
  { id: "komun",   nazwa: "Komunikacja",            plik: "09-wysylka-maili.html",        grupa: "Konfiguracja",     ikona: "&#9993;", kolejnosc: 60 },
  { id: "admin",   nazwa: "Administracja",          plik: "08-administracja.html",        grupa: "Zarzadzanie",      ikona: "&#9878;", kolejnosc: 70 },
  { id: "zglo",    nazwa: "Zgloszenia",             plik: "10-zgloszenia.html",           grupa: "Zarzadzanie",      ikona: "&#9888;", kolejnosc: 80 },
  { id: "ustaw",   nazwa: "Ustawienia",             plik: "11-konta-uprawnienia.html",    grupa: "Zarzadzanie",      ikona: "&#9787;", kolejnosc: 90 },
  { id: "panelIS", nazwa: "Moja instytucja",        plik: "16-panel-is.html",             grupa: "Panel zewnetrzny", ikona: "&#9707;", kolejnosc: 100 },
  { id: "terminy", nazwa: "Terminy szkolen",        plik: "13-terminy.html",              grupa: "Panel zewnetrzny", ikona: "&#9635;", kolejnosc: 110 },
  { id: "panelKL", nazwa: "Moj wniosek",            plik: "17-panel-klienta.html",        grupa: "Panel zewnetrzny", ikona: "&#9708;", kolejnosc: 120 }
];

/* Macierz rola x modul. edycja = pelny dostep, podglad = tylko odczyt,
   brak wpisu = modul nie istnieje dla tej roli (nie ma go w menu). */
const DOSTEP = {
  admin:       { dash: "edycja", dofin: "edycja", nabory: "edycja", zadania: "edycja", inst: "edycja",
                 komun: "edycja", admin: "edycja", zglo: "edycja", ustaw: "edycja", terminy: "edycja" },
  pracownik:   { dash: "edycja", dofin: "edycja", nabory: "edycja", zadania: "edycja", inst: "podglad",
                 komun: "edycja", zglo: "edycja" },
  is:          { dash: "podglad", panelIS: "edycja", terminy: "edycja", nabory: "podglad" },
  pracownikIS: { panelIS: "podglad" },
  klient:      { panelKL: "podglad" }
};

/* Widocznosc pol wrazliwych. To jest miejsce, w ktorym egzekwowane sa D-07,
   D-34, D-75, D-76 i D-114. Klucz nieobecny w mapie = pole ukryte. */
const POLA = {
  "finanse.kwoty_wniosku":  ["admin", "pracownik", "is", "klient"],
  "finanse.prowizja":       ["admin"],
  "finanse.zysk_ldit":      ["admin"],
  "finanse.faktury":        ["admin"],
  "statystyki.zbiorcze":    ["admin"],
  "statystyki.wlasne":      ["admin", "pracownik", "is"],
  "klient.pesel":           ["admin", "pracownik", "is"],
  "klient.dane_kontaktowe": ["admin", "pracownik", "is", "pracownikIS"],
  "zgloszenia.dostep":      ["admin", "pracownik"],
  "admin.konta":            ["admin"],
  "admin.rejestr":          ["admin"],
  "admin.progi_dofinansowania": ["admin"],
  "admin.lata_zestawien":   ["admin"]
};

export const KLUCZE_POL = Object.keys(POLA);

export function uprawnieniaRows() {
  const out = [];
  for (const rola of Object.keys(DOSTEP)) {
    for (const modul of MODULY) {
      const poziom = DOSTEP[rola][modul.id] || "brak";
      out.push({ rola_id: rola, modul_id: modul.id, poziom });
    }
  }
  return out;
}

export function uprawnieniaPolRows() {
  const out = [];
  for (const klucz of KLUCZE_POL) {
    for (const rola of ROLE) {
      out.push({ rola_id: rola.id, klucz, widoczne: POLA[klucz].includes(rola.id) ? 1 : 0 });
    }
  }
  return out;
}

/* Progi dofinansowania: wartosci domyslne z warsztatu, wersjonowane data (D-131).
   90/10 dla mikro, 70/30 dla pozostalych. Sa edytowalne, wiec trafiaja do tabeli,
   a nie do kodu. */
export function progiDofinansowaniaRows() {
  const od = "2020-01-01";
  return [
    { id: "PD-01", wielkosc: "mikro",   procent_dofinansowania: 90, obowiazuje_od: od, obowiazuje_do: null },
    { id: "PD-02", wielkosc: "mały",    procent_dofinansowania: 70, obowiazuje_od: od, obowiazuje_do: null },
    { id: "PD-03", wielkosc: "średni",  procent_dofinansowania: 70, obowiazuje_od: od, obowiazuje_do: null },
    { id: "PD-04", wielkosc: "duży",    procent_dofinansowania: 70, obowiazuje_od: od, obowiazuje_do: null },
    { id: "PD-05", wielkosc: "inny",    procent_dofinansowania: 70, obowiazuje_od: od, obowiazuje_do: null }
  ];
}

/* Zakladki roczne Dofinansowan (D-159). W tescie migrujemy tylko rok 2026
   (D-160), wiec 2025 zostaje z danymi przykladowymi, a 2027 czeka pusty. */
export function lataZestawienRows() {
  const kto = "Bartłomiej Olejnik";
  return [
    { rok: "2025", opis: "Dane przykładowe. W teście przenosimy z Excela tylko rok 2026 (D-160).",
      utworzono: "2026-09-29", utworzyl: kto },
    { rok: "2026", opis: "Rok bieżący. Dane przeniesione z Excela w ramach testu (D-160).",
      utworzono: "2026-09-29", utworzyl: kto },
    { rok: "2027", opis: "Zakładka przygotowana na nowy rok. Pierwszy wniosek dostanie numer klienta 1 (D-112).",
      utworzono: "2026-09-29", utworzyl: kto }
  ];
}

/* Instytucje, ktore przekazuja terminy z gory zamiast udostepniac kalendarz (D-142) */
const TERMINY_Z_GORY = ["Fit Akademia", "Prima Med"];

function etapWniosku(w) {
  if (w.status_finansowy === "Rozliczone") return 10;
  if (w.status_finansowy === "Zafakturowany") return 9;
  if (w.status_decyzji === "Pozytywna") return 7;
  if (w.status_decyzji === "Negatywna") return 6;
  if (w.status_skladania === "Złożony") return 5;
  return 3;
}

export function migruj(src) {
  const instById = Object.fromEntries(src.instytucje.map((i) => [i.id, i]));
  const instByNazwa = Object.fromEntries(src.instytucje.map((i) => [i.nazwa, i.id]));

  const instytucje = src.instytucje.map((i) => ({
    ...i,
    model_terminow: TERMINY_Z_GORY.includes(i.nazwa) ? "z_gory" : "kalendarz",
    aktywna: 1
  }));

  /* Progi prowizyjne wychodza z tablicy zagniezdzonej do wlasnej tabeli */
  const progi_prowizyjne = [];
  const warunki = src.warunki_prowizyjne.map((w, wi) => {
    (w.progi || []).forEach((p, pi) => {
      progi_prowizyjne.push({
        id: "PP-" + String(wi + 1).padStart(2, "0") + "-" + String(pi + 1),
        warunki_id: w.id, od_kwoty: p.od, stawka: p.stawka
      });
    });
    const { progi, ...reszta } = w;
    return reszta;
  });

  const katalog_szkolen = src.katalog_szkolen.map((s) => ({ ...s, plan_szkolenia: null }));
  const terminy = src.terminy.map((t) => {
    const { limit, ...reszta } = t;
    return { ...reszta, limit_miejsc: limit };
  });

  /* Flaga zainteresowania kolejnym naborem (D-130), deterministycznie co trzeci klient */
  const klienci = src.klienci.map((k) => ({
    ...k, adres_siedziby: null, zainteresowany_naborem: k.numer_klienta % 3 === 0 ? 1 : 0
  }));

  /* D-144: jeden klient u wielu instytucji. Baza startowa ma po jednym powiazaniu,
     co dziesiaty klient dostaje drugie, zeby separacja miala co egzekwowac. */
  const klient_instytucja = [];
  klienci.forEach((k, idx) => {
    if (k.instytucja_id) klient_instytucja.push({ klient_id: k.id, instytucja_id: k.instytucja_id });
    if (idx % 10 === 0) {
      const inna = src.instytucje[(idx / 10 + 3) % src.instytucje.length];
      if (inna && inna.id !== k.instytucja_id) {
        klient_instytucja.push({ klient_id: k.id, instytucja_id: inna.id });
      }
    }
  });

  /* Wnioski: odwrocenie wyliczen D-134 z zachowaniem liczb */
  const wnioski = src.wnioski.map((w) => {
    const doplata = w.kwota_doplaty_dodatkowej || 0;
    const kosztStary = w.koszt_calkowity;
    return {
      id: w.id, numer: w.numer, rok: w.rok,
      klient_id: w.klient_id, instytucja_id: w.instytucja_id, pup_id: w.pup_id,
      nabor_id: null, szkolenie_glowne_id: w.szkolenie_glowne_id, faktura_id: null,
      etap: etapWniosku(w),
      wielkosc_przedsiebiorstwa: null, osoba_kontaktowa: null, telefon: null, email: null,
      koszt_calkowity_z_doplata: kosztStary == null ? null : kosztStary + doplata,
      kwota_doplaty_dodatkowej: doplata,
      koszt_calkowity: kosztStary,
      koszt_regula_aktywna: 1,
      przyznano: null,
      przyznano_regula_aktywna: 1,
      prowizja_regula_aktywna: w.prowizja_procent_reczna == null ? 1 : 0,
      prowizja_typ_nadpisania: w.prowizja_procent_reczna == null ? null : "procent",
      prowizja_wartosc: w.prowizja_procent_reczna,
      status_skladania: w.status_skladania,
      status_decyzji: w.status_decyzji,
      status_finansowy: w.status_finansowy,
      data_wplyniecia_formularza: w.data_wplyniecia_formularza,
      data_wniosku: w.data_wniosku,
      data_wystawienia_faktury: w.data_wystawienia_faktury,
      data_aktualizacji: w.data_wniosku
    };
  });

  /* Konta: rola jako referencja, przydzial instytucji jako osobne wiersze (D-113) */
  const rolaPoNazwie = { "Administrator": "admin", "Pracownik LDIT": "pracownik",
    "Instytucja szkoleniowa": "is", "Pracownik IS": "pracownikIS", "Klient końcowy": "klient" };

  const uzytkownik_instytucja = [];
  const uzytkownicy = src.uzytkownicy.map((u) => {
    const rola_id = rolaPoNazwie[u.rola] || "pracownik";
    const wszystkie = u.instytucje === "wszystkie" ? 1 : 0;
    let instytucja_id = null;
    if (!wszystkie) {
      const nazwy = u.instytucje.split(",").map((s) => s.trim()).filter(Boolean);
      nazwy.forEach((n) => {
        const id = instByNazwa[n];
        if (id) uzytkownik_instytucja.push({ uzytkownik_id: u.id, instytucja_id: id });
      });
      if (rola_id === "is" || rola_id === "pracownikIS") instytucja_id = instByNazwa[nazwy[0]] || null;
    }
    return {
      id: u.id, login: u.login, haslo_demo: HASLO_DEMO, imie_nazwisko: u.imie_nazwisko,
      rola_id, instytucja_id, klient_id: null, wszystkie_instytucje: wszystkie,
      ostatnie_logowanie: u.ostatnie_logowanie, dwa_fa: u.dwa_fa ? 1 : 0, zablokowane: 0
    };
  });

  /* Konto klienta koncowego. Panel klienta jest modulem o nierozstrzygnietym
     zakresie (P-33), ale konto musi istniec, zeby dalo sie pokazac, ile
     dokladnie widzi klient po zalogowaniu. */
  const pierwszyKlient = klienci[0];
  uzytkownicy.push({
    id: "kontakt@" + pierwszyKlient.nazwa.toLowerCase().replace(/[^a-z0-9]+/g, "") + ".pl",
    login: "kontakt@" + pierwszyKlient.nazwa.toLowerCase().replace(/[^a-z0-9]+/g, "") + ".pl",
    haslo_demo: HASLO_DEMO, imie_nazwisko: pierwszyKlient.osoba_kontaktowa,
    rola_id: "klient", instytucja_id: null, klient_id: pierwszyKlient.id,
    wszystkie_instytucje: 0, ostatnie_logowanie: null, dwa_fa: 0, zablokowane: 0
  });

  const seq = (pref) => { let n = 0; return () => pref + "-" + String(++n).padStart(4, "0"); };
  const idAkt = seq("AKT"), idLog = seq("LOG"), idKor = seq("KOR");

  return {
    urzedy_pracy: src.urzedy_pracy,
    lata_zestawien: lataZestawienRows(),
    progi_dofinansowania: progiDofinansowaniaRows(),
    instytucje,
    warunki_prowizyjne: warunki,
    progi_prowizyjne,
    katalog_szkolen,
    terminy,
    klienci,
    klient_instytucja,
    nabory: src.nabory,
    faktury: src.faktury,
    wnioski,
    uczestnicy: src.uczestnicy,
    role: ROLE,
    moduly: MODULY,
    uprawnienia: uprawnieniaRows(),
    uprawnienia_pol: uprawnieniaPolRows(),
    uzytkownicy,
    uzytkownik_instytucja,
    przebieg_wniosku: [],
    zadania: [],
    notatki: [],
    korespondencja: src.korespondencja.map((k) => ({
      id: idKor(), klient_id: null, instytucja_id: null, data: k.data,
      kierunek: k.kier === "in" ? "przychodzacy" : "wychodzacy",
      od_kogo: k.od, temat: k.temat, skrzynka: k.skrz, zalaczniki: k.zal
    })),
    formularze_oczekujace: src.kolejka_zgloszen.map((k, i) => ({
      id: "FO-" + String(i + 1).padStart(3, "0"), data: k.data, firma: k.firma, nip: k.nip,
      instytucja_id: instByNazwa[k.is] || null, osob: k.osob, szkolenie: k.szkolenie,
      kontakt: k.kontakt, status: "oczekuje"
    })),
    szablony_maili: src.szablony_maili.map((s) => ({ ...s, tresc: null })),
    zgloszenia: src.zgloszenia.map((z) => ({
      id: z.id, data: z.data, podmiot_typ: z.typ === "Instytucja" ? "instytucja" : "klient",
      podmiot: z.podmiot, typ: z.typ, powod: z.powod, opis: z.opis, autor: z.autor, waga: z.waga
    })),
    rejestr_aktywnosci: src.rejestr_aktywnosci.map((r) => ({ id: idAkt(), ...r })),
    logowania: src.logowania.map((l) => ({ id: idLog(), ...l })),
    cele: src.cele.map((c, i) => ({ id: "CEL-" + (i + 1), ...c })),
    meta: [
      { klucz: "wersja_schematu", wartosc: "2.0" },
      { klucz: "rok_biezacy", wartosc: "2026" },
      { klucz: "data_biezaca", wartosc: src.meta ? src.meta.data_biezaca : "2026-09-23" },
      { klucz: "haslo_demo", wartosc: HASLO_DEMO }
    ],
    _instById: instById
  };
}
