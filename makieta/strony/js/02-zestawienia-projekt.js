/* Ekran 02, czesc 4: usuwanie wniosku i formularz nowego projektu z wygenerowanymi uczestnikami.
   Korzysta ze STAN_02 z 02-zestawienia-dane.js. Same deklaracje. */

var IMIONA_NOWE = ["Jan Kowalski", "Anna Nowak", "Piotr Wiśniewski", "Maria Wójcik",
  "Tomasz Kaczmarek", "Ewa Mazur", "Adam Lewandowski", "Zofia Kwiatkowska"];

function usunWniosek(id) {
  var w = znajdzWniosek(id);
  if (!window.confirm("Usunąć projekt " + (w ? w.klNazwa : id) + " (" + id + ")? Usunie też jego uczestników.")) return;
  STAN_02.batch = true;
  Store.get("uczestnicy").filter(function (u) { return u.wniosek_id === id; })
    .map(function (u) { return u.id; })
    .forEach(function (uid) { Store.remove("uczestnicy", uid); });
  STAN_02.batch = false;
  Store.remove("wnioski", id);
}

function pokazProjForm() {
  var el = document.getElementById("projForm");
  var klOpts = DB.KLIENCI.map(function (k) { return '<option value="' + esc(k.id) + '">' + esc(k.nazwa) + " (" + esc(k.id) + ")</option>"; }).join("");
  var szkOpts = DB.SZKOLENIA.map(function (s) {
    var i = DB.INSTYTUCJE.filter(function (x) { return x.id === s.is; })[0];
    return '<option value="' + esc(s.id) + '">' + esc((i ? i.nazwa : "") + " - " + s.nazwa + " (" + DB.fmtPLN(s.cena) + ")") + "</option>";
  }).join("");
  var stOpts = STATUSY.map(function (o) { return "<option>" + esc(o) + "</option>"; }).join("");
  el.innerHTML =
    '<div class="small strong" style="margin-bottom:8px">Nowy projekt (wniosek)</div>' +
    '<div class="toolbar" style="flex-wrap:wrap;gap:8px;padding:0">' +
      '<select class="inp" id="pfKlient" style="min-width:240px">' + klOpts + '</select>' +
      '<select class="inp" id="pfSzk" style="min-width:260px">' + szkOpts + '</select>' +
      '<input class="inp" id="pfOsob" type="number" min="1" value="3" style="width:90px" title="Liczba uczestników">' +
      '<input class="inp" id="pfKoszt" type="number" min="0" placeholder="Koszt całk." style="width:140px" title="Koszt całkowity (ręczne)">' +
      '<input class="inp" id="pfDoplata" type="number" min="0" value="0" style="width:110px" title="Dopłata dodatkowa">' +
      '<select class="inp" id="pfStatus">' + stOpts + '</select>' +
      '<button class="btn primary sm" onclick="zapiszNowyProjekt()">Zapisz projekt</button>' +
      '<button class="btn sm" onclick="ukryjProjForm()">Anuluj</button>' +
    '</div>' +
    '<div class="small muted" style="margin-top:6px">Koszt całkowity jest ręczny (D-58). Puste pole = liczba uczestników × cena szkolenia. Przyznano policzy się z progu dofinansowania.</div>';
  el.style.display = "block";
}
function ukryjProjForm() { var el = document.getElementById("projForm"); el.style.display = "none"; el.innerHTML = ""; }

function dzisIso() {
  var d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

/* Numeracja klientow ciagla w ramach roku (D-112): liczymy tylko aktywna zakladke */
function nastepnyNumerWRoku() {
  return DB.WNIOSKI_WSZYSTKIE.filter(function (w) { return String(w.rok) === STAN_02.rokAktywny; })
    .reduce(function (m, w) { return Math.max(m, w.nr || 0); }, 0) + 1;
}

function wstawWniosek(id, numer, kl, szk, koszt, doplata, st) {
  var dzis = dzisIso();
  Store.insert("wnioski", {
    id: id, numer: numer, rok: STAN_02.rokAktywny,
    klient_id: kl.id, instytucja_id: kl.is, pup_id: kl.pup, szkolenie_glowne_id: szk.id,
    /* Recznie wpisujemy koszt Z DOPLATA, koszt calkowity jest roznica (D-134).
       Nowy projekt wchodzi do tabeli Wnioski od etapu 3 (D-146). */
    koszt_calkowity_z_doplata: koszt + doplata, kwota_doplaty_dodatkowej: doplata, etap: 3,
    status_skladania: st.status_skladania, status_decyzji: st.status_decyzji,
    status_finansowy: st.status_decyzji === "Pozytywna" ? "Oczekuje" : "Brak",
    data_wplyniecia_formularza: dzis, data_wniosku: dzis   /* data faktury dopiero po wystawieniu faktury */
  });
}

function wstawUczestnikow(id, numer, szk, osob) {
  var rr = STAN_02.rokAktywny.slice(2);
  for (var i = 0; i < osob; i++) {
    Store.insert("uczestnicy", {
      id: "UCZ-" + rr + "-" + String(numer).padStart(4, "0") + "-" + String(i + 1).padStart(2, "0"),
      wniosek_id: id, imie_nazwisko: IMIONA_NOWE[i % IMIONA_NOWE.length], pesel: "",
      szkolenie_id: szk.id, kwota: szk.cena,
      status_kwalifikacji: "zakwalifikowany", powod_niezakwalifikowania: "", termin_id: null
    });
  }
}

function zapiszNowyProjekt() {
  var kl = DB.KLIENCI.filter(function (x) { return x.id === document.getElementById("pfKlient").value; })[0];
  var szk = DB.SZKOLENIA.filter(function (x) { return x.id === document.getElementById("pfSzk").value; })[0];
  if (!kl || !szk) return;
  var osob = Math.max(1, parseInt(document.getElementById("pfOsob").value, 10) || 1);
  var kosztRaw = document.getElementById("pfKoszt").value;
  var koszt = kosztRaw === "" ? osob * szk.cena : parseInt(kosztRaw, 10) || 0;
  var doplata = parseInt(document.getElementById("pfDoplata").value, 10) || 0;
  var st = mapStatus(document.getElementById("pfStatus").value);
  var numer = nastepnyNumerWRoku();
  var id = "PR-" + STAN_02.rokAktywny.slice(2) + "-" + String(numer).padStart(4, "0");

  STAN_02.batch = true;
  wstawWniosek(id, numer, kl, szk, koszt, doplata, st);
  wstawUczestnikow(id, numer, szk, osob);
  STAN_02.batch = false;
  document.getElementById("q").value = kl.nazwa;   /* pokaz nowy projekt na liscie */
  ukryjProjForm();
  STAN_02.W = budujW(); render();
}
