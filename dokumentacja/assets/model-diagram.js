/* ============================================================================
   Interaktywny diagram tabel (sekcje/18-model-tabel.html).

   Tabele ukladane sa w kolumnach wg grup ze schema.sql, linie to klucze obce
   (od kolumny FK do klucza tabeli nadrzednej). Klik w tabele otwiera panel
   szczegolow (assets/model-panel.js). Przeciaganie przesuwa, kolko przybliza.
   ============================================================================ */

(function (global) {
  "use strict";

  var M = global.MODEL_DANYCH;
  if (!M) throw new Error("Brak window.MODEL_DANYCH. Uruchom node tools/build-model.mjs");

  var SZER = 280, NAGL = 38, WIERSZ = 19, ODSTEP_X = 120, ODSTEP_Y = 28, MAX_WYS = 1450, MARGINES = 50;
  var TYTUL_GRUPY = 40, PETLA = 70, PROG_PRZECIAGNIECIA = 4;
  var SKALA_MIN = 0.15, SKALA_MAX = 3, KROK_ZOOM = 1.2;
  var KOLORY = ["#dbeafe", "#dcfce7", "#fef3c7", "#fce7f3", "#e0e7ff", "#f1f5f9"];

  var svg = document.getElementById("mtSvg");
  var canvas = document.getElementById("mtCanvas");
  var stan = { tylkoKlucze: false, wybrana: null, szukaj: "", poz: {}, widok: { x: 0, y: 0, s: 1 }, zakres: null };

  function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function tabela(nazwa) { return M.tabele.filter(function (t) { return t.nazwa === nazwa; })[0]; }
  function kolorGrupy(nr) { return KOLORY[(nr - 1 + KOLORY.length) % KOLORY.length]; }

  function widoczneKolumny(t) {
    return stan.tylkoKlucze ? t.kolumny.filter(function (k) { return k.pk || k.fk; }) : t.kolumny;
  }

  /* ------------------------------ uklad ------------------------------ */

  function uloz() {
    var poz = {}, x = MARGINES, tytuly = [];
    M.grupy.forEach(function (g) {
      var y = MARGINES + TYTUL_GRUPY;
      tytuly.push({ x: x, y: MARGINES + 14, tekst: g.nr + ". " + g.nazwa, nr: g.nr });
      M.tabele.filter(function (t) { return t.grupa === g.nr; }).forEach(function (t) {
        var kol = widoczneKolumny(t);
        var ukryte = t.kolumny.length - kol.length;
        var h = NAGL + (kol.length + (ukryte ? 1 : 0)) * WIERSZ + 8;
        if (y + h > MAX_WYS && y > MARGINES + TYTUL_GRUPY) { x += SZER + ODSTEP_X; y = MARGINES + TYTUL_GRUPY; }
        var wiersze = {};
        kol.forEach(function (k, i) { wiersze[k.nazwa] = y + NAGL + i * WIERSZ + WIERSZ / 2 + 2; });
        poz[t.nazwa] = { x: x, y: y, w: SZER, h: h, wiersze: wiersze, kol: kol, ukryte: ukryte };
        y += h + ODSTEP_Y;
      });
      x += SZER + ODSTEP_X;
    });
    stan.poz = poz;
    return tytuly;
  }

  /* ------------------------------ rysowanie ------------------------------ */

  function sciezka(a, ya, b, yb) {
    if (b.x > a.x + a.w) return "M" + (a.x + a.w) + "," + ya + " C" + (a.x + a.w + ODSTEP_X / 2) + "," + ya +
      " " + (b.x - ODSTEP_X / 2) + "," + yb + " " + b.x + "," + yb;
    if (b.x + b.w < a.x) return "M" + a.x + "," + ya + " C" + (a.x - ODSTEP_X / 2) + "," + ya +
      " " + (b.x + b.w + ODSTEP_X / 2) + "," + yb + " " + (b.x + b.w) + "," + yb;
    var p = a.x + a.w + PETLA;   /* ta sama kolumna: petla po prawej stronie */
    return "M" + (a.x + a.w) + "," + ya + " C" + p + "," + ya + " " + p + "," + yb + " " + (b.x + b.w) + "," + yb;
  }

  function linie() {
    var out = [];
    M.tabele.forEach(function (t) {
      var a = stan.poz[t.nazwa];
      t.kolumny.forEach(function (k) {
        if (!k.fk || !stan.poz[k.fk.tabela]) return;
        var b = stan.poz[k.fk.tabela];
        var ya = a.wiersze[k.nazwa] || a.y + NAGL / 2;
        var yb = b.wiersze[k.fk.kolumna || "id"] || b.y + NAGL / 2;
        out.push('<path class="mt-rel" data-od="' + t.nazwa + '" data-do="' + k.fk.tabela + '" d="' +
                 sciezka(a, ya, b, yb) + '"><title>' + esc(t.nazwa + "." + k.nazwa + " → " + k.fk.tabela) + "</title></path>");
      });
    });
    return out.join("");
  }

  function wierszKolumny(k, p, i) {
    var y = p.y + NAGL + i * WIERSZ;
    var klasa = k.pk ? "kol pk" : k.fk ? "kol fk" : "kol";
    var znak = k.pk ? '<text class="znacznik" x="' + (p.x + 10) + '" y="' + (y + 14) + '" fill="#92400e">PK</text>'
             : k.fk ? '<text class="znacznik" x="' + (p.x + 10) + '" y="' + (y + 14) + '" fill="#1e40af">FK</text>' : "";
    var trafienie = stan.szukaj && k.nazwa.indexOf(stan.szukaj) >= 0
      ? '<rect class="trafienie" x="' + (p.x + 1) + '" y="' + (y + 1) + '" width="' + (p.w - 2) + '" height="' + WIERSZ + '"/>' : "";
    return trafienie + znak + '<text class="' + klasa + '" x="' + (p.x + 32) + '" y="' + (y + 14) + '">' + esc(k.nazwa) + "</text>" +
      '<text class="typ" x="' + (p.x + p.w - 10) + '" y="' + (y + 14) + '" text-anchor="end">' + esc(k.typ) + "</text>";
  }

  function pudelko(t) {
    var p = stan.poz[t.nazwa];
    var wiersze = p.kol.map(function (k, i) { return wierszKolumny(k, p, i); }).join("");
    if (p.ukryte) {
      wiersze += '<text class="reszta" x="' + (p.x + 32) + '" y="' + (p.y + NAGL + p.kol.length * WIERSZ + 14) + '">+ ' +
                 p.ukryte + " kolumn bez kluczy</text>";
    }
    return '<g class="mt-tab" data-tabela="' + t.nazwa + '">' +
      '<rect class="ramka" x="' + p.x + '" y="' + p.y + '" width="' + p.w + '" height="' + p.h + '" rx="8"/>' +
      '<path d="M' + p.x + "," + (p.y + NAGL) + " V" + (p.y + 8) + " a8,8 0 0 1 8,-8 H" + (p.x + p.w - 8) +
      " a8,8 0 0 1 8,8 V" + (p.y + NAGL) + ' Z" fill="' + kolorGrupy(t.grupa) + '"/>' +
      '<text class="naglowek-txt" x="' + (p.x + 12) + '" y="' + (p.y + 24) + '">' + esc(t.nazwa) + "</text>" +
      '<text class="licznik" x="' + (p.x + p.w - 10) + '" y="' + (p.y + 24) + '" text-anchor="end">' + t.wierszy + " wierszy</text>" +
      wiersze + "</g>";
  }

  function rysuj() {
    var tytuly = uloz();
    var html = linie() + M.tabele.map(pudelko).join("") + tytuly.map(function (g) {
      return '<text class="mt-grupa-tytul" x="' + g.x + '" y="' + g.y + '">' + esc(g.tekst.toUpperCase()) + "</text>";
    }).join("");
    svg.innerHTML = html;
    var maxX = 0, maxY = 0;
    Object.keys(stan.poz).forEach(function (n) {
      var p = stan.poz[n];
      maxX = Math.max(maxX, p.x + p.w + PETLA); maxY = Math.max(maxY, p.y + p.h);
    });
    stan.zakres = { w: maxX + MARGINES, h: maxY + MARGINES };
    podswietl();
  }

  /* ----------------------------- podswietlanie ----------------------------- */

  function powiazane(nazwa) {
    var zbior = {}; zbior[nazwa] = true;
    svg.querySelectorAll(".mt-rel").forEach(function (l) {
      if (l.getAttribute("data-od") === nazwa) zbior[l.getAttribute("data-do")] = true;
      if (l.getAttribute("data-do") === nazwa) zbior[l.getAttribute("data-od")] = true;
    });
    return zbior;
  }

  function pasujace() {
    if (!stan.szukaj) return null;
    var zbior = {};
    M.tabele.forEach(function (t) {
      var trafia = t.nazwa.indexOf(stan.szukaj) >= 0 ||
        t.kolumny.some(function (k) { return k.nazwa.indexOf(stan.szukaj) >= 0; });
      if (trafia) zbior[t.nazwa] = true;
    });
    return zbior;
  }

  function podswietl(nadNazwa) {
    var fokus = nadNazwa || stan.wybrana;
    var zbior = fokus ? powiazane(fokus) : pasujace();
    svg.querySelectorAll(".mt-tab").forEach(function (g) {
      var n = g.getAttribute("data-tabela");
      g.classList.toggle("wybrana", n === stan.wybrana);
      g.classList.toggle("przygaszona", !!zbior && !zbior[n]);
    });
    svg.querySelectorAll(".mt-rel").forEach(function (l) {
      var dotyczy = fokus && (l.getAttribute("data-od") === fokus || l.getAttribute("data-do") === fokus);
      l.classList.toggle("aktywna", !!dotyczy);
      l.classList.toggle("przygaszona", !!zbior && !dotyczy);
    });
  }

  /* ------------------------------ widok ------------------------------ */

  function ustawWidok() {
    var r = canvas.getBoundingClientRect(), v = stan.widok;
    svg.setAttribute("viewBox", v.x + " " + v.y + " " + r.width / v.s + " " + r.height / v.s);
    document.getElementById("mtSkala").textContent = Math.round(v.s * 100) + "%";
  }

  function dopasuj() {
    var r = canvas.getBoundingClientRect();
    var s = Math.min(r.width / stan.zakres.w, r.height / stan.zakres.h);
    stan.widok = { x: 0, y: 0, s: Math.max(SKALA_MIN, Math.min(SKALA_MAX, s)) };
    ustawWidok();
  }

  function przybliz(mnoznik, px, py) {
    var r = canvas.getBoundingClientRect(), v = stan.widok;
    var cx = px == null ? r.width / 2 : px, cy = py == null ? r.height / 2 : py;
    var s = Math.max(SKALA_MIN, Math.min(SKALA_MAX, v.s * mnoznik));
    var wx = v.x + cx / v.s, wy = v.y + cy / v.s;
    stan.widok = { x: wx - cx / s, y: wy - cy / s, s: s };
    ustawWidok();
  }

  function pokazTabele(nazwa) {
    var p = stan.poz[nazwa], r = canvas.getBoundingClientRect();
    if (!p) return;
    var s = Math.max(stan.widok.s, 1);   /* przy centrowaniu tabela ma byc czytelna */
    stan.widok = { x: p.x + p.w / 2 - r.width / s / 2, y: p.y - 40 / s, s: s };
    ustawWidok();
  }

  function wybierz(nazwa, centruj) {
    var t = tabela(nazwa);
    if (!t) return;
    stan.wybrana = nazwa;
    podswietl();
    global.ModelPanel.pokaz(t, M, function (inna) { wybierz(inna, true); });
    if (centruj) pokazTabele(nazwa);
  }

  /* ------------------------------ zdarzenia ------------------------------ */

  function podlaczMysz() {
    var start = null, przesuniete = false;
    canvas.addEventListener("mousedown", function (e) {
      start = { x: e.clientX, y: e.clientY, vx: stan.widok.x, vy: stan.widok.y }; przesuniete = false;
    });
    global.addEventListener("mousemove", function (e) {
      if (!start) return;
      var dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (Math.abs(dx) + Math.abs(dy) > PROG_PRZECIAGNIECIA) { przesuniete = true; canvas.classList.add("ciagnie"); }
      if (!przesuniete) return;
      stan.widok.x = start.vx - dx / stan.widok.s; stan.widok.y = start.vy - dy / stan.widok.s;
      ustawWidok();
    });
    global.addEventListener("mouseup", function () { start = null; canvas.classList.remove("ciagnie"); });
    canvas.addEventListener("click", function (e) {
      if (przesuniete) return;
      var g = e.target.closest(".mt-tab");
      if (g) wybierz(g.getAttribute("data-tabela"), false);
    });
    canvas.addEventListener("wheel", function (e) {
      e.preventDefault();
      var r = canvas.getBoundingClientRect();
      przybliz(e.deltaY < 0 ? KROK_ZOOM : 1 / KROK_ZOOM, e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });
    svg.addEventListener("mouseover", function (e) {
      var g = e.target.closest(".mt-tab");
      if (g) podswietl(g.getAttribute("data-tabela"));
    });
    svg.addEventListener("mouseleave", function () { podswietl(); });
  }

  function podlaczPasek() {
    document.getElementById("mtWiecej").onclick = function () { przybliz(KROK_ZOOM); };
    document.getElementById("mtMniej").onclick = function () { przybliz(1 / KROK_ZOOM); };
    document.getElementById("mtDopasuj").onclick = dopasuj;
    document.getElementById("mtKlucze").onchange = function (e) { stan.tylkoKlucze = e.target.checked; rysuj(); };
    var pole = document.getElementById("mtSzukaj");
    pole.addEventListener("input", function () {
      stan.szukaj = pole.value.trim().toLowerCase(); stan.wybrana = null; rysuj();
    });
    pole.addEventListener("keydown", function (e) {
      var z = pasujace();
      if (e.key === "Enter" && z) { var pierwsza = Object.keys(z)[0]; if (pierwsza) wybierz(pierwsza, true); }
    });
    global.addEventListener("resize", ustawWidok);
  }

  function legenda() {
    document.getElementById("mtLegenda").innerHTML = M.grupy.map(function (g) {
      return '<div><i style="background:' + kolorGrupy(g.nr) + ';border:1px solid #cbd5e1"></i>' + esc(g.nr + ". " + g.nazwa) + "</div>";
    }).join("") + '<div style="margin-top:4px"><b style="color:#92400e">PK</b> klucz główny &middot; <b style="color:#1e40af">FK</b> klucz obcy</div>';
    var kolumn = M.tabele.reduce(function (s, t) { return s + t.kolumny.length; }, 0);
    document.getElementById("mtMeta").textContent = M.tabele.length + " tabel, " + kolumn + " kolumn, " +
      M.widoki.length + " widoki · stan schematu z " + M.wygenerowano;
  }

  legenda();
  podlaczMysz();
  podlaczPasek();
  rysuj();
  dopasuj();

  var zAdresu = decodeURIComponent((global.location.hash || "").slice(1));
  if (zAdresu) wybierz(zAdresu, true);
})(window);
