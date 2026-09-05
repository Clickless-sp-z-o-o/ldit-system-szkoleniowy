# 11. UX i nawigacja

## Zasada nadrzędna: "zbliżony wygląd do Excela"

Klient i jego zespół pracują w Excelu odruchowo. Każde odejście od tego wzorca to koszt wdrożenia.

> **Bartek (3:04:28):** "żebyśmy mieli zbliżony wygląd do excela, no bo jest płynniej, będziemy chodzić po tym wszystkim."
>
> **Bartek (1:32:42):** "na excelu było nam wygodnie, umiemy, robimy to odruchowo, więc to będzie kwestia paru dni, tygodni, żeby też zrozumieć logikę tego systemu."

Jednocześnie klient krytykuje własny Excel za nadmiar informacji:

> **Bartek (1:32:18):** "za ciężko się skupić mi na czymś konkretnym, z bardzo dużo tych informacji jednocześnie wyskakuje. Wolałbym, żeby to po prostu było mocno przejrzyste i wszystko miało swoje miejsce."

**Wniosek projektowy:** zachować mechanikę Excela (tabela, edycja w komórce, kolory wierszy), odrzucić jego wadę (wszystko na jednym ekranie).

---

## Nawigacja

### Lewe menu jako odpowiednik arkuszy Excela [D-108]

> **Bartek (3:04:15):** "wszystko co robimy, tak jak w excelu masz na dole arkusze, no to proponuję zrobić takie, żebyśmy mieli z lewej strony zakładki."

**Menu renderowane dynamicznie** na podstawie uprawnień roli [D-36].

### Struktura menu

```
Dashboard
Dofinansowania              <- rozwija listę instytucji przypisanych do konta
   +-- Metal Maniak
   +-- Odczaruj Power BI
   +-- Dron Fortech
Zestawienia                 <- drzewo lat
   +-- 2025
   +-- 2026
   +-- 2027
Baza klientów
Nabory
Instytucje szkoleniowe
Wysyłka maili
Zgłoszenia
Administracja               <- tylko admin
Konta i uprawnienia         <- tylko admin
Rejestr aktywności          <- tylko admin
```

**Widok instytucji szkoleniowej:** jedna zakładka opisana nazwą własnej spółki [D-76].

> **Bartek (2:21:03):** "będzie napisane Klikless spółka z o.o. z lewej strony. Admin i pracownicy widzą wszystkie te zakładki, ale ty jako ta instytucja widzisz tylko tę jedną. I tylko widzisz swoich klientów."

---

## Rozjazd makiety v1 z wizją klienta [D-112]

**Wykryty pod koniec warsztatu.** Makieta wymaga przebudowy nawigacji.

| | Makieta v1 | Wymaganie klienta |
|---|---|---|
| Wybór instytucji | Przełącznik w prawym górnym rogu | **Rozwijana lista w lewym menu pod "Dofinansowania"** |
| Model pracy | Kontekst jednej instytucji naraz | Wszystkie instytucje w jednej tabeli, jak w Excelu |
| Numeracja | Per instytucja | **Ciągła w ramach roku, trafia na fakturę** |

> **Paweł (3:09:56):** "Makietę zaprogramowałem tak troszkę inaczej niż chcesz w takim razie. Obecnie mam rolę administratora tu, prawy górny róg. I na każdą instytucję patrzę osobno."
>
> **Bartek (3:07:22):** "wolę mieć to tak jak w excelu, czyli mam po kolei, bo wtedy widzę jaki pierwszy został wniosek złożony w tym roku i mam takie wiersze numerów klienta rozpisane. Ja te numery klienta piszę też na fakturach. Lepiej wolę mieć to jedno po drugim, wszystkie instytucje szkoleniowe razem, w którym będzie napisane nazwa klienta, jaka instytucja szkoleniowa, kto był realizatorem szkolenia, dane kontaktowe do tego klienta."

### Wypracowany kompromis

1. Zakładka **Dofinansowania** z lewej rozwija listę instytucji przypisanych do konta
2. **Zbiorczy widok wszystkich instytucji trafia na dashboard i do statystyk**
3. Pracownik widzi wyłącznie instytucje ze swojego przydziału

> **Paweł (ok. 3:13:25):** "No dobra, dobra, już rozumiem, rozumiem, spoko. Dla mnie ok."

### Sprzeczność pozostała nierozwiązana [P-08]

Klient powiedział, że zbiorczy widok ma być tylko na dashboardzie ("po co wyświetlać 2 razy"), ale wcześniej opisywał go jako **widok operacyjny** do masowej zmiany statusów po filtrze PUP.

Dashboard ma być "tylko statystyki, żadnej rozpiski klientów". Te dwa wymagania się wykluczają.

**Rekomendacja do potwierdzenia:** zbiorcza tabela wniosków powinna być osobnym widokiem operacyjnym (np. pod "Zestawienia"), a dashboard pozostaje czysto statystyczny. Widok operacyjny jest potrzebny do realnej pracy: filtr po PUP i masowa zmiana statusów po ogłoszeniu wyników.

---

## Edycja inline [D-115]

**Edycja bezpośrednio w komórce, bez trybu edycji z przeładowaniem strony i przekierowaniami.**

> **Bartek (3:12:03):** "tam mogę sobie zmieniać dane, ewentualnie nawet te komórki mogę edytować, tak jak w excelu."
>
> **Bartek (44:03):** "ja bym po prostu chciał mieć możliwość edytowania sobie tej komórki, że ten klient jest obsługiwany po prostu po 15 procentach, tak jak mogę zrobić to w excelu."

Wymaganie zgłoszone w dokumentacji przedwarsztatowej **wprost jako słabość rozwiązania konkurencyjnego**.

### Zachowanie pól wyliczanych przy edycji

Opisane w [03. Model danych](03-model-danych.md#pola-wyliczane-vs-ręczne):
1. Ręczna edycja **kasuje regułę** dla tego rekordu
2. System pamięta wartość wyliczoną
3. Dostępna akcja **Przywróć regułę**

### Wizualne rozróżnienie pól [D-81]

W makiecie przyjęto: **pola wprowadzane ręcznie oznaczone na żółto**, pola wyliczane bez wyróżnienia.

> **Paweł (2:26:00):** "które mogę [wpisywać], to będą na żółto. To mogę wpisywać, tego nie mogę wpisywać."

To konwencja prototypu. W systemie docelowym warto rozważyć czytelniejsze rozróżnienie, bo żółte tło koliduje z kolorowaniem wierszy wg statusu.

## Tooltipy wyjaśniające (feedback klienta 2026-09-04)

Klient poprosił, żeby wyjaśnienia z makiety były czytelniejsze, zamiast długich notek pod tabelą:

> "zróbmy tooltipy. Czyli po najechaniu wyświetla się taka większa informacja, co to znaczy, co dany wskaźnik znaczy, czy kolumna. Szczególnie na panelu instytucji, w dofinansowaniach."

**Zasada:** każda kolumna finansowa i każdy wskaźnik, którego znaczenie nie jest oczywiste z nazwy, dostaje krótkie wyjaśnienie dostępne po najechaniu. W makiecie realizuje to `assets/tips.js` plus atrybut `data-tip` na nagłówku lub etykiecie (marker "i"). Dymek dopinany jest do `body`, więc nie jest przycinany przez przewijane tabele. Priorytet: karta wniosku (Przyznano, Koszt całkowity z dopłatą, Wkład własny), lista dofinansowań (Wartość, Przyznano, Rozliczenie) i wskaźniki instytucji.

---

## Kolorowanie wierszy [D-01]

| Kolor | Znaczenie |
|---|---|
| Czerwony jasny | Decyzja negatywna |
| Zielony | Decyzja pozytywna |
| Fioletowy | Rozliczone kompletnie |
| Zielony (kontekst bazy klientów) | Aktywny nabór u tego klienta |

Kolor obejmuje **cały wiersz** i zmienia się **automatycznie** przy zmianie statusu.

### Konflikt do rozwiązania

Trzy niezależne mechanizmy kolorystyczne mogą się nakładać:
1. kolor wiersza wg statusu decyzji
2. kolor wiersza wg aktywnego naboru (w bazie klientów)
3. żółte tło pól edytowalnych

**Rekomendacja:** kolor wiersza rezerwować dla statusu, pola edytowalne oznaczać innym środkiem (obramowanie, ikona, kursor), a aktywny nabór wyróżniać znacznikiem w komórce, nie tłem całego wiersza.

**Wymóg dostępnościowy:** kolor jest dodatkiem do statusu tekstowego, nie jego zamiennikiem. Nazwane statusy muszą być widoczne obok kolorów, bo ok. 8% mężczyzn ma zaburzenia rozpoznawania barw.

---

## Nazewnictwo: zachować obecne [D-55]

**Twarde żądanie klienta.** Uzasadnienie: przyzwyczajenia zespołu, skrócenie krzywej uczenia.

| Nazwa w dokumentacji | Nazwa dla użytkownika |
|---|---|
| Dofinansowania | **Zestawienia** (dla widoku rocznego) |
| Wnioski | **Nabory** (główne okno robocze) |
| Wniosek | **Projekt** (jeden projekt = jeden wniosek) |
| Uczestnicy / leady | **Baza klientów** |

> **Bartek (1:47:16):** "Chciałbym trochę zachować też nazewnictwo. Rozwijam sobie tutaj z lewej strony dofinansowania i rozwija mi się pod spodem 2025, 2026, 2027, zestawienie. Żeby to się nazywało zamiast dofinansowania, żeby to tak jak już teraz działamy, jesteśmy przyzwyczajeni, żeby te nazwy pozostawały."

Wykonawca zasygnalizował ryzyko:
> **Paweł (1:47:39):** "jak ty zmieniłeś nazewnictwo, to mi się teraz miesza."

**Rekomendacja:** utrzymywać [16. Słownik](16-slownik.md) jako mapowanie między nazwami technicznymi a nazwami dla użytkownika. Bez tego rozjazd będzie rósł.

### Nazwy do zmiany

| Obecna | Problem | Status |
|---|---|---|
| `NW` (status) | Rozwinięcie skrótu zapomniane przez samego klienta | Do zmiany [P-11] |
| `Niezłożone` (zakładka) | Myląca, bo zawiera też złożonych | Klient proponuje "Baza klientów" |
| `koszt całkowity` (pole) | Klient kwestionuje, myli się z całkowitą wartością | Do ustalenia [P-13] |

---

## Wyszukiwanie i filtry

### Wyszukiwarka globalna [D-110]

Dostępna z każdego miejsca systemu. Kryteria: **NIP, nazwa klienta, PUP**.

### Wyszukiwarka na zakładce wniosków

Główne zastosowanie operacyjne. Realny scenariusz: urząd ogłasza wyniki, LDIT filtruje wszystkie wnioski złożone do tego PUP i masowo zmienia statusy.

> Przykład podany na warsztacie: "wszystkie wnioski na Warszawę".

**Masowe oznaczanie wyników kolorami** w widoku przefiltrowanym (zielony pozytywny, czerwony negatywny).

### Wyszukiwarka korespondencji

Po tytule i treści konwersacji mailowej. Skala: 400 maili, cofanie się pół roku wstecz.

### Wyszukiwarka dla instytucji: ograniczona

Tylko własni klienci. Klient sam sygnalizuje to jako ryzyko wycieku [D-111].

---

## Dashboard

**Ma być prosty.**

> **Bartek (3:09:08):** "dashboard ma być dosyć prosty, tylko głównie statystyki, tak naprawdę nic szczegółowego, żadnej rozpiski klientów, nic kompletnie."

Analogia podana przez klienta: dashboard portfela kryptowalut. Za ile kupione, jaki zysk, cała wartość portfela, ile w danej walucie.

Interpretacja: **agregaty i wskaźniki, żadnych list rekordów.**

Dwa warianty: administratora (z finansami) i pracownika (bez zysków i stawek).

---

## Tryb mobilny

Wymaganie z dokumentacji przedwarsztatowej: **interfejs musi być użyteczny na telefonie, nie tylko na komputerze.**

Warsztat tego nie omawiał. Wymaganie pozostaje w mocy, ale nie zostało potwierdzone ani doprecyzowane. Przy układzie tabelarycznym "jak Excel" to nietrywialne, wymaga osobnego projektu widoków mobilnych.

---

## Proces projektowania interfejsu

Ustalony tryb pracy [D-30]:

```
1. Makieta v1 (szara, bez stylizacji)     <- ZROBIONE
   celowo pozbawiona designu, żeby skupić uwagę na strukturze
              |
2. Makieta v2 "wyglądająca jak aplikacja" <- NASTĘPNY KROK
   dalej HTML, moduły oznaczone kolorami
   2-3 godziny pracy wykonawcy
              |
3. Spotkanie: przegląd makiety v2
              |
4. Wycena z podziałem na wersję I i opcje dodatkowe
              |
5. Implementacja modułami z odbiorem iteracyjnym
```

> **Paweł (1:33:00):** "myślę, że teraz po tym warsztacie nie zaczniemy jeszcze robić aplikacji. Zrobimy sobie pewnie jeszcze dogrywkę, żebyś mógł przetestować mechanizm liczenia prowizji, żebyśmy ustalili konkretne widoki. To będzie wtedy spotkanie drugie, już z taką makietą, która będzie wyglądała jak aplikacja, ale pewnie dalej to będzie zwykły HTML."

Klient docenił makietę jako narzędzie komunikacji, ale zastrzegł, że ocenia ją pierwszy raz:

> **Bartek (1:32:03):** chwali czytelność pokazanego CRM, zaznaczając że widzi to pierwszy raz.

**Ryzyko:** akceptacja UI na podstawie krótkiego dema może nie przetrwać kontaktu z realnym wolumenem danych. Patrz [15. Ryzyka](15-ryzyka.md).
