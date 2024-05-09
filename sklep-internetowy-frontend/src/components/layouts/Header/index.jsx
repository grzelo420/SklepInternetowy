import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../../context/auth";
import SignOut from "../../authentication/SignOut";
import cartIcon from "../../../assets/images/header/bagIcon.png";
import managmentIcon from "../../../assets/images/header/managmentIcon.png";
import userProfileIcon from "../../../assets/images/header/userProfileIcon.png";
import "./styles.scss";

function Header() {
  const { isLoggedIn, loginContext, logoutContext } = useAuth();
  const [userName, setUserName] = useState("");
  const [userType, setUserType] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkSession() {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3001/check-session", {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.isLoggedIn) {
          loginContext();
          setUserName(data.user.name);
          setUserType(data.user.type);
        }
        console.log(data);
      } catch (error) {
        console.error("Nie udało się zweryfikować użytkownika:", error);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  return (
    <header className="header">
      <div className="signin-signup-wrapper">
        <div className="signin-signup-container">
          {isLoggedIn ? (
            <>
              <span className="welcome-title">Cześć, {userName}</span>
              <span className="separator-link"> | </span>
              <NavLink to="/userProfile" className="user-profile-link">
                <img className="user-profile-icon" src={userProfileIcon} />
              </NavLink>
              <span className="separator-link"> | </span>
              <NavLink to="/signin" className="logout-link">
                <SignOut />
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/signup" className="signup-link">
                Zarejestruj Się
              </NavLink>
              <span className="separator-link"> | </span>
              <NavLink to="/signin" className="signin-link">
                Zaloguj się
              </NavLink>
            </>
          )}
        </div>
      </div>
      <div className="content">
        <NavLink to="/">
          <div className="header__logo"></div>
        </NavLink>
        <div className="header__navbar">
          <nav className="header__navbar__list">
            <NavLink to="/products">Produkty</NavLink>
            <NavLink to="/aboutus">O nas</NavLink>
            <NavLink to="/contact">Kontakt</NavLink>
            {isLoggedIn && userType === "CLIENT" && (
              <NavLink to="/cart" className="cart-link">
                <img className="cart-icon" src={cartIcon} />
              </NavLink>
            )}
            {isLoggedIn && userType === "EMPLOYEE" && (
              <NavLink to="/managment" className="cart-link">
                <img className="cart-icon" src={managmentIcon} />
              </NavLink>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
