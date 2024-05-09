CREATE
OR REPLACE FUNCTION logowanie(
    arg_login VARCHAR(64),
    arg_haslo VARCHAR(64)
) RETURNS INTEGER AS $$ 

DECLARE var_id_uzytkownika INTEGER;

BEGIN
SELECT
    u.id_uzytkownika
FROM
    uzytkownicy AS u
WHERE
    arg_login = u.login
    AND arg_haslo = u.haslo
FETCH FIRST
    ROW ONLY
INTO var_id_uzytkownika;


RETURN var_id_uzytkownika;

END;

$$ LANGUAGE plpgsql;