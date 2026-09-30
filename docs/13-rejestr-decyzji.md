# 13. Rejestr decyzji

Wszystkie decyzje podjęte na warsztacie 25.08.2026, w kolejności chronologicznej.

**Legenda:**
- **TWARDA** jednoznaczne ustalenie, można na nim budować
- **WSTĘPNA** zgoda kierunkowa bez domknięcia szczegółów
- **ODRZUCONA** świadomie wykluczone z zakresu
- **[K]** zdecydował klient (Bartek), **[W]** zaproponował wykonawca (Paweł)

---

## Fundament: role, alerty, kolory (0:00 - 26:10)

| ID | Decyzja | Siła | Kto | Czas |
|---|---|---|---|---|
| **D-01** | Kolorowanie całego wiersza wg statusu, zmiana koloru automatyczna przy zmianie statusu. Pierwotnie 3 kolory (czerwony negatywna, zielony pozytywna, fioletowy rozliczone). **Paleta rozszerzona do 5 stanów 2026-09-04, patrz [D-123]** | TWARDA | [K] | 0:14 |
| **D-02** | Cztery role bazowe (admin, pracownik, IS, klient) plus możliwość tworzenia własnych przez admina | TWARDA | [K] | 1:27 |
| **D-03** | Panel klienta końcowego w zakresie, ale zakres i finansowanie nierozstrzygnięte | WSTĘPNA | [W] popycha | 1:36-3:21 |
| **D-04** | **SMS odrzucone w etapie I.** Wyłącznie powiadomienia mailowe | ODRZUCONA | [K] | 9:35 |
| **D-05** | Alerty ręczne i automatyczne czasowe. Klient ma 4 alerty rozpisane w dokumencie | TWARDA | [K] | 8:00 |
| **D-06** | Rozdzielenie modułu katalogu szkoleń od modułu terminów | TWARDA | [W] | 11:32 |
| **D-07** | **Konfigurator prowizji widoczny wyłącznie dla administratora.** IS nie widzi swojej ani cudzej stawki | TWARDA | [K] | 14:28 |
| **D-08** | Prowizje progowe, negocjowane per instytucja, malejące wraz ze wzrostem obrotu | TWARDA | [K] | 12:35 |
| **D-09** | Rejestr faktur LDIT wewnątrz systemu jako podstawa naliczania progów | TWARDA | [K] | 22:38 |
| **D-10** | Nazewnictwo kwot: "koszt całkowity" i "kwota przyznana", nie "wartość szkolenia" | TWARDA | [K] | 23:33 |
| **D-11** | Model premium / subskrypcja dla IS oraz szkolenia komercyjne w systemie: bez decyzji | ODROCZONA | [W] | 7:57 |
| **D-12** | Obsługa dwóch modeli operacyjnych ustalania terminu (A: LDIT z kalendarza IS, B: IS telefonicznie) | TWARDA | [K] | 10:17 |

---

## Silnik prowizji (26:14 - 51:14)

| ID | Decyzja | Siła | Kto | Czas |
|---|---|---|---|---|
| **D-13** | **Okres rozliczeniowy = data wystawienia faktury**, osobne pole per szkolenie/uczestnik, domyślnie ostatni dzień szkolenia, edytowalne | TWARDA | [W] struktura, [K] potrzeba | 26:38, 45:38 |
| **D-14** | Konfigurator warunków prowizyjnych **self-service**, klient konfiguruje sam bez zlecania wykonawcy | TWARDA | [W] | 34:56 |
| **D-15** | **Szablony parametryczne zamiast dowolnych formuł matematycznych.** Propozycja klienta odrzucona jako niestabilna | TWARDA (odrzucenie) | [W] | 41:26 |
| **D-16** | Parametry konfiguratora: rodzaj kumulacji (miesięczny/roczny), progi przychodu, sposób liczenia (od całości / od nadwyżki), stała stawka | TWARDA | [W] | 34:10, 37:47 |
| **D-17** | **Indywidualne warunki prowizyjne przypisywane PER WNIOSEK**, nie per klient | TWARDA | [K] potrzeba, [W] poziom | 39:20 |
| **D-18** | **Podstawa naliczenia prowizji: koszt całkowity szkolenia**, nie kwota przyznana | TWARDA | [K] | 39:38 |
| **D-19** | Ręczna edycja wyliczonej wartości kasuje regułę, **z możliwością jej przywrócenia**. Zasada dla całego systemu | TWARDA | [K] | 44:37-45:09 |
| **D-20** | **Prototyp konfiguratora w HTML przed kodowaniem systemu** | TWARDA | [W] | 45:09 |
| **D-21** | Prowizja zawsze wyrażana procentowo, nigdy kwotowo | TWARDA | [K] | 45:36 |
| **D-22** | Warunki instytucji **wersjonowane w czasie**, zmiany obowiązują od kolejnego roku | WSTĘPNA (po oporze klienta) | [W] przeforsował | 48:41-49:51 |
| **D-23** | Historia rozliczeń nie może być przeliczana wstecz po zmianie warunków | TWARDA | [W] | 50:08 |
| **D-24** | Zestawienia roczne, baza wniosków dzielona na roczniki (2025/2026/2027) | TWARDA co do potrzeby | [K] | 49:51 |
| **D-25** | Renegocjacja warunków w trakcie realizacji: odrzucona. Warunki znane od początku umowy | ODRZUCONA | [K] | 43:39 |
| **D-26** | **Przewidywana prowizja**: prognoza stawki z zaplanowanych szkoleń, przeliczana przy każdej zmianie wolumenu | TWARDA | [K] | 26:58 |

---

## Uprawnienia, dashboardy, faktury (51:21 - 1:22:27)

| ID | Decyzja | Siła | Kto | Czas |
|---|---|---|---|---|
| **D-27** | Powiadomienia wychodzą z **domeny klienta przez Microsoft 365**, alias typu `powiadomienia@`, licencja ok. 4 USD | TWARDA | [K] potrzeba, [W] rozwiązanie | 52:36 |
| **D-28** | Konfiguracja M365 na **wspólnej sesji na żywo (ok. 2 h)** zamiast przekazania konta admina | WSTĘPNA | [K] | 54:10 |
| **D-29** | Na czas testów maile wysyłane z konta Gmail wykonawcy | TWARDA | [W] | 54:10 |
| **D-30** | Dwa oddzielne dashboardy: administratora i pracownika | TWARDA | [K] | 54:48 |
| **D-31** | Cele dla pracowników z historią realizacji, ustawiane samodzielnie przez admina | TWARDA | [K] | 55:30 |
| **D-32** | Kaskadowy model prowizji wewnętrznej: koszt szkolenia -> prowizja LDIT -> prowizja pracownika | WSTĘPNA | [W] | 56:36 |
| **D-33** | Baza naliczania prowizji wewnętrznej: obecnie wartość wniosków, docelowo procent od przychodu. **System obsługuje oba** | WSTĘPNA | [K] | 55:56 |
| **D-34** | **Zyski, prowizje instytucji i faktury widoczne wyłącznie dla administratora** | TWARDA | [K] | 57:52 |
| **D-35** | Uprawnienia nadawane **per rola, nie per pracownik** | TWARDA | [W] | 58:19 |
| **D-36** | **Konfigurator ról z checkboxami per zakładka.** Model płaski, bez hierarchii. Dwa poziomy: podgląd i edycja | TWARDA | [K] | 58:19-59:32 |
| **D-37** | Kolumna "numer faktury" znika z arkusza, powstaje osobny moduł faktur | TWARDA | [K] | 1:00:52 |
| **D-38** | Lista faktur z filtrami, przypisana do instytucji szkoleniowej | TWARDA | [K] | 1:01:40 |
| **D-39** | **Import CSV zamiast integracji API** z systemem księgowym (1 h vs 10-15 h plus ryzyko klucza) | TWARDA (odrzucenie API) | [K] po wycenie [W] | 1:04:47 |
| **D-40** | **Podgląd PDF faktury w systemie**, nie tylko numer. Główny cel: sprawdzenie terminu płatności | TWARDA | [K] | 1:05:33 |
| **D-41** | Pliki i foldery klientów **zostają poza systemem** (Eksplorator Windows, OneDrive) | TWARDA (wyłączenie) | [K] | 1:22:27 |

---

## Korespondencja, model danych, nazewnictwo (1:23:05 - 1:49:46)

| ID | Decyzja | Siła | Kto | Czas |
|---|---|---|---|---|
| **D-42** | Instytucja sama wprowadza informacje o szkoleniach, admin też może zarządzać | TWARDA | [W] | 1:23:05 |
| **D-43** | Dodanie nowego planu szkolenia swobodne, **edycja istniejącego przechodzi przez admina lub go powiadamia** | WSTĘPNA | [W] | 1:24:43 |
| **D-44** | **Odrzucenie wewnętrznego komunikatora** na rzecz integracji maili i notatek z telefonu | ODRZUCONA | [K] pomysł, [W] przekierował | 1:25:13-1:34:05 |
| **D-45** | **Brak wspólnej skrzynki firmowej.** Każdy pracownik ma własną, imienną | TWARDA | [K] | 1:29:50 |
| **D-46** | System integruje skrzynki i pokazuje historię korespondencji w rekordach | TWARDA | [K] potrzeba | 1:30:22 |
| **D-47** | Priorytet: korespondencja z **klientami**, nie z instytucjami | TWARDA | [K] | 1:34:25 |
| **D-48** | **Skrzynka właściciela wyłączona z pełnej integracji** ze względu na prywatność | TWARDA co do zasady | [K] obawa, [W] rozwiązanie | 1:34:58 |
| **D-49** | Integracja poczty przez aplikację Microsoft, ta sama technologia co wysyłka | TWARDA | [W] | 1:35:39 |
| **D-50** | Konwencja tematu maila (nazwa klienta) jako obejście procesowe dla powiązania korespondencji | TWARDA jako obejście | [K] | 1:40:13 |
| **D-51** | Wyszukiwarka korespondencji po tytule i treści | TWARDA | [K] | 1:41:08 |
| **D-52** | Korespondencja widoczna na panelu instytucji **oraz** na karcie klienta | TWARDA | [K] | 1:41:39, 1:42:04 |
| **D-53** | **Rozdzielenie encji Klient od Wniosku.** Jeden klient, wiele wniosków. "Jeden projekt = jeden wniosek" | TWARDA | [W] propozycja, [K] nazwał | 1:44:21-1:44:57 |
| **D-54** | Dane klienta i korespondencja **wspólne dla wszystkich jego wniosków**. Główny widok roboczy pozostaje widokiem wniosków | TWARDA | [W] | 1:45:35 |
| **D-55** | **Zachowanie obecnego nazewnictwa** klienta: "Zestawienia" zamiast "Dofinansowania", drzewo lat, "Nabory" | TWARDA | [K] | 1:47:16 |
| **D-56** | Definicje kwot: Wartość = wnioskowana, Przyznano = dofinansowanie, Koszt całkowity = dofinansowanie + wkład własny | TWARDA | [K] | 1:48:38 |
| **D-57** | **Po warsztacie nie startuje implementacja.** Najpierw makieta v2 i test prowizji, potem odbiór iteracyjny modułami | TWARDA | [W] plan, [K] uszczegółowił | 1:33:00-1:33:55 |

---

## Model finansowy KFS (1:49:49 - 2:10:24)

| ID | Decyzja | Siła | Kto | Czas |
|---|---|---|---|---|
| **D-58** | **Koszt całkowity wpisywany ręcznie, "Przyznano" wyliczane automatycznie i nieedytowalne** | TWARDA | [K] | 2:00:34 |
| **D-59** | Wkład własny zależny od wielkości przedsiębiorstwa: mikro (do 9 osób) 90/10, powyżej 70/30. Przechowywany **procentowo** | TWARDA (reguła zewnętrzna) | [K] | 1:51:21 |
| **D-60** | **KFS przyznawany zawsze firmie, nie uczestnikowi.** Hierarchia: firma -> wniosek -> uczestnicy | TWARDA | [W] pytanie, [K] potwierdził | 1:53:14 |
| **D-61** | Lista uczestników na wniosku ze **statusem kwalifikacji** (zakwalifikowany / niezakwalifikowany) | TWARDA | [K] | 1:53:36, 1:56:06 |
| **D-62** | Dane kwotowe potrzebne **równocześnie** na poziomie wniosku i uczestnika | TWARDA | [K] | 1:55:55 |
| **D-63** | **Kwota dopłaty dodatkowej** jako osobne pole ręczne, domyślnie 0, nie wchodzi do podstawy wyliczenia "Przyznano" | TWARDA | [W] propozycja, [K] potwierdził | 2:01:56 |
| **D-64** | Dwie kolumny kosztu: "Koszt całkowity" (ręczny) i "Koszt całkowity z dopłatą" (wyliczany). **Prowizja od wersji z dopłatą** | TWARDA | [W] | 2:02:30 |
| **D-65** | "Kwota wnioskowana" to w rzeczywistości **całkowita wartość szkolenia** (z wkładem własnym) | TWARDA | [K] korekta | 2:03:18 |
| **D-66** | **Formularz elektroniczny zamiast parsowania przesyłanego pliku** | TWARDA kierunkowa | [K] propozycja, [W] entuzjastycznie | 2:07:37 |
| **D-67** | Dopłata dodatkowa **nie może podnosić wartości ponad ustaloną** całkowitą wartość szkolenia | ODRZUCENIE wariantu | [K] | 2:04:45 |
| **D-68** | Wielkość przedsiębiorstwa wyznaczana automatycznie z liczby zatrudnionych podanej w formularzu | WSTĘPNA | [K] | 2:07:09 |
| **D-69** | Cykliczna synchronizacja formularza (np. co godzinę) zamiast odpytywania w czasie rzeczywistym | WSTĘPNA | [W] | 2:10:16 |

---

## Formularze, role IS, kwoty per uczestnik (2:10:43 - 2:33:34)

| ID | Decyzja | Siła | Kto | Czas |
|---|---|---|---|---|
| **D-70** | **Osobny formularz zgłoszeniowy dla każdej instytucji** (ok. 20 kopii na start), osadzony u klienta, spięty z systemem | WSTĘPNA | [W] | 2:18:45 |
| **D-71** | **Zakaz mieszania danych różnych IS** w jednym pliku i jednej tabeli. Argument bezpieczeństwa | TWARDA co do zasady, WSTĘPNA co do implementacji | [W] | 2:20:00 |
| **D-72** | **Nowa rola: pracownik instytucji szkoleniowej (handlowiec)**, nadawana przez administratora IS, z przefiltrowanym dostępem | TWARDA | [W] jako użytkownik IS, [K] zaakceptował | 2:14:40 |
| **D-73** | Filtrowanie widoczności pracownika IS **po naborze** (np. tylko najnowszy) | WSTĘPNA | [W] | 2:21:23 |
| **D-74** | **Formularz wypełnia klient końcowy**, handlowiec wysyła tylko link i widzi status wypełnienia | WSTĘPNA | [W] | 2:16:20 |
| **D-75** | **Rola handlowca kończy się w momencie wypełnienia formularza.** Dalej proces przejmuje LDIT | TWARDA | [W] opisał, [K] potwierdził | 2:18:12 |
| **D-76** | Widok instytucji: **jedna zakładka opisana nazwą własnej spółki**, tylko własni klienci | TWARDA | [K] | 2:21:03 |
| **D-77** | Kwoty i statusy kwalifikacji **na poziomie pojedynczego uczestnika**. Osoba niezakwalifikowana ma kwotę zero | TWARDA | [K] | 2:22:59 |
| **D-78** | Jeden wniosek może obejmować **kilka różnych szkoleń o różnych cenach** | TWARDA | [K] | 2:23:44 |
| **D-79** | **Całkowita wartość szkolenia liczona automatycznie** sumą warunkową po uczestnikach zakwalifikowanych | TWARDA | [W] | 2:31:05 |
| **D-80** | Wkład własny i kwota dopłaty dodatkowej **wpisywane ręcznie** | TWARDA | [K] | 2:25:46 |
| **D-81** | Konwencja makiety: pola ręczne oznaczone **na żółto** | WSTĘPNA (prototyp) | [W] | 2:26:00 |
| **D-82** | **Lista szkoleń do wyboru w formularzu** zamiast wpisywania nazwy, wraz z kwotą | TWARDA co do kierunku | [W] | 2:29:20 |
| **D-83** | Rezygnacja z obiegu Excela mailem na rzecz formularza spiętego z systemem | TWARDA | [W] | 2:13:40 |
| **D-84** | **Osoba niekwalifikująca się do KFS wymaga odrębnej faktury komercyjnej**, nie wchodzi do kosztu całkowitego | TWARDA (reguła zewnętrzna) | [K] | 2:30:18 |
| **D-85** | Prowizja od dopłaty należna **tylko gdy dopłata jest na wspólnej fakturze KFS** | WSTĘPNA (wątek urwany) | [K] | 2:32:17 |

---

## Certyfikaty, prowizje w UI, dane dla IS (2:33:35 - 2:58:40)

| ID | Decyzja | Siła | Kto | Czas |
|---|---|---|---|---|
| **D-86** | Dopłaty i nietypowe kwoty **wpisywane ręcznie** w etapie I, zapisywane jako historia/status | TWARDA | [W] propozycja, [K] akceptacja | 2:36:02 |
| **D-87** | **Instytucje szkoleniowe NIE mogą wysyłać powiadomień z systemu** (ani mail, ani SMS) | TWARDA | [K] | 2:37:46 |
| **D-88** | Kompromis dla IS: **szablon mailowy otwierany w Outlooku**, wysyłka z własnej skrzynki IS | WSTĘPNA | [W] | 2:37:10 |
| **D-89** | Alerty pozostają konfigurowalne | TWARDA | [K] | 2:36:44 |
| **D-90** | Widok "Niezłożone" (baza klientów) **powiązany z modułem naborów**, w tym prognozowanych. Sortowanie po dacie zakończenia naboru rosnąco | TWARDA | [W] propozycja, [K] akceptacja | 2:48:42 |
| **D-91** | **Handlowiec IS nie dostaje informacji o zbliżającym się naborze.** Propozycja wykonawcy odrzucona | ODRZUCONA | [K] | 2:49:28 |
| **D-92** | Prowizja: **prosty wykres na dashboardzie, szczegóły w module Administracja** jako podstawa fakturowania | TWARDA | [K] | 2:51:18 |
| **D-93** | **Ręczne nadpisanie prowizji per wniosek: z karty wniosku ORAZ z modułu Administracja, wyłącznie administrator** (zaktualizowane 2026-09-04, domyka P-06) | TWARDA | [K] | 2:52:18 |
| **D-94** | **Data wpłynięcia formularza rejestrowana automatycznie**, plus data aktualizacji | TWARDA | [W] propozycja, [K] potrzeba | 2:53:07 |
| **D-95** | Zakres danych dla IS ograniczony do **prostych informacji o statusie klienta** | WSTĘPNA, klient odroczył wprost | [K] | 2:54:45 |
| **D-96** | **Wersja premium dla IS odłożona poza etap I** | WSTĘPNA | [K] | 2:55:45 |
| **D-97** | **System generuje certyfikaty PDF do pobrania, NIE wysyła ich mailem** | TWARDA | [K] | 2:56:53 |
| **D-98** | Wzór certyfikatu **per instytucja**, z placeholderami, generowanie wsadowe (50 osób = 50 PDF) | TWARDA | [K] | 2:57:48 |
| **D-99** | Miejscowość na certyfikacie: **zawsze siedziba instytucji**, nie miejsce szkolenia | TWARDA | [W] propozycja, [K] potwierdził | 2:58:25 |

---

## Domknięcie: architektura widoków, bezpieczeństwo, zakres (2:58:49 - 3:22:49)

| ID | Decyzja | Siła | Kto | Czas |
|---|---|---|---|---|
| **D-100** | Certyfikaty pobierane jako **paczka ZIP z poziomu wniosku**. Nazwa pliku `certyfikat_imie_nazwisko`. Jedna firma = jedna paczka | TWARDA | [K] | 2:59:25 |
| **D-101** | Wzór certyfikatu konfigurowany **w konfiguratorze instytucji szkoleniowej** | TWARDA | [K] | 2:58:49 |
| **D-102** | Paczka rozliczeniowa dla klienta: certyfikaty + załączniki rozliczeniowe + faktura + instrukcja złożenia | TWARDA | [K] | 2:58:57 |
| **D-103** | **Najpierw szkielet systemu, szczegóły dopracowywane na bieżąco** | TWARDA | [K] | 2:59:50 |
| **D-104** | **Przycisk "Dane do faktury"** przy wniosku, generujący maila do IS z uzupełnionymi polami | TWARDA | [K] | 3:00:28 |
| **D-105** | Formularz elektroniczny plus **bramka ręcznej akceptacji** przed wejściem rekordu do bazy (anty-spam), lista z datą wypełnienia | TWARDA | [K] | 3:01:38 |
| **D-106** | Zakładka **"Wysyłka maili"** z biblioteką szablonów przy kliencie/wniosku, **z potwierdzeniem przed wysyłką** | TWARDA | [K] | 3:03:07 |
| **D-107** | Moduł **"Zgłoszenia"** jako wewnętrzna baza incydentów, dostęp **tylko admin i pracownicy LDIT**, osobna zakładka | TWARDA | [K] | 3:04:47 |
| **D-108** | Nawigacja: **zakładki z lewej strony, wygląd zbliżony do Excela** | TWARDA | [K] | 3:04:28 |
| **D-109** | **Integracja aplikacji naborów wewnątrz systemu**, nie pod osobnym linkiem | TWARDA | [K] | 3:05:37 |
| **D-110** | **Wyszukiwarka globalna** plus wyszukiwarka na zakładce wniosków. Kryteria: NIP, nazwa klienta, PUP | TWARDA | [W] architektura, [K] potrzeba | 3:06:31 |
| **D-111** | Wyszukiwarka dla IS **ograniczona wyłącznie do własnych klientów** | TWARDA | [K] | 3:06:43 |
| **D-112** | **Kompromis architektury widoków:** zakładka "Dofinansowania" z lewej rozwija listę instytucji przypisanych do konta. Zbiorczy widok wszystkich instytucji na dashboardzie | TWARDA | [K] wymaganie, [W] modyfikacja makiety | 3:06:55-3:13:25 |
| **D-113** | **Pracownik przypisany do konkretnych instytucji** przez administratora | TWARDA | [K] | 3:10:38 |
| **D-114** | **Dashboard wyłącznie statystyczny**, bez rozpisek klientów | TWARDA | [K] | 3:09:08 |
| **D-115** | **Edycja inline w komórkach** jak w Excelu | TWARDA | [K] | 3:12:03 |
| **D-116** | **Dwa niezależne rejestry:** rejestr zmian danych (kto, kiedy, wartość przed/po) i log logowań | TWARDA | [K] potrzeba, [W] rozdzielił | 3:13:36-3:14:42 |
| **D-117** | Bezpieczeństwo: **2FA, reset haseł, blokada konta byłego pracownika, auto-wylogowanie, kopie zapasowe**, zarządzanie kontami i instytucjami przez admina | TWARDA | [W] lista, [K] potwierdził | 3:14:42-3:15:16 |
| **D-118** | **Przypisywanie zadań i integracja z Outlookiem WYKLUCZONE** z systemu, przeniesione do Projectly | ODRZUCONA | [W] propozycja, [K] akceptacja | 3:16:19 |
| **D-119** | Rozbudowa biblioteki szablonów maili przesunięta na etap po fundamencie. Klient dośle listę | WSTĘPNA | [K] | 3:22:04 |
| **D-120** | Wycena wstępna 12-18 (prawdopodobnie tys. PLN), realizacja w 2 miesiące, ostateczna wycena po makiecie z podziałem na wersję I i opcje | WSTĘPNA | [W] | 3:18:19-3:18:45 |

---

## Uzupełnienia po warsztacie (2026-09-04)

Cztery ustalenia dopisane po warsztacie, na podstawie dodatkowych notatek klienta. Trzy doprecyzowują lub rozszerzają decyzje warsztatowe, czwarta wprowadza dokumentację techniczno-biznesową jako produkt prowadzony równolegle do systemu.

| ID | Decyzja | Siła | Kto | Powiązania |
|---|---|---|---|---|
| **D-121** | Każdy pracownik loguje się na **własne konto i działa we własnym imieniu**. Na karcie Zgłoszeń autor wpisu jest **domyślnie ustawiany na zalogowanego użytkownika** i pozostaje edytowalny | TWARDA | [K] | rozszerza D-107, spójne z D-45 |
| **D-122** | **Rejestr aktywności rozszerzony do pełnego logowania akcji.** System zapisuje wszystkie działania użytkownika: kliknięcia (log akcji) oraz wysyłki powiadomień i maili (log wysyłek), z przypisaniem do konta i znacznikiem czasu. Administrator ma wgląd, kto co zrobił i kiedy | TWARDA | [K] | rozszerza D-116, D-55 |
| **D-123** | **Paleta kolorów statusów rozszerzona do pięciu stanów** (aktualizacja D-01): czekamy = biały, pozytywny = zielony (delikatny), negatywny = pomarańczowy (intensywny, alternatywnie jasny czerwony), rezygnacja = żółty, rozliczone = granatowy z delikatnym fioletem (alternatywnie granatowy z szarym). Kolor obejmuje cały wiersz i zmienia się automatycznie | TWARDA | [K] | aktualizuje D-01 |
| **D-124** | **Dokumentacja projektu prowadzona także jako klikalna strona HTML**: wiele plików tematycznych, wspólny plik index, wspólne assets. Obejmuje zależności liczenia prowizji, diagram tabel i właściwości każdej zakładki. Utrzymywana równolegle do rozwoju systemu, tak by łatwo ją było aktualizować | TWARDA | [K] | nowy produkt |

> **Uwaga.** Te uzupełnienia nie pochodzą z nagrania warsztatu z 25.08.2026, tylko z dodatkowych ustaleń przekazanych po nim. Zachowano numerację ciągłą (D-121 i dalej), żeby rejestr pozostał jednym źródłem prawdy.

---

## Warsztat doprecyzowujący (2026-09-04): D-125 - D-147

Drugi warsztat na makiecie v2 (2 h 16 min). Pełny kontekst, cytaty, proces i **osobna sekcja konfliktów** w [17. Warsztat doprecyzowujący](17-warsztat-2026-09-04.md).

| ID | Decyzja | Siła | Kto | Typ |
|---|---|---|---|---|
| **D-125** | Rola wynika z konta zalogowanego użytkownika (panel logowania). Przełącznik ról w makiecie tylko demonstracyjny | TWARDA | [W] | uszczegółowia D-02, D-36 |
| **D-126** | Administrator instytucji zarządza własnymi pracownikami (max własne uprawnienia). Admin LDIT zachowuje usuwanie, blokowanie i filtrowanie kont po instytucji | TWARDA | [K] | rozszerza D-72 |
| **D-127** | Zakładka "Dofinansowania" statyczna, obok jawna pozycja "Wszystkie instytucje". Lista instytucji rozwijana | TWARDA | [K] | aktualizuje D-112 |
| **D-128** | Widok rozdzielony na dwie tabele: **Baza danych** (klient = 1 wiersz, wnioski zagnieżdżone) i **Wnioski** (od etapu 3, klient może się powielać). Synchronizowane | TWARDA | [K] potrzeba, [W] kompromis | NOWE |
| **D-129** | Osobne zakładki roczne. Dane historyczne **nie migrowane** (2027 start pusty), tylko podsumowania liczbowe jako wsad na dashboard | TWARDA | [K] | aktualizuje D-24 |
| **D-130** | Priorytet w Bazie klientów = **ostatni dzień naboru** (sortowanie rosnąco). Flaga zainteresowania kolejnym naborem. Edycja inline dat naboru | TWARDA | [K] | rozszerza D-90 |
| **D-131** | Progi dofinansowania per wielkość (mikro/mały/średni/inny) **konfigurowalne i wersjonowane datą** | TWARDA | [K] | **koryguje D-59** |
| **D-132** | Wielkość przedsiębiorstwa **edytowalna per wniosek**, nie tylko z liczby zatrudnionych (kryterium obrotu >2 mln EUR) | TWARDA | [K] | **koryguje D-68** |
| **D-133** | Dane klienta edytowalne **per wniosek** (w tym kontaktowe). Osobna zakładka danych stałych + podsumowanie zmian statusów | TWARDA | [K] | rozszerza D-53, D-54 |
| **D-134** | **"Koszt całkowity z dopłatą" ręczny, "koszt całkowity" wyliczany** (z dopłatą minus dopłata) | TWARDA | [W] propozycja, [K] potwierdził | **odwraca D-64** |
| **D-135** | **"Przyznano" edytowalne ręcznie** (odblokowanie komórki) z akcją "Przywróć regułę" | TWARDA | [K] | **odwraca D-58, rozstrzyga P-30** |
| **D-136** | Indywidualne nadpisanie prowizji per wniosek jako **procent albo kwota** | TWARDA | [K] | **koryguje D-21** |
| **D-137** | Indywidualna stawka per wniosek **wlicza się do puli progowej** (miesięcznej/rocznej) | TWARDA | [K] | **rozstrzyga P-03** |
| **D-138** | Nadpisanie prowizji **z karty wniosku**. Administracja = podsumowanie po instytucjach + dashboard prowizji miesięczny i narastająco | TWARDA | [K] | potwierdza D-93 |
| **D-139** | Numer faktury przy wniosku, import i lista faktur w Administracji | TWARDA | [K] | uszczegółowia D-37, D-38 |
| **D-140** | **Moduł zadań i powiadomień wraca do systemu** (ręczne + automatyczne zadania per wniosek/status, alerty na datę, plan dnia, licznik akceptacji). Do przemyślenia 1 czy 2 moduły. Ostatni w kolejności | TWARDA | [K] | **odwraca D-118** |
| **D-141** | Statystyki ilościowe i kwotowe **per instytucja oraz zbiorczo** na zakładce Administracja. System nagród dla instytucji | TWARDA | [K] | rozszerza statystyki |
| **D-142** | **Kalendarz terminów per instytucja w systemie**, termin przypisany do wniosku, LDIT ma wgląd we wszystkie. Kalendarz + tabela + lista uczestników | TWARDA | [K] potrzeba, [W] rozwiązanie | **rozstrzyga P-10** |
| **D-143** | Kierunek: **osobne mini-bazy per instytucja pod spodem** dla bezpieczeństwa, framework open source z modułem uprawnień | WSTĘPNA | [W] | dotyczy P-25 |
| **D-144** | Jeden klient może być przypisany do **wielu instytucji** (znaczniki), z separacją widoku | TWARDA | [K] | **rozstrzyga P-41** |
| **D-145** | Przebieg wniosku budowany z **logów zmian statusu**. Zmiana statusu przyciskiem "przejdź do następnego etapu" + komentarz. Zadania przypięte do statusów | TWARDA | [W] propozycja, [K] akceptacja | NOWE |
| **D-146** | Etapy procesu wg pliku **`Etapy_procesu.png`** jako model referencyjny. Klient wchodzi do tabeli Wnioski od **etapu 3** | TWARDA | [K] | NOWE |
| **D-147** | Formularz preferencyjnie **Google Forms**, zaczytywany z eksportu. LDIT może dodawać klientów ręcznie i importem starej bazy | WSTĘPNA | [W] propozycja, [K] potrzeba | uszczegółowia D-66, D-70 |

---

## Decyzje wykonawcze z budowy makiety na bazie danych (2026-09-23)

Te decyzje nie padły na warsztacie. Powstały przy przenoszeniu makiety z plików JSON na
prawdziwą bazę SQLite, przy wdrażaniu panelu logowania i przy egzekwowaniu separacji danych.
Wszystkie są autorstwa wykonawcy i **wymagają potwierdzenia przez klienta wyłącznie tam,
gdzie zmieniają jego doświadczenie pracy z systemem**. Reszta jest decyzją techniczną.

Powód, dla którego w ogóle powstały: ustalenia z warsztatu opisywały, *co* system ma robić,
ale nie rozstrzygały, *gdzie* ma być egzekwowane. Przy pierwszym uruchomieniu makiety na
kontach z ograniczonymi uprawnieniami okazało się, że [D-114] i [D-34] nie działają, bo dane
finansowe docierały do przeglądarki, a były tylko ukrywane w interfejsie.

| ID | Decyzja | Siła | Kto | Dotyczy |
|---|---|---|---|---|
| **D-148** | **Separacja danych egzekwowana w warstwie dostępu do danych, nie w interfejsie.** Warstwa dostępu oddaje ekranowi wyłącznie te wiersze i te pola, które wolno zobaczyć zalogowanemu kontu. Ukrycie kolumny w widoku nie jest zabezpieczeniem, bo rekord i tak jest w pamięci przeglądarki | TWARDA | [W] | realizuje D-35, D-76, D-114, dotyczy blokady P-25 |
| **D-149** | **Uprawnienia na trzech poziomach: moduł, pole, wiersz.** Moduł mówi, czy rola widzi zakładkę. Pole mówi, czy widzi prowizję, PESEL albo zysk firmy. Wiersz mówi, czyje instytucje i czyich klientów. Każdy poziom ma własną tabelę, żadnego poziomu nie da się obejść ustawieniem innego | TWARDA | [W] | uszczegółowia D-35, D-36 |
| **D-150** | **Klient wspólny dla wielu instytucji jest prezentowany wyłącznie w kontekście instytucji zalogowanego konta.** Informacja o tym, która instytucja pozyskała klienta, nie może trafić do innej instytucji, bo sama w sobie jest przewagą konkurencyjną | TWARDA | [W] | uszczegółowia D-144 |
| **D-151** | **Schemat bazy jest źródłem prawdy o strukturze danych.** Plik `makieta/db/schema.sql` definiuje, dokumentacja opisuje. Przy rozjeździe wygrywa schemat, a dokumentacja jest poprawiana | TWARDA | [W] | NOWE |
| **D-152** | **Reguły pól wyliczanych zapisane jako widoki SQL**, w jednym miejscu, zamiast powielane w kodzie każdego ekranu. Plik `makieta/db/views.sql` | TWARDA | [W] | realizuje D-19 |
| **D-153** | **Każde pole wyliczane ma dwa warianty: wartość z reguły i wartość efektywną.** Wartość z reguły liczy się zawsze, także gdy reguła jest wyłączona ręczną edycją. Bez tego przycisk "Przywróć regułę" nie miałby do czego wracać | TWARDA | [W] | realizuje D-19, D-135 |
| **D-154** | **Konto klienta końcowego jest powiązane z konkretnym rekordem klienta.** Bez tego powiązania panel klienta nie ma jak ustalić, czyj wniosek pokazać | WSTĘPNA | [W] | dotyczy P-33 |
| **D-155** | **Progi dofinansowania i warunki prowizyjne leżą w tabelach konfiguracyjnych, nigdy w kodzie.** Wartości domyślne 90/10 i 70/30 są wierszami w tabeli z datą obowiązywania, a nie liczbami w programie | TWARDA | [W] | realizuje D-131, D-22 |
| **D-156** | **Konfigurator warunków prowizyjnych jest ekranem administratora**, mimo że wchodzi się do niego z zakładki Instytucje szkoleniowe. Rola bez prawa do prowizji dostaje komunikat o braku dostępu, a nie pusty ekran | TWARDA | [W] | uszczegółowia D-07, D-93 |
| **D-157** | **Makieta ma panel logowania zamiast przełącznika ról.** Pięć kont demonstracyjnych, jedno na rolę. Klient ogląda system tak, jak będzie go używał, a nie przez przełącznik, którego w systemie nie będzie | TWARDA | [W] | realizuje D-125 |

### Co znalazło się przy pierwszym uruchomieniu na koncie z ograniczeniami

Makieta w wersji sprzed tej rundy pokazywała wszystkim rolom to samo. Konkretne znalezione
rozbieżności między dokumentacją a stanem faktycznym:

| Co dokumentacja mówiła | Co makieta robiła | Naprawione przez |
|---|---|---|
| Pracownik LDIT nie widzi zysków firmy ani stawek prowizji [D-34], [D-114] | Widział wszystko, bo żadna strona nie sprawdzała roli | D-148, D-149 |
| Instytucja nie widzi swojej stawki prowizji [D-76] | Stawka była w pamięci strony, tylko nieużyta | D-148 |
| Handlowiec IS kończy rolę na formularzu [D-75] | Miał dostęp do kwot i numerów PESEL | D-149 |
| Pracownik widzi tylko przypisane instytucje [D-113] | Lista instytucji była zapisana w kodzie powłoki | D-149 |
| Jeden klient może być u wielu instytucji [D-144] | Każda instytucja widziała, kto jeszcze go obsługuje | D-150 |

Z osiemnastu ekranów makiety **tylko siedem w ogóle czytało informację o roli**, a żaden nie
pytał o nią warstwy danych. To jest ten sam błąd, przed którym ostrzega [R-01]: separacja
traktowana jako sprawa wyglądu, a nie dostępu.

## Feedback klienta po makiecie na bazie danych (2026-09-29): D-158 - D-160

Klient obejrzał makietę z zespołem. Ogólna ocena: czytelnie, kierunek dobry, obawa dotyczy głównie
przyzwyczajenia się do wyglądu innego niż Excel.

> **Bartek (feedback 29.09.2026):** "Moim zdaniem wygląda to czytelnie, więc w dobrym kierunku idziemy. Zmienimy jedynie kolory na identyczne jakimi operowaliśmy teraz (statusy)."

| ID | Decyzja | Siła | Kto | Dotyczy |
|---|---|---|---|---|
| **D-158** | **Kolory statusów identyczne z obecnym Excelem**, kody HEX podane przez klienta: Pozytywna `#C6E0B4`, Negatywna `#F8CBAD`, Rozliczony `#B4C6E7`, Rezygnacja `#FFE699`. Czekamy pozostaje biały | TWARDA | [K] | **koryguje D-123** |
| **D-159** | **Zakładki roczne Dofinansowań (2025, 2026, 2027 i kolejne) administrator dodaje sam**, bez wykonawcy. Lata są wierszami tabeli `lata_zestawien`, wniosek może należeć tylko do roku, który ma zakładkę | TWARDA | [K] potrzeba, [W] rozwiązanie | uszczegółowia D-129, D-55 |
| **D-160** | **Test migracji obejmuje wyłącznie dane z 2026 roku.** Zespół ma najpierw oswoić się z systemem na bieżącym roczniku. Wnioski z 2025 nie są przenoszone i zostały usunięte z bazy makiety, zakładki 2025 i 2027 są puste | TWARDA | [K] | **koryguje D-129** (tam: brak migracji danych historycznych) |

---

## Rozstrzygnięcia z panelu decyzyjnego i przeglądu modelu (2026-09-29): D-161 - D-206

Tego dnia wykonawca rozstrzygnął w panelu decyzyjnym wszystkie 38 punktów, które do tej pory
stały w [14. Pytaniach otwartych](14-pytania-otwarte.md), i przejrzał interaktywny diagram tabel.
Panel po tej rundzie jest pusty (0 punktów otwartych), a treść wariantów, skutków i kosztów
każdego wyboru zachowano w `dokumentacja/assets/decyzje.js` jako archiwum.

**Zasada oznaczania siły.** Punkty, w których w panelu odpowiadał klient, zapisano jako **WSTĘPNA**
z adnotacją "[W] wybór w panelu 29.09, do potwierdzenia przez klienta" (skrót w tabeli: **[W]\***).
Punkty, w których odpowiadał wykonawca lub obie strony, oraz ustalenia z przeglądu diagramu
tabel to **TWARDA**, [W]. Wybór wykonawcy za klienta nie zastępuje odpowiedzi klienta: to jest
propozycja gotowa do zatwierdzenia, a nie ustalenie z nim. Kolejna rozmowa z klientem powinna przejść
przez wszystkie wiersze oznaczone [W]\*.

**Korekta tego samego dnia.** Wybory P-04 i P-02 z panelu zostały skorygowane przez wykonawcę po
przemyśleniu skutków. Cytat wykonawcy: "faktura korygująca jest do nowego okresu, progi nie
przeliczają się wstecz". W panelu było odpowiednio: korekta wraca do okresu faktury pierwotnej,
a progi mogły wymagać przeliczenia wstecz. Obowiązują wersje skorygowane, czyli D-161 i D-162.

**Uwaga o blokadach.** Blokady P-01, P-02 i P-09 są rozstrzygnięte wyłącznie wyborem wykonawcy,
bez odpowiedzi klienta. Przed implementacją modułu prowizji wewnętrznej i modułu faktur klient musi
potwierdzić D-162, D-163 i D-164.

| ID | Decyzja | Siła | Kto | Dotyczy |
|---|---|---|---|---|
| **D-161** | **Faktura korygująca należy do okresu, w którym ją wystawiono**, nie do okresu faktury pierwotnej. Zdejmuje prowizję stawką, którą naliczyła faktura pierwotna, i nie zmienia obrotu nowego okresu. Zamknięty okres się nie zmienia. Koszt: prowizja za miesiąc korekty może wyjść ujemna i trzeba to pokazać w interfejsie | WSTĘPNA | [W]\* | rozstrzyga P-04, zgodne z D-23, korekta wyboru z panelu, patrz [07](07-silnik-prowizji.md) |
| **D-162** | **Prowizja wewnętrzna startuje na stałej stawce, progi dołożone później.** Nowe warunki i progi działają od swojej daty obowiązywania, nigdy wstecz. Koszt: model progowy to inna struktura danych niż stała stawka, więc prawdopodobna przeróbka | WSTĘPNA | [W]\* | rozstrzyga P-02, zgodne z D-23, D-22, korekta wyboru z panelu (było: klient dostarcza progi przed etapem II) |
| **D-163** | **Eksport CSV z systemu księgowego istnieje, robimy import.** Wymusza: ustalenie formatu kolumn, regułę dopasowania faktury do wniosku i obsługę importu wielokrotnego (co gdy ten sam plik wgrany dwa razy). Do potwierdzenia u księgowej | WSTĘPNA | [W]\* | rozstrzyga P-09, zgodne z D-37, D-139 |
| **D-164** | **Dwa widoki prowizji: rzeczywista (data faktury) i przewidywana (kalendarz szkoleń).** Rozliczenie zostaje na dacie faktury, klient dostaje prognozę z kalendarza. Wymusza: rozstrzygnięcie, w którym momencie pozycja przechodzi z prognozy do rozliczenia, i wyraźne oznaczenie widoku w interfejsie | WSTĘPNA | [W]\* | rozstrzyga P-01, godzi D-13 i D-26 |
| **D-165** | **Zakładki lat dodaje administrator albo pracownik LDIT.** Wniosek bez roku jest "nieprzypisany" (`wnioski.rok` NULL), usunięcie roku odpina wnioski (`ON DELETE SET NULL`), a nie usuwa | TWARDA | [W] | przegląd diagramu, uzupełnia D-159 |
| **D-166** | **Instytucja ma szczegółowe dane:** strona www, opis działalności, do trzech osób kontaktowych | TWARDA | [W] | przegląd diagramu, tabela `instytucje` |
| **D-167** | **Osobna tabela szkoleniowców instytucji** (1 instytucja : N szkoleniowców), każdy z imieniem, nazwiskiem, telefonem i e-mailem | TWARDA | [W] | przegląd diagramu, tabela `szkoleniowcy` |
| **D-168** | **Warunki i progi prowizyjne w jednej tabeli:** progi jako lista JSON w `warunki_prowizyjne`, tabela `progi_prowizyjne` zlikwidowana. Koszt: progi nie są osobnymi wierszami, walidacja przez `CHECK json_valid` | TWARDA | [W] | przegląd diagramu, uszczegółowia D-155 |
| **D-169** | **Dane zmienne w czasie leżą przy wniosku:** liczba zatrudnionych (przeniesiona z klienta), do 2 osób kontaktowych i 2 adresów e-mail we wniosku. Klient ma do 3 osób kontaktowych. Hierarchia: instytucja -> klienci -> wnioski, katalog szkoleń -> wnioski, nabór jest dodatkiem do wniosku | TWARDA | [W] | przegląd diagramu, uszczegółowia D-132, D-146 |
| **D-170** | **Faktury po kliencie i instytucji** (`faktury.klient_id`), szczegóły szkolenia czytane z wniosków (widok `v_faktura_szczegoly`), nie kopiowane do faktury. Faktura ma rodzaj zwykła/korygująca i `faktura_pierwotna_id` | TWARDA | [W] | przegląd diagramu, uszczegółowia D-38, D-139, D-161 |
| **D-171** | **Próg dofinansowania wybierany we wniosku** (`wnioski.prog_dofinansowania_id` -> `progi_dofinansowania`). Reguła dobiera go sama z wielkości i daty, ręczny wybór wyłącza regułę | TWARDA | [W] | przegląd diagramu, realizuje D-19, D-131, D-155 |
| **D-172** | **Wkład własny: procent wyliczany domyślnie, kwota nadpisywalna ręcznie**, z flagą reguły i "Przywróć regułę". Godzi obie sprzeczne decyzje bez odwracania żadnej | WSTĘPNA | [W]\* | rozstrzyga P-53, godzi D-59 i D-80, zgodne z D-19 |
| **D-173** | **Wkład własny liczony od kosztu uznanego przez urząd**, czyli z tej samej podstawy co przyznano. Równanie przyznano + wkład = koszt całkowity domyka się samo | WSTĘPNA | [W]\* | rozstrzyga P-14, [06](06-model-finansowy-kfs.md) |
| **D-174** | **Znacznik przy dopłacie: na fakturze KFS czy osobno.** Na fakturze KFS = dopłata wchodzi do podstawy prowizji. Kolumna `wnioski.doplata_na_fakturze_kfs` | WSTĘPNA | [W]\* | rozstrzyga P-05, uszczegółowia D-85, D-64, D-134 |
| **D-175** | **Tabela podsumowań historycznych pod dashboard** (`podsumowania_historyczne`) i widok `v_podsumowanie_roku`: lata nieprzeniesione (2025) jako same liczby | TWARDA | [W] | przegląd diagramu, realizuje D-129 i D-160 |
| **D-176** | **Stos: framework Open Mercato** (TypeScript, Next.js, PostgreSQL, MikroORM, Zod). Uwierzytelnianie, role, uprawnienia (features `modul.akcja`), organizacje i log akcji z frameworka. Uprawnienia per pole dobudowujemy, bo framework ich nie ma. Ryzyko: wersja v0.8.0, przed 1.0 | TWARDA | [W] | rozstrzyga punkt "Stos technologiczny" z panelu, konkretyzuje D-143, patrz [18](18-od-makiety-do-aplikacji.md) |
| **D-177** | **Jedna baza, separacja politykami na wierszach.** Wymusza: audyt separacji jako osobny krok przed wdrożeniem, nie jako część testów funkcjonalnych | TWARDA | [W] | rozstrzyga P-25 (blokada), zgodne z D-112, D-144, D-148 |
| **D-178** | **Mail dopasowywany do klienta po adresie e-mail** (klienta i wniosku), temat jako uzupełnienie, możliwość ręcznego przypięcia. Koszt: mail z innego adresu tej samej firmy nie zostanie dopasowany | TWARDA | [W] | rozstrzyga P-21 |
| **D-179** | **Separacja egzekwowana dwa razy:** polityki w bazie (RLS PostgreSQL) plus filtr organizacji w serwerze. Open Mercato filtruje organizacje w aplikacji, RLS trzeba dołożyć samemu | TWARDA | [W] | rozstrzyga P-59, rozwija D-148, [10](10-bezpieczenstwo-i-rodo.md) |
| **D-180** | **Powstaje specyfikacja ekranów pole po polu:** co edytowalne, co waliduje, jakie akcje, która rola co widzi. Podstawa odbioru ekranu | TWARDA | [W] | rozstrzyga P-61 |
| **D-181** | **Formularz wypełnia klient albo handlowiec instytucji**, system zapisuje kto (`formularze_oczekujace.wypelnil`) | WSTĘPNA | [W]\* | rozstrzyga P-39, zgodne z D-75 |
| **D-182** | **Moduł jest skończony, gdy przechodzą testy ORAZ wynik zgadza się z porównaniem z Excelem klienta.** Wymaga wybrania zestawu przypadków przed startem modułu | TWARDA | [W] | rozstrzyga P-63 |
| **D-183** | **Faktura w paczce ZIP dołączana z importu (PDF), nie generowana przez system.** Wymusza przechowywanie pliku PDF faktury | WSTĘPNA | [W]\* | rozstrzyga P-18, zgodne z D-40, D-102 |
| **D-184** | **Typ stałoprzecinkowy, zaokrąglenie do 2 miejsc, wkład własny liczony jako reszta.** W bazie docelowej kolumny kwotowe `NUMERIC(12,2)`, makieta (SQLite) liczy na REAL z ROUND w widokach. Do potwierdzenia: czy urząd stosuje te same zaokrąglenia | TWARDA | [W] | rozstrzyga P-51, [06](06-model-finansowy-kfs.md) |
| **D-185** | **Zadania automatyczne tylko z daty i statusu, reszta ręczna.** Wymusza spisanie listy wyzwalaczy (342 urzędy o różnych zasadach) | TWARDA | [W] | rozstrzyga P-57, zgodne z D-140, D-145 |
| **D-186** | **Jawne okresy retencji per kategoria danych.** Kolumny daty utworzenia przy klientach i uczestnikach już są. Wymusza proces czyszczenia | WSTĘPNA | [W]\* | rozstrzyga P-26, [10](10-bezpieczenstwo-i-rodo.md) |
| **D-187** | **Formularz zgłoszeniowy natywny w systemie**, nie Google Forms. Wymusza zabezpieczenie publicznego formularza przed nadużyciem (limit zgłoszeń, bramka akceptacji D-105). Odwraca preferencję klienta z D-147, wymaga rozmowy | TWARDA | [W] | rozstrzyga P-24, **koryguje D-147**, zgodne z D-105, **potwierdzona D-207** |
| **D-188** | **Lista szkoleń w formularzu pochodzi z katalogu szkoleń w systemie** | TWARDA | [W] | rozstrzyga P-23 |
| **D-189** | **Do logu akcji trafia lista istotnych zdarzeń:** otwarcie karty, eksport, wejście w moduł finansowy, wysyłka, zmiana statusu, zmiana uprawnień. Rejestr tylko do dopisywania. **Zawęża wymaganie klienta z D-122 ("każde kliknięcie"), wymaga jego zgody** | TWARDA | [W] | rozstrzyga P-54, zawęża D-122, **potwierdzona D-208** |
| **D-190** | **Progi skali rocznej konfiguruje administrator, nic nie jest zaszyte w kodzie.** Odpowiedzialność za poprawną stawkę trzeciego progu przechodzi na administratora | WSTĘPNA | [W]\* | rozstrzyga P-32, zgodne z D-155, D-168 |
| **D-191** | **Zostaje nazwa "koszt całkowity".** Ryzyko pomyłki z "kosztem całkowitym z dopłatą" | WSTĘPNA | [W]\* | rozstrzyga P-13, zgodne z D-10, D-55 |
| **D-192** | **Panel klienta końcowego w etapie IV, w minimalnym zakresie.** Wymusza osobny cykl testów separacji przed udostępnieniem | WSTĘPNA | [W]\* | rozstrzyga P-33, zgodne z D-154 |
| **D-193** | **Instytucja widzi pełne statystyki własnych klientów, w tym rozbicie per handlowiec.** Koszt: instytucja widzi swoją skuteczność, co jest argumentem w negocjacjach prowizji. Klient odroczył tę decyzję wprost (2:54:45), więc wybór wykonawcy wymaga szczególnego potwierdzenia | WSTĘPNA, **skorygowana D-209** | [W]\* | rozstrzyga P-12, konflikt interesów wykonawcy opisany w P-12, **rozbicie per handlowiec wycofane przez D-209** |
| **D-194** | **Dashboard to statystyka, zbiorcze zestawienie to osobny widok operacyjny** ("Wszystkie instytucje") | WSTĘPNA | [W]\* | rozstrzyga P-08, zgodne z D-114, D-127 |
| **D-195** | **Zadania i powiadomienia to dwa osobne moduły** | WSTĘPNA | [W]\* | rozstrzyga P-55, zgodne z D-140 |
| **D-196** | **Bez SMS, wyłącznie mail**, także dla uczestników | WSTĘPNA | [W]\* | rozstrzyga P-17, zgodne z D-04 |
| **D-197** | **Osoba niekwalifikowana rejestrowana jako uczestnik niezakwalifikowany z powodem**, faktura komercyjna poza systemem | WSTĘPNA | [W]\* | rozstrzyga P-46, zgodne z D-61, D-84 |
| **D-198** | **Jawna lista skrzynek objętych integracją M365**, ustalona przed konfiguracją aplikacji | WSTĘPNA | [W]\* | rozstrzyga P-20 |
| **D-199** | **Wzór certyfikatu wgrywa instytucja, format HTML z polami, z podglądem przed zapisaniem** | WSTĘPNA | [W]\* | rozstrzyga P-19, zgodne z D-98, D-99 |
| **D-200** | **Numeracja certyfikatów ciągła w roku, osobna dla każdej instytucji.** Wymusza licznik per instytucja i rok | WSTĘPNA | [W]\* | rozstrzyga P-40 |
| **D-201** | **Zewnętrzny audyt bezpieczeństwa po etapie I, przed wpuszczeniem instytucji** | WSTĘPNA | [W]\* | rozstrzyga P-27, uzupełnia D-177 |
| **D-202** | **Etap procesu jako łańcuch (1-10), statusy jako atrybuty.** Wymusza listę dozwolonych przejść między etapami | WSTĘPNA | [W]\* | rozstrzyga P-42, zgodne z D-145, D-146 |
| **D-203** | **Alert z praca.gov.pl jako zadanie automatyczne**, z regułą zamykania | WSTĘPNA | [W]\* | rozstrzyga P-52, zgodne z D-140 |
| **D-204** | **Zmiana planu szkolenia przez instytucję czeka na akceptację administratora** (kolejka zmian, powiadomienie). Wybrano wariant inny niż rekomendowany w panelu (powiadomienie): koszt to wąskie gardło przy dwudziestu instytucjach | WSTĘPNA | [W]\* | rozstrzyga P-45, zgodne z D-43 |
| **D-205** | **Rozwinięcie i nową nazwę statusu NW podaje klient**, do tego czasu zostaje NW | WSTĘPNA | [W]\* | rozstrzyga P-11, zgodne z D-55 |
| **D-206** | **Kolumny widoku wniosku zatwierdzone wg makiety**, klient zgłasza poprawki | WSTĘPNA | [W]\* | rozstrzyga P-43, dotyczy też P-44 |

[W]\* = wybór wykonawcy w panelu 29.09, do potwierdzenia przez klienta.

---

## Decyzje wykonawcy z 29.09.2026 (po przeglądzie makiety): D-207 - D-212

Wykonawca zapisał tego dnia: "decyzje: formularz natywny, log tylko istotne, statystyk per handlowiec nie trzeba, filtrowanie danych per handlowiec IS zrób". Wszystkie sześć to ustalenia wykonawcy [W], bez udziału klienta. D-207 i D-208 potwierdzają D-187 i D-189, które stoją w rejestrze jako TWARDA, ale dotykają wymagań klienta (D-147, D-122), więc jego zgoda na zawężenie nadal jest wymagana. D-209 wycofuje część D-193.

| ID | Decyzja | Siła | Kto | Dotyczy |
|---|---|---|---|---|
| **D-207** | **Formularz zgłoszeniowy natywny w systemie, potwierdzony.** Google Forms odpada ostatecznie po stronie wykonawcy | TWARDA | [W] | potwierdza D-187, rozstrzyga P-24, nadal koryguje D-147 |
| **D-208** | **Log akcji wyłącznie istotnych zdarzeń, potwierdzony** (lista z D-189, nie "każde kliknięcie") | TWARDA | [W] | potwierdza D-189, rozstrzyga P-54, nadal zawęża D-122 |
| **D-209** | **Instytucja NIE dostaje statystyk w rozbiciu per handlowiec.** Widzi statystyki własnych klientów bez rozbicia | TWARDA | [W] | koryguje D-193 (rozbicie usunięte), rozstrzyga P-12 |
| **D-210** | **Filtrowanie danych per handlowiec instytucji.** Konto Pracownik IS (handlowiec) widzi wyłącznie klientów i wnioski przypisane do siebie (kolumny `klient_instytucja.handlowiec_id`, `wnioski.handlowiec_id`, `formularze_oczekujace.handlowiec_id` wskazują `uzytkownicy`). Administrator instytucji (rola `is`) widzi wszystkich klientów swojej instytucji. Egzekwowane w warstwie danych (`zakres.js`), nie w interfejsie | TWARDA | [W] | realizuje D-72, D-73, D-148, patrz [02](02-aktorzy-i-uprawnienia.md) |
| **D-211** | **Standardy Open Mercato wprowadzone w makiecie:** uprawnienia jako features `modul.akcja` (tabele `funkcje` i `role_funkcje` zamiast `uprawnienia` i `uprawnienia_pol`, wzór `acl.ts` i `role_acls`, obsługa wildcard `modul.*`), walidacja danych na granicy zapisu (`assets/walidacja.js`, odpowiednik `data/validators.ts` z Zod), format błędów `{ data, error: { code, message } }`, blokada wersji przy zapisie (optimistic locking) w trybie serwera, ogólny komunikat logowania, rejestr tylko do dopisywania | TWARDA | [W] | rozszerza D-176, zastępuje mechanizm z D-149, patrz [02](02-aktorzy-i-uprawnienia.md), [10](10-bezpieczenstwo-i-rodo.md) |
| **D-212** | **Każda agregacja (liczba, wykres, kafelek, licznik) prowadzi do szczegółów (drill through).** Mapa zakładek ustalana z klientem pytaniami Z-01 i dalszymi w `docs/19-mapa-zakladek.md`, liczba zakładek ograniczona | WSTĘPNA | [W] | do potwierdzenia mapy przez klienta, patrz [11](11-ux-i-nawigacja.md) |

## Decyzje wykonawcy z 30.09.2026: D-213 - D-214

Wykonawca zapisał: "instytucja ma widzieć nabory", a potem wybrał wariant "c. pełna lista naborów".

| ID | Decyzja | Siła | Kto | Dotyczy |
|---|---|---|---|---|
| **D-213** | **Instytucja szkoleniowa widzi moduł Nabory w podglądzie.** Liczby klientów liczą się wyłącznie z jej własnych klientów (separacja w `zakres.js`). Handlowiec instytucji nadal nie widzi naborów [D-91]. Zakres listy doprecyzowuje D-214 | TWARDA | [W] | zamyka P-34, odrzuca wariant A pytania Z-18, cofa usterkę 5 z [19](19-mapa-zakladek.md) |
| **D-214** | **Instytucja widzi pełną listę naborów wszystkich urzędów** (wariant C pytania Z-18). Liczby klientów przy naborach nadal liczą się wyłącznie z jej własnych klientów, więc lista nie ujawnia klientów LDIT innych instytucji. Świadomie przyjęte ryzyko: instytucja widzi, które urzędy mają nabory (340 urzędów) | TWARDA | [W] | doprecyzowuje D-213, rozstrzyga Z-18 |

**Sprzeczność do zgłoszenia.** Polecenie wykonawcy opisuje D-187 i D-189 jako WSTĘPNE, a rejestr od 29.09 trzyma je jako TWARDA. Siłę zostawiono TWARDA i dopisano potwierdzenie. Odwrócenie wymagań klienta z D-147 i D-122 nie jest jednak potwierdzone przez klienta.

---

## Decyzje unieważnione w trakcie warsztatu

| Wcześniejsza decyzja | Czas | Unieważniona przez | Czas |
|---|---|---|---|
| Zakładka Zadania z panelem admina i widokiem pracownika | 2:43:48 | D-118 (wykluczenie zadań) | 3:16:19 |
| Moduł zadań realizowany przez Projectly z dostępem z systemu | 2:38:11 | D-118 (całkowite wykluczenie) | 3:16:19 |
| Makieta z przełącznikiem instytucji w prawym górnym rogu | makieta v1 | D-112 (lista w lewym menu) | 3:12:21 |
| Reguła "Przyznano" wyłącza się po ręcznej edycji | dok. klienta | D-58 ("przyznano nie edytuję") | 2:00:52 |

### Odwrócone na warsztacie doprecyzowującym (2026-09-04)

| Wcześniejsza decyzja | Odwrócona / skorygowana przez |
|---|---|
| D-118 (zadania wykluczone, do Projectly) | **D-140** (moduł zadań wraca do systemu) |
| D-58 (przyznano nieedytowalne) | **D-135** (przyznano edytowalne z przywracaniem reguły) |
| D-64 (koszt całkowity ręczny, z dopłatą wyliczany) | **D-134** (odwrócony kierunek: z dopłatą ręczny, koszt całkowity wyliczany) |
| D-59 (progi 90/10 i 70/30 sztywne) | **D-131** (progi konfigurowalne i wersjonowane datą) |
| D-68 (wielkość auto z liczby zatrudnionych) | **D-132** (wielkość edytowalna per wniosek, kryterium obrotu) |
| D-21 (prowizja zawsze procentowo) | **D-136** (indywidualne nadpisanie: procent albo kwota) |

---

## Statystyka decyzji

| Kategoria | Liczba |
|---|---|
| TWARDA (w tym warianty typu "TWARDA co do zasady") | 154 |
| WSTĘPNA | 51 |
| ODRZUCONA / wykluczenie | 7 |
| ODROCZONA bez decyzji | 2 |
| **Razem** | **214** |

Potrzebę zgłosił klient: **ok. 100** decyzji. Rozwiązanie zaproponował wykonawca: **ok. 57**. Liczby dotyczą D-01 - D-160. Wszystkie 46 decyzji D-161 - D-206 to rozstrzygnięcia wykonawcy: 19 TWARDYCH i 27 WSTĘPNYCH czekających na potwierdzenie klienta (po D-209 wiersz D-193 jest skorygowany, więc czeka 26). Sześć decyzji D-207 - D-212 to także ustalenia wykonawcy: 5 TWARDYCH i 1 WSTĘPNA (D-212). Razem czeka na klienta 27 pozycji.

Skąd te liczby:

| Pochodzenie | Zakres | Liczba |
|---|---|---|
| Warsztat 25.08.2026 | D-01 - D-120 | 120 |
| Uzupełnienia po pierwszym warsztacie | D-121 - D-124 | 4 |
| Warsztat doprecyzowujący 04.09.2026 | D-125 - D-147 | 23 |
| Budowa makiety na bazie danych 23.09.2026 | D-148 - D-157 | 10 |
| Feedback klienta 29.09.2026 | D-158 - D-160 | 3 |
| Panel decyzyjny i przegląd modelu 29.09.2026 | D-161 - D-206 | 46 |
| Decyzje wykonawcy po przeglądzie makiety 29.09.2026 | D-207 - D-212 | 6 |
| Decyzje wykonawcy 30.09.2026 (Nabory dla instytucji) | D-213 - D-214 | 2 |

Warsztat 04.09 przyniósł 6 odwróceń wcześniejszych ustaleń, patrz [17. Warsztat doprecyzowujący](17-warsztat-2026-09-04.md). Runda budowy makiety nie odwróciła żadnej decyzji klienta, tylko rozstrzygnęła, gdzie ustalenia mają być egzekwowane.

> **Uwaga o interpretacji.** Wysoki udział decyzji TWARDYCH nie oznacza, że projekt jest domknięty. Część z nich to twarde ustalenia w wąskim zakresie, obok których stoi 19 pytań otwartych (spoza panelu, patrz 14) i 27 wyborów wykonawcy czekających na potwierdzenie klienta (blokady P-01, P-02, P-09 rozstrzygnięte wstępnie). Decyzje z ostatniej godziny warsztatu (D-86 i dalsze) były podejmowane przy wyraźnym zmęczeniu obu stron i wymagają potwierdzenia.
