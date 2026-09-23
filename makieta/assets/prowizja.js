/* ============================================================================
   Silnik prowizji. Pelny opis i przypadki testowe: docs/07-silnik-prowizji.md.

   Cztery modele z realnych umow:
     A  kumulacja miesieczna, stawka od calosci obrotu okresu
     B  kumulacja roczna, stawka od calosci obrotu roku
     C  kumulacja (miesieczna albo roczna), stawka od nadwyzki ponad prog
     D  stala stawka, bez progow

   Pulapka implementacyjna modelu A i B: przekroczenie progu podnosi stawke dla
   CALEGO obrotu okresu, takze dla faktur juz wystawionych. Dlatego pojedyncza
   faktura nie wystarczy, trzeba przeliczyc caly okres, i sluzy do tego liczOkres().

   liczProwizje(warunki, obrotPrzed, kwotaFaktury) -> { kwota, stawka, rozbicie }
   liczOkres(warunki, faktury)                     -> { pozycje, suma, obrot, stawkaEfektywna }
   ============================================================================ */

(function (global) {
  "use strict";

  var STAWKA_DOMYSLNA = 20;

  function posortowaneProgi(warunki) {
    return (warunki.progi || []).slice().sort(function (a, b) { return a.od - b.od; });
  }

  function stawkaDla(progi, suma) {
    var s = progi[0].st;
    for (var i = 0; i < progi.length; i++) if (suma >= progi[i].od) s = progi[i].st;
    return s;
  }

  function bezProgow(warunki) {
    return warunki.sposob === "stala" || !warunki.progi || !warunki.progi.length;
  }

  /* Prowizja od jednej faktury, przy znanym obrocie narastajacym sprzed niej. */
  function liczProwizje(warunki, obrotPrzed, kwotaFaktury) {
    if (bezProgow(warunki)) {
      var stala = warunki.stala != null ? warunki.stala : STAWKA_DOMYSLNA;
      return { kwota: kwotaFaktury * stala / 100, stawka: stala,
               rozbicie: [{ kwota: kwotaFaktury, st: stala }] };
    }

    var progi = posortowaneProgi(warunki);

    /* Model A i B: jedna stawka dla calego obrotu, wyznaczona po jego sumie */
    if (warunki.sposob === "od_calosci") {
      var st = stawkaDla(progi, obrotPrzed + kwotaFaktury);
      return { kwota: kwotaFaktury * st / 100, stawka: st,
               rozbicie: [{ kwota: kwotaFaktury, st: st }] };
    }

    /* Model C: kazdy kawalek obrotu rozliczany stawka swojego progu */
    var pozycja = obrotPrzed, zostalo = kwotaFaktury, suma = 0, rozbicie = [];
    while (zostalo > 0.005) {
      var stawka = stawkaDla(progi, pozycja);
      var nastepny = progi.filter(function (p) { return p.od > pozycja; })[0];
      var doGranicy = nastepny ? Math.min(zostalo, nastepny.od - pozycja) : zostalo;
      suma += doGranicy * stawka / 100;
      rozbicie.push({ kwota: doGranicy, st: stawka });
      pozycja += doGranicy;
      zostalo -= doGranicy;
    }
    return { kwota: suma, stawka: kwotaFaktury ? (suma / kwotaFaktury * 100) : 0, rozbicie: rozbicie };
  }

  /* Rozliczenie calego okresu. Modele A i B wymagaja tej funkcji, bo stawka
     zalezy od sumy obrotu, a nie od kolejnosci wystawiania faktur. */
  function liczOkres(warunki, faktury) {
    var obrot = faktury.reduce(function (s, f) { return s + (f.kwota || 0); }, 0);

    if (bezProgow(warunki)) {
      var stala = warunki.stala != null ? warunki.stala : STAWKA_DOMYSLNA;
      var pozStale = faktury.map(function (f) {
        return { kwota: f.kwota, stawka: stala, prowizja: f.kwota * stala / 100,
                 rozbicie: [{ kwota: f.kwota, st: stala }] };
      });
      return { pozycje: pozStale, suma: pozStale.reduce(function (s, p) { return s + p.prowizja; }, 0),
               obrot: obrot, stawkaEfektywna: stala };
    }

    var progi = posortowaneProgi(warunki);

    if (warunki.sposob === "od_calosci") {
      var st = stawkaDla(progi, obrot);
      var pozCalosc = faktury.map(function (f) {
        return { kwota: f.kwota, stawka: st, prowizja: f.kwota * st / 100,
                 rozbicie: [{ kwota: f.kwota, st: st }] };
      });
      return { pozycje: pozCalosc, suma: pozCalosc.reduce(function (s, p) { return s + p.prowizja; }, 0),
               obrot: obrot, stawkaEfektywna: st };
    }

    var narastajaco = 0;
    var pozycje = faktury.map(function (f) {
      var r = liczProwizje(warunki, narastajaco, f.kwota || 0);
      narastajaco += (f.kwota || 0);
      return { kwota: f.kwota, stawka: r.stawka, prowizja: r.kwota, rozbicie: r.rozbicie };
    });
    var suma = pozycje.reduce(function (s, p) { return s + p.prowizja; }, 0);
    return { pozycje: pozycje, suma: suma, obrot: obrot,
             stawkaEfektywna: obrot ? suma / obrot * 100 : 0 };
  }

  global.liczProwizje = liczProwizje;
  global.liczOkres = liczOkres;
})(window);
