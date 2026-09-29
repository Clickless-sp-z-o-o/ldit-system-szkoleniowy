# 16. Słownik pojęć

## Pojęcia domenowe KFS

| Pojęcie | Znaczenie |
|---|---|
| **KFS** | Krajowy Fundusz Szkoleniowy. Dofinansowanie szkoleń przyznawane **pracodawcy**, nie uczestnikowi |
| **PUP** | Powiatowy Urząd Pracy. Instytucja przyjmująca wnioski. **340 urzędów** w bazie naborów |
| **BUR** | Baza Usług Rozwojowych. Uczestnik musi być w niej zarejestrowany. Etap w lejku statystyk |
| **Nabór** | Okno czasowe, w którym urząd przyjmuje wnioski. Kluczowe pole: **data zakończenia** |
| **Nabór prognozowany** | Przewidywany, jeszcze nieogłoszony nabór. Z aplikacji do przewidywania naborów |
| **praca.gov.pl** | Portal, przez który klient zakłada konto i składa dokumenty |
| **Mikroprzedsiębiorca** | Firma zatrudniająca **do 9 osób** łącznie na umowie o pracę. Dofinansowanie 90% |
| **Wkład własny** | Część kosztu pokrywana przez firmę. **10%** dla mikro, **30%** dla pozostałych (wartości domyślne, progi konfigurowalne i wersjonowane datą [D-131]). Procent wyliczany, kwota nadpisywalna ręcznie [D-172, wstępna], liczony od kosztu uznanego przez urząd [D-173, wstępna] |
| **Uczestnik zakwalifikowany** | Osoba spełniająca warunki KFS, wchodzi do kosztu całkowitego projektu |
| **Uczestnik niezakwalifikowany** | Np. prezes zarządu będący większościowym udziałowcem bez umowy o pracę. **Wymaga odrębnej faktury komercyjnej** |
| **Precedens cenowy** | Jeśli instytucja raz zejdzie z ceny, urząd nie zaakceptuje już wyższej kwoty dla tego szkolenia |

---

## Kwoty (najczęstsze źródło nieporozumień)

| Pojęcie | Definicja | Sposób |
|---|---|---|
| **Całkowita wartość szkolenia** | Pełna wartość szkolenia z wkładem własnym, o którą wnioskujemy. Suma kwot uczestników zakwalifikowanych. Wcześniej mylnie nazywana "kwotą wnioskowaną" | Wyliczane |
| **Koszt całkowity** | Wartość **uznana przez urząd**, podstawa wyliczenia dofinansowania. Może być niższa od wnioskowanej. **Nazwa sporna**, klient proponował "dofinansowanie ze wkładem własnym". Wykonawca wstępnie zostawia nazwę "koszt całkowity" [D-191, wstępna] | Wyliczane od "kosztu całkowitego z dopłatą" [D-134] |
| **Przyznano** | Kwota dofinansowania przyznana przez urząd. `koszt_calkowity x 0,9` (mikro) lub `x 0,7` | Wyliczane |
| **Dopłata standard** | Wkład własny wyrażony kwotowo. `wartosc x procent_wkladu` | Wyliczane |
| **Kwota dopłaty dodatkowej** | Dodatkowa kwota płacona przez klienta poza wkładem własnym, gdy urząd przyznał za mało lub instytucja nie zeszła z ceny. Domyślnie 0 | Ręczne |
| **Koszt całkowity z dopłatą** | `koszt_calkowity + doplata_dodatkowa`. **Podstawa naliczania prowizji LDIT** | Wyliczane |

**Równanie kontrolne:** `przyznano + wklad_wlasny = koszt_calkowity`

---

## Prowizje

| Pojęcie | Znaczenie |
|---|---|
| **Prowizja LDIT** | Wynagrodzenie firmy Bartka, płacone przez instytucję szkoleniową. Domyślnie procentowo, standard 20%. Indywidualne nadpisanie per wniosek może być procentem albo kwotą [D-136, koryguje D-21] |
| **Prowizja wewnętrzna** | Prowizja pracowników LDIT. Startuje na stałej stawce, progi dołożone później, nowe warunki działają od daty obowiązywania, nigdy wstecz [D-162, wstępna, do potwierdzenia przez klienta] |
| **Prowizja potencjalna** | Prowizja szacowana z wniosków jeszcze nierozstrzygniętych. Prezentowana na dashboardzie |
| **Prowizja przewidywana** | Prognoza stawki dla okresu, wyliczona z zaplanowanych szkoleń (kalendarz) przed wystawieniem faktur. Obok niej widok rzeczywisty wg daty faktury [D-164, wstępna] |
| **Okres rozliczeniowy** | Miesiąc albo rok (YTD), do którego przypisana jest faktura i z którego liczy się obrót do progów. Rzeczywisty: wg daty faktury. Przewidywany: wg kalendarza szkoleń [D-164]. Faktura korygująca należy do okresu, w którym ją wystawiono [D-161] |
| **Korekta faktury (faktura korygująca)** | Faktura o rodzaju "korygująca" z `faktura_pierwotna_id` [D-170]. Zdejmuje prowizję stawką faktury pierwotnej, nie zmienia obrotu nowego okresu, zamknięty okres się nie zmienia. Prowizja za miesiąc korekty może wyjść ujemna [D-161, wstępna] |
| **Prowizja przyznana** | Prowizja wyliczona od faktycznie przyznanego dofinansowania |
| **Prowizja ustalona ręcznie** | Nadpisanie stawki dla pojedynczego wniosku. Edytowalne wyłącznie z modułu Administracja |
| **Próg przychodu** | Kwota graniczna (miesięczna lub roczna), po przekroczeniu której zmienia się stawka |
| **Rodzaj kumulacji** | Okres sumowania obrotu do progów: **miesięczny** albo **roczny (YTD)** |
| **Liczenie od całości** | Po przekroczeniu progu nowa stawka obejmuje **cały obrót okresu** |
| **Liczenie od nadwyżki** | Stawka progowa obowiązuje tylko dla części obrotu **powyżej progu** |
| **Średnia (efektywna) stawka** | Wynikowy procent dla faktury podzielonej między dwa progi. Np. 2 500 / 15 000 = 16,7% |
| **YTD** | Year to date, naliczanie narastające od początku roku |
| **Forma dokumentowa** | Mailowe ustalenie zmiany warunków umowy, dopuszczone przy dużych wnioskach |

---

## Encje i moduły systemu

| Pojęcie | Znaczenie |
|---|---|
| **Instytucja szkoleniowa (IS)** | Klient LDIT. Podmiot prowadzący szkolenia i płacący prowizję. W transkrypcji często zniekształcane na "intencja szkoleniowa" |
| **Klient / firma końcowa** | Klient instytucji szkoleniowej. Firma, dla której składany jest wniosek. Osobna encja od wniosku |
| **Uczestnik** | Pracownik firmy końcowej idący na szkolenie |
| **Wniosek / Projekt** | Pojedynczy wniosek o dofinansowanie. **Jeden projekt = jeden wniosek**. Jeden klient ma wiele wniosków |
| **Katalog szkoleń** | Zbiór **szablonów** szkoleń danej instytucji. Cena zmienna w czasie |
| **Termin szkolenia** | Konkretna **realizacja** szkolenia z katalogu. Jeden szablon może być zrealizowany 50 razy w roku |
| **Plan szkolenia** | Zestaw parametrów dodawany przez instytucję, np. tryb wieczorowy |
| **Standard** | Powtarzalny wzorzec godzin i dni szkolenia danej instytucji, np. 9:30-20:00, śr/czw/pt |
| **Szkoleniowiec** | Osoba prowadząca szkolenia w instytucji: imię, nazwisko, telefon, e-mail. Osobna tabela `szkoleniowcy`, 1 instytucja : N [D-167] |
| **Handlowiec** | Konto **Pracownik IS**, nadawane przez administratora instytucji. Widzi wyłącznie klientów i wnioski przypisane do siebie (`handlowiec_id`) [D-72, D-210]. Nie dostaje statystyk w rozbiciu per handlowiec [D-209] |
| **Zakładka "nieprzypisane"** | Widok wniosków bez roku (`wnioski.rok` NULL). Usunięcie zakładki roku odpina wnioski, nie kasuje ich [D-165] |
| **Podsumowanie historyczne** | Same liczby za lata nieprzeniesione (np. 2025), tabela `podsumowania_historyczne` i widok `v_podsumowanie_roku`, zasila dashboard [D-175, D-160] |
| **Feature** | Jednostka uprawnienia w formacie `modul.akcja` (np. `wnioski.view`, `wnioski.manage`), także dla pól. Przypisywana do roli w `role_funkcje`, obsługuje wildcard `modul.*`. Wzór z Open Mercato (`acl.ts`, `role_acls`) [D-211, D-176] |
| **Drill through** | Zasada: każda agregacja (liczba, wykres, kafelek, licznik) prowadzi do listy szczegółów, z których się składa [D-212, wstępna] |
| **Strażnik zapisów** | Warstwa walidacji i kontroli przy zapisie: walidacja danych na granicy (`assets/walidacja.js`, odpowiednik Zod), format błędów `{ data, error: { code, message } }`, blokada wersji (optimistic locking) w trybie serwera [D-211] |
| **Konfigurator instytucji** | Moduł z danymi firmy, warunkami prowizji, wzorem certyfikatu. **Widoczny wyłącznie dla admina** |
| **Zgłoszenia** | Moduł wewnętrznej bazy incydentów (oszustwa, próby zaniżenia prowizji). Tylko admin i pracownicy LDIT |
| **Rejestr aktywności** | Log zmian danych: kto, kiedy, wartość przed i po |
| **Log logowań** | Log sesji: kto i kiedy zalogował się do systemu |
| **Reguła (na polu)** | Automatyczne wyliczanie wartości. Kasowane po ręcznej edycji, z możliwością przywrócenia ("Przywróć regułę") |
| **Rejestr (log akcji)** | Dziennik istotnych zdarzeń (otwarcie karty, eksport, wejście w moduł finansowy, wysyłka, zmiana statusu, zmiana uprawnień), tylko do dopisywania [D-189, D-208] |

---

## Nazewnictwo: nazwa techniczna vs nazwa dla użytkownika

Klient zażądał zachowania obecnych nazw [D-55]. Ta tabela zapobiega rozjazdowi.

| W dokumentacji / kodzie | Dla użytkownika (etykieta w UI) |
|---|---|
| Dofinansowania (moduł roczny) | **Zestawienia** (2025 / 2026 / 2027) |
| Dofinansowania (wybór instytucji) | **Dofinansowania** (rozwija listę IS) |
| Wnioski | **Nabory** |
| Wniosek | **Projekt** |
| Baza uczestników i leadów | **Baza klientów** (dziś w Excelu: "Niezłożone") |
| Zestawienie złożonych wniosków | **Zestawienie [rok] złożone** |
| Panel finansowy administratora | **Administracja** |

### Nazwy wymagające zmiany

| Obecna | Problem |
|---|---|
| `NW` (status) | Rozwinięcie skrótu zapomniane przez samego klienta. Znaczenie: umówione z klientem, że piszemy wniosek, ale sprawa stoi |
| `Niezłożone` (zakładka) | Myląca, zawiera też klientów ze złożonymi wnioskami. Klient proponuje "Baza klientów" |
| `koszt całkowity` (pole) | Myli się z całkowitą wartością szkolenia. Propozycja wcześniejsza: "Koszt uznany przez urząd". **Wstępnie zostaje "koszt całkowity"** [D-191, do potwierdzenia przez klienta], ryzyko pomyłki z "kosztem całkowitym z dopłatą" |

---

## Podmioty i osoby

### Strony projektu
| Nazwa | Rola |
|---|---|
| **LDIT** | Firma Bartłomieja Olejnika. Klient projektu. Pozyskuje dofinansowania |
| **Bartłomiej Olejnik (Bartek)** | Właściciel LDIT, administrator systemu |
| **Odczaruj Low Code** | Wykonawca |
| **Paweł Czapiewski** | Wykonawca. Jednocześnie właściciel instytucji szkoleniowej "Odczaruj Power BI" |
| **Kacper Fułek** | Zespół wykonawcy, obecny w części warsztatu |

### Zespół LDIT (wymienieni w warsztacie)
Łucja, Martyna, Asia, Magda, Łucjan. Pracownicy obsługujący klientów i instytucje.

### Instytucje szkoleniowe (przykłady z warsztatu)
| Nazwa | Kontekst |
|---|---|
| **Metal Maniak** | Model operacyjny A: LDIT ma kalendarz IS i sam ustala terminy |
| **Dron Fortech** | Model operacyjny B: IS ustala termin telefonicznie i powiadamia mailem |
| **Odczaruj Power BI** | Firma wykonawcy jako IS. Stawka "prawie 20%" |
| **Fit Akademia** | Źródło modelu prowizyjnego C (18/14%, próg 100 000 zł miesięcznie) |
| **Cognity, Akademia, Klik-less** | Podmioty w makiecie |

### Narzędzia
| Nazwa | Kontekst |
|---|---|
| **Excel** | Obecne narzędzie pracy. Trzy pliki: `Zestawienie [rok] złożone`, `Niezłożone`, `Rozpis szkoleń` |
| **Microsoft 365** | Środowisko klienta. Podstawa integracji poczty |
| **Outlook** | Klient poczty. Integracja kalendarza **wykluczona** |
| **OneDrive / SharePoint** | Repozytorium plików. **Zostaje poza systemem** |
| **Projectly** | Druga aplikacja wykonawcy. Miała przejąć zadania [D-118], ale moduł wrócił do systemu [D-140], integracja niepotrzebna |
| **Open Mercato** | Framework docelowy: TypeScript, Next.js, PostgreSQL, MikroORM, Zod. Wersja v0.8.0, przed 1.0 [D-176] |
| **Zoho CRM** | System wykonawcy, demonstrowany na warsztacie jako wzorzec integracji poczty |
| **Fakturownia** | Poprzedni system fakturowy klienta |
| **inFakt** | System fakturowy wykonawcy, referencja dla eksportu |
| **eSzokBR** | System księgowy klienta. W transkrypcji zniekształcany do "e shock", "br shock" |

---

## Skróty używane w dokumentacji

| Skrót | Znaczenie |
|---|---|
| **D-xx** | Decyzja z [13. Rejestru decyzji](13-rejestr-decyzji.md) |
| **P-xx** | Pytanie otwarte z [14. Pytań otwartych](14-pytania-otwarte.md) |
| **R-xx** | Ryzyko z [15. Rejestru ryzyk](15-ryzyka.md) |
| **[K]** | Decyzja klienta (potrzeba biznesowa) |
| **[W]** | Propozycja wykonawcy (rozwiązanie) |
| **IS** | Instytucja szkoleniowa |

---

## Uwaga o jakości transkrypcji

Transkrypcja warsztatu jest automatyczna (Teams) i zawiera liczne błędy rozpoznawania mowy. Typowe zniekształcenia napotkane w materiale:

| W transkrypcji | Właściwe znaczenie |
|---|---|
| "intencja szkoleniowa", "inicjacja szkoleniowa" | instytucja szkoleniowa |
| "kfc" | KFS |
| "jertu days" | YTD |
| "dasz bort", "deszporcie" | dashboard |
| "podłoga" | podkreślnik (underscore) w nazwie pliku |
| "project i" | Projectly |
| "odczaruj BRBI" | Odczaruj Power BI |
| "klik le spółka" | Klik-less sp. z o.o. |
| "pewne plecak" | praca.gov.pl |
| "stron fortech", "dron forte" | Dron Fortech |

Cytaty w dokumentacji zachowano dosłownie. Interpretacje oznaczono nawiasami kwadratowymi.
