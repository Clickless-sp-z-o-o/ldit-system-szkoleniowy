/* ============================================================================
   Testy statusow wniosku (assets/statusy.js).

     node tools/test-statusy.mjs

   Status skladania, decyzja, rozliczenie i etap (D-146) zmieniaja sie razem.
   Testy sprawdzaja reguly akcji, zapis z przebiegiem wniosku, spojnosc danych
   startowych i filtr Bazy danych "przed zlozeniem wniosku".
   ============================================================================ */

import { przygotuj, licznik } from "./harness.mjs";

const t = licznik("Statusy wniosku");
const w = await przygotuj();
const { Statusy, Store, DB, Auth } = w;
const DZIS = "2026-09-30";

function kodBledu(fn) {
  try { fn(); return null; } catch (e) { return e.kod || e.message; }
}

/* ------------------------------ reguly akcji ------------------------------ */
console.log("\nAkcja daje pelny zestaw kolumn");
const niezlozony = { statusSkl: "Niezłożony", statusDec: null, rozliczenie: "Brak", etap: 3, dataWniosku: null };
const zl = Statusy.patch(niezlozony, "zlozony", DZIS);
t.rowne(zl.status_skladania, "Złożony", "zlozenie ustawia status skladania");
t.rowne(zl.etap, 5, "zlozenie przestawia etap na 5 (oczekiwanie na decyzje)");
t.rowne(zl.data_wniosku, DZIS, "zlozenie bez daty wniosku wpisuje date dzisiejsza");
t.rowne(Statusy.patch(Object.assign({}, niezlozony, { dataWniosku: "2026-03-01" }), "zlozony", DZIS).data_wniosku, undefined,
  "istniejaca data wniosku nie jest nadpisywana");
const poz = Statusy.patch(niezlozony, "pozytywna", DZIS);
t.ok(poz.status_decyzji === "Pozytywna" && poz.status_finansowy === "Oczekuje" && poz.etap === 7,
  "decyzja pozytywna: rozliczenie Oczekuje, etap 7");
const neg = Statusy.patch(niezlozony, "negatywna", DZIS);
t.ok(neg.status_decyzji === "Negatywna" && neg.status_finansowy === "Brak" && neg.etap === 6, "decyzja negatywna: etap 6, bez rozliczenia");
const zafakt = { statusSkl: "Złożony", statusDec: "Pozytywna", rozliczenie: "Zafakturowany", etap: 9 };
const ponownie = Statusy.patch(zafakt, "pozytywna", DZIS);
t.ok(ponownie.status_finansowy === "Zafakturowany" && ponownie.etap === 9, "ponowna decyzja pozytywna nie cofa rozliczenia ani etapu");
t.rowne(Statusy.patch(zafakt, "rozliczony", DZIS).etap, 10, "rozliczenie konczy proces (etap 10)");
t.rowne(Statusy.patch(zafakt, "zlozony", DZIS).status_finansowy, "Brak", "cofniecie decyzji zdejmuje rozliczenie");
t.rowne(kodBledu(() => Statusy.patch(niezlozony, "rozliczony", DZIS)), "wymaga_pozytywnej", "rozliczenie bez decyzji pozytywnej odrzucone");
t.rowne(kodBledu(() => Statusy.patch(niezlozony, "wymyslona", DZIS)), "nieznana_akcja", "nieznana akcja odrzucona");
t.rowne(kodBledu(() => Statusy.akcjaDlaStatusu("Coś")), "nieznany_status", "nieznany status odrzucony");
t.ok(Statusy.LISTA.every((s) => Statusy.AKCJE[Statusy.akcjaDlaStatusu(s)]), "kazdy status z listy ma akcje");

/* ---------------------- dane startowe sa spojne z regulami ---------------------- */
console.log("\nDane startowe zgodne z regula etapow");
Auth.zaloguj("bartek@ldit.pl", "demo");
DB.przebuduj();
const rozjechane = DB.WNIOSKI_WSZYSTKIE.filter((x) => {
  const p = Statusy.patch(x, Statusy.akcjaDlaStatusu(Statusy.wartosc(x)), DZIS);
  return x.rozliczenie !== "Zafakturowany" && x.rozliczenie !== "Rozliczone" && p.etap !== x.etap;
});
t.rowne(rozjechane.length, 0, "etap kazdego wniosku zgadza sie z jego statusem (" + DB.WNIOSKI_WSZYSTKIE.length + " wnioskow)");

/* --------------------------- zapis z przebiegiem --------------------------- */
console.log("\nZapis akcji i przebieg wniosku");
const wn = DB.WNIOSKI_WSZYSTKIE.find((x) => Statusy.wartosc(x) === "Niezłożony");
const przebiegPrzed = Store.query("SELECT COUNT(*) AS n FROM przebieg_wniosku WHERE wniosek_id = ?", [wn.id])[0].n;
Statusy.zmien(wn, "zlozony", { czas: DZIS + " 10:00", uzytkownik: "bartek@ldit.pl" });
const poZapisie = Store.find("wnioski", wn.id);
t.ok(poZapisie.status_skladania === "Złożony" && poZapisie.etap === 5, "zapis zmienia wniosek w bazie");
const wpisy = Store.query("SELECT * FROM przebieg_wniosku WHERE wniosek_id = ? ORDER BY czas", [wn.id]);
t.rowne(wpisy.length, przebiegPrzed + 1, "zmiana etapu dopisuje wpis do przebiegu");
t.ok(wpisy[wpisy.length - 1].etap_z === 3 && wpisy[wpisy.length - 1].etap_do === 5, "przebieg zapisuje etap z i do");
const poAdapterze = DB.WNIOSKI_WSZYSTKIE.find((x) => x.id === wn.id);
t.rowne(Statusy.wartosc(poAdapterze), "Czekamy", "listy widza nowy status od razu (adapter przebudowany)");
Statusy.zmien(poAdapterze, "zlozony", { czas: DZIS + " 10:05", uzytkownik: "bartek@ldit.pl" });
t.rowne(Store.query("SELECT COUNT(*) AS n FROM przebieg_wniosku WHERE wniosek_id = ?", [wn.id])[0].n, przebiegPrzed + 1,
  "ta sama akcja bez zmiany etapu nie dokłada wpisu");

/* ---------------------- Baza danych: przed zlozeniem ---------------------- */
console.log("\nFiltr Bazy danych: przed zlozeniem wniosku");
t.ok(Statusy.klientPrzedZlozeniem([]), "klient bez wniosku jest przed zlozeniem");
t.ok(Statusy.klientPrzedZlozeniem([{ statusSkl: "NW" }]), "klient z wnioskiem NW jest przed zlozeniem");
t.ok(!Statusy.klientPrzedZlozeniem([{ statusSkl: "Złożony", statusDec: "Pozytywna" }]), "klient tylko ze zlozonym wnioskiem nie jest");
const poKliencie = Statusy.wnioskiPoKlientach(DB.WNIOSKI_WSZYSTKIE);
t.ok(DB.WNIOSKI_WSZYSTKIE.every((x) => poKliencie[x.klient].includes(x)), "grupowanie po kliencie obejmuje wszystkie wnioski");

t.podsumuj();
