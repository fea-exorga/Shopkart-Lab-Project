import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

function ProductCard({ product, wishlisted = false, onWishlistChange }) {
  const navigate = useNavigate();
  const { cartItems, addToCart, actionLoading } = useCart();
  const inStock = Number(product.stock) > 0;
  const [saved, setSaved] = useState(wishlisted);
  const [saving, setSaving] = useState(false);
  const [wishlistError, setWishlistError] = useState("");
  const [cartError, setCartError] = useState("");

  const cartItem = cartItems.find(
    (item) => item.product?._id === product._id
  );
  const adding = Boolean(actionLoading[product._id]);

  const handleWishlist = async () => {
    if (saving) return;

    setSaving(true);
    setWishlistError("");

    try {
      if (saved) {
        await api.delete(`/wishlist/${product._id}`);
        setSaved(false);
        onWishlistChange?.(product._id, false);
      } else {
        await api.post(`/wishlist/${product._id}`);
        setSaved(true);
        onWishlistChange?.(product._id, true);
      }
    } catch (error) {
      console.error(error);
      setWishlistError(
        error.response?.data?.message || "Unable to update wishlist. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAddToCart = async () => {
    if (adding || !inStock) return;

    setCartError("");
    const success = await addToCart(product._id);

    if (!success) {
      setCartError("Unable to add this product to cart. Please try again.");
    }
  };

  return (
    <article className="product-card">
      <div className="product-image-wrapper">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/600x400?text=ShopKart";
          }}
        />
        <span className={`stock-badge ${inStock ? "stock-badge-in" : "stock-badge-out"}`}>
          {inStock ? "In Stock" : "Out of Stock"}
        </span>
        <button
          type="button"
          className={`wishlist-heart ${saved ? "wishlist-heart-saved" : ""}`}
          onClick={handleWishlist}
          disabled={saving}
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
          title={saved ? "Remove from wishlist" : "Add to wishlist"}
        >
          {saving ? "⏳" : saved ? "♥" : "♡"}
        </button>
      </div>

      <div className="product-card-content">
        <span className="product-category">{product.category}</span>
        <h3 className="product-card-title">{product.name}</h3>
        <p className="product-card-description">
          {product.description || "Quality product available at ShopKart."}
        </p>

        <div className="product-card-bottom">
          <div>
            <p className="product-price">₹{Number(product.price).toLocaleString("en-IN")}</p>
            <p className={inStock ? "product-stock in-stock" : "product-stock out-stock"}>
              {inStock ? `${product.stock} units left` : "Currently unavailable"}
            </p>
          </div>
        </div>

        {wishlistError && <p className="wishlist-action-error">{wishlistError}</p>}
        {cartError && <p className="cart-action-error">{cartError}</p>}

        <div className="product-card-actions">
          <button
            className="view-details-btn"
            onClick={() => navigate(`/products/${product._id}`)}
          >
            View Details <span>→</span>
          </button>

          <button
            type="button"
            className={`add-cart-card-btn ${cartItem ? "add-cart-card-btn-added" : ""}`}
            onClick={handleAddToCart}
            disabled={adding || !inStock}
          >
            {adding ? "Adding..." : cartItem ? "Add Another" : "Add to Cart"}
          </button>

          <button
            type="button"
            className={`wishlist-btn ${saved ? "wishlist-btn-saved" : ""}`}
            onClick={handleWishlist}
            disabled={saving}
          >
            {saving ? "⏳ Saving..." : saved ? "Added to Wishlist" : "Add to Wishlist"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
