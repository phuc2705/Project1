// === GIAI ĐOẠN 2: NODE.JS & EXPRESS ===
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// === MIDDLEWARE ===
app.use(cors()); // Cho phép Frontend gọi API
app.use(express.json()); // Parse JSON body
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(express.static('public')); // Serve static files

// === KẾT NỐI MYSQL (Giai đoạn 3) ===
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'footshop_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test kết nối
pool.getConnection()
    .then(connection => {
        console.log('✅ Kết nối MySQL thành công!');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Lỗi kết nối MySQL:', err);
    });

// === RESTFUL API ROUTES ===

// GET: Lấy tất cả sản phẩm
app.get('/api/products', async (req, res) => {
    try {
        const { category, search } = req.query;
        
        let query = 'SELECT * FROM products WHERE 1=1';
        const params = [];
        
        // Lọc theo danh mục
        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }
        
        // Tìm kiếm
        if (search) {
            query += ' AND (name LIKE ? OR category LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        
        query += ' ORDER BY created_at DESC';
        
        const [rows] = await pool.execute(query, params);
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// GET: Lấy sản phẩm theo ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [rows] = await pool.execute(
            'SELECT * FROM products WHERE id = ?',
            [id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }
        
        res.json({
            success: true,
            data: rows[0]
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// POST: Thêm sản phẩm mới
app.post('/api/products', async (req, res) => {
    try {
        const { name, price, image, category, badge, badge_class, description, stock } = req.body;
        
        // Validation
        if (!name || !price || !image || !category) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc'
            });
        }
        
        const [result] = await pool.execute(
            `INSERT INTO products (name, price, image, category, badge, badge_class, description, stock)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, price, image, category, badge || null, badge_class || null, description || null, stock || 0]
        );
        
        res.status(201).json({
            success: true,
            message: 'Thêm sản phẩm thành công',
            id: result.insertId
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// PUT: Cập nhật sản phẩm
app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, image, category, badge, badge_class, description, stock } = req.body;
        
        const [result] = await pool.execute(
            `UPDATE products 
             SET name = ?, price = ?, image = ?, category = ?,
                 badge = ?, badge_class = ?, description = ?, stock = ?
             WHERE id = ?`,
            [name, price, image, category, badge, badge_class, description, stock, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }
        
        res.json({
            success: true,
            message: 'Cập nhật sản phẩm thành công'
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// DELETE: Xóa sản phẩm
app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await pool.execute(
            'DELETE FROM products WHERE id = ?',
            [id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }
        
        res.json({
            success: true,
            message: 'Xóa sản phẩm thành công'
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// GET: Lấy danh sách danh mục
app.get('/api/categories', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM categories ORDER BY id');
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server đang hoạt động',
        timestamp: new Date().toISOString()
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Không tìm thấy endpoint'
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Khởi động server
app.listen(PORT, () => {
    console.log('=================================');
    console.log(`🚀 Server đang chạy tại:`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`📡 API endpoint:`);
    console.log(`   http://localhost:${PORT}/api/products`);
    console.log('=================================');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Đang dừng server...');
    await pool.end();
    process.exit(0);
});