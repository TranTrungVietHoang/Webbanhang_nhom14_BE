const express = require('express');
const cors = require('cors');
const products = require('./data/products.json');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const couponRoutes = require('./routes/couponRoutes');
const chatRoutes = require('./routes/chatRoutes');

// API lay danh sach san pham
app.get('/api/products', (req, res) => {
  res.json(products);
});

// API quan ly ma giam gia
app.use('/api/coupons', couponRoutes);

// API quan ly chat ho tro khach hang
app.use('/api/chat', chatRoutes);

// Trang chu check server
app.get('/', (req, res) => {
  res.send('Backend API for Webbanhang Group 11 is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
