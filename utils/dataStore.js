const fs = require('fs/promises');
const path = require('path');

const ensureJsonFile = async (filePath, fallbackValue) => {
    try {
        await fs.access(filePath);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(filePath, JSON.stringify(fallbackValue, null, 2));
            return;
        }

        throw error;
    }
};

const readJsonFile = async (relativeFilePath, fallbackValue) => {
    const filePath = path.join(__dirname, '..', relativeFilePath);
    await ensureJsonFile(filePath, fallbackValue);
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
};

const writeJsonFile = async (relativeFilePath, data) => {
    const filePath = path.join(__dirname, '..', relativeFilePath);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};

module.exports = {
    readJsonFile,
    writeJsonFile
};
