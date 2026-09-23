# Warstwa danych makiety: SQLite w przeglądarce

Makieta nie trzyma już danych w JSON-ie. Pod spodem działa **prawdziwa baza SQLite**,
uruchamiana w przeglądarce przez [sql.js](https://github.com/sql-js/sql.js) (SQLite
skompilowany do WebAssembly, licencja MIT).

Powód jest praktyczny: model danych, który dziś obsługuje makietę, jest tym samym modelem,
który pojedzie do aplikacji. `schema.sql` przenosi się na Postgresa praktycznie bez zmian,
a reguły wyliczeń z `views.sql` stają się warstwą domenową. Makieta przestaje być rysunkiem
i staje się dowodem, że model się spina.

---

## Pliki

```
makieta/
  db/
    schema.sql          struktura: 30 tabel, klucze obce, CHECK, indeksy
    views.sql           reguły biznesowe jako widoki SQL
    seed.sql            dane startowe do czytania (generowane)
    seed-db.js          ta sama baza jako binarium base64 (generowane)
    sql-wasm.js         silnik sql.js
    sql-wasm-data.js    binarium WebAssembly wklejone jako base64
  assets/
    sqlite.js           start silnika, zapis stanu, eksport pliku .sqlite
    store.js            dostęp do danych: get / query / insert / update / remove
    auth.js             sesja, role, uprawnienia
    zakres.js           separacja danych, filtr wierszy i pól
    prowizja.js         silnik prowizji
    db.js               adapter: składa window.DB dla stron
    boot.js             start strony, brama dostępu
tools/
    build-sqlite.mjs    buduje bazę ze schema.sql, views.sql i db.json
    sqlite-migracja.mjs mapowanie starych danych na nowy schemat
```

Każda strona ładuje ten łańcuch:

```
sql-wasm.js → sql-wasm-data.js → seed-db.js → sqlite.js → store.js
→ auth.js → zakres.js → prowizja.js → db.js → tips.js → boot.js
```

---

## Dlaczego działa z dwukliku

Przeglądarka na protokole `file://` blokuje `fetch()` plików lokalnych, więc standardowe
ładowanie `.wasm` by nie zadziałało. Dlatego binarium WebAssembly jest wklejone jako base64
do `db/sql-wasm-data.js`, a baza startowa do `db/seed-db.js`. Nie ma żadnego serwera,
`index.html` otwiera się dwuklikiem, wszystko działa offline.

Koszt: około 1,9 MB dwóch wygenerowanych plików w repozytorium.

---

## Jak działa start i zapis

1. `sqlite.js` uruchamia silnik i wczytuje bazę: jeśli w `localStorage` leży zapisany stan
   roboczy (klucz `kfs_sqlite_v2`), bierze jego, w przeciwnym razie bazę startową.
2. Każdy zapis przez `Store` odkłada binarium bazy z powrotem do `localStorage`, więc
   **zmiany przeżywają odświeżenie strony**.
3. `KFS.reset()` kasuje stan roboczy i wraca do bazy startowej.
4. `KFS.pobierzPlik("kfs.sqlite")` pobiera bieżącą bazę jako plik, który otworzysz w DB Browser
   for SQLite albo dowolnym innym narzędziu.

Baza jest asynchroniczna (WebAssembly), a kod stron pisany tak, jakby dane były od razu.
Rozwiązuje to `boot.js`: skrypt strony siedzi w bloku `<script type="text/kfs-strona">`
i uruchamia się dopiero po wstaniu bazy.

---

## Czytanie danych

```js
Store.get("klienci")                              // cała tabela
Store.find("wnioski", "WN-2026-001")              // po id
Store.query("SELECT * FROM wnioski WHERE rok = ?", ["2026"])
Store.one("SELECT COUNT(*) AS n FROM uczestnicy")
```

Strony nadal czytają `window.DB.*` (gotowe widoki, formatery), ale pod spodem każdy z nich
powstaje z zapytania SQL. Adapter `db.js` jest jedynym miejscem, które tłumaczy tabele na
kształt oczekiwany przez ekrany.

## Zapis danych

```js
Store.insert("terminy", { instytucja_id: "IS-01", ... }, "TR-")
Store.update("wnioski", "WN-2026-001", { koszt_calkowity_z_doplata: 120000 })
Store.remove("klienci", "KL-0001")
```

`Store` przepuszcza wyłącznie kolumny, które istnieją w tabeli, a baza egzekwuje klucze obce
i wartości słownikowe. Próba zapisania wniosku do nieistniejącej instytucji albo wielkości
przedsiębiorstwa spoza słownika kończy się błędem, nie cichym zapisem śmiecia.

---

## Reguły biznesowe w SQL

Widok `v_wniosek_finanse` liczy wszystko, co dokumentacja nazywa polem wyliczanym:

| Pole | Reguła | Decyzja |
|---|---|---|
| wielkość przedsiębiorstwa | nadpisanie per wniosek, w razie braku z klienta | D-132 |
| procent dofinansowania | z tabeli progów, wersja ważna w dniu wniosku | D-131 |
| koszt całkowity | koszt z dopłatą minus dopłata dodatkowa | D-134 |
| przyznano | koszt całkowity razy procent dofinansowania | D-135 |
| całkowita wartość szkolenia | suma po uczestnikach zakwalifikowanych | D-61, D-79 |
| podstawa prowizji | koszt całkowity **z dopłatą** | D-64 |

Każde pole wyliczane występuje w dwóch wariantach: `*_wyliczony` (zawsze z reguły, nawet gdy
reguła jest wyłączona) i `*_efektywny` (to, co widzi użytkownik). Dzięki temu przycisk
**Przywróć regułę** ma do czego wracać [D-19].

---

## Separacja danych

Filtr zakładany jest w `zakres.js`, na wyniku adaptera, **zanim jakakolwiek strona zobaczy dane**.
Ukrycie kolumny w HTML nie jest zabezpieczeniem, bo dane i tak leżą w pamięci strony i widać je
w narzędziach deweloperskich. Po zalogowaniu na konto pracownika LDIT stawki prowizji nie są
w ogóle wczytane, nie tylko schowane.

Trzy poziomy kontroli:

| Poziom | Pytanie | Źródło |
|---|---|---|
| moduł | czy rola widzi zakładkę | tabela `uprawnienia` |
| pole | czy widzi prowizję, PESEL, zysk firmy | tabela `uprawnienia_pol` |
| wiersz | czyje instytucje i czyich klientów | tabela `uzytkownik_instytucja`, widok `v_zakres_uzytkownika` |

---

## Konta demonstracyjne

Hasło do wszystkich kont: **`demo`** (kolumna `uzytkownicy.haslo_demo`, jawnie, bo to makieta).
Lista kont jest na ekranie logowania, klikasz i formularz się wypełnia.

| Konto | Rola | Co widzi |
|---|---|---|
| bartek@ldit.pl | Administrator | wszystko, w tym prowizje i rejestry |
| martyna@ldit.pl | Pracownik LDIT | 3 instytucje z 20, bez prowizji i faktur |
| biuro@odczarujpowerbi.pl | Instytucja szkoleniowa | wyłącznie własnych klientów |
| mirka@dronfortech.pl | Pracownik IS | dane kontaktowe, bez kwot i numerów PESEL |
| kontakt@stalmetspzoospk.pl | Klient końcowy | wyłącznie własny wniosek |

---

## Przebudowa bazy

```
node tools/build-db.mjs        # dane demonstracyjne do makieta/data/db.json
node tools/build-sqlite.mjs    # db.json + schema.sql + views.sql -> seed.sql i seed-db.js
node tools/wire-pages.mjs      # łańcuch skryptów w 18 stronach (idempotentne)
```

## Testy

```
node tools/verify-parity.mjs      # migracja nie zmieniła żadnej liczby w makiecie
node tools/smoke-crud.mjs         # CRUD, ograniczenia schematu, pola wyliczane
node tools/test-uprawnienia.mjs   # role, uprawnienia, separacja danych
node tools/test-zgodnosc-pol.mjs  # formularze zapisują do istniejących kolumn
```
