# 05. Moduły funkcjonalne

Lista modułów po warsztacie. Nazewnictwo zakładek odzwierciedla **żądanie klienta o zachowanie obecnych nazw** [D-55], nie nazwy z dokumentacji przedwarsztatowej.

> **Bartek (1:47:16):** "Chciałbym trochę zachować też nazewnictwo (...) żeby to tak jak już teraz działamy, jesteśmy przyzwyczajeni, żeby też te nazwy pozostawały."

---

## Mapa modułów

| # | Zakładka (nazwa dla użytkownika) | Priorytet | Status specyfikacji |
|---|---|---|---|
| 1 | **Dashboard** | MUST | Gotowa |
| 2 | **Dofinansowania** (rozwija listę instytucji) | MUST | Gotowa |
| 3 | **Zestawienia** (2025 / 2026 / 2027) | MUST | Gotowa |
| 4 | **Baza klientów** (dziś: "Niezłożone") | MUST | Gotowa |
| 5 | **Nabory** | MUST | Gotowa |
| 6 | **Instytucje szkoleniowe** + katalog szkoleń | MUST | Gotowa |
| 7 | **Konfigurator instytucji** (prowizje, wzór certyfikatu) | MUST | Gotowa |
| 8 | **Administracja** (prowizje szczegółowe, faktury) | MUST | Częściowa |
| 9 | **Wysyłka maili** (szablony) | MUST | Szablony do dosłania |
| 10 | **Zgłoszenia** (incydenty) | SHOULD | Gotowa |
| 11 | **Konta i uprawnienia** | MUST | Gotowa |
| 12 | **Rejestr aktywności** | MUST | Gotowa |
| 13 | **Terminy i kalendarz szkoleń** | SHOULD | Niepełna |
| 14 | **Statystyki** | SHOULD | Zakres dla IS sporny |
| 15 | ~~Zadania~~ | **WON'T** | Przeniesione do Projectly |
| 16 | ~~Kalendarz Outlook~~ | **WON'T** | Wykluczone |
| 17 | **Panel klienta końcowego** | OTWARTE | Nierozstrzygnięte |

---

## 1. Dashboard

**Ma być prosty. Wyłącznie statystyki.**

> **Bartek (3:09:08):** "dashboard ma być dosyć prosty, tylko głównie statystyki, tak naprawdę nic szczegółowego, żadnej rozpiski klientów, nic kompletnie."

Analogia podana przez klienta: dashboard portfela kryptowalut (za ile kupione, jaki zysk, cała wartość portfela).

**To jedyne miejsce z przekrojem przez wszystkie instytucje** (kompromis architektoniczny [D-112]).

Zawartość:
- Ile wniosków złożono, ile pozytywnych, ile negatywnych, ile rezygnacji
- Na jakie kwoty, ile oczekuje na rozpatrzenie
- Prowizja potencjalna jako prosty wykres
- Cele zespołu i postęp ich realizacji
- Zyski, marżowość per instytucja (**wyłącznie admin**)

Dwa warianty: **dashboard administratora** (z finansami) i **dashboard pracownika** (bez zysków firmy i stawek prowizyjnych) [D-30].

---

## 2. Dofinansowania

Zakładka w lewej nawigacji, która **rozwija listę instytucji szkoleniowych** przypisanych do konta zalogowanego użytkownika [D-112].

To jest kompromis wypracowany na koniec warsztatu. Makieta v1 zakładała przełącznik instytucji w prawym górnym rogu, klient chciał listy w lewej nawigacji.

> **Bartek (3:12:21):** "z lewej strony dofinansowania (...) żeby się rozwijało mi to pole i tutaj mam dostęp do instytucji przypisanej do danego konta. Pracownik Łucjan ma dostęp tylko do Metal Maniak, pracownik Martyna ma dostęp do Odczaruj Power BI i Dron Fortech."

---

## 3. Zestawienia

Drzewo lat w lewej nawigacji: **2025 / 2026 / 2027**. Odwzorowanie zakładek Excela.

Zbiorcze zestawienie wszystkich instytucji w jednej tabeli, ułożone chronologicznie wg kolejności złożenia wniosków w roku.

**Kluczowe: numer klienta.** Sekwencyjny w ramach roku, trafia na fakturę, wiąże fakturę z wnioskiem.

> **Bartek (3:07:22):** "wolę mieć to tak jak w excelu, czyli mam po kolei, bo wtedy widzę jaki pierwszy został wniosek złożony w tym roku i mam takie wiersze numerów klienta rozpisane. Ja te numery klienta piszę też na fakturach."

Kolumny widoczne w zestawieniu: numer klienta, nazwa klienta, instytucja szkoleniowa, realizator szkolenia, dane kontaktowe, kwoty, statusy.

**Sprzeczność do rozstrzygnięcia [P-08]:** klient powiedział, że zbiorczy widok wszystkich instytucji ma być tylko na dashboardzie ("po co wyświetlać 2 razy"), ale wcześniej opisywał go jako widok operacyjny do masowej zmiany statusów po filtrze PUP.

---

## 4. Baza klientów (dziś: "Niezłożone")

Opisana w [04. Proces i statusy](04-proces-i-statusy.md#widok-niezłożone-jako-baza-klientów-d-43-twarda).

Kluczowe: powiązanie z modułem naborów, sortowanie po dacie zakończenia naboru, wizualne wyróżnienie aktywnego naboru.

---

## 5. Nabory

**Integracja istniejącej aplikacji do przewidywania naborów wewnątrz systemu** [D-109]. System jest odbiorcą prognoz, nie liczy ich samodzielnie.

> **Bartek (3:05:37):** "trzeba połączyć apkę do przewidywania wraz z systemem, żeby było wszystko widać, żeby te nabory były w jednym miejscu, a nie w odrębnym linku, który trzeba zakładkę sobie stwarzać."

Zawartość: nabory aktualne, prognozowane i zakończone. Nabór przypisany do urzędu pracy (340 w bazie). Rodzaj naboru jako osobny wymiar (dziś tylko KFS, model musi dopuszczać powiatowe i inne programy).

---

## 6. Instytucje szkoleniowe i katalog szkoleń

**Karta instytucji:** dane firmy, opis działalności, osoby kontaktowe, dane do faktur, **siedziba** (źródło miejscowości na certyfikacie).

**Katalog szkoleń** prowadzony przez instytucję. Każde szkolenie jako standardowy formularz: nazwa, plan, godziny, zakres, procedura przed szkoleniem.

- Instytucja sama wprowadza informacje o szkoleniach [D-42]
- Administrator też może nimi zarządzać
- **Dodanie nowego planu jest swobodne, edycja istniejącego przechodzi przez administratora lub go powiadamia** [D-43, mechanizm do doprecyzowania]

Uzasadnienie:
> **Paweł (1:23:30):** "żebym ja ci mailowo nie musiał pisać, od której do której. Wiem, że miałem taki telefon od Martyny: od której do której mamy szkolenia."

**Standard godzinowy per instytucja:** powtarzalny wzorzec godzin i dni (przykład: 9:30-20:00, środa/czwartek/piątek). Instytucja zgłasza zmianę standardu.

**Sekcja korespondencji mailowej** na panelu instytucji [D-52].

---

## 7. Konfigurator instytucji szkoleniowej

**Widoczny wyłącznie dla administratora** [D-07].

Zawartość:
- Warunki prowizyjne (patrz [07. Silnik prowizji](07-silnik-prowizji.md))
- **Wzór certyfikatu** z placeholderami [D-98]
- Dane firmy, prowizja, programy, ceny, przypisani klienci

---

## 8. Administracja

Moduł finansowy dla administratora, odróżniony od dashboardu.

Zawartość:
- **Prowizje szczegółowe** jako podstawa do fakturowania
- **Ręczne nadpisanie prowizji per wniosek** (jedyne miejsce) [D-93]
- **Lista faktur** z filtrami, przypisana do instytucji szkoleniowej [D-38]
- **Import faktur z CSV** z systemu księgowego [D-39]
- **Podgląd PDF faktury** bez wchodzenia do systemu księgowego

### Moduł faktur, szczegóły

Kolumna "numer faktury" znika z arkusza operacyjnego. Powstaje osobna lista faktur.

Wolumen: 5-40 faktur miesięcznie, ok. 300 rocznie.

**Import CSV zamiast integracji API** [D-39]. Argumenty wykonawcy:
- import CSV: ok. 1 godzina pracy
- integracja API: 10-15 godzin plus konieczność przechowywania klucza API do systemu księgowego

> **Paweł (1:04:38):** "tam będzie trzeba przechowywać na pewno klucz API do twojego systemu fakturowego. Więc to już jest kolejna rzecz, o którą trzeba zadbać, jeżeli chodzi o bezpieczeństwo."

**Główny przypadek użycia podglądu PDF:** sprawdzenie terminu płatności bez logowania do systemu księgowego.

> **BLOKER [P-09]:** nie potwierdzono, czy system księgowy klienta w ogóle udostępnia eksport CSV. Klient miał to sprawdzić u księgowej. Nazwa systemu: **eSzokBR** (podana w dokumencie klienta "spis funkcji"). Systemy wspomniane referencyjnie: Fakturownia (poprzedni system klienta), inFakt (system wykonawcy).

---

## 9. Wysyłka maili

Zakładka na karcie klienta lub wniosku, z biblioteką szablonów do wyboru.

**Wymagane potwierdzenie przed wysyłką**, żeby uniknąć przypadkowego kliknięcia.

> **Bartek (3:03:07):** "chciałbym, żebyśmy to zatwierdzili, tak jak masz napisane, w celu uniknięcia przypadkowego kliknięcia."

Znane szablony:
- Instrukcja zakładania konta na praca.gov.pl
- Instrukcja składania pisma
- Dane do faktury (do IS)
- Wniosek w trakcie przygotowania
- Prośba o opinię w Google

Kontekst biznesowy: firma przeszła z prowadzenia klienta telefonicznie "za rękę" na instrukcje mailowe, co oszczędziło znaczną ilość czasu.

**Pełna lista szablonów do dosłania przez klienta po postawieniu szkieletu** [D-119].

Szczegóły w [08. Powiadomienia i automatyzacje](08-powiadomienia-i-automatyzacje.md).

---

## 10. Zgłoszenia

Wewnętrzna baza incydentów. **Dostępna wyłącznie dla administratora i pracowników LDIT** [D-107]. Nie jest podzakładką instytucji.

Wpis ręczny: nazwa instytucji lub klienta + opis zdarzenia + data.

Cel: historia incydentów jako podstawa do zerwania współpracy lub kroków prawnych.

> **Bartek (3:03:28):** "kiedyś nas jedna instytucja chciała w kulki zrobić (...) próbowali nas kręcić w coś, żebyśmy zapłacili mniejszą prowizję, stąd muszę mieć wgląd do tego i historię, że na przykład ta firma już 2 razy coś takiego zrobiła. Nie współpracujemy z nią, do widzenia."

**Rozróżnienie od notatek przy kliencie:** tu trafiają wyłącznie sytuacje krytyczne (oszustwo, próba zaniżenia prowizji). Uzasadnienie: przy ponad 1000 klientów krytyczne incydenty giną w zwykłych notatkach.

---

## 11. Konta i uprawnienia

Opisane w [02. Aktorzy i uprawnienia](02-aktorzy-i-uprawnienia.md).

Konfigurator ról z checkboxami per zakładka, przypisanie użytkowników do instytucji, zarządzanie kontami i instytucjami.

---

## 12. Rejestr aktywności

Dwa niezależne rejestry [D-55]:

| Rejestr | Zawartość |
|---|---|
| **Rejestr zmian** | Kto, kiedy, jaka wartość przed i po. Szczególny nacisk na wartości wpisywane ręcznie i zmiany kwot |
| **Log logowań** | Kto i o której godzinie zalogował się do systemu |

Szczegóły w [10. Bezpieczeństwo i RODO](10-bezpieczenstwo-i-rodo.md).

---

## 13. Terminy i kalendarz szkoleń

**Specyfikacja niepełna.** Warsztat wykluczył integrację z kalendarzem Outlook i moduł zadań, ale **nie potwierdził wprost, czy zostaje jakikolwiek kalendarz terminów szkoleń wewnątrz systemu** [P-10].

Z dokumentacji przedwarsztatowej i wcześniejszej części warsztatu wynika, że powinien zostać:
- Instytucja wystawia wolne terminy, każdy z pozycją z katalogu
- Do terminów przypisuje się uczestników
- Widok w dwóch formach: tabela oraz kalendarz
- Główny widok IS: zestawienie terminów z listą osób zapisanych na każdy
- Efekt operacyjny: przy pierwszej rozmowie z klientem widać wolne terminy

Musi obsłużyć **oba modele operacyjne** (A: LDIT ustala z kalendarza IS, B: IS ustala telefonicznie i powiadamia), opisane w [01. Kontekst](01-kontekst-i-cel.md).

Po ustaleniu lub zmianie terminu trzeba złożyć **pismo do PUP o zmianie terminu**. To krok procesu, który powinien być widoczny w systemie.

---

## 14. Statystyki

### Dla LDIT
- Lejek dostarczonych osób per instytucja: ile leadów, ile zarejestrowanych w BUR, ile złożonych wniosków, ile domkniętych szkoleń
- Ile dofinansowań przyznano, na jakie kwoty
- Ile szkoleń faktycznie się odbyło
- Marżowość w podziale na instytucje (**wyłącznie admin**)
- Skuteczność zespołu, ile zadań wykonał który pracownik
- Eksport statystyk do Excela

### Dla instytucji szkoleniowej: SPÓR NIEROZSTRZYGNIĘTY [P-12]

**Klient odroczył decyzję wprost.**

> **Bartek (2:54:45):** "Dobra, ja będę musiał się nad tym zastanowić, czy chcę takie szczegóły. Z mojego punktu rozumowania to ja chcę wam, instytucjom szkoleniowym, przekazywać dosyć proste informacje, a wszystkie dane statystyczne i z handlowcami zostawiam po waszej stronie (...) ja miałem założenie, że ten system służy tylko tak naprawdę nam."

**Kontrapropozycja wykonawcy (występującego jako instytucja szkoleniowa):**

> **Paweł (2:53:56):** "chcę mieć sortowanie po dacie wpłynięcia i zrobić sobie statystyki, że w tym tygodniu handlowiec ogarnął 10, a w następnym 20. Albo jeden handlowiec ogarnął tyle, drugi tyle."
> **Paweł (2:54:25):** "Ale muszę mieć coś, żeby go rozliczyć. Przynajmniej te daty są mi potrzebne."

**Kierunek rozwiązania:** wersja premium dla IS jako osobny moduł lub subskrypcja, poza etapem I [D-96].

> **Bartek (2:55:45):** "jak będą chciały instytucje szkoleniowe jakieś dopicowane, szczegółowe informacje, to zrobimy wersję premium dostępu. Ale to docelowo w przyszłości. Na ten moment postawmy go po prostu na nogi."

---

## 15-16. Wykluczone z zakresu

**Zadania pracowników** i **integracja kalendarza Outlook** zostały wykluczone z systemu na koniec warsztatu [D-118].

> **Paweł (3:16:10):** "system, jeżeli tutaj mówisz głównie o zadaniach, to chyba bym to z tego systemu wykluczał."
> **Bartek (3:16:19):** "Tak, to możesz to wywalić jak coś."

Zadania przechodzą do **Projectly**, drugiej aplikacji wykonawcy.

> **Uwaga:** wcześniej w warsztacie (2:43:48) ustalono zakładkę Zadania z panelem admina i widokiem pracownika. Decyzja z 3:16 unieważnia tamto ustalenie. Nie ustalono formy dostępu do Projectly z poziomu systemu.

---

## 17. Panel klienta końcowego

**OTWARTE.** Opisany w [02. Aktorzy i uprawnienia](02-aktorzy-i-uprawnienia.md#rola-klient-końcowy-panel-uczestnika).

Kluczowy warunek wdrożenia z dokumentacji przedwarsztatowej: panel otwiera system na użytkowników spoza obu organizacji. Zakres widoczności musi być zawężony do minimum, a separacja przetestowana przed udostępnieniem.
