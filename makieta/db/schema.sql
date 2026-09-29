-- ============================================================================
-- System KFS / LDIT - schemat bazy danych (SQLite)
-- Zrodlo: docs/03-model-danych.md, decyzje D-01 .. D-147.
-- Ten plik jest jedynym zrodlem prawdy o strukturze danych makiety.
-- Przenosi sie na Postgresa praktycznie bez zmian (TEXT / REAL / INTEGER).
-- ============================================================================

PRAGMA foreign_keys = ON;

-- --------------------------------------------------------------------------
-- 1. SLOWNIKI I KONFIGURACJA
-- --------------------------------------------------------------------------

-- 340 urzedow pracy, zrodlo naborow
CREATE TABLE urzedy_pracy (
  id          TEXT PRIMARY KEY,
  nazwa       TEXT NOT NULL,
  wojewodztwo TEXT NOT NULL,
  powiat      TEXT NOT NULL
);

-- Progi dofinansowania konfigurowalne i wersjonowane data (D-131, koryguje D-59)
CREATE TABLE progi_dofinansowania (
  id                     TEXT PRIMARY KEY,
  wielkosc               TEXT NOT NULL CHECK (wielkosc IN ('mikro','mały','średni','duży','inny')),
  procent_dofinansowania REAL NOT NULL CHECK (procent_dofinansowania BETWEEN 0 AND 100),
  obowiazuje_od          TEXT NOT NULL,
  obowiazuje_do          TEXT
);
CREATE INDEX idx_progi_dof_okres ON progi_dofinansowania (wielkosc, obowiazuje_od);

-- Zakladki roczne Dofinansowan (D-129, D-159). Kolejny rok dodaje administrator
-- albo pracownik LDIT (D-165), bez udzialu wykonawcy. Wniosek bez roku jest
-- "nieprzypisany", a nie znika (D-165).
CREATE TABLE lata_zestawien (
  rok        TEXT PRIMARY KEY CHECK (length(rok) = 4 AND rok GLOB '[0-9][0-9][0-9][0-9]'),
  opis       TEXT,
  utworzono  TEXT NOT NULL,
  utworzyl   TEXT
);

-- --------------------------------------------------------------------------
-- 2. INSTYTUCJE SZKOLENIOWE I ICH WARUNKI
-- --------------------------------------------------------------------------

CREATE TABLE instytucje (
  id                   TEXT PRIMARY KEY,
  nazwa                TEXT NOT NULL,
  skrot                TEXT,
  siedziba_miejscowosc TEXT,          -- zrodlo pola "miejscowosc" na certyfikacie (D-99)
  nip                  TEXT,
  strona_www           TEXT,
  -- Do trzech osob kontaktowych instytucji (D-166). Pierwsza jest glowna.
  osoba_kontaktowa     TEXT,
  email                TEXT,
  telefon              TEXT,
  osoba_kontaktowa_2   TEXT,
  email_2              TEXT,
  telefon_2            TEXT,
  osoba_kontaktowa_3   TEXT,
  email_3              TEXT,
  telefon_3            TEXT,
  opis_dzialalnosci    TEXT,
  standard_godzinowy   TEXT,
  opiekun_ldit         TEXT,
  model_terminow       TEXT NOT NULL DEFAULT 'kalendarz'
                       CHECK (model_terminow IN ('kalendarz','z_gory')),  -- D-142
  aktywna              INTEGER NOT NULL DEFAULT 1
);

-- Szkoleniowcy instytucji (D-167). Jedna instytucja ma wielu szkoleniowcow,
-- kazdy z wlasnymi danymi kontaktowymi.
CREATE TABLE szkoleniowcy (
  id            TEXT PRIMARY KEY,
  instytucja_id TEXT NOT NULL REFERENCES instytucje (id) ON DELETE CASCADE,
  imie          TEXT NOT NULL,
  nazwisko      TEXT NOT NULL,
  telefon       TEXT,
  email         TEXT,
  specjalizacja TEXT,
  aktywny       INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX idx_szkoleniowcy_inst ON szkoleniowcy (instytucja_id);

-- Warunki prowizyjne wersjonowane w czasie (D-22). obowiazuje_do NULL = aktualne.
-- Nowa wersja dziala od swojej daty, nigdy wstecz (D-23, D-162).
-- Progi leza w tej samej tabeli jako lista JSON [{"od": kwota, "st": stawka}],
-- zamiast osobnej tabeli progow (D-168).
CREATE TABLE warunki_prowizyjne (
  id               TEXT PRIMARY KEY,
  instytucja_id    TEXT NOT NULL REFERENCES instytucje (id) ON DELETE CASCADE,
  obowiazuje_od    TEXT NOT NULL,
  obowiazuje_do    TEXT,
  model            TEXT NOT NULL CHECK (model IN ('A','B','C','D')),
  rodzaj_kumulacji TEXT NOT NULL CHECK (rodzaj_kumulacji IN ('miesieczny','roczny','brak')),
  sposob_liczenia  TEXT NOT NULL CHECK (sposob_liczenia IN ('od_calosci','od_nadwyzki','stala')),
  stawka_stala     REAL,
  progi            TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(progi) AND json_type(progi) = 'array')
);
CREATE INDEX idx_warunki_inst ON warunki_prowizyjne (instytucja_id, obowiazuje_od);

-- Szablon szkolenia (D-06). Realizacje sa w tabeli terminy.
CREATE TABLE katalog_szkolen (
  id             TEXT PRIMARY KEY,
  instytucja_id  TEXT NOT NULL REFERENCES instytucje (id) ON DELETE CASCADE,
  nazwa          TEXT NOT NULL,
  liczba_godzin  INTEGER,
  liczba_dni     INTEGER,
  tryb           TEXT CHECK (tryb IN ('Online','Stacjonarne','Mieszane')),
  cena           REAL,
  plan_szkolenia TEXT
);
CREATE INDEX idx_szkolenia_inst ON katalog_szkolen (instytucja_id);

-- Termin = realizacja szablonu. Kalendarz per instytucja (D-142).
CREATE TABLE terminy (
  id                TEXT PRIMARY KEY,
  instytucja_id     TEXT NOT NULL REFERENCES instytucje (id) ON DELETE CASCADE,
  szkolenie_id      TEXT NOT NULL REFERENCES katalog_szkolen (id),
  nazwa             TEXT,
  data_od           TEXT,
  data_do           TEXT,
  miejsce           TEXT,
  status_realizacji TEXT CHECK (status_realizacji IN ('Wolny','Zaplanowany','Odbyty')),
  zapisani          INTEGER NOT NULL DEFAULT 0,
  limit_miejsc      INTEGER
);
CREATE INDEX idx_terminy_inst ON terminy (instytucja_id, data_od);

-- --------------------------------------------------------------------------
-- 3. KLIENCI I WNIOSKI
-- --------------------------------------------------------------------------

-- Dane stale klienta. Z bazy nie usuwa sie nikogo (warsztat 04.09, 1:13:37).
-- Dane zmienne w czasie (liczba zatrudnionych, kontakt do sprawy) leza we
-- wniosku (D-169). Klient pozyskany przez instytucje skladna wnioski.
CREATE TABLE klienci (
  id                        TEXT PRIMARY KEY,
  numer_klienta             INTEGER NOT NULL,   -- sekwencyjny w roku, trafia na fakture (D-112)
  nazwa                     TEXT NOT NULL,
  nip                       TEXT,
  wielkosc_przedsiebiorstwa TEXT CHECK (wielkosc_przedsiebiorstwa IN ('mikro','mały','średni','duży','inny')),
  -- Do trzech osob kontaktowych klienta (D-169). Pierwsza jest glowna.
  osoba_kontaktowa          TEXT,
  telefon                   TEXT,
  email                     TEXT,
  osoba_kontaktowa_2        TEXT,
  telefon_2                 TEXT,
  email_2                   TEXT,
  osoba_kontaktowa_3        TEXT,
  telefon_3                 TEXT,
  email_3                   TEXT,
  miasto                    TEXT,
  adres_siedziby            TEXT,
  instytucja_id             TEXT REFERENCES instytucje (id),  -- instytucja, ktora pozyskala
  pup_id                    TEXT REFERENCES urzedy_pracy (id),
  zainteresowany_naborem    INTEGER NOT NULL DEFAULT 0,       -- flaga kolejnego naboru (D-130)
  utworzono                 TEXT                              -- poczatek biegu retencji (D-186)
);
CREATE INDEX idx_klienci_nip ON klienci (nip);
CREATE INDEX idx_klienci_inst ON klienci (instytucja_id);
CREATE INDEX idx_klienci_nazwa ON klienci (nazwa);

-- Jeden klient moze byc przypisany do wielu instytucji (D-144), kazda widzi go
-- wylacznie we wlasnym kontekscie. To jest tabela egzekwujaca separacje.
-- handlowiec_id: handlowiec instytucji prowadzacy klienta. Konto bez feature
-- zakres.cala_instytucja widzi wylacznie swoich klientow (D-210).
CREATE TABLE klient_instytucja (
  klient_id     TEXT NOT NULL REFERENCES klienci (id) ON DELETE CASCADE,
  instytucja_id TEXT NOT NULL REFERENCES instytucje (id) ON DELETE CASCADE,
  handlowiec_id TEXT REFERENCES uzytkownicy (id) ON DELETE SET NULL,
  PRIMARY KEY (klient_id, instytucja_id)
);

CREATE TABLE nabory (
  id                TEXT PRIMARY KEY,
  pup_id            TEXT NOT NULL REFERENCES urzedy_pracy (id),
  rodzaj            TEXT NOT NULL,   -- KFS, powiatowy, inne; model dopuszcza kolejne
  status            TEXT,
  data_prognozowana TEXT,
  data_od           TEXT,
  data_do           TEXT,
  liczba_klientow   INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_nabory_pup ON nabory (pup_id);

-- Faktura z importu CSV systemu ksiegowego (D-163). Szczegoly szkolenia nie sa
-- kopiowane, widok v_faktura_szczegoly bierze je z wnioskow (D-170).
-- Korekta trafia do okresu swojej daty wystawienia, nie pierwotnej (D-161).
CREATE TABLE faktury (
  id               TEXT PRIMARY KEY,
  numer            TEXT NOT NULL,
  instytucja_id    TEXT NOT NULL REFERENCES instytucje (id),
  klient_id        TEXT REFERENCES klienci (id),
  rodzaj           TEXT NOT NULL DEFAULT 'zwykla' CHECK (rodzaj IN ('zwykla','korygujaca')),
  faktura_pierwotna_id TEXT REFERENCES faktury (id),
  kwota            REAL NOT NULL,
  vat              TEXT,
  data_wystawienia TEXT,
  termin_platnosci TEXT,
  status           TEXT,
  liczba_projektow INTEGER NOT NULL DEFAULT 0,
  plik_pdf         TEXT,              -- PDF z importu, dolaczany do paczki ZIP (D-183)
  CHECK ((rodzaj = 'korygujaca') = (faktura_pierwotna_id IS NOT NULL))
);
CREATE INDEX idx_faktury_inst ON faktury (instytucja_id, data_wystawienia);
CREATE INDEX idx_faktury_klient ON faktury (klient_id);

-- Wniosek = projekt (D-53). Jeden klient ma wiele wnioskow.
-- Odwrocenie wyliczen z D-134: recznie wpisujemy koszt Z DOPLATA, a koszt
-- calkowity jest roznica. Kolumny *_regula_aktywna realizuja zasade D-19:
-- reczna edycja kasuje regule, przycisk "Przywroc regule" ja odtwarza.
CREATE TABLE wnioski (
  id                        TEXT PRIMARY KEY,
  numer                     INTEGER NOT NULL,
  rok                       TEXT REFERENCES lata_zestawien (rok) ON DELETE SET NULL,  -- NULL = nieprzypisany (D-165)
  klient_id                 TEXT NOT NULL REFERENCES klienci (id),
  instytucja_id             TEXT NOT NULL REFERENCES instytucje (id),
  pup_id                    TEXT REFERENCES urzedy_pracy (id),
  nabor_id                  TEXT REFERENCES nabory (id),
  szkolenie_glowne_id       TEXT REFERENCES katalog_szkolen (id),
  faktura_id                TEXT REFERENCES faktury (id),          -- numer przy wniosku (D-139)
  handlowiec_id             TEXT REFERENCES uzytkownicy (id) ON DELETE SET NULL,  -- D-210
  etap                      INTEGER NOT NULL DEFAULT 3 CHECK (etap BETWEEN 1 AND 10),  -- D-146

  -- Dane zmienne klienta na poziomie wniosku (D-132, D-133, D-169). NULL = bierz z klienta.
  -- Po adresach e-mail wniosku dopasowywana jest korespondencja (D-178).
  wielkosc_przedsiebiorstwa TEXT CHECK (wielkosc_przedsiebiorstwa IN ('mikro','mały','średni','duży','inny')),
  liczba_zatrudnionych      INTEGER,          -- na dzien wniosku (D-169), wyznacza wielkosc
  osoba_kontaktowa          TEXT,
  telefon                   TEXT,
  email                     TEXT,
  osoba_kontaktowa_2        TEXT,
  telefon_2                 TEXT,
  email_2                   TEXT,

  -- Prog dofinansowania wybrany we wniosku (D-171). Regula dobiera go sama
  -- z wielkosci i daty, reczny wybor wylacza regule (D-19).
  prog_dofinansowania_id    TEXT REFERENCES progi_dofinansowania (id),
  prog_regula_aktywna       INTEGER NOT NULL DEFAULT 1,

  -- Finanse. Reczne: koszt z doplata (D-134) i doplata dodatkowa (D-63).
  koszt_calkowity_z_doplata REAL,
  kwota_doplaty_dodatkowej  REAL NOT NULL DEFAULT 0,
  koszt_calkowity           REAL,                          -- wyliczane: z_doplata - doplata
  koszt_regula_aktywna      INTEGER NOT NULL DEFAULT 1,
  przyznano                 REAL,                          -- wyliczane, edytowalne (D-135)
  przyznano_regula_aktywna  INTEGER NOT NULL DEFAULT 1,
  wklad_wlasny              REAL,                          -- reszta, nadpisywalna (D-172, D-173)
  wklad_regula_aktywna      INTEGER NOT NULL DEFAULT 1,
  doplata_na_fakturze_kfs   INTEGER NOT NULL DEFAULT 1,    -- 1 = doplata w podstawie prowizji (D-174)

  -- Prowizja: nadpisanie per wniosek jako procent ALBO kwota (D-136), tylko admin (D-93).
  prowizja_regula_aktywna   INTEGER NOT NULL DEFAULT 1,
  prowizja_typ_nadpisania   TEXT CHECK (prowizja_typ_nadpisania IN ('procent','kwota')),
  prowizja_wartosc          REAL,

  status_skladania           TEXT,
  status_decyzji             TEXT,
  status_finansowy           TEXT,
  data_wplyniecia_formularza TEXT,   -- rejestrowana automatycznie (D-94)
  data_wniosku               TEXT,
  data_wystawienia_faktury   TEXT,   -- wyznacza okres rozliczeniowy prowizji (D-13)
  data_aktualizacji          TEXT
);
CREATE INDEX idx_wnioski_klient ON wnioski (klient_id);
CREATE INDEX idx_wnioski_inst_rok ON wnioski (instytucja_id, rok);
CREATE INDEX idx_wnioski_faktura ON wnioski (data_wystawienia_faktury);
CREATE INDEX idx_wnioski_faktura_id ON wnioski (faktura_id);

-- Uczestnik wniosku. Jeden wniosek moze obejmowac kilka roznych szkolen (D-78).
-- Do sumy wartosci wchodza wylacznie zakwalifikowani (D-61, D-79).
CREATE TABLE uczestnicy (
  id                        TEXT PRIMARY KEY,
  wniosek_id                TEXT NOT NULL REFERENCES wnioski (id) ON DELETE CASCADE,
  imie_nazwisko             TEXT NOT NULL,
  pesel                     TEXT,     -- dane wrazliwe, widocznosc wg uprawnienia_pol
  szkolenie_id              TEXT REFERENCES katalog_szkolen (id),
  termin_id                 TEXT REFERENCES terminy (id),
  kwota                     REAL NOT NULL DEFAULT 0,
  status_kwalifikacji       TEXT NOT NULL DEFAULT 'zakwalifikowany'
                            CHECK (status_kwalifikacji IN ('zakwalifikowany','niezakwalifikowany')),
  powod_niezakwalifikowania TEXT,
  utworzono                 TEXT      -- poczatek biegu retencji danych osobowych (D-186)
);
CREATE INDEX idx_uczestnicy_wniosek ON uczestnicy (wniosek_id);

-- --------------------------------------------------------------------------
-- 4. KONTA, ROLE I UPRAWNIENIA
-- --------------------------------------------------------------------------

CREATE TABLE role (
  id        TEXT PRIMARY KEY,
  nazwa     TEXT NOT NULL,
  opis      TEXT,
  zakres    TEXT NOT NULL CHECK (zakres IN ('ldit','instytucja','klient')),  -- D-35
  systemowa INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE moduly (
  id        TEXT PRIMARY KEY,
  nazwa     TEXT NOT NULL,
  plik      TEXT,
  ikona     TEXT,
  grupa     TEXT,
  kolejnosc INTEGER NOT NULL DEFAULT 0
);

-- Katalog uprawnien w modelu features Open Mercato (D-176, D-211), odpowiednik
-- acl.ts: "modul.view" i "modul.manage" dla kazdego modulu (D-36) oraz
-- features pol (finanse.prowizja, klient.pesel...), ktorych framework nie ma
-- i ktore dobudowujemy (D-149). manage zalezy od view.
CREATE TABLE funkcje (
  id        TEXT PRIMARY KEY CHECK (id GLOB '?*.?*'),
  modul_id  TEXT REFERENCES moduly (id) ON DELETE CASCADE,
  rodzaj    TEXT NOT NULL CHECK (rodzaj IN ('modul','pole')),
  opis      TEXT NOT NULL,
  zalezy_od TEXT REFERENCES funkcje (id)
);

-- Nadania rolom, odpowiednik role_acls.features_json. Wartosc to feature albo
-- wildcard "modul.*" (wszystkie akcje modulu). Brak nadania = brak dostepu.
CREATE TABLE role_funkcje (
  rola_id TEXT NOT NULL REFERENCES role (id) ON DELETE CASCADE,
  funkcja TEXT NOT NULL CHECK (funkcja GLOB '?*.?*'),
  PRIMARY KEY (rola_id, funkcja)
);

CREATE TABLE uzytkownicy (
  id                   TEXT PRIMARY KEY,
  login                TEXT NOT NULL UNIQUE,
  -- Haslo nigdy jawnie: skrot z sola (assets/haslo.js). Docelowo bcrypt z frameworka (D-176).
  haslo_skrot          TEXT NOT NULL,
  haslo_sol            TEXT NOT NULL,
  nieudane_proby       INTEGER NOT NULL DEFAULT 0,        -- licznik do blokady czasowej
  zablokowane_do       TEXT,                              -- blokada po serii nieudanych prob
  imie_nazwisko        TEXT NOT NULL,
  rola_id              TEXT NOT NULL REFERENCES role (id),
  instytucja_id        TEXT REFERENCES instytucje (id),  -- konto IS: macierzysta instytucja
  klient_id            TEXT REFERENCES klienci (id),     -- konto klienta koncowego (P-33)
  wszystkie_instytucje INTEGER NOT NULL DEFAULT 0,       -- konto bez ograniczenia (D-113)
  ostatnie_logowanie   TEXT,
  dwa_fa               INTEGER NOT NULL DEFAULT 0,
  zablokowane          INTEGER NOT NULL DEFAULT 0        -- admin LDIT blokuje konta IS (D-126)
);

-- Sesja logowania. Przegladarka trzyma wylacznie token, a rola i zakres sa
-- przy kazdym odczycie brane z bazy, wiec edycja pamieci przegladarki nie
-- podnosi uprawnien (D-179). Wzorzec tabeli sessions z Open Mercato.
CREATE TABLE sesje (
  token              TEXT PRIMARY KEY,
  uzytkownik_id      TEXT NOT NULL REFERENCES uzytkownicy (id) ON DELETE CASCADE,
  utworzono          TEXT NOT NULL,
  wygasa             TEXT NOT NULL,
  ostatnia_aktywnosc TEXT NOT NULL
);
CREATE INDEX idx_sesje_uzytkownik ON sesje (uzytkownik_id);

-- Przydzial pracownika LDIT do instytucji (D-113). Brak wiersza = brak dostepu.
CREATE TABLE uzytkownik_instytucja (
  uzytkownik_id TEXT NOT NULL REFERENCES uzytkownicy (id) ON DELETE CASCADE,
  instytucja_id TEXT NOT NULL REFERENCES instytucje (id) ON DELETE CASCADE,
  PRIMARY KEY (uzytkownik_id, instytucja_id)
);

-- --------------------------------------------------------------------------
-- 5. PRACA BIEZACA, KOMUNIKACJA, AUDYT
-- --------------------------------------------------------------------------

-- Przebieg wniosku budowany z logow zmian etapu (D-145), zrodlo timeline'u.
CREATE TABLE przebieg_wniosku (
  id            TEXT PRIMARY KEY,
  wniosek_id    TEXT NOT NULL REFERENCES wnioski (id) ON DELETE CASCADE,
  czas          TEXT NOT NULL,
  etap_z        INTEGER,
  etap_do       INTEGER NOT NULL,
  komentarz     TEXT,
  uzytkownik_id TEXT REFERENCES uzytkownicy (id)
);
CREATE INDEX idx_przebieg_wniosek ON przebieg_wniosku (wniosek_id, czas);

-- Modul zadan i powiadomien wrocil do zakresu (D-140, odwraca D-118).
CREATE TABLE zadania (
  id             TEXT PRIMARY KEY,
  tytul          TEXT NOT NULL,
  typ            TEXT NOT NULL CHECK (typ IN ('reczne','automatyczne')),
  wniosek_id     TEXT REFERENCES wnioski (id) ON DELETE CASCADE,
  przypisane_do  TEXT REFERENCES uzytkownicy (id),
  termin         TEXT,
  status         TEXT NOT NULL DEFAULT 'otwarte' CHECK (status IN ('otwarte','zrobione','anulowane')),
  zrodlo_statusu TEXT   -- status wniosku, ktory wygenerowal zadanie automatyczne
);
CREATE INDEX idx_zadania_termin ON zadania (status, termin);

CREATE TABLE notatki (
  id            TEXT PRIMARY KEY,
  klient_id     TEXT REFERENCES klienci (id) ON DELETE CASCADE,
  instytucja_id TEXT REFERENCES instytucje (id) ON DELETE CASCADE,
  czas          TEXT NOT NULL,
  autor_id      TEXT REFERENCES uzytkownicy (id),
  tresc         TEXT NOT NULL
);

-- Korespondencja wspolna dla wszystkich wnioskow klienta (D-53, warsztat 1:46:06)
CREATE TABLE korespondencja (
  id            TEXT PRIMARY KEY,
  klient_id     TEXT REFERENCES klienci (id) ON DELETE CASCADE,
  instytucja_id TEXT REFERENCES instytucje (id) ON DELETE CASCADE,
  data          TEXT NOT NULL,
  kierunek      TEXT,
  od_kogo       TEXT,
  temat         TEXT,
  skrzynka      TEXT,
  zalaczniki    INTEGER NOT NULL DEFAULT 0
);

-- Formularze zgloszeniowe czekajace na akceptacje. Bramka anty-spam (D-105),
-- zrodlo licznika "wnioski oczekujace na akceptacje" (D-140). Po akceptacji
-- rekord staje sie klientem i wnioskiem.
CREATE TABLE formularze_oczekujace (
  id            TEXT PRIMARY KEY,
  data          TEXT NOT NULL,
  firma         TEXT NOT NULL,
  nip           TEXT,
  instytucja_id TEXT REFERENCES instytucje (id) ON DELETE CASCADE,
  osob          INTEGER NOT NULL DEFAULT 0,
  szkolenie     TEXT,
  kontakt       TEXT,
  wypelnil      TEXT NOT NULL DEFAULT 'klient' CHECK (wypelnil IN ('klient','handlowiec')),  -- D-181
  handlowiec_id TEXT REFERENCES uzytkownicy (id) ON DELETE SET NULL,  -- D-210
  status        TEXT NOT NULL DEFAULT 'oczekuje'
                CHECK (status IN ('oczekuje','zaakceptowany','odrzucony'))
);
CREATE INDEX idx_formularze_inst ON formularze_oczekujace (instytucja_id, status);

CREATE TABLE szablony_maili (
  id       TEXT PRIMARY KEY,
  nazwa    TEXT NOT NULL,
  odbiorca TEXT,
  autor    TEXT,
  uzyc     INTEGER NOT NULL DEFAULT 0,
  tresc    TEXT
);

-- Wewnetrzna baza incydentow, wylacznie admin i pracownicy LDIT (D-107)
CREATE TABLE zgloszenia (
  id          TEXT PRIMARY KEY,
  data        TEXT NOT NULL,
  podmiot_typ TEXT,
  podmiot     TEXT NOT NULL,
  typ         TEXT,
  powod       TEXT,
  opis        TEXT,
  autor       TEXT,
  waga        TEXT
);

-- Rejestr zmian: kto, co i kiedy zmienil (D-32)
CREATE TABLE rejestr_aktywnosci (
  id     TEXT PRIMARY KEY,
  czas   TEXT NOT NULL,
  kto    TEXT NOT NULL,
  typ    TEXT,
  obiekt TEXT,
  pole   TEXT,
  przed  TEXT,
  po     TEXT
);
CREATE INDEX idx_aktywnosc_czas ON rejestr_aktywnosci (czas);

CREATE TABLE logowania (
  id         TEXT PRIMARY KEY,
  czas       TEXT NOT NULL,
  kto        TEXT NOT NULL,
  ip         TEXT,
  wynik      TEXT,
  urzadzenie TEXT
);

CREATE TABLE cele (
  id      TEXT PRIMARY KEY,
  nazwa   TEXT NOT NULL,
  cel     REAL NOT NULL,
  obecnie REAL NOT NULL DEFAULT 0,
  premia  TEXT,
  status  TEXT
);

-- Podsumowania liczbowe lat, ktorych wnioskow nie przenosimy (D-129, D-160).
-- Zrodlo porownan rok do roku na dashboardzie (D-175). instytucja_id NULL = calosc.
CREATE TABLE podsumowania_historyczne (
  id            TEXT PRIMARY KEY,
  rok           TEXT NOT NULL,
  instytucja_id TEXT REFERENCES instytucje (id) ON DELETE CASCADE,
  miara         TEXT NOT NULL CHECK (miara IN ('wnioski_zlozone','wnioski_pozytywne','kwota_przyznana','obrot','prowizja')),
  wartosc       REAL NOT NULL,
  zrodlo        TEXT,
  UNIQUE (rok, instytucja_id, miara)
);

CREATE TABLE meta (
  klucz   TEXT PRIMARY KEY,
  wartosc TEXT
);
