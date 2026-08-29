# 07. Silnik prowizji

> **Paweł (24:28):** "dzisiaj udało nam się przejść przez ten system prowizji, bo to jest chyba jedna z takich rzeczy trudniejszych."

To jest **najtrudniejszy element projektu**. Jeden fragment warsztatu (26:14 - 51:14, 25 minut) był poświęcony wyłącznie temu tematowi.

Silnik obsługuje dwa niezależne poziomy naliczania:
1. **Prowizja LDIT** pobierana od instytucji szkoleniowych (gotowa specyfikacja)
2. **Prowizja wewnętrzna** wypłacana pracownikom LDIT (specyfikacja niekompletna, blokada projektowa)

---

## Poziom 1: prowizja LDIT od instytucji szkoleniowych

### Podstawa naliczenia

**Koszt całkowity z dopłatą**, nie kwota przyznanego dofinansowania.

> **Bartek (39:38):** "Koszt całkowity, przyznanego nieprzyznanego [nie ma znaczenia], tylko koszt całkowity szkolenia."
>
> **Paweł (2:02:30):** "liczymy twoją prowizję od kosztu całkowitego z dopłatą."

**Prowizja zawsze wyrażana procentowo, nigdy kwotowo** [D-21].

> **Bartek (45:36):** "To jest z procentów, prowizja zawsze wyliczana, zawsze ten procent jest, nie ma raczej stałej [kwoty]."

### Okres rozliczeniowy

**Data wystawienia faktury**, przechowywana jako osobne pole per szkolenie/uczestnik, niezależne od daty szkolenia. Domyślnie wypełniana datą ostatniego dnia szkolenia, **edytowalna ręcznie**.

> **Bartek (26:22):** "chcieli od niego faktury [wcześniej]. Więc ten przychód liczy się nie do grudnia, tylko do sierpnia."
>
> **Paweł (26:38):** "każde szkolenie, każda osoba powinna mieć swoją osobną kolumnę, niezależną od daty szkolenia, z datą wystawienia faktury. I na podstawie niej liczymy."

Realne przypadki wymuszające elastyczność:
- Faktura wystawiona w sierpniu za szkolenie w grudniu (urząd zażądał wcześniej)
- Faktura 7 dni po podpisaniu umowy przez klienta, nie po szkoleniu
- Termin płatności faktury prowizyjnej: 14 dni

---

## Cztery modele naliczania

Wszystkie cztery występują w realnych umowach klienta. Silnik musi obsłużyć każdy.

### Model A: próg miesięczny, stawka od CAŁOŚCI

Umowa "10/12%". Po przekroczeniu progu wyższa stawka obejmuje **cały obrót miesiąca**, nie tylko nadwyżkę.

| Parametr | Wartość |
|---|---|
| Kumulacja | miesięczna |
| Sposób liczenia | **od całości** |
| Próg | 50 000 zł |
| Stawka poniżej progu | 10% |
| Stawka od progu w górę | 12% |

> **Bartek (31:04):** "dokładnie od całej, tak, to nie jest od nadwyżki powyżej 50, tylko już od całej."

**Przykład graniczny (kluczowy dla testów):**
```
faktury na 49 000 zł  ->  49 000 x 10% = 4 900 zł
faktury na 50 000 zł  ->  50 000 x 12% = 6 000 zł
```
Wzrost obrotu o 1 000 zł podnosi prowizję o 1 100 zł.

**Przykład z warsztatu:**
```
Styczeń:  26 000 + 25 000 = 51 000 zł  ->  12% od całości
Luty:     25 000 + 24 000 = 49 000 zł  ->  10% od całości
```

**Realne wystąpienie:** w sierpniu IS wystawiła faktury na 52 000 zł, całość rozliczona po 12%.

### Model B: skala ROCZNA (YTD), stawka od NADWYŻKI

Dla instytucji o dużym wolumenie.

| Próg narastająco od początku roku | Stawka |
|---|---|
| 0 - 500 000 zł | 20% |
| 500 000 - 1 000 000 zł | 17,5% |
| 1 000 000 - 1 500 000 zł | 15% |
| powyżej | schodzi aż do 10% |

> **Bartek (12:35):** "są instytucje, które podsyłają bardzo duże wnioski i oni na przykład mają od zera do pół miliona 20%, od pół miliona do miliona mają 17,5, od miliona do półtorej 15 i tak dalej, do 10 aż się zatrzyma."

Warianty w arkuszu `Prowizja liczenie.xlsx` (do potwierdzenia, która wersja jest aktualna):
```
Wariant 1:  <500k = 20%   <1M = 10%   >1M = 5%
Wariant 2:  <500k = 18%   <1M = 14%   >1M = 10%
```

**Kierunek: prowizja MALEJE wraz ze wzrostem obrotu.**

Uzasadnienie ekonomiczne:
> **Bartek (47:00):** "z jedną instytucją zrobimy milion w 100 wnioskach, a z drugą milion w 10 przy dużych, wieloosobowych szkoleniach. Przy tych 10 wnioskach dużo mniej się napracujemy niż przy 100."

**Przykład podziału faktury przez próg (z warsztatu):**

> **Uwaga.** Na warsztacie rozegrano ten przykład na **uproszczonej stawce 10%** dla nadwyżki, żeby pokazać mechanikę podziału. Realna stawka drugiego progu w Modelu B to **17,5%**. Poniżej oba warianty.

Wariant demonstracyjny z warsztatu (stawka nadwyżki uproszczona do 10%):
```
Narastająco po dwóch szkoleniach:   490 000 zł   (nadal 20%)
Kolejna faktura:                     15 000 zł
  część do progu:  10 000 x 20% =     2 000 zł
  nadwyżka:         5 000 x 10% =       500 zł
                                    ----------
  prowizja z faktury:                 2 500 zł
  efektywna stawka: 2 500 / 15 000 = ok. 16,7%  ("średnio ok. 17%")
```

Ten sam przypadek na **rzeczywistych stawkach Modelu B** (17,5% dla przedziału 500k-1M):
```
Narastająco po dwóch szkoleniach:   490 000 zł   (nadal 20%)
Kolejna faktura:                     15 000 zł
  część do progu:  10 000 x 20,0% =   2 000,00 zł
  nadwyżka:         5 000 x 17,5% =     875,00 zł
                                    ------------
  prowizja z faktury:                 2 875,00 zł
  efektywna stawka: 2 875 / 15 000 = ok. 19,17%
```

**Wymaganie:** system pokazuje **średnią (efektywną) stawkę** dla faktury podzielonej między progi.

### Model C: próg MIESIĘCZNY, stawka od NADWYŻKI

Umowa Fit Akademia, odczytana z wycinka Worda na warsztacie.

| Parametr | Wartość |
|---|---|
| Kumulacja | miesięczna |
| Sposób liczenia | **od nadwyżki** |
| Próg | 100 000 zł |
| Do progu | 18% |
| Nadwyżka | 14% |

```
Obrót 102 000 zł:
  100 000 x 18% = 18 000 zł
    2 000 x 14% =    280 zł
                  ---------
                   18 280 zł
```

> **Bartek (37:28):** "to ma znaczącą różnicę między 10/12 a tymi. Bo tam jak przekroczymy, to całość liczymy po 12 procentach. A tu jak przekroczymy, to robimy do 100000 po 18, a jak będzie 102000, to te 2000 już będzie po 14."

Wariant z dokumentu przedwarsztatowego (trzy progi miesięczne, od nadwyżki):
```
do 100 000 zł           18%
100 000 - 200 000 zł    14%
powyżej 200 000 zł      10%
```

### Model D: stała stawka

Standard w firmie: **20%** dla wszystkich klientów bez negocjowanych warunków.

---

## Struktura konfiguratora [D-14, TWARDA]

Konfigurator jest **self-service**. Klient sam definiuje warunki bez zlecania zmian wykonawcy.

> **Bartek (34:40):** "pytanie, czy będę mógł sobie to sam ustawiać, jeżeli będą indywidualne, czy za każdym razem będę musiał zlecać?"
> **Paweł (34:56):** "No właśnie nie chcemy, żebyś zlecał to nam. Robić to tak, żebyś ten mechanizm mógł sam konfigurować."

### Parametry

```
WARUNKI PROWIZYJNE (per instytucja, wersjonowane w czasie)
|
+-- rodzaj_kumulacji:  miesieczny | roczny | brak
|
+-- sposob_liczenia:   od_calosci | od_nadwyzki | stala
|
+-- progi[]:           [ (kwota_progu, stawka_%), ... ]
|
+-- stawka_stala:      %          (gdy rodzaj_kumulacji = brak)
|
+-- obowiazuje_od:     data       (typowo 1 stycznia kolejnego roku)
```

Mapowanie modeli na parametry:

| Model | rodzaj_kumulacji | sposob_liczenia | progi |
|---|---|---|---|
| A (10/12) | miesieczny | od_calosci | [(0, 10%), (50 000, 12%)] |
| B (YTD) | roczny | od_nadwyzki | [(0, 20%), (500 000, 17,5%), (1 000 000, 15%)] |
| C (18/14) | miesieczny | od_nadwyzki | [(0, 18%), (100 000, 14%)] |
| D (stała) | brak | stala | stawka_stala = 20% |

### Odrzucone: dowolne formuły matematyczne [D-15]

Klient chciał wpisywać własne działania jak formuły Excela. Wykonawca odrzucił jako niestabilne.

> **Bartek (40:55):** "Mógłbyś mi po prostu go zrobić w formie, że ja muszę wpisać działanie matematyczne, tak jak formułę do excela sobie wpisywałem."
> **Paweł (41:26):** "Rozumiem, ale to nie będzie stabilne. Wolę ci zrobić szablon pod różne warunki. I możliwość wpisywania stałej prowizji per dofinansowanie, per wniosek."
> **Bartek (45:25):** "No ten będzie spoko."

**Ryzyko rezydualne:** szablony parametryczne mogą nie pokryć przyszłych umów. Klient sam przyznaje: "tych przypadków jest przeróżne" (35:32). Mitygacja: zawsze dostępne ręczne nadpisanie stawki per wniosek.

---

## Nadpisanie indywidualne

### Poziom nadpisania: PER WNIOSEK [D-15, TWARDA]

Nie per klient, nie per część klienta. Pojedynczy wniosek wypada spod ogólnych zasad instytucji.

> **Paweł (39:20):** "Wniosek jest na osobnych warunkach, nie cały klient czy jakaś część klienta, tylko konkretny wniosek?"
> **Bartek (39:30):** "No tak, musimy to robić."

Przykład: wniosek na 160 000 zł rozliczany po 15% zamiast 20%, wynegocjowany mailowo przed startem.

**Warunki negocjuje się PRZED złożeniem wniosku, nigdy w trakcie** [D-25].

> **Bartek (43:39):** "nie da się tego warunku zmienić o prowizji w trakcie, jak ktoś uzyskał dofinansowanie, czy sobie nagle wymyślił nową zasadę. Jakie robimy umowy? Od początku są znane wszystkie warunki."

Umowa z jednym klientem dopuszcza zmianę warunków **w formie dokumentowej (mailowej)** przy dużych wnioskach.

### Miejsce nadpisania: moduł Administracja [D-93]

> **Paweł (2:51:59):** "chodzi mi o tę prowizję ustaloną ręcznie per wniosek. Tylko ty możesz to zmienić czy pracownik twój też? I z poziomu admina, czy z poziomu wniosków?"
> **Bartek (2:52:18):** "Administracja."

**Pytanie otwarte [P-06]:** klient odpowiedział tylko na pytanie o miejsce w UI, nie na pytanie o uprawnienie. Nie wiadomo, czy pracownik LDIT może nadpisać prowizję.

### Kasowanie i przywracanie reguły [D-16, TWARDA]

Zasada ogólna dla całego systemu:
1. Ręczna edycja wyliczanej wartości **kasuje regułę** dla tego rekordu
2. Musi istnieć **przywrócenie reguły**

> **Bartek (44:57):** "przypadkiem nie wiem, zemdleję, uderzę głową w klawiaturę i akurat się zmieni wartość prowizji i reguła się usunie, więc mogę przywrócić regułę. Jakąś pamięć po prostu trzeba."

**Implementacja:** flaga `regula_aktywna` + przechowana `wartosc_wyliczona` + akcja "Przywróć regułę".

---

## Przewidywana prowizja [D-26, TWARDA]

System ma prognozować, w którym progu znajdzie się instytucja w danym miesiącu, **zanim faktury zostaną wystawione**.

> **Bartek (26:58):** "możemy zrobić przewidywaną prowizję. Czy to będzie 10 czy 12, no bo tutaj było 54000, a ten się odpadł, zrobiło się 48. No to ja nie mogę mieć 12% tylko 10."
>
> **Bartek (19:23):** "jesteśmy w stanie to określić, czy dany miesiąc u nich będzie na 10 czy na 12, bo dużo wcześniej już mamy rozpisane terminy szkoleń. Wiemy, kiedy faktury będziemy wystawiali."

**Realne przykłady:**
- Październik: szkolenia na 176 000 zł, próg dawno przekroczony, już dziś wiadomo że 12%
- Planowane 54 000 zł, jeden uczestnik odpadł, zostało 48 000 zł, stawka spadła z 12% na 10%

### Konsekwencja obliczeniowa

Zmiana pojedynczej pozycji **przelicza stawkę dla wszystkich pozycji w okresie**.

> **Paweł (28:11):** "zmieniasz wtedy wszędzie w całym miesiącu, nie w pojedynczym szkoleniu, wartość prowizji."

### Kolejność faktur ma znaczenie

System musi wiedzieć, która faktura wyczerpała próg.

> **Paweł (33:45):** "patrzymy na kolejność wystawiania faktur, licząc prowizję w tym przypadku."

**Pytanie otwarte [P-04]:** zachowanie przy fakturach wystawianych niechronologicznie oraz przy korektach faktur.

---

## Konflikt reguły okresu rozliczeniowego [P-01, OTWARTE, PRIORYTET]

**To najważniejsze pytanie otwarte w module prowizji.**

Klient najpierw jednoznacznie ustalił:
> **Bartek (22:21):** "Data wystawienia faktury przez instytucję szkoleniową, czyli jednocześnie przez nas. Data wystawienia faktury."

Pięć minut później pokazał, że w praktyce prognozuje próg z kalendarza szkoleń:
> **Paweł (25:36):** "to mi trochę zmienia pogląd, bo nie będziemy liczyć z faktur, które już zrobiłeś, tylko ty chcesz mieć to wcześniej, na podstawie szkoleń, które są już umówione. Czyli tę informację bierzemy sumując szkolenia, które są zaplanowane na dany miesiąc."
> **Bartek (25:55):** "No właściwie tak."

I natychmiast sam wskazał problem:
> **Bartek (26:10):** "chodzi mi o to, że na przykład ma szkolenie w październiku, a wystawiliśmy to w sierpniu."

### Propozycja rozstrzygnięcia

Rozdzielić dwa byty, które klient miesza:

| Byt | Podstawa | Zastosowanie |
|---|---|---|
| **Prowizja rzeczywista** | data wystawienia faktury | Rozliczenie, faktura prowizyjna, księgowość |
| **Prowizja przewidywana** | data planowanego wystawienia (domyślnie ostatni dzień szkolenia) | Prognoza, dashboard, planowanie |

Oba widoki liczone tym samym silnikiem, różnią się wyłącznie źródłem daty. Gdy faktura zostaje wystawiona, pozycja przechodzi z prognozy do rzeczywistości.

**Wymaga potwierdzenia u klienta.**

---

## Poziom 2: prowizja wewnętrzna dla pracowników LDIT

### Model kaskadowy [D-22]

```
koszt szkolenia
      |
      v
prowizja LDIT od instytucji  =  przychód LDIT
      |
      v
prowizja pracownika  =  % od przychodu LDIT
```

> **Paweł (56:36):** "wychodzimy od dołu, zaczynamy od kosztu szkolenia. Na podstawie tego liczymy twoją prowizję, twój przychód, i na podstawie później twojego przychodu liczymy prowizję dla osób w zespole."

### Baza naliczania: dwa warianty do obsłużenia

| Wariant | Kiedy | Podstawa |
|---|---|---|
| Obecny | dziś | **wartość złożonych wniosków** (statystycznie zakłada się współczynnik akceptacji) |
| Docelowy | od 2027 | **procent od przychodu firmy** |

> **Bartek (55:56):** "na ten moment na podstawie napisanych wniosków o konkretnej wartości, bo tak statystycznie zawsze zakładamy, że tyle i tyle przejdzie. Ale pewnie coś się zmieni w przyszłym roku."

System musi obsłużyć oba warianty.

### BLOKADA PROJEKTOWA [P-02]

**Progi i stawki prowizji wewnętrznej NIE ISTNIEJĄ.**

> **Bartek (57:13):** "No i właśnie to jest problem, bo na tym się jeszcze nie zastanawiałem nawet."
> **Bartek (57:38):** "Właściwie mogę to wymyśleć teraz, w najbliższych dniach."

**Akcja po stronie klienta:** dostarczyć strukturę progów prowizji wewnętrznej. Do czasu dostarczenia moduł nie może być zaprojektowany.

### Cele i premie [D-23]

Powiązany mechanizm: administrator ustawia cele dla zespołu, po przekroczeniu pułapu należy się premia.

- Cele definiowane **samodzielnie przez admina**, bez udziału wykonawcy
- Cele **widoczne dla pracowników**
- **Historia osiągnięć zapisywana** (co osiągnięte, co nie)

> **Bartek (55:30):** "chciałbym po prostu samodzielnie móc wyznaczyć cele, żeby były widoczne dla pracowników. I żeby też historia się zapisywała, co już zostało osiągnięte, co nie."

Przykładowy pułap podany na warsztacie: 1,5 mln zł.

**Pytanie otwarte [P-15]:** nie zdefiniowano jednostki celu (kwota wniosków? liczba wniosków? przychód?) ani okresu rozliczeniowego.

---

## Prezentacja prowizji w interfejsie [D-45]

| Miejsce | Zawartość |
|---|---|
| **Dashboard** | Prosty wykres prowizji potencjalnej. Bez szczegółów |
| **Administracja** | Szczegóły, podstawa do fakturowania. Miejsce ręcznego nadpisania |

> **Bartek (2:51:18):** "bardziej właściwie administracja. Bo ja muszę wiedzieć, na ile faktury wystawić, żeby się automatycznie zliczało."

Stawka konfigurowana per instytucja jest **dziedziczona przez wszystkich jej klientów**.

> **Bartek (2:51:51):** "Konfiguruję sobie [stawkę], u was jest prawie 20%, więc wszyscy, którzy będą przypisani do ciebie, wszyscy twoi klienci, automatycznie."

**Pytanie otwarte [P-07]:** wymiar prezentacji (per uczestnik / per firma / per wniosek) nie został jednoznacznie ustalony. Kontekst wskazuje na **per wniosek**, bo prowizja jest podstawą fakturowania.

---

## Prowizja od dopłaty [P-05, OTWARTE]

Prowizja od kwoty dopłaty należy się **tylko wtedy, gdy dopłata figuruje na wspólnej fakturze KFS**.

> **Bartek (2:32:17):** "Ta dopłata mnie interesuje, żeby za nią wystawić prowizję tylko w momencie, jeżeli to będzie na fakturze łącznie. Jeżeli zagadasz jakieś specjalne warunki z klientem i komercyjnie coś sprzedasz, to nie chcę żadnej prowizji."

Wątek został urwany, obie strony zmęczone. Pytanie wykonawcy bez odpowiedzi:
> **Paweł (2:33:12):** "Skąd bierzesz tę wartość 10000 jako dopłata?"

---

## Prototyp konfiguratora przed implementacją [D-20]

**Ustalenie procesowe:** zanim powstanie kod aplikacji, wykonawca zbuduje **prosty konfigurator w HTML**, w którym klient wpisze liczby i potwierdzi poprawność wyliczeń.

> **Paweł (45:09):** "mógłbym ci zrobić taki konfigurator, żebyśmy nie kodowali aplikacji, zanim nie zostanie to ustalone. Taki prosty konfigurator w HTML, będziesz wpisywał cyferki i mi powiesz, czy to się dobrze liczy, czy nie."
> **Bartek (45:25):** "No ten będzie spoko."

To jest **warunek wstępny** rozpoczęcia implementacji modułu prowizji.

---

## Lista przypadków testowych

Minimalne pokrycie testami, wyprowadzone z warsztatu:

| # | Scenariusz | Oczekiwany wynik |
|---|---|---|
| 1 | Model A, obrót 49 000 zł | 4 900 zł (10% od całości) |
| 2 | Model A, obrót 50 000 zł | 6 000 zł (12% od całości) |
| 3 | Model A, obrót 51 000 zł (2 faktury) | 6 120 zł, obie pozycje po 12% |
| 4 | Model A, rezygnacja obniża 54 000 -> 48 000 | Przeliczenie całego miesiąca na 10% |
| 5 | Model B, faktura przekraczająca próg 500k (**rzeczywiste stawki**) | Podział 10 000 x 20% + 5 000 x 17,5% = 2 875 zł, efektywnie 19,17% |
| 5b | Model B, ten sam przypadek na stawce demonstracyjnej 10% | 2 500 zł, efektywnie 16,7% (wariant z warsztatu, nie z umowy) |
| 6 | Model C, obrót 102 000 zł | 18 000 + 280 = 18 280 zł |
| 7 | Model D, dowolny obrót | 20% liniowo |
| 8 | Nadpisanie ręczne 15% na jednym wniosku | Ten wniosek po 15%, pozostałe wg reguły |
| 9 | Przywrócenie reguły po nadpisaniu | Powrót do wartości wyliczonej |
| 10 | Zmiana warunków IS od 1.01.2027 | Rozliczenia 2026 niezmienione |
| 11 | Faktura z sierpnia za szkolenie w grudniu | Przychód w sierpniu |
| 12 | Dopłata dodatkowa 20 000 zł | Prowizja od kosztu z dopłatą |

**Otwarte, wymaga decyzji przed napisaniem testów:** czy wniosek z nadpisaną stawką wlicza się do sumy narastającej wypełniającej progi pozostałych wniosków tej instytucji [P-03].
