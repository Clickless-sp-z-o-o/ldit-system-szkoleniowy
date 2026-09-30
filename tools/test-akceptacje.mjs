/* ============================================================================
   Testy akceptacji (assets/akceptacje.js, assets/straznik.js).

     node tools/test-akceptacje.mjs

   Instytucja i handlowiec zglaszaja formularze klientow i zmiany danych (D-223,
   D-224), pracownik LDIT albo administrator je zatwierdza. Testy sprawdzaja
   przeplyw, zakres (tylko wlasne dane) i to, ze bez zatwierdzenia nic sie nie
   zmienia. Na koncu pliki planow szkolen (D-225) i filtry wielokrotnego wyboru.
   ============================================================================ */

import { przygotuj, licznik } from "./harness.mjs";

const t = licznik("Akceptacje");
const w = await przygotuj();
const { Akceptacje, Store, DB, Auth, Wielowybor } = w;

function zaloguj(login) { Auth.wyloguj(); Auth.zaloguj(login, "demo"); DB.przebuduj(); }
function kodBledu(fn) { try { fn(); return null; } catch (e) { return e.kod || e.message; } }
const kto = () => Akceptacje.ktoTeraz();

/* ----------------------- formularze od instytucji ----------------------- */
console.log("\nInstytucja i handlowiec zglaszaja klienta");
zaloguj("biuro@odczarujpowerbi.pl");
const instIS = Auth.sesja().instytucja_id;
const fIS = Akceptacje.zglosFormularz({ firma: "Testowa Firma sp. z o.o.", nip: "999-111-22-06", instytucja_id: instIS,
  kontakt: "Jan Test", email: "jan@test.pl", osob: 3 }, kto());
t.rowne(Store.find("formularze_oczekujace", fIS.id).wypelnil, "instytucja", "formularz instytucji oznaczony: wypelnila instytucja");
t.rowne(Store.find("formularze_oczekujace", fIS.id).status, "oczekuje", "formularz czeka na akceptacje");
t.ok(!Store.query("SELECT 1 AS x FROM klienci WHERE nip = ?", ["999-111-22-06"]).length, "klient nie powstaje przed akceptacja");
t.rowne(kodBledu(() => Akceptacje.zglosFormularz({ firma: "Obca", instytucja_id: "IS-99" }, kto())), "poza_zakresem",
  "instytucja nie zglasza formularza w imieniu innej instytucji");
t.rowne(kodBledu(() => Akceptacje.zglosFormularz({ firma: " ", instytucja_id: instIS }, kto())), "brak_firmy", "formularz bez nazwy firmy odrzucony");
t.rowne(kodBledu(() => Akceptacje.zglosFormularz({ firma: "Zly NIP", nip: "123-456-78-90", instytucja_id: instIS }, kto())), "walidacja",
  "formularz z blednym NIP odrzucony przy zgloszeniu");
t.rowne(kodBledu(() => Akceptacje.zaakceptujFormularz(fIS.id, kto())), "brak_uprawnien", "instytucja nie akceptuje wlasnego formularza");

zaloguj("mirka@dronfortech.pl");
const instH = Auth.sesja().instytucja_id;
const fH = Akceptacje.zglosFormularz({ firma: "Klient Handlowca", nip: "888-000-11-01", instytucja_id: instH }, kto());
const wierszH = Store.find("formularze_oczekujace", fH.id);
t.ok(wierszH.wypelnil === "handlowiec" && wierszH.handlowiec_id === "mirka@dronfortech.pl",
  "handlowiec z samym podgladem panelu zglasza formularz przypisany do siebie");
t.rowne(kodBledu(() => Store.update("szkoleniowcy", Store.get("szkoleniowcy")[0].id, { specjalizacja: "x" })), "brak_uprawnien",
  "funkcja zglaszania nie daje handlowcowi edycji panelu");

/* ------------------------------ akceptacja LDIT ------------------------------ */
console.log("\nPracownik LDIT i administrator rozpatruja");
zaloguj("bartek@ldit.pl");
const klientId = Akceptacje.zaakceptujFormularz(fIS.id, kto());
t.ok(Store.find("klienci", klientId).nazwa === "Testowa Firma sp. z o.o.", "akceptacja tworzy klienta z danych formularza");
t.ok(Store.query("SELECT 1 AS x FROM klient_instytucja WHERE klient_id = ? AND instytucja_id = ?", [klientId, instIS]).length,
  "klient przypisany do instytucji z formularza");
t.rowne(Store.find("formularze_oczekujace", fIS.id).klient_id, klientId, "formularz wskazuje utworzonego klienta");
t.rowne(kodBledu(() => Akceptacje.zaakceptujFormularz(fIS.id, kto())), "rozpatrzone", "drugi raz tego samego nie da sie zaakceptowac");
const istniejacy = Store.get("klienci").find((k) => k.nip && !w.Walidacja.bledy("klienci", { nip: k.nip }).length);
const fDup = Store.insert("formularze_oczekujace", { data: "2026-09-30", firma: istniejacy.nazwa, nip: istniejacy.nip,
  instytucja_id: instIS, wypelnil: "klient", status: "oczekuje" }, "FO-");
t.rowne(Akceptacje.zaakceptujFormularz(fDup.id, kto()), istniejacy.id, "klient o tym samym NIP jest dopisany, nie dublowany (D-144)");
t.rowne(kodBledu(() => Akceptacje.odrzucFormularz(fH.id, "  ", kto())), "brak_powodu", "odrzucenie bez powodu niemozliwe");
Akceptacje.odrzucFormularz(fH.id, "Niepełne dane", kto());
t.rowne(Store.find("formularze_oczekujace", fH.id).powod_odrzucenia, "Niepełne dane", "powod odrzucenia zapisany dla instytucji");

const zNipem = Store.get("formularze_oczekujace").find((f) => f.status === "oczekuje" && f.nip && w.Walidacja.bledy("klienci", { nip: f.nip }).length);
t.rowne(kodBledu(() => Akceptacje.zaakceptujFormularz(zNipem.id, kto())), "walidacja", "formularz z blednym NIP nie przejdzie bez poprawki");
t.rowne(Store.find("formularze_oczekujace", zNipem.id).status, "oczekuje", "po odmowie formularz dalej czeka");
Akceptacje.zaakceptujFormularz(zNipem.id, kto(), { nip: "526-025-02-74" });
t.rowne(Store.find("formularze_oczekujace", zNipem.id).nip, "526-025-02-74", "poprawiony NIP zapisany w formularzu");
t.ok(Store.query("SELECT 1 AS x FROM rejestr_aktywnosci WHERE typ = 'Poprawka formularza' AND obiekt = ?", [zNipem.id]).length,
  "poprawka formularza jest w rejestrze aktywnosci");

/* ------------------------------ zmiany danych ------------------------------ */
console.log("\nZmiany danych od instytucji");
zaloguj("biuro@odczarujpowerbi.pl");
const przed = Store.find("instytucje", instIS).telefon;
const pz = Akceptacje.zglosZmiane("instytucje", instIS, instIS, { telefon: "22 111 22 33", email: Store.find("instytucje", instIS).email },
  "Nowy numer", kto());
t.ok(Object.keys(JSON.parse(Store.find("propozycje_zmian", pz.id).zmiany)).join() === "telefon", "do propozycji trafia tylko zmienione pole");
t.rowne(Store.find("instytucje", instIS).telefon, przed, "zmiana nie wchodzi przed zatwierdzeniem");
t.rowne(kodBledu(() => Store.update("instytucje", instIS, { telefon: "1" })), "brak_uprawnien", "instytucja nie zmienia swoich danych bezposrednio");
t.rowne(kodBledu(() => Akceptacje.zglosZmiane("instytucje", "IS-02" === instIS ? "IS-03" : "IS-02", instIS, { telefon: "22 333 44 55" }, "", kto())),
  "poza_zakresem", "instytucja nie zglasza zmian cudzej instytucji");
t.rowne(kodBledu(() => Akceptacje.zglosZmiane("instytucje", instIS, instIS, { telefon: przed }, "", kto())), "brak_zmian", "brak zmian nie tworzy propozycji");
const obcyKlient = Store.query("SELECT k.id FROM klienci k WHERE NOT EXISTS (SELECT 1 FROM klient_instytucja ki WHERE ki.klient_id = k.id AND ki.instytucja_id = ?)", [instIS])[0].id;
t.rowne(kodBledu(() => Akceptacje.zglosZmiane("klienci", obcyKlient, instIS, { telefon: "22 333 44 55" }, "", kto())), "poza_zakresem",
  "instytucja nie zglasza zmian klienta innej instytucji");
t.rowne(kodBledu(() => Store.insert("propozycje_zmian", { instytucja_id: instIS, tabela: "instytucje", rekord_id: instIS,
  zmiany: JSON.stringify({ aktywna: { przed: 1, po: 0 } }), zgloszono: "2026-09-30 10:00" }, "PZ-")), "pole_chronione",
  "pola spoza listy zglaszanych (np. aktywna) sa zablokowane");
zaloguj("mirka@dronfortech.pl");
t.rowne(kodBledu(() => Akceptacje.zglosZmiane("instytucje", instH, instH, { telefon: "22 333 44 55" }, "", kto())), "brak_uprawnien",
  "handlowiec nie zglasza zmian danych instytucji");

zaloguj("martyna@ldit.pl");
const wZakresie = Auth.wZakresie(instIS);
if (wZakresie) {
  t.rowne(kodBledu(() => Store.update("instytucje", instIS, { telefon: "5" })), "brak_uprawnien",
    "pracownik z podgladem nie zmienia danych instytucji poza zatwierdzeniem");
  Akceptacje.zatwierdzZmiane(pz.id, kto());
  t.rowne(Store.find("instytucje", instIS).telefon, "22 111 22 33", "pracownik zatwierdza i zmiana wchodzi");
} else {
  zaloguj("bartek@ldit.pl");
  Akceptacje.zatwierdzZmiane(pz.id, kto());
  t.rowne(Store.find("instytucje", instIS).telefon, "22 111 22 33", "administrator zatwierdza i zmiana wchodzi");
}
t.rowne(Store.find("propozycje_zmian", pz.id).status, "zatwierdzona", "propozycja oznaczona jako zatwierdzona");
t.ok(Store.query("SELECT 1 AS x FROM rejestr_aktywnosci WHERE typ = 'Zatwierdzenie zmiany danych'").length, "zatwierdzenie w rejestrze aktywnosci");

/* --------------------------- zakres widocznosci --------------------------- */
console.log("\nKazdy widzi tylko swoje zgloszenia");
zaloguj("biuro@odczarujpowerbi.pl");
t.ok(DB.PROPOZYCJE.every((p) => p.isId === instIS), "instytucja widzi tylko wlasne propozycje");
t.ok(DB.KOLEJKA.every((k) => k.isId === instIS), "instytucja widzi tylko wlasne formularze");
zaloguj("mirka@dronfortech.pl");
t.ok(DB.KOLEJKA.every((k) => k.handlowiec === "mirka@dronfortech.pl"), "handlowiec widzi tylko swoje formularze");

/* ------------------------- ochrona tresci zgloszen ------------------------- */
console.log("\nZgloszenia nie daja sie podmienic ani podpisac cudzym kontem");
zaloguj("biuro@odczarujpowerbi.pl");
const pzTel = Akceptacje.zglosZmiane("instytucje", instIS, instIS, { telefon: "22 444 55 66" }, "", kto());
t.rowne(kodBledu(() => Store.insert("formularze_oczekujace", { data: "2026-09-30", firma: "Podpis", instytucja_id: instIS,
  wypelnil: "instytucja", status: "oczekuje", zglosil_id: "bartek@ldit.pl" }, "FO-")), "brak_uprawnien",
  "instytucja nie podpisuje zgloszenia cudzym kontem");
t.rowne(kodBledu(() => Store.insert("formularze_oczekujace", { data: "2026-09-30", firma: "Od razu", instytucja_id: instIS,
  wypelnil: "instytucja", status: "zaakceptowany", zglosil_id: Auth.sesja().uzytkownik_id }, "FO-")), "brak_uprawnien",
  "instytucja nie wysyla zgloszenia od razu zaakceptowanego");
zaloguj("bartek@ldit.pl");
t.rowne(kodBledu(() => Store.update("propozycje_zmian", pzTel.id, { zmiany: JSON.stringify({ aktywna: { przed: 1, po: 0 } }) })),
  "pole_chronione", "zatwierdzajacy nie podmienia tresci propozycji przed zatwierdzeniem");
Akceptacje.odrzucZmiane(pzTel.id, "Test", kto());
t.rowne(Store.find("propozycje_zmian", pzTel.id).status, "odrzucona", "rozpatrzenie propozycji dalej dziala");

console.log("\nKlient wspolny wymaga potwierdzenia (D-144, D-150)");
const cudzy = Store.query("SELECT k.id, k.nazwa, k.nip FROM klienci k WHERE k.instytucja_id IS NOT NULL AND k.instytucja_id <> ? " +
  "AND NOT EXISTS (SELECT 1 FROM klient_instytucja ki WHERE ki.klient_id = k.id AND ki.instytucja_id = ?)", [instIS, instIS])
  .find((k) => k.nip && !w.Walidacja.bledy("klienci", { nip: k.nip }).length);
const fCudzy = Store.insert("formularze_oczekujace", { data: "2026-09-30", firma: "Inna nazwa", nip: cudzy.nip,
  instytucja_id: instIS, wypelnil: "klient", status: "oczekuje" }, "FO-");
t.rowne(kodBledu(() => Akceptacje.zaakceptujFormularz(fCudzy.id, kto())), "klient_wspolny",
  "klient innej instytucji nie jest laczony bez potwierdzenia");
t.ok(!Store.query("SELECT 1 AS x FROM klient_instytucja WHERE klient_id = ? AND instytucja_id = ?", [cudzy.id, instIS]).length,
  "bez potwierdzenia instytucja nie dostaje cudzego klienta");
t.rowne(Akceptacje.zaakceptujFormularz(fCudzy.id, kto(), null, { polaczZInnaInstytucja: true }), cudzy.id,
  "po potwierdzeniu klient jest polaczony, nie dublowany");

/* ------------------------------ pliki planow ------------------------------ */
console.log("\nPliki planow szkolen");
zaloguj("bartek@ldit.pl");
const szk = Store.get("katalog_szkolen")[0];
const plik = Store.insert("pliki_szkolen", { szkolenie_id: szk.id, nazwa: "program.pdf", typ: "application/pdf", rozmiar: 3,
  rodzaj: "program", dodano: "2026-09-30", dodal_id: "bartek@ldit.pl", tresc: "YWJj" }, "PL-");
t.rowne(Store.find("pliki_szkolen", plik.id).tresc, "YWJj", "administrator wgrywa plik planu");
Store.update("katalog_szkolen", szk.id, { cel_szkolenia: "Nauka Power BI", efekty_uczenia: "Raporty" });
t.rowne(Store.find("katalog_szkolen", szk.id).cel_szkolenia, "Nauka Power BI", "szczegoly planu zapisuja sie w katalogu");
zaloguj("biuro@odczarujpowerbi.pl");
t.rowne(kodBledu(() => Store.insert("pliki_szkolen", { szkolenie_id: szk.id, nazwa: "x", rozmiar: 1, dodano: "2026-09-30", tresc: "eA==" }, "PL-")),
  "brak_uprawnien", "instytucja nie wgrywa plikow bez edycji modulu Instytucje");

/* ------------------------ filtry wielokrotnego wyboru ------------------------ */
console.log("\nFiltry wielokrotnego wyboru");
t.rowne(Wielowybor.zTekstu("IS-01, IS-02,,").join("|"), "IS-01|IS-02", "tekst z adresu na liste wartosci");
t.rowne(Wielowybor.naTekst(["a", "b"]), "a,b", "lista wartosci na tekst do adresu");
t.ok(Wielowybor.pasuje([], "cokolwiek"), "pusty wybor oznacza wszystko");
t.ok(Wielowybor.pasuje(["a", "b"], "b") && !Wielowybor.pasuje(["a"], "b"), "wybor kilku wartosci dziala jak lub");

t.podsumuj();
