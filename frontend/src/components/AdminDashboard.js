import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = ({ setAdminToken }) => {
  const [stats, setStats] = useState({ totalUsers: 0, totalForms: 0, totalTasks: 0 });
  const [users, setUsers] = useState([]);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [taskTab, setTaskTab] = useState('assigned');
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [taskForm, setTaskForm] = useState({
    user_id: '', title: '', description: '', task_type: 'To connect in general', 
    due_date: '', priority: 'medium'
  });
  const [credentialsForm, setCredentialsForm] = useState({
    username: '', email: '', currentPassword: '', newPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const admin = JSON.parse(localStorage.getItem('admin'));

  useEffect(() => {
    fetchDashboardData();
    fetchNotifications();
    
    // Poll for new notifications every 5 seconds
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [statsRes, usersRes, formsRes, assignedRes, completedRes, pendingRes] = await Promise.all([
        axios.get('http://localhost:5001/api/admin/dashboard-stats', { headers }),
        axios.get('http://localhost:5001/api/admin/users', { headers }),
        axios.get('http://localhost:5001/api/admin/connection-requests', { headers }),
        axios.get('http://localhost:5001/api/admin/assigned-tasks', { headers }),
        axios.get('http://localhost:5001/api/admin/completed-tasks', { headers }),
        axios.get('http://localhost:5001/api/admin/pending-tasks', { headers })
      ]);
      
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setConnectionRequests(formsRes.data);
      setAssignedTasks(assignedRes.data);
      setCompletedTasks(completedRes.data);
      setPendingTasks(pendingRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      if (error.response?.status === 403) {
        handleLogout();
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    setAdminToken(null);
  };

  const handleUpdateCredentials = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put('http://localhost:5001/api/admin/update-credentials', credentialsForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Credentials updated successfully!');
      setShowCredentialsModal(false);
      setCredentialsForm({ username: '', email: '', currentPassword: '', newPassword: '' });
    } catch (error) {
      alert(error.response?.data?.error || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:5001/api/admin/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`http://localhost:5001/api/admin/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => n.id === id ? {...n, is_read: true} : n));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`http://localhost:5001/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserDetails(response.data);
      setShowUserModal(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post('http://localhost:5001/api/admin/assign-task', taskForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Task assigned successfully!');
      setShowTaskModal(false);
      setTaskForm({ user_id: '', title: '', description: '', task_type: 'To connect in general', due_date: '', priority: 'medium' });
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.error || 'Task assignment failed');
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="admin-overview">
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="stat-number">{stats.totalUsers}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-number">{stats.totalForms}</div>
          <div className="stat-label">Connection Requests</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-number">{stats.totalTasks}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="admin-table-container">
      <div className="table-header">
        <h3>Registered Users</h3>
        <button onClick={() => setShowTaskModal(true)} className="admin-btn">
          Assign Task
        </button>
      </div>
      <div className="admin-table">
        {users.map(user => (
          <div key={user.id} className="admin-table-row">
            <div className="user-info">
              <h4 
                className="clickable-name" 
                onClick={() => fetchUserDetails(user.id)}
              >
                {user.name}
              </h4>
              <p>{user.email}</p>
              <p>{user.phone_number}</p>
            </div>
            <div className="user-actions">
              <button 
                onClick={() => {
                  setTaskForm({...taskForm, user_id: user.id});
                  setShowTaskModal(true);
                }}
                className="assign-btn"
              >
                Assign Task
              </button>
              <div className="user-date">
                {new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderConnectionRequests = () => (
    <div className="admin-table-container">
      <h3>Connection Requests</h3>
      <div className="admin-table">
        {connectionRequests.map(request => (
          <div key={request.id} className="admin-table-row">
            <div className="request-info">
              <h4 
                className="clickable-name" 
                onClick={() => {
                  setSelectedConnection(request);
                  setShowConnectionModal(true);
                }}
              >
                {request.full_name}
              </h4>
            </div>
            <div className="request-date">
              {new Date(request.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTasksByType = () => {
    let tasks = [];
    let title = '';
    
    switch(taskTab) {
      case 'assigned':
        tasks = assignedTasks;
        title = 'Assigned Tasks';
        break;
      case 'completed':
        tasks = completedTasks;
        title = 'Completed Tasks';
        break;
      case 'pending':
        tasks = pendingTasks;
        title = 'Pending Tasks (Overdue)';
        break;
      default:
        tasks = assignedTasks;
        title = 'Assigned Tasks';
    }
    
    return (
      <div className="admin-table-container">
        <div className="task-tabs-admin">
          <button 
            className={`task-tab-btn ${taskTab === 'assigned' ? 'active' : ''}`}
            onClick={() => setTaskTab('assigned')}
          >
            Assigned ({assignedTasks.length})
          </button>
          <button 
            className={`task-tab-btn ${taskTab === 'completed' ? 'active' : ''}`}
            onClick={() => setTaskTab('completed')}
          >
            Completed ({completedTasks.length})
          </button>
          <button 
            className={`task-tab-btn ${taskTab === 'pending' ? 'active' : ''}`}
            onClick={() => setTaskTab('pending')}
          >
            Pending ({pendingTasks.length})
          </button>
        </div>
        
        <h3>{title}</h3>
        <div className="admin-table">
          {tasks.length === 0 ? (
            <div className="empty-state">
              <p>No {taskTab} tasks found.</p>
            </div>
          ) : (
            tasks.map(task => (
              <div key={task.id} className="admin-table-row">
                <div className="task-info">
                  <h4>{task.title}</h4>
                  <p><strong>Assigned to:</strong> {task.user_name} ({task.user_email})</p>
                  <p><strong>Type:</strong> {task.task_type}</p>
                  <p><strong>Priority:</strong> {task.priority}</p>
                  {task.due_date && <p><strong>Deadline:</strong> {new Date(task.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
                  <p><strong>Description:</strong> {task.description}</p>
                </div>
                <div className="task-status">
                  <span className={`status-badge ${taskTab === 'completed' ? 'completed' : taskTab === 'pending' ? 'pending' : task.status}`}>
                    {taskTab === 'completed' ? 'completed' : taskTab === 'pending' ? 'overdue' : task.status}
                  </span>
                  <div className="task-date">
                    {taskTab === 'completed' ? 
                      `Completed: ${new Date(task.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}` :
                      `Assigned: ${new Date(task.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
                    }
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-welcome">
          <h1>Admin Dashboard</h1>
          <p>Welcome back, {admin?.username}</p>
        </div>
        <div className="admin-actions">
          <div className="notification-wrapper">
            <button 
              className="notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              🔔
              {notifications.filter(n => !n.is_read).length > 0 && (
                <span className="notification-badge">
                  {notifications.filter(n => !n.is_read).length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h3>Task Notifications</h3>
                </div>
                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <div className="notification-item">
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        className={`notification-item ${notif.is_read ? 'read' : 'unread'}`}
                        onClick={() => markNotificationRead(notif.id)}
                      >
                        <p>{notif.message}</p>
                        <span className="notification-time">
                          {new Date(notif.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} at {new Date(notif.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          
          <button onClick={() => setShowCredentialsModal(true)} className="admin-btn">
            Update Credentials
          </button>
          <button onClick={handleLogout} className="admin-btn logout">
            Logout
          </button>
        </div>
      </header>

      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users ({stats.totalUsers})
        </button>
        <button 
          className={`admin-tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Connection Requests ({stats.totalForms})
        </button>
        <button 
          className={`admin-tab ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          Task Assessment ({assignedTasks.length + completedTasks.length + pendingTasks.length})
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'requests' && renderConnectionRequests()}
        {activeTab === 'tasks' && renderTasksByType()}
      </div>

      {showCredentialsModal && (
        <div className="form-modal">
          <div className="form-modal-content">
            <div className="form-header">
              <h2>Update Admin Credentials</h2>
              <button className="close-btn" onClick={() => setShowCredentialsModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleUpdateCredentials} className="admin-form">
              <div className="input-group">
                <label>New Username</label>
                <input
                  type="text"
                  placeholder="Enter new username (optional)"
                  value={credentialsForm.username}
                  onChange={(e) => setCredentialsForm({...credentialsForm, username: e.target.value})}
                />
              </div>
              
              <div className="input-group">
                <label>New Email</label>
                <input
                  type="email"
                  placeholder="Enter new email (optional)"
                  value={credentialsForm.email}
                  onChange={(e) => setCredentialsForm({...credentialsForm, email: e.target.value})}
                />
              </div>
              
              <div className="input-group">
                <label>Current Password *</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={credentialsForm.currentPassword}
                  onChange={(e) => setCredentialsForm({...credentialsForm, currentPassword: e.target.value})}
                  required
                />
              </div>
              
              <div className="input-group">
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password (optional)"
                  value={credentialsForm.newPassword}
                  onChange={(e) => setCredentialsForm({...credentialsForm, newPassword: e.target.value})}
                />
              </div>
              
              <button type="submit" className={`submit-btn ${loading ? 'loading' : ''}`} disabled={loading}>
                {loading ? 'Updating...' : 'Update Credentials'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showTaskModal && (
        <div className="form-modal">
          <div className="form-modal-content">
            <div className="form-header">
              <h2>Assign Task to Volunteer</h2>
              <button className="close-btn" onClick={() => setShowTaskModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleAssignTask} className="admin-form">
              <div className="input-group">
                <label>Select User *</label>
                <select
                  value={taskForm.user_id}
                  onChange={(e) => setTaskForm({...taskForm, user_id: e.target.value})}
                  required
                >
                  <option value="">Choose a user...</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} - {user.email}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="input-group">
                <label>Task Type *</label>
                <select
                  value={taskForm.task_type}
                  onChange={(e) => setTaskForm({...taskForm, task_type: e.target.value})}
                  required
                >
                  <option value="Prayer visit">Prayer visit</option>
                  <option value="Prayer call">Prayer call</option>
                  <option value="Hospital visit">Hospital visit</option>
                  <option value="To connect in general">To connect in general</option>
                  <option value="To connect to a connect group">To connect to a connect group</option>
                </select>
              </div>
              
              <div className="input-group">
                <label>Task Title *</label>
                <input
                  type="text"
                  placeholder="Enter task title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                  required
                />
              </div>
              
              <div className="input-group">
                <label>Description</label>
                <textarea
                  placeholder="Enter task description"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                  rows="3"
                />
              </div>
              
              <div className="input-row">
                <div className="input-group">
                  <label>Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div className="input-group">
                  <label>Deadline</label>
                  <input
                    type="date"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm({...taskForm, due_date: e.target.value})}
                  />
                </div>
              </div>
              
              <button type="submit" className={`submit-btn ${loading ? 'loading' : ''}`} disabled={loading}>
                {loading ? 'Assigning...' : 'Assign Task'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showUserModal && userDetails && (
        <div className="form-modal">
          <div className="form-modal-content user-details-modal">
            <div className="form-header">
              <h2>User Details - {userDetails.user.name}</h2>
              <button className="close-btn" onClick={() => setShowUserModal(false)}>×</button>
            </div>
            
            <div className="user-details-content">
              <div className="personal-details">
                <h3>Personal Information</h3>
                <div className="details-grid">
                  <p><strong>Name:</strong> {userDetails.user.name}</p>
                  <p><strong>Email:</strong> {userDetails.user.email}</p>
                  <p><strong>Phone:</strong> {userDetails.user.phone_number}</p>
                  <p><strong>Connect Leader:</strong> {userDetails.user.connect_group_leader || 'Not assigned'}</p>
                  <p><strong>Joined:</strong> {new Date(userDetails.user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              
              <div className="task-sections">
                <div className="completed-tasks-section">
                  <h3>Completed Tasks ({userDetails.completedTasks.length})</h3>
                  <div className="task-list-modal">
                    {userDetails.completedTasks.length === 0 ? (
                      <p className="no-tasks">No completed tasks</p>
                    ) : (
                      userDetails.completedTasks.map(task => (
                        <div key={task.id} className="task-item-modal completed">
                          <h4>{task.title}</h4>
                          <p>{task.description}</p>
                          <p><strong>Type:</strong> {task.task_type}</p>
                          <p><strong>Completed:</strong> {new Date(task.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                <div className="missed-tasks-section">
                  <h3>Missed Tasks ({userDetails.missedTasks.length})</h3>
                  <div className="task-list-modal">
                    {userDetails.missedTasks.length === 0 ? (
                      <p className="no-tasks">No missed tasks</p>
                    ) : (
                      userDetails.missedTasks.map(task => (
                        <div key={task.id} className="task-item-modal missed">
                          <h4>{task.title}</h4>
                          <p>{task.description}</p>
                          <p><strong>Type:</strong> {task.task_type}</p>
                          <p><strong>Deadline:</strong> {new Date(task.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConnectionModal && selectedConnection && (
        <div className="form-modal">
          <div className="form-modal-content connection-details-modal">
            <div className="form-header">
              <h2>Connection Request - {selectedConnection.full_name}</h2>
              <button className="close-btn" onClick={() => setShowConnectionModal(false)}>×</button>
            </div>
            
            <div className="connection-details-content">
              <div className="personal-details">
                <h3>Personal Information</h3>
                <div className="details-grid">
                  <p><strong>Name:</strong> {selectedConnection.full_name}</p>
                  <p><strong>Phone:</strong> {selectedConnection.phone_number}</p>
                  <p><strong>Gender:</strong> {selectedConnection.gender}</p>
                  <p><strong>Marital Status:</strong> {selectedConnection.marital_status}</p>
                  <p><strong>State:</strong> {selectedConnection.state}</p>
                  <p><strong>City:</strong> {selectedConnection.city}</p>
                  <p><strong>PIN Code:</strong> {selectedConnection.pin_code}</p>
                  <p><strong>Address:</strong> {selectedConnection.address}</p>
                </div>
              </div>
              
              <div className="connection-details">
                <h3>Connection Details</h3>
                <div className="details-grid">
                  <p><strong>Church Membership:</strong> {selectedConnection.church_membership || 'Not specified'}</p>
                  {selectedConnection.other_church_name && (
                    <p><strong>Other Church:</strong> {selectedConnection.other_church_name}</p>
                  )}
                  <p><strong>Connect Group:</strong> {selectedConnection.connect_group || 'Not specified'}</p>
                  <p><strong>Visit Request:</strong> {selectedConnection.visit_request || 'Not specified'}</p>
                  <p><strong>Leadership Video Call:</strong> {selectedConnection.leadership_video_call || 'Not specified'}</p>
                  <p><strong>Submitted:</strong> {new Date(selectedConnection.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              
              {selectedConnection.comments && (
                <div className="comments-section">
                  <h3>Comments</h3>
                  <div className="comments-box">
                    <p>{selectedConnection.comments}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;