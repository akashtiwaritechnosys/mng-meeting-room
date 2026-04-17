document.addEventListener('DOMContentLoaded', () => {

    // Check for an existing session ID in this specific browser's memory
    let AI_SESSION_ID = localStorage.getItem('mng_auto_session_id');

    // If this is a first-time visitor, create it and save it forever
    if (!AI_SESSION_ID) {
        AI_SESSION_ID = 'mng_auto_' + Math.random().toString(36).substring(2, 10);
        localStorage.setItem('mng_auto_session_id', AI_SESSION_ID);
    }

    // Identity states
    let userName = 'Guest'; 


    // =============================================
    // --- MNG Health Sub-Navigation Ecosystem ---
    // =============================================

    const mngEndpoints = {
        home: 'https://www.mnghealth.com/',
        calendar: 'https://calendly.com/mnghealth/',
        user: 'https://www.mnghealth.com/technology-enabled-solutions/kol-and-speaker-advocacy/',
        envelope: 'https://www.mnghealth.com/contact/',
        cog: 'https://www.mnghealth.com/platform/'
    };

    function showMNGToast(message, link = null) {
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

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const iconClass = item.querySelector('i').className;

            if (!item.parentElement.classList.contains('bottom-nav')) {
                navItems.forEach(n => { if (!n.parentElement.classList.contains('bottom-nav')) n.classList.remove('active'); });
                item.classList.add('active');
            }

            if (iconClass.includes('bx-grid-alt')) { showMNGToast('Accessing MNG Health Dashboard...', mngEndpoints.home); setTimeout(() => window.open(mngEndpoints.home, '_blank'), 800); }
            else if (iconClass.includes('bx-group')) { showMNGToast('MNG Virtual Advisory Board Active.'); }
            else if (iconClass.includes('bx-calendar')) { showMNGToast('Opening Calendar...', mngEndpoints.calendar); setTimeout(() => window.open(mngEndpoints.calendar, '_blank'), 800); }
            else if (iconClass.includes('bx-bar-chart-alt-2')) { showMNGToast('Navigating to Analytics...', mngEndpoints.cog); setTimeout(() => window.open(mngEndpoints.cog, '_blank'), 800); }
            else if (iconClass.includes('bx-user-voice')) { showMNGToast('Opening HCP Engagement Protocol...', mngEndpoints.user); setTimeout(() => window.open(mngEndpoints.user, '_blank'), 800); }
            else if (iconClass.includes('bx-cog')) { showMNGToast('Accessing Settings...', mngEndpoints.cog); setTimeout(() => window.open(mngEndpoints.cog, '_blank'), 800); }
            else if (iconClass.includes('bx-support')) { showMNGToast('Opening Support Desk...', mngEndpoints.envelope); setTimeout(() => window.open(mngEndpoints.envelope, '_blank'), 800); }
        });
    });

    const aiSuggBtn = document.querySelector('.btn-ai-sugg');
    if (aiSuggBtn) {
        aiSuggBtn.addEventListener('click', () => {
            showMNGToast('AI Suggestions Engine scanning conversation...');
        });
    }

    // --- Right Panel Tab Logic (MNG Health Structure) ---
    const panelTabs = document.querySelectorAll('.tab-slate');
    const tabPanes = document.querySelectorAll('.tab-pane');

    panelTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            panelTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const targetId = tab.getAttribute('data-target');
            tabPanes.forEach(pane => {
                if (pane.id === targetId) {
                    pane.classList.add('active');
                } else {
                    pane.classList.remove('active');
                }
            });

            if (targetId === 'chatpane' && chatFeed) chatFeed.scrollTop = chatFeed.scrollHeight;
        });
    });


    // --- Hardware Toggles ---
    const micBtn = document.querySelector('.hw-mic');
    const camBtn = document.querySelector('.hw-cam');

    if (micBtn) micBtn.addEventListener('click', function () {
        const icon = this.querySelector('i');
        if (icon.classList.contains('bx-microphone')) {
            icon.className = 'bx bx-microphone-off';
            this.classList.add('red-state');
            showMNGToast('Microphone Muted - MNG Broadcast protected.');
        } else {
            icon.className = 'bx bx-microphone';
            this.classList.remove('red-state');
            showMNGToast('Live Audio Active.');
        }
    });

    if (camBtn) camBtn.addEventListener('click', function () {
        const icon = this.querySelector('i');
        if (icon.classList.contains('bx-video')) {
            icon.className = 'bx bx-video-off';
            this.classList.add('red-state');
            showMNGToast('Camera feed disabled.');
        } else {
            icon.className = 'bx bx-video';
            this.classList.remove('red-state');
            showMNGToast('Camera enabled.');
        }
    });

    // --- End Meeting Logic ---
    const endBtn = document.querySelector('.dock-end');
    if (endBtn) endBtn.addEventListener('click', () => {
        if (confirm("Exit the MNG Health Live Virtual Event?")) {
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.5s ease-out';
            setTimeout(() => {
                document.body.style.background = '#2B2E36';
                document.body.innerHTML = `
                    <div style="color:#FFF; text-align:center; width:100%; margin-top:20%; font-family: sans-serif;">
                        <h1 style="font-weight:500; font-size:32px;">Advisory Board Concluded</h1>
                        <p style="color:#9CA3B6; margin-top:16px;">Returning to MNG Health ecosystem analytical dashboard...</p>
                    </div>
                `;
                document.body.style.opacity = '1';
                setTimeout(() => { window.location.href = mngEndpoints.home; }, 2000);
            }, 500);
        }
    });

    // --- Interactive Video Swapping Engine ---
    const masterVideoView = document.getElementById('master-view');
    const masterNameTag = document.getElementById('master-name');
    const masterRoleTag = document.getElementById('master-role');
    const swapModules = document.querySelectorAll('.thumb-swap');

    swapModules.forEach(mod => {
        mod.addEventListener('click', function () {

            const standardImg = this.querySelector('.feed-img');
            const audioRingImg = this.querySelector('.audio-ring-layer img');
            const nameEl = this.querySelector('.v-name');
            const newRole = this.getAttribute('data-role');

            if (!nameEl) return;

            let extractionTarget = null;
            let isAudioState = false;

            if (standardImg) {
                extractionTarget = standardImg.src;
            } else if (audioRingImg) {
                extractionTarget = audioRingImg.src;
                isAudioState = true;
            } else {
                return;
            }

            masterVideoView.style.opacity = '0.3';
            this.style.opacity = '0.3';

            setTimeout(() => {
                const tempMasterSrc = masterVideoView.src;
                const tempMasterName = masterNameTag.textContent;
                const tempMasterRole = masterRoleTag.textContent;

                masterVideoView.src = extractionTarget;
                masterNameTag.textContent = nameEl.textContent;
                masterRoleTag.textContent = newRole;

                if (isAudioState) {
                    audioRingImg.src = tempMasterSrc;
                } else {
                    standardImg.src = tempMasterSrc;
                }

                nameEl.textContent = tempMasterName;
                this.setAttribute('data-role', tempMasterRole);

                masterVideoView.style.opacity = '1';
                this.style.opacity = '1';
                showMNGToast(`HCP Speaker ${masterNameTag.textContent} pinned to main stage.`);

            }, 180);
        });
    });

    // --- Interactive Chat Engine (Main Team Room) ---
    const msgInputTeam = document.getElementById('typer-input');
    const sendButtonTeam = document.getElementById('send-trigger');
    const chatFeedTeam = document.getElementById('chat-thread');

    function deployTeamMessage() {
        const textLoad = msgInputTeam.value.trim();
        if (!textLoad) return;

        const builtHTML = `<div class="msg-row self" style="transform:translateY(15px); opacity:0; animation: enterBubble 0.3s forwards cubic-bezier(0.16, 1, 0.3, 1); margin-top:8px;"><div class="msg-stack"><div style="font-size:12px; color:var(--c-text-secondary); margin-right:4px; text-align:right;">${userName} (You) • Just Now</div><div class="msg-blob">${textLoad}</div></div></div>`;
        chatFeedTeam.insertAdjacentHTML('beforeend', builtHTML);
        msgInputTeam.value = '';
        chatFeedTeam.scrollTo({ top: chatFeedTeam.scrollHeight, behavior: 'smooth' });

        setTimeout(() => {
            const returnedHTML = `<div class="msg-row incoming" style="transform:translateY(15px); opacity:0; animation: enterBubble 0.3s forwards cubic-bezier(0.16, 1, 0.3, 1); margin-top:8px;"><img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=100&auto=format&fit=crop" class="msg-avatar" alt="Marcus"><div class="msg-stack"><div style="font-size:12px; color:var(--c-text-secondary); margin-left:4px;">Dr. Marcus Webb • Just Now</div><div class="msg-blob">Agreed, I strongly support the trial design recommendations. Adding it to clinical protocols.</div></div></div>`;
            chatFeedTeam.insertAdjacentHTML('beforeend', returnedHTML);
            chatFeedTeam.scrollTo({ top: chatFeedTeam.scrollHeight, behavior: 'smooth' });
        }, 1500 + Math.random() * 1200);
    }

    if (sendButtonTeam) sendButtonTeam.addEventListener('click', deployTeamMessage);
    if (msgInputTeam) msgInputTeam.addEventListener('keypress', (e) => { if (e.key === 'Enter') deployTeamMessage(); });
    if (chatFeedTeam) chatFeedTeam.scrollTop = chatFeedTeam.scrollHeight;

    // --- Global Floating AI Chatbot Engine ---
    const botFab = document.getElementById('bot-fab');
    const botContainer = document.getElementById('bot-container');
    const msgInputAi = document.getElementById('typer-input-ai');
    const sendButtonAi = document.getElementById('send-trigger-ai');
    const chatFeedAi = document.getElementById('chat-thread-ai');

    if (botFab && botContainer) {
        botFab.addEventListener('click', () => {
            const isOpen = botContainer.classList.contains('show');

            if (isOpen) {
                // Close chatbot
                botContainer.classList.remove('show');
            } else {
                // Open chatbot
                botContainer.classList.add('show');
                if (msgInputAi) msgInputAi.focus();
            }
        });
    }

    const AI_API_DIRECT = 'https://doc-detroit-sims-temple.trycloudflare.com/ask';
    let aiIsBusy = false;

    // 4-tier cascade: direct → proxy.cors.sh → thingproxy → corsproxy.io
    async function fetchFromAI(question) {
        const body    = JSON.stringify({ question, session_id: AI_SESSION_ID });
        const headers = { 'Content-Type': 'application/json' };

        const strategies = [
            // 1. Direct – works if the server sends CORS headers
            { label: 'direct',        fn: () => fetch(AI_API_DIRECT, { method: 'POST', headers, body }) },
            // 2. proxy.cors.sh – reliable but requires public key
            { label: 'cors.sh',       fn: () => fetch('https://proxy.cors.sh/' + AI_API_DIRECT, { method: 'POST', headers: { ...headers, 'x-cors-api-key': 'temp_public' }, body }) },
            // 3. thingproxy – useful fallback
            { label: 'thingproxy',    fn: () => fetch('https://thingproxy.freeboard.io/fetch/' + AI_API_DIRECT, { method: 'POST', headers, body }) },
            // 4. corsproxy.io – another last resort
            { label: 'corsproxy.io',  fn: () => fetch('https://corsproxy.io/?' + encodeURIComponent(AI_API_DIRECT), { method: 'POST', headers, body }) },
        ];

        let lastErr;
        for (const { label, fn } of strategies) {
            try {
                // Short timeout for proxies to avoid hanging
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000);
                
                const res = await fn({ signal: controller.signal });
                clearTimeout(timeoutId);

                if (!res.ok) {
                    console.warn(`[MNG AI] ${label} → HTTP ${res.status}, trying next…`);
                    lastErr = new Error(`HTTP ${res.status} via ${label}`);
                    continue; 
                }
                const data = await res.json();
                console.info(`[MNG AI] Success via ${label}`);
                return data;
            } catch (e) {
                console.warn(`[MNG AI] ${label} failed: ${e.message}`);
                lastErr = e;
            }
        }

        // --- FINAL FALLBACK: Local Simulation ---
        console.warn('[MNG AI] All remote proxies failed. Engaging Local Simulation Mode.');
        return generateMockResponse(question);
    }

    // Generic Fallback for demo continuity
    function generateMockResponse(q) {
        let text = "I'm having trouble connecting to the live MNG clinical database right now. Please ensure the backend server is running and reachable.";
        return new Promise(resolve => setTimeout(() => resolve({ text }), 1200));
    }

    function addTypingIndicator() {
        const id = 'ai-typing-' + Date.now();
        const html = `
            <div class="msg-row incoming" id="${id}" style="transform:translateY(15px); opacity:0; animation: enterBubble 0.3s forwards cubic-bezier(0.16, 1, 0.3, 1); margin-top:8px;">
                <div class="msg-avatar" style="background:var(--c-blue); display:flex; align-items:center; justify-content:center; color:white; font-size:18px;"><i class='bx bx-bot'></i></div>
                <div class="msg-stack">
                    <div class="typing-label" style="font-size:12px; color:var(--c-text-secondary); margin-left:4px;">Assistant • typing…</div>
                    <div class="msg-blob ai-typing-dots" style="padding:14px 20px;">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            </div>`;
        chatFeedAi.insertAdjacentHTML('beforeend', html);
        chatFeedAi.scrollTo({ top: chatFeedAi.scrollHeight, behavior: 'smooth' });
        return id;
    }

    function replaceTypingWithReply(typingId, replyText) {
        const typingEl = document.getElementById(typingId);
        if (!typingEl) return;
        typingEl.querySelector('.ai-typing-dots').outerHTML =
            `<div class="msg-blob">${replyText}</div>`;
        
        const label = typingEl.querySelector('.typing-label');
        if (label) label.textContent = 'Assistant • Just Now';
        
        chatFeedAi.scrollTo({ top: chatFeedAi.scrollHeight, behavior: 'smooth' });
    }

    async function deployAiMessage() {
        const textLoad = msgInputAi.value.trim();
        if (!textLoad || aiIsBusy) return;

        // Render user bubble
        const userHTML = `
            <div class="msg-row self" style="transform:translateY(15px); opacity:0; animation: enterBubble 0.3s forwards cubic-bezier(0.16, 1, 0.3, 1); margin-top:8px;">
                <div class="msg-stack">
                    <div style="font-size:12px; color:var(--c-text-secondary); margin-right:4px; text-align:right;">(You) • Just Now</div>
                    <div class="msg-blob">${textLoad}</div>
                </div>
            </div>`;
        chatFeedAi.insertAdjacentHTML('beforeend', userHTML);
        msgInputAi.value = '';
        chatFeedAi.scrollTo({ top: chatFeedAi.scrollHeight, behavior: 'smooth' });

        // Disable input while waiting
        aiIsBusy = true;
        msgInputAi.disabled = true;
        sendButtonAi.disabled = true;

        const typingId = addTypingIndicator();

        try {
            const data = await fetchFromAI(textLoad);
            const replyText = (data && data.text) ? data.text : 'I was unable to retrieve an answer. Please try again.';
            replaceTypingWithReply(typingId, replyText);

        } catch (err) {
            const errMsg = err && err.message ? err.message : String(err);
            console.error('[MNG AI] All strategies failed:', errMsg, err);
            replaceTypingWithReply(typingId,
                `⚠️ Could not reach the MNG AI service (${errMsg}).
The backend server or Cloudflare tunnel may be offline.`);
        } finally {
            aiIsBusy = false;
            msgInputAi.disabled = false;
            sendButtonAi.disabled = false;
            msgInputAi.focus();
        }
    }

    if (sendButtonAi) sendButtonAi.addEventListener('click', deployAiMessage);
    if (msgInputAi) msgInputAi.addEventListener('keypress', (e) => { if (e.key === 'Enter') deployAiMessage(); });

    const cssAnime = document.createElement('style');
    cssAnime.innerHTML = `
        @keyframes enterBubble { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    `;
    document.head.appendChild(cssAnime);
    const chatFeed = document.getElementById('chat-thread');
    if (chatFeed) chatFeed.scrollTop = chatFeed.scrollHeight;

    // Auto-update timer
    const timerText = document.querySelector('.timer-text');
    if (timerText) {
        let sc = 15; let mn = 42; let hr = 1;
        setInterval(() => {
            sc++;
            if (sc >= 60) { sc = 0; mn++; }
            if (mn >= 60) { mn = 0; hr++; }
            timerText.innerHTML = `${hr.toString().padStart(2, '0')}:${mn.toString().padStart(2, '0')}:${sc.toString().padStart(2, '0')}`;
        }, 1000);
    }


    // --- Chat Column Panel Toggle ---
    const panelToggleBtn = document.getElementById('panel-toggle-btn');
    const chatColumnEl = document.getElementById('chat-column');

    if (panelToggleBtn && chatColumnEl) {
        panelToggleBtn.addEventListener('click', () => {
            const isHidden = chatColumnEl.classList.contains('chat-hidden');

            if (isHidden) {
                // Return to view
                chatColumnEl.classList.remove('chat-hidden');
                panelToggleBtn.querySelector('i').className = 'bx bx-chat';
                showMNGToast('Chat panel restored.');
                panelToggleBtn.style.color = 'var(--c-blue)';
            } else {
                // Hide panel
                chatColumnEl.classList.add('chat-hidden');
                panelToggleBtn.querySelector('i').className = 'bx bx-chat';
                showMNGToast('Video feed expanded.');
                panelToggleBtn.style.color = 'var(--c-text-secondary)';
            }
        });
    }

});


