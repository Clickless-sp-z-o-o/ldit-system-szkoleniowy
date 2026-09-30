/* Ekran Instytucje: filtry, lista kafelkow, zakladki, odswiezanie.
   Tylko deklaracje, bez kodu wykonywanego od razu. */
/* ---------- Filtry listy ---------- */
function unikalne(pole) {
  var m = {};
  DB.INSTYTUCJE.forEach(function (i) { if (i[pole]) m[i[pole]] = 1; });
  return Object.keys(m).sort();
}
/* Filtr wielokrotnego wyboru (assets/wielowybor.js): opcje z danych, wybor zachowany po odswiezeniu */
function wypelnijFiltr(id, etykieta, pole) {
  var sel = el(id), stare = Wielowybor.wartosci(sel);
  sel.setAttribute("data-pusty", etykieta + ": wszyscy");
  sel.innerHTML = unikalne(pole).map(function (v) {
    return '<option value="' + esc(v) + '">' + esc(v) + "</option>";
  }).join("");
  Wielowybor.ustaw(sel, stare);
}
function widoczne() {
  var q = el("fSzukaj").value.trim().toLowerCase();
  var op = Wielowybor.wartosci(el("fOpiekun")), mi = Wielowybor.wartosci(el("fMiasto"));
  return DB.INSTYTUCJE.filter(function (i) {
    if (!Wielowybor.pasuje(op, i.opiekun)) return false;
    if (!Wielowybor.pasuje(mi, i.miasto)) return false;
    if (!q) return true;
    return [i.nazwa, i.miasto, i.nip].join(" ").toLowerCase().indexOf(q) >= 0;
  });
}

/* ---------- Lista kafelkow ---------- */
function kafelek(i) {
  return '<div class="card is-card' + (i.id === STAN_06.wybrana ? " sel" : "") + '" data-id="' + esc(i.id) + '">' +
    '<div class="card-body">' +
      '<div style="display:flex;align-items:flex-start;gap:10px">' +
        '<div>' +
          '<div style="font-size:14.5px;font-weight:700">' + esc(i.nazwa) + '</div>' +
          '<div class="small muted">' + esc(i.miasto) + ' &middot; NIP ' + esc(i.nip) + '</div>' +
        '</div>' +
        '<span class="pill" style="margin-left:auto">' + esc(i.skrot) + '</span>' +
      '</div>' +
      '<div class="small" style="margin-top:9px;color:var(--ink-2)">' +
        '<b>Kontakt:</b> ' + esc(i.kontakt) + '<br>' +
        '<b>Opiekun LDIT:</b> ' + esc(i.opiekun) +
      '</div>' +
      '<div class="miniset">' +
        '<div class="mini" data-tip="Liczba klientów końcowych przypisanych do tej instytucji."><div class="mv">' + DB.fmtNum(klienciIS(i.id).length) + '</div><div class="ml">klientów</div></div>' +
        '<div class="mini" data-tip="Pozycje w katalogu szkoleń tej instytucji."><div class="mv">' + szkoleniaIS(i.id).length + '</div><div class="ml">w katalogu</div></div>' +
        '<div class="mini" data-tip="Projekty aktywne w 2026: złożone bez decyzji lub z decyzją pozytywną, jeszcze nierozliczone."><div class="mv">' + aktywneIS(i.id).length + '</div><div class="ml">projektów</div></div>' +
      '</div>' +
    '</div>' +
  '</div>';
}
function renderLista() {
  var lista = widoczne();
  el("listaIS").innerHTML = lista.length ? lista.map(kafelek).join("") :
    '<div class="empty"><div class="et">Brak instytucji</div>Żadna instytucja nie spełnia filtrów.</div>';
  var akt = DB.INSTYTUCJE.filter(function (i) { return czyAktywna(i.id); }).length;
  el("chipAkt").textContent = akt;
  el("chipNieakt").textContent = DB.INSTYTUCJE.length - akt;
  el("stopkaLista").textContent = "Pokazano " + lista.length + " z " + DB.INSTYTUCJE.length +
    " instytucji dostępnych dla tego konta.";
  Array.prototype.forEach.call(document.querySelectorAll(".is-card"), function (k) {
    k.addEventListener("click", function () {
      STAN_06.wybrana = k.getAttribute("data-id");
      /* Wybrana instytucja w adresie: Wstecz z innego ekranu wraca na te sama karte */
      Nawigacja.zapiszWAdresie({ id: STAN_06.wybrana });
      renderLista();
      renderSzczegol();
      el("detNazwa").scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
}

function aktywujTab(pid) {
  Array.prototype.forEach.call(document.querySelectorAll("#tabs .tab"), function (x) { x.classList.remove("on"); });
  Array.prototype.forEach.call(document.querySelectorAll(".tab-pane"), function (x) { x.classList.remove("on"); });
  var tb = document.querySelector('#tabs .tab[data-p="' + pid + '"]');
  if (tb) tb.classList.add("on");
  el(pid).classList.add("on");
}

/* Wejscie z linku (np. Zgloszenia, "Otworz karte podmiotu"): ?id=IS-01 otwiera karte tej
   instytucji. Instytucja spoza zakresu konta nie jest w DB.INSTYTUCJE, wiec link nic nie odslania. */
function wybierzZAdresu06() {
  var id = Nawigacja.odczytajZapytanie(location.search, ["id"]).id;
  var jest = DB.INSTYTUCJE.some(function (i) { return i.id === id; });
  if (jest) STAN_06.wybrana = id;
  return jest;
}

function odswiez06() {
  wypelnijFiltr("fOpiekun", "Opiekun LDIT", "opiekun");
  wypelnijFiltr("fMiasto", "Miasto", "miasto");
  if (!aktualnaIS() && DB.INSTYTUCJE.length) STAN_06.wybrana = DB.INSTYTUCJE[0].id;
  renderLista();
  renderSzczegol();
}
