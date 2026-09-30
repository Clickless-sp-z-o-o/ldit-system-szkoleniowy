/* Nabory: rejestr wszystkich urzedow pracy (tabela urzedy_pracy). Lista naborow pokazuje
   tylko urzedy z naborem albo prognoza, tu widac kazdy urzad z bazy, jego stan naboru
   i liczbe klientow, z przejsciem do tych klientow w Bazie danych. Tylko deklaracje. */

function stanNaboruUrzedu(nazwa) {
  var n = STAN_05.N.filter(function (x) { return x.pup === nazwa; })[0];
  return n ? n.status : "Brak danych";
}

function wypelnijWojewodztwa05() {
  var sel = el05("fWoj");
  var woj = {};
  DB.PUPY.forEach(function (p) { woj[p.woj] = true; });
  sel.innerHTML = Object.keys(woj).sort().map(function (w) { return '<option value="' + esc(w) + '">' + esc(w) + '</option>'; }).join("");
}

function renderUrzedy05() {
  var q = el05("qUrzad").value.toLowerCase().trim();
  var woj = Wielowybor.wartosci(el05("fWoj"));
  var lista = DB.PUPY.filter(function (p) {
    if (!Wielowybor.pasuje(woj, p.woj)) return false;
    return !q || (p.nazwa + " " + p.powiat + " " + p.woj).toLowerCase().indexOf(q) >= 0;
  });
  var mozeBaze = Auth.widziModul("dofin");
  el05("liczUrzedy").innerHTML = "<b>" + lista.length + "</b> z " + DB.PUPY.length + " urzędów";
  el05("urzedy").innerHTML = lista.map(function (p) {
    var n = STAN_05.klienciPoPup[p.id] || 0;
    var link = mozeBaze && n ? ' data-href="' + esc("04-baza-klientow.html" + Nawigacja.zbudujZapytanie({ pup: p.id, wnioski: "wszystkie" })) + '"' : "";
    return '<tr' + link + '><td class="strong">' + esc(p.nazwa) + '</td><td class="muted">' + esc(p.powiat) + '</td>' +
      '<td class="muted">' + esc(p.woj) + '</td><td>' + tagStat({ status: stanNaboruUrzedu(p.nazwa) }) + '</td>' +
      '<td class="num strong">' + n + '</td></tr>';
  }).join("") || '<tr><td colspan="5" class="small muted">Brak urzędów dla tych filtrów.</td></tr>';
}

function podepnijUrzedy05() {
  wypelnijWojewodztwa05();
  ["qUrzad", "fWoj"].forEach(function (id) {
    el05(id).addEventListener("input", renderUrzedy05);
    el05(id).addEventListener("change", renderUrzedy05);
  });
  Nawigacja.podlaczLinki(el05("urzedy"));
  renderUrzedy05();
}
