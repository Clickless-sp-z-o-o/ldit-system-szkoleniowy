/* Ekran 02, czesc 2: filtry, tabela wnioskow, zaznaczanie, operacje masowe i inicjalizacja.
   Korzysta ze STAN_02 z 02-zestawienia-dane.js. Same deklaracje. */

var LIMIT_WIERSZY_02 = 140;

function podpiszWymuszonaInstytucje() {
  var inst = STAN_02.forcedInst;
  document.querySelector(".page-title").textContent = "Zestawienie " + STAN_02.rokAktywny + " · " + inst.nazwa;
  var pd = document.querySelector(".page-desc");
  if (pd) pd.innerHTML = "Widok ograniczony do jednej instytucji. Wyszukiwarka, filtry i eksport zwracają " +
    "wyłącznie wiersze tej instytucji. Filtr jest zakładany w warstwie danych makiety, nie tylko w tabeli " +
    "<span class=\"ref\">D-35</span>.";
  var notaZbiorcza = document.querySelector(".note.open");
  if (notaZbiorcza) notaZbiorcza.style.display = "none";
}

function wypelnijFiltry02() {
  var selIS = document.getElementById("fIS");
  DB.INSTYTUCJE.forEach(function (i) {
    selIS.innerHTML += '<option value="' + esc(i.id) + '">' + esc(i.nazwa) + '</option>';
  });
  /* Instytucja wybrana w menu (?is=): lista rozwijana bylaby duplikatem, wiec jest ukryta */
  if (STAN_02.forcedInst) { selIS.value = STAN_02.forcedInst.id; selIS.style.display = "none"; }
  var selPUP = document.getElementById("fPUP");
  DB.PUPY.forEach(function (p) {
    selPUP.innerHTML += '<option value="' + esc(p.id) + '">' + esc(p.nazwa) + '</option>';
  });
  var selStatus = document.getElementById("fStatus");
  STATUSY.forEach(function (s) {
    selStatus.innerHTML += '<option>' + esc(s) + '</option>';
  });
}

function filtrujWnioski() {
  var q = document.getElementById("q").value.toLowerCase().trim();
  var fis = document.getElementById("fIS").value, fpup = document.getElementById("fPUP").value;
  var fst = document.getElementById("fStatus").value;
  return STAN_02.W.filter(function (w) {
    if (fis && w.is !== fis) return false;
    if (fpup && w.pup !== fpup) return false;
    if (fst && statusValue(w) !== fst) return false;
    if (!q) return true;
    var h = [w.klNazwa, w.nip, w.pupNazwa, w.szkolenie, w.isNazwa].join(" ").toLowerCase();
    return h.indexOf(q) >= 0;
  });
}

function wierszWniosku(w) {
  var brak = '<span class="muted">&mdash;</span>';
  return '<tr class="' + klasaWiersza(w) + '" data-id="' + esc(w.id) + '">' +
    '<td><input type="checkbox" class="ck"></td>' +
    '<td class="strong">' + esc(w.nr) + '</td>' +
    '<td class="strong nowrap">' + esc(w.klNazwa) + '<div class="small muted">' + esc(w.id) + '</div></td>' +
    '<td class="mono muted">' + esc(w.nip) + '</td>' +
    '<td class="nowrap">' + esc(w.isNazwa) + '</td>' +
    '<td class="nowrap">' + esc(w.szkolenie) + '</td>' +
    '<td class="nowrap muted">' + esc(w.pupNazwa) + '</td>' +
    '<td class="c">' + w.osobZakw + (w.osob !== w.osobZakw ? '<span class="muted">/' + w.osob + '</span>' : "") + '</td>' +
    '<td class="num">' + DB.fmtPLN(w.wartosc) + '</td>' +
    '<td class="num strong">' + (w.przyznano != null ? DB.fmtPLN(w.przyznano) : brak) + '</td>' +
    '<td class="num">' + (w.kosztCalkowity != null ? DB.fmtPLN(w.kosztCalkowity) : brak) + '</td>' +
    '<td>' + selectStatus(w) + '</td>' +
    '<td>' + tagRozl(w) + '</td>' +
    '<td class="right"><div class="btn-row" style="justify-content:flex-end">' +
      '<button class="btn xs" onclick="otworz(\'' + escJs(w.id) + '\')">Otwórz</button>' +
      '<button class="btn xs" onclick="usunWniosek(\'' + escJs(w.id) + '\')">Usuń</button>' +
    '</div></td>' +
    '</tr>';
}

function render() {
  var lista = filtrujWnioski();
  document.getElementById("licz").innerHTML =
    "<b>" + lista.length + "</b> z " + STAN_02.W.length + " projektów &middot; wartość " +
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
  Object.keys(pola).forEach(function (p) { w[p] = document.getElementById(pola[p]).value; });
  return w;
}

/* Licznik "Wnioski (n)" = wiersze widoczne teraz. Zakladka Baza danych dostaje
   te same filtry instytucji i urzedu. */
function odswiezZakladki02(widocznych) {
  document.getElementById("licznikWnioskow").textContent = widocznych;
  document.getElementById("zakladkaBaza").href = "04-baza-klientow.html" + Nawigacja.zbudujZapytanie({
    inst: document.getElementById("fIS").value, pup: document.getElementById("fPUP").value
  });
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
  var patch = mapStatus(status);
  STAN_02.batch = true;
  ids.forEach(function (id) {
    var w = znajdzWniosek(id);
    Store.update("wnioski", id, patch);
    logZmiana(id, "Status decyzji", w ? statusValue(w) : "", status);
  });
  STAN_02.batch = false;
  STAN_02.W = budujW(); render();
}

function otworz(id) {
  var powrot = "02-zestawienia.html" + Nawigacja.zbudujZapytanie(Object.assign(wartosciFiltrow02(), { wn: id }));
  location.href = Nawigacja.adresKarty(id, powrot);
}

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
  /* Odswiezanie po zmianie danych (poza operacjami masowymi) */
  window.addEventListener("db:changed", function () {
    if (STAN_02.batch) return;
    STAN_02.W = budujW(); rysujLata(); render();
  });
  var wn = Nawigacja.odczytajZapytanie(location.search, ["wn"]).wn;
  Nawigacja.wczytajFiltry(filtryZAdresu02());

  odswiezRok();
  if (wn) pokazWierszPowrotu(wn);
}
