const http = require("http");
const path = require("path");
const fs = require("fs");

const server = http.createServer((req, res) => {
    
    // Enable CORS for Vue.js frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    if (req.url === '/') {
        fs.readFile(path.join(__dirname, 'public', 'index.html'),
                    (err, content) => {
                        if (err) throw err;
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(content);
                    }
        );
    }
    
    else if (req.url === 'https://cis255.vercel.app/api' && req.method === 'POST') {
        let body = '';
        
        // Collect data chunks
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        // Process complete request
        req.on('end', () => {
            try {
                const { password } = JSON.parse(body);
                
                // Set your password here
                const CORRECT_PASSWORD = 'cardinals'; // Change this!
                if (password === CORRECT_PASSWORD) {
    // Password matches - send random subset of data
    fs.readFile(
        path.join(__dirname, 'public', 'db.json'), 'utf-8',
        (err, content) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Server error' }));
                return;
            }
            
            try {
                const data = JSON.parse(content);
                const books = data.books || []; // Assuming structure is { books: [...] }
                
                // Generate random number between 6-15
                const randomCount = Math.floor(Math.random() * 10) + 6; // 6 to 15
                
                // Shuffle array using Fisher-Yates algorithm
                const shuffled = [...books];
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }
                
                // Take random number of books
                const selectedBooks = shuffled.slice(0, Math.min(randomCount, books.length));
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ books: selectedBooks }));
            } catch (parseError) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Server error' }));
            }
        }
    );
} else {
                    // Password doesn't match
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid password' }));
                }
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Bad request' }));
            }
        });
    }
    
    else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end("<h1>404 nothing is here</h1>");
    }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Great our server is running on port ${PORT}`));
