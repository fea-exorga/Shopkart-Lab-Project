# 🛍️ ShopKart — Full-Stack E-Commerce Application

A full-stack e-commerce web application built using the MERN stack. ShopKart brings together product browsing, authentication, wishlists, cart management, checkout, order processing, and online payment integration in one application.

The project focuses on building a complete shopping experience while applying REST APIs, database relationships, frontend state management, server-side validation, and secure payment verification.

## ✨ Features

### 🛒 Shopping Experience
- Browse the product catalogue.
- Search and filter products.
- View product information and prices.
- Add products to the shopping cart.
- Manage cart quantities and remove items.
- Maintain a wishlist of preferred products.

### 🔐 Authentication and User Management
- User registration and login.
- Authentication-protected routes and APIs.
- User-specific shopping data.
- Access control for user orders.

### 🛍️ Cart and State Management
- Shared cart state across the frontend.
- Dynamic cart totals based on product quantities.
- Cart synchronization after successful checkout.
- Protection against proceeding with an empty cart.

### 📦 Checkout and Order Management
- Dedicated checkout page.
- Shipping address form and validation.
- Backend validation of product prices and stock.
- Server-calculated order totals.
- Order creation and persistence in MongoDB.
- Purchase-time snapshots of product details.
- Order confirmation page.
- My Orders page for viewing saved order history.

### 💳 Payment Integration
- Razorpay Standard Checkout integration.
- Razorpay Test Mode for payment testing.
- Backend creation of Razorpay orders.
- Payment signature verification.
- Payment and order status updates.
- Support for the payment options implemented in the checkout flow.

> **Note:** Razorpay is configured for Test Mode. Test transactions do not represent real-money payments.

## 🧰 Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, JavaScript, HTML, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| API communication | REST APIs, HTTP/JSON |
| Payment gateway | Razorpay Standard Checkout |
| Development tools | Git, GitHub, npm, VS Code |

## 🏗️ Application Architecture

```text
                  ┌──────────────────────┐
                  │   React Frontend      │
                  │                      │
                  │ Products, Wishlist,   │
                  │ Cart, Checkout,       │
                  │ Orders                │
                  └──────────┬───────────┘
                             │
                        REST APIs
                             │
                  ┌──────────▼───────────┐
                  │   Express Backend     │
                  │                      │
                  │ Authentication,      │
                  │ Validation, Orders,   │
                  │ Payment Verification  │
                  └──────┬────────┬──────┘
                         │        │
                  ┌──────▼───┐ ┌──▼────────────┐
                  │ MongoDB  │ │ Razorpay API  │
                  │          │ │               │
                  │ Users,   │ │ Test Checkout,│
                  │ Products,│ │ Payment Data  │
                  │ Orders   │ │ Verification  │
                  └──────────┘ └───────────────┘
```

## 🔄 End-to-End Workflow

1. **Register or log in:** The user authenticates with ShopKart.
2. **Browse products:** The user explores the catalogue and searches for products.
3. **Manage wishlist:** The user saves preferred products.
4. **Add to cart:** Products and quantities are maintained in the shopping cart.
5. **Proceed to checkout:** The user enters shipping details and selects a payment method.
6. **Validate the order:** The backend validates shipping information, retrieves current product prices, checks stock, and calculates the total.
7. **Create an order:** ShopKart saves the order details in MongoDB.
8. **Process payment:** For online payment, the backend creates a Razorpay order and the frontend opens Razorpay Checkout.
9. **Verify payment:** The backend verifies the returned payment signature before marking the order as paid.
10. **Confirm the order:** After successful processing, the application updates order information and synchronizes the cart.
11. **View order history:** The user can view previously saved orders through My Orders.

## 📁 Project Structure

The project is organized into separate frontend and backend applications.

```text
ShopKart/
├── shopkart-frontend/
│   ├── public/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── .gitignore
│
├── shopkart-backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── index.js
│   ├── package.json
│   └── .gitignore
│
├── README.md
```

## ⚙️ Prerequisites

Install the following before running the application:

- Node.js and npm
- MongoDB or a MongoDB Atlas database
- Git
- A Razorpay account with Test Mode API keys for testing online payments

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd ShopKart
```

Replace the placeholder with your actual repository URL.

### 2. Configure the backend

```bash
cd shopkart-backend
npm install
```

```

Start the backend using the script configured in `package.json`, for example:

```bash
npx index.js
```

If the project does not define a `dev` script, use the appropriate script listed in `package.json`.

### 3. Configure the frontend

Open another terminal:

```bash
cd shopkart-frontend
npm install
```

Start the frontend:

```bash
npm run dev
```

### 4. Open the application

Open the local URL printed by the frontend development server, typically:

```text
http://localhost:5173
```

Ensure that MongoDB and the backend are running before testing application features.

## 💳 Razorpay Test Mode

ShopKart integrates Razorpay Standard Checkout for online payment testing.

The payment flow is:

```text
Checkout
   ↓
Backend creates Razorpay order
   ↓
Razorpay Checkout opens
   ↓
User completes test payment
   ↓
Frontend sends payment details
   ↓
Backend verifies signature
   ↓
Order and payment status update
   ↓
Order confirmation
```

### Security considerations

- The Razorpay Key Secret stays on the backend.
- The backend calculates the order total.
- Product stock is checked during checkout.
- Payment signatures are verified server-side.
- The cart should not be cleared merely because Checkout opens.
- A failed or invalid payment must not be treated as a successful payment.

Use Razorpay's Test Mode credentials and test payment options when verifying the integration.

## 🔒 Environment Variables and Secrets

Before pushing the project to GitHub, ensure that:

- Real `.env` files are excluded through `.gitignore`.
- MongoDB credentials and connection strings are not committed.
- JWT secrets are not exposed.
- Razorpay Key Secrets are never included in source code.
- `.env.example` contains only placeholder values.
- No API keys or other private credentials appear in commits.

Example `.gitignore` entries:

```gitignore
.env

node_modules/
dist/
*.log
```

## 🧪 Testing Checklist

- [ ] User registration and login work.
- [ ] Product catalogue loads correctly.
- [ ] Search and filtering work.
- [ ] Wishlist operations work.
- [ ] Cart quantities and totals update correctly.
- [ ] Checkout validates shipping information.
- [ ] Backend calculates the correct order total.
- [ ] Stock validation works.
- [ ] Razorpay Test Mode Checkout opens.
- [ ] Successful payment is verified by the backend.
- [ ] Failed payment does not result in a paid order.
- [ ] Invalid payment signatures are rejected.
- [ ] Cart is cleared after successful order processing.
- [ ] Order confirmation is displayed.
- [ ] My Orders displays persisted orders after refresh.
- [ ] User-specific orders cannot be accessed by other users.

## 🎯 Learning Outcomes

This project demonstrates practical experience with:

- Full-stack MERN application development.
- React components, forms, routing, and state management.
- REST API design and frontend/backend integration.
- Authentication and protected routes.
- MongoDB data modelling and persistence.
- Server-side business-rule validation.
- Cart and order lifecycle management.
- Payment gateway integration.
- Payment signature verification and credential management.
- Debugging, testing, and end-to-end application workflows.

## 🔮 Possible Future Improvements

- Automated backend and frontend tests.
- Razorpay webhooks for payment reconciliation when the browser disconnects.
- Idempotent payment and order processing.
- Admin dashboard for inventory and order management.
- Order status progression and shipment tracking.
- Pagination and caching for product catalogue requests.
- Deployment with production environment variables and monitoring.

## 👩‍💻 Author

**Harshita Senani**

- GitHub: [fea-exorga](https://github.com/fea-exorga)

---

*ShopKart — Browse. Discover. Add to Cart. Checkout.*
