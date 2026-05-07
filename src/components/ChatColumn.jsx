import React, { useState, useEffect, useRef } from 'react';

const participantsData = [
  { name: "Dr. Robert Chen", role: "Chief Oncologist", avatar: "/doctor5.jpg", muted: false },
  { name: "Dr. Emily Stone", role: "Clinical Researcher", avatar: "/doctor2.jpg", muted: true },
  { name: "Dr. Marcus Webb", role: "Medical Director", avatar: "/doctor3.jpg", muted: true },
  { name: "Dr. Priya Nair", role: "FDA Consultant", avatar: "/doctor6.jpg", muted: false }
];

const ChatColumn = ({ userName, userRole, chatHidden }) => {
  const [activeTab, setActiveTab] = useState('chatpane');
  const [chatMsg, setChatMsg] = useState('');
  const [teamChatHistory, setTeamChatHistory] = useState(() => JSON.parse(localStorage.getItem('mng_team_chat')) || []);
  const [sessionQuestions, setSessionQuestions] = useState(() => JSON.parse(localStorage.getItem('mng_session_questions')) || []);
  const [qFilter, setQFilter] = useState('unresolved');

  const [engagementScore, setEngagementScore] = useState(0);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const chatThreadRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  const formatMessageTime = (msg) => {
      if (msg.timestamp) {
          const diffSecs = (currentTime - msg.timestamp) / 1000;
          if (diffSecs < 60) return 'Just Now';
          return new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return msg.time || 'Just Now';
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      const meetingId = localStorage.getItem('mng_meeting_id');
      if (!meetingId) return;

      try {
        const url = qFilter === 'all'
          ? `/api/meeting/${meetingId}`
          : `/api/meeting/${meetingId}/pending`;

        const response = await fetch(url, {
          headers: {
            'accept': 'application/json'
          }
        });
        if (response.ok) {
          const resJson = await response.json();
          if (resJson && Array.isArray(resJson.data)) {
            const mappedQuestions = resJson.data.map((item, idx) => ({
              id: item.id || idx,
              user: item.user_name || item.user || 'Participant',
              text: item.question || item.text || 'Question text unavailable',
              time: (item.timestamp || item.time) ? (() => {
                const t = item.timestamp || item.time;
                const d = new Date(t);
                return !isNaN(d.getTime()) ? d.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : t;
              })() : new Date().toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
              status: item.status ? item.status.toLowerCase() : 'unresolved',
              avatar: item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.user_name || item.user || 'Participant')}&background=2777FF&color=fff&rounded=true`
            }));
            setSessionQuestions(mappedQuestions);
          }
        }
      } catch (e) {
        console.error("Failed to fetch questions from backend:", e);
      }
    };

    fetchQuestions();
    const interval = setInterval(fetchQuestions, 3000);
    return () => clearInterval(interval);
  }, [qFilter]);

  useEffect(() => {
    if (chatThreadRef.current) {
      chatThreadRef.current.scrollTop = chatThreadRef.current.scrollHeight;
    }
  }, [teamChatHistory, activeTab]);

  useEffect(() => {
    if (activeTab === 'insights' && engagementScore === 0) {
      const target = 82 + Math.floor(Math.random() * 10);
      let score = 0;
      const intv = setInterval(() => {
        score++;
        setEngagementScore(score);
        if (score >= target) clearInterval(intv);
      }, 30);
      return () => clearInterval(intv);
    }
  }, [activeTab]);

  const handleSendChat = () => {
    if (!chatMsg.trim()) return;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newHistory = [...teamChatHistory, { type: 'self', user: userName, text: chatMsg.trim(), time: timeStr, timestamp: Date.now() }];
    setTeamChatHistory(newHistory);
    localStorage.setItem('mng_team_chat', JSON.stringify(newHistory));
    setChatMsg('');

    setTimeout(() => {
      const autoResp = "Agreed, I strongly support the trial design recommendations. Adding it to clinical protocols.";
      const updatedHistory = [...newHistory, { type: 'incoming', user: 'Dr. Marcus Webb', text: autoResp, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), timestamp: Date.now(), avatar: '/doctor3.jpg' }];
      setTeamChatHistory(updatedHistory);
      localStorage.setItem('mng_team_chat', JSON.stringify(updatedHistory));
    }, 1000);
  };

  const handleDownloadCSV = () => {
    window.showMNGToast('Preparing questions for download...');

    const escapeCsv = (str) => {
      if (!str) return '""';
      return `"${String(str).replace(/"/g, '""')}"`;
    };

    let csvRows = ["ID,User,Question,Time,Status"];
    sessionQuestions.forEach(q => {
      const row = [
        q.id,
        escapeCsv(q.user),
        escapeCsv(q.text),
        escapeCsv(q.time),
        escapeCsv(q.status)
      ].join(",");
      csvRows.push(row);
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `MNG_Session_Questions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    window.showMNGToast('Download complete.');
  };

  const filteredQuestions = sessionQuestions.filter(q => {
    if (qFilter === 'all') return true;
    if (qFilter === 'unresolved') return q.status === 'unresolved' || q.status === 'partial';
    return q.status === qFilter;
  });

  return (
    <div className={`chat-column ${chatHidden ? 'chat-hidden' : ''}`} id="chat-column">
      <div className="panel-tabs-slate">
        <button className={`tab-slate ${activeTab === 'chatpane' ? 'active' : ''}`} onClick={() => setActiveTab('chatpane')}>Chat</button>
        <button className={`tab-slate ${activeTab === 'participants' ? 'active' : ''}`} onClick={() => setActiveTab('participants')}>Participants</button>
        {userRole === 'Organizer' && (
          <button className={`tab-slate ${activeTab === 'questionpane' ? 'active' : ''}`} onClick={() => setActiveTab('questionpane')} id="nav-question-tab">Questions</button>
        )}
        <button className={`tab-slate ${activeTab === 'insights' ? 'active' : ''}`} onClick={() => setActiveTab('insights')}>Insights <span className="tab-badge">New</span></button>
      </div>

      <div className="tab-content-slate">
        {/* CHAT PANE */}
        <div className={`tab-pane ${activeTab === 'chatpane' ? 'active' : ''}`} id="chatpane">
          <div className="chat-history" id="chat-thread" ref={chatThreadRef} style={{ display: 'flex' }}>
            {teamChatHistory.length === 0 ? (
              <div id="chat-empty-state" style={{ textAlign: 'center', fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginTop: '20px' }}>
                No messages in the session yet
              </div>
            ) : (
              teamChatHistory.map((msg, i) => (
                <div key={i} className={`msg-row ${msg.type}`} style={{ marginTop: '8px' }}>
                  {msg.type === 'incoming' && <img src={msg.avatar} className="msg-avatar" alt={msg.user} />}
                  <div className="msg-stack">
                    {msg.type === 'incoming' && (
                      <div style={{ fontSize: '12px', color: 'var(--c-text-secondary)', marginLeft: '4px', marginBottom: '2px', fontWeight: '500' }}>
                        {msg.user}
                      </div>
                    )}
                    <div className="msg-blob">
                      <div style={{ marginBottom: '2px' }}>{msg.text}</div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textAlign: 'right', marginTop: '2px', float: 'right', marginLeft: '12px' }}>
                        {formatMessageTime(msg)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="chat-input-area">
            <button className="add-btn"><i className='bx bx-plus'></i></button>
            <input
              type="text"
              value={chatMsg}
              onChange={(e) => setChatMsg(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
              placeholder="Message to Advisory Board..."
            />
            <button className="submit-btn" onClick={handleSendChat}><i className='bx bx-send' style={{ marginRight: '2px', marginTop: '2px', fontSize: '16px' }}></i></button>
          </div>
        </div>

        {/* QUESTION PANE */}
        {userRole === 'Organizer' && (
          <div className={`tab-pane ${activeTab === 'questionpane' ? 'active' : ''}`} id="questionpane">
            <div className="q-header-row">
              <div className="q-sub-tabs">
                <button className={`q-sub-tab ${qFilter === 'unresolved' ? 'active' : ''}`} onClick={() => setQFilter('unresolved')}>Unresolved</button>
                <button className={`q-sub-tab ${qFilter === 'all' ? 'active' : ''}`} onClick={() => setQFilter('all')}>All Questions</button>
              </div>
              <button id="download-questions" className="download-btn" title="Download Questions" onClick={handleDownloadCSV}>
                <i className='bx bx-download'></i> CSV
              </button>
            </div>
            <div className="question-list-container">
              <div className="question-list" id="question-list">
                {filteredQuestions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>
                    <i className='bx bx-question-mark' style={{ fontSize: '32px', marginBottom: '8px', display: 'block' }}></i>
                    No {qFilter} questions yet
                  </div>
                ) : (
                  filteredQuestions.map(q => (
                    <div key={q.id} className="question-item">
                      <div className="q-user-info">
                        <img src={q.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(q.user)}&background=2777FF&color=fff&rounded=true`} className="q-avatar" alt={q.user} />
                        <span className="q-name">{q.user}</span>
                        <span className="q-time">{q.time}</span>
                      </div>
                      <div className="q-text">{q.text}</div>
                      <div className={`q-status-badge ${q.status}`}>{q.status.toUpperCase()}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* PARTICIPANTS PANE */}
        <div className={`tab-pane ${activeTab === 'participants' ? 'active' : ''}`} id="participants">
          <div className="participants-list" id="participants-list">
            <div className="pt-item">
              <div className="pt-left">
                <img src="https://plus.unsplash.com/premium_photo-1661492071612-98d26885614a?w=500&auto=format&fit=crop&q=60" className="pt-avatar" alt="You" />
                <div className="pt-info">
                  <span className="pt-name">{userName} (You)</span>
                  <span className="pt-role">{userRole}</span>
                </div>
              </div>
              <i className='bx bx-microphone pt-action active' style={{ color: 'var(--c-text-secondary)' }}></i>
            </div>
            {participantsData.map((p, i) => (
              <div key={i} className="pt-item">
                <div className="pt-left">
                  <img src={p.avatar} className="pt-avatar" alt={p.name} />
                  <div className="pt-info">
                    <span className="pt-name">{p.name}</span>
                    <span className="pt-role">{p.role}</span>
                  </div>
                </div>
                <i className={`bx ${p.muted ? 'bx-microphone-off pt-action muted' : 'bx-microphone pt-action active'}`}
                  style={!p.muted ? { color: '#32D74B' } : {}}></i>
              </div>
            ))}
          </div>
        </div>

        {/* INSIGHTS PANE */}
        <div className={`tab-pane ${activeTab === 'insights' ? 'active' : ''}`} id="insights">
          <div className="insight-box">
            <h3><i className='bx bx-pie-chart-alt-2'></i> Engagement Score</h3>
            <div className="score-row">
              <div className="circular-chart-slate">
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                  <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="circle" strokeDasharray={`${engagementScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="chart-content">
                  {engagementScore}<span className="score-symbol">%</span>
                </div>
              </div>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--c-text-secondary)' }}>Current Session Avg.</span>
                <div className="trend-up"><i className='bx bx-trending-up'></i> +{engagementScore > 0 ? Math.floor(Math.random() * 8) : 0}% vs last session</div>
              </div>
            </div>
          </div>

          <div className="insight-box">
            <h3><i className='bx bx-brain'></i> AI Sentiment</h3>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', display: 'flex', overflow: 'hidden', marginBottom: '12px' }}>
              <div style={{ width: '70%', background: '#32D74B' }}></div>
              <div style={{ width: '20%', background: '#F59E0B' }}></div>
              <div style={{ width: '10%', background: 'var(--c-red)' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600' }}>
              <span style={{ color: '#32D74B' }}>70% (+)</span>
              <span style={{ color: '#F59E0B' }}>20% (=)</span>
              <span style={{ color: 'var(--c-red)' }}>10% (-)</span>
            </div>
          </div>

          <div className="insight-box" style={{ marginBottom: '0' }}>
            <h3><i className='bx bx-purchase-tag-alt'></i> Key Themes</h3>
            <div className="theme-tags">
              {engagementScore > 0 ? (
                <>
                  <span className="thm-tag">Clinical Trial</span>
                  <span className="thm-tag">Safety Data</span>
                  <span className="thm-tag">Protocol</span>
                </>
              ) : (
                <span style={{ fontSize: '12px', color: 'var(--c-text-secondary)' }}>Monitoring conversation...</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatColumn;
