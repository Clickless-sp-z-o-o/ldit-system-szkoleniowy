/* Zadania: formularz nowego zadania recznego i przelaczanie statusu (tylko deklaracje) */

function otworzFormularzZadania() {
  var opcje = '<option value="">bez wniosku</option>' + DB.WNIOSKI_WSZYSTKIE.map(function (w) {
    return '<option value="' + esc(w.id) + '">' + esc(w.nr + " · " + w.klNazwa) + '</option>';
  }).join("");
  document.getElementById("wniosekZadania").innerHTML = opcje;
  document.getElementById("tytulZadania").value = "";
  document.getElementById("terminZadania").value = dzisiaj();
  document.getElementById("formZadania").style.display = "block";
  document.getElementById("tytulZadania").focus();
}

function zamknijFormularzZadania() {
  document.getElementById("formZadania").style.display = "none";
}

function zapiszZadanie() {
  var tytul = document.getElementById("tytulZadania").value.trim();
  if (!tytul) { document.getElementById("tytulZadania").focus(); return; }
  Store.insert("zadania", {
    tytul: tytul, typ: "reczne",
    wniosek_id: document.getElementById("wniosekZadania").value || null,
    termin: document.getElementById("terminZadania").value || null,
    przypisane_do: STAN_18.sesja.uzytkownik_id, status: "otwarte"
  }, "ZAD-");
  zamknijFormularzZadania();
}

function przelaczZadanie(id, zrobione) {
  Store.update("zadania", id, { status: zrobione ? "zrobione" : "otwarte" });
}

function podepnijOdswiezanie18() {
  if (!STAN_18.moznaEdytowac) document.getElementById("btnNoweZadanie").style.display = "none";
  window.addEventListener("db:changed", function () { STAN_18.sesja = Auth.sesja(); render(); });
}
