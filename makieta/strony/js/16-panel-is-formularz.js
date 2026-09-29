/* Panel instytucji: formularz zgloszeniowy i kolejka zgloszen (tylko deklaracje) */

function liczbaStatus16(lista, status) {
  return lista.filter(function (k) { return k.status === status; }).length;
}

function oczekujace16() {
  return STAN_16.FORMULARZE.filter(function (k) { return k.status === "oczekuje"; });
}

/* Liczby z kolejki (formularze_oczekujace), bez rozbicia per handlowiec (D-209) */
function renderStatystykiFormularza16() {
  var F = STAN_16.FORMULARZE;
  el16("formStat").innerHTML =
    [["Zgłoszeń z formularza", "<b>" + DB.fmtNum(F.length) + "</b>"],
     ["Czeka na akceptację LDIT", '<span class="tag warn">' + oczekujace16().length + "</span>"],
     ["Zaakceptowane", "<b>" + liczbaStatus16(F, "zaakceptowany") + "</b>"],
     ["Odrzucone", "<b>" + liczbaStatus16(F, "odrzucony") + "</b>"]
    ].map(function (r) { return "<dt>" + r[0] + "</dt><dd>" + r[1] + "</dd>"; }).join("");
}

function podepnijLinkFormularza16() {
  var link = "https://zgloszenia.ldit.pl/f/" + encodeURIComponent(STAN_16.inst.id.toLowerCase());
  el16("linkFormularza").value = link;
  el16("btnKopiujLink").addEventListener("click", function () {
    var przycisk = el16("btnKopiujLink");
    navigator.clipboard.writeText(link).then(function () {
      przycisk.textContent = "Skopiowano";
    }, function () {
      el16("linkFormularza").select();
      przycisk.textContent = "Zaznaczono, skopiuj ręcznie";
    });
  });
}

function wierszKolejki16(k) {
  return '<tr><td class="strong">' + esc(k.firma) + '<div class="small muted">' + esc(k.szkolenie) + '</div></td>' +
    '<td class="num">' + esc(k.osob) + '</td>' +
    '<td class="small nowrap">' + esc(k.data) + '</td></tr>';
}

function renderKolejka16() {
  var lista = oczekujace16();
  el16("kolejka").innerHTML = lista.length ? wiersze16(lista, wierszKolejki16) :
    '<tr><td colspan="3"><div class="empty"><div class="ei">&#9993;</div>' +
    '<div class="et">Brak zgłoszeń do akceptacji</div>Nowe wypełnienia formularza pojawią się tutaj.</div></td></tr>';
}
