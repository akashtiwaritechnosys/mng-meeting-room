import React, { useState, useEffect, Suspense, lazy } from 'react';
import LoginOverlay from './components/LoginOverlay';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

const VideoGrid = lazy(() => import('./components/VideoGrid'));
const FloatingDock = lazy(() => import('./components/FloatingDock'));
const ChatColumn = lazy(() => import('./components/ChatColumn'));
const BotFab = lazy(() => import('./components/BotFab'));

function App() {
  const [userName, setUserName] = useState(localStorage.getItem('mng_user_name') || 'Guest');
  const [userRole, setUserRole] = useState(localStorage.getItem('mng_user_role') || null);
  const [meetingId, setMeetingId] = useState(localStorage.getItem('mng_meeting_id') || '');
  const [sessionReady, setSessionReady] = useState(false);
  const [chatHidden, setChatHidden] = useState(true);

  useEffect(() => {
    if (userRole) {
      setSessionReady(true);
    }
  }, [userRole]);

  const handleLogin = (name, role, meetingId, company) => {
    setUserName(name);
    setUserRole(role);
    setMeetingId(meetingId);
    localStorage.setItem('mng_user_name', name);
    localStorage.setItem('mng_user_role', role);
    if (meetingId) localStorage.setItem('mng_meeting_id', meetingId);
    if (company) localStorage.setItem('mng_company', company);
    showMNGToast(`Welcome, ${name}! Joining as ${role}.`);
    setTimeout(() => {
      setSessionReady(true);
    }, 400);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
        setUserName('Guest');
        setUserRole(null);
        setMeetingId('');
        localStorage.removeItem('mng_user_name');
        localStorage.removeItem('mng_user_role');
        localStorage.removeItem('mng_meeting_id');
        localStorage.removeItem('mng_company');
        localStorage.removeItem('mng_session_questions');
        localStorage.removeItem('mng_team_chat');
        localStorage.removeItem('mng_ai_chat');
        window.location.reload();
    }
  };

  const handleEndMeeting = async () => {
    if (window.confirm("Are you sure you want to completely end this virtual meeting for all users?")) {
        const mId = localStorage.getItem('mng_meeting_id');
        if (mId) {
            try {
                await fetch('/api/end_meeting', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ meeting_id: mId })
                });
            } catch (err) {
                console.error("Failed to end meeting:", err);
            }
        }

        setUserName('Guest');
        setUserRole(null);
        setMeetingId('');
        localStorage.removeItem('mng_user_name');
        localStorage.removeItem('mng_user_role');
        localStorage.removeItem('mng_meeting_id');
        localStorage.removeItem('mng_company');
        localStorage.removeItem('mng_session_questions');
        localStorage.removeItem('mng_team_chat');
        localStorage.removeItem('mng_ai_chat');
        window.location.reload();
    }
  };

  const showMNGToast = (message, link = null) => {
    const existing = document.getElementById('mng-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'mng-toast';
    toast.style.cssText = `
        position: fixed; top: 32px; left: 50%; transform: translateX(-50%) translateY(-20px);
        background: rgba(39, 119, 255, 0.95); color: white; padding: 12px 24px;
        border-radius: 999px; font-size: 14px; font-weight: 500;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5); z-index: 9999;
        backdrop-filter: blur(10px); opacity: 0; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex; align-items: center; gap: 12px; cursor: pointer;
    `;
    toast.innerHTML = `<i class='bx bx-check-circle' style="font-size: 18px;"></i> <span>${message}</span>`;
    if (link) toast.addEventListener('click', () => window.open(link, '_blank'));

    document.body.appendChild(toast);
    requestAnimationFrame(() => {
        toast.style.transform = 'translateX(-50%) translateY(0)';
        toast.style.opacity = '1';
    });
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  // Inject toast helper globally
  window.showMNGToast = showMNGToast;

  return (
    <>
      <LoginOverlay show={!userRole} onLogin={handleLogin} />
      
      <div className={`app-window ${sessionReady ? 'session-ready' : ''}`}>
        <Sidebar />
        <main className="inner-frame">
          <Header 
            userName={userName} 
            userRole={userRole} 
            meetingId={meetingId}
            onLogout={handleLogout} 
            chatHidden={chatHidden}
            setChatHidden={setChatHidden}
          />
          <div className="workspace-body">
            <Suspense fallback={<div style={{ display: 'none' }}></div>}>
                <VideoGrid />
                <FloatingDock onEnd={handleEndMeeting} userRole={userRole} />
                <ChatColumn 
                  userName={userName} 
                  userRole={userRole} 
                  meetingId={meetingId}
                  chatHidden={chatHidden} 
                />
            </Suspense>
          </div>
        </main>
      </div>
      
      <Suspense fallback={<div style={{ display: 'none' }}></div>}>
        {sessionReady && <BotFab />}
      </Suspense>
    </>
  );
}

export default App;
