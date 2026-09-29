/* Panel instytucji: tabela wlasnych klientow i projektow z filtrami (tylko deklaracje) */

/* Termin wniosku wynika z przypisania uczestnikow do terminu (uczestnicy.termin_id) */
function wczytajTerminyWnioskow16() {
  STAN_16.terminWniosku = {};
  Store.query(
    "SELECT u.wniosek_id, MIN(t.data_od) AS od, MAX(t.data_do) AS do FROM uczestnicy u " +
    "JOIN terminy t ON t.id = u.termin_id GROUP BY u.wniosek_id"
  ).forEach(function (r) { STAN_16.terminWniosku[r.wniosek_id] = r; });
}

function pasuje16(w, f) {
  if (f === "poz") return w.statusDec === "Pozytywna";
  if (f === "neg") return w.statusDec === "Negatywna";
  if (f === "ocz") return w.statusSkl === "Złożony" && !w.statusDec;
  if (f === "rozl") return w.rozliczenie === "Rozliczone";
  return true;
}

function tagStatusWniosku16(w) {
  if (w.statusDec === "Pozytywna") return '<span class="tag pos dot">decyzja pozytywna</span>';
  if (w.statusDec === "Negatywna") return '<span class="tag neg dot">decyzja negatywna</span>';
  if (w.statusSkl === "Złożony") return '<span class="tag info dot">oczekuje na decyzję</span>';
  if (w.statusSkl === "NW") return '<span class="tag warn dot">NW</span>';
  if (w.statusSkl === "Rezygnacja") return '<span class="tag mute dot">rezygnacja</span>';
  return '<span class="tag mute dot">niezłożony</span>';
}

function tagRealizacji16(w) {
  if (w.rozliczenie === "Rozliczone") return '<span class="tag set dot">rozliczone</span>';
  if (w.rozliczenie === "Zafakturowany") return '<span class="tag info dot">szkolenie odbyte</span>';
  if (w.rozliczenie === "Oczekuje") return '<span class="tag warn dot">czeka na realizację</span>';
  return '<span class="muted">&mdash;</span>';
}

function wierszWniosku16(w) {
  var t = STAN_16.terminWniosku[w.id];
  var cls = w.rozliczenie === "Rozliczone" ? "row-set"
          : w.statusDec === "Pozytywna" ? "row-pos"
          : w.statusDec === "Negatywna" ? "row-neg" : "";
  return '<tr class="' + cls + '">' +
    '<td class="strong">' + esc(w.klNazwa) + '</td>' +
    '<td>' + esc(w.szkolenie) + '</td>' +
    '<td class="num">' + esc(w.osobZakw) + (w.osobZakw < w.osob ? ' <span class="muted small">z ' + esc(w.osob) + '</span>' : '') + '</td>' +
    '<td>' + tagStatusWniosku16(w) + '</td>' +
    '<td class="nowrap small">' + (t ? esc(t.od) + " &rsaquo; " + esc(t.do) : '<span class="muted">termin nieustalony</span>') + '</td>' +
    '<td>' + tagRealizacji16(w) + '</td></tr>';
}

function renderKlienci16() {
  var W = STAN_16.W;
  var q = el16("szukaj").value.trim().toLowerCase();
  var lista = W.filter(function (w) {
    if (!pasuje16(w, STAN_16.filtr)) return false;
    return !q || (w.klNazwa + " " + w.szkolenie).toLowerCase().indexOf(q) >= 0;
  });
  el16("subTab").textContent = lista.length + " z " + W.length + " projektów instytucji";
  el16("wiersze").innerHTML = lista.length ? wiersze16(lista, wierszWniosku16) :
    '<tr><td colspan="6"><div class="empty"><div class="ei">&#9788;</div>' +
    '<div class="et">Brak wyników w Twoim katalogu</div>Wyszukiwarka nie sięga poza dane tej instytucji.</div></td></tr>';
}

function podepnijFiltry16() {
  el16("szukaj").addEventListener("input", renderKlienci16);
  Array.prototype.forEach.call(document.querySelectorAll(".chip[data-f]"), function (c) {
    c.addEventListener("click", function () {
      Array.prototype.forEach.call(document.querySelectorAll(".chip[data-f]"), function (x) { x.classList.remove("on"); });
      c.classList.add("on");
      STAN_16.filtr = c.getAttribute("data-f");
      renderKlienci16();
    });
  });
}
