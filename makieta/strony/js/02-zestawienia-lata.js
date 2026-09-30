/* Ekran 02, czesc 3: rok widoku i dodawanie kolejnego roku (D-129, D-159).
   Lata wybiera sie w lewym menu (Dofinansowania > rok > instytucja), wiec ekran
   nie ma juz wlasnych zakladek lat. "+ Dodaj rok" w menu otwiera ten ekran
   z ?dodajRok=1 i pokazuje formularz. Korzysta ze STAN_02. Same deklaracje. */

function nazwaRoku(rok) { return rok === NIEPRZYPISANE ? "nieprzypisane" : rok; }

function odswiezNoteRoku() {
  var rok = DB.LATA.filter(function (l) { return l.rok === STAN_02.rokAktywny; })[0];
  var opis = rok && rok.opis ? rok.opis : "";
  if (STAN_02.rokAktywny === NIEPRZYPISANE) opis = "Wnioski bez przypisanego roku. Nie znikają z systemu (D-165).";
  var brakWnioskow = !STAN_02.W.length;
  document.getElementById("notaRok").style.display = (opis || brakWnioskow) ? "block" : "none";
  document.getElementById("notaRokTresc").innerHTML = "<b>Dofinansowania " + esc(nazwaRoku(STAN_02.rokAktywny)) +
    (brakWnioskow ? ": brak wniosków." : ".") + "</b> " + esc(opis) + ' <span class="ref">D-159</span>';
}

function odswiezRok() {
  var tytul = document.querySelector(".page-title");
  var zakres = STAN_02.forcedInst ? STAN_02.forcedInst.nazwa : "wszystkie instytucje";
  tytul.textContent = "Dofinansowania " + nazwaRoku(STAN_02.rokAktywny) + " · " + zakres;
  STAN_02.W = budujW();
  odswiezNoteRoku();
  /* Nowy projekt dostaje numer i identyfikator z roku, wiec nie ma sensu w zakladce bez roku */
  document.getElementById("btnNowyProjekt").style.display = STAN_02.rokAktywny === NIEPRZYPISANE ? "none" : "";
  render();
}

function pokazDodajRok() {
  var el = document.getElementById("dodajRok");
  el.style.display = "";
  el.innerHTML = '<div class="note mb0" style="display:flex;align-items:center;gap:8px">' +
    '<b>Nowy rok Dofinansowań</b>' +
    '<input class="inp" id="nowyRok" value="' + Lata.nastepny() + '" maxlength="4" style="width:70px;padding:3px 6px">' +
    '<button class="btn primary xs" onclick="dodajRok()">Dodaj</button>' +
    '<button class="btn xs" onclick="ukryjDodajRok()">Anuluj</button>' +
    '<span class="small muted">Rok pojawi się w lewym menu, pusty, bez wniosków <span class="ref">D-159</span></span></div>';
  document.getElementById("nowyRok").focus();
}
function ukryjDodajRok() { var el = document.getElementById("dodajRok"); el.style.display = "none"; el.innerHTML = ""; }

function dodajRok() {
  try {
    var nowy = Lata.dodaj(document.getElementById("nowyRok").value, Auth.sesja().imie);
    /* Przejscie na nowy rok przeladowuje ekran, a ten zglasza powloce nowa liste lat do menu */
    KFS.zapiszTeraz().finally(function () { location.href = "02-zestawienia.html" + Nawigacja.zbudujZapytanie({ rok: nowy.rok }); });
  } catch (e) {
    if (!(e instanceof Lata.LataError)) throw e;
    window.alert(e.message);
  }
}
