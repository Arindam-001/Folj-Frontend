const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const router = express.Router();

// Ensure default admin exists
const ensureDefaultAdmin = async () => {
  db.query('SELECT * FROM users WHERE email = ?', ['admin@care.com'], async (err, results) => {
    if (err || results.length === 0) {
      const defaultPassword = await bcrypt.hash('admin123', 10);
      db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Admin User', 'admin@care.com', defaultPassword, 'admin'],
        (err) => {
          if (err) console.error('Error creating default admin:', err);
          else console.log('Default admin ready: admin@care.com / admin123');
        }
      );
    } else {
      console.log('Admin user exists: admin@care.com / admin123');
    }
  });
};
ensureDefaultAdmin();

// Admin JWT middleware
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.user = user;
    next();
  });
};



// Update admin credentials
router.put('/update-credentials', authenticateAdmin, async (req, res) => {
  const { name, email, currentPassword, newPassword } = req.body;
  
  try {
    db.query('SELECT * FROM users WHERE id = ?', [req.user.userId], async (err, results) => {
      if (err || results.length === 0) {
        return res.status(500).json({ error: 'Admin not found' });
      }
      
      const admin = results[0];
      const isValidPassword = await bcrypt.compare(currentPassword, admin.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
      
      const hashedNewPassword = newPassword ? await bcrypt.hash(newPassword, 10) : admin.password;
      
      db.query(
        'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?',
        [name || admin.name, email || admin.email, hashedNewPassword, req.user.userId],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Update failed' });
          }
          res.json({ message: 'Credentials updated successfully' });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Update failed' });
  }
});

// Get dashboard stats
router.get('/dashboard-stats', authenticateAdmin, (req, res) => {
  const queries = [
    'SELECT COUNT(*) as totalUsers FROM users WHERE role = "user"',
    'SELECT COUNT(*) as totalForms FROM connection_requests',
    'SELECT COUNT(*) as totalTasks FROM tasks'
  ];
  
  Promise.all(queries.map(query => 
    new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    })
  )).then(results => {
    res.json({
      totalUsers: results[0].totalUsers,
      totalForms: results[1].totalForms,
      totalTasks: results[2].totalTasks
    });
  }).catch(err => {
    res.status(500).json({ error: 'Failed to fetch stats' });
  });
});

// Get all users (excluding admins)
router.get('/users', authenticateAdmin, (req, res) => {
  db.query('SELECT id, name, email, phone_number, created_at FROM users WHERE role = "user" ORDER BY created_at DESC', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    res.json(results);
  });
});

// Get user details with tasks
router.get('/users/:id', authenticateAdmin, (req, res) => {
  const userId = req.params.id;
  
  const queries = [
    'SELECT * FROM users WHERE id = ? AND role = "user"',
    'SELECT * FROM tasks WHERE user_id = ? AND assigned_by IS NOT NULL AND completed = 1 ORDER BY updated_at DESC',
    'SELECT * FROM tasks WHERE user_id = ? AND assigned_by IS NOT NULL AND completed = 0 AND due_date < CURDATE() ORDER BY due_date ASC'
  ];
  
  Promise.all(queries.map((query, index) => 
    new Promise((resolve, reject) => {
      db.query(query, index === 0 ? [userId] : [userId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    })
  )).then(results => {
    if (results[0].length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      user: results[0][0],
      completedTasks: results[1],
      missedTasks: results[2]
    });
  }).catch(err => {
    res.status(500).json({ error: 'Failed to fetch user details' });
  });
});

// Get all connection requests
router.get('/connection-requests', authenticateAdmin, (req, res) => {
  db.query(`
    SELECT cr.*, u.name as user_name, u.email as user_email 
    FROM connection_requests cr 
    LEFT JOIN users u ON cr.user_id = u.id 
    ORDER BY cr.created_at DESC
  `, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch connection requests' });
    }
    res.json(results);
  });
});

// Assign task to user
router.post('/assign-task', authenticateAdmin, (req, res) => {
  const { user_id, title, description, task_type, due_date, priority } = req.body;
  
  db.query(
    'INSERT INTO tasks (title, description, task_type, due_date, priority, user_id, assigned_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [title, description, task_type, due_date, priority || 'medium', user_id, req.user.userId, 'assigned'],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to assign task' });
      }
      res.json({ message: 'Task assigned successfully', taskId: result.insertId });
    }
  );
});

// Get assigned tasks
router.get('/assigned-tasks', authenticateAdmin, (req, res) => {
  db.query(`
    SELECT t.*, u.name as user_name, u.email as user_email, u.phone_number 
    FROM tasks t 
    JOIN users u ON t.user_id = u.id 
    WHERE t.assigned_by IS NOT NULL AND (t.status = 'assigned' OR t.status = 'active') AND t.completed = 0
    ORDER BY t.created_at DESC
  `, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch assigned tasks' });
    }
    res.json(results);
  });
});

// Get completed tasks
router.get('/completed-tasks', authenticateAdmin, (req, res) => {
  db.query(`
    SELECT t.*, u.name as user_name, u.email as user_email, u.phone_number 
    FROM tasks t 
    JOIN users u ON t.user_id = u.id 
    WHERE t.assigned_by IS NOT NULL AND t.completed = 1
    ORDER BY t.updated_at DESC
  `, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch completed tasks' });
    }
    res.json(results);
  });
});

// Get pending tasks (overdue)
router.get('/pending-tasks', authenticateAdmin, (req, res) => {
  db.query(`
    SELECT t.*, u.name as user_name, u.email as user_email, u.phone_number 
    FROM tasks t 
    JOIN users u ON t.user_id = u.id 
    WHERE t.assigned_by IS NOT NULL AND t.completed = 0 AND t.due_date < CURDATE()
    ORDER BY t.due_date ASC
  `, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch pending tasks' });
    }
    res.json(results);
  });
});

// Get admin notifications
router.get('/notifications', authenticateAdmin, (req, res) => {
  db.query(
    'SELECT * FROM notifications WHERE admin_id = ? ORDER BY created_at DESC LIMIT 20',
    [req.user.userId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch notifications' });
      }
      res.json(results);
    }
  );
});

// Mark notification as read
router.put('/notifications/:id/read', authenticateAdmin, (req, res) => {
  db.query(
    'UPDATE notifications SET is_read = TRUE WHERE id = ? AND admin_id = ?',
    [req.params.id, req.user.userId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to mark notification as read' });
      }
      res.json({ message: 'Notification marked as read' });
    }
  );
});

module.exports = router;