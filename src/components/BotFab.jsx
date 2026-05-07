import React, { useState, useEffect, useRef, memo } from 'react';

const BotFab = memo(() => {
    const [isOpen, setIsOpen] = useState(false);
    const [aiChatHistory, setAiChatHistory] = useState(() => JSON.parse(localStorage.getItem('mng_ai_chat')) || []);
    const [inputMsg, setInputMsg] = useState('');
    const [aiIsBusy, setAiIsBusy] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [currentTime, setCurrentTime] = useState(Date.now());
    const chatThreadAiRef = useRef(null);

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
        if (!localStorage.getItem('mng_auto_session_id')) {
            localStorage.setItem('mng_auto_session_id', 'mng_auto_' + Math.random().toString(36).substring(2, 10));
        }
    }, []);

    useEffect(() => {
        if (chatThreadAiRef.current) {
            chatThreadAiRef.current.scrollTop = chatThreadAiRef.current.scrollHeight;
        }
    }, [aiChatHistory, isTyping, isOpen]);

    const addQuestionToSession = (text, status = "unresolved") => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const sessionQuestions = JSON.parse(localStorage.getItem('mng_session_questions')) || [];

        const newQ = {
            id: Date.now(),
            user: localStorage.getItem('mng_user_name') || 'Guest',
            text: text,
            time: timeStr,
            status: status,
            avatar: "https://images.unsplash.com/photo-1637059824899-a441006a6875?q=80&w=452&auto=format&fit=crop"
        };

        sessionQuestions.push(newQ);
        localStorage.setItem('mng_session_questions', JSON.stringify(sessionQuestions));
    };

    const AI_API_DIRECT = '/api/ask';

    const fetchFromAI = async (question) => {
        const session_id = localStorage.getItem('mng_auto_session_id');
        const meeting_id = localStorage.getItem('mng_meeting_id') || 'Unknown';
        const user_name = localStorage.getItem('mng_user_name') || 'Guest';
        const user_role = localStorage.getItem('mng_user_role') || 'user';

        const body = JSON.stringify({
            question,
            session_id,
            meeting_id,
            user_name,
            user_role
        });

        const c = new AbortController();
        setTimeout(() => c.abort(), 12000);

        const response = await fetch(AI_API_DIRECT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
            signal: c.signal
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();
    };

    const handleSendAI = async () => {
        if (!inputMsg.trim() || aiIsBusy) return;

        const textLoad = inputMsg.trim();
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newHistory = [...aiChatHistory, { type: 'self', text: textLoad, time: timeStr, timestamp: Date.now() }];
        setAiChatHistory(newHistory);
        localStorage.setItem('mng_ai_chat', JSON.stringify(newHistory));
        setInputMsg('');
        setAiIsBusy(true);
        setIsTyping(true);

        try {
            const data = await fetchFromAI(textLoad);
            const replyText = (data && data.text) ? data.text : 'I was unable to retrieve an answer. Please try again.';
            const replyTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const updatedHistory = [...newHistory, { type: 'incoming', text: replyText, time: replyTimeStr, timestamp: Date.now() }];
            setAiChatHistory(updatedHistory);
            localStorage.setItem('mng_ai_chat', JSON.stringify(updatedHistory));

            const unresolvedPhrases = ["don't know", "do not know", "no information", "not found", "unable to find", "could not find", "not in the context", "nothing matching", "not matched"];
            const partialPhrases = [
                "partial", "some matching", "only mentions", "limited details",
                "partially", "few things", "suggests that", "few things matching",
                "incomplete", "lack of information", "some information", "minimal information",
                "limited information"
            ];

            let status = (data && data.status) ? data.status.toLowerCase() : "resolved";
            if (status === "resolved") {
                const isUnresolved = unresolvedPhrases.some(phrase => replyText.toLowerCase().includes(phrase));
                const isPartial = partialPhrases.some(phrase => replyText.toLowerCase().includes(phrase));

                if (isUnresolved) {
                    status = "unresolved";
                } else if (isPartial) {
                    status = "partial";
                }
            }

            if (!["resolved", "partial", "unresolved"].includes(status)) {
                status = "unresolved";
            }

            addQuestionToSession(textLoad, status);

        } catch (err) {
            const errMsg = err && err.message ? err.message : String(err);
            const mockText = `⚠️ **MNG Intelligence Service Unavailable**\nYour network environment or firewall may be blocking our secure AI gateways.\n\n**Diagnostic Details:**\n${errMsg || "All connection attempts timed out."}\n\nPlease ensure the MNG Backend is active or contact support if the problem persists.`;

            const updatedHistory = [...newHistory, { type: 'incoming', text: mockText, time: 'Just Now' }];
            setAiChatHistory(updatedHistory);
        } finally {
            setIsTyping(false);
            setAiIsBusy(false);
        }
    };

    return (
        <>
            <div className="bot-fab" id="bot-fab" onClick={() => setIsOpen(!isOpen)}><i className='bx bx-bot'></i></div>

            <div className={`bot-container ${isOpen ? 'show' : ''}`} id="bot-container">
                <div className="bot-header">
                    <span><i className='bx bx-bot'></i> MNG AI Assistant</span>
                </div>
                <div className="chat-history" id="chat-thread-ai" ref={chatThreadAiRef} style={{ padding: '16px' }}>
                    <div className="msg-row incoming">
                        <div className="msg-avatar" style={{ background: 'var(--c-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px' }}>
                            <i className='bx bx-bot'></i>
                        </div>
                        <div className="msg-stack">
                            <div style={{ fontSize: '12px', color: 'var(--c-text-secondary)', marginLeft: '4px' }}>Assistant</div>
                            <div className="msg-blob">How can I assist with drug insights today?</div>
                        </div>
                    </div>

                    {aiChatHistory.map((msg, i) => (
                        <div key={i} className={`msg-row ${msg.type}`} style={{ marginTop: '8px' }}>
                            {msg.type === 'incoming' ? (
                                <div className="msg-avatar" style={{ background: 'var(--c-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px' }}>
                                    <i className='bx bx-bot'></i>
                                </div>
                            ) : null}
                            <div className="msg-stack">
                                <div style={msg.type === 'self' ? { fontSize: '12px', color: 'var(--c-text-secondary)', marginRight: '4px', textAlign: 'right' } : { fontSize: '12px', color: 'var(--c-text-secondary)', marginLeft: '4px' }}>
                                    {msg.type === 'self' ? `(You) • ${formatMessageTime(msg)}` : `Assistant • ${formatMessageTime(msg)}`}
                                </div>
                                <div className="msg-blob" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="msg-row incoming" style={{ marginTop: '8px', animation: 'enterBubble 0.3s forwards cubic-bezier(0.16, 1, 0.3, 1)' }}>
                            <div className="msg-avatar" style={{ background: 'var(--c-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px' }}>
                                <i className='bx bx-bot'></i>
                            </div>
                            <div className="msg-stack">
                                <div style={{ fontSize: '12px', color: 'var(--c-text-secondary)', marginLeft: '4px' }}>Assistant • typing…</div>
                                <div className="msg-blob ai-typing-dots" style={{ padding: '14px 20px' }}>
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="chat-input-area" style={{ borderRadius: '0', borderBottomLeftRadius: 'var(--rad-lg)', borderBottomRightRadius: 'var(--rad-lg)', marginTop: '0', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'var(--c-inner-frame)' }}>
                    <input
                        type="text"
                        value={inputMsg}
                        onChange={(e) => setInputMsg(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendAI()}
                        disabled={aiIsBusy}
                        placeholder="Ask MNG Assistant..."
                    />
                    <button className="submit-btn" disabled={aiIsBusy} onClick={handleSendAI} style={{ width: '36px', height: '36px' }}><i className='bx bx-send' style={{ fontSize: '15px', marginRight: '2px', marginTop: '2px' }}></i></button>
                </div>
            </div>
        </>
    );
});

export default BotFab;
