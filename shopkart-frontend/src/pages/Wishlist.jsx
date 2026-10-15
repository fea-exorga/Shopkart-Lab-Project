import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

function WishlistCard({ product, onRemove }) {
  const navigate = useNavigate();
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");

  const handleRemove = async () => {
    if (removing) return;

    setRemoving(true);
    setError("");

    try {
      await api.delete(`/wishlist/${product._id}`);
      onRemove(product._id);
    } catch (requestError) {
      console.error(requestError);
      setError(
        requestError.response?.data?.message ||
        "Unable to remove product. Please try again."
      );
    } finally {
      setRemoving(false);
    }
  };

  const inStock = Number(product.stock) > 0;

  return (
    <article className="wishlist-card">
      <div className="wishlist-image-wrapper">
        <img
          src={product.image}
          alt={product.name}
          className="wishlist-image"
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/600x400?text=ShopKart";
          }}
        />
      </div>

      <div className="wishlist-card-content">
        <span className="product-category">{product.category}</span>
        <h2>{product.name}</h2>
        <p className="wishlist-price">₹{Number(product.price).toLocaleString("en-IN")}</p>
        <p className={inStock ? "product-stock in-stock" : "product-stock out-stock"}>
          {inStock ? `${product.stock} units left` : "Currently unavailable"}
        </p>

        {error && <p className="wishlist-action-error">{error}</p>}

        <div className="wishlist-card-actions">
          <button
            type="button"
            className="view-details-btn"
            onClick={() => navigate(`/products/${product._id}`)}
          >
            View Details
          </button>
          <button
            type="button"
            className="remove-wishlist-btn"
            onClick={handleRemove}
            disabled={removing}
          >
            {removing ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
    </article>
  );
}

function Wishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWishlist = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/wishlist");
      setWishlist(response.data.wishlist || []);
    } catch (requestError) {
      console.error(requestError);

      if (requestError.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError("We couldn't load your wishlist.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const removeFromWishlist = (productId) => {
    setWishlist((current) =>
      current.filter((product) => product._id !== productId)
    );
  };

  return (
    <>
      <Navbar />

      <main className="wishlist-page">
        <section className="wishlist-header">
          <p className="section-label">YOUR SAVED PRODUCTS</p>
          <h1>My Wishlist</h1>
          <p>
            {wishlist.length} {wishlist.length === 1 ? "product" : "products"} saved
          </p>
        </section>

        {loading && (
          <div className="products-state">
            <div className="loader"></div>
            <p>Loading your wishlist...</p>
          </div>
        )}

        {!loading && error && (
          <div className="products-state error-state">
            <h2>Something went wrong.</h2>
            <p>{error}</p>
            <button type="button" className="retry-btn" onClick={loadWishlist}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && wishlist.length === 0 && (
          <div className="products-state wishlist-empty-state">
            <div className="empty-icon">❤️</div>
            <h2>Your wishlist is empty</h2>
            <p>Save products you love and find them here later.</p>
            <button
              type="button"
              className="browse-products-btn"
              onClick={() => navigate("/products")}
            >
              Browse Products
            </button>
          </div>
        )}

        {!loading && !error && wishlist.length > 0 && (
          <section className="wishlist-grid">
            {wishlist.map((product) => (
              <WishlistCard
                key={product._id}
                product={product}
                onRemove={removeFromWishlist}
              />
            ))}
          </section>
        )}
      </main>
    </>
  );
}

export default Wishlist;
