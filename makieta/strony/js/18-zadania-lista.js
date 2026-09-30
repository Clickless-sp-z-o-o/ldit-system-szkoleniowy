/* Zadania: stan strony, KPI, lista zadan i akceptacje formularzy (tylko deklaracje) */
var STAN_18 = { sesja: null, moznaEdytowac: false, widziWszystkie: false };

/* Uprawnienia po feature (D-176): edycja modulu i wglad we wszystkie zadania (admin.konta = administrator) */
function wczytajUprawnienia18() {
  STAN_18.sesja = Auth.sesja();
  STAN_18.moznaEdytowac = Auth.edytujeModul("zadania");
  STAN_18.widziWszystkie = Auth.moze("zadania.wszystkie");
}

function dzisiaj() {
  var d = new Date(), p = function (n) { return String(n).padStart(2, "0"); };
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
}

function kartaKpi18(label, val, foot) {
  return '<div class="kpi"><div class="k-label">' + esc(label) + '</div>' +
    '<div class="k-value">' + esc(val) + '</div>' +
    (foot ? '<div class="k-foot">' + foot + '</div>' : "") + '</div>';
}

function imieUzytkownika(id) {
  var u = DB.UZYTKOWNICY.filter(function (x) { return x.login === id; })[0];
  return u ? u.imie : "nieprzypisane";
}

function opisWniosku(id) {
  var w = DB.WNIOSKI_WSZYSTKIE.filter(function (x) { return x.id === id; })[0];
  return w ? w.nr + " · " + w.klNazwa : "bez wniosku";
}

/* Plan dnia: pracownik widzi swoje zadania, administrator wszystkie (D-140) */
function mojeZadania() {
  return DB.ZADANIA.filter(function (z) {
    return STAN_18.widziWszystkie || z.przypisane_do === STAN_18.sesja.uzytkownik_id;
  });
}

function oczekujaceFormularze() {
  return DB.KOLEJKA.filter(function (k) { return k.status === "oczekuje"; });
}

function renderKpi() {
  var zad = mojeZadania(), dzis = dzisiaj();
  var otwarte = zad.filter(function (z) { return z.status === "otwarte"; });
  var naDzis = otwarte.filter(function (z) { return z.termin === dzis; }).length;
  var zalegle = otwarte.filter(function (z) { return z.termin && z.termin < dzis; }).length;
  document.getElementById("kpi").innerHTML =
    kartaKpi18("Zadania na dziś", naDzis, STAN_18.widziWszystkie ? "wszyscy pracownicy" : "plan dnia zalogowanego pracownika") +
    kartaKpi18("Zaległe", zalegle, zalegle ? '<span class="tag neg dot">do nadrobienia</span>' : "brak") +
    kartaKpi18("Wnioski do akceptacji", oczekujaceFormularze().length, '<span class="tag warn dot">bramka anty-spam D-105</span>');
}

function wierszZadania(z) {
  var zrodloTag = z.typ === "automatyczne"
    ? '<span class="tag info dot">automatyczne</span>'
    : '<span class="tag mute dot">ręczne</span>';
  var zrobione = z.status === "zrobione", dzis = dzisiaj();
  var pilne = z.status === "otwarte" && z.termin && z.termin <= dzis;
  var terminTag = '<span class="tag ' + (pilne ? "neg" : "mute") + '">' + esc(z.termin || "bez terminu") + '</span>';
  return '<div class="zad-row' + (zrobione ? " done" : "") + '">' +
    '<input type="checkbox" class="chk"' + (zrobione ? " checked" : "") + (STAN_18.moznaEdytowac ? "" : " disabled") +
      ' onchange="przelaczZadanie(\'' + escJs(z.id) + '\', this.checked)">' +
    '<div style="flex:1 1 auto;min-width:0">' +
      '<div class="zt">' + esc(z.tytul) + '</div>' +
      '<div class="zm">' + esc(opisWniosku(z.wniosek_id)) + ' · ' + esc(imieUzytkownika(z.przypisane_do)) + '</div>' +
    '</div>' +
    '<div class="zmeta">' + terminTag + '<div style="margin-top:5px">' + zrodloTag + '</div></div>' +
  '</div>';
}

function renderZadania() {
  var zad = mojeZadania();
  document.getElementById("subZad").textContent =
    zad.filter(function (z) { return z.status === "otwarte"; }).length + " otwartych, " +
    zad.filter(function (z) { return z.status === "zrobione"; }).length + " zrobionych";
  document.getElementById("listaZad").innerHTML = zad.length ? zad.map(wierszZadania).join("") :
    '<div class="empty"><div class="ei">&#9745;</div><div class="et">Brak zadań</div>' +
    'Zadania ręczne dopisujesz przyciskiem „Nowe zadanie”, zadania automatyczne pojawią się po wdrożeniu reguł statusów (P-57).</div>';
}

/* Decyzje zapadaja na ekranie Do akceptacji (20-akceptacje.html): tu tylko skrot z linkiem */
function wierszAkceptacji(a) {
  return '<div class="zad-row">' +
    '<div style="flex:1 1 auto;min-width:0">' +
      '<div class="zt">' + esc(a.firma) + '</div>' +
      '<div class="zm"><span class="mono">' + esc(a.nip) + '</span> · ' + esc(a.is) + ' · formularz z ' + esc(a.data) + '</div>' +
    '</div>' +
    '<div class="zmeta"><a class="btn xs primary" href="20-akceptacje.html' + esc(Nawigacja.zbudujZapytanie({ id: a.id })) +
      '">Szczegóły i decyzja</a></div></div>';
}

function renderAkceptacje() {
  var lista = oczekujaceFormularze();
  document.getElementById("badgeAkc").textContent = lista.length + " oczekuje";
  document.getElementById("listaAkc").innerHTML = lista.length ? lista.map(wierszAkceptacji).join("") :
    '<div class="empty"><div class="et">Brak formularzy do akceptacji</div></div>';
}

function render() { renderKpi(); renderZadania(); renderAkceptacje(); }
