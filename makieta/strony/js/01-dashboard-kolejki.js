/* Dashboard: kolejka "Wymaga dzialania" i rozklad statusow wnioskow. Tylko deklaracje. */

function dodajDni(data, dni) {
  var d = new Date(data + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + dni);
  return d.toISOString().slice(0, 10);
}

function najwczesniej(lista, pole) {
  return lista.map(function (x) { return x[pole]; }).sort()[0];
}

/* Wymaga dzialania: kazda pozycja liczona z danych, pozycje bez spraw sie nie pokazuja.
   Pozycja prowadzaca do modulu spoza roli tez sie nie pokazuje, bo link skonczylby sie odmowa. */
function pozycjeDoDzialania() {
  var dzis = STAN_01.dzis;
  var koniecNaboru = dodajDni(dzis, DNI_NABORU), koniecSzkolen = dodajDni(dzis, DNI_SZKOLENIA);
  var kolejka = DB.KOLEJKA.filter(function (k) { return k.status === "oczekuje"; });
  var nabory = DB.NABORY.filter(function (n) { return n.status === "Nabór ogłoszony" && n.do >= dzis && n.do <= koniecNaboru; });
  var terminy = DB.TERMINY.filter(function (t) { return t.status !== "Odbyty" && t.od >= dzis && t.od <= koniecSzkolen; });
  var faktury = DB.FAKTURY.filter(function (f) { return f.status === "Po terminie"; });
  var doRozliczenia = STAN_01.poz.filter(function (w) { return w.rozliczenie === "Oczekuje"; });
  return [
    { co: "Zgłoszenia z formularza do akceptacji", ctx: "bramka anty-spam", n: kolejka.length, termin: "do akceptacji", klasa: "warn", href: "18-zadania.html" },
    { co: "Nabory kończące się w tym tygodniu", ctx: nabory.map(function (n) { return esc(n.pup); }).join(", "), n: nabory.length,
      termin: "do " + esc(najwczesniej(nabory, "do")), klasa: "neg", href: "05-nabory.html" },
    { co: "Szkolenia w ciągu " + DNI_SZKOLENIA + " dni, sprawdź dokumenty", ctx: "termin z kalendarza", n: terminy.length,
      termin: esc(najwczesniej(terminy, "od")), klasa: "warn", href: "13-terminy.html" },
    { co: "Faktury po terminie płatności", ctx: "moduł Administracja", n: faktury.length, termin: "zaległe", klasa: "neg",
      href: "08-administracja.html" + Nawigacja.zbudujZapytanie({ zakladka: "faktury", status: "Po terminie" }) },
    { co: "Projekty z decyzją pozytywną, nierozliczone", ctx: "status rozliczenia: oczekuje", n: doRozliczenia.length,
      termin: "bieżące", klasa: "info", href: Nawigacja.adresWnioskow({ rok: dzis.slice(0, 4), status: "Pozytywna", rozl: "Oczekuje" }) }
  ].filter(function (p) { return p.n > 0 && Auth.widziModul(Nawigacja.modulEkranu(p.href)); });
}

function renderWymagaDzialania() {
  var doDzialania = pozycjeDoDzialania();
  document.getElementById("wymagaDzialania").innerHTML = doDzialania.length
    ? doDzialania.map(function (p) {
        return '<tr><td class="strong">' + p.co + '</td><td class="muted">' + p.ctx + '</td>' +
          '<td class="num">' + p.n + '</td><td><span class="tag ' + p.klasa + ' dot">' + p.termin + '</span></td>' +
          '<td class="right"><a class="btn xs" href="' + p.href + '">Otwórz</a></td></tr>';
      }).join("")
    : '<tr><td colspan="5"><div class="empty"><div class="et">Nic nie wymaga działania</div>Wszystkie kolejki są puste.</div></td></tr>';
}

function renderStatusy() {
  var s = STAN_01;
  var liczSkl = function (nazwa) { return s.wnioski.filter(function (w) { return w.statusSkl === nazwa; }).length; };
  /* [etykieta, liczba, klasa znacznika, status na liscie wnioskow] */
  var st = [
    ["Decyzja pozytywna", s.poz.length, "pos", "Pozytywna"],
    ["Decyzja negatywna", s.neg.length, "neg", "Negatywna"],
    ["Oczekuje na decyzję", s.oczek.length, "info", "Czekamy"],
    ["Niezłożone", liczSkl("Niezłożony"), "mute", "Niezłożony"],
    ["NW (do zmiany nazwy)", liczSkl("NW"), "warn", "NW"],
    ["Rezygnacja", liczSkl("Rezygnacja"), "mute", "Rezygnacja"]
  ];
  /* Klik w status otwiera wnioski tego roku w tym statusie (drill through, D-212) */
  var zLinkiem = Auth.widziModul("dofin");
  document.getElementById("statusy").innerHTML = st.map(function (r) {
    var link = zLinkiem ? ' data-href="' + esc(Nawigacja.adresWnioskow({ rok: s.rok, status: r[3] })) + '"' +
      ' title="Pokaż wnioski: ' + esc(r[0]) + '"' : "";
    return '<div' + link + ' style="display:flex;align-items:center;gap:10px;padding:6px 4px;border-bottom:1px solid var(--line)">' +
      '<span class="tag ' + r[2] + ' dot">' + r[0] + '</span>' +
      '<b style="margin-left:auto;font-variant-numeric:tabular-nums">' + r[1] + '</b></div>';
  }).join("");
}
