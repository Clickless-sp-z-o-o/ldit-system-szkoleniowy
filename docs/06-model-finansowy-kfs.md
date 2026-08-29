# 06. Model finansowy KFS

Ten rozdział opisuje kwoty **po stronie klienta końcowego i urzędu**. Prowizja LDIT jest opisana osobno w [07. Silnik prowizji](07-silnik-prowizji.md).

---

## Reguły zewnętrzne KFS

To są przepisy, nie preferencje klienta. Nie podlegają negocjacji.

### Wskaźnik dofinansowania zależy od wielkości przedsiębiorstwa

| Wielkość | Kryterium | Dofinansowanie | Wkład własny |
|---|---|---|---|
| **Mikroprzedsiębiorca** | do **9 osób** zatrudnionych łącznie na umowie o pracę | **90%** (x 0,9) | 10% |
| Mały, średni, duży, inny | powyżej 9 osób | **70%** (x 0,7) | 30% |

> **Bartek (1:51:21):** "Jeżeli firma zatrudnia do 9 osób łącznie na umowie o pracę, jest mikroprzedsiębiorcą. Wszystko powyżej to już mały, średni, duży, inny przedsiębiorca. I wszyscy ci powyżej mikro mają 70% dofinansowania, 30 wkładu własnego. Znajdziemy tę informację o zatrudnieniu w formularzu klienta."

**Wkład własny przechowywany procentowo, nie kwotowo** [D-59]. Wynika z wielkości przedsiębiorstwa.

> **KONFLIKT DECYZJI [P-53].** Warsztat wydał dwie sprzeczne decyzje o wkładzie własnym, obie oznaczone jako TWARDE:
> - **D-59** (1:51:21): wkład własny **wynika z wielkości przedsiębiorstwa**, przechowywany procentowo, czyli wyliczany
> - **D-80** (2:25:46): wkład własny i kwota dopłaty dodatkowej **wpisywane ręcznie**
>
> **Propozycja pogodzenia:** procent wkładu jest wyliczany z wielkości przedsiębiorstwa (D-59) i to jest wartość domyślna. Kwota wkładu podlega ręcznemu nadpisaniu (D-80) w przypadkach, gdy urząd narzuci inną kwotę niż wynikającą ze wskaźnika, zgodnie z ogólną zasadą kasowania i przywracania reguły [D-19]. Wymaga potwierdzenia u klienta.

### Dofinansowanie przyznawane firmie, nie osobie

Beneficjentem jest zawsze pracodawca. Uczestnicy są przypisani do firmy i do wniosku.

### Kwalifikowalność uczestnika

Osoba bez umowy o pracę nie kwalifikuje się do KFS. Typowy przypadek: prezes zarządu będący większościowym udziałowcem.

> **Bartek (2:30:45):** "Jestem prezesem zarządu, który jest większościowym udziałowcem, i nie ma na dodatek umowy o pracę, czyli się w ogóle do KFS nie kwalifikuje."

**Konsekwencja twarda:** osoby niezakwalifikowanej **nie wolno dopisać do kosztu całkowitego projektu**. Wymaga odrębnej faktury komercyjnej.

> **Bartek (2:30:18):** "Osoba dziesiąta, która się nie zakwalifikowała, nie możemy jej wystawić tutaj 10000, dopisać do kosztów całkowitych, bo jej w ogóle to szkolenie nie obejmuje z tego projektu, tylko musisz jej wystawić odrębną fakturę na 10000 jako komercyjne."

---

## Pola kwotowe wniosku

Nazewnictwo zostało na warsztacie dwukrotnie skorygowane. Poniżej wersja ostateczna, z zastrzeżeniem że nazwa pola `koszt_calkowity` pozostaje sporna.

| Pole | Sposób | Definicja |
|---|---|---|
| **Całkowita wartość szkolenia** | wyliczane | Suma kwot uczestników **zakwalifikowanych**. Wartość szkolenia z wkładem własnym, nie samo dofinansowanie |
| **Koszt całkowity** | **ręczne** | Wartość **uznana przez urząd**, podstawa wyliczenia dofinansowania. Może być niższa od wnioskowanej |
| **Przyznano** | wyliczane, nieedytowalne | `koszt_calkowity x wskaznik` (0,9 lub 0,7) |
| **Wkład własny (%)** | wyliczane | Z wielkości przedsiębiorstwa: 10% lub 30% |
| **Dopłata standard** | wyliczane, pomocnicze | `calkowita_wartosc x procent_wkladu`. Ile klient musi dołożyć |
| **Kwota dopłaty dodatkowej** | **ręczne**, domyślnie 0 | Dodatkowa kwota poza wkładem własnym |
| **Koszt całkowity z dopłatą** | wyliczane | `koszt_calkowity + kwota_doplaty_dodatkowej`. **Podstawa prowizji LDIT** |

### Korekta nazewnictwa z warsztatu

> **Bartek (2:03:18):** "To jest nie kwota wnioskowana, tylko wartość na jaką szkolenie będzie, wartość szkolenia. Czyli to jest ten koszt całkowity jaki wnioskujemy, a nie samo dofinansowanie."

Pole nazywane wcześniej "kwota wnioskowana" oznacza **całkowitą wartość szkolenia**.

### Spór o nazwę `koszt całkowity` [P-13, OTWARTE]

> **Bartek (2:06:02):** "to się nie nazywa koszt całkowity", proponował "dofinansowanie ze wkładem własnym".

Nazwa nie została ustalona. Rekomendacja: **"Koszt uznany przez urząd"**, bo to precyzyjnie oddaje semantykę i nie myli się z całkowitą wartością szkolenia.

---

## Wzory

```
wskaznik_dofinansowania = 0,9  gdy wielkosc = mikro
                        = 0,7  w pozostałych przypadkach

calkowita_wartosc_szkolenia = SUMA( uczestnik.kwota )
                              WHERE uczestnik.status = 'zakwalifikowany'

przyznano = koszt_calkowity * wskaznik_dofinansowania

doplata_standard = calkowita_wartosc_szkolenia * (1 - wskaznik_dofinansowania)

koszt_calkowity_z_doplata = koszt_calkowity + kwota_doplaty_dodatkowej

// kierunek odwrotny, gdy urząd podaje kwotę przyznaną:
koszt_calkowity = przyznano / wskaznik_dofinansowania
```

**Ograniczenie 1:** formuła `przyznano` **nie może uwzględniać dopłaty dodatkowej**. Dopłata to pieniądz klienta, nie urzędu.

> **Bartek (2:01:41):** "jak doliczy się to do kosztu całkowitego, to się przyznano [zmieni], więc tutaj trzeba by było jeszcze w formule dopisać, że nie uwzględnia tej dopłaty."

**Ograniczenie 2:** dopłata dodatkowa **nie może podnosić wartości ponad ustaloną całkowitą wartość szkolenia**.

> **Bartek (2:04:45):** "Nie mogą dopłacić więcej niż jeżeli ustawiliśmy, że koszt całkowity to było 200000. Nie może być za 220. Czyli dopłata jest w przypadku, jeżeli na przykład dostali za mało."

**Ograniczenie 3:** równanie kontrolne
```
przyznano + wklad_wlasny = koszt_calkowity
```
System ma go pilnować. Przykład: 90 000 + 10 000 = 100 000.

---

## Reguły zaokrąglania i typ danych

> **Uwaga.** Ten rozdział nie wynika z warsztatu. To luka wykryta przy analizie dokumentacji, wymagająca potwierdzenia u klienta [P-51]. Bez ustalonych reguł równanie kontrolne będzie się rozjeżdżać o grosze przy niepodzielnych kwotach.

**Problem.** Wskaźniki 0,9 i 0,7 dają wartości niecałkowite. Przykład: koszt całkowity 3 333,33 zł x 0,7 = 2 333,331 zł. Bez reguły zaokrąglania `przyznano + wkład własny` nie zsumuje się do kosztu całkowitego.

**Rekomendacje do zatwierdzenia:**

| Zasada | Wartość |
|---|---|
| Typ danych dla kwot | Dziesiętny stałoprzecinkowy, nigdy zmiennoprzecinkowy. Przechowywanie w groszach jako liczba całkowita lub `DECIMAL(12,2)` |
| Precyzja prezentacji | 2 miejsca po przecinku |
| Metoda zaokrąglania | Matematyczna, do najbliższej setnej (0,005 w górę) |
| Kolejność operacji | Najpierw wylicz `przyznano`, zaokrąglij. Wkład własny jako **reszta**: `koszt_calkowity - przyznano`. Dzięki temu równanie kontrolne domyka się zawsze |
| Stawki prowizji | Przechowywane z precyzją do 0,01 punktu procentowego (17,5% jako 17,50) |
| Prowizja przy podziale przez próg | Zaokrąglić **dopiero sumę** części, nie każdą część osobno |

**Uzasadnienie reguły reszty.** Jeśli obie wartości zaokrąglić niezależnie, równanie kontrolne może się nie domknąć:
```
koszt 3 333,33 x 0,7 = 2 333,331  ->  zaokraglone: 2 333,33
wklad 3 333,33 x 0,3 =   999,999  ->  zaokraglone:   999,99  ->  1000,00
suma: 2 333,33 + 1 000,00 = 3 333,33  OK w tym przypadku, ale nie zawsze
```
Liczenie wkładu jako reszty (`3 333,33 - 2 333,33 = 1 000,00`) gwarantuje domknięcie zawsze.

**Do potwierdzenia u klienta:** czy urząd stosuje własne zaokrąglenia, które mogą się różnić od systemowych. Jeśli tak, pole `przyznano` musi dopuszczać korektę ręczną, co dodatkowo przemawia za rozstrzygnięciem [P-30] na korzyść edytowalności.

---

## Kiedy pojawia się dopłata dodatkowa

Dwa scenariusze:

**Scenariusz A: urząd przyznał mniej niż potrzeba**

> **Bartek (2:04:45):** "urząd powiedział, że nie możemy wam dać 140, możemy wam dać góra 120."

**Scenariusz B: instytucja szkoleniowa nie zejdzie z ceny**

Cena bywa wyznaczana za grupę. Wypadnięcie jednej osoby oznacza albo dopłatę, albo niemożność realizacji.

> **Bartek (2:30:55):** "Cena była wyznaczona za grupę i nie zrealizujesz szkolenia za 90000 dla tych wszystkich osób. Muszą albo dopłacić 10000, albo niestety nie da się zrealizować szkolenia."

---

## Przykłady liczbowe z warsztatu

### Przykład 1: klient Abis, mikroprzedsiębiorca, częściowe przyznanie
```
Wnioskowano (całkowita wartość):     5 700 zł
Urząd przyznał tylko na 2 moduły
Kwota przyznana:                     4 000 zł
Wskaźnik:                            0,9 (mikro)
Koszt całkowity = 4 000 / 0,9  =  ok. 4 444 zł
Wkład własny (10%)             =  ok.   444 zł
```

### Przykład 2: firma średnia, 10 osób, jedna niezakwalifikowana
```
Zgłoszono:                           10 osób
Wnioskowano:                        100 000 zł
Przyznano na:                         9 osób (10. to prezes bez umowy o pracę)
Koszt całkowity:                     90 000 zł
Wielkość:                            średnia -> wskaźnik 0,7
Przyznano = 90 000 x 0,7        =    63 000 zł
Wkład własny (30%)              =    27 000 zł
```

Bartek najpierw omyłkowo podał 81 000 zł (mnożąc x 0,9), po czym sam się poprawił: "nie możesz tego zrobić, bo to już nie jest mikroprzedsiębiorca."

### Przykład 3: firma średnia z dopłatą dodatkową
```
Całkowita wartość szkolenia:        200 000 zł
Dopłata standard (30%)         =     60 000 zł
Urząd uznał koszt:                  180 000 zł
Przyznano = 180 000 x 0,7      =    126 000 zł
Dopłata dodatkowa (ręczna):          20 000 zł  (IS nie zejdzie z ceny)
Koszt całkowity z dopłatą      =    200 000 zł  <- podstawa prowizji
```

> **NIESPÓJNOŚĆ [P-14].** Dopłata standard została policzona od 200 000 (wartość wnioskowana), a `przyznano` od 180 000 (koszt uznany). Nie ustalono, od której podstawy liczy się wkład własny. Do rozstrzygnięcia.

### Przykład 4: negocjacja z urzędem (sprawa prowadzona przez Asię)
```
Klient dostał decyzję negatywną (brak środków w urzędzie)
Urząd oddzwonił: środki jednak są, ale koszt całkowity nie może być 16 000 zł
Urząd da maksymalnie:                12 000 zł
Liczba uczestników:                        2
Koszt całkowity = 12 000 / 0,9  =  ok. 13 333 zł
Klient dopłacił z własnych środków do:  16 000 zł
```

### Przykład 5: jeden wniosek, trzy różne szkolenia
```
7 osób x 10 000 zł  =  70 000 zł
1 osoba x  5 000 zł  =   5 000 zł
1 osoba x 15 000 zł  =  15 000 zł
                       ----------
Całkowita wartość    =  90 000 zł
```

Reguła: **kwota dotyczy jednej osoby**, koszt całkowity to cena za osobę razy liczba osób, każda osoba wpisywana odrębnie.

> **Bartek (2:27:15):** "1900 zł za osobę szkolenia, wnioskuję 10 osób, czyli 19000, i każda ta osoba jest wpisywana odrębnie."

---

## Rozjazd danych źródłowych z urzędu [ryzyko]

Informacja od urzędu przychodzi **raz jako kwota przyznana, raz jako koszt całkowity z podanym procentem wkładu**. System musi obsłużyć konwersję w obie strony.

> **Paweł (2:00:33):** "no możemy to ujednolicić w systemie."

**Ryzyko:** urząd może przyznać kwotę, która nie wynika z mnożnika 0,7 ani 0,9 (przyznanie na część modułów, arbitralne obniżenie). Rozwiązanie przyjęte na warsztacie, czyli korekta pola `koszt_calkowity` tak, żeby wynik się zgadzał, jest **obejściem, nie modelem**. Patrz [15. Ryzyka](15-ryzyka.md).

---

## Polityka cenowa wobec urzędów

Reguła biznesowa istotna dla wartości systemu, choć nie jest wymaganiem funkcjonalnym etapu I.

**Precedens cenowy:** jeśli instytucja raz zejdzie z ceny, urząd nie zaakceptuje już wyższej kwoty dla tego szkolenia.

> **Bartek (2:33:35):** "Maciek zszedł z 6000 do 5. To żaden wniosek od tamtego momentu nie może być na 6. Wszystkie muszą być na 5, jeżeli chodzi o to szkolenie."

**Rekomendowana praktyka:** zamiast obniżać cenę, IS dopłaca ok. 1 000 zł z własnych środków.

> **Bartek (2:33:35):** "Dopłacimy z naszej strony dodatkowe 1000 zł w celu realizacji szkolenia, żeby pokazać im, że jednak to szkolenie kosztuje 6000, a nie 5. Bo jeżeli zeszła instytucja do 5, to u następnych klientów też tak zrobi. A przy na przykład 100 wnioskach już będzie miało to duże znaczenie."

Skala efektu: **1 000 zł x 100 wniosków = 100 000 zł** utraconego przychodu instytucji.

**Potencjalne rozszerzenie (nie w etapie I):** system mógłby ostrzegać o historycznych cenach zaakceptowanych przez dany urząd dla danego szkolenia. Nie zgłoszone jako wymaganie, ale wynika wprost z tej reguły.

**W etapie I dopłaty i wkłady własne są wpisywane ręcznie**, bez automatyzacji [D-86].

> **Paweł (2:36:02):** "Dobra, zostawmy to. To będzie jako historia. Czyli jako taki status będziesz miał tę informację, ale to sobie wpiszesz z ręki, póki co."
