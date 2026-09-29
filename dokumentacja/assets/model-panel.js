/* ============================================================================
   Panel szczegolow tabeli dla diagramu (sekcje/18-model-tabel.html).
   Pokazuje opis, kolumny, relacje, indeksy i widoki jednej tabeli.
   Dane pochodza z window.MODEL_DANYCH (tools/build-model.mjs).
   ============================================================================ */

(function (global) {
  "use strict";

  var OPIS_USUWANIA = { "CASCADE": "usunięcie rodzica usuwa te wiersze", "SET NULL": "usunięcie rodzica czyści pole",
                        "NO ACTION": "rodzica nie da się usunąć, dopóki są powiązane wiersze",
                        "RESTRICT": "rodzica nie da się usunąć, dopóki są powiązane wiersze" };

  function esc(t) {
    return String(t == null ? "" : t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function link(nazwa, kolumna) {
    return '<span class="mt-link" data-tabela="' + esc(nazwa) + '">' + esc(nazwa) +
           (kolumna ? "." + esc(kolumna) : "") + "</span>";
  }

  function znaczniki(k) {
    return (k.pk ? '<span class="mt-znak pk">PK</span>' : "") +
           (k.fk ? '<span class="mt-znak fk">FK</span>' : "") +
           (k.wymagana && !k.pk ? '<span class="mt-znak nn">wymagane</span>' : "");
  }

  function szczegolKolumny(k) {
    var czesci = [];
    if (k.fk) czesci.push("&rarr; " + link(k.fk.tabela, k.fk.kolumna) + ' <span class="mt-drobne">(' +
                          esc(OPIS_USUWANIA[k.fk.usuwanie] || k.fk.usuwanie) + ")</span>");
    if (k.wartosci.length) czesci.push("dozwolone: " + k.wartosci.map(function (w) { return "<code>" + esc(w) + "</code>"; }).join(" / "));
    else if (k.check) czesci.push('<span class="ogr">CHECK ' + esc(k.check) + "</span>");
    if (k.domyslnie != null) czesci.push("domyślnie <code>" + esc(k.domyslnie) + "</code>");
    if (k.komentarz) czesci.push(esc(k.komentarz));
    if (k.uwagi) czesci.push(k.uwagi);   /* HTML z docs/03, juz oczyszczony przez generator */
    return czesci.map(function (c) { return "<div>" + c + "</div>"; }).join("");
  }

  function tabelaKolumn(t) {
    var grupa = null;
    var wiersze = t.kolumny.map(function (k) {
      var naglowek = "";
      if (k.grupa && k.grupa !== grupa) {
        naglowek = '<tr class="grupa"><td colspan="3">' + esc(k.grupa) + "</td></tr>";
        grupa = k.grupa;
      }
      return naglowek + '<tr id="kol-' + esc(k.nazwa) + '"><td class="nazwa">' + esc(k.nazwa) + "<br>" + znaczniki(k) +
             '</td><td class="typ">' + esc(k.typ) + '</td><td class="szczegol">' + szczegolKolumny(k) + "</td></tr>";
    });
    return '<table class="mt-kolumny"><thead><tr><th>Kolumna</th><th>Typ</th><th>Znaczenie i ograniczenia</th></tr></thead><tbody>' +
           wiersze.join("") + "</tbody></table>";
  }

  function relacje(t, model) {
    var wych = t.kolumny.filter(function (k) { return k.fk; }).map(function (k) {
      return "<li><code>" + esc(k.nazwa) + "</code> &rarr; " + link(k.fk.tabela, k.fk.kolumna) + "</li>";
    });
    var przych = [];
    model.tabele.forEach(function (inna) {
      inna.kolumny.forEach(function (k) {
        if (k.fk && k.fk.tabela === t.nazwa) przych.push("<li>" + link(inna.nazwa, k.nazwa) + "</li>");
      });
    });
    return "<h4>Wskazuje na (" + wych.length + ")</h4>" +
      (wych.length ? '<ul class="mt-lista">' + wych.join("") + "</ul>" : '<p class="mt-drobne">Brak kluczy obcych.</p>') +
      "<h4>Wskazywana przez (" + przych.length + ")</h4>" +
      (przych.length ? '<ul class="mt-lista">' + przych.join("") + "</ul>" : '<p class="mt-drobne">Żadna tabela jej nie wskazuje.</p>');
  }

  function opis(t) {
    var html = "";
    if (t.opis) html += '<p class="mt-opis"><b>W schemacie:</b> ' + esc(t.opis) + "</p>";
    t.akapity.forEach(function (a) {
      html += a.cytat ? '<div class="mt-cytat">' + a.html + "</div>" : '<p class="mt-opis">' + a.html + "</p>";
    });
    return html || '<p class="mt-drobne">Tabela nie ma jeszcze opisu w dokumentacji.</p>';
  }

  function dodatki(t) {
    var html = "";
    if (t.ograniczenia.length) {
      html += "<h4>Ograniczenia tabeli</h4><ul class=\"mt-lista\">" +
        t.ograniczenia.map(function (o) { return "<li><code>" + esc(o) + "</code></li>"; }).join("") + "</ul>";
    }
    html += "<h4>Indeksy (" + t.indeksy.length + ")</h4>" + (t.indeksy.length
      ? '<ul class="mt-lista">' + t.indeksy.map(function (i) {
          return "<li><code>" + esc(i.nazwa) + "</code> na " + i.kolumny.map(esc).join(", ") + (i.unikalny ? " (unikalny)" : "") + "</li>";
        }).join("") + "</ul>"
      : '<p class="mt-drobne">Tylko klucz główny.</p>');
    html += "<h4>Widoki liczące z tej tabeli (" + t.widoki.length + ")</h4>" + (t.widoki.length
      ? '<ul class="mt-lista">' + t.widoki.map(function (w) { return "<li><code>" + esc(w) + "</code> w <code>views.sql</code></li>"; }).join("") + "</ul>"
      : '<p class="mt-drobne">Żaden widok z niej nie korzysta.</p>');
    return html;
  }

  function pokaz(t, model, naWybor) {
    var grupa = model.grupy.filter(function (g) { return g.nr === t.grupa; })[0];
    var el = document.getElementById("mtPanel");
    el.innerHTML =
      "<h2>" + esc(t.nazwa) + "</h2>" +
      (t.tytul ? '<div class="mt-tytul">' + t.tytul + "</div>" : "") +
      '<div class="mt-chipy"><span class="mt-chip">' + esc(grupa ? grupa.nr + ". " + grupa.nazwa : "") + "</span>" +
      '<span class="mt-chip">' + t.kolumny.length + " kolumn</span>" +
      '<span class="mt-chip">' + t.wierszy + " wierszy w bazie startowej</span></div>" +
      "<h4>Opis</h4>" + opis(t) +
      "<h4>Kolumny</h4>" + tabelaKolumn(t) +
      relacje(t, model) + dodatki(t);
    el.scrollTop = 0;
    el.querySelectorAll(".mt-link").forEach(function (a) {
      a.addEventListener("click", function () { naWybor(a.getAttribute("data-tabela")); });
    });
  }

  global.ModelPanel = { pokaz: pokaz };
})(window);
