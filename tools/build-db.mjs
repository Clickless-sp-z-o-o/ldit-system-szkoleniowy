/* ============================================================
   Generator znormalizowanej bazy makiety (makieta/data/db.json)

   Uruchamia stary, deterministyczny generator (legacy-data-gen.js),
   a nastepnie przeksztalca jego wynik do schematu z docs/03-model-danych.md.
   Liczby pozostaja identyczne, bo zrodlem jest ten sam RNG.

   Uruchomienie:  node tools/build-db.mjs
   Wynik:
     makieta/data/db.json      czysty JSON, "plan bazy", zrodlo do wgladu
   Plik db.json jest wejsciem dla tools/build-sqlite.mjs, ktory buduje z niego
   wlasciwa baze SQLite makiety (makieta/db/).
   ============================================================ */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, "..");
const legacyPath = path.join(dir, "legacy-data-gen.js");
const outJson = path.join(root, "makieta", "data", "db.json");

/* ---------- 1. Uruchom stary generator w izolowanym kontekscie ---------- */
function loadLegacyDB() {
  const code = fs.readFileSync(legacyPath, "utf8");
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: "legacy-data-gen.js" });
  return sandbox.window.DB;
}

/* ---------- 2. Przeksztalcenia do schematu docelowego ---------- */

function pupIndex(pupy) {
  const byNazwa = {};
  pupy.forEach((p) => { byNazwa[p.nazwa] = p.id; });
  return byNazwa;
}

function mapUrzedy(pupy) {
  return pupy.map((p) => ({
    id: p.id, nazwa: p.nazwa, wojewodztwo: p.woj, powiat: p.powiat
  }));
}

function mapInstytucje(instytucje) {
  return instytucje.map((i) => ({
    id: i.id,
    nazwa: i.nazwa,
    skrot: i.skrot,
    siedziba_miejscowosc: i.miasto,
    nip: i.nip,
    osoba_kontaktowa: i.kontakt,
    email: i.mail,
    telefon: i.tel,
    opis_dzialalnosci: i.opis,
    standard_godzinowy: i.standard,
    opiekun_ldit: i.opiekun
  }));
}

/* Warunki prowizyjne jako osobna, wersjonowana tabela (D-22) */
function mapWarunki(instytucje) {
  return instytucje.map((i) => ({
    id: "WP-" + i.id.replace("IS-", ""),
    instytucja_id: i.id,
    obowiazuje_od: "2026-01-01",
    obowiazuje_do: null,
    model: i.prowizja.model,
    rodzaj_kumulacji: i.prowizja.kumulacja,
    sposob_liczenia: i.prowizja.sposob,
    stawka_stala: i.prowizja.stala,
    progi: (i.prowizja.progi || []).map((p) => ({ od: p.od, stawka: p.st }))
  }));
}

function mapKatalog(szkolenia) {
  return szkolenia.map((s) => ({
    id: s.id,
    instytucja_id: s.is,
    nazwa: s.nazwa,
    liczba_godzin: s.godz,
    liczba_dni: s.dni,
    tryb: s.tryb,
    cena: s.cena
  }));
}

function mapTerminy(terminy) {
  return terminy.map((t) => ({
    id: t.id,
    instytucja_id: t.is,
    szkolenie_id: t.szk,
    nazwa: t.nazwa,
    data_od: t.od,
    data_do: t.do,
    miejsce: t.miejsce,
    status_realizacji: t.status,
    zapisani: t.zapisani,
    limit: t.limit
  }));
}

function mapKlienci(klienci) {
  return klienci.map((k) => ({
    id: k.id,
    numer_klienta: k.nr,
    nazwa: k.nazwa,
    nip: k.nip,
    wielkosc_przedsiebiorstwa: k.wielkosc,
    liczba_zatrudnionych: k.zatrudnienie,
    osoba_kontaktowa: k.osoba,
    telefon: k.tel,
    email: k.mail,
    instytucja_id: k.is,
    pup_id: k.pup,
    miasto: k.miasto
  }));
}

/* Wniosek: przechowujemy tylko dane wejsciowe i reczne.
   Pola wyliczane (przyznano, calkowita, koszt_z_doplata, wklad_procent)
   odtwarza adapter, zgodnie z zasada "pole wyliczane = regula + wartosc". */
function mapWnioski(wnioski) {
  return wnioski.map((w) => ({
    id: w.id,
    numer: w.nr,
    rok: w.rok,
    klient_id: w.klient,
    instytucja_id: w.is,
    pup_id: w.pup,
    szkolenie_glowne_id: w.szkId,
    koszt_calkowity: w.kosztCalkowity,          // reczne [D-58]
    kwota_doplaty_dodatkowej: w.doplata,        // reczne, domyslnie 0 [D-63]
    prowizja_procent_reczna: null,              // null = obowiazuje regula z warunkow IS
    status_skladania: w.statusSkl,
    status_decyzji: w.statusDec,
    status_finansowy: w.rozliczenie,
    data_wplyniecia_formularza: w.dataFormularza,
    data_wniosku: w.dataWniosku,
    data_wystawienia_faktury: w.dataFaktury
  }));
}

/* Uczestnicy jako osobna tabela, powiazani z wnioskiem [D-53, D-60] */
function mapUczestnicy(wnioski) {
  const out = [];
  wnioski.forEach((w) => {
    (w.uczestnicy || []).forEach((u, idx) => {
      out.push({
        id: "UCZ-" + w.id.replace("PR-", "") + "-" + String(idx + 1).padStart(2, "0"),
        wniosek_id: w.id,
        imie_nazwisko: u.imie,
        pesel: u.pesel,
        szkolenie_id: u.szkolenie,
        kwota: u.kwota,
        status_kwalifikacji: u.status,
        powod_niezakwalifikowania: u.powod || "",
        termin_id: null
      });
    });
  });
  return out;
}

function mapNabory(nabory, pupByNazwa) {
  return nabory.map((n, i) => ({
    id: "NAB-" + String(i + 1).padStart(2, "0"),
    pup_id: pupByNazwa[n.pup] || null,
    rodzaj: n.rodzaj,
    status: n.status,
    data_prognozowana: n.prognoza || "",
    data_od: n.od || "",
    data_do: n.do || "",
    liczba_klientow: n.klientow
  }));
}

function mapFaktury(faktury) {
  return faktury.map((f) => ({
    id: f.nr,
    numer: f.nr,
    instytucja_id: f.isId,
    kwota: f.kwota,
    vat: f.vat,
    data_wystawienia: f.wystawiona,
    termin_platnosci: f.termin,
    status: f.status,
    liczba_projektow: f.projekty
  }));
}

function mapUzytkownicy(uzytkownicy) {
  return uzytkownicy.map((u) => ({
    id: u.login,
    login: u.login,
    imie_nazwisko: u.imie,
    rola: u.rola,
    instytucje: u.inst,
    ostatnie_logowanie: u.ost,
    dwa_fa: u["2fa"]
  }));
}

/* ---------- 3. Parytet pol wyliczanych wniosku ---------- */
function wskaznik(w) { return w === "mikro" ? 0.9 : 0.7; }

function sprawdzParytet(legacyWnioski, klienci) {
  const klById = {};
  klienci.forEach((k) => { klById[k.id] = k; });
  legacyWnioski.forEach((w) => {
    const kl = klById[w.klient];
    const wsk = wskaznik(kl.wielkosc);
    const przyznano = w.statusDec === "Pozytywna" && w.kosztCalkowity != null
      ? Math.round(w.kosztCalkowity * wsk * 100) / 100 : null;
    if (przyznano !== w.przyznano) {
      throw new Error("Parytet przyznano zlamany dla " + w.id + ": " + przyznano + " != " + w.przyznano);
    }
    const wklad = Math.round((1 - wsk) * 100);
    if (wklad !== w.wkladProc) {
      throw new Error("Parytet wkladu zlamany dla " + w.id);
    }
  });
}

/* ---------- 4. Zbuduj i zapisz ---------- */
function build() {
  const DB = loadLegacyDB();
  const pupByNazwa = pupIndex(DB.PUPY);

  sprawdzParytet(DB.WNIOSKI.concat(DB.WNIOSKI_2025), DB.KLIENCI);

  const seed = {
    meta: {
      wersja_schematu: "1.0",
      rok_biezacy: 2026,
      data_biezaca: "2026-08-29",
      opis: "Znormalizowana baza makiety KFS/LDIT wg docs/03-model-danych.md. " +
            "Tabele encji kluczowych maja pola snake_case; tabele pomocnicze (logi, szablony) " +
            "zachowuja nazwy pol widoku. Pola wyliczane odtwarza adapter (assets/db.js)."
    },
    urzedy_pracy: mapUrzedy(DB.PUPY),
    instytucje: mapInstytucje(DB.INSTYTUCJE),
    warunki_prowizyjne: mapWarunki(DB.INSTYTUCJE),
    katalog_szkolen: mapKatalog(DB.SZKOLENIA),
    terminy: mapTerminy(DB.TERMINY),
    klienci: mapKlienci(DB.KLIENCI),
    wnioski: mapWnioski(DB.WNIOSKI.concat(DB.WNIOSKI_2025)),
    uczestnicy: mapUczestnicy(DB.WNIOSKI.concat(DB.WNIOSKI_2025)),
    nabory: mapNabory(DB.NABORY, pupByNazwa),
    faktury: mapFaktury(DB.FAKTURY),
    uzytkownicy: mapUzytkownicy(DB.UZYTKOWNICY),
    /* Tabele pomocnicze: pola zgodne z widokiem, zeby strony czytaly wprost */
    moduly: DB.MODULY.slice(),
    rejestr_aktywnosci: DB.AKTYWNOSC.slice(),
    logowania: DB.LOGOWANIA.slice(),
    zgloszenia: DB.ZGLOSZENIA.slice(),
    szablony_maili: DB.SZABLONY.slice(),
    korespondencja: DB.MAILE.slice(),
    kolejka_zgloszen: DB.KOLEJKA.slice(),
    cele: DB.CELE.slice()
  };

  const json = JSON.stringify(seed, null, 2);
  fs.writeFileSync(outJson, json + "\n", "utf8");

  /* Podsumowanie liczb do weryfikacji parytetu z README */
  const licz = {
    instytucje: seed.instytucje.length,
    klienci: seed.klienci.length,
    wnioski: seed.wnioski.length,
    "wnioski_2026": seed.wnioski.filter((w) => w.rok === "2026").length,
    "wnioski_2025": seed.wnioski.filter((w) => w.rok === "2025").length,
    uczestnicy: seed.uczestnicy.length,
    faktury: seed.faktury.length,
    nabory: seed.nabory.length,
    terminy: seed.terminy.length,
    szkolenia: seed.katalog_szkolen.length
  };
  console.log("Zbudowano seed:");
  console.log(JSON.stringify(licz, null, 2));
  console.log("Zapisano: " + outJson);
}

build();
