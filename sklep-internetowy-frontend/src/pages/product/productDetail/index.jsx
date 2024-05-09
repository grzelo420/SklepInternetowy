import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getProducts,
  getSizes,
  getSizeIdByName,
} from "../../../services/api/api";
import { NavLink } from "react-router-dom";
import SizeSelector from "../../../components/product/SizeSelector";
import QuantitySelector from "../../../components/product/quantitySelector";

import "./styles.scss";

function ProductDetail() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [sizes, setSizes] = useState([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [isSizeError, setIsSizeError] = useState(false);
  const [productSizeId, setProductSizeId] = useState(null);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [loading, setLoading] = useState(false);

  const [quantity, setQuantity] = useState(1);

  const [userType, setUserType] = useState("");

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
          console.log("Zalogowano pomyślnie");
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

  const getOrCreateOrder = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/get-or-create-order",
        {
          method: "POST",
          credentials: "include",
        }
      );
      console.log(response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const order = await response.json();
      return order;
    } catch (error) {
      console.error("Error creating or fetching order:", error);
    }
  };

  useEffect(() => {
    async function loadProductDetails() {
      try {
        const products = await getProducts();
        const foundProduct = products.find(
          (p) => p.id_produktu.toString() === productId
        );
        setProduct(foundProduct);

        if (foundProduct) {
          const sizesData = await getSizes(foundProduct.nazwa);
          const sizesArray = sizesData.map((s) => s.rozmiar);

          setSizes(sizesArray);
        }
        const order = await getOrCreateOrder();
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }

    loadProductDetails();
  }, [productId]);

  if (!product) {
    return <div>Loading...</div>;
  }

  const onSizeSelect = async (sizeName) => {
    try {
      const sizeId = await getSizeIdByName(sizeName);
      console.log("size id on size select: ", sizeId);
      if (!sizeId) {
        console.error("Nie znaleziono rozmiaru:", sizeName);
        return;
      }

      const productsResponse = await getProducts();
      const foundProduct = productsResponse.find(
        (p) => p.nazwa === product.nazwa && p.id_rozmiaru === sizeId
      );

      if (foundProduct) {
        setProductSizeId(foundProduct.id_produktu);
      } else {
        console.log("Produkt o podanym rozmiarze nie został znaleziony");
      }
    } catch (error) {
      console.error("Error fetching product size id:", error);
    }
  };

  const addProductToOrder = async (productId, quantity, size) => {
    console.log(productId, quantity, size);
    try {
      const response = await fetch(
        "http://localhost:3001/add-product-to-order",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId, quantity, size }),
        }
      );
      console.log(response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedOrder = await response.json();
      return updatedOrder;
    } catch (error) {
      console.error("Error adding product to order:", error);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      setIsSizeError(true);
      return;
    }

    const order = await getOrCreateOrder();
    console.log("order handleAddToCart: ", order);
    if (order) {
      const updatedOrder = await addProductToOrder(
        productSizeId,
        quantity,
        selectedSize
      );

      if (updatedOrder) {
        console.log(
          "Produkt dodany do koszyka:",
          product.nazwa,
          quantity,
          selectedSize
        );
        setIsAddedToCart(true);
        setTimeout(() => setIsAddedToCart(false), 3000);
      }
    }
  };

  return (
    <div className="product_container">
      <div className="navlink__wrapper">
        <NavLink className="navlink__wrapper__arrow" to="/products">
          ←Powrót
        </NavLink>
        {isAddedToCart && (
          <div className="added-to-cart-message">
            Produkt dodany do koszyka!
          </div>
        )}
      </div>

      <div className="product__detail__wrapper">
        <div className="product__detail__container">
          <div className="product__detail__container__left">
            <img
              src={product.obrazek}
              alt={product.nazwa}
              className="product__detail__container__left__image"
            />
          </div>

          <div className="product__detail__container__right">
            <div className="product__detail__container__right__info">
              <h2>{product.nazwa}</h2>
              <p>{product.cena_netto_sprzedazy}zł</p>
              <h4 className="product__detail__description">{product.opis}</h4>
              <div className="product__detail__container__size">
                <h4
                  className={`size__title ${isSizeError ? "size__error" : ""}`}
                >
                  {userType == "CLIENT" && <>Wybierz rozmiar</>}
                </h4>
                <div className="product__detail__container__size__list">
                  <SizeSelector
                    sizes={sizes}
                    selectedSize={selectedSize}
                    onSelectSize={(size) => {
                      setSelectedSize(size);
                      onSizeSelect(size);
                      setIsSizeError(false);
                    }}
                    isSizeError={isSizeError}
                  />
                </div>
                {userType == "CLIENT" && (
                  <>
                    <div className="quantity-selector-wrapper">
                      <QuantitySelector
                        quantity={quantity}
                        setQuantity={setQuantity}
                      />
                    </div>
                    <button
                      className="add-to-cart-btn"
                      onClick={handleAddToCart}
                    >
                      Dodaj do koszyka
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
