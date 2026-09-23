/* ============================================================================
   Punkty decyzyjne projektu KFS/LDIT.

   Każdy wpis to jedno pytanie, które nie zostało rozstrzygnięte, wraz z wariantami
   i konsekwencjami każdego z nich. Pytania pochodzą z docs/14-pytania-otwarte.md,
   warianty i skutki są analizą wykonawcy, nie ustaleniem z warsztatu.

   Typy skutków:
     zysk    co ten wariant daje
     koszt   czym za to płacimy
     wymusza co trzeba zrobić dodatkowo, jeśli ten wariant wygra
     ryzyko  co może pójść nie tak

   Dane są tylko danymi. Logika panelu siedzi w sekcje/17-panel-decyzji.html.
   ============================================================================ */

window.DECYZJE = [

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
