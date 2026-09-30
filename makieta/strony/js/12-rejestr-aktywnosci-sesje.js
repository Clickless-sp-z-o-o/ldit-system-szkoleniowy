/* Rejestr aktywnosci: aktywne sesje (tabela sesje). Kto jest zalogowany, od kiedy, kiedy
   ostatnio cos robil i kiedy sesja wygasnie (30 minut bezczynnosci). Token sesji nie jest
   pokazywany: to klucz do konta. Tylko deklaracje. */

function czasSesji(iso) { return iso ? String(iso).replace("T", " ").slice(0, 16) : "-"; }

function renderSesje12() {
  var teraz = new Date().toISOString();
  var sesje = Store.query("SELECT uzytkownik_id, utworzono, ostatnia_aktywnosc, wygasa FROM sesje ORDER BY ostatnia_aktywnosc DESC");
  var wiersze = sesje.map(function (s) {
    var u = STAN_12.UMAP[s.uzytkownik_id] || {};
    var aktywna = s.wygasa > teraz;
    return '<tr class="' + (aktywna ? "" : "dim") + '"><td class="strong">' + esc(u.imie || s.uzytkownik_id) +
      '<div class="small muted">' + esc(s.uzytkownik_id) + '</div></td><td>' + esc(u.rola || "-") + '</td>' +
      '<td class="mono small">' + esc(czasSesji(s.utworzono)) + '</td><td class="mono small">' + esc(czasSesji(s.ostatnia_aktywnosc)) + '</td>' +
      '<td class="mono small">' + esc(czasSesji(s.wygasa)) + '</td>' +
      '<td>' + (aktywna ? '<span class="tag pos dot">aktywna</span>' : '<span class="tag mute dot">wygasła</span>') + '</td></tr>';
  }).join("");
  document.getElementById("t4").innerHTML =
    '<div class="card-body"><div class="note mb0">Sesja wygasa po 30 minutach bezczynności, wylogowanie ją usuwa. ' +
    'Token sesji nie jest pokazywany, bo daje dostęp do konta. Aktywnych: <b>' +
    sesje.filter(function (s) { return s.wygasa > teraz; }).length + '</b> z ' + sesje.length + '.</div></div>' +
    '<div class="card-body tight"><table class="tbl"><thead><tr><th>Konto</th><th>Rola</th><th>Zalogowano</th>' +
    '<th>Ostatnia aktywność</th><th>Wygasa</th><th>Stan</th></tr></thead><tbody>' +
    (wiersze || '<tr><td colspan="6" class="small muted">Brak sesji.</td></tr>') + '</tbody></table></div>';
}
