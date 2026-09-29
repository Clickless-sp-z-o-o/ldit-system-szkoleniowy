/* Ekran 04, czesc 1: stan strony, budowa wierszy klientow z naborami, statusy wnioskow.
   Plik zawiera wylacznie deklaracje. Dane sa czytane dopiero w inicjuj04() i przebuduj04(). */

var MS_NA_DOBE = 86400000;
var STAN_04 = { DZIS: null, NAB: {}, K: [], WN_BY_KL: {}, expanded: {}, edytowanyKlient: null };

/* Jeden nabor per urzad: najblizszy koniec (jeszcze trwajacy), potem prognozowany
   bez daty konca, na koncu ostatnio zakonczony. Nie nadpisujemy ich po kolei. */
function rangaNaboru(n) {
  if (!n.do) return { grupa: 1, klucz: 0 };
  var koniec = new Date(n.do).getTime();
  return koniec >= STAN_04.DZIS.getTime() ? { grupa: 0, klucz: koniec } : { grupa: 2, klucz: -koniec };
}
function lepszyNabor(a, b) {
  var ra = rangaNaboru(a), rb = rangaNaboru(b);
  return ra.grupa !== rb.grupa ? ra.grupa < rb.grupa : ra.klucz <= rb.klucz;
}
function budujNabory() {
  var nab = {};
  DB.NABORY.forEach(function (n) {
    if (!nab[n.pup] || !lepszyNabor(nab[n.pup], n)) nab[n.pup] = n;
  });
  return nab;
}

function naborKlienta(kl) {
  var p = DB.PUPY.filter(function (x) { return x.id === kl.pup; })[0];
  return p ? STAN_04.NAB[p.nazwa] : null;
}
function dniDo(iso) {
  if (!iso) return null;
  return Math.round((new Date(iso) - STAN_04.DZIS) / MS_NA_DOBE);
}
function nazwaIS(id) {
  var i = DB.INSTYTUCJE.filter(function (x) { return x.id === id; })[0];
  return i ? i.nazwa : "-";
}

/* Wszystkie wnioski klienta ze wszystkich lat (D-128), pogrupowane po kliencie */
function wnioskiPoKlientach() {
  var mapa = {};
  DB.WNIOSKI_WSZYSTKIE.forEach(function (w) { (mapa[w.klient] = mapa[w.klient] || []).push(w); });
  return mapa;
}

/* Licznik przy zakladce Wnioski: ten sam rok co domyslna zakladka w Zestawieniach */
function rokDomyslny() {
  var biezacy = String(new Date().getFullYear());
  if (DB.LATA.some(function (l) { return l.rok === biezacy; })) return biezacy;
  return DB.LATA.length ? DB.LATA[DB.LATA.length - 1].rok : biezacy;
}
function odswiezLicznikWnioskow() {
  var rok = rokDomyslny();
  document.getElementById("licznikWnioskow").textContent =
    DB.WNIOSKI_WSZYSTKIE.filter(function (w) { return String(w.rok) === rok; }).length;
}

function kluczSortowania(status, koniec) {
  if (status === "Nabór ogłoszony") return 1000 + (dniDo(koniec) || 0);
  if (status === "W trakcie kontaktu") return 20000;
  if (status === "Brak naboru") return 30000;
  return 40000;
}
function budujK() {
  return DB.KLIENCI.map(function (kl) {
    var n = naborKlienta(kl);
    var st = n ? n.status : "Bez informacji";
    var koniec = n && n.do ? n.do : "";
    return {
      kl: kl, nab: n, status: st, koniec: koniec,
      dni: koniec ? dniDo(koniec) : null,
      wnioski: STAN_04.WN_BY_KL[kl.id] || [],
      isNazwa: nazwaIS(kl.is),
      pupNazwa: (DB.PUPY.filter(function (p) { return p.id === kl.pup; })[0] || {}).nazwa || "-",
      klucz: kluczSortowania(st, koniec)
    };
  }).sort(function (a, b) { return a.klucz - b.klucz || a.kl.nr - b.kl.nr; });
}

/* ---------- Status wniosku (spojnie z 02-zestawienia, paleta 5 stanow) ---------- */
function statusValue(w) {
  if (w.statusDec === "Pozytywna") return "Pozytywna";
  if (w.statusDec === "Negatywna") return "Negatywna";
  if (w.statusSkl === "Złożony") return "Czekamy";
  if (w.statusSkl === "NW") return "NW";
  if (w.statusSkl === "Rezygnacja") return "Rezygnacja";
  return "Niezłożony";
}
function klasaWiersza(w) {
  if (w.rozliczenie === "Rozliczone") return "row-set";
  if (w.statusDec === "Pozytywna") return "row-pos";
  if (w.statusDec === "Negatywna") return "row-neg";
  if (w.statusSkl === "Rezygnacja") return "row-rez";
  if (w.statusSkl === "Złożony") return "row-czekamy";
  return "";
}
function tagStatusWn(w) {
  var v = statusValue(w);
  var map = { Pozytywna: "st-poz", Negatywna: "st-neg", Czekamy: "st-czekamy", NW: "warn", Rezygnacja: "st-rez", Niezłożony: "mute" };
  return '<span class="tag ' + map[v] + ' dot">' + esc(v) + '</span>';
}
function tagRozl(w) {
  if (w.rozliczenie === "Rozliczone") return '<span class="tag st-set">Rozliczone</span>';
  if (w.rozliczenie === "Zafakturowany") return '<span class="tag info">Zafakturowany</span>';
  if (w.rozliczenie === "Oczekuje") return '<span class="tag mute">Oczekuje</span>';
  return '<span class="muted small">&mdash;</span>';
}
/* Filtr statusu wniosku, domyslnie ukrywa rozliczone */
function filtrujWnioski(list) {
  var f = document.getElementById("fStatusWn").value;
  return list.filter(function (w) {
    if (f === "aktywne") return w.rozliczenie !== "Rozliczone";
    if (f === "wszystkie") return true;
    if (f === "Rozliczone") return w.rozliczenie === "Rozliczone";
    return statusValue(w) === f;
  });
}

/* Przebudowa danych po starcie i po kazdej zmianie bazy */
function przebuduj04() {
  STAN_04.WN_BY_KL = wnioskiPoKlientach();
  STAN_04.K = budujK();
  odswiezLicznikWnioskow(); renderKPI(); render();
}
