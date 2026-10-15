import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { useCart } from "../context/CartContext";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { cartItems, addToCart, actionLoading } = useCart();
  const [cartError, setCartError] = useState("");

  useEffect(() => {
    const getProduct = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.product);
      } catch (requestError) {
        console.error(requestError);
        setProduct(null);
        setError(
          requestError.response?.data?.message ||
          "Something went wrong while loading the product."
        );
      } finally {
        setLoading(false);
      }
    };

    getProduct();
  }, [id]);

  const cartItem = cartItems.find((item) => item.product?._id === product?._id);
  const adding = product ? Boolean(actionLoading[product._id]) : false;

  const handleAddToCart = async () => {
    if (!product || adding || Number(product.stock) < 1) return;
    setCartError("");
    const success = await addToCart(product._id);
    if (!success) {
      setCartError("Unable to add this product to cart. Please try again.");
    }
  };

  return (
    <>
      <Navbar />

      <main className="product-details-page">
        {loading && (
          <div className="products-state">
            <div className="loader"></div>
            <p>Loading product...</p>
          </div>
        )}

        {!loading && error && (
          <div className="products-state error-state">
            <p>{error}</p>
            <button className="back-products-btn" onClick={() => navigate("/products")}>
              Back to Products
            </button>
          </div>
        )}

        {!loading && !error && product && (
          <section className="product-details-card">
            <button className="back-products-btn" onClick={() => navigate("/products")}>
              ← Back to Products
            </button>

            <div className="product-details-layout">
              <div className="product-details-image-wrapper">
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-details-image"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/800x600?text=ShopKart";
                  }}
                />
              </div>

              <div className="product-details-info">
                <span className="product-category">{product.category}</span>
                <h1>{product.name}</h1>
                <p className="details-price">₹{Number(product.price).toLocaleString("en-IN")}</p>
                <p className="details-description">{product.description}</p>

                <div className="details-stock">
                  <span>Stock</span>
                  <strong className={product.stock > 0 ? "in-stock" : "out-stock"}>
                    {product.stock > 0 ? `${product.stock} units available` : "Out of stock"}
                  </strong>
                </div>

                <button
                  className="add-cart-btn"
                  type="button"
                  onClick={handleAddToCart}
                  disabled={adding || Number(product.stock) < 1}
                >
                  {adding ? "Adding..." : cartItem ? "Add Another" : "Add to Cart"}
                </button>
                {cartItem && !adding && (
                  <p className="cart-note">{cartItem.quantity} {cartItem.quantity === 1 ? "unit" : "units"} currently in your cart.</p>
                )}
                {cartError && <p className="cart-action-error">{cartError}</p>}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}

export default ProductDetails;
