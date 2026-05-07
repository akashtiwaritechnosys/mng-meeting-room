import React, { useState } from 'react';

const LoginOverlay = ({ show, onLogin }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Guest');
  
  const [meetingId, setMeetingId] = useState('');
  const [company, setCompany] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  if (!show) return null;

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (name && role) {
      setStep(2);
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    if (!meetingId || !company) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/start_meeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          meeting_id: meetingId,
          company: company
        })
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          throw new Error(`API returned status: ${response.status}`);
        }

        if (errorData && errorData.detail === "Meeting already exists") {
          console.log("Meeting already exists. Joining session...");
          onLogin(name, role, meetingId, company);
          return;
        }

        throw new Error(errorData.detail || `API returned status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Meeting Started successfully", data);

      onLogin(name, role, meetingId, company);
    } catch (err) {
      console.error("Failed to start meeting:", err);
      setError(err.message || "Failed to start meeting. Please check network or API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-overlay" className={`login-overlay ${show ? '' : 'hidden'}`}>
      <div className="login-card">
        <div className="login-header">
          <img src="/MNG_Health.png" alt="MNG Health Logo" className="login-logo" />
          <h2>Virtual Event Access</h2>
          <p>{step === 1 ? "Please enter your details to join the session" : "Select meeting and company"}</p>
        </div>
        
        {step === 1 ? (
          <form id="login-form" onSubmit={handleStep1Submit}>
            <div className="form-group">
              <label htmlFor="full-name">Full Name</label>
              <input 
                type="text" 
                id="full-name" 
                placeholder="Enter your full name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <label>Access Role</label>
              <div className="role-selector">
                <label className="role-option">
                  <input 
                    type="radio" 
                    name="user-role" 
                    value="Organizer" 
                    checked={role === 'Organizer'}
                    onChange={() => setRole('Organizer')}
                    required 
                  />
                  <span className="role-box">
                    <i className='bx bx-shield-quarter'></i>
                    <span className="role-title">Organizer</span>
                    <span className="role-desc">Manage session & questions</span>
                  </span>
                </label>
                <label className="role-option">
                  <input 
                    type="radio" 
                    name="user-role" 
                    value="Guest" 
                    checked={role === 'Guest'}
                    onChange={() => setRole('Guest')}
                    required 
                  />
                  <span className="role-box">
                    <i className='bx bx-user'></i>
                    <span className="role-title">Guest</span>
                    <span className="role-desc">Participate in discussion</span>
                  </span>
                </label>
              </div>
            </div>
            <button type="submit" className="login-btn">Next Step</button>
          </form>
        ) : (
          <form id="meeting-form" onSubmit={handleStep2Submit}>
            {error && <div style={{ color: '#FF6B6B', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}
            
            <div className="form-group">
              <label htmlFor="meeting-id">Meeting ID</label>
              <input 
                type="text" 
                id="meeting-id" 
                placeholder="E.g. M2" 
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="company-name">Company Name</label>
              <input 
                type="text" 
                id="company-name" 
                placeholder="E.g. Biocon" 
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required 
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="login-btn" style={{ background: '#44495B', width: '30%' }} onClick={() => setStep(1)}>Back</button>
                <button type="submit" className="login-btn" disabled={loading} style={{ width: '70%' }}>
                  {loading ? 'Starting...' : 'Start Meeting'}
                </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginOverlay;
