/* Ekran Wniosek: rysowanie calosci i start ekranu.
   Tylko deklaracje, bez kodu wykonywanego od razu. */
function renderWszystko() {
  renderDane();
  renderFinanse();
  renderUcz();
  renderProwizja();
  renderMaile();
  renderPrzebieg();
}

function zablokujEdycje() {
  el("btnZapisz").style.display = "none";
  el("btnDodajUcz").style.display = "none";
  document.querySelectorAll("#stronaWniosku input.inp:not([readonly]), #stronaWniosku select.inp, #chDoplataFaktura")
    .forEach(function (p) { p.disabled = true; });
}

/* Okruszek wraca do listy, z ktorej otwarto karte, z tym samym rokiem, filtrami i wierszem */
function ustawPowrot() {
  var powrot = Nawigacja.linkPowrotu(location.search);
  el("linkPowrotu").href = powrot.adres;
  el("linkPowrotu").textContent = powrot.etykieta;
  return powrot;
}

function start03() {
  var powrot = ustawPowrot();
  if (!wczytaj()) {
    el("stronaWniosku").innerHTML =
      '<div class="note warn" style="margin:24px 0"><b>Nie znaleziono wniosku</b> ' + esc(STAN_03.wnId) +
      '. Wniosek nie istnieje albo nie masz do niego dostępu. <a href="' + esc(powrot.adres) + '">Wróć: ' +
      esc(powrot.etykieta) + '</a>.</div>';
    return;
  }
  if (!STAN_03.widziProwizje) el("cardProwizja").remove();
  if (!STAN_03.mozeEdytowac) zablokujEdycje();
  renderWszystko();
  el("btnZapisz").addEventListener("click", zapisz);
  ["fPrzyznano", "fWklad"].forEach(function (idPola) {
    el(idPola).addEventListener("input", function () {
      oznaczNadpisanie(idPola === "fPrzyznano" ? "wrapPrzyznano" : "wrapWklad", true);
      renderKontrola();
    });
  });
  el("selProg").addEventListener("change", function () { oznaczNadpisanie("wrapProg", true); });
}
