const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        // Manually parse the request body
        let body = '';
        
        // Collect data chunks
        await new Promise((resolve, reject) => {
            req.on('data', chunk => {
                body += chunk.toString();
            });
            
            req.on('end', resolve);
            req.on('error', reject);
        });
        
        const { password } = JSON.parse(body);
        const CORRECT_PASSWORD = 'cardinals';
        
        if (password !== CORRECT_PASSWORD) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        
        // Read db.json
        const dbPath = path.join(process.cwd(), 'public', 'db.json');
        const content = fs.readFileSync(dbPath, 'utf-8');
        const data = JSON.parse(content);
        const books = data.books || [];
        
        // Random selection (6-15 books)
        const randomCount = Math.floor(Math.random() * 10) + 6;
        const shuffled = [...books];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        const selectedBooks = shuffled.slice(0, Math.min(randomCount, books.length));
        
        return res.status(200).json({ books: selectedBooks });
        
    } catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
};