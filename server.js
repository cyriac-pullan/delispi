
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Database initialization
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Products table
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        image TEXT,
        category TEXT,
        stock_quantity INTEGER DEFAULT 0,
        sku TEXT UNIQUE,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Orders table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        total_amount DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'pending',
        payment_status TEXT DEFAULT 'pending',
        shipping_address TEXT,
        billing_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Order items table
    db.run(`CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        product_id INTEGER,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
    )`);

    // Addresses table
    db.run(`CREATE TABLE IF NOT EXISTS addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        type TEXT DEFAULT 'shipping',
        first_name TEXT,
        last_name TEXT,
        address_line_1 TEXT,
        address_line_2 TEXT,
        city TEXT,
        state TEXT,
        postal_code TEXT,
        country TEXT DEFAULT 'India',
        phone TEXT,
        is_default BOOLEAN DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Categories table
    db.run(`CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        image TEXT,
        status TEXT DEFAULT 'active'
    )`);

    // Insert sample data
    insertSampleData();
}

function insertSampleData() {
    // Insert categories
    const categories = [
        ['Whole Spices', 'Premium whole spices for maximum flavor and aroma', '/images/categories/whole-spices.jpg'],
        ['Ground Spices', 'Freshly ground spices for everyday cooking', '/images/categories/ground-spices.jpg'],
        ['Spice Blends', 'Carefully crafted spice blends for authentic flavors', '/images/categories/spice-blends.jpg'],
        ['Organic Spices', 'Certified organic spices for health-conscious cooking', '/images/categories/organic-spices.jpg']
    ];

    categories.forEach(category => {
        db.run(`INSERT OR IGNORE INTO categories (name, description, image) VALUES (?, ?, ?)`, category);
    });

    // Insert sample products
    const products = [
        ['Organic Turmeric Powder', 'Premium organic turmeric powder sourced from India. Rich in curcumin with vibrant color and earthy aroma.', 249, '/images/spices/turmeric.jpg', 'Ground Spices', 150, 'TUR-001'],
        ['Ceylon Cinnamon Sticks', 'Authentic Ceylon cinnamon sticks with sweet and delicate flavor. Perfect for teas and desserts.', 399, '/images/spices/cinnamon.jpg', 'Whole Spices', 89, 'CIN-002'],
        ['Green Cardamom Pods', 'Premium green cardamom pods with intense aroma and flavor. Essential for Indian and Middle Eastern cuisine.', 499, '/images/spices/cardamom.jpg', 'Whole Spices', 75, 'CAR-003'],
        ['Black Pepper Whole', 'Premium black peppercorns with bold flavor and aroma. Perfect for grinding fresh or cooking whole.', 349, '/images/spices/black-pepper.jpg', 'Whole Spices', 120, 'PEP-004'],
        ['Cumin Seeds', 'Aromatic cumin seeds with earthy flavor. Essential for Indian, Mexican, and Middle Eastern cuisines.', 199, '/images/spices/cumin.jpg', 'Whole Spices', 200, 'CUM-005'],
        ['Coriander Seeds', 'Fresh coriander seeds with citrusy notes. Perfect for grinding or using whole in curries.', 179, '/images/spices/coriander.jpg', 'Whole Spices', 180, 'COR-006'],
        ['Star Anise', 'Premium star anise with licorice-like flavor. Perfect for Asian cuisines and spice blends.', 299, '/images/spices/star-anise.jpg', 'Whole Spices', 45, 'STA-007'],
        ['Bay Leaves', 'Aromatic bay leaves for flavoring soups, stews, and curries. Essential for Mediterranean cooking.', 149, '/images/spices/bay-leaves.jpg', 'Whole Spices', 90, 'BAY-008'],
        ['Fenugreek Seeds', 'Bitter-sweet fenugreek seeds with maple-like aroma. Used in Indian curries and spice blends.', 189, '/images/spices/fenugreek.jpg', 'Whole Spices', 110, 'FEN-009'],
        ['Mustard Seeds', 'Pungent mustard seeds for tempering and pickling. Essential for South Indian cuisine.', 159, '/images/spices/mustard-seeds.jpg', 'Whole Spices', 95, 'MUS-010']
    ];

    products.forEach(product => {
        db.run(`INSERT OR IGNORE INTO products (name, description, price, image, category, stock_quantity, sku) VALUES (?, ?, ?, ?, ?, ?, ?)`, product);
    });

    // Create admin user
    const adminPassword = bcrypt.hashSync('admin123', 10);
    db.run(`INSERT OR IGNORE INTO users (first_name, last_name, email, password, phone) VALUES (?, ?, ?, ?, ?)`, 
        ['Admin', 'User', 'admin@delispi.com', adminPassword, '+91 123 456 7890']);
}

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

// API Routes

// Auth routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone } = req.body;
        
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ error: 'All required fields must be provided' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.run(`INSERT INTO users (first_name, last_name, email, password, phone) VALUES (?, ?, ?, ?, ?)`,
            [firstName, lastName, email, hashedPassword, phone],
            function(err) {
                if (err) {
                    if (err.code === 'SQLITE_CONSTRAINT') {
                        return res.status(400).json({ error: 'Email already exists' });
                    }
                    return res.status(500).json({ error: 'Database error' });
                }
                
                const token = jwt.sign({ id: this.lastID, email }, JWT_SECRET, { expiresIn: '24h' });
                res.json({ 
                    token, 
                    user: { 
                        id: this.lastID, 
                        firstName, 
                        lastName, 
                        email 
                    } 
                });
            });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (!user || !await bcrypt.compare(password, user.password)) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            
            const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
            res.json({ 
                token, 
                user: { 
                    id: user.id, 
                    firstName: user.first_name, 
                    lastName: user.last_name, 
                    email: user.email 
                } 
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Products routes
app.get('/api/products', (req, res) => {
    const { category, search, limit = 20, offset = 0 } = req.query;
    let query = `SELECT * FROM products WHERE status = 'active'`;
    let params = [];
    
    if (category) {
        query += ` AND category = ?`;
        params.push(category);
    }
    
    if (search) {
        query += ` AND (name LIKE ? OR description LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    db.all(query, params, (err, products) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(products);
    });
});

app.get('/api/products/:id', (req, res) => {
    const { id } = req.params;
    
    db.get(`SELECT * FROM products WHERE id = ? AND status = 'active'`, [id], (err, product) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json(product);
    });
});

// Categories routes
app.get('/api/categories', (req, res) => {
    db.all(`SELECT * FROM categories WHERE status = 'active'`, (err, categories) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(categories);
    });
});

// Orders routes
app.post('/api/orders', authenticateToken, (req, res) => {
    try {
        const { items, shippingAddress, billingAddress, totalAmount } = req.body;
        const userId = req.user.id;
        
        if (!items || !items.length || !shippingAddress || !totalAmount) {
            return res.status(400).json({ error: 'Missing required order information' });
        }
        
        db.run(`INSERT INTO orders (user_id, total_amount, shipping_address, billing_address) VALUES (?, ?, ?, ?)`,
            [userId, totalAmount, JSON.stringify(shippingAddress), JSON.stringify(billingAddress)],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Failed to create order' });
                }
                
                const orderId = this.lastID;
                
                // Insert order items
                const itemPromises = items.map(item => {
                    return new Promise((resolve, reject) => {
                        db.run(`INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
                            [orderId, item.id, item.quantity, item.price],
                            (err) => {
                                if (err) reject(err);
                                else resolve();
                            });
                    });
                });
                
                Promise.all(itemPromises)
                    .then(() => {
                        res.json({ orderId, message: 'Order created successfully' });
                    })
                    .catch(() => {
                        res.status(500).json({ error: 'Failed to create order items' });
                    });
            });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/orders', authenticateToken, (req, res) => {
    const userId = req.user.id;
    
    db.all(`SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`, [userId], (err, orders) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(orders);
    });
});

// Contact form
app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Here you would typically save to database and/or send email
    console.log('Contact form submission:', { name, email, subject, message });
    
    res.json({ message: 'Message sent successfully' });
});

// Serve static files and handle SPA routing
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    const filePath = req.path === '/' ? 'index.html' : req.path + '.html';
    const fullPath = path.join(__dirname, filePath);
    
    res.sendFile(fullPath, (err) => {
        if (err) {
            res.sendFile(path.join(__dirname, 'index.html'));
        }
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Deli Spi E-commerce server running on port ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});
