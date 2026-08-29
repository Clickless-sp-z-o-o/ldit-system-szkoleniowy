# 15. Rejestr ryzyk

Ocena: **W** wpływ, **P** prawdopodobieństwo, skala 1-5. Priorytet = W x P.

---

## Ryzyka krytyczne (priorytet 16-25)

### R-01. Silnik prowizji jest niedospecyfikowany, a stanowi rdzeń wartości systemu
**W:5 P:4 = 20**

Cztery różne modele naliczania, wersjonowanie w czasie, prognozowanie, nadpisania per wniosek, przeliczanie całego okresu przy zmianie pojedynczej pozycji. Do tego drugi poziom (prowizje pracownicze), którego progi w ogóle nie istnieją.

Sam wykonawca nazwał to najtrudniejszym elementem projektu (24:28). Pozostaje 10 pytań otwartych w tym obszarze, w tym konflikt reguły okresu rozliczeniowego [P-01].

**Mitygacja:**
- Prototyp konfiguratora HTML **przed** implementacją [D-20], zwalidowany realnymi liczbami klienta
- Rozstrzygnąć P-01 (data faktury vs data planowana) przed prototypem
- Wyegzekwować dostarczenie progów prowizji wewnętrznej [P-02]
- Zestaw 12 przypadków testowych z [07. Silnik prowizji](07-silnik-prowizji.md) jako kryterium odbioru

### R-02. Rozjazd oczekiwań cenowych i zakresowych
**W:5 P:4 = 20**

Górna granica widełek wykonawcy (18) przekracza komfort klienta (15). Jednocześnie w trakcie warsztatu zakres **urósł** o rzeczy, które prawdopodobnie nie były wycenione:
- konfigurator ról z dynamiczną macierzą uprawnień (reakcja wykonawcy: "dobrze, że to mówisz teraz")
- nowa rola pracownika IS z filtrowaniem wierszy
- osobne formularze per instytucja (20 kopii)
- moduł Zgłoszeń
- podgląd PDF faktur
- generowanie certyfikatów wsadowo z pakowaniem ZIP
- bramka akceptacji zgłoszeń

Klient zapowiada dalsze zmiany po zobaczeniu szkieletu.

> **Bartek (3:16:34):** "teraz muszę zobaczyć jak to będzie pierwszy szkielet wyglądał i dopiero dam ci z metra co dalej zmieniamy, robimy."

**Mitygacja:**
- Wycena **z podziałem na wersję I i opcje dodatkowe**, tak jak zaplanowano [D-120]
- Jawna lista tego, co zostało dodane na warsztacie względem dokumentacji przedwarsztatowej
- Ustalić tryb obsługi zmian zakresu po podpisaniu (kto decyduje, jak wpływa na cenę i termin)

### R-03. Napięcie architektoniczne: separacja danych vs widok zbiorczy
**W:5 P:4 = 20**

Wykonawca skłania się do osobnych baz per instytucja. Klient wymaga zbiorczego widoku wszystkich instytucji, ciągłej numeracji klientów w roku (numer trafia na fakturę), dashboardu przekrojowego i wyszukiwarki globalnej.

Zła decyzja tutaj oznacza **przebudowę fundamentu w trakcie projektu**.

**Mitygacja:** rozstrzygnąć [P-25] przed implementacją. Rekomendacja: jedna baza z separacją na poziomie wierszy, opisana w [09. Integracje](09-integracje-i-architektura.md).

### R-04. Ryzyko wycieku danych między konkurencyjnymi instytucjami
**W:5 P:3 = 15, ale skutek nieodwracalny**

Instytucje są wobec siebie konkurencyjne. Wyciek nie jest tylko incydentem technicznym, tylko zniszczeniem relacji handlowych klienta. Klient sam sygnalizował ryzyko przez wyszukiwarkę.

Kanałów wycieku jest wiele: widoki, wyszukiwarka globalna, eksporty, formularze, ewentualny panel klienta.

**Mitygacja:**
- Separacja egzekwowana na poziomie danych, nie interfejsu
- **Automatyczne testy separacji dla każdego kanału** jako element definicji ukończenia
- Checklist z [10. Bezpieczeństwo i RODO](10-bezpieczenstwo-i-rodo.md) przed wdrożeniem

---

## Ryzyka wysokie (priorytet 9-15)

### R-05. Termin 2 miesiące przy zapowiedzianym trybie ciągłych zmian
**W:5 P:3 = 15**

Twardy deadline biznesowy: gotowe przed styczniem, bo wtedy startują nabory i klient jest niedostępny. Wykonawca szacuje 6 tygodni pracy. Klient zapowiada ciągłe konsultacje i zmiany "z metra".

Do tego 47 pytań otwartych i 4 blokady.

**Mitygacja:**
- Zamrozić zakres wersji I po makiecie v2
- Blokady [P-01, P-02, P-09, P-25] rozstrzygnąć w pierwszym tygodniu
- Etapowanie z [12. Zakres](12-zakres-i-etapowanie.md), żeby etap I był użyteczny nawet jeśli reszta się opóźni

### R-06. Konflikt interesów: klient chce systemu "dla siebie", wykonawca jest też użytkownikiem
**W:4 P:4 = 16**

Wykonawca występuje w podwójnej roli: buduje system i jest jedną z instytucji szkoleniowych, która ma go używać. W kilku miejscach forsował wymagania z perspektywy użytkownika IS:
- panel klienta końcowego (klient wątpi, wykonawca chce i deklaruje współfinansowanie)
- statystyki per handlowiec (klient odroczył wprost)
- widok naborów dla handlowca IS (klient odrzucił)

> **Bartek (2:54:45):** "ja miałem założenie, że ten system służy tylko tak naprawdę nam."
>
> **Paweł (2:55:21):** "najwyżej zrobimy dla mnie jakiś moduł, to już zrobię, albo będziesz mi to kasował za usługi."

**Ryzyko:** dwa równoległe źródła prawdy albo późniejsza przebudowa modelu uprawnień.

**Mitygacja:** jawnie rozdzielić w wycenie zakres "dla LDIT" od ewentualnego zakresu "dla instytucji". Rozstrzygnąć [P-12] przed projektowaniem statystyk.

### R-07. Powiązanie maila z klientem opiera się na dyscyplinie ludzi
**W:4 P:4 = 16**

Przyjęte rozwiązanie to konwencja tematu maila ("pielesiak - zapytanie"). Jeden zapomniany prefiks oznacza, że mail nie trafi do rekordu.

Przy szczycie 130 wniosków w dwa tygodnie i wielu pracownikach obsługujących tego samego klienta to się nie skaluje.

**Mitygacja:** dopasowanie po adresie e-mail jako mechanizm podstawowy, konwencja tematu jako uzupełnienie. Patrz [P-21].

### R-08. Cały moduł faktur zależy od niepotwierdzonego założenia
**W:4 P:3 = 12**

Decyzja "import CSV zamiast API" opiera się na założeniu, że system księgowy klienta udostępnia eksport CSV. **Nie potwierdzono.** Nazwa systemu nie została nawet rozpoznana.

Jeśli eksportu nie ma, wracamy do wyceny integracji API (10-15 h) plus ryzyko przechowywania klucza.

**Mitygacja:** [P-09] to blokada. Potwierdzić przed wyceną końcową.

### R-09. Wymagania klienta pisane strumieniem świadomości
**W:4 P:4 = 16**

> **Bartek (1:00:41):** "ja to pisałem tak, co mi wpada do głowy."
> **Bartek (8:52):** "jest tu nieład, trochę w tym co rozpisałem, bo czasami znajdziesz gdzieś tam niżej. Już odkryłem, że się powtórzyło."

Dokument klienta jest niekompletny i niespójny. Na warsztacie nie przeszli przez całość, mimo że klient tego chciał ("Chciałbym na pewno przejść przez to wszystko, co rozpisałem").

Nie ustalono też pełnej listy kolumn widoku wniosku [P-43] ani priorytetów na widoku klienta [P-44].

**Mitygacja:** klient zadeklarował checklistę pokrycia własnego dokumentu. Wyegzekwować ją przed wyceną końcową.

### R-10. Konfigurator ról jako niedoszacowana zmiana zakresu
**W:4 P:3 = 12**

Dynamiczna macierz uprawnień (role x moduły x podgląd/edycja), plus przypisanie użytkowników do instytucji, plus filtrowanie wierszy po instytucji, etapie i naborze, plus dynamiczne renderowanie menu.

To znaczący nakład, prawdopodobnie nieujęty w pierwotnej wycenie.

**Mitygacja:** wycenić osobno jako pozycję w wycenie końcowej.

### R-11. Deklaracja "wszystko w jednym systemie" vs realne wyłączenia
**W:3 P:4 = 12**

Klient deklaruje, że system ma służyć do wszystkiego, ale jednocześnie wyłącza pliki, foldery, zadania i kalendarz. Ryzyko rozczarowania po wdrożeniu: "miało być wszystko w jednym miejscu, a dalej muszę wchodzić do trzech narzędzi".

**Mitygacja:** jawnie wypisać w umowie lub zakresie, co zostaje poza systemem i dlaczego (lista w [12. Zakres](12-zakres-i-etapowanie.md)).

### R-12. Opór zespołu przed zmianą narzędzia
**W:4 P:3 = 12**

Excel jest głęboko wyuczony. Klient szacuje adaptację na "parę dni, tygodni". W firmie nie ma podziału stanowisk ("wszyscy robią wszystko"), więc każdy musi opanować cały system.

**Mitygacja:** zachowanie nazewnictwa [D-55], układ "jak Excel" [D-108], edycja inline [D-115]. To już jest uwzględnione w projekcie. Warto dodać wdrożenie i krótką instrukcję.

---

## Ryzyka średnie (priorytet 6-8)

### R-13. Wyliczenie "Przyznano" jest kruche przy nietypowych decyzjach urzędu
**W:3 P:3 = 9**

Urząd może przyznać kwotę niewynikającą z mnożnika 0,7 ani 0,9 (przyznanie na część modułów, arbitralne obniżenie). Rozwiązanie przyjęte na warsztacie, czyli wsteczna korekta pola `koszt_calkowity`, jest obejściem.

Dodatkowo dane z urzędu przychodzą raz jako kwota przyznana, raz jako koszt całkowity z procentem.

**Mitygacja:** rozstrzygnąć [P-30] (czy "Przyznano" ma być edytowalne). Rekomendacja: pozwolić na nadpisanie z zachowaniem zasady kasowania i przywracania reguły, tak jak wszędzie indziej.

### R-14. Opór handlowców IS przed zmianą kanału zgłoszeń
**W:3 P:3 = 9**

> **Bartek (2:16:07):** "Obawiam się, że będą trochę stękać, bo handlowcy standardowo tylko przekierowują ten formularz."

Handlowcy nie są pracownikami klienta, tylko instytucji szkoleniowych. Klient ma nad nimi ograniczony wpływ.

**Mitygacja:** rozwiązanie przyjęte (handlowiec wysyła tylko link, klient końcowy wypełnia) faktycznie **zmniejsza** ich pracę. Warto to zakomunikować instytucjom przy wdrożeniu.

### R-15. Niedojrzałość demonstrowanego rozwiązania AI
**W:3 P:3 = 9**

Podczas dema agent AI zaczął spamować mailami, a zadanie do niego nie dotarło.

> **Paweł (2:45:02):** "Mój mechanizm zaczął wysyłać maila. Niedobrze. Za mocno to poszło."

Klient warunkuje uruchomienie marketingu istnieniem "bota albo nowego pracownika". Jeśli bot ma być tym rozwiązaniem, jego niedojrzałość jest ryzykiem biznesowym klienta.

**Mitygacja:** zadania i agent AI zostały wykluczone z zakresu tego systemu [D-118]. Trzymać ten podział.

### R-16. Retencja danych osobowych nieustalona
**W:4 P:2 = 8**

System będzie przechowywał PESEL uczestników i pełną korespondencję. Brak polityki retencji to ryzyko zgodności z RODO, zwłaszcza że klient ma umowy z podmiotami mającymi zespoły prawne.

**Mitygacja:** [P-26] domknąć przed wdrożeniem produkcyjnym. Wpływa na model danych.

### R-17. Prywatność skrzynki właściciela
**W:4 P:2 = 8**

Skrzynka właściciela zawiera sprawy pracownicze i prywatne. Bezrefleksyjna integracja ujawniłaby je zespołowi.

**Mitygacja:** wyłączenie na poziomie **źródła danych**, nie widoku. Application Access Policy w Exchange Online ograniczające aplikację do wskazanych skrzynek. Potwierdzić zakres [P-20].

### R-18. Precedens cenowy w urzędach
**W:3 P:3 = 9**

Jeśli jedna instytucja obniży cenę, blokuje wyższe stawki dla wszystkich kolejnych wniosków w tym urzędzie. Skala: 1 000 zł x 100 wniosków = 100 000 zł.

System nie ma mechanizmu ostrzegania o historycznych cenach zaakceptowanych przez dany urząd.

**Mitygacja:** potencjalne rozszerzenie w kolejnym etapie. Nie zgłoszone jako wymaganie, ale wynika wprost z reguły biznesowej. Warto zaproponować klientowi.

### R-19. Ocena UI na podstawie krótkiego dema
**W:3 P:3 = 9**

Klient chwalił czytelność pokazanego CRM, zaznaczając że widzi go pierwszy raz. Akceptacja może nie przetrwać kontaktu z realnym wolumenem (1000+ klientów, 400 maili przy jednym rekordzie).

**Mitygacja:** makieta v2 z **realistyczną ilością danych**, nie z pięcioma rekordami przykładowymi.

### R-20. Decyzje z końcówki warsztatu podjęte przy zmęczeniu
**W:3 P:3 = 9**

> **Bartek (2:32:41):** "żeby nie było, że się pogubiłem, bo ciężko mi się już myśli."
> **Bartek (2:46:21):** "byłam góra w 10 minut, bo się pali trochę."
> **Paweł (3:21:59):** "Jestem padnięty."

Ostatnia godzina warsztatu objęła: prowizje w UI, dane dla IS, certyfikaty, architekturę widoków, bezpieczeństwo, wycenę. Część ustaleń jest powierzchowna.

**Mitygacja:** potwierdzić decyzje D-86 do D-120 na spotkaniu przy makiecie v2.

---

## Ryzyka niskie (priorytet 1-5)

### R-21. Rozjazd nazewnictwa między dokumentacją a klientem
**W:2 P:3 = 6**

> **Paweł (1:47:39):** "jak ty zmieniłeś nazewnictwo, to mi się teraz miesza."

**Mitygacja:** [16. Słownik](16-slownik.md) jako mapowanie nazw technicznych i nazw dla użytkownika.

### R-22. Migracja danych historycznych z Excela
**W:3 P:2 = 6**

Rozdzielenie encji Klient od Wniosku oznacza, że dane nie przeniosą się mechanicznie. Temat nie został w ogóle poruszony [P-47].

### R-23. Koszt utrzymania jako niewiadoma blokująca decyzje
**W:2 P:3 = 6**

Klient warunkuje zgodę na rozszerzenia kosztem hostingu, ale kalkulacja nie powstała [P-48].

### R-24. Brak ustaleń formalnych
**W:3 P:2 = 6**

Umowa, płatności, gwarancja, utrzymanie, własność kodu, SLA. Nie poruszone [P-29].

---

## Podsumowanie

| Priorytet | Liczba ryzyk |
|---|---|
| Krytyczne (16-25) | 4 |
| Wysokie (9-15) | 8 |
| Średnie (6-8) | 8 |
| Niskie (1-5) | 4 |
| **Razem** | **24** |

### Trzy działania o największym efekcie

1. **Rozstrzygnąć 4 blokady** ([P-01] okres rozliczeniowy prowizji, [P-02] progi prowizji wewnętrznej, [P-09] eksport CSV, [P-25] architektura danych) przed rozpoczęciem implementacji. Adresuje R-01, R-03, R-08.

2. **Zbudować prototyp konfiguratora prowizji i zwalidować go realnymi liczbami klienta** przed napisaniem linijki kodu aplikacji. Adresuje R-01, częściowo R-02.

3. **Wycena z jawnym podziałem na wersję I i opcje**, z wypisaniem tego, co przybyło na warsztacie. Adresuje R-02, R-06, R-10.
