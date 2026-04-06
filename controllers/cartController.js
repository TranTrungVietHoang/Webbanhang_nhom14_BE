const { readJsonFile, writeJsonFile } = require('../utils/dataStore');

const CARTS_FILE = 'data/carts.json';
const ORDERS_FILE = 'data/orders.json';
const PRODUCTS_FILE = 'data/products.json';
const VALID_PAYMENT_METHODS = new Set(['card', 'transfer', 'cash']);

const generateSessionId = () =>
    `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

const generateOrderId = () =>
    `ORD_${Date.now()}_${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

const calculateTotal = (items) =>
    items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

const getItemCount = (items) =>
    items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

const buildCartResponse = (sessionId, items) => ({
    sessionId,
    items,
    total: calculateTotal(items),
    itemCount: getItemCount(items)
});

const normalizeText = (value) => String(value || '').trim();

const getOrCreateCart = (carts, sessionId) => {
    if (!carts[sessionId]) {
        carts[sessionId] = {
            sessionId,
            items: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    return carts[sessionId];
};

exports.getCart = async (req, res) => {
    try {
        const carts = await readJsonFile(CARTS_FILE, {});
        let sessionId = normalizeText(req.headers['x-session-id']);

        if (!sessionId) {
            sessionId = generateSessionId();
            res.header('X-Session-Id', sessionId);
        }

        const cart = getOrCreateCart(carts, sessionId);
        await writeJsonFile(CARTS_FILE, carts);

        res.status(200).json(buildCartResponse(sessionId, cart.items));
    } catch (error) {
        res.status(500).json({ message: 'Loi server khi lay gio hang', error: error.message });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const sessionId = normalizeText(req.headers['x-session-id']) || generateSessionId();
        const productId = Number(req.body.productId);
        const quantity = Number(req.body.quantity || 1);

        if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({ message: 'productId hoac quantity khong hop le' });
        }

        const [products, carts] = await Promise.all([
            readJsonFile(PRODUCTS_FILE, []),
            readJsonFile(CARTS_FILE, {})
        ]);
        const product = products.find((item) => Number(item.id) === productId);

        if (!product) {
            return res.status(404).json({ message: 'Khong tim thay san pham' });
        }

        const cart = getOrCreateCart(carts, sessionId);
        const existingItem = cart.items.find((item) => Number(item.id) === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity,
                image: product.image
            });
        }

        cart.updatedAt = new Date().toISOString();
        await writeJsonFile(CARTS_FILE, carts);

        res.status(200).json({
            message: 'Product added to cart',
            ...buildCartResponse(sessionId, cart.items)
        });
    } catch (error) {
        res.status(500).json({ message: 'Loi server khi them vao gio hang', error: error.message });
    }
};

exports.updateCartItem = async (req, res) => {
    try {
        const sessionId = normalizeText(req.headers['x-session-id']);
        const productId = Number(req.params.productId);
        const quantity = Number(req.body.quantity);

        if (!sessionId) {
            return res.status(400).json({ message: 'Thieu x-session-id' });
        }

        if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({ message: 'productId hoac quantity khong hop le' });
        }

        const carts = await readJsonFile(CARTS_FILE, {});
        const cart = carts[sessionId];

        if (!cart) {
            return res.status(404).json({ message: 'Khong tim thay gio hang' });
        }

        const item = cart.items.find((entry) => Number(entry.id) === productId);
        if (!item) {
            return res.status(404).json({ message: 'San pham khong co trong gio hang' });
        }

        item.quantity = quantity;
        cart.updatedAt = new Date().toISOString();
        await writeJsonFile(CARTS_FILE, carts);

        res.status(200).json({
            message: 'Product quantity updated',
            ...buildCartResponse(sessionId, cart.items)
        });
    } catch (error) {
        res.status(500).json({ message: 'Loi server khi cap nhat gio hang', error: error.message });
    }
};

exports.removeCartItem = async (req, res) => {
    try {
        const sessionId = normalizeText(req.headers['x-session-id']);
        const productId = Number(req.params.productId);

        if (!sessionId) {
            return res.status(400).json({ message: 'Thieu x-session-id' });
        }

        const carts = await readJsonFile(CARTS_FILE, {});
        const cart = carts[sessionId];

        if (!cart) {
            return res.status(404).json({ message: 'Khong tim thay gio hang' });
        }

        const initialLength = cart.items.length;
        cart.items = cart.items.filter((item) => Number(item.id) !== productId);

        if (cart.items.length === initialLength) {
            return res.status(404).json({ message: 'San pham khong co trong gio hang' });
        }

        cart.updatedAt = new Date().toISOString();
        await writeJsonFile(CARTS_FILE, carts);

        res.status(200).json({
            message: 'Product removed from cart',
            ...buildCartResponse(sessionId, cart.items)
        });
    } catch (error) {
        res.status(500).json({ message: 'Loi server khi xoa san pham', error: error.message });
    }
};

exports.clearCart = async (req, res) => {
    try {
        const sessionId = normalizeText(req.headers['x-session-id']);

        if (!sessionId) {
            return res.status(400).json({ message: 'Thieu x-session-id' });
        }

        const carts = await readJsonFile(CARTS_FILE, {});
        const cart = carts[sessionId];

        if (!cart) {
            return res.status(404).json({ message: 'Khong tim thay gio hang' });
        }

        cart.items = [];
        cart.updatedAt = new Date().toISOString();
        await writeJsonFile(CARTS_FILE, carts);

        res.status(200).json({
            message: 'Cart cleared',
            ...buildCartResponse(sessionId, cart.items)
        });
    } catch (error) {
        res.status(500).json({ message: 'Loi server khi xoa gio hang', error: error.message });
    }
};

exports.checkout = async (req, res) => {
    try {
        const sessionId = normalizeText(req.headers['x-session-id']);
        const customerName = normalizeText(req.body.customerName);
        const phoneNumber = normalizeText(req.body.phoneNumber);
        const address = normalizeText(req.body.address);
        const paymentMethod = normalizeText(req.body.paymentMethod);
        const email = normalizeText(req.body.email);
        const note = normalizeText(req.body.note);
        const promoCode = normalizeText(req.body.promoCode);

        if (!sessionId) {
            return res.status(400).json({ message: 'Thieu x-session-id' });
        }

        if (!customerName || !phoneNumber || !address || !paymentMethod) {
            return res.status(400).json({ message: 'Thieu thong tin thanh toan bat buoc' });
        }

        if (!VALID_PAYMENT_METHODS.has(paymentMethod)) {
            return res.status(400).json({ message: 'Phuong thuc thanh toan khong hop le' });
        }

        const [carts, orders] = await Promise.all([
            readJsonFile(CARTS_FILE, {}),
            readJsonFile(ORDERS_FILE, [])
        ]);
        const cart = carts[sessionId];

        if (!cart) {
            return res.status(404).json({ message: 'Khong tim thay gio hang' });
        }

        if (!Array.isArray(cart.items) || cart.items.length === 0) {
            return res.status(400).json({ message: 'Gio hang trong' });
        }

        const orderItems = cart.items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: Number(item.quantity),
            price: Number(item.price),
            image: item.image
        }));

        const subtotal = calculateTotal(orderItems);
        const shippingFee = subtotal > 0 ? 30000 : 0;
        const discount = 0;
        const total = subtotal + shippingFee - discount;

        const order = {
            orderId: generateOrderId(),
            sessionId,
            customerName,
            phoneNumber,
            address,
            email,
            note,
            promoCode,
            paymentMethod,
            items: orderItems,
            subtotal,
            shippingFee,
            discount,
            total,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        orders.unshift(order);
        cart.items = [];
        cart.updatedAt = new Date().toISOString();

        await Promise.all([
            writeJsonFile(ORDERS_FILE, orders),
            writeJsonFile(CARTS_FILE, carts)
        ]);

        res.status(200).json({
            message: 'Order placed successfully',
            order
        });
    } catch (error) {
        res.status(500).json({ message: 'Loi server khi thanh toan', error: error.message });
    }
};
