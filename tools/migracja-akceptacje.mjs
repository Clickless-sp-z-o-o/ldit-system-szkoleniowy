/* ============================================================================
   Dane startowe akceptacji: szczegoly formularzy zgloszeniowych (D-223)
   i przykladowe propozycje zmian od instytucji (D-224).

   Wartosci sa wyprowadzane z istniejacych danych (nazwa firmy, instytucja),
   zeby baza startowa budowala sie powtarzalnie.
   ============================================================================ */

const DATA_PROPOZYCJI = "2026-09-29 14:10";

function slug(tekst) {
  return String(tekst || "").toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "").slice(0, 16) || "firma";
}

/* Kontakt z formularza: e-mail i telefon firmy, ktora sie zglosila */
export function szczegolyFormularza(k, i) {
  return {
    email: "biuro@" + slug(k.firma) + ".pl",
    telefon: "600 " + String(100 + i * 37).slice(-3) + " " + String(200 + i * 53).slice(-3),
    uwagi: i % 2 === 0 ? "Prośba o kontakt po 15:00." : null
  };
}

/* Dwie propozycje od pierwszej instytucji z kontem: zmiana wlasnych danych
   i zmiana danych kontaktowych jej klienta */
export function propozycjeZmianRows(instytucje, klienci, uzytkownicy) {
  const konto = uzytkownicy.find((u) => u.rola_id === "is" && u.instytucja_id);
  if (!konto) return [];
  const inst = instytucje.find((i) => i.id === konto.instytucja_id);
  const klient = klienci.find((k) => k.instytucja_id === inst.id);
  const wiersze = [{
    id: "PZ-0001", instytucja_id: inst.id, tabela: "instytucje", rekord_id: inst.id,
    zmiany: JSON.stringify({ telefon: { przed: inst.telefon || null, po: "58 555 20 20" } }),
    uzasadnienie: "Nowy numer recepcji.", zglosil_id: konto.id, zgloszono: DATA_PROPOZYCJI, status: "oczekuje"
  }];
  if (klient) {
    wiersze.push({
      id: "PZ-0002", instytucja_id: inst.id, tabela: "klienci", rekord_id: klient.id,
      zmiany: JSON.stringify({ osoba_kontaktowa: { przed: klient.osoba_kontaktowa || null, po: "Anna Zielińska" } }),
      uzasadnienie: "Zmiana osoby po stronie klienta.", zglosil_id: konto.id, zgloszono: DATA_PROPOZYCJI, status: "oczekuje"
    });
  }
  return wiersze;
}
