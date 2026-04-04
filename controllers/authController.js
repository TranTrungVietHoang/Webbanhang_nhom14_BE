const { readJsonFile, writeJsonFile } = require('../utils/dataStore');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const USERS_FILE = 'data/users.json';
const JWT_SECRET = 'your-secret-key-change-in-production'; // Nên đặt trong .env

// Basic encryption function (SHA256)
const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '24h' });
};

exports.register = async (req, res) => {
    try {
        const { fullName, email, phone, password } = req.body;
        
        if (!fullName || !email || !phone || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
        }

        const users = await readJsonFile(USERS_FILE, []);
        
        if (users.find(u => u.email === email)) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }

        const newUser = {
            id: Date.now(),
            fullName,
            email,
            phone,
            password: hashPassword(password),
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        await writeJsonFile(USERS_FILE, users);

        res.status(201).json({ 
            message: 'Đăng ký thành công', 
            user: { id: newUser.id, fullName, email } 
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi đăng ký', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
        }

        const users = await readJsonFile(USERS_FILE, []);
        const user = users.find(u => u.email === email);

        if (!user || user.password !== hashPassword(password)) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
        }

        // Generate token
        const token = generateToken(user.id);

        res.status(200).json({ 
            message: 'Đăng nhập thành công',
            token: token,
            user: { id: user.id, fullName: user.fullName, email: user.email } 
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi đăng nhập', error: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Vui lòng nhập email' });
        }

        const users = await readJsonFile(USERS_FILE, []);
        const user = users.find(u => u.email === email);

        if (!user) {
            return res.status(404).json({ message: 'Email không tồn tại trong hệ thống' });
        }

        // Mock password reset link sending
        res.status(200).json({ message: 'Liên kết đặt lại mật khẩu đã được gửi đến email của bạn' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi yêu cầu lấy lại mật khẩu', error: error.message });
    }
};
