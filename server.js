// server.js - Main Express Server
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Middleware Setup
// ============================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'agri_market_secret_2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,          // set true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000  // 24 hours
    }
}));

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'images', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// ============================================
// API Routes
// ============================================
const userRoutes    = require('./routes/users');
const productRoutes = require('./routes/products');
const orderRoutes   = require('./routes/orders');

app.use('/api/users',    userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);

// ============================================
// Session Info Route (for frontend auth check)
// ============================================
app.get('/api/session', (req, res) => {
    if (req.session && req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

// ============================================
// Fallback: Serve index.html for all other routes
// ============================================
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================
// Start Server
// ============================================
app.listen(PORT, () => {
    console.log(`\n🌾 Agriculture Marketplace Server Running`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
