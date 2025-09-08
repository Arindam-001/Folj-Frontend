const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const router = express.Router();

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Get user's submitted forms
router.get('/my-submissions', authenticateToken, (req, res) => {
  db.query(
    'SELECT * FROM connection_requests WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.userId],
    (err, results) => {
      if (err) {
        console.error('Error fetching submissions:', err);
        return res.status(500).json({ error: 'Failed to fetch submissions' });
      }
      res.json(results);
    }
  );
});

// Submit connection request
router.post('/submit', authenticateToken, (req, res) => {
  const {
    fullName, phoneNumber, gender, maritalStatus, state, city, pin, address,
    churchMembership, otherChurchName, connectGroup, visitRequest, leadershipVideoCall, comments
  } = req.body;
  
  db.query(
    `INSERT INTO connection_requests (user_id, full_name, phone_number, gender, marital_status, 
     state, city, pin_code, address, church_membership, other_church_name, connect_group, 
     visit_request, leadership_video_call, comments) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.user.userId, fullName, phoneNumber, gender, maritalStatus, state, city, pin, address,
     churchMembership, otherChurchName, connectGroup, visitRequest, leadershipVideoCall, comments],
    (err, result) => {
      if (err) {
        console.error('Connection request error:', err);
        return res.status(500).json({ error: 'Failed to submit request' });
      }
      res.status(201).json({ message: 'Connection request submitted successfully', id: result.insertId });
    }
  );
});

// Update connection request
router.put('/update/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const {
    fullName, phoneNumber, gender, maritalStatus, state, city, pin, address,
    churchMembership, otherChurchName, connectGroup, visitRequest, leadershipVideoCall, comments
  } = req.body;
  
  db.query(
    `UPDATE connection_requests SET full_name = ?, phone_number = ?, gender = ?, marital_status = ?, 
     state = ?, city = ?, pin_code = ?, address = ?, church_membership = ?, other_church_name = ?, 
     connect_group = ?, visit_request = ?, leadership_video_call = ?, comments = ? 
     WHERE id = ? AND user_id = ?`,
    [fullName, phoneNumber, gender, maritalStatus, state, city, pin, address,
     churchMembership, otherChurchName, connectGroup, visitRequest, leadershipVideoCall, comments, id, req.user.userId],
    (err, result) => {
      if (err) {
        console.error('Connection request update error:', err);
        return res.status(500).json({ error: 'Failed to update request' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Request not found or unauthorized' });
      }
      res.json({ message: 'Connection request updated successfully' });
    }
  );
});

module.exports = router;