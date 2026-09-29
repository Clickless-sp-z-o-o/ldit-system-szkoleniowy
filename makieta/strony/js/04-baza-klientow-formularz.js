/* Ekran 04, czesc 3: formularz klienta (dodawanie i edycja). Z bazy nie usuwa sie klientow (D-128).
   Zapis idzie przez Store, walidacje pol robi warstwa danych (walidacja.js). Same deklaracje. */

var KOLUMNY_KONTAKTOW = [
  { osoba: "osoba_kontaktowa", tel: "telefon", mail: "email" },
  { osoba: "osoba_kontaktowa_2", tel: "telefon_2", mail: "email_2" },
  { osoba: "osoba_kontaktowa_3", tel: "telefon_3", mail: "email_3" }
];
var WIELKOSCI_KLIENTA = ["mikro", "mały", "średni", "duży", "inny"];

function val(id) { return document.getElementById(id).value; }

function poleTekstowe(id, label, v) {
  return '<label class="small" style="display:flex;flex-direction:column;gap:3px">' +
    '<span class="muted">' + label + '</span>' +
    '<input class="inp" id="kf_' + id + '" value="' + esc(v) + '"></label>';
}
function poleWyboru(id, label, opts, v) {
  return '<label class="small" style="display:flex;flex-direction:column;gap:3px">' +
    '<span class="muted">' + label + '</span>' +
    '<select class="inp" id="kf_' + id + '">' +
    opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (o[0] === v ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join("") +
    '</select></label>';
}
function poleKontaktow(kl) {
  return [0, 1, 2].map(function (n) {
    var k = kl && kl.kontakty[n] ? kl.kontakty[n] : {};
    var nr = n + 1;
    return poleTekstowe("osoba" + nr, "Osoba kontaktowa " + nr, k.osoba || "") +
      poleTekstowe("tel" + nr, "Telefon " + nr, k.tel || "") +
      poleTekstowe("mail" + nr, "E-mail " + nr, k.mail || "");
  }).join("");
}

function klientFormHTML(kl, tytul) {
  var instOpts = DB.INSTYTUCJE.map(function (i) { return [i.id, i.nazwa]; });
  var pupOpts = DB.PUPY.map(function (p) { return [p.id, p.nazwa]; });
  var wielkOpts = WIELKOSCI_KLIENTA.map(function (w) { return [w, w]; });
  /* Instytucja pozyskujaca wybierana jest tylko przy dodawaniu, edycja jej nie zmienia */
  var poleInstytucji = kl ? "" : poleWyboru("is", "Instytucja", instOpts, (instOpts[0] || [])[0]);
  return '<div class="card mb0"><div class="card-body">' +
    '<div class="small strong" style="margin-bottom:10px">' + esc(tytul) + '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">' +
      poleTekstowe("nazwa", "Nazwa firmy", kl ? kl.nazwa : "") +
      poleTekstowe("nip", "NIP", kl ? kl.nip : "") +
      poleTekstowe("miasto", "Miasto", kl ? kl.miasto : "") +
      poleWyboru("wielkosc", "Wielkość", wielkOpts, kl ? kl.wielkosc : "mikro") +
      poleInstytucji +
      poleWyboru("pup", "Urząd pracy", pupOpts, kl ? kl.pup : (pupOpts[0] || [])[0]) +
      poleKontaktow(kl) +
    '</div>' +
    '<div class="small muted" style="margin-top:8px">Liczba zatrudnionych jest na wniosku, nie przy kliencie (D-169).</div>' +
    '<div class="btn-row" style="margin-top:12px">' +
      '<button class="btn primary sm" onclick="zapiszKlient()">Zapisz</button>' +
      '<button class="btn sm" onclick="zamknijKlientForm()">Anuluj</button>' +
    '</div></div></div>';
}

function zbierzKlient() {
  var o = {
    nazwa: val("kf_nazwa"), nip: val("kf_nip"), miasto: val("kf_miasto"),
    wielkosc_przedsiebiorstwa: val("kf_wielkosc"), pup_id: val("kf_pup")
  };
  KOLUMNY_KONTAKTOW.forEach(function (kol, n) {
    var nr = n + 1;
    o[kol.osoba] = val("kf_osoba" + nr).trim() || null;
    o[kol.tel] = val("kf_tel" + nr).trim() || null;
    o[kol.mail] = val("kf_mail" + nr).trim() || null;
  });
  if (!STAN_04.edytowanyKlient) o.instytucja_id = val("kf_is");
  return o;
}

function otworzKlientForm(kl, tytul) {
  var el = document.getElementById("klientForm");
  el.innerHTML = klientFormHTML(kl, tytul);
  el.style.display = "block";
  el.scrollIntoView({ behavior: "smooth", block: "center" });
}
function zamknijKlientForm() {
  var el = document.getElementById("klientForm");
  el.style.display = "none"; el.innerHTML = ""; STAN_04.edytowanyKlient = null;
}
function edytujKlient(id) {
  STAN_04.edytowanyKlient = id;
  var kl = DB.KLIENCI.filter(function (x) { return x.id === id; })[0];
  otworzKlientForm(kl, "Edycja klienta: " + (kl ? kl.nazwa : id));
}

/* Klient moze byc u wielu instytucji (D-144). Powiazanie trzyma osobna tabela,
   bo to ona decyduje, kto zobaczy tego klienta na swojej liscie. Gdy zapisuje
   handlowiec (Auth.handlowiec() zwraca jego id), klient jest przypisany do niego (D-210). */
function przypiszDoInstytucji(klientId, instytucjaId) {
  if (!instytucjaId) return;
  var juz = Store.query(
    "SELECT 1 AS x FROM klient_instytucja WHERE klient_id = ? AND instytucja_id = ?",
    [klientId, instytucjaId]);
  if (juz.length) return;
  var wiersz = { klient_id: klientId, instytucja_id: instytucjaId };
  var handlowiec = Auth.handlowiec();
  if (handlowiec) wiersz.handlowiec_id = handlowiec;
  Store.insert("klient_instytucja", wiersz);
}

function dodajKlienta(o) {
  /* Numer klienta jest ciagly w roku i trafia na fakture (D-112), wiec
     liczymy go z calej tabeli, a nie z przefiltrowanego widoku. */
  var maxNr = Store.one("SELECT COALESCE(MAX(numer_klienta), 0) AS n FROM klienci").n;
  o.numer_klienta = maxNr + 1;
  o.utworzono = new Date().toISOString().slice(0, 10);
  document.getElementById("q").value = o.nazwa;
  var nowy = Store.insert("klienci", o, "KL-");
  przypiszDoInstytucji(nowy.id, o.instytucja_id);
}

function zapiszKlient() {
  var o = zbierzKlient();
  if (!o.nazwa.trim()) { document.getElementById("kf_nazwa").focus(); return; }
  if (STAN_04.edytowanyKlient) {
    /* Instytucja pozyskujaca zostaje bez zmian, formularz jej nie podaje */
    Store.update("klienci", STAN_04.edytowanyKlient, o);
  } else {
    dodajKlienta(o);
  }
  zamknijKlientForm();
}
