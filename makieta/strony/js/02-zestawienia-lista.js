/* Ekran 02, czesc 2: filtry, tabela wnioskow, zaznaczanie, operacje masowe i inicjalizacja.
   Korzysta ze STAN_02 z 02-zestawienia-dane.js. Same deklaracje. */

var LIMIT_WIERSZY_02 = 140;

/* Widok jednej instytucji z menu: kolumna Instytucja bylaby taka sama w kazdym wierszu */
function podpiszWymuszonaInstytucje() {
  document.querySelectorAll("th.kol-is").forEach(function (th) { th.style.display = "none"; });
}

function wypelnijFiltry02() {
  var selIS = document.getElementById("fIS");
  DB.INSTYTUCJE.forEach(function (i) {
    selIS.innerHTML += '<option value="' + esc(i.id) + '">' + esc(i.nazwa) + '</option>';
  });
  /* Instytucja wybrana w menu (?is=): lista rozwijana bylaby duplikatem, wiec jest ukryta */
  if (STAN_02.forcedInst) { Wielowybor.ustaw(selIS, [STAN_02.forcedInst.id]); Wielowybor.ukryj(selIS); }
  var selPUP = document.getElementById("fPUP");
  DB.PUPY.forEach(function (p) {
    selPUP.innerHTML += '<option value="' + esc(p.id) + '">' + esc(p.nazwa) + '</option>';
  });
  var selStatus = document.getElementById("fStatus");
  Statusy.LISTA.forEach(function (s) {
    selStatus.innerHTML += '<option>' + esc(s) + '</option>';
  });
}

/* Wybrane wartosci filtra wielokrotnego wyboru (assets/wielowybor.js) */
function wybrane02(id) { return Wielowybor.wartosci(document.getElementById(id)); }

function filtrujWnioski() {
  var q = document.getElementById("q").value.toLowerCase().trim();
  var fis = wybrane02("fIS"), fpup = wybrane02("fPUP"), fst = wybrane02("fStatus");
  return STAN_02.W.filter(function (w) {
    if (!Wielowybor.pasuje(fis, w.is)) return false;
    if (!Wielowybor.pasuje(fpup, w.pup)) return false;
    if (!Wielowybor.pasuje(fst, Statusy.wartosc(w))) return false;
    if (!pasujeDoWykresu(w)) return false;
    if (!q) return true;
    var h = [w.klNazwa, w.nip, w.pupNazwa, w.szkolenie, w.isNazwa].join(" ").toLowerCase();
    return h.indexOf(q) >= 0;
  });
}

/* Klik w wiersz otwiera karte wniosku, klik w nazwe klienta jego karte. Pola edycji
   w wierszu (status, zaznaczenie, usuniecie) nie otwieraja karty. */
function wierszWniosku(w) {
  var brak = '<span class="muted">&mdash;</span>';
  var ukryjIS = STAN_02.forcedInst ? ' style="display:none"' : "";
  return '<tr class="' + Statusy.klasaWiersza(w) + '" data-id="' + esc(w.id) + '">' +
    '<td><input type="checkbox" class="ck"></td>' +
    '<td class="strong">' + esc(w.nr) + '</td>' +
    '<td class="strong"><div class="tnij" title="' + esc(w.klNazwa) + '"><a class="link-rekordu" href="' +
      esc(Nawigacja.adresKlienta(w.klient)) + '">' + esc(w.klNazwa) + '</a></div>' +
      '<span class="pod mono">' + esc(w.nip) + '</span></td>' +
    '<td class="kol-is"' + ukryjIS + '><div class="tnij" title="' + esc(w.isNazwa) + '">' + esc(w.isNazwa) + '</div></td>' +
    '<td><div class="tnij w" title="' + esc(w.szkolenie) + '">' + esc(w.szkolenie) + '</div></td>' +
    '<td class="nowrap muted">' + esc(skrocUrzad(w.pupNazwa)) + '</td>' +
    '<td class="c">' + w.osobZakw + (w.osob !== w.osobZakw ? '<span class="muted">/' + w.osob + '</span>' : "") + '</td>' +
    '<td class="num strong">' + (w.przyznano != null ? DB.fmtPLN(w.przyznano) : brak) + '</td>' +
    '<td class="num">' + (w.kosztCalkowity != null ? DB.fmtPLN(w.kosztCalkowity) : brak) + '</td>' +
    '<td>' + selectStatus(w) + '</td>' +
    '<td>' + Statusy.znacznikRozliczenia(w) + '</td>' +
    '<td class="right"><a class="btn xs" title="Szczegóły i edycja wniosku" href="' + esc(adresKarty02(w.id)) + '">&#9998; Szczegóły</a></td>' +
    '</tr>';
}

/* "PUP Poznań" -> "Poznań": w kolumnie Urzad prefiks jest zawsze ten sam */
function skrocUrzad(nazwa) { return String(nazwa || "").replace(/^PUP\s+/, ""); }

function render() {
  var lista = filtrujWnioski();
  document.getElementById("licz").innerHTML =
    "<b>" + lista.length + "</b> z " + STAN_02.W.length + " &middot; wartość " +
    DB.fmtPLN(lista.reduce(function (s, w) { return s + w.wartosc; }, 0));

  document.getElementById("body").innerHTML = lista.slice(0, LIMIT_WIERSZY_02).map(wierszWniosku).join("");
  if (lista.length > LIMIT_WIERSZY_02) {
    document.getElementById("body").innerHTML +=
      '<tr><td colspan="14" class="c muted small" style="padding:14px">' +
      'Pokazano ' + LIMIT_WIERSZY_02 + ' z ' + lista.length + ' wierszy. W systemie docelowym: wirtualizacja listy lub stronicowanie.</td></tr>';
  }
  document.querySelectorAll(".ck").forEach(function (c) {
    c.addEventListener("change", licz);
  });
  licz();
  odswiezZakladki02(lista.length);
  Nawigacja.zapiszWAdresie(wartosciFiltrow02());
}

/* Rok i filtry w adresie: link z Bazy danych i z wyszukiwarki otwiera liste przefiltrowana,
   a powrot z karty wniosku odtwarza rok, filtry i wiersz. Instytucja z menu (?is=)
   jest wymuszona, wiec nie ma osobnego filtra inst. */
var FILTRY_02 = { q: "q", inst: "fIS", pup: "fPUP", status: "fStatus" };

function filtryZAdresu02() {
  var pola = Object.assign({}, FILTRY_02);
  if (STAN_02.forcedInst) delete pola.inst;
  return pola;
}

function wartosciFiltrow02() {
  var w = { is: STAN_02.forcedInst ? STAN_02.forcedInst.nazwa : "", rok: STAN_02.rokAktywny };
  var pola = filtryZAdresu02();
  Object.keys(pola).forEach(function (p) { w[p] = Wielowybor.tekst(document.getElementById(pola[p])); });
  return Object.assign(w, STAN_02.wykres);
}

/* Licznik "Wnioski (n)" = wiersze widoczne teraz. Zakladka Baza danych dostaje te same
   filtry instytucji i urzedu, a jej licznik to klienci, ktorych Baza pokaze domyslnie:
   przed zlozeniem wniosku (Statusy.klientPrzedZlozeniem). */
function odswiezZakladki02(widocznych) {
  var fis = wybrane02("fIS"), fpup = wybrane02("fPUP");
  document.getElementById("licznikWnioskow").textContent = widocznych;
  document.getElementById("zakladkaBaza").href = "04-baza-klientow.html" +
    Nawigacja.zbudujZapytanie({ inst: Wielowybor.naTekst(fis), pup: Wielowybor.naTekst(fpup) });
  var poKliencie = Statusy.wnioskiPoKlientach(DB.WNIOSKI_WSZYSTKIE);
  document.getElementById("licznikBazy").textContent = DB.KLIENCI.filter(function (k) {
    return Wielowybor.pasuje(fis, k.is) && Wielowybor.pasuje(fpup, k.pup) && Statusy.klientPrzedZlozeniem(poKliencie[k.id] || []);
  }).length;
}

/* Po powrocie z karty wiersz wniosku jest wyrozniony i widoczny na ekranie */
function pokazWierszPowrotu(idWniosku) {
  var wiersz = Array.prototype.filter.call(document.querySelectorAll("#body tr[data-id]"), function (tr) {
    return tr.dataset.id === idWniosku;
  })[0];
  if (!wiersz) return;   /* wiersz poza limitem LIMIT_WIERSZY_02 albo poza filtrem */
  wiersz.classList.add("wiersz-powrotu");
  wiersz.scrollIntoView({ block: "center" });
}

function licz() {
  var n = document.querySelectorAll(".ck:checked").length;
  document.getElementById("zazn").textContent = n;
  document.querySelectorAll(".ck").forEach(function (c) {
    c.closest("tr").classList.toggle("sel", c.checked);
  });
}

function masowo(status) {
  var ids = [];
  document.querySelectorAll(".ck:checked").forEach(function (c) {
    var tr = c.closest("tr");
    if (tr && tr.dataset.id) ids.push(tr.dataset.id);
  });
  if (!ids.length) { alert("Zaznacz wiersze, którym chcesz nadać status."); return; }
  STAN_02.batch = true;
  /* Odmowa straznika w polowie listy nie moze zostawic ekranu w trybie operacji masowej */
  try {
    ids.forEach(function (id) {
      var w = znajdzWniosek(id);
      Statusy.zmien(w, Statusy.akcjaDlaStatusu(status), ktoZmienia());
      logZmiana(id, "Status decyzji", Statusy.wartosc(w), status);
    });
  } finally {
    STAN_02.batch = false;
    STAN_02.W = budujW(); render();
  }
}

function klikWiersza(e) {
  if (e.target.closest("input, select, button, a")) return;
  var tr = e.target.closest("tr[data-id]");
  if (tr) otworz(tr.dataset.id);
}

function adresKarty02(id) {
  var powrot = "02-zestawienia.html" + Nawigacja.zbudujZapytanie(Object.assign(wartosciFiltrow02(), { wn: id }));
  return Nawigacja.adresKarty(id, powrot);
}

function otworz(id) { location.href = adresKarty02(id); }

function inicjuj02() {
  STAN_02.forcedInst = znajdzWymuszonaInstytucje();
  STAN_02.rokAktywny = wybierzRokDomyslny();
  STAN_02.W = budujW();
  if (STAN_02.forcedInst) podpiszWymuszonaInstytucje();
  wypelnijFiltry02();

  document.getElementById("all").addEventListener("change", function () {
    var v = this.checked;
    document.querySelectorAll(".ck").forEach(function (c) { c.checked = v; });
    licz();
  });
  ["q", "fIS", "fPUP", "fStatus"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", render);
    document.getElementById(id).addEventListener("change", render);
  });
  document.getElementById("btnNowyProjekt").addEventListener("click", pokazProjForm);
  document.getElementById("body").addEventListener("click", klikWiersza);
  /* Odswiezanie po zmianie danych (poza operacjami masowymi) */
  window.addEventListener("db:changed", function () {
    if (STAN_02.batch) return;
    STAN_02.W = budujW(); render();
  });
  /* Parametry jednorazowe czytamy, zanim render() zapisze filtry w adresie i je usunie */
  var jednorazowe = Nawigacja.odczytajZapytanie(location.search, ["wn", "dodajRok"]);
  Nawigacja.wczytajFiltry(filtryZAdresu02());
  wczytajFiltryWykresu();
  rysujChipyWykresu();

  odswiezRok();
  if (jednorazowe.wn) pokazWierszPowrotu(jednorazowe.wn);
  if (jednorazowe.dodajRok && Auth.moze("zestawienia.dodawanie_lat")) pokazDodajRok();
}
