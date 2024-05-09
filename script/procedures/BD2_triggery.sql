CREATE OR REPLACE FUNCTION f_koszt_zamowienia() RETURNS TRIGGER AS $$
DECLARE
  total_amount DECIMAL(10, 2);
BEGIN
  SELECT SUM(cena_produktu * ilosc) INTO total_amount
  FROM zamowienia_produkty
  WHERE id_zamowienia = NEW.id_zamowienia;

  UPDATE zamowienia
  SET cena_zakupu = total_amount
  WHERE id_zamowienia = NEW.id_zamowienia;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tri_koszt_zamowienia
AFTER INSERT OR UPDATE ON zamowienia_produkty
FOR EACH ROW EXECUTE FUNCTION f_koszt_zamowienia();


CREATE OR REPLACE FUNCTION f_zwolnienie_pracownika() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.data_zwolnienia IS NOT NULL THEN
    UPDATE pracownicy
    SET konto_aktywne = FALSE
    WHERE id_pracownik = NEW.id_pracownik;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tri_zwolnienie_pracownika
AFTER UPDATE OF data_zwolnienia ON pracownicy
FOR EACH ROW EXECUTE FUNCTION f_zwolnienie_pracownika();


CREATE OR REPLACE FUNCTION f_kupno_towaru() RETURNS TRIGGER AS $$
BEGIN
  UPDATE produkty.ilosc_w_magazynie
  SET ilosc_w_magazynie = ilosc_w_magazynie - NEW.ilosc
  WHERE id_produktu = NEW.id_produktu;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tri_kupno_towaru
AFTER INSERT ON zamowienia_produkty
FOR EACH ROW EXECUTE FUNCTION f_kupno_towaru();
