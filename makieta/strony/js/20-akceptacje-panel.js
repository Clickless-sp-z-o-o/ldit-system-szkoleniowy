/* Ekran 20, czesc 2: panel szczegolow wybranego zgloszenia i decyzja (akceptacja,
   odrzucenie z powodem). Logika zapisu w assets/akceptacje.js. Same deklaracje. */

function wiersze20(pary) {
  return '<dl class="dl">' + pary.map(function (r) { return "<dt>" + r[0] + "</dt><dd>" + (r[1] || '<span class="muted">brak</span>') + "</dd>"; }).join("") + "</dl>";
}

function nazwaUrzedu20(id) {
  var p = DB.PUPY.filter(function (x) { return x.id === id; })[0];
  return p ? p.nazwa : id;
}

function decyzja20(etykietaTak, opisTak) {
  if (!Auth.moze("zmiany.zatwierdzanie")) return '<div class="note mb0">Podgląd: decyzję podejmuje pracownik LDIT albo administrator.</div>';
  return '<div class="card mb0" style="margin-top:14px"><div class="card-body">' +
    '<div class="small muted" style="margin-bottom:8px">' + opisTak + '</div>' +
    '<div class="btn-row"><button class="btn primary sm" onclick="zatwierdz20()">' + etykietaTak + '</button></div>' +
    '<label class="small" style="display:flex;flex-direction:column;gap:4px;margin-top:12px"><span class="muted">Powód odrzucenia (zobaczy instytucja)</span>' +
    '<textarea class="inp" id="powod" rows="2"></textarea></label>' +
    '<div class="btn-row" style="margin-top:8px"><button class="btn danger sm" onclick="odrzuc20()">Odrzuć</button></div>' +
    '<div class="small" id="komunikat20" role="status" style="margin-top:8px"></div></div></div>';
}

function rozpatrzenie20(r) {
  if (r.status === "oczekuje") return "";
  return '<div class="note mb0" style="margin-top:14px"><b>Rozpatrzone:</b> ' + esc(r.status) + ", " + esc(r.rozpatrzono) +
    ", " + esc(imieKonta(r.rozpatrzyl)) + (r.powod ? "<br>Powód: " + esc(r.powod) : "") +
    (r.klientId ? '<br><a class="link-rekordu" href="' + esc(Nawigacja.adresKlienta(r.klientId)) + '">Karta klienta</a>' : "") + "</div>";
}

/* NIP z formularza czesto ma literowke: zatwierdzajacy moze go poprawic przed akceptacja */
function poleNip20(f) {
  if (f.status !== "oczekuje" || !Auth.moze("zmiany.zatwierdzanie")) return '<span class="mono">' + esc(f.nip) + "</span>";
  var bledy = f.nip ? Walidacja.bledy("klienci", { nip: f.nip }) : [];
  return '<input class="inp mono" id="poprawNip" value="' + esc(f.nip) + '" style="width:160px">' +
    (bledy.length ? '<div class="small" style="color:var(--neg-ink)">' + esc(bledy[0].komunikat) + ', popraw przed akceptacją</div>' : "");
}

/* Klient innej instytucji: po polaczeniu zglaszajaca instytucja zobaczy jego dane (D-144, D-150) */
function ostrzezenieDuplikatu20(f, duplikat) {
  var link = '<a class="link-rekordu" href="' + esc(Nawigacja.adresKlienta(duplikat)) + '">karta klienta</a>';
  if (!Akceptacje.klientInnejInstytucji(duplikat, f.instytucja_id)) {
    return '<div class="note warn mb0" style="margin-top:12px">Klient o tym NIP już jest w bazie: ' + link +
      '. Akceptacja dopisze go do tej instytucji, nie utworzy drugiego rekordu (D-144).</div>';
  }
  return '<div class="note warn mb0" style="margin-top:12px">Klient o tym NIP jest już obsługiwany przez inną instytucję: ' + link +
    '. Po połączeniu instytucja ' + esc(f.is) + ' zobaczy jego dane w swojej bazie (D-144, D-150).' +
    '<label class="small" style="display:flex;gap:6px;margin-top:8px"><input type="checkbox" id="polaczWspolny"> Potwierdzam połączenie z istniejącym klientem</label></div>';
}

function panelFormularza20(f) {
  var duplikat = f.status === "oczekuje" ? Akceptacje.klientWZakresieZNip(f.nip) : null;
  el20("tytulPanelu").textContent = f.firma;
  el20("subPanelu").textContent = "formularz " + f.id;
  el20("panel").innerHTML = wiersze20([
    ["Firma", "<b>" + esc(f.firma) + "</b>"], ["NIP", poleNip20(f)],
    ["Miasto", esc(f.miasto)], ["Wielkość", esc(f.wielkosc)], ["Urząd pracy", esc(nazwaUrzedu20(f.pup))],
    ["Osoba kontaktowa", esc(f.kontakt)], ["E-mail", esc(f.email)], ["Telefon", esc(f.telefon)],
    ["Szkolenie", esc(f.szkolenie)], ["Liczba uczestników", esc(f.osob)], ["Instytucja", esc(f.is)],
    ["Wypełnił", esc(WYPELNIL_20[f.wypelnil] || f.wypelnil) + (f.zglosil ? ", " + esc(imieKonta(f.zglosil)) : "")],
    ["Data wpłynięcia", esc(f.data) + ' <span class="tag mute">auto D-94</span>'], ["Uwagi", esc(f.uwagi)]
  ]) +
  (duplikat ? ostrzezenieDuplikatu20(f, duplikat) : "") +
  (f.status === "oczekuje" ? decyzja20("Akceptuj i dodaj do bazy klientów", "Akceptacja tworzy klienta w Bazie danych (albo dopisuje istniejącego) i przypisuje go do instytucji.") : rozpatrzenie20(f));
}

function wartosc20(k, v) {
  if (v == null || v === "") return '<span class="muted">puste</span>';
  return esc(k === "pup_id" ? nazwaUrzedu20(v) : v);
}

function panelZmiany20(p) {
  el20("tytulPanelu").textContent = p.is + ": " + opisRekordu20(p);
  el20("subPanelu").textContent = "zmiana " + p.id;
  var pola = Akceptacje.POLA[p.tabela] || {};
  var tabela = '<table class="tbl"><thead><tr><th>Pole</th><th>Teraz</th><th>Po zmianie</th></tr></thead><tbody>' +
    Object.keys(p.zmiany).map(function (k) {
      return "<tr><td class='strong'>" + esc(pola[k] || k) + "</td><td class='zmiana-przed'>" + wartosc20(k, p.zmiany[k].przed) +
        "</td><td><span class='zmiana-po'>" + wartosc20(k, p.zmiany[k].po) + "</span></td></tr>";
    }).join("") + "</tbody></table>";
  var link = p.tabela === "klienci" ? '<a class="link-rekordu" href="' + esc(Nawigacja.adresKlienta(p.rekord)) + '">karta klienta</a>'
    : '<a class="link-rekordu" href="06-instytucje.html' + esc(Nawigacja.zbudujZapytanie({ id: p.rekord })) + '">karta instytucji</a>';
  el20("panel").innerHTML = wiersze20([
    ["Instytucja", esc(p.is)], ["Dotyczy", esc(opisRekordu20(p)) + " · " + link],
    ["Zgłosił", esc(imieKonta(p.zglosil)) + ", " + esc(p.zgloszono)], ["Uzasadnienie", esc(p.uzasadnienie)]
  ]) + tabela +
  (p.status === "oczekuje" ? decyzja20("Zatwierdź i wprowadź zmianę", "Zatwierdzenie wprowadza nowe wartości do danych i zapisuje je w rejestrze aktywności.") : rozpatrzenie20(p));
}

function renderPanel20() {
  var zrodlo = STAN_20.widok === "formularze" ? DB.KOLEJKA : DB.PROPOZYCJE;
  var r = zrodlo.filter(function (x) { return x.id === STAN_20.wybrany; })[0];
  if (!r) {
    el20("tytulPanelu").textContent = "Szczegóły";
    el20("subPanelu").textContent = "";
    el20("panel").innerHTML = '<div class="empty"><div class="ei">&#10003;</div><div class="et">Wybierz zgłoszenie z listy</div>Kliknij wiersz, żeby zobaczyć szczegóły i podjąć decyzję.</div>';
    return;
  }
  if (STAN_20.widok === "formularze") panelFormularza20(r); else panelZmiany20(r);
}

/* Blad decyzji (brak powodu, odmowa straznika, np. bledny NIP) pokazujemy przy przyciskach;
   inne bledy leca dalej */
function wykonaj20(akcja) {
  try { akcja(); }
  catch (e) {
    if (!(e instanceof Akceptacje.AkceptacjeError) && e.name !== "StraznikError") throw e;
    el20("komunikat20").textContent = e.message;
    el20("komunikat20").style.color = "var(--neg-ink)";
  }
}

function zatwierdz20() {
  wykonaj20(function () {
    if (STAN_20.widok === "formularze") {
      var nip = document.getElementById("poprawNip");
      var polacz = document.getElementById("polaczWspolny");
      Akceptacje.zaakceptujFormularz(STAN_20.wybrany, Akceptacje.ktoTeraz(), nip ? { nip: nip.value.trim() } : null,
                                     { polaczZInnaInstytucja: !!(polacz && polacz.checked) });
    }
    else Akceptacje.zatwierdzZmiane(STAN_20.wybrany, Akceptacje.ktoTeraz());
  });
}

function odrzuc20() {
  var powod = el20("powod").value;
  wykonaj20(function () {
    if (STAN_20.widok === "formularze") Akceptacje.odrzucFormularz(STAN_20.wybrany, powod, Akceptacje.ktoTeraz());
    else Akceptacje.odrzucZmiane(STAN_20.wybrany, powod, Akceptacje.ktoTeraz());
  });
}
