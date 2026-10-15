import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import api from "../services/api";

const initialAddress = {
  fullName: "",
  phone: "",
  addressLine1: "",
  city: "",
  state: "",
  pincode: ""
};

function formatPrice(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function validateAddress(address) {
  const errors = {};
  for (const [key, value] of Object.entries(address)) {
    if (!value.trim()) errors[key] = "This field is required.";
  }
  if (address.phone.trim() && !/^[0-9+\-\s()]{10,15}$/.test(address.phone.trim())) {
    errors.phone = "Enter a valid phone number.";
  }
  if (address.pincode.trim() && !/^\d{6}$/.test(address.pincode.trim())) {
    errors.pincode = "Pincode must contain 6 digits.";
  }
  return errors;
}

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, loading, error: cartError, subtotal, cartCount, refreshCart } = useCart();
  const [address, setAddress] = useState(initialAddress);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setAddress((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    const nextErrors = validateAddress(address);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setMessage("Please correct the highlighted fields.");
      return;
    }
    if (!cartItems.length) {
      setMessage("Your cart is empty. Add products before checkout.");
      return;
    }

    setPlacingOrder(true);
    let shopKartOrderId;
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error("Razorpay Checkout could not load. Check your internet connection and try again.");
      }

      const { data } = await api.post("/orders/create-payment-order", {
        shippingAddress: address
      });
      shopKartOrderId = data.shopKartOrderId;

      const paymentOptions = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "ShopKart",
        description: "ShopKart purchase",
        order_id: data.razorpayOrderId,
        prefill: { name: address.fullName, contact: address.phone },
        notes: { shopKartOrderId },
        theme: { color: "#7c3aed" },
        handler: async (paymentResponse) => {
          try {
            const verification = await api.post("/orders/verify-payment", {
              shopKartOrderId,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature
            });
            if (!verification.data.success) {
              throw new Error(verification.data.message || "Payment verification failed.");
            }
            await refreshCart();
            navigate(`/order-success/${shopKartOrderId}`, { replace: true });
          } catch (verificationError) {
            setMessage(
              verificationError.response?.data?.message ||
              verificationError.message ||
              "Payment could not be verified. Your cart has not been cleared."
            );
            setPlacingOrder(false);
          }
        },
        modal: {
          ondismiss: () => {
            setMessage("Checkout closed. Your cart has not been cleared; you can try again.");
            setPlacingOrder(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(paymentOptions);
      // paymentObject.on("payment.failed", (response) => {
      //   setMessage(response.error?.description || "Payment failed. Your cart has not been cleared. Please try again.");
      //   setPlacingOrder(false);
      // });
      
      paymentObject.on('payment.failed', (response) => {
        console.error('Razorpay payment failed:', {
          code: response.error?.code,
          description: response.error?.description,
          reason: response.error?.reason,
          source: response.error?.source,
          step: response.error?.step,
          metadata: response.error?.metadata
        });

        reject(
          new Error(
            response.error?.description ||
            'Payment failed. Your cart has not been cleared. Please try again.'
          )
        );
      });

      paymentObject.open();
    } catch (requestError) {
      setMessage(
        requestError.response?.data?.message ||
        requestError.message ||
        "Unable to start checkout. Please try again."
      );
      setPlacingOrder(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="checkout-page">
        <header className="checkout-header">
          <p className="section-label">ALMOST YOURS</p>
          <h1>Checkout</h1>
          <p>Enter your delivery details and review your order before payment.</p>
        </header>

        {loading ? (
          <div className="products-state"><div className="loader" /><p>Loading your cart...</p></div>
        ) : cartError ? (
          <div className="products-state error-state"><p>{cartError}</p><button className="retry-btn" onClick={refreshCart}>Try Again</button></div>
        ) : cartItems.length === 0 ? (
          <div className="products-state cart-empty-state">
            <div className="empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add something to your cart before checking out.</p>
            <button className="browse-products-btn" onClick={() => navigate("/products")}>Browse Products</button>
          </div>
        ) : (
          <form className="checkout-layout" onSubmit={handleSubmit} noValidate>
            <section className="checkout-panel">
              <div className="checkout-panel-heading">
                <span className="checkout-step">1</span>
                <div><h2>Shipping details</h2><p>Where should we deliver your order?</p></div>
              </div>
              <div className="shipping-fields">
                {[
                  ["fullName", "Full name", "e.g. Aarav Sharma", "text"],
                  ["phone", "Phone number", "10-digit phone number", "tel"],
                  ["addressLine1", "Address line", "House no., street, area", "text"],
                  ["city", "City", "City", "text"],
                  ["state", "State", "State", "text"],
                  ["pincode", "Pincode", "6-digit pincode", "text"]
                ].map(([name, label, placeholder, type]) => (
                  <label className={`shipping-field ${name === "addressLine1" ? "field-wide" : ""}`} key={name}>
                    <span>{label}</span>
                    <input
                      name={name}
                      type={type}
                      value={address[name]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      autoComplete={name === "fullName" ? "name" : name === "phone" ? "tel" : name === "addressLine1" ? "street-address" : name}
                      aria-invalid={Boolean(errors[name])}
                    />
                    {errors[name] && <small className="field-error">{errors[name]}</small>}
                  </label>
                ))}
              </div>
              <div className="secure-payment-note"><span>🔒</span><p>Payments are processed securely through Razorpay Test Mode. No real money is charged.</p></div>
            </section>

            <aside className="checkout-panel checkout-summary-panel">
              <div className="checkout-panel-heading">
                <span className="checkout-step">2</span>
                <div><h2>Order summary</h2><p>{cartCount} {cartCount === 1 ? "item" : "items"} in your cart</p></div>
              </div>
              <div className="checkout-items">
                {cartItems.map((item) => {
                  const product = item.product;
                  if (!product) return null;
                  return (
                    <div className="checkout-item" key={product._id}>
                      <img src={product.image} alt={product.name} onError={(event) => { event.currentTarget.src = "https://placehold.co/100x100?text=ShopKart"; }} />
                      <div className="checkout-item-copy"><strong>{product.name}</strong><span>Qty: {item.quantity}</span></div>
                      <strong>{formatPrice(Number(product.price) * Number(item.quantity))}</strong>
                    </div>
                  );
                })}
              </div>
              <div className="checkout-total-row"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
              <div className="checkout-total-row"><span>Delivery</span><strong className="free-delivery">FREE</strong></div>
              <div className="checkout-total-row checkout-grand-total"><span>Total</span><strong>{formatPrice(subtotal)}</strong></div>
              {message && <p className="checkout-message" role="alert">{message}</p>}
              <button className="checkout-btn" type="submit" disabled={placingOrder}>
                {placingOrder ? "Starting secure payment..." : "Place Order · Pay with Razorpay"}
              </button>
              <button className="checkout-back-btn" type="button" onClick={() => navigate("/cart")} disabled={placingOrder}>Back to cart</button>
              <p className="checkout-terms">Your order is confirmed only after payment verification.</p>
            </aside>
          </form>
        )}
      </main>
    </>
  );
}

export default Checkout;
