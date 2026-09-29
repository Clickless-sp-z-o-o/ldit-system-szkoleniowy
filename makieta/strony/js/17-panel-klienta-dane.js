/* Panel klienta: stan strony, wybor klienta i wniosku, status oraz karta szkolenia (tylko deklaracje) */
var ETAPOW = 10;
var STAN_17 = { kl: null, w: null, inst: {}, termin: null, szk: null, odbyte: false, zakw: 0, dok: [] };

/* Panel dziala w kontekscie JEDNEGO klienta: tego, ktory jest przypiety do
   zalogowanego konta. Konto LDIT ogladajace panel podglada pierwszego klienta
   ze swojego zakresu. Warstwa separacji i tak nie wpuscila tu nikogo wiecej.
   Zwraca false (i pokazuje blokade), gdy nie ma czego pokazac. */
function wczytajDane17() {
  var sesja = Auth.sesja();
  var kl = (sesja && sesja.klient_id)
    ? DB.KLIENCI.filter(function (k) { return k.id === sesja.klient_id; })[0]
    : DB.KLIENCI[0];

  if (!kl) {
    Auth.pokazBlokade("Brak danych",
      "To konto nie jest powiazane z zadnym klientem. Zakres panelu klienta " +
      "pozostaje nierozstrzygniety (P-33).");
    return false;
  }

  var wnioskiKlienta = DB.WNIOSKI_WSZYSTKIE.filter(function (x) { return x.klient === kl.id; });
  var w = wnioskiKlienta.filter(function (x) { return x.statusDec === "Pozytywna"; })[0] ||
          wnioskiKlienta[0];

  if (!w) {
    Auth.pokazBlokade("Brak wniosku",
      "Ten klient nie ma jeszcze zadnego projektu w systemie.");
    return false;
  }

  STAN_17.kl = kl;
  STAN_17.w = w;
  STAN_17.inst = DB.INSTYTUCJE.filter(function (i) { return i.id === w.is; })[0] || {};
  STAN_17.termin = DB.TERMINY.filter(function (t) { return t.szk === w.szkId; })[0];
  STAN_17.szk = DB.SZKOLENIA.filter(function (s) { return s.id === w.szkId; })[0];
  STAN_17.odbyte = w.rozliczenie === "Rozliczone" || w.rozliczenie === "Zafakturowany";
  STAN_17.zakw = w.uczestnicy.filter(function (u) { return u.status === "zakwalifikowany"; }).length;
  return true;
}

/* Etapy: z danych wniosku, bez wymyslonej historii */
function krokiStatusu17() {
  var w = STAN_17.w, termin = STAN_17.termin;
  return [
    ["Formularz wpłynął", w.dataFormularza ? "Otrzymaliśmy Twoje zgłoszenie " + w.dataFormularza : "Zgłoszenie w systemie", !!w.dataFormularza],
    ["Wniosek w przygotowaniu", "Kompletujemy dokumenty i wyliczenia", w.etap >= 3],
    ["Złożony w " + w.pupNazwa, w.statusSkl === "Złożony" ? "Złożono " + w.dataWniosku : "Oczekuje na złożenie", w.statusSkl === "Złożony"],
    ["Decyzja pozytywna", w.statusDec === "Pozytywna" ? "Urząd przyznał dofinansowanie" : (w.statusDec === "Negatywna" ? "Decyzja negatywna, skontaktujemy się z Tobą" : "Czekamy na decyzję urzędu"), w.statusDec === "Pozytywna"],
    ["Termin ustalony", termin ? termin.od + " do " + termin.do : "Termin jeszcze nieustalony", !!termin && w.statusDec === "Pozytywna"],
    ["Szkolenie odbyte", STAN_17.odbyte ? "Zrealizowane, certyfikaty w dokumentach" : "Przed nami", STAN_17.odbyte],
    ["Rozliczone", w.rozliczenie === "Rozliczone" ? "Sprawa zamknięta" : "Po szkoleniu przygotujemy paczkę rozliczeniową", w.rozliczenie === "Rozliczone"]
  ];
}

function renderStatus17() {
  var w = STAN_17.w;
  document.getElementById("tytul").textContent = "Panel klienta, " + STAN_17.kl.nazwa;
  document.getElementById("subStatus").textContent = "sprawa " + w.id + " w " + w.pupNazwa;

  var kroki = krokiStatusu17();
  var teraz = -1;
  for (var i = 0; i < kroki.length; i++) { if (!kroki[i][2]) { teraz = i; break; } }
  document.getElementById("przebieg").innerHTML = kroki.map(function (k, idx) {
    var cls = k[2] ? "done" : (idx === teraz ? "now" : "");
    return '<div class="tl-item ' + cls + '"><div class="t">' + esc(k[0]) + '</div><div class="m">' + esc(k[1]) + '</div></div>';
  }).join("");
  document.getElementById("tagEtap").textContent = "etap " + w.etap + " z " + ETAPOW +
    (teraz === -1 ? ", sprawa zamknięta" : ", teraz: " + kroki[teraz][0].toLowerCase());
}

function renderSzkolenie17() {
  var w = STAN_17.w, inst = STAN_17.inst, termin = STAN_17.termin, szk = STAN_17.szk;
  document.getElementById("szkolenieDl").innerHTML =
    [["Szkolenie", "<b>" + esc(w.szkolenie) + "</b>"],
     ["Prowadzi", esc(inst.nazwa || "-")],
     ["Termin", termin ? esc(termin.od + " do " + termin.do) : '<span class="muted">ustalimy po decyzji urzędu</span>'],
     ["Miejsce", termin ? esc(termin.miejsce) : '<span class="muted">do ustalenia</span>'],
     ["Tryb", esc(szk ? szk.tryb : "-")],
     ["Wymiar", esc(szk ? szk.godz + " godzin w " + szk.dni + " dni" : "-")],
     ["Godziny zajęć", esc(inst.standard || "-")],
     ["Materiały", '<a href="#" onclick="alert(\'Otwiera materiały udostępnione przez instytucję szkoleniową.\');return false">Otwórz materiały do szkolenia</a>'],
     ["Kontakt organizacyjny", esc(inst.kontakt ? inst.kontakt + ", " + inst.tel : "-")],
     ["Opiekun sprawy w LDIT", esc(w.opiekun) + ", tel. 61 22 11 004"]
    ].map(function (r) { return "<dt>" + r[0] + "</dt><dd>" + r[1] + "</dd>"; }).join("");
}
