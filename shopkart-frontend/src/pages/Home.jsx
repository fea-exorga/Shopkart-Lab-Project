import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Home() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    const getCustomer = async () => {
      try {
        const response = await api.get("/customers/me");
        setCustomer(response.data);
      } catch (error) {
        navigate("/login");
      }
    };

    getCustomer();
  }, [navigate]);

  if (!customer) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="simple-home">

        {/* Welcome Section */}
        <section className="welcome-section">
          <div>
            <p className="welcome-label">WELCOME BACK 👋</p>

            <h1>
              Hello,{" "}
              <span>{customer.fullName}</span>
            </h1>

            <p className="welcome-text">
              Welcome to ShopKart. Find something you love today.
            </p>

            <button
              className="start-shopping-btn"
              onClick={() => navigate("/products")}
            >
              Start Shopping
              <span>→</span>
            </button>
          </div>

          <div className="welcome-icon">
            🛍️
          </div>
        </section>


        {/* Quick Actions */}
        <section className="home-section">

          <p className="section-label">
            QUICK ACCESS
          </p>

          <h2>What would you like to do?</h2>

          <div className="simple-cards">

            <div className="simple-card">
              <div className="card-icon purple-icon">
                🛍️
              </div>

              <h3>Shop Products</h3>

              <p>
                Browse products and discover something new.
              </p>

              <button
                onClick={() => navigate("/products")}
              >
                Explore →
              </button>
            </div>


            <div className="simple-card">
              <div className="card-icon blue-icon">
                📦
              </div>

              <h3>My Orders</h3>

              <p>
                View and keep track of your purchases.
              </p>

              <button
                onClick={() =>
                  alert("Orders feature coming soon!")
                }
              >
                View Orders →
              </button>
            </div>


            <div className="simple-card">
              <div className="card-icon pink-icon">
                ❤️
              </div>

              <h3>Wishlist</h3>

              <p>
                Keep your favorite products in one place.
              </p>

              <button
                onClick={() =>
                  alert("Wishlist feature coming soon!")
                }
              >
                View Wishlist →
              </button>
            </div>

          </div>
        </section>


        {/* Profile */}
        <section className="home-section">

          <p className="section-label">
            ACCOUNT
          </p>

          <h2>Your Profile</h2>

          <div className="simple-profile">

            <div className="profile-avatar">
              {customer.fullName
                ?.charAt(0)
                .toUpperCase()}
            </div>

            <div className="profile-info">

              <div>
                <small>Name</small>
                <strong>{customer.fullName}</strong>
              </div>

              <div>
                <small>Email</small>
                <strong>{customer.email}</strong>
              </div>

              <div>
                <small>Phone</small>
                <strong>{customer.phone}</strong>
              </div>

            </div>

          </div>
        </section>


        {/* Footer */}
        <footer className="simple-footer">
          © 2026 ShopKart · Simple shopping, better experience.
        </footer>

      </main>
    </>
  );
}

export default Home;