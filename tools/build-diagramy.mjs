/* ============================================================================
   Przenosi diagramy Mermaid z docs/*.md do klikalnej dokumentacji HTML.

     node tools/build-diagramy.mjs

   Źródłem diagramu jest zawsze plik Markdown, bo tam jest źródło prawdy
   dokumentacji. Ten skrypt tylko go kopiuje w wyznaczone miejsce sekcji HTML,
   więc poprawka w Markdownie wystarczy, żeby strona też się zmieniła.

   Skrypt jest idempotentny: wstawione bloki są otoczone znacznikiem i przy
   ponownym uruchomieniu są podmieniane, a nie dokładane.
   ============================================================================ */

import { readFileSync, writeFileSync, copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = join(ROOT, "docs");
const SEKCJE = join(ROOT, "dokumentacja", "sekcje");
const SILNIK = join(ROOT, "dokumentacja", "assets", "mermaid.min.js");

/* Gdzie w sekcji HTML ma wylądować który diagram.
   zamien  - podmienia istniejący rysunek ASCII (div class="diagram")
   po      - wstawia zaraz za nagłówkiem o podanej treści
   przed   - wstawia tuż przed nagłówkiem o podanej treści, czyli na końcu
             poprzedniej sekcji */
const ROZKLAD = [
  { md: "01-kontekst-i-cel.md",            nr: 0, sekcja: "01-kontekst.html",       gdzie: { zamien: true } },
  { md: "02-aktorzy-i-uprawnienia.md",     nr: 0, sekcja: "02-role.html",           gdzie: { po: "Role w systemie" } },
  { md: "02-aktorzy-i-uprawnienia.md",     nr: 1, sekcja: "02-role.html",           gdzie: { przed: "Separacja danych" } },
  { md: "03-model-danych.md",              nr: 0, sekcja: "03-model-danych.html",   gdzie: { zamien: true } },
  { md: "03-model-danych.md",              nr: 1, sekcja: "03-model-danych.html",   gdzie: { przed: "Podział na roczniki" } },
  { md: "04-proces-i-statusy.md",          nr: 0, sekcja: "04-proces-statusy.html", gdzie: { zamien: true } },
  { md: "04-proces-i-statusy.md",          nr: 1, sekcja: "04-proces-statusy.html", gdzie: { przed: "Wyzwalacze powiadomień" } },
  { md: "04-proces-i-statusy.md",          nr: 2, sekcja: "04-proces-statusy.html", gdzie: { przed: "Wyzwalacze powiadomień" } },
  { md: "05-moduly-funkcjonalne.md",       nr: 0, sekcja: "05-zakladki.html",       gdzie: { po: "Mapa zakładek" } },
  { md: "06-model-finansowy-kfs.md",       nr: 0, sekcja: "06-finanse.html",        gdzie: { po: "Wzory" } },
  { md: "07-silnik-prowizji.md",           nr: 0, sekcja: "07-prowizja.html",       gdzie: { zamien: true } },
  { md: "07-silnik-prowizji.md",           nr: 1, sekcja: "07-prowizja.html",
    gdzie: { po: "Pułapka implementacyjna: Model A liczy się na całym okresie" } },
  { md: "10-bezpieczenstwo-i-rodo.md",     nr: 0, sekcja: "10-bezpieczenstwo.html", gdzie: { po: "Separacja danych: trzy warstwy" } },
  { md: "12-zakres-i-etapowanie.md",       nr: 0, sekcja: "11-zakres.html",         gdzie: { po: "Propozycja etapowania" } },
  { md: "18-od-makiety-do-aplikacji.md",   nr: 0, sekcja: "16-od-makiety.html",     gdzie: { po: "Co trzeba napisać od nowa" } },
  { md: "18-od-makiety-do-aplikacji.md",   nr: 1, sekcja: "16-od-makiety.html",     gdzie: { po: "Realistyczna kolejność prac" } }
];

const ZNACZNIK_OD = "<!-- diagram:od -->";
const ZNACZNIK_DO = "<!-- diagram:do -->";

function diagramyZMarkdown(plik) {
  const tresc = readFileSync(join(DOCS, plik), "utf8");
  return [...tresc.matchAll(/```mermaid\r?\n([\s\S]*?)```/g)].map((m) => m[1].trim());
}

function blok(kod) {
  return ZNACZNIK_OD + '\n<pre class="mermaid">\n' + kod + "\n</pre>\n" + ZNACZNIK_DO;
}

/* Skrypt renderujący dokładamy raz na sekcję, tuż przed </body> */
function dolaczSilnik(tresc) {
  if (tresc.includes("mermaid.min.js")) return tresc;
  const skrypt =
    '<script src="../assets/mermaid.min.js"></script>\n' +
    "<script>\n" +
    "  /* Diagramy renderuja sie lokalnie, bez internetu. Zrodlo: docs/*.md */\n" +
    "  mermaid.initialize({ startOnLoad: true, theme: \"base\", securityLevel: \"loose\",\n" +
    "    themeVariables: { fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif', fontSize: '13px' } });\n" +
    "</script>\n";
  return tresc.replace("</body>", skrypt + "</body>");
}

function wstaw(tresc, kod, gdzie, plik, gniazdo) {
  const nowy = blok(kod);

  if (gdzie.zamien) {
    /* Rysunek ASCII istnieje tylko przed pierwszym uruchomieniem. Przy podmianie
       zostawiamy w jego miejscu trwały znacznik gniazda, żeby kolejne uruchomienia
       wiedziały, gdzie ten diagram ma wrócić. */
    const znacznikGniazda = "<!-- diagram:gniazdo:" + gniazdo + " -->";
    if (tresc.includes(znacznikGniazda)) {
      return tresc.replace(znacznikGniazda, znacznikGniazda + "\n  " + nowy + "\n");
    }
    const wzorzec = /<div class="diagram">[\s\S]*?<\/div>/;
    if (wzorzec.test(tresc)) {
      return tresc.replace(wzorzec, znacznikGniazda + "\n  " + nowy + "\n");
    }
    throw new Error("Brak rysunku ani gniazda do podmiany w " + plik);
  }

  const naglowek = gdzie.po || gdzie.przed;
  const idx = tresc.indexOf("<h2>" + naglowek + "</h2>");
  if (idx < 0) throw new Error('Brak naglowka "' + naglowek + '" w ' + plik);

  if (gdzie.po) {
    const koniec = idx + ("<h2>" + naglowek + "</h2>").length;
    return tresc.slice(0, koniec) + "\n\n  " + nowy + "\n" + tresc.slice(koniec);
  }
  return tresc.slice(0, idx) + nowy + "\n\n  " + tresc.slice(idx);
}

/* Silnik Mermaid trzeba mieć lokalnie, inaczej strona nie zadziała offline */
if (!existsSync(SILNIK)) {
  const zrodlo = process.argv[2];
  if (!zrodlo) {
    console.error("Brak " + SILNIK + ".\nUruchom raz ze sciezka do mermaid.min.js jako argumentem.");
    process.exit(1);
  }
  copyFileSync(zrodlo, SILNIK);
  console.log("Skopiowano silnik Mermaid do dokumentacja/assets/");
}

/* Usuwamy wczesniej wstawione bloki, zeby wstawic je od nowa we wlasciwej kolejnosci */
const doCzyszczenia = [...new Set(ROZKLAD.map((r) => r.sekcja))];
const stan = {};
for (const sekcja of doCzyszczenia) {
  const sciezka = join(SEKCJE, sekcja);
  if (!existsSync(sciezka)) {
    console.warn("Pomijam, brak sekcji: " + sekcja);
    continue;
  }
  let tresc = readFileSync(sciezka, "utf8");

  /* Sekcje z pierwszego uruchomienia mają już podmieniony rysunek ASCII, ale nie mają
     jeszcze znacznika gniazda. Dokładamy go raz, zanim wyczyścimy stare bloki. */
  for (const p of ROZKLAD.filter((r) => r.sekcja === sekcja && r.gdzie.zamien)) {
    const znacznik = "<!-- diagram:gniazdo:" + p.md + "#" + (p.nr + 1) + " -->";
    if (!tresc.includes(znacznik) && tresc.includes(ZNACZNIK_OD)) {
      tresc = tresc.replace(ZNACZNIK_OD, znacznik + "\n  " + ZNACZNIK_OD);
    }
  }

  /* Blok zabiera ze soba znak konca linii, ktory wstaw() dopisuje za nim,
     inaczej kazde uruchomienie dokladaloby pusta linie */
  stan[sekcja] = tresc.replace(
    new RegExp("\\s*" + ZNACZNIK_OD + "[\\s\\S]*?" + ZNACZNIK_DO + "\\n?", "g"), "");
}

let wstawionych = 0;
for (const pozycja of ROZKLAD) {
  if (!stan[pozycja.sekcja]) continue;
  const diagramy = diagramyZMarkdown(pozycja.md);
  const kod = diagramy[pozycja.nr];
  if (!kod) {
    console.warn("Brak diagramu #" + (pozycja.nr + 1) + " w " + pozycja.md);
    continue;
  }
  stan[pozycja.sekcja] = wstaw(stan[pozycja.sekcja], kod, pozycja.gdzie, pozycja.sekcja,
                               pozycja.md + "#" + (pozycja.nr + 1));
  wstawionych++;
}

for (const [sekcja, tresc] of Object.entries(stan)) {
  writeFileSync(join(SEKCJE, sekcja), dolaczSilnik(tresc), "utf8");
}

console.log("Wstawiono diagramow: " + wstawionych + " w " + Object.keys(stan).length + " sekcjach");
