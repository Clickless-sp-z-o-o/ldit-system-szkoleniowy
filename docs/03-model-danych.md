# 03. Model danych

Model wypracowany na warsztacie, w kilku miejscach na żywo skorygowany. Wykonawca odkrył w trakcie ćwiczenia brakującą tabelę:

> **Paweł (1:52:56):** "Bo ja tu widzę w bazie jeszcze jedną tabelę, o której nie myślałem wcześniej."

---

## Diagram encji

```
                        INSTYTUCJA SZKOLENIOWA
                        (dane firmy, siedziba, wzór certyfikatu)
                                    |
              +---------------------+---------------------+
              |                     |                     |
    WARUNKI PROWIZYJNE      KATALOG SZKOLEŃ         UŻYTKOWNICY IS
    (wersjonowane w czasie)  (szablon szkolenia)     (admin IS, handlowiec)
              |                     |
              |                TERMIN SZKOLENIA
              |                (realizacja szablonu)
              |                     |
              |                     |
        KLIENT (firma końcowa)      |
        (dane stałe, NIP, wielkość) |
              |                     |
              +-----> WNIOSEK / PROJEKT <-----+
                      (dane finansowe,        |
                       nabór, PUP, statusy)   |
                            |                 |
                            |                 |
                    UCZESTNIK WNIOSKU --------+
                    (osoba, szkolenie, kwota,
                     status kwalifikacji)
                            |
                        CERTYFIKAT

     KORESPONDENCJA ----> KLIENT (wspólna dla wszystkich wniosków)
     NOTATKI       ----> KLIENT
     ZGŁOSZENIA    ----> INSTYTUCJA lub KLIENT (baza incydentów)
     NABÓR         ----> URZĄD PRACY (PUP), 340 pozycji
     FAKTURA       ----> INSTYTUCJA SZKOLENIOWA
```

---

## Kluczowe decyzje modelowe

### 1. Rozdzielenie Klienta od Wniosku [D-53, TWARDA]

Najważniejsza zmiana względem obecnego Excela, gdzie wszystko jest w jednym wierszu.

> **Paweł (1:44:21):** "czy nie lepiej byłoby, gdybyśmy mieli w systemie Człowieka jako jedną tabelę (...) Czyli rozróżniłbym człowieka od naboru. Jeden człowiek może mieć wiele naborów."
>
> **Bartek (1:44:48):** "O k dobra, nazwijmy to projektu (...) czyli jeden projekt to jeden wniosek."

**Zasada: jeden projekt = jeden wniosek.** Jeden klient ma wiele wniosków (do 3 razy w roku, wyjątkowo 5-6).

**Dane wspólne dla wszystkich wniosków klienta:** dane kontaktowe, korespondencja, notatki, historia ustaleń (forma zwracania się, preferowany kanał kontaktu).

> **Bartek (1:46:06):** "właściwie możemy zrobić jedną korespondencję, żeby się łączyła razem, całą historią była."

**Główny widok roboczy pozostaje widokiem wniosków**, nie klientów.

### 2. KFS przyznawany firmie, nie uczestnikowi [D-60, TWARDA]

> **Paweł (1:53:14):** "KFS jest pod firmy. Zawsze to firma dostaje dofinansowanie. Dobrze myślę, potwierdźmy proszę."
> **Bartek (1:53:22):** "Tak, tak, tak, tak."

Hierarchia: **firma (klient) -> wniosek -> uczestnicy**.

### 3. Dane kwotowe równocześnie na poziomie wniosku i uczestnika [D-62, TWARDA]

> **Paweł (1:55:41):** "Co byś chciał mieć na karcie wniosków, czy to jest firma, która dostaje 100000? Czy chcesz mieć to po uczestniku?"
> **Bartek (1:55:55):** "Tak i tak."

Kwota jest na wniosku firmy, ale rozstrzygnięcie kwalifikacji i przypisanie szkolenia jest per uczestnik.

### 4. Katalog szkoleń oddzielony od terminów [D-06, TWARDA]

Jedno szkolenie w katalogu (szablon) może być zrealizowane wielokrotnie (nawet 50 razy w roku). Termin wybiera pozycję z katalogu.

### 5. Warunki prowizyjne wersjonowane w czasie [D-22, WSTĘPNA]

Warunki to nie atrybut instytucji, tylko rekord z okresem obowiązywania.

> **Paweł (49:20):** "gdybyśmy zostawili to na sztywno, zmienią ci się warunki, to musiałbyś dodać nową instytucję szkoleniową. I byś miał 2."

Zmiany obowiązują od kolejnego roku kalendarzowego. **Historia rozliczeń nie może być przeliczana wstecz** [D-23].

---

## Encje

### INSTYTUCJA_SZKOLENIOWA

| Pole | Typ | Uwagi |
|---|---|---|
| nazwa | tekst | Wyświetlana jako etykieta zakładki w widoku IS |
| dane_firmy | grupa | NIP, adres, dane do faktur |
| **siedziba_miejscowosc** | tekst | **Źródło pola "miejscowość" na certyfikacie** [D-99] |
| opis_dzialalnosci | tekst | |
| osoby_kontaktowe | lista | Kontakt główny, osoba od terminów, osoba od faktur |
| wzor_certyfikatu | plik | Szablon z placeholderami, per instytucja [D-98] |
| standard_godzinowy | tekst | Np. 9:30-20:00, środa/czwartek/piątek |

Powiązania: nadrzędna wobec katalogu szkoleń, terminów, klientów, warunków prowizyjnych i użytkowników IS.

### WARUNKI_PROWIZYJNE (wersjonowane)

| Pole | Typ | Wartości |
|---|---|---|
| instytucja_id | ref | |
| obowiazuje_od | data | Typowo 1 stycznia kolejnego roku |
| obowiazuje_do | data | NULL = aktualnie obowiązujące |
| rodzaj_kumulacji | enum | `miesieczny` / `roczny` / `brak` (stała stawka) |
| sposob_liczenia | enum | `od_calosci` / `od_nadwyzki` / `stala` |
| progi | lista | Pary (próg kwotowy, stawka %) |
| stawka_stala | procent | Używana gdy rodzaj_kumulacji = `brak` |

Szczegóły semantyki w [07. Silnik prowizji](07-silnik-prowizji.md).

### KATALOG_SZKOLEN (szablon)

| Pole | Typ | Uwagi |
|---|---|---|
| instytucja_id | ref | |
| nazwa | tekst | Musi być spójna, bo trafia do formularza jako lista wyboru |
| plan_szkolenia | tekst / plik | Program, zakres |
| liczba_godzin | liczba | |
| liczba_dni | liczba | |
| tryb | enum | Online / stacjonarne / mieszane |
| procedura_przed_szkoleniem | tekst | Definiowana przez IS |
| cena | historia cen | **Cena zmienna w czasie**, obowiązuje wg daty wnioskowania |

Dodawanie nowego planu przez IS jest swobodne. **Edycja istniejącego wymaga przejścia przez administratora lub co najmniej go powiadamia** [D-43, WSTĘPNA, mechanizm do doprecyzowania].

### TERMIN_SZKOLENIA (realizacja)

| Pole | Typ | Uwagi |
|---|---|---|
| szkolenie_id | ref | Pozycja z katalogu |
| data_od / data_do | data | |
| miejsce | tekst | |
| linki_do_materialow | tekst | |
| szczegoly_organizacyjne | tekst | Uzupełniane przez IS, przypięte do terminu, nie do katalogu |
| status_realizacji | enum | Wolny / Zaplanowany / Odbyty |
| uczestnicy | lista ref | |

### KLIENT (firma końcowa)

| Pole | Typ | Uwagi |
|---|---|---|
| numer_klienta | liczba | **Sekwencyjny w ramach roku**, trafia na fakturę [D-112] |
| nazwa | tekst | |
| nip | tekst | Kryterium wyszukiwania |
| adres_siedziby | tekst | Do maila "dane do faktury" |
| dane_kontaktowe | grupa | Telefon, e-mail |
| **wielkosc_przedsiebiorstwa** | enum | `mikro` / `maly` / `sredni` / `duzy` / `inny` |
| liczba_zatrudnionych | liczba | Z formularza. **Do 9 osób = mikro** |
| instytucja_id | ref | Instytucja, która pozyskała klienta |
| pup_id | ref | Właściwy urząd pracy |

Dane stałe w czasie. Dane zmienne siedzą we wniosku.

> **Paweł (1:58:07):** rozdzielenie danych stałych (telefon, dane kontaktowe) od danych finansowych wniosku.

### WNIOSEK / PROJEKT

Kompletna specyfikacja pól finansowych w [06. Model finansowy KFS](06-model-finansowy-kfs.md).

| Pole | Typ | Ręczne / wyliczane |
|---|---|---|
| klient_id | ref | |
| nabor_id | ref | |
| numer | liczba | Sekwencyjny w roku |
| rok | liczba | Klucz podziału na roczniki (2025, 2026, 2027) |
| **calkowita_wartosc_szkolenia** | kwota | Wyliczane (suma warunkowa po zakwalifikowanych) [D-79] |
| **koszt_calkowity** | kwota | **Ręczne** [D-58] |
| **przyznano** | kwota | **Wyliczane**, nieedytowalne: koszt_calkowity x wskaznik [D-58] |
| wklad_wlasny_procent | procent | Wyliczane z wielkości przedsiębiorstwa (10% lub 30%) |
| doplata_standard | kwota | Wyliczane: wartość x procent wkładu |
| **kwota_doplaty_dodatkowej** | kwota | **Ręczne**, domyślnie 0 [D-63] |
| **koszt_calkowity_z_doplata** | kwota | Wyliczane: koszt_calkowity + dopłata. **Podstawa prowizji** [D-64] |
| status_skladania | enum | Złożony / Niezłożony / NW / Rezygnacja |
| status_decyzji | enum | Pozytywna / Negatywna / Rezygnacja po napisaniu |
| status_finansowy | enum | Oczekuje / Zafakturowany / Rozliczone |
| data_wplyniecia_formularza | data | **Rejestrowana automatycznie** [D-94] |
| data_aktualizacji | data | Automatyczna |
| **data_wystawienia_faktury** | data | Domyślnie ostatni dzień szkolenia, edytowalna. **Wyznacza okres rozliczeniowy prowizji** [D-13] |
| prowizja_procent | procent | Wyliczane z warunków IS, nadpisywalne ręcznie na karcie wniosku lub w module Administracja, **wyłącznie administrator** [D-17, D-93] |
| **prowizja_regula_aktywna** | flaga | Domyślnie `true` (licz wg warunków IS). Przełączenie na indywidualną stawkę kasuje regułę, przycisk "Przywróć regułę" ją odtwarza [D-16] |
| prowizja_kwota | kwota | Wyliczane: podstawa prowizji x prowizja_procent |

### UCZESTNIK_WNIOSKU

| Pole | Typ | Uwagi |
|---|---|---|
| wniosek_id | ref | |
| imie_nazwisko | tekst | Trafia na certyfikat i do urzędu |
| pesel | tekst | Z formularza. Dane wrażliwe |
| **szkolenie_id** | ref | **Jeden wniosek może obejmować kilka różnych szkoleń** [D-78] |
| kwota | kwota | Cena szkolenia dla tej osoby |
| **status_kwalifikacji** | enum | `zakwalifikowany` / `niezakwalifikowany` [D-61] |
| termin_id | ref | Przypisany termin realizacji |

**Reguła:** do sumy `calkowita_wartosc_szkolenia` wchodzą wyłącznie uczestnicy zakwalifikowani.

> **Bartek (2:23:44):** "7 osób ma szkolenie to samo za 10 tysięcy, 8 osoba ma szkolenie za 5000, a druga ma za 15. Czyli są 3 różne szkolenia. Byśmy też rozróżnienie."

### KORESPONDENCJA

| Pole | Typ | Uwagi |
|---|---|---|
| klient_id | ref | Wspólna dla wszystkich wniosków klienta |
| instytucja_id | ref | Alternatywnie, korespondencja z IS |
| skrzynka_zrodlowa | tekst | Skrzynka pracownika, z której zaciągnięto |
| kierunek | enum | Przychodzący / wychodzący / DW |
| temat, tresc, data | | Indeksowane do wyszukiwania |
| zalaczniki | lista | |

### NOTATKA
Notatka z rozmowy telefonicznej przy kliencie lub instytucji. Widoczna dwustronnie.

### ZGLOSZENIE (incydent)

| Pole | Typ | Uwagi |
|---|---|---|
| podmiot | ref | Instytucja szkoleniowa **lub** klient |
| powod | tekst | Np. podejrzenie o oszustwo |
| notatka | tekst | Opis zdarzenia |
| data | data | |

**Widoczne wyłącznie dla administratora i pracowników LDIT** [D-107]. Nie jest podzakładką instytucji.

### FAKTURA

| Pole | Typ | Uwagi |
|---|---|---|
| instytucja_id | ref | |
| numer | tekst | |
| kwota, data_wystawienia, termin_platnosci | | Z importu CSV |
| plik_pdf | plik | **Podgląd w systemie** [D-24] |

### NABOR i URZAD_PRACY

| Pole | Typ | Uwagi |
|---|---|---|
| pup_id | ref | 340 urzędów w bazie |
| rodzaj | enum | KFS (obecnie), powiatowy, inne. **Model musi dopuszczać kolejne** |
| status | enum | Brak naboru / W trakcie kontaktu / Nabór ogłoszony / Po naborze |
| data_prognozowana | data | Z aplikacji do przewidywania naborów |
| data_od / data_do | data | Faktyczny termin |

Zasilane z istniejącej aplikacji do przewidywania naborów. System jest odbiorcą, nie liczy prognoz.

---

## Pola wyliczane vs ręczne

Zasada ogólna ustalona na warsztacie, obowiązująca w całym systemie:

> **Bartek (46:16):** "wszystko co będzie chciałbym mieć możliwość edycji ręcznej, tak żeby ta reguła się usunęła w momencie, jak ja sobie edytuję ręcznie."
>
> **Bartek (44:57):** "przypadkiem nie wiem zemdleję, uderzę głową w klawiaturę i akurat się zmieni wartość prowizji i reguła się usunie, więc mogę przywrócić regułę. Jakąś pamięć po prostu trzeba."

**Wymaganie implementacyjne:** każde pole wyliczane potrzebuje trzech rzeczy:
1. flagi `regula_aktywna` (bool)
2. przechowanej `wartosc_wyliczona` (nawet gdy reguła nieaktywna)
3. akcji **Przywróć regułę** w interfejsie

**Wyjątek:** pole `przyznano` zostało na warsztacie zadeklarowane jako **nieedytowalne**.

> **Paweł (2:00:52):** "Czyli to się wylicza, tego nie edytuję. Czyli przyznano nie edytuję, koszt całkowity uzupełniam ręcznie, kwota wnioskowana uzupełniam ręcznie."

To jest sprzeczne z dokumentem klienta sprzed warsztatu, gdzie reguła miała się wyłączać po edycji. Bartek nie zaprotestował, ale też nie potwierdził wprost. **Do rozstrzygnięcia**, patrz [14. Pytania otwarte](14-pytania-otwarte.md).

W makiecie przyjęto konwencję: **pola ręczne oznaczone na żółto** [D-81].

---

## Podział na roczniki

Baza wniosków dzielona na roczniki, odwzorowanie dzisiejszych zakładek Excela.

> **Bartek (50:49):** "żebyśmy w tym spisie klientów mieli zestawienie 2026 i zestawienie 2025. No i na kolejne lata po prostu. Musimy też móc to zestawienie sobie sami [tworzyć]."

Nawigacja: **Zestawienia -> 2025 / 2026 / 2027** jako drzewo w lewym menu [D-55].

Nierozstrzygnięte: czy to osobne widoki, filtr po roku, czy fizycznie osobne zbiory danych. Rekomendacja: **filtr po roku na jednej tabeli**, bo numeracja klientów jest roczna, ale klient i jego korespondencja są ciągłe w czasie.
