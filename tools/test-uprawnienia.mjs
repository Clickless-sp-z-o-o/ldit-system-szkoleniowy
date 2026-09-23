/* ============================================================================
   Testy sesji, uprawnien i separacji danych.

     node tools/test-uprawnienia.mjs

   Sprawdzaja to, czego nie da sie sprawdzic okiem na makiecie: czy po
   zalogowaniu na konto pracownika w pamieci strony w ogole sa dane, ktorych
   ta rola nie powinna widziec. Odpowiada na zarzut z warsztatu, ze pracownik
   widzi wszystko (D-114), i na wymog separacji instytucji (D-35, D-76).
   ============================================================================ */

import { przygotuj, licznik } from "./harness.mjs";

const HASLO = "demo";
const t = licznik("Uprawnienia i separacja");

const w = await przygotuj();
const { Auth, DB, Store } = w;

function zaloguj(login) {
  const wynik = Auth.zaloguj(login, HASLO);
  if (!wynik.ok) throw new Error("Nie udalo sie zalogowac na " + login + ": " + wynik.blad);
  return wynik.sesja;
}

const WSZYSTKICH_INSTYTUCJI = Store.query("SELECT COUNT(*) AS n FROM instytucje")[0].n;
const WSZYSTKICH_KLIENTOW = Store.query("SELECT COUNT(*) AS n FROM klienci")[0].n;

/* ------------------------------ logowanie ------------------------------ */
console.log("\nLogowanie");

t.ok(!Auth.zaloguj("bartek@ldit.pl", "zle-haslo").ok, "zle haslo nie wpuszcza");
t.ok(!Auth.zaloguj("nikt@nigdzie.pl", HASLO).ok, "nieistniejace konto nie wpuszcza");
t.ok(Auth.zaloguj("BARTEK@LDIT.PL", HASLO).ok, "login jest niewrazliwy na wielkosc liter");
t.ok(Store.query("SELECT * FROM logowania WHERE wynik = 'blad hasla'").length >= 2,
     "nieudane proby trafiaja do rejestru logowan (D-32)");

Auth.wyloguj();
t.ok(!Auth.zalogowany(), "wylogowanie konczy sesje");
t.rowne(DB.WNIOSKI_2026.length, 0, "bez sesji adapter nie wydaje zadnych wnioskow");
t.rowne(DB.KLIENCI.length, 0, "bez sesji adapter nie wydaje zadnych klientow");

/* ------------------------------ administrator ------------------------------ */
console.log("\nAdministrator (Bartlomiej Olejnik)");

zaloguj("bartek@ldit.pl");
t.rowne(DB.INSTYTUCJE.length, WSZYSTKICH_INSTYTUCJI, "widzi wszystkie instytucje");
t.rowne(DB.KLIENCI.length, WSZYSTKICH_KLIENTOW, "widzi wszystkich klientow");
t.ok(Auth.widziModul("admin") && Auth.widziModul("ustaw"), "ma Administracje i Ustawienia");
t.ok(DB.INSTYTUCJE.every((i) => i.prowizja !== null), "widzi warunki prowizyjne (D-07)");
t.ok(DB.FAKTURY.length > 0, "widzi faktury");
t.ok(DB.ZGLOSZENIA.length > 0, "widzi zgloszenia (D-107)");
t.ok(DB.AKTYWNOSC.length > 0, "widzi rejestr aktywnosci");
t.ok(DB.UZYTKOWNICY.length > 1, "widzi liste kont");

/* ------------------------------ pracownik LDIT ------------------------------ */
console.log("\nPracownik LDIT (Martyna Kowal, 3 z " + WSZYSTKICH_INSTYTUCJI + " instytucji)");

zaloguj("martyna@ldit.pl");
const przydzial = Store.query(
  "SELECT instytucja_id FROM uzytkownik_instytucja WHERE uzytkownik_id = 'martyna@ldit.pl'")
  .map((r) => r.instytucja_id);

t.rowne(DB.INSTYTUCJE.length, przydzial.length, "widzi tylko instytucje ze swojego przydzialu (D-113)");
t.ok(DB.INSTYTUCJE.every((i) => przydzial.includes(i.id)), "zadna obca instytucja nie wchodzi na liste");
t.ok(DB.WNIOSKI_WSZYSTKIE.every((x) => przydzial.includes(x.is)), "wszystkie wnioski sa z przydzialu");
t.ok(DB.SZKOLENIA.every((s) => przydzial.includes(s.is)), "katalog szkolen ograniczony do przydzialu");
t.ok(DB.KLIENCI.length > 0 && DB.KLIENCI.length < WSZYSTKICH_KLIENTOW,
     "widzi czesc klientow, nie caly katalog (" + DB.KLIENCI.length + " z " + WSZYSTKICH_KLIENTOW + ")");

t.ok(!Auth.widziModul("admin"), "nie ma modulu Administracja (D-114)");
t.ok(!Auth.widziModul("ustaw"), "nie ma modulu Ustawienia");
t.ok(!Auth.moze("finanse.prowizja"), "nie ma uprawnienia do stawek prowizji (D-34)");
t.ok(DB.INSTYTUCJE.every((i) => i.prowizja === null),
     "warunki prowizyjne nie trafiaja do pamieci strony, nie tylko sa ukryte");
t.ok(DB.WNIOSKI_WSZYSTKIE.every((x) => x.prowizjaProcent === null && x.prowizjaKwota === null),
     "nadpisania prowizji per wniosek sa wyczyszczone");
t.rowne(DB.FAKTURY.length, 0, "nie widzi faktur");
t.rowne(DB.AKTYWNOSC.length, 0, "nie widzi rejestru aktywnosci");
t.rowne(DB.CELE.length, 0, "nie widzi celow i premii firmy");
t.ok(Auth.moze("finanse.kwoty_wniosku"), "widzi kwoty wnioskow, bo na nich pracuje");
t.ok(Auth.moze("zgloszenia.dostep"), "ma dostep do zgloszen (D-107)");

/* ------------------------------ instytucja szkoleniowa ------------------------------ */
console.log("\nInstytucja szkoleniowa (Odczaruj Power BI)");

const sesjaIS = zaloguj("biuro@odczarujpowerbi.pl");
t.rowne(DB.INSTYTUCJE.length, 1, "widzi wylacznie wlasna instytucje (D-76)");
t.rowne(DB.INSTYTUCJE[0].id, sesjaIS.instytucja_id, "i jest to jej wlasna instytucja");
t.ok(DB.WNIOSKI_WSZYSTKIE.every((x) => x.is === sesjaIS.instytucja_id), "tylko wlasne wnioski");
t.ok(DB.KLIENCI.length > 0, "widzi wlasnych klientow (" + DB.KLIENCI.length + ")");
t.ok(!Auth.moze("finanse.prowizja"), "nie widzi wlasnej stawki prowizji (D-76)");
t.ok(DB.INSTYTUCJE[0].prowizja === null, "stawka nie jest nawet wczytana do pamieci");
t.ok(!Auth.widziModul("zglo"), "nie ma dostepu do bazy zgloszen (D-107)");
t.ok(!Auth.widziModul("admin") && !Auth.widziModul("ustaw"), "nie ma modulow LDIT");
t.ok(Auth.widziModul("terminy"), "ma kalendarz terminow (D-142)");

/* Kontrola krzyzowa: dane innej instytucji nie moga przeciec */
const obca = Store.query("SELECT id FROM instytucje WHERE id <> ?", [sesjaIS.instytucja_id])[0].id;
t.ok(!DB.KLIENCI.some((k) => k.is === obca), "w klientach nie ma ani jednego rekordu obcej instytucji");
t.ok(!Auth.wZakresie(obca), "obca instytucja jest poza zakresem konta");

/* ------------------------------ pracownik IS ------------------------------ */
console.log("\nPracownik IS, handlowiec (Miroslawa Kot, Dron Fortech)");

zaloguj("mirka@dronfortech.pl");
t.rowne(Auth.moduly().length, 1, "ma dokladnie jeden modul w menu (D-72, D-75)");
t.ok(!Auth.moze("finanse.kwoty_wniosku"), "nie widzi kwot wnioskow");
t.ok(!Auth.moze("klient.pesel"), "nie widzi numerow PESEL uczestnikow");
t.ok(DB.WNIOSKI_WSZYSTKIE.every((x) => x.przyznano === null && x.kosztCalkowity === null),
     "kwoty sa wyczyszczone w danych, nie tylko w widoku");
t.ok(DB.WNIOSKI_WSZYSTKIE.every((x) => x.uczestnicy.every((u) => u.pesel === null)),
     "PESEL uczestnikow jest wyczyszczony w danych");
t.ok(Auth.moze("klient.dane_kontaktowe"), "widzi dane kontaktowe, bo wypelnia formularz");

/* ------------------------------ klient koncowy ------------------------------ */
console.log("\nKlient koncowy");

const kontoKlienta = Store.one("SELECT login FROM uzytkownicy WHERE rola_id = 'klient'");
if (kontoKlienta) {
  zaloguj(kontoKlienta.login);
  t.rowne(Auth.moduly().length, 1, "widzi wylacznie panel wlasnego wniosku (P-33)");
} else {
  console.log("  (brak konta klienta w danych demonstracyjnych, pomijam)");
}

/* ------------------------------ macierz uprawnien ------------------------------ */
console.log("\nSpojnosc macierzy uprawnien");

const role = Store.query("SELECT id FROM role").map((r) => r.id);
const moduly = Store.query("SELECT id FROM moduly").map((m) => m.id);
const braki = [];
for (const r of role) {
  for (const m of moduly) {
    if (!Store.one("SELECT 1 AS x FROM uprawnienia WHERE rola_id = ? AND modul_id = ?", [r, m])) {
      braki.push(r + "/" + m);
    }
  }
}
t.rowne(braki.length, 0, "kazda para rola-modul ma jawny wpis, nic nie jest domyslne");

const poleBezWpisu = Store.query(
  "SELECT DISTINCT klucz FROM uprawnienia_pol").filter((p) =>
    Store.query("SELECT 1 AS x FROM uprawnienia_pol WHERE klucz = ?", [p.klucz]).length !== role.length);
t.rowne(poleBezWpisu.length, 0, "kazde pole wrazliwe ma wpis dla kazdej roli");

t.podsumuj();
