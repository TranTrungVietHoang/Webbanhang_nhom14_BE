const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const dataPath = (file) => path.join(__dirname, 'data', file);

// Helper functions
async function readData(file) {
  try {
    const data = await fs.readFile(dataPath(file), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function writeData(file, data) {
  await fs.writeFile(dataPath(file), JSON.stringify(data, null, 2), 'utf8');
}

// --- ORDERS API ---
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await readData('orders.json');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read orders' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const orders = await readData('orders.json');
    const newOrder = req.body;
    orders.push(newOrder);
    await writeData('orders.json', orders);
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const orders = await readData('orders.json');
    const index = orders.findIndex(o => o.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Order not found' });
    
    orders[index] = { ...orders[index], ...req.body };
    await writeData('orders.json', orders);
    res.json(orders[index]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    let orders = await readData('orders.json');
    orders = orders.filter(o => o.id !== req.params.id);
    await writeData('orders.json', orders);
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// --- DISCOUNTS API ---
app.get('/api/discounts', async (req, res) => {
  try {
    const discounts = await readData('discounts.json');
    res.json(discounts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read discounts' });
  }
});

app.post('/api/discounts', async (req, res) => {
  try {
    const discounts = await readData('discounts.json');
    const newDiscount = { id: Date.now(), ...req.body }; // Simple auto-increment ID replacement
    discounts.push(newDiscount);
    await writeData('discounts.json', discounts);
    res.status(201).json(newDiscount);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create discount' });
  }
});

app.put('/api/discounts/:id', async (req, res) => {
  try {
    const discounts = await readData('discounts.json');
    const id = parseInt(req.params.id, 10) || req.params.id; // Handle both numeric or string IDs
    const index = discounts.findIndex(d => d.id === id);
    if (index === -1) return res.status(404).json({ error: 'Discount not found' });
    
    discounts[index] = { ...discounts[index], ...req.body };
    await writeData('discounts.json', discounts);
    res.json(discounts[index]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update discount' });
  }
});

app.delete('/api/discounts/:id', async (req, res) => {
  try {
    let discounts = await readData('discounts.json');
    const id = parseInt(req.params.id, 10) || req.params.id;
    discounts = discounts.filter(d => d.id !== id);
    await writeData('discounts.json', discounts);
    res.json({ message: 'Discount deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete discount' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await readData('products.json');
    res.json(products);
  } catch(e) {
    res.json([]);
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const products = await readData('products.json');
    const newProduct = { id: Date.now(), ...req.body };
    products.push(newProduct);
    await writeData('products.json', products);
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const products = await readData('products.json');
    const id = parseInt(req.params.id, 10) || req.params.id;
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ error: 'Product not found' });
    
    products[index] = { ...products[index], ...req.body };
    await writeData('products.json', products);
    res.json(products[index]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    let products = await readData('products.json');
    const id = parseInt(req.params.id, 10) || req.params.id;
    products = products.filter(p => p.id !== id);
    await writeData('products.json', products);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.get('/', (req, res) => {
  res.send('Backend API for Webbanhang Group 11 is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
