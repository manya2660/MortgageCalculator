const express = require('express');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api', apiRoutes);

// Page Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/emi-calculator', (req, res) => res.sendFile(path.join(__dirname, 'public', 'emi-calculator.html')));
app.get('/buy-vs-rent', (req, res) => res.sendFile(path.join(__dirname, 'public', 'buy-vs-rent.html')));
app.get('/prepayment', (req, res) => res.sendFile(path.join(__dirname, 'public', 'prepayment.html')));
app.get('/advisor', (req, res) => res.sendFile(path.join(__dirname, 'public', 'advisor.html')));

// Fallback to index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`MortgagePro server running at http://localhost:${PORT}`);
});
