-- ============================================================================
-- Widoki: reguly biznesowe zapisane w SQL.
-- Wszystko, co w dokumentacji jest "polem wyliczanym", jest tutaj wyrazone
-- jako zapytanie. Dzieki temu regula ma jedno miejsce, a nie kopie w kazdym
-- ekranie makiety. Przy przepisaniu na Postgresa te widoki przenosza sie
-- bez zmian i staja sie warstwa domenowa aplikacji.
-- ============================================================================

-- --------------------------------------------------------------------------
-- Warunki prowizyjne obowiazujace dzisiaj (D-22, D-162). Wersja zaplanowana
-- na przyszlosc nie jest jeszcze aktywna, a zamknieta juz nie jest.
-- --------------------------------------------------------------------------
CREATE VIEW v_warunki_aktywne AS
SELECT w.*
FROM warunki_prowizyjne w
WHERE w.obowiazuje_od <= date('now')
  AND (w.obowiazuje_do IS NULL OR w.obowiazuje_do = '' OR w.obowiazuje_do >= date('now'));

-- --------------------------------------------------------------------------
-- Finanse wniosku. Realizuje D-131, D-132, D-134, D-135, D-19, D-79, D-171 - D-174.
--
-- Kolejnosc wyliczen:
--   1. wielkosc przedsiebiorstwa: nadpisanie per wniosek, inaczej z klienta (D-132)
--   2. prog dofinansowania: wybrany recznie we wniosku albo dobrany regula
--      z wielkosci i daty wniosku (D-131, D-171)
--   3. koszt calkowity: koszt z doplata minus doplata dodatkowa (D-134)
--   4. przyznano: koszt calkowity razy procent progu, tylko decyzja pozytywna (D-135)
--   5. wklad wlasny: reszta, koszt minus przyznano, wiec rownanie zawsze sie
--      spina (D-172, D-173, D-184)
--   6. podstawa prowizji: koszt z doplata, gdy doplata jest na fakturze KFS,
--      inaczej koszt calkowity bez doplaty (D-64, D-174)
--
-- Kazde pole wyliczane wystepuje w dwoch wariantach:
--   *_wyliczony/e - wartosc z reguly, liczona zawsze, nawet gdy regula wylaczona
--   *_efektywny/e - wartosc pokazywana uzytkownikowi (regula albo reczne nadpisanie)
-- To jest techniczna realizacja zasady "Przywroc regule" (D-19).
-- --------------------------------------------------------------------------
CREATE VIEW v_wniosek_finanse AS
WITH baza AS (
  SELECT
    w.*,
    COALESCE(w.wielkosc_przedsiebiorstwa, k.wielkosc_przedsiebiorstwa) AS wielkosc_ef,
    (SELECT p.id FROM progi_dofinansowania p
      WHERE p.wielkosc = COALESCE(w.wielkosc_przedsiebiorstwa, k.wielkosc_przedsiebiorstwa)
        AND p.obowiazuje_od <= COALESCE(w.data_wniosku, w.data_wplyniecia_formularza, '9999-12-31')
        AND (p.obowiazuje_do IS NULL OR p.obowiazuje_do >= COALESCE(w.data_wniosku, '0001-01-01'))
      ORDER BY p.obowiazuje_od DESC LIMIT 1) AS prog_wyliczony_id,
    ROUND(COALESCE(w.koszt_calkowity_z_doplata, 0) - COALESCE(w.kwota_doplaty_dodatkowej, 0), 2)
      AS koszt_wyliczony
  FROM wnioski w
  JOIN klienci k ON k.id = w.klient_id
),
progi AS (
  SELECT b.*,
    CASE WHEN b.prog_regula_aktywna = 1 THEN b.prog_wyliczony_id ELSE b.prog_dofinansowania_id END
      AS prog_efektywny_id,
    CASE WHEN b.koszt_regula_aktywna = 1 THEN b.koszt_wyliczony ELSE b.koszt_calkowity END
      AS koszt_efektywny
  FROM baza b
),
przyznane AS (
  SELECT g.*,
    COALESCE(pd.procent_dofinansowania, 70) AS procent,
    CASE WHEN g.status_decyzji = 'Pozytywna' AND g.koszt_efektywny IS NOT NULL
         THEN ROUND(g.koszt_efektywny * COALESCE(pd.procent_dofinansowania, 70) / 100, 2)
    END AS przyznano_wyliczone
  FROM progi g
  LEFT JOIN progi_dofinansowania pd ON pd.id = g.prog_efektywny_id
),
koncowe AS (
  SELECT z.*,
    CASE WHEN z.przyznano_regula_aktywna = 1 THEN z.przyznano_wyliczone ELSE z.przyznano END
      AS przyznano_efektywne
  FROM przyznane z
)
SELECT
  c.id AS wniosek_id,
  c.klient_id,
  c.instytucja_id,
  c.rok,
  c.status_decyzji,
  c.wielkosc_ef AS wielkosc,
  c.prog_wyliczony_id,
  c.prog_efektywny_id,
  c.prog_regula_aktywna,
  c.procent AS procent_dofinansowania,

  c.koszt_calkowity_z_doplata,
  c.kwota_doplaty_dodatkowej,
  c.koszt_wyliczony AS koszt_calkowity_wyliczony,
  c.koszt_efektywny AS koszt_calkowity_efektywny,

  c.przyznano_wyliczone,
  c.przyznano_efektywne,

  -- Wklad wlasny jako reszta: jeden skladnik rownania nie jest osobno zaokraglany (D-184)
  CASE WHEN c.przyznano_efektywne IS NOT NULL
       THEN ROUND(c.koszt_efektywny - c.przyznano_efektywne, 2) END AS wklad_wlasny_wyliczony,
  CASE WHEN c.wklad_regula_aktywna = 1
       THEN CASE WHEN c.przyznano_efektywne IS NOT NULL
                 THEN ROUND(c.koszt_efektywny - c.przyznano_efektywne, 2) END
       ELSE c.wklad_wlasny
  END AS wklad_wlasny_efektywny,
  c.wklad_regula_aktywna,

  -- Suma warunkowa: tylko uczestnicy zakwalifikowani (D-61, D-79)
  COALESCE((
    SELECT SUM(u.kwota) FROM uczestnicy u
    WHERE u.wniosek_id = c.id AND u.status_kwalifikacji = 'zakwalifikowany'
  ), 0) AS calkowita_wartosc_szkolenia,

  (SELECT COUNT(*) FROM uczestnicy u WHERE u.wniosek_id = c.id) AS uczestnikow,
  (SELECT COUNT(*) FROM uczestnicy u WHERE u.wniosek_id = c.id
     AND u.status_kwalifikacji = 'zakwalifikowany') AS uczestnikow_zakwalifikowanych,

  c.koszt_regula_aktywna,
  c.przyznano_regula_aktywna,
  c.przyznano AS przyznano_zapisane,
  c.prowizja_regula_aktywna,
  c.prowizja_typ_nadpisania,
  c.prowizja_wartosc,

  -- Podstawa prowizji LDIT (D-64) ze znacznikiem dopłaty (D-174)
  c.doplata_na_fakturze_kfs,
  CASE WHEN c.doplata_na_fakturze_kfs = 1 THEN c.koszt_calkowity_z_doplata
       ELSE c.koszt_efektywny END AS podstawa_prowizji,
  c.data_wystawienia_faktury
FROM koncowe c;

-- --------------------------------------------------------------------------
-- Faktura ze szczegolami z wnioskow (D-170). Szkolenie, klient i liczba
-- projektow nie sa przepisywane do faktury, tylko czytane z wnioskow, ktore
-- ta faktura rozlicza. Okres rozliczeniowy to miesiac daty wystawienia, takze
-- dla korekty (D-161).
-- --------------------------------------------------------------------------
CREATE VIEW v_faktura_szczegoly AS
SELECT
  f.id AS faktura_id,
  f.numer,
  f.instytucja_id,
  f.rodzaj,
  f.faktura_pierwotna_id,
  f.kwota,
  f.data_wystawienia,
  substr(f.data_wystawienia, 1, 7) AS okres_rozliczeniowy,
  COALESCE(f.klient_id, (SELECT w.klient_id FROM wnioski w WHERE w.faktura_id = f.id LIMIT 1)) AS klient_id,
  (SELECT COUNT(*) FROM wnioski w WHERE w.faktura_id = f.id) AS liczba_wnioskow,
  (SELECT GROUP_CONCAT(DISTINCT s.nazwa) FROM wnioski w
     JOIN katalog_szkolen s ON s.id = w.szkolenie_glowne_id
    WHERE w.faktura_id = f.id) AS szkolenia
FROM faktury f;

-- --------------------------------------------------------------------------
-- Podsumowanie roku pod dashboard (D-175). Lata przeniesione licza sie z
-- wnioskow, lata nieprzeniesione biora liczby z podsumowan historycznych.
-- --------------------------------------------------------------------------
CREATE VIEW v_podsumowanie_roku AS
SELECT w.rok, w.instytucja_id, 'wnioski_zlozone' AS miara, COUNT(*) AS wartosc, 'wnioski' AS zrodlo
FROM wnioski w WHERE w.rok IS NOT NULL AND w.status_skladania = 'Złożony'
GROUP BY w.rok, w.instytucja_id
UNION ALL
SELECT w.rok, w.instytucja_id, 'wnioski_pozytywne', COUNT(*), 'wnioski'
FROM wnioski w WHERE w.rok IS NOT NULL AND w.status_decyzji = 'Pozytywna'
GROUP BY w.rok, w.instytucja_id
UNION ALL
-- Obrot jak w podsumowaniach 2025: koszt calkowity wnioskow pozytywnych
SELECT f.rok, f.instytucja_id, 'obrot', ROUND(SUM(f.koszt_calkowity_efektywny), 2), 'wnioski'
FROM v_wniosek_finanse f WHERE f.rok IS NOT NULL AND f.status_decyzji = 'Pozytywna'
GROUP BY f.rok, f.instytucja_id
UNION ALL
SELECT h.rok, h.instytucja_id, h.miara, h.wartosc, 'podsumowanie historyczne'
FROM podsumowania_historyczne h
WHERE NOT EXISTS (SELECT 1 FROM wnioski w WHERE w.rok = h.rok);

-- --------------------------------------------------------------------------
-- Priorytet w Bazie klientow wyznacza ostatni dzien naboru, rosnaco (D-130).
-- Klient bez naboru laduje na koncu listy.
-- --------------------------------------------------------------------------
CREATE VIEW v_klient_priorytet AS
SELECT
  k.id AS klient_id,
  k.nazwa,
  k.numer_klienta,
  k.instytucja_id,
  k.zainteresowany_naborem,
  n.data_do AS koniec_naboru,
  n.status AS status_naboru,
  (SELECT COUNT(*) FROM wnioski w WHERE w.klient_id = k.id) AS liczba_wnioskow
FROM klienci k
LEFT JOIN nabory n ON n.pup_id = k.pup_id;

-- --------------------------------------------------------------------------
-- Zakres widzialnosci instytucji per uzytkownik. Jedno miejsce, ktore
-- odpowiada na pytanie "czyje dane moze zobaczyc ten uzytkownik" (D-113, D-35).
-- Konto z wszystkie_instytucje = 1 widzi wszystko, pozostale tylko przypisane.
-- --------------------------------------------------------------------------
CREATE VIEW v_zakres_uzytkownika AS
SELECT u.id AS uzytkownik_id, i.id AS instytucja_id
FROM uzytkownicy u
JOIN instytucje i ON u.wszystkie_instytucje = 1
UNION
SELECT ui.uzytkownik_id, ui.instytucja_id
FROM uzytkownik_instytucja ui
UNION
SELECT u.id, u.instytucja_id
FROM uzytkownicy u
WHERE u.instytucja_id IS NOT NULL;
