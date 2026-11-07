-- ============================================
-- Online Agriculture Marketplace Database
-- ============================================

CREATE DATABASE IF NOT EXISTS agriculture_marketplace;
USE agriculture_marketplace;

-- ============================================
-- Table 1: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'Customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Table 2: products
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    farmer_id INT NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    description TEXT,
    image_url VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================
-- Table 3: orders
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    order_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    delivery_address VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================
-- Table 4: order_items
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- ============================================
-- Sample Data - Farmers
-- ============================================
-- Password: farmer123 (bcrypt hashed)
INSERT INTO users (name, email, phone, password, role) VALUES
('Raju Patel', 'raju@farmer.com', '9876543210', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Farmer'),
('Meena Devi', 'meena@farmer.com', '9876543211', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Farmer'),
('Suresh Kumar', 'suresh@farmer.com', '9876543212', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Farmer');

-- ============================================
-- Sample Data - Customers
-- ============================================
-- Password: customer123 (bcrypt hashed)
INSERT INTO users (name, email, phone, password, role) VALUES
('Anil Sharma', 'anil@customer.com', '9123456789', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Customer'),
('Priya Singh', 'priya@customer.com', '9123456790', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Customer');

-- ============================================
-- Sample Data - Products (46 Fresh Farm Items)
-- ============================================
INSERT INTO products (farmer_id, product_name, category, price, quantity, description) VALUES
-- Fruits
(1, 'Fresh Alphonso Mangoes', 'Fruits', 80.00, 200, 'Sweet, fragrant Alphonso mangoes directly picked from Ratnagiri farms. Naturally ripened with no carbide.'),
(1, 'Kashmiri Red Apples', 'Fruits', 140.00, 180, 'Crisp and juicy Grade-A apples directly transported from orchards in Kashmir valley.'),
(2, 'Organic Robusta Bananas', 'Fruits', 40.00, 250, 'Naturally sweet organic bananas grown without synthetic chemical sprays. Sold per dozen.'),
(2, 'Nagpur Sweet Oranges', 'Fruits', 65.00, 150, 'Juicy citrus oranges rich in Vitamin C, fresh from Maharashtra groves.'),
(3, 'Sweet Pomegranates (Anaar)', 'Fruits', 130.00, 120, 'Ruby red, antioxidant-rich fresh pomegranates with juicy seeds.'),
(1, 'Organic Farm Papaya', 'Fruits', 35.00, 90, 'Naturally ripened sweet red papaya, beneficial for digestion and immunity.'),

-- Vegetables
(2, 'Farm Fresh Red Tomatoes', 'Vegetables', 25.00, 350, 'Sun-ripened red tomatoes picked daily at dawn. Ideal for gravies, curries, and salads.'),
(2, 'Green Spinach (Palak)', 'Vegetables', 15.00, 200, 'Tender, iron-rich green spinach leaves freshly cut and bundled with root wash.'),
(2, 'Fresh Crisp Cauliflower', 'Vegetables', 30.00, 180, 'Compact white cauliflower heads grown with eco-friendly bio-fertilizers.'),
(1, 'Organic Green Broccoli', 'Vegetables', 70.00, 100, 'Nutrient-packed fresh green broccoli florets grown in hill farm soils.'),
(3, 'Farm Potatoes (Aloo)', 'Vegetables', 22.00, 600, 'Starchy, firm farm potatoes freshly dug up, dry-cleaned and graded for kitchen use.'),
(3, 'Nasik Red Onions', 'Vegetables', 28.00, 500, 'High-pungency, premium storage quality red onions from Nasik farms.'),
(2, 'Crisp Green Capsicum', 'Vegetables', 45.00, 140, 'Thick-walled, crunchy green bell peppers harvested from shade-net greenhouses.'),
(2, 'Tender Ladyfinger (Bhindi)', 'Vegetables', 35.00, 160, 'Tender, seed-soft green okras picked young to ensure superior cooking texture.'),
(1, 'Sweet Red Carrots', 'Vegetables', 40.00, 220, 'Sweet country carrots freshly pulled, high in beta-carotene and natural sugars.'),

-- Grains
(1, 'Organic Sharbati Wheat', 'Grains', 38.00, 550, 'Golden amber Sharbati wheat grains from Madhya Pradesh black soil. Yields ultra-soft rotis.'),
(3, 'Royal Basmati Rice (Aged)', 'Grains', 95.00, 450, 'Traditional long-grain aromatic Basmati rice aged for 2 years for non-sticky fluffy cooking.'),
(3, 'Organic Pearl Millet (Bajra)', 'Grains', 32.00, 300, 'Gluten-free traditional winter grain rich in iron, zinc, and dietary fiber.'),
(1, 'Organic Sorghum (Jowar)', 'Grains', 36.00, 280, 'Wholesome whole-grain Jowar, ideal for healthy diabetes-friendly bhakri/rotis.'),
(3, 'Whole Brown Rice', 'Grains', 65.00, 200, 'Unpolished brown rice retaining nutrient-dense bran layer and germ.'),

-- Pulses
(1, 'Fresh Green Peas (Matar)', 'Pulses', 70.00, 150, 'Sweet, juicy pods harvested fresh every morning. Shell them fresh for winter dishes.'),
(2, 'Unpolished Toor Dal (Arhar)', 'Pulses', 145.00, 300, 'High protein, unpolished pigeon peas grown without artificial colors or chemical coatings.'),
(2, 'Whole Green Moong Dal', 'Pulses', 120.00, 260, 'High-sprouting whole green gram, excellent for salads, sprouts, and traditional curries.'),
(3, 'Desi Black Chickpeas (Kala Chana)', 'Pulses', 85.00, 220, 'Country variety black chickpeas packed with plant-based protein and fiber.'),
(3, 'Jumbo Kabuli Chickpeas', 'Pulses', 110.00, 180, 'Large grain white chickpeas perfect for rich chole curries and hummus.'),

-- Seeds
(1, 'High-Yield Green Chilli Seeds', 'Seeds', 50.00, 90, 'Certified hybrid green chilli seeds with 95% germination rate for field and home gardening.'),
(1, 'Hybrid Tomato Seeds', 'Seeds', 60.00, 80, 'Disease-resistant variety producing high yield of round red tomatoes.'),
(3, 'Raw Organic Chia Seeds', 'Seeds', 180.00, 110, 'Superfood chia seeds rich in Omega-3 fatty acids, antioxidants, and fiber.'),
(3, 'Roasted Flax Seeds (Alsi)', 'Seeds', 85.00, 140, 'Golden organic flax seeds helpful for heart health and cholesterol balance.'),

-- Spices
(3, 'Pure Organic Turmeric Powder', 'Spices', 120.00, 200, 'High 5.5% curcumin content pure Salem turmeric ground with aromatic aroma and deep color.'),
(3, 'Green Cardamom Pods (Elaichi)', 'Spices', 850.00, 40, '8mm bold green cardamom pods hand-picked from the misty hills of Idukki, Kerala.'),
(1, 'Guntur Red Chilli Powder', 'Spices', 160.00, 180, 'Pure stone-ground Guntur red chillies providing vibrant color and authentic heat.'),
(2, 'Whole Cumin Seeds (Jeera)', 'Spices', 220.00, 160, 'Cleaned aromatic whole cumin seeds from Gujarat fields. Distinct nutty aroma.'),
(3, 'Malabar Black Peppercorns', 'Spices', 310.00, 90, 'Sun-dried whole black peppercorns from Malabar coast with sharp, bold flavor.'),

-- Dairy Products
(2, 'Raw Organic Cow Milk', 'Dairy Products', 55.00, 80, 'Pure A2 cow milk delivered raw within hours of morning milking. Free from preservatives.'),
(2, 'Traditional Bilona Cow Ghee', 'Dairy Products', 650.00, 50, 'Handmade Bilona ghee churned from cultured curd over slow wood fire. Rich granular texture.'),
(2, 'Fresh Farm Paneer', 'Dairy Products', 90.00, 70, 'Soft, melt-in-mouth fresh cottage cheese made from pure buffalo and cow whole milk.'),
(2, 'Farm Natural Set Curd', 'Dairy Products', 40.00, 90, 'Thick, probiotic-rich clay-pot set curd made using traditional fermentation.'),

-- Organic Products
(1, 'Raw Wildflower Forest Honey', 'Organic Products', 320.00, 110, '100% unfiltered, unpasteurized natural honey collected from wild forest hives.'),
(1, 'Cold-Pressed Mustard Oil (Kachi Ghani)', 'Organic Products', 185.00, 140, 'Pure wood-pressed mustard oil with sharp natural pungency and health benefits.'),
(3, 'Organic Sugarcane Jaggery (Gur)', 'Organic Products', 60.00, 240, 'Chemical-free golden jaggery made from unrefined sugarcane juice.'),
(1, 'Cold-Pressed Virgin Coconut Oil', 'Organic Products', 230.00, 95, 'Pure unrefined coconut oil extracted from fresh coconut milk without heat.'),

-- Fertilizers
(3, 'Organic Vermicompost (Khad)', 'Fertilizers', 200.00, 80, 'Rich earthworm-processed organic compost that restores soil biological activity (25kg bag).'),
(3, 'Neem Cake Bio-Fertilizer', 'Fertilizers', 160.00, 60, 'Dual-purpose organic fertilizer and natural soil pest repellent cake.'),
(1, 'Aged Cow Dung Manure', 'Fertilizers', 120.00, 100, 'Well-decomposed, odorless dry cow manure packed with macro and micronutrients.'),
(1, 'Liquid Seaweed Extract', 'Fertilizers', 275.00, 50, 'Natural bio-stimulant for foliar spray that boosts flowering, root expansion, and plant yield.');
