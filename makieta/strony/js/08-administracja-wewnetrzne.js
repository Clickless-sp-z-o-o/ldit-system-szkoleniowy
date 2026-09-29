/* Administracja 08: zakladka Prowizje wewnetrzne. Tylko deklaracje. */
function widokWewnetrzne() {
  document.getElementById("t-wewnetrzne").innerHTML = `

    <div class="note warn">
      <b>Blokada <span class="ref p">P-02</span>: progi prowizji wewnętrznej nie istnieją.</b>
      Klient powiedział wprost: „No i właśnie to jest problem, bo na tym się jeszcze nie
      zastanawiałem nawet” (57:13), a następnie „właściwie mogę to wymyśleć teraz, w najbliższych
      dniach” (57:38). Struktura progów <b>nie została dostarczona w ramach warsztatu</b>.
      Cała ta zakładka jest szkicem układu, którego nie da się dokończyć bez tych danych.
      Kolumna „Prowizja” celowo pozostaje pusta, żeby nie sugerować wartości, których nikt nie ustalił.
    </div>

    <div class="card">
      <div class="card-head">
        <h3>Model kaskadowy <span class="ref">D-22</span></h3>
        <span class="sub">koszt szkolenia, prowizja LDIT, prowizja pracownika</span>
      </div>
      <div class="card-body">
        <div class="funnel" id="kaskada"></div>
        <div class="sep"></div>
        <dl class="dl mb0">
          <dt>Poziom 1, koszt szkolenia</dt>
          <dd>Koszt całkowity z dopłatą, czyli podstawa naliczenia prowizji LDIT od instytucji</dd>
          <dt>Poziom 2, prowizja LDIT</dt>
          <dd>Prowizja od instytucji wyliczona silnikiem progowym, czyli przychód firmy</dd>
          <dt>Poziom 3, prowizja pracownika</dt>
          <dd>Procent od przychodu firmy. <span class="tag warn">brak progów, patrz P-02</span></dd>
        </dl>
      </div>
    </div>

    <div class="card">
      <div class="card-head">
        <h3>Podstawa naliczenia prowizji pracowniczej</h3>
        <span class="sub">system musi obsłużyć oba warianty</span>
      </div>
      <div class="card-body">
        <div class="btn-row" style="margin-bottom:12px">
          <span class="chip on" id="chWn">Wartość złożonych wniosków <span class="n">obecny</span></span>
          <span class="chip" id="chPrz">Procent od przychodu firmy <span class="n">od 2027</span></span>
        </div>
        <div class="small muted" id="opisPodstawy"></div>
      </div>
      <div class="card-body tight" style="border-top:1px solid var(--line)">
        <table class="tbl">
          <thead>
            <tr>
              <th>Pracownik</th>
              <th>Przypisane instytucje</th>
              <th class="num">Wnioski złożone</th>
              <th class="num">Wartość złożonych wniosków</th>
              <th class="num">Podstawa naliczenia</th>
              <th class="num">Prowizja</th>
            </tr>
          </thead>
          <tbody id="tabPrac"></tbody>
          <tfoot id="stopkaPrac"></tfoot>
        </table>
      </div>
      <div class="card-body" style="border-top:1px solid var(--line)">
        <div class="small muted">
          <b>Do doprecyzowania przy dostarczeniu progów:</b> <span id="uwagaWspolne"></span>
          Reguła podziału podstawy przy współdzielonej instytucji nie została ustalona.
          Możliwe warianty: podział po równo, przypisanie do opiekuna głównego albo naliczenie
          osobie, która faktycznie złożyła wniosek.
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-head">
        <h3>Cele i premie <span class="ref">D-23</span></h3>
        <span class="sub">administrator ustawia samodzielnie, cele widoczne dla pracowników</span>
        <div class="ch-actions"><button class="btn sm">Dodaj cel</button></div>
      </div>
      <div class="card-body tight">
        <table class="tbl">
          <thead>
            <tr><th>Cel</th><th class="num">Próg</th><th class="num">Obecnie</th><th>Postęp</th><th>Premia</th><th>Status</th></tr>
          </thead>
          <tbody id="tabCele"></tbody>
        </table>
      </div>
      <div class="card-body" style="border-top:1px solid var(--line)">
        <div class="small muted">
          Historia osiągnięć jest zapisywana. Cel raz osiągnięty zostaje w historii nawet wtedy,
          gdy wartość bieżąca spadnie później poniżej progu.
        </div>
      </div>
    </div>
`;
}

function fnRow(label, pct, val) {
  return '<div class="fn-row"><div class="fl">' + label + '</div>' +
    '<div class="ft"><i style="width:' + pct + '%"></i></div>' +
    '<div class="fv">' + val + '</div></div>';
}

function renderKaskada() {
  var s = podsumujPozycje([].concat.apply([], DB.INSTYTUCJE.map(function (i) { return pozycjeIS(i.id, ""); })));
  document.getElementById("kaskada").innerHTML =
    fnRow("Koszt szkoleń z dopłatą", 100, DB.fmtPLN(s.obrot)) +
    fnRow("Prowizja LDIT, przychód firmy", s.obrot ? Math.max(6, Math.round(s.prow / s.obrot * 100)) : 0, DB.fmtPLN(s.prow)) +
    fnRow("Prowizja pracowników", 0, '<span class="tag warn">brak progów</span>');
}

function renderPracownicy() {
  var prac = DB.UZYTKOWNICY.filter(function (u) { return u.rola === "Pracownik LDIT"; });
  var zlozone = DB.WNIOSKI_WSZYSTKIE.filter(function (w) { return w.rok === STAN_08.rok && w.statusSkl === "Złożony"; });
  var razem = 0, razemN = 0, uzycia = {};

  document.getElementById("tabPrac").innerHTML = prac.map(function (u) {
    var lista = u.inst.split(",").map(function (s) { return s.trim(); });
    lista.forEach(function (n) { uzycia[n] = (uzycia[n] || 0) + 1; });
    var moje = zlozone.filter(function (w) { return lista.indexOf(w.isNazwa) >= 0; });
    var wart = moje.reduce(function (s, w) { return s + w.wartosc; }, 0);
    razem += wart;
    razemN += moje.length;
    return '<tr>' +
      '<td class="strong nowrap">' + esc(u.imie) + '<div class="small muted">' + esc(u.login) + '</div></td>' +
      '<td class="small">' + lista.map(function (n) { return '<span class="tag mute">' + esc(n) + '</span>'; }).join(" ") + '</td>' +
      '<td class="num">' + moje.length + '</td>' +
      '<td class="num strong">' + DB.fmtPLN(wart) + '</td>' +
      '<td class="num">' + DB.fmtPLN(wart) + '<div class="small muted">wartość złożonych wniosków</div></td>' +
      '<td class="num"><span class="tag warn">nie do policzenia</span></td></tr>';
  }).join("");

  var wspolne = Object.keys(uzycia).filter(function (n) { return uzycia[n] > 1; });
  document.getElementById("stopkaPrac").innerHTML =
    '<tr><td class="strong">Razem, ' + prac.length + ' pracowników</td><td></td>' +
    '<td class="num strong">' + razemN + '</td>' +
    '<td class="num strong">' + DB.fmtPLN(razem) + '</td>' +
    '<td class="num muted small">' + (wspolne.length ? "z podwójnym liczeniem: " + esc(wspolne.join(", ")) : "") + '</td>' +
    '<td class="num"><span class="tag warn">P-02</span></td></tr>';
  document.getElementById("uwagaWspolne").textContent = wspolne.length
    ? wspolne.join(", ") + (wspolne.length > 1 ? " są przypisane" : " jest przypisane") +
      " do więcej niż jednej osoby, więc wartość wniosków liczy się wielokrotnie. "
    : "";
}

function renderCele() {
  document.getElementById("tabCele").innerHTML = DB.CELE.map(function (c) {
    var pct = Math.min(100, Math.round(c.obecnie / c.cel * 100));
    var ok = c.status === "osiągnięty";
    var kwotowy = c.cel > 1000;
    return '<tr>' +
      '<td class="strong">' + esc(c.nazwa) + '</td>' +
      '<td class="num">' + (kwotowy ? DB.fmtPLN(c.cel) : c.cel + "%") + '</td>' +
      '<td class="num">' + (kwotowy ? DB.fmtPLN(c.obecnie) : c.obecnie + "%") + '</td>' +
      '<td style="min-width:150px"><div class="progress' + (ok ? " pos" : "") + '"><i style="width:' + pct + '%"></i></div></td>' +
      '<td>' + esc(c.premia) + '</td>' +
      '<td><span class="tag ' + (ok ? "pos" : "info") + ' dot">' + esc(c.status) + '</span></td></tr>';
  }).join("");
}


var OPIS_PODSTAWY = {
  wn: "Wariant obecny. Podstawą jest wartość wniosków złożonych, bo statystycznie zakłada się " +
      "stały współczynnik akceptacji. Prowizja należy się za pracę włożoną w napisanie wniosku, " +
      "niezależnie od późniejszej decyzji urzędu.",
  prz: "Wariant docelowy od 2027. Podstawą jest procent od faktycznego przychodu firmy, czyli od " +
       "prowizji rozliczonej z instytucjami. System musi obsłużyć oba warianty, bo przełączenie " +
       "nastąpi w trakcie życia systemu, a dane historyczne zostają policzone starą regułą."
};

function podlaczPodstawe() {
  document.getElementById("opisPodstawy").textContent = OPIS_PODSTAWY.wn;
  document.getElementById("chWn").addEventListener("click", function () {
    this.classList.add("on");
    document.getElementById("chPrz").classList.remove("on");
    document.getElementById("opisPodstawy").textContent = OPIS_PODSTAWY.wn;
  });
  document.getElementById("chPrz").addEventListener("click", function () {
    this.classList.add("on");
    document.getElementById("chWn").classList.remove("on");
    document.getElementById("opisPodstawy").textContent = OPIS_PODSTAWY.prz;
  });
}
