CREATE DATABASE IF NOT EXISTS footshop_db;
USE footshop_db;

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price VARCHAR(50) NOT NULL,
    image VARCHAR(500) NOT NULL,
    category VARCHAR(100) NOT NULL,
    badge VARCHAR(50) NULL,
    badge_class VARCHAR(50) NULL,
    description TEXT NULL,
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


UPDATE products
SET image = 'https://supersports.com.vn/cdn/shop/files/JJ4182-1_1200x1200.jpg?v=1750667903'
WHERE id = 8;


UPDATE products
SET price = '3.100.000'
WHERE id = 5;

INSERT INTO products (name, price, image, category, badge, badge_class, description, stock) VALUES
('Giày Nike Mercurial', '2.990.000', 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500&h=500&fit=crop', 'Giày đá bóng', 'HOT', '', 'Giày đá bóng chuyên nghiệp Nike Mercurial với công nghệ mới nhất', 50),
('Áo đấu Manchester United', '890.000', 'https://images.unsplash.com/photo-1522778526097-ce0a22ceb253?w=500&h=500&fit=crop', 'Áo đấu', 'MỚI', 'new', 'Áo đấu chính thức Manchester United mùa giải mới', 100),
('Quần short Adidas', '450.000', 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&h=500&fit=crop', 'Quần áo', NULL, NULL, 'Quần short tập luyện Adidas chất lượng cao', 75),
('Giày Adidas Predator', '3.290.000', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop', 'Giày đá bóng', 'HOT', '', 'Giày đá bóng Adidas Predator với độ bám bóng tuyệt vời', 30),
('Áo Barcelona Home', '920.000', 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=500&h=500&fit=crop', 'Áo đấu', NULL, NULL, 'Áo đấu sân nhà Barcelona chính hãng', 60),
('Găng tay thủ môn', '650.000', 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=500&h=500&fit=crop', 'Phụ kiện', 'SALE', 'sale', 'Găng tay thủ môn chuyên nghiệp với lớp đệm tốt', 40),
('Giày Puma Future', '2.750.000', 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=500&h=500&fit=crop', 'Giày đá bóng', 'MỚI', 'new', 'Giày Puma Future với thiết kế năng động', 45),
('Áo Real Madrid Away', '950.000', 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=500&h=500&fit=crop', 'Áo đấu', 'HOT', '', 'Áo đấu sân khách Real Madrid', 80);

-- Tạo bảng danh mục
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO categories (name, icon) VALUES
('Giày đá bóng', '👟'),
('Áo đấu', '👕'),
('Quần áo', '🩳'),
('Phụ kiện', '🧤');

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


SELECT * FROM products ORDER BY created_at DESC;

SELECT * FROM products WHERE category = 'Giày đá bóng';

SELECT * FROM products WHERE name LIKE '%Nike%';

SELECT p.*, c.icon 
FROM products p
LEFT JOIN categories c ON p.category = c.name;

UPDATE products SET stock = 100 WHERE id = 1;

UPDATE products SET price = '3.500.000' WHERE id = 4;

DELETE FROM products WHERE id = 1;

SELECT category, COUNT(*) as total 
FROM products 
GROUP BY category;

SELECT category, SUM(CAST(REPLACE(price, '.', '') AS UNSIGNED) * stock) as total_value
FROM products
GROUP BY category;

SELECT category, AVG(CAST(REPLACE(price, '.', '') AS UNSIGNED)) as avg_price
FROM products
GROUP BY category;

SELECT p.name, SUM(oi.quantity) as total_sold
FROM products p
JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id
ORDER BY total_sold DESC
LIMIT 10;


