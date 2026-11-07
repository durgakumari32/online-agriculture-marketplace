# 🌾 AgroMarket - Online Agriculture Marketplace

A full-stack web application connecting **farmers** directly with **customers** for fresh agricultural products.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v16+ — [Download](https://nodejs.org)
- **MySQL** v8+ — [Download](https://dev.mysql.com/downloads/)
- **VS Code** (recommended)

---

## 📦 Installation Steps

### Step 1 — Set up the Database

1. Open **MySQL Workbench** or the MySQL command-line client
2. Run the SQL script:

```bash
mysql -u root -p < database.sql
```

Or open MySQL Workbench → File → Run SQL Script → Select `database.sql`

---

### Step 2 — Configure Environment

1. Open the `.env` file in the project root
2. Set your MySQL password:

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=YOUR_MYSQL_PASSWORD_HERE
DB_NAME=agriculture_marketplace
PORT=3000
```

---

### Step 3 — Install Dependencies

Open a terminal in VS Code (`Ctrl + \``) and run:

```bash
npm install
```

---

### Step 4 — Start the Server

```bash
npm start
```

Or for auto-reload during development:

```bash
npm run dev
```

---

### Step 5 — Open in Browser

Navigate to: **http://localhost:3000**

---

## 🔐 Demo Login Credentials

| Role     | Email               | Password   |
|----------|---------------------|------------|
| Farmer   | raju@farmer.com     | farmer123  |
| Farmer   | meena@farmer.com    | farmer123  |
| Customer | anil@customer.com   | farmer123  |
| Customer | priya@customer.com  | farmer123  |

---

## 📁 Project Structure

```
OnlineAgricultureMarketplace/
│
├── server.js           ← Main Express server
├── db.js               ← MySQL connection pool
├── package.json        ← Dependencies
├── .env                ← Environment variables
├── database.sql        ← Database schema + sample data
│
├── routes/
│   ├── users.js        ← Auth: Register, Login, Logout, Profile
│   ├── products.js     ← CRUD: Products + Image Upload
│   └── orders.js       ← Orders: Place, View, Update Status
│
└── public/
    ├── index.html      ← Home page
    ├── login.html      ← Login page
    ├── register.html   ← Registration (Farmer / Customer)
    ├── products.html   ← Browse & search products
    ├── cart.html       ← Shopping cart
    ├── checkout.html   ← Checkout & order placement
    ├── dashboard.html  ← Farmer & Customer dashboard
    ├── add-product.html← Farmer: Add product
    │
    ├── css/
    │   └── style.css   ← Full responsive stylesheet (Green theme)
    │
    └── js/
        ├── main.js     ← Shared utilities (auth, cart, UI helpers)
        └── dashboard.js← Dashboard logic (farmer/customer)
```

---

## 🌐 API Endpoints

### Authentication
| Method | Endpoint               | Description          |
|--------|------------------------|----------------------|
| POST   | /api/users/register    | Register new user    |
| POST   | /api/users/login       | Login                |
| POST   | /api/users/logout      | Logout               |
| GET    | /api/users/profile     | Get profile          |
| PUT    | /api/users/profile     | Update profile       |
| GET    | /api/session           | Check session        |

### Products
| Method | Endpoint                   | Description              |
|--------|----------------------------|--------------------------|
| GET    | /api/products              | All products (+ filters) |
| GET    | /api/products/farmer       | Farmer's own products    |
| GET    | /api/products/:id          | Single product           |
| POST   | /api/products              | Add product (Farmer)     |
| PUT    | /api/products/:id          | Update product (Farmer)  |
| DELETE | /api/products/:id          | Delete product (Farmer)  |

### Orders
| Method | Endpoint                   | Description              |
|--------|----------------------------|--------------------------|
| POST   | /api/orders                | Place order (Customer)   |
| GET    | /api/orders/my             | View my orders           |
| GET    | /api/orders/:id            | Order details            |
| PUT    | /api/orders/:id/status     | Update status (Farmer)   |

---

## 🎨 Features

### ✅ Implemented
- 🔐 JWT-less session-based authentication with bcrypt
- 👨‍🌾 Farmer: Add / Edit / Delete products with image upload
- 🛒 Customer: Browse, search, filter, cart, checkout
- 📦 Order management with status tracking
- 📱 Fully responsive design (mobile-friendly)
- 🌿 Green agriculture theme with animations
- 🔍 Search + category filter + sort
- 📊 Dashboard with stats for both roles
- 🖼️ Product image upload (multer)

### 📋 Product Categories
Fruits | Vegetables | Grains | Pulses | Seeds | Spices | Dairy Products | Organic Products | Fertilizers

### 📋 Order Statuses
Pending → Confirmed → Shipped → Delivered | Cancelled

---

## 🛠️ Tech Stack

| Layer    | Technology               |
|----------|--------------------------|
| Frontend | HTML5, CSS3, JavaScript  |
| Backend  | Node.js + Express.js     |
| Database | MySQL                    |
| DB Lib   | mysql2 (promise pool)    |
| Auth     | express-session + bcryptjs|
| Uploads  | multer                   |

---

## ⚠️ Troubleshooting

**"Database connection failed"**
→ Check `.env` DB_PASS matches your MySQL password
→ Ensure MySQL service is running

**"Cannot GET /"**
→ Run `npm install` first
→ Check `server.js` is in the root directory

**"Module not found"**
→ Run `npm install` in the project folder

---

Made with ❤️ for Indian Farmers 🌾
