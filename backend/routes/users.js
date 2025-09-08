const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  const { 
    name, email, password, dateOfBirth, maritalStatus, phoneNumber, 
    alternateNumber, address, state, city, pinCode, occupation, 
    workProfile, weekOffs, folJDuration, connectGroup, connectGroupLeader 
  } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const weekOffsJson = Array.isArray(weekOffs) ? JSON.stringify(weekOffs) : weekOffs;
    
    db.query(
      `INSERT INTO users (name, email, password, date_of_birth, marital_status, 
       phone_number, alternate_number, address, state, city, pin_code, occupation, 
       work_profile, week_offs, folj_duration, connect_group, connect_group_leader) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, dateOfBirth, maritalStatus, phoneNumber, 
       alternateNumber, address, state, city, pinCode, occupation, workProfile, 
       weekOffsJson, folJDuration, connectGroup, connectGroupLeader],
      (err, result) => {
        if (err) {
          console.error('Registration error:', err);
          return res.status(500).json({ error: 'Registration failed: ' + err.message });
        }
        res.status(201).json({ message: 'User created successfully' });
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
});

// Login user or admin
router.post('/login', async (req, res) => {
  const { emailOrPhone, password } = req.body;
  
  try {
    const isEmail = emailOrPhone.includes('@');
    const query = isEmail ? 
      'SELECT * FROM users WHERE email = ?' : 
      'SELECT * FROM users WHERE phone_number = ?';
    
    db.query(query, [emailOrPhone], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Login failed' });
      }
      
      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const user = results[0];
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const token = jwt.sign({ 
        userId: user.id, 
        role: user.role 
      }, process.env.JWT_SECRET, { expiresIn: '24h' });
      
      res.json({ 
        token, 
        isAdmin: user.role === 'admin',
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email,
          role: user.role
        } 
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;