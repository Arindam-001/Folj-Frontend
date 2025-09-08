import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = ({ setToken }) => {
  const [tasks, setTasks] = useState([]);

  const [activeTab, setActiveTab] = useState('active');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submittedForms, setSubmittedForms] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [memberForm, setMemberForm] = useState({
    // Personal Information
    fullName: '', phoneNumber: '', gender: '', maritalStatus: '', state: '', city: '', pin: '', address: '',
    // Connection Details  
    churchMembership: '', otherChurchName: '', connectGroup: '', visitRequest: '', leadershipVideoCall: '',
    // Additional Details
    comments: ''
  });
  
  const indianStates = {
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 'Anantapur'],
    'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tezpur', 'Bomdila'],
    'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur'],
    'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif'],
    'Chhattisgarh': ['Raipur', 'Bhilai', 'Korba', 'Bilaspur', 'Durg', 'Rajnandgaon'],
    'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar'],
    'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar'],
    'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Kullu', 'Hamirpur'],
    'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh'],
    'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga', 'Davangere'],
    'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha'],
    'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Dewas'],
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur'],
    'Manipur': ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur'],
    'Meghalaya': ['Shillong', 'Tura', 'Jowai', 'Nongpoh'],
    'Mizoram': ['Aizawl', 'Lunglei', 'Saiha', 'Champhai'],
    'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang'],
    'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri'],
    'Punjab': ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara'],
    'Sikkim': ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode'],
    'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Mahbubnagar'],
    'Tripura': ['Agartala', 'Dharmanagar', 'Udaipur', 'Kailashahar'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', 'Bareilly'],
    'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Kashipur', 'Rishikesh'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Malda', 'Bardhaman'],
    'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi'],
    'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur'],
    'Ladakh': ['Leh', 'Kargil']
  };
  
  const handleStateChange = (selectedState) => {
    setMemberForm({...memberForm, state: selectedState, city: ''});
  };
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchTasks();
    fetchSubmittedForms();
  }, []);

  const fetchSubmittedForms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/connections/my-submissions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubmittedForms(response.data);
    } catch (error) {
      console.error('Error fetching submitted forms:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };



  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const task = tasks.find(t => t.id === taskId);
      await axios.put(`http://localhost:5001/api/tasks/${taskId}`, {
        ...task,
        status: newStatus,
        completed: newStatus === 'completed'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };



  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
  };

  const markNotificationRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const getFilteredTasks = () => {
    const now = new Date();
    switch(activeTab) {
      case 'active':
        return tasks.filter(task => !task.completed && (!task.due_date || new Date(task.due_date) >= now));
      case 'pending':
        return tasks.filter(task => !task.completed && task.due_date && new Date(task.due_date) < now);
      case 'history':
        return tasks.filter(task => task.completed).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      default:
        return tasks;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/connections/submit', memberForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Connection request submitted successfully!');
      setShowForm(false);
      setFormStep(1);
      fetchSubmittedForms();
      setMemberForm({
        fullName: '', phoneNumber: '', gender: '', maritalStatus: '', state: '', city: '', pin: '', address: '',
        churchMembership: '', otherChurchName: '', connectGroup: '', visitRequest: '', leadershipVideoCall: '',
        comments: ''
      });
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5001/api/connections/update/${selectedForm.id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Connection request updated successfully!');
      setIsEditing(false);
      setShowFormModal(false);
      fetchSubmittedForms();
    } catch (error) {
      console.error('Form update error:', error);
      alert('Failed to update form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextFormStep = () => setFormStep(prev => Math.min(prev + 1, 3));
  const prevFormStep = () => setFormStep(prev => Math.max(prev - 1, 1));

  const renderFormStep = () => {
    switch(formStep) {
      case 1:
        return (
          <div className="form-step">
            <h3>Personal Information</h3>
            <div className="form-grid">
              <input
                type="text"
                placeholder="Full Name *"
                value={memberForm.fullName}
                onChange={(e) => setMemberForm({...memberForm, fullName: e.target.value})}
                required
              />
              <input
                type="tel"
                placeholder="Phone Number *"
                value={memberForm.phoneNumber}
                onChange={(e) => setMemberForm({...memberForm, phoneNumber: e.target.value})}
                required
              />
              <select
                value={memberForm.gender}
                onChange={(e) => setMemberForm({...memberForm, gender: e.target.value})}
                required
              >
                <option value="">Select Gender *</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <select
                value={memberForm.maritalStatus}
                onChange={(e) => setMemberForm({...memberForm, maritalStatus: e.target.value})}
                required
              >
                <option value="">Marital Status *</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
              <select
                value={memberForm.state}
                onChange={(e) => handleStateChange(e.target.value)}
                required
              >
                <option value="">Select State *</option>
                {Object.keys(indianStates).map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              <select
                value={memberForm.city}
                onChange={(e) => setMemberForm({...memberForm, city: e.target.value})}
                disabled={!memberForm.state}
                required
              >
                <option value="">Select City *</option>
                {memberForm.state && indianStates[memberForm.state]?.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="PIN Code *"
                value={memberForm.pin}
                onChange={(e) => setMemberForm({...memberForm, pin: e.target.value})}
                maxLength="6"
                required
              />
              <textarea
                placeholder="Complete Address *"
                value={memberForm.address}
                onChange={(e) => setMemberForm({...memberForm, address: e.target.value})}
                rows="3"
                className="full-width"
                required
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="form-step">
            <h3>Connection Details</h3>
            <div className="form-grid">
              <select
                value={memberForm.churchMembership}
                onChange={(e) => setMemberForm({...memberForm, churchMembership: e.target.value})}
                className="full-width"
              >
                <option value="">Church Membership</option>
                <option value="not-member">Not a Member</option>
                <option value="folj-member">FOLJ Member</option>
                <option value="other-church">Other Church Member</option>
              </select>
              
              {memberForm.churchMembership === 'other-church' && (
                <input
                  type="text"
                  placeholder="Name of the Church"
                  value={memberForm.otherChurchName}
                  onChange={(e) => setMemberForm({...memberForm, otherChurchName: e.target.value})}
                  className="full-width"
                />
              )}
              
              <select
                value={memberForm.connectGroup}
                onChange={(e) => setMemberForm({...memberForm, connectGroup: e.target.value})}
                className="full-width"
              >
                <option value="">Connect Group</option>
                <option value="already-member">Already a Connect Group Member</option>
                <option value="want-to-be">Want to be a Connect Group Member</option>
                <option value="not-now">Not Now</option>
              </select>
              
              <select
                value={memberForm.visitRequest}
                onChange={(e) => setMemberForm({...memberForm, visitRequest: e.target.value})}
                className="full-width"
              >
                <option value="">Visit Request</option>
                <option value="house-visit">House Visit</option>
                <option value="prayer-visit">Prayer Visit</option>
                <option value="hospital-visit">Hospital Visit</option>
              </select>
              
              <select
                value={memberForm.leadershipVideoCall}
                onChange={(e) => setMemberForm({...memberForm, leadershipVideoCall: e.target.value})}
                className="full-width"
              >
                <option value="">Leadership Video Call</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="form-step">
            <h3>Additional Details</h3>
            <div className="form-grid">
              <textarea
                placeholder="Additional Comments, Prayer Requests, or Special Needs"
                value={memberForm.comments}
                onChange={(e) => setMemberForm({...memberForm, comments: e.target.value})}
                rows="6"
                className="full-width"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="welcome-section">
          <div className="user-avatar">
            <span>{user?.name?.charAt(0)?.toUpperCase()}</span>
          </div>
          <div className="welcome-text">
            <h1>Welcome back, {user?.name}!</h1>
            <p>Here's what's happening with your tasks today</p>
          </div>
        </div>
        
        <div className="header-actions">
          <div className="notification-wrapper">
            <button 
              className="notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              🔔
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h3>Notifications</h3>
                </div>
                <div className="notification-list">
                  {notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                      onClick={() => markNotificationRead(notif.id)}
                    >
                      <p>{notif.message}</p>
                      <span className="notification-time">{notif.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{tasks.filter(t => !t.completed).length}</div>
          <div className="stat-label">Active Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{tasks.filter(t => !t.completed && new Date(t.dueDate) < new Date()).length}</div>
          <div className="stat-label">Pending Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{tasks.filter(t => t.completed).length}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{tasks.length}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{submittedForms.length}</div>
          <div className="stat-label">Forms Submitted</div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="left-column">
          <div className="forms-section">
            <h2>To Connect or Get Prayed</h2>
            <div className="single-form-card">
              <div className="form-icon">🙏</div>
              <h3>Connect With Us</h3>
              <p>Fill out your information to connect with our community or request prayer</p>
              <button className="form-btn" onClick={() => setShowForm(true)}>Open Form</button>
            </div>
          </div>
          
          <div className="submitted-forms-section">
            <h2>Total Forms Submitted</h2>
            <div className="forms-list">
              {submittedForms.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h3>No forms submitted yet</h3>
                  <p>Submit your first connection form to see it here.</p>
                </div>
              ) : (
                submittedForms.map(form => (
                  <div key={form.id} className="form-item">
                    <div className="form-content">
                      <div className="form-header">
                        <h3 
                          className="clickable-name" 
                          onClick={() => {
                            setSelectedForm(form);
                            setShowFormModal(true);
                          }}
                        >
                          {form.full_name}
                        </h3>
                        <span className="form-date">
                          {new Date(form.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="tasks-section">
          <div className="task-tabs">
            <button 
              className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              Active Tasks ({tasks.filter(t => !t.completed && (!t.due_date || new Date(t.due_date) >= new Date())).length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              Pending Tasks ({tasks.filter(t => !t.completed && t.due_date && new Date(t.due_date) < new Date()).length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              Task History ({tasks.filter(t => t.completed).length})
            </button>
          </div>

          <div className="task-list">
            {getFilteredTasks().length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h3>No tasks found</h3>
                <p>
                  {activeTab === 'active' && 'Create your first task to get started!'}
                  {activeTab === 'pending' && 'Great! No overdue tasks.'}
                  {activeTab === 'history' && 'Complete some tasks to see your history.'}
                </p>
              </div>
            ) : (
              getFilteredTasks().map(task => (
                <div key={task.id} className={`task-item ${task.priority} ${activeTab}`}>
                  <div className="task-content">
                    <div className="task-header">
                      <h3>{task.title}</h3>
                      <div className="task-meta">
                        <span className={`priority-badge ${task.priority}`}>
                          {task.priority?.toUpperCase() || 'MEDIUM'}
                        </span>
                        {task.due_date && (
                          <span className="due-date">
                            Deadline: {new Date(task.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="task-description">{task.description}</p>
                    {task.assigned_by_name && (
                      <p className="assigned-by">
                        <strong>Assigned by:</strong> {task.assigned_by_name}
                      </p>
                    )}
                    {task.task_type && (
                      <p className="task-type">
                        <strong>Type:</strong> {task.task_type}
                      </p>
                    )}
                    {activeTab === 'history' && (
                      <div className="completion-date">
                        Completed: {new Date(task.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                  
                  <div className="task-actions">
                    {activeTab !== 'history' && (
                      <button 
                        onClick={() => handleTaskStatusChange(task.id, 'completed')}
                        className="complete-btn"
                        title="Mark as completed"
                      >
                        ✓
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {showForm && (
        <div className="form-modal">
          <div className="form-modal-content">
            <div className="form-header">
              <h2>To Connect or Get Prayed</h2>
              <button className="close-btn" onClick={() => setShowForm(false)}>×</button>
            </div>
            
            <div className="form-progress">
              <div className="progress-steps">
                <div className={`step ${formStep >= 1 ? 'active' : ''}`}>1</div>
                <div className={`step ${formStep >= 2 ? 'active' : ''}`}>2</div>
                <div className={`step ${formStep >= 3 ? 'active' : ''}`}>3</div>
              </div>
              <div className="progress-labels">
                <span>Personal Info</span>
                <span>Connection Details</span>
                <span>Additional Details</span>
              </div>
            </div>
            
            <div className="form-content">
              {renderFormStep()}
              
              <div className="form-navigation">
                {formStep > 1 && (
                  <button type="button" onClick={prevFormStep} className="nav-btn prev-btn">
                    ← Previous
                  </button>
                )}
                {formStep < 3 ? (
                  <button type="button" onClick={nextFormStep} className="nav-btn next-btn">
                    Next →
                  </button>
                ) : (
                  <button type="button" onClick={handleFormSubmit} className={`nav-btn submit-btn ${loading ? 'loading' : ''}`} disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Form'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showFormModal && selectedForm && (
        <div className="form-modal">
          <div className="form-modal-content connection-details-modal">
            <div className="form-header">
              <h2>Connection Form - {selectedForm.full_name}</h2>
              <div className="form-actions">
                {!isEditing && (
                  <button 
                    className="edit-btn" 
                    onClick={() => {
                      setIsEditing(true);
                      setEditForm({
                        fullName: selectedForm.full_name,
                        phoneNumber: selectedForm.phone_number,
                        gender: selectedForm.gender,
                        maritalStatus: selectedForm.marital_status,
                        state: selectedForm.state,
                        city: selectedForm.city,
                        pin: selectedForm.pin_code,
                        address: selectedForm.address,
                        churchMembership: selectedForm.church_membership,
                        otherChurchName: selectedForm.other_church_name,
                        connectGroup: selectedForm.connect_group,
                        visitRequest: selectedForm.visit_request,
                        leadershipVideoCall: selectedForm.leadership_video_call,
                        comments: selectedForm.comments
                      });
                    }}
                  >
                    Edit
                  </button>
                )}
                <button className="close-btn" onClick={() => {
                  setShowFormModal(false);
                  setIsEditing(false);
                }}>×</button>
              </div>
            </div>
            
            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="edit-form">
                <div className="form-grid">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number *"
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})}
                    required
                  />
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                    required
                  >
                    <option value="">Select Gender *</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  <select
                    value={editForm.maritalStatus}
                    onChange={(e) => setEditForm({...editForm, maritalStatus: e.target.value})}
                    required
                  >
                    <option value="">Marital Status *</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                  <select
                    value={editForm.state}
                    onChange={(e) => {
                      setEditForm({...editForm, state: e.target.value, city: ''});
                    }}
                    required
                  >
                    <option value="">Select State *</option>
                    {Object.keys(indianStates).map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  <select
                    value={editForm.city}
                    onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                    disabled={!editForm.state}
                    required
                  >
                    <option value="">Select City *</option>
                    {editForm.state && indianStates[editForm.state]?.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="PIN Code *"
                    value={editForm.pin}
                    onChange={(e) => setEditForm({...editForm, pin: e.target.value})}
                    maxLength="6"
                    required
                  />
                  <textarea
                    placeholder="Complete Address *"
                    value={editForm.address}
                    onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                    rows="3"
                    className="full-width"
                    required
                  />
                  <select
                    value={editForm.churchMembership}
                    onChange={(e) => setEditForm({...editForm, churchMembership: e.target.value})}
                    className="full-width"
                  >
                    <option value="">Church Membership</option>
                    <option value="not-member">Not a Member</option>
                    <option value="folj-member">FOLJ Member</option>
                    <option value="other-church">Other Church Member</option>
                  </select>
                  {editForm.churchMembership === 'other-church' && (
                    <input
                      type="text"
                      placeholder="Name of the Church"
                      value={editForm.otherChurchName}
                      onChange={(e) => setEditForm({...editForm, otherChurchName: e.target.value})}
                      className="full-width"
                    />
                  )}
                  <select
                    value={editForm.connectGroup}
                    onChange={(e) => setEditForm({...editForm, connectGroup: e.target.value})}
                    className="full-width"
                  >
                    <option value="">Connect Group</option>
                    <option value="already-member">Already a Connect Group Member</option>
                    <option value="want-to-be">Want to be a Connect Group Member</option>
                    <option value="not-now">Not Now</option>
                  </select>
                  <select
                    value={editForm.visitRequest}
                    onChange={(e) => setEditForm({...editForm, visitRequest: e.target.value})}
                    className="full-width"
                  >
                    <option value="">Visit Request</option>
                    <option value="house-visit">House Visit</option>
                    <option value="prayer-visit">Prayer Visit</option>
                    <option value="hospital-visit">Hospital Visit</option>
                  </select>
                  <select
                    value={editForm.leadershipVideoCall}
                    onChange={(e) => setEditForm({...editForm, leadershipVideoCall: e.target.value})}
                    className="full-width"
                  >
                    <option value="">Leadership Video Call</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                  <textarea
                    placeholder="Additional Comments"
                    value={editForm.comments}
                    onChange={(e) => setEditForm({...editForm, comments: e.target.value})}
                    rows="4"
                    className="full-width"
                  />
                </div>
                <div className="form-buttons">
                  <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">
                    Cancel
                  </button>
                  <button type="submit" className={`submit-btn ${loading ? 'loading' : ''}`} disabled={loading}>
                    {loading ? 'Updating...' : 'Update Form'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="connection-details-content">
                <div className="personal-details">
                  <h3>Personal Information</h3>
                  <div className="details-grid">
                    <p><strong>Name:</strong> {selectedForm.full_name}</p>
                    <p><strong>Phone:</strong> {selectedForm.phone_number}</p>
                    <p><strong>Gender:</strong> {selectedForm.gender}</p>
                    <p><strong>Marital Status:</strong> {selectedForm.marital_status}</p>
                    <p><strong>State:</strong> {selectedForm.state}</p>
                    <p><strong>City:</strong> {selectedForm.city}</p>
                    <p><strong>PIN Code:</strong> {selectedForm.pin_code}</p>
                    <p><strong>Address:</strong> {selectedForm.address}</p>
                  </div>
                </div>
                
                <div className="connection-details">
                  <h3>Connection Details</h3>
                  <div className="details-grid">
                    <p><strong>Church Membership:</strong> {selectedForm.church_membership || 'Not specified'}</p>
                    {selectedForm.other_church_name && (
                      <p><strong>Other Church:</strong> {selectedForm.other_church_name}</p>
                    )}
                    <p><strong>Connect Group:</strong> {selectedForm.connect_group || 'Not specified'}</p>
                    <p><strong>Visit Request:</strong> {selectedForm.visit_request || 'Not specified'}</p>
                    <p><strong>Leadership Video Call:</strong> {selectedForm.leadership_video_call || 'Not specified'}</p>
                    <p><strong>Submitted:</strong> {new Date(selectedForm.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
                
                {selectedForm.comments && (
                  <div className="comments-section">
                    <h3>Comments</h3>
                    <div className="comments-box">
                      <p>{selectedForm.comments}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;