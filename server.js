const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_PATH = path.join(__dirname, 'data', 'products.json');
const REWARDS_PATH = path.join(__dirname, 'data', 'user_rewards.json');

app.use(cors());
app.use(express.json());

// Helper function to read rewards
async function readRewards() {
  try {
    const data = await fs.readFile(REWARDS_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading rewards:', error);
    return {};
  }
}

// API: Get user rewards data
app.get('/api/user/rewards', async (req, res) => {
  const data = await readRewards();
  res.json(data.user);
});

// API: Get user points history
app.get('/api/user/history', async (req, res) => {
  const data = await readRewards();
  res.json(data.history);
});

// API: Get user missions
app.get('/api/user/missions', async (req, res) => {
  const data = await readRewards();
  res.json(data.missions);
});

// API: Get available rewards list
app.get('/api/user/available-rewards', async (req, res) => {
  const data = await readRewards();
  res.json(data.availableRewards);
});

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

// API: Add new product
app.post('/api/products', async (req, res) => {
  const products = await readProducts();
  const newProduct = {
    id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
    ...req.body,
    rating: req.body.rating || 5,
    sold: req.body.sold || 0,
    reviews: req.body.reviews || []
  };
  products.push(newProduct);
  await writeProducts(products);
  res.status(201).json(newProduct);
});

// API: Update product
app.put('/api/products/:id', async (req, res) => {
  let products = await readProducts();
  const index = products.findIndex(p => p.id === parseInt(req.params.id));
  if (index !== -1) {
    products[index] = { ...products[index], ...req.body, id: parseInt(req.params.id) };
    await writeProducts(products);
    res.json(products[index]);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

// API: Delete product
app.delete('/api/products/:id', async (req, res) => {
  let products = await readProducts();
  const initialLength = products.length;
  products = products.filter(p => p.id !== parseInt(req.params.id));
  if (products.length < initialLength) {
    await writeProducts(products);
    res.json({ message: 'Product deleted successfully' });
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

// Health check
app.get('/', (req, res) => {
  res.send('Backend API for Webbanhang Group 11 is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
