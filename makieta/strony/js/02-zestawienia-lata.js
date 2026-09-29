/* Ekran 02, czesc 3: zakladki lat (D-129, D-159), przelaczanie i dodawanie kolejnego roku.
   Korzysta ze STAN_02 z 02-zestawienia-dane.js. Same deklaracje. */

function liczbaWRoku(rok) {
  var inst = STAN_02.forcedInst;
  return wnioskiZakladki(rok).filter(function (w) { return !inst || w.is === inst.id; }).length;
}

function przyciskRoku(rok, etykieta, tytul) {
  return '<button class="lata-tab' + (rok === STAN_02.rokAktywny ? " on" : "") + '" onclick="wybierzRok(\'' + escJs(rok) + '\')"' +
    (tytul ? ' title="' + tytul + '"' : "") + '>' + etykieta + ' <span class="n">' + liczbaWRoku(rok) + "</span></button>";
}

function rysujLata() {
  var el = document.getElementById("lataTabs");
  var html = DB.LATA.map(function (l) {
    return przyciskRoku(l.rok, "Dofinansowania " + esc(l.rok));
  }).join("");
  if (liczbaWRoku(NIEPRZYPISANE) > 0) {
    html += przyciskRoku(NIEPRZYPISANE, "Nieprzypisane", "Wnioski bez przypisanego roku (D-165)");
  }
  if (Auth.moze("zestawienia.dodawanie_lat")) {
    html += '<span class="lata-dodaj" id="lataDodaj">' +
      '<button class="lata-tab plus" onclick="pokazDodajRok()" title="Dodaj zakładkę kolejnego roku">+ Dodaj rok</button></span>';
  }
  el.innerHTML = html;
}

function odswiezNoteRoku(nazwaZakladki) {
  var rok = DB.LATA.filter(function (l) { return l.rok === STAN_02.rokAktywny; })[0];
  var opis = rok && rok.opis ? rok.opis : "";
  if (STAN_02.rokAktywny === NIEPRZYPISANE) opis = "Wnioski bez przypisanego roku. Nie znikają z systemu (D-165).";
  var brakWnioskow = !STAN_02.W.length;
  document.getElementById("notaRok").style.display = (opis || brakWnioskow) ? "block" : "none";
  document.getElementById("notaRokTresc").innerHTML = "<b>Dofinansowania " + esc(nazwaZakladki) +
    (brakWnioskow ? ": brak wniosków." : ".") + "</b> " + esc(opis) + ' <span class="ref">D-159</span>';
}

function odswiezRok() {
  var tytul = document.querySelector(".page-title");
  var nazwaZakladki = STAN_02.rokAktywny === NIEPRZYPISANE ? "nieprzypisane" : STAN_02.rokAktywny;
  if (tytul && !STAN_02.forcedInst) tytul.textContent = "Zestawienie " + nazwaZakladki + " · wszystkie instytucje";
  STAN_02.W = budujW();
  odswiezNoteRoku(nazwaZakladki);
  /* Nowy projekt dostaje numer i identyfikator z roku, wiec nie ma sensu w zakladce bez roku */
  document.getElementById("btnNowyProjekt").style.display = STAN_02.rokAktywny === NIEPRZYPISANE ? "none" : "";
  rysujLata(); render();
}
function wybierzRok(rok) { STAN_02.rokAktywny = rok; odswiezRok(); }

function pokazDodajRok() {
  document.getElementById("lataDodaj").innerHTML =
    '<input class="inp" id="nowyRok" value="' + Lata.nastepny() + '" maxlength="4" style="width:70px;padding:3px 6px">' +
    '<button class="btn primary xs" onclick="dodajRok()">Dodaj</button>' +
    '<button class="btn xs" onclick="rysujLata()">Anuluj</button>';
  document.getElementById("nowyRok").focus();
}

function dodajRok() {
  try {
    var nowy = Lata.dodaj(document.getElementById("nowyRok").value, Auth.sesja().imie);
    STAN_02.rokAktywny = nowy.rok;   /* od razu przechodzimy na nowa, pusta zakladke */
    odswiezRok();
  } catch (e) {
    if (!(e instanceof Lata.LataError)) throw e;
    window.alert(e.message);
  }
}
