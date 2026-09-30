/* ============================================================================
   Punkty decyzyjne projektu KFS/LDIT.

   STAN NA 2026-09-29: punkty z rundy D-161 - D-206 sa rozstrzygniete, a nowe pytania
   Z-01 do Z-38 (obszar "Mapa zakladek", docs/19-mapa-zakladek.md) czekaja na klienta.
   Stan sprzed dopisania Z-xx: panel byl pusty. Wszystkie 38 punktow zostalo rozstrzygnietych
   w rundzie decyzji z 29.09.2026 (decyzje D-161 - D-206 w docs/13-rejestr-decyzji.md).
   window.DECYZJE zawiera wylacznie punkty NIEROZSTRZYGNIETE, wiec zawiera teraz tylko Z-xx
   i panel pokazuje 38 otwartych. Nowe pytanie dopisuje sie do window.DECYZJE, a po
   rozstrzygnieciu przenosi do rejestru decyzji jako D-xx i usuwa z tej listy.

   Tresc wariantow, skutkow i kosztow rozstrzygnietych punktow zachowano ponizej jako
   window.DECYZJE_ARCHIWUM (panel jej nie czyta). Mapa punkt -> decyzja:
   P-04 D-161, P-02 D-162, P-09 D-163, P-01 D-164, P-53 D-172, P-14 D-173, P-05 D-174,
   D-143 D-176, P-25 D-177, P-21 D-178, P-59 D-179, P-61 D-180, P-39 D-181, P-63 D-182,
   P-18 D-183, P-51 D-184, P-57 D-185, P-26 D-186, P-24 D-187, P-23 D-188, P-54 D-189,
   P-32 D-190, P-13 D-191, P-33 D-192, P-12 D-193, P-08 D-194, P-55 D-195, P-17 D-196,
   P-46 D-197, P-20 D-198, P-19 D-199, P-40 D-200, P-27 D-201, P-42 D-202, P-52 D-203,
   P-45 D-204, P-11 D-205, P-43 D-206.
   Uwaga: wybory P-04 i P-02 zostaly tego samego dnia skorygowane przez wykonawce
   (faktura korygujaca do nowego okresu, progi nie przeliczaja sie wstecz), wiec
   archiwum dla tych dwoch punktow pokazuje stan sprzed korekty.

   Typy skutkow w archiwum:
     zysk    co ten wariant daje
     koszt   czym za to placimy
     wymusza co trzeba zrobic dodatkowo, jesli ten wariant wygra
     ryzyko  co moze pojsc nie tak

   Dane sa tylko danymi. Logika panelu siedzi w sekcje/17-panel-decyzji.html.
   ============================================================================ */

/* Punkty nierozstrzygniete: 38 pytan o mape zakladek (Z-01 do Z-38), zrodlo docs/19-mapa-zakladek.md. Wszystkie odpowiada klient. */
window.DECYZJE = [

  /* ====================== MAPA ZAKLADEK: DASHBOARD ====================== */

  {
    id: "Z-01",
    obszar: "Mapa zakładek",
    waga: "srednia",
    kto: "klient",
    blokuje: "screen Dashboard/Przegląd",
    pytanie: "Co zostaje z sekcji „Wymaga działania” na dashboardzie",
    kontekst: "Dashboard zawiera tabelę pięciu kolejek: formularze do akceptacji, nabory kończące się w tygodniu, szkolenia w ciągu 8 dni, faktury po terminie, projekty pozytywne nierozliczone. W kolumnie Kontekst są wypisane nazwy urzędów. Klient chciał samych statystyk [D-114], a ta sekcja jest listą spraw i dubluje moduł Zadania i powiadomienia [D-140]. Rekomendacja wykonawcy: wariant B, liczniki zostają jako skrót, a lista spraw żyje w Zadaniach.",
    opcje: [
      {
        id: "a",
        label: "Zostaje jak dziś: tabela z kontekstem (nazwy urzędów, terminy)",
        skutki: [
          { typ: "zysk", t: "Jedno miejsce na start dnia, wszystko widać bez klikania" },
          { typ: "ryzyko", t: "Lista spraw na dashboardzie kłóci się z [D-114] i z modułem Zadań [D-140]" }
        ]
      },
      {
        id: "b",
        label: "Zostaje pięć liczników, każdy klikalny (bez nazw urzędów i kontekstu), klik prowadzi do listy z filtrem",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Jest statystyka i szybki dostęp, ale bez rozpiski" },
          { typ: "koszt", t: "Znika informacja, który urząd kończy nabór, trzeba ją sprawdzić na liście" },
          { typ: "wymusza", t: "Licznik formularzy do akceptacji pokazany także jako dzwonek w pasku górnym [D-105]" }
        ]
      },
      {
        id: "c",
        label: "Sekcja przenosi się w całości do Zadań i powiadomień, dashboard jest czysto statystyczny",
        skutki: [
          { typ: "zysk", t: "Dashboard w pełni jak portfel kryptowalut (analogia klienta), bez żadnych spraw do zrobienia" },
          { typ: "koszt", t: "Pierwszy ekran po zalogowaniu nie mówi, co jest pilne" },
          { typ: "wymusza", t: "Zadanie automatyczne dla każdej z pięciu kolejek [D-185]" }
        ]
      }
    ]
  },

  {
    id: "Z-02",
    obszar: "Mapa zakładek",
    waga: "srednia",
    kto: "klient",
    blokuje: "screeny Dashboard/Skuteczność, Administracja/Statystyki",
    pytanie: "Statystyki są w czterech miejscach. Jaki podział przyjmujemy",
    kontekst: "Skuteczność, liczbę złożonych i pozytywnych wniosków oraz przyznane kwoty pokazują: Dashboard/Przegląd, Dashboard/Skuteczność i lejki, Administracja/Statystyki (z przychodem i VAT) oraz panel instytucji. Każde miejsce liczy definicję osobno. Decyzja [D-141] mówi, że statystyki per instytucja są w Administracji, a [D-114], że dashboard jest czysto statystyczny. Rekomendacja wykonawcy: wariant A, dwa miejsca, ale o rozłącznych rolach i połączone linkami.",
    opcje: [
      {
        id: "a",
        label: "Podział wg rodzaju: Dashboard to statystyki ilościowe i lejki (filtr instytucji), Administracja/Statystyki to kwotowe (obrót, przychód LDIT, VAT); linki „Zobacz kwoty” i „Zobacz skuteczność” między nimi",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Zgodne z [D-114] i [D-141], niewiele zmian w makiecie" },
          { typ: "wymusza", t: "Jedna definicja każdej liczby i linki między dwiema stronami" },
          { typ: "koszt", t: "Nadal dwa miejsca ze statystykami" }
        ]
      },
      {
        id: "b",
        label: "Jedno miejsce: Dashboard/Skuteczność (dla admina także z kwotami), zakładka Statystyki w Administracji znika",
        skutki: [
          { typ: "zysk", t: "Jedna zakładka mniej i jedna prawda o liczbach" },
          { typ: "ryzyko", t: "Odwraca [D-141], statystyki miały być w Administracji" },
          { typ: "koszt", t: "Dashboard admina robi się gęstszy, a klient prosił o prostotę" }
        ]
      },
      {
        id: "c",
        label: "Wszystkie statystyki w Administracji, dashboard tylko kafelki",
        skutki: [
          { typ: "zysk", t: "Dashboard najprostszy z możliwych" },
          { typ: "koszt", t: "Pracownik nie widzi statystyk, bo Administracja jest tylko dla admina [D-34]" },
          { typ: "wymusza", t: "Osobny widok statystyk dla pracownika poza Administracją [D-30]" }
        ]
      }
    ]
  },

  {
    id: "Z-03",
    obszar: "Mapa zakładek",
    waga: "srednia",
    kto: "klient",
    blokuje: "screeny Dashboard i Administracja/Prowizje wewnętrzne",
    pytanie: "Gdzie są Cele i premie i kto je widzi",
    kontekst: "Dokumentacja opisuje cele zespołu i postęp ich realizacji jako część dashboardu oraz cele widoczne dla pracowników [D-23]. W makiecie Cele i premie są na dole zakładki Prowizje wewnętrzne w Administracji, więc widzi je tylko administrator, a dashboard pracownika ich nie ma. Rekomendacja wykonawcy: wariant A, kafelek na dashboardzie, edycja w Administracji.",
    opcje: [
      {
        id: "a",
        label: "Kafelek postępu celu na dashboardzie (admin i pracownik), edycja celów i premii w Administracji",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Pracownik widzi cel i swój postęp, zgodnie z [D-23]" },
          { typ: "wymusza", t: "Kafelek celu bez kwot premii dla pracownika [D-34]" },
          { typ: "koszt", t: "Cel liczony w dwóch miejscach, trzeba jedno źródło" }
        ]
      },
      {
        id: "b",
        label: "Tylko w Administracji (jak dziś)",
        skutki: [
          { typ: "zysk", t: "Bez zmian, kwoty premii pod kontrolą admina" },
          { typ: "ryzyko", t: "Cele nie motywują, jeśli zespół ich nie widzi, a [D-23] zakładał widoczność" }
        ]
      },
      {
        id: "c",
        label: "Osobna zakładka „Cele” w module Zadania",
        skutki: [
          { typ: "zysk", t: "Cele obok planu dnia, blisko codziennej pracy" },
          { typ: "koszt", t: "Nowa zakładka i nowy zakres widoczności, cele nie są zadaniami" }
        ]
      }
    ]
  },

  /* ============ MAPA ZAKLADEK: DOFINANSOWANIA, BAZA KLIENTOW, WNIOSKI ============ */

  {
    id: "Z-04",
    obszar: "Mapa zakładek",
    waga: "wysoka",
    kto: "klient",
    blokuje: "mapa menu, screeny Dofinansowań",
    pytanie: "Jak nazywa się i jak jest ułożone menu dla Dofinansowań i Zestawień",
    kontekst: "Dokumentacja (docs/11) ma dwie pozycje menu: Dofinansowania (rozwija instytucje) i Zestawienia (drzewo lat). Makieta scala je w jedną pozycję „Dofinansowania”, a lata są paskami nad tabelą. Ten sam ekran nazywa się w makiecie czterema sposobami: „Dofinansowania” w menu, „Zestawienie 2026” w tytule, „Wnioski” na zakładce i „Projekty” na pasku ekranu Terminów. Klient żąda zachowania nazw z Excela [D-55]. Rekomendacja wykonawcy: wariant A, z jednoznaczną nazwą „Wnioski” na zakładce i „Zestawienie [rok]” w tytule wszędzie.",
    opcje: [
      {
        id: "a",
        label: "Jedna pozycja „Dofinansowania” (rozwija: Wszystkie instytucje i lista instytucji), w środku zakładki Wnioski, Baza klientów, Terminy szkoleń; lata jako arkusze nad tabelą; tytuł „Zestawienie 2026”",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Najmniej pozycji w menu, całe miejsce pracy operacyjnej w jednym" },
          { typ: "koszt", t: "Nazwa „Zestawienia” znika z menu i zostaje w tytule i na paskach lat" }
        ]
      },
      {
        id: "b",
        label: "Dwie pozycje jak w docs/11: Dofinansowania (lista instytucji) i Zestawienia (2025 / 2026 / 2027)",
        skutki: [
          { typ: "zysk", t: "Dokładnie jak w słowach klienta i w Excelu" },
          { typ: "koszt", t: "Pozycji o jedną więcej, a instytucja i rok to dwa niezależne wybory do połączenia" },
          { typ: "ryzyko", t: "Niejasne, czym różni się „Zestawienia” od „Dofinansowań”, skoro to ta sama tabela z innym filtrem" }
        ]
      },
      {
        id: "c",
        label: "Jedna pozycja „Zestawienia” (lata), instytucja tylko jako filtr w tabeli, bez listy w menu",
        skutki: [
          { typ: "zysk", t: "Bardzo proste menu" },
          { typ: "ryzyko", t: "Odwraca [D-112] i [D-127], klient chciał listy instytucji w menu" }
        ]
      }
    ]
  },

  {
    id: "Z-05",
    obszar: "Mapa zakładek",
    waga: "niska",
    kto: "klient",
    blokuje: "menu administratora",
    pytanie: "Lista instytucji w menu przy ok. 20 instytucjach",
    kontekst: "Pod „Dofinansowaniami” menu pokazuje „Wszystkie instytucje” i jedną pozycję na każdą instytucję z konta [D-127]. Pracownik ma od 1 do 3 instytucji [D-113], administrator ok. 20 (tyle kopii formularza [D-70]), więc lista administratora ma ponad 20 pozycji w lewym menu i wypycha pozostałe pozycje poza ekran. Rekomendacja wykonawcy: wariant B.",
    opcje: [
      {
        id: "a",
        label: "Wszystkie instytucje jako pozycje menu, menu przewijane",
        skutki: [
          { typ: "zysk", t: "Dokładnie jak ustalono [D-127]" },
          { typ: "koszt", t: "Administrator przewija długą listę, a kolejne pozycje menu uciekają poza ekran" }
        ]
      },
      {
        id: "b",
        label: "Lista z polem szukania, przy więcej niż ośmiu pozycjach zwinięta do „ostatnio używane” plus „Wszystkie instytucje”",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Krótkie menu, nadal zgodne z [D-127]" },
          { typ: "koszt", t: "Prosty mechanizm „ostatnio używane” do zbudowania" }
        ]
      },
      {
        id: "c",
        label: "Lista w menu tylko dla pracownika, administrator używa filtra Instytucja w tabeli",
        skutki: [
          { typ: "zysk", t: "Krótkie menu administratora" },
          { typ: "ryzyko", t: "Dwa różne menu dla dwóch ról, odstępstwo od [D-112]" }
        ]
      }
    ]
  },

  {
    id: "Z-06",
    obszar: "Mapa zakładek",
    waga: "wysoka",
    kto: "klient",
    blokuje: "nazwy w menu i na wszystkich screenach",
    pytanie: "Co oznacza nazwa „Nabory”",
    kontekst: "Słownik i docs/11 mówią: „Wnioski” to „Nabory” (główne okno robocze), czyli lista wniosków w Excelu klienta. Jednocześnie [D-109] wprowadza moduł z naborami urzędów pracy z aplikacji prognozującej. Makieta nazwała „Nabory” listę urzędów, a listę wniosków „Wnioski”, co łamie zapis słownika [D-55]. Rekomendacja wykonawcy: wariant A, o ile klient potwierdzi, że w zespole „nabór” oznacza okno urzędu, a nie wniosek.",
    opcje: [
      {
        id: "a",
        label: "„Nabory” zostają listą naborów urzędów pracy (jak makieta), lista wniosków to „Wnioski” i „Zestawienie [rok]”; poprawiamy słownik",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Nazwa odpowiada temu, co ekran robi, nie ma pomyłek nabór/wniosek" },
          { typ: "wymusza", t: "Klient potwierdza, że zespół nie nazywa wniosków „naborami”; poprawka słownika i docs/11" }
        ]
      },
      {
        id: "b",
        label: "„Nabory” to lista wniosków (jak w Excelu), lista urzędów dostaje nową nazwę (np. „Kalendarz naborów” albo „Urzędy”)",
        skutki: [
          { typ: "zysk", t: "Zgodne ze słowami klienta z Excela [D-55]" },
          { typ: "koszt", t: "Trzeba zmienić nazwę modułu z [D-109] i wszystkich ekranów makiety" },
          { typ: "ryzyko", t: "Nabór (okno urzędu) i wniosek to różne rzeczy, nazwa myli nowych pracowników" }
        ]
      },
      {
        id: "c",
        label: "Obie nazwy współistnieją: „Nabory” (urzędy) w menu i „Wnioski” na zakładce, w słowniku opis różnicy",
        skutki: [
          { typ: "zysk", t: "Nic nie zmieniamy w makiecie" },
          { typ: "ryzyko", t: "Rozjazd, który wykonawca zgłaszał już na warsztacie („mieszają mi się nazwy”)" }
        ]
      }
    ]
  },

  {
    id: "Z-07",
    obszar: "Mapa zakładek",
    waga: "srednia",
    kto: "klient",
    blokuje: "etykieta zakładki",
    pytanie: "Nazwa zakładki z klientami: „Baza klientów” czy „Baza danych”",
    kontekst: "Słownik i docs/11 używają nazwy „Baza klientów” (w Excelu „Niezłożone”), a decyzja [D-128] i makieta „Baza danych”. Ta sama zakładka ma w dokumentacji dwie nazwy. Rekomendacja wykonawcy: wariant A.",
    opcje: [
      {
        id: "a",
        label: "„Baza klientów”",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Nazwa mówi, co jest w środku, słownik bez zmian" },
          { typ: "koszt", t: "Zmiana etykiety w makiecie i w opisie [D-128]" }
        ]
      },
      {
        id: "b",
        label: "„Baza danych”",
        skutki: [
          { typ: "zysk", t: "Zgodne z [D-128] i ostatnim słowem klienta z 04.09" },
          { typ: "ryzyko", t: "Nazwa techniczna, nie mówi, czy to klienci, czy wnioski" }
        ]
      },
      {
        id: "c",
        label: "Inna nazwa podana przez klienta (np. z jego Excela)",
        skutki: [
          { typ: "zysk", t: "Zgodność z przyzwyczajeniami zespołu [D-55]" },
          { typ: "koszt", t: "Wymaga ustalenia i zmiany słownika" }
        ]
      }
    ]
  },

  {
    id: "Z-08",
    obszar: "Mapa zakładek",
    waga: "srednia",
    kto: "klient",
    blokuje: "zakładki lat na ekranie Wnioski",
    pytanie: "Lata jako zakładki: czy potrzebny jest też widok „Wszystkie lata”",
    kontekst: "Każdy rok to osobna zakładka jak arkusz Excela [D-129, D-159]: 2025 (pusta), 2026, 2027, plus „Nieprzypisane” (wnioski bez roku) i przycisk +. Numeracja klientów jest ciągła w roku i trafia na fakturę [D-112]. Wyszukiwarka i drill through z dashboardu (np. „wszystkie decyzje pozytywne”) nie mają jednego roku. Rekomendacja wykonawcy: wariant A, a globalna wyszukiwarka przeszukuje wszystkie lata.",
    opcje: [
      {
        id: "a",
        label: "Same zakładki lat jak dziś; drill through i wyszukiwarka otwierają zakładkę właściwego roku",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Numeracja zawsze jednoznaczna, jak w Excelu" },
          { typ: "koszt", t: "Filtr obejmujący dwa lata wymaga dwóch kliknięć" }
        ]
      },
      {
        id: "b",
        label: "Zakładki lat plus zakładka „Wszystkie lata” tylko do odczytu, z kolumną Rok",
        skutki: [
          { typ: "zysk", t: "Jedna lista do szukania klienta wstecz i do porównań" },
          { typ: "koszt", t: "Kolejna zakładka, a numery klientów powtarzają się między latami" }
        ]
      },
      {
        id: "c",
        label: "Selektor roku (lista rozwijana) zamiast zakładek",
        skutki: [
          { typ: "zysk", t: "Skalowalne na kolejne lata" },
          { typ: "ryzyko", t: "Odstępstwo od „arkuszy” Excela [D-129], zespół widzi rok jako zakładkę" }
        ]
      }
    ]
  },

  {
    id: "Z-09",
    obszar: "Mapa zakładek",
    waga: "wysoka",
    kto: "klient",
    blokuje: "screeny Bazy klientów, karty klienta, mapa linków",
    pytanie: "Czy klient ma własną kartę (osobny ekran)",
    kontekst: "Dokumentacja mówi o „karcie klienta” z korespondencją [D-52] i danymi stałymi [D-54], ale makieta jej nie ma: przycisk Edytuj w Bazie otwiera formularz, a korespondencja jest tylko na karcie wniosku. Przy ok. 400 mailach na klienta i wielu wnioskach potrzeba miejsca, do którego prowadzą nazwa klienta na każdej liście i wynik wyszukiwania. Rekomendacja wykonawcy: wariant A.",
    opcje: [
      {
        id: "a",
        label: "Tak, ekran „Klient” z trzema zakładkami: Dane i kontakty, Projekty, Korespondencja i notatki",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Jedno miejsce na historię klienta i cel każdego linku z nazwy klienta" },
          { typ: "koszt", t: "Nowy ekran do zaprojektowania i utrzymania" },
          { typ: "wymusza", t: "Korespondencja przypisana do klienta po adresie e-mail [D-178]" }
        ]
      },
      {
        id: "b",
        label: "Nie, klient to rozwinięty wiersz w Bazie, korespondencja tylko na karcie wniosku",
        skutki: [
          { typ: "zysk", t: "Zero nowych ekranów" },
          { typ: "ryzyko", t: "Mail niedopasowany do wniosku nie ma gdzie leżeć, a 400 maili nie zmieści się w rozwinięciu wiersza" }
        ]
      },
      {
        id: "c",
        label: "Panel boczny wysuwany z listy z danymi klienta, skrótem projektów i maili",
        skutki: [
          { typ: "zysk", t: "Nie opuszcza się listy, dobre przy pracy seryjnej" },
          { typ: "koszt", t: "Trzeci sposób pokazywania rekordu obok listy i karty" }
        ]
      }
    ]
  },

  {
    id: "Z-10",
    obszar: "Mapa zakładek",
    waga: "srednia",
    kto: "klient",
    blokuje: "filtry listy Wnioski, kolumna daty złożenia",
    pytanie: "Jakie filtry musi mieć lista Wnioski",
    kontekst: "Filtry dziś: instytucja, urząd, status i wyszukiwanie tekstowe. Drill through z dashboardu i statystyk potrzebuje też: roku, rozliczenia, szkolenia, miesiąca złożenia, wielkości firmy, klienta, numeru faktury i opiekuna. Scenariusz z warsztatu: filtr po PUP i masowa zmiana statusów po ogłoszeniu wyników [D-110]. Rekomendacja wykonawcy: wariant A, zapisywane widoki jako ewentualne rozszerzenie później.",
    opcje: [
      {
        id: "a",
        label: "Zestaw rozszerzony: rok, instytucja, urząd, status, rozliczenie, szkolenie, miesiąc złożenia, wielkość, klient, opiekun; aktywne filtry widoczne jako chipy z krzyżykiem",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Każda liczba z dashboardu ma swoją listę" },
          { typ: "koszt", t: "Więcej pól w pasku filtrów, trzeba dbać o czytelność (chipy, zwijany pasek)" },
          { typ: "wymusza", t: "Kolumna daty złożenia wniosku, której dziś lista nie ma" }
        ]
      },
      {
        id: "b",
        label: "Minimalny zestaw (instytucja, urząd, status) plus wyszukiwarka",
        skutki: [
          { typ: "zysk", t: "Prosty pasek, jak dziś" },
          { typ: "ryzyko", t: "Część wykresów (miesiąc, wielkość, szkolenie) nie ma dokąd prowadzić" }
        ]
      },
      {
        id: "c",
        label: "Zestaw rozszerzony plus zapisywane widoki (np. „Warszawa, czekamy”)",
        skutki: [
          { typ: "zysk", t: "Powtarzalna praca po ogłoszeniu wyników jednym kliknięciem" },
          { typ: "koszt", t: "Dodatkowa funkcja poza dotychczasowym zakresem" }
        ]
      }
    ]
  },

  /* ====================== MAPA ZAKLADEK: KARTA WNIOSKU ====================== */

  {
    id: "Z-11",
    obszar: "Mapa zakładek",
    waga: "wysoka",
    kto: "klient",
    blokuje: "screeny karty wniosku",
    pytanie: "Karta wniosku: jedna długa strona czy zakładki",
    kontekst: "Karta ma dziś jedną stronę i siedem bloków naraz: model finansowy (dziewięć pól), uczestnicy (do 50), korespondencja, dane projektu, osoby kontaktowe, prowizja (admin), przebieg. Klient krytykował Excel za nadmiar informacji jednocześnie (docs/11). Przy 130 wnioskach w dwa tygodnie karta jest najczęściej otwieranym ekranem. Rekomendacja wykonawcy: wariant B.",
    cytat: { tresc: "za ciężko się skupić mi na czymś konkretnym, z bardzo dużo tych informacji jednocześnie wyskakuje", kto: "Bartek, warsztat 25.08.2026, 1:32:18" },
    opcje: [
      {
        id: "a",
        label: "Jedna strona jak dziś",
        skutki: [
          { typ: "zysk", t: "Wszystko widać bez klikania" },
          { typ: "ryzyko", t: "To wada Excela, na którą skarży się klient" }
        ]
      },
      {
        id: "b",
        label: "Stały nagłówek (klient, status, kluczowe kwoty, przyciski Poprzedni i Następny) i cztery zakładki: Finanse i dane, Uczestnicy, Korespondencja i notatki, Przebieg i zadania",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Skupienie na jednej rzeczy, nagłówek zawsze pod ręką" },
          { typ: "koszt", t: "Więcej kliknięć do uczestników i maili" },
          { typ: "wymusza", t: "Prowizja LDIT (tylko admin) jako sekcja zakładki Finanse i dane" }
        ]
      },
      {
        id: "c",
        label: "Jedna strona z sekcjami zwijanymi (akordeon)",
        skutki: [
          { typ: "zysk", t: "Bez zakładek, użytkownik sam zwija zbędne" },
          { typ: "ryzyko", t: "Stan zwinięcia trzeba pamiętać, a strona bywa bardzo długa" }
        ]
      }
    ]
  },

  /* ================== MAPA ZAKLADEK: INSTYTUCJE I KATALOG ================== */

  {
    id: "Z-12",
    obszar: "Mapa zakładek",
    waga: "wysoka",
    kto: "klient",
    blokuje: "screeny Instytucji i Konfiguratora",
    pytanie: "Struktura modułu Instytucje szkoleniowe",
    kontekst: "Moduł ma dziś dwa paski (Przegląd instytucji, Konfigurator warunków) oraz zakładki wewnętrzne: karta instytucji (Dane firmy, Katalog szkoleń, Szkoleniowcy, Osoby i konta, Korespondencja) i konfigurator (Warunki prowizyjne, Wzór certyfikatu, Dane do faktury, Formularz zgłoszeniowy). To dziewięć zakładek w jednym module, w tym cztery tylko dla administratora [D-07]. Rekomendacja wykonawcy: wariant B.",
    opcje: [
      {
        id: "a",
        label: "Jak dziś: dwa paski oraz 5 + 4 zakładek wewnętrznych",
        skutki: [
          { typ: "zysk", t: "Bez zmian w makiecie" },
          { typ: "ryzyko", t: "Dziewięć miejsc do przejścia, „wszystko naraz” w formie zakładek" }
        ]
      },
      {
        id: "b",
        label: "Lista instytucji (tabela jak w Excelu) i karta instytucji z czterema zakładkami: Dane i osoby, Katalog i szkoleniowcy, Korespondencja, Warunki (tylko admin: prowizja, certyfikat, faktura, formularz jako sekcje)",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Cztery zakładki zamiast dziewięciu, warunki admina nie zaśmiecają widoku pracownika" },
          { typ: "koszt", t: "Zakładka Warunki jest długa i wymaga porządnych nagłówków sekcji" }
        ]
      },
      {
        id: "c",
        label: "Instytucje (Dane, Katalog, Zespół) w menu, a konfiguracja (warunki, certyfikat, faktura, formularz) w Ustawieniach",
        skutki: [
          { typ: "zysk", t: "Instytucje dla wszystkich ról, konfiguracja w miejscu admina" },
          { typ: "ryzyko", t: "Warunki prowizyjne oddalone od instytucji, admin skacze między modułami" }
        ]
      }
    ]
  },

  /* ========================= MAPA ZAKLADEK: TERMINY ========================= */

  {
    id: "Z-13",
    obszar: "Mapa zakładek",
    waga: "srednia",
    kto: "klient",
    blokuje: "mapa menu, uprawnienia do Terminów",
    pytanie: "Gdzie w menu są Terminy szkoleń i kto je widzi",
    kontekst: "Terminy są w trzech miejscach: pozycja menu (widzą ją administrator i instytucja, nie pracownik LDIT), zakładka „Terminy szkoleń” pod Dofinansowaniami (widoczna dla pracownika, ale moduł Terminy nie jest mu przypisany w macierzy uprawnień) i przycisk w panelu instytucji. Pasek na ekranie Terminów nazywa te same ekrany inaczej („Projekty”, „Oczekujące na nabór”). Rekomendacja wykonawcy: wariant A.",
    opcje: [
      {
        id: "a",
        label: "Zakładka „Terminy szkoleń” w Dofinansowaniach dla ról LDIT (pracownik z uprawnieniem) i osobna pozycja menu tylko dla instytucji; to ten sam ekran",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "LDIT ma terminy obok wniosków, instytucja we własnym menu" },
          { typ: "wymusza", t: "Nadanie pracownikowi uprawnienia do modułu Terminy [D-36]" }
        ]
      },
      {
        id: "b",
        label: "Osobna pozycja menu dla wszystkich ról",
        skutki: [
          { typ: "zysk", t: "Jedna reguła, widoczne wszędzie" },
          { typ: "koszt", t: "Dodatkowa pozycja w menu LDIT" }
        ]
      },
      {
        id: "c",
        label: "Tylko zakładka w Dofinansowaniach, instytucja wchodzi przez swój panel",
        skutki: [
          { typ: "zysk", t: "Najmniej pozycji" },
          { typ: "ryzyko", t: "Instytucja ma jedną zakładkę [D-76], a terminy to jej główny widok operacyjny" }
        ]
      }
    ]
  },

  {
    id: "Z-14",
    obszar: "Mapa zakładek",
    waga: "niska",
    kto: "klient",
    blokuje: "screeny Terminów",
    pytanie: "Kalendarz i Lista terminów: dwie zakładki czy przełącznik widoku",
    kontekst: "Ekran Terminów ma dwie zakładki wewnętrzne, Kalendarz i Lista terminów. Każda ma własny filtr instytucji, więc po przełączeniu trzeba ustawić go drugi raz. Uczestnicy terminu rozwijają się w liście, a w kalendarzu po kliknięciu. Rekomendacja wykonawcy: wariant B.",
    opcje: [
      {
        id: "a",
        label: "Dwie zakładki jak dziś",
        skutki: [
          { typ: "zysk", t: "Bez zmian" },
          { typ: "ryzyko", t: "Rozdzielone filtry, zakładka w zakładce" }
        ]
      },
      {
        id: "b",
        label: "Jeden ekran z przełącznikiem widoku Kalendarz / Tabela, wspólne filtry, zapamiętany wybór",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Bez zakładek wewnętrznych, filtr ustawia się raz" },
          { typ: "koszt", t: "Niewielka przebudowa widoków" }
        ]
      },
      {
        id: "c",
        label: "Tylko tabela, kalendarz jako mały podgląd miesiąca obok",
        skutki: [
          { typ: "zysk", t: "Bliżej Excela" },
          { typ: "ryzyko", t: "Odstępstwo od [D-142], klient chciał kalendarza i tabeli" }
        ]
      }
    ]
  },

  {
    id: "Z-15",
    obszar: "Mapa zakładek",
    waga: "srednia",
    kto: "klient",
    blokuje: "linki karta wniosku i Terminy",
    pytanie: "Jak przypisywać projekt do terminu",
    kontekst: "Termin jest przypisany do wniosku [D-142]. Na karcie wniosku nie ma wyboru terminu, a z listy Terminów nie ma przejścia do projektu uczestnika: lista pokazuje klienta i projekt bez linku. Rekomendacja wykonawcy: wariant A.",
    opcje: [
      {
        id: "a",
        label: "Dwukierunkowo: na karcie wniosku wybór wolnego terminu instytucji, na liście Terminów lista zapisanych z linkami do projektów",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Model A i B [D-12] obsłużone z obu stron, zmiana terminu widoczna w obu miejscach" },
          { typ: "wymusza", t: "Po zmianie terminu przypomnienie o piśmie do PUP (docs/05)" }
        ]
      },
      {
        id: "b",
        label: "Tylko z Terminów (dopisz projekt do terminu)",
        skutki: [
          { typ: "zysk", t: "Jedno miejsce operacji" },
          { typ: "ryzyko", t: "W modelu B instytucja ustala termin telefonicznie, a wpisuje go LDIT z karty wniosku" }
        ]
      },
      {
        id: "c",
        label: "Tylko z karty wniosku",
        skutki: [
          { typ: "zysk", t: "Jedno miejsce operacji" },
          { typ: "ryzyko", t: "Instytucja nie może dopisywać uczestników bez wchodzenia we wniosek" }
        ]
      }
    ]
  },

  /* ========================== MAPA ZAKLADEK: NABORY ========================== */

  {
    id: "Z-16",
    obszar: "Mapa zakładek",
    waga: "srednia",
    kto: "klient",
    blokuje: "mapa menu",
    pytanie: "Nabory: osobna pozycja menu czy zakładka w Dofinansowaniach",
    kontekst: "Nabory (urzędy, prognozy, 340 urzędów) są osobną pozycją menu [D-109]. Praca na nich jest ściśle związana z Bazą klientów (priorytet po ostatnim dniu naboru [D-130]), więc użytkownik przełącza się między dwiema pozycjami menu. Rekomendacja wykonawcy: wariant A.",
    opcje: [
      {
        id: "a",
        label: "Osobna pozycja menu „Nabory” (jak makieta i struktura klienta)",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Zgodne ze strukturą menu klienta i z „nabory w jednym miejscu” [D-109]" },
          { typ: "koszt", t: "Osobna pozycja obok Dofinansowań" }
        ]
      },
      {
        id: "b",
        label: "Zakładka „Nabory” obok Wnioski, Baza klientów, Terminy w Dofinansowaniach",
        skutki: [
          { typ: "zysk", t: "Cała praca operacyjna w jednym miejscu i o pozycję mniej w menu" },
          { typ: "koszt", t: "Cztery zakładki w Dofinansowaniach, moduł traci własne miejsce w menu" }
        ]
      }
    ]
  },

  {
    id: "Z-17",
    obszar: "Mapa zakładek",
    waga: "niska",
    kto: "klient",
    blokuje: "screeny Naborów",
    pytanie: "Ekran Nabory: ile bloków naraz",
    kontekst: "Nabory to jeden ekran z czterema kafelkami, tabelą urzędów, dwoma wykresami prognoz (urzędy i klienci wg miesiąca) i osią czasu 14 dni: pięć bloków jeden pod drugim. To ten sam wzorzec „wszystko naraz”, którego klient nie lubi w Excelu. Rekomendacja wykonawcy: wariant B.",
    opcje: [
      {
        id: "a",
        label: "Jak dziś",
        skutki: [
          { typ: "zysk", t: "Bez zmian" },
          { typ: "ryzyko", t: "Długi ekran, tabela ucieka pod wykresy" }
        ]
      },
      {
        id: "b",
        label: "Dwie zakładki: Lista (kafelki, tabela, oś 14 dni) i Prognozy (dwa wykresy miesięczne); klik w słupek prognozy filtruje listę na miesiąc",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Codzienna praca na liście, analityka osobno" },
          { typ: "koszt", t: "Dodatkowa zakładka w module" }
        ]
      },
      {
        id: "c",
        label: "Tylko lista naborów, wykresy prognoz przeniesione do Dashboardu/Skuteczność",
        skutki: [
          { typ: "zysk", t: "Nabory bez wykresów" },
          { typ: "ryzyko", t: "Prognozy służą do planowania kontaktu, a dashboard ma być statystyką [D-114]" }
        ]
      }
    ]
  },

  /* ======================= MAPA ZAKLADEK: KOMUNIKACJA ======================= */

  {
    id: "Z-19",
    obszar: "Mapa zakładek",
    waga: "wysoka",
    kto: "klient",
    blokuje: "mapa menu, screeny Komunikacji",
    pytanie: "Wysyłka maili: pozycja w menu czy funkcja przy rekordach",
    kontekst: "Moduł nazywa się w makiecie „Komunikacja” (w docs „Wysyłka maili”) i ma trzy zakładki: Biblioteka szablonów, Wysyłka, Automatyzacje i alerty. Karty wniosku i instytucji mają osobno sekcje Korespondencja [D-52], a lista wniosków nie ma akcji „wyślij mail do zaznaczonych”. Automatyzacje i alerty dublują zadania automatyczne i alerty na datę z modułu Zadania [D-140]. Rekomendacja wykonawcy: wariant B, a jeśli klient chce zachować pozycję w menu, wariant A.",
    opcje: [
      {
        id: "a",
        label: "Pozycja „Wysyłka maili” w menu z dwiema zakładkami (Szablony, Historia wysyłek); wysyłka z rekordów i z zaznaczonych wierszy list; automatyzacje w Zadaniach",
        skutki: [
          { typ: "zysk", t: "Zgodne z listą menu klienta, jedno miejsce szablonów i historii" },
          { typ: "koszt", t: "Pozycja menu, z której rzadko się startuje" }
        ]
      },
      {
        id: "b",
        label: "Bez pozycji w menu: szablony w Ustawieniach, wysyłka z kart i list, historia wysyłek w Rejestrze aktywności [D-122], automatyzacje w Zadaniach",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Menu krótsze o jedną pozycję, mail tam, gdzie pracuje się z klientem" },
          { typ: "koszt", t: "Odstępstwo od struktury menu klienta (pozycja „Wysyłka maili”), wymaga jego zgody" },
          { typ: "wymusza", t: "Akcja zbiorcza „Wyślij z szablonu” na listach Wnioski i Baza klientów, z potwierdzeniem [D-106]" }
        ]
      },
      {
        id: "c",
        label: "Jak dziś: Komunikacja z trzema zakładkami",
        skutki: [
          { typ: "zysk", t: "Bez zmian" },
          { typ: "ryzyko", t: "Automatyzacje w dwóch modułach, mail oderwany od rekordu" }
        ]
      }
    ]
  },

  /* =================== MAPA ZAKLADEK: ZADANIA I POWIADOMIENIA =================== */

  {
    id: "Z-20",
    obszar: "Mapa zakładek",
    waga: "srednia",
    kto: "klient",
    blokuje: "mapa menu, pasek górny",
    pytanie: "Zadania i powiadomienia: jedna pozycja, dwie czy dzwonek",
    kontekst: "Decyzja [D-195] mówi o dwóch modułach. Makieta ma jedną pozycję „Zadania i powiadomienia” z dwiema sekcjami na ekranie. Licznik wniosków do akceptacji z [D-105] i [D-140] („kółko w prawym górnym rogu”) nie istnieje w powłoce makiety, jest tylko kafelek na ekranie Zadań i wiersz na dashboardzie. Rekomendacja wykonawcy: wariant C.",
    opcje: [
      {
        id: "a",
        label: "Jedna pozycja menu z dwiema zakładkami: Plan dnia i Powiadomienia",
        skutki: [
          { typ: "zysk", t: "Jedna pozycja menu" },
          { typ: "koszt", t: "Powiadomienia niewidoczne, dopóki nie wejdzie się w zakładkę" }
        ]
      },
      {
        id: "b",
        label: "Dwie pozycje menu: Zadania i Powiadomienia",
        skutki: [
          { typ: "zysk", t: "Dosłownie zgodne z [D-195]" },
          { typ: "koszt", t: "Kolejna pozycja menu" }
        ]
      },
      {
        id: "c",
        label: "Dzwonek z licznikiem w pasku górnym otwiera listę powiadomień, pozycja menu „Zadania” zawiera plan dnia i pełną listę powiadomień jako zakładkę",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Licznik zawsze widoczny (jak w [D-105]), a menu ma jedną pozycję" },
          { typ: "koszt", t: "Dzwonek to nowy element powłoki, poza listą menu" }
        ]
      }
    ]
  },

  /* =================== MAPA ZAKLADEK: ADMINISTRACJA I PROWIZJE =================== */

  {
    id: "Z-21",
    obszar: "Mapa zakładek",
    waga: "srednia",
    kto: "klient",
    blokuje: "screeny Administracji",
    pytanie: "Administracja: ile zakładek",
    kontekst: "Administracja ma pasek (Prowizje i faktury, Kalkulator prowizji [prototyp]) i cztery zakładki: Prowizje, Faktury, Statystyki, Prowizje wewnętrzne (razem z Celami i premiami). Kalkulator jest prototypem do walidacji z klientem, nie funkcją docelową. Rekomendacja wykonawcy: wariant A.",
    opcje: [
      {
        id: "a",
        label: "Cztery zakładki, bez Kalkulatora w pasku: Prowizje, Faktury, Statystyki, Prowizje wewnętrzne i cele",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Zgodne z [D-141], każda zakładka ma jeden temat" },
          { typ: "koszt", t: "Cztery to górna granica proponowanego limitu" }
        ]
      },
      {
        id: "b",
        label: "Trzy zakładki: Prowizje, Faktury, Prowizje wewnętrzne i cele; statystyki kwotowe jako kolumny w Prowizjach",
        skutki: [
          { typ: "zysk", t: "Mniej zakładek, jedna tabela per instytucja" },
          { typ: "ryzyko", t: "Odwraca część [D-141], tabela Prowizji rośnie o kolumny" }
        ]
      },
      {
        id: "c",
        label: "Jak dziś plus Kalkulator w stałym pasku",
        skutki: [
          { typ: "zysk", t: "Kalkulator pod ręką" },
          { typ: "ryzyko", t: "Prototyp zostaje w produkcie" }
        ]
      }
    ]
  },

  {
    id: "Z-22",
    obszar: "Mapa zakładek",
    waga: "srednia",
    kto: "klient",
    blokuje: "screen Administracja/Prowizje",
    pytanie: "Zakładka Prowizje: cztery bloki naraz",
    kontekst: "Prowizje to cztery bloki jeden pod drugim: tabela per instytucja (dziesięć kolumn), dashboard miesięczny, rozwinięcie instytucji (lista projektów) i Przewidywana prowizja, do tego dwa opisy blokad. To najcięższy ekran w systemie. Rekomendacja wykonawcy: wariant B.",
    opcje: [
      {
        id: "a",
        label: "Jak dziś",
        skutki: [
          { typ: "ryzyko", t: "Wszystko naraz, dokładnie to, na co klient narzeka w Excelu" }
        ]
      },
      {
        id: "b",
        label: "Jedna tabela naraz: przełączniki Rzeczywista / Przewidywana [D-164] oraz Miesięcznie / Narastająco; klik w wiersz instytucji otwiera panel z projektami; opisy blokad w tooltipach",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Skupienie, dwa widoki prowizji się nie mieszają [D-164]" },
          { typ: "koszt", t: "Przełączniki trzeba wyraźnie oznaczyć, żeby nikt nie zafakturował z prognozy" }
        ]
      },
      {
        id: "c",
        label: "Podział na zakładki: Rzeczywista, Przewidywana, Miesięczna",
        skutki: [
          { typ: "zysk", t: "Każdy widok osobno" },
          { typ: "koszt", t: "Zakładek w Administracji robi się sześć, ponad limit" }
        ]
      }
    ]
  },

  {
    id: "Z-23",
    obszar: "Mapa zakładek",
    waga: "niska",
    kto: "klient",
    blokuje: "Konfigurator warunków, zakładka Kalkulator",
    pytanie: "Co dzieje się z Kalkulatorem prowizji po walidacji",
    kontekst: "Kalkulator to prototyp wymagany przed kodowaniem silnika prowizji: klient wpisuje liczby i mówi, czy dobrze się liczy. Nie ustalono, czy po walidacji zostaje w systemie. Rekomendacja wykonawcy: wariant C.",
    opcje: [
      {
        id: "a",
        label: "Zostaje jako symulator „co jeśli” w Administracji",
        skutki: [
          { typ: "zysk", t: "Test nowych warunków bez wpływu na dane" },
          { typ: "koszt", t: "Dodatkowa zakładka do utrzymania" }
        ]
      },
      {
        id: "b",
        label: "Znika po walidacji",
        skutki: [
          { typ: "zysk", t: "Mniej zakładek i mniej kodu" },
          { typ: "koszt", t: "Brak narzędzia do ustalania warunków z instytucją" }
        ]
      },
      {
        id: "c",
        label: "Podgląd na żywo w Konfiguratorze warunków instytucji (Instytucje, zakładka Warunki), bez osobnej zakładki",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Symulacja tam, gdzie ustawia się progi" },
          { typ: "wymusza", t: "Ten sam silnik liczy podgląd i prowizję, żeby była jedna liczba" }
        ]
      }
    ]
  },

  /* ================== MAPA ZAKLADEK: USTAWIENIA I KONTA ================== */

  {
    id: "Z-24",
    obszar: "Mapa zakładek",
    waga: "srednia",
    kto: "klient",
    blokuje: "mapa menu, screeny Ustawień",
    pytanie: "Ustawienia: konta, uprawnienia i rejestr",
    kontekst: "Docs/11 ma dla admina dwie pozycje: Konta i uprawnienia oraz Rejestr aktywności. Makieta scala je w jedną pozycję „Ustawienia” z paskiem (Konta i role, Rejestr aktywności) i zakładkami: Użytkownicy, Konfigurator ról, Macierz uprawnień (to samo, co konfigurator, w widoku do odczytu), Przypisanie do instytucji; rejestr ma trzy zakładki. Razem siedem miejsc. Rekomendacja wykonawcy: wariant B.",
    opcje: [
      {
        id: "a",
        label: "Dwie pozycje menu jak w docs/11: Konta i uprawnienia oraz Rejestr aktywności",
        skutki: [
          { typ: "zysk", t: "Zgodne ze strukturą klienta" },
          { typ: "koszt", t: "Dwie pozycje administratora więcej" }
        ]
      },
      {
        id: "b",
        label: "Jedna pozycja „Ustawienia”, zakładki: Użytkownicy (z kolumną Instytucje), Role i uprawnienia (Konfigurator i Macierz w jednym), Rejestr aktywności (z filtrem typu zdarzenia); czwarta zakładka „Szablony maili”, jeśli szablony przeniosą się z Komunikacji",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Trzy do czterech zakładek zamiast siedmiu" },
          { typ: "koszt", t: "Rejestr zmienia znaczenie z pozycji menu na zakładkę" }
        ]
      },
      {
        id: "c",
        label: "Jak w makiecie: Konta (cztery zakładki) i Rejestr (trzy zakładki) pod jedną pozycją",
        skutki: [
          { typ: "zysk", t: "Bez zmian" },
          { typ: "ryzyko", t: "Siedem miejsc, Konfigurator i Macierz dublują się" }
        ]
      }
    ]
  },

  /* ===================== MAPA ZAKLADEK: PANEL INSTYTUCJI ===================== */

  {
    id: "Z-25",
    obszar: "Mapa zakładek",
    waga: "wysoka",
    kto: "klient",
    blokuje: "screeny panelu instytucji, menu instytucji",
    pytanie: "Struktura panelu instytucji szkoleniowej",
    kontekst: "Decyzja [D-76]: instytucja widzi jedną zakładkę opisaną nazwą swojej spółki. Makieta daje jej cztery pozycje menu: Dashboard (podgląd), „Nazwa spółki”, Terminy szkoleń i Nabory (podgląd). Panel „Nazwa spółki” to ekran z ośmioma kartami: klienci i projekty, terminy, katalog, szkoleniowcy, szablony maili, formularz i inne. Rekomendacja wykonawcy: wariant A.",
    opcje: [
      {
        id: "a",
        label: "Jedna pozycja menu (nazwa spółki) i cztery zakładki: Klienci i projekty (ze statystykami na górze), Terminy szkoleń, Katalog i zespół, Formularz i maile",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Zgodne z [D-76], osiem kart uporządkowane w cztery zakładki" },
          { typ: "koszt", t: "Dashboard instytucji staje się paskiem statystyk zamiast osobnej strony" }
        ]
      },
      {
        id: "b",
        label: "Trzy pozycje menu: Przegląd (statystyki [D-193]), Nazwa spółki (klienci, katalog, zespół, formularz), Terminy szkoleń",
        skutki: [
          { typ: "zysk", t: "Terminy jako główny widok operacyjny osobno" },
          { typ: "ryzyko", t: "Odstępstwo od „jednej zakładki” z [D-76]" }
        ]
      },
      {
        id: "c",
        label: "Jak makieta: cztery pozycje menu",
        skutki: [
          { typ: "zysk", t: "Bez zmian" },
          { typ: "ryzyko", t: "Nabory i Dashboard nie wynikają z [D-76], szersza powierzchnia separacji" }
        ]
      }
    ]
  },

  {
    id: "Z-26",
    obszar: "Mapa zakładek",
    waga: "srednia",
    kto: "klient",
    blokuje: "karta projektu w widoku instytucji",
    pytanie: "Czy instytucja może otworzyć kartę projektu swojego klienta",
    kontekst: "W panelu instytucji tabela „Moi klienci i ich projekty” nie ma przycisku Otwórz, a rola instytucji nie ma dostępu do modułu Dofinansowania, w którym leży karta wniosku. Instytucja widzi kwoty wniosku, nie widzi prowizji [D-07]. Rekomendacja wykonawcy: wariant A.",
    opcje: [
      {
        id: "a",
        label: "Tak: podgląd karty projektu (uczestnicy, kwoty wniosku, termin, przebieg), bez prowizji, korespondencji LDIT i notatek wewnętrznych",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Instytucja sprawdza etap bez telefonu do LDIT" },
          { typ: "wymusza", t: "Osobny widok karty dla tej roli i testy separacji per pole [D-149]" }
        ]
      },
      {
        id: "b",
        label: "Nie, tylko wiersz z podstawowymi danymi (jak dziś)",
        skutki: [
          { typ: "zysk", t: "Minimalne ryzyko wycieku" },
          { typ: "koszt", t: "Pytania „na jakim etapie” wracają telefonem do LDIT" }
        ]
      },
      {
        id: "c",
        label: "Tak, z edycją uczestników i terminu",
        skutki: [
          { typ: "zysk", t: "Mniej pracy po stronie LDIT" },
          { typ: "ryzyko", t: "Instytucja modyfikuje dane wniosku, choć dane prowadzi LDIT" }
        ]
      }
    ]
  },

  /* ====================== MAPA ZAKLADEK: PANEL KLIENTA ====================== */

  {
    id: "Z-27",
    obszar: "Mapa zakładek",
    waga: "niska",
    kto: "klient",
    blokuje: "screeny panelu klienta (etap IV)",
    pytanie: "Panel klienta: nawigacja w minimalnym zakresie",
    kontekst: "Panel klienta jest w etapie IV w minimalnym zakresie [D-192]. Makieta ma jedną stronę „Mój wniosek” (status, szkolenie, uczestnicy, materiały). Klient może mieć kilka projektów w roku i w kolejnych latach. Rekomendacja wykonawcy: wariant A.",
    opcje: [
      {
        id: "a",
        label: "Jedna pozycja „Mój wniosek”: przy jednym projekcie od razu widok statusu, przy kilku lista projektów z wyborem",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Prosto, bez zakładek" },
          { typ: "koszt", t: "Wybór projektu musi być prosty (lista dwóch do czterech pozycji)" }
        ]
      },
      {
        id: "b",
        label: "Zawsze najpierw lista projektów, dopiero z niej karta",
        skutki: [
          { typ: "zysk", t: "Jedna zasada dla wszystkich" },
          { typ: "koszt", t: "Dodatkowy klik przy jednym projekcie" }
        ]
      },
      {
        id: "c",
        label: "Decyzja o nawigacji panelu po zatwierdzeniu jego zakresu [P-33]",
        skutki: [
          { typ: "zysk", t: "Bez pracy teraz" },
          { typ: "ryzyko", t: "Do Miro nie trafi ekran panelu klienta" }
        ]
      }
    ]
  },

  /* ==================== MAPA ZAKLADEK: NAWIGACJA OGOLNA ==================== */

  {
    id: "Z-28",
    obszar: "Mapa zakładek",
    waga: "wysoka",
    kto: "klient",
    blokuje: "cała mapa zakładek i lista screenów do Miro",
    pytanie: "Limit zakładek i zasada jednego paska",
    kontekst: "Dziś istnieją trzy poziomy zakładek: menu (12 pozycji), pasek modułu (11 zakładek w 5 grupach) i zakładki wewnętrzne (25) plus lata (3). Razem 38 różnych widoków do przejścia. Wykonawca proponuje limit: LDIT do 8 pozycji menu, w module jeden pasek zakładek do 4, karta rekordu do 4 zakładek, nic głębiej niż menu, zakładka, rekord. Rekomendacja wykonawcy: wariant A.",
    opcje: [
      {
        id: "a",
        label: "Limit: LDIT do 8 pozycji menu, w module jeden pasek do 4 zakładek, karta rekordu do 4 zakładek, brak zakładek w zakładkach",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Zwarta i przewidywalna mapa, łatwa do nauczenia" },
          { typ: "koszt", t: "Część treści trafia do sekcji zamiast do zakładek" }
        ]
      },
      {
        id: "b",
        label: "Limit luźniejszy: do 6 zakładek na moduł",
        skutki: [
          { typ: "zysk", t: "Mniej scalania treści" },
          { typ: "ryzyko", t: "Zbliża się do dzisiejszej gęstości" }
        ]
      },
      {
        id: "c",
        label: "Bez limitu, jak dziś",
        skutki: [
          { typ: "zysk", t: "Bez pracy" },
          { typ: "ryzyko", t: "Wada Excela („wszystko naraz”) w formie zakładek" }
        ]
      }
    ]
  },

  {
    id: "Z-29",
    obszar: "Mapa zakładek",
    waga: "srednia",
    kto: "klient",
    blokuje: "wyszukiwarka w pasku górnym, ekran wyników",
    pytanie: "Wyszukiwarka globalna: co pokazuje wynik",
    kontekst: "Wyszukiwarka w pasku górnym po Enter otwiera Bazę klientów z parametrem q, którego Baza nie czyta (czyta go tylko lista Wnioski). Kryteria: NIP, nazwa klienta, PUP [D-110]. Dla instytucji tylko własni klienci [D-111]. Rekomendacja wykonawcy: wariant A.",
    opcje: [
      {
        id: "a",
        label: "Ekran wyników pogrupowany: Klienci, Projekty, Urzędy (nabory), Instytucje (LDIT); każdy wynik jest linkiem do rekordu; podpowiedzi rozwijane pod polem",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Jedno pole na NIP, nazwę i PUP, prowadzi wprost do rekordu" },
          { typ: "koszt", t: "Nowy ekran wyników, przeszukiwanie wszystkich lat" },
          { typ: "wymusza", t: "Wyniki tylko z zakresu konta [D-111] [D-148]" }
        ]
      },
      {
        id: "b",
        label: "Zawsze Baza klientów z filtrem tekstu (jak dziś, ale działa)",
        skutki: [
          { typ: "zysk", t: "Prosto" },
          { typ: "ryzyko", t: "Szukanie po PUP i po numerze projektu nie ma sensu w Bazie" }
        ]
      },
      {
        id: "c",
        label: "Wyszukiwanie ograniczone do bieżącej zakładki (filtr zamiast wyszukiwarki globalnej)",
        skutki: [
          { typ: "zysk", t: "Bez nowego ekranu" },
          { typ: "ryzyko", t: "Sprzeczne z [D-110], wyszukiwarka miała być dostępna wszędzie" }
        ]
      }
    ]
  },

  {
    id: "Z-30",
    obszar: "Mapa zakładek",
    waga: "wysoka",
    kto: "klient",
    blokuje: "pasek górny, okruszki, przyciski powrotu",
    pytanie: "Okruszki i powrót z drill through",
    kontekst: "Okruszek w pasku górnym pokazuje tylko nazwę modułu (np. „Dofinansowania”), nie zakładkę ani rekord. Linki wewnątrz ekranów zmieniają zawartość ramki, ale nie zaznaczenie w menu ani okruszek. Karta wniosku wraca do listy bez filtrów, roku i pozycji przewinięcia. Rekomendacja wykonawcy: wariant A.",
    opcje: [
      {
        id: "a",
        label: "Okruszki Moduł, Zakładka, Rekord (klikalne); „Wróć do listy” przywraca filtry, sortowanie, rok, zaznaczenie i pozycję; przycisk Wstecz przeglądarki działa tak samo",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Praca seryjna (130 wniosków w dwa tygodnie) bez gubienia miejsca" },
          { typ: "koszt", t: "Stan listy musi być trzymany w adresie i w pamięci" }
        ]
      },
      {
        id: "b",
        label: "Same okruszki, powrót do listy od zera",
        skutki: [
          { typ: "zysk", t: "Prościej" },
          { typ: "ryzyko", t: "Po każdym wejściu w projekt filtr PUP trzeba ustawiać od nowa" }
        ]
      },
      {
        id: "c",
        label: "Jak dziś",
        skutki: [
          { typ: "zysk", t: "Bez pracy" },
          { typ: "ryzyko", t: "Zaznaczenie menu rozjeżdża się z ekranem, utrata miejsca na liście" }
        ]
      }
    ]
  },

  {
    id: "Z-31",
    obszar: "Mapa zakładek",
    waga: "srednia",
    kto: "klient",
    blokuje: "widoki mobilne",
    pytanie: "Telefon: co z zakładek jest dostępne",
    kontekst: "Wymaganie przedwarsztatowe: interfejs użyteczny na telefonie. Warsztat go nie omawiał. Układ tabelaryczny na telefonie wymaga osobnych widoków, a osiem pozycji menu i pasek zakładek się nie mieszczą. Rekomendacja wykonawcy: wariant A.",
    opcje: [
      {
        id: "a",
        label: "Telefon to odczyt i szybkie akcje: Dashboard, wyszukiwarka, karta wniosku i klienta (odczyt, zmiana statusu), Zadania i powiadomienia; tabele jako karty; reszta tylko na komputerze",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Realny zakres do wykonania i przetestowania" },
          { typ: "koszt", t: "Administracja i szerokie tabele bez telefonu" }
        ]
      },
      {
        id: "b",
        label: "Pełna funkcjonalność na telefonie",
        skutki: [
          { typ: "zysk", t: "Wszystko wszędzie" },
          { typ: "koszt", t: "Osobny projekt widoków dla każdego ekranu, znacząco wyższa wycena" }
        ]
      },
      {
        id: "c",
        label: "Telefon poza etapem I, później",
        skutki: [
          { typ: "zysk", t: "Tańszy etap I" },
          { typ: "ryzyko", t: "Wymaganie z dokumentacji przedwarsztatowej pozostaje niespełnione" }
        ]
      }
    ]
  },

  /* ======================= MAPA ZAKLADEK: DRILL THROUGH ======================= */

  {
    id: "Z-32",
    obszar: "Mapa zakładek",
    waga: "wysoka",
    kto: "klient",
    blokuje: "wszystkie listy i dashboard, cała tabela drill through",
    pytanie: "Dokąd prowadzi kliknięcie w liczbę, wykres lub kafelek",
    kontekst: "Dziś żaden kafelek KPI, słupek, wiersz statusów ani komórka agregatu nie jest klikalny. Działają tylko przyciski Otwórz w tabeli „Wymaga działania”, ale bez filtra (otwierają ekran, nie listę tych rekordów), oraz kafelek Prowizja. Dashboard ma być wyłącznie statystyką [D-114], więc klik nie może rozwijać listy klientów na dashboardzie. Rekomendacja wykonawcy: wariant A.",
    opcje: [
      {
        id: "a",
        label: "Klik otwiera właściwą listę operacyjną (Wnioski, Baza klientów, Nabory, Terminy, Faktury) z ustawionym filtrem, a licznik na liście zgadza się z liczbą z kafelka",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Dashboard zostaje czysto statystyczny, a każda liczba jest sprawdzalna jednym kliknięciem" },
          { typ: "wymusza", t: "Listy czytają filtry z adresu (status, urząd, instytucja, okres), dziś tego nie robią" },
          { typ: "koszt", t: "Jedna definicja każdej liczby (dziś „klienci z otwartym naborem” liczą trzy ekrany osobno)" }
        ]
      },
      {
        id: "b",
        label: "Klik otwiera okno szczegółów agregatu na dashboardzie (lista tylko do odczytu)",
        skutki: [
          { typ: "zysk", t: "Nie opuszcza się dashboardu" },
          { typ: "ryzyko", t: "Wraca rozpiska klientów na dashboardzie, wbrew [D-114]" },
          { typ: "koszt", t: "Druga wersja list do utrzymania obok list operacyjnych" }
        ]
      },
      {
        id: "c",
        label: "Bez klikania, dashboard jak dziś",
        skutki: [
          { typ: "zysk", t: "Zero prac" },
          { typ: "ryzyko", t: "Liczby są niesprawdzalne, a wykonawca wymaga, żeby agregacja prowadziła do szczegółów" }
        ]
      }
    ]
  },

  {
    id: "Z-33",
    obszar: "Mapa zakładek",
    waga: "srednia",
    kto: "klient",
    blokuje: "zakładki Baza klientów i Wnioski",
    pytanie: "Jak przechodzić między Bazą klientów a Wnioskami",
    kontekst: "W Bazie klient jest jednym wierszem, a jego wnioski rozwijają się plusem [D-128]. Przycisk Otwórz prowadzi na kartę wniosku, ale nie ma przejścia do listy Wnioski z filtrem tego klienta ani z powrotem. Licznik „Wnioski (n)” w zakładce liczy tylko bieżący rok i nie reaguje na filtry. Rekomendacja wykonawcy: wariant A.",
    opcje: [
      {
        id: "a",
        label: "Plus rozwija wnioski w wierszu (jak dziś), a nazwa klienta i liczba wniosków są linkami: do karty klienta i do Wniosków z filtrem klient; na liście Wnioski nazwa klienta prowadzi do Bazy",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Dwukierunkowo, obie tabele zsynchronizowane [D-128]" },
          { typ: "wymusza", t: "Filtr „klient” na liście Wnioski" }
        ]
      },
      {
        id: "b",
        label: "Tylko rozwijanie plusem, bez linków",
        skutki: [
          { typ: "zysk", t: "Bez zmian" },
          { typ: "ryzyko", t: "Praca na dwóch tabelach wymaga ręcznego szukania tego samego klienta" }
        ]
      },
      {
        id: "c",
        label: "Link tylko z Bazy do Wniosków, w drugą stronę nie",
        skutki: [
          { typ: "zysk", t: "Połowa pracy" },
          { typ: "ryzyko", t: "Asymetria, użytkownik nie wie, dlaczego działa w jedną stronę" }
        ]
      }
    ]
  },

  {
    id: "Z-34",
    obszar: "Mapa zakładek",
    waga: "srednia",
    kto: "klient",
    blokuje: "karta wniosku, Nabory, Terminy, Faktury",
    pytanie: "Które nazwy na karcie wniosku i w listach są linkami",
    kontekst: "Na karcie nie ma żadnego linku poza okruszkiem „Zestawienia”, który wraca do listy bez filtrów. Klient, instytucja, urząd, szkolenie, faktura i prowizja są zwykłym tekstem. Na listach Wnioski i Baza nazwa klienta, instytucji i urzędu też nie prowadzi nigdzie. Rekomendacja wykonawcy: wariant A.",
    opcje: [
      {
        id: "a",
        label: "Wszystkie powiązania: klient do karty klienta, instytucja do karty instytucji (tylko LDIT), urząd do Naborów, szkolenie do terminu, faktura do Faktur, prowizja do Administracji, przebieg do Rejestru aktywności; link znika, gdy rola nie ma dostępu",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Rekord osiągalny z każdego miejsca, w którym jest wymieniony" },
          { typ: "koszt", t: "Każdy link trzeba przetestować per rola [D-148]" }
        ]
      },
      {
        id: "b",
        label: "Tylko klient, urząd i termin",
        skutki: [
          { typ: "zysk", t: "Najczęstsze przejścia, mniej testów uprawnień" },
          { typ: "ryzyko", t: "Faktura i prowizja nadal wymagają ręcznego szukania" }
        ]
      },
      {
        id: "c",
        label: "Bez linków, jak dziś",
        skutki: [
          { typ: "zysk", t: "Zero prac" },
          { typ: "ryzyko", t: "Drill through kończy się na karcie i nie idzie dalej" }
        ]
      }
    ]
  },

  {
    id: "Z-35",
    obszar: "Mapa zakładek",
    waga: "srednia",
    kto: "klient",
    blokuje: "Administracja/Prowizje i Faktury, karta wniosku",
    pytanie: "Skąd projekt i faktura w Administracji prowadzą dalej",
    kontekst: "W rozwinięciu instytucji w Administracji są projekty z podstawą prowizji. Nie mają linku do karty wniosku, a przy projekcie jest przycisk „Nadpisz”, chociaż [D-138] i opis strony mówią, że nadpisanie robi się na karcie wniosku. Faktura na liście nie prowadzi do projektów, których dotyczy, a karta wniosku nie pokazuje numeru faktury [D-139]. Rekomendacja wykonawcy: wariant A.",
    opcje: [
      {
        id: "a",
        label: "Projekt w Administracji otwiera kartę wniosku (zakładka Finanse), nadpisanie tylko tam; numer faktury na karcie prowadzi do Faktur, a kolumna Projekty (n) w Fakturach do Wniosków z filtrem faktura",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Zgodne z [D-138] i [D-139], przejścia w obie strony" },
          { typ: "koszt", t: "Filtr „faktura” na liście Wnioski i usunięcie przycisku Nadpisz z Administracji" }
        ]
      },
      {
        id: "b",
        label: "Nadpisanie także w Administracji (jak dziś)",
        skutki: [
          { typ: "zysk", t: "Szybciej dla admina" },
          { typ: "ryzyko", t: "Dwa miejsca zmiany wartości finansowej, wbrew ochronie przed przypadkową zmianą [D-16]" }
        ]
      },
      {
        id: "c",
        label: "Administracja tylko do odczytu, bez linków",
        skutki: [
          { typ: "zysk", t: "Prosto" },
          { typ: "ryzyko", t: "Zafakturowanie wymaga ręcznego szukania wniosku" }
        ]
      }
    ]
  },

  {
    id: "Z-36",
    obszar: "Mapa zakładek",
    waga: "niska",
    kto: "klient",
    blokuje: "karta wniosku, Rejestr aktywności",
    pytanie: "Historia rekordu: skąd wejść do Rejestru aktywności",
    kontekst: "Rejestr aktywności jest osobnym ekranem admina. Karta wniosku ma „Przebieg” (oś etapów), ale nie ma przejścia do wpisów rejestru tego wniosku (kto zmienił kwotę, wartość przed i po) [D-116]. Rekomendacja wykonawcy: wariant A.",
    opcje: [
      {
        id: "a",
        label: "Na karcie wniosku i klienta link „Historia zmian” otwiera Rejestr z filtrem rekordu (tylko admin), a wpis rejestru linkuje z powrotem do rekordu",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Odpowiedź „kto zmienił kwotę” w dwóch kliknięciach" },
          { typ: "wymusza", t: "Rejestr czyta filtr rekordu z adresu" }
        ]
      },
      {
        id: "b",
        label: "Historia w panelu bocznym karty, bez opuszczania karty, także dla pracownika (bez wartości finansowych)",
        skutki: [
          { typ: "zysk", t: "Bez zmiany ekranu" },
          { typ: "ryzyko", t: "Wartości finansowe w historii dostępne pracownikowi wbrew [D-34]" }
        ]
      },
      {
        id: "c",
        label: "Bez przejścia, szukanie w Rejestrze po numerze projektu",
        skutki: [
          { typ: "zysk", t: "Bez zmian" },
          { typ: "ryzyko", t: "Wolne i podatne na pomyłkę" }
        ]
      }
    ]
  },

  {
    id: "Z-37",
    obszar: "Mapa zakładek",
    waga: "srednia",
    kto: "klient",
    blokuje: "karta klienta, instytucji i wniosku, Zgłoszenia",
    pytanie: "Ostrzeżenie o zgłoszeniach na kartach klienta, instytucji i wniosku",
    kontekst: "Zgłoszenia to osobna pozycja menu [D-107], a przycisk „Otwórz kartę podmiotu” w ekranie Zgłoszeń nie ma dokąd prowadzić. Cel modułu to historia „ta firma już 2 razy coś takiego zrobiła”, ale handlowiec nie wejdzie do Zgłoszeń przed rozmową z klientem. Rekomendacja wykonawcy: wariant A.",
    opcje: [
      {
        id: "a",
        label: "Znacznik „Zgłoszenia: n” na karcie klienta, instytucji i wniosku (role LDIT), klik otwiera Zgłoszenia z filtrem podmiotu",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Ostrzeżenie w momencie pracy z klientem" },
          { typ: "wymusza", t: "Znacznik niewidoczny dla instytucji i klienta (separacja [D-148])" }
        ]
      },
      {
        id: "b",
        label: "Bez znacznika, tylko wyszukiwanie w Zgłoszeniach",
        skutki: [
          { typ: "zysk", t: "Bez zmian" },
          { typ: "ryzyko", t: "Historia incydentów nie jest widoczna tam, gdzie zapada decyzja o współpracy" }
        ]
      },
      {
        id: "c",
        label: "Znacznik tylko na karcie instytucji (incydenty klientów zostają w module)",
        skutki: [
          { typ: "zysk", t: "Prosto i bezpiecznie" },
          { typ: "ryzyko", t: "Nie chroni przed klientami z historią nadużyć" }
        ]
      }
    ]
  },

  {
    id: "Z-38",
    obszar: "Mapa zakładek",
    waga: "srednia",
    kto: "klient",
    blokuje: "adresy list, filtry, schemat parametrów",
    pytanie: "Filtry w adresie i zapisane widoki",
    kontekst: "Filtr po PUP i masowa zmiana statusów to główny scenariusz operacyjny [D-110]. Dziś filtr żyje tylko w polach ekranu i znika po wyjściu. Nie da się wysłać koledze linku „wszystkie wnioski na Warszawę czekające” ani wrócić do niego jednym kliknięciem. Rekomendacja wykonawcy: wariant A, zapisane widoki jako rozszerzenie po etapie I.",
    opcje: [
      {
        id: "a",
        label: "Każdy filtr i sortowanie w adresie: link do listy można skopiować i zapisać w zakładkach przeglądarki",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Wspólne linki w zespole, powrót do dowolnego widoku" },
          { typ: "koszt", t: "Trwały schemat nazw parametrów, do utrzymania przy każdej nowej liście" }
        ]
      },
      {
        id: "b",
        label: "Adres plus zapisane widoki użytkownika (np. „Warszawa, czekamy”) w menu pod tabelą",
        skutki: [
          { typ: "zysk", t: "Powtarzalne zadania jednym kliknięciem" },
          { typ: "koszt", t: "Nowa funkcja poza dotychczasowym zakresem" }
        ]
      },
      {
        id: "c",
        label: "Filtry pamiętane per użytkownik (ostatni stan), bez adresów",
        skutki: [
          { typ: "zysk", t: "Prosto" },
          { typ: "ryzyko", t: "Nie da się udostępnić widoku, a niejawny filtr myli („gdzie są moje wnioski”)" }
        ]
      }
    ]
  }

];

window.DECYZJE_ARCHIWUM = [

  /* ====================== BLOKADY ====================== */

  {
    id: "P-01",
    obszar: "Prowizja",
    waga: "blokada",
    kto: "klient",
    blokuje: "silnik prowizji",
    pytanie: "Co wyznacza okres rozliczeniowy prowizji",
    kontekst: "Klient najpierw ustalił jednoznacznie, że okresem rozliczeniowym jest data wystawienia faktury [D-13]. Pięć minut później pokazał, że w praktyce prognozuje próg z kalendarza szkoleń i sam wskazał problem.",
    cytat: { tresc: "ma szkolenie w październiku, a wystawiliśmy to w sierpniu", kto: "Bartek, warsztat 25.08.2026, 26:10" },
    opcje: [
      {
        id: "faktura",
        label: "Wyłącznie data wystawienia faktury",
        skutki: [
          { typ: "zysk", t: "Jedna reguła, jedna liczba, zero niejednoznaczności w rozliczeniu z instytucją" },
          { typ: "zysk", t: "Silnik prowizji już tak liczy, nic nie trzeba dopisywać" },
          { typ: "koszt", t: "Klient traci wgląd w to, ile prowizji dopiero się zbierze z zaplanowanych szkoleń" },
          { typ: "ryzyko", t: "Kłóci się z [D-26], czyli z wymaganiem przewidywanej prowizji, które klient zgłosił jako potrzebę" }
        ]
      },
      {
        id: "dwa-widoki",
        label: "Dwa widoki: prowizja rzeczywista i przewidywana",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Rozliczenie zostaje na dacie faktury, więc nie ma sporu z instytucją" },
          { typ: "zysk", t: "Klient dostaje prognozę z kalendarza, o którą prosił [D-26]" },
          { typ: "koszt", t: "Dwa razy więcej do policzenia i pokazania, bo oba widoki liczy ten sam silnik na innym zbiorze dat" },
          { typ: "wymusza", t: "Rozstrzygnięcie, w którym momencie pozycja przechodzi z prognozy do rozliczenia" },
          { typ: "wymusza", t: "Wyraźne oznaczenie w interfejsie, który widok jest którym, inaczej ktoś zafakturuje z prognozy" }
        ]
      },
      {
        id: "szkolenie",
        label: "Data ostatniego dnia szkolenia",
        skutki: [
          { typ: "zysk", t: "Prowizja idzie za realizacją, więc zgadza się z intuicją klienta o kalendarzu" },
          { typ: "koszt", t: "Rozjazd z fakturą, która może być wystawiona dwa miesiące wcześniej" },
          { typ: "ryzyko", t: "Odwraca [D-13], decyzję TWARDĄ, więc wymaga świadomego cofnięcia ustalenia" },
          { typ: "wymusza", t: "Zmianę reguły domyślnej daty faktury, dziś ustawionej właśnie na ostatni dzień szkolenia" }
        ]
      }
    ]
  },

  {
    id: "P-02",
    obszar: "Prowizja",
    waga: "blokada",
    kto: "klient",
    blokuje: "moduł prowizji wewnętrznej",
    pytanie: "Jakie są progi i stawki prowizji wewnętrznej dla pracowników LDIT",
    kontekst: "Klient zadeklarował dostarczenie w najbliższych dniach. Od warsztatu 25.08 minął miesiąc, nie dostarczono.",
    cytat: { tresc: "No i właśnie to jest problem, bo na tym się jeszcze nie zastanawiałem nawet.", kto: "Bartek, warsztat 25.08.2026, 57:13" },
    opcje: [
      {
        id: "dostarcza",
        label: "Klient dostarcza progi przed etapem II",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Moduł można zaprojektować raz, bez przeróbek" },
          { typ: "zysk", t: "Silnik prowizji zewnętrznej da się użyć ponownie, jeśli mechanika progów jest ta sama" },
          { typ: "koszt", t: "Czekamy, a moduł jest w etapie IV, więc czas jeszcze jest" },
          { typ: "wymusza", t: "Ustalenie terminu dostarczenia, inaczej pytanie przeleży kolejny miesiąc" }
        ]
      },
      {
        id: "stala",
        label: "Start na stałej stawce, progi dołożone później",
        skutki: [
          { typ: "zysk", t: "Moduł rusza bez czekania na klienta" },
          { typ: "koszt", t: "Prawie na pewno przeróbka, bo model progowy to inna struktura danych niż stała stawka" },
          { typ: "ryzyko", t: "Jeśli progi wejdą po starcie, trzeba rozstrzygnąć, czy przeliczać wstecz, co kłóci się z [D-23]" }
        ]
      },
      {
        id: "wypada",
        label: "Prowizja wewnętrzna wypada z zakresu",
        skutki: [
          { typ: "zysk", t: "Blokada znika, zakres etapu IV się kurczy" },
          { typ: "koszt", t: "Klient dalej liczy premie pracowników poza systemem, czyli w Excelu" },
          { typ: "ryzyko", t: "Wraca przy pierwszej rozmowie o premiach, tyle że po zamknięciu projektu" }
        ]
      }
    ]
  },

  {
    id: "P-09",
    obszar: "Integracje",
    waga: "blokada",
    kto: "klient",
    blokuje: "moduł faktur",
    pytanie: "Czy system księgowy udostępnia eksport CSV",
    kontekst: "Klient miał zadzwonić do księgowej w przerwie warsztatu. Odpowiedź nie padła. System księgowy to eSzokBR. Od odpowiedzi zależy, czy decyzja o imporcie zamiast integracji API się utrzyma.",
    opcje: [
      {
        id: "csv",
        label: "Eksport CSV istnieje, robimy import",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Zgodne z ustaleniem z warsztatu, bez kosztu integracji" },
          { typ: "zysk", t: "Brak dostępu systemu do księgowości, czyli mniejsza powierzchnia ryzyka" },
          { typ: "wymusza", t: "Ustalenie formatu kolumn i reguły dopasowania faktury do wniosku" },
          { typ: "wymusza", t: "Obsługę importu wielokrotnego, czyli co się dzieje, gdy ten sam plik wgra się dwa razy" }
        ]
      },
      {
        id: "recznie",
        label: "Brak eksportu, faktury wprowadzane ręcznie",
        skutki: [
          { typ: "zysk", t: "Zero zależności od systemu księgowego" },
          { typ: "koszt", t: "Przy 64 fakturach w roczniku demonstracyjnym to realna praca comiesięczna" },
          { typ: "ryzyko", t: "Prowizja liczy się z danych wpisanych ręcznie, więc literówka zmienia kwotę rozliczenia" }
        ]
      },
      {
        id: "api",
        label: "Brak eksportu, wracamy do integracji API",
        skutki: [
          { typ: "zysk", t: "Faktury zawsze aktualne, bez kroku ręcznego" },
          { typ: "koszt", t: "Wycena 10 do 15 godzin, odrzucona wcześniej ze względu na koszt i bezpieczeństwo" },
          { typ: "ryzyko", t: "System dostaje dostęp do księgowości, co odwraca świadomą decyzję z warsztatu" }
        ]
      }
    ]
  },

  {
    id: "P-25",
    obszar: "Architektura",
    waga: "blokada",
    kto: "wykonawca",
    blokuje: "projekt bazy danych, czyli fundament całego systemu",
    pytanie: "Osobne bazy per instytucja czy jedna baza z separacją wierszy",
    kontekst: "Wykonawca skłania się ku osobnym mini-bazom ze względu na bezpieczeństwo [D-143]. Stoi to w napięciu z wymaganiem zbiorczego dashboardu, ciągłej numeracji klientów i widoku wszystkich instytucji. Powiązane: [P-56], [P-59].",
    cytat: { tresc: "logując się z konta będą mieli dostęp tylko do swojej bazy (...) raczej każdy będzie miał osobną bazę danych pod spodem.", kto: "Paweł, warsztat 04.09.2026, 2:07:31" },
    opcje: [
      {
        id: "jedna",
        label: "Jedna baza, separacja politykami na wierszach",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Widoki zbiorcze, dashboard i statystyki per instytucja działają bez żadnej warstwy scalającej" },
          { typ: "zysk", t: "Ciągła numeracja klientów w roku [D-112] wychodzi naturalnie z jednej sekwencji" },
          { typ: "zysk", t: "Jeden klient u wielu instytucji [D-144] to jeden wiersz plus znaczniki, a nie kopia w dwóch bazach" },
          { typ: "zysk", t: "Makieta już tak działa i przechodzi 50 testów separacji" },
          { typ: "koszt", t: "Cała separacja stoi na politykach dostępu, więc jeden błąd w polityce to wyciek" },
          { typ: "wymusza", t: "Audyt separacji jako osobny krok przed wdrożeniem, nie jako część testów funkcjonalnych" }
        ]
      },
      {
        id: "osobne",
        label: "Osobne bazy per instytucja",
        skutki: [
          { typ: "zysk", t: "Wyciek między instytucjami wymagałby błędu w konfiguracji połączenia, a nie w zapytaniu" },
          { typ: "zysk", t: "Zgodne z kierunkiem, ku któremu skłonił się wykonawca [D-143]" },
          { typ: "koszt", t: "Każdy widok zbiorczy wymaga warstwy scalającej, która i tak musi widzieć wszystko" },
          { typ: "koszt", t: "Ciągła numeracja klientów wymaga osobnego licznika poza bazami instytucji" },
          { typ: "ryzyko", t: "Klient u dwóch instytucji istnieje w dwóch bazach, więc zmiana danych rozjeżdża kopie" },
          { typ: "ryzyko", t: "Dwadzieścia baz to dwadzieścia migracji przy każdej zmianie schematu" }
        ]
      },
      {
        id: "schematy",
        label: "Jedna baza, osobne schematy per instytucja",
        skutki: [
          { typ: "zysk", t: "Separacja na poziomie schematu, a nie pojedynczego warunku w zapytaniu" },
          { typ: "zysk", t: "Migracje idą w jednym miejscu, bo baza jest jedna" },
          { typ: "koszt", t: "Zapytania zbiorcze wymagają sumowania po schematach, co komplikuje każdy raport" },
          { typ: "ryzyko", t: "Rozwiązanie pośrednie, które bierze część wad obu wariantów" }
        ]
      }
    ]
  },

  /* ====================== ARCHITEKTURA I REALIZACJA ====================== */

  {
    id: "P-59",
    obszar: "Architektura",
    waga: "wysoka",
    kto: "wykonawca",
    blokuje: "projekt bazy docelowej",
    pytanie: "Gdzie egzekwować separację danych w docelowej aplikacji",
    kontekst: "W makiecie separacja działa w warstwie dostępu po stronie przeglądarki [D-148], bo cała baza tam leży. W aplikacji to samo rozwiązanie byłoby dziurą.",
    opcje: [
      {
        id: "baza",
        label: "Polityki na wierszach w bazie",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Ograniczenie obowiązuje niezależnie od tego, kto i jak pyta, także z konsoli" },
          { typ: "zysk", t: "Nie da się go obejść przez zapomnienie filtra w nowym zapytaniu" },
          { typ: "koszt", t: "Polityki trzeba napisać i przetestować osobno, to inny model myślenia niż filtr w kodzie" },
          { typ: "wymusza", t: "Kontekst zalogowanego użytkownika musi dotrzeć do bazy przy każdym zapytaniu" }
        ]
      },
      {
        id: "serwer",
        label: "Filtr w warstwie serwera",
        skutki: [
          { typ: "zysk", t: "Prostsze w napisaniu, bliższe temu, co już jest w makiecie" },
          { typ: "koszt", t: "Każde nowe zapytanie musi pamiętać o filtrze, a zapomnienie nie daje żadnego sygnału" },
          { typ: "ryzyko", t: "To jest dokładnie ten sam wzorzec, przez który D-114 nie działało przez miesiąc" }
        ]
      },
      {
        id: "oba",
        label: "Polityki w bazie plus filtr w serwerze",
        skutki: [
          { typ: "zysk", t: "Dwie niezależne bariery, błąd w jednej nie powoduje wycieku" },
          { typ: "koszt", t: "Podwójne utrzymanie, a przy rozjeździe trudniej ustalić, która warstwa odsiała wiersz" }
        ]
      }
    ]
  },

  {
    id: "P-61",
    obszar: "Realizacja",
    waga: "wysoka",
    kto: "wykonawca",
    blokuje: "implementację interfejsu",
    pytanie: "Czy powstaje osobna specyfikacja ekranów",
    kontekst: "Osiemnaście ekranów makiety pokazuje układ i zachowanie, ale nie ma ich spisanych pole po polu: co jest edytowalne, co waliduje, jakie ma akcje, która rola co widzi.",
    opcje: [
      {
        id: "spec",
        label: "Powstaje specyfikacja pole po polu",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Implementacja staje się wykonywaniem specyfikacji zamiast podejmowaniem decyzji w kodzie" },
          { typ: "zysk", t: "Model bez kontekstu projektu ma z czego odtworzyć zachowanie, nie tylko wygląd" },
          { typ: "zysk", t: "Powstaje podstawa do odbioru, bo widać, co znaczy skończony ekran" },
          { typ: "koszt", t: "Duży nakład pracy, choć mechaniczny, bo makieta jest wzorem" }
        ]
      },
      {
        id: "makieta",
        label: "Makieta zostaje jedynym źródłem",
        skutki: [
          { typ: "zysk", t: "Zero dodatkowej pracy teraz" },
          { typ: "koszt", t: "Zachowanie ekranów trzeba odczytywać z kodu makiety przy każdej wątpliwości" },
          { typ: "ryzyko", t: "Dwie osoby czytające ten sam ekran wyciągną z niego inne wnioski o walidacji" },
          { typ: "ryzyko", t: "Nie ma kryterium odbioru ekranu, więc nie ma jak zamknąć etapu" }
        ]
      },
      {
        id: "tylko-kluczowe",
        label: "Specyfikacja tylko dla ekranów finansowych",
        skutki: [
          { typ: "zysk", t: "Pokrywa miejsca, w których błąd kosztuje pieniądze" },
          { typ: "koszt", t: "Reszta ekranów zostaje bez opisu, a to one stanowią większość pracy" }
        ]
      }
    ]
  },

  {
    id: "P-63",
    obszar: "Realizacja",
    waga: "wysoka",
    kto: "obie strony",
    blokuje: "zamykanie etapów",
    pytanie: "Co znaczy, że moduł jest skończony",
    kontekst: "Nie ma ustalonego kryterium odbioru. Bez niego etap nie ma końca, tylko przerwę.",
    opcje: [
      {
        id: "excel",
        label: "Zgodność liczb z Excelem klienta na uzgodnionym zestawie przypadków",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Kryterium sprawdzalne, bo obie strony patrzą na tę samą liczbę" },
          { typ: "zysk", t: "Klient ufa wynikowi, bo porównuje z tym, co zna" },
          { typ: "wymusza", t: "Wybranie zestawu przypadków przed startem modułu, nie po" }
        ]
      },
      {
        id: "testy",
        label: "Przejście testów z dokumentacji",
        skutki: [
          { typ: "zysk", t: "Automatyczne, powtarzalne, uruchamiane przy każdej zmianie" },
          { typ: "koszt", t: "Testuje to, co wykonawca zrozumiał, a nie to, czego klient oczekuje" }
        ]
      },
      {
        id: "oba",
        label: "Jedno i drugie",
        skutki: [
          { typ: "zysk", t: "Testy pilnują regresji, porównanie z Excelem pilnuje rozumienia wymagania" },
          { typ: "koszt", t: "Więcej pracy przy zamykaniu każdego etapu" }
        ]
      }
    ]
  },

  {
    id: "D-143",
    obszar: "Architektura",
    waga: "wysoka",
    kto: "wykonawca",
    blokuje: "start implementacji",
    pytanie: "Stos technologiczny",
    kontekst: "Kierunek z [D-143] to framework open source z gotowym modułem uprawnień. Konkret nie został wybrany. Makieta jest czystym HTML właśnie po to, żeby niczego nie przesądzać.",
    opcje: [
      {
        id: "gotowy-modul",
        label: "Framework z gotowym modułem uprawnień",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Uprawnienia i polityki dostępu to najtrudniejsza część, a byłyby gotowe" },
          { typ: "zysk", t: "Zgodne z kierunkiem [D-143]" },
          { typ: "koszt", t: "Model uprawnień frameworka może nie pokryć trzech poziomów z [D-149], czyli modułu, pola i wiersza" },
          { typ: "wymusza", t: "Sprawdzenie, czy framework obsługuje widoczność per pole, a nie tylko per moduł" }
        ]
      },
      {
        id: "wlasny",
        label: "Własna warstwa uprawnień na bazie schematu z makiety",
        skutki: [
          { typ: "zysk", t: "Tabele role, moduly, uprawnienia i uprawnienia_pol są już zaprojektowane i przetestowane" },
          { typ: "zysk", t: "Pełna kontrola nad trzema poziomami separacji" },
          { typ: "koszt", t: "Uwierzytelnianie, sesje i odzyskiwanie hasła trzeba napisać albo dobrać osobno" }
        ]
      }
    ]
  },

  /* ====================== MODEL FINANSOWY ====================== */

  {
    id: "P-51",
    obszar: "Model finansowy",
    waga: "wysoka",
    kto: "wykonawca",
    blokuje: "spójność kwot",
    pytanie: "Reguły zaokrąglania kwot",
    kontekst: "Wskaźniki 0,9 i 0,7 dają wartości niecałkowite, a system ma pilnować równania przyznano plus wkład własny równa się koszt całkowity. Bez reguły równanie rozjedzie się o grosze.",
    opcje: [
      {
        id: "reszta",
        label: "Typ stałoprzecinkowy, zaokrąglenie do 2 miejsc, wkład własny liczony jako reszta",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Równanie zawsze się spina, bo jeden składnik jest resztą, a nie osobnym zaokrągleniem" },
          { typ: "zysk", t: "Brak błędów zmiennoprzecinkowych przy sumowaniu setek wniosków" },
          { typ: "wymusza", t: "Kolumny kwotowe jako typ dziesiętny, nie zmiennoprzecinkowy, także w bazie docelowej" },
          { typ: "wymusza", t: "Potwierdzenie, czy urząd stosuje te same zaokrąglenia" }
        ]
      },
      {
        id: "osobno",
        label: "Każda kwota zaokrąglana niezależnie",
        skutki: [
          { typ: "zysk", t: "Każde pole da się wyliczyć bez znajomości pozostałych" },
          { typ: "ryzyko", t: "Suma nie zgadza się z całością o grosz, a przy dokumencie do urzędu to realny problem" }
        ]
      }
    ]
  },

  {
    id: "P-53",
    obszar: "Model finansowy",
    waga: "wysoka",
    kto: "klient",
    blokuje: "kartę wniosku",
    pytanie: "Wkład własny wyliczany czy wpisywany ręcznie",
    kontekst: "Dwie decyzje TWARDE stoją w sprzeczności: [D-59] mówi, że wynika z wielkości przedsiębiorstwa, [D-80] że jest wpisywany ręcznie.",
    opcje: [
      {
        id: "regula-plus-reczne",
        label: "Procent wyliczany domyślnie, kwota nadpisywalna ręcznie",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Godzi obie decyzje bez odwracania żadnej z nich" },
          { typ: "zysk", t: "Spójne z zasadą ogólną [D-19], która obowiązuje w całym systemie" },
          { typ: "wymusza", t: "Flagę reguły i przycisk Przywróć regułę przy tym polu, tak jak przy przyznano" }
        ]
      },
      {
        id: "tylko-regula",
        label: "Wyłącznie wyliczany",
        skutki: [
          { typ: "zysk", t: "Jedna liczba, brak miejsca na pomyłkę" },
          { typ: "ryzyko", t: "Odwraca [D-80], a klient wprost chciał móc wpisać ręcznie" }
        ]
      },
      {
        id: "tylko-reczne",
        label: "Wyłącznie wpisywany ręcznie",
        skutki: [
          { typ: "koszt", t: "Przy 130 wnioskach w dwa tygodnie to 130 okazji do literówki" },
          { typ: "ryzyko", t: "Odwraca [D-59] i rozmontowuje konfigurowalne progi dofinansowania [D-131]" }
        ]
      }
    ]
  },

  {
    id: "P-14",
    obszar: "Model finansowy",
    waga: "srednia",
    kto: "klient",
    blokuje: "wyliczenie wkładu własnego",
    pytanie: "Od jakiej podstawy liczy się wkład własny",
    kontekst: "W przykładzie z warsztatu dopłata standardowa została policzona od 200 000, czyli od wartości wnioskowanej, a przyznano od 180 000, czyli od kosztu uznanego. Nie ustalono, która podstawa jest właściwa.",
    opcje: [
      {
        id: "uznany",
        label: "Od kosztu uznanego przez urząd",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Spójne z przyznano, które liczy się z tej samej podstawy" },
          { typ: "zysk", t: "Równanie przyznano plus wkład równa się koszt całkowity domyka się samo" }
        ]
      },
      {
        id: "wnioskowana",
        label: "Od wartości wnioskowanej",
        skutki: [
          { typ: "koszt", t: "Wkład własny liczony z innej podstawy niż przyznano, więc równanie się nie spina" },
          { typ: "wymusza", t: "Osobne wyjaśnienie na karcie wniosku, dlaczego liczby nie sumują się do całości" }
        ]
      }
    ]
  },

  {
    id: "P-04",
    obszar: "Prowizja",
    waga: "srednia",
    kto: "klient",
    blokuje: "rozliczenie okresu z korektą",
    pytanie: "Do którego okresu należy faktura korygująca",
    kontekst: "Kwota korekty została rozstrzygnięta i pokryta testami: korekta zdejmuje obrót tą samą stawką, która go naliczyła. Otwarte zostaje przypisanie do okresu, zwłaszcza gdy korekta cofa obrót poniżej progu w okresie już rozliczonym.",
    opcje: [
      {
        id: "biezacy",
        label: "Korekta trafia do okresu, w którym ją wystawiono",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Okresy raz zamknięte zostają zamknięte, zgodnie z [D-23]" },
          { typ: "zysk", t: "Brak przeliczania historii, więc rozliczenia z instytucją są stabilne" },
          { typ: "koszt", t: "Prowizja za miesiąc korekty może wyjść ujemna, co trzeba pokazać w interfejsie" }
        ]
      },
      {
        id: "pierwotny",
        label: "Korekta wraca do okresu faktury pierwotnej",
        skutki: [
          { typ: "zysk", t: "Obrót okresu zawsze odpowiada temu, co faktycznie zrealizowano" },
          { typ: "ryzyko", t: "Przelicza zamknięty okres, czyli łamie [D-23]" },
          { typ: "wymusza", t: "Mechanizm wersjonowania rozliczeń, bo kwota za dany miesiąc może się zmienić po fakcie" }
        ]
      }
    ]
  },

  {
    id: "P-32",
    obszar: "Prowizja",
    waga: "srednia",
    kto: "klient",
    blokuje: "kompletność modelu B",
    pytanie: "Jaka jest stawka trzeciego progu skali rocznej",
    kontekst: "Klient wspomniał, że powyżej miliona jest kolejny próg, ale nie podał stawki. W przykładach użyto roboczo 10 procent. Arkusz Prowizja liczenie.xlsx zawiera dwa różne warianty.",
    opcje: [
      {
        id: "z-umowy",
        label: "Klient potwierdza stawkę z umowy",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Model B staje się kompletny i można go zamknąć testami" },
          { typ: "wymusza", t: "Sprawdzenie, który z dwóch wariantów w arkuszu jest obowiązujący" }
        ]
      },
      {
        id: "konfigurowalne",
        label: "Nie zaszywamy nic, progi konfiguruje administrator",
        skutki: [
          { typ: "zysk", t: "Tak już działa makieta, progi leżą w tabeli, nie w kodzie" },
          { typ: "zysk", t: "Zmiana stawki nie wymaga zmiany programu" },
          { typ: "koszt", t: "Nadal trzeba wpisać poprawną wartość, tylko odpowiedzialność przechodzi na administratora" }
        ]
      }
    ]
  },

  {
    id: "P-05",
    obszar: "Prowizja",
    waga: "srednia",
    kto: "klient",
    blokuje: "podstawę prowizji",
    pytanie: "Kiedy dopłata dodatkowa wchodzi do podstawy prowizji",
    kontekst: "Klient chce prowizji od dopłaty tylko wtedy, gdy figuruje ona na wspólnej fakturze KFS. Sprzedaż komercyjna instytucji prowizji nie generuje. Wątek urwany, pytanie wykonawcy o źródło kwoty dopłaty zostało bez odpowiedzi.",
    opcje: [
      {
        id: "znacznik",
        label: "Znacznik przy dopłacie: na fakturze KFS czy osobno",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Reguła jest jawna i widoczna na karcie wniosku, a nie ukryta w interpretacji" },
          { typ: "wymusza", t: "Dodatkową kolumnę we wniosku i obsługę w widoku liczącym podstawę prowizji" }
        ]
      },
      {
        id: "zawsze",
        label: "Dopłata zawsze wchodzi do podstawy",
        skutki: [
          { typ: "zysk", t: "Tak działa makieta dzisiaj, zero zmian" },
          { typ: "ryzyko", t: "Prowizja naliczona od sprzedaży komercyjnej, czego klient wprost nie chce" }
        ]
      },
      {
        id: "nigdy",
        label: "Dopłata nigdy nie wchodzi do podstawy",
        skutki: [
          { typ: "koszt", t: "Odwraca [D-64], czyli ustalenie, że podstawą jest koszt całkowity z dopłatą" },
          { typ: "ryzyko", t: "Zaniża prowizję w przypadkach, w których dopłata jest częścią projektu KFS" }
        ]
      }
    ]
  },

  {
    id: "P-13",
    obszar: "Model finansowy",
    waga: "niska",
    kto: "klient",
    blokuje: "nazewnictwo na karcie wniosku",
    pytanie: "Jak nazwać pole koszt całkowity",
    kontekst: "Klient zakwestionował nazwę i proponował dofinansowanie ze wkładem własnym. Nie ustalono. Nazewnictwo jest dla klienta nienegocjowalne [D-55], więc warto to domknąć przed budową ekranów.",
    opcje: [
      { id: "uznany", label: "Koszt uznany przez urząd", rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Mówi wprost, skąd liczba pochodzi, i odróżnia ją od wartości wnioskowanej" },
          { typ: "koszt", t: "Nowa nazwa, do której klient musi się przyzwyczaić" }
        ] },
      { id: "zostaje", label: "Zostaje koszt całkowity", rekomendowana: false,
        skutki: [
          { typ: "zysk", t: "Zgodne z [D-10] i z obecnym Excelem klienta" },
          { typ: "ryzyko", t: "Myli się z kosztem całkowitym z dopłatą, który jest innym polem" }
        ] }
    ]
  },

  /* ====================== ZAKRES ====================== */

  {
    id: "P-33",
    obszar: "Zakres",
    waga: "wysoka",
    kto: "klient",
    blokuje: "panel klienta końcowego",
    pytanie: "Czy panel klienta końcowego wchodzi do zakresu",
    kontekst: "Klient wątpi w użyteczność, wykonawca deklaruje potrzebę i współfinansowanie. Nic nie zostało zapisane jako decyzja. Makieta pokazuje minimalny wariant, żeby było o czym rozmawiać.",
    opcje: [
      {
        id: "etap4",
        label: "Zostaje w etapie IV, w minimalnym zakresie",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Nie blokuje niczego wcześniej, a temat pozostaje otwarty" },
          { typ: "zysk", t: "Model danych jest już przygotowany, konto klienta ma powiązanie z rekordem [D-154]" },
          { typ: "wymusza", t: "Osobny cykl testów separacji przed udostępnieniem, bo to dostęp z zewnątrz" }
        ]
      },
      {
        id: "wypada",
        label: "Wypada z zakresu",
        skutki: [
          { typ: "zysk", t: "Mniej powierzchni do zabezpieczenia i mniej pytań o RODO" },
          { typ: "koszt", t: "Klient końcowy dalej pyta o status mailem i telefonem" }
        ]
      },
      {
        id: "etap1",
        label: "Wchodzi do etapu I",
        skutki: [
          { typ: "koszt", t: "Rozszerza etap I o dostęp z zewnątrz, czyli o najtrudniejszą część bezpieczeństwa" },
          { typ: "ryzyko", t: "Zakres etapu I jest już duży, a termin to dwa miesiące" }
        ]
      }
    ]
  },

  {
    id: "P-12",
    obszar: "Zakres",
    waga: "wysoka",
    kto: "klient",
    blokuje: "statystyki dla instytucji",
    pytanie: "Jakie dane statystyczne widzi instytucja szkoleniowa",
    kontekst: "Klient odroczył decyzję wprost. Sporne są: liczba i daty wpłynięcia formularzy oraz rozbicie per handlowiec. To jest konflikt interesów klienta i wykonawcy, bo wykonawca jako instytucja szkoleniowa potrzebuje tego do rozliczania własnego handlowca.",
    cytat: { tresc: "Dobra, ja będę musiał się nad tym zastanowić, czy chcę takie szczegóły.", kto: "Bartek, warsztat 25.08.2026, 2:54:45" },
    opcje: [
      {
        id: "wlasne-pelne",
        label: "Instytucja widzi pełne statystyki własnych klientów, w tym rozbicie per handlowiec",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Instytucja może rozliczać własnych handlowców, co jest realną potrzebą" },
          { typ: "zysk", t: "Nie narusza separacji, bo to wyłącznie własne dane" },
          { typ: "koszt", t: "Instytucja widzi swoją skuteczność, więc ma argument w negocjacjach prowizji" }
        ]
      },
      {
        id: "podstawowe",
        label: "Tylko liczby zbiorcze, bez rozbicia per handlowiec",
        skutki: [
          { typ: "zysk", t: "Mniej danych po stronie instytucji, mniejsze pole do porównań" },
          { typ: "koszt", t: "Instytucja i tak policzy to sobie z listy klientów, tylko ręcznie" }
        ]
      },
      {
        id: "brak",
        label: "Instytucja nie widzi statystyk",
        skutki: [
          { typ: "koszt", t: "Znika argument sprzedażowy systemu wobec instytucji" },
          { typ: "ryzyko", t: "Konflikt interesów zostaje nierozstrzygnięty, wróci przy wdrożeniu" }
        ]
      }
    ]
  },

  {
    id: "P-08",
    obszar: "Zakres",
    waga: "srednia",
    kto: "klient",
    blokuje: "dashboard i widok zbiorczy",
    pytanie: "Czy zbiorcze zestawienie wszystkich instytucji jest dashboardem czy widokiem operacyjnym",
    kontekst: "Klient powiedział, że zbiorczy widok ma być tylko na dashboardzie, bo po co wyświetlać dwa razy. Wcześniej opisywał go jako widok operacyjny do masowej zmiany statusów po filtrze urzędu. Dashboard ma być tylko statystyką, bez rozpiski klientów. Te dwa wymagania się wykluczają.",
    opcje: [
      {
        id: "osobno",
        label: "Dashboard to statystyka, zbiorcze zestawienie to osobny widok operacyjny",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Każdy ekran ma jedno zadanie, zgodnie z [D-114]" },
          { typ: "zysk", t: "Masowa zmiana statusów po filtrze urzędu ma gdzie działać" },
          { typ: "zysk", t: "Tak działa makieta: pozycja Wszystkie instytucje jest osobna i jawna [D-127]" },
          { typ: "koszt", t: "Dwa ekrany zamiast jednego" }
        ]
      },
      {
        id: "dashboard",
        label: "Wszystko na dashboardzie",
        skutki: [
          { typ: "koszt", t: "Dashboard przestaje być statystyką, a klient wprost tego nie chciał" },
          { typ: "ryzyko", t: "Ekran z rozpiską ponad tysiąca klientów przestaje być czytelny" }
        ]
      }
    ]
  },

  {
    id: "P-55",
    obszar: "Zakres",
    waga: "srednia",
    kto: "klient",
    blokuje: "moduł zadań",
    pytanie: "Zadania i powiadomienia to jeden moduł czy dwa",
    kontekst: "Moduł zadań wrócił do systemu [D-140]. Klient rozróżnia zadania, czyli plan dnia, od powiadomień i alertów na datę.",
    cytat: { tresc: "zadanie to jedno, powiadomienia to drugie.", kto: "Bartek, warsztat 04.09.2026, 46:11" },
    opcje: [
      {
        id: "dwa",
        label: "Dwa osobne moduły",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Zgodne z tym, jak klient sam to rozdziela" },
          { typ: "zysk", t: "Powiadomienia da się zrobić wcześniej, bo są prostsze niż zadania" },
          { typ: "koszt", t: "Dwie pozycje w menu zamiast jednej" }
        ]
      },
      {
        id: "jeden",
        label: "Jeden moduł z dwiema zakładkami",
        skutki: [
          { typ: "zysk", t: "Jedno miejsce, do którego pracownik zagląda rano" },
          { typ: "koszt", t: "Alert na datę i zadanie do wykonania mieszają się na jednej liście" }
        ]
      }
    ]
  },

  {
    id: "P-57",
    obszar: "Zakres",
    waga: "srednia",
    kto: "obie strony",
    blokuje: "zadania automatyczne",
    pytanie: "Które zadania wskakują automatycznie, a które zostają ręczne",
    kontekst: "Część zadań da się wyzwalać ze statusu i daty, na przykład przygotowanie rozliczenia z daty ostatniego dnia szkolenia. Klient podkreśla jednak, że 342 urzędy mają różne zasady i nie ma jednego standardu.",
    opcje: [
      {
        id: "waska-lista",
        label: "Automatyczne tylko te, które wynikają z daty i statusu, reszta ręczna",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Automat robi to, co da się wyprowadzić z danych, bez zgadywania" },
          { typ: "zysk", t: "Brak fałszywych zadań, które pracownik i tak by kasował" },
          { typ: "wymusza", t: "Spisanie listy wyzwalaczy, bo bez niej nie ma czego zaprogramować" }
        ]
      },
      {
        id: "wszystko",
        label: "Automatyzujemy jak najwięcej",
        skutki: [
          { typ: "zysk", t: "Mniej klikania" },
          { typ: "ryzyko", t: "Przy 342 urzędach o różnych zasadach automat generuje zadania niepasujące do sytuacji" },
          { typ: "ryzyko", t: "Pracownik przestaje czytać listę, bo jest w niej za dużo szumu" }
        ]
      },
      {
        id: "recznie",
        label: "Wszystko ręcznie",
        skutki: [
          { typ: "zysk", t: "Zero fałszywych trafień" },
          { typ: "koszt", t: "Przygotowanie rozliczenia po każdym szkoleniu trzeba pamiętać samemu" }
        ]
      }
    ]
  },

  {
    id: "P-17",
    obszar: "Zakres",
    waga: "niska",
    kto: "klient",
    blokuje: "powiadomienia dla uczestników",
    pytanie: "Czy SMS zostaje dla samych uczestników szkoleń",
    kontekst: "Wykonawca zaproponował, klient nie odpowiedział wprost. SMS został odrzucony jako kanał w etapie I [D-04]. Nierozstrzygnięte także, kto ponosiłby koszt.",
    opcje: [
      { id: "nie", label: "Nie, wyłącznie mail", rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Zgodne z [D-04], zero kosztu operatora i zero integracji" },
          { typ: "koszt", t: "Przypomnienie o szkoleniu trafia tylko na mail, który uczestnik może przeoczyć" }
        ] },
      { id: "tak", label: "Tak, ale tylko przypomnienie o terminie", rekomendowana: false,
        skutki: [
          { typ: "zysk", t: "Skuteczniejsze przypomnienie, mniej nieobecności" },
          { typ: "koszt", t: "Integracja z bramką SMS plus koszt za wiadomość" },
          { typ: "wymusza", t: "Ustalenie, kto płaci: LDIT, instytucja czy klient końcowy" }
        ] }
    ]
  },

  {
    id: "P-46",
    obszar: "Zakres",
    waga: "niska",
    kto: "klient",
    blokuje: "obsługę osób niekwalifikowanych",
    pytanie: "Czy system rejestruje szkolenie komercyjne dla osoby niekwalifikowanej",
    kontekst: "Osoba bez umowy o pracę nie kwalifikuje się do KFS i wymaga odrębnej faktury komercyjnej. Nie ustalono, czy system ma to rejestrować.",
    opcje: [
      { id: "znacznik", label: "Rejestrujemy jako uczestnika niezakwalifikowanego z powodem", rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Tak już działa makieta, uczestnik ma status kwalifikacji i powód [D-61]" },
          { typ: "zysk", t: "Widać, ilu uczestników odpadło i dlaczego" },
          { typ: "koszt", t: "Faktura komercyjna i tak powstaje poza systemem" }
        ] },
      { id: "poza", label: "Całkowicie poza systemem", rekomendowana: false,
        skutki: [
          { typ: "koszt", t: "Znika informacja, że osoba w ogóle była zgłoszona" },
          { typ: "ryzyko", t: "Suma uczestników na wniosku przestaje się zgadzać z tym, co zgłosił klient" }
        ] }
    ]
  },

  /* ====================== INTEGRACJE ====================== */

  {
    id: "P-24",
    obszar: "Integracje",
    waga: "wysoka",
    kto: "obie strony",
    blokuje: "wejście klienta do systemu",
    pytanie: "Technologia formularza zgłoszeniowego",
    kontekst: "Na warsztacie 04.09 klient wskazał Google Forms jako łatwiej dostępne [D-147]. Rekomendacja w dokumentacji integracji jest odwrotna: formularz natywny, ze względu na RODO, utrzymanie dwudziestu kopii i powiązanie z katalogiem szkoleń. To jest realny spór, nie nieporozumienie.",
    opcje: [
      {
        id: "natywny",
        label: "Formularz natywny w systemie",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "PESEL nie opuszcza systemu, co upraszcza RODO" },
          { typ: "zysk", t: "Lista szkoleń pobierana wprost z katalogu, więc nie rozjeżdża się z systemem" },
          { typ: "zysk", t: "Zgłoszenie trafia od razu do bramki akceptacji [D-105], bez synchronizacji" },
          { typ: "koszt", t: "Trzeba go zbudować, a Google Forms jest od ręki" },
          { typ: "wymusza", t: "Zabezpieczenie publicznego formularza przed nadużyciem" }
        ]
      },
      {
        id: "google",
        label: "Google Forms z importem",
        skutki: [
          { typ: "zysk", t: "Dostępne natychmiast, instytucje znają narzędzie" },
          { typ: "zysk", t: "Zgodne z preferencją klienta [D-147]" },
          { typ: "koszt", t: "Dwadzieścia formularzy do utrzymania, po jednym na instytucję [D-70]" },
          { typ: "koszt", t: "Lista szkoleń wpisywana ręcznie w każdym formularzu, więc rozjedzie się z katalogiem" },
          { typ: "ryzyko", t: "PESEL uczestników ląduje w arkuszu poza systemem, co jest problemem RODO" },
          { typ: "wymusza", t: "Ustalenie częstotliwości synchronizacji i obsługi duplikatów" }
        ]
      }
    ]
  },

  {
    id: "P-21",
    obszar: "Integracje",
    waga: "srednia",
    kto: "wykonawca",
    blokuje: "historię korespondencji",
    pytanie: "Jak powiązać maila z klientem",
    kontekst: "Przyjęto obejście procesowe, czyli nazwę klienta w temacie. Nie ustalono rozwiązania systemowego.",
    opcje: [
      {
        id: "adres",
        label: "Dopasowanie po adresie e-mail, temat jako uzupełnienie",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Działa bez dyscypliny po stronie pracownika" },
          { typ: "zysk", t: "Adres klienta i tak jest w bazie, więc nie trzeba niczego dodawać" },
          { typ: "koszt", t: "Mail z innego adresu tej samej firmy nie zostanie dopasowany" },
          { typ: "wymusza", t: "Możliwość ręcznego przypięcia maila do klienta" }
        ]
      },
      {
        id: "temat",
        label: "Wyłącznie konwencja tematu",
        skutki: [
          { typ: "zysk", t: "Zero logiki dopasowania" },
          { typ: "ryzyko", t: "Jedna pomyłka w temacie i korespondencja ginie poza kartą klienta" }
        ]
      }
    ]
  },

  {
    id: "P-20",
    obszar: "Integracje",
    waga: "srednia",
    kto: "klient",
    blokuje: "konfigurację uprawnień Microsoft 365",
    pytanie: "Z których skrzynek zaciągamy korespondencję",
    kontekst: "Wypowiedź klienta jest niepełna: wszystkie skrzynki klientów, a instytucji tylko wybrane. Trzeba potwierdzić, czy skrzynka właściciela jest wyłączona całkowicie czy częściowo.",
    opcje: [
      { id: "lista", label: "Jawna lista skrzynek objętych integracją", rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Uprawnienia aplikacji ograniczone do tego, co naprawdę potrzebne" },
          { typ: "zysk", t: "Prywatność skrzynek nieobjętych listą jest zachowana wprost" },
          { typ: "wymusza", t: "Ustalenie listy przed konfiguracją aplikacji w Microsoft 365" }
        ] },
      { id: "wszystkie", label: "Wszystkie skrzynki firmowe", rekomendowana: false,
        skutki: [
          { typ: "zysk", t: "Nic nie ginie, każda korespondencja trafia do systemu" },
          { typ: "ryzyko", t: "Aplikacja z dostępem do wszystkich skrzynek to duży zakres uprawnień" },
          { typ: "ryzyko", t: "Prywatna korespondencja pracownika trafia do systemu" }
        ] }
    ]
  },

  {
    id: "P-23",
    obszar: "Integracje",
    waga: "niska",
    kto: "wykonawca",
    blokuje: "formularz zgłoszeniowy",
    pytanie: "Skąd pochodzi lista szkoleń w formularzu",
    kontekst: "Z katalogu w systemie czy konfigurowana przez instytucję. Przy formularzu natywnym odpowiedź jest oczywista, przy Google Forms nie.",
    opcje: [
      { id: "katalog", label: "Z katalogu szkoleń w systemie", rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Nazwa szkolenia zawsze zgadza się z katalogiem, więc wniosek wiąże się z właściwą pozycją" },
          { typ: "zysk", t: "Zmiana w katalogu natychmiast widoczna w formularzu" },
          { typ: "wymusza", t: "Formularz natywny albo mechanizm synchronizacji listy" }
        ] },
      { id: "instytucja", label: "Instytucja wpisuje listę sama", rekomendowana: false,
        skutki: [
          { typ: "koszt", t: "Nazwy rozjeżdżają się z katalogiem, a klient wymaga spójności nazw" },
          { typ: "ryzyko", t: "Wniosek wskazuje szkolenie, którego nie ma w katalogu" }
        ] }
    ]
  },

  {
    id: "P-39",
    obszar: "Integracje",
    waga: "niska",
    kto: "klient",
    blokuje: "formularz zgłoszeniowy",
    pytanie: "Kto wypełnia formularz: klient końcowy czy handlowiec instytucji",
    kontekst: "Wybrano wstępnie wariant klienta końcowego, ale wariant alternatywny nie został formalnie odrzucony.",
    cytat: { tresc: "w sumie chyba nawet może handlowiec wpisywać dane klienta", kto: "Bartek, warsztat 25.08.2026, 2:15:32" },
    opcje: [
      { id: "oba", label: "Oba warianty dopuszczalne", rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Handlowiec może wypełnić za klienta, gdy ten sobie nie radzi" },
          { typ: "zysk", t: "Zgodne z rolą handlowca, która kończy się na wypełnieniu formularza [D-75]" },
          { typ: "wymusza", t: "Zapisanie, kto wypełnił, bo to różnica przy weryfikacji danych" }
        ] },
      { id: "klient", label: "Wyłącznie klient końcowy", rekomendowana: false,
        skutki: [
          { typ: "zysk", t: "Dane pochodzą od źródła, mniejsze ryzyko przekłamania" },
          { typ: "koszt", t: "Starsi klienci wymagają prowadzenia za rękę, co obciąża LDIT" }
        ] }
    ]
  },

  /* ====================== DOKUMENTY ====================== */

  {
    id: "P-19",
    obszar: "Dokumenty",
    waga: "srednia",
    kto: "klient",
    blokuje: "moduł certyfikatów",
    pytanie: "Kto wgrywa wzór certyfikatu i w jakim formacie",
    kontekst: "Admin czy sama instytucja. Format: Word, PDF, HTML. Nie ustalono. Wzór jest per instytucja [D-98], a miejscowość na certyfikacie pochodzi z siedziby instytucji [D-99].",
    opcje: [
      { id: "instytucja-html", label: "Instytucja wgrywa, format HTML z polami", rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Instytucja panuje nad własnym brandingiem bez angażowania LDIT" },
          { typ: "zysk", t: "HTML z polami jest najłatwiejszy do podstawienia danych i do wydruku PDF" },
          { typ: "wymusza", t: "Listę dostępnych pól i podgląd przed zapisaniem wzoru" },
          { typ: "ryzyko", t: "Instytucja może wgrać wzór, który się rozjeżdża na wydruku" }
        ] },
      { id: "admin-word", label: "Administrator wgrywa, format Word", rekomendowana: false,
        skutki: [
          { typ: "zysk", t: "Kontrola jakości po stronie LDIT" },
          { typ: "koszt", t: "Każda zmiana wzoru przechodzi przez administratora" },
          { typ: "koszt", t: "Generowanie z Worda jest trudniejsze niż z HTML" }
        ] }
    ]
  },

  {
    id: "P-40",
    obszar: "Dokumenty",
    waga: "niska",
    kto: "klient",
    blokuje: "generowanie certyfikatów",
    pytanie: "Jaka jest reguła numeracji certyfikatów",
    kontekst: "Klient wspomniał o ewentualnym numerze certyfikatu, jeżeli będzie wymagany. Brak reguły.",
    opcje: [
      { id: "per-instytucja", label: "Numeracja ciągła w roku, osobna dla każdej instytucji", rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Instytucja panuje nad własną numeracją, tak jak nad własnymi dokumentami" },
          { typ: "wymusza", t: "Licznik per instytucja i rok, z zabezpieczeniem przed dziurami" }
        ] },
      { id: "brak", label: "Bez numeru", rekomendowana: false,
        skutki: [
          { typ: "zysk", t: "Zero mechaniki do zbudowania" },
          { typ: "ryzyko", t: "Jeśli urząd zażąda numeru, trzeba numerować wstecz wystawione certyfikaty" }
        ] }
    ]
  },

  {
    id: "P-18",
    obszar: "Dokumenty",
    waga: "niska",
    kto: "klient",
    blokuje: "paczkę rozliczeniową ZIP",
    pytanie: "Czy faktura w paczce ZIP jest generowana przez system",
    kontekst: "Klient powiedział, że pewnie z fakturą, bez doprecyzowania źródła. System nie wystawia faktur, robi to księgowość.",
    opcje: [
      { id: "z-importu", label: "Faktura dołączana z importu, nie generowana", rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "System nie udaje programu do fakturowania" },
          { typ: "zysk", t: "Spójne z podglądem faktur PDF [D-24]" },
          { typ: "wymusza", t: "Przechowywanie pliku PDF faktury, nie tylko jej danych" }
        ] },
      { id: "generowana", label: "System generuje fakturę", rekomendowana: false,
        skutki: [
          { typ: "koszt", t: "Wchodzi w kompetencje systemu księgowego" },
          { typ: "ryzyko", t: "Dwa źródła faktur, które muszą się zgadzać co do numeru i kwoty" }
        ] }
    ]
  },

  /* ====================== BEZPIECZEŃSTWO ====================== */

  {
    id: "P-26",
    obszar: "Bezpieczeństwo",
    waga: "wysoka",
    kto: "klient",
    blokuje: "wdrożenie produkcyjne",
    pytanie: "Jaka jest retencja danych osobowych",
    kontekst: "Nie ustalono, jak długo przechowywana jest korespondencja, co dzieje się z danymi uczestników po rozliczeniu i czy starsze roczniki są archiwizowane z ograniczeniem dostępu. Wpływa na model danych, więc im później, tym drożej.",
    opcje: [
      {
        id: "okresy",
        label: "Jawne okresy retencji per kategoria danych",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Zgodność z RODO da się wykazać, a nie tylko zadeklarować" },
          { typ: "zysk", t: "Wolumen danych nie rośnie w nieskończoność" },
          { typ: "wymusza", t: "Kolumny z datą utworzenia przy danych wrażliwych, czyli zmianę w modelu danych" },
          { typ: "wymusza", t: "Proces czyszczenia, który ktoś musi uruchamiać albo zaplanować" }
        ]
      },
      {
        id: "bezterminowo",
        label: "Przechowujemy bezterminowo",
        skutki: [
          { typ: "zysk", t: "Zero mechaniki do zbudowania" },
          { typ: "ryzyko", t: "PESEL uczestników sprzed lat leży w systemie bez podstawy prawnej" },
          { typ: "ryzyko", t: "Rejestr aktywności logujący wszystkie akcje [D-122] rośnie bez ograniczenia" }
        ]
      }
    ]
  },

  {
    id: "P-54",
    obszar: "Bezpieczeństwo",
    waga: "srednia",
    kto: "wykonawca",
    blokuje: "rejestr aktywności",
    pytanie: "Które zdarzenia trafiają do logu akcji",
    kontekst: "Klient określił, że logi mają obejmować wszystkie akcje, w tym kliknięcia [D-122]. Logowanie dosłownie każdego kliknięcia generuje ogromny wolumen i szum.",
    opcje: [
      {
        id: "istotne",
        label: "Lista istotnych akcji, nie każde kliknięcie",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Administrator faktycznie przeczyta rejestr, bo nie tonie w szumie" },
          { typ: "zysk", t: "Wolumen danych pozostaje pod kontrolą, co ułatwia retencję [P-26]" },
          { typ: "wymusza", t: "Spisanie listy zdarzeń: otwarcie karty, eksport, wejście w moduł finansowy, wysyłka" },
          { typ: "koszt", t: "Zawęża wymaganie klienta, więc wymaga jego zgody" }
        ]
      },
      {
        id: "wszystko",
        label: "Dosłownie każde kliknięcie",
        skutki: [
          { typ: "zysk", t: "Dosłowna zgodność z [D-122]" },
          { typ: "ryzyko", t: "Wolumen logów przewyższy wolumen danych właściwych" },
          { typ: "ryzyko", t: "Rejestr staje się nieczytelny, więc nikt do niego nie zagląda" }
        ]
      }
    ]
  },

  {
    id: "P-27",
    obszar: "Bezpieczeństwo",
    waga: "srednia",
    kto: "klient",
    blokuje: "odpowiedzialność za bezpieczeństwo",
    pytanie: "Czy zamawiamy zewnętrzny audyt bezpieczeństwa",
    kontekst: "Dokumentacja przedwarsztatowa wspominała o rozważanym audycie firmy przejmującej część odpowiedzialności. Warsztat do tematu nie wrócił.",
    opcje: [
      { id: "po-etapie1", label: "Audyt po etapie I, przed wpuszczeniem instytucji", rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Separacja jest sprawdzona zanim konkurencyjne instytucje dostaną dostęp" },
          { typ: "zysk", t: "Część odpowiedzialności przechodzi na audytora" },
          { typ: "koszt", t: "Koszt audytu i czas na poprawki przed udostępnieniem" }
        ] },
      { id: "brak", label: "Bez audytu zewnętrznego", rekomendowana: false,
        skutki: [
          { typ: "zysk", t: "Brak kosztu i opóźnienia" },
          { typ: "ryzyko", t: "Wyciek między konkurencyjnymi instytucjami to scenariusz krytyczny dla biznesu klienta" }
        ] }
    ]
  },

  /* ====================== PROCES I NAZEWNICTWO ====================== */

  {
    id: "P-42",
    obszar: "Proces",
    waga: "srednia",
    kto: "klient",
    blokuje: "model statusów",
    pytanie: "Dwa niezależne statusy czy jeden łańcuch",
    kontekst: "Ustalono, że dziś są dwa niezależne statusy: składania i decyzji. Nie ustalono, czy w systemie zostaną dwa pola, czy jeden łańcuch etapów. Po [D-145] i [D-146] doszedł trzeci wymiar, czyli etap procesu.",
    opcje: [
      {
        id: "etap-plus-statusy",
        label: "Etap procesu jako łańcuch, statusy jako atrybuty",
        rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Zgodne z [D-145], czyli przyciskiem przejdź do następnego etapu" },
          { typ: "zysk", t: "Timeline buduje się sam z logów zmiany etapu" },
          { typ: "zysk", t: "Tak działa makieta, wniosek ma etap od 1 do 10 [D-146]" },
          { typ: "wymusza", t: "Ustalenie, które przejścia między etapami są dozwolone" }
        ]
      },
      {
        id: "trzy-pola",
        label: "Trzy niezależne pola bez łańcucha",
        skutki: [
          { typ: "zysk", t: "Odwzorowuje dzisiejszy Excel klienta jeden do jednego" },
          { typ: "koszt", t: "Brak timeline, bo nie ma z czego go zbudować" },
          { typ: "ryzyko", t: "Możliwe kombinacje statusów, które nie mają sensu biznesowego" }
        ]
      }
    ]
  },

  {
    id: "P-52",
    obszar: "Proces",
    waga: "srednia",
    kto: "klient",
    blokuje: "alerty z praca.gov.pl",
    pytanie: "W jakiej formie pojawia się alert z praca.gov.pl",
    kontekst: "Klient opisał alert wyzwalany mailem z portalu, ale sam nie rozstrzygnął formy. Po powrocie modułu zadań [D-140] wariant jako zadanie jest znów dostępny bez żadnej integracji.",
    cytat: { tresc: "Chciałbym, żeby alert był jako zadanie? Wykrzyknik przy Kliencie? Do przemyślenia jak zrobić to najlepiej.", kto: "Bartek, dokument klienta" },
    opcje: [
      { id: "zadanie", label: "Jako zadanie automatyczne", rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Trafia do planu dnia, więc nie ginie" },
          { typ: "zysk", t: "Moduł zadań i tak powstaje [D-140], więc nie ma dodatkowej mechaniki" },
          { typ: "wymusza", t: "Regułę zamykania zadania, żeby lista się nie zapychała" }
        ] },
      { id: "znacznik", label: "Znacznik przy kliencie", rekomendowana: false,
        skutki: [
          { typ: "zysk", t: "Widoczne dokładnie tam, gdzie pracownik i tak patrzy" },
          { typ: "koszt", t: "Trzeba samemu przeglądać listę, alert nie przychodzi do ciebie" }
        ] }
    ]
  },

  {
    id: "P-45",
    obszar: "Proces",
    waga: "niska",
    kto: "klient",
    blokuje: "katalog szkoleń",
    pytanie: "Czy edycja planu szkolenia wymaga akceptacji czy tylko powiadomienia",
    kontekst: "Wykonawca użył obu sformułowań w jednym zdaniu [D-43]. Dodawanie nowego planu przez instytucję jest swobodne, sporna jest tylko edycja istniejącego.",
    opcje: [
      { id: "powiadomienie", label: "Powiadomienie administratora, zmiana wchodzi od razu", rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Instytucja nie czeka na LDIT przy literówce w nazwie" },
          { typ: "zysk", t: "Administrator i tak widzi zmianę w rejestrze aktywności" },
          { typ: "ryzyko", t: "Zmiana ceny szkolenia wchodzi bez kontroli, a cena wpływa na kwoty wniosku" }
        ] },
      { id: "akceptacja", label: "Zmiana czeka na akceptację administratora", rekomendowana: false,
        skutki: [
          { typ: "zysk", t: "Nic nie zmienia się w katalogu bez wiedzy LDIT" },
          { typ: "koszt", t: "Administrator staje się wąskim gardłem przy dwudziestu instytucjach" },
          { typ: "wymusza", t: "Kolejkę zmian oczekujących i powiadomienie o niej" }
        ] },
      { id: "mieszane", label: "Cena wymaga akceptacji, reszta tylko powiadamia", rekomendowana: false,
        skutki: [
          { typ: "zysk", t: "Kontrola tam, gdzie zmiana dotyka pieniędzy" },
          { typ: "koszt", t: "Dwie ścieżki edycji zamiast jednej" }
        ] }
    ]
  },

  {
    id: "P-11",
    obszar: "Proces",
    waga: "niska",
    kto: "klient",
    blokuje: "nazewnictwo statusów",
    pytanie: "Jak nazwać status NW",
    kontekst: "Klient wprost powiedział, że to nazwa do zmienienia. Rozwinięcie skrótu zostało zapomniane na warsztacie.",
    opcje: [
      { id: "klient-podaje", label: "Klient podaje rozwinięcie i nową nazwę", rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Nazewnictwo jest dla klienta nienegocjowalne [D-55], więc on ma decydować" },
          { typ: "koszt", t: "Do czasu odpowiedzi status zostaje jako NW" }
        ] },
      { id: "zostaje", label: "Zostaje NW", rekomendowana: false,
        skutki: [
          { typ: "zysk", t: "Zgodne z dzisiejszym Excelem" },
          { typ: "ryzyko", t: "Nowy pracownik nie wie, co ten status znaczy" }
        ] }
    ]
  },

  {
    id: "P-43",
    obszar: "Proces",
    waga: "srednia",
    kto: "klient",
    blokuje: "widok wniosku",
    pytanie: "Jaka jest pełna lista kolumn widoku wniosku i ich kolejność",
    kontekst: "Klient odesłał do swojego dokumentu Word i nie przeszli przez listę na warsztacie. Wykonawca pytał też o priorytety na widoku klienta i nie dostał odpowiedzi [P-44].",
    cytat: { tresc: "ciężko mi teraz powiedzieć", kto: "Bartek, warsztat 25.08.2026, 1:42:39" },
    opcje: [
      { id: "z-makiety", label: "Zatwierdzamy kolumny z makiety, klient zgłasza poprawki", rekomendowana: true,
        skutki: [
          { typ: "zysk", t: "Jest o czym rozmawiać, bo klient patrzy na konkretny ekran, a nie na pustą kartkę" },
          { typ: "zysk", t: "Nie blokuje prac, bo domyślny układ już istnieje" },
          { typ: "wymusza", t: "Przejście przez ekran z klientem i spisanie uwag" }
        ] },
      { id: "z-worda", label: "Czekamy na listę z dokumentu klienta", rekomendowana: false,
        skutki: [
          { typ: "zysk", t: "Kolumny dokładnie takie, jak klient je dziś ma" },
          { typ: "koszt", t: "Blokuje ekran, który jest głównym miejscem pracy w systemie" }
        ] }
    ]
  }

];
