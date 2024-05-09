import React, { useState, useEffect } from "react";
import {
  getProducts,
  getCategories,
  getProductsByCategory,
} from "../../../services/api/api";
import { Link } from "react-router-dom";
import "./styles.scss";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  useEffect(() => {
    async function loadProducts() {
      const productsData = await getProducts();
      setProducts(productsData);
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    }
    loadProducts();
  }, []);

  const handleCategoryClick = async (id_kategorii) => {
    setSelectedCategoryId(id_kategorii);
    let data;
    if (id_kategorii === null) {
      data = await getProducts();
    } else {
      data = await getProductsByCategory(id_kategorii);
    }
    setProducts(data);
  };

  const seenNames = new Set();
  const uniqueProducts = products.filter((product) => {
    if (seenNames.has(product.nazwa)) {
      return false;
    } else {
      seenNames.add(product.nazwa);
      return true;
    }
  });

  const productElements = uniqueProducts.map((product) => (
    <Link
      to={`/products/${product.id_produktu}`}
      key={product.id_produktu}
      className="product"
    >
      <div className="product-image-wrapper">
        <img
          src={product.obrazek}
          alt={product.nazwa}
          className="product__image"
        />
      </div>
      <div className="product__info">
        <h3>{product.nazwa}</h3>
        <p>{product.cena_netto_sprzedazy}zł</p>
      </div>
    </Link>
  ));

  return (
    <div className="product__container">
      <h1>Zobacz nasze produkty</h1>
      <div>
        <div className="category-buttons">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`category-buttons ${
              selectedCategoryId === null ? "selected" : ""
            }`}
          >
            Wszystkie
          </button>

          {categories.map((category) => (
            <button
              key={category.id_kategorii}
              onClick={() => handleCategoryClick(category.id_kategorii)}
              className={`category-buttons ${
                selectedCategoryId === category.id_kategorii ? "selected" : ""
              }`}
            >
              {category.kategoria}
            </button>
          ))}
        </div>
      </div>
      <div className="product__container__list">{productElements}</div>
    </div>
  );
}

export default ProductList;
