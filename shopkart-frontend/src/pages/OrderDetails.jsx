import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

function formatPrice(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get(`/orders/${id}`)
      .then(({ data }) => { if (active) setOrder(data.order); })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || "Unable to load this order.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  return (
    <>
      <Navbar />
      <main className="order-details-page">
        {loading ? <div className="products-state"><div className="loader" /><p>Loading order details...</p></div> :
          error ? <div className="products-state error-state"><h2>Order unavailable</h2><p>{error}</p><button className="retry-btn" onClick={() => navigate("/orders")}>Back to My Orders</button></div> :
          order && (
            <div className="order-confirmation">
              <div className="success-check">{order.paymentStatus === "PAID" ? "✓" : "…"}</div>
              <p className="section-label">{order.paymentStatus === "PAID" ? "PAYMENT CONFIRMED" : "ORDER STATUS"}</p>
              <h1>{order.paymentStatus === "PAID" ? "Order placed successfully!" : "Your order is awaiting payment"}</h1>
              <p className="confirmation-subtitle">{order.paymentStatus === "PAID" ? "Thank you for shopping with ShopKart. Your order has been saved." : "This order is not confirmed until payment has been verified."}</p>
              <section className="confirmation-card">
                <div className="confirmation-meta"><div><span>ORDER ID</span><strong>{order._id}</strong></div><div><span>ORDER DATE</span><strong>{new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</strong></div><div><span>STATUS</span><strong className="order-status">{order.status.replaceAll("_", " ")}</strong></div></div>
                <h2>Items ordered</h2>
                {(order.items || []).map((item, index) => (
                  <div className="confirmation-item" key={`${item.product || index}-${index}`}>
                    {item.image ? <img src={item.image} alt={item.name} onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} /> : <span className="order-item-placeholder">📦</span>}
                    <div><strong>{item.name}</strong><span>Quantity: {item.quantity}</span></div>
                    <strong>{formatPrice(item.price * item.quantity)}</strong>
                  </div>
                ))}
                <div className="confirmation-total"><span>Total amount</span><strong>{formatPrice(order.totalAmount)}</strong></div>
                <h2>Shipping address</h2>
                <address>{order.shippingAddress.fullName}<br />{order.shippingAddress.addressLine1}<br />{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}<br />Phone: {order.shippingAddress.phone}</address>
              </section>
              <div className="confirmation-actions"><button className="checkout-btn" onClick={() => navigate("/orders")}>View My Orders</button><button className="checkout-back-btn" onClick={() => navigate("/products")}>Continue Shopping</button></div>
            </div>
          )}
      </main>
    </>
  );
}

export default OrderDetails;
