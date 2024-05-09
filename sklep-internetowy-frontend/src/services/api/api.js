export async function getProducts() {
  const res = await fetch("http://localhost:3001/produkty");
  const data = await res.json();
  return data;
}

export async function getCategories() {
  const res = await fetch("http://localhost:3001/kategorie");
  const data = await res.json();
  return data;
}

export async function getProductsByCategory(categoryId) {
  const res = await fetch(
    `http://localhost:3001/produkty?category=${categoryId}`
  );
  const data = await res.json();
  return data;
}

export async function getSizes(productName) {
  try {
    const response = await fetch(
      `http://localhost:3001/produkty/${productName}/rozmiary`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching sizes:", error);
    return [];
  }
}

export async function getSizeIdByName(sizeName) {
  try {
    const response = await fetch(
      `http://localhost:3001/size/${sizeName}/rozmiary`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching sizes:", error);
    return [];
  }
}
