/* ============================================================================
   Powloka makiety (index.html): okruszek, zaznaczenie w menu i licznik
   formularzy do akceptacji. Same deklaracje, wywolania sa w index.html.
   ============================================================================ */

/* Okruszek buduje sie przez textContent: nazwy pochodza z bazy. Ostatni czlon pogrubiony. */
function ustawOkruszek(czlony) {
  var el = document.getElementById("crumb");
  el.innerHTML = "";
  czlony.forEach(function (tekst, i) {
    var ostatni = i === czlony.length - 1;
    var span = document.createElement(ostatni ? "b" : "span");
    span.textContent = tekst;
    el.appendChild(span);
    if (!ostatni) {
      var sep = document.createElement("span");
      sep.className = "sep";
      sep.textContent = "›";
      el.appendChild(sep);
    }
  });
}

/* Zaznaczenie w menu i okruszek wynikaja z ekranu w ramce, nie z ostatniego klikniecia
   w menu. Ekran zglasza sie sam (Nawigacja.zglosEkran), takze po przejsciu linkiem. */
function pozycjaInstytucji(ekran) {
  if (ekran.plik !== "02-zestawienia.html") return null;
  var is = Nawigacja.odczytajZapytanie(ekran.zapytanie, ["is"]).is;
  var cel = "02-zestawienia.html" + (is ? "?is=" + encodeURIComponent(is) : "");
  return Array.prototype.filter.call(document.querySelectorAll("#nav .sub-is"), function (x) {
    return x.getAttribute("data-plik") === cel;
  })[0] || null;
}

/* Zwraca id zaznaczonej pozycji menu albo null, gdy ekranu nie ma w menu tej roli */
function zaznaczEkran(ekran) {
  var nav = document.getElementById("nav");
  var idMenu = Nawigacja.menuEkranu(ekran.plik);
  var pozycja = nav.querySelector('.nav-item[data-id="' + idMenu + '"]');
  var podpozycja = pozycjaInstytucji(ekran);

  nav.querySelectorAll(".nav-item").forEach(function (x) { x.classList.remove("active"); });
  if (!pozycja) { ustawOkruszek([ekran.tytul]); return null; }

  pozycja.classList.add("active");
  var czlony = [pozycja.getAttribute("data-label")];
  if (podpozycja) {
    podpozycja.classList.add("active");
    pozycja.classList.add("open");
    document.getElementById("sub-dofin").classList.add("open");
    czlony.push(podpozycja.getAttribute("data-label"));
  } else if (Nawigacja.plikZAdresu(pozycja.getAttribute("data-plik")) !== ekran.plik) {
    czlony.push(ekran.tytul);
  }
  ustawOkruszek(czlony);
  return idMenu;
}

/* Licznik wnioskow do akceptacji (D-105, D-140), tylko dla rol z modulem Zadania */
function pokazLicznik(liczba) {
  var przycisk = document.getElementById("akceptacje");
  przycisk.hidden = liczba === null;
  var n = document.getElementById("akceptacjeN");
  n.textContent = liczba;
  n.hidden = !liczba;
}
