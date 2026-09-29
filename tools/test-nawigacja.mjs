/* ============================================================================
   Testy nawigacji miedzy ekranami (usterki 1-12 z docs/19-mapa-zakladek.md).

     node tools/test-nawigacja.mjs

   Sprawdzaja assets/nawigacja.js (filtry w adresie, powrot z karty, modul
   ekranu), uprawnienia, ktore usterki poprawily, oraz spojnosc linkow na
   ekranach: kazdy parametr, ktory jeden ekran wysyla, drugi odczytuje.
   ============================================================================ */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { przygotuj, licznik } from "./harness.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const STRONY = join(ROOT, "makieta", "strony");
const JS = join(STRONY, "js");

const t = licznik("Nawigacja");
const w = await przygotuj();
const { Nawigacja: N, Auth, DB, Lata } = w;

function zaloguj(login) {
  Auth.wyloguj();
  Auth.zaloguj(login, "demo");
  DB.przebuduj();
}
const czytaj = (plik) => readFileSync(plik, "utf8");

/* --------------------------- filtry w adresie --------------------------- */
console.log("\nFiltry w adresie");
t.rowne(N.zbudujZapytanie({ rok: "2026", q: "", pup: null, status: "Czekamy" }), "?rok=2026&status=Czekamy",
  "puste wartosci nie trafiaja do adresu");
t.rowne(N.zbudujZapytanie({ q: "" }), "", "same puste wartosci daja pusty adres");
t.rowne(N.zbudujZapytanie({ q: "Marbud & syn" }), "?q=Marbud%20%26%20syn", "wartosci sa kodowane");
const odczyt = N.odczytajZapytanie("?pup=PUP-07&q=Marbud%20%26%20syn", ["pup", "q", "inst"]);
t.rowne(odczyt.pup, "PUP-07", "odczyt parametru pup (link z Naborow, usterka 1)");
t.rowne(odczyt.q, "Marbud & syn", "odczyt parametru q (wyszukiwarka globalna, usterka 2)");
t.rowne(odczyt.inst, "", "brakujacy parametr to pusty tekst");

/* ------------------------- powrot z karty wniosku ------------------------- */
console.log("\nPowrot z karty wniosku (usterka 7)");
const lista = "02-zestawienia.html?rok=2026&status=Czekamy&wn=WN-2026-001";
const karta = N.adresKarty("WN-2026-001", lista);
t.ok(karta.startsWith("03-wniosek.html?id=WN-2026-001&powrot="), "adres karty niesie id i powrot");
const powrot = N.linkPowrotu(karta.slice(karta.indexOf("?")));
t.rowne(powrot.adres, lista, "powrot odtwarza rok, filtry i wiersz");
t.rowne(powrot.etykieta, "Zestawienia", "etykieta okruszka dla Zestawien");
t.rowne(N.linkPowrotu("?powrot=" + encodeURIComponent("04-baza-klientow.html?rozwin=KL-1")).etykieta, "Baza danych",
  "etykieta okruszka dla Bazy danych");
for (const zly of ["https://example.com/", "javascript:alert(1)", "08-administracja.html", "../index.html",
                   "02-zestawienia.html?x=\"><script>", "//example.com/02-zestawienia.html"]) {
  t.rowne(N.bezpiecznyPowrot(zly), null, "odrzuca adres powrotu: " + zly);
}
t.rowne(N.linkPowrotu("?powrot=" + encodeURIComponent("https://example.com/")).adres, "02-zestawienia.html",
  "niepoprawny powrot daje Zestawienia");
t.rowne(N.adresKarty("WN-1"), "03-wniosek.html?id=WN-1", "karta bez powrotu (np. z Administracji)");

/* ------------------------------ modul ekranu ------------------------------ */
console.log("\nModul i pozycja menu ekranu (usterka 3)");
t.rowne(N.modulEkranu("strony/07-konfigurator-is.html?x=1"), "admin", "dostep do konfiguratora ma modul admin");
t.rowne(N.menuEkranu("07-konfigurator-is.html"), "inst", "w menu konfigurator lezy pod Instytucjami");
t.rowne(N.menuEkranu("15-konfigurator-prowizji.html"), "inst", "kalkulator tez pod Instytucjami (usterka 9)");
t.rowne(N.menuEkranu("03-wniosek.html"), "dofin", "karta wniosku pod Dofinansowaniami");
t.rowne(N.modulEkranu("99-nieznany.html"), null, "nieznany ekran nie ma modulu");

const pliki = readdirSync(STRONY).filter((f) => f.endsWith(".html"));
t.ok(pliki.every((f) => N.MODUL_EKRANU[f]), "kazdy ekran w strony/ ma modul w slowniku");
t.ok(Object.keys(N.MODUL_EKRANU).every((f) => existsSync(join(STRONY, f))), "kazdy wpis slownika to istniejacy ekran");
t.ok(pliki.every((f) => czytaj(join(STRONY, f)).includes('boot.js" data-modul="' + N.MODUL_EKRANU[f] + '"')),
  "brama kazdego ekranu deklaruje ten sam modul co slownik");

/* ------------------------------ uprawnienia ------------------------------ */
console.log("\nUprawnienia (usterki 4 i 5)");
zaloguj("martyna@ldit.pl");
t.rowne(Auth.poziom("terminy"), "podglad", "pracownik LDIT ma podglad Terminow (D-142)");
t.ok(!Auth.edytujeModul("terminy"), "pracownik LDIT nie wystawia terminow");
const przydzial = Auth.instytucje();
t.ok(Array.isArray(przydzial) && przydzial.length > 0, "pracownik ma przydzial instytucji (D-113)");
t.ok(DB.TERMINY.length > 0 && DB.TERMINY.every((x) => przydzial.includes(x.is)),
  "pracownik widzi terminy wylacznie przypisanych instytucji (" + DB.TERMINY.length + ")");
t.ok(DB.KOLEJKA.every((k) => przydzial.includes(k.isId)), "licznik akceptacji liczy tylko formularze z przydzialu");
zaloguj("biuro@odczarujpowerbi.pl");
t.rowne(Auth.poziom("nabory"), "brak", "instytucja nie ma Naborow (D-91)");
t.ok(!Auth.widziModul(N.modulEkranu("02-zestawienia.html")),
  "instytucja nie ma Dofinansowan, wiec zakladki Projekty i Oczekujace znikna z paska Terminow");
t.rowne(Auth.poziom("terminy"), "edycja", "instytucja nadal wystawia terminy");

/* ------------------------- licznik do akceptacji ------------------------- */
console.log("\nLicznik formularzy do akceptacji (usterka 11)");
t.rowne(N.liczbaDoAkceptacji([{ status: "oczekuje" }, { status: "zaakceptowany" }, { status: "oczekuje" }]), 2,
  "liczy tylko oczekujace");
t.rowne(N.liczbaDoAkceptacji([]), 0, "pusta kolejka daje zero");
zaloguj("bartek@ldit.pl");
t.ok(Auth.widziModul("zadania"), "administrator widzi licznik, bo ma modul Zadania");
t.rowne(N.liczbaDoAkceptacji(DB.KOLEJKA), DB.KOLEJKA.filter((k) => k.status === "oczekuje").length,
  "licznik zgodny z kolejka na ekranie Zadan");

/* ------------------------------ rok domyslny ------------------------------ */
console.log("\nRok domyslny licznikow (usterka 8)");
const biezacy = String(new Date().getFullYear());
const lata = Lata.lista().map((l) => l.rok);
t.rowne(Lata.domyslny(), lata.includes(biezacy) ? biezacy : lata[lata.length - 1],
  "rok biezacy, jesli ma zakladke, inaczej ostatni");

/* ----------------------- spojnosc linkow na ekranach ----------------------- */
console.log("\nKazdy wysylany parametr jest odczytywany");
const lista04 = czytaj(join(JS, "04-baza-klientow-lista.js"));
t.ok(/FILTRY_04 = \{[^}]*pup: "fPUP"/.test(lista04), "Baza danych czyta pup (usterka 1)");
t.ok(/FILTRY_04 = \{[^}]*q: "q"/.test(lista04), "Baza danych czyta q (usterka 2)");
t.ok(czytaj(join(JS, "05-nabory-tabela.js")).includes('"04-baza-klientow.html?pup="'), "Nabory wysylaja pup");
t.ok(czytaj(join(ROOT, "makieta", "index.html")).includes('"strony/04-baza-klientow.html?q="'), "wyszukiwarka wysyla q");

const dash = czytaj(join(JS, "01-dashboard-kolejki.js"));
t.ok(dash.includes('zakladka: "faktury", status: "Po terminie"'), "dashboard otwiera Faktury po terminie (usterka 6)");
t.ok(czytaj(join(JS, "08-administracja-rdzen.js")).includes('["zakladka", "status"]'), "Administracja czyta zakladke i status");

const admin = czytaj(join(STRONY, "08-administracja.html"));
t.ok(!admin.includes("15-konfigurator-prowizji.html"), "kalkulator nie stoi w pasku Administracji (usterka 9)");
t.ok(!czytaj(join(JS, "08-administracja-prowizje.js")).includes('"Nadpisz"'), "Administracja nie ma przycisku Nadpisz (usterka 10)");

const zglo = czytaj(join(JS, "10-zgloszenia-lista.js"));
t.ok(zglo.includes('"06-instytucje.html"') && czytaj(join(JS, "06-instytucje-lista.js")).includes('["id"]'),
  "karta podmiotu instytucji: Zgloszenia wysylaja id, Instytucje je czytaja (usterka 12)");
t.ok(zglo.includes('"04-baza-klientow.html"'), "karta podmiotu klienta prowadzi do Bazy danych");

t.podsumuj();
