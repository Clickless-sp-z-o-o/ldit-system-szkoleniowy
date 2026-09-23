-- ============================================================================
-- Widoki: reguly biznesowe zapisane w SQL.
-- Wszystko, co w dokumentacji jest "polem wyliczanym", jest tutaj wyrazone
-- jako zapytanie. Dzieki temu regula ma jedno miejsce, a nie kopie w kazdym
-- ekranie makiety. Przy przepisaniu na Postgresa te widoki przenosza sie
-- bez zmian i staja sie warstwa domenowa aplikacji.
-- ============================================================================

-- --------------------------------------------------------------------------
-- Aktualnie obowiazujace warunki prowizyjne instytucji (D-22).
-- Wersjonowanie: obowiazuje_do IS NULL oznacza wersje biezaca.
-- --------------------------------------------------------------------------
CREATE VIEW v_warunki_aktywne AS
SELECT w.*
FROM warunki_prowizyjne w
WHERE w.obowiazuje_do IS NULL OR w.obowiazuje_do = '';

-- --------------------------------------------------------------------------
-- Finanse wniosku. Realizuje D-131, D-132, D-134, D-135, D-19 i D-79.
--
-- Kolejnosc wyliczen:
--   1. wielkosc przedsiebiorstwa: nadpisanie per wniosek, inaczej z klienta (D-132)
--   2. procent dofinansowania: z tabeli progow, wersja wazna w dniu wniosku (D-131)
--   3. koszt calkowity: koszt z doplata minus doplata dodatkowa (D-134)
--   4. przyznano: koszt calkowity razy procent dofinansowania (D-135)
--   5. podstawa prowizji: koszt calkowity Z DOPLATA (D-64)
--
-- Kazde pole wyliczane wystepuje w dwoch wariantach:
--   *_wyliczone  - wartosc z reguly, liczona zawsze, nawet gdy regula wylaczona
--   *_efektywne  - wartosc pokazywana uzytkownikowi (regula albo reczne nadpisanie)
-- To jest techniczna realizacja zasady "Przywroc regule" (D-19).
-- --------------------------------------------------------------------------
CREATE VIEW v_wniosek_finanse AS
SELECT
  w.id AS wniosek_id,
  w.klient_id,
  w.instytucja_id,
  w.rok,
  w.status_decyzji,

  COALESCE(w.wielkosc_przedsiebiorstwa, k.wielkosc_przedsiebiorstwa) AS wielkosc,

  COALESCE((
    SELECT p.procent_dofinansowania
    FROM progi_dofinansowania p
    WHERE p.wielkosc = COALESCE(w.wielkosc_przedsiebiorstwa, k.wielkosc_przedsiebiorstwa)
      AND p.obowiazuje_od <= COALESCE(w.data_wniosku, w.data_wplyniecia_formularza, '9999-12-31')
      AND (p.obowiazuje_do IS NULL OR p.obowiazuje_do >= COALESCE(w.data_wniosku, '0001-01-01'))
    ORDER BY p.obowiazuje_od DESC
    LIMIT 1
  ), 70) AS procent_dofinansowania,

  w.koszt_calkowity_z_doplata,
  w.kwota_doplaty_dodatkowej,

  ROUND(COALESCE(w.koszt_calkowity_z_doplata, 0) - COALESCE(w.kwota_doplaty_dodatkowej, 0), 2)
    AS koszt_calkowity_wyliczony,

  CASE WHEN w.koszt_regula_aktywna = 1
       THEN ROUND(COALESCE(w.koszt_calkowity_z_doplata, 0) - COALESCE(w.kwota_doplaty_dodatkowej, 0), 2)
       ELSE w.koszt_calkowity
  END AS koszt_calkowity_efektywny,

  -- Suma warunkowa: tylko uczestnicy zakwalifikowani (D-61, D-79)
  COALESCE((
    SELECT SUM(u.kwota) FROM uczestnicy u
    WHERE u.wniosek_id = w.id AND u.status_kwalifikacji = 'zakwalifikowany'
  ), 0) AS calkowita_wartosc_szkolenia,

  (SELECT COUNT(*) FROM uczestnicy u WHERE u.wniosek_id = w.id) AS uczestnikow,
  (SELECT COUNT(*) FROM uczestnicy u WHERE u.wniosek_id = w.id
     AND u.status_kwalifikacji = 'zakwalifikowany') AS uczestnikow_zakwalifikowanych,

  w.koszt_regula_aktywna,
  w.przyznano_regula_aktywna,
  w.przyznano AS przyznano_zapisane,
  w.prowizja_regula_aktywna,
  w.prowizja_typ_nadpisania,
  w.prowizja_wartosc,

  -- Podstawa prowizji LDIT to koszt calkowity Z DOPLATA, nie kwota przyznana (D-64)
  w.koszt_calkowity_z_doplata AS podstawa_prowizji,
  w.data_wystawienia_faktury
FROM wnioski w
JOIN klienci k ON k.id = w.klient_id;

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
