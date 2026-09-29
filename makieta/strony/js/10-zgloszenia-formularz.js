/* Zgloszenia: formularz nowego wpisu, filtry i odswiezanie (tylko deklaracje) */

function dzisiaj() {
  var d = new Date(), p = function (n) { return String(n).padStart(2, "0"); };
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
}

function odswiezTyp() {
  var s = document.getElementById("nPodmiot");
  document.getElementById("nTyp").value =
    s.value === "Instytucja" ? "Instytucja szkoleniowa" : "Klient końcowy";
}

function przygotujFormularz() {
  var opcje = '<optgroup label="Instytucje szkoleniowe">' +
    DB.INSTYTUCJE.map(function (i) { return '<option value="Instytucja">' + esc(i.nazwa) + "</option>"; }).join("") +
    '</optgroup><optgroup label="Klienci końcowi">' +
    DB.KLIENCI.slice(0, 60).map(function (k) { return '<option value="Klient">' + esc(k.nazwa) + "</option>"; }).join("") +
    "</optgroup>";
  document.getElementById("nPodmiot").innerHTML = opcje;

  /* Autor domyslnie = zalogowany (z sesji), pole edytowalne (D-121) */
  var pracownicy = DB.UZYTKOWNICY.filter(function (u) {
    return u.rola === "Administrator" || u.rola === "Pracownik LDIT";
  });
  var domyslnyAutor = Auth.sesja().imie;
  document.getElementById("nAutor").innerHTML = pracownicy.map(function (u) {
    return '<option' + (u.imie === domyslnyAutor ? " selected" : "") + ">" + esc(u.imie) + "</option>";
  }).join("");
  document.getElementById("nData").value = dzisiaj();
  document.getElementById("nPodmiot").addEventListener("change", odswiezTyp);
}

function dodaj() {
  var s = document.getElementById("nPodmiot");
  var powod = document.getElementById("nPowod").value.trim();
  var opis = document.getElementById("nOpis").value.trim();
  if (!powod || !opis) {
    document.getElementById("wynikDodania").innerHTML =
      '<div class="note warn mt16 mb0">Powód i opis są wymagane. Zgłoszenie bez opisu jest bezużyteczne po roku.</div>';
    return;
  }
  Store.insert("zgloszenia", {
    data: dzisiaj(),
    podmiot: s.options[s.selectedIndex].text,
    typ: s.value,
    powod: powod,
    opis: opis,
    autor: document.getElementById("nAutor").value,
    waga: document.getElementById("nWaga").value
  }, "ZG-");
  document.getElementById("nPowod").value = "";
  document.getElementById("nOpis").value = "";
  document.getElementById("wynikDodania").innerHTML =
    '<div class="note mt16 mb0" style="border-left-color:var(--pos-ink);background:var(--pos-bg)">' +
    "<b>Zgłoszenie zapisane w bazie.</b> Historia podmiotu przeliczyła się na liście powyżej.</div>";
  window.scrollTo(0, 0);
  /* odswiez() wywola sie przez zdarzenie db:changed */
}

function podepnijFiltry() {
  Array.prototype.forEach.call(document.querySelectorAll(".chip"), function (c) {
    c.addEventListener("click", function () {
      Array.prototype.forEach.call(document.querySelectorAll(".chip"), function (x) { x.classList.remove("on"); });
      c.classList.add("on");
      STAN_10.filtrTyp = c.dataset.typ;
      renderLista();
    });
  });
  document.getElementById("szukaj").addEventListener("input", renderLista);
  document.getElementById("fWaga").addEventListener("change", renderLista);
}

function odswiez() { renderKpi(); renderLista(); renderPowracajace(); }
