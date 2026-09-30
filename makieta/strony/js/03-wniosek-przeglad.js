/* Ekran Wniosek: dane projektu, korespondencja klienta, przebieg.
   Tylko deklaracje, bez kodu wykonywanego od razu. */
/* ---------- Dane projektu ---------- */
function renderDane() {
  var wiersze = [
    ["Numer klienta", "<b>" + esc(STAN_03.w.nr) + "</b> <span class='small muted'>(trafia na fakturę)</span>"],
    ["Klient", '<a class="link-rekordu" href="' + esc(Nawigacja.adresKlienta(STAN_03.w.klient)) + '">' + esc(STAN_03.w.klNazwa) + '</a>'],
    ["NIP", '<span class="mono">' + esc(STAN_03.w.nip) + '</span>'],
    ["Instytucja", Auth.widziModul("inst")
      ? '<a class="link-rekordu" href="06-instytucje.html' + esc(Nawigacja.zbudujZapytanie({ id: STAN_03.w.is })) + '">' + esc(STAN_03.w.isNazwa) + '</a>'
      : esc(STAN_03.w.isNazwa)],
    ["Urząd pracy", esc(STAN_03.w.pupNazwa)],
    ["Opiekun", esc(STAN_03.w.opiekun)],
    ["Data formularza", esc(STAN_03.w.dataFormularza) + ' <span class="tag mute">auto</span>'],
    ["Data wniosku", esc(STAN_03.w.dataWniosku) || "brak"],
    ["Data faktury", (esc(STAN_03.w.dataFaktury) || "brak") + ' <span class="small muted">wyznacza okres prowizji</span>']
  ];
  el("dane").innerHTML = wiersze.map(function (r) { return "<dt>" + r[0] + "</dt><dd>" + r[1] + "</dd>"; }).join("");
  document.getElementById("tytul").textContent = STAN_03.w.id + " · " + STAN_03.w.klNazwa;
  KOLUMNY_KONTAKTU.forEach(function (k) { el(k[1]).value = STAN_03.raw[k[0]] || ""; });
}

/* ---------- Korespondencja klienta ---------- */
function renderMaile() {
  var maile = DB.MAILE.filter(function (m) { return m.klient === STAN_03.w.klient; });
  el("maile").innerHTML = maile.length ? maile.map(function (m) {
    return '<tr><td>' + (m.kier === "in" ? '<span class="tag info">&#8600;</span>' : '<span class="tag mute">&#8599;</span>') + '</td>' +
      '<td class="strong">' + esc(m.temat) + '</td>' +
      '<td class="small muted">' + esc(m.skrz) + '</td>' +
      '<td class="small nowrap">' + esc(m.data) + '</td>' +
      '<td class="c">' + (m.zal ? '<span class="pill">' + esc(m.zal) + '</span>' : '<span class="muted">&mdash;</span>') + '</td></tr>';
  }).join("") : '<tr><td colspan="5" class="muted">Brak korespondencji tego klienta.</td></tr>';
}

/* ---------- Przebieg: z tabeli przebieg_wniosku, a bez wpisow z etapu wniosku ---------- */
function pozycja(klasa, tytul, opis) {
  return '<div class="tl-item ' + klasa + '"><div class="t">' + esc(tytul) + '</div><div class="m">' + esc(opis) + '</div></div>';
}
function renderPrzebieg() {
  var wpisy = Store.query("SELECT * FROM przebieg_wniosku WHERE wniosek_id = ? ORDER BY czas", [STAN_03.w.id]);
  if (wpisy.length) {
    el("przebieg").innerHTML = wpisy.map(function (p, i) {
      var tytul = "Etap " + p.etap_do + (p.etap_z != null ? " (z etapu " + p.etap_z + ")" : "");
      return pozycja(i === wpisy.length - 1 ? "now" : "done", tytul, p.czas + (p.komentarz ? " · " + p.komentarz : ""));
    }).join("");
    return;
  }
  var daty = [["Formularz wpłynął", STAN_03.w.dataFormularza], ["Wniosek złożony", STAN_03.w.dataWniosku], ["Faktura wystawiona", STAN_03.w.dataFaktury]];
  el("przebieg").innerHTML = daty.filter(function (d) { return d[1]; })
    .map(function (d) { return pozycja("done", d[0], d[1]); }).join("") +
    pozycja("now", "Aktualny etap: " + STAN_03.w.etap + " z " + ETAPOW, "brak zapisanych zmian etapu");
}
