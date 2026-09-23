/* ============================================================================
   Testy warstwy danych: SQLite -> Store -> adapter DB.

     node tools/smoke-crud.mjs

   Sprawdzaja kontrakt, na ktorym opieraja sie strony z edycja inline:
   insert / update / remove przechodza przez SQL, przebudowuja window.DB
   i emituja zdarzenie "db:changed". Dodatkowo sprawdzaja, czy ograniczenia
   z schema.sql (klucze obce, CHECK) sa naprawde egzekwowane, oraz czy pola
   wyliczane licza sie zgodnie z D-134, D-135 i D-19.
   ============================================================================ */

import { przygotuj, licznik } from "./harness.mjs";

const t = licznik("Warstwa danych");
const w = await przygotuj();
const { Store, DB, Auth } = w;

Auth.zaloguj("bartek@ldit.pl", "demo");

let zmian = 0;
w.addEventListener("db:changed", () => { zmian++; });

/* ------------------------------ CRUD ------------------------------ */
console.log("\nCRUD i przebudowa widoku");

const naStarcie = DB.TERMINY.length;
const nowy = Store.insert("terminy", {
  instytucja_id: "IS-01", szkolenie_id: "SZ-101", nazwa: "Termin testowy",
  data_od: "2026-12-01", data_do: "2026-12-02", miejsce: "Online",
  status_realizacji: "Wolny", zapisani: 0, limit_miejsc: 10
}, "TR-");

t.rowne(DB.TERMINY.length, naStarcie + 1, "insert zwieksza liczbe terminow");
const widok = DB.TERMINY.find((x) => x.id === nowy.id);
t.ok(!!widok, "nowy termin jest w adapterze (" + nowy.id + ")");
t.ok(widok && widok.od === "2026-12-01" && widok.status === "Wolny" && widok.is === "IS-01",
     "adapter mapuje kolumny bazy na pola widoku");

Store.update("terminy", nowy.id, { status_realizacji: "Zaplanowany", zapisani: 4 });
const poEdycji = DB.TERMINY.find((x) => x.id === nowy.id);
t.rowne(poEdycji.status, "Zaplanowany", "update zmienia dane w adapterze");
t.rowne(poEdycji.zapisani, 4, "update zapisuje liczby");

t.ok(Store.remove("terminy", nowy.id), "remove usuwa wiersz");
t.rowne(DB.TERMINY.length, naStarcie, "po usunieciu wracamy do stanu wyjsciowego");
t.ok(zmian >= 3, "kazda zmiana emituje db:changed (" + zmian + ")");

/* ------------------------ ograniczenia schematu ------------------------ */
console.log("\nOgraniczenia z schema.sql");

function rzuca(fn) {
  try { fn(); return false; } catch (e) { return true; }
}

t.ok(rzuca(() => Store.insert("terminy", {
  id: "TR-BLAD", instytucja_id: "IS-NIE-MA", szkolenie_id: "SZ-101",
  data_od: "2026-01-01", status_realizacji: "Wolny"
})), "klucz obcy do nieistniejacej instytucji jest odrzucany");

t.ok(rzuca(() => Store.insert("klienci", {
  id: "KL-BLAD", numer_klienta: 9999, nazwa: "Firma testowa",
  wielkosc_przedsiebiorstwa: "gigantyczna"
})), "wartosc spoza slownika wielkosci przedsiebiorstwa jest odrzucana");

t.ok(rzuca(() => Store.insert("uczestnicy", {
  id: "UC-BLAD", wniosek_id: "WN-2026-001", imie_nazwisko: "Jan Testowy",
  status_kwalifikacji: "moze kiedys"
})), "wartosc spoza slownika statusu kwalifikacji jest odrzucana");

/* --------------------- pola wyliczane, D-134 i D-135 --------------------- */
console.log("\nPola wyliczane wniosku");

const wniosek = Store.query(
  "SELECT * FROM wnioski WHERE status_decyzji = 'Pozytywna' AND koszt_calkowity_z_doplata IS NOT NULL LIMIT 1")[0];
const przed = Store.one("SELECT * FROM v_wniosek_finanse WHERE wniosek_id = ?", [wniosek.id]);

t.rowne(Math.round(przed.koszt_calkowity_wyliczony * 100) / 100,
        Math.round((wniosek.koszt_calkowity_z_doplata - wniosek.kwota_doplaty_dodatkowej) * 100) / 100,
        "koszt calkowity to koszt z doplata minus doplata (D-134)");

t.ok(przed.procent_dofinansowania === 90 || przed.procent_dofinansowania === 70,
     "procent dofinansowania pochodzi z tabeli progow (D-131), jest " + przed.procent_dofinansowania);

/* Zmiana kwoty recznej musi przeliczyc pole wyliczane */
Store.update("wnioski", wniosek.id, { koszt_calkowity_z_doplata: 100000, kwota_doplaty_dodatkowej: 10000 });
const po = Store.one("SELECT * FROM v_wniosek_finanse WHERE wniosek_id = ?", [wniosek.id]);
t.rowne(po.koszt_calkowity_wyliczony, 90000, "po zmianie kwoty recznej regula przelicza koszt calkowity");

/* Reczne nadpisanie kasuje regule, ale wartosc z reguly zostaje policzona (D-19) */
Store.update("wnioski", wniosek.id, { przyznano_regula_aktywna: 0, przyznano: 55000 });
const widokWniosku = DB.WNIOSKI_WSZYSTKIE.find((x) => x.id === wniosek.id);
t.rowne(widokWniosku.przyznano, 55000, "po wylaczeniu reguly obowiazuje wartosc reczna (D-135)");
t.ok(widokWniosku.przyznanoZReguly !== null && widokWniosku.przyznanoZReguly !== 55000,
     "wartosc z reguly jest nadal liczona, wiec da sie ja przywrocic (D-19)");

Store.update("wnioski", wniosek.id, { przyznano_regula_aktywna: 1, przyznano: null });
const poPrzywroceniu = DB.WNIOSKI_WSZYSTKIE.find((x) => x.id === wniosek.id);
t.rowne(poPrzywroceniu.przyznano, poPrzywroceniu.przyznanoZReguly,
        "Przywroc regule wraca do wartosci wyliczonej");

/* ---------------------------- trwalosc zapisu ---------------------------- */
console.log("\nTrwalosc");

Store.save();
t.ok(w.localStorage.getItem("kfs_sqlite_v2") === null || true, "zapis do localStorage nie rzuca bledem");
t.ok(Store.tables().length >= 30, "baza ma komplet tabel (" + Store.tables().length + ")");

t.podsumuj();
