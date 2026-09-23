# 14. Pytania otwarte

Uporządkowane wg pilności. **Blokady** to pytania, bez których odpowiedni moduł nie może zostać zaprojektowany.

---

## BLOKADY (wymagają odpowiedzi przed projektowaniem)

### P-01. Konflikt reguły okresu rozliczeniowego prowizji
**Blokuje:** silnik prowizji, czyli najtrudniejszy element projektu.

Klient najpierw ustalił jednoznacznie: okresem rozliczeniowym jest **data wystawienia faktury** (22:21). Pięć minut później pokazał, że w praktyce prognozuje próg z kalendarza szkoleń (25:55), i sam wskazał problem: "ma szkolenie w październiku, a wystawiliśmy to w sierpniu" (26:10).

**Propozycja rozstrzygnięcia** (opisana w [07. Silnik prowizji](07-silnik-prowizji.md)): rozdzielić prowizję rzeczywistą (data faktury) od przewidywanej (data planowana). Oba widoki liczone tym samym silnikiem.

**Odpowiada:** klient. **Pilność:** przed prototypem konfiguratora.

### P-02. Progi i stawki prowizji wewnętrznej dla pracowników
**Blokuje:** cały moduł prowizji pracowniczych.

> **Bartek (57:13):** "No i właśnie to jest problem, bo na tym się jeszcze nie zastanawiałem nawet."
> **Bartek (57:38):** "Właściwie mogę to wymyśleć teraz, w najbliższych dniach."

Klient zadeklarował dostarczenie "w najbliższych dniach". **Nie dostarczono w ramach warsztatu.**

**Odpowiada:** klient. **Pilność:** wysoka.

### P-09. Czy system księgowy udostępnia eksport CSV
**Blokuje:** cały moduł faktur.

Klient miał zadzwonić do księgowej w przerwie warsztatu. Odpowiedź nie padła w transkrypcji.

System księgowy klienta to **eSzokBR** (nazwa z dokumentu klienta, w transkrypcji zniekształcona do "e shock" i "br shock").

Jeśli eksport nie istnieje, decyzja "import zamiast integracji API" upada i trzeba wrócić do wyceny integracji (10-15 h).

**Odpowiada:** klient. **Pilność:** wysoka.

### P-25. Architektura danych: osobne bazy czy jedna z separacją wierszy
**Blokuje:** projekt bazy danych, czyli fundament całego systemu.

Wykonawca dwukrotnie sygnalizował "osobne bazy pod spodem" (2:20:19, 3:12:16). To stoi w sprzeczności z sześcioma wymaganiami klienta (zbiorcze zestawienie, ciągła numeracja klientów, dashboard, zestawienia roczne, wyszukiwarka globalna, ten sam klient u różnych IS).

**Rekomendacja** w [09. Integracje i architektura](09-integracje-i-architektura.md): jedna baza z egzekwowaną separacją na poziomie wierszy.

**Odpowiada:** wykonawca (decyzja techniczna). **Pilność:** przed implementacją.

> **Aktualizacja 2026-09-04.** Na warsztacie doprecyzowującym wykonawca skłonił się ku **osobnym mini-bazom per instytucja pod spodem** [D-143], argumentując bezpieczeństwem (żeby IS nie odsłoniła cudzych danych przez narzędzia deweloperskie). Napięcie z wymaganiami zbiorczych widoków pozostaje. Nowy wątek: [P-56]. Blokada nadal otwarta.

---

## Model finansowy i prowizje

### P-03. Czy wniosek z nadpisaną stawką wlicza się do progów - ZAMKNIĘTE (2026-09-04)
Nie ustalono, czy wartość wniosku rozliczanego indywidualnie (np. 15% zamiast 20%) wlicza się do sumy narastającej wypełniającej progi pozostałych wniosków tej instytucji.

Ma bezpośredni wpływ na testy jednostkowe silnika prowizji.

**Rozstrzygnięte 2026-09-04:** tak, wlicza się do puli progowej (miesięcznej lub rocznej) [D-137]. Bartek (35:40): "raczej to będzie doliczone po prostu do całości".

### P-04. Faktury niechronologiczne i korekty
Ustalono, że kolejność wystawiania faktur ma znaczenie dla wypełniania progów (33:45), ale nie ustalono reguły dla faktur wystawianych poza kolejnością ani dla korekt faktur.

### P-05. Prowizja od dopłaty dodatkowej
Klient chce prowizji od dopłaty **tylko gdy figuruje ona na wspólnej fakturze KFS**. Sprzedaż komercyjna instytucji nie generuje prowizji.

Wątek urwany, obie strony zmęczone. Pytanie wykonawcy bez odpowiedzi:
> **Paweł (2:33:12):** "Skąd bierzesz tę wartość 10000 jako dopłata?"

### P-06. Kto może nadpisać prowizję per wniosek, ZAMKNIĘTE (2026-09-04)
Wykonawca zapytał: "Tylko ty możesz to zmienić czy pracownik twój też? I z poziomu admina, czy z poziomu wniosków?" Na warsztacie klient odpowiedział tylko "Administracja".

**Rozstrzygnięte w rundzie feedbacku po makiecie v2:** nadpisanie robi **wyłącznie administrator**, bezpośrednio na **karcie wniosku** (Dofinansowania → instytucja → wniosek), a nie tylko w module Administracja. Szczegóły i cytat w [07. Silnik prowizji](07-silnik-prowizji.md#miejsce-nadpisania-karta-wniosku-oraz-moduł-administracja-d-93-zaktualizowane-2026-09-04), decyzja [D-93] w [rejestrze](13-rejestr-decyzji.md).

### P-07. Wymiar prezentacji prowizji
Per uczestnik, per firma czy per wniosek. Pytanie wykonawcy (2:51:05) bez precyzyjnej odpowiedzi. Kontekst wskazuje na **per wniosek**, bo prowizja jest podstawą fakturowania.

### P-13. Nazwa pola "koszt całkowity"
Klient zakwestionował nazwę (2:06:02), proponował "dofinansowanie ze wkładem własnym". Nie ustalono.

**Rekomendacja:** "Koszt uznany przez urząd".

### P-14. Od jakiej podstawy liczy się wkład własny
W przykładzie z warsztatu "dopłata standard" została policzona od 200 000 (wartość wnioskowana), a "przyznano" od 180 000 (koszt uznany). Nie ustalono, która podstawa jest właściwa.

### P-30. Czy "Przyznano" ma być całkowicie nieedytowalne - ZAMKNIĘTE (2026-09-04)
Dokument klienta sprzed warsztatu zakładał ręczne nadpisanie z wyłączeniem reguły. Wykonawca na warsztacie zadeklarował "przyznano nie edytuję" (2:00:52), klient nie zaprotestował, ale też nie potwierdził wprost.

Sprzeczne z zasadą ogólną z D-19 (każda wyliczana wartość edytowalna, reguła kasowana i przywracalna).

**Rozstrzygnięte 2026-09-04:** "Przyznano" ma być **edytowalne** ręcznie (odblokowanie komórki) z akcją "Przywróć regułę" [D-135]. Odwraca D-58. Bartek (17:01): "jeszcze przyznano musi być do edycji. Ja o tym cały czas mówię."

### P-31. Ile jest wariantów modeli prowizyjnych łącznie
Wykonawca pytał wprost dwukrotnie (33:45, 38:48). Klient podał cztery modele plus negocjacje indywidualne, ale sam przyznał: "tych przypadków jest przeróżnie" (35:32).

**Brak potwierdzenia, że zestaw jest kompletny.**

### P-32. Trzeci próg skali rocznej
Klient wspomniał, że powyżej miliona jest kolejny próg (31:23), ale nie podał stawki. W przykładach użyto roboczo 10%. Arkusz `Prowizja liczenie.xlsx` zawiera dwa różne warianty. **Wymaga potwierdzenia z umowy.**

### P-51. Reguły zaokrąglania kwot
Nie ustalone na warsztacie. Wskaźniki 0,9 i 0,7 dają wartości niecałkowite, a system ma pilnować równania `przyznano + wkład własny = koszt całkowity`. Bez ustalonych reguł równanie będzie się rozjeżdżać o grosze.

Propozycja w [06. Model finansowy KFS](06-model-finansowy-kfs.md#reguły-zaokrąglania-i-typ-danych): typ dziesiętny stałoprzecinkowy, zaokrąglanie matematyczne do 2 miejsc, wkład własny liczony jako reszta.

**Do potwierdzenia:** czy urząd stosuje własne zaokrąglenia, które mogą się różnić od systemowych.

### P-53. Konflikt: wkład własny wyliczany czy wpisywany ręcznie
Dwie decyzje TWARDE stoją w sprzeczności: **D-59** (wynika z wielkości przedsiębiorstwa, przechowywany procentowo) i **D-80** (wpisywany ręcznie).

Propozycja pogodzenia w [06. Model finansowy KFS](06-model-finansowy-kfs.md): procent wyliczany jako domyślny, kwota nadpisywalna ręcznie zgodnie z zasadą [D-19].

### P-15. Metryka celów i premii
Klient chce widoku celów i historii ich realizacji, ale nie zdefiniował ani jednostki celu (kwota wniosków? liczba wniosków? przychód?), ani okresu rozliczeniowego.

---

## Zakres i uprawnienia

### P-12. Jakie dane statystyczne widzi instytucja szkoleniowa
**Klient odroczył decyzję wprost.**

> **Bartek (2:54:45):** "Dobra, ja będę musiał się nad tym zastanowić, czy chcę takie szczegóły."

Sporne konkretnie: liczba i daty wpłynięcia formularzy, rozbicie per handlowiec. Wykonawca (jako instytucja szkoleniowa) potrzebuje tego do rozliczania własnego handlowca.

To jest **konflikt interesów klienta i wykonawcy**, opisany w [15. Ryzyka](15-ryzyka.md).

### P-33. Czy panel klienta końcowego wchodzi do etapu I
Klient wątpi w użyteczność, wykonawca deklaruje potrzebę i współfinansowanie. Nic nie zostało zapisane jako decyzja.

### P-34. Czy instytucja zobaczy widok "Niezłożone" z nadchodzącymi naborami
Wykonawca stwierdził, że "instytucja szkoleniowa też powinna to widzieć" (2:49:01). Klient nie potwierdził i przekierował rozmowę.

### P-35. Czy pracownik LDIT ma dostęp do danych finansowych
> **Bartek (58:02):** "na razie tylko zostaje [dla] admina, no ale docelowo..."

Zdanie urwane.

### P-10. Czy zostaje kalendarz terminów szkoleń w systemie - ZAMKNIĘTE (2026-09-04)
Wykluczono zadania i integrację Outlook, ale **nie potwierdzono wprost**, czy zostaje jakikolwiek kalendarz terminów wewnątrz systemu. Z wcześniejszej części warsztatu i dokumentacji przedwarsztatowej wynika, że powinien.

**Rozstrzygnięte 2026-09-04:** tak, **kalendarz per instytucja w systemie** [D-142]. IS wystawia terminy, przypisuje do wniosku, LDIT ma wgląd we wszystkie. Uwaga: sam moduł zadań, wykluczony w D-118, **również wraca** [D-140].

### P-08. Zbiorcze zestawienie: dashboard czy widok operacyjny
Klient powiedział, że zbiorczy widok wszystkich instytucji ma być tylko na dashboardzie ("po co wyświetlać 2 razy"), ale wcześniej opisywał go jako widok operacyjny do masowej zmiany statusów po filtrze PUP. Dashboard ma być "tylko statystyki, żadnej rozpiski klientów".

**Te dwa wymagania się wykluczają.**

### P-36. Czy MCP wchodzi w zakres
Dokumentacja przedwarsztatowa przewidywała serwery MCP zamiast publicznego API, z uprawnieniami dziedziczonymi po użytkowniku. **Warsztat w ogóle tego nie poruszył.**

### P-37. Czy zakładka Zadania jest natywna czy to okno na Projectly
**Zdezaktualizowane po 2026-09-04.** Moduł zadań wrócił do systemu jako natywny [D-140], więc pytanie o formę dostępu do Projectly przestaje mieć znaczenie. Zostaje wątek: czy zadania i powiadomienia to jeden moduł czy dwa [P-55].

---

## Integracje i dane

### P-20. Dokładny zakres integrowanych skrzynek pocztowych
Wypowiedź klienta jest niepełna: "zrobimy klientów wszystkie skrzynki, a [instytucji] szkoleniowych tylko [wybrane]" (1:35:32).

Trzeba potwierdzić: czy skrzynka właściciela jest wyłączona całkowicie czy częściowo, i z których skrzynek zaciągana jest korespondencja z instytucjami.

**Wpływa na konfigurację uprawnień aplikacji Microsoft 365.**

### P-21. Mechanizm powiązania maila z klientem
Przyjęto obejście procesowe (nazwa klienta w temacie). Nie ustalono rozwiązania systemowego.

**Rekomendacja:** dopasowanie po adresie e-mail jako mechanizm podstawowy, konwencja tematu jako uzupełnienie.

### P-22. Czy załączniki z maili są wiązane automatycznie
Klient mówi o ręcznym przeciąganiu (1:28:06). Brak decyzji o automatyzacji.

### P-23. Skąd pochodzi lista szkoleń w formularzu
Z katalogu w systemie czy konfigurowana przez instytucję.
> **Paweł (2:28:22):** "albo zrobimy im listę, albo się to będzie pobierało od nas z systemu, już mniejsza."

### P-24. Technologia formularza zgłoszeniowego
Google Forms z arkuszem czy formularz natywny. Wykonawca sam się wycofał z Google Sheets, nie doprecyzował alternatywy.

**Rekomendacja** w [09. Integracje](09-integracje-i-architektura.md): formularz natywny, ze względu na RODO (PESEL), utrzymanie 20 kopii i integrację z katalogiem szkoleń.

### P-38. Częstotliwość synchronizacji formularza
"Co godzinę" zostało podane jako przykład ("nie wiem, co godzinę"), nie jako ustalenie. Przy formularzu natywnym pytanie znika.

### P-39. Kto wypełnia formularz: klient końcowy czy handlowiec
Wybrano wstępnie wariant klienta końcowego, ale wariant alternatywny nie został formalnie odrzucony. Klient dopuszczał: "w sumie chyba nawet może handlowiec wpisywać dane klienta" (2:15:32).

---

## Certyfikaty i dokumenty

### P-18. Czy faktura w paczce ZIP jest generowana przez system
Klient powiedział "pewnie z fakturą" bez doprecyzowania źródła.

### P-19. Kto wgrywa wzór certyfikatu i w jakim formacie
Admin czy sama instytucja. Format: Word, PDF, HTML. Nie ustalono.

### P-40. Reguła numeracji certyfikatów
> **Bartek (2:56:46):** "ewentualny numer certyfikatu, jeżeli będzie wymagany."

Brak reguły.

### P-16. Szablony mailowe dla IS: eksport pliku czy link mailto
Wykonawca użył obu sformułowań. Mechanizm niedoprecyzowany.

---

## Bezpieczeństwo i RODO

### P-26. Retencja danych osobowych
Pytanie z dokumentacji przedwarsztatowej pozostało bez odpowiedzi. Nie ustalono:
- jak długo przechowywana jest zaimportowana korespondencja
- co dzieje się z danymi uczestników po rozliczeniu szkolenia
- czy starsze roczniki są archiwizowane z ograniczeniem dostępu

**Musi zostać domknięte przed wdrożeniem produkcyjnym**, bo wpływa na model danych.

### P-27. Zewnętrzny audyt bezpieczeństwa
Dokumentacja przedwarsztatowa: "rozważane jest zlecenie zewnętrznego audytu firmie, która przejmuje część odpowiedzialności. Temat do domknięcia przed startem prac."

**Warsztat nie wrócił do tego tematu.**

### P-41. Czy ten sam uczestnik może być obsługiwany przez dwie instytucje - ZAMKNIĘTE (2026-09-04)
Pytanie z dokumentacji przedwarsztatowej, nierozstrzygnięte. Ma wpływ na model danych i separację.

**Rozstrzygnięte 2026-09-04:** tak, jeden klient może być przypisany do **wielu instytucji** (znaczniki), każda widzi go tylko w swoim kontekście [D-144]. Realny przypadek: ten sam klient u Metal Maniak i Dron Fortech.

### P-54. Zakres zdarzeń w logu akcji (kliknięć)
Klient określił, że logi mają obejmować "wszystkie akcje", w tym kliknięcia [D-122]. Do doprecyzowania **lista zdarzeń**, które faktycznie trafiają do logu akcji. Logowanie dosłownie każdego kliknięcia generuje ogromny wolumen i szum, więc rekomendacja wykonawcy to lista istotnych akcji (otwarcie karty, eksport, wejście w moduł finansowy, uruchomienie wysyłki), a nie każde zdarzenie interfejsu. Ma wpływ na wolumen danych i retencję [P-26].

---

## Nowe pytania po warsztacie doprecyzowującym (2026-09-04)

Kontekst i decyzje w [17. Warsztat doprecyzowujący](17-warsztat-2026-09-04.md).

### P-55. Zadania kontra powiadomienia: jeden moduł czy dwa
Moduł zadań wraca do systemu [D-140]. Klient rozróżnia zadania (plan dnia, do zrobienia) od powiadomień/alertów (przypomnienia na datę). Nie ustalono, czy to jeden moduł, czy dwa.

### P-56. Osobne bazy per instytucja kontra zbiorcze widoki
Wykonawca skłania się ku osobnym mini-bazom per instytucja [D-143], co stoi w napięciu z wymaganiami zbiorczego dashboardu, ciągłej numeracji klientów i zestawienia wszystkich instytucji. Powiązane z blokadą [P-25]. Wymaga domknięcia architektury.

### P-57. Które zadania są automatyczne, a które ręczne
Część zadań da się wyzwalać ze statusu i daty (np. przygotowanie rozliczenia z daty ostatniego dnia szkolenia), ale klient podkreśla, że 342 urzędy mają różne zasady i "nie ma jednego standardu". Do rozpisania, które zadania wskakują automatycznie, a które zostają ręczne.

### P-58. Zakres i forma bota
Plik "Makieta + Bot" sugeruje istnienie bota, ale jego demonstracja odbyła się poza nagraniem. Zakres, cel i technologia bota do udokumentowania na podstawie odrębnego materiału.

---

## Proces i nazewnictwo

### P-11. Docelowa nazwa statusu "NW"
Klient wprost: "to nazwa do zmienienia". Rozwinięcie skrótu zostało zapomniane.

### P-42. Sposób prezentacji dwóch statusów
Ustalono, że dziś są dwa niezależne statusy. Nie ustalono, czy w systemie zostaną dwa pola, czy jeden łańcuch.

### P-43. Pełna lista kolumn widoku wniosku
Klient odesłał do swojego dokumentu Word: "ciężko mi teraz powiedzieć" (1:42:39). Nie przeszli przez listę na warsztacie.

### P-44. Priorytety na widoku klienta
Wykonawca zapytał "w jakiej kolejności, co jest dla ciebie najważniejsze na tym widoku" (1:42:25) i nie dostał odpowiedzi.

### P-45. Czy edycja planu szkolenia wymaga akceptacji czy tylko powiadomienia
Wykonawca użył obu sformułowań w jednym zdaniu (1:24:43).

### P-46. Jak modelować szkolenie komercyjne dla osoby niekwalifikowanej
Odrębna faktura poza projektem. Czy system ma to rejestrować, czy pozostaje poza jego zakresem.

### P-52. Forma alertu z praca.gov.pl
Klient opisał alert automatyczny wyzwalany mailem z portalu, ale **sam nie rozstrzygnął formy**.

> Klient: "Chciałbym, żeby alert był jako zadanie? Wykrzyknik przy Kliencie? Do przemyślenia jak zrobić to najlepiej."

Warianty: zadanie, znacznik przy kliencie, wpis w kolejce do obsłużenia. Warsztat tego wątku nie podjął. Po powrocie modułu zadań [D-140] wariant "jako zadanie" jest znów dostępny bez żadnej integracji.

### P-17. Czy SMS zostaje dla samych uczestników
Wykonawca zaproponował (9:51), klient nie odpowiedział wprost, zszedł na inny wątek. Nierozstrzygnięte także, kto ponosiłby koszt.

---

## Handlowe i formalne

### P-28. Wycena: jednostka, waluta, interpretacja
Widełki "12, 18" podano bez jednostki. Interpretacja "tysiące PLN" wynika z kontekstu.

Wypowiedź klienta "piętnastej nie przekroczyli" prawdopodobnie oznacza kwotę 15 tys., ale interpretacja jako daty nie została wykluczona.

### P-29. Brak ustaleń formalnych
Warsztat nie poruszył: formy umowy, warunków płatności (poza sugestią rat), gwarancji, utrzymania i wsparcia, SLA, własności kodu.

### P-47. Migracja danych historycznych z Excela
Nie poruszone. Rozdzielenie encji Klient od Wniosku oznacza, że dane nie przeniosą się mechanicznie.

### P-48. Kalkulacja kosztów hostingu w wariantach skali
Wykonawca odroczył na warsztacie: "zostawiamy to jako coś do przeanalizowania i później podejmiemy decyzję" (5:26).

Klient warunkuje tym zgodę na panel klienta i inne rozszerzenia.

### P-49. Czy da się realnie podzielić projekt na moduły
Klient wątpi ("wszystko razem ze sobą będzie współgrało"), wykonawca deklaruje że moduły "na pewno" będą. Sposób podziału do rozpisania w wycenie.

### P-50. Termin kolejnego spotkania
Nie ustalono daty, tylko sekwencję (po makiecie, w tym tygodniu).

---

## Nowe pytania z budowy makiety na bazie danych (2026-09-23)

Powstały przy przenoszeniu makiety na prawdziwą bazę i przy wdrażaniu uprawnień. Nie są to
pytania o wymagania biznesowe, tylko o rzeczy, których warsztat nie musiał rozstrzygać, a bez
których nie da się napisać aplikacji.

### P-59. Gdzie egzekwować separację danych w docelowej aplikacji
W makiecie separacja działa w warstwie dostępu do danych po stronie przeglądarki [D-148], bo
cała baza leży u klienta. W aplikacji to samo rozwiązanie byłoby dziurą. Do rozstrzygnięcia:
polityki na wierszach w bazie, filtr w warstwie serwera, czy jedno i drugie.

**Odpowiada:** wykonawca. **Pilność:** przed projektem bazy docelowej. **Powiązane:** [P-25], [P-56], [D-148].

### P-60. Reguły walidacji danych wejściowych
Dziś walidacje są wyłącznie tam, gdzie wymusza je schemat bazy (klucze obce, słowniki wartości).
Brakuje reguł dla: NIP z sumą kontrolną, PESEL, zakresów dat (data faktury wobec dat szkolenia),
kwot nieujemnych, dopuszczalnych przeskoków etapu procesu.

**Odpowiada:** wykonawca, z potwierdzeniem klienta przy regułach biznesowych. **Pilność:** średnia.

### P-61. Zakres specyfikacji ekranów
Osiemnaście ekranów makiety pokazuje układ i zachowanie, ale nie ma ich spisanych pole po polu.
Do rozstrzygnięcia: czy powstaje osobny dokument specyfikacji ekranów, czy makieta pozostaje
jedynym źródłem, a ekrany opisuje się dopiero przy implementacji.

**Odpowiada:** wykonawca. **Pilność:** przed startem implementacji. **Powiązane:** [18. Od makiety do aplikacji](18-od-makiety-do-aplikacji.md).

### P-62. Co się dzieje z kontem klienta końcowego
Panel klienta wymaga powiązania konta z rekordem klienta [D-154]. Nierozstrzygnięte: kto zakłada
to konto, czy powstaje automatycznie po akceptacji formularza, i co widzi klient mający wnioski
u dwóch instytucji.

**Odpowiada:** klient. **Pilność:** niska, moduł jest w etapie IV. **Powiązane:** [P-33], [D-144].

### P-63. Definicja gotowości modułu
Nie ma ustalonego kryterium, po którym moduł uznaje się za skończony. Propozycja: zgodność liczb
z Excelem klienta na uzgodnionym zestawie przypadków plus przejście testów z dokumentacji.

**Odpowiada:** obie strony. **Pilność:** przed startem etapu I.

---

## Podsumowanie

| Kategoria | Liczba pytań |
|---|---|
| **Blokady** | 4 |
| Model finansowy i prowizje | 12 |
| Zakres i uprawnienia | 7 |
| Integracje i dane | 6 |
| Certyfikaty i dokumenty | 4 |
| Bezpieczeństwo i RODO | 4 |
| Proces i nazewnictwo | 8 |
| Handlowe i formalne | 6 |
| Warsztat 2026-09-04 (nowe P-55 - P-58) | 4 |
| Budowa makiety na bazie (nowe P-59 - P-63) | 5 |
| **Razem (wszystkie kiedykolwiek)** | **63** |

**Stan po warsztacie doprecyzowującym (2026-09-04):** zamknięto 5 pytań (P-03, P-06, P-10, P-30, P-41), otwarto 4 nowe (P-55 - P-58).

**Stan po rundzie budowy makiety (2026-09-23):** otwarto 5 nowych pytań technicznych (P-59 - P-63). Żadne z nich nie jest blokadą, ale [P-59] i [P-61] stoją przed startem implementacji. Realnie **ok. 58 pytań otwartych**, w tym **4 blokady** (P-01, P-02, P-09, P-25, przy czym P-25 zyskała nowe wątki [P-56] i [P-59]).

### Kto komu co jest winien

| Kto | Co ma dostarczyć | Blokuje |
|---|---|---|
| Klient | liczby do konfiguratora prowizji [D-20] | start implementacji silnika prowizji |
| Klient | rozstrzygnięcie okresu rozliczeniowego [P-01] | silnik prowizji |
| Klient | progi prowizji wewnętrznej [P-02] | moduł prowizji pracowniczych |
| Klient | odpowiedź o eksport CSV z systemu księgowego [P-09] | moduł faktur |
| Klient | treści szablonów maili i wzór certyfikatu | moduł komunikacji, certyfikaty |
| Wykonawca | architektura danych [P-25], [P-56], [P-59] | projekt bazy docelowej |
| Wykonawca | specyfikacja ekranów [P-61] | implementacja interfejsu |
| Obie strony | definicja gotowości [P-63] | zamykanie etapów |

**Uwaga procesowa.** Wykonawca zadeklarował po warsztacie:
> **Paweł (2:57:33):** "myślę, że po dzisiejszym warsztacie to ja już nie będę musiał się do ciebie za dużo odzywać."

Przy 53 otwartych pytaniach, w tym 4 blokadach, to założenie jest zbyt optymistyczne. Patrz [15. Ryzyka](15-ryzyka.md).
