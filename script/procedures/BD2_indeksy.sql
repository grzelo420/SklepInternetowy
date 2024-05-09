CREATE INDEX idx_uzytkownicy_imie
ON uzytkownicy(imie, nazwisko);

CREATE INDEX idx_adresy_miejscowosc 
ON adresy(miejscowosc);

CREATE INDEX idx_zamowienia_data_zlozenia 
ON zamowienia(data_zlozenia_zamowienia);

CREATE INDEX idx_produkty_nazwa
ON produkty(nazwa);

CREATE INDEX idx_producenci_n 
ON producenci(producent);

CREATE INDEX idx_rozmiary_n 
ON rozmiary(rozmiar);

CREATE INDEX idx_kategorie_n 
ON kategorie(kategoria);