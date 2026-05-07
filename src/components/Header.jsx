import React, { useState, useEffect } from 'react';

const Header = ({ userName, userRole, onLogout, chatHidden, setChatHidden }) => {
  const [time, setTime] = useState({ sc: 15, mn: 42, hr: 1 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prev => {
        let { sc, mn, hr } = prev;
        sc++;
        if (sc >= 60) { sc = 0; mn++; }
        if (mn >= 60) { mn = 0; hr++; }
        return { sc, mn, hr };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (val) => val.toString().padStart(2, '0');

  const handleAISugg = () => {
    window.showMNGToast('AI Suggestions Engine scanning conversation...');
  };

  const toggleChat = () => {
    setChatHidden(!chatHidden);
    if (!chatHidden) {
      window.showMNGToast('Video feed expanded.');
    } else {
      window.showMNGToast('Chat panel restored.');
    }
  };

  const firstName = userName ? userName.split(' ')[0] : 'Guest';
  const [meetingId, setMeetingId] = useState(localStorage.getItem('mng_meeting_id') || 'Unknown ID');

  useEffect(() => {
    // Background validation of the meeting ID
    const validateMeeting = async () => {
      const localMid = localStorage.getItem('mng_meeting_id');
      if (!localMid) return;

      try {
        const response = await fetch(`/api/meeting/${localMid}`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.meeting_id) {
            setMeetingId(data.meeting_id);
          }
        }
      } catch (error) {
        console.warn("Background API ping failed on Vercel, continuing with local session data.", error);
      }
    };

    validateMeeting();
  }, []);

  return (
    <header className="app-header">
      <div className="header-left">
        <i className='bx bx-left-arrow-alt'></i>
        <span>Clinical Drug Intelligence Session</span>
        <div className="live-badge">
          <div className="live-dot"></div> LIVE
        </div>
        <div className="timer-text">{`${formatTime(time.hr)}:${formatTime(time.mn)}:${formatTime(time.sc)}`}</div>
      </div>

      <div className="header-right">
        <button className="btn-ai-sugg" onClick={handleAISugg}><i className='bx bx-bulb'></i> AI Suggestions</button>
        <button className="header-btn" id="logout-btn" title="Logout Session" onClick={onLogout}
          style={{ background: 'rgba(225, 42, 31, 0.1)', color: 'var(--c-red)', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', marginRight: '8px' }}>
          <i className='bx bx-log-out' style={{ fontSize: '16px' }}></i> Logout
        </button>
        <button className="header-btn notification-dot">
          <i className='bx bx-bell'></i>
        </button>
        <button className="header-btn" id="panel-toggle-btn" title="Toggle Chat Panel" onClick={toggleChat} style={{ color: !chatHidden ? 'var(--c-blue)' : 'var(--c-text-secondary)' }}>
          <i className='bx bx-chat'></i>
        </button>
        <div className="header-profile">
          <i className='bx bx-user'></i>
          <i className='bx bx-chevron-down'></i>
          <div className="profile-dropdown">
            <div className="dropdown-item">
              <span className="label">User:</span>
              <span className="val">{firstName} ({userRole})</span>
            </div>
            <div className="dropdown-item">
              <span className="label">Meeting ID:</span>
              <span className="val">{meetingId}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
