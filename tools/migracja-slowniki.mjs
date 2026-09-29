/* ============================================================================
   Slowniki i dane pomocnicze bazy startowej: progi dofinansowania, rocznik
   migracji, zakladki lat, szkoleniowcy, podsumowania historyczne.
   ============================================================================ */

/* Progi dofinansowania: wartosci domyslne z warsztatu, wersjonowane data (D-131).
   90/10 dla mikro, 70/30 dla pozostalych. Sa edytowalne, wiec trafiaja do tabeli,
   a nie do kodu. */
export function progiDofinansowaniaRows() {
  const od = "2020-01-01";
  return [
    { id: "PD-01", wielkosc: "mikro",   procent_dofinansowania: 90, obowiazuje_od: od, obowiazuje_do: null },
    { id: "PD-02", wielkosc: "mały",    procent_dofinansowania: 70, obowiazuje_od: od, obowiazuje_do: null },
    { id: "PD-03", wielkosc: "średni",  procent_dofinansowania: 70, obowiazuje_od: od, obowiazuje_do: null },
    { id: "PD-04", wielkosc: "duży",    procent_dofinansowania: 70, obowiazuje_od: od, obowiazuje_do: null },
    { id: "PD-05", wielkosc: "inny",    procent_dofinansowania: 70, obowiazuje_od: od, obowiazuje_do: null }
  ];
}

/* Do bazy trafiaja wylacznie wnioski z tych rocznikow. W tescie migrujemy
   tylko rok 2026 (D-160), wnioski z 2025 nie sa przenoszone. */
export const ROCZNIKI_MIGROWANE = ["2026"];

export function czyMigrowany(wniosek) {
  return ROCZNIKI_MIGROWANE.includes(String(wniosek.rok));
}

/* Zakladki roczne Dofinansowan (D-159). Zakladka 2025 istnieje, ale jest pusta,
   2027 czeka na nowy rok. */
export function lataZestawienRows() {
  const kto = "Bartłomiej Olejnik";
  return [
    { rok: "2025", opis: "Wniosków z 2025 nie przenosimy (D-160). Na dashboard trafiają same podsumowania liczbowe (D-175).",
      utworzono: "2026-09-29", utworzyl: kto },
    { rok: "2026", opis: "Rok bieżący. Dane przeniesione z Excela w ramach testu (D-160).",
      utworzono: "2026-09-29", utworzyl: kto },
    { rok: "2027", opis: "Zakładka przygotowana na nowy rok. Pierwszy wniosek dostanie numer klienta 1 (D-112).",
      utworzono: "2026-09-29", utworzyl: kto }
  ];
}

/* Szkoleniowcy instytucji (D-167): deterministycznie od 2 do 4 na instytucje */
const IMIONA = ["Anna", "Piotr", "Katarzyna", "Tomasz", "Magdalena", "Marcin", "Joanna", "Paweł"];
const NAZWISKA = ["Nowak", "Kowalczyk", "Wiśniewska", "Zieliński", "Wójcik", "Kamiński", "Lewandowska", "Dąbrowski"];
const SPECJALIZACJE = ["BHP", "Kadry i płace", "Obsługa wózków", "Excel i raportowanie", "Pierwsza pomoc", "Sprzedaż"];
const MIN_SZKOLENIOWCOW = 2, ZAKRES_SZKOLENIOWCOW = 3;

export function szkoleniowcyRows(instytucje) {
  const out = [];
  instytucje.forEach((inst, ii) => {
    const ile = MIN_SZKOLENIOWCOW + (ii % ZAKRES_SZKOLENIOWCOW);
    for (let n = 0; n < ile; n++) {
      const k = ii * 3 + n;
      const imie = IMIONA[k % IMIONA.length], nazwisko = NAZWISKA[(k * 5) % NAZWISKA.length];
      out.push({
        id: "SZK-" + String(out.length + 1).padStart(3, "0"), instytucja_id: inst.id, imie, nazwisko,
        telefon: "+48 600 " + String(100 + k).padStart(3, "0") + " " + String(200 + ii).padStart(3, "0"),
        email: (imie[0] + "." + nazwisko).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .replace(/ł/g, "l") + "@" + (inst.skrot || inst.id).toLowerCase().replace(/[^a-z0-9]/g, "") + ".pl",
        specjalizacja: SPECJALIZACJE[k % SPECJALIZACJE.length], aktywny: 1
      });
    }
  });
  return out;
}

/* Podsumowania lat nieprzenoszonych (D-129, D-160, D-175). Z wnioskow 2025
   zostaja wylacznie liczby per instytucja, same wnioski nie trafiaja do bazy. */
export function podsumowaniaRows(wnioskiZrodlowe) {
  const suma = {};
  const dodaj = (rok, inst, miara, wartosc) => {
    const k = rok + "|" + inst + "|" + miara;
    suma[k] = suma[k] || { rok, instytucja_id: inst, miara, wartosc: 0 };
    suma[k].wartosc += wartosc;
  };
  wnioskiZrodlowe.filter((w) => !czyMigrowany(w)).forEach((w) => {
    if (w.status_skladania === "Złożony") dodaj(w.rok, w.instytucja_id, "wnioski_zlozone", 1);
    if (w.status_decyzji === "Pozytywna") {
      dodaj(w.rok, w.instytucja_id, "wnioski_pozytywne", 1);
      dodaj(w.rok, w.instytucja_id, "obrot", w.koszt_calkowity || 0);
    }
  });
  return Object.values(suma).map((r, i) => ({
    id: "PH-" + String(i + 1).padStart(3, "0"), ...r,
    wartosc: Math.round(r.wartosc * 100) / 100, zrodlo: "Excel " + r.rok + ", podsumowanie"
  }));
}
