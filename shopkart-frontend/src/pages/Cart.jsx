import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

function formatPrice(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function CartItem({ item }) {
  const { updateQuantity, removeFromCart, actionLoading } = useCart();
  const product = item.product;
  const quantity = Number(item.quantity);
  const busy = Boolean(actionLoading[product._id]);

  const handleQuantityChange = async (nextQuantity) => {
    if (busy || nextQuantity < 1 || nextQuantity > Number(product.stock)) return;
    await updateQuantity(product._id, nextQuantity);
  };

  return (
    <article className="cart-item">
      <div className="cart-item-image-wrapper">
        <img
          src={product.image}
          alt={product.name}
          className="cart-item-image"
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/300x240?text=ShopKart";
          }}
        />
      </div>

      <div className="cart-item-info">
        <span className="product-category">{product.category}</span>
        <h2>{product.name}</h2>
        <p className="cart-item-price">{formatPrice(product.price)}</p>
        <p className={product.stock > 0 ? "product-stock in-stock" : "product-stock out-stock"}>
          {product.stock > 0 ? `${product.stock} units available` : "Out of stock"}
        </p>

        <div className="cart-item-actions">
          <div className="quantity-control" aria-label={`Quantity for ${product.name}`}>
            <button
              type="button"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={busy || quantity <= 1}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span>{busy ? "..." : quantity}</span>
            <button
              type="button"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={busy || quantity >= Number(product.stock)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            type="button"
            className="remove-cart-btn"
            onClick={() => removeFromCart(product._id)}
            disabled={busy}
          >
            {busy ? "Updating..." : "Remove"}
          </button>
        </div>
      </div>

      <div className="cart-item-total">
        {formatPrice(Number(product.price) * quantity)}
      </div>
    </article>
  );
}

function Cart() {
  const navigate = useNavigate();
  const {
    cartItems,
    loading,
    error,
    cartCount,
    subtotal,
    refreshCart
  } = useCart();

  return (
    <>
      <Navbar />

      <main className="cart-page">
        <section className="cart-header">
          <div>
            <p className="section-label">YOUR SHOPPING CART</p>
            <h1>My Cart</h1>
            {!loading && <p>{cartCount} {cartCount === 1 ? "item" : "items"} in your cart</p>}
          </div>
        </section>

        {loading && (
          <div className="products-state">
            <div className="loader"></div>
            <p>Loading your cart...</p>
          </div>
        )}

        {!loading && error && (
          <div className="products-state error-state">
            <h2>Something went wrong.</h2>
            <p>{error}</p>
            <button type="button" className="retry-btn" onClick={refreshCart}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && cartItems.length === 0 && (
          <div className="products-state cart-empty-state">
            <div className="empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything yet.</p>
            <button
              type="button"
              className="browse-products-btn"
              onClick={() => navigate("/products")}
            >
              Browse Products
            </button>
          </div>
        )}

        {!loading && !error && cartItems.length > 0 && (
          <section className="cart-layout">
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <CartItem key={item.product._id} item={item} />
              ))}
            </div>

            <aside className="cart-summary">
              <p className="section-label">ORDER SUMMARY</p>
              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Items</span>
                <strong>{cartCount}</strong>
              </div>

              <div className="summary-row summary-subtotal">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>

              <button
                type="button"
                className="checkout-btn"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </button>
            </aside>
          </section>
        )}
      </main>
    </>
  );
}

export default Cart;
