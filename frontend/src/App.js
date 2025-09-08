import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'));

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={!token && !adminToken ? <Login setToken={setToken} setAdminToken={setAdminToken} /> : <Navigate to={token ? "/dashboard" : "/admin/dashboard"} />} 
          />
          <Route 
            path="/register" 
            element={!token ? <Register /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/dashboard" 
            element={token ? <Dashboard setToken={setToken} /> : <Navigate to="/login" />} 
          />


          <Route 
            path="/admin/dashboard" 
            element={adminToken ? <AdminDashboard setAdminToken={setAdminToken} /> : <Navigate to="/login" />} 
          />
          <Route path="/" element={<Navigate to={token ? "/dashboard" : adminToken ? "/admin/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;