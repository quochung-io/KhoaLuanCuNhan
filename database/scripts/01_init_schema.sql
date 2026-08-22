-- ECC Database Schema Initialization
-- Database: Microsoft SQL Server (T-SQL)

-- 1. Table: Users (Khách hàng, Nhà cung cấp, Admin)
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) UNIQUE NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    email NVARCHAR(100) UNIQUE NOT NULL,
    role NVARCHAR(20) NOT NULL, -- 'Admin', 'Supplier', 'Customer'
    phone NVARCHAR(20),
    address NVARCHAR(MAX),
    latitude FLOAT,
    longitude FLOAT,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- 2. Table: Categories
CREATE TABLE categories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX)
);

-- 3. Table: Products (Nông sản)
CREATE TABLE products (
    id INT IDENTITY(1,1) PRIMARY KEY,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    name NVARCHAR(150) NOT NULL,
    description NVARCHAR(MAX),
    image_url NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE()
);

-- 4. Table: Batches (Quản lý tồn kho theo lô - FEFO)
CREATE TABLE product_batches (
    id INT IDENTITY(1,1) PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    supplier_id INT REFERENCES users(id), -- SQL Server không cho phép cascade từ nhiều phía để tránh cycles
    batch_code NVARCHAR(50) UNIQUE NOT NULL,
    quantity INT NOT NULL CHECK (quantity >= 0),
    original_quantity INT NOT NULL,
    price DECIMAL(18, 2) NOT NULL,
    manufactured_date DATE NOT NULL,
    expiry_date DATE NOT NULL, -- Cần thiết cho FEFO
    created_at DATETIME DEFAULT GETDATE()
);

-- 5. Table: Orders
CREATE TABLE orders (
    id INT IDENTITY(1,1) PRIMARY KEY,
    customer_id INT REFERENCES users(id),
    order_date DATETIME DEFAULT GETDATE(),
    status NVARCHAR(20) NOT NULL, -- 'Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'
    total_amount DECIMAL(18, 2) NOT NULL,
    shipping_address NVARCHAR(MAX),
    latitude FLOAT,
    longitude FLOAT
);

-- 6. Table: Order Details
CREATE TABLE order_items (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(18, 2) NOT NULL
);

GO

-- Trigger tự động cập nhật updated_at khi có cập nhật bảng users
CREATE TRIGGER trg_users_UpdateTimestamp
ON users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE users
    SET updated_at = GETDATE()
    FROM users u
    INNER JOIN inserted i ON u.id = i.id;
END;
GO
