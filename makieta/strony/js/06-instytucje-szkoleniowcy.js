/* Ekran Instytucje: szkoleniowcy, podglad i edycja (D-167).
   Tylko deklaracje, bez kodu wykonywanego od razu. */
/* ---------- Szczegol: szkoleniowcy (D-167) ---------- */
function wierszSzkoleniowca(z) {
  if (z.id === STAN_06.edytowanySzkoleniowiec) return wierszSzkoleniowcaEdycji(z);
  var akcje = moznaEdytowac()
    ? '<div class="btn-row" style="justify-content:flex-end">' +
      '<button class="btn xs" onclick="edytujSzkoleniowca(\'' + escJs(z.id) + '\')">Edytuj</button>' +
      '<button class="btn xs" onclick="przelaczSzkoleniowca(\'' + escJs(z.id) + '\')">' + (z.aktywny ? "Dezaktywuj" : "Aktywuj") + "</button></div>"
    : "";
  return "<tr" + (z.aktywny ? "" : ' class="muted"') + ">" +
    '<td class="strong">' + esc(z.imie + " " + z.nazwisko) + "</td>" +
    "<td>" + esc(z.specjalizacja || "-") + "</td>" +
    '<td class="small mono">' + esc(z.mail || "-") + "</td>" +
    '<td class="small nowrap">' + esc(z.tel || "-") + "</td>" +
    "<td>" + (z.aktywny ? '<span class="tag pos">aktywny</span>' : '<span class="tag mute">nieaktywny</span>') + "</td>" +
    '<td class="right">' + akcje + "</td></tr>";
}
function renderSzkoleniowcy(i) {
  var lista = szkoleniowcyIS(i.id);
  el("szklSub").textContent = lista.length + " szkoleniowców instytucji " + i.nazwa + ".";
  pokazTylkoGdyEdycja("btnDodajSzkoleniowca");
  el("szkoleniowcy").innerHTML = lista.length ? lista.map(wierszSzkoleniowca).join("") :
    '<tr><td colspan="6"><div class="empty"><div class="et">Brak szkoleniowców</div>Instytucja nie ma jeszcze dodanych szkoleniowców.</div></td></tr>';
}

/* ---- Szkoleniowcy ---- */
function poleSzkol(id, etykieta, wartosc) {
  return '<input class="inp" id="' + id + '" placeholder="' + etykieta + '" title="' + etykieta + '" value="' + esc(wartosc) + '">';
}
function wierszSzkoleniowcaEdycji(z) {
  return '<tr class="row-nabor">' +
    "<td>" + poleSzkol("ezImie", "Imię", z.imie) + poleSzkol("ezNazwisko", "Nazwisko", z.nazwisko) + "</td>" +
    "<td>" + poleSzkol("ezSpec", "Specjalizacja", z.specjalizacja) + "</td>" +
    "<td>" + poleSzkol("ezMail", "E-mail", z.mail) + "</td>" +
    "<td>" + poleSzkol("ezTel", "Telefon", z.tel) + "</td>" +
    "<td></td>" +
    '<td class="right"><div class="btn-row" style="justify-content:flex-end">' +
      '<button class="btn xs primary" onclick="zapiszSzkoleniowca(\'' + escJs(z.id) + '\')">Zapisz</button>' +
      '<button class="btn xs" onclick="anulujSzkoleniowca()">Anuluj</button></div></td></tr>';
}
function pokazSzkolForm() {
  var f = el("szklForm");
  f.innerHTML =
    '<div class="small strong" style="margin-bottom:8px">Nowy szkoleniowiec dla: ' + esc((aktualnaIS() || {}).nazwa) + '</div>' +
    '<div class="toolbar" style="flex-wrap:wrap;gap:8px;padding:0">' +
      poleSzkol("nzImie", "Imię", "") + poleSzkol("nzNazwisko", "Nazwisko", "") +
      poleSzkol("nzSpec", "Specjalizacja", "") + poleSzkol("nzMail", "E-mail", "") + poleSzkol("nzTel", "Telefon", "") +
      '<button class="btn primary sm" onclick="zapiszNowegoSzkoleniowca()">Zapisz</button>' +
      '<button class="btn sm" onclick="ukryjSzkolForm()">Anuluj</button>' +
    '</div>';
  f.style.display = "block";
}
function ukryjSzkolForm() { var f = el("szklForm"); f.style.display = "none"; f.innerHTML = ""; }
function zapiszNowegoSzkoleniowca() {
  var imie = el("nzImie").value.trim(), nazwisko = el("nzNazwisko").value.trim();
  if (!imie || !nazwisko) { el(imie ? "nzNazwisko" : "nzImie").focus(); return; }
  Store.insert("szkoleniowcy", {
    instytucja_id: STAN_06.wybrana, imie: imie, nazwisko: nazwisko, aktywny: 1,
    specjalizacja: el("nzSpec").value.trim() || null, email: el("nzMail").value.trim() || null,
    telefon: el("nzTel").value.trim() || null
  }, "SZK-");
  ukryjSzkolForm();
}
function edytujSzkoleniowca(id) { STAN_06.edytowanySzkoleniowiec = id; renderSzczegol(); }
function anulujSzkoleniowca() { STAN_06.edytowanySzkoleniowiec = null; renderSzczegol(); }
function zapiszSzkoleniowca(id) {
  var imie = el("ezImie").value.trim(), nazwisko = el("ezNazwisko").value.trim();
  if (!imie || !nazwisko) { el(imie ? "ezNazwisko" : "ezImie").focus(); return; }
  STAN_06.edytowanySzkoleniowiec = null;
  Store.update("szkoleniowcy", id, {
    imie: imie, nazwisko: nazwisko, specjalizacja: el("ezSpec").value.trim() || null,
    email: el("ezMail").value.trim() || null, telefon: el("ezTel").value.trim() || null
  });
}
function przelaczSzkoleniowca(id) {
  var z = Store.find("szkoleniowcy", id);
  if (z) Store.update("szkoleniowcy", id, { aktywny: z.aktywny ? 0 : 1 });
}
