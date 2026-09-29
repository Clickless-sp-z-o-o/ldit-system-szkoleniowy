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
-- sam, bez udzialu wykonawcy. Wniosek moze nalezec tylko do istniejacego roku.
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
  osoba_kontaktowa     TEXT,
  email                TEXT,
  telefon              TEXT,
  opis_dzialalnosci    TEXT,
  standard_godzinowy   TEXT,
  opiekun_ldit         TEXT,
  model_terminow       TEXT NOT NULL DEFAULT 'kalendarz'
                       CHECK (model_terminow IN ('kalendarz','z_gory')),  -- D-142
  aktywna              INTEGER NOT NULL DEFAULT 1
);

-- Warunki prowizyjne wersjonowane w czasie (D-22). obowiazuje_do NULL = aktualne.
CREATE TABLE warunki_prowizyjne (
  id               TEXT PRIMARY KEY,
  instytucja_id    TEXT NOT NULL REFERENCES instytucje (id) ON DELETE CASCADE,
  obowiazuje_od    TEXT NOT NULL,
  obowiazuje_do    TEXT,
  model            TEXT NOT NULL CHECK (model IN ('A','B','C','D')),
  rodzaj_kumulacji TEXT NOT NULL CHECK (rodzaj_kumulacji IN ('miesieczny','roczny','brak')),
  sposob_liczenia  TEXT NOT NULL CHECK (sposob_liczenia IN ('od_calosci','od_nadwyzki','stala')),
  stawka_stala     REAL
);
CREATE INDEX idx_warunki_inst ON warunki_prowizyjne (instytucja_id, obowiazuje_od);

-- Progi prowizyjne: pary (prog kwotowy, stawka). Znormalizowane z tablicy JSON.
CREATE TABLE progi_prowizyjne (
  id         TEXT PRIMARY KEY,
  warunki_id TEXT NOT NULL REFERENCES warunki_prowizyjne (id) ON DELETE CASCADE,
  od_kwoty   REAL NOT NULL,
  stawka     REAL NOT NULL
);
CREATE INDEX idx_progi_warunki ON progi_prowizyjne (warunki_id, od_kwoty);

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
CREATE TABLE klienci (
  id                        TEXT PRIMARY KEY,
  numer_klienta             INTEGER NOT NULL,   -- sekwencyjny w roku, trafia na fakture (D-112)
  nazwa                     TEXT NOT NULL,
  nip                       TEXT,
  wielkosc_przedsiebiorstwa TEXT CHECK (wielkosc_przedsiebiorstwa IN ('mikro','mały','średni','duży','inny')),
  liczba_zatrudnionych      INTEGER,
  osoba_kontaktowa          TEXT,
  telefon                   TEXT,
  email                     TEXT,
  miasto                    TEXT,
  adres_siedziby            TEXT,
  instytucja_id             TEXT REFERENCES instytucje (id),  -- instytucja, ktora pozyskala
  pup_id                    TEXT REFERENCES urzedy_pracy (id),
  zainteresowany_naborem    INTEGER NOT NULL DEFAULT 0        -- flaga kolejnego naboru (D-130)
);
CREATE INDEX idx_klienci_nip ON klienci (nip);
CREATE INDEX idx_klienci_inst ON klienci (instytucja_id);
CREATE INDEX idx_klienci_nazwa ON klienci (nazwa);

-- Jeden klient moze byc przypisany do wielu instytucji (D-144), kazda widzi go
-- wylacznie we wlasnym kontekscie. To jest tabela egzekwujaca separacje.
CREATE TABLE klient_instytucja (
  klient_id     TEXT NOT NULL REFERENCES klienci (id) ON DELETE CASCADE,
  instytucja_id TEXT NOT NULL REFERENCES instytucje (id) ON DELETE CASCADE,
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

CREATE TABLE faktury (
  id               TEXT PRIMARY KEY,
  numer            TEXT NOT NULL,
  instytucja_id    TEXT NOT NULL REFERENCES instytucje (id),
  kwota            REAL NOT NULL,
  vat              TEXT,
  data_wystawienia TEXT,
  termin_platnosci TEXT,
  status           TEXT,
  liczba_projektow INTEGER NOT NULL DEFAULT 0,
  plik_pdf         TEXT
);
CREATE INDEX idx_faktury_inst ON faktury (instytucja_id, data_wystawienia);

-- Wniosek = projekt (D-53). Jeden klient ma wiele wnioskow.
-- Odwrocenie wyliczen z D-134: recznie wpisujemy koszt Z DOPLATA, a koszt
-- calkowity jest roznica. Kolumny *_regula_aktywna realizuja zasade D-19:
-- reczna edycja kasuje regule, przycisk "Przywroc regule" ja odtwarza.
CREATE TABLE wnioski (
  id                        TEXT PRIMARY KEY,
  numer                     INTEGER NOT NULL,
  rok                       TEXT NOT NULL REFERENCES lata_zestawien (rok),
  klient_id                 TEXT NOT NULL REFERENCES klienci (id),
  instytucja_id             TEXT NOT NULL REFERENCES instytucje (id),
  pup_id                    TEXT REFERENCES urzedy_pracy (id),
  nabor_id                  TEXT REFERENCES nabory (id),
  szkolenie_glowne_id       TEXT REFERENCES katalog_szkolen (id),
  faktura_id                TEXT REFERENCES faktury (id),          -- numer przy wniosku (D-139)
  etap                      INTEGER NOT NULL DEFAULT 3 CHECK (etap BETWEEN 1 AND 10),  -- D-146

  -- Nadpisania danych klienta na poziomie wniosku (D-132, D-133). NULL = bierz z klienta.
  wielkosc_przedsiebiorstwa TEXT CHECK (wielkosc_przedsiebiorstwa IN ('mikro','mały','średni','duży','inny')),
  osoba_kontaktowa          TEXT,
  telefon                   TEXT,
  email                     TEXT,

  -- Finanse. Reczne: koszt z doplata (D-134) i doplata dodatkowa (D-63).
  koszt_calkowity_z_doplata REAL,
  kwota_doplaty_dodatkowej  REAL NOT NULL DEFAULT 0,
  koszt_calkowity           REAL,                          -- wyliczane: z_doplata - doplata
  koszt_regula_aktywna      INTEGER NOT NULL DEFAULT 1,
  przyznano                 REAL,                          -- wyliczane, edytowalne (D-135)
  przyznano_regula_aktywna  INTEGER NOT NULL DEFAULT 1,

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
  powod_niezakwalifikowania TEXT
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

-- Macierz rola x modul (D-36). Poziom 'brak' oznacza brak pozycji w menu.
CREATE TABLE uprawnienia (
  rola_id  TEXT NOT NULL REFERENCES role (id) ON DELETE CASCADE,
  modul_id TEXT NOT NULL REFERENCES moduly (id) ON DELETE CASCADE,
  poziom   TEXT NOT NULL DEFAULT 'brak' CHECK (poziom IN ('brak','podglad','edycja')),
  PRIMARY KEY (rola_id, modul_id)
);

-- Widocznosc pol wrazliwych per rola. Tu egzekwowane sa D-114 (pracownik nie
-- widzi zyskow firmy), D-34, D-07 (stawki prowizji tylko admin) oraz D-76.
CREATE TABLE uprawnienia_pol (
  rola_id  TEXT NOT NULL REFERENCES role (id) ON DELETE CASCADE,
  klucz    TEXT NOT NULL,
  widoczne INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (rola_id, klucz)
);

CREATE TABLE uzytkownicy (
  id                   TEXT PRIMARY KEY,
  login                TEXT NOT NULL UNIQUE,
  haslo_demo           TEXT NOT NULL,   -- makieta: jawne haslo demonstracyjne, nie hash
  imie_nazwisko        TEXT NOT NULL,
  rola_id              TEXT NOT NULL REFERENCES role (id),
  instytucja_id        TEXT REFERENCES instytucje (id),  -- konto IS: macierzysta instytucja
  klient_id            TEXT REFERENCES klienci (id),     -- konto klienta koncowego (P-33)
  wszystkie_instytucje INTEGER NOT NULL DEFAULT 0,       -- konto bez ograniczenia (D-113)
  ostatnie_logowanie   TEXT,
  dwa_fa               INTEGER NOT NULL DEFAULT 0,
  zablokowane          INTEGER NOT NULL DEFAULT 0        -- admin LDIT blokuje konta IS (D-126)
);

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

CREATE TABLE meta (
  klucz   TEXT PRIMARY KEY,
  wartosc TEXT
);
