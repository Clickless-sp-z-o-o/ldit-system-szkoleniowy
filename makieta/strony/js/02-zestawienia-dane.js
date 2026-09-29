/* Ekran 02, czesc 1: stan strony, zrodlo wnioskow zakladki, statusy i zapis zmiany statusu.
   Plik zawiera wylacznie deklaracje. Dane sa czytane dopiero w inicjuj02(). */

/* Statusy: jedna lista dla filtra i edycji w komorce. Wartosc statusu wynika ze statusu
   skladania i decyzji (statusValue). */
var STATUSY = ["Niezłożony", "Czekamy", "Pozytywna", "Negatywna", "NW", "Rezygnacja"];
/* NIEPRZYPISANE to wnioski bez roku (D-165) */
var NIEPRZYPISANE = "nieprzypisane";
/* forcedInst: instytucja z ?is=, rokAktywny: zakladka roczna (D-159), batch: wstrzymanie
   przerysowania przy operacjach masowych */
var STAN_02 = { forcedInst: null, rokAktywny: "", W: [], batch: false };

function rokBiezacy() { return String(new Date().getFullYear()); }
/* Domyslnie rok biezacy, jesli ma zakladke, inaczej ostatni rok z listy */
function wybierzRokDomyslny() {
  var biezacy = rokBiezacy();
  if (DB.LATA.some(function (l) { return l.rok === biezacy; })) return biezacy;
  return DB.LATA.length ? DB.LATA[DB.LATA.length - 1].rok : biezacy;
}

/* Wejscie z listy instytucji w menu (?is=nazwa): pokazuj TYLKO dane tej instytucji.
   Filtr jest zakladany na zrodlowej liscie wnioskow w budujW(), nie tylko w widoku tabeli.
   Rzeczywista separacja jest w warstwie danych makiety (assets/zakres.js) (D-35). */
function znajdzWymuszonaInstytucje() {
  var nazwa = new URLSearchParams(location.search).get("is");
  return nazwa ? DB.INSTYTUCJE.filter(function (i) { return i.nazwa === nazwa; })[0] || null : null;
}

function wnioskiZakladki(rok) {
  if (rok === NIEPRZYPISANE) return DB.WNIOSKI_BEZ_ROKU;
  return DB.WNIOSKI_WSZYSTKIE.filter(function (w) { return String(w.rok) === rok; });
}
function budujW() {
  var lista = wnioskiZakladki(STAN_02.rokAktywny);
  var inst = STAN_02.forcedInst;
  return inst ? lista.filter(function (w) { return w.is === inst.id; }) : lista;
}

/* Kolor wiersza wg palety z Excela (D-01, D-158). Rozliczone ma pierwszenstwo,
   nastepnie decyzja, potem rezygnacja i stan "czekamy" (zlozony bez decyzji). */
function klasaWiersza(w) {
  if (w.rozliczenie === "Rozliczone") return "row-set";
  if (w.statusDec === "Pozytywna") return "row-pos";
  if (w.statusDec === "Negatywna") return "row-neg";
  if (w.statusSkl === "Rezygnacja") return "row-rez";
  if (w.statusSkl === "Złożony") return "row-czekamy";
  return "";
}
function tagRozl(w) {
  if (w.rozliczenie === "Rozliczone") return '<span class="tag st-set">Rozliczone</span>';
  if (w.rozliczenie === "Zafakturowany") return '<span class="tag info">Zafakturowany</span>';
  if (w.rozliczenie === "Oczekuje") return '<span class="tag mute">Oczekuje</span>';
  return '<span class="muted small">&mdash;</span>';
}

/* Inline CRUD statusu wnioskow. Status edytowany bezposrednio w komorce (D-115);
   masowa i pojedyncza zmiana trafiaja do rejestru aktywnosci (D-116).
   Koszt calkowity (reczny, D-58) i regula przyznano: karta 03-wniosek. */
function statusValue(w) {
  if (w.statusDec === "Pozytywna") return "Pozytywna";
  if (w.statusDec === "Negatywna") return "Negatywna";
  if (w.statusSkl === "Złożony") return "Czekamy";
  if (w.statusSkl === "NW") return "NW";
  if (w.statusSkl === "Rezygnacja") return "Rezygnacja";
  return "Niezłożony";
}
function mapStatus(val) {
  switch (val) {
    case "Pozytywna": return { status_skladania: "Złożony", status_decyzji: "Pozytywna" };
    case "Negatywna": return { status_skladania: "Złożony", status_decyzji: "Negatywna" };
    case "Czekamy": return { status_skladania: "Złożony", status_decyzji: null };
    case "NW": return { status_skladania: "NW", status_decyzji: null };
    case "Rezygnacja": return { status_skladania: "Rezygnacja", status_decyzji: null };
    default: return { status_skladania: "Niezłożony", status_decyzji: null };
  }
}
function selectStatus(w) {
  var cur = statusValue(w);
  return '<select class="inp" style="padding:3px 6px;font-size:12px;min-width:118px" onchange="zmienStatus(\'' + escJs(w.id) + '\', this.value)">' +
    STATUSY.map(function (o) { return "<option" + (o === cur ? " selected" : "") + ">" + esc(o) + "</option>"; }).join("") +
    '</select>';
}
function terazStr() {
  var d = new Date();
  function p(n) { return String(n).padStart(2, "0"); }
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes());
}
function logZmiana(obiekt, pole, przed, po) {
  Store.insert("rejestr_aktywnosci", {
    czas: terazStr(), kto: Auth.sesja().imie, typ: "Zmiana statusu",
    obiekt: obiekt, pole: pole, przed: przed || "brak", po: po
  }, "AKT-");
}
function znajdzWniosek(id) {
  return STAN_02.W.filter(function (x) { return x.id === id; })[0];
}
function zmienStatus(id, val) {
  var w = znajdzWniosek(id);
  Store.update("wnioski", id, mapStatus(val));
  logZmiana(id, "Status", w ? statusValue(w) : "", val);
}
