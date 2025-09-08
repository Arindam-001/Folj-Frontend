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

// Get user's tasks
router.get('/', authenticateToken, (req, res) => {
  db.query(`
    SELECT t.*, u.name as assigned_by_name 
    FROM tasks t 
    LEFT JOIN users u ON t.assigned_by = u.id 
    WHERE t.user_id = ? 
    ORDER BY t.created_at DESC
  `, [req.user.userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Create task
router.post('/', authenticateToken, (req, res) => {
  const { title, description, dueDate, priority, status } = req.body;
  
  db.query(
    'INSERT INTO tasks (title, description, due_date, priority, status, user_id) VALUES (?, ?, ?, ?, ?, ?)',
    [title, description, dueDate, priority || 'medium', status || 'active', req.user.userId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: result.insertId, title, description, dueDate, priority, status });
    }
  );
});

// Update task
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, description, completed, status, priority } = req.body;
  
  // If task is being completed, create notification
  if (completed && status === 'completed') {
    db.query('SELECT t.*, u.name as user_name FROM tasks t JOIN users u ON t.user_id = u.id WHERE t.id = ? AND t.user_id = ?', [id, req.user.userId], (err, taskResult) => {
      if (!err && taskResult.length > 0 && taskResult[0].assigned_by) {
        const task = taskResult[0];
        db.query(
          'INSERT INTO notifications (admin_id, message, task_id, created_at) VALUES (?, ?, ?, NOW())',
          [task.assigned_by, `${task.user_name} completed task: "${task.title}"`, id],
          (notifErr) => {
            if (notifErr) console.error('Notification creation failed:', notifErr);
          }
        );
      }
    });
  }
  
  db.query(
    'UPDATE tasks SET title = ?, description = ?, completed = ?, status = ?, priority = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
    [title, description, completed, status, priority, id, req.user.userId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Task not found or unauthorized' });
      }
      res.json({ message: 'Task updated successfully' });
    }
  );
});

// Delete task (only user-created tasks)
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.query('DELETE FROM tasks WHERE id = ? AND user_id = ? AND assigned_by IS NULL', [id, req.user.userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found, unauthorized, or cannot delete admin-assigned task' });
    }
    res.json({ message: 'Task deleted successfully' });
  });
});

module.exports = router;