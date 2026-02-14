const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fsSync.existsSync(DATA_DIR)) {
    fsSync.mkdirSync(DATA_DIR, { recursive: true });
}

class FileDatabase {
    async get(key) {
        try {
            const filePath = path.join(DATA_DIR, `${key}.json`);
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            return null;
        }
    }

    async set(key, value) {
        const filePath = path.join(DATA_DIR, `${key}.json`);
        await fs.writeFile(filePath, JSON.stringify(value, null, 2));
        return value;
    }

    async list() {
        try {
            const files = await fs.readdir(DATA_DIR);
            return files.map(f => f.replace('.json', ''));
        } catch {
            return [];
        }
    }

    async delete(key) {
        try {
            const filePath = path.join(DATA_DIR, `${key}.json`);
            await fs.unlink(filePath);
            return true;
        } catch (error) {
            return false;
        }
    }
}

module.exports = FileDatabase;
