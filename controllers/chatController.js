const fs = require('fs/promises');
const path = require('path');

const dataFilePath = path.join(__dirname, '../data/messages.json');

const readMessagesData = async () => {
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

const writeMessagesData = async (data) => {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
};

exports.getMessages = async (req, res) => {
    try {
        const messages = await readMessagesData();
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi lấy tin nhắn', error: error.message });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { text, sender } = req.body;
        const messages = await readMessagesData();
        
        const newMessage = {
            id: Date.now().toString(),
            text,
            sender: sender || 'user',
            timestamp: new Date().toISOString()
        };
        
        messages.push(newMessage);
        await writeMessagesData(messages);
        
        // Trả về tin nhắn mới tạo
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi gửi tin nhắn', error: error.message });
    }
};
