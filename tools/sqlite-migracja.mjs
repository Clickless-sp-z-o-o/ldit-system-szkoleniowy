/* ============================================================================
   Migracja danych makiety: db.json (stara, plaska struktura) -> tabele SQLite
   opisane w makieta/db/schema.sql.

   Zasada nadrzedna: liczby widoczne w makiecie nie moga sie zmienic. Dlatego
   przy odwroceniu wyliczen (D-134) przepisujemy stary "koszt_calkowity" na nowy
   "koszt_calkowity_z_doplata" powiekszony o doplate, zeby roznica dala z powrotem
   dokladnie te sama wartosc.
   ============================================================================ */

import { czyMigrowany, lataZestawienRows, podsumowaniaRows, progiDofinansowaniaRows, szkoleniowcyRows } from "./migracja-slowniki.mjs";
import { propozycjeZmianRows, szczegolyFormularza } from "./migracja-akceptacje.mjs";
import { funkcjeRows, HASLO_DEMO, MODULY, roleFunkcjeRows, ROLE, skrotHasla, solDla } from "./migracja-uprawnienia.mjs";

export { czyMigrowany };

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

  /* Progi prowizyjne leza przy warunkach jako lista JSON (D-168) */
  const warunki = src.warunki_prowizyjne.map((w) => {
    const { progi, ...reszta } = w;
    return { ...reszta, progi: JSON.stringify((progi || []).map((p) => ({ od: p.od, st: p.stawka }))) };
  });

  const katalog_szkolen = src.katalog_szkolen.map((s) => ({ ...s, plan_szkolenia: null }));
  const terminy = src.terminy.map((t) => {
    const { limit, ...reszta } = t;
    return { ...reszta, limit_miejsc: limit };
  });

  /* Flaga zainteresowania kolejnym naborem (D-130), deterministycznie co trzeci klient */
  /* Liczba zatrudnionych przechodzi z klienta do jego wnioskow (D-169) */
  const zatrudnieniKlienta = Object.fromEntries(src.klienci.map((k) => [k.id, k.liczba_zatrudnionych]));
  const pierwszyWniosek = {};
  src.wnioski.filter(czyMigrowany).forEach((w) => {
    const d = w.data_wplyniecia_formularza || w.data_wniosku;
    if (d && (!pierwszyWniosek[w.klient_id] || d < pierwszyWniosek[w.klient_id])) pierwszyWniosek[w.klient_id] = d;
  });
  const DATA_STARTU_BAZY = "2026-01-02";
  const klienci = src.klienci.map((k) => {
    const { liczba_zatrudnionych, ...reszta } = k;
    return { ...reszta, adres_siedziby: null, zainteresowany_naborem: k.numer_klienta % 3 === 0 ? 1 : 0,
             utworzono: pierwszyWniosek[k.id] || DATA_STARTU_BAZY };
  });

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
  const wnioski = src.wnioski.filter(czyMigrowany).map((w) => {
    const doplata = w.kwota_doplaty_dodatkowej || 0;
    const kosztStary = w.koszt_calkowity;
    return {
      id: w.id, numer: w.numer, rok: w.rok,
      klient_id: w.klient_id, instytucja_id: w.instytucja_id, pup_id: w.pup_id,
      nabor_id: null, szkolenie_glowne_id: w.szkolenie_glowne_id, faktura_id: null,
      etap: etapWniosku(w),
      wielkosc_przedsiebiorstwa: null, osoba_kontaktowa: null, telefon: null, email: null,
      liczba_zatrudnionych: zatrudnieniKlienta[w.klient_id] == null ? null : zatrudnieniKlienta[w.klient_id],
      prog_regula_aktywna: 1, wklad_regula_aktywna: 1, doplata_na_fakturze_kfs: 1,
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
  const idWnioskow = new Set(wnioski.map((w) => w.id));
  /* Uczestnik bez terminu dostaje pierwszy termin swojego szkolenia, zeby kalendarz
     terminow pokazywal realne zapisy z tabeli uczestnikow */
  const terminDlaSzkolenia = {};
  terminy.forEach((t) => { if (!terminDlaSzkolenia[t.szkolenie_id]) terminDlaSzkolenia[t.szkolenie_id] = t.id; });
  const dataWniosku = Object.fromEntries(wnioski.map((w) => [w.id, w.data_wplyniecia_formularza || w.data_wniosku]));

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
      id: u.id, login: u.login, haslo_sol: solDla(u.login), haslo_skrot: skrotHasla(HASLO_DEMO, solDla(u.login)),
      imie_nazwisko: u.imie_nazwisko,
      rola_id, instytucja_id, klient_id: null, wszystkie_instytucje: wszystkie,
      ostatnie_logowanie: u.ostatnie_logowanie, dwa_fa: u.dwa_fa ? 1 : 0, zablokowane: 0
    };
  });

  /* Konto klienta koncowego. Panel klienta jest modulem o nierozstrzygnietym
     zakresie (P-33), ale konto musi istniec, zeby dalo sie pokazac, ile
     dokladnie widzi klient po zalogowaniu. */
  const pierwszyKlient = klienci[0];
  const loginKlienta = "kontakt@" + pierwszyKlient.nazwa.toLowerCase().replace(/[^a-z0-9]+/g, "") + ".pl";
  uzytkownicy.push({
    id: loginKlienta, login: loginKlienta,
    haslo_sol: solDla(loginKlienta), haslo_skrot: skrotHasla(HASLO_DEMO, solDla(loginKlienta)),
    imie_nazwisko: pierwszyKlient.osoba_kontaktowa,
    rola_id: "klient", instytucja_id: null, klient_id: pierwszyKlient.id,
    wszystkie_instytucje: 0, ostatnie_logowanie: null, dwa_fa: 0, zablokowane: 0
  });

  /* Handlowcy instytucji (D-210): konto Pracownik IS prowadzi co drugiego
     klienta swojej instytucji i jego wnioski w tej instytucji */
  const handlowcy = uzytkownicy.filter((u) => u.rola_id === "pracownikIS" && u.instytucja_id);
  const handlowiecKlienta = {};
  handlowcy.forEach((h) => {
    klient_instytucja.filter((ki) => ki.instytucja_id === h.instytucja_id).forEach((ki, i) => {
      if (i % 2 === 0) { ki.handlowiec_id = h.id; handlowiecKlienta[ki.klient_id + "|" + ki.instytucja_id] = h.id; }
    });
  });
  wnioski.forEach((w) => { w.handlowiec_id = handlowiecKlienta[w.klient_id + "|" + w.instytucja_id] || null; });

  const seq = (pref) => { let n = 0; return () => pref + "-" + String(++n).padStart(4, "0"); };
  const idAkt = seq("AKT"), idLog = seq("LOG"), idKor = seq("KOR");

  return {
    urzedy_pracy: src.urzedy_pracy,
    lata_zestawien: lataZestawienRows(),
    progi_dofinansowania: progiDofinansowaniaRows(),
    instytucje,
    warunki_prowizyjne: warunki,
    szkoleniowcy: szkoleniowcyRows(src.instytucje),
    katalog_szkolen,
    terminy,
    klienci,
    klient_instytucja,
    nabory: src.nabory,
    faktury: src.faktury.map((f) => ({ ...f, rodzaj: "zwykla", klient_id: null, faktura_pierwotna_id: null })),
    wnioski,
    uczestnicy: src.uczestnicy.filter((u) => idWnioskow.has(u.wniosek_id))
      .map((u) => ({ ...u, utworzono: dataWniosku[u.wniosek_id] || DATA_STARTU_BAZY,
                     termin_id: u.termin_id || terminDlaSzkolenia[u.szkolenie_id] || null })),
    role: ROLE,
    moduly: MODULY,
    funkcje: funkcjeRows(),
    role_funkcje: roleFunkcjeRows(),
    uzytkownicy,
    uzytkownik_instytucja,
    przebieg_wniosku: [],
    zadania: [],
    notatki: [],
    pliki_szkolen: [],
    propozycje_zmian: propozycjeZmianRows(instytucje, klienci, uzytkownicy),
    korespondencja: src.korespondencja.map((k) => ({
      id: idKor(), klient_id: null, instytucja_id: null, data: k.data,
      kierunek: k.kier === "in" ? "przychodzacy" : "wychodzacy",
      od_kogo: k.od, temat: k.temat, skrzynka: k.skrz, zalaczniki: k.zal
    })),
    formularze_oczekujace: src.kolejka_zgloszen.map((k, i) => ({
      id: "FO-" + String(i + 1).padStart(3, "0"), data: k.data, firma: k.firma, nip: k.nip,
      instytucja_id: instByNazwa[k.is] || null, osob: k.osob, szkolenie: k.szkolenie,
      kontakt: k.kontakt, status: "oczekuje", ...szczegolyFormularza(k, i),
      /* co trzeci formularz instytucji z handlowcem wypelnil handlowiec (D-181, D-210) */
      ...(() => {
        const h = handlowcy.find((x) => x.instytucja_id === instByNazwa[k.is]);
        return h && i % 3 === 0 ? { wypelnil: "handlowiec", handlowiec_id: h.id } : { wypelnil: "klient", handlowiec_id: null };
      })()
    })),
    szablony_maili: src.szablony_maili.map((s) => ({ ...s, tresc: null })),
    zgloszenia: src.zgloszenia.map((z) => ({
      id: z.id, data: z.data, podmiot_typ: z.typ === "Instytucja" ? "instytucja" : "klient",
      podmiot: z.podmiot, typ: z.typ, powod: z.powod, opis: z.opis, autor: z.autor, waga: z.waga
    })),
    rejestr_aktywnosci: src.rejestr_aktywnosci.map((r) => ({ id: idAkt(), ...r })),
    logowania: src.logowania.map((l) => ({ id: idLog(), ...l })),
    cele: src.cele.map((c, i) => ({ id: "CEL-" + (i + 1), ...c })),
    podsumowania_historyczne: podsumowaniaRows(src.wnioski),
    meta: [
      { klucz: "wersja_schematu", wartosc: "2.0" },
      { klucz: "rok_biezacy", wartosc: "2026" },
      { klucz: "data_biezaca", wartosc: src.meta ? src.meta.data_biezaca : "2026-09-23" },
      { klucz: "haslo_demo", wartosc: HASLO_DEMO }
    ],
    _instById: instById
  };
}
