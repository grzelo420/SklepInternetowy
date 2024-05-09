import Main from "./components/layouts/Main";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  BrowserRouter,
} from "react-router-dom";
import "./App.css";
import ProductList from "./pages/product/productList";
import ProductDetail from "./pages/product/productDetail";
import Home from "./pages/Home";
import SignIn from "./components/authentication/SignIn";
import SignUp from "./components/authentication/SignUp";
import RoleSelection from "./components/roleSelection";
import Cart from "./pages/cart";
import Managment from "./pages/Managment";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import UserProfile from "./pages/UserProfile";
import { AuthProvider } from "./context/auth";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Main />}>
            <Route index element={<Home />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:productId" element={<ProductDetail />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/managment" element={<Managment />} />
            <Route path="/aboutus" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="userProfile" element={<UserProfile />} />
            <Route path="/role-selection" element={<RoleSelection />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
