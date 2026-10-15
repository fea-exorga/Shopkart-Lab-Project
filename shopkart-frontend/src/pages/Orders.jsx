import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

function formatPrice(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/orders");
      setOrders(data.orders || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load your orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  return (
    <>
      <Navbar />
      <main className="orders-page">
        <header className="orders-header">
          <div><p className="section-label">YOUR SHOPKART ACCOUNT</p><h1>My Orders</h1><p>Track your purchases and revisit order details.</p></div>
          <button className="browse-products-btn" onClick={() => navigate("/products")}>Continue shopping</button>
        </header>

        {loading ? (
          <div className="products-state"><div className="loader" /><p>Loading your orders...</p></div>
        ) : error ? (
          <div className="products-state error-state"><h2>Couldn't load orders</h2><p>{error}</p><button className="retry-btn" onClick={loadOrders}>Try Again</button></div>
        ) : orders.length === 0 ? (
          <div className="products-state cart-empty-state"><div className="empty-icon">📦</div><h2>You have not placed any orders yet.</h2><p>Your completed purchases will appear here.</p><button className="browse-products-btn" onClick={() => navigate("/products")}>Start Shopping</button></div>
        ) : (
          <section className="orders-list">
            {orders.map((order) => (
              <article className="order-card" key={order._id}>
                <div className="order-card-top">
                  <div><span className="order-muted">ORDER ID</span><strong className="order-id">#{order._id}</strong></div>
                  <span className={`order-status status-${String(order.status).toLowerCase()}`}>{order.status.replaceAll("_", " ")}</span>
                </div>
                <p className="order-date">{new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
                <div className="order-card-items">
                  {(order.items || []).map((item, index) => (
                    <div className="order-list-item" key={`${order._id}-${item.product || index}`}>
                      {item.image ? <img src={item.image} alt={item.name} onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} /> : <span className="order-item-placeholder">📦</span>}
                      <div><strong>{item.name}</strong><span>Quantity: {item.quantity}</span></div>
                      <strong>{formatPrice(item.price * item.quantity)}</strong>
                    </div>
                  ))}
                </div>
                <div className="order-card-bottom"><div><span>Total paid</span><strong>{formatPrice(order.totalAmount)}</strong></div><button className="view-order-btn" onClick={() => navigate(`/order-success/${order._id}`)}>View Details →</button></div>
              </article>
            ))}
          </section>
        )}
      </main>
    </>
  );
}

export default Orders;
