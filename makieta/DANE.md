# Warstwa danych makiety (baza w JSON)

Cała makieta czyta dane wejściowe z jednego, edytowalnego JSON-a. To jest zalążek
docelowej bazy danych, ułożony według `docs/03-model-danych.md`.

## Pliki

```
makieta/
  data/
    db.json            czysty JSON: znormalizowana baza, "plan bazy" do wglądu
  assets/
    db.seed.js         ten sam obiekt jako window.DB_SEED (ładuje się z file://)
    store.js           warstwa danych: localStorage, CRUD, eksport/import, reset
    db.js              adapter: buduje window.DB (widok) z danych znormalizowanych
tools/
    legacy-data-gen.js  stary, deterministyczny generator (źródło reprodukcji)
    build-db.mjs        generuje db.json + db.seed.js ze stałym RNG (parytet liczb)
    wire-pages.mjs      podmienia include danych w 17 stronach
```

Każda strona ładuje łańcuch: `db.seed.js` → `store.js` → `db.js`.

## Jak to działa

1. `db.seed.js` ustawia `window.DB_SEED` (dane bazowe = zawartość `data/db.json`).
2. `store.js` bierze seed albo, jeśli istnieje, roboczą kopię z `localStorage`
   (klucz `kfs_db_v1`). Każda zmiana (dodanie wiersza, edycja pola) zapisuje się
   z powrotem do `localStorage`, więc **edycje są trwałe między odświeżeniami**.
3. `db.js` odtwarza `window.DB.*` w kształcie, którego oczekują strony, i przelicza
   pola wyliczane wniosku (przyznano, całkowita wartość, koszt z dopłatą, wkład %).

## Edycja danych

- **W makiecie:** przez `window.Store` (docelowo inline na stronach).
  - `Store.get("klienci")` — tabela
  - `Store.insert("klienci", { nazwa: "...", ... })` — nowy wiersz (id nadawane automatycznie)
  - `Store.update("klienci", "KL-0001", { telefon: "..." })` — edycja
  - `Store.remove("klienci", "KL-0001")` — usunięcie
- **Ręcznie w pliku:** edytuj `data/db.json`, a potem, żeby zmiana trafiła do
  makiety na file://, przegeneruj seed z pliku albo podmień `db.seed.js`
  (w tej wersji `db.seed.js` powstaje z buildu, patrz niżej).
- **Eksport/Import/Reset:**
  - `Store.download("db.json")` — pobiera aktualny stan (z edycjami) do pliku
  - `Store.import(text)` — wczytuje inny plik JSON
  - `Store.reset()` — kasuje edycje, wraca do wersji bazowej z seeda

## Regeneracja danych bazowych

```
node tools/build-db.mjs     # db.json + db.seed.js, identyczne liczby (stały RNG)
node tools/wire-pages.mjs   # podmiana includu w stronach (idempotentne)
```

## Schemat wg docs/03

Encje kluczowe mają pola `snake_case`, referencje przez `_id`:

| Tabela JSON | Encja z docs/03 |
|---|---|
| `urzedy_pracy` | URZĄD_PRACY (PUP) |
| `instytucje` | INSTYTUCJA_SZKOLENIOWA |
| `warunki_prowizyjne` | WARUNKI_PROWIZYJNE (wersjonowane, D-22) |
| `katalog_szkolen` | KATALOG_SZKOLEŃ (szablon) |
| `terminy` | TERMIN_SZKOLENIA |
| `klienci` | KLIENT (firma końcowa) |
| `wnioski` | WNIOSEK / PROJEKT |
| `uczestnicy` | UCZESTNIK_WNIOSKU |
| `nabory` | NABÓR |
| `faktury` | FAKTURA |
| `uzytkownicy` | UŻYTKOWNIK |
| `zgloszenia` | ZGŁOSZENIE (incydent) |
| `korespondencja` | KORESPONDENCJA |

Tabele pomocnicze (`rejestr_aktywnosci`, `logowania`, `szablony_maili`,
`kolejka_zgloszen`, `cele`, `moduly`) zachowują na razie nazwy pól widoku,
bo są czytane wprost i nie mają jeszcze docelowej normalizacji.

## Pola wyliczane (docs/03, zasada regula_aktywna)

We wniosku przechowujemy tylko dane wejściowe i ręczne:
`koszt_calkowity` (ręczne, D-58), `kwota_doplaty_dodatkowej` (ręczne, D-63),
`prowizja_procent_reczna` (null = obowiązuje reguła z warunków IS).
Wartości wyliczane (`przyznano`, `calkowita_wartosc_szkolenia`,
`koszt_calkowity_z_doplata`, `wklad_wlasny_procent`) odtwarza adapter z danych
wejściowych, więc reguła i wartość zawsze się zgadzają.
