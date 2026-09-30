/* ============================================================================
   Powloka makiety (index.html): podmenu Dofinansowan. Same deklaracje.

   Pod "Dofinansowania" sa lata jak arkusze w Excelu (D-129, D-159), a pod
   kazdym rokiem instytucje z przydzialu konta (D-112, D-113). Liczby przy
   latach przychodza z ekranu w ramce (Nawigacja.zglosEkran), bo kopia bazy
   w powloce jest z chwili logowania. Powloka niczego nie zapisuje: "+ Dodaj
   rok" otwiera formularz w Zestawieniach, ktore pracuja na swiezej bazie.
   ============================================================================ */

function adresRoku(rok, nazwaIS) {
  return "02-zestawienia.html" + Nawigacja.zbudujZapytanie({ is: nazwaIS || "", rok: rok });
}

function etykietaRoku(rok) {
  return rok === Lata.NIEPRZYPISANE ? "Nieprzypisane" : "Dofinansowania " + rok;
}

function htmlInstytucjiRoku(rok, instytucje) {
  var wszystkie = '<div class="nav-item sub-is" data-rok="' + esc(rok) + '" data-is="" data-plik="' + esc(adresRoku(rok)) + '"' +
    ' data-label="Wszystkie instytucje" data-tip="Zbiorczy widok wszystkich instytucji w zasiegu konta. D-127.">' +
    '<span>Wszystkie instytucje</span></div>';
  return wszystkie + instytucje.map(function (nazwa) {
    return '<div class="nav-item sub-is" data-rok="' + esc(rok) + '" data-is="' + esc(nazwa) + '"' +
      ' data-plik="' + esc(adresRoku(rok, nazwa)) + '" data-label="' + esc(nazwa) + '"' +
      ' data-tip="Tylko klienci i wnioski instytucji ' + esc(nazwa) + ' (separacja danych, D-35)."><span>' + esc(nazwa) + '</span></div>';
  }).join("");
}

/* lata: [{rok, n}], otwarte: {rok: true}, mozeDodac: feature zestawienia.dodawanie_lat */
function htmlPodmenuDofin(lata, instytucje, otwarte, mozeDodac) {
  var html = lata.map(function (l) {
    var nieprzypisane = l.rok === Lata.NIEPRZYPISANE;
    var otwarty = !nieprzypisane && otwarte[l.rok];
    return '<div class="nav-item sub-rok' + (otwarty ? " open" : "") + '" data-rok="' + esc(l.rok) + '"' +
        ' data-plik="' + esc(adresRoku(l.rok)) + '" data-label="' + esc(etykietaRoku(l.rok)) + '">' +
        (nieprzypisane ? '<span class="chev-miejsce"></span>' : '<span class="chev">&#9654;</span>') +
        '<span>' + esc(etykietaRoku(l.rok)) + '</span><span class="n">' + Number(l.n) + '</span></div>' +
      (nieprzypisane ? "" : '<div class="nav-sub2' + (otwarty ? " open" : "") + '" data-rok="' + esc(l.rok) + '">' +
        htmlInstytucjiRoku(l.rok, instytucje) + '</div>');
  }).join("");
  if (mozeDodac) {
    html += '<div class="nav-item dodaj-rok" data-plik="02-zestawienia.html?dodajRok=1" data-label="Dodaj rok"' +
      ' data-tip="Nowa, pusta zakladka kolejnego roku. Dodaje administrator albo pracownik LDIT (D-159, D-165).">' +
      '<span>+ Dodaj rok</span></div>';
  }
  return '<div class="nav-sub" id="sub-dofin">' + html + '</div>';
}

/* Klik w nazwe roku rozwija jego instytucje i otwiera widok roku; klik w strzalke tylko
   zwija albo rozwija liste. Zwraca true, gdy po kliknieciu trzeba otworzyc widok. */
function kliknietoRok(el, cel, otwarte) {
  var rok = el.getAttribute("data-rok");
  var lista = document.querySelector('.nav-sub2[data-rok="' + CSS.escape(rok) + '"]');
  if (!lista) return true;
  var tylkoStrzalka = !!cel.closest(".chev");
  var otwarty = tylkoStrzalka ? !lista.classList.contains("open") : true;
  lista.classList.toggle("open", otwarty);
  el.classList.toggle("open", otwarty);
  otwarte[rok] = otwarty;
  return !tylkoStrzalka;
}

/* Lata z komunikatu ekranu roznia sie od menu (nowy rok, zmiana liczby wnioskow) */
function inneLata(a, b) {
  return JSON.stringify(a || []) !== JSON.stringify(b || []);
}
