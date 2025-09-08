import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', dateOfBirth: '', maritalStatus: '',
    phoneNumber: '', alternateNumber: '', address: '', state: '', city: '', pinCode: '',
    occupation: '', workProfile: '', weekOffs: [], folJDuration: '', connectGroup: '',
    connectGroupLeader: '', otherLeader: '', photo: null
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [photoPreview, setPhotoPreview] = useState(null);
  const navigate = useNavigate();
  
  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    setFormData({...formData, state: selectedState, city: ''});
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFormData({...formData, password});
    setPasswordStrength(checkPasswordStrength(password));
  };

  const handleWeekOffChange = (day) => {
    const updatedWeekOffs = formData.weekOffs.includes(day)
      ? formData.weekOffs.filter(d => d !== day)
      : [...formData.weekOffs, day];
    setFormData({...formData, weekOffs: updatedWeekOffs});
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 10 * 1024 * 1024) {
      setFormData({...formData, photo: file});
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      alert('File size should be less than 10MB');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const dataToSend = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth,
        maritalStatus: formData.maritalStatus,
        phoneNumber: formData.phoneNumber,
        alternateNumber: formData.alternateNumber,
        address: formData.address,
        state: formData.state,
        city: formData.city,
        pinCode: formData.pinCode,
        occupation: formData.occupation,
        workProfile: formData.workProfile,
        weekOffs: formData.weekOffs,
        folJDuration: formData.folJDuration,
        connectGroup: formData.connectGroup,
        connectGroupLeader: formData.connectGroupLeader
      };
      
      await axios.post('http://localhost:5001/api/users/register', dataToSend, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return '#d4af37';
    if (passwordStrength <= 3) return '#cd853f';
    return '#b8860b';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="auth-container">
      <div className="auth-card single-page">
        <div className="auth-header">
          <div className="photo-section">
            <div className="photo-placeholder">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="photo-preview" />
              ) : (
                <div className="photo-icon">📷</div>
              )}
            </div>
            <label htmlFor="photo-upload" className="photo-upload-btn">
              {photoPreview ? 'Change Photo' : 'Add Photo'}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
              id="photo-upload"
            />
          </div>
          <h1>Create Account</h1>
          <p>Join us today and get started</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form single-page-form">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}
          
          {success && (
            <div className="success-message">
              <span className="success-icon">✓</span>
              {success}
            </div>
          )}

          <div className="form-grid">
            <div className="input-group">
              <label>Full Name / पूरा नाम *</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={formData.name ? 'filled' : ''}
                required
              />
            </div>

            <div className="input-group">
              <label>Date of Birth / जन्म तिथि *</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                className={formData.dateOfBirth ? 'filled' : ''}
                required
              />
            </div>

            <div className="input-group">
              <label>Email Address / ईमेल एड्रेस *</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={formData.email ? 'filled' : ''}
                required
              />
            </div>

            <div className="input-group">
              <label>Marital Status / वैवाहिक स्थिति *</label>
              <select
                value={formData.maritalStatus}
                onChange={(e) => setFormData({...formData, maritalStatus: e.target.value})}
                className={formData.maritalStatus ? 'filled' : ''}
                required
              >
                <option value="">Select Status</option>
                <option value="single">Single / अविवाहित</option>
                <option value="married">Married / विवाहित</option>
                <option value="divorced">Divorced / तलाकशुदा</option>
                <option value="widowed-male">Widowed (Male) / विधुर</option>
                <option value="widowed-female">Widowed (Female) / विधवा</option>
                <option value="separated">Separated / अलग रह रहे हैं</option>
              </select>
            </div>

            <div className="input-group">
              <label>Phone Number / फोन नंबर *</label>
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                className={formData.phoneNumber ? 'filled' : ''}
                required
              />
            </div>

            <div className="input-group">
              <label>Alternate Number / अन्य नंबर</label>
              <input
                type="tel"
                placeholder="Enter alternate number"
                value={formData.alternateNumber}
                onChange={(e) => setFormData({...formData, alternateNumber: e.target.value})}
                className={formData.alternateNumber ? 'filled' : ''}
              />
            </div>

            <div className="input-group">
              <label>State / राज्य *</label>
              <select
                value={formData.state}
                onChange={handleStateChange}
                className={formData.state ? 'filled' : ''}
                required
              >
                <option value="">Select State</option>
                {Object.keys(indianStates).map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>City / शहर *</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className={formData.city ? 'filled' : ''}
                disabled={!formData.state}
                required
              >
                <option value="">Select City</option>
                {formData.state && indianStates[formData.state]?.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Pin Code / पिन कोड *</label>
              <input
                type="text"
                placeholder="Enter 6-digit pin code"
                value={formData.pinCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setFormData({...formData, pinCode: value});
                }}
                className={formData.pinCode ? 'filled' : ''}
                maxLength="6"
                pattern="[0-9]{6}"
                required
              />
            </div>

            <div className="input-group full-width">
              <label>Address / पता *</label>
              <textarea
                placeholder="Enter your complete address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className={formData.address ? 'filled' : ''}
                rows="3"
                required
              />
            </div>

            <div className="input-group">
              <label>Occupation / व्यवसाय *</label>
              <select
                value={formData.occupation}
                onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                className={formData.occupation ? 'filled' : ''}
                required
              >
                <option value="">Select Occupation</option>
                <option value="salaried">Salaried / वेतनभोगी</option>
                <option value="business">Business / व्यवसायी</option>
                <option value="student">Student / विद्यार्थी</option>
                <option value="housewife">House Wife / गृहिणी</option>
                <option value="others">Others / अन्य क्षेत्र</option>
              </select>
            </div>

            <div className="input-group">
              <label>Work Profile / कार्य विशेषज्ञता *</label>
              <input
                type="text"
                placeholder="Describe your work profile"
                value={formData.workProfile}
                onChange={(e) => setFormData({...formData, workProfile: e.target.value})}
                className={formData.workProfile ? 'filled' : ''}
                required
              />
            </div>

            <div className="input-group">
              <label>FOLJ Duration / आप FOLJ कितने समय से आ रहे हैं *</label>
              <input
                type="text"
                placeholder="e.g., 2 years, 6 months"
                value={formData.folJDuration}
                onChange={(e) => setFormData({...formData, folJDuration: e.target.value})}
                className={formData.folJDuration ? 'filled' : ''}
                required
              />
            </div>

            <div className="input-group">
              <label>Connect Group / कनेक्ट ग्रुप का हिस्सा हैं *</label>
              <select
                value={formData.connectGroup}
                onChange={(e) => setFormData({...formData, connectGroup: e.target.value})}
                className={formData.connectGroup ? 'filled' : ''}
                required
              >
                <option value="">Select Option</option>
                <option value="yes">Yes / हाँ</option>
                <option value="no">No / नहीं</option>
              </select>
            </div>

            {formData.connectGroup === 'yes' && (
              <div className="input-group">
                <label>Connect Group Leader / कनेक्ट ग्रुप के अगुवे का नाम</label>
                <input
                  type="text"
                  placeholder="Enter leader's name"
                  value={formData.connectGroupLeader}
                  onChange={(e) => setFormData({...formData, connectGroupLeader: e.target.value})}
                  className={formData.connectGroupLeader ? 'filled' : ''}
                />
              </div>
            )}

            <div className="input-group full-width">
              <label>Password *</label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handlePasswordChange}
                  className={formData.password ? 'filled' : ''}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️🗨️'}
                </button>
              </div>
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className="strength-fill" 
                      style={{ 
                        width: `${(passwordStrength / 5) * 100}%`,
                        backgroundColor: getStrengthColor()
                      }}
                    ></div>
                  </div>
                  <span className="strength-text" style={{ color: getStrengthColor() }}>
                    {getStrengthText()}
                  </span>
                </div>
              )}
            </div>

            <div className="input-group full-width">
              <label>Week Off's *</label>
              <div className="checkbox-group">
                {['Monday/सोमवार', 'Tuesday/मंगलवार', 'Wednesday/बुधवार', 'Thursday/गुरुवार', 
                  'Friday/शुक्रवार', 'Saturday/शनिवार', 'Sunday/रविवार', 'Don\'t have fixed offs/निश्चित ऑफ नहीं हैं'].map(day => (
                  <label key={day} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.weekOffs.includes(day)}
                      onChange={() => handleWeekOffChange(day)}
                    />
                    <span className="checkmark"></span>
                    {day}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button type="submit" className={`submit-btn ${loading ? 'loading' : ''}`} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="auth-link">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;