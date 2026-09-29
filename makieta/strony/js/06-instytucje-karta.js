/* Ekran Instytucje: formularz karty instytucji (edycja i dodawanie).
   Tylko deklaracje, bez kodu wykonywanego od razu. */
/* ---- Karta instytucji ---- */
var POLA_IS = [
  ["nazwa", "Nazwa"], ["skrot", "Skrót"], ["siedziba_miejscowosc", "Siedziba (miejscowość)"], ["nip", "NIP"],
  ["strona_www", "Strona www"], ["opis_dzialalnosci", "Opis działalności"],
  ["osoba_kontaktowa", "Kontakt główny (osoba)"], ["email", "Kontakt główny (e-mail)"], ["telefon", "Kontakt główny (telefon)"],
  ["osoba_kontaktowa_2", "Kontakt 2 (osoba)"], ["email_2", "Kontakt 2 (e-mail)"], ["telefon_2", "Kontakt 2 (telefon)"],
  ["osoba_kontaktowa_3", "Kontakt 3 (osoba)"], ["email_3", "Kontakt 3 (e-mail)"], ["telefon_3", "Kontakt 3 (telefon)"],
  ["standard_godzinowy", "Standard godzinowy"], ["opiekun_ldit", "Opiekun LDIT"]
];
function polaFormularzaIS(wiersz) {
  var pola = POLA_IS.map(function (p) {
    return '<label class="small" style="display:flex;flex-direction:column;gap:3px">' +
      '<span class="muted">' + p[1] + '</span>' +
      '<input class="inp" id="if_' + p[0] + '" value="' + esc(wiersz ? wiersz[p[0]] : "") + '"></label>';
  }).join("");
  var model = wiersz ? wiersz.model_terminow : "kalendarz";
  return pola + '<label class="small" style="display:flex;flex-direction:column;gap:3px"><span class="muted">Model terminów</span>' +
    '<select class="inp" id="if_model_terminow">' + Object.keys(MODEL_TERMINOW).map(function (k) {
      return '<option value="' + k + '"' + (model === k ? " selected" : "") + ">" + esc(MODEL_TERMINOW[k]) + "</option>";
    }).join("") + "</select></label>";
}
function isFormHTML(wiersz, tytul, submitLabel, onSubmit) {
  return '<div class="card mb0"><div class="card-body">' +
    '<div class="small strong" style="margin-bottom:10px">' + esc(tytul) + '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' + polaFormularzaIS(wiersz) + '</div>' +
    '<div class="btn-row" style="margin-top:12px">' +
      '<button class="btn primary sm" onclick="' + onSubmit + '">' + submitLabel + '</button>' +
      '<button class="btn sm" onclick="zamknijISForm()">Anuluj</button>' +
    '</div></div></div>';
}
function zbierzIS() {
  var o = {};
  POLA_IS.forEach(function (p) { o[p[0]] = el("if_" + p[0]).value.trim() || null; });
  o.model_terminow = el("if_model_terminow").value;
  return o;
}
function otworzISForm(html) {
  el("daneFirmy").style.display = "none";
  var f = el("isForm");
  f.innerHTML = html;
  f.style.display = "block";
  aktywujTab("p-dane");
}
function zamknijISForm() {
  var f = el("isForm");
  f.style.display = "none"; f.innerHTML = "";
  el("daneFirmy").style.display = "";
}
function zapiszEdycjeIS() {
  var patch = zbierzIS();
  if (!patch.nazwa) { el("if_nazwa").focus(); return; }
  Store.update("instytucje", STAN_06.wybrana, patch);
  zamknijISForm();
}
function dodajIS() {
  var o = zbierzIS();
  if (!o.nazwa) { el("if_nazwa").focus(); return; }
  var nowa = Store.insert("instytucje", o, "IS-");
  STAN_06.wybrana = nowa.id;
  zamknijISForm();
}

function otworzEdycjeIS() {
  var wiersz = Store.find("instytucje", STAN_06.wybrana);
  otworzISForm(isFormHTML(wiersz, "Edycja karty: " + wiersz.nazwa, "Zapisz zmiany", "zapiszEdycjeIS()"));
}
function otworzNowaIS() {
  otworzISForm(isFormHTML(null, "Nowa instytucja szkoleniowa", "Dodaj instytucję", "dodajIS()"));
}
