import React, { useState, useEffect } from "react";
import "./styles.scss";

function UserProfile() {
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:3001/profile", {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="user-profile">
      <h1>Profil Użytkownika</h1>
      <p>Imię: {userData.imie}</p>
      <p>Nazwisko: {userData.nazwisko}</p>
      <div>
        <h2>Adres</h2>
        {userData.adresy &&
          userData.adresy.map((adres, index) => (
            <div key={index}>
              <p>Miejscowość: {adres.miejscowosc}</p>
              <p>Ulica: {adres.ulica}</p>
              <p>Numer domu: {adres.nr_domu}</p>
              <p>Numer lokalu: {adres.nr_lokalu}</p>
              <p>Kod pocztowy: {adres.kod_pocztowy}</p>
            </div>
          ))}
      </div>
      <div>
        <h2>Email</h2>
        {userData.emaile &&
          userData.emaile.map((email, index) => (
            <p key={index}>Email: {email.email}</p>
          ))}
      </div>
      <div>
        <h2>Numer telefonu:</h2>
        {userData.telefony &&
          userData.telefony.map((telefon, index) => (
            <p key={index}>Telefon: {telefon.numer_telefonu}</p>
          ))}
      </div>
    </div>
  );
}

export default UserProfile;
