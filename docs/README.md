# Dokumentacja projektu: System zarządzania dofinansowaniami KFS

Platforma łącząca firmę pozyskującą dofinansowania (LDIT), współpracujące instytucje szkoleniowe i klientów końcowych. Zastępuje pracę na Excelu, mailach i telefonie.

| | |
|---|---|
| **Klient** | Bartłomiej Olejnik, LDIT |
| **Wykonawca** | Paweł Czapiewski, Odczaruj Low Code |
| **Warsztat wymagań** | 25.08.2026, 3h22m |
| **Termin realizacji** | ok. 2 miesiące od warsztatu, gotowe przed styczniem 2027 |
| **Wycena wstępna** | 12-18 tys. PLN (niewiążąca, do potwierdzenia po makiecie) |
| **Status** | po warsztacie, przed makietą v2 i wyceną końcową |

---

## Jak czytać tę dokumentację

Dokumentacja jest podzielona na sekcje tematyczne. Każdy plik jest samodzielny, ale kolejność odzwierciedla drogę od "po co" do "jak".

### Fundament
| Plik | Zawartość |
|---|---|
| [01. Kontekst i cel](01-kontekst-i-cel.md) | Model biznesowy, problemy do rozwiązania, skala, granice systemu |
| [02. Aktorzy i uprawnienia](02-aktorzy-i-uprawnienia.md) | Role, konfigurator ról, macierz widoczności, separacja danych |
| [03. Model danych](03-model-danych.md) | Encje, relacje, pola wyliczane vs ręczne, wersjonowanie |
| [04. Proces i statusy](04-proces-i-statusy.md) | Ścieżka od leada do rozliczenia, statusy, kolory, wyzwalacze |

### Funkcjonalność
| Plik | Zawartość |
|---|---|
| [05. Moduły funkcjonalne](05-moduly-funkcjonalne.md) | Lista modułów z zakresem i priorytetem |
| [06. Model finansowy KFS](06-model-finansowy-kfs.md) | Kwoty, wkład własny, dopłaty, kwalifikacja uczestników |
| [07. Silnik prowizji](07-silnik-prowizji.md) | Najtrudniejszy element projektu. Progi, tryby, konfigurator |
| [08. Powiadomienia i automatyzacje](08-powiadomienia-i-automatyzacje.md) | Maile, szablony, certyfikaty, dane do faktury, paczka ZIP |

### Realizacja
| Plik | Zawartość |
|---|---|
| [09. Integracje i architektura](09-integracje-i-architektura.md) | Microsoft 365, formularze, import CSV, nabory, stos technologiczny |
| [10. Bezpieczeństwo i RODO](10-bezpieczenstwo-i-rodo.md) | Separacja, audyt, 2FA, retencja, obowiązki prawne |
| [11. UX i nawigacja](11-ux-i-nawigacja.md) | Układ "jak Excel", edycja inline, nazewnictwo, dashboard |
| [12. Zakres i etapowanie](12-zakres-i-etapowanie.md) | Co wchodzi, co wypada, kolejność prac, harmonogram |

### Rejestry
| Plik | Zawartość |
|---|---|
| [13. Rejestr decyzji](13-rejestr-decyzji.md) | Wszystkie decyzje z warsztatu z siłą i uzasadnieniem |
| [14. Pytania otwarte](14-pytania-otwarte.md) | Co wymaga domknięcia, kto odpowiada, co blokuje |
| [15. Ryzyka](15-ryzyka.md) | Rejestr ryzyk z oceną i mitygacją |
| [16. Słownik](16-slownik.md) | Pojęcia domenowe KFS i terminologia projektu |

### Warsztaty
| Plik | Zawartość |
|---|---|
| [17. Warsztat doprecyzowujący (2026-09-04)](17-warsztat-2026-09-04.md) | Drugi warsztat na makiecie v2: konflikty, nowe decyzje D-125 - D-147, proces Działu Dotacji, powrót modułu zadań |

---

## Źródła

Dokumentacja powstała z połączenia pięciu źródeł:

1. **Transkrypcja warsztatu** z 25.08.2026 (3h22m52s, ok. 206 tys. znaków). Podstawowe źródło decyzji.
2. **Dokumentacja wymagań przedwarsztatowa** (`00. Poczatkowe założenia/System_LDIT_dokumentacja_wymagan.pdf`, 15 stron, 20.08.2026). Hipotezy wykonawcy przed warsztatem.
3. **Spis funkcji od klienta** (`Warsztat LDIT - 20260825/Od Bartka - spis funkcji .docx`). Wymagania spisane przez Bartka własnymi słowami.
4. **Makieta klikalna v1** (`00. Poczatkowe założenia/System_LDIT_makieta.html`). Prototyp HTML z modelem danych. Wymaga przebudowy nawigacji (patrz [D-112](13-rejestr-decyzji.md)).
5. **Arkusz logiki prowizji** (`Prowizja liczenie.xlsx`). Realne warianty naliczania z umów.

Cytaty w dokumentacji pochodzą z automatycznej transkrypcji Teams i bywają zniekształcone. Zachowano je dosłownie, interpretację oznaczono nawiasami kwadratowymi. Znaczniki czasu odnoszą się do nagrania warsztatu.

---

## Konwencje

**Siła decyzji:**
- **TWARDA** - jednoznaczne ustalenie, można na nim budować
- **WSTĘPNA** - zgoda kierunkowa bez domknięcia szczegółów
- **ODRZUCONA** - świadomie wykluczone z zakresu
- **OTWARTA** - wymaga rozstrzygnięcia, patrz [pytania otwarte](14-pytania-otwarte.md)

**Kto zdecydował:**
- **[K]** klient (Bartek) - potrzeba biznesowa
- **[W]** wykonawca (Paweł) - propozycja rozwiązania

**Priorytet wymagań:** MUST / SHOULD / COULD / WON'T (etap I)
