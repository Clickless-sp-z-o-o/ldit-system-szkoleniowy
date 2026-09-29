/* ============================================================================
   Zamiana fragmentow Markdowna z docs/*.md na HTML klikalnej dokumentacji.
   Wspolna dla generatorow: build-rejestry.mjs i build-model.mjs.
   ============================================================================ */

export function escapuj(t) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* Odwołania do rejestrów dostają styl referencji. Pozycje od D-121 i od P-55
   są oznaczane jako nowe, tak samo jak w pozostałych sekcjach strony. */
export function referencje(t) {
  return t.replace(/\[?\b([DPR])-(\d{2,3})\b\]?/g, (_, typ, nr) => {
    const numer = parseInt(nr, 10);
    const klasa = typ === "P" ? "ref p"
      : typ === "R" ? "ref"
      : numer >= 121 ? "ref new" : "ref";
    return '<span class="' + klasa + '">' + typ + "-" + nr + "</span>";
  });
}

export function inline(t) {
  return referencje(escapuj(t))
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
}
