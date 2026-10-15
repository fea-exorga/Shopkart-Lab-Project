import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();

  const logout = async () => {
    try {
      await api.post("/customers/logout");
    } catch (error) {
      console.log(error);
    }

    navigate("/login");
  };

  return (
    <nav className="navbar">
      <button className="navbar-brand" onClick={() => navigate("/home")}>
        ShopKart
      </button>

      <div className="navbar-links">
        <button
          className={location.pathname === "/home" ? "nav-link active" : "nav-link"}
          onClick={() => navigate("/home")}
        >
          Home
        </button>
        <button
          className={location.pathname.startsWith("/products") ? "nav-link active" : "nav-link"}
          onClick={() => navigate("/products")}
        >
          Products
        </button>
        <button
          className={location.pathname === "/wishlist" ? "nav-link active" : "nav-link"}
          onClick={() => navigate("/wishlist")}
        >
          Wishlist
        </button>
        <button
          className={location.pathname === "/cart" ? "nav-link active cart-nav-link" : "nav-link cart-nav-link"}
          onClick={() => navigate("/cart")}
        >
          Cart ({cartCount})
        </button>
        <button
          className={location.pathname.startsWith("/orders") || location.pathname.startsWith("/order-success") ? "nav-link active" : "nav-link"}
          onClick={() => navigate("/orders")}
        >
          My Orders
        </button>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
