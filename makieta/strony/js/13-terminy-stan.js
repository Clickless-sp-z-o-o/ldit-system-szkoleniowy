/* Ekran Terminy: stan wspolny, stale i dane pomocnicze.
   Tylko deklaracje, bez kodu wykonywanego od razu. */
var STAN_13 = { DZIS: null, rok: 0, mies: 0, T: [], uczestnicyPoTerminie: {}, edytowany: null };

var MIES_NAZWY = ["styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec",
                  "sierpień", "wrzesień", "październik", "listopad", "grudzień"];
var DOW = ["pon", "wt", "śr", "czw", "pt", "sob", "ndz"];
var MAX_OSOB_W_KAFELKU = 3;

/* Data biezaca stanu demo z bazy (meta), z zapasem na date systemowa */
function dataBiezaca() {
  var m = Store.one("SELECT wartosc FROM meta WHERE klucz = 'data_biezaca'");
  return m && m.wartosc ? m.wartosc : new Date().toISOString().slice(0, 10);
}

function inicjujStan13() {
  STAN_13.DZIS = dataBiezaca();
  STAN_13.rok = parseInt(STAN_13.DZIS.slice(0, 4), 10);
  STAN_13.mies = parseInt(STAN_13.DZIS.slice(5, 7), 10) - 1;
  STAN_13.T = DB.TERMINY;
}

function el(id) { return document.getElementById(id); }
function moznaEdytowac() { return Auth.edytujeModul("terminy"); }
function nazwaIS(id) {
  var i = DB.INSTYTUCJE.filter(function (x) { return x.id === id; })[0];
  return i ? i.nazwa : "-";
}
function iso(y, m, d) {
  return y + "-" + String(m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
}
function klasaEv(status) {
  if (status === "Zaplanowany") return "plan";
  if (status === "Wolny") return "free";
  return "done";
}

/* Uczestnicy przypisani do terminow widocznych dla konta (termin_id w uczestnicy).
   Filtr po id widocznych terminow zachowuje separacje instytucji. */
function wczytajUczestnikow() {
  var widoczne = {};
  STAN_13.T.forEach(function (t) { widoczne[t.id] = true; });
  STAN_13.uczestnicyPoTerminie = {};
  Store.query(
    "SELECT u.termin_id, u.imie_nazwisko, u.wniosek_id, k.nazwa AS klient " +
    "FROM uczestnicy u JOIN wnioski w ON w.id = u.wniosek_id JOIN klienci k ON k.id = w.klient_id " +
    "WHERE u.termin_id IS NOT NULL ORDER BY u.imie_nazwisko"
  ).forEach(function (u) {
    if (!widoczne[u.termin_id]) return;
    (STAN_13.uczestnicyPoTerminie[u.termin_id] = STAN_13.uczestnicyPoTerminie[u.termin_id] || []).push(u);
  });
}
function zapisani(t) { return (STAN_13.uczestnicyPoTerminie[t.id] || []).length; }
