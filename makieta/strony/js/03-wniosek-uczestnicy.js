/* Ekran Wniosek: lista uczestnikow i zmiana kwalifikacji.
   Tylko deklaracje, bez kodu wykonywanego od razu. */
function renderUcz() {
  var zakw = STAN_03.w.uczestnicy.filter(function (u) { return u.status === "zakwalifikowany"; }).length;
  el("subUcz").innerHTML =
    zakw + " zakwalifikowanych z " + STAN_03.w.uczestnicy.length +
    (zakw < STAN_03.w.uczestnicy.length ? ' &middot; niezakwalifikowani wymagają odrębnej faktury komercyjnej <span class="ref">D-84</span>' : "");

  el("uczestnicy").innerHTML = STAN_03.w.uczestnicy.map(function (u, i) {
    var zak = u.status === "zakwalifikowany";
    var pesel = u.pesel ? esc(u.pesel.slice(0, 6)) + "*****" : '<span class="muted">ukryty</span>';
    return '<tr' + (zak ? "" : ' class="row-danger"') + '>' +
      '<td class="strong">' + esc(u.imie) + '</td>' +
      '<td class="mono muted">' + pesel + '</td>' +
      '<td>' + esc(u.szkNazwa) + '</td>' +
      '<td class="num">' + (zak ? esc(DB.fmtPLN(u.kwota)) : '<span class="muted">0 zł</span>') + '</td>' +
      '<td>' + (zak
        ? '<span class="tag pos dot">zakwalifikowany</span>'
        : '<span class="tag neg dot" title="' + esc(u.powod) + '">niezakwalifikowany</span>' +
          '<div class="small muted">' + esc(u.powod) + '</div>') + '</td>' +
      '<td class="right">' + (STAN_03.mozeEdytowac ? '<button class="btn xs" onclick="przelacz(' + i + ')">Zmień</button>' : '') + '</td>' +
      '</tr>';
  }).join("");
}

function przelacz(i) {
  var u = STAN_03.w.uczestnicy[i];
  var nowy = u.status === "zakwalifikowany" ? "niezakwalifikowany" : "zakwalifikowany";
  var patch = {
    status_kwalifikacji: nowy,
    powod_niezakwalifikowania: nowy === "niezakwalifikowany" ? (u.powod || "brak umowy o pracę") : null
  };
  zapiszZmiany("uczestnicy", u.id, patch,
    [{ typ: "Zmiana kwalifikacji", pole: "Kwalifikacja: " + u.imie, przed: u.status, po: nowy }]);
}
