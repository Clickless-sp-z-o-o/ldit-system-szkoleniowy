# System zarządzania dofinansowaniami KFS (LDIT)

Platforma dla firmy pozyskującej dofinansowania KFS, współpracujących instytucji szkoleniowych i klientów końcowych. Zastępuje pracę na Excelu, mailach i telefonie.

**Klient:** Bartłomiej Olejnik (LDIT) | **Wykonawca:** Paweł Czapiewski (Odczaruj Low Code)
**Warsztaty:** 25.08.2026 (wymagania) i 04.09.2026 (doprecyzowujący) | **Termin:** ok. 2 miesiące, gotowe przed styczniem 2027

---

## Zanim zaczniesz cokolwiek robić

Przeczytaj `docs/README.md`. To spis treści dokumentacji podzielonej na 18 sekcji.

**Dokumentacja jest źródłem prawdy o wymaganiach.** Nie zgaduj, nie wnioskuj z makiety. Wszystko zostało spisane z dwóch warsztatów z klientem, z cytatami i znacznikami czasu.

**Wyjątek: struktura danych.** Tu źródłem prawdy jest `makieta/db/schema.sql`, a reguły wyliczeń siedzą w `makieta/db/views.sql` [D-151]. Przy rozjeździe z dokumentacją wygrywa schemat, a dokumentacja jest poprawiana.

Jeśli masz cokolwiek implementować, przeczytaj też `docs/18-od-makiety-do-aplikacji.md`. Tam jest napisane, co jest gotowe, co trzeba napisać od nowa i czego brakuje.

---

## Agenci projektowi

Uruchamiaj ich zamiast rozwiązywać problem samodzielnie:

| Agent | Kiedy |
|---|---|
| `ekspert-kfs` | Kwoty, wkład własny, kwalifikacja uczestników, przypadki brzegowe dofinansowania |
| `ekspert-prowizji` | Silnik prowizji, progi, wersjonowanie warunków, prognozowanie stawek |
| `audytor-separacji` | Po każdej zmianie dotykającej zapytań, widoków, wyszukiwarki, eksportów |
| `straznik-zakresu` | Nowe wymaganie, wątpliwość czy coś wchodzi w zakres, przed nowym modułem |
| `projektant-ux` | Widoki, makiety, układ tabel, nawigacja, formularze |
| `analityk-wymagan` | Szukanie uzasadnienia decyzji, przygotowanie pytań do klienta, aktualizacja dokumentacji |

---

## Cztery blokady projektowe

Stan po rundzie decyzji z 29.09.2026: żadna blokada nie jest formalnie otwarta, ale trzy z nich
rozstrzygnął w panelu wykonawca za klienta, więc **wymagają potwierdzenia przez klienta** przed
implementacją odpowiednich modułów.

| ID | Pytanie | Status | Odpowiada |
|---|---|---|---|
| **P-01** | Okres rozliczeniowy prowizji (data faktury vs prognoza z kalendarza) | rozstrzygnięte wstępnie: dwa widoki, rzeczywisty i przewidywany (D-164), wymaga potwierdzenia klienta | Klient |
| **P-02** | Progi prowizji wewnętrznej dla pracowników | rozstrzygnięte wstępnie: stała stawka, progi później, nigdy wstecz (D-162), wymaga potwierdzenia klienta | Klient |
| **P-09** | Czy system księgowy udostępnia eksport CSV | rozstrzygnięte wstępnie: import CSV (D-163), wymaga potwierdzenia u księgowej | Klient |
| **P-25** | Architektura danych: osobne bazy czy jedna z separacją wierszy | rozstrzygnięte: jedna baza, separacja wierszy (D-177) | Wykonawca |

Szczegóły w `docs/13-rejestr-decyzji.md` (D-161 - D-206) i `docs/14-pytania-otwarte.md`.

---

## Warunek wstępny implementacji

Na warsztacie ustalono, że **przed kodowaniem powstaje prototyp konfiguratora prowizji w HTML**, zwalidowany przez klienta realnymi liczbami.

> "żebyśmy nie kodowali aplikacji, zanim nie zostanie to ustalone. Taki prosty konfigurator w HTML, będziesz wpisywał cyferki i mi powiesz czy to się dobrze liczy czy nie."

Nie zaczynaj implementacji silnika prowizji bez tego.

---

## Stos docelowy: Open Mercato

Decyzja D-176: framework Open Mercato (TypeScript, Next.js, PostgreSQL, MikroORM, Zod, licencja MIT, wersja v0.8.0, przed 1.0). Z frameworka bierzemy uwierzytelnianie, role, uprawnienia jako features `modul.akcja` w `acl.ts`, organizacje (tenant = LDIT, organizacja = instytucja) i log akcji (`action_logs`). Czego nie ma i dobudowujemy: uprawnienia per pole (w makiecie features pól w tabeli `funkcje`, np. `finanse.prowizja`) oraz RLS w PostgreSQL jako druga bariera separacji (D-179), bo framework filtruje organizacje tylko w aplikacji. Makieta już stosuje features (`funkcje`, `role_funkcje`), walidację na granicy zapisu i rejestr tylko do dopisywania (D-211). Mapowanie makiety na framework i ryzyka: `docs/18-od-makiety-do-aplikacji.md`.

---

## Reguły domenowe, o których musisz pamiętać zawsze

**Dofinansowanie KFS:**
- mikroprzedsiębiorca (do 9 osób na umowie o pracę) = 90% dofinansowania, 10% wkładu własnego
- powyżej mikro = 70% dofinansowania, 30% wkładu własnego
- KFS przyznawany **firmie**, nie uczestnikowi. Hierarchia: firma -> wniosek -> uczestnicy
- osoba bez umowy o pracę nie kwalifikuje się, wymaga odrębnej faktury komercyjnej

**Podstawa prowizji LDIT:** koszt całkowity **z dopłatą**, nie kwota przyznana.

**Separacja danych:** instytucje szkoleniowe są wobec siebie konkurencyjne. Wyciek do niewłaściwego katalogu to scenariusz krytyczny. Separacja egzekwowana **na poziomie danych, nie interfejsu** [D-148]. Trzy poziomy kontroli: moduł (features `modul.view` / `modul.manage`), pole (features pól, np. `finanse.prowizja`), obie w tabelach `funkcje` i `role_funkcje` [D-211], wiersz (tabela `uzytkownik_instytucja` oraz handlowiec `handlowiec_id` [D-210]) [D-149]. Ukrycie kolumny w widoku nie jest zabezpieczeniem.

**Konfigurator prowizji widoczny wyłącznie dla administratora.** Instytucja nie widzi ani swojej, ani cudzej stawki.

---

## Zasady pracy z tym projektem

**Nazewnictwo dla użytkownika jest ustalone i nienegocjowalne.** Klient wymaga zachowania nazw z Excela:
- "Zestawienia" nie "Dofinansowania" (dla widoku rocznego)
- "Nabory" nie "Wnioski"
- "Projekt" nie "Wniosek"
- "Baza klientów" nie "Uczestnicy i leady"

Pełne mapowanie w `docs/16-slownik.md`.

**Każde pole wyliczane potrzebuje trzech rzeczy:**
1. flagi `regula_aktywna`
2. przechowanej `wartosc_wyliczona`
3. akcji "Przywróć regułę"

Ręczna edycja kasuje regułę, ale musi być odwracalna. To wymóg klienta uzasadniony ochroną przed przypadkową zmianą wartości finansowej.

**Nie buduj rzeczy wykluczonych.** Zadania, kalendarz Outlook, SMS, API systemu księgowego, foldery plików, wewnętrzny komunikator, dowolne formuły w konfiguratorze. Pełna lista w `docs/12-zakres-i-etapowanie.md`.

**Projektuj na realnych wolumenach:** 1000+ klientów, 400 maili przy rekordzie, 50 uczestników na szkoleniu, 340 urzędów, szczyt 130 wniosków w dwa tygodnie.

---

## Kolejność etapów

**I.** Konta i role, instytucje i katalog szkoleń, baza klientów z formularzem, wnioski i zestawienia, statusy i filtry, model finansowy KFS, powiadomienia mailowe, rejestr aktywności

**II.** Silnik prowizji, konfigurator warunków, przewidywana prowizja, moduł faktur, Administracja

**III.** Certyfikaty, dane do faktury, szablony maili, integracja poczty M365, nabory, terminy

**IV.** Statystyki rozbudowane, Zgłoszenia, prowizja wewnętrzna, cele, panel klienta, premium dla IS

---

## Struktura repozytorium

```
docs/                          dokumentacja projektu (18 sekcji)
dokumentacja/                  ta sama treść jako klikalna strona HTML
makieta/                       makieta v2: 18 ekranów na bazie SQLite
  db/schema.sql                źródło prawdy o strukturze danych
  db/views.sql                 reguły pól wyliczanych jako widoki SQL
  assets/zakres.js             separacja danych, egzekwowana na danych
tools/                         budowa bazy i testy
.claude/agents/                agenci projektowi
00. Poczatkowe założenia/      dokumentacja przedwarsztatowa, makieta v1
Warsztat LDIT - 20260825/      transkrypcja warsztatu, spis funkcji klienta
Warsztaty LDIT - 20260904/     transkrypcja warsztatu doprecyzowującego, diagram procesu
Prowizja liczenie.xlsx         realne warianty naliczania prowizji
```

## Makieta

Otwiera się dwuklikiem na `makieta/index.html`, bez serwera. Wita ekranem logowania, hasło do
wszystkich kont demonstracyjnych to `demo`, lista kont jest na ekranie.

Po zmianie czegokolwiek w makiecie uruchom komplet testów:

```
node tools/verify-parity.mjs      # migracja nie zmieniła żadnej liczby
node tools/smoke-crud.mjs         # CRUD, ograniczenia schematu, pola wyliczane
node tools/test-uprawnienia.mjs   # role, uprawnienia, separacja danych
node tools/test-zgodnosc-pol.mjs  # formularze zapisują do istniejących kolumn
node tools/test-prowizja.mjs      # 17 przypadków testowych z docs/07 plus korekty
node tools/test-bezpieczenstwo.mjs   # hasła, sesja, strażnik zapisów, XSS
node tools/test-lata.mjs          # zakładki roczne, dodawanie roku, brak wniosków z 2025
node tools/test-model.mjs         # dane interaktywnego diagramu tabel zgodne ze schematem
node tools/test-walidacja.mjs        # walidacja danych na granicy zapisu
node tools/test-serwer.mjs          # lokalny serwer bazy
```

Po zmianie schematu bazy przebuduj ją: `node tools/build-sqlite.mjs`.
Po dodaniu strony podłącz skrypty: `node tools/wire-pages.mjs`.

## Dokumentacja

`docs/*.md` to źródło prawdy, `dokumentacja/index.html` to ta sama treść jako klikalna
strona dla klienta. Dwie rzeczy przenoszą się z Markdowna automatycznie i **nie wolno ich
edytować w plikach HTML**, bo następne uruchomienie skryptu je nadpisze:

```
node tools/build-diagramy.mjs   # diagramy Mermaid z docs/*.md do sekcji HTML
node tools/build-rejestry.mjs   # decyzje D-125+ i pytania P-55+ do rejestrow HTML
node tools/build-model.mjs      # dane interaktywnego diagramu tabel ze schema.sql i docs/03
```

Po zmianie `schema.sql` albo opisów tabel w `docs/03` uruchom `build-model.mjs`, inaczej
diagram interaktywny pokaże stary stan.

Oba skrypty są idempotentne, a wstawione bloki są otoczone znacznikiem `<!-- diagram:od -->`
albo `<!-- rejestr:od -->`.

Silnik Mermaid leży lokalnie w `dokumentacja/assets/mermaid.min.js`, więc strona renderuje
diagramy offline, bez internetu.

**Panel decyzyjny** (`dokumentacja/sekcje/17-panel-decyzji.html`) zbiera wszystkie nierozstrzygnięte
punkty wraz z wariantami i konsekwencjami. Treść siedzi w `dokumentacja/assets/decyzje.js`.
Gdy pytanie zostanie rozstrzygnięte, wpis wędruje do `docs/13-rejestr-decyzji.md` jako decyzja
D-xx, a z panelu znika.

---

## Konwencje kodu

Obowiązują globalne reguły z `~/.claude/rules/coding-rules.md`. W szczególności:

- Pliki powyżej 300 linii wymagają refaktoryzacji
- Zero `any` w TypeScript, walidacja na granicach systemu
- Testy obok plików źródłowych, minimum happy path i error case
- Nigdy nie osłabiaj asercji ani nie modyfikuj testów, żeby przeszły
- Structured logging, nie `console.log`
- **Nie używaj em dash** w tekstach, komentarzach i dokumentacji

Commity wg `~/.claude/rules/git-workflow.md`: `[numer dwucyfrowy] - [opis po polsku]`.
