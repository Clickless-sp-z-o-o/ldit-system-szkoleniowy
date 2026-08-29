# 10. Bezpieczeństwo i RODO

## Dlaczego to jest warunek brzegowy, nie opcja

System przechowuje **dane osobowe uczestników szkoleń**, w tym numery PESEL. Klient ma umowy z dużymi podmiotami, po których stronie stoją zespoły prawne.

Dodatkowo: instytucje szkoleniowe są wobec siebie **konkurencyjne**. Wyciek danych do niewłaściwego katalogu to scenariusz krytyczny, nie tylko techniczny incydent.

Panel klienta końcowego (jeśli wejdzie) podnosi stawkę jeszcze wyżej, bo wpuszcza do systemu osoby spoza obu organizacji.

---

## Wymagania bezpieczeństwa

| # | Wymaganie | Priorytet | Źródło |
|---|---|---|---|
| 1 | Dwuskładnikowe uwierzytelnianie (2FA) | MUST | 3:14:42 |
| 2 | Reset haseł | MUST | 3:14:42 |
| 3 | Automatyczne wylogowanie po bezczynności | MUST | 3:15:16 |
| 4 | Blokada konta byłego pracownika z panelu admina | MUST | 3:15:04 |
| 5 | Rejestr zmian (kto, kiedy, wartość przed i po) | MUST | 3:13:36 |
| 6 | Log logowań (kto, kiedy) | MUST | 3:14:25 |
| 7 | Kopie zapasowe | MUST | 3:15:16 |
| 8 | Twarda separacja danych między instytucjami | MUST | 2:20:00, 3:06:43 |
| 9 | Ukrycie danych finansowych przed pracownikami | MUST | 57:52 |
| 10 | Ukrycie stawek prowizji przed instytucjami | MUST | 14:28 |
| 11 | Bramka akceptacji zgłoszeń z publicznego formularza (anty-spam) | MUST | 3:01:38 |
| 12 | Ograniczenie wyszukiwarki IS do własnych klientów | MUST | 3:06:43 |

---

## Rejestr aktywności: dwa niezależne logi [D-55]

Wykonawca doprecyzował rozdzielenie na warsztacie.

### Rejestr zmian danych

Co ma być logowane:
- kto zmienił status wniosku
- kto zmienił kwotę (przyznaną, koszt całkowity, dopłatę)
- kto usunął dokument
- kto dodał lub zmienił notatkę
- **wartość przed zmianą i po zmianie**

**Szczególny nacisk na wartości wpisywane ręcznie.**

> **Paweł (3:14:02):** "No szczególnie przy tych wartościach z ręki wpisywanych."

Uzasadnienie z dokumentu klienta: "Przy wielu pracownikach to będzie bardzo ważne."

### Log logowań

Kto i o której godzinie zalogował się do systemu.

> **Bartek (3:14:25):** "Na przykład twoje konto się zalogowało o czternastej 30. Żeby w razie, jakby był jakiś wyciek czegokolwiek, żeby było też wiadomo, z jakiego powodu mogło to wyniknąć."

Cel: materiał dowodowy przy wyjaśnianiu incydentów bezpieczeństwa.

---

## Separacja danych: trzy warstwy

Opisane szczegółowo w [02. Aktorzy i uprawnienia](02-aktorzy-i-uprawnienia.md#separacja-danych). Podsumowanie z perspektywy bezpieczeństwa:

### Warstwa 1: instytucja nie widzi cudzych klientów

Musi być egzekwowana **na poziomie danych, nie interfejsu**, i obowiązywać identycznie w:
- widokach i listach
- wyszukiwarce globalnej i lokalnej
- eksportach do Excela
- formularzach zgłoszeniowych
- ewentualnym panelu klienta końcowego

**Test akceptacyjny:** użytkownik instytucji A próbuje odczytać rekord należący do instytucji B poprzez każdy z powyższych kanałów. Każda próba musi zakończyć się odmową.

### Warstwa 2: instytucja nie widzi stawek prowizji

Ani swojej, ani cudzej. Konfigurator warunków prowizyjnych widoczny wyłącznie dla administratora.

To ryzyko **biznesowe**, nie techniczne, ale ma twarde konsekwencje dla modelu uprawnień. Ujawnienie różnic w stawkach między instytucjami może zniszczyć relacje handlowe.

### Warstwa 3: pracownik nie widzi danych finansowych firmy

Zyski firmy, marżowość, stawki prowizyjne instytucji i faktury wyłącznie dla administratora.

Stan obecny do wyeliminowania: w Excelu każdy pracownik widzi wszystko.

---

## Prywatność skrzynek pocztowych

**Skrzynka właściciela firmy wyłączona z pełnej integracji** [D-48].

> **Bartek (1:34:58):** "Nie chciałbym, żeby wszystkie to były maile, bo moje szkolenia wyglądają inaczej. Maile pracowników, czasami sprawy z nimi porozmawiam. Nie chcę, żeby każdy miał do tego wgląd."

**Ryzyko RODO:** bezrefleksyjna integracja skrzynki właściciela ujawniłaby zespołowi:
- korespondencję dotyczącą spraw pracowniczych (dane osobowe pracowników, potencjalnie dane wrażliwe)
- korespondencję niezwiązaną z procesem

**Wymaganie:** selektywność na poziomie **źródła danych**, nie tylko widoku. Nie wystarczy ukryć maili w interfejsie, nie mogą one w ogóle trafić do bazy.

**[P-20] Dokładny zakres integrowanych skrzynek wymaga potwierdzenia** przed konfiguracją aplikacji Microsoft 365.

---

## Zakres uprawnień aplikacji Microsoft 365

Aplikacja potrzebuje dwóch odrębnych uprawnień:

| Uprawnienie | Cel | Ryzyko |
|---|---|---|
| **Send Mail** | Wysyłka powiadomień z domeny klienta | Niskie, ograniczone do jednego konta |
| **Odczyt poczty** | Historia korespondencji przy kliencie | **Wysokie**, dostęp do treści maili |

**Rekomendacja:** uprawnienie odczytu powinno być ograniczone do konkretnych skrzynek (Application Access Policy w Exchange Online), a nie nadane na cały tenant. Bez tego aplikacja może odczytać każdą skrzynkę w organizacji, w tym skrzynkę właściciela, która ma być wyłączona.

### Dostęp wykonawcy do konta administracyjnego

Klient rozważał przekazanie dostępu do konta admina M365 na 2-3 dni. Ostatecznie skłonił się do **wspólnej sesji konfiguracyjnej (ok. 2 godziny)**.

**To jest właściwy wybór.** Konto administracyjne tenanta to bieżące konto biznesowe klienta, nie osobne konto techniczne. Przekazanie go wykonawcy byłoby naruszeniem zasady minimalnych uprawnień i mogłoby naruszać umowy z klientami korporacyjnymi.

---

## Odrzucenie integracji API z systemem księgowym

Jednym z argumentów za importem CSV zamiast API było bezpieczeństwo.

> **Paweł (1:04:38):** "tam będzie trzeba przechowywać na pewno klucz API do twojego systemu fakturowego. Więc to już jest kolejna rzecz, o którą trzeba zadbać, jeżeli chodzi o bezpieczeństwo."

**Ryzyko wraca**, jeśli integracja zostanie odblokowana w kolejnym etapie. Wtedy konieczne: przechowywanie klucza w sejfie sekretów, rotacja, ograniczenie zakresu uprawnień klucza.

---

## Ochrona przed nadużyciem publicznego formularza

Formularz zgłoszeniowy jest publicznie dostępny pod linkiem. Bramka ręcznej akceptacji chroni bazę przed spamem [D-105].

**Rekomendacja uzupełniająca:** obok bramki akceptacji warto rozważyć podstawowe zabezpieczenia techniczne (rate limiting per adres IP, honeypot), bo bramka chroni bazę, ale nie chroni przed zalaniem kolejki oczekujących.

---

## Dane osobowe: zakres i retencja

### Jakie dane osobowe system przechowuje

| Kategoria | Dane | Podstawa |
|---|---|---|
| Uczestnicy szkoleń | imię, nazwisko, **PESEL** | Wymóg wniosku KFS |
| Reprezentanci klientów | imię, nazwisko, telefon, e-mail | Kontakt operacyjny |
| Korespondencja | treść maili z klientami | Historia ustaleń |
| Pracownicy LDIT i IS | dane kont użytkowników | Dostęp do systemu |

PESEL to dana wymagająca szczególnej ochrony. Pojawia się w formularzu zgłoszeniowym.

### Retencja: NIEUSTALONA [P-26]

Pytanie z dokumentacji przedwarsztatowej pozostało bez odpowiedzi: **jak długo przechowujemy korespondencję zaimportowaną do kart uczestników**.

Nie ustalono również:
- co dzieje się z danymi uczestników po zakończeniu i rozliczeniu szkolenia
- czy potrzebna jest archiwizacja per rocznik z ograniczeniem dostępu
- kiedy dane podlegają usunięciu

**To musi zostać domknięte przed wdrożeniem produkcyjnym**, bo wpływa na model danych (soft delete, archiwizacja, anonimizacja).

### Archiwizacja per rocznik

Baza dzielona na roczniki, ale nie ustalono, czy starsze roczniki mają być archiwizowane z ograniczeniem dostępu, czy pozostają w pełni dostępne.

---

## Audyt bezpieczeństwa

Dokumentacja przedwarsztatowa wskazuje: **rozważane jest zlecenie zewnętrznego audytu bezpieczeństwa firmie, która przejmuje część odpowiedzialności. Temat do domknięcia przed startem prac.**

**Warsztat nie wrócił do tego tematu.** [P-27]

Rekomendacja: audyt jest szczególnie uzasadniony, jeśli:
- wejdzie panel klienta końcowego (osoby spoza obu organizacji)
- system będzie przechowywał PESEL uczestników
- klient ma umowy z podmiotami, których zespoły prawne mogą tego wymagać

---

## Checklist przed wdrożeniem produkcyjnym

- [ ] Separacja danych przetestowana automatycznie dla każdego kanału dostępu
- [ ] Uprawnienie odczytu poczty ograniczone do wskazanych skrzynek (Application Access Policy)
- [ ] Skrzynka właściciela potwierdzona jako wyłączona ze źródła danych
- [ ] 2FA wymuszone dla wszystkich kont, nie opcjonalne
- [ ] Polityka retencji danych osobowych ustalona i zaimplementowana
- [ ] Kopie zapasowe skonfigurowane i **odtworzenie przetestowane**
- [ ] Rejestr zmian obejmuje wszystkie pola kwotowe i statusy
- [ ] Log logowań działa i jest dostępny dla administratora
- [ ] Blokada konta byłego pracownika przetestowana (czy sesja wygasa natychmiast)
- [ ] Rate limiting na publicznym formularzu zgłoszeniowym
- [ ] Decyzja o audycie zewnętrznym podjęta
- [ ] Jeśli wchodzi panel klienta: osobny cykl testów separacji przed udostępnieniem
