/* Panel instytucji: terminy, katalog szkolen, szkoleniowcy i szablony maili (tylko deklaracje) */

/* Moje terminy: tylko podsumowanie, szczegoly w module Terminy */
function renderTerminy16() {
  var TR = STAN_16.TR;
  var wolne = TR.filter(function (t) { return t.status === "Wolny"; }).length;
  var zaplanowane = TR.filter(function (t) { return t.status === "Zaplanowany"; }).length;
  el16("podsTerminy").innerHTML = TR.length
    ? "<b>" + TR.length + "</b> terminów: " + zaplanowane + " zaplanowanych, " + wolne + " wolnych, " +
      (TR.length - zaplanowane - wolne) + " odbytych."
    : '<span class="muted">Instytucja nie ma jeszcze wystawionych terminów.</span>';
}

/* Katalog szkolen (tylko odczyt) */
function wierszSzkolenia16(s) {
  var ile = STAN_16.W.filter(function (w) { return w.szkId === s.id; }).length;
  return '<tr>' +
    '<td class="strong">' + esc(s.nazwa) + '</td>' +
    '<td class="num">' + esc(s.godz) + '</td>' +
    '<td class="num">' + esc(s.dni) + '</td>' +
    '<td><span class="pill w">' + esc(s.tryb) + '</span></td>' +
    '<td class="num">' + DB.fmtPLN(s.cena) + '</td>' +
    '<td class="num">' + ile + '</td></tr>';
}

function renderKatalog16() {
  el16("szkolenia").innerHTML = STAN_16.SZ.length ? wiersze16(STAN_16.SZ, wierszSzkolenia16) :
    '<tr><td colspan="6"><div class="empty"><div class="et">Katalog pusty</div>Instytucja nie ma jeszcze szkoleń w katalogu.</div></td></tr>';
}

/* Szkoleniowcy instytucji (D-167) */
function wierszSzkoleniowca16(z) {
  return '<tr' + (z.aktywny ? "" : ' class="muted"') + '>' +
    '<td class="strong">' + esc(z.imie + " " + z.nazwisko) + '</td>' +
    '<td>' + esc(z.specjalizacja || "-") + '</td>' +
    '<td class="small">' + esc([z.mail, z.tel].filter(Boolean).join(" · ") || "-") + '</td>' +
    '<td>' + (z.aktywny ? '<span class="tag pos">aktywny</span>' : '<span class="tag mute">nieaktywny</span>') + '</td></tr>';
}

function renderSzkoleniowcy16() {
  var lista = STAN_16.SZKOLENIOWCY;
  el16("subSzkoleniowcy").textContent = lista.length + " osób";
  el16("szkoleniowcy").innerHTML = lista.length ? wiersze16(lista, wierszSzkoleniowca16) :
    '<tr><td colspan="4"><div class="empty"><div class="et">Brak szkoleniowców</div>Instytucja nie ma jeszcze dodanych szkoleniowców.</div></td></tr>';
}

/* Szablony maili dostepne dla instytucji */
function renderSzablony16() {
  var moje = DB.SZABLONY.filter(function (s) {
    return s.odbiorca === "Instytucja szkoleniowa" || s.odbiorca === "Uczestnicy terminu";
  });
  el16("szablony").innerHTML = wiersze16(moje, function (s) {
    return '<tr><td class="strong">' + esc(s.nazwa) + '</td>' +
      '<td class="small muted">' + esc(s.odbiorca) + '</td>' +
      '<td><span class="pill">' + esc(s.autor) + '</span></td>' +
      '<td class="right"><button class="btn xs" data-mail="' + esc(s.id) + '">Otwórz w Outlooku</button></td></tr>';
  }) +
  '<tr><td colspan="4" class="small muted" style="padding:10px 12px">' +
  'Pozostałe szablony z biblioteki (' + (DB.SZABLONY.length - moje.length) + ') są adresowane do klienta końcowego ' +
  'i wysyła je wyłącznie LDIT <span class="ref">D-87</span>.</td></tr>';

  Array.prototype.forEach.call(document.querySelectorAll("button[data-mail]"), function (b) {
    b.addEventListener("click", function () {
      alert("Otwiera nową wiadomość w Outlooku z uzupełnioną treścią szablonu.\nSystem niczego nie wysyła (D-87). Wysyłkę wykonujesz z własnej skrzynki (D-88).");
    });
  });
}
