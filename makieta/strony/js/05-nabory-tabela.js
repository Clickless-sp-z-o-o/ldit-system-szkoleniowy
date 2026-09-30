/* Nabory: KPI, tabela naborow z filtrami (tylko deklaracje) */

function zakresPrognoz() {
  var prognozowane = STAN_05.prognozowane;
  if (!prognozowane.length) return "brak prognoz";
  var posortowane = prognozowane.slice().sort(function (a, b) { return kluczPrognozy(a.prognoza) - kluczPrognozy(b.prognoza); });
  return "najbliższe: " + posortowane[0].prognoza + ", najdalsze: " + posortowane[posortowane.length - 1].prognoza;
}

function kartaKpi05(label, val, foot, tip) {
  var mark = tip ? '<span class="tip-mark" data-tip="' + esc(tip) + '">i</span>' : "";
  return '<div class="kpi"><div class="k-label">' + label + mark + '</div>' +
    '<div class="k-value">' + val + '</div>' +
    '<div class="k-foot">' + foot + '</div></div>';
}

function renderKpi05() {
  var S = STAN_05;
  el05("kpi").innerHTML =
    kartaKpi05("Nabory ogłoszone teraz", S.ogl.length,
        '<span class="tag pos dot">' + suma(S.ogl) + ' klientów do obsłużenia</span>',
        "Liczba naborów z aktualnie otwartym terminem składania wniosków. Obok liczba klientów LDIT w tych urzędach.") +
    kartaKpi05("Urzędy w trakcie kontaktu", S.kont.length, "data jeszcze niepotwierdzona przez urząd",
        "Urzędy, z którymi LDIT już rozmawia, ale które nie potwierdziły jeszcze dokładnej daty naboru.") +
    kartaKpi05("Nabory prognozowane", S.kont.length + S.prog.length, esc(zakresPrognoz()),
        "Łączna liczba naborów z przewidywanym terminem (w trakcie kontaktu plus sama prognoza), bez ogłoszonego jeszcze terminu.") +
    kartaKpi05("Klientów przypisanych do urzędów", DB.fmtNum(suma(S.N)),
        "z " + S.N.length + " urzędów z naborami, w bazie jest ich " + DB.PUPY.length,
        "Suma klientów przypisanych do urzędów, które mają nabór. Liczona z bazy klientów, nie z pola liczba_klientow naboru.");

  el05("stopkaUrzedy").innerHTML = "W bazie systemu jest <b>" + DB.PUPY.length + " urzędów pracy</b>, tutaj widać <b>" +
    S.N.length + "</b>, czyli te, dla których jest nabór lub prognoza. Pozostałe pojawiają się w widoku dopiero, " +
    "gdy aplikacja prognozująca zwróci dla nich datę.";
  el05("notkaUrzedy").textContent = "Baza obejmuje " + DB.PUPY.length + " urzędów pracy, tutaj widać " + S.N.length + ".";
}

function tagStat(n) {
  if (n.status === "Nabór ogłoszony") return '<span class="tag pos dot">Nabór ogłoszony</span>';
  if (n.status === "W trakcie kontaktu") return '<span class="tag info dot">W trakcie kontaktu</span>';
  if (n.status === "Brak naboru") return '<span class="tag warn dot">Brak naboru</span>';
  return '<span class="tag mute dot">Po naborze</span>';
}

function tagDni(n) {
  if (n.status === "Nabór ogłoszony") {
    var d = dniDo(n.do);
    if (d <= 3) return '<span class="tag neg">' + d + ' dni</span>';
    if (d <= 10) return '<span class="tag warn">' + d + ' dni</span>';
    return '<span class="tag info">' + d + ' dni</span>';
  }
  if (n.status === "Po naborze") return '<span class="small muted">zakończony</span>';
  return '<span class="muted">&mdash;</span>';
}

function wierszNaboru(n) {
  var cls = n.status === "Nabór ogłoszony" ? "row-pos row-nabor" : n.status === "Po naborze" ? "past" : "";
  var id = pupId(n);
  return '<tr class="' + cls + '">' +
    '<td class="strong nowrap">' + esc(n.pup) + '</td>' +
    '<td class="muted nowrap">' + esc(n.woj) + '</td>' +
    '<td><span class="pill' + (n.rodzaj === "KFS" ? " k" : " w") + '">' + esc(n.rodzaj) + '</span></td>' +
    '<td class="nowrap">' + tagStat(n) + '</td>' +
    '<td class="mono nowrap">' + (n.od ? esc(n.od) : '<span class="muted">&mdash;</span>') + '</td>' +
    '<td class="mono nowrap">' + (n.do ? esc(n.do) : '<span class="muted">&mdash;</span>') + '</td>' +
    '<td class="c">' + tagDni(n) + '</td>' +
    '<td class="nowrap">' + (n.prognoza ? '<span class="small">' + esc(n.prognoza) + '</span>' : '<span class="muted">&mdash;</span>') + '</td>' +
    '<td class="num strong">' + klientow(n) + '</td>' +
    '<td class="right nowrap">' + (id ? '<button class="btn xs" onclick="pokazKlientow(\'' + escJs(id) + '\')">Pokaż klientów</button>' : "") + '</td>' +
    '</tr>';
}

function renderTabela05() {
  var N = STAN_05.N;
  var q = el05("q").value.toLowerCase().trim();
  var fs = el05("fStat").value, fr = el05("fRodz").value;
  var lista = N.filter(function (n) {
    if (fs && n.status !== fs) return false;
    if (fr && n.rodzaj !== fr) return false;
    return !q || (n.pup + " " + n.woj).toLowerCase().indexOf(q) >= 0;
  });
  el05("licz").innerHTML = "<b>" + lista.length + "</b> z " + N.length + " urzędów &middot; klientów: <b>" +
    DB.fmtNum(suma(lista)) + "</b>";
  el05("body").innerHTML = lista.length ? lista.map(wierszNaboru).join("") :
    '<tr><td colspan="10"><div class="empty"><div class="et">Brak naborów</div>Żaden nabór nie spełnia filtrów.</div></td></tr>';
}

/* Lista ma pokazac tylu klientow, ilu liczy kolumna, wiec bez domyslnego filtra Bazy */
function pokazKlientow(id) {
  location.href = "04-baza-klientow.html" + Nawigacja.zbudujZapytanie({ pup: id, wnioski: "wszystkie" });
}

function podepnijFiltry05() {
  ["q", "fStat", "fRodz"].forEach(function (id) {
    el05(id).addEventListener("input", renderTabela05);
    el05(id).addEventListener("change", renderTabela05);
  });
}
