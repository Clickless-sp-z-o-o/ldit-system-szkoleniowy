# Makieta v2 systemu KFS

Klikalna makieta na prawdziwej bazie SQLite, bez serwera i bez zależności zewnętrznych.
Otwórz **`index.html`** w przeglądarce. Zobaczysz ekran logowania.

**Hasło do wszystkich kont demonstracyjnych: `demo`.** Lista kont jest na ekranie logowania,
kliknięcie wypełnia formularz.

| Konto | Rola | Zakres |
|---|---|---|
| `bartek@ldit.pl` | Administrator | wszystkie instytucje, prowizje, rejestry |
| `martyna@ldit.pl` | Pracownik LDIT | 3 instytucje z 20, bez prowizji i faktur |
| `biuro@odczarujpowerbi.pl` | Instytucja szkoleniowa | wyłącznie własni klienci |
| `mirka@dronfortech.pl` | Pracownik IS | dane kontaktowe, bez kwot i PESEL |
| `kontakt@stalmetspzoospk.pl` | Klient końcowy | wyłącznie własny wniosek |

---

## Czym różni się od poprzednich wersji

| | v1 (przed warsztatem) | v2 (po warsztacie 25.08) | v2 po warsztacie 04.09 |
|---|---|---|---|
| Podstawa | hipotezy | 120 decyzji z warsztatu | 147 decyzji |
| Struktura | jeden plik | powłoka plus 18 stron | bez zmian |
| Dane | kilkanaście rekordów | 240 klientów, 292 projekty w JSON | **baza SQLite, 30 tabel** |
| Rola | przełącznik w rogu | przełącznik w rogu | **panel logowania** [D-125] |
| Uprawnienia | opisane w tekście | opisane w tekście | **egzekwowane na danych** |
| Silnik prowizji | brak | działający, 16 przypadków | bez zmian |

---

## Trzy rzeczy, które warto pokazać klientowi

**1. Zmiana konta zamiast przełącznika roli.**
Wyloguj się i zaloguj jako `martyna@ldit.pl`. Menu ma 7 pozycji zamiast 10, znika Administracja
i Ustawienia, a z dashboardu znika cały wiersz kafelków finansowych. To nie jest ukrywanie
w interfejsie: stawki prowizyjne nie są w ogóle wczytane do pamięci strony [D-114, D-34].
Zaloguj się jako `biuro@odczarujpowerbi.pl`, żeby zobaczyć, jak wąski jest widok instytucji.

**2. Konfigurator prowizji** (`strony/15-konfigurator-prowizji.html`).
To realizacja warunku wstępnego z warsztatu: *„żebyśmy nie kodowali aplikacji, zanim nie zostanie
to ustalone. Taki prosty konfigurator w HTML, będziesz wpisywał cyferki i mi powiesz czy to się
dobrze liczy czy nie”*. Obsługuje cztery modele z realnych umów, przyjmuje własne progi i faktury,
ma 12 wbudowanych przypadków testowych. **Ta strona wymaga walidacji realnymi liczbami przed
rozpoczęciem implementacji.**

**3. Karta projektu** (`strony/03-wniosek.html`).
Model finansowy KFS w działaniu: pola wyliczane kontra ręczne, kasowanie reguły po edycji
i przycisk „Przywróć regułę” [D-19]. Zmień „Przyznano”, żeby zobaczyć mechanizm.

---

## Menu i role

Menu nie jest listą zapisaną w kodzie. Buduje się z tabel `role`, `moduly` i `uprawnienia`,
więc zmiana w module Ustawienia zmienia to, co widzi dana rola [D-36].

| Rola | Pozycji w menu | Czego nie widzi |
|---|---|---|
| Administrator | 10 | - |
| Pracownik LDIT | 7 | Administracja, Ustawienia, prowizje, faktury, rejestry |
| Instytucja szkoleniowa | 4 | cudzych klientów, własnej stawki prowizji [D-76] |
| Pracownik IS | 1 | kwot wniosków, numerów PESEL [D-75] |
| Klient końcowy | 1 | wszystkiego poza własnym wnioskiem [P-33] |

Układ modułów:

```
Praca operacyjna    Dashboard | Dofinansowania | Nabory | Zadania i powiadomienia
Konfiguracja        Instytucje szkoleniowe | Komunikacja
Zarządzanie         Administracja | Zgłoszenia | Ustawienia
Panel zewnętrzny    Moja instytucja | Terminy szkoleń | Mój wniosek
```

Moduły mają zakładki pod nagłówkiem zamiast osobnych pozycji w menu. **Dofinansowania**
rozwijają listę instytucji przypisanych do konta [D-112, D-113], z jawną pozycją
„Wszystkie instytucje” [D-127]. **Statystyka jest zakładką Dashboardu**, nie osobnym modułem.

---

## Co naprawdę działa

Makieta nie jest już tylko rysunkiem. Działa w niej:

- **logowanie i wylogowanie**, z rejestrem udanych i nieudanych prób
- **dodawanie wierszy**: klient, projekt wraz z uczestnikami, termin szkolenia,
  plan z katalogu, konto użytkownika wraz z przydziałem instytucji
- **edycja i usuwanie** w tych samych miejscach, ze zmianami trwałymi między odświeżeniami
- **ograniczenia bazy**: klucz obcy do nieistniejącej instytucji albo wartość spoza słownika
  są odrzucane, a nie zapisywane po cichu
- **pola wyliczane** liczone przez SQL, z działającym „Przywróć regułę”
- **separacja danych** egzekwowana zanim strona zobaczy dane

Nie działa (i nie ma działać na tym etapie): wysyłka maili, generowanie certyfikatów,
import faktur z systemu księgowego, integracja z pocztą M365.

Warstwa danych jest opisana w [DANE.md](DANE.md).

---

## Struktura plików

```
makieta/
  index.html            powłoka: nawigacja, wyszukiwarka, menu użytkownika
  login.html            ekran logowania
  db/                   baza: schema.sql, views.sql, seed.sql, silnik sql.js
  assets/               warstwa danych, sesja, separacja, style
  strony/               18 stron modułów
  data/db.json          dane demonstracyjne, wejście do budowy bazy
```

---

## Adnotacje w makiecie

Makieta pokazuje także to, czego **nie ustalono**:

| Oznaczenie | Znaczenie |
|---|---|
| D-xx | decyzja z warsztatu, `docs/13-rejestr-decyzji.md` |
| P-xx | pytanie otwarte, `docs/14-pytania-otwarte.md` |
| R-xx | ryzyko, `docs/15-ryzyka.md` |
| niebieska ramka | wyjaśnienie decyzji projektowej |
| żółta ramka | ostrzeżenie lub blokada |
| fioletowa ramka | pytanie otwarte, wymaga rozstrzygnięcia |

### Cztery blokady widoczne w makiecie

| Gdzie | Co blokuje |
|---|---|
| `15-konfigurator-prowizji.html` | **P-01** konflikt reguły okresu rozliczeniowego |
| `08-administracja.html`, Prowizje wewnętrzne | **P-02** progi prowizji pracowniczych nie istnieją |
| `08-administracja.html`, Faktury | **P-09** czy system księgowy udostępnia eksport CSV |
| dotyczy całej architektury | **P-25** osobne bazy czy jedna z separacją wierszy |

---

## Uwagi techniczne

- Otwierać przez `index.html`. Strony modułów ładują się w ramce, można je też otwierać
  pojedynczo, wtedy brak sesji przenosi na ekran logowania.
- Dane generowane deterministycznie, liczby są stabilne między odświeżeniami.
- Zmiany zapisują się w `localStorage`. `KFS.reset()` w konsoli wraca do stanu wyjściowego,
  `KFS.pobierzPlik("kfs.sqlite")` pobiera bazę jako plik do otwarcia w DB Browser for SQLite.
- Silnik prowizji ma dwie funkcje: `liczProwizje()` dla pojedynczej faktury i `liczOkres()`
  dla całego okresu. **Model A wymaga tej drugiej**, bo przekroczenie progu podnosi stawkę
  dla całego obrotu okresu, także dla faktur już wystawionych. Szczegóły w
  `docs/07-silnik-prowizji.md`, sekcja „Pułapka implementacyjna”.
