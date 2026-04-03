const { readJsonFile } = require('../utils/dataStore');

const ORDERS_FILE = 'data/orders.json';

const normalizeLegacyOrder = (order) => {
    if (order.orderId) {
        return order;
    }

    return {
        orderId: order.id,
        createdAt: order.createdAt,
        status: order.status,
        paymentMethod: order.paymentMethod,
        address: order.shippingAddress,
        items: Array.isArray(order.products)
            ? order.products.map((product) => ({
                id: product.productId,
                name: product.name,
                quantity: product.quantity,
                price: product.price,
                image: product.image
            }))
            : [],
        subtotal: order.totalAmount || 0,
        shippingFee: 0,
        discount: 0,
        total: order.totalAmount || 0
    };
};

exports.getOrders = async (req, res) => {
    try {
        const orders = await readJsonFile(ORDERS_FILE, []);
        res.status(200).json(orders.map(normalizeLegacyOrder));
    } catch (error) {
        res.status(500).json({ message: 'Loi server khi lay du lieu don hang', error: error.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const orders = await readJsonFile(ORDERS_FILE, []);
        const normalizedOrders = orders.map(normalizeLegacyOrder);
        const order = normalizedOrders.find((item) => item.orderId === req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Khong tim thay don hang' });
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Loi server khi lay chi tiet don hang', error: error.message });
    }
};
