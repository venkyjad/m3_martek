-- Initialize the database
CREATE DATABASE IF NOT EXISTS backend_db;
USE backend_db;

-- Create a sample table for testing
CREATE TABLE IF NOT EXISTS health_checks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    message TEXT
);

-- Insert initial health check records
INSERT INTO health_checks (service_name, status, message) VALUES 
('mysql', 'healthy', 'Database initialized successfully'),
('api', 'healthy', 'API service ready');

-- Create application user (optional, for better security)
-- CREATE USER IF NOT EXISTS 'app_user'@'%' IDENTIFIED BY 'app_password';
-- GRANT ALL PRIVILEGES ON backend_db.* TO 'app_user'@'%';
-- FLUSH PRIVILEGES;
