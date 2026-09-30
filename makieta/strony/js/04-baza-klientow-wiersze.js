/* Ekran 04, czesc 2: wiersze tabeli klientow i rozwiniete wnioski klienta.
   Korzysta ze STAN_04 z 04-baza-klientow-dane.js. Same deklaracje. */

function tagNaboru(r) {
  if (r.status === "Nabór ogłoszony") return '<span class="tag pos dot">trwa</span>';
  if (r.status === "W trakcie kontaktu") return '<span class="tag info dot">kontakt</span>';
  if (r.status === "Brak naboru") return '<span class="tag warn dot" title="Prognoza: ' + esc(r.nab.prognoza) + '">prognoza</span>';
  if (r.status === "Po naborze") return '<span class="tag mute dot">po naborze</span>';
  return '<span class="tag mute dot">brak danych</span>';
}
function tagDni(r) {
  if (r.dni == null) return "";
  if (r.dni < 0) return ' <span class="small muted">zakończony</span>';
  var klasa = r.dni <= 3 ? "neg" : r.dni <= 10 ? "warn" : "info";
  return ' <span class="tag ' + klasa + '">' + r.dni + ' dni</span>';
}
function tagWielkosc(w) {
  return '<span class="pill ' + (w === "mikro" ? "k" : "w") + '">' + esc(w || "brak") + '</span>';
}
function flagaKolejny(r) {
  return r.kl.zainteresowany
    ? '<span class="tag pos" data-tip="Zainteresowany kolejnym naborem (D-130).">tak</span>'
    : '<span class="tag mute" data-tip="Nie zainteresowany kolejnym naborem (D-130).">nie</span>';
}

/* Wiersz wniosku klienta: klik otwiera karte wniosku z powrotem do tego klienta */
function wierszWniosku(w) {
  var brak = '<span class="muted">&mdash;</span>';
  return '<tr class="' + Statusy.klasaWiersza(w) + '" data-id="' + esc(w.id) + '" data-klient="' + esc(w.klient) + '">' +
    '<td class="strong mono nowrap">' + esc(w.id) + '</td>' +
    '<td class="nowrap">' + esc(w.rok || "bez roku") + '</td>' +
    '<td><div class="tnij w" title="' + esc(w.szkolenie) + '">' + esc(w.szkolenie) + '</div></td>' +
    '<td class="num">' + (w.przyznano != null ? DB.fmtPLN(w.przyznano) : brak) + '</td>' +
    '<td class="num">' + (w.kosztCalkowity != null ? DB.fmtPLN(w.kosztCalkowity) : brak) + '</td>' +
    '<td>' + Statusy.znacznik(w) + '</td>' +
    '<td>' + Statusy.znacznikRozliczenia(w) + '</td>' +
    '<td class="small muted">etap ' + esc(w.etap) + ': ' + esc(Statusy.ETAPY[w.etap] || "") + '</td>' +
    '</tr>';
}

/* Zagniezdzona tabela wnioskow klienta (D-128), kolorowana statusem */
function detalWnioskow(r) {
  var lista = wnioskiWFiltrze(r.wnioski.slice().sort(function (a, b) { return (b.rok || "") < (a.rok || "") ? -1 : 1; }));
  var body = lista.length ? lista.map(wierszWniosku).join("") :
    '<tr><td colspan="8" class="small muted" style="padding:10px">Brak wniosków w tym filtrze. ' +
    'Zmień filtr na „Wszyscy klienci”, żeby zobaczyć wszystkie.</td></tr>';
  var ukryte = r.wnioski.length - lista.length;
  var stopka = ukryte > 0
    ? '<div class="small muted" style="margin:0 24px 8px 0">Ukryte przez filtr: ' + ukryte + '. ' +
      '<a class="link-rekordu" href="' + esc(Nawigacja.adresKlienta(r.kl.id)) + '">Wszystkie wnioski na karcie klienta</a></div>'
    : '';
  return '<tr class="wn-detail"><td colspan="12">' +
    '<table class="tbl"><thead><tr>' +
      '<th>Wniosek</th><th>Rok</th><th>Szkolenie</th><th class="num">Przyznano</th>' +
      '<th class="num">Koszt całk.</th><th>Status</th><th>Rozliczenie</th><th>Etap</th>' +
    '</tr></thead><tbody>' + body + '</tbody></table>' + stopka + '</td></tr>';
}

function przyciskRozwijania(r) {
  if (!r.wnioski.length) return '<span class="muted">&middot;</span>';
  var otw = !!STAN_04.expanded[r.kl.id];
  return '<button class="btn xs exp-btn" onclick="przelaczWnioski(\'' + escJs(r.kl.id) + '\')" data-tip="Rozwiń wnioski klienta (D-128).">' + (otw ? "&minus;" : "+") + '</button>';
}

function wierszKlienta(r) {
  var cls = r.status === "Nabór ogłoszony" ? "row-pos row-nabor"
          : (r.status === "Po naborze" || r.status === "Bez informacji") ? "dim" : "";
  var row = '<tr class="' + cls + '" data-kl="' + esc(r.kl.id) + '">' +
    '<td class="exp-cell">' + przyciskRozwijania(r) + '</td>' +
    '<td class="strong">' + esc(r.kl.nr) + '</td>' +
    '<td class="strong"><div class="tnij" title="' + esc(r.kl.nazwa) + '"><a class="link-rekordu" href="' +
      esc(Nawigacja.adresKlienta(r.kl.id)) + '">' + esc(r.kl.nazwa) + '</a></div>' +
      '<span class="pod"><span class="mono">' + esc(r.kl.nip) + '</span> &middot; ' + esc(r.kl.miasto) + '</span></td>' +
    '<td class="nowrap">' + tagWielkosc(r.kl.wielkosc) + '</td>' +
    '<td><div class="tnij" title="' + esc(r.isNazwa) + '">' + esc(r.isNazwa) + '</div></td>' +
    '<td class="nowrap muted">' + esc(String(r.pupNazwa).replace(/^PUP\s+/, "")) + '</td>' +
    '<td class="nowrap">' + tagNaboru(r) + '</td>' +
    '<td class="mono nowrap">' + (esc(r.koniec) || '<span class="muted">&mdash;</span>') + tagDni(r) + '</td>' +
    '<td class="c">' + flagaKolejny(r) + '</td>' +
    '<td class="c">' + (r.wnioski.length ? '<b>' + r.wnioski.length + '</b>' : '<span class="muted">0</span>') + '</td>' +
    '<td class="small"><div class="tnij" title="' + esc(r.kl.osoba) + '">' + esc(r.kl.osoba) + '</div>' +
      '<span class="pod">' + esc(r.kl.tel) + '</span></td>' +
    '<td class="right"><button class="btn xs" title="Edytuj dane klienta" onclick="edytujKlient(\'' + escJs(r.kl.id) + '\')">&#9998;</button></td>' +
    '</tr>';
  return row + (STAN_04.expanded[r.kl.id] ? detalWnioskow(r) : "");
}
