/* ============================================================================
   Testy bezpieczenstwa makiety: hasla, logowanie, sesja, straznik zapisow.

     node tools/test-bezpieczenstwo.mjs

   Sprawdzaja zasady wzorowane na Open Mercato (D-176, D-179): haslo nie lezy
   w bazie jawnie, blad logowania nie zdradza, czy konto istnieje, sesja nie
   ufa temu, co lezy w przegladarce, a zapis bez uprawnien nie dochodzi do bazy.
   ============================================================================ */

import { przygotuj, licznik } from "./harness.mjs";

const t = licznik("Bezpieczenstwo");
const w = await przygotuj();
const { Store, Auth } = w;
const HASLO = "demo";

function kodBledu(fn) {
  try { fn(); return null; } catch (e) { return e.kod || e.message; }
}

/* ------------------------------- hasla ------------------------------- */
console.log("\nHasla");
const kolumny = Store.query("PRAGMA table_info(uzytkownicy)").map((c) => c.name);
t.ok(!kolumny.includes("haslo_demo"), "w tabeli kont nie ma kolumny z jawnym haslem");
const konto = Store.one("SELECT haslo_skrot, haslo_sol FROM uzytkownicy WHERE login = 'bartek@ldit.pl'");
t.ok(konto.haslo_skrot !== HASLO && /^[0-9a-f]{64}$/.test(konto.haslo_skrot), "haslo zapisane jako skrot SHA-256");
const inneKonto = Store.one("SELECT haslo_skrot FROM uzytkownicy WHERE login = 'martyna@ldit.pl'");
t.ok(inneKonto.haslo_skrot !== konto.haslo_skrot, "to samo haslo na dwoch kontach daje rozne skroty (sol)");

/* ------------------------------ logowanie ------------------------------ */
console.log("\nLogowanie");
const nieznane = Auth.zaloguj("nikt@nigdzie.pl", HASLO);
const zleHaslo = Auth.zaloguj("bartek@ldit.pl", "zle");
t.ok(!nieznane.ok && !zleHaslo.ok, "nieznane konto i zle haslo nie wpuszczaja");
t.rowne(nieznane.blad, zleHaslo.blad, "komunikat nie zdradza, czy konto istnieje");

for (let i = 0; i < Auth.MAX_PROB - 1; i++) Auth.zaloguj("martyna@ldit.pl", "zle");
t.ok(Auth.zaloguj("martyna@ldit.pl", "zle").ok === false, "piata nieudana proba");
const poBlokadzie = Auth.zaloguj("martyna@ldit.pl", HASLO);
t.ok(!poBlokadzie.ok && /prób/.test(poBlokadzie.blad), "po serii prob nawet poprawne haslo czeka na koniec blokady");
w.KFS.db.run("UPDATE uzytkownicy SET zablokowane_do = '2000-01-01T00:00:00.000Z' WHERE id = 'martyna@ldit.pl'");
t.ok(Auth.zaloguj("martyna@ldit.pl", HASLO).ok, "po uplywie blokady poprawne haslo wpuszcza");

/* -------------------------------- sesja -------------------------------- */
console.log("\nSesja");
Auth.zaloguj("biuro@odczarujpowerbi.pl", HASLO);
const wPrzegladarce = w.localStorage.getItem(Auth.KLUCZ_SESJI);
t.ok(/^[0-9a-f]{48}$/.test(wPrzegladarce), "przegladarka trzyma wylacznie losowy token");
t.ok(!/rola|admin|instytucj/.test(wPrzegladarce), "w przegladarce nie ma roli ani zakresu do podmiany");
w.localStorage.setItem(Auth.KLUCZ_SESJI, "0".repeat(48));
t.ok(!Auth.zalogowany(), "podrobiony token nie daje sesji");

Auth.zaloguj("biuro@odczarujpowerbi.pl", HASLO);
const token = w.localStorage.getItem(Auth.KLUCZ_SESJI);
w.KFS.db.run("UPDATE sesje SET ostatnia_aktywnosc = '2000-01-01T00:00:00.000Z' WHERE token = ?", [token]);
await new Promise((r) => setTimeout(r, 1100));
t.ok(!Auth.zalogowany(), "sesja wygasa po bezczynnosci");

Auth.zaloguj("biuro@odczarujpowerbi.pl", HASLO);
const idIS = Auth.sesja().uzytkownik_id;
w.KFS.db.run("UPDATE uzytkownicy SET zablokowane = 1 WHERE id = ?", [idIS]);
await new Promise((r) => setTimeout(r, 1100));
t.ok(!Auth.zalogowany(), "zablokowanie konta przez administratora konczy trwajaca sesje");
w.KFS.db.run("UPDATE uzytkownicy SET zablokowane = 0 WHERE id = ?", [idIS]);

/* --------------------------- straznik zapisow --------------------------- */
console.log("\nStraznik zapisow");
Auth.wyloguj();
t.rowne(kodBledu(() => Store.update("instytucje", "IS-01", { nazwa: "x" })), "brak_sesji", "bez sesji nic sie nie zapisze");

Auth.zaloguj("martyna@ldit.pl", HASLO);
t.rowne(kodBledu(() => Store.update("instytucje", "IS-01", { opis_dzialalnosci: "x" })), "brak_uprawnien",
  "pracownik z podgladem instytucji nie edytuje instytucji");
const wniosekPracownika = Store.one("SELECT w.id FROM wnioski w JOIN v_zakres_uzytkownika z ON z.instytucja_id = w.instytucja_id " +
                                    "WHERE z.uzytkownik_id = 'martyna@ldit.pl' LIMIT 1");
t.rowne(kodBledu(() => Store.update("wnioski", wniosekPracownika.id, { prowizja_wartosc: 5, prowizja_typ_nadpisania: "procent" })),
  "pole_chronione", "pracownik nie nadpisze prowizji we wniosku (D-07)");
t.rowne(kodBledu(() => Store.update("wnioski", wniosekPracownika.id, { etap: 4 })), null, "pracownik edytuje zwykle pole wniosku ze swojego zakresu");
t.rowne(kodBledu(() => Store.exec("DELETE FROM wnioski")), "brak_uprawnien", "pracownik nie wykona surowego SQL");

Auth.zaloguj("biuro@odczarujpowerbi.pl", HASLO);
const mojaInst = Auth.sesja().instytucja_id;
const cudzy = Store.one("SELECT id FROM wnioski WHERE instytucja_id <> ? LIMIT 1", [mojaInst]);
const wlasny = Store.one("SELECT id FROM wnioski WHERE instytucja_id = ? LIMIT 1", [mojaInst]);
t.rowne(kodBledu(() => Store.update("wnioski", cudzy.id, { etap: 4 })), "brak_uprawnien",
  "instytucja nie ma edycji Dofinansowan, wiec nie zmieni wniosku");
t.rowne(kodBledu(() => Store.insert("terminy", { instytucja_id: "IS-99", szkolenie_id: "SZ-101", nazwa: "x",
                                               status_realizacji: "Wolny", zapisani: 0, limit_miejsc: 5 }, "TR-")),
  "poza_zakresem", "instytucja nie doda terminu cudzej instytucji");
const mojTermin = Store.one("SELECT id FROM terminy WHERE instytucja_id = ? LIMIT 1", [mojaInst]);
t.rowne(kodBledu(() => Store.update("terminy", mojTermin.id, { instytucja_id: "IS-01" === mojaInst ? "IS-02" : "IS-01" })),
  "poza_zakresem", "instytucja nie przeniesie wlasnego terminu do konkurencji");
t.rowne(kodBledu(() => Store.update("terminy", mojTermin.id, { miejsce: "Sala 2" })), null, "instytucja edytuje wlasny termin");
t.ok(wlasny !== null, "instytucja ma wlasne wnioski w bazie startowej");

console.log("\nTryb systemowy i eksport (audyt separacji 29.09)");
t.ok(typeof Store.systemowo === "undefined", "strony nie maja dostepu do trybu systemowego");
t.ok(kodBledu(() => Store.odbierzTrybSystemowy()) !== null, "trybu systemowego nie da sie odebrac drugi raz");
t.rowne(kodBledu(() => Store.exportJSON()), "brak_uprawnien", "instytucja nie wyeksportuje calej bazy");
const obcyKlient = Store.one("SELECT k.id FROM klienci k WHERE k.id NOT IN (SELECT klient_id FROM klient_instytucja WHERE instytucja_id = ?) " +
                             "AND (k.instytucja_id IS NULL OR k.instytucja_id <> ?) LIMIT 1", [mojaInst, mojaInst]);
Auth.zaloguj("lucja@ldit.pl", HASLO);
const instLucji = Auth.instytucje()[0];
const spozaLucji = Store.one("SELECT k.id FROM klienci k WHERE k.id NOT IN (SELECT klient_id FROM klient_instytucja WHERE instytucja_id IN " +
  "(SELECT instytucja_id FROM v_zakres_uzytkownika WHERE uzytkownik_id = 'lucja@ldit.pl')) AND k.instytucja_id NOT IN " +
  "(SELECT instytucja_id FROM v_zakres_uzytkownika WHERE uzytkownik_id = 'lucja@ldit.pl') LIMIT 1");
t.rowne(kodBledu(() => Store.insert("klient_instytucja", { klient_id: spozaLucji.id, instytucja_id: instLucji })), "poza_zakresem",
  "pracownik nie dopisze do swojej instytucji klienta spoza zakresu");
t.ok(obcyKlient !== null, "w bazie startowej sa klienci spoza zakresu instytucji");

console.log("\nRejestr aktywnosci tylko do dopisywania");
Auth.zaloguj("bartek@ldit.pl", HASLO);
const wpis = Store.insert("rejestr_aktywnosci", { czas: "2026-09-29 10:00", kto: "Test", typ: "Test", obiekt: "x" }, "AKT-");
t.ok(!!wpis.id, "dopisanie wpisu do rejestru dziala");
t.rowne(kodBledu(() => Store.update("rejestr_aktywnosci", wpis.id, { kto: "ktos inny" })), "rejestr_tylko_dopisywanie",
  "nawet administrator nie zmieni wpisu w rejestrze");
t.rowne(kodBledu(() => Store.remove("rejestr_aktywnosci", wpis.id)), "rejestr_tylko_dopisywanie",
  "nawet administrator nie usunie wpisu z rejestru");
t.rowne(kodBledu(() => Store.update("wnioski", cudzy.id, { prowizja_wartosc: 12, prowizja_typ_nadpisania: "procent" })), null,
  "administrator nadpisuje prowizje");

console.log("\nWstawianie danych do HTML (XSS)");
const zlosliwe = '<img src=x onerror="alert(1)">';
t.ok(!/[<>"]/.test(w.esc(zlosliwe)), "esc zamienia znaczniki i cudzyslowy na encje");
t.rowne(w.esc(null), "", "esc(null) daje pusty tekst, nie slowo null");
t.ok(!/'/.test(w.escJs("O'Brien")) && w.escJs("O'Brien").includes("\\"), "escJs chroni apostrof w onclick");
t.ok(!/</.test(w.escJs("</script>")), "escJs nie przepuszcza zamkniecia skryptu");

t.podsumuj();
