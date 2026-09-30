/* ============================================================================
   Testy natychmiastowego zapisu bazy (KFS.zapiszTeraz).

     node tools/test-zapis.mjs

   Logowanie zapisuje sesje w bazie i od razu przechodzi na index.html. Zwykly
   zapis ma opoznienie, wiec ginal razem ze strona, a index wracal na logowanie.
   Testy sprawdzaja, ze po zapiszTeraz sesja jest juz w zapisanej bazie.
   ============================================================================ */

import { przygotuj, licznik } from "./harness.mjs";

const t = licznik("Zapis natychmiastowy");
const w = await przygotuj();
const { Auth, KFS } = w;

/* Sesje z zapisanej bazy odczytujemy tym samym silnikiem, ktory dziala w przegladarce */
async function sesjeWZapisanejBazie() {
  const b64 = w.localStorage.getItem(KFS.KLUCZ);
  if (!b64) return null;
  const SQL = await w.initSqlJs({ wasmBinary: Buffer.from(w.SQL_WASM_BASE64, "base64") });
  const db = new SQL.Database(Buffer.from(b64, "base64"));
  const r = db.exec("SELECT token FROM sesje");
  db.close();
  return r.length ? r[0].values.map((v) => v[0]) : [];
}

console.log("\nLogowanie zapisuje sesje od razu");
t.rowne(KFS.tryb, "przegladarka", "test dziala w trybie przegladarki (localStorage)");
const wynik = Auth.zaloguj("bartek@ldit.pl", "demo");
t.ok(wynik.ok, "logowanie poprawne");
const token = w.localStorage.getItem(Auth.KLUCZ_SESJI);
const przed = await sesjeWZapisanejBazie();
t.ok(!przed || !przed.includes(token), "zaraz po logowaniu sesji nie ma jeszcze w zapisanej bazie (zapis opozniony)");
await KFS.zapiszTeraz();
t.ok((await sesjeWZapisanejBazie()).includes(token), "po zapiszTeraz sesja jest w zapisanej bazie");
t.ok(KFS.zapisany, "flaga zapisany ustawiona");

console.log("\nWylogowanie usuwa sesje z zapisanej bazy");
Auth.wyloguj();
await KFS.zapiszTeraz();
t.ok(!(await sesjeWZapisanejBazie()).includes(token), "po wylogowaniu sesji nie ma w zapisanej bazie");

console.log("\nBrak miejsca w localStorage");
const oryginal = w.localStorage.setItem;
w.localStorage.setItem = () => { throw new Error("QuotaExceededError"); };
let odrzucone = false;
await KFS.zapiszTeraz().catch(() => { odrzucone = true; });
w.localStorage.setItem = oryginal;
t.ok(!odrzucone, "zapiszTeraz nie odrzuca obietnicy, wiec przejscie na strone i tak nastapi");
t.rowne(KFS.zapisany, false, "flaga zapisany pokazuje, ze zapis sie nie udal");

console.log("\nPowloka (tylko odczyt) nie zapisuje bazy (D-222)");
await KFS.zapiszTeraz();
const zapisanaPrzed = w.localStorage.getItem(KFS.KLUCZ);
KFS.tylkoOdczyt = true;
const drugi = Auth.zaloguj("bartek@ldit.pl", "demo");
await KFS.zapiszTeraz();
KFS.zapisz();
await new Promise((r) => setTimeout(r, 400));
t.ok(drugi.ok, "w trybie tylko odczytu logowanie w pamieci dziala");
t.rowne(w.localStorage.getItem(KFS.KLUCZ), zapisanaPrzed, "zapisana baza jest bez zmian, zapis pominiety");
KFS.tylkoOdczyt = false;
await KFS.zapiszTeraz();
t.ok((await sesjeWZapisanejBazie()).includes(w.localStorage.getItem(Auth.KLUCZ_SESJI)), "po wylaczeniu trybu zapis znow dziala");

t.podsumuj();
