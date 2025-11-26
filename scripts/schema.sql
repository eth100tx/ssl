-- SSL Inc. Database Schema
-- Run this first to create all tables from scratch
-- Usage: Import this file into your MySQL database

-- Drop existing tables (in order due to foreign keys)
DROP TABLE IF EXISTS order_workers;
DROP TABLE IF EXISTS employee_schedules;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS equipment;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS customers;

-- ============================================
-- CUSTOMERS
-- ============================================
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  contact_name VARCHAR(255),
  phone VARCHAR(50),
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  zip VARCHAR(20),
  fax VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- EQUIPMENT
-- ============================================
CREATE TABLE equipment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  serial_number VARCHAR(100) UNIQUE,
  name VARCHAR(255) NOT NULL,
  category ENUM('audio', 'video', 'lighting', 'other') DEFAULT 'other',
  sale_price DECIMAL(10, 2),
  rental_rate DECIMAL(10, 2),
  description TEXT,
  specifications TEXT,
  status ENUM('available', 'reserved', 'out', 'maintenance') DEFAULT 'available',
  maintenance_due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- EMPLOYEES (full-time and contract workers)
-- ============================================
CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role ENUM('president', 'secretary', 'technician', 'contract') DEFAULT 'contract',
  phone VARCHAR(50),
  beeper VARCHAR(50),
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  zip VARCHAR(20),
  email VARCHAR(255),
  skills TEXT,
  hourly_rate DECIMAL(10, 2),
  status ENUM('active', 'inactive') DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- ORDERS (proposals, orders, invoices)
-- ============================================
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  order_number VARCHAR(50) UNIQUE,
  type ENUM('proposal', 'order', 'invoice') DEFAULT 'proposal',
  status ENUM('draft', 'sent', 'accepted', 'completed', 'cancelled') DEFAULT 'draft',
  event_date DATE,
  event_address VARCHAR(255),
  event_city VARCHAR(100),
  event_state VARCHAR(50),
  event_zip VARCHAR(20),
  shipping_address VARCHAR(255),
  shipping_city VARCHAR(100),
  shipping_state VARCHAR(50),
  shipping_zip VARCHAR(20),
  ship_date DATE,
  ship_method VARCHAR(100),
  payment_method VARCHAR(100),
  payment_terms VARCHAR(100),
  tax_exempt_number VARCHAR(100),
  comments TEXT,
  sales_total DECIMAL(10, 2) DEFAULT 0,
  rental_total DECIMAL(10, 2) DEFAULT 0,
  operator_total DECIMAL(10, 2) DEFAULT 0,
  total_cost DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- ============================================
-- ORDER ITEMS
-- ============================================
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  equipment_id INT,
  item_type ENUM('sale', 'rental', 'operator') NOT NULL,
  description VARCHAR(255),
  skill VARCHAR(100),
  quantity INT DEFAULT 1,
  unit_price DECIMAL(10, 2),
  rental_start DATE,
  rental_end DATE,
  hours DECIMAL(6, 2),
  total DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE SET NULL
);

-- ============================================
-- ORDER WORKERS (assign multiple workers to orders)
-- ============================================
CREATE TABLE order_workers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  employee_id INT NOT NULL,
  role VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- ============================================
-- RESERVATIONS
-- ============================================
CREATE TABLE reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipment_id INT NOT NULL,
  order_id INT,
  customer_name VARCHAR(255),
  reservation_date DATE NOT NULL,
  event_date DATE NOT NULL,
  time_out TIME,
  time_due_in TIME,
  time_returned TIME,
  condition_notes TEXT,
  status ENUM('reserved', 'out', 'returned', 'cancelled') DEFAULT 'reserved',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- ============================================
-- EMPLOYEE SCHEDULES
-- ============================================
CREATE TABLE employee_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  order_id INT,
  schedule_date DATE NOT NULL,
  required_time_in TIME,
  required_time_out TIME,
  actual_time_in TIME,
  actual_time_out TIME,
  hours_worked DECIMAL(6, 2),
  overtime_hours DECIMAL(6, 2) DEFAULT 0,
  notes TEXT,
  status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_company ON customers(company);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_category ON equipment(category);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_event_date ON orders(event_date);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_workers_order ON order_workers(order_id);
CREATE INDEX idx_order_workers_employee ON order_workers(employee_id);
CREATE INDEX idx_reservations_equipment ON reservations(equipment_id);
CREATE INDEX idx_reservations_event_date ON reservations(event_date);
CREATE INDEX idx_employees_role ON employees(role);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_schedules_employee ON employee_schedules(employee_id);
CREATE INDEX idx_schedules_date ON employee_schedules(schedule_date);
CREATE INDEX idx_schedules_order ON employee_schedules(order_id);
