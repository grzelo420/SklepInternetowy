const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(bodyParser.json());

const session = require("express-session");
app.use(
  session({
    secret: "mojtajnyklucz",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 1000,
      secure: false,
    },
  })
);

app.get("/produkty", async (req, res) => {
  const categoryId = req.query.category;
  let query = "SELECT * FROM produkty";

  if (categoryId) {
    query += ` WHERE id_kategorii = ${categoryId}`;
  }

  try {
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.get("/produkty/:nazwa/rozmiary", async (req, res) => {
  try {
    const nazwaProduktu = req.params.nazwa;
    const result = await pool.query(
      `SELECT r.rozmiar FROM produkty p JOIN rozmiary r ON p.id_rozmiaru = r.id_rozmiaru WHERE p.nazwa = $1`,
      [nazwaProduktu]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.get("/size/:nazwa/rozmiary", async (req, res) => {
  try {
    const nazwaRozmiaru = req.params.nazwa;
    const result = await pool.query(
      `SELECT id_rozmiaru FROM rozmiary WHERE rozmiar = $1`,
      [nazwaRozmiaru]
    );
    res.json(result.rows[0].id_rozmiaru);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.get("/kategorie", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM kategorie");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.post("/login", async (req, res) => {
  try {
    const { login, password } = req.body;
    const result = await pool.query(
      `SELECT logowanie($1,$2) AS id_uzytkownika`,
      [login, password]
    );
    const userId = result.rows[0].id_uzytkownika;
    const userTypes = await sprawdzTypUzytkownika(userId);

    if (userId) {
      const userDetails = await getUserDetails(userId);

      if (userTypes.length === 1) {
        req.session.user = {
          id: userId,
          type: userTypes[0],
          name: userDetails.name,
        };
        req.session.save();
        console.log("creating session user", req.session.user);
      }

      res.json({
        success: true,
        id: userId,
        name: userDetails.name,
        type: userTypes,
        sessionCreated: userTypes.length === 1,
      });
    } else {
      res
        .status(401)
        .json({ success: false, message: "Błędne dane logowania" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Błąd serwera podczas wylogowywania");
    } else {
      res.status(200).json({ message: "Wylogowano pomyślnie" });
    }
  });
});

app.post("/setSession", async (req, res) => {
  try {
    const { userId, userType } = req.body;

    if (!userId || !userType) {
      return res
        .status(400)
        .json({ success: false, message: "Brak wymaganych danych" });
    }

    const userDetails = await getUserDetails(userId);

    req.session.user = {
      id: userId,
      type: userType,
      name: userDetails.name,
    };
    req.session.save();
    console.log("Session created for user type", userType);

    res.json({ success: true, message: "Sesja została utworzona" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.post("/signup", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      login,
      password,
      phoneNumber,
      place,
      houseNumber,
      postCode,
    } = req.body;

    await pool.query("BEGIN");

    const emailResult = await pool.query(
      `INSERT INTO adresy_email (email) VALUES ($1) RETURNING id_email`,
      [email]
    );

    const idEmail = emailResult.rows[0].id_email;

    const phoneResult = await pool.query(
      `INSERT INTO numery_telefonu (numer_telefonu) VALUES ($1) RETURNING id_telefonu`,
      [phoneNumber]
    );

    const idTelefonu = phoneResult.rows[0].id_telefonu;

    const addressResult = await pool.query(
      `INSERT INTO adresy (miejscowosc, ulica, nr_domu, kod_pocztowy) VALUES ($1, '', $2, $3) RETURNING id_adresu`,
      [place, houseNumber, postCode]
    );

    const idAdresu = addressResult.rows[0].id_adresu;

    const userResult = await pool.query(
      `INSERT INTO uzytkownicy (login, haslo, imie, nazwisko) VALUES ($1, $2, $3, $4) RETURNING id_uzytkownika`,
      [login, password, firstName, lastName]
    );

    const idUzytkownika = userResult.rows[0].id_uzytkownika;

    await pool.query(
      `INSERT INTO uzytkownicy_adresy (id_uzytkownika, id_adresu) VALUES ($1, $2)`,
      [idUzytkownika, idAdresu]
    );
    await pool.query(
      `INSERT INTO uzytkownicy_adresy_email (id_uzytkownika, id_email) VALUES ($1, $2)`,
      [idUzytkownika, idEmail]
    );
    await pool.query(
      `INSERT INTO uzytkownicy_numery_telefonu (id_uzytkownika, id_telefonu) VALUES ($1, $2)`,
      [idUzytkownika, idTelefonu]
    );

    const clientResult = await pool.query(
      `INSERT INTO klienci (id_uzytkownika) VALUES ($1) RETURNING id_klienta`,
      [idUzytkownika]
    );

    await pool.query("COMMIT");

    res.status(201).json({
      success: true,
      id: idUzytkownika,
      message: "Rejestracja zakończona sukcesem.",
    });
  } catch (err) {
    console.error(err);
    await pool.query("ROLLBACK");
    res.status(500).send("Błąd serwera podczas rejestracji.");
  }
});

app.get("/profile", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).send("Użytkownik nie jest zalogowany.");
  }

  const userId = req.session.user.id;

  try {
    const userData = await pool.query(
      `
      SELECT u.imie, u.nazwisko, u.login, a.miejscowosc, a.ulica, a.nr_domu, a.nr_lokalu, a.kod_pocztowy, e.email, t.numer_telefonu
      FROM uzytkownicy u
      LEFT JOIN uzytkownicy_adresy ua ON u.id_uzytkownika = ua.id_uzytkownika
      LEFT JOIN adresy a ON ua.id_adresu = a.id_adresu
      LEFT JOIN uzytkownicy_adresy_email ue ON u.id_uzytkownika = ue.id_uzytkownika
      LEFT JOIN adresy_email e ON ue.id_email = e.id_email
      LEFT JOIN uzytkownicy_numery_telefonu ut ON u.id_uzytkownika = ut.id_uzytkownika
      LEFT JOIN numery_telefonu t ON ut.id_telefonu = t.id_telefonu
      WHERE u.id_uzytkownika = $1
    `,
      [userId]
    );

    if (userData.rowCount === 0) {
      return res.status(404).send("Użytkownik nie został znaleziony.");
    }

    const userAddresses = await pool.query(
      `
      SELECT a.miejscowosc, a.ulica, a.nr_domu, a.nr_lokalu, a.kod_pocztowy
      FROM uzytkownicy_adresy ua
      JOIN adresy a ON ua.id_adresu = a.id_adresu
      WHERE ua.id_uzytkownika = $1
    `,
      [userId]
    );

    const userEmails = await pool.query(
      `
      SELECT e.email
      FROM uzytkownicy_adresy_email ue
      JOIN adresy_email e ON ue.id_email = e.id_email
      WHERE ue.id_uzytkownika = $1
    `,
      [userId]
    );

    const userPhones = await pool.query(
      `
      SELECT t.numer_telefonu
      FROM uzytkownicy_numery_telefonu ut
      JOIN numery_telefonu t ON ut.id_telefonu = t.id_telefonu
      WHERE ut.id_uzytkownika = $1
    `,
      [userId]
    );

    const userInfo = {
      ...userData.rows[0],
      adresy: userAddresses.rows,
      emaile: userEmails.rows,
      telefony: userPhones.rows,
    };

    res.json(userInfo);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).send("Server error");
  }
});

async function sprawdzTypUzytkownika(idUzytkownika) {
  try {
    const types = [];

    const clientResult = await pool.query(
      "SELECT * FROM klienci WHERE id_uzytkownika = $1",
      [idUzytkownika]
    );
    if (clientResult.rowCount > 0) {
      types.push("CLIENT");
    }

    const employeeResult = await pool.query(
      "SELECT * FROM pracownicy WHERE id_uzytkownika = $1",
      [idUzytkownika]
    );
    if (employeeResult.rowCount > 0) {
      types.push("EMPLOYEE");
    }

    return types.length > 0 ? types : "UNAUTHORIZED";
  } catch (error) {
    console.error("Błąd przy sprawdzaniu typu użytkownika:", error);
    throw error;
  }
}

app.get("/check-session", (req, res) => {
  if (req.session.user) {
    res.json({ isLoggedIn: true, user: req.session.user });
  } else {
    res.json({ isLoggedIn: false });
  }
});

async function getUserDetails(userId) {
  try {
    const result = await pool.query(
      "SELECT imie, nazwisko FROM uzytkownicy WHERE id_uzytkownika = $1",
      [userId]
    );

    if (result.rows.length > 0) {
      return {
        name: result.rows[0].imie,
        surname: result.rows[0].nazwisko,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Błąd przy pobieraniu danych użytkownika:", error);
    throw error;
  }
}

app.post("/get-or-create-order", async (req, res) => {
  console.log("create-order1: ", req.session);
  console.log("create-order2 user: ", req.session.user);

  if (!req.session.user) {
    console.log("user not logged in");
    return res.status(403).send("Użytkownik nie jest zalogowany.");
  }

  const userId = req.session.user.id;

  try {
    const existingOrder = await pool.query(
      "SELECT * FROM zamowienia WHERE id_klienta = $1 AND data_zlozenia_zamowienia IS NULL",
      [userId]
    );

    if (existingOrder.rows.length === 0) {
      const newOrder = await pool.query("SELECT stworz_zamowienie($1)", [
        userId,
      ]);

      req.session.orderId = newOrder.rows[0].id_zamowienia;
      res.json(newOrder.rows[0]);
    } else {
      req.session.orderId = existingOrder.rows[0].id_zamowienia;
      res.json(existingOrder.rows[0]);
    }
    req.session.save();
    console.log("order: ", req.session.orderId);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.post("/add-product-to-order", async (req, res) => {
  console.log("add-product-to-oder-user: ", req.session.user);
  console.log("add-product-to-oder-orderId: ", req.session.orderId);
  if (!req.session.user || !req.session.orderId) {
    return res
      .status(403)
      .send("Użytkownik nie jest zalogowany lub nie ma aktywnego zamówienia.");
  }
  const { productId, quantity, size } = req.body;

  try {
    const sizeResult = await pool.query(
      "SELECT id_rozmiaru FROM rozmiary WHERE rozmiar = $1",
      [size]
    );
    if (sizeResult.rows.length === 0) {
      console.log("size not found");
      return res.status(404).send("Podany rozmiar nie istnieje.");
    }
    const id_rozmiaru = sizeResult.rows[0].id_rozmiaru;

    const existingProductResult = await pool.query(
      "SELECT * FROM zamowienia_produkty WHERE id_zamowienia = $1 AND id_produktu = $2 AND id_rozmiaru = $3",
      [req.session.orderId, productId, id_rozmiaru]
    );

    if (existingProductResult.rows.length > 0) {
      const existingProduct = existingProductResult.rows[0];
      const newQuantity = existingProduct.ilosc + quantity;
      if (newQuantity > 5) {
        return res
          .status(400)
          .send("Nie możesz dodać więcej niż 5 sztuk produktu.");
      }

      const updatedProductResult = await pool.query(
        "UPDATE zamowienia_produkty SET ilosc = $1 WHERE id_zamowienia = $2 AND id_produktu = $3 AND id_rozmiaru = $4 RETURNING *",
        [newQuantity, req.session.orderId, productId, id_rozmiaru]
      );
      res.json(updatedProductResult.rows[0]);
    } else {
      const addedProductResult = await pool.query(
        "INSERT INTO zamowienia_produkty (id_zamowienia, id_produktu, ilosc, id_rozmiaru) VALUES ($1, $2, $3, $4) RETURNING *",
        [req.session.orderId, productId, quantity, id_rozmiaru]
      );
      res.json(addedProductResult.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.delete("/remove-product-from-order", async (req, res) => {
  console.log("trying to remove product from order");
  console.log("remove user: ", req.session.user);
  console.log("remove order: ", req.session.orderId);
  if (!req.session.user || !req.session.orderId) {
    return res
      .status(403)
      .send("Użytkownik nie jest zalogowany lub nie ma aktywnego zamówienia.");
  }

  const { productId, size } = req.body;
  console.log("remove size: ", size);
  console.log("remove productId: ", productId);

  try {
    const sizeResult = await pool.query(
      "SELECT id_rozmiaru FROM rozmiary WHERE rozmiar = $1",
      [size]
    );
    if (sizeResult.rows.length === 0) {
      return res.status(404).send("Podany rozmiar nie istnieje.");
    }
    const id_rozmiaru = sizeResult.rows[0].id_rozmiaru;

    await pool.query(
      "DELETE FROM zamowienia_produkty WHERE id_zamowienia = $1 AND id_produktu = $2 AND id_rozmiaru = $3",
      [req.session.orderId, productId, id_rozmiaru]
    );

    res.send("Produkt usunięty z zamówienia.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.get("/cart-items", async (req, res) => {
  if (!req.session.user || !req.session.user.id) {
    return res.status(401).json({ message: "Użytkownik nie jest zalogowany." });
  }

  const userId = req.session.user.id;

  try {
    const currentOrderResult = await pool.query(
      "SELECT id_zamowienia FROM zamowienia WHERE id_klienta = $1 AND data_zlozenia_zamowienia IS NULL",
      [userId]
    );

    if (currentOrderResult.rowCount === 0) {
      return res.status(404).json({ message: "Brak bieżącego zamówienia." });
    }

    const currentOrderId = currentOrderResult.rows[0].id_zamowienia;

    const cartItemsResult = await pool.query(
      "SELECT p.id_produktu, p.nazwa, p.cena_netto_sprzedazy, p.obrazek, r.rozmiar, zp.ilosc FROM produkty p INNER JOIN zamowienia_produkty zp ON p.id_produktu = zp.id_produktu INNER JOIN rozmiary r ON p.id_rozmiaru = r.id_rozmiaru WHERE zp.id_zamowienia = $1",
      [currentOrderId]
    );

    const cartItems = cartItemsResult.rows.map((row) => ({
      id: row.id_produktu,
      name: row.nazwa,
      size: row.rozmiar,
      price: row.cena_netto_sprzedazy,
      quantity: row.ilosc,
      image: row.obrazek,
    }));

    console.log("cart itemy: ", cartItems);

    res.json(cartItems);
  } catch (error) {
    console.error("Błąd podczas pobierania produktów z koszyka:", error);
    res.status(500).json({
      message: "Błąd serwera podczas pobierania produktów z koszyka.",
    });
  }
});

app.get("/pending-orders", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).send("Użytkownik nie jest zalogowany.");
  }

  try {
    const completedOrdersResult = await pool.query(
      `SELECT 
        o.id_zamowienia, 
        o.data_zlozenia_zamowienia, 
        p.id_produktu, 
        p.nazwa, 
        r.rozmiar, 
        zp.ilosc, 
        p.cena_netto_sprzedazy, 
        p.obrazek 
       FROM 
        zamowienia o 
       JOIN zamowienia_produkty zp ON o.id_zamowienia = zp.id_zamowienia 
       JOIN produkty p ON zp.id_produktu = p.id_produktu 
       JOIN rozmiary r ON p.id_rozmiaru = r.id_rozmiaru 
       WHERE 
        o.id_klienta = $1 
        AND o.data_zlozenia_zamowienia IS NOT NULL
        AND o.data_przyjecia_zamowienia IS NULL`,
      [req.session.user.id]
    );

    let orders = completedOrdersResult.rows.reduce((acc, item) => {
      let order = acc.find(
        (order) => order.id_zamowienia === item.id_zamowienia
      );
      if (!order) {
        order = {
          id_zamowienia: item.id_zamowienia,
          data_zlozenia_zamowienia: item.data_zlozenia_zamowienia,
          produkty: [],
        };
        acc.push(order);
      }
      order.produkty.push({
        id_produktu: item.id_produktu,
        nazwa: item.nazwa,
        rozmiar: item.rozmiar,
        ilosc: item.ilosc,
        cena: item.cena_netto_sprzedazy,
        obrazek: item.obrazek,
      });
      return acc;
    }, []);

    console.log("ordery: ", orders);

    res.json(orders);
  } catch (error) {
    console.error("Error fetching completed orders:", error);
    res.status(500).send("Server error");
  }
});

app.get("/completed-orders", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).send("Użytkownik nie jest zalogowany.");
  }

  try {
    const completedOrdersResult = await pool.query(
      `SELECT 
        o.id_zamowienia, 
        o.data_zlozenia_zamowienia,
        o.data_przyjecia_zamowienia, 
        p.id_produktu, 
        p.nazwa, 
        r.rozmiar, 
        zp.ilosc, 
        p.cena_netto_sprzedazy, 
        p.obrazek 
       FROM 
        zamowienia o 
       JOIN zamowienia_produkty zp ON o.id_zamowienia = zp.id_zamowienia 
       JOIN produkty p ON zp.id_produktu = p.id_produktu 
       JOIN rozmiary r ON p.id_rozmiaru = r.id_rozmiaru 
       WHERE 
        o.id_klienta = $1 
        AND o.data_zlozenia_zamowienia IS NOT NULL AND o.data_przyjecia_zamowienia IS NOT NULL`,
      [req.session.user.id]
    );

    let orders = completedOrdersResult.rows.reduce((acc, item) => {
      let order = acc.find(
        (order) => order.id_zamowienia === item.id_zamowienia
      );
      if (!order) {
        order = {
          id_zamowienia: item.id_zamowienia,
          data_zlozenia_zamowienia: item.data_zlozenia_zamowienia,
          produkty: [],
        };
        acc.push(order);
      }
      order.produkty.push({
        id_produktu: item.id_produktu,
        nazwa: item.nazwa,
        rozmiar: item.rozmiar,
        ilosc: item.ilosc,
        cena: item.cena_netto_sprzedazy,
        obrazek: item.obrazek,
      });
      return acc;
    }, []);

    console.log("ordery: ", orders);

    res.json(orders);
  } catch (error) {
    console.error("Error fetching completed orders:", error);
    res.status(500).send("Server error");
  }
});

app.post("/return-product", async (req, res) => {
  const { orderId, productId, quantity, price } = req.body;
  console.log(productId);
  if (!req.session.user) {
    return res.status(403).send("Użytkownik nie jest zalogowany.");
  }

  try {
    const newReturn = await pool.query(
      "INSERT INTO zwroty (id_powiazanego_zamowienia, data_zlozenia) VALUES ($1, NOW()) RETURNING id_zwrotu",
      [orderId]
    );
    const returnId = newReturn.rows[0].id_zwrotu;

    await pool.query(
      "INSERT INTO zwroty_produkty (id_zwrotu, id_produktu, ilosc, cena) VALUES ($1, $2, $3, $4)",
      [returnId, productId, quantity, price]
    );

    res.json({ message: "Zwrot zarejestrowany pomyślnie." });
  } catch (error) {
    console.error(error);
    res.status(500).send("Błąd serwera przy rejestracji zwrotu.");
  }
});

app.get("/is-product-returned/:orderId/:productId", async (req, res) => {
  const { orderId, productId } = req.params;
  try {
    const result = await pool.query(
      `SELECT EXISTS (
        SELECT 1 
        FROM zwroty_produkty zp 
        JOIN zwroty z ON z.id_zwrotu = zp.id_zwrotu
        WHERE z.id_powiazanego_zamowienia = $1 AND zp.id_produktu = $2
      ) AS is_returned`,
      [orderId, productId]
    );

    const isReturned = result.rows[0].is_returned;
    res.json({ isReturned });
  } catch (error) {
    console.error("Error checking if product is returned:", error);
    res.status(500).send("Server error");
  }
});

app.post("/finalize-order", async (req, res) => {
  console.log("finalize, user: ", req.session.user);
  console.log("finalize, order: ", req.session.orderId);
  if (!req.session.user || !req.session.orderId) {
    return res
      .status(403)
      .send("Użytkownik nie jest zalogowany lub nie ma aktywnego zamówienia.");
  }
  const orderId = req.session.orderId;
  try {
    await pool.query(
      "UPDATE zamowienia SET data_zlozenia_zamowienia = NOW() WHERE id_zamowienia = $1",
      [orderId]
    );
    req.session.orderId = null;
    //req.session.save();
    res.json({ message: "Zamówienie zostało zrealizowane." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/orders-to-accept", async (req, res) => {
  try {
    const query = `
      SELECT z.id_zamowienia, u.imie, u.nazwisko, z.data_zlozenia_zamowienia
      FROM zamowienia z
      INNER JOIN klienci k ON z.id_klienta = k.id_klienta
      INNER JOIN uzytkownicy u ON k.id_uzytkownika = u.id_uzytkownika
      WHERE z.data_zlozenia_zamowienia IS NOT NULL AND z.data_przyjecia_zamowienia IS NULL
    `;

    const result = await pool.query(query);

    const orders = result.rows.map((row) => ({
      idZamowienia: row.id_zamowienia,
      imieKlienta: row.imie,
      nazwiskoKlienta: row.nazwisko,
      dataZlozeniaZamowienia: row.data_zlozenia_zamowienia,
    }));

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.get("/returned-orders", async (req, res) => {
  try {
    const query = `
      SELECT z.id_zwrotu, u.imie, u.nazwisko, z.data_zlozenia
      FROM zwroty z
      INNER JOIN zamowienia zam ON z.id_powiazanego_zamowienia = zam.id_zamowienia
      INNER JOIN klienci k ON zam.id_klienta = k.id_klienta
      INNER JOIN uzytkownicy u ON k.id_uzytkownika = u.id_uzytkownika
      WHERE z.data_zlozenia IS NOT NULL AND z.data_realizacji IS NULL
    `;

    const result = await pool.query(query);

    const returns = result.rows.map((row) => ({
      idZwrotu: row.id_zwrotu,
      dataZlozenia: row.data_zlozenia,
      imieKlienta: row.imie,
      nazwiskoKlienta: row.nazwisko,
    }));

    res.json(returns);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.post("/orders-accept/:id", async (req, res) => {
  try {
    const idZamowienia = req.params.id;
    const result = await pool.query(
      "UPDATE zamowienia SET data_przyjecia_zamowienia = NOW() WHERE id_zamowienia = $1 RETURNING *",
      [idZamowienia]
    );

    if (result.rows.length > 0) {
      res.json({ success: true, zamowienie: result.rows[0] });
    } else {
      res.status(404).send("Zamówienie nie znalezione");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.post("/returns-accept/:id", async (req, res) => {
  try {
    const idZwrotu = req.params.id;
    const result = await pool.query(
      "UPDATE zwroty SET data_realizacji = NOW() WHERE id_zwrotu = $1 RETURNING *",
      [idZwrotu]
    );

    if (result.rows.length > 0) {
      res.json({ success: true, zwrot: result.rows[0] });
    } else {
      res.status(404).send("Zwrot nie znaleziony");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
