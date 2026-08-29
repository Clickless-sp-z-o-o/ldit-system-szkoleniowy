# 08. Powiadomienia i automatyzacje

## Zasada nadrzędna: cała komunikacja wychodzi z domeny LDIT

**Decyzja TWARDA [D-45].** Żadne powiadomienie nie może wyjść z systemu w imieniu instytucji szkoleniowej.

> **Bartek (2:37:46):** "chcę mieć taką pełną kontrolę nad tym, co wysyłamy, nad tym, co wychodzi od nas. To jest produkt."
>
> **Paweł (2:38:07):** "Więc instytucje szkoleniowe nie mogą wysyłać powiadomień z systemu bezpośrednio, nawet SMS-owych, mogą ewentualnie eksportować szablony."

**Kompromis dla instytucji [D-46]:** przycisk w systemie otwiera Outlooka z uzupełnionym adresatem, tematem i treścią. Instytucja wysyła z własnej skrzynki.

> **Paweł (2:37:10):** "klikam sobie w przycisk, odpala się Outlook z już wpisanym klientem, wpisanym tytułem i treścią."
> **Bartek (2:37:34):** "[Skopiuje sobie] i wyśle ze swojego maila."

**Pytanie otwarte [P-16]:** czy to eksport pliku, czy generowanie linku `mailto:`. Mechanizm niedoprecyzowany.

---

## Kanał: wyłącznie e-mail

**SMS ODRZUCONY w etapie I** [D-04, TWARDA]. Powód: własne negatywne doświadczenie klienta z innym systemem.

> **Bartek (9:35):** "nie chcę SMS-y (...) po jednym dniu spamu SMS-em to wyłączyłem. Zdenerwował mnie po prostu, jak cały czas mi przychodziły: został ustalony nowy termin. Nie, nie, mailowy tylko."
>
> **Bartek (52:29):** "SMS-owe trochę drażnią i nie chcę tego."

Furtka zostawiona na przyszłość: "docelowo kiedyś to upgradować, na ten moment uważam, że mailowe będą w zupełności wystarczające."

**Propozycja wykonawcy, żeby zostawić SMS tylko dla uczestników szkoleń, nie została domknięta** [P-17].

---

## Konfiguracja wysyłki

| Element | Wartość |
|---|---|
| Nadawca | Alias w domenie klienta, np. `powiadomienia@[domena].pl` |
| Platforma | Microsoft 365 (tenant klienta) |
| Mechanizm | Rejestracja aplikacji z uprawnieniem **Send Mail** |
| Koszt | Jedno dedykowane konto z licencją, ok. **4 USD/EUR** miesięcznie, po stronie klienta |
| Konfiguracja | **Wspólna sesja na żywo, ok. 2 godziny** (alternatywa: dostęp do konta admina na 2-3 dni) |
| Środowisko testowe | Wysyłka z konta Gmail wykonawcy |

> **Bartek (52:36):** "Na pewno z naszą domeną, może być to `powiadomienia@[domena].pl`."

Klient wybrał sesję na żywo zamiast przekazania konta administracyjnego. Powód: konto admina tenanta to jego bieżące konto biznesowe, nie osobne konto techniczne. Zadanie odłożone na koniec projektu.

---

## Katalog powiadomień

| Powiadomienie | Odbiorca | Wyzwalacz | Tryb |
|---|---|---|---|
| Prośba o ustalenie terminu | Instytucja, osoba od terminów | Status = Pozytywna decyzja | Auto |
| Termin ustalony, zgłoś do urzędu | LDIT | Instytucja wpisała termin | Auto |
| Wniosek w trakcie przygotowania | Klient końcowy | Przycisk | Ręczny |
| **Dane do faktury** | Instytucja | Przycisk przy wniosku | Ręczny |
| Alert o wystawieniu faktury | Osoba odpowiedzialna za faktury | IS oznaczyła fakturę | Auto |
| Sprawdzenie kompletu dokumentów | LDIT | 8 dni przed szkoleniem | Auto |
| Szczegóły organizacyjne szkolenia | Uczestnicy terminu | 1-2 dni przed terminem | Auto |
| Instrukcja zakładania konta praca.gov.pl | Klient końcowy | Przycisk | Ręczny |
| Instrukcja składania pisma | Klient końcowy | Przycisk | Ręczny |
| Prośba o opinię w Google | Klient końcowy | Przycisk | Ręczny |
| Klient uzyskał dofinansowanie | Instytucja | Przycisk (nie automat) | Ręczny |

> **Uwaga z dokumentu klienta:** powiadomienie o uzyskaniu dofinansowania ma być **pod przyciskiem, nie automatem**, bo część instytucji nie chce powiadomień.

**Pełna lista szablonów do dosłania przez klienta** po postawieniu szkieletu [D-119].

---

## Alerty konfigurowalne [D-89]

Obok automatyzacji systemowych administrator i uprawnieni pracownicy mogą ustawić alert ręcznie.

### Cztery alerty rozpisane przez klienta

Źródło: dokument klienta "spis funkcji", sekcja "Terminy i automatyczne alerty".

**1. Alerty ręczne**

Administrator i pracownicy ustawiają alert samodzielnie, podając datę i treść.

> Klient: "po przeczytaniu umowy okazało się, że Klient 7 dni przed rozpoczęciem szkolenia musi dostarczyć harmonogram, wtedy ustawiamy datę, kiedy chcemy otrzymać alert i o co chodzi."

**2. Alert automatyczny z praca.gov.pl** [P-52, MECHANIZM NIEUSTALONY]

> Klient: "otrzymujemy alert mailowy od praca.gov.pl w sprawie Klienta, u którego jesteśmy w organizacji. Może zdarzyć się, że Klient nie odbierze telefonu, przez co musimy ustawić maila jako nieodczytany lub oflagować, żeby nam nie umknęło. Chciałbym, żeby alert był jako zadanie? Wykrzyknik przy Kliencie? **Do przemyślenia jak zrobić to najlepiej.**"

Klient sam nie rozstrzygnął formy. Trzy warianty do rozważenia: zadanie, znacznik przy kliencie, wpis w kolejce do obsłużenia. Warsztat tego wątku nie podjął.

Uwaga: to jedyny alert wyzwalany zdarzeniem zewnętrznym (mail przychodzący z portalu), nie stanem w systemie. Wymaga integracji odczytu poczty, która i tak jest planowana.

**3. Alert "kiedy wystawić fakturę"**

Wyzwalany zaznaczeniem checkboxa przez pracownika, że instytucja szkoleniowa wystawiła fakturę.

> Klient: "Alert dla administratora lub docelowo dla osoby odpowiedzialnej za wystawianie faktur, więc admin powinien mieć też opcję kto może otrzymywać jakie alerty."

**4. Alert o zbliżającym się terminie szkolenia**

**8 dni przed rozpoczęciem szkolenia**, do zespołu LDIT.

> Klient: "info do nas 8 dni przed rozpoczęciem szkolenia, żebyśmy mogli się upewnić, czy Klient dostał wszystkie wymagane dokumenty. Opcja wysłania maila do IS z przypomnieniem o szkoleniu."

Dwie akcje: powiadomienie wewnętrzne oraz opcjonalny mail do instytucji.

### Konfigurowalne uprawnienia do alertów

Administrator decyduje, kto może otrzymywać jakie alerty.

> Klient: "zdecyduję, że za tydzień pracownik wystawia faktury, więc chcę mieć opcję nadania mu uprawnienia do otrzymywania alertów dotyczących faktur."


---

## Automatyzacja: certyfikaty

**Pełna automatyzacja generowania.** To jedno z wymagań o najwyższej wartości biznesowej, bo eliminuje ręczną pracę przy 50 uczestnikach.

### Mechanizm

```
1. Wzór certyfikatu wgrany per instytucja szkoleniowa
   (w konfiguratorze instytucji)
              |
2. Placeholdery wypełniane danymi z bazy
              |
3. Jedno kliknięcie "Generuj"
              |
4. N osobnych plików PDF (jeden na uczestnika)
              |
5. Spakowane do archiwum ZIP
              |
6. Pobranie z poziomu wniosku
```

> **Bartek (2:58:39):** "klikam sobie generuj i wygeneruje mi 50 różnych, 50 PDF-ów, dla każdego uczestnika certyfikat."

### Zawartość certyfikatu

| Pole | Źródło |
|---|---|
| Imię i nazwisko uczestnika | Uczestnik wniosku |
| Nazwa szkolenia | Katalog szkoleń |
| Termin realizacji (w jakich dniach) | Termin szkolenia |
| Data wystawienia | Systemowa |
| **Miejscowość** | **Siedziba instytucji szkoleniowej, NIE miejsce szkolenia** [D-99] |
| Numer certyfikatu | Opcjonalny, jeśli wymagany |

> **Bartek (2:58:25):** "Siedzibie firmy instytucji szkoleniowej. Bo nie miejscu szkolenia, tylko siedzibie."

### System NIE wysyła certyfikatów mailem [D-49]

> **Bartek (2:56:53):** "Nie wysyłać. My sobie pobierzemy i my całą paczkę dopiero z rozliczeniem wysyłamy klientom."

Konwencja nazwy pliku: **`certyfikat_imie_nazwisko`**.

Jedna firma = jedna paczka ZIP. Pobieranie przez przeglądarkę, **bez zapisu na SharePoint**.

### Paczka rozliczeniowa [D-53]

Klient końcowy dostaje kompletny zestaw:
- certyfikaty wszystkich uczestników
- załączniki rozliczeniowe
- faktura
- instrukcja złożenia rozliczenia przez praca.gov.pl

> **Bartek (2:58:57):** "klient poza certyfikatami dostaje również załączniki rozliczeniowe, całość razem też pewnie z fakturą, ze wszystkim co jest potrzebne, żeby rozliczyć szkolenie. Wysyłam mailem i dostaje też instrukcję, jak to złożyć."

**Pytanie otwarte [P-18]:** czy faktura w paczce jest generowana przez system, czy dokładana ręcznie. Klient powiedział "pewnie z fakturą", bez doprecyzowania źródła.

**Pytania otwarte [P-19]:** kto wgrywa wzór certyfikatu (admin czy sama IS) i w jakim formacie (Word, PDF, HTML). Brak też reguły numeracji certyfikatów.

---

## Automatyzacja: dane do faktury

**Przycisk przy wniosku generujący gotowego maila do instytucji szkoleniowej** [D-104]. Nie automat, akcja na żądanie.

> **Bartek (3:00:28):** "żebym miał wybór przycisku przy kliencie. Wchodzę we wniosek i klikam przycisk, który generuje mi maila do instytucji szkoleniowej z taką treścią uzupełnioną."

### Pola uzupełniane automatycznie

| Pole | Źródło |
|---|---|
| Nazwa klienta | Klient |
| Adres siedziby | Klient |
| NIP | Klient |
| Imię i nazwisko odbiorcy faktury | Wniosek |
| Szkolenie, ilość osób | Uczestnicy wniosku |
| Cena jednostkowa, cena całkowita | Wniosek |
| Uczestnicy | Lista zakwalifikowanych |
| Termin | Termin szkolenia |

### Stała treść z dokumentu klienta

```
Dzień dobry, proszę o wystawienie faktur dla Klientów:

Nazwa Klienta:
Adres siedziby:
NIP:

Imię i nazwisko odbiorcy FV:

Szkolenie:
Ilość osób:
Cena jedn.:
Cena całk.:
VAT: ZW
Termin płatności:

Uwagi:
- Usługa zwolniona z podatku VAT na podstawie § 3 ust. 1 pkt 14
  Rozporządzenia Ministra Finansów z dnia 20 grudnia 2013 r. w sprawie
  zwolnień od podatku od towarów i usług oraz warunków stosowania tych
  zwolnień (Dz. U. z 2020 r. poz. 1983). Szkolenie finansowane w 90%
  z Krajowego Funduszu Szkoleniowego.
- Uczestnicy:
- Termin:
```

> **Uwaga merytoryczna:** klauzula mówi o finansowaniu w 90%, co odpowiada mikroprzedsiębiorcy. Przy firmach powyżej mikro (70%) treść wymaga parametryzacji. Do potwierdzenia u klienta.

**Wymagane zatwierdzenie przed wysyłką**, zgodnie z zasadą z modułu Wysyłka maili.

---

## Automatyzacja: dodawanie klientów do bazy

**Formularz elektroniczny plus bramka ręcznej akceptacji** [D-105].

```
klient wypełnia formularz online
            |
system rejestruje datę wpłynięcia automatycznie
            |
zgłoszenie trafia na LISTĘ OCZEKUJĄCYCH
(z datą wypełnienia, do ustalenia kolejności)
            |
Bartek klika "Akceptuj"
            |
rekord wchodzi do bazy klientów
```

Powód bramki: ochrona przed spamem i błędnymi wpisami przez publiczny formularz.

> **Bartek (3:01:38):** "chcę mieć po prostu wgląd, żeby klikam akceptuj i dopiero się dodaje do bazy."
> **Bartek (3:02:05):** "jeżeli za każdym razem będziemy klikali zatwierdź i nie będzie z tym problemów, no to ewentualnie możemy kiedyś to zdjąć."

Docelowo akceptację można zdjąć lub zautomatyzować.

Szczegóły formularza w [09. Integracje i architektura](09-integracje-i-architektura.md#formularze-zgłoszeniowe).

---

## Odrzucone: wewnętrzny komunikator

Klient zaproponował "mały Messenger" przy kliencie zamiast maili, sam wyraził wątpliwość, wykonawca przekierował na integrację istniejących kanałów [D-44].

> **Bartek (1:25:13):** "żeby zamiast prowadzenia maili to prowadzenie takiego jakby mały Messenger. Aczkolwiek nie wiem czy to ma sens."
> **Paweł (1:28:46):** "Raczej [nie] osobnej komunikacji, bo zazwyczaj przez to się porozumiewacie z instytucją: mail plus telefon."

**Zastąpione przez:** integrację skrzynek pocztowych plus notatki z rozmów telefonicznych.
