/* ============================================================================
   Testy silnika prowizji.

     node tools/test-prowizja.mjs

   Przypadki pochodzą wprost z tabeli "Zestaw przypadków testowych" w
   docs/07-silnik-prowizji.md. Numeracja jest ta sama, więc rozjazd między
   dokumentacją a implementacją widać od razu po numerze przypadku.

   Przypadki 8-12 z dokumentacji dotyczą zachowania danych (nadpisanie, wersjonowanie
   warunków, okres rozliczeniowy, podstawa naliczenia), nie samego algorytmu. Te,
   które da się sprawdzić na silniku, są tutaj. Reszta jest sprawdzana w
   tools/smoke-crud.mjs na poziomie bazy.
   ============================================================================ */

import { przygotuj, licznik } from "./harness.mjs";

const t = licznik("Silnik prowizji");
const w = await przygotuj();
const { liczProwizje, liczOkres } = w;

const ZAOKR = 0.005;

function kwotaRowna(jest, oczekiwana, opis) {
  t.ok(Math.abs(jest - oczekiwana) < ZAOKR,
    opis + " (oczekiwano " + oczekiwana.toFixed(2) + " zł, jest " + jest.toFixed(2) + " zł)");
}

/* Warunki z realnych umów i z arkusza Prowizja liczenie.xlsx */
const MODEL_A = { model: "A", kumulacja: "miesieczny", sposob: "od_calosci",
                  progi: [{ od: 0, st: 10 }, { od: 50000, st: 12 }] };
const MODEL_A_ARKUSZ = { model: "A", kumulacja: "miesieczny", sposob: "od_calosci",
                         progi: [{ od: 0, st: 12 }, { od: 60000, st: 10 }] };
const MODEL_B = { model: "B", kumulacja: "roczny", sposob: "od_nadwyzki",
                  progi: [{ od: 0, st: 20 }, { od: 500000, st: 17.5 }] };
const MODEL_B_DEMO = { model: "B", kumulacja: "roczny", sposob: "od_nadwyzki",
                       progi: [{ od: 0, st: 20 }, { od: 500000, st: 10 }, { od: 1000000, st: 5 }] };
const MODEL_C = { model: "C", kumulacja: "miesieczny", sposob: "od_nadwyzki",
                  progi: [{ od: 0, st: 18 }, { od: 100000, st: 14 }] };
const MODEL_C_3 = { model: "C", kumulacja: "miesieczny", sposob: "od_nadwyzki",
                    progi: [{ od: 0, st: 18 }, { od: 100000, st: 14 }, { od: 200000, st: 10 }] };
const MODEL_D = { model: "D", kumulacja: "brak", sposob: "stala", stala: 20, progi: [] };

const faktury = (...kwoty) => kwoty.map((kwota) => ({ kwota }));

console.log("\nModel A: kumulacja miesięczna, stawka od całości obrotu");

kwotaRowna(liczOkres(MODEL_A, faktury(49000)).suma, 4900,
  "1. obrót 49 000 poniżej progu, cała kwota po stawce dolnej");

kwotaRowna(liczOkres(MODEL_A, faktury(50000)).suma, 6000,
  "2. obrót dokładnie na progu, wyższa stawka obejmuje całość");

const A3 = liczOkres(MODEL_A, faktury(26000, 25000));
kwotaRowna(A3.suma, 6120, "3. dwie faktury 26 000 + 25 000, stawka podniesiona wstecz");
t.ok(A3.pozycje.every((p) => Math.abs(p.stawka - 12) < 0.001),
  "3. obie pozycje rozliczone po 12 procent, nie tylko ta przekraczająca próg");
t.ok(Math.abs(26000 * 0.10 + 25000 * 0.12 - 5600) < ZAOKR &&
     Math.abs(A3.suma - 5600) > 1,
  "3. naiwne liczenie faktura po fakturze dałoby 5 600 zł, czyli o 520 zł za mało");

kwotaRowna(liczOkres(MODEL_A, faktury(48000)).suma, 4800,
  "4. po rezygnacji obrót spada do 48 000, cały miesiąc wraca na 10 procent");

kwotaRowna(liczOkres(MODEL_A, []).suma, 0, "17. okres bez faktur daje zero prowizji");

kwotaRowna(liczOkres(MODEL_A_ARKUSZ, faktury(59000)).suma, 7080,
  "13. wariant z progiem malejącym, 59 000 poniżej progu");
kwotaRowna(liczOkres(MODEL_A_ARKUSZ, faktury(60000)).suma, 6000,
  "14. wariant z progiem malejącym, 60 000 dokładnie na progu");

console.log("\nModel B: kumulacja roczna, stawka od nadwyżki");

const B5 = liczProwizje(MODEL_B, 490000, 15000);
kwotaRowna(B5.kwota, 2875, "5. faktura 15 000 przekraczająca próg 500 000, podział na dwie stawki");
t.ok(Math.abs(B5.stawka - 19.1667) < 0.01,
  "5. stawka efektywna tej faktury to 19,17 procent (jest " + B5.stawka.toFixed(2) + ")");
t.rowne(B5.rozbicie.length, 2, "5. rozbicie pokazuje dwie warstwy progowe");

kwotaRowna(liczProwizje(MODEL_B_DEMO, 490000, 15000).kwota, 2500,
  "15. wariant demonstracyjny z warsztatu, ten sam mechanizm podziału");

console.log("\nModel C: kumulacja miesięczna, stawka od nadwyżki");

const C6 = liczProwizje(MODEL_C, 0, 102000);
kwotaRowna(C6.kwota, 18280, "6. obrót 102 000, pierwsze 100 000 po 18 procent, nadwyżka po 14");
t.rowne(C6.rozbicie.length, 2, "6. rozbicie pokazuje obie warstwy");

kwotaRowna(liczProwizje(MODEL_C_3, 0, 250000).kwota, 37000,
  "16. obrót 250 000 przechodzi przez dwa progi naraz");

console.log("\nModel D: stała stawka");

kwotaRowna(liczOkres(MODEL_D, faktury(45000, 30000, 12500)).suma, 17500,
  "7. stała stawka 20 procent, bez wrażliwości na obrót okresu");
t.ok(liczOkres(MODEL_D, faktury(45000, 30000, 12500)).pozycje
       .every((p) => Math.abs(p.stawka - 20) < 0.001),
  "7. każda pozycja po tej samej stawce");

console.log("\nRóżnica między modelami na tych samych danych");

const obrot = 102000;
const odCalosci = liczProwizje({ ...MODEL_C, sposob: "od_calosci" }, 0, obrot).kwota;
const odNadwyzki = liczProwizje(MODEL_C, 0, obrot).kwota;
t.ok(odCalosci !== odNadwyzki,
  "ten sam obrót daje inny wynik od całości (" + odCalosci.toFixed(0) +
  " zł) i od nadwyżki (" + odNadwyzki.toFixed(0) + " zł)");

console.log("\nNadpisanie indywidualne wlicza się do puli progowej (D-137)");

/* Wniosek z nadpisaną stawką nadal podnosi obrót okresu, więc pozostałe wnioski
   mogą przez niego przeskoczyć próg. */
const zNadpisanym = liczOkres(MODEL_A, faktury(30000, 25000)).suma;
const bezNadpisanego = liczOkres(MODEL_A, faktury(25000)).suma;
t.ok(zNadpisanym > bezNadpisanego,
  "obecność drugiej faktury w okresie zmienia rozliczenie pozostałych (" +
  bezNadpisanego.toFixed(0) + " zł wobec " + zNadpisanym.toFixed(0) + " zł)");

console.log("\nFaktury korygujące, czyli kwoty ujemne");

/* Korekta musi zdejmowac obrot ta sama stawka, ktora go naliczyla. Inaczej
   korekta zlozona z oryginalem nie wyzeruje sie i prowizja zostaje zawyzona. */
kwotaRowna(liczProwizje(MODEL_C, 60000, -5000).kwota, -900,
  "korekta 5 000 przy obrocie 60 000 zdejmuje 900 zł, czyli 18 procent z warstwy dolnej");

kwotaRowna(liczProwizje(MODEL_C, 105000, -10000).kwota, -1600,
  "korekta przechodząca przez próg w dół rozlicza obie warstwy (700 + 900)");

kwotaRowna(liczOkres(MODEL_C, [{ kwota: 60000 }, { kwota: -5000 }]).suma, 9900,
  "okres z korektą: 10 800 minus 900");

const oryginal = liczProwizje(MODEL_C, 0, 60000).kwota;
const korekta = liczProwizje(MODEL_C, 60000, -60000).kwota;
kwotaRowna(oryginal + korekta, 0,
  "pełna korekta faktury zeruje prowizję z tej faktury");

kwotaRowna(liczProwizje(MODEL_C, 3000, -10000).kwota, -540,
  "korekta większa niż obrót zdejmuje tylko to, co faktycznie było naliczone");

kwotaRowna(liczProwizje(MODEL_A, 50000, -5000).kwota, -500,
  "model od całości też obsługuje korektę");
kwotaRowna(liczProwizje(MODEL_D, 50000, -5000).kwota, -1000,
  "stała stawka też obsługuje korektę");

console.log("\nKorekta trafia do okresu, w którym ją wystawiono (D-161)");
const { rozliczOkresy, warunkiNaDzien, ProwizjaError } = w.Prowizja;
const wersja = (id, od, doDnia, warunki) => Object.assign({ id, od, do: doDnia }, warunki);
const A_2026 = [wersja("W1", "2026-01-01", null, MODEL_A)];

const bezKorekty = rozliczOkresy(A_2026, [{ id: "F1", data: "2026-01-20", kwota: 60000 },
                                          { id: "F2", data: "2026-03-05", kwota: 20000 }]);
const zKorekta = rozliczOkresy(A_2026, [{ id: "F1", data: "2026-01-20", kwota: 60000 },
                                        { id: "F2", data: "2026-03-05", kwota: 20000 },
                                        { id: "K1", data: "2026-03-10", kwota: -10000, korygowana: "F1" }]);
const okres = (wynik, klucz) => wynik.okresy.find((o) => o.klucz === klucz);
kwotaRowna(okres(zKorekta, "2026-01").suma, okres(bezKorekty, "2026-01").suma,
  "styczeń, czyli okres faktury pierwotnej, zostaje nietknięty (7 200 zł)");
kwotaRowna(okres(zKorekta, "2026-03").suma, 2000 - 1200,
  "marzec: 2 000 z własnej faktury minus 1 200 z korekty po stawce styczniowej 12%");
t.rowne(okres(zKorekta, "2026-03").obrot, 20000,
  "korekta nie zmienia obrotu marca, więc nie przesuwa marcowych progów");
kwotaRowna(zKorekta.suma, bezKorekty.suma - 1200, "łącznie prowizja spada dokładnie o 12% korekty");

const pelna = rozliczOkresy(A_2026, [{ id: "F1", data: "2026-01-20", kwota: 60000 },
                                     { id: "K1", data: "2026-02-02", kwota: -60000, korygowana: "F1" }]);
kwotaRowna(pelna.suma, 0, "pełna korekta w następnym miesiącu zeruje prowizję z faktury");

let kod = null;
try { rozliczOkresy(A_2026, [{ id: "K9", data: "2026-03-10", kwota: -500, korygowana: "NIEMA" }]); }
catch (e) { kod = e instanceof ProwizjaError ? e.kod : "inny"; }
t.rowne(kod, "brak_pierwotnej", "korekta nieznanej faktury jest odrzucana, a nie liczona po cichu");

console.log("\nNowe warunki działają od swojej daty, nigdy wstecz (D-23, D-162)");
const B_STARE = wersja("B1", "2026-01-01", "2026-06-30", MODEL_B);
const B_NOWE = wersja("B2", "2026-07-01", null, { kumulacja: "roczny", sposob: "od_nadwyzki",
                                                 progi: [{ od: 0, st: 15 }] });
const przed = rozliczOkresy([B_STARE], [{ id: "F1", data: "2026-03-01", kwota: 100000 }]);
const po = rozliczOkresy([B_STARE, B_NOWE], [{ id: "F1", data: "2026-03-01", kwota: 100000 },
                                            { id: "F2", data: "2026-08-01", kwota: 100000 }]);
kwotaRowna(po.okresy[0].pozycje.find((p) => p.id === "F1").prowizja, przed.suma,
  "faktura z marca zostaje po 20%, mimo że od lipca obowiązują nowe progi");
kwotaRowna(po.okresy[0].pozycje.find((p) => p.id === "F2").prowizja, 15000,
  "faktura z sierpnia liczona po nowych warunkach, 15%");

const WEWN_STALA = wersja("P1", "2026-01-01", "2026-12-31", { kumulacja: "miesieczny", sposob: "stala", stala: 5, progi: [] });
const WEWN_PROGI = wersja("P2", "2027-01-01", null, { kumulacja: "miesieczny", sposob: "od_nadwyzki",
                                                     progi: [{ od: 0, st: 5 }, { od: 30000, st: 8 }] });
const wewn = rozliczOkresy([WEWN_STALA, WEWN_PROGI], [{ id: "F1", data: "2026-11-15", kwota: 40000 },
                                                     { id: "F2", data: "2027-01-15", kwota: 40000 }]);
kwotaRowna(okres(wewn, "2026-11").suma, 2000, "prowizja wewnętrzna 2026 zostaje na stałej stawce 5% (P-02)");
kwotaRowna(okres(wewn, "2027-01").suma, 30000 * 0.05 + 10000 * 0.08, "progi z 2027 działają dopiero od 2027");

kod = null;
try { warunkiNaDzien([B_STARE], "2025-12-31"); } catch (e) { kod = e instanceof ProwizjaError ? e.kod : "inny"; }
t.rowne(kod, "brak_warunkow", "faktura sprzed jakichkolwiek warunków jest odrzucana");

t.podsumuj();
