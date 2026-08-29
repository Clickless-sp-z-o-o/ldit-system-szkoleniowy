# 04. Proces i statusy

## Przebieg procesu end-to-end

```
1. POZYSKANIE           handlowiec IS pozyskuje klienta końcowego
                        wysyła link do formularza zgłoszeniowego
                                    |
2. FORMULARZ            klient końcowy wypełnia formularz online
                        system rejestruje datę wpłynięcia automatycznie
                                    |
3. AKCEPTACJA           Bartek klika "Akceptuj", rekord wchodzi do bazy
                        (bramka anty-spamowa)
                                    |
                        >>> ROLA HANDLOWCA IS SIĘ KOŃCZY <<<
                                    |
4. OCZEKIWANIE          klient trafia do bazy "Niezłożone"
   NA NABÓR             system wiąże go z naborem właściwego PUP
                        (aktualnym lub prognozowanym)
                                    |
5. PRZYGOTOWANIE        rejestracja klienta w BUR
   WNIOSKU              przygotowanie wniosku, ustalenie szkoleń i kwot
                                    |
6. ZŁOŻENIE             wniosek złożony w PUP
                                    |
7. DECYZJA              urząd wydaje decyzję pozytywną lub negatywną
                        urząd może obciąć kwotę lub liczbę osób
                                    |
8. USTALENIE            termin szkolenia ustalony (model A lub B)
   TERMINU              ewentualne pismo do PUP o zmianie terminu
                                    |
9. REALIZACJA           szkolenie się odbywa
                                    |
10. ROZLICZENIE         IS wystawia fakturę
                        system generuje certyfikaty (paczka ZIP)
                        LDIT wysyła klientowi paczkę rozliczeniową
                        LDIT wystawia fakturę prowizyjną instytucji
```

---

## Statusy

W obecnym Excelu funkcjonują **dwa niezależne statusy** na jednym wierszu. Warsztat potwierdził ich istnienie, ale nie ustalił, czy w systemie zostaną dwa pola, czy jeden łańcuch.

### Status składania (dziś: "status lewy")

| Status | Znaczenie |
|---|---|
| `Niezłożony` | Klient w bazie, wniosek jeszcze nie poszedł |
| `NW` | Umówione z klientem, że piszemy wniosek, ale sprawa stoi |
| `Złożony` | Wniosek trafił do urzędu |
| `Rezygnacja` | Klient zrezygnował przed złożeniem |

> **Bartek (1:43:10):** o statusie NW: "w momencie jak już [umówiliśmy się z] klientem, że piszemy wniosek, ale na razie się nic nie dzieje (...) nie wiem od czego to jest skrót, kiedyś wymyśliłem i tak zostało."

**`NW` to nazwa do zmiany** [P-11]. Rozwinięcie skrótu zostało zapomniane przez samego klienta.

### Status decyzji (dziś: "status prawy")

| Status | Kolor wiersza | Znaczenie |
|---|---|---|
| `Pozytywna` | **zielony** | Dofinansowanie przyznane |
| `Negatywna` | **czerwony jasny** | Odmowa (często brak środków w urzędzie) |
| `Rezygnacja po napisaniu` | brak | Klient zrezygnował po przygotowaniu wniosku |

### Status finansowy

| Status | Kolor wiersza |
|---|---|
| `Oczekuje` | brak |
| `Zafakturowany` | brak |
| `Rozliczone` | **fioletowy** |

---

## Kolorowanie wierszy [D-01, TWARDA]

Kolory z Excela przechodzą do systemu bez zmian. Kolor obejmuje **cały wiersz** i zmienia się **automatycznie** przy zmianie statusu.

| Kolor | Status |
|---|---|
| Czerwony jasny | Decyzja negatywna |
| Zielony | Decyzja pozytywna |
| Fioletowy | Rozliczone kompletnie |
| Zielony (osobny kontekst) | Klient z aktywnym naborem w widoku "Niezłożone" |

> **Bartek (0:14):** "w przypadku negatywnej odpowiedzi używamy po całym wierszu koloru czerwonego, takiego jasnego, w przypadku pozytywnej używamy zielonego, w przypadku już rozliczenia kompletnego całego projektu używamy fioletowego koloru, więc żebyśmy te kolory też utrzymali. Czyli jeżeli zmienimy status wniosku z pozytywnej na rozliczony, żeby kolor się po całej długości ustawił."

**Uwaga dostępnościowa:** kolor jest dodatkiem do statusu tekstowego, nie jego zamiennikiem. Nazwane statusy muszą być widoczne obok kolorów.

---

## Wyzwalacze powiadomień

Powiadomienia mailowe wyzwalane zmianą statusu lub datą. Szczegóły w [08. Powiadomienia i automatyzacje](08-powiadomienia-i-automatyzacje.md).

| Wyzwalacz | Powiadomienie | Odbiorca | Tryb |
|---|---|---|---|
| Status = Pozytywna decyzja | Prośba o ustalenie terminu | Instytucja (osoba od terminów) | Automatyczny |
| IS wpisała termin | Termin ustalony, zgłoś do urzędu | LDIT | Automatyczny |
| Ręcznie, przyciskiem | Wniosek w trakcie przygotowania | Klient końcowy | Ręczny |
| Ręcznie, przy wniosku | Dane do faktury | Instytucja | Ręczny [D-104] |
| IS oznaczyła fakturę wystawioną | Alert o fakturze | Osoba odpowiedzialna za faktury | Automatyczny |
| Zbliżający się termin (8 dni) | Sprawdzenie kompletu dokumentów | LDIT | Automatyczny |
| Dzień lub dwa przed terminem | Szczegóły organizacyjne | Uczestnicy terminu | Automatyczny |
| Ręcznie, przyciskiem | Instrukcja zakładania konta praca.gov.pl | Klient końcowy | Ręczny [D-106] |
| Ręcznie, przyciskiem | Prośba o opinię w Google | Klient końcowy | Ręczny, do dosłania |

**Kanał: wyłącznie e-mail.** SMS odrzucony w etapie I [D-04].

**Alerty konfigurowalne** [D-89]: obok automatyzacji systemowych administrator i pracownicy mogą ustawić alert ręcznie na wybraną datę (np. "7 dni przed szkoleniem sprawdź harmonogram"). Cztery alerty rozpisane przez klienta są wypisane w [08. Powiadomienia](08-powiadomienia-i-automatyzacje.md#cztery-alerty-rozpisane-przez-klienta).

---

## Widok "Niezłożone" jako baza klientów [D-43, TWARDA]

Nazwa myląca, do zmiany. To jest **baza wszystkich klientów**, niezależnie od tego, czy wniosek już poszedł.

> **Bartek (2:46:58):** "teraz co tu: klienci, którzy już byli złożeni, plus 5, którzy oczekują na nabór. Czasami [klient] idzie 3 razy w roku na inne szkolenie, 3 razy wnioskuje do urzędu. Inaczej bym to nazwał: baza klientów."

### Wymagane zachowanie

1. **Powiązanie z modułem naborów**, w tym naborami prognozowanymi. Dziś Bartek ręcznie wpisuje daty naboru i zaznacza rekordy na zielono.
2. **Wizualne wyróżnienie** klienta, u którego ruszył lub zaraz ruszy nabór.
3. **Sortowanie po dacie zakończenia naboru rosnąco** (najpilniejsze na górze).
4. **Widok zestawienia, nie alerty.** Wykonawca wprost odróżnił: "dostawać może nie alerty, ale jeden taki widok z zestawienia."

> **Bartek (2:48:57):** "żeby to było posortowane: najszybciej się kończy do najpóźniej się kończy ten nabór."

### Kto tego nie widzi

Handlowiec IS **nie** dostaje tej informacji [D-91, propozycja wykonawcy odrzucona].

> **Bartek (2:49:28):** "my się kontaktujemy z klientem, nie handlowiec. Jak już dostaniemy formularz, to wszystkie operacje są już po naszej stronie, więc to jest zbędna informacja do handlowca."

---

## Masowa aktualizacja statusów

Realny scenariusz pracy: urząd ogłasza wyniki, LDIT filtruje wnioski po PUP i masowo zmienia statusy.

**Wymaganie:** filtr po urzędzie pracy na zakładce wniosków + oznaczanie wyników kolorami (zielony pozytywny, czerwony negatywny) w widoku przefiltrowanym [D-110].

Przykład podany na warsztacie: "wszystkie wnioski na Warszawę".

---

## Rejestracja dat

Trzy daty są krytyczne i mają różne role:

| Data | Rejestracja | Rola |
|---|---|---|
| **Data wpłynięcia formularza** | Automatyczna [D-94] | Dowód, kiedy dokumenty dotarły. Obrona przed pretensjami |
| **Data aktualizacji rekordu** | Automatyczna | Ślad zmian |
| **Data wystawienia faktury** | Domyślnie ostatni dzień szkolenia, edytowalna [D-13] | **Wyznacza okres rozliczeniowy prowizji** |

Uzasadnienie automatycznej rejestracji daty formularza:

> **Bartek (2:52:40):** "mieliśmy sytuację, gdzie kończył się nabór 5 kwietnia, dostaliśmy formularz też 5 kwietnia i były do nas pretensje, czemu nie zrobiliśmy wniosku. Musiałem prześledzić maila, kiedy dostaliśmy formularz od tego handlowca, żeby przekazać instytucji szkoleniowej, że handlowiec nawalił, przesłał w ostatni dzień terminu naboru."

Uzasadnienie rozdzielenia daty faktury od daty szkolenia:

> **Bartek (26:22):** "chcieli od niego faktury [wcześniej]. Więc ten przychód liczy się nie do grudnia, tylko do sierpnia."
