const express = require('express');
const path = require('path');
const { analyzeSDK } = require('./index.js');

const app = express();
const port = 4000;

// Serve static files from docs directory
app.use(express.static(path.join(__dirname, '..')));

// Also serve files from dist directory
app.use('/dist', express.static(path.join(__dirname, '../../dist')));

// Analysis endpoint
app.get('/analysis', async (req, res) => {
    try {
        const results = await analyzeSDK();
        res.json(results);
    } catch (error) {
        res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
