
Admin Login Credentials ->  email      : baachin22@gmail.com
                            password   :  Baachi@123

The Super admin can  acess to make admin and remove admin 



#  Pizza Store - Full Stack Web Application

A modern, responsive pizza ordering platform built with React, Node.js, Express, and MongoDB.

##  Features

### Customer
- **User Authentication**: Secure Sign Up and Login.
- **Responsive Menu**: Browse pizzas, sides, and beverages.
- **Dynamic Cart**: Add/remove items and update quantities.
- **Secure Checkout**: Multiple address management and coupon application.
- **Store Pickup/Delivery**: Flexible order fulfillment modes.
- **Order Tracking**: Real-time status updates via notifications.

### Admin
- **Manage Menu**: Add, Edit, or Delete items.
- **Manage Orders**: Accept, Reject, and track all customer orders.
- **Revenue Dashboard**: Monthly sales and revenue statistics.
- **Coupon Management**: Create and manage promotional discounts.

##  Technology Stack

**Frontend:**
- React (Hooks, Context API)
- Bootstrap 5 (Styling)
- SweetAlert2 (Interactive Modals)
- Axios (API Communication)

**Backend:**
- Node.js & Express
- MongoDB & Mongoose
- JSON Web Tokens (JWT) for Auth
- Bcrypt.js (Password Hashing)
- Mocha & Chai (Testing)

##  Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (Running locally or MongoDB Atlas)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add your configurations (port, mongo_uri, jwt_secret).
   - **For MongoDB Atlas**: 
     - Update `MONGO_URI` with your cluster connection string.
     - Ensure you set Network Access to `0.0.0.0/0` in the Atlas dashboard.
4. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React app:
   ```bash
   npm start
   ```

##  Testing

### Backend Tests
Run the unit tests for the backend:
```bash
cd backend
npm test
```

### Frontend Tests
Run the component and E2E tests:
```bash
cd frontend
npm test
```

To run the specific E2E workflow test:
```bash
cd frontend
npm test src/tests/E2E.test.js
```

##  API Endpoints

### Auth
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Menu
- `GET /api/menu` - Fetch all menu items
- `GET /api/menu/categories` - Fetch all categories

### Orders
- `POST /api/orders` - Place a new order
- `GET /api/orders/my-orders` - Fetch user orders
- `GET /api/orders` - Fetch all orders (Admin)

### Cart
- `GET /api/cart` - View cart
- `POST /api/cart/add` - Add item to cart
