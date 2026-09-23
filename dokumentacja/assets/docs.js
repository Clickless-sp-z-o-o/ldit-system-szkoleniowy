/* ============================================================
   Nawigacja dokumentacji KFS / LDIT.
   Jedno zrodlo listy sekcji. Powloka (index.html) renderuje z
   niego lewe menu, laduje pliki z sekcje/ do iframe, obsluguje
   zwijanie grup, filtr i linki bezposrednie (#id w adresie).
   ============================================================ */

var SECTIONS = [
  { grupa: "Przegląd", items: [
    { id: "00-start", ikona: "&#9673;", label: "Start" }
  ] },
  { grupa: "Fundament", items: [
    { id: "01-kontekst",       ikona: "&#9632;", label: "Kontekst i cel" },
    { id: "02-role",           ikona: "&#9634;", label: "Role i uprawnienia" },
    { id: "03-model-danych",   ikona: "&#9638;", label: "Model danych i diagram tabel" },
    { id: "04-proces-statusy", ikona: "&#9201;", label: "Proces i statusy" }
  ] },
  { grupa: "Funkcje", items: [
    { id: "05-zakladki",       ikona: "&#9783;", label: "Zakładki systemu" },
    { id: "06-finanse",        ikona: "&#9863;", label: "Model finansowy KFS" },
    { id: "07-prowizja",       ikona: "&#9881;", label: "Silnik prowizji" },
    { id: "08-powiadomienia",  ikona: "&#9993;", label: "Powiadomienia i certyfikaty" },
    { id: "09-logi-zgloszenia",ikona: "&#9888;", label: "Logi i zgłoszenia" }
  ] },
  { grupa: "Realizacja", items: [
    { id: "10-bezpieczenstwo", ikona: "&#9911;", label: "Bezpieczeństwo i RODO" },
    { id: "11-zakres",         ikona: "&#9707;", label: "Zakres i etapy" },
    { id: "16-od-makiety",     ikona: "&#9881;", label: "Od makiety do aplikacji" }
  ] },
  { grupa: "Rejestry", items: [
    { id: "12-pytania-ryzyka", ikona: "&#9873;", label: "Pytania otwarte i ryzyka" },
    { id: "13-decyzje",        ikona: "&#9878;", label: "Rejestr decyzji" },
    { id: "14-slownik",        ikona: "&#9906;", label: "Słownik" }
  ] },
  { grupa: "Warsztaty", items: [
    { id: "15-warsztat-0904",  ikona: "&#9998;", label: "Warsztat 04.09.2026" }
  ] }
];

/* Mapa id -> etykieta, do okruszka i tytulu. */
var LABELS = {};
SECTIONS.forEach(function (g) { g.items.forEach(function (it) { LABELS[it.id] = it.label; }); });

var aktywny = null;

function renderNav() {
  var html = "";
  SECTIONS.forEach(function (g, gi) {
    html += '<div class="nav-group" data-g="' + gi + '">';
    html += '<div class="nav-group-label" onclick="toggleGrupa(' + gi + ')">' +
            g.grupa + '<span class="chev">&#9660;</span></div>';
    html += '<div class="nav-list">';
    g.items.forEach(function (it) {
      html += '<div class="nav-item" data-id="' + it.id + '" onclick="docNav(\'' + it.id + '\')">' +
              '<span class="ico">' + it.ikona + '</span><span class="lab">' + it.label + '</span></div>';
    });
    html += '</div></div>';
  });
  document.getElementById("nav").innerHTML = html;
}

function toggleGrupa(gi) {
  var g = document.querySelector('.nav-group[data-g="' + gi + '"]');
  if (g) g.classList.toggle("collapsed");
}

/* Zaladowanie sekcji do iframe. Wywolywane z menu ORAZ z linkow
   wewnatrz sekcji: <a ... onclick="if(parent!==window){parent.docNav('id');return false}"> */
function docNav(id) {
  if (!LABELS[id]) return;
  aktywny = id;
  document.getElementById("view").src = "sekcje/" + id + ".html";
  document.getElementById("crumb").innerHTML =
    'Dokumentacja &middot; <b>' + LABELS[id] + "</b>";
  document.querySelectorAll(".nav-item").forEach(function (el) {
    el.classList.toggle("active", el.getAttribute("data-id") === id);
  });
  /* rozwin grupe zawierajaca aktywna pozycje */
  var el = document.querySelector('.nav-item[data-id="' + id + '"]');
  if (el) {
    var grp = el.closest(".nav-group");
    if (grp) grp.classList.remove("collapsed");
  }
  if (location.hash.replace("#", "") !== id) {
    history.replaceState(null, "", "#" + id);
  }
}

function filtrujNav() {
  var q = document.getElementById("navSearch").value.toLowerCase().trim();
  SECTIONS.forEach(function (g, gi) {
    var grp = document.querySelector('.nav-group[data-g="' + gi + '"]');
    var widoczne = 0;
    grp.querySelectorAll(".nav-item").forEach(function (el) {
      var pasuje = !q || el.querySelector(".lab").textContent.toLowerCase().indexOf(q) >= 0;
      el.style.display = pasuje ? "" : "none";
      if (pasuje) widoczne++;
    });
    grp.style.display = widoczne ? "" : "none";
    if (q) grp.classList.remove("collapsed");
  });
}

document.addEventListener("DOMContentLoaded", function () {
  renderNav();
  document.getElementById("navSearch").addEventListener("input", filtrujNav);
  var start = location.hash.replace("#", "");
  docNav(LABELS[start] ? start : "00-start");
});
