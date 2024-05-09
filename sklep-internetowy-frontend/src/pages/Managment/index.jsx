import React, { useState, useEffect } from "react";
import "./styles.scss";

function Management() {
  const [zamowienia, setZamowienia] = useState([]);
  const [zwroty, setZwroty] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [activeOrderDetails, setActiveOrderDetails] = useState(null);
  const [activeReturnDetails, setActiveReturnDetails] = useState(null);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [acceptedReturns, setAcceptedReturns] = useState([]);

  useEffect(() => {
    fetchZamowienia();
    fetchZwroty();
  }, []);

  const toggleReturnDetails = (id) => {
    setActiveReturnDetails(activeReturnDetails === id ? null : id);
  };

  const acceptOrder = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:3001/orders-accept/${id}`,
        { method: "POST" }
      );
      if (!response.ok) {
        throw new Error("Problem with accepting the order");
      }
      // Dodaj ID zamówienia do stanu acceptedOrders
      setAcceptedOrders([...acceptedOrders, id]);
    } catch (error) {
      console.error("Błąd podczas przyjmowania zamówienia:", error);
    }
  };

  const acceptReturn = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:3001/returns-accept/${id}`,
        { method: "POST" }
      );
      if (!response.ok) {
        throw new Error("Problem with accepting the return");
      }
      // Dodaj ID zwrotu do stanu acceptedReturns
      setAcceptedReturns([...acceptedReturns, id]);
    } catch (error) {
      console.error("Błąd podczas przyjmowania zwrotu:", error);
    }
  };

  const fetchZamowienia = async () => {
    try {
      const response = await fetch("http://localhost:3001/orders-to-accept");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
      setZamowienia(data);
    } catch (error) {
      console.error("Błąd podczas pobierania zamówień:", error);
    }
  };

  const fetchZwroty = async () => {
    try {
      const response = await fetch("http://localhost:3001/returned-orders");
      const data = await response.json();
      setZwroty(data);
    } catch (error) {
      console.error("Błąd podczas pobierania zwrotów:", error);
    }
  };

  const toggleTab = (tab) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  // Stan do śledzenia rozwiniętych zamówień
  const [expandedOrders, setExpandedOrders] = useState([]);

  // Funkcja do przełączania rozwinięcia zamówienia
  const toggleDetails = (id) => {
    setExpandedOrders(
      expandedOrders.includes(id)
        ? expandedOrders.filter((orderId) => orderId !== id)
        : [...expandedOrders, id]
    );
  };
  console.log(acceptedReturns);

  return (
    <div className="management">
      <button onClick={() => toggleTab("zamowienia")}>
        Zamówienia czekające na realizację
      </button>
      {activeTab === "zamowienia" &&
        zamowienia.map((zamowienie) => (
          <div key={zamowienie.idZamowienia}>
            <button onClick={() => toggleDetails(zamowienie.idZamowienia)}>
              Zamówienie ID: {zamowienie.idZamowienia}
            </button>
            {!acceptedOrders.includes(zamowienie.idZamowienia) && (
              <button onClick={() => acceptOrder(zamowienie.idZamowienia)}>
                Przyjmij
              </button>
            )}
            {expandedOrders.includes(zamowienie.idZamowienia) && (
              <div>
                {zamowienie.imieKlienta} {zamowienie.nazwiskoKlienta}, Data
                złożenia zamówienia: {zamowienie.dataZlozeniaZamowienia}
              </div>
            )}
          </div>
        ))}
      <button onClick={() => toggleTab("zwroty")}>
        Zwroty czekające na przyjęcie
      </button>
      {activeTab === "zwroty" &&
        zwroty.map((zwrot) => (
          <div key={zwrot.idZwrotu}>
            <button onClick={() => toggleDetails(zwrot.idZwrotu)}>
              Zwrot ID: {zwrot.idZwrotu}
            </button>
            {!acceptedReturns.includes(zwrot.idZwrotu) && (
              <button onClick={() => acceptReturn(zwrot.idZwrotu)}>
                Przyjmij
              </button>
            )}
            {/* Wyświetl tutaj szczegóły zwrotu */}
          </div>
        ))}
    </div>
  );
}

export default Management;
