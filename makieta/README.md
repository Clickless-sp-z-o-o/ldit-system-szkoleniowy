# Makieta v2 systemu KFS

Klikalna makieta w czystym HTML, bez zależności zewnętrznych. Otwórz **`index.html`** w przeglądarce.

## Czym różni się od makiety v1

| | v1 (`00. Poczatkowe założenia/System_LDIT_makieta.html`) | v2 (ta) |
|---|---|---|
| Powstała | przed warsztatem, na hipotezach | po warsztacie, na 120 decyzjach |
| Stylistyka | celowo szara, bez designu | pełna stylistyka aplikacji |
| Struktura | jeden plik | powłoka plus 17 stron modułów |
| Wybór instytucji | przełącznik w prawym górnym rogu | rozwijana lista w lewym menu (D-112) |
| Numeracja klientów | per instytucja | ciągła w roku, trafia na fakturę |
| Nazewnictwo | z dokumentacji | wymagane przez klienta (D-55) |
| Dane | kilkanaście rekordów | realne wolumeny, 240 klientów, 174 projekty |
| Silnik prowizji | brak | działający, 7 przypadków testowych |

## Struktura plików

```
makieta/
  index.html                        powloka: nawigacja, przelacznik roli, wyszukiwarka
  assets/
    style.css                       system stylow, wszystkie komponenty
    data.js                         dane demonstracyjne + silnik prowizji
  strony/
    01-dashboard.html               statystyki, jedyny przekroj przez wszystkie IS
    02-zestawienia.html             glowny widok roboczy, tabela projektow
    03-wniosek.html                 karta projektu, model finansowy, uczestnicy
    04-baza-klientow.html           baza klientow + kolejka zgloszen z formularza
    05-nabory.html                  nabory aktualne i prognozowane
    06-instytucje.html              karty instytucji, katalog szkolen
    07-konfigurator-is.html         warunki prowizyjne, wzor certyfikatu (tylko admin)
    08-administracja.html           prowizje, faktury, prowizje wewnetrzne (tylko admin)
    09-wysylka-maili.html           szablony, wysylka, automatyzacje i alerty
    10-zgloszenia.html              wewnetrzna baza incydentow
    11-konta-uprawnienia.html       konfigurator rol, macierz uprawnien
    12-rejestr-aktywnosci.html      rejestr zmian + log logowan
    13-terminy.html                 kalendarz i lista terminow szkolen
    14-statystyki.html              lejki, porownania, skutecznosc
    15-konfigurator-prowizji.html   PROTOTYP OBLICZENIOWY, warunek wstepny D-20
    16-panel-is.html                widok instytucji szkoleniowej
    17-panel-klienta.html           panel klienta koncowego (status otwarty)
```

## Co warto pokazać klientowi w pierwszej kolejności

**1. Przełącznik roli w prawym górnym rogu.**
Pięć ról, każda widzi inne menu. To demonstracja konfiguratora ról (D-36) i separacji danych.
Przełącz na "Instytucja szkoleniowa", żeby zobaczyć, jak wąski jest jej widok.

**2. Konfigurator prowizji** (`15-konfigurator-prowizji.html`).
To jest realizacja warunku wstępnego ustalonego na warsztacie: *„żebyśmy nie kodowali aplikacji, zanim
nie zostanie to ustalone. Taki prosty konfigurator w HTML, będziesz wpisywał cyferki i mi powiesz czy
to się dobrze liczy czy nie”*.

Kalkulator obsługuje wszystkie cztery modele z realnych umów, pozwala wpisać własne progi i faktury,
i ma wbudowane 7 przypadków testowych z dokumentacji. **Ta strona wymaga walidacji przez klienta
realnymi liczbami przed rozpoczęciem implementacji.**

**3. Karta projektu** (`03-wniosek.html`).
Pokazuje model finansowy KFS w działaniu: pola wyliczane kontra ręczne, kasowanie reguły po edycji
i przycisk „Przywróć regułę” (D-19). Zmień „Przyznano”, żeby zobaczyć mechanizm. Przełącz status
kwalifikacji uczestnika, żeby zobaczyć przeliczenie.

**4. Zestawienia** (`02-zestawienia.html`).
Główny ekran roboczy z kolorami przeniesionymi z Excela, filtrami po urzędzie i masową zmianą statusów.

## Adnotacje w makiecie

Makieta pokazuje także to, czego **nie ustalono**. Oznaczenia w treści stron:

| Oznaczenie | Znaczenie |
|---|---|
| <span>D-xx</span> | decyzja z warsztatu, `docs/13-rejestr-decyzji.md` |
| <span>P-xx</span> | pytanie otwarte, `docs/14-pytania-otwarte.md` |
| <span>R-xx</span> | ryzyko, `docs/15-ryzyka.md` |
| niebieska ramka | wyjaśnienie decyzji projektowej |
| żółta ramka | ostrzeżenie lub blokada |
| fioletowa ramka | pytanie otwarte, wymaga rozstrzygnięcia |

## Cztery blokady widoczne w makiecie

| Gdzie | Co blokuje |
|---|---|
| `15-konfigurator-prowizji.html` | **P-01** konflikt reguły okresu rozliczeniowego |
| `08-administracja.html`, zakładka Prowizje wewnętrzne | **P-02** progi prowizji pracowniczych nie istnieją |
| `08-administracja.html`, zakładka Faktury | **P-09** czy eSzokBR udostępnia eksport CSV |
| dotyczy całej architektury | **P-25** osobne bazy czy jedna z separacją wierszy |

## Uwagi techniczne

- Otwierać przez `index.html`, strony modułów są ładowane w ramce. Można je też otwierać pojedynczo.
- Dane generowane deterministycznie, więc liczby są stabilne między odświeżeniami.
- Silnik prowizji w `data.js` ma dwie funkcje: `liczProwizje()` dla pojedynczej faktury oraz
  `liczOkres()` dla całego okresu. **Model A wymaga tej drugiej**, bo przekroczenie progu podnosi
  stawkę dla całego obrotu okresu, także dla faktur już wystawionych. Szczegóły w
  `docs/07-silnik-prowizji.md`, sekcja „Pułapka implementacyjna”.
- Makieta jest poglądowa. Przyciski zapisu i eksportu nie wykonują operacji.
