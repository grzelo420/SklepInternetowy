import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import "./styles.scss";

function RoleSelection() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const { loginContext } = useAuth();

  const handleRoleSelection = async (role) => {
    try {
      console.log(userId);
      const response = await fetch("http://localhost:3001/setSession", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userId, userType: role }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log("Sesja ustawiona dla roli", role);
          loginContext();
          navigate("/");
        } else {
          console.error("Błąd podczas ustawiania sesji:", data.message);
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Wystąpił błąd:", error);
    }
  };

  return (
    <div className="role-selection">
      <h1>Wybierz konto</h1>
      <button
        className="role-button client-button"
        onClick={() => handleRoleSelection("CLIENT")}
      >
        <span>Klient</span>
      </button>
      <button
        className="role-button employee-button"
        onClick={() => handleRoleSelection("EMPLOYEE")}
      >
        <span>Pracownik</span>
      </button>
    </div>
  );
}

export default RoleSelection;
