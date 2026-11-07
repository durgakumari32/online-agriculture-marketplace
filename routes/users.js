// routes/users.js - Authentication & User Routes
const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const db      = require('../db');

// ============================================
// POST /api/users/register - Register new user
// ============================================
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;

        // Validate required fields
        if (!name || !email || !password || !role) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        // Validate role
        if (!['Farmer', 'Customer'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Role must be Farmer or Customer.' });
        }

        // Check if email already exists
        const [existing] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'Email already registered.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await db.query(
            'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone || null, hashedPassword, role]
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please login.',
            userId: result.insertId
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
});

// ============================================
// POST /api/users/login - Login user
// ============================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        // Find user by email
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const user = users[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        // Store user in session (excluding password)
        req.session.user = {
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
        };

        res.json({
            success: true,
            message: `Welcome back, ${user.name}!`,
            user: req.session.user
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
});

// ============================================
// POST /api/users/logout - Logout user
// ============================================
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Logout failed.' });
        }
        res.json({ success: true, message: 'Logged out successfully.' });
    });
});

// ============================================
// GET /api/users/profile - Get current user profile
// ============================================
router.get('/profile', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }
    try {
        const [rows] = await db.query(
            'SELECT user_id, name, email, phone, role, created_at FROM users WHERE user_id = ?',
            [req.session.user.user_id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        res.json({ success: true, user: rows[0] });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ============================================
// PUT /api/users/profile - Update user profile
// ============================================
router.put('/profile', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }
    try {
        const { name, phone } = req.body;
        await db.query(
            'UPDATE users SET name = ?, phone = ? WHERE user_id = ?',
            [name, phone, req.session.user.user_id]
        );
        // Update session
        req.session.user.name  = name;
        req.session.user.phone = phone;
        res.json({ success: true, message: 'Profile updated successfully.' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ============================================
// GET /api/users/all - Get all users (admin use)
// ============================================
router.get('/all', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT user_id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC'
        );
        res.json({ success: true, users: rows });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
