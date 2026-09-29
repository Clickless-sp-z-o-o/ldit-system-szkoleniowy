/* ============================================================================
   Testy zakladek rocznych Dofinansowan (D-129, D-159, D-160).

     node tools/test-lata.mjs

   Sprawdzaja, ze lata sa w bazie (nie w kodzie strony), ze administrator
   dodaje kolejny rok sam, ze nikt inny tego nie zrobi nawet z pominieciem
   interfejsu, i ze wniosek nie moze trafic do roku bez zakladki.
   ============================================================================ */

import { przygotuj, licznik } from "./harness.mjs";

const t = licznik("Zakladki roczne");
const w = await przygotuj();
const { Store, DB, Auth, Lata } = w;

function kodBledu(fn) {
  try { fn(); return null; } catch (e) { return e.kod || e.message; }
}

/* ---------------------------- stan startowy ---------------------------- */
console.log("\nStan startowy");
Auth.zaloguj("bartek@ldit.pl", "demo");
DB.przebuduj();

t.rowne(DB.LATA.map((l) => l.rok).join(","), "2025,2026,2027", "baza startowa ma zakladki 2025, 2026, 2027");
t.rowne(DB.WNIOSKI_WSZYSTKIE.filter((x) => x.rok === "2027").length, 0, "zakladka 2027 jest pusta");
t.rowne(DB.WNIOSKI_WSZYSTKIE.filter((x) => x.rok === "2025").length, 0, "wnioski z 2025 nie sa przenoszone (D-160)");
t.rowne(Store.one("SELECT COUNT(*) AS n FROM uczestnicy u LEFT JOIN wnioski w ON w.id = u.wniosek_id " +
                  "WHERE w.id IS NULL").n, 0, "w bazie nie zostali uczestnicy usunietych wnioskow");
t.ok(DB.WNIOSKI_WSZYSTKIE.filter((x) => x.rok === "2026").length > 0, "zakladka 2026 ma wnioski");
t.rowne(Lata.nastepny(), "2028", "propozycja kolejnego roku to ostatni + 1");

/* ------------------------- dodawanie przez admina ------------------------- */
console.log("\nAdministrator dodaje rok");
const nowy = Lata.dodaj("2028", "Bartłomiej Olejnik");
t.rowne(nowy.rok, "2028", "dodaj zwraca nowy rok");
t.ok(DB.LATA.some((l) => l.rok === "2028"), "nowa zakladka jest w adapterze po przebudowie");

const klient = Store.get("klienci")[0];
Store.insert("wnioski", { id: "PR-28-0001", numer: 1, rok: "2028", klient_id: klient.id,
                          instytucja_id: klient.instytucja_id, etap: 3 });
t.ok(DB.WNIOSKI_WSZYSTKIE.some((x) => x.id === "PR-28-0001" && x.rok === "2028"),
     "wniosek w nowym roku jest widoczny w adapterze");

/* ------------------------------ bledy ------------------------------ */
console.log("\nOdrzucanie niepoprawnych danych");
t.rowne(kodBledu(() => Lata.dodaj("2028")), "istnieje", "drugi raz ten sam rok jest odrzucany");
t.rowne(kodBledu(() => Lata.dodaj("28")), "zly_format", "rok musi miec cztery cyfry");
t.rowne(kodBledu(() => Lata.dodaj("1999")), "poza_zakresem", "rok spoza przedzialu jest odrzucany");
t.ok(kodBledu(() => Store.insert("wnioski", { id: "PR-35-0001", numer: 1, rok: "2035",
                                              klient_id: klient.id, instytucja_id: klient.instytucja_id, etap: 3 })) !== null,
     "wniosek do roku bez zakladki odrzuca klucz obcy");

console.log("\nUprawnienia");
Auth.zaloguj("martyna@ldit.pl", "demo");
t.rowne(kodBledu(() => Lata.dodaj("2029")), null, "pracownik LDIT dodaje rok sam (D-165)");
t.ok(!!Store.one("SELECT 1 AS x FROM lata_zestawien WHERE rok = '2029'"), "rok dodany przez pracownika jest w bazie");
Auth.zaloguj("biuro@odczarujpowerbi.pl", "demo");
t.rowne(kodBledu(() => Lata.dodaj("2030")), "brak_uprawnien", "instytucja szkoleniowa nie doda roku");
t.ok(!Store.one("SELECT 1 AS x FROM lata_zestawien WHERE rok = '2030'"), "odrzucona proba nie zostawia wiersza");

console.log("\nWniosek bez roku jest nieprzypisany, nie znika (D-165)");
Auth.zaloguj("bartek@ldit.pl", "demo");
Store.update("wnioski", "PR-28-0001", { rok: null });
t.ok(DB.WNIOSKI_BEZ_ROKU.some((x) => x.id === "PR-28-0001"), "wniosek bez roku trafia do listy nieprzypisanych");
Store.update("wnioski", "PR-28-0001", { rok: "2029" });
w.KFS.db.run("DELETE FROM lata_zestawien WHERE rok = '2029'");
const poUsunieciu = Store.one("SELECT rok FROM wnioski WHERE id = 'PR-28-0001'");
t.ok(poUsunieciu !== null && poUsunieciu.rok === null, "usuniecie roku odpina wniosek (rok = NULL), a wniosek zostaje");

t.podsumuj();
