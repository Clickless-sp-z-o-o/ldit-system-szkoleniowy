/* ============================================================================
   Start strony makiety.

   Baza SQLite laduje sie asynchronicznie (WebAssembly), a kod stron jest pisany
   tak, jakby dane byly dostepne od razu. Boot rozwiazuje to tak: skrypt strony
   siedzi w bloku <script type="text/kfs-strona"> i zostaje uruchomiony dopiero,
   gdy baza jest gotowa. Uruchomienie idzie przez eval w zasiegu globalnym, wiec
   funkcje strony nadal sa globalne i atrybuty onclick w HTML dzialaja.

   Przy okazji boot pilnuje bramy dostepu: strona deklaruje swoj modul
   atrybutem data-modul, a boot sprawdza w bazie, czy zalogowana rola ma do
   niego prawo (D-36). Brak sesji na stronie otwartej bezposrednio przenosi
   na ekran logowania.

   Uzycie na stronie modulu:
     <script src="../assets/boot.js" data-modul="dofin"></script>
     <script type="text/kfs-strona"> ...kod strony... </script>
   ============================================================================ */

(function (global) {
  "use strict";

  var wlasnySkrypt = document.currentScript;
  var modul = wlasnySkrypt ? wlasnySkrypt.getAttribute("data-modul") : null;
  var wymagaSesji = !wlasnySkrypt || wlasnySkrypt.getAttribute("data-publiczna") !== "tak";
  var katalog = wlasnySkrypt ? wlasnySkrypt.src.replace(/assets\/boot\.js.*$/, "") : "";

  function wDomu() { return global.top === global.self; }

  function poDom(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function bladStartu(tresc) {
    poDom(function () {
      document.body.innerHTML =
        '<div class="blokada-dostepu"><div class="blokada-ikona">&#9888;</div>' +
        '<h2>Baza danych nie wstala</h2><p>' + tresc + '</p></div>';
    });
  }

  function uruchomSkryptyStrony() {
    var bloki = document.querySelectorAll('script[type="text/kfs-strona"]');
    for (var i = 0; i < bloki.length; i++) {
      var kod = bloki[i].textContent + "\n//# sourceURL=" + location.pathname + "#strona" + i;
      /* eval posredni: deklaracje var i function trafiaja do zasiegu globalnego,
         dzieki czemu atrybuty onclick w HTML widza funkcje strony */
      (0, eval)(kod);
    }
  }

  var czekajacy = [];
  var gotowe = false;

  /* KFS.gotowe(fn) dla kodu, ktory nie siedzi w bloku kfs-strona (np. powloka) */
  function gotoweWywolaj(fn) {
    if (gotowe) fn();
    else czekajacy.push(fn);
  }

  if (!global.KFS || !global.KFS.gotowa) {
    bladStartu("Brak assets/sqlite.js. Sprawdz kolejnosc skryptow na stronie.");
    return;
  }

  global.KFS.gotowe = gotoweWywolaj;

  global.KFS.gotowa
    .then(function () {
      if (global.DB && global.DB.przebuduj) global.DB.przebuduj();
      return new Promise(function (res) { poDom(res); });
    })
    .then(function () {
      var Auth = global.Auth;

      if (wymagaSesji && Auth && !Auth.zalogowany()) {
        if (wDomu()) {
          global.location.replace(katalog + "login.html");
          return;
        }
        Auth.pokazBlokade("Sesja wygasla",
          "Zaloguj sie ponownie, zeby zobaczyc te strone.");
        return;
      }

      if (modul && Auth && !Auth.widziModul(modul)) {
        var s = Auth.sesja();
        Auth.pokazBlokade("Brak dostepu",
          "Rola <b>" + s.rola_nazwa + "</b> nie ma tego modulu w swoim zakresie. " +
          "Uprawnienia nadawane sa per rola, nie per osoba (D-35, D-36).");
        return;
      }

      gotowe = true;
      uruchomSkryptyStrony();
      czekajacy.forEach(function (fn) { fn(); });
      czekajacy.length = 0;
      document.documentElement.classList.add("kfs-gotowa");
    })
    .catch(function (e) {
      bladStartu(String(e && e.message ? e.message : e));
    });
})(window);
