CREATE TABLE uzytkownicy (
  id_uzytkownika SERIAL PRIMARY KEY,
  login VARCHAR(64) NOT NULL UNIQUE,
  haslo VARCHAR(64) NOT NULL,
  imie VARCHAR(20),
  nazwisko VARCHAR(50)
);

CREATE TABLE adresy (
  id_adresu SERIAL PRIMARY KEY,
  miejscowosc VARCHAR(50) NOT NULL,
  ulica VARCHAR(50),
  nr_domu VARCHAR(10) NOT NULL,
  nr_lokalu VARCHAR(10),
  kod_pocztowy CHAR(6) NOT NULL
);
CREATE TABLE adresy_email (
  id_email SERIAL PRIMARY KEY,
  email VARCHAR(64) NOT NULL UNIQUE
);
CREATE TABLE numery_telefonu (
  id_telefonu SERIAL PRIMARY KEY,
  numer_telefonu INTEGER NOT NULL UNIQUE
);


CREATE TABLE uzytkownicy_adresy (
  id_uzytkownika INTEGER NOT NULL,
  id_adresu INTEGER NOT NULL,
  PRIMARY KEY (id_uzytkownika, id_adresu)
);
CREATE TABLE uzytkownicy_numery_telefonu (
  id_uzytkownika INTEGER NOT NULL,
  id_telefonu INTEGER NOT NULL,
  PRIMARY KEY (id_uzytkownika, id_telefonu)
);
CREATE TABLE uzytkownicy_adresy_email (
  id_uzytkownika INTEGER NOT NULL,
  id_email INTEGER NOT NULL,
  PRIMARY KEY (id_uzytkownika, id_email)
);

CREATE TABLE pracownicy (
  id_pracownik SERIAL PRIMARY KEY,
  id_uzytkownika INTEGER NOT NULL,
  konto_aktywne BIT NOT NULL,
  data_zatrudnienia DATE,
  data_zwolnienia DATE
);

CREATE TABLE klienci (
  id_klienta SERIAL PRIMARY KEY,
  id_uzytkownika INTEGER NOT NULL
);

CREATE TABLE zamowienia (
  id_zamowienia SERIAL PRIMARY KEY,
  id_klienta INTEGER NOT NULL,
  data_zlozenia_zamowienia DATE,
  data_przyjecia_zamowienia DATE,
  data_wysylki DATE,
  data_oplacenia DATE,
  cena_zakupu DECIMAL(10, 2)
);
CREATE TABLE zwroty (
  id_zwrotu SERIAL PRIMARY KEY,
  id_powiazanego_zamowienia INTEGER NOT NULL,
  data_zlozenia DATE NOT NULL,
  data_realizacji DATE
);

CREATE TABLE zamowienia_produkty (
  id_zamowienia INTEGER NOT NULL,
  id_produktu INTEGER NOT NULL,
  ilosc INTEGER NOT NULL,
  cena_produktu DECIMAL(10, 2),
  PRIMARY KEY (id_zamowienia, id_produktu)
);
CREATE TABLE zwroty_produkty (
  id_zwrotu INTEGER NOT NULL,
  id_produktu INTEGER NOT NULL,
  ilosc INTEGER NOT NULL,
  cena DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (id_zwrotu, id_produktu)
);

CREATE TABLE produkty (
  id_produktu SERIAL PRIMARY KEY,
  id_producenta INTEGER NOT NULL,
  id_kategorii INTEGER NOT NULL,
  id_rozmiaru INTEGER NOT NULL,
  nazwa VARCHAR(45),
  opis VARCHAR(200),
  ilosc_w_magazynie INTEGER NOT NULL CONSTRAINT ilosc_poz CHECK (ilosc_w_magazynie > 0),
  cena_netto_sprzedazy DECIMAL(10, 2) CONSTRAINT cena_poz CHECK (cena_netto_sprzedazy > 0),
  procent_vat_sprzedazy DECIMAL(10, 2) CONSTRAINT vat_poz CHECK (procent_vat_sprzedazy > 0),
  obrazek VARCHAR(200)
);
CREATE TABLE kategorie (
  id_kategorii SERIAL PRIMARY KEY,
  kategoria VARCHAR(45) NOT NULL UNIQUE
);
CREATE TABLE producenci (
  id_producenta SERIAL PRIMARY KEY,
  producent VARCHAR(20) NOT NULL UNIQUE
);
CREATE TABLE rozmiary (
  id_rozmiaru SERIAL PRIMARY KEY,
  rozmiar VARCHAR(10) NOT NULL UNIQUE
);



ALTER TABLE klienci ADD CONSTRAINT FKklienci734610 FOREIGN KEY (id_uzytkownika) REFERENCES uzytkownicy (id_uzytkownika);

ALTER TABLE pracownicy ADD CONSTRAINT FKpracownicy613837 FOREIGN KEY (id_uzytkownika) REFERENCES uzytkownicy (id_uzytkownika);

ALTER TABLE uzytkownicy_adresy ADD CONSTRAINT FKuzyt_adr117052 FOREIGN KEY (id_uzytkownika) REFERENCES uzytkownicy (id_uzytkownika);

ALTER TABLE uzytkownicy_adresy ADD CONSTRAINT FKuzyt_adr207878 FOREIGN KEY (id_adresu) REFERENCES adresy (id_adresu);

ALTER TABLE uzytkownicy_numery_telefonu ADD CONSTRAINT FKuzy_num83454 FOREIGN KEY (id_telefonu) REFERENCES numery_telefonu (id_telefonu);

ALTER TABLE uzytkownicy_numery_telefonu ADD CONSTRAINT FKuzy_num222680 FOREIGN KEY (id_uzytkownika) REFERENCES uzytkownicy (id_uzytkownika);

ALTER TABLE uzytkownicy_adresy_email ADD CONSTRAINT FKuzy_email219072 FOREIGN KEY (id_email) REFERENCES adresy_email (id_email);

ALTER TABLE uzytkownicy_adresy_email ADD CONSTRAINT FKuzy_email416738 FOREIGN KEY (id_uzytkownika) REFERENCES uzytkownicy (id_uzytkownika);

ALTER TABLE zamowienia ADD CONSTRAINT FKzamowienia604264 FOREIGN KEY (id_klienta) REFERENCES klienci (id_klienta);

ALTER TABLE zamowienia_produkty ADD CONSTRAINT FKzam_prod899522 FOREIGN KEY (id_zamowienia) REFERENCES zamowienia (id_zamowienia);

ALTER TABLE zamowienia_produkty ADD CONSTRAINT FKzam_prod303091 FOREIGN KEY (id_produktu) REFERENCES produkty (id_produktu);

ALTER TABLE zwroty_produkty ADD CONSTRAINT FKzwrot_prod755279 FOREIGN KEY (id_zwrotu) REFERENCES zwroty (id_zwrotu);

ALTER TABLE zwroty_produkty ADD CONSTRAINT FKzwrot_prod905821 FOREIGN KEY (id_produktu) REFERENCES produkty (id_produktu);

ALTER TABLE zwroty ADD CONSTRAINT FKzwrot600624 FOREIGN KEY (id_powiazanego_zamowienia) REFERENCES zamowienia (id_zamowienia);

ALTER TABLE produkty ADD CONSTRAINT FKprodukty909807 FOREIGN KEY (id_kategorii) REFERENCES kategorie (id_kategorii);

ALTER TABLE produkty ADD CONSTRAINT FKprodukty16635 FOREIGN KEY (id_producenta) REFERENCES producenci (id_producenta);

ALTER TABLE produkty ADD CONSTRAINT FKprodukty440814 FOREIGN KEY (id_rozmiaru) REFERENCES rozmiary (id_rozmiaru);