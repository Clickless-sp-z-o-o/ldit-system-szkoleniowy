# 15. Rejestr ryzyk

Ocena: **W** wpływ, **P** prawdopodobieństwo, skala 1-5. Priorytet = W x P.

---

## Ryzyka krytyczne (priorytet 16-25)

### R-01. Silnik prowizji jest niedospecyfikowany, a stanowi rdzeń wartości systemu
**W:5 P:4 = 20**

Cztery różne modele naliczania, wersjonowanie w czasie, prognozowanie, nadpisania per wniosek, przeliczanie całego okresu przy zmianie pojedynczej pozycji. Do tego drugi poziom (prowizje pracownicze), którego progi w ogóle nie istnieją.

Sam wykonawca nazwał to najtrudniejszym elementem projektu (24:28). **Stan po 29.09:** P-01 rozstrzygnięte wstępnie przez wykonawcę [D-164, dwa widoki: rzeczywista i przewidywana], P-02 wstępnie [D-162, stała stawka, progi później], P-04 rozwiązane [D-161, korekta w okresie wystawienia, zgodne z D-23]. Żadna z trzech decyzji nie ma odpowiedzi klienta. Z pytań w tym obszarze zostają otwarte P-07, P-15, P-31.

**Mitygacja:**
- Prototyp konfiguratora HTML **przed** implementacją [D-20], zwalidowany realnymi liczbami klienta
- Uzyskać od klienta potwierdzenie D-164 (P-01: data faktury vs data planowana) przed prototypem
- Uzyskać potwierdzenie D-162 (P-02: stała stawka, progi później), model progowy to inna struktura danych, więc możliwa przeróbka
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

**Status: rozstrzygnięte [D-177]** (jedna baza, separacja wierszy, egzekwowana dwa razy przez RLS i filtr serwera [D-179]). Ryzyko przesuwa się do wykonania: patrz R-26. Opis w [09. Integracje](09-integracje-i-architektura.md).

### R-04. Ryzyko wycieku danych między konkurencyjnymi instytucjami
**W:5 P:3 = 15, ale skutek nieodwracalny**

Instytucje są wobec siebie konkurencyjne. Wyciek nie jest tylko incydentem technicznym, tylko zniszczeniem relacji handlowych klienta. Klient sam sygnalizował ryzyko przez wyszukiwarkę.

Kanałów wycieku jest wiele: widoki, wyszukiwarka globalna, eksporty, formularze, ewentualny panel klienta.

**Mitygacja:**
- Separacja egzekwowana na poziomie danych, nie interfejsu
- **Automatyczne testy separacji dla każdego kanału** jako element definicji ukończenia
- Checklist z [10. Bezpieczeństwo i RODO](10-bezpieczenstwo-i-rodo.md) przed wdrożeniem

### R-28. 27 decyzji wstępnych czeka na potwierdzenie klienta
**W:4 P:4 = 16**

Z 46 decyzji D-161 - D-206 wykonawca rozstrzygnął w panelu 27 punktów, w których miał odpowiadać klient (oznaczenie [W]\*). Po D-209 wiersz D-193 jest skorygowany, ale dochodzi D-212 (mapa zakładek), więc na potwierdzenie czeka nadal 27 pozycji. Wśród nich trzy dawne blokady (D-162, D-163, D-164) i decyzje odwracające preferencje klienta (D-187 względem D-147, D-189 względem D-122). Klient deklarował, że chce uczestniczyć w każdym etapie, a wykonawca zapowiedział, że nie będzie się często odzywał (2:57:33).

**Ryzyko:** klient odrzuci część wyborów po fakcie, a moduły zbudowane na nich trzeba będzie przerabiać. Patrz też R-06 (konflikt interesów).

**Mitygacja:** spotkanie przechodzące przez wszystkie wiersze [W]\* z [13. Rejestru decyzji](13-rejestr-decyzji.md), panel decyzyjny jako materiał, zapis potwierdzenia przy każdej decyzji.

---

## Ryzyka wysokie (priorytet 9-15)

### R-05. Termin 2 miesiące przy zapowiedzianym trybie ciągłych zmian
**W:5 P:3 = 15**

Twardy deadline biznesowy: gotowe przed styczniem, bo wtedy startują nabory i klient jest niedostępny. Wykonawca szacuje 6 tygodni pracy. Klient zapowiada ciągłe konsultacje i zmiany "z metra".

Do tego, po rundzie 29.09, 20 pytań otwartych (po D-213 z 30.09: 19) i 27 decyzji wstępnych czekających na klienta (R-28). Wszystkie 4 blokady mają rozstrzygnięcie wykonawcy [D-162, D-163, D-164, D-177].

**Mitygacja:**
- Zamrozić zakres wersji I po makiecie v2
- Potwierdzić z klientem rozstrzygnięcia blokad [D-162, D-163, D-164] w pierwszym tygodniu
- Etapowanie z [12. Zakres](12-zakres-i-etapowanie.md), żeby etap I był użyteczny nawet jeśli reszta się opóźni

### R-06. Konflikt interesów: klient chce systemu "dla siebie", wykonawca jest też użytkownikiem
**W:4 P:4 = 16**

Wykonawca występuje w podwójnej roli: buduje system i jest jedną z instytucji szkoleniowych, która ma go używać. W kilku miejscach forsował wymagania z perspektywy użytkownika IS:
- panel klienta końcowego (klient wątpi, wykonawca chce i deklaruje współfinansowanie)
- statystyki per handlowiec (klient odroczył wprost; wykonawca wybrał w panelu wariant z rozbiciem [D-193], po czym sam go wycofał [D-209])
- widok naborów dla handlowca IS (klient odrzucił)

> **Bartek (2:54:45):** "ja miałem założenie, że ten system służy tylko tak naprawdę nam."
>
> **Paweł (2:55:21):** "najwyżej zrobimy dla mnie jakiś moduł, to już zrobię, albo będziesz mi to kasował za usługi."

**Ryzyko:** dwa równoległe źródła prawdy albo późniejsza przebudowa modelu uprawnień.

**Mitygacja:** jawnie rozdzielić w wycenie zakres "dla LDIT" od ewentualnego zakresu "dla instytucji". [P-12] rozstrzygnięte wstępnie: statystyki bez rozbicia per handlowiec [D-209], filtr danych per handlowiec [D-210]. Wybór wykonawcy, klient nie potwierdził.

### R-07. Powiązanie maila z klientem opiera się na dyscyplinie ludzi
**W:4 P:4 = 16**

Przyjęte rozwiązanie to konwencja tematu maila ("pielesiak - zapytanie"). Jeden zapomniany prefiks oznacza, że mail nie trafi do rekordu.

Przy szczycie 130 wniosków w dwa tygodnie i wielu pracownikach obsługujących tego samego klienta to się nie skaluje.

**Mitygacja wdrożona w decyzji:** dopasowanie po adresie e-mail jako mechanizm podstawowy, konwencja tematu jako uzupełnienie, ręczne przypięcie [D-178, P-21 rozstrzygnięte]. Zostaje koszt: mail z innego adresu tej samej firmy nie zostanie dopasowany.

### R-08. Cały moduł faktur zależy od niepotwierdzonego założenia
**W:4 P:3 = 12**

Decyzja "import CSV zamiast API" opiera się na założeniu, że system księgowy klienta udostępnia eksport CSV. **Nie potwierdzono przez klienta.** Wykonawca przyjął wstępnie, że eksport istnieje [D-163]. Nazwa systemu nie została nawet rozpoznana.

Jeśli eksportu nie ma, wracamy do wyceny integracji API (10-15 h) plus ryzyko przechowywania klucza.

**Mitygacja:** [P-09] rozstrzygnięte wstępnie [D-163], nadal wymaga potwierdzenia u księgowej przed wyceną końcową.

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

### R-25. Open Mercato w wersji v0.8.0, przed 1.0
**W:4 P:3 = 12**

Stos docelowy [D-176] to framework przed wydaniem 1.0. API i model rozszerzeń mogą się zmienić, dokumentacja może być niepełna, a wykonawca nie zna go tak jak własnego kodu.

**Mitygacja:** przypiąć dokładną wersję, ograniczyć własne rozszerzenia do udokumentowanych punktów, mieć plan awaryjny (własna warstwa nad PostgreSQL i MikroORM). Patrz [09](09-integracje-i-architektura.md) i [18](18-od-makiety-do-aplikacji.md).

### R-26. Brak RLS i uprawnień per pole w frameworku
**W:5 P:3 = 15**

Open Mercato filtruje organizacje w aplikacji, nie w bazie, i nie ma uprawnień per pole [D-149, D-176, D-179]. Oba mechanizmy trzeba dobudować, a pominięty filtr w jednym zapytaniu to wyciek między konkurencyjnymi instytucjami (R-04). Filtr handlowca [D-210] dodaje kolejny wymiar wiersza do polityk.

**Mitygacja:** RLS jako druga, niezależna bariera [D-179], osobny audyt separacji przed wdrożeniem [D-177], zewnętrzny audyt po etapie I [D-201], testy separacji dla każdego kanału.

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

**Mitygacja:** agent AI pozostaje poza zakresem tego systemu. Zadania wróciły [D-140], ale jako ostatni moduł i w wąskim zakresie: zadania przypięte do wniosku i statusu, nie ogólny menedżer zadań. Trzymać tę granicę.

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

**Mitygacja:** potwierdzić decyzje D-86 do D-120 na spotkaniu przy makiecie v2. Podobny problem dotyczy D-161 - D-206: wybory podjęte bez klienta, patrz R-28.

### R-27. Cała baza makiety działa w przeglądarce
**W:3 P:3 = 9**

Makieta trzyma bazę SQLite po stronie użytkownika, a kod egzekwujący uprawnienia (`zakres.js`, `walidacja.js`) da się obejść. Lokalny serwer `tools/serwer.mjs` zapisuje bazę na dysk, ale nie zmienia tego ograniczenia [D-179, D-211]. Ryzyko: pokazanie makiety z danymi rzeczywistymi albo uznanie jej separacji za zabezpieczenie.

**Mitygacja:** w makiecie wyłącznie dane demonstracyjne, w aplikacji polityki w bazie i na serwerze [D-179], patrz [18](18-od-makiety-do-aplikacji.md).

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
| Krytyczne (16-25) | 5 |
| Wysokie (9-15) | 10 |
| Średnie (6-8) | 9 |
| Niskie (1-5) | 4 |
| **Razem** | **28** |

Ryzyka R-25 - R-28 dopisano po rundzie 29.09.2026 [D-161 - D-212]. Kolejność sekcji nie jest ściśle zgodna z liczonym priorytetem (np. R-06, R-07, R-09 mają 16), zachowano numerację historyczną.

### Trzy działania o największym efekcie

1. **Uzyskać od klienta potwierdzenie rozstrzygnięć blokad** ([P-01] D-164, [P-02] D-162, [P-09] D-163; P-25 zamknięte D-177) oraz pozostałych 27 decyzji wstępnych przed rozpoczęciem implementacji. Adresuje R-01, R-08, R-28.

2. **Zbudować prototyp konfiguratora prowizji i zwalidować go realnymi liczbami klienta** przed napisaniem linijki kodu aplikacji. Adresuje R-01, częściowo R-02.

3. **Wycena z jawnym podziałem na wersję I i opcje**, z wypisaniem tego, co przybyło na warsztacie. Adresuje R-02, R-06, R-10.
