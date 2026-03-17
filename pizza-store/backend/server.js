require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const addressRoutes = require('./routes/addressRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const messageRoutes = require('./routes/messageRoutes');
const couponRoutes = require('./routes/couponRoutes');

connectDB();

const app = express();


// ================= SECURITY MIDDLEWARE =================

// ================= SECURITY MIDDLEWARE =================

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://deployment-react-app-98206.web.app",
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

app.use(helmet());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000
});

app.use(limiter);

app.use(express.json());


// ================= NORMAL MIDDLEWARE =================

// Force CORS headers on every request
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

app.use(cors());
app.use(express.json());


// ================= ROUTES =================

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/coupons', couponRoutes);


// ================= TEST ROUTE =================

app.get('/', (req, res) => {
  res.json({ message: '🍕 Pizza Store API is running!' });
});


// ================= ERROR HANDLER =================

app.use(errorHandler);


// ================= SERVER =================

const PORT = process.env.PORT || 5000;

let server;

if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;