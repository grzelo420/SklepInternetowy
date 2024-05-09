import React, { useState } from "react";
import "./styles.scss";

function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [place, setPlace] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [postCode, setPostCode] = useState("");

  const registerUser = async (userData) => {
    try {
      const response = await fetch("http://localhost:3001/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.status === 201) {
        alert("Rejestracja zakończona sukcesem!");
        console.log(data);
      } else {
        alert("Błąd rejestracji: " + data.message);
      }
    } catch (error) {
      console.error("Błąd podczas rejestracji:", error);
      alert("Błąd podczas rejestracji. Spróbuj ponownie później.");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      alert("Hasła nie są identyczne.");
      return;
    }

    const userData = {
      firstName,
      lastName,
      email,
      login,
      password,
      phoneNumber,
      place,
      houseNumber,
      postCode,
    };

    registerUser(userData);
  };

  return (
    <div className="sign-up-wrapper">
      <div className="sign-up-container">
        <h1>Zarejestruj się w LondonLook</h1>
        <form className="sign-up-form" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <label htmlFor="name">Imię</label>
            <input
              id="name"
              type="text"
              placeholder="Imię"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="input-wrapper">
            <label htmlFor="surname">Nazwisko</label>
            <input
              id="surname"
              type="text"
              placeholder="Nazwisko"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div className="input-wrapper">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Adres email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-wrapper">
            <label htmlFor="login">Login</label>
            <input
              id="login"
              type="text"
              placeholder="Login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          </div>
          <div className="input-wrapper">
            <label htmlFor="password">Hasło</label>
            <input
              id="password"
              type="password"
              placeholder="Hasło"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-wrapper">
            <label htmlFor="password-2nd">Potwierdź hasło</label>
            <input
              id="password-2nd"
              type="password"
              placeholder="Potwierdź hasło"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-wrapper">
            <label htmlFor="phone-number">Numer telefonu</label>
            <input
              id="phone-number"
              type="text"
              placeholder="Numer telefonu"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <div className="input-wrapper">
            <label htmlFor="place">Miejscowość</label>
            <input
              id="place"
              type="text"
              placeholder="Miejscowość"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              required
            />
          </div>
          <div className="input-wrapper">
            <label htmlFor="house-number">Nr domu</label>
            <input
              id="house-number"
              type="text"
              placeholder="Nr domu"
              value={houseNumber}
              onChange={(e) => setHouseNumber(e.target.value)}
              required
            />
          </div>
          <div className="input-wrapper">
            <label htmlFor="post-code">Kod pocztowy</label>
            <input
              id="post-code"
              type="text"
              placeholder="Kod pocztowy"
              value={postCode}
              onChange={(e) => setPostCode(e.target.value)}
              required
            />
          </div>
          <button type="submit">Zarejestruj</button>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
