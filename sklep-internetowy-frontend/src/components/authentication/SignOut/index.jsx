import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/auth";

function SignOut() {
  const navigateTo = useNavigate();
  const { logoutContext } = useAuth();

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3001/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        logoutContext();
        navigateTo("/signin");
      } else {
        throw new Error("Błąd podczas wylogowywania");
      }
    } catch (error) {
      console.error("Błąd podczas wylogowywania:", error);
    }
  };

  return <button onClick={handleLogout}>Wyloguj</button>;
}

export default SignOut;
