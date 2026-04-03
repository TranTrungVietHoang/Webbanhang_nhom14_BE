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

// API lấy danh sách sản phẩm (đã có từ trước)
app.get('/api/products', (req, res) => {
  const products = readJsonFile('products.json');
  res.json(products || []);
});

// Trang chu check server
app.get('/', (req, res) => {
  res.send('Backend API for Webbanhang Group 11 is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
