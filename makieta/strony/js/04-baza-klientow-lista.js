/* Ekran 04, czesc 2: KPI, filtry, lista klientow z rozwijanymi wnioskami i inicjalizacja strony.
   Korzysta ze STAN_04 z 04-baza-klientow-dane.js. Same deklaracje. */

var LIMIT_WIERSZY_04 = 120;

function kpi(label, val, foot, tip) {
  var mark = tip ? '<span class="tip-mark" data-tip="' + tip + '">i</span>' : "";
  return '<div class="kpi"><div class="k-label">' + label + mark + '</div>' +
    '<div class="k-value">' + val + '</div>' +
    '<div class="k-foot">' + foot + '</div></div>';
}
function renderKPI() {
  var K = STAN_04.K;
  var aktywne = K.filter(function (r) { return r.status === "Nabór ogłoszony"; });
  var prognoza = K.filter(function (r) { return r.status === "W trakcie kontaktu" || r.status === "Brak naboru"; });
  var bez = K.filter(function (r) { return r.status === "Po naborze" || r.status === "Bez informacji"; });
  var najblizszy = aktywne.length ? aktywne[0] : null;
  document.getElementById("kpi").innerHTML =
    kpi("Klienci z otwartym naborem", DB.fmtNum(aktywne.length),
        najblizszy ? '<span class="tag pos dot">koniec ' + esc(najblizszy.koniec) + ', za ' + najblizszy.dni + ' dni</span>' : "brak",
        "Klienci, ktorych urzad pracy ma wlasnie ogloszony nabor KFS. To oni sa priorytetem, sortowani po najblizszym koncu naboru (D-130).") +
    kpi("Czekają na nabór prognozowany", DB.fmtNum(prognoza.length), "urzędy w kontakcie lub z prognozą daty",
        "Klienci bez otwartego naboru, ale w urzedzie w kontakcie albo z prognozowana data naboru (D-90).") +
    kpi("Bez naboru w tym momencie", DB.fmtNum(bez.length), "nabór zakończony lub brak danych",
        "Klienci, ktorych urzad zakonczyl nabor albo brak danych. Zostaja w bazie, nie sa aktywnym priorytetem.") +
    kpi("Klienci w bazie łącznie", DB.fmtNum(K.length), "jeden klient to jeden wiersz",
        "Wszyscy klienci w bazie danych, jeden klient to jeden wiersz.");
}

function wypelnijFiltry() {
  var selIS = document.getElementById("fIS");
  DB.INSTYTUCJE.forEach(function (i) {
    selIS.innerHTML += '<option value="' + esc(i.id) + '">' + esc(i.nazwa) + '</option>';
  });
  var selPUP = document.getElementById("fPUP");
  DB.PUPY.forEach(function (p) {
    selPUP.innerHTML += '<option value="' + esc(p.id) + '">' + esc(p.nazwa) + '</option>';
  });
}

function tagNaboru(r) {
  if (r.status === "Nabór ogłoszony") return '<span class="tag pos dot">Nabór trwa</span>';
  if (r.status === "W trakcie kontaktu") return '<span class="tag info dot">W trakcie kontaktu</span>';
  if (r.status === "Brak naboru") return '<span class="tag warn dot">Prognoza: ' + esc(r.nab.prognoza) + '</span>';
  if (r.status === "Po naborze") return '<span class="tag mute dot">Po naborze</span>';
  return '<span class="tag mute dot">Brak danych</span>';
}
function tagDni(r) {
  if (r.dni == null) return '<span class="muted">&mdash;</span>';
  if (r.dni < 0) return '<span class="small muted">zakończony</span>';
  if (r.dni <= 3) return '<span class="tag neg">' + r.dni + ' dni</span>';
  if (r.dni <= 10) return '<span class="tag warn">' + r.dni + ' dni</span>';
  return '<span class="tag info">' + r.dni + ' dni</span>';
}
function tagWielkosc(w) {
  return '<span class="pill ' + (w === "mikro" ? "k" : "w") + '">' + esc(w || "brak") + '</span>';
}
function flagaKolejny(r) {
  return r.kl.zainteresowany
    ? '<span class="tag pos" data-tip="Zainteresowany kolejnym naborem. Klient zostaje w biezacym filtrze naboru jako kandydat do kontaktu (D-130).">tak</span>'
    : '<span class="tag mute" data-tip="Nie zainteresowany kolejnym naborem. Odznaczenie na bialo wypisuje klienta z biezacego filtra naboru (D-130).">nie</span>';
}

function wierszWniosku(w) {
  var brak = '<span class="muted">&mdash;</span>';
  return '<tr class="' + klasaWiersza(w) + '">' +
    '<td class="strong mono nowrap">' + esc(w.id) + '</td>' +
    '<td class="nowrap">' + esc(w.szkolenie) + '</td>' +
    '<td class="num">' + DB.fmtPLN(w.wartosc) + '</td>' +
    '<td class="num">' + (w.przyznano != null ? DB.fmtPLN(w.przyznano) : brak) + '</td>' +
    '<td class="num">' + (w.kosztCalkowity != null ? DB.fmtPLN(w.kosztCalkowity) : brak) + '</td>' +
    '<td>' + tagStatusWn(w) + '</td>' +
    '<td>' + tagRozl(w) + '</td>' +
    '<td class="right"><button class="btn xs" onclick="location.href=\'' + escJs('03-wniosek.html?id=' + encodeURIComponent(w.id)) + '\'">Otwórz</button></td>' +
    '</tr>';
}

/* Zagniezdzona tabela wnioskow klienta (D-128), kolorowana statusem */
function detalWnioskow(r) {
  var lista = filtrujWnioski(r.wnioski.slice().sort(function (a, b) { return (b.rok || "") < (a.rok || "") ? -1 : 1; }));
  var body = lista.length ? lista.map(wierszWniosku).join("") :
    '<tr><td colspan="8" class="small muted" style="padding:12px">Brak wniosków w tym filtrze. ' +
    'Zmień filtr statusu wniosku albo pokaż wszystkie.</td></tr>';
  var ukryte = r.wnioski.length - lista.length;
  var stopka = ukryte > 0
    ? '<div class="small muted" style="margin:0 40px 12px 0">Ukryto ' + ukryte + ' wnios(ek/ki), które nie pasują do filtra (np. rozliczone).</div>'
    : '';
  return '<tr class="wn-detail"><td colspan="14">' +
    '<table class="tbl"><thead><tr>' +
      '<th>Wniosek</th><th>Szkolenie</th><th class="num">Wartość</th><th class="num">Przyznano</th>' +
      '<th class="num">Koszt całk.</th><th>Status</th><th>Rozliczenie</th><th></th>' +
    '</tr></thead><tbody>' + body + '</tbody></table>' + stopka + '</td></tr>';
}

function przyciskRozwijania(r) {
  if (!r.wnioski.length) return '<span class="muted">&middot;</span>';
  var otw = !!STAN_04.expanded[r.kl.id];
  return '<button class="btn xs exp-btn" onclick="przelaczWnioski(\'' + escJs(r.kl.id) + '\')" data-tip="Rozwin, zeby zobaczyc wnioski tego klienta, kolorowane statusem (D-128).">' + (otw ? "&minus;" : "+") + '</button>';
}

function wierszKlienta(r) {
  var cls = r.status === "Nabór ogłoszony" ? "row-pos row-nabor"
          : (r.status === "Po naborze" || r.status === "Bez informacji") ? "dim" : "";
  var row = '<tr class="' + cls + '">' +
    '<td class="exp-cell">' + przyciskRozwijania(r) + '</td>' +
    '<td class="strong">' + esc(r.kl.nr) + '</td>' +
    '<td class="strong nowrap">' + esc(r.kl.nazwa) +
      '<div class="small muted">' + esc(r.kl.id) + ' &middot; ' + esc(r.kl.miasto) + '</div></td>' +
    '<td class="mono muted">' + esc(r.kl.nip) + '</td>' +
    '<td class="nowrap">' + tagWielkosc(r.kl.wielkosc) +
      (r.kl.zatrudnienie == null ? "" : '<div class="small muted">' + esc(r.kl.zatrudnienie) + ' os. na umowie (ostatni wniosek)</div>') + '</td>' +
    '<td class="nowrap">' + esc(r.isNazwa) + '</td>' +
    '<td class="nowrap muted">' + esc(r.pupNazwa) + '</td>' +
    '<td class="nowrap">' + tagNaboru(r) + '</td>' +
    '<td class="mono nowrap"><b data-tip="Koniec naboru wyznacza priorytet kontaktu. Edycja inline: kliknij date i wpisz nowa, jak w Excelu (D-130).">' +
      (esc(r.koniec) || '<span class="muted">&mdash;</span>') + '</b></td>' +
    '<td class="c">' + flagaKolejny(r) + '</td>' +
    '<td class="c">' + tagDni(r) + '</td>' +
    '<td class="c">' + (r.wnioski.length ? '<b>' + r.wnioski.length + '</b>' : '<span class="muted">0</span>') + '</td>' +
    '<td class="nowrap small">' + esc(r.kl.osoba) + '<div class="muted">' + esc(r.kl.tel) + '</div></td>' +
    '<td class="right"><div class="btn-row" style="justify-content:flex-end">' +
      '<button class="btn xs" onclick="edytujKlient(\'' + escJs(r.kl.id) + '\')">Edytuj</button>' +
    '</div></td>' +
    '</tr>';
  return row + (STAN_04.expanded[r.kl.id] ? detalWnioskow(r) : "");
}

function filtrujKlientow() {
  var q = document.getElementById("q").value.toLowerCase().trim();
  var fis = document.getElementById("fIS").value, fpup = document.getElementById("fPUP").value;
  var fnab = document.getElementById("fNab").value;
  return STAN_04.K.filter(function (r) {
    if (fis && r.kl.is !== fis) return false;
    if (fpup && r.kl.pup !== fpup) return false;
    if (fnab && r.status !== fnab) return false;
    if (!q) return true;
    var h = [r.kl.nazwa, r.kl.nip, r.pupNazwa, r.isNazwa, r.kl.osoba].join(" ").toLowerCase();
    return h.indexOf(q) >= 0;
  });
}

function render() {
  var lista = filtrujKlientow();
  var pilnych = lista.filter(function (r) { return r.status === "Nabór ogłoszony"; }).length;
  document.getElementById("licz").innerHTML =
    "<b>" + lista.length + "</b> z " + STAN_04.K.length + " klientów &middot; z otwartym naborem: <b>" + pilnych + "</b>";

  var html = lista.slice(0, LIMIT_WIERSZY_04).map(wierszKlienta).join("");
  if (lista.length > LIMIT_WIERSZY_04) {
    html += '<tr><td colspan="14" class="c muted small" style="padding:14px">Pokazano ' + LIMIT_WIERSZY_04 + ' z ' +
      lista.length + ' wierszy, pominięto ' + (lista.length - LIMIT_WIERSZY_04) + '.</td></tr>';
  }
  if (!lista.length) {
    html = '<tr><td colspan="14"><div class="empty"><div class="ei">&#9788;</div>' +
      '<div class="et">Brak klientów dla tych filtrów</div>Zmień kryteria wyszukiwania.</div></td></tr>';
  }
  document.getElementById("body").innerHTML = html;
}

function przelaczWnioski(id) {
  STAN_04.expanded[id] = !STAN_04.expanded[id];
  render();
}

function inicjuj04() {
  STAN_04.DZIS = new Date();
  STAN_04.DZIS.setHours(0, 0, 0, 0);
  STAN_04.NAB = budujNabory();
  wypelnijFiltry();
  ["q", "fIS", "fPUP", "fNab", "fStatusWn"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", render);
    document.getElementById(id).addEventListener("change", render);
  });
  document.getElementById("btnNowyKlient").addEventListener("click", function () {
    otworzKlientForm(null, "Nowy klient");
  });
  window.addEventListener("db:changed", przebuduj04);
  przebuduj04();
}
