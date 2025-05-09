-- Create database (optional, usually managed externally in Neon)
-- CREATE DATABASE iwb_db;

-- Connect to the database (handled externally in most PostgreSQL environments)
-- \c iwb_db

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL,
    role TEXT CHECK (role IN ('sales', 'finance', 'developer', 'investor', 'partner', 'client')) NOT NULL,
    mfa_code VARCHAR(6)
);

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category TEXT CHECK (category IN ('RAM', 'Hard Drive', 'Motherboard')) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    image VARCHAR(255) NOT NULL
);

-- Sales table
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id),
    user_id INT NOT NULL REFERENCES users(id),
    amount NUMERIC(10, 2) NOT NULL,
    sale_date TIMESTAMP NOT NULL
);

-- Queries table
CREATE TABLE queries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'complete')) NOT NULL,
    response TEXT,
    date_submitted TIMESTAMP NOT NULL
);

-- Insert 15 products
INSERT INTO products (name, category, price, image) VALUES
('8GB DDR4 RAM', 'RAM', 200.00, 'ram1.jpg'),
('16GB DDR4 RAM', 'RAM', 350.00, 'ram2.jpg'),
('32GB DDR4 RAM', 'RAM', 600.00, 'ram3.jpg'),
('8GB DDR5 RAM', 'RAM', 250.00, 'ram4.jpg'),
('16GB DDR5 RAM', 'RAM', 400.00, 'ram5.jpg'),
('1TB HDD', 'Hard Drive', 150.00, 'hdd1.jpg'),
('2TB HDD', 'Hard Drive', 250.00, 'hdd2.jpg'),
('500GB SSD', 'Hard Drive', 200.00, 'ssd1.jpg'),
('1TB SSD', 'Hard Drive', 350.00, 'ssd2.jpg'),
('2TB SSD', 'Hard Drive', 500.00, 'ssd3.jpg'),
('Intel Core Motherboard', 'Motherboard', 600.00, 'mb1.jpg'),
('AMD Ryzen Motherboard', 'Motherboard', 550.00, 'mb2.jpg'),
('ASUS ROG Motherboard', 'Motherboard', 700.00, 'mb3.jpg'),
('MSI Gaming Motherboard', 'Motherboard', 650.00, 'mb4.jpg'),
('Gigabyte Ultra Motherboard', 'Motherboard', 800.00, 'mb5.jpg');
