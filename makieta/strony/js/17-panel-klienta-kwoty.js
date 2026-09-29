/* Panel klienta: kwoty i uczestnicy (tylko deklaracje) */

function boxKwoty17(label, val, foot, mocny) {
  return '<div class="kpi" style="box-shadow:none;margin-bottom:10px' + (mocny ? ';border-color:#fcd34d' : '') + '">' +
    '<div class="k-label">' + esc(label) + '</div>' +
    '<div class="k-value">' + esc(val) + '</div>' +
    (foot ? '<div class="k-foot">' + esc(foot) + '</div>' : '') + '</div>';
}

/* Kwoty, prosto i bez zargonu. Liczby z widoku SQL, nie z JavaScriptu */
function renderKwoty17() {
  var w = STAN_17.w, szk = STAN_17.szk;
  var koszt = w.kosztCalkowity != null ? w.kosztCalkowity : w.calkowita;
  var doplata = w.doplata || 0;
  var poDecyzji = w.przyznano != null && w.wklad != null;
  document.getElementById("kwoty").innerHTML =
    boxKwoty17("Całkowita wartość szkolenia", DB.fmtPLN(koszt), w.osobZakw + " osób, " + DB.fmtPLN(szk ? szk.cena : 0) + " za osobę") +
    boxKwoty17("Przyznane dofinansowanie", poDecyzji ? DB.fmtPLN(w.przyznano) : "po decyzji urzędu",
        poDecyzji ? "urząd pokrywa " + DB.fmtPct(w.procent) + " kosztu" : "kwota pojawi się po decyzji pozytywnej") +
    boxKwoty17("Wkład własny do zapłaty", poDecyzji ? DB.fmtPLN(w.wklad + doplata) : "po decyzji urzędu",
        doplata ? "w tym dopłata dodatkowa " + DB.fmtPLN(doplata) : "płatne po szkoleniu, na podstawie faktury", true) +
    '<div class="small muted">Kwoty pochodzą z decyzji urzędu. Jeżeli urząd uzna niższy koszt niż wnioskowany, ' +
    'różnica powiększa wkład własny, a my informujemy o tym przed szkoleniem.</div>';
}

function renderUczestnicy17() {
  var w = STAN_17.w;
  document.getElementById("subUcz").textContent = STAN_17.zakw + " zakwalifikowanych z " + w.uczestnicy.length + " zgłoszonych";
  document.getElementById("uczestnicy").innerHTML = w.uczestnicy.map(function (u) {
    var ok = u.status === "zakwalifikowany";
    return '<tr' + (ok ? '' : ' class="row-danger"') + '>' +
      '<td class="strong">' + esc(u.imie) + '</td>' +
      '<td>' + esc(u.szkNazwa) + '</td>' +
      '<td>' + (ok ? '<span class="tag pos dot">zakwalifikowany</span>' : '<span class="tag neg dot">niezakwalifikowany</span>') + '</td>' +
      '<td class="small muted">' + esc(ok ? "objęty dofinansowaniem" : u.powod) + '</td></tr>';
  }).join("");
}
