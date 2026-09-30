/* Ekran 19: karta klienta. Dane firmy, wszystkie jej wnioski i korespondencja.
   Klient spoza zakresu konta nie trafia do DB.KLIENCI (assets/zakres.js), wiec
   karta cudzego klienta konczy sie komunikatem "nie znaleziono". Same deklaracje. */

var STAN_19 = { kl: null };

function el19(id) { return document.getElementById(id); }

function nazwaInstytucji19(id) {
  var i = DB.INSTYTUCJE.filter(function (x) { return x.id === id; })[0];
  return i ? i.nazwa : null;
}

/* Klient moze byc u wielu instytucji (D-144). Pokazujemy tylko te z zakresu konta. */
function instytucjeKlienta(idKlienta) {
  return Store.query("SELECT instytucja_id FROM klient_instytucja WHERE klient_id = ?", [idKlienta])
    .map(function (r) { return nazwaInstytucji19(r.instytucja_id); })
    .filter(function (n) { return n; });
}

function naborUrzedu(kl) {
  var pup = DB.PUPY.filter(function (p) { return p.id === kl.pup; })[0];
  var nabory = pup ? DB.NABORY.filter(function (n) { return n.pupId === pup.id; }) : [];
  var ogloszony = nabory.filter(function (n) { return n.status === "Nabór ogłoszony"; })[0];
  return { pup: pup ? pup.nazwa : "-", nabor: ogloszony || nabory[0] || null };
}

function renderDane19() {
  var kl = STAN_19.kl;
  var urzad = naborUrzedu(kl);
  var nabor = urzad.nabor
    ? esc(urzad.nabor.status) + (urzad.nabor.do ? ", do " + esc(urzad.nabor.do) : urzad.nabor.prognoza ? ", prognoza " + esc(urzad.nabor.prognoza) : "")
    : "brak danych";
  var kontakty = kl.kontakty.length ? kl.kontakty.map(function (k) {
    return esc(k.osoba || "") + (k.tel ? ", " + esc(k.tel) : "") + (k.mail ? ", " + esc(k.mail) : "");
  }).join("<br>") : "brak";
  var wiersze = [
    ["Numer klienta", "<b>" + esc(kl.nr) + "</b>"],
    ["NIP", '<span class="mono">' + esc(kl.nip) + "</span>"],
    ["Miasto", esc(kl.miasto)],
    ["Wielkość", esc(kl.wielkosc || "brak") + (kl.zatrudnienie == null ? "" : ' <span class="small muted">' + esc(kl.zatrudnienie) + " os. na ostatnim wniosku</span>")],
    ["Urząd pracy", esc(urzad.pup)],
    ["Nabór w urzędzie", nabor],
    ["Kolejny nabór", kl.zainteresowany ? "zainteresowany" : "nie"],
    ["Instytucje", instytucjeKlienta(kl.id).map(esc).join(", ") || "brak"],
    ["Kontakty", kontakty]
  ];
  el19("dane").innerHTML = wiersze.map(function (r) { return "<dt>" + r[0] + "</dt><dd>" + r[1] + "</dd>"; }).join("");
  el19("tytul").textContent = kl.nazwa;
  document.title = "Karta klienta · " + kl.nazwa;
}

function wierszWniosku19(w) {
  var brak = '<span class="muted">&mdash;</span>';
  return '<tr class="' + Statusy.klasaWiersza(w) + '" data-id="' + esc(w.id) + '">' +
    '<td class="strong mono nowrap">' + esc(w.id) + '</td>' +
    '<td class="nowrap">' + esc(w.rok || "bez roku") + '</td>' +
    '<td><div class="tnij" title="' + esc(w.isNazwa) + '">' + esc(w.isNazwa) + '</div></td>' +
    '<td><div class="tnij" title="' + esc(w.szkolenie) + '">' + esc(w.szkolenie) + '</div></td>' +
    '<td class="num">' + (w.przyznano != null ? DB.fmtPLN(w.przyznano) : brak) + '</td>' +
    '<td>' + Statusy.znacznik(w) + '</td>' +
    '<td>' + Statusy.znacznikRozliczenia(w) + '</td>' +
    '<td class="small muted nowrap">' + esc(w.etap) + '. ' + esc(Statusy.ETAPY[w.etap] || "") + '</td></tr>';
}

function renderWnioski19() {
  var lista = DB.WNIOSKI_WSZYSTKIE
    .filter(function (w) { return w.klient === STAN_19.kl.id; })
    .sort(function (a, b) { return (b.rok || "") < (a.rok || "") ? -1 : 1; });
  el19("subWnioski").textContent = lista.length + " ze wszystkich lat";
  el19("wnioski").innerHTML = lista.length ? lista.map(wierszWniosku19).join("")
    : '<tr><td colspan="8" class="muted">Klient nie ma jeszcze wniosków.</td></tr>';
}

function renderMaile19() {
  var maile = DB.MAILE.filter(function (m) { return m.klient === STAN_19.kl.id; });
  el19("maile").innerHTML = maile.length ? maile.map(function (m) {
    return '<tr><td>' + (m.kier === "in" ? '<span class="tag info">&#8600;</span>' : '<span class="tag mute">&#8599;</span>') + '</td>' +
      '<td class="strong">' + esc(m.temat) + '</td><td class="small muted">' + esc(m.skrz) + '</td>' +
      '<td class="small nowrap">' + esc(m.data) + '</td>' +
      '<td class="c">' + (m.zal ? '<span class="pill">' + esc(m.zal) + '</span>' : '<span class="muted">&mdash;</span>') + '</td></tr>';
  }).join("") : '<tr><td colspan="5" class="muted">Brak korespondencji tego klienta.</td></tr>';
}

/* Klik w wniosek: karta wniosku, a jej okruszek wraca na te karte klienta */
function klikWniosku19(e) {
  var tr = e.target.closest("tr[data-id]");
  if (tr) location.href = Nawigacja.adresKarty(tr.dataset.id, "19-klient.html" + Nawigacja.zbudujZapytanie({ id: STAN_19.kl.id }));
}

function inicjuj19() {
  var id = Nawigacja.odczytajZapytanie(location.search, ["id"]).id;
  el19("btnWstecz").addEventListener("click", function () { Nawigacja.wstecz("04-baza-klientow.html"); });
  STAN_19.kl = DB.KLIENCI.filter(function (k) { return k.id === id; })[0] || null;
  if (!STAN_19.kl) {
    el19("tytul").textContent = "Nie znaleziono klienta";
    document.querySelectorAll("#stronaKlienta .grid, #stronaKlienta > .card, #btnEdytuj").forEach(function (x) { x.remove(); });
    return;
  }
  el19("btnEdytuj").href = "04-baza-klientow.html" +
    Nawigacja.zbudujZapytanie({ q: STAN_19.kl.nazwa, wnioski: "wszystkie", edytuj: STAN_19.kl.id });
  el19("wnioski").addEventListener("click", klikWniosku19);
  window.addEventListener("db:changed", function () {
    STAN_19.kl = DB.KLIENCI.filter(function (k) { return k.id === id; })[0] || STAN_19.kl;
    renderDane19(); renderWnioski19(); renderMaile19();
  });
  renderDane19();
  renderWnioski19();
  renderMaile19();
}
