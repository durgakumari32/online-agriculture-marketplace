// routes/products.js - Product CRUD Routes
const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const db      = require('../db');

// ============================================
// Multer Storage Configuration for Images
// ============================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '..', 'public', 'images', 'uploads');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `product_${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

const SAMPLE_PRODUCTS = [
    // Fruits
    { product_id: 1, farmer_id: 1, farmer_name: "Raju Patel", farmer_phone: "9876543210", product_name: "Fresh Alphonso Mangoes", category: "Fruits", price: 80.00, quantity: 200, description: "Sweet, fragrant Alphonso mangoes directly picked from Ratnagiri farms. Naturally ripened with no carbide." },
    { product_id: 2, farmer_id: 1, farmer_name: "Raju Patel", farmer_phone: "9876543210", product_name: "Kashmiri Red Apples", category: "Fruits", price: 140.00, quantity: 180, description: "Crisp and juicy Grade-A apples directly transported from orchards in Kashmir valley." },
    { product_id: 3, farmer_id: 2, farmer_name: "Meena Devi", farmer_phone: "9876543211", product_name: "Organic Robusta Bananas", category: "Fruits", price: 40.00, quantity: 250, description: "Naturally sweet organic bananas grown without synthetic chemical sprays. Sold per dozen." },
    { product_id: 4, farmer_id: 2, farmer_name: "Meena Devi", farmer_phone: "9876543211", product_name: "Nagpur Sweet Oranges", category: "Fruits", price: 65.00, quantity: 150, description: "Juicy citrus oranges rich in Vitamin C, fresh from Maharashtra groves." },
    { product_id: 5, farmer_id: 3, farmer_name: "Suresh Kumar", farmer_phone: "9876543212", product_name: "Sweet Pomegranates (Anaar)", category: "Fruits", price: 130.00, quantity: 120, description: "Ruby red, antioxidant-rich fresh pomegranates with juicy seeds." },
    { product_id: 6, farmer_id: 1, farmer_name: "Raju Patel", farmer_phone: "9876543210", product_name: "Organic Farm Papaya", category: "Fruits", price: 35.00, quantity: 90, description: "Naturally ripened sweet red papaya, beneficial for digestion and immunity." },

    // Vegetables
    { product_id: 7, farmer_id: 2, farmer_name: "Meena Devi", farmer_phone: "9876543211", product_name: "Farm Fresh Red Tomatoes", category: "Vegetables", price: 25.00, quantity: 350, description: "Sun-ripened red tomatoes picked daily at dawn. Ideal for gravies, curries, and salads." },
    { product_id: 8, farmer_id: 2, farmer_name: "Meena Devi", farmer_phone: "9876543211", product_name: "Green Spinach (Palak)", category: "Vegetables", price: 15.00, quantity: 200, description: "Tender, iron-rich green spinach leaves freshly cut and bundled with root wash." },
    { product_id: 9, farmer_id: 2, farmer_name: "Meena Devi", farmer_phone: "9876543211", product_name: "Fresh Crisp Cauliflower", category: "Vegetables", price: 30.00, quantity: 180, description: "Compact white cauliflower heads grown with eco-friendly bio-fertilizers." },
    { product_id: 10, farmer_id: 1, farmer_name: "Raju Patel", farmer_phone: "9876543210", product_name: "Organic Green Broccoli", category: "Vegetables", price: 70.00, quantity: 100, description: "Nutrient-packed fresh green broccoli florets grown in hill farm soils." },
    { product_id: 11, farmer_id: 3, farmer_name: "Suresh Kumar", farmer_phone: "9876543212", product_name: "Farm Potatoes (Aloo)", category: "Vegetables", price: 22.00, quantity: 600, description: "Starchy, firm farm potatoes freshly dug up, dry-cleaned and graded for kitchen use." },
    { product_id: 12, farmer_id: 3, farmer_name: "Suresh Kumar", farmer_phone: "9876543212", product_name: "Nasik Red Onions", category: "Vegetables", price: 28.00, quantity: 500, description: "High-pungency, premium storage quality red onions from Nasik farms." },
    { product_id: 13, farmer_id: 2, farmer_name: "Meena Devi", farmer_phone: "9876543211", product_name: "Crisp Green Capsicum", category: "Vegetables", price: 45.00, quantity: 140, description: "Thick-walled, crunchy green bell peppers harvested from shade-net greenhouses." },
    { product_id: 14, farmer_id: 2, farmer_name: "Meena Devi", farmer_phone: "9876543211", product_name: "Tender Ladyfinger (Bhindi)", category: "Vegetables", price: 35.00, quantity: 160, description: "Tender, seed-soft green okras picked young to ensure superior cooking texture." },
    { product_id: 15, farmer_id: 1, farmer_name: "Raju Patel", farmer_phone: "9876543210", product_name: "Sweet Red Carrots", category: "Vegetables", price: 40.00, quantity: 220, description: "Sweet country carrots freshly pulled, high in beta-carotene and natural sugars." },

    // Grains
    { product_id: 16, farmer_id: 1, farmer_name: "Raju Patel", farmer_phone: "9876543210", product_name: "Organic Sharbati Wheat", category: "Grains", price: 38.00, quantity: 550, description: "Golden amber Sharbati wheat grains from Madhya Pradesh black soil. Yields ultra-soft rotis." },
    { product_id: 17, farmer_id: 3, farmer_name: "Suresh Kumar", farmer_phone: "9876543212", product_name: "Royal Basmati Rice (Aged)", category: "Grains", price: 95.00, quantity: 450, description: "Traditional long-grain aromatic Basmati rice aged for 2 years for non-sticky fluffy cooking." },
    { product_id: 18, farmer_id: 3, farmer_name: "Suresh Kumar", farmer_phone: "9876543212", product_name: "Organic Pearl Millet (Bajra)", category: "Grains", price: 32.00, quantity: 300, description: "Gluten-free traditional winter grain rich in iron, zinc, and dietary fiber." },
    { product_id: 19, farmer_id: 1, farmer_name: "Raju Patel", farmer_phone: "9876543210", product_name: "Organic Sorghum (Jowar)", category: "Grains", price: 36.00, quantity: 280, description: "Wholesome whole-grain Jowar, ideal for healthy diabetes-friendly bhakri/rotis." },
    { product_id: 20, farmer_id: 3, farmer_name: "Suresh Kumar", farmer_phone: "9876543212", product_name: "Whole Brown Rice", category: "Grains", price: 65.00, quantity: 200, description: "Unpolished brown rice retaining nutrient-dense bran layer and germ." },

    // Pulses
    { product_id: 21, farmer_id: 1, farmer_name: "Raju Patel", farmer_phone: "9876543210", product_name: "Fresh Green Peas (Matar)", category: "Pulses", price: 70.00, quantity: 150, description: "Sweet, juicy pods harvested fresh every morning. Shell them fresh for winter dishes." },
    { product_id: 22, farmer_id: 2, farmer_name: "Meena Devi", farmer_phone: "9876543211", product_name: "Unpolished Toor Dal (Arhar)", category: "Pulses", price: 145.00, quantity: 300, description: "High protein, unpolished pigeon peas grown without artificial colors or chemical coatings." },
    { product_id: 23, farmer_id: 2, farmer_name: "Meena Devi", farmer_phone: "9876543211", product_name: "Whole Green Moong Dal", category: "Pulses", price: 120.00, quantity: 260, description: "High-sprouting whole green gram, excellent for salads, sprouts, and traditional curries." },
    { product_id: 24, farmer_id: 3, farmer_name: "Suresh Kumar", farmer_phone: "9876543212", product_name: "Desi Black Chickpeas (Kala Chana)", category: "Pulses", price: 85.00, quantity: 220, description: "Country variety black chickpeas packed with plant-based protein and fiber." },
    { product_id: 25, farmer_id: 3, farmer_name: "Suresh Kumar", farmer_phone: "9876543212", product_name: "Jumbo Kabuli Chickpeas", category: "Pulses", price: 110.00, quantity: 180, description: "Large grain white chickpeas perfect for rich chole curries and hummus." },

    // Seeds
    { product_id: 26, farmer_id: 1, farmer_name: "Raju Patel", farmer_phone: "9876543210", product_name: "High-Yield Green Chilli Seeds", category: "Seeds", price: 50.00, quantity: 90, description: "Certified hybrid green chilli seeds with 95% germination rate for field and home gardening." },
    { product_id: 27, farmer_id: 1, farmer_name: "Raju Patel", farmer_phone: "9876543210", product_name: "Hybrid Tomato Seeds", category: "Seeds", price: 60.00, quantity: 80, description: "Disease-resistant variety producing high yield of round red tomatoes." },
    { product_id: 28, farmer_id: 3, farmer_name: "Suresh Kumar", farmer_phone: "9876543212", product_name: "Raw Organic Chia Seeds", category: "Seeds", price: 180.00, quantity: 110, description: "Superfood chia seeds rich in Omega-3 fatty acids, antioxidants, and fiber." },
    { product_id: 29, farmer_id: 3, farmer_name: "Suresh Kumar", farmer_phone: "9876543212", product_name: "Roasted Flax Seeds (Alsi)", category: "Seeds", price: 85.00, quantity: 140, description: "Golden organic flax seeds helpful for heart health and cholesterol balance." },

    // Spices
    { product_id: 30, farmer_id: 3, farmer_name: "Suresh Kumar", farmer_phone: "9876543212", product_name: "Pure Organic Turmeric Powder", category: "Spices", price: 120.00, quantity: 200, description: "High 5.5% curcumin content pure Salem turmeric ground with aromatic aroma and deep color." },
    { product_id: 31, farmer_id: 3, farmer_name: "Suresh Kumar", farmer_phone: "9876543212", product_name: "Green Cardamom Pods (Elaichi)", category: "Spices", price: 850.00, quantity: 40, description: "8mm bold green cardamom pods hand-picked from the misty hills of Idukki, Kerala." },
    { product_id: 32, farmer_id: 1, farmer_name: "Raju Patel", farmer_phone: "9876543210", product_name: "Guntur Red Chilli Powder", category: "Spices", price: 160.00, quantity: 180, description: "Pure stone-ground Guntur red chillies providing vibrant color and authentic heat." },
    { product_id: 33, farmer_id: 2, farmer_name: "Meena Devi", farmer_phone: "9876543211", product_name: "Whole Cumin Seeds (Jeera)", category: "Spices", price: 220.00, quantity: 160, description: "Cleaned aromatic whole cumin seeds from Gujarat fields. Distinct nutty aroma." },
    { product_id: 34, farmer_id: 3, farmer_name: "Suresh Kumar", farmer_phone: "9876543212", product_name: "Malabar Black Peppercorns", category: "Spices", price: 310.00, quantity: 90, description: "Sun-dried whole black peppercorns from Malabar coast with sharp, bold flavor." },

    // Dairy Products
    { product_id: 35, farmer_id: 2, farmer_name: "Meena Devi", farmer_phone: "9876543211", product_name: "Raw Organic Cow Milk", category: "Dairy Products", price: 55.00, quantity: 80, description: "Pure A2 cow milk delivered raw within hours of morning milking. Free from preservatives." },
    { product_id: 36, farmer_id: 2, farmer_name: "Meena Devi", farmer_phone: "9876543211", product_name: "Traditional Bilona Cow Ghee", category: "Dairy Products", price: 650.00, quantity: 50, description: "Handmade Bilona ghee churned from cultured curd over slow wood fire. Rich granular texture." },
    { product_id: 37, farmer_id: 2, farmer_name: "Meena Devi", farmer_phone: "9876543211", product_name: "Fresh Farm Paneer", category: "Dairy Products", price: 90.00, quantity: 70, description: "Soft, melt-in-mouth fresh cottage cheese made from pure buffalo and cow whole milk." },
    { product_id: 38, farmer_id: 2, farmer_name: "Meena Devi", farmer_phone: "9876543211", product_name: "Farm Natural Set Curd", category: "Dairy Products", price: 40.00, quantity: 90, description: "Thick, probiotic-rich clay-pot set curd made using traditional fermentation." },

    // Organic Products
    { product_id: 39, farmer_id: 1, farmer_name: "Raju Patel", farmer_phone: "9876543210", product_name: "Raw Wildflower Forest Honey", category: "Organic Products", price: 320.00, quantity: 110, description: "100% unfiltered, unpasteurized natural honey collected from wild forest hives." },
    { product_id: 40, farmer_id: 1, farmer_name: "Raju Patel", farmer_phone: "9876543210", product_name: "Cold-Pressed Mustard Oil (Kachi Ghani)", category: "Organic Products", price: 185.00, quantity: 140, description: "Pure wood-pressed mustard oil with sharp natural pungency and health benefits." },
    { product_id: 41, farmer_id: 3, farmer_name: "Suresh Kumar", farmer_phone: "9876543212", product_name: "Organic Sugarcane Jaggery (Gur)", category: "Organic Products", price: 60.00, quantity: 240, description: "Chemical-free golden jaggery made from unrefined sugarcane juice." },
    { product_id: 42, farmer_id: 1, farmer_name: "Raju Patel", farmer_phone: "9876543210", product_name: "Cold-Pressed Virgin Coconut Oil", category: "Organic Products", price: 230.00, quantity: 95, description: "Pure unrefined coconut oil extracted from fresh coconut milk without heat." },

    // Fertilizers
    { product_id: 43, farmer_id: 3, farmer_name: "Suresh Kumar", farmer_phone: "9876543212", product_name: "Organic Vermicompost (Khad)", category: "Fertilizers", price: 200.00, quantity: 80, description: "Rich earthworm-processed organic compost that restores soil biological activity (25kg bag)." },
    { product_id: 44, farmer_id: 3, farmer_name: "Suresh Kumar", farmer_phone: "9876543212", product_name: "Neem Cake Bio-Fertilizer", category: "Fertilizers", price: 160.00, quantity: 60, description: "Dual-purpose organic fertilizer and natural soil pest repellent cake." },
    { product_id: 45, farmer_id: 1, farmer_name: "Raju Patel", farmer_phone: "9876543210", product_name: "Aged Cow Dung Manure", category: "Fertilizers", price: 120.00, quantity: 100, description: "Well-decomposed, odorless dry cow manure packed with macro and micronutrients." },
    { product_id: 46, farmer_id: 1, farmer_name: "Raju Patel", farmer_phone: "9876543210", product_name: "Liquid Seaweed Extract", category: "Fertilizers", price: 275.00, quantity: 50, description: "Natural bio-stimulant for foliar spray that boosts flowering, root expansion, and plant yield." }
];

// ============================================
// GET /api/products - Get all products (with optional filters)
// ============================================
router.get('/', async (req, res) => {
    const { category, search, farmer_id } = req.query;

    const filterFallback = () => {
        let list = [...SAMPLE_PRODUCTS];
        if (category && category !== 'all') {
            list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
        }
        if (search) {
            const s = search.toLowerCase();
            list = list.filter(p =>
                p.product_name.toLowerCase().includes(s) ||
                p.category.toLowerCase().includes(s) ||
                p.description.toLowerCase().includes(s) ||
                p.farmer_name.toLowerCase().includes(s)
            );
        }
        if (farmer_id) {
            list = list.filter(p => p.farmer_id == farmer_id);
        }
        return list;
    };

    try {
        let query = `
            SELECT p.*, u.name AS farmer_name, u.phone AS farmer_phone
            FROM products p
            JOIN users u ON p.farmer_id = u.user_id
            WHERE p.quantity > 0
        `;
        const params = [];

        if (category && category !== 'all') {
            query += ' AND p.category = ?';
            params.push(category);
        }
        if (search) {
            query += ' AND (p.product_name LIKE ? OR p.description LIKE ? OR p.category LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (farmer_id) {
            query += ' AND p.farmer_id = ?';
            params.push(farmer_id);
        }

        query += ' ORDER BY p.created_at DESC';

        const [rows] = await db.query(query, params);
        if (rows && rows.length > 0) {
            return res.json({ success: true, products: rows });
        }

        // If MySQL table is empty, return default sample products
        res.json({ success: true, products: filterFallback() });
    } catch (error) {
        console.warn('Database query failed or uninitialized, returning sample products:', error.message);
        res.json({ success: true, products: filterFallback() });
    }
});

// ============================================
// GET /api/products/farmer - Get products by logged-in farmer
// ============================================
router.get('/farmer', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'Farmer') {
        return res.status(401).json({ success: false, message: 'Farmer access required.' });
    }
    try {
        const [rows] = await db.query(
            `SELECT p.*, u.name AS farmer_name
             FROM products p
             JOIN users u ON p.farmer_id = u.user_id
             WHERE p.farmer_id = ?
             ORDER BY p.created_at DESC`,
            [req.session.user.user_id]
        );
        res.json({ success: true, products: rows });
    } catch (error) {
        console.error('Get farmer products error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ============================================
// GET /api/products/:id - Get single product
// ============================================
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT p.*, u.name AS farmer_name, u.phone AS farmer_phone, u.email AS farmer_email
             FROM products p
             JOIN users u ON p.farmer_id = u.user_id
             WHERE p.product_id = ?`,
            [req.params.id]
        );
        if (rows && rows.length > 0) {
            return res.json({ success: true, product: rows[0] });
        }

        const fallback = SAMPLE_PRODUCTS.find(p => p.product_id == req.params.id);
        if (fallback) {
            return res.json({ success: true, product: fallback });
        }
        res.status(404).json({ success: false, message: 'Product not found.' });
    } catch (error) {
        const fallback = SAMPLE_PRODUCTS.find(p => p.product_id == req.params.id);
        if (fallback) {
            return res.json({ success: true, product: fallback });
        }
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ============================================
// POST /api/products - Add new product (Farmer only)
// ============================================
router.post('/', upload.single('image'), async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'Farmer') {
        return res.status(401).json({ success: false, message: 'Farmer access required.' });
    }
    try {
        const { product_name, category, price, quantity, description } = req.body;

        if (!product_name || !category || !price || !quantity) {
            return res.status(400).json({ success: false, message: 'Product name, category, price, and quantity are required.' });
        }

        const image_url = req.file ? `/images/uploads/${req.file.filename}` : null;

        const [result] = await db.query(
            `INSERT INTO products (farmer_id, product_name, category, price, quantity, description, image_url)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [req.session.user.user_id, product_name, category, parseFloat(price), parseInt(quantity), description || '', image_url]
        );

        res.status(201).json({
            success: true,
            message: 'Product added successfully!',
            productId: result.insertId
        });
    } catch (error) {
        console.error('Add product error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ============================================
// PUT /api/products/:id - Update product (Farmer only)
// ============================================
router.put('/:id', upload.single('image'), async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'Farmer') {
        return res.status(401).json({ success: false, message: 'Farmer access required.' });
    }
    try {
        const { product_name, category, price, quantity, description } = req.body;

        // Check ownership
        const [existing] = await db.query(
            'SELECT * FROM products WHERE product_id = ? AND farmer_id = ?',
            [req.params.id, req.session.user.user_id]
        );
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found or access denied.' });
        }

        let image_url = existing[0].image_url;
        if (req.file) {
            image_url = `/images/uploads/${req.file.filename}`;
        }

        await db.query(
            `UPDATE products
             SET product_name = ?, category = ?, price = ?, quantity = ?, description = ?, image_url = ?
             WHERE product_id = ? AND farmer_id = ?`,
            [product_name, category, parseFloat(price), parseInt(quantity), description || '', image_url,
             req.params.id, req.session.user.user_id]
        );

        res.json({ success: true, message: 'Product updated successfully!' });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ============================================
// DELETE /api/products/:id - Delete product (Farmer only)
// ============================================
router.delete('/:id', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'Farmer') {
        return res.status(401).json({ success: false, message: 'Farmer access required.' });
    }
    try {
        // Check ownership
        const [existing] = await db.query(
            'SELECT * FROM products WHERE product_id = ? AND farmer_id = ?',
            [req.params.id, req.session.user.user_id]
        );
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found or access denied.' });
        }

        await db.query('DELETE FROM products WHERE product_id = ? AND farmer_id = ?',
            [req.params.id, req.session.user.user_id]);

        res.json({ success: true, message: 'Product deleted successfully!' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
