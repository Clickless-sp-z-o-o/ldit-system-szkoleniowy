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

/* Licznik przy zakladce Wnioski pokazuje dokladnie tyle wierszy, ile zobaczysz po kliknieciu:
   domyslny rok Zestawien i te same filtry instytucji i urzedu, ktore link przenosi dalej */
function odswiezLicznikWnioskow() {
  var rok = Lata.domyslny();
  var fis = Wielowybor.wartosci(document.getElementById("fIS")), fpup = Wielowybor.wartosci(document.getElementById("fPUP"));
  document.getElementById("licznikWnioskow").textContent = DB.WNIOSKI_WSZYSTKIE.filter(function (w) {
    return String(w.rok) === rok && Wielowybor.pasuje(fis, w.is) && Wielowybor.pasuje(fpup, w.pup);
  }).length;
  document.getElementById("zakladkaWnioski").href = "02-zestawienia.html" +
    Nawigacja.zbudujZapytanie({ inst: Wielowybor.naTekst(fis), pup: Wielowybor.naTekst(fpup) });
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

/* ---------- Filtr statusu: klienci i ich rozwiniete wnioski ----------
   Wybor wielokrotny, lacznie (lub). Domyslnie "przed": klienci bez wniosku albo
   z wnioskiem Niezlozony / NW. Brak wyboru = wszyscy klienci i wszystkie wnioski. */
function wybraneStatusy04() { return Wielowybor.wartosci(document.getElementById("fStatusWn")); }

function wniosekPasuje(w, f) {
  if (f === "przed") return Statusy.przedZlozeniem(w);
  if (f === "aktywne") return w.rozliczenie !== "Rozliczone";
  if (f === "Rozliczone") return w.rozliczenie === "Rozliczone";
  return Statusy.wartosc(w) === f;
}
function wnioskiWFiltrze(list) {
  var wybrane = wybraneStatusy04();
  return list.filter(function (w) { return !wybrane.length || wybrane.some(function (f) { return wniosekPasuje(w, f); }); });
}
function klientWFiltrzeStatusu(r) {
  var wybrane = wybraneStatusy04();
  if (!wybrane.length) return true;
  if (wybrane.indexOf("przed") >= 0 && !r.wnioski.length) return true;
  return wnioskiWFiltrze(r.wnioski).length > 0;
}

/* Przebudowa danych po starcie i po kazdej zmianie bazy */
function przebuduj04() {
  STAN_04.WN_BY_KL = Statusy.wnioskiPoKlientach(DB.WNIOSKI_WSZYSTKIE);
  STAN_04.K = budujK();
  renderKPI(); render();
}
