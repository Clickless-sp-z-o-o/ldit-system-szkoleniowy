/* Konfigurator instytucji: render calosci, selektor instytucji, zakladki. Tylko deklaracje. */
function podlaczFormularzeEdycji() {
  if (!STAN_07.mozeEdytowac) return;
  var kum = document.getElementById("nwKum");
  kum.addEventListener("change", function () {
    var brak = kum.value === "brak";
    document.getElementById("nwSposob").style.display = brak ? "none" : "";
    document.getElementById("nwProgi").style.display = brak ? "none" : "";
    document.getElementById("nwStala").style.display = brak ? "" : "none";
  });
  document.getElementById("nwZapisz").addEventListener("click", dodajWersje);
  document.getElementById("pdZapisz").addEventListener("click", dodajWersjeProgow);
}

function render07() {
  var i = instytucja(STAN_07.wybrana);
  var dzis = dzisiaj();
  var wersje = wersjeInstytucji(i.id);
  var akt = wersjaNaDzien(wersje, dzis);
  var wnioski = DB.WNIOSKI_WSZYSTKIE.filter(function (w) { return w.is === i.id; });
  var wn26 = wnioski.filter(function (w) { return w.rok === "2026"; });

  document.getElementById("tagModel").textContent = akt ? "Model " + akt.model + ": " + OPIS_MODELU[akt.model] : "Brak warunków prowizyjnych";
  /* Wnioskow z 2025 nie ma w bazie (D-160), liczymy tylko to, co jest */
  document.getElementById("podsumowanie").innerHTML =
    esc(i.miasto) + " &middot; " + wn26.length + " projektów w 2026 &middot; opiekun " + esc(i.opiekun);
  document.getElementById("obowOd").innerHTML = akt ? "obowiązuje od <b>" + esc(akt.od) + "</b>" : "brak warunków";
  document.getElementById("warunkiAkt").innerHTML = warunkiHtml(akt);
  document.getElementById("historia").innerHTML = historiaHtml(wersje, dzis);

  var projekty = wnioski.filter(function (w) {
    return w.statusDec === "Pozytywna" && w.dataFaktury && w.podstawaProwizji != null;
  });
  document.getElementById("rozlWersje").innerHTML = rozliczeniaHtml(wersje, projekty);

  document.getElementById("polaWersji").innerHTML = polaWersjiHtml();
  progiDofRender(dzis);
  podlaczFormularzeEdycji();

  var ctx = certyfikatRender(i, wn26);
  daneDoFakturyRender(i, wn26, ctx);
  formularzRender(i);
}

/* Wstawia statyczne panele zakladek (tresc w plikach panel-*.js) */
function zaladujPanele07() {
  document.getElementById("p-prow").innerHTML = panelProwizje07();
  document.getElementById("p-cert").innerHTML = panelCertyfikat07();
  document.getElementById("p-fakt").innerHTML = panelFaktura07();
  document.getElementById("p-form").innerHTML = panelFormularz07();
}

/* Selektor instytucji, zakladki i usuwanie planowanej wersji */
function inicjujWidok07() {
  STAN_07.mozeEdytowac = Auth.edytujeModul("admin");
  STAN_07.wybrana = DB.INSTYTUCJE.length ? DB.INSTYTUCJE[0].id : null;
  zaladujPanele07();
  var sel = document.getElementById("selIS");  
  sel.innerHTML = DB.INSTYTUCJE.map(function (i) {  
    return '<option value="' + esc(i.id) + '"' + (i.id === STAN_07.wybrana ? " selected" : "") + ">" + esc(i.nazwa) + " (" + esc(i.miasto) + ")</option>";  
  }).join("");  
  sel.addEventListener("change", function () { STAN_07.wybrana = sel.value; render07(); });  
    
  document.getElementById("historia").addEventListener("click", function (e) {  
    var id = e.target.getAttribute("data-usun");  
    if (id) usunPlanowana(id);  
  });  
    
  Array.prototype.forEach.call(document.querySelectorAll("#tabs .tab"), function (t) {  
    t.addEventListener("click", function () {  
      Array.prototype.forEach.call(document.querySelectorAll("#tabs .tab"), function (x) { x.classList.remove("on"); });  
      Array.prototype.forEach.call(document.querySelectorAll(".tab-pane"), function (x) { x.classList.remove("on"); });  
      t.classList.add("on");  
      document.getElementById(t.getAttribute("data-p")).classList.add("on");  
    });  
  });  
  render07();
}
