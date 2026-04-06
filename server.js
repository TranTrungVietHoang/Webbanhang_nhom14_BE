const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-session-id'],
};

app.use(cors(corsOptions));
app.use(express.json());

// --- AUTH API ---
app.use('/api/auth', authRoutes);

const dataPath = (file) => path.join(__dirname, 'data', file);

// Helper functions (Async)
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

// --- DASHBOARD API ---
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const data = await readData('dashboard.json');
    res.json(data.stats);
  } catch (err) {
    res.status(500).json({ error: 'Could not read stats data' });
  }
});

app.get('/api/dashboard/chart', async (req, res) => {
  try {
    const data = await readData('dashboard.json');
    res.json(data.revenueChart);
  } catch (err) {
    res.status(500).json({ error: 'Could not read chart data' });
  }
});

app.get('/api/dashboard/recent-orders', async (req, res) => {
  try {
    const orders = await readData('orders.json');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Could not read orders data' });
  }
});

// --- CUSTOMERS API ---
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await readData('customers.json');
    res.json(customers || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read customers' });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const customers = await readData('customers.json') || [];
    const newCustomer = req.body;
    
    if (!newCustomer.name || !newCustomer.email) {
      return res.status(400).json({ error: 'Name and Email are required' });
    }

    const id = customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1;
    const customerToAdd = { ...newCustomer, id, totalOrders: 0, totalSpent: 0, status: 'Hoạt động' };
    
    customers.push(customerToAdd);
    await writeData('customers.json', customers);
    res.status(201).json(customerToAdd);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    let customers = await readData('customers.json') || [];
    const id = parseInt(req.params.id);
    const updatedData = req.body;

    const index = customers.findIndex(c => c.id === id);
    if (index !== -1) {
      customers[index] = { ...customers[index], ...updatedData };
      await writeData('customers.json', customers);
      res.json(customers[index]);
    } else {
      res.status(404).json({ error: 'Customer not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// --- ORDERS API (develop) ---
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

// --- DISCOUNTS API (develop) ---
app.get('/api/discounts', async (req, res) => {
  try {
    const discounts = await readData('discounts.json');
    res.json(discounts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read discounts' });
  }
});

// --- PRODUCTS API (Merged & Compatible) ---
app.get('/api/products', async (req, res) => {
  try {
    const products = await readData('products.json');
    // Map to keep frontend compatible (stock -> quantity, status calculation)
    const mappedProducts = products.map(p => ({
      ...p,
      quantity: p.stock !== undefined ? p.stock : (p.quantity || 0),
      status: p.stock > 0 ? 'Còn hàng' : 'Hết hàng'
    }));
    res.json(mappedProducts);
  } catch (e) {
    res.json([]);
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const products = await readData('products.json');
    const newProduct = { id: Date.now(), ...req.body };
    // Map backend expected fields
    if (newProduct.quantity !== undefined && newProduct.stock === undefined) {
      newProduct.stock = newProduct.quantity;
    }
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

    const updatedData = { ...req.body };
    if (updatedData.quantity !== undefined) {
      updatedData.stock = updatedData.quantity;
    }

    products[index] = { ...products[index], ...updatedData };
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


//---------------------------------