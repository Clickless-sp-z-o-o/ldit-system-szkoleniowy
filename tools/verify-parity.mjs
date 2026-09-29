/* ============================================================================
   Bramka jakosci: przejscie z JSON na SQLite nie moze zmienic ani jednej liczby
   widocznej w makiecie.

     node tools/verify-parity.mjs

   Porownuje window.DB zbudowane ze starego generatora (tools/legacy-data-gen.js,
   stan sprzed migracji) z window.DB zbudowanym z bazy SQLite. Kazde pole, ktore
   istnialo wczesniej, musi miec te sama wartosc. Adapter moze dodac nowe pola,
   nie moze zmienic istniejacych.
   ============================================================================ */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

import { przygotuj } from "./harness.mjs";

const dir = path.dirname(fileURLToPath(import.meta.url));

/* Stary generator: jedyne zrodlo liczb sprzed migracji */
const sandbox = { window: {}, console };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(dir, "legacy-data-gen.js"), "utf8"), sandbox,
                { filename: "legacy-data-gen.js" });
const legacy = sandbox.window.DB;

/* Nowa sciezka. Wymaga zalogowania, bo bez sesji warstwa separacji nie wydaje
   danych. Konto administratora widzi wszystko, wiec porownanie jest pelne. */
const KONTO = "bartek@ldit.pl";
const okno = await przygotuj();
okno.Auth.zaloguj(KONTO, "demo");
const nowe = okno.DB;

function diffPath(oczekiwane, jest, sciezka) {
  if (Array.isArray(oczekiwane)) {
    if (!Array.isArray(jest)) return sciezka + " (oczekiwano tablicy)";
    if (oczekiwane.length !== jest.length) {
      return sciezka + " (dlugosc " + oczekiwane.length + " != " + jest.length + ")";
    }
    for (let i = 0; i < oczekiwane.length; i++) {
      const d = diffPath(oczekiwane[i], jest[i], sciezka + "[" + i + "]");
      if (d) return d;
    }
    return null;
  }
  if (oczekiwane && typeof oczekiwane === "object") {
    if (!jest || typeof jest !== "object") return sciezka + " (oczekiwano obiektu)";
    for (const k of Object.keys(oczekiwane)) {
      const d = diffPath(oczekiwane[k], jest[k], sciezka + "." + k);
      if (d) return d;
    }
    return null;
  }
  if (oczekiwane === jest) return null;
  if (typeof oczekiwane === "number" && typeof jest === "number" &&
      Math.abs(oczekiwane - jest) < 1e-9) return null;
  return sciezka + " (" + JSON.stringify(oczekiwane) + " != " + JSON.stringify(jest) + ")";
}

/* MODULY swiadomie wypada z porownania: dawniej byla to lista 14 etykiet
   z makiety, teraz sa to realne moduly menu z tabeli uprawnien (D-36). */
/* WNIOSKI_2025 swiadomie wypada: wnioskow z 2025 nie przenosimy (D-160).
   Ze ich nie ma, sprawdza osobna asercja na koncu. */
const TABELE = ["INSTYTUCJE", "PUPY", "SZKOLENIA", "KLIENCI", "WNIOSKI",
  "NABORY", "FAKTURY", "TERMINY", "UZYTKOWNICY", "AKTYWNOSC", "LOGOWANIA",
  "ZGLOSZENIA", "SZABLONY", "KOLEJKA", "MAILE", "CELE"];

/* Dwie tabele urosly swiadomie i porownujemy je po odjeciu tego, co doszlo:
   konto klienta koncowego (nowe, bo panel klienta wymaga zalogowania) oraz
   wpisy logowania wygenerowane przez samo uruchomienie tego testu. */
function bezNowosci(nazwa, wiersze) {
  if (nazwa === "UZYTKOWNICY") {
    const stare = new Set(legacy.UZYTKOWNICY.map((u) => u.login));
    return wiersze.filter((u) => stare.has(u.login)).map((u) =>
      /* Konto uzyte do zalogowania ma swiezy czas ostatniego logowania */
      u.login === KONTO ? Object.assign({}, u, { ost: legacy.UZYTKOWNICY.find(
        (x) => x.login === KONTO).ost }) : u);
  }
  if (nazwa === "LOGOWANIA") {
    return wiersze.filter((l) => l.urzadzenie !== "Przegladarka (makieta)");
  }
  return wiersze;
}

/* Pola, ktore zmienily sie swiadomie decyzja, a nie przez migracje. Kazde ma
   ponizej osobne sprawdzenie nowej reguly, wiec wyjatek nie oslabia testu. */
const ZMIANY_SWIADOME = {
  KLIENCI: { zatrudnienie: "D-169: liczba zatrudnionych lezy we wniosku, klient pokazuje ja z ostatniego wniosku" },
  WNIOSKI: { wartosc: "D-79: wartosc szkolenia sumuje wylacznie uczestnikow zakwalifikowanych" }
};
function bezSwiadomych(nazwa, wiersz) {
  const pola = ZMIANY_SWIADOME[nazwa];
  if (!pola || !wiersz) return wiersz;
  const kopia = Object.assign({}, wiersz);
  Object.keys(pola).forEach((k) => { delete kopia[k]; });
  return kopia;
}

let bledy = 0;
for (const t of TABELE) {
  const a = legacy[t], b = bezNowosci(t, nowe[t] || []);
  if (!Array.isArray(a) || !Array.isArray(b)) {
    console.error("  BLAD " + t + ": brak tabeli po jednej ze stron");
    bledy++;
    continue;
  }
  if (a.length !== b.length) {
    console.error("  BLAD " + t + ": rozna liczba wierszy " + a.length + " vs " + b.length);
    bledy++;
    continue;
  }
  let rozne = 0, pierwszy = null;
  for (let i = 0; i < a.length; i++) {
    const d = diffPath(bezSwiadomych(t, a[i]), b[i], t + "[" + i + "]");
    if (d) { rozne++; if (!pierwszy) pierwszy = d; }
  }
  if (rozne) {
    console.error("  BLAD " + t + ": rozne wiersze " + rozne + "/" + a.length +
                  ", pierwsza roznica: " + pierwszy);
    bledy++;
  } else {
    console.log("  OK   " + t + " (" + a.length + ")");
  }
}

/* Nowe reguly zamiast starych wartosci */
function sprawdzRegule(opis, warunek) {
  if (warunek) { console.log("  OK   " + opis); return; }
  console.error("  BLAD " + opis); bledy++;
}
const zatrudnieniLegacy = Object.fromEntries(legacy.KLIENCI.map((k) => [k.id, k.zatrudnienie]));
sprawdzRegule("D-169: kazdy wniosek przejal liczbe zatrudnionych swojego klienta",
  nowe.WNIOSKI_WSZYSTKIE.every((w) => w.zatrudnienie === zatrudnieniLegacy[w.klient]));
sprawdzRegule("D-169: klient z wnioskiem pokazuje liczbe zatrudnionych z wniosku",
  nowe.KLIENCI.filter((k) => nowe.WNIOSKI_WSZYSTKIE.some((w) => w.klient === k.id))
    .every((k) => k.zatrudnienie === zatrudnieniLegacy[k.id]));
sprawdzRegule("D-79: wartosc wniosku to suma kwot zakwalifikowanych uczestnikow",
  nowe.WNIOSKI_WSZYSTKIE.every((w) => Math.abs(w.wartosc - w.uczestnicy
    .filter((u) => u.status === "zakwalifikowany").reduce((s, u) => s + u.kwota, 0)) < 0.005));
sprawdzRegule("D-79: stara wartosc (wszyscy uczestnicy) zostaje jako wartoscWszystkich",
  legacy.WNIOSKI.every((w, i) => Math.abs(w.wartosc - nowe.WNIOSKI[i].wartoscWszystkich) < 0.005));

if (nowe.WNIOSKI_2025.length !== 0) {
  console.error("  BLAD WNIOSKI_2025: oczekiwano 0 wnioskow (D-160), jest " + nowe.WNIOSKI_2025.length);
  bledy++;
} else {
  console.log("  OK   WNIOSKI_2025 puste, rocznik nie jest migrowany (D-160)");
}

if (bledy) {
  console.error("\nParytet zlamany w " + bledy + " tabelach");
  process.exit(1);
}
console.log("\nParytet OK: migracja na SQLite nie zmienila zadnej liczby");
