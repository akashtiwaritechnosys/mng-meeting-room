document.addEventListener('DOMContentLoaded', () => {

    // Check for an existing session ID in this specific browser's memory
    let AI_SESSION_ID = localStorage.getItem('mng_auto_session_id');

    // If this is a first-time visitor, create it and save it forever
    if (!AI_SESSION_ID) {
        AI_SESSION_ID = 'mng_auto_' + Math.random().toString(36).substring(2, 10);
        localStorage.setItem('mng_auto_session_id', AI_SESSION_ID);
    }

    // Identity and State persistence
    let userName = localStorage.getItem('mng_user_name') || 'Guest';
    let userRole = localStorage.getItem('mng_user_role') || null;
    let sessionQuestions = JSON.parse(localStorage.getItem('mng_session_questions')) || [];
    let teamChatHistory = JSON.parse(localStorage.getItem('mng_team_chat')) || [];
    let aiChatHistory = JSON.parse(localStorage.getItem('mng_ai_chat')) || [];

    const loginOverlay = document.getElementById('login-overlay');
    const loginForm = document.getElementById('login-form');
    const appWindow = document.querySelector('.app-window');
    const chatEmptyState = document.getElementById('chat-empty-state');

    // Dynamic Lists
    const participants = [
        { name: "Dr. Robert Chen", role: "Chief Oncologist", avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=100&auto=format&fit=crop", muted: false },
        { name: "Dr. Emily Stone", role: "Clinical Researcher", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100&auto=format&fit=crop", muted: true },
        { name: "Dr. Marcus Webb", role: "Medical Director", avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=100&auto=format&fit=crop", muted: true },
        { name: "Dr. Priya Nair", role: "FDA Consultant", avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=100&auto=format&fit=crop", muted: false }
    ];

    function checkAuth() {
        if (!userRole) {
            loginOverlay.classList.remove('hidden');
            appWindow.classList.remove('session-ready');
        } else {
            loginOverlay.classList.add('hidden');
            appWindow.classList.add('session-ready');
            initializeRBAC(userRole);
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('full-name');
            const roleInput = document.querySelector('input[name="user-role"]:checked');

            if (nameInput && roleInput) {
                userName = nameInput.value;
                userRole = roleInput.value;

                localStorage.setItem('mng_user_name', userName);
                localStorage.setItem('mng_user_role', userRole);

                showMNGToast(`Welcome, ${userName}! Joining as ${userRole}.`);
                
                // Hide overlay and show app
                loginOverlay.classList.add('hidden');
                setTimeout(() => {
                    appWindow.classList.add('session-ready');
                    initializeRBAC(userRole);
                }, 400);
            }
        });
    }

    function initializeRBAC(role) {
        const questionTab = document.getElementById('nav-question-tab');
        if (role === 'Organizer') {
            if (questionTab) questionTab.style.display = 'flex';
            loadQuestions();
        } else {
            if (questionTab) questionTab.style.display = 'none';
        }
        
        // Update header profile or name if needed
        const headerName = document.querySelector('.pt-name');
        if (headerName && headerName.textContent.includes('(You)')) {
            headerName.textContent = `${userName} (You)`;
        }

        renderParticipants();
        simulateInsights();
    }

    function renderParticipants() {
        const list = document.getElementById('participants-list');
        const chips = document.getElementById('nav-participants-chips');
        if (!list || !chips) return;

        list.innerHTML = '';
        chips.innerHTML = '';
        
        // Add Self to side list
        const selfHTML = `
            <div class="pt-item">
                <div class="pt-left">
                    <img src="https://plus.unsplash.com/premium_photo-1661492071612-98d26885614a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTN8fGRvY3RvciUyMHBob3RvfGVufDB8fDB8fHww" class="pt-avatar">
                    <div class="pt-info">
                        <span class="pt-name">${userName} (You)</span>
                        <span class="pt-role">${userRole}</span>
                    </div>
                </div>
                <i class='bx bx-microphone pt-action active' style="color:var(--c-text-secondary);"></i>
            </div>`;
        list.insertAdjacentHTML('beforeend', selfHTML);

        // Add Self to top navbar
        const selfChip = `<div class="pt-chip self">${userName.split(' ')[0]} (You)</div>`;
        chips.insertAdjacentHTML('beforeend', selfChip);

        // Add others
        participants.forEach(p => {
            const itemHTML = `
                <div class="pt-item">
                    <div class="pt-left">
                        <img src="${p.avatar}" class="pt-avatar">
                        <div class="pt-info">
                            <span class="pt-name">${p.name}</span>
                            <span class="pt-role">${p.role}</span>
                        </div>
                    </div>
                    <i class='bx ${p.muted ? 'bx-microphone-off pt-action muted' : 'bx-microphone pt-action active'}' 
                       style="${p.muted ? '' : 'color:#32D74B;'}"></i>
                </div>`;
            list.insertAdjacentHTML('beforeend', itemHTML);

            // Add Chip to top navbar
            // const chipHTML = `<div class="pt-chip">${p.name.split(' ')[0]}</div>`;
            // chips.insertAdjacentHTML('beforeend', chipHTML);
        });
    }

    function simulateInsights() {
        const circle = document.getElementById('engagement-circle');
        const text = document.getElementById('engagement-text');
        const trend = document.getElementById('engagement-trend');
        const themes = document.getElementById('theme-tags-list');

        if (!circle || !text) return;

        // Animate engagement up
        let score = 0;
        const target = 82 + Math.floor(Math.random() * 10);
        const intv = setInterval(() => {
            score++;
            circle.setAttribute('stroke-dasharray', `${score}, 100`);
            text.innerHTML = `${score}<span class="score-symbol">%</span>`;
            if (score >= target) clearInterval(intv);
        }, 30);

        trend.innerHTML = `<i class='bx bx-trending-up'></i> +${Math.floor(Math.random() * 8)}% vs last session`;
        
        // Dynamic Themes
        setTimeout(() => {
            themes.innerHTML = `
                <span class="thm-tag">Clinical Trial</span>
                <span class="thm-tag">Safety Data</span>
                <span class="thm-tag">Protocol</span>
            `;
        }, 1000);
    }


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

    // --- End Meeting / Logout Logic ---
    const endBtn = document.querySelector('.dock-end');
    const headerLogoutBtn = document.getElementById('logout-btn');

    function handleLogout() {
        if (confirm("Logout and Clear Session Data?")) {
            localStorage.removeItem('mng_user_name');
            localStorage.removeItem('mng_user_role');
            localStorage.removeItem('mng_session_questions');
            localStorage.removeItem('mng_team_chat');
            localStorage.removeItem('mng_ai_chat');

            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.5s ease-out';
            setTimeout(() => {
                window.location.reload(); 
            }, 500);
        }
    }

    if (endBtn) endBtn.addEventListener('click', handleLogout);
    if (headerLogoutBtn) headerLogoutBtn.addEventListener('click', handleLogout);

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

    function deployTeamMessage(text = null, fromSelf = true) {
        const textLoad = text || msgInputTeam.value.trim();
        if (!textLoad) return;

        // Hide empty state
        if (chatEmptyState) chatEmptyState.style.display = 'none';

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (fromSelf) {
            const builtHTML = `<div class="msg-row self" style="margin-top:8px;"><div class="msg-stack"><div style="font-size:12px; color:var(--c-text-secondary); margin-right:4px; text-align:right;">${userName} (You) • Just Now</div><div class="msg-blob">${textLoad}</div></div></div>`;
            chatFeedTeam.insertAdjacentHTML('beforeend', builtHTML);
            msgInputTeam.value = '';
            
            // Persist
            teamChatHistory.push({ type: 'self', user: userName, text: textLoad, time: 'Just Now' });
            localStorage.setItem('mng_team_chat', JSON.stringify(teamChatHistory));

            setTimeout(() => {
                const autoResp = "Agreed, I strongly support the trial design recommendations. Adding it to clinical protocols.";
                const returnedHTML = `<div class="msg-row incoming" style="margin-top:8px;"><img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=100&auto=format&fit=crop" class="msg-avatar" alt="Marcus"><div class="msg-stack"><div style="font-size:12px; color:var(--c-text-secondary); margin-left:4px;">Dr. Marcus Webb • Just Now</div><div class="msg-blob">${autoResp}</div></div></div>`;
                chatFeedTeam.insertAdjacentHTML('beforeend', returnedHTML);
                chatFeedTeam.scrollTo({ top: chatFeedTeam.scrollHeight, behavior: 'smooth' });
                
                teamChatHistory.push({ type: 'incoming', user: 'Dr. Marcus Webb', text: autoResp, time: 'Just Now', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=100&auto=format&fit=crop' });
                localStorage.setItem('mng_team_chat', JSON.stringify(teamChatHistory));
            }, 1000);
        } else {
            // Loading existing message
            // Handled in loadChatHistory
        }
        
        chatFeedTeam.scrollTo({ top: chatFeedTeam.scrollHeight, behavior: 'smooth' });
    }

    function loadChatHistory() {
        // Load Team Chat
        if (teamChatHistory.length > 0) {
            if (chatEmptyState) chatEmptyState.style.display = 'none';
            // Clear default messages if needed, or append after them
            teamChatHistory.forEach(msg => {
                let html = '';
                if (msg.type === 'self') {
                    html = `<div class="msg-row self" style="margin-top:8px;"><div class="msg-stack"><div style="font-size:12px; color:var(--c-text-secondary); margin-right:4px; text-align:right;">${msg.user} (You) • ${msg.time}</div><div class="msg-blob">${msg.text}</div></div></div>`;
                } else {
                    html = `<div class="msg-row incoming" style="margin-top:8px;"><img src="${msg.avatar}" class="msg-avatar" alt="${msg.user}"><div class="msg-stack"><div style="font-size:12px; color:var(--c-text-secondary); margin-left:4px;">${msg.user} • ${msg.time}</div><div class="msg-blob">${msg.text}</div></div></div>`;
                }
                chatFeedTeam.insertAdjacentHTML('beforeend', html);
            });
            chatFeedTeam.scrollTop = chatFeedTeam.scrollHeight;
        }

        // Load AI Chat
        if (aiChatHistory.length > 0) {
            aiChatHistory.forEach(msg => {
                let html = '';
                if (msg.type === 'self') {
                    html = `<div class="msg-row self" style="margin-top:8px;"><div class="msg-stack"><div style="font-size:12px; color:var(--c-text-secondary); margin-right:4px; text-align:right;">(You) • ${msg.time}</div><div class="msg-blob">${msg.text}</div></div></div>`;
                } else {
                    html = `<div class="msg-row incoming" style="margin-top:8px;"><div class="msg-avatar" style="background:var(--c-blue); display:flex; align-items:center; justify-content:center; color:white; font-size:18px;"><i class='bx bx-bot'></i></div><div class="msg-stack"><div style="font-size:12px; color:var(--c-text-secondary); margin-left:4px;">Assistant • ${msg.time}</div><div class="msg-blob">${msg.text}</div></div></div>`;
                }
                chatFeedAi.insertAdjacentHTML('beforeend', html);
            });
            chatFeedAi.scrollTop = chatFeedAi.scrollHeight;
        }
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

    const AI_API_DIRECT = 'https://sufficient-respondents-mood-reuters.trycloudflare.com/ask';
    let aiIsBusy = false;

    // 5-tier cascade: direct → corsproxy.io → corsproxy.org → thingproxy → proxy.cors.sh
    async function fetchFromAI(question) {
        const body = JSON.stringify({ question, session_id: AI_SESSION_ID });
        // The core issue with proxies is often the custom 'Content-Type' header triggering a preflight OPTIONS request that the proxy or the Cloudflare tunnel rejects. 
        // Direct attempt uses full headers. Proxies use a modified approach or we rely on the most lenient ones. 

        const strategies = [
            // 1. DIRECT: Ideal path, but subject to strict CORS
            {
                label: 'direct',
                fn: async () => {
                    const c = new AbortController(); setTimeout(() => c.abort(), 8000);
                    return fetch(AI_API_DIRECT, { 
                        method: 'POST', 
                        headers: { 'Content-Type': 'application/json' }, 
                        body, 
                        signal: c.signal 
                    });
                }
            },
            // 2. DIRECT (Text-Plain): Bypasses preflight OPTIONS request
            // This is a common fix for Cloudflare tunnels that block preflight
            {
                label: 'direct-bypass-preflight',
                fn: async () => {
                    const c = new AbortController(); setTimeout(() => c.abort(), 8000);
                    return fetch(AI_API_DIRECT, { 
                        method: 'POST', 
                        headers: { 'Content-Type': 'text/plain' }, 
                        body, 
                        signal: c.signal 
                    });
                }
            },
            // 3. CORSPROXY.IO
            {
                label: 'corsproxy.io',
                fn: async () => {
                    const c = new AbortController(); setTimeout(() => c.abort(), 12000);
                    return fetch('https://corsproxy.io/?' + encodeURIComponent(AI_API_DIRECT), { 
                        method: 'POST', 
                        headers: { 'Content-Type': 'application/json' },
                        body, 
                        signal: c.signal
                    });
                }
            },
            // 3. CODETABS: Good alternative proxy
            {
                label: 'codetabs',
                fn: async () => {
                    const c = new AbortController(); setTimeout(() => c.abort(), 12000);
                    return fetch('https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(AI_API_DIRECT), { 
                        method: 'POST', 
                        headers: { 'Content-Type': 'application/json' },
                        body, 
                        signal: c.signal
                    });
                }
            },
            // 4. ALLORIGINS: Uses a different wrapping method
            {
                label: 'allorigins',
                fn: async () => {
                    const c = new AbortController(); setTimeout(() => c.abort(), 15000);
                    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(AI_API_DIRECT)}`;
                    // AllOrigins requires a GET for their public API but we need to pass POST data
                    // So we use their specialized POST endpoint if possible, or stick to standard ones.
                    // For now, let's use another standard one:
                    return fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(AI_API_DIRECT + '?body=' + encodeURIComponent(body)), { 
                        method: 'GET',
                        signal: c.signal
                    });
                }
            }
        ];

        let diagnostics = [];
        for (const strategy of strategies) {
            try {
                const res = await strategy.fn();
                if (res.ok) {
                    console.info(`[MNG AI] Connected successfully via: ${strategy.label}`);
                    let payload = await res.json();
                    // Handle AllOrigins wrapper if used
                    if (strategy.label === 'allorigins' && payload.contents) {
                        try { payload = JSON.parse(payload.contents); } catch(e) {}
                    }
                    return payload;
                } else {
                    diagnostics.push(`${strategy.label}: HTTP ${res.status}`);
                }
            } catch (err) {
                // We silently push the error to diagnostics rather than throwing it to the console immediately, to avoid confusing the user with expected fallback failures.
                diagnostics.push(`${strategy.label}: Failed`);
            }
        }

        console.error('[MNG AI] Exhausted connection pool. Diagnostics:', diagnostics);
        throw new Error("Network routing blocked by CORS/Firewall.");
    }

    // Generic Fallback for service unavailability
    function generateMockResponse(q, errMsg = "") {
        let text = `⚠️ **MNG Intelligence Service Unavailable**
Your network environment or firewall may be blocking our secure AI gateways. 

**Diagnostic Details:**
${errMsg || "All connection attempts timed out."}

Please ensure the MNG Backend is active or contact support if the problem persists.`;
        return new Promise(resolve => setTimeout(() => resolve({ text }), 1000));
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

        // Add to AI history
        aiChatHistory.push({ type: 'self', text: textLoad, time: 'Just Now' });
        localStorage.setItem('mng_ai_chat', JSON.stringify(aiChatHistory));

        // Disable input while waiting
        aiIsBusy = true;
        msgInputAi.disabled = true;
        sendButtonAi.disabled = true;

        const typingId = addTypingIndicator();

        try {
            const data = await fetchFromAI(textLoad);
            const replyText = (data && data.text) ? data.text : 'I was unable to retrieve an answer. Please try again.';
            replaceTypingWithReply(typingId, replyText);
            
            // Add to AI history
            aiChatHistory.push({ type: 'incoming', text: replyText, time: 'Just Now' });
            localStorage.setItem('mng_ai_chat', JSON.stringify(aiChatHistory));

            // CHECK CONTENT: Tri-state logic (Resolved, Partial, Unresolved)
            const unresolvedPhrases = ["don't know", "do not know", "no information", "not found", "unable to find", "could not find", "not in the context", "nothing matching", "not matched"];
            const partialPhrases = [
                "partial", "some matching", "only mentions", "limited details", 
                "partially", "few things", "suggests that", "few things matching",
                "incomplete", "lack of information", "some information", "minimal information",
                "limited information"
            ];
            
            // 1. Check if backend explicitly provides a status
            let status = (data && data.status) ? data.status.toLowerCase() : "resolved"; 
            
            // 2. If backend didn't specify or said resolved, perform keyword fallback
            if (status === "resolved") {
                const isUnresolved = unresolvedPhrases.some(phrase => replyText.toLowerCase().includes(phrase));
                const isPartial = partialPhrases.some(phrase => replyText.toLowerCase().includes(phrase));
                
                if (isUnresolved) {
                    status = "unresolved";
                } else if (isPartial) {
                    status = "partial";
                }
            }
            
            // Validate status is one of our three allowed ones
            if (!["resolved", "partial", "unresolved"].includes(status)) {
                status = "unresolved"; // Safe fallback
            }
            
            // ADD TO QUESTION TAB
            addQuestionToSession(textLoad, status);

        } catch (err) {
            const errMsg = err && err.message ? err.message : String(err);
            console.error('[MNG AI] Connectivity failure:', errMsg);
            
            const mockRes = await generateMockResponse(textLoad, errMsg);
            replaceTypingWithReply(typingId, mockRes.text);
            
            // SERVER ISSUE: Do not add to questionId or sessionQuestions as requested
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

    // --- Question Management Logic ---
    // (sessionQuestions already initialized at top)

    function addQuestionToSession(text, status = "unresolved") {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const qId = Date.now();
        
        const newQ = {
            id: qId,
            user: userName,
            text: text,
            time: timeStr,
            status: status,
            avatar: "https://images.unsplash.com/photo-1637059824899-a441006a6875?q=80&w=452&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        };

        sessionQuestions.push(newQ);
        localStorage.setItem('mng_session_questions', JSON.stringify(sessionQuestions));
        refreshQuestionView();
        return qId;
    }

    function updateQuestionStatus(id, newStatus) {
        const q = sessionQuestions.find(it => it.id === id);
        if (q) {
            q.status = newStatus;
            localStorage.setItem('mng_session_questions', JSON.stringify(sessionQuestions));
            refreshQuestionView();
        }
    }

    function refreshQuestionView() {
        if (userRole === 'Organizer') {
            const activeFilterTab = document.querySelector('.q-sub-tab.active');
            const filter = activeFilterTab ? activeFilterTab.getAttribute('data-filter') : 'unresolved';
            loadQuestions(filter);
        }
    }

    function loadQuestions(filter = 'unresolved') {
        const list = document.getElementById('question-list');
        if (!list) return;

        list.innerHTML = '';
        
        let filtered = [];
        if (filter === 'all') {
            filtered = sessionQuestions;
        } else if (filter === 'unresolved') {
            // Show both unresolved and partial as requested
            filtered = sessionQuestions.filter(q => q.status === 'unresolved' || q.status === 'partial');
        } else {
            filtered = sessionQuestions.filter(q => q.status === filter);
        }

        if (filtered.length === 0) {
            list.innerHTML = `<div style="text-align:center; padding:40px 20px; color:rgba(255,255,255,0.2); font-size:13px;">
                <i class='bx bx-question-mark' style="font-size:32px; margin-bottom:8px; display:block;"></i>
                No ${filter} questions yet
            </div>`;
            return;
        }

        filtered.forEach(q => {
            const item = document.createElement('div');
            item.className = 'question-item';
            item.innerHTML = `
                <div class="q-user-info">
                    <img src="https://images.unsplash.com/photo-1637059824899-a441006a6875?q=80&w=452&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" class="q-avatar">
                    <span class="q-name">${q.user}</span>
                    <span class="q-time">${q.time}</span>
                </div>
                <div class="q-text">${q.text}</div>
                <div class="q-status-badge ${q.status}">${q.status.toUpperCase()}</div>
            `;
            list.appendChild(item);
        });
    }

    const qSubTabs = document.querySelectorAll('.q-sub-tab');
    qSubTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            qSubTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            loadQuestions(tab.getAttribute('data-filter'));
        });
    });

    const downloadBtn = document.getElementById('download-questions');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            showMNGToast('Preparing questions for download...');
            
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "ID,User,Question,Time,Status\n";
            
            sessionQuestions.forEach(q => {
                const row = [q.id, `"${q.user}"`, `"${q.text}"`, q.time, q.status].join(",");
                csvContent += row + "\n";
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `MNG_Session_Questions_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showMNGToast('Download complete.');
        });
    }

    // Initial checks
    checkAuth();
    loadChatHistory();

});


