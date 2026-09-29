/* Panel klienta: dokumenty do pobrania i nabory dla urzedu klienta (tylko deklaracje) */

function renderDokumenty17() {
  var w = STAN_17.w;
  var dok = [
    ["Formularz zgłoszeniowy", "zgłoszenie", w.dataFormularza, "184 KB"],
    ["Umowa z instytucją szkoleniową", "umowa", w.dataWniosku, "412 KB"],
    ["Wniosek złożony w urzędzie", "wniosek", w.dataWniosku, "1,2 MB"],
    ["Decyzja urzędu pracy", "decyzja", w.dataFaktury, "296 KB"],
    ["Instrukcja rozliczenia", "instrukcja", w.dataFaktury, "148 KB"]
  ];
  if (STAN_17.odbyte) dok.push(["Certyfikaty uczestników (ZIP)", "certyfikaty", w.dataFaktury, DB.fmtNum(STAN_17.zakw * 220) + " KB"]);
  STAN_17.dok = dok;
  document.getElementById("dokumenty").innerHTML = dok.map(function (d, i) {
    return '<tr><td class="strong">' + esc(d[0]) + '</td>' +
      '<td><span class="pill">' + esc(d[1]) + '</span></td>' +
      '<td class="small nowrap">' + esc(d[2]) + '</td>' +
      '<td class="c small muted">' + esc(d[3]) + '</td>' +
      '<td class="right"><button class="btn xs" data-d="' + i + '">Pobierz</button></td></tr>';
  }).join("");
  Array.prototype.forEach.call(document.querySelectorAll("button[data-d]"), function (b) {
    b.addEventListener("click", function () {
      alert("Pobiera plik: " + STAN_17.dok[parseInt(b.getAttribute("data-d"), 10)][0] + ".\nDostępne wyłącznie dokumenty tej sprawy.");
    });
  });
}

function wierszNaboru17(n, obcy) {
  var tag = n.status === "Nabór ogłoszony" ? '<span class="tag pos dot">nabór trwa</span>'
          : n.status === "W trakcie kontaktu" ? '<span class="tag info dot">spodziewany</span>'
          : n.status === "Po naborze" ? '<span class="tag mute dot">po naborze</span>'
          : '<span class="tag warn dot">brak naboru</span>';
  var term = n.od ? esc(n.od + " do " + n.do) : (n.prognoza ? esc("prognoza: " + n.prognoza) : "&mdash;");
  return '<tr' + (n.status === "Nabór ogłoszony" ? ' class="row-nabor"' : '') + '>' +
    '<td class="' + (obcy ? "muted" : "strong") + '">' + esc(n.pup) + (obcy ? '<div class="small muted">inny urząd w województwie</div>' : '') + '</td>' +
    '<td>' + tag + '</td>' +
    '<td class="small nowrap">' + term + '</td></tr>';
}

/* Nabory dla urzedu klienta */
function renderNabory17() {
  var w = STAN_17.w;
  var moj = DB.NABORY.filter(function (n) { return n.pup === w.pupNazwa; });
  var wojewodztwo = DB.NABORY.filter(function (n) {
    return n.pup !== w.pupNazwa && moj.length && n.woj === moj[0].woj;
  });
  var html = moj.map(function (n) { return wierszNaboru17(n, false); }).join("") +
             wojewodztwo.map(function (n) { return wierszNaboru17(n, true); }).join("");
  document.getElementById("nabory").innerHTML = html ||
    '<tr><td colspan="3"><div class="empty"><div class="ei">&#128197;</div>' +
    '<div class="et">Brak ogłoszonych naborów</div>Poinformujemy Cię mailem, gdy Twój urząd ogłosi nabór.</div></td></tr>';
}
