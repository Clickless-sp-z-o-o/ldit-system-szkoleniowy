/* ============================================================================
   Konta, role, moduly i uprawnienia bazy startowej.

   Uprawnienia w modelu features wzorowanym na Open Mercato (D-176, D-211):
   katalog features (tabela funkcje, odpowiednik acl.ts) i nadania rolom
   (tabela role_funkcje, odpowiednik role_acls). Feature to "modul.akcja",
   wildcard "modul.*" nadaje wszystkie akcje modulu.
   ============================================================================ */

import { createHash } from "node:crypto";

export const HASLO_DEMO = "demo";
const ITERACJE_SKROTU = 1000;   /* tyle samo co assets/haslo.js */

/* Ten sam skrot co w przegladarce (assets/haslo.js). Sol jest pochodna loginu,
   zeby baza startowa budowala sie powtarzalnie; w aplikacji sol jest losowa. */
export function skrotHasla(haslo, sol) {
  const sha = (t) => createHash("sha256").update(t, "utf8").digest("hex");
  let h = sha(sol + ":" + haslo);
  for (let i = 1; i < ITERACJE_SKROTU; i++) h = sha(h);
  return h;
}
export const solDla = (login) => createHash("sha256").update("kfs-sol:" + login, "utf8").digest("hex").slice(0, 16);

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

/* Dostep do modulow. W modelu features (wzor Open Mercato, D-211) poziom
   "podglad" to feature <modul>.view, a "edycja" to wildcard <modul>.*
   (view i manage). Brak wpisu = modulu nie ma w menu tej roli. */
const DOSTEP = {
  admin:       { dash: "edycja", dofin: "edycja", nabory: "edycja", zadania: "edycja", inst: "edycja",
                 komun: "edycja", admin: "edycja", zglo: "edycja", ustaw: "edycja", terminy: "edycja" },
  pracownik:   { dash: "edycja", dofin: "edycja", nabory: "edycja", zadania: "edycja", inst: "podglad",
                 komun: "edycja", zglo: "edycja" },
  is:          { dash: "podglad", panelIS: "edycja", terminy: "edycja", nabory: "podglad" },
  pracownikIS: { panelIS: "podglad" },
  klient:      { panelKL: "podglad" }
};

/* Features pol i funkcji (odpowiednik acl.ts). Tu egzekwowane sa D-07, D-34,
   D-75, D-76, D-114, D-165 i D-210. Rola bez feature nie widzi pola. */
const POLA = {
  "finanse.kwoty_wniosku":      { opis: "Kwoty wniosku: koszt, przyznano, wkład", role: ["admin", "pracownik", "is", "klient"] },
  "finanse.prowizja":           { opis: "Stawki i kwoty prowizji LDIT", role: ["admin"] },
  "finanse.zysk_ldit":          { opis: "Przychód i zysk LDIT", role: ["admin"] },
  "finanse.faktury":            { opis: "Faktury i ich import", role: ["admin"] },
  "statystyki.zbiorcze":        { opis: "Statystyki całej firmy, wszystkich instytucji", role: ["admin"] },
  "statystyki.wlasne":          { opis: "Statystyki własnego zakresu", role: ["admin", "pracownik", "is"] },
  "klient.pesel":               { opis: "Numery PESEL uczestników", role: ["admin", "pracownik", "is"] },
  "klient.dane_kontaktowe":     { opis: "Dane kontaktowe klienta", role: ["admin", "pracownik", "is", "pracownikIS"] },
  "zgloszenia.dostep":          { opis: "Wewnętrzna baza zgłoszeń", role: ["admin", "pracownik"] },
  "admin.konta":                { opis: "Lista wszystkich kont", role: ["admin"] },
  "admin.rejestr":              { opis: "Rejestr aktywności i logowań", role: ["admin"] },
  "admin.progi_dofinansowania": { opis: "Edycja progów dofinansowania", role: ["admin"] },
  "zestawienia.dodawanie_lat":  { opis: "Dodawanie zakładek lat", role: ["admin", "pracownik"] },
  "zadania.wszystkie":          { opis: "Zadania wszystkich osób, nie tylko własne", role: ["admin"] },
  /* Bez tej feature konto instytucji widzi tylko klientow i wnioski
     przypisane do siebie jako handlowca (D-210) */
  "zakres.cala_instytucja":     { opis: "Wszyscy klienci własnej instytucji, nie tylko przypisani", role: ["is"] }
};

export const FEATURES_POL = Object.keys(POLA);

/* Katalog features: po dwie na modul (view, manage) plus features pol. manage
   zalezy od view, jak dependsOn w acl.ts. */
export function funkcjeRows() {
  const out = [];
  MODULY.forEach((m) => {
    out.push({ id: m.id + ".view", modul_id: m.id, rodzaj: "modul", opis: "Podgląd: " + m.nazwa, zalezy_od: null });
    out.push({ id: m.id + ".manage", modul_id: m.id, rodzaj: "modul", opis: "Edycja: " + m.nazwa, zalezy_od: m.id + ".view" });
  });
  FEATURES_POL.forEach((k) => out.push({ id: k, modul_id: null, rodzaj: "pole", opis: POLA[k].opis, zalezy_od: null }));
  return out;
}

/* Nadania rolom (odpowiednik role_acls.features_json): edycja = wildcard modul.* */
export function roleFunkcjeRows() {
  const out = [];
  Object.keys(DOSTEP).forEach((rola) => {
    Object.keys(DOSTEP[rola]).forEach((modul) => {
      out.push({ rola_id: rola, funkcja: DOSTEP[rola][modul] === "edycja" ? modul + ".*" : modul + ".view" });
    });
  });
  FEATURES_POL.forEach((k) => POLA[k].role.forEach((rola) => out.push({ rola_id: rola, funkcja: k })));
  return out;
}
