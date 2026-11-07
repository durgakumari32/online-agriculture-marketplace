// ============================================================
// main.js - Shared Utility Functions for AgroMarket
// ============================================================

// ============================================================
// AUTH FUNCTIONS
// ============================================================

/**
 * Check authentication status from server session
 * Returns the user object or null
 */
async function checkAuth() {
    try {
        const res  = await fetch('/api/session');
        const data = await res.json();

        const authButtons  = document.getElementById('authButtons');
        const userMenu     = document.getElementById('userMenu');
        const cartNav      = document.getElementById('cartNav');
        const dashboardNav = document.getElementById('dashboardNav');
        const userNameEl   = document.getElementById('userName');

        if (data.loggedIn) {
            const user = data.user;
            if (authButtons)  authButtons.classList.add('hidden');
            if (userMenu)     { userMenu.classList.remove('hidden'); }
            if (userNameEl)   userNameEl.textContent = user.name;

            if (user.role === 'Customer') {
                if (cartNav)      cartNav.classList.remove('hidden');
                if (dashboardNav) dashboardNav.classList.remove('hidden');
            } else if (user.role === 'Farmer') {
                if (cartNav)      cartNav.classList.add('hidden');
                if (dashboardNav) dashboardNav.classList.remove('hidden');
            }

            // Store in localStorage for quick access
            localStorage.setItem('agro_user', JSON.stringify(user));
            return user;
        } else {
            if (authButtons)  authButtons.classList.remove('hidden');
            if (userMenu)     userMenu.classList.add('hidden');
            if (cartNav)      cartNav.classList.remove('hidden');
            if (dashboardNav) dashboardNav.classList.add('hidden');
            localStorage.removeItem('agro_user');
            return null;
        }
    } catch (err) {
        console.error('Auth check failed:', err);
        return null;
    }
}

/**
 * Logout the current user
 */
async function logout() {
    try {
        await fetch('/api/users/logout', { method: 'POST' });
        localStorage.removeItem('agro_user');
        localStorage.removeItem('agro_cart');
        window.location.href = 'index.html';
    } catch (err) {
        window.location.href = 'index.html';
    }
}

/**
 * Get stored user from localStorage (synchronous, for quick access)
 */
function getStoredUser() {
    try {
        const data = localStorage.getItem('agro_user');
        return data ? JSON.parse(data) : null;
    } catch { return null; }
}

// ============================================================
// CART FUNCTIONS
// ============================================================

function getCart() {
    try {
        return JSON.parse(localStorage.getItem('agro_cart') || '[]');
    } catch { return []; }
}

function saveCart(cart) {
    localStorage.setItem('agro_cart', JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const cart = getCart();
    const total = cart.reduce((sum, i) => sum + (parseInt(i.qty) || 1), 0);
    document.querySelectorAll('#cartBadge').forEach(el => {
        el.textContent = total;
        el.style.display = total > 0 ? 'inline-flex' : 'none';
    });
}

/**
 * Add a product to the cart by Product Object
 */
function addToCart(product, qty = 1) {
    if (!product) return;

    const user = getStoredUser();
    if (user && user.role === 'Farmer') {
        showToast('Farmers cannot make purchases.', 'error');
        return;
    }

    let cart = getCart();
    const existing = cart.find(i => i.product_id == product.product_id);
    if (existing) {
        existing.qty = (parseInt(existing.qty) || 1) + qty;
    } else {
        cart.push({
            product_id:   product.product_id,
            product_name: product.product_name,
            price:        parseFloat(product.price) || 0,
            category:     product.category || 'General',
            image_url:    getProductImage(product),
            farmer_name:  product.farmer_name || 'Verified Farmer',
            qty:          qty
        });
    }
    saveCart(cart);
    showToast(`"${product.product_name}" added to cart! 🛒`, 'success');
}

/**
 * Add a product to cart by ID (immune to quotation bugs)
 */
function addToCartById(productId, qty = 1) {
    let p = null;
    if (typeof allProducts !== 'undefined' && Array.isArray(allProducts)) {
        p = allProducts.find(x => x.product_id == productId);
    }
    if (!p && typeof DEFAULT_PRODUCTS !== 'undefined') {
        p = DEFAULT_PRODUCTS.find(x => x.product_id == productId);
    }
    if (p) {
        addToCart(p, qty);
    } else {
        console.warn('Product not found for ID:', productId);
    }
}

/**
 * Remove a product from the cart
 */
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(i => i.product_id !== productId);
    saveCart(cart);
    showToast('Item removed from cart.', 'info');
    if (typeof renderCart === 'function') renderCart();
}

// ============================================================
// DEFAULT SAMPLE PRODUCTS (Fallback for offline/empty DB)
// ============================================================
const DEFAULT_PRODUCTS = [
    // Fruits
    { product_id: 1, farmer_name: "Raju Patel", farmer_phone: "9876543210", product_name: "Fresh Alphonso Mangoes", category: "Fruits", price: 80.00, quantity: 200, description: "Sweet, fragrant Alphonso mangoes directly picked from Ratnagiri farms. Naturally ripened with no carbide." },
    { product_id: 2, farmer_name: "Raju Patel", farmer_phone: "9876543210", product_name: "Kashmiri Red Apples", category: "Fruits", price: 140.00, quantity: 180, description: "Crisp and juicy Grade-A apples directly transported from orchards in Kashmir valley." },
    { product_id: 3, farmer_name: "Meena Devi", farmer_phone: "9876543211", product_name: "Organic Robusta Bananas", category: "Fruits", price: 40.00, quantity: 250, description: "Naturally sweet organic bananas grown without synthetic chemical sprays. Sold per dozen." },
    { product_id: 4, farmer_name: "Meena Devi", farmer_phone: "9876543211", product_name: "Nagpur Sweet Oranges", category: "Fruits", price: 65.00, quantity: 150, description: "Juicy citrus oranges rich in Vitamin C, fresh from Maharashtra groves." },
    { product_id: 5, farmer_name: "Suresh Kumar", farmer_phone: "9876543212", product_name: "Sweet Pomegranates (Anaar)", category: "Fruits", price: 130.00, quantity: 120, description: "Ruby red, antioxidant-rich fresh pomegranates with juicy seeds." },
    { product_id: 6, farmer_name: "Raju Patel", farmer_phone: "9876543210", product_name: "Organic Farm Papaya", category: "Fruits", price: 35.00, quantity: 90, description: "Naturally ripened sweet red papaya, beneficial for digestion and immunity." },

    // Vegetables
    { product_id: 7, farmer_name: "Meena Devi", farmer_phone: "9876543211", product_name: "Farm Fresh Red Tomatoes", category: "Vegetables", price: 25.00, quantity: 350, description: "Sun-ripened red tomatoes picked daily at dawn. Ideal for gravies, curries, and salads." },
    { product_id: 8, farmer_name: "Meena Devi", farmer_phone: "9876543211", product_name: "Green Spinach (Palak)", category: "Vegetables", price: 15.00, quantity: 200, description: "Tender, iron-rich green spinach leaves freshly cut and bundled with root wash." },
    { product_id: 9, farmer_name: "Meena Devi", farmer_phone: "9876543211", product_name: "Fresh Crisp Cauliflower", category: "Vegetables", price: 30.00, quantity: 180, description: "Compact white cauliflower heads grown with eco-friendly bio-fertilizers." },
    { product_id: 10, farmer_name: "Raju Patel", farmer_phone: "9876543210", product_name: "Organic Green Broccoli", category: "Vegetables", price: 70.00, quantity: 100, description: "Nutrient-packed fresh green broccoli florets grown in hill farm soils." },
    { product_id: 11, farmer_name: "Suresh Kumar", farmer_phone: "9876543212", product_name: "Farm Potatoes (Aloo)", category: "Vegetables", price: 22.00, quantity: 600, description: "Starchy, firm farm potatoes freshly dug up, dry-cleaned and graded for kitchen use." },
    { product_id: 12, farmer_name: "Suresh Kumar", farmer_phone: "9876543212", product_name: "Nasik Red Onions", category: "Vegetables", price: 28.00, quantity: 500, description: "High-pungency, premium storage quality red onions from Nasik farms." },
    { product_id: 13, farmer_name: "Meena Devi", farmer_phone: "9876543211", product_name: "Crisp Green Capsicum", category: "Vegetables", price: 45.00, quantity: 140, description: "Thick-walled, crunchy green bell peppers harvested from shade-net greenhouses." },
    { product_id: 14, farmer_name: "Meena Devi", farmer_phone: "9876543211", product_name: "Tender Ladyfinger (Bhindi)", category: "Vegetables", price: 35.00, quantity: 160, description: "Tender, seed-soft green okras picked young to ensure superior cooking texture." },
    { product_id: 15, farmer_name: "Raju Patel", farmer_phone: "9876543210", product_name: "Sweet Red Carrots", category: "Vegetables", price: 40.00, quantity: 220, description: "Sweet country carrots freshly pulled, high in beta-carotene and natural sugars." },

    // Grains
    { product_id: 16, farmer_name: "Raju Patel", farmer_phone: "9876543210", product_name: "Organic Sharbati Wheat", category: "Grains", price: 38.00, quantity: 550, description: "Golden amber Sharbati wheat grains from Madhya Pradesh black soil. Yields ultra-soft rotis." },
    { product_id: 17, farmer_name: "Suresh Kumar", farmer_phone: "9876543212", product_name: "Royal Basmati Rice (Aged)", category: "Grains", price: 95.00, quantity: 450, description: "Traditional long-grain aromatic Basmati rice aged for 2 years for non-sticky fluffy cooking." },
    { product_id: 18, farmer_name: "Suresh Kumar", farmer_phone: "9876543212", product_name: "Organic Pearl Millet (Bajra)", category: "Grains", price: 32.00, quantity: 300, description: "Gluten-free traditional winter grain rich in iron, zinc, and dietary fiber." },
    { product_id: 19, farmer_name: "Raju Patel", farmer_phone: "9876543210", product_name: "Organic Sorghum (Jowar)", category: "Grains", price: 36.00, quantity: 280, description: "Wholesome whole-grain Jowar, ideal for healthy diabetes-friendly bhakri/rotis." },
    { product_id: 20, farmer_name: "Suresh Kumar", farmer_phone: "9876543212", product_name: "Whole Brown Rice", category: "Grains", price: 65.00, quantity: 200, description: "Unpolished brown rice retaining nutrient-dense bran layer and germ." },

    // Pulses
    { product_id: 21, farmer_name: "Raju Patel", farmer_phone: "9876543210", product_name: "Fresh Green Peas (Matar)", category: "Pulses", price: 70.00, quantity: 150, description: "Sweet, juicy pods harvested fresh every morning. Shell them fresh for winter dishes." },
    { product_id: 22, farmer_name: "Meena Devi", farmer_phone: "9876543211", product_name: "Unpolished Toor Dal (Arhar)", category: "Pulses", price: 145.00, quantity: 300, description: "High protein, unpolished pigeon peas grown without artificial colors or chemical coatings." },
    { product_id: 23, farmer_name: "Meena Devi", farmer_phone: "9876543211", product_name: "Whole Green Moong Dal", category: "Pulses", price: 120.00, quantity: 260, description: "High-sprouting whole green gram, excellent for salads, sprouts, and traditional curries." },
    { product_id: 24, farmer_name: "Suresh Kumar", farmer_phone: "9876543212", product_name: "Desi Black Chickpeas (Kala Chana)", category: "Pulses", price: 85.00, quantity: 220, description: "Country variety black chickpeas packed with plant-based protein and fiber." },
    { product_id: 25, farmer_name: "Suresh Kumar", farmer_phone: "9876543212", product_name: "Jumbo Kabuli Chickpeas", category: "Pulses", price: 110.00, quantity: 180, description: "Large grain white chickpeas perfect for rich chole curries and hummus." },

    // Seeds
    { product_id: 26, farmer_name: "Raju Patel", farmer_phone: "9876543210", product_name: "High-Yield Green Chilli Seeds", category: "Seeds", price: 50.00, quantity: 90, description: "Certified hybrid green chilli seeds with 95% germination rate for field and home gardening." },
    { product_id: 27, farmer_name: "Raju Patel", farmer_phone: "9876543210", product_name: "Hybrid Tomato Seeds", category: "Seeds", price: 60.00, quantity: 80, description: "Disease-resistant variety producing high yield of round red tomatoes." },
    { product_id: 28, farmer_name: "Suresh Kumar", farmer_phone: "9876543212", product_name: "Raw Organic Chia Seeds", category: "Seeds", price: 180.00, quantity: 110, description: "Superfood chia seeds rich in Omega-3 fatty acids, antioxidants, and fiber." },
    { product_id: 29, farmer_name: "Suresh Kumar", farmer_phone: "9876543212", product_name: "Roasted Flax Seeds (Alsi)", category: "Seeds", price: 85.00, quantity: 140, description: "Golden organic flax seeds helpful for heart health and cholesterol balance." },

    // Spices
    { product_id: 30, farmer_name: "Suresh Kumar", farmer_phone: "9876543212", product_name: "Pure Organic Turmeric Powder", category: "Spices", price: 120.00, quantity: 200, description: "High 5.5% curcumin content pure Salem turmeric ground with aromatic aroma and deep color." },
    { product_id: 31, farmer_name: "Suresh Kumar", farmer_phone: "9876543212", product_name: "Green Cardamom Pods (Elaichi)", category: "Spices", price: 850.00, quantity: 40, description: "8mm bold green cardamom pods hand-picked from the misty hills of Idukki, Kerala." },
    { product_id: 32, farmer_name: "Raju Patel", farmer_phone: "9876543210", product_name: "Guntur Red Chilli Powder", category: "Spices", price: 160.00, quantity: 180, description: "Pure stone-ground Guntur red chillies providing vibrant color and authentic heat." },
    { product_id: 33, farmer_name: "Meena Devi", farmer_phone: "9876543211", product_name: "Whole Cumin Seeds (Jeera)", category: "Spices", price: 220.00, quantity: 160, description: "Cleaned aromatic whole cumin seeds from Gujarat fields. Distinct nutty aroma." },
    { product_id: 34, farmer_name: "Suresh Kumar", farmer_phone: "9876543212", product_name: "Malabar Black Peppercorns", category: "Spices", price: 310.00, quantity: 90, description: "Sun-dried whole black peppercorns from Malabar coast with sharp, bold flavor." },

    // Dairy Products
    { product_id: 35, farmer_name: "Meena Devi", farmer_phone: "9876543211", product_name: "Raw Organic Cow Milk", category: "Dairy Products", price: 55.00, quantity: 80, description: "Pure A2 cow milk delivered raw within hours of morning milking. Free from preservatives." },
    { product_id: 36, farmer_name: "Meena Devi", farmer_phone: "9876543211", product_name: "Traditional Bilona Cow Ghee", category: "Dairy Products", price: 650.00, quantity: 50, description: "Handmade Bilona ghee churned from cultured curd over slow wood fire. Rich granular texture." },
    { product_id: 37, farmer_name: "Meena Devi", farmer_phone: "9876543211", product_name: "Fresh Farm Paneer", category: "Dairy Products", price: 90.00, quantity: 70, description: "Soft, melt-in-mouth fresh cottage cheese made from pure buffalo and cow whole milk." },
    { product_id: 38, farmer_name: "Meena Devi", farmer_phone: "9876543211", product_name: "Farm Natural Set Curd", category: "Dairy Products", price: 40.00, quantity: 90, description: "Thick, probiotic-rich clay-pot set curd made using traditional fermentation." },

    // Organic Products
    { product_id: 39, farmer_name: "Raju Patel", farmer_phone: "9876543210", product_name: "Raw Wildflower Forest Honey", category: "Organic Products", price: 320.00, quantity: 110, description: "100% unfiltered, unpasteurized natural honey collected from wild forest hives." },
    { product_id: 40, farmer_name: "Raju Patel", farmer_phone: "9876543210", product_name: "Cold-Pressed Mustard Oil (Kachi Ghani)", category: "Organic Products", price: 185.00, quantity: 140, description: "Pure wood-pressed mustard oil with sharp natural pungency and health benefits." },
    { product_id: 41, farmer_name: "Suresh Kumar", farmer_phone: "9876543212", product_name: "Organic Sugarcane Jaggery (Gur)", category: "Organic Products", price: 60.00, quantity: 240, description: "Chemical-free golden jaggery made from unrefined sugarcane juice." },
    { product_id: 42, farmer_name: "Raju Patel", farmer_phone: "9876543210", product_name: "Cold-Pressed Virgin Coconut Oil", category: "Organic Products", price: 230.00, quantity: 95, description: "Pure unrefined coconut oil extracted from fresh coconut milk without heat." },

    // Fertilizers
    { product_id: 43, farmer_name: "Suresh Kumar", farmer_phone: "9876543212", product_name: "Organic Vermicompost (Khad)", category: "Fertilizers", price: 200.00, quantity: 80, description: "Rich earthworm-processed organic compost that restores soil biological activity (25kg bag)." },
    { product_id: 44, farmer_name: "Suresh Kumar", farmer_phone: "9876543212", product_name: "Neem Cake Bio-Fertilizer", category: "Fertilizers", price: 160.00, quantity: 60, description: "Dual-purpose organic fertilizer and natural soil pest repellent cake." },
    { product_id: 45, farmer_name: "Raju Patel", farmer_phone: "9876543210", product_name: "Aged Cow Dung Manure", category: "Fertilizers", price: 120.00, quantity: 100, description: "Well-decomposed, odorless dry cow manure packed with macro and micronutrients." },
    { product_id: 46, farmer_name: "Raju Patel", farmer_phone: "9876543210", product_name: "Liquid Seaweed Extract", category: "Fertilizers", price: 275.00, quantity: 50, description: "Natural bio-stimulant for foliar spray that boosts flowering, root expansion, and plant yield." }
];

// ============================================================
// PRODUCT PHOTO RESOLVER
// ============================================================

/**
 * Returns a high-definition real photographic image for any agricultural product
 */
function getProductImage(product) {
    if (!product) return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80';
    if (product.image_url && product.image_url.trim() !== '') {
        return product.image_url;
    }
    const name = (product.product_name || '').toLowerCase();

    // Specific Produce Photography
    if (name.includes('mango'))      return 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80';
    if (name.includes('apple'))      return 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80';
    if (name.includes('banana'))     return 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80';
    if (name.includes('orange'))     return 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=600&auto=format&fit=crop&q=80';
    if (name.includes('pomegranate') || name.includes('anaar')) return 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80';
    if (name.includes('papaya'))     return 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600&auto=format&fit=crop&q=80';

    if (name.includes('tomato'))     return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80';
    if (name.includes('spinach') || name.includes('palak')) return 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80';
    if (name.includes('cauliflower')) return 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=600&auto=format&fit=crop&q=80';
    if (name.includes('broccoli'))   return 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=600&auto=format&fit=crop&q=80';
    if (name.includes('potato') || name.includes('aloo')) return 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80';
    if (name.includes('onion'))      return 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80';
    if (name.includes('capsicum') || name.includes('pepper') && !name.includes('black')) return 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop&q=80';
    if (name.includes('ladyfinger') || name.includes('bhindi') || name.includes('okra')) return 'https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=600&auto=format&fit=crop&q=80';
    if (name.includes('carrot') || name.includes('gajar')) return 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=600&auto=format&fit=crop&q=80';

    if (name.includes('wheat'))      return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80';
    if (name.includes('basmati') || name.includes('rice')) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80';
    if (name.includes('millet') || name.includes('bajra') || name.includes('jowar') || name.includes('sorghum')) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80';

    if (name.includes('pea') || name.includes('matar')) return 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=600&auto=format&fit=crop&q=80';
    if (name.includes('dal') || name.includes('toor') || name.includes('moong')) return 'https://images.unsplash.com/photo-1585994192701-f1a505c817ea?w=600&auto=format&fit=crop&q=80';
    if (name.includes('chickpea') || name.includes('chana')) return 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=600&auto=format&fit=crop&q=80';

    if (name.includes('chilli seed') || name.includes('seeds')) return 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?w=600&auto=format&fit=crop&q=80';
    if (name.includes('chia'))       return 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=600&auto=format&fit=crop&q=80';
    if (name.includes('flax') || name.includes('alsi')) return 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?w=600&auto=format&fit=crop&q=80';

    if (name.includes('turmeric') || name.includes('haldi')) return 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80';
    if (name.includes('cardamom') || name.includes('elaichi')) return 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80';
    if (name.includes('chilli powder')) return 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80';
    if (name.includes('cumin') || name.includes('jeera')) return 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80';
    if (name.includes('pepper'))     return 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=600&auto=format&fit=crop&q=80';

    if (name.includes('milk'))       return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80';
    if (name.includes('ghee'))       return 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=600&auto=format&fit=crop&q=80';
    if (name.includes('paneer'))     return 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80';
    if (name.includes('curd') || name.includes('dahi')) return 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=600&auto=format&fit=crop&q=80';

    if (name.includes('honey'))      return 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80';
    if (name.includes('mustard oil')) return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80';
    if (name.includes('jaggery') || name.includes('gur')) return 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&auto=format&fit=crop&q=80';
    if (name.includes('coconut oil')) return 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600&auto=format&fit=crop&q=80';

    if (name.includes('compost') || name.includes('vermicompost')) return 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=80';
    if (name.includes('neem') || name.includes('manure') || name.includes('fertilizer') || name.includes('seaweed')) return 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&auto=format&fit=crop&q=80';

    // Category default photographic fallbacks
    const cat = product.category || '';
    if (cat === 'Fruits')            return 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80';
    if (cat === 'Vegetables')        return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80';
    if (cat === 'Grains')            return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80';
    if (cat === 'Pulses')            return 'https://images.unsplash.com/photo-1585994192701-f1a505c817ea?w=600&auto=format&fit=crop&q=80';
    if (cat === 'Seeds')             return 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?w=600&auto=format&fit=crop&q=80';
    if (cat === 'Spices')            return 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80';
    if (cat === 'Dairy Products')    return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80';
    if (cat === 'Organic Products')  return 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80';
    if (cat === 'Fertilizers')       return 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=80';

    return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80';
}

function getCategoryEmoji(category) {
    const map = {
        'Fruits': '🍎', 'Vegetables': '🥦', 'Grains': '🌾',
        'Pulses': '🫘', 'Seeds': '🌱', 'Spices': '🌶️',
        'Dairy Products': '🥛', 'Organic Products': '🌿', 'Fertilizers': '🪣'
    };
    return map[category] || '🌾';
}

/**
 * Generate HTML for a product card with high-quality real photography
 */
function createProductCard(product, showDetail = false) {
    const imageUrl = getProductImage(product);
    const imgContent = `<img src="${imageUrl}" alt="${product.product_name}" class="product-img" loading="lazy" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80';" />`;

    const viewFn = showDetail
        ? `viewProduct(${product.product_id})`
        : `window.location.href='products.html'`;

    const inStock = product.quantity > 0;

    return `
        <div class="product-card" data-id="${product.product_id}">
            <div class="product-img-wrap" onclick="${viewFn}">
                ${imgContent}
                <span class="product-category">${product.category}</span>
                ${!inStock ? '<span class="out-of-stock-badge">Out of Stock</span>' : ''}
            </div>
            <div class="product-body">
                <h3 class="product-name" onclick="${viewFn}">${product.product_name}</h3>
                <p class="product-farmer"><i class="fas fa-user-tie"></i> ${product.farmer_name || 'Local Farmer'}</p>
                <p class="product-desc">${(product.description || '').substring(0, 80)}${(product.description || '').length > 80 ? '...' : ''}</p>
                <div class="product-footer">
                    <div class="product-price">₹${parseFloat(product.price).toFixed(2)}<span>/unit</span></div>
                    <div class="product-qty-info">
                        <i class="fas fa-box"></i> ${product.quantity} left
                    </div>
                </div>
                ${inStock
                    ? `<button class="btn btn-primary btn-block add-cart-btn"
                                onclick="event.stopPropagation(); addToCartById(${product.product_id})">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                       </button>`
                    : `<button class="btn btn-disabled btn-block" disabled>
                            <i class="fas fa-times-circle"></i> Out of Stock
                       </button>`
                }
            </div>
        </div>`;
}

// ============================================================
// UI HELPERS
// ============================================================

/**
 * Show inline message in a container element
 */
function showMessage(elementId, message, type = 'info') {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.className = `message-box message-${type}`;
    el.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${message}`;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 5000);
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer') || (() => {
        const c = document.createElement('div');
        c.id = 'toastContainer';
        c.className = 'toast-container';
        document.body.appendChild(c);
        return c;
    })();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { success: 'check-circle', error: 'exclamation-circle', info: 'info-circle', warning: 'exclamation-triangle' };
    toast.innerHTML = `<i class="fas fa-${icons[type] || 'info-circle'}"></i> ${message}`;
    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

/**
 * Toggle password visibility
 */
function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPass = input.type === 'password';
    input.type = isPass ? 'text' : 'password';
    btn.innerHTML = `<i class="fas fa-eye${isPass ? '-slash' : ''}"></i>`;
}

// ============================================================
// NAVBAR SCROLL & TOGGLE
// ============================================================
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
});

document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('navToggle');
    const links  = document.getElementById('navLinks');
    if (toggle && links) {
        toggle.addEventListener('click', () => links.classList.toggle('open'));
    }
    updateCartBadge();
});
