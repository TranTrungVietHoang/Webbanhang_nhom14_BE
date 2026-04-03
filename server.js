const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const cartRoutes = require('./routes/cartRoutes');
const app = express();
const PORT = process.env.PORT || 3000;

// Path for data files
const DATA_PATH = path.join(__dirname, 'data', 'products.json');

// Middlewares
app.use(cors());
app.use(express.json());

// Routes from Develop Branch
const couponRoutes = require('./routes/couponRoutes');
const chatRoutes = require('./routes/chatRoutes');
const loyaltyRoutes = require('./routes/loyaltyRoutes');
const orderRoutes = require('./routes/orderRoutes');
const rewardsRoutes = require('./routes/rewardsRoutes'); // My merged routes

// --- Legacy Products Logic (Group 11) ---

// Helper function to read products
async function readProducts() {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading products:', error);
    return [];
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-session-id'],
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.use('/api/cart', cartRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/loyalty', loyaltyRoutes);
// Helper function to write products
async function writeProducts(products) {
  try {
    await fs.writeFile(DATA_PATH, JSON.stringify(products, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing products:', error);
  }
}

// API: Get all products
app.get('/api/products', async (req, res) => {
  const products = await readProducts();
  res.json(products);
});

// API: Get single product by ID
app.get('/api/products/:id', async (req, res) => {
  const products = await readProducts();
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

// --- New Service Routes Integration ---

app.use('/api/coupons', couponRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/loyalty', loyaltyRoutes); 
app.use('/api/orders', orderRoutes);
app.use('/api/user', rewardsRoutes); // Mapping my rewards to /api/user/*

// Health check
app.get('/', (req, res) => {
  res.send('Backend API for Webbanhang Group 11 is running (Merged & Cleaned)!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
