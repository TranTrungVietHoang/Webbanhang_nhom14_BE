const fs = require('fs/promises');
const path = require('path');

const dataFilePath = path.join(__dirname, '../data/coupons.json');

// Helper đọc file JSON
const readCouponsData = async () => {
    try {
        const data = await fs.readFile(dataFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(dataFilePath, '[]');
            return [];
        }
        throw error;
    }
};

// Helper ghi file JSON
const writeCouponsData = async (data) => {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
};

// Lấy danh sách tất cả coupons
exports.getAllCoupons = async (req, res) => {
    try {
        const coupons = await readCouponsData();
        res.status(200).json(coupons);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu coupon', error: error.message });
    }
};

// Lấy 1 coupon theo ID
exports.getCouponById = async (req, res) => {
    try {
        const { id } = req.params;
        const coupons = await readCouponsData();
        const coupon = coupons.find(c => c.id === id);
        
        if (!coupon) {
            return res.status(404).json({ message: 'Không tìm thấy coupon' });
        }
        res.status(200).json(coupon);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Tạo một coupon mới
exports.createCoupon = async (req, res) => {
    try {
        const newCouponData = req.body;
        const coupons = await readCouponsData();
        
        const newId = Date.now().toString();
        const newCoupon = {
            id: newId,
            ...newCouponData,
            // Đảm bảo isActive có giá trị mặc định là true nếu không gửi lên
            isActive: newCouponData.isActive !== undefined ? newCouponData.isActive : true
        };
        
        coupons.push(newCoupon);
        await writeCouponsData(coupons);
        
        res.status(201).json(newCoupon);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi tạo coupon', error: error.message });
    }
};

// Cập nhật một coupon
exports.updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const coupons = await readCouponsData();
        const index = coupons.findIndex(c => c.id === id);
        
        if (index === -1) {
            return res.status(404).json({ message: 'Không tìm thấy coupon để cập nhật' });
        }
        
        // Merge dữ liệu
        coupons[index] = { ...coupons[index], ...updateData };
        
        await writeCouponsData(coupons);
        res.status(200).json(coupons[index]);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi cập nhật coupon', error: error.message });
    }
};

// Xoá một coupon
exports.deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const coupons = await readCouponsData();
        const initialLength = coupons.length;
        
        const filteredCoupons = coupons.filter(c => c.id !== id);
        
        if (filteredCoupons.length === initialLength) {
            return res.status(404).json({ message: 'Không tìm thấy coupon để xoá' });
        }
        
        await writeCouponsData(filteredCoupons);
        res.status(200).json({ message: 'Xoá coupon thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi xoá coupon', error: error.message });
    }
};
