/* Ekran Instytucje: szczegoly (dane firmy, osoby, konta, korespondencja).
   Tylko deklaracje, bez kodu wykonywanego od razu. */
/* ---------- Szczegol: dane firmy ---------- */
function kontaktyHtml(i) {
  if (!i.kontakty.length) return '<span class="muted">Nie wskazano</span>';
  return i.kontakty.map(function (k, n) {
    return "<div>" + (n === 0 ? "<b>" : "") + esc(k.osoba || "-") + (n === 0 ? "</b> (główny)" : "") +
      '<div class="small muted">' + esc([k.mail, k.tel].filter(Boolean).join(" · ")) + "</div></div>";
  }).join("");
}
function renderDane(i) {
  var kl = klienciIS(i.id), wn = wnioskiIS(i.id);
  el("daneFirmy").innerHTML =
    [["Nazwa", "<b>" + esc(i.nazwa) + "</b>"],
     ["Identyfikator", '<span class="mono">' + esc(i.id) + '</span> <span class="pill">' + esc(i.skrot) + '</span>'],
     ["Status", czyAktywna(i.id) ? '<span class="tag pos">aktywna</span>' : '<span class="tag mute">nieaktywna</span>'],
     ["NIP", '<span class="mono">' + esc(i.nip) + '</span>'],
     ["Strona www", i.www ? esc(i.www) : '<span class="muted">-</span>'],
     ["Siedziba (miejscowość)", "<b>" + esc(i.miasto) + '</b> <span class="tag info dot">źródło miejscowości na certyfikacie</span> <span class="ref">D-99</span>'],
     ["Opis działalności", esc(i.opis)],
     ["Standard godzinowy", '<span class="pill w">' + esc(i.standard) + "</span>"],
     ["Model terminów", esc(MODEL_TERMINOW[i.modelTerminow] || i.modelTerminow) + ' <span class="ref">D-142</span>'],
     ["Osoby kontaktowe", kontaktyHtml(i)],
     ["Opiekun po stronie LDIT", esc(i.opiekun)],
     ["Szkoleń w katalogu", szkoleniaIS(i.id).length],
     ["Szkoleniowców", szkoleniowcyIS(i.id).filter(function (z) { return z.aktywny; }).length + " aktywnych"],
     ["Klientów przypisanych", DB.fmtNum(kl.length)],
     ["Projekty aktywne", aktywneIS(i.id).length + " z " + wn.length + " w roku 2026"],
     ["Formularz zgłoszeniowy", 'własna kopia formularza <span class="ref">D-70</span>, konfiguracja w <a href="07-konfigurator-is.html">konfiguratorze</a>'],
     ["Warunki prowizyjne", '<span class="tag mute dot">niewidoczne w tym module</span> <span class="ref">D-07</span>']
    ].map(function (r) { return "<dt>" + r[0] + "</dt><dd>" + r[1] + "</dd>"; }).join("");
}

/* ---------- Szczegol: osoby, konta, korespondencja ---------- */
function osobaBox(tytul, k) {
  return '<div class="card mb0"><div class="card-head"><h3>' + tytul + "</h3></div>" +
    '<div class="card-body">' +
    (k
      ? '<div style="font-size:14px;font-weight:700">' + esc(k.osoba || "-") + "</div>" +
        '<div class="small muted" style="margin-top:3px">' + esc([k.mail, k.tel].filter(Boolean).join(" · ")) + "</div>"
      : '<div class="muted small">Nie wskazano.</div>') +
    "</div></div>";
}
function renderOsoby(i) {
  el("role3").innerHTML = [0, 1, 2].map(function (n) {
    return osobaBox(n === 0 ? "Kontakt główny" : "Osoba kontaktowa " + (n + 1), i.kontakty[n]);
  }).join("");
  var konta = DB.UZYTKOWNICY.filter(function (u) { return u.inst.split(", ").indexOf(i.nazwa) >= 0; });
  el("konta").innerHTML = konta.length ? konta.map(function (u) {
    return "<tr>" +
      '<td class="strong">' + esc(u.imie) + "</td>" +
      '<td class="mono small">' + esc(u.login) + "</td>" +
      "<td><span class='tag " + (u.rola === "Instytucja szkoleniowa" ? "info" : "mute") + "'>" + esc(u.rola) + "</span></td>" +
      '<td class="small nowrap">' + esc(u.ost) + "</td>" +
      '<td class="c">' + (u["2fa"] ? '<span class="tag pos">tak</span>' : '<span class="tag warn">nie</span>') + "</td>" +
      '<td class="right"><a class="btn xs" href="11-konta-uprawnienia.html">Uprawnienia</a></td>' +
      "</tr>";
  }).join("") : '<tr><td colspan="6"><div class="empty"><div class="ei">&#9723;</div>' +
    '<div class="et">Brak kont</div>Instytucja nie ma jeszcze założonych kont w systemie.</div></td></tr>';
}
function renderMaile(i) {
  var maile = DB.MAILE.filter(function (m) { return m.isId === i.id; });
  el("maile").innerHTML = maile.length ? maile.map(function (m) {
    return "<tr>" +
      "<td>" + (m.kier === "in" ? '<span class="tag info">&#8600;</span>' : '<span class="tag mute">&#8599;</span>') + "</td>" +
      '<td class="strong">' + esc(m.temat) + "</td>" +
      '<td class="small mono muted">' + esc(m.od) + "</td>" +
      '<td class="small muted">' + esc(m.skrz) + "</td>" +
      '<td class="small nowrap">' + esc(m.data) + "</td>" +
      '<td class="c">' + (m.zal ? '<span class="pill">' + esc(m.zal) + "</span>" : '<span class="muted">&ndash;</span>') + "</td>" +
      "</tr>";
  }).join("") : '<tr><td colspan="6"><div class="empty"><div class="et">Brak korespondencji</div>Brak wiadomości przypisanych do tej instytucji.</div></td></tr>';
}

function renderSzczegol() {
  var i = aktualnaIS();
  if (!i) { el("detNazwa").textContent = "Brak instytucji"; return; }
  el("detNazwa").textContent = i.nazwa;
  el("detSub").textContent = i.id + " · " + i.miasto + " · " + DB.fmtNum(klienciIS(i.id).length) +
    " klientów · " + wnioskiIS(i.id).length + " projektów w 2026";
  pokazTylkoGdyEdycja("btnEdytujIS");
  pokazTylkoGdyEdycja("btnNowaIS");
  renderDane(i);
  renderKatalog(i);
  renderSzkoleniowcy(i);
  renderOsoby(i);
  renderMaile(i);
}
