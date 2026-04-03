const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Helper function to read JSON files
const readJsonFile = (filename) => {
  const filePath = path.join(__dirname, 'data', filename);
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return null;
  }
};

// API lấy thống kê dashboard
app.get('/api/dashboard/stats', (req, res) => {
  const data = readJsonFile('dashboard.json');
  if (data) {
    res.json(data.stats);
  } else {
    res.status(500).json({ error: 'Could not read stats data' });
  }
});

// API lấy dữ liệu biểu đồ doanh thu
app.get('/api/dashboard/chart', (req, res) => {
  const data = readJsonFile('dashboard.json');
  if (data) {
    res.json(data.revenueChart);
  } else {
    res.status(500).json({ error: 'Could not read chart data' });
  }
});

// API lấy danh sách đơn hàng gần đây
app.get('/api/dashboard/recent-orders', (req, res) => {
  const orders = readJsonFile('orders.json');
  if (orders) {
    res.json(orders);
  } else {
    res.status(500).json({ error: 'Could not read orders data' });
  }
});

// Helper function to write JSON files
const writeJsonFile = (filename, data) => {
  const filePath = path.join(__dirname, 'data', filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filename}:`, err);
    return false;
  }
};

// API lấy danh sách sản phẩm (đã có từ trước)
app.get('/api/products', (req, res) => {
  const products = readJsonFile('products.json');
  res.json(products || []);
});

// API thêm sản phẩm mới
app.get('/api/products/:id', (req, res) => {
  const products = readJsonFile('products.json');
  const product = products?.find(p => p.id === req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.post('/api/products', (req, res) => {
  const products = readJsonFile('products.json') || [];
  const newProduct = req.body;
  
  // Basic validation
  if (!newProduct.id || !newProduct.name) {
    return res.status(400).json({ error: 'ID and Name are required' });
  }

  products.push(newProduct);
  if (writeJsonFile('products.json', products)) {
    res.status(201).json(newProduct);
  } else {
    res.status(500).json({ error: 'Failed to write data' });
  }
});

// API cập nhật sản phẩm
app.put('/api/products/:id', (req, res) => {
  let products = readJsonFile('products.json') || [];
  const id = req.params.id;
  const updatedProduct = req.body;

  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...updatedProduct };
    if (writeJsonFile('products.json', products)) {
      res.json(products[index]);
    } else {
      res.status(500).json({ error: 'Failed to write data' });
    }
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// API xóa sản phẩm
app.delete('/api/products/:id', (req, res) => {
  let products = readJsonFile('products.json') || [];
  const id = req.params.id;
  
  const filteredProducts = products.filter(p => p.id !== id);
  if (products.length !== filteredProducts.length) {
    if (writeJsonFile('products.json', filteredProducts)) {
      res.status(204).send();
    } else {
      res.status(500).json({ error: 'Failed to write data' });
    }
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Trang chu check server
app.get('/', (req, res) => {
  res.send('Backend API for Webbanhang Group 11 is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
