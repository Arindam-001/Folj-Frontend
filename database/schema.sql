CREATE DATABASE IF NOT EXISTS care_db;
USE care_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  date_of_birth DATE,
  marital_status VARCHAR(50),
  phone_number VARCHAR(15),
  alternate_number VARCHAR(15),
  address TEXT,
  state VARCHAR(100),
  city VARCHAR(100),
  pin_code VARCHAR(10),
  occupation VARCHAR(100),
  work_profile TEXT,
  week_offs JSON,
  folj_duration VARCHAR(100),
  connect_group VARCHAR(10),
  connect_group_leader VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@care.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  due_date DATE,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'active',
  completed BOOLEAN DEFAULT FALSE,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE connection_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  full_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(15) NOT NULL,
  gender VARCHAR(10) NOT NULL,
  marital_status VARCHAR(20) NOT NULL,
  state VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  pin_code VARCHAR(10) NOT NULL,
  address TEXT NOT NULL,
  church_membership VARCHAR(50),
  other_church_name VARCHAR(100),
  connect_group VARCHAR(50),
  visit_request VARCHAR(50),
  leadership_video_call VARCHAR(10),
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);