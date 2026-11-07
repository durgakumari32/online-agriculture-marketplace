// routes/orders.js - Order Management Routes
const express = require('express');
const router  = express.Router();
const db      = require('../db');

// ============================================
// POST /api/orders - Place a new order
// ============================================
router.post('/', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'Customer') {
        return res.status(401).json({ success: false, message: 'Customer access required.' });
    }
    try {
        const { items, delivery_address, total_amount } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty.' });
        }
        if (!delivery_address) {
            return res.status(400).json({ success: false, message: 'Delivery address is required.' });
        }

        // Validate stock availability for all items
        for (const item of items) {
            const [product] = await db.query(
                'SELECT quantity, product_name FROM products WHERE product_id = ?',
                [item.product_id]
            );
            if (product.length === 0) {
                return res.status(400).json({ success: false, message: `Product not found.` });
            }
            if (product[0].quantity < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for "${product[0].product_name}". Available: ${product[0].quantity}`
                });
            }
        }

        const orderDate = new Date().toISOString().split('T')[0];

        // Insert order
        const [orderResult] = await db.query(
            'INSERT INTO orders (customer_id, order_date, total_amount, delivery_address, status) VALUES (?, ?, ?, ?, ?)',
            [req.session.user.user_id, orderDate, total_amount, delivery_address, 'Pending']
        );
        const orderId = orderResult.insertId;

        // Insert order items and update stock
        for (const item of items) {
            await db.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price]
            );
            // Reduce product quantity
            await db.query(
                'UPDATE products SET quantity = quantity - ? WHERE product_id = ?',
                [item.quantity, item.product_id]
            );
        }

        res.status(201).json({
            success: true,
            message: 'Order placed successfully!',
            orderId
        });
    } catch (error) {
        console.error('Place order error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ============================================
// GET /api/orders/my - Customer's own orders
// ============================================
router.get('/my', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }
    try {
        let query, params;
        if (req.session.user.role === 'Customer') {
            query = `
                SELECT o.*, u.name AS customer_name,
                       COUNT(oi.item_id) AS item_count
                FROM orders o
                JOIN users u ON o.customer_id = u.user_id
                LEFT JOIN order_items oi ON o.order_id = oi.order_id
                WHERE o.customer_id = ?
                GROUP BY o.order_id
                ORDER BY o.created_at DESC
            `;
            params = [req.session.user.user_id];
        } else {
            // Farmer: see orders containing their products
            query = `
                SELECT DISTINCT o.*, u.name AS customer_name,
                       COUNT(oi.item_id) AS item_count
                FROM orders o
                JOIN users u ON o.customer_id = u.user_id
                JOIN order_items oi ON o.order_id = oi.order_id
                JOIN products p ON oi.product_id = p.product_id
                WHERE p.farmer_id = ?
                GROUP BY o.order_id
                ORDER BY o.created_at DESC
            `;
            params = [req.session.user.user_id];
        }

        const [orders] = await db.query(query, params);
        res.json({ success: true, orders });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ============================================
// GET /api/orders/:id - Get single order details
// ============================================
router.get('/:id', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }
    try {
        const [orders] = await db.query(
            `SELECT o.*, u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone
             FROM orders o
             JOIN users u ON o.customer_id = u.user_id
             WHERE o.order_id = ?`,
            [req.params.id]
        );
        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        const [items] = await db.query(
            `SELECT oi.*, p.product_name, p.category, p.image_url, u.name AS farmer_name
             FROM order_items oi
             JOIN products p ON oi.product_id = p.product_id
             JOIN users u ON p.farmer_id = u.user_id
             WHERE oi.order_id = ?`,
            [req.params.id]
        );

        res.json({ success: true, order: orders[0], items });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ============================================
// PUT /api/orders/:id/status - Update order status (Farmer)
// ============================================
router.put('/:id/status', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'Farmer') {
        return res.status(401).json({ success: false, message: 'Farmer access required.' });
    }
    try {
        const { status } = req.body;
        const validStatuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value.' });
        }

        await db.query('UPDATE orders SET status = ? WHERE order_id = ?', [status, req.params.id]);
        res.json({ success: true, message: 'Order status updated successfully.' });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ============================================
// GET /api/orders - Get all orders (admin/stats)
// ============================================
router.get('/', async (req, res) => {
    try {
        const [orders] = await db.query(
            `SELECT o.*, u.name AS customer_name, COUNT(oi.item_id) AS item_count
             FROM orders o
             JOIN users u ON o.customer_id = u.user_id
             LEFT JOIN order_items oi ON o.order_id = oi.order_id
             GROUP BY o.order_id
             ORDER BY o.created_at DESC`
        );
        res.json({ success: true, orders });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
