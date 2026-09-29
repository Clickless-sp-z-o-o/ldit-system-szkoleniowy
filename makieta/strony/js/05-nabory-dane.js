/* Nabory: stan strony, parsowanie prognoz, sortowanie i liczenie klientow (tylko deklaracje) */
var MS_NA_DOBE = 86400000;
var HORYZONT_MIESIECY = 7;
var BRAK_PROGNOZY_KLUCZ = 999999;
var NAZWY_MIESIECY = [
  { rdzen: "stycz", skrot: "sty" }, { rdzen: "lut", skrot: "lut" }, { rdzen: "marz", skrot: "mar" },
  { rdzen: "kwie", skrot: "kwi" }, { rdzen: "maj", skrot: "maj" }, { rdzen: "czerw", skrot: "cze" },
  { rdzen: "lip", skrot: "lip" }, { rdzen: "sierp", skrot: "sie" }, { rdzen: "wrze", skrot: "wrz" },
  { rdzen: "paźd", skrot: "paź" }, { rdzen: "listop", skrot: "lis" }, { rdzen: "grud", skrot: "gru" }
];

var STAN_05 = { dzis: null, N: [], ogl: [], kont: [], prog: [], prognozowane: [], pupPoNazwie: {}, klienciPoPup: {} };

function el05(id) { return document.getElementById(id); }

function dniDo(iso) { return Math.round((new Date(iso) - STAN_05.dzis) / MS_NA_DOBE); }

/* Prognoza jest tekstem ("polowa pazdziernika 2026"): wyciagamy miesiac i rok do sortowania */
function parsujPrognoze(tekst) {
  var t = String(tekst || "").toLowerCase();
  var rokMatch = /(\d{4})/.exec(t);
  var mies = -1;
  NAZWY_MIESIECY.forEach(function (m, i) { if (mies < 0 && t.indexOf(m.rdzen) >= 0) mies = i; });
  if (!rokMatch || mies < 0) return null;
  return { rok: parseInt(rokMatch[1], 10), mies: mies, polowa: t.indexOf("połowa") >= 0 };
}

function kluczPrognozy(tekst) {
  var p = parsujPrognoze(tekst);
  return p ? p.rok * 100 + p.mies : BRAK_PROGNOZY_KLUCZ;
}

function pupId(n) { return STAN_05.pupPoNazwie[n.pup] || null; }
function klientow(n) { return STAN_05.klienciPoPup[pupId(n)] || 0; }
function suma(lista) { return lista.reduce(function (s, n) { return s + klientow(n); }, 0); }

/* Sortowanie: ogloszone wg daty konca rosnaco, potem kontakt, prognoza, na koncu zakonczone */
function kluczSortowania(n) {
  if (n.status === "Nabór ogłoszony") return 1000 + dniDo(n.do);
  if (n.status === "W trakcie kontaktu") return 20000 + kluczPrognozy(n.prognoza);
  if (n.status === "Brak naboru") return 30000 + kluczPrognozy(n.prognoza);
  return 40000 - dniDo(n.do);
}

function poStatusie(s) { return STAN_05.N.filter(function (n) { return n.status === s; }); }

function wczytajDane05() {
  /* Data biezaca stanu demo z bazy (meta), z zapasem na date systemowa */
  var meta = Store.one("SELECT wartosc FROM meta WHERE klucz = 'data_biezaca'");
  var dzisIso = meta && meta.wartosc ? meta.wartosc : new Date().toISOString().slice(0, 10);
  STAN_05.dzis = new Date(dzisIso);
  el05("stanNa").textContent = "stan na " + DB.fmtDate(dzisIso);

  /* Liczba klientow z danych: klienci przypisani do urzedu (klienci.pup_id) */
  DB.PUPY.forEach(function (p) { STAN_05.pupPoNazwie[p.nazwa] = p.id; });
  DB.KLIENCI.forEach(function (k) { STAN_05.klienciPoPup[k.pup] = (STAN_05.klienciPoPup[k.pup] || 0) + 1; });

  STAN_05.N = DB.NABORY.slice().sort(function (a, b) { return kluczSortowania(a) - kluczSortowania(b); });
  STAN_05.ogl = poStatusie("Nabór ogłoszony");
  STAN_05.kont = poStatusie("W trakcie kontaktu");
  STAN_05.prog = poStatusie("Brak naboru");
  STAN_05.prognozowane = STAN_05.kont.concat(STAN_05.prog).filter(function (n) { return parsujPrognoze(n.prognoza); });
}
