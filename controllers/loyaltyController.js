const fs = require('fs/promises');
const path = require('path');

const dataFilePath = path.join(__dirname, '../data/loyalty.json');

exports.getLoyaltyProfile = async (req, res) => {
    try {
        const data = await fs.readFile(dataFilePath, 'utf-8');
        res.status(200).json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu loyalty', error: error.message });
    }
};
