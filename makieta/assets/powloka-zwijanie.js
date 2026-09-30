/* ============================================================================
   Zwijanie lewego menu powloki (index.html). Zwiniete menu pokazuje same ikony,
   wiecej miejsca zostaje na tabele. Stan jest pamietany w przegladarce.
   Klikniecie Dofinansowan w zwinietym menu rozwija je, bo lata i instytucje
   wymagaja pelnej szerokosci.
   ============================================================================ */

(function (global) {
  "use strict";

  var KLUCZ = "kfs_menu_zwiniete";
  var app = global.document.querySelector(".app");
  var przycisk = global.document.getElementById("zwinMenu");

  function zapamietaj(zwiniete) {
    try { global.localStorage.setItem(KLUCZ, zwiniete ? "1" : "0"); }
    catch (e) { /* bez localStorage stan zyje do przeladowania strony */ }
  }

  function odczytaj() {
    try { return global.localStorage.getItem(KLUCZ) === "1"; }
    catch (e) { return false; }
  }

  function ustaw(zwiniete) {
    app.classList.toggle("menu-zwiniete", zwiniete);
    przycisk.innerHTML = zwiniete ? "&raquo;" : "&laquo;";
    przycisk.setAttribute("data-tip", zwiniete ? "Rozwiń menu" : "Zwiń menu");
    przycisk.setAttribute("aria-label", zwiniete ? "Rozwiń menu" : "Zwiń menu");
    przycisk.setAttribute("aria-expanded", String(!zwiniete));
    zapamietaj(zwiniete);
  }

  przycisk.addEventListener("click", function () { ustaw(!app.classList.contains("menu-zwiniete")); });

  /* Faza przechwytywania: rozwijamy menu, zanim obsluga pozycji otworzy lata */
  global.document.getElementById("nav").addEventListener("click", function (e) {
    if (app.classList.contains("menu-zwiniete") && e.target.closest('.nav-item[data-id="dofin"]')) ustaw(false);
  }, true);

  ustaw(odczytaj());
})(window);
