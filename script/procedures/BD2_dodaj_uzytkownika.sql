CREATE
OR REPLACE FUNCTION dodaj_uzytkownika(
  arg_login VARCHAR(64),
  arg_haslo VARCHAR(64),
  arg_imie VARCHAR(20),
  arg_nazwisko VARCHAR(50),
  arg_email VARCHAR(64),
  arg_numer_telefonu INTEGER,
  arg_adres_miejscowosc VARCHAR(50),
  arg_adres_ulica VARCHAR(50),
  arg_adres_nr_domu VARCHAR(10),
  arg_adres_nr_lokalu VARCHAR(10),
  arg_adres_kod_pocztowy VARCHAR(6)
) RETURNS INTEGER AS $$ DECLARE 
var_id_uzytkownika INTEGER;

var_id_adresu INTEGER;

var_id_email INTEGER;

var_id_telefonu INTEGER;

BEGIN 
INSERT INTO
  uzytkownicy (
    login,
    haslo,
    imie,
    nazwisko
  )
VALUES
  (
    arg_login,
    arg_haslo,
    arg_imie,
    arg_nazwisko
  ) RETURNING uzytkownicy.id_uzytkownika INTO var_id_uzytkownika;

SELECT
  id_adresu
FROM
  adresy
WHERE
  adresy.miejscowosc = arg_adres_miejscowosc
  AND adresy.ulica = arg_adres_ulica
  AND adresy.nr_domu = arg_adres_nr_domu
  AND adresy.nr_lokalu = arg_adres_nr_lokalu
  AND adresy.kod_pocztowy = arg_adres_kod_pocztowy INTO var_id_adresu;

IF NOT found THEN
INSERT INTO
  adresy (
    miejscowosc,
    ulica,
    nr_domu,
    nr_lokalu,
    kod_pocztowy
  )
VALUES
  (
    arg_adres_miejscowosc,
    arg_adres_ulica,
    arg_adres_nr_domu,
    arg_adres_nr_lokalu,
    arg_adres_kod_pocztowy
  ) RETURNING adresy.id_adresu INTO var_id_adresu;

END IF;

INSERT INTO
  uzytkownicy_adresy (id_uzytkownika, id_adresu)
VALUES
  (var_id_uzytkownika, var_id_adresu);

SELECT
  id_email
FROM
  adresy_email
WHERE
  adresy_email.email = arg_email INTO var_id_email;

IF NOT found THEN
  INSERT INTO
    adresy_email (email)
  VALUES
    (arg_email);
END IF;

INSERT INTO
  uzytkownicy_adresy_email (id_uzytkownika, id_email)
VALUES
  (var_id_uzytkownika, var_id_email);

SELECT
  id_telefonu
FROM
  numery_telefonu
WHERE
  numery_telefonu.numer_telefonu = arg_numer_telefonu INTO var_id_telefonu;

IF NOT found THEN
INSERT INTO
  numery_telefonu (numer_telefonu)
VALUES
  (arg_numer_telefonu);
END IF;

INSERT INTO
  uzytkownicy_numery_telefonu (id_uzytkownika, id_telefonu)
VALUES
  (
    var_id_uzytkownika,
    var_id_telefonu
  );

RETURN var_id_uzytkownika;
END;

$$ LANGUAGE plpgsql;