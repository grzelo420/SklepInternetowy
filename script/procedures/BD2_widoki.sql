CREATE OR REPLACE VIEW historia_zamowien AS
SELECT
    zamowienia.id_zamowienia,
    zamowienia.id_klienta,
    produkty.nazwa,
    zamowienia.data_zlozenia_zamowienia
FROM
    zamowienia
JOIN
    zamowienia_produkty ON zamowienia.id_zamowienia = zamowienia_produkty.id_zamowienia
JOIN
    produkty ON zamowienia_produkty.id_produktu = produkty.id_produktu;

CREATE OR REPLACE VIEW detale_produktow AS
SELECT
  produkty.nazwa,
  producenci.producent,
  rozmiary.rozmiar,
  kategorie.kategoria,
  produkty.opis
FROM
  produkty
  LEFT OUTER JOIN producenci ON produkty.id_producenta = producenci.id_producenta
  LEFT OUTER JOIN rozmiary ON produkty.id_rozmiaru = rozmiary.id_rozmiaru
  LEFT OUTER JOIN kategorie ON produkty.id_kategorii = kategorie.id_kategorii;

CREATE OR REPLACE VIEW kontakt_do_klienta AS
SELECT 
  k.id_klienta, 
  u.imie, 
  u.nazwisko, 
  ae.email, 
  nt.numer_telefonu,
  a.miejscowosc, 
  a.ulica, 
  a.nr_domu, 
  a.nr_lokalu, 
  a.kod_pocztowy
FROM klienci k
  JOIN uzytkownicy u ON k.id_uzytkownika = u.id_uzytkownika
  JOIN uzytkownicy_adresy ua ON u.id_uzytkownika = ua.id_uzytkownika
  JOIN adresy a ON ua.id_adresu = a.id_adresu
  JOIN uzytkownicy_adresy_email uae ON u.id_uzytkownika = uae.id_uzytkownika
  JOIN adresy_email ae ON uae.id_email = ae.id_email
  JOIN uzytkownicy_numery_telefonu unt ON u.id_uzytkownika = unt.id_uzytkownika
  JOIN numery_telefonu nt ON unt.id_telefonu = nt.id_telefonu;

CREATE VIEW historia_zamowien_klienta AS
SELECT k.id_klienta AS id_klienta, z.id_zamowienia, z.data_zlozenia_zamowienia, z.data_oplacenia
FROM klienci k
JOIN zamowienia z ON k.id_klienta = z.id_klienta;


CREATE VIEW historia_zrealizowanych_zamowien AS
SELECT 
  z.id_zamowienia, 
  z.data_zlozenia_zamowienia, 
  z.data_przyjecia_zamowienia, 
  z.data_wysylki, 
  z.data_oplacenia, 
  z.cena_zakupu
FROM zamowienia z
WHERE z.data_wysylki IS NOT NULL;

CREATE VIEW lista_nie_zrealizowanych_zamowien AS
SELECT 
  z.id_zamowienia, 
  z.data_zlozenia_zamowienia, 
  z.data_przyjecia_zamowienia, 
  z.data_wysylki, 
  z.data_oplacenia, 
  z.cena_zakupu
FROM zamowienia z
WHERE z.data_wysylki IS NULL;