import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { USER_TYPES } from "../../../context/UserTypes";
import { useAuth } from "../../../context/auth";
import errorAlertIcon from "../../../assets/images/authentication/errorAlertIcon.png";
import "./styles.scss";

function SignIn() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const navigateTo = useNavigate();
  const { loginContext } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoginError(false);
    try {
      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ login, password }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("DDDDATA:::", data);

      if (data.type && data.type.length > 1) {
        console.log("Zapisuję userId do localStorage:", data.id);
        localStorage.setItem("userId", data.id);
        navigateTo("/role-selection");
        return;
      } else if (data.type.length === 1) {
        if (data.success) {
          console.log("Zalogowano pomyślnie");
          loginContext();
          setLoggedIn(true);
          navigateTo("/");
        } else {
          console.error("Błąd logowania:", data.message);
          setLoginError(true);
        }
      } else {
      }
    } catch (error) {
      console.error("Wystąpił błąd podczas logowania:", error);
      setLoginError(true);
    }
  };

  return (
    <div className="sign-in-wrapper">
      <div className="sign-in-container">
        <h1>Zaloguj się w LondonLook</h1>
        {loginError && (
          <div className="login-error">
            <img className="login-error__icon" src={errorAlertIcon} />
            Wprowadzono nieprawidłowe dane
          </div>
        )}
        <form className="sign-in-form" onSubmit={handleSubmit}>
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
          <button type="submit">Zaloguj</button>
        </form>
        {loggedIn && <h1>Jesteś zalogowany</h1>}
      </div>
    </div>
  );
}

export default SignIn;
