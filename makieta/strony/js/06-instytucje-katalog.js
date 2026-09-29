/* Ekran Instytucje: katalog szkolen, podglad i edycja planow.
   Tylko deklaracje, bez kodu wykonywanego od razu. */
/* ---------- Szczegol: katalog szkolen ---------- */
function tagTryb(t) {
  return "<span class='tag " + (t === "Online" ? "info" : t === "Stacjonarne" ? "mute" : "warn") + "'>" + esc(t) + "</span>";
}
function przyciskiPlanu(s) {
  if (!moznaEdytowac()) return "";
  return '<div class="btn-row" style="justify-content:flex-end">' +
    '<button class="btn xs" onclick="edytujPlan(\'' + escJs(s.id) + '\')">Edytuj</button>' +
    '<button class="btn xs" onclick="usunPlan(\'' + escJs(s.id) + '\')">Usuń</button></div>';
}
function wierszPlanu(s, realizacje, plan) {
  return "<tr>" +
    '<td class="strong">' + esc(s.nazwa) + '<div class="small muted mono">' + esc(s.id) + "</div>" +
      (plan ? '<div class="small muted" style="font-weight:400;white-space:pre-line">' + esc(plan) + "</div>" : "") + "</td>" +
    '<td class="num">' + esc(s.godz) + "</td>" +
    '<td class="num">' + esc(s.dni) + "</td>" +
    "<td>" + tagTryb(s.tryb) + "</td>" +
    '<td class="num strong">' + DB.fmtPLN(s.cena) + "</td>" +
    '<td class="num">' + realizacje + "</td>" +
    '<td class="right">' + przyciskiPlanu(s) + "</td></tr>";
}
function renderKatalog(i) {
  var szk = szkoleniaIS(i.id), wnioski = wnioski2026(), plany = {};
  Store.query("SELECT id, plan_szkolenia FROM katalog_szkolen WHERE instytucja_id = ?", [i.id])
    .forEach(function (r) { plany[r.id] = r.plan_szkolenia; });
  el("katSub").textContent = szk.length + " pozycji w katalogu instytucji " + i.nazwa + ".";
  el("notkaKatalogIS").style.display = jestInstytucja() ? "" : "none";
  pokazTylkoGdyEdycja("btnDodajPlan");
  el("katalog").innerHTML = szk.length ? szk.map(function (s) {
    if (s.id === STAN_06.edytowanyPlan) return wierszPlanEdycji(s, plany[s.id]);
    var real = wnioski.filter(function (w) { return w.szkId === s.id; }).length;
    return wierszPlanu(s, real, plany[s.id]);
  }).join("") : '<tr><td colspan="7"><div class="empty"><div class="ei">&#9723;</div>' +
    '<div class="et">Katalog pusty</div>Instytucja nie wprowadziła jeszcze planów szkoleń.</div></td></tr>';
}

function liczba(id) { return parseInt(el(id).value, 10) || 0; }
function opcjeTryb(sel) {
  return ["Online", "Stacjonarne", "Mieszane"].map(function (t) {
    return "<option" + (sel === t ? " selected" : "") + ">" + t + "</option>";
  }).join("");
}

/* ---- Katalog szkolen ---- */
function wierszPlanEdycji(s, plan) {
  return '<tr class="row-nabor">' +
    '<td><input class="inp" id="epNazwa" value="' + esc(s.nazwa) + '" style="min-width:200px">' +
      '<textarea class="inp" id="epPlan" rows="3" placeholder="Plan szkolenia" style="margin-top:6px;width:100%">' + esc(plan) + "</textarea></td>" +
    '<td class="num"><input class="inp" id="epGodz" type="number" min="1" value="' + esc(s.godz) + '" style="width:72px"></td>' +
    '<td class="num"><input class="inp" id="epDni" type="number" min="1" value="' + esc(s.dni) + '" style="width:62px"></td>' +
    '<td><select class="inp" id="epTryb">' + opcjeTryb(s.tryb) + '</select></td>' +
    '<td class="num"><input class="inp" id="epCena" type="number" min="0" value="' + esc(s.cena) + '" style="width:100px"></td>' +
    '<td class="num muted">&mdash;</td>' +
    '<td class="right"><div class="btn-row" style="justify-content:flex-end">' +
      '<button class="btn xs primary" onclick="zapiszPlan(\'' + escJs(s.id) + '\')">Zapisz</button>' +
      '<button class="btn xs" onclick="anulujPlan()">Anuluj</button>' +
    '</div></td></tr>';
}
function pokazPlanForm() {
  var f = el("planForm");
  f.innerHTML =
    '<div class="small strong" style="margin-bottom:8px">Nowy plan szkolenia dla: ' + esc((aktualnaIS() || {}).nazwa) + '</div>' +
    '<div class="toolbar" style="flex-wrap:wrap;gap:8px;padding:0">' +
      '<input class="inp" id="npNazwa" placeholder="Nazwa szkolenia" style="min-width:240px">' +
      '<input class="inp" id="npGodz" type="number" min="1" placeholder="Godziny" style="width:92px" title="Godziny">' +
      '<input class="inp" id="npDni" type="number" min="1" placeholder="Dni" style="width:72px" title="Dni">' +
      '<select class="inp" id="npTryb">' + opcjeTryb("Online") + '</select>' +
      '<input class="inp" id="npCena" type="number" min="0" placeholder="Cena" style="width:110px" title="Cena">' +
      '<textarea class="inp" id="npPlan" rows="2" placeholder="Plan szkolenia" style="min-width:240px"></textarea>' +
      '<button class="btn primary sm" onclick="zapiszNowyPlan()">Zapisz plan</button>' +
      '<button class="btn sm" onclick="ukryjPlanForm()">Anuluj</button>' +
    '</div>';
  f.style.display = "block";
}
function ukryjPlanForm() { var f = el("planForm"); f.style.display = "none"; f.innerHTML = ""; }
function zapiszNowyPlan() {
  var nazwa = el("npNazwa").value.trim();
  if (!nazwa) { el("npNazwa").focus(); return; }
  Store.insert("katalog_szkolen", {
    instytucja_id: STAN_06.wybrana, nazwa: nazwa,
    liczba_godzin: liczba("npGodz"), liczba_dni: liczba("npDni"),
    tryb: el("npTryb").value, cena: liczba("npCena"), plan_szkolenia: el("npPlan").value.trim() || null
  }, "SZ-");
  ukryjPlanForm();
}
function edytujPlan(id) { STAN_06.edytowanyPlan = id; renderSzczegol(); }
function anulujPlan() { STAN_06.edytowanyPlan = null; renderSzczegol(); }
function zapiszPlan(id) {
  var patch = {
    nazwa: el("epNazwa").value.trim() || "(bez nazwy)",
    liczba_godzin: liczba("epGodz"), liczba_dni: liczba("epDni"),
    tryb: el("epTryb").value, cena: liczba("epCena"),
    plan_szkolenia: el("epPlan").value.trim() || null
  };
  STAN_06.edytowanyPlan = null;               /* wyczysc przed zapisem, by db:changed odrysowal wiersz normalny */
  Store.update("katalog_szkolen", id, patch);
}
function liczbaUzyc(id) {
  return Store.one("SELECT COUNT(*) AS n FROM uczestnicy WHERE szkolenie_id = ?", [id]).n +
    Store.one("SELECT COUNT(*) AS n FROM terminy WHERE szkolenie_id = ?", [id]).n +
    Store.one("SELECT COUNT(*) AS n FROM wnioski WHERE szkolenie_glowne_id = ?", [id]).n;
}
function usunPlan(id) {
  var uzycia = liczbaUzyc(id);
  if (uzycia > 0) {
    window.alert("Nie można usunąć planu " + id + ": jest użyty we wnioskach, terminach lub u uczestników (" + uzycia + " powiązań).");
    return;
  }
  if (window.confirm("Usunąć plan szkolenia " + id + " z katalogu?")) Store.remove("katalog_szkolen", id);
}
