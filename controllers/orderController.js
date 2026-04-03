const fs = require('fs/promises');
const path = require('path');

const dataFilePath = path.join(__dirname, '../data/orders.json');

exports.getOrders = async (req, res) => {
    try {
        const data = await fs.readFile(dataFilePath, 'utf-8');
        res.status(200).json(JSON.parse(data));
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(200).json([]);
        } else {
            res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu đơn hàng', error: error.message });
        }
    }
};
