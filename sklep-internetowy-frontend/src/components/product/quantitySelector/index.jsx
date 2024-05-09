import React from "react";
import "./styles.scss";

function QuantitySelector({ quantity, setQuantity }) {
  const handleIncrement = () => {
    setQuantity((prevQuantity) => (prevQuantity < 5 ? prevQuantity + 1 : 5));
  };

  const handleDecrement = () => {
    setQuantity((prevQuantity) => (prevQuantity > 1 ? prevQuantity - 1 : 1));
  };

  return (
    <div className="quantity-selector">
      <button onClick={handleDecrement} className="quantity-decrement">
        -
      </button>
      <span className="quantity-value">{quantity}</span>
      <button onClick={handleIncrement} className="quantity-increment">
        +
      </button>
    </div>
  );
}

export default QuantitySelector;
