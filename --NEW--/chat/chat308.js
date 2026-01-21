    document.getElementById('buildver').textContent = 'Build Version: 3.0.8';

    // Firebase Configuration
    const firebaseConfig = window.HLL_KEYS.firebase;

    // Initialize Firebase
    let app, database, analytics;
    try {
        app = firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        analytics = firebase.analytics();
        console.log('✅ Firebase initialized successfully');
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
    }

    // Session Management
    let sessionId = null;
    let sessionStartTime = null;

    function generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    function initializeSession() {
        sessionId = generateSessionId();
        sessionStartTime = new Date().toISOString();
        console.log('📝 New chat session:', sessionId);
        
        // Track session start with Analytics
        if (analytics) {
            analytics.logEvent('chat_session_start', {
                session_id: sessionId,
                timestamp: sessionStartTime
            });
        }
        
        // Save session metadata to Firebase
        if (database) {
            database.ref('chat_sessions/' + sessionId).set({
                started_at: sessionStartTime,
                user_agent: navigator.userAgent,
                platform: navigator.platform,
                last_activity: sessionStartTime
            }).catch(err => console.error('Failed to save session:', err));
        }
    }

    // Save chat message to Firebase
    function saveChatMessage(role, content, metadata = {}) {
        if (!database || !sessionId) return;
        
        const messageId = 'msg_' + Date.now();
        const timestamp = new Date().toISOString();
        
        const messageData = {
            role: role, // 'user' or 'assistant'
            content: content,
            timestamp: timestamp,
            ...metadata
        };
        
        // Save to Firebase Realtime Database
        database.ref('chat_sessions/' + sessionId + '/messages/' + messageId).set(messageData)
            .then(() => {
                console.log('💾 Message saved:', role);
                // Update last activity
                database.ref('chat_sessions/' + sessionId + '/last_activity').set(timestamp);
            })
            .catch(err => console.error('Failed to save message:', err));
        
        // Track with Analytics
        if (analytics) {
            analytics.logEvent('chat_message', {
                session_id: sessionId,
                message_role: role,
                message_length: content.length,
                has_metadata: Object.keys(metadata).length > 0
            });
        }
    }

    // Save conversation summary to Firebase
    function saveConversationSummary(summary) {
        if (!database || !sessionId) return;
        
        database.ref('chat_sessions/' + sessionId + '/summary').push({
            content: summary,
            timestamp: new Date().toISOString()
        }).catch(err => console.error('Failed to save summary:', err));
    }
    // Theme Toggle
    function toggleTheme() {
        const html = document.documentElement;
        const icon = document.getElementById('theme-icon');
        const navLogo = document.getElementById('nav-logo');
        const currentTheme = html.getAttribute('data-theme');
        
        if (currentTheme === 'light') {
            html.setAttribute('data-theme', 'dark');
            icon.className = 'fas fa-moon';
            if (navLogo) navLogo.src = '../nav_white.png';
            localStorage.setItem('hulalla-theme', 'dark');
        } else {
            html.setAttribute('data-theme', 'light');
            icon.className = 'fas fa-sun';
            if (navLogo) navLogo.src = '../nav_black.png';
            localStorage.setItem('hulalla-theme', 'light');
        }
    }

    // Initialize theme from localStorage or system preference
    function initTheme() {
        const savedTheme = localStorage.getItem('hulalla-theme');
        const icon = document.getElementById('theme-icon');
        const navLogo = document.getElementById('nav-logo');
        
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            icon.className = savedTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
            if (navLogo) navLogo.src = savedTheme === 'light' ? '../nav_black.png' : '../nav_white.png';
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const theme = prefersDark ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
            icon.className = theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
            if (navLogo) navLogo.src = theme === 'light' ? '../nav_black.png' : '../nav_white.png';
        }
    }

    // Disclaimer Modal
    function checkDisclaimer() {
        const accepted = localStorage.getItem('hulalla_disclaimer_accepted');
        const modal = document.getElementById('disclaimer-modal');
        
        if (accepted === 'true') {
            modal.classList.add('hidden');
        } else {
            modal.classList.remove('hidden');
            // Disable chat until accepted
            document.getElementById('userInput').disabled = true;
        }
    }

    function acceptDisclaimer() {
        localStorage.setItem('hulalla_disclaimer_accepted', 'true');
        const modal = document.getElementById('disclaimer-modal');
        modal.classList.add('hidden');
        document.getElementById('userInput').disabled = false;
        document.getElementById('userInput').focus();
    }

    // Initialize disclaimer check and accept button
    document.addEventListener('DOMContentLoaded', () => {
        checkDisclaimer();
        const acceptBtn = document.getElementById('accept-disclaimer');
        if (acceptBtn) {
            acceptBtn.addEventListener('click', acceptDisclaimer);
        }
    });

    // Run on page load
    initTheme();

    // API Configuration
    const GROQ_API_KEYS = window.HLL_KEYS.groq;
    
    // Random API key selection for load balancing
    function getRandomApiKey() {
        const randomIndex = Math.floor(Math.random() * GROQ_API_KEYS.length);
        return GROQ_API_KEYS[randomIndex];
    }
    
    // Get a different key when rate limited
    function getAlternativeApiKey(excludeKey) {
        const otherKeys = GROQ_API_KEYS.filter(key => key !== excludeKey);
        if (otherKeys.length === 0) return GROQ_API_KEYS[0];
        return otherKeys[Math.floor(Math.random() * otherKeys.length)];
    }
    
    // Available models (Groq)
    const GROQ_MODELS = [
        { id: "openai/gpt-oss-safeguard-20b", name: "OpenAI GPT OSS Safeguard 20B", priority: 1 },
        { id: "openai/gpt-oss-120b", name: "OpenAI GPT OSS 120B", priority: 2 },
        { id: "openai/gpt-oss-20b", name: "OpenAI GPT OSS 20B", priority: 3 },
        { id: "whisper-large-v3-turbo", name: "Whisper Large V3 Turbo", priority: 4 },
        { id: "groq/compound-mini", name: "Groq Compound Mini", priority: 5 }
    ];
    
    let currentModel = GROQ_MODELS[0]; // Default to first model
    let isFirstQuestion = true; // Track if first question
    
    // Get random model (not Llama for variety)
    function getRandomModel() {
        const randomIndex = Math.floor(Math.random() * GROQ_MODELS.length);
        return GROQ_MODELS[randomIndex];
    }
    
    // User Rate Limiting
    const USER_QUESTION_LIMIT = 33; // Max questions per day
    const USER_LIMIT_RESET_HOURS = 3;
    
    function getUserQuestionCount() {
        const stored = localStorage.getItem('hulalla_question_data');
        if (!stored) return { count: 0, resetTime: Date.now() + (USER_LIMIT_RESET_HOURS * 60 * 60 * 1000) };
        
        const data = JSON.parse(stored);
        if (Date.now() > data.resetTime) {
            // Reset if time passed
            return { count: 0, resetTime: Date.now() + (USER_LIMIT_RESET_HOURS * 60 * 60 * 1000) };
        }
        return data;
    }
    
    function incrementUserQuestionCount() {
        const data = getUserQuestionCount();
        data.count++;
        localStorage.setItem('hulalla_question_data', JSON.stringify(data));
        updateQuestionCounterDisplay(); // Update UI
        return data;
    }
    
    function canUserAskQuestion() {
        const data = getUserQuestionCount();
        return data.count < USER_QUESTION_LIMIT;
    }
    
    function getRemainingQuestions() {
        const data = getUserQuestionCount();
        return Math.max(0, USER_QUESTION_LIMIT - data.count);
    }
    
    // Update question counter display
    function updateQuestionCounterDisplay() {
        const data = getUserQuestionCount();
        const countEl = document.getElementById('question-count');
        const limitEl = document.getElementById('question-limit');
        const counterEl = document.getElementById('question-counter');
        
        if (countEl && limitEl) {
            countEl.textContent = data.count;
            limitEl.textContent = USER_QUESTION_LIMIT;
            
            // Change color based on remaining
            const remaining = USER_QUESTION_LIMIT - data.count;
            if (counterEl) {
                counterEl.classList.remove('warning', 'danger');
                if (remaining <= 5 && remaining > 0) {
                    counterEl.classList.add('warning');
                } else if (remaining <= 0) {
                    counterEl.classList.add('danger');
                }
            }
        }
    }
    
    // State
    let partyData = "";
    let policiesArray = [];
    let policiesLoaded = false;
    let membersData = null;
    let membersLoaded = false;
    let conversationSummary = "";
    let recentMessages = [];
    let messageCount = 0;
    let lastRequestTime = 0;
    const MIN_REQUEST_INTERVAL = 2000;
    let requestCount = 0;
    let cooldownUntil = 0;

    // UI Helpers
    function showLoading() {
        document.getElementById('loading-bar').classList.remove('hidden');
    }

    function hideLoading() {
        document.getElementById('loading-bar').classList.add('hidden');
    }

    function showError(message) {
        const toast = document.getElementById('error-toast');
        document.getElementById('error-message').textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 4000);
    }

    // Load Policies
    async function loadPolicies() {
        try {
            showLoading();
            const response = await fetch('../policies/policies.json');
            if (!response.ok) throw new Error('Failed to load policies');
            
            const policies = await response.json();
            policiesArray = policies;
            partyData = formatPoliciesData(policies);
            policiesLoaded = true;
            console.log('✅ Loaded', policies.length, 'policies');
        } catch (error) {
            console.error('❌ Error loading policies:', error);
            showError('ไม่สามารถโหลดข้อมูลนโยบายได้');
            partyData = "ไม่สามารถโหลดข้อมูลนโยบายได้ในขณะนี้";
        }
    }

    // Load Members
    async function loadMembers() {
        try {
            const response = await fetch('./members.json');
            if (!response.ok) throw new Error('Failed to load members');
            
            membersData = await response.json();
            membersLoaded = true;
            console.log('✅ Loaded members data');
        } catch (error) {
            console.error('❌ Error loading members:', error);
            membersData = null;
        }
    }

    // Search Relevant Members (RAG)
    function searchRelevantMembers(query) {
        if (!membersData) return null;
        
        const queryLower = query.toLowerCase();
        let results = {
            advisors: [],
            executives: [],
            departmentHeads: [],
            members: []
        };
        
        // Check if asking about advisors
        const advisorKeywords = ['อาจารย์', 'ที่ปรึกษา', 'อ.', 'ครู', 'เจ๋ง', 'นิตย์', 'มาร์ก', 'พงศธร', 'นิตยา', 'ทักษิณ'];
        if (advisorKeywords.some(kw => queryLower.includes(kw))) {
            results.advisors = membersData.advisors || [];
        }
        
        // Check if asking about executives/committee
        const execKeywords = ['บริหาร', 'ประธาน', 'รองประธาน', 'เลขา', 'กรรมการ', 'ปาล์มมี่', 'ฟาร์', 'โอพิ้งค์', 'ดิว', 'ปาย', 'หัวหน้า', 'ผู้นำ'];
        if (execKeywords.some(kw => queryLower.includes(kw))) {
            results.executives = membersData.executives || [];
        }
        
        // Check if asking about department heads
        const deptKeywords = ['หัวหน้าฝ่าย', 'ฝ่าย', 'วิชาการ', 'กีฬา', 'ศิลป์', 'กิจกรรม', 'ปฏิคม', 'เหรัญญิก', 'ประชาสัมพันธ์', 'บริหาร'];
        if (deptKeywords.some(kw => queryLower.includes(kw))) {
            results.departmentHeads = membersData.department_heads || [];
            
            // เพิ่ม: ค้นหาสมาชิกทั้งหมดในฝ่ายที่ถาม (ทั้ง 8 ฝ่าย)
            const departmentMap = {
                'วิชาการ': ['วิชาการ'],
                'กีฬา': ['กีฬา'],
                'ศิลป': ['ศิลปวัฒนธรรม', 'ศิลป์', 'ศิลป', 'ศิลปะ'],
                'ศิลปวัฒนธรรม': ['ศิลปวัฒนธรรม', 'ศิลป์', 'ศิลป', 'ศิลปะ'],
                'กิจกรรม': ['กิจกรรม'],
                'ปฏิคม': ['ปฏิคม', 'ปฏิสัมพันธ์'],
                'เหรัญญิก': ['เหรัญญิก'],
                'ประชาสัมพันธ์': ['ประชาสัมพันธ์'],
                'ประชา': ['ประชาสัมพันธ์'],
                'pr': ['ประชาสัมพันธ์'],
                'บริหาร': ['บริหาร']
            };
            
            // หาว่าถามเกี่ยวกับฝ่ายไหน
            for (const [keyword, deptNames] of Object.entries(departmentMap)) {
                if (queryLower.includes(keyword)) {
                    // กรองสมาชิกที่อยู่ฝ่ายนี้ (ตรวจสอบทุกชื่อที่เป็นไปได้)
                    const deptMembers = (membersData.members || []).filter(m => {
                        const memberRole = (m.role || '').toLowerCase();
                        const memberSubRole = (m.sub_role || '').toLowerCase();
                        
                        return deptNames.some(deptName => {
                            const deptNameLower = deptName.toLowerCase();
                            return memberRole.includes(deptNameLower) || 
                                   memberSubRole.includes(deptNameLower) ||
                                   memberRole === deptName ||
                                   memberSubRole.includes(deptName);
                        });
                    });
                    
                    if (deptMembers.length > 0) {
                        // เพิ่มสมาชิกในฝ่ายเข้าไปใน results (ไม่ซ้ำ)
                        deptMembers.forEach(member => {
                            if (!results.members.find(m => m.id === member.id)) {
                                results.members.push(member);
                            }
                        });
                    }
                    break; // พบแล้วไม่ต้องหาต่อ
                }
            }
        }
        
        // Check if asking about specific members or IG
        const memberKeywords = ['สมาชิก', 'คน', 'ใคร', 'กี่คน', 'ทั้งหมด', 'รายชื่อ', 'ห้อง', 'ig', 'ไอจี', 'instagram', 'อินสตาแกรม'];
        if (memberKeywords.some(kw => queryLower.includes(kw))) {
            // Check for specific class
            const classMatch = queryLower.match(/4\/[1-6]|ห้อง\s?([1-6])|ม\.?\s?4\/([1-6])/);
            if (classMatch) {
                const classNum = classMatch[1] || classMatch[2] || classMatch[0].replace('4/', '');
                const classMembers = (membersData.members || []).filter(m => m.class === `4/${classNum}`);
                // เพิ่มสมาชิกที่ยังไม่มี
                classMembers.forEach(member => {
                    if (!results.members.find(m => m.id === member.id)) {
                        results.members.push(member);
                    }
                });
            } else if (!deptKeywords.some(kw => queryLower.includes(kw))) {
                // ถ้าไม่ได้ถามเกี่ยวกับฝ่าย ให้แสดงทั้งหมด
                results.members = membersData.members || [];
            }
        }
        
        // Search by nickname or name
        const allMembers = membersData.members || [];
        allMembers.forEach(member => {
            const memberText = `${member.nickname} ${member.fullname} ${member.role} ${member.sub_role || ''}`.toLowerCase();
            if (memberText.includes(queryLower) || queryLower.includes(member.nickname.toLowerCase())) {
                if (!results.members.find(m => m.id === member.id)) {
                    results.members.push(member);
                }
            }
        });
        
        // Return null if no relevant results
        const hasResults = results.advisors.length > 0 || results.executives.length > 0 || 
                          results.departmentHeads.length > 0 || results.members.length > 0;
        return hasResults ? results : null;
    }

    // Format Members Data for AI
    function formatMembersData(results) {
        if (!results) return '';
        
        let formatted = '\n=== ข้อมูลบุคลากรพรรคฮูลัลลา ===\n\n';
        
        // Advisors
        if (results.advisors?.length > 0) {
            formatted += '👨‍🏫 **อาจารย์ที่ปรึกษา:**\n';
            results.advisors.forEach(a => {
                formatted += `• ${a.title} (${a.fullname}) - ชื่อเล่น: ${a.nickname}\n`;
            });
            formatted += '\n';
        }
        
        // Executives
        if (results.executives?.length > 0) {
            formatted += '⭐ **คณะกรรมการบริหาร:**\n';
            results.executives.forEach(e => {
                const member = membersData.members?.find(m => m.id === e.id);
                formatted += `• ${e.position}: ${e.nickname}`;
                if (member) {
                    formatted += ` (${member.fullname}) - ${member.class}`;
                    if (member.ig) formatted += ` - IG: @${member.ig}`;
                }
                formatted += '\n';
            });
            formatted += '\n';
        }
        
        // Department Heads
        if (results.departmentHeads?.length > 0) {
            formatted += '🏆 **หัวหน้าฝ่าย:**\n';
            results.departmentHeads.forEach(d => {
                const member = membersData.members?.find(m => m.id === d.id);
                formatted += `• ${d.department}: ${d.nickname}`;
                if (member) {
                    formatted += ` (${member.fullname}) - ${member.class}`;
                    if (member.ig) formatted += ` - IG: @${member.ig}`;
                }
                formatted += '\n';
            });
            formatted += '\n';
        }
        
        // Members
        if (results.members?.length > 0 && results.members.length <= 15) {
            formatted += '👥 **สมาชิก:**\n';
            results.members.forEach(m => {
                formatted += `• ${m.nickname} (${m.fullname}) - ${m.class} - ฝ่าย${m.role}`;
                if (m.sub_role) formatted += ` (${m.sub_role})`;
                if (m.ig) formatted += ` - IG: @${m.ig}`;
                formatted += '\n';
            });
        } else if (results.members?.length > 15) {
            formatted += `👥 **สมาชิก:** มีทั้งหมด ${results.members.length} คน\n`;
            // Show all with IG
            results.members.forEach(m => {
                formatted += `• ${m.nickname} (${m.fullname}) - ${m.class}`;
                if (m.ig) formatted += ` - IG: @${m.ig}`;
                formatted += '\n';
            });
        }
        
        return formatted;
    }

    // Smart Policy Search (RAG)
    function searchRelevantPolicies(query) {
        const queryLower = query.toLowerCase();
        
        const keywords = {
            // หมวดพื้นฐาน
            'วิสัยทัศน์': ['วิสัยทัศน์', 'vision', 'เป้าหมาย', 'จุดมุ่งหมาย', 'ทิศทาง', 'มุ่งหวัง'],
            'พันธกิจ': ['พันธกิจ', 'mission', 'ภารกิจ', 'หน้าที่', 'วัตถุประสงค์หลัก'],
            'ค่านิยม': ['ค่านิยม', 'value', 'หลักการ', 'แนวคิด', 'ปรัชญา', 'อุดมการณ์'],
            
            // 1. นักเรียนและคุณภาพชีวิต
            'คุณภาพชีวิต': ['คุณภาพชีวิต', 'สวัสดิการ', 'สิทธิ', 'เติมไฟ', 'จิตใจ', 'กำลังใจ', 'ความสุข'],
            'ความปลอดภัย': ['ความปลอดภัย', 'ฉุกเฉิน', 'อัคคีภัย', 'ป้องกัน', 'รักษา', 'อบรม', 'ดับเพลิง'],
            'สวัสดิการห้องน้ำ': ['ผ้าอนามัย', 'กระดาษห่อ', 'สุขภัณฑ์', 'อนามัย'],
            
            // 2. กิจกรรมและความสามารถพิเศษ
            'กิจกรรม': ['กิจกรรม', 'เทศกาล', 'ประกวด', 'แต่งกาย', 'บัดดี้', 'บัดเดอร์', 'งานเทศกาล'],
            'ความสามารถ': ['ศักยภาพ', 'ความถนัด', 'ความสามารถ', 'พรสวรรค์', 'ทักษะ', 'รอบด้าน'],
            'ชุมนุม': ['ชุมนุม', 'คลับ', 'student-led', 'นักเรียนนำ'],
            'ศิลปะ': ['ศิลปะ', 'วาด', 'ออกแบบ', 'เสื้อผ้า', 'ปกสมุด', 'สร้างสรรค์', 'ดนตรี', 'บรรยากาศ'],
            'กีฬาและอีสปอร์ต': ['กีฬา', 'แข่ง', 'กรีฑา', 'ฟุตบอล', 'บาส', 'วอลเลย์', 'ออกกำลังกาย', 'อุปกรณ์กีฬา', 'กีฬาสี', 'e-sport', 'esport', 'อีสปอร์ต', 'rov', 'efootball', 'เกม'],
            
            // 3. การเรียนและวิชาการ
            'การศึกษา': ['การศึกษา', 'เรียน', 'วิชาการ', 'หลักสูตร', 'การสอน', 'คุณภาพการสอน'],
            'คลังความรู้': ['คลังความรู้', 'ดิจิทัล', 'ห้องสมุด', 'หนังสือ', 'เข้าถึง', 'ความรู้'],
            'ติว': ['ติว', 'สอบ', 'เตรียมสอบ', 'exam prep', 'ช่วยเหลือการเรียน'],
            
            // 4. นวัตกรรมและการพัฒนาโรงเรียน
            'เทคโนโลยี': ['เทคโนโลยี', 'ดิจิทัล', 'AI', 'เว็บไซต์', 'ระบบ', 'ปรับปรุง', 'พัฒนา'],
            'สหกรณ์': ['สหกรณ์', 'ขาย', 'อุปกรณ์', 'ของใช้', 'ราคา', 'ร้านค้า'],
            'แพลตฟอร์ม': ['แพลตฟอร์ม', 'e-marketplace', 'grab and go', 'สั่งอาหาร', 'ออนไลน์'],
            'อาหารและโรงอาหาร': ['อาหาร', 'ข้าว', 'กิน', 'โรงอาหาร', 'ร้านอาหาร', 'ซื้ออาหาร', 'จองอาหาร', 'คิว', 'ต่อคิว', 'พักกลางวัน', 'grab', 'สั่งล่วงหน้า'],
            
            // 5. สิ่งแวดล้อมและความสะอาด
            'สิ่งแวดล้อม': ['สิ่งแวดล้อม', 'สะอาด', 'สุขอนามัย', 'ต้นไม้', 'ป่า', 'สีเขียว'],
            'ขยะ': ['ขยะ', 'รีไซเคิล', 'แลกขนม', 'trash to treat', 'ทิ้ง'],
            'ห้องน้ำ': ['ห้องน้ำ', 'กลิ่น', 'สเปรย์', 'สุขลักษณะ', 'ทำความสะอาด'],
            
            // 6. สภาพแวดล้อมที่เปิดกว้าง
            'ความเท่าเทียม': ['ความเท่าเทียม', 'หลากหลาย', 'เปิดกว้าง', 'ไม่แบ่งแยก', 'diversity', 'inclusive'],
            'เครื่องแบบ': ['เครื่องแบบ', 'ชุดนักเรียน', 'แต่งกาย', 'ปรับเปลี่ยน', 'flexible uniform'],
            'การเข้าถึง': ['เข้าถึง', 'พื้นที่', 'ช่วงเวลา', 'โอกาส', 'สิทธิ์'],
            
            // 7. การสื่อสารและการมีส่วนร่วม
            'การสื่อสาร': ['การสื่อสาร', 'ประชาสัมพันธ์', 'แจ้งข่าว', 'สภา', 'ติดต่อ'],
            'ร้องทุกข์': ['ร้องทุกข์', 'ข้อพิพาท', 'ปัญหา', 'แจ้งเรื่อง', 'ช่วยเหลือ'],
            'สิทธิเสรีภาพ': ['สิทธิเสรีภาพ', 'มีส่วนร่วม', 'เสนอความเห็น', 'เสียง', 'แสดงความคิดเห็น'],
            'สะท้อนผล': ['สะท้อนผล', 'ประเมิน', 'feedback', 'ปรับปรุง', 'รีวิว']
        };
        
        // ตรวจสอบคำสำคัญเฉพาะ - เพิ่ม Priority สูงสำหรับคำที่ต้องการ
        const foodKeywords = ['ข้าว', 'อาหาร', 'กิน', 'โรงอาหาร', 'ร้านอาหาร', 'ซื้ออาหาร', 'จองอาหาร', 'คิว', 'ต่อคิว', 'พักกลางวัน'];
        const sportKeywords = ['กีฬาสี', 'e-sport', 'esport', 'อีสปอร์ต', 'เกม', 'rov', 'efootball'];
        
        // ตรวจสอบว่าคำถามเกี่ยวกับอาหาร/โรงอาหาร -> ให้ชี้ไปที่นโยบาย 2 (Grab & Go)
        const hasFoodKeyword = foodKeywords.some(keyword => queryLower.includes(keyword));
        
        // ตรวจสอบว่าคำถามเกี่ยวกับกีฬาสี/e-sport -> ให้ชี้ไปที่นโยบาย 8
        const hasSportKeyword = sportKeywords.some(keyword => queryLower.includes(keyword));
        
        let scores = [];
        
        policiesArray.forEach((policy, index) => {
            let score = 0;
            const policyText = (policy.title + ' ' + policy.description + ' ' + 
                              (policy.objectives?.join(' ') || '') + ' ' + 
                              (policy.actions?.join(' ') || '')).toLowerCase();
            
            // เพิ่ม score สูงมากถ้าคำถามพูดถึงอาหาร และเป็นนโยบาย 2
            if (hasFoodKeyword && policy.id === 2) {
                score += 100;
            }
            
            // เพิ่ม score สูงมากถ้าคำถามพูดถึงกีฬาสี/e-sport และเป็นนโยบาย 8
            if (hasSportKeyword && policy.id === 8) {
                score += 100;
            }
            
            Object.entries(keywords).forEach(([category, words]) => {
                words.forEach(word => {
                    if (queryLower.includes(word) && policyText.includes(word)) {
                        score += 10;
                    }
                });
            });
            
            if (policyText.includes(queryLower)) {
                score += 20;
            }
            
            if (queryLower.match(/มี.*นโยบาย|นโยบาย.*อะไร|ทุกนโยบาย|นโยบายทั้งหมด/)) {
                score = 5;
            }
            
            if (score > 0) {
                scores.push({ policy, score, index });
            }
        });
        
        scores.sort((a, b) => b.score - a.score);
        
        if (scores.length === 0) {
            return policiesArray.map(p => ({
                id: p.id,
                title: p.title,
                description: p.description.substring(0, 150) + '...'
            }));
        }
        
        // ถ้าถามเรื่องนโยบายทั้งหมด ให้ส่งแค่ชื่อและคำอธิบายสั้นๆ (ลด Token)
        if (queryLower.match(/มี.*นโยบาย|นโยบาย.*อะไร|ทุกนโยบาย|นโยบายทั้งหมด|กี่นโยบาย|มีนโยบาย.*บ้าง/)) {
            return policiesArray.map(p => ({
                id: p.id,
                title: p.title,
                description: p.description.substring(0, 120) + '...' // สรุปสั้นๆ
            }));
        }
        
        // ส่งนโยบายที่เกี่ยวข้องสูงสุด 8 นโยบาย (ลดจาก 15 เพื่อประหยัด Token)
        return scores.slice(0, Math.min(8, scores.length)).map(s => s.policy);
    }

    function formatSelectedPolicies(policies) {
        // ถ้ามีนโยบายมากกว่า 10 ให้แสดงแค่ชื่อและคำอธิบายย่อ
        if (policies.length > 10) {
            let formatted = "=== รายการนโยบายพรรคฮูลัลลา (" + policies.length + " นโยบาย) ===\n\n";
            policies.forEach((policy) => {
                formatted += `${policy.id}. **${policy.title}**\n`;
                if (policy.description) {
                    const shortDesc = policy.description.substring(0, 100);
                    formatted += `   ${shortDesc}...\n\n`;
                }
            });
            formatted += "\n💡 ถ้าอยากทราบรายละเอียดนโยบายใด ให้ถามเฉพาะนโยบายนั้นได้เลยครับ\n";
            return formatted;
        }
        
        // ถ้ามีนโยบายไม่เกิน 10 แสดงรายละเอียดเต็ม
        let formatted = "=== นโยบายที่เกี่ยวข้อง ===\n\n";
        
        policies.forEach((policy) => {
            formatted += `📋 **นโยบายที่ ${policy.id}: ${policy.title}**\n`;
            formatted += `${policy.description}\n\n`;
            
            if (policy.objectives?.length > 0) {
                formatted += `🎯 วัตถุประสงค์:\n`;
                policy.objectives.forEach((obj, i) => {
                    formatted += `   ${i + 1}. ${obj}\n`;
                });
                formatted += '\n';
            }
            
            if (policy.actions?.length > 0) {
                formatted += `✨ แนวทางการดำเนินงาน:\n`;
                policy.actions.forEach((action, i) => {
                    formatted += `   ${i + 1}. ${action}\n`;
                });
                formatted += '\n';
            }
            
            formatted += '---\n\n';
        });
        
        return formatted;
    }

    function formatPoliciesData(policies) {
        let formatted = "=== นโยบายพรรคฮูลัลลา เบอร์ 3 ===\n\n";
        
        policies.forEach((policy) => {
            formatted += `นโยบายที่ ${policy.id}: ${policy.title}\n`;
            formatted += `คำอธิบาย: ${policy.description}\n`;
            
            if (policy.objectives?.length > 0) {
                formatted += `วัตถุประสงค์:\n`;
                policy.objectives.forEach((obj, i) => {
                    formatted += `  ${i + 1}. ${obj}\n`;
                });
            }
            
            if (policy.actions?.length > 0) {
                formatted += `แนวทางการดำเนินงาน:\n`;
                policy.actions.forEach((action, i) => {
                    formatted += `  ${i + 1}. ${action}\n`;
                });
            }
            
            formatted += '\n---\n\n';
        });
        
        return formatted;
    }

    // Summarize Conversation
    async function summarizeConversation() {
        if (recentMessages.length < 4) return;
        
        try {
            const conversationText = recentMessages.map(m => 
                `${m.role === 'user' ? 'ผู้ใช้' : 'AI'}: ${m.content}`
            ).join('\n');
            
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getRandomApiKey()}`
                },
                body: JSON.stringify({
                    model: currentModel.id,
                    messages: [
                        { role: 'system', content: 'สรุปบทสนทนานี้อย่างกระชับ เน้นประเด็นสำคัญ ใช้ภาษาไทย 2-3 ประโยค' },
                        { role: 'user', content: `สรุปบทสนทนา:\n${conversationText}` }
                    ],
                    temperature: 0.3,
                    max_tokens: 200
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                const newSummary = data.choices[0].message.content;
                conversationSummary = conversationSummary ? `${conversationSummary}\n\n${newSummary}` : newSummary;
                recentMessages = recentMessages.slice(-2);
                
                // Save summary to Firebase
                saveConversationSummary(newSummary);
            }
        } catch (error) {
            console.error('Failed to summarize:', error);
        }
    }

    // Send Message
    async function sendMessage() {
        const inputField = document.getElementById('userInput');
        const sendBtn = document.getElementById('send-btn');
        const message = inputField.value.trim();

        if (!message) return;

        if (!policiesLoaded) {
            showError('กรุณารอสักครู่ ระบบกำลังโหลดข้อมูล...');
            return;
        }
        
        // Check user question limit
        if (!canUserAskQuestion()) {
            const data = getUserQuestionCount();
            const resetTime = new Date(data.resetTime);
            const hours = resetTime.getHours().toString().padStart(2, '0');
            const mins = resetTime.getMinutes().toString().padStart(2, '0');
            showError(`คุณถามครบ ${USER_QUESTION_LIMIT} คำถามแล้ววันนี้ 🙏 กลับมาใหม่ตอน ${hours}:${mins} น. นะ`);
            return;
        }
        
        const now = Date.now();
        if (now < cooldownUntil) {
            const remaining = Math.ceil((cooldownUntil - now) / 1000);
            showError(`กรุณารออีก ${remaining} วินาที`);
            return;
        }
        
        if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
            const wait = Math.ceil((MIN_REQUEST_INTERVAL - (now - lastRequestTime)) / 1000);
            showError(`กรุณารออีก ${wait} วินาที`);
            return;
        }
        
        lastRequestTime = now;
        requestCount++;
        
        // Increment user question count
        const questionData = incrementUserQuestionCount();
        const remaining = USER_QUESTION_LIMIT - questionData.count;
        if (remaining <= 5 && remaining > 0) {
            console.log(`เหลืออีก ${remaining} คำถามวันนี้`);
        }

        // Hide welcome message
        const welcomeMsg = document.getElementById('welcome-message');
        if (welcomeMsg) welcomeMsg.style.display = 'none';

        // Disable input
        sendBtn.disabled = true;
        inputField.disabled = true;

        // Add User Message
        addUserMessage(message);
        inputField.value = '';
        updateSendButtonStyle(); // Update button style after clearing input
        
        recentMessages.push({ role: 'user', content: message });
        messageCount++;
        
        // Save user message to Firebase
        saveChatMessage('user', message, {
            question_count: getUserQuestionCount().count,
            remaining_questions: getRemainingQuestions()
        });

        // Add Bot Loading
        const botMsgDiv = addBotMessage();
        showLoading();

        // Search relevant policies
        const relevantPolicies = searchRelevantPolicies(message);
        const relevantData = formatSelectedPolicies(relevantPolicies);
        
        // Search relevant members
        const relevantMembers = searchRelevantMembers(message);
        const membersInfo = formatMembersData(relevantMembers);

        // System Prompt
        const systemPrompt = `คุณคือ AI Agent ชื่อลูลู่ LuLu ที่เป็นมิตรของพรรคฮูลัลลา (Hulalla) เบอร์ 3
ลูลู่ lulu - ชาย เป็นตัวแทนพรรคฮูลัลลา เป็นลิงสับปะรด ที่น่ารัก สนุกสนาน และพร้อมช่วยเหลือ เป็น mascot พรรคร่วมกับ ลาล่า Lala (มะพร้าว) - หญิง ทั้งคู่เป็นพี่น้องกัน ออกแบบโดยฝ่ายศิลป์ โดยมนและหยก

**⚠️ กฎสำคัญที่สุด - ห้ามมั่วข้อมูล:**
- ตอบเฉพาะข้อมูลที่ให้ไว้ด้านล่างเท่านั้น
- ห้ามคิดชื่อคน ตำแหน่ง หรือข้อมูลขึ้นมาเอง
- ข้อมูลสมาชิก/นโยบายต้องตรงกับที่ให้ไว้ 100%

**🚫 กฎสำคัญ - ห้ามพูดถึงพรรคคู่แข่ง:**
- คุณเป็น AI ของพรรคฮูลัลลา (Hulalla) เบอร์ 3 เท่านั้น
- ถ้ามีคนถามเกี่ยวกับพรรคอื่น เช่น:
  * เบอร์ 1, 2, 4 หรือเบอร์อื่นๆ
  * Echelon (เบอร์ 1), Jinera (เบอร์ 2), Azdihal (เบอร์ 4)
  * พรรคคู่แข่งใดๆ ในการเลือกตั้ง
- ให้ตอบอย่างเป็นมิตรและเป็นกลาง เช่น:
  * "เป็นพรรคคู่แข่งที่ดีนะ แต่เราเป็น AI ของพรรคฮูลัลลา เบอร์ 3 เท่านั้น ไม่มีข้อมูลพรรคอื่นเลย 😊"
  * "ขอแนะนำพรรคฮูลัลลา เบอร์ 3 แทนนะ เรามีนโยบายที่น่าสนใจมากมาย!"
- ห้ามให้ข้อมูลพรรคอื่นโดยเด็ดขาด เพราะไม่มีข้อมูล
- นำเสนอจุดเด่นของพรรคฮูลัลลาแทน

**การตอบคำถามนอกเรื่อง:**
- ถ้าถูกถามเรื่องที่ไม่เกี่ยวกับพรรค (เช่น หิวข้าว, อากาศ, เรื่องส่วนตัว) ให้ตอบแบบเป็นมิตรและขี้เล่น แต่ให้แนะนำสู่เรื่องนโยบายที่เกี่ยวข้องกับข้อความให้เชื่อมกัน หรือให้เกี่ยวกับพรรค
- อย่าตอบแค่ "ไม่มีข้อมูล" แต่ให้แนะนำเรื่องที่เกี่ยวข้องหรือนโยบายที่น่าสนใจ
- ถ้าถามเรื่องที่ไม่มีข้อมูลจริงๆ เช่น ชื่อคนที่ไม่มีในฐานข้อมูล ค่อยบอกว่า "ไม่มีข้อมูล"

**ข้อมูลพรรคฮูลัลลา (ข้อมูลจริง):**
- 🏫 พรรคนักเรียนโรงเรียนสาธิตมหาวิทยาลัยขอนแก่น ฝ่ายมัธยมศึกษา (ศึกษาศาสตร์)
- 🗳️ พรรคเบอร์ 3 จะเลือกตั้งในวันเลือกตั้งวันที่ 10 กุมภาพันธ์ 2569
- 📱 Social Media: Instagram, TikTok, YouTube @hulalla.hawaii
- 📧 Email: hulalla.party@gmail.com
- ⚠️ สำคัญ: นี่คือพรรคนักเรียนในโรงเรียน ไม่ใช่พรรคการเมืองของประเทศ
- 📋 นโยบายพรรคมีทั้งหมด 25 นโยบาย แบ่งเป็น 7 หมวดหมู่:
  1. 👨‍🎓 **นักเรียนและคุณภาพชีวิต**: สวัสดิการ ความปลอดภัย คุณภาพชีวิตนักเรียน
  2. 🎨 **กิจกรรมและความสามารถพิเศษ**: ชุมนุม กีฬา ศิลปะ ดนตรี ความสามารถรอบด้าน
  3. 📚 **การเรียนและวิชาการ**: คลังความรู้ การติว การสอน หลักสูตร
  4. 💡 **นวัตกรรมและการพัฒนาโรงเรียน**: เทคโนโลยี ดิจิทัล สหกรณ์ แพลตฟอร์ม
  5. 🌿 **สิ่งแวดล้อมและความสะอาด**: ห้องน้ำ ขยะ รีไซเคิล สิ่งแวดล้อม
  6. 🤝 **สภาพแวดล้อมที่เปิดกว้าง**: ความเท่าเทียม ความหลากหลาย การเข้าถึง
  7. 📢 **การสื่อสารและการมีส่วนร่วม**: สภานักเรียน ร้องทุกข์ ประชาสัมพันธ์ สิทธิเสรีภาพ

**วิสัยทัศน์และพันธกิจพรรค:**
- 🎯 วิสัยทัศน์: สอดคล้องกับโรงเรียนที่มุ่งเป็นโรงเรียนชั้นนำด้านนวัตกรรมการศึกษา ส่งเสริมความคิดสร้างสรรค์และศักยภาพนักเรียนทุกด้าน
- 🌟 พันธกิจ: พัฒนาสภาพแวดล้อมการเรียนรู้ ส่งเสริมความหลากหลายทางความคิด สนับสนุนกิจกรรมรอบด้าน และเป็นสื่อกลางระหว่างนักเรียนกับโรงเรียน
- 💚 ค่านิยมหลัก: ความเป็นกันเอง การรับฟังทุกเสียง ความโปร่งใส ความรับผิดชอb และความสนุกสนาน (Aloha Spirit)
- 🍍 สัญลักษณ์: ลิงสับปะรด (ลูลู่ LuLu) และลิงมะพร้าว (ลาล่า LaLa) แทนความเป็นฮาวาย สดใส และเป็นมิตร

**บุคลิกภาพ:**
- เป็นมิตร สนุกสนาน พร้อมช่วยเหลือ
- ตอบคำถามเกี่ยวกับนโยบายและสมาชิกจากข้อมูลที่ให้เท่านั้น
- ใช้ภาษาเป็นกันเอง

**ตอบเป็น JSON format (REQUIRED):**
{
  "THOUGHT": "วิเคราะห์คำถาม และวางแผนการตอบ อธิบายพอสังเขป",
  "ANSWER": "คำตอบ",
  "SUGGEST": ["คำถาม1", "คำถาม2", "คำถาม3"]
}

**กฎ SUGGEST (REQUIRED):**
1. SUGGEST ต้องมีเสมอ 3 ข้อ - ห้ามว่างเปล่า!
2. ต้องเกี่ยวกับพรรคฮูลัลลา/นโยบาย/สมาชิก/กิจกรรม เท่านั้น!
3. ห้าม suggest เรื่องทั่วไปที่ไม่เกี่ยวกับพรรค
4. ต้องเชื่อมโยงกับบทสนทนา - ถ้าพูดเรื่องนโยบาย ก็ suggest นโยบายอื่น
5. ตัวอย่างคำถามที่ถูกต้อง:
   - "นโยบายด้านอื่นมีอะไรอีก?"
   - "ประธานพรรคคือใคร?"
   - "อาจารย์ที่ปรึกษามีกี่คน?"
   - "เลือกตั้งวันไหน?"
   - "ติดตามพรรคได้ที่ไหน?"
   - "หัวหน้าฝ่ายต่างๆ มีใครบ้าง?"
6. ห้าม suggest: เรื่องส่วนตัว, เรื่องทั่วไป, เรื่องที่ไม่เกี่ยวกับพรรค
7. suggest ตาม format json ที่กำหนดเสมอ

**Format คำตอบ:**
- ใช้ **ข้อความ** สำหรับเน้นคำสำคัญ
- ใช้ emoji ให้เหมาะสม
- ใช้ bullet points ได้เช่น: • ข้อ 1
- สำหรับลิงก์ ให้ใช้ format: !$LINK$!ลิงก์นั้นๆ!$LINK$! หรือ !$LINK$!ข้อความ|ลิงก์นั้นๆ!$LINK$!

**ช่องทางติดต่อพรรค (เลือกใช้ตามบริบท):**
- 📸 Instagram: !$LINK$!Instagram พรรค|https://www.instagram.com/hulalla.hawaii!$LINK$!
- 🎵 TikTok: !$LINK$!TikTok พรรค|https://www.tiktok.com/@hulalla.hawaii!$LINK$!
- 🎬 YouTube: !$LINK$!YouTube พรรค|https://www.youtube.com/@hulalla.hawaii!$LINK$!
- 📧 Email: !$LINK$!อีเมลพรรค|mailto:hulalla.party@gmail.com!$LINK$!

**การให้ลิงก์/ช่องทางติดต่อ:**
- เลือกช่องทางตามบริบทของคำถาม
- ถ้าถาม "ติดตามได้ที่ไหน" → ให้ทุกช่องทาง
- ถ้าถาม "ดูวิดีโอ/คลิป" → ให้ YouTube หรือ TikTok
- ถ้าถาม "ดูรูป/ข่าวสาร" → ให้ Instagram
- ถ้าถาม "ติดต่อ/สอบถาม/ส่งข้อความ" → ให้ Email หรือ Instagram DM อย่าลืมใส่ลิงก์ตาม format ข้างบน
- ถ้าถาม IG ของสมาชิก → ให้ @username (ระบบแปลงเป็นลิงก์อัตโนมัติ)

${relevantPolicies.length > 0 ? `\n=== ข้อมูลนโยบายจากฐานข้อมูล (ใช้ข้อมูลนี้ตอบ) ===\n${relevantData}\n===` : '⚠️ ไม่พบนโยบายที่เกี่ยวข้อง'}
${membersInfo ? `\n=== ข้อมูลสมาชิกจากฐานข้อมูล (ใช้ข้อมูลนี้ตอบ) ===\n${membersInfo}\n===` : ''}`;

        try {
            const messages = [{ role: 'system', content: systemPrompt }];
            
            if (conversationSummary) {
                messages.push({ role: 'system', content: `สรุปบทสนทนา: ${conversationSummary}` });
            }
            
            messages.push(...recentMessages.slice(0, -1));
            messages.push({ role: 'user', content: message });
            
            // Select model: First question uses Llama (fast), then random
            let response = null;
            let lastError = null;
            let currentKey = getRandomApiKey();
            let selectedModel = isFirstQuestion ? GROQ_MODELS[0] : getRandomModel();
            
            // Try up to all models with different API keys
            const maxAttempts = GROQ_MODELS.length * GROQ_API_KEYS.length;
            
            for (let attempt = 0; attempt < maxAttempts; attempt++) {
                try {
                    response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${currentKey}`
                        },
                        body: JSON.stringify({
                            model: selectedModel.id,
                            messages: messages,
                            temperature: 0.3,
                            max_tokens: 2048
                        })
                    });
                    
                    if (response.ok) {
                        currentModel = selectedModel;
                        isFirstQuestion = false; // Next questions will be random
                        updateModelDisplay();
                        break;
                    } else if (response.status === 429) {
                        // Rate limited - switch BOTH API key AND model randomly
                        console.log(`429 Rate limited - switching key and model...`);
                        currentKey = getAlternativeApiKey(currentKey);
                        selectedModel = getRandomModel();
                        continue;
                    } else if (response.status === 400) {
                        // Bad request - likely model issue, try different model
                        console.log(`400 Bad Request on ${selectedModel.name} - trying different model...`);
                        currentKey = getAlternativeApiKey(currentKey);
                        selectedModel = getRandomModel();
                        continue;
                    } else {
                        lastError = response.status;
                        // Try different model and key
                        currentKey = getAlternativeApiKey(currentKey);
                        selectedModel = getRandomModel();
                        continue;
                    }
                } catch (e) {
                    lastError = e.message;
                    currentKey = getAlternativeApiKey(currentKey);
                    selectedModel = getRandomModel();
                    continue;
                }
            }
            
            if (!response || !response.ok) {
                if (lastError === 429) {
                    cooldownUntil = Date.now() + 30000;
                    throw new Error('API ถูกเรียกใช้บ่อยเกินไป กรุณารอ 30 วินาที');
                } else if (lastError === 400) {
                    throw new Error('เกิดข้อผิดพลาดกับ API (Error 400) - กรุณาลองใหม่อีกครั้ง');
                } else {
                    throw new Error(`เกิดข้อผิดพลาด (Error ${lastError})`);
                }
            }

            const data = await response.json();
            
            if (!data.choices?.[0]?.message) {
                throw new Error('ไม่สามารถสร้างคำตอบได้');
            }
            
            const rawText = data.choices[0].message.content;
            
            // Parse Response
            let thought = "วิเคราะห์คำถามและค้นหาข้อมูลที่เกี่ยวข้อง...";
            let answer = rawText;
            let suggestions = [];
            let isJsonParsed = false;

            try {
                let cleanText = rawText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
                let jsonMatch = cleanText.match(/\{[\s\S]*\}/);
                
                if (jsonMatch) {
                    try {
                        const jsonData = JSON.parse(jsonMatch[0]);
                        
                        if (jsonData.ANSWER) {
                            thought = jsonData.THOUGHT || thought;
                            answer = jsonData.ANSWER;
                            suggestions = jsonData.SUGGEST || [];
                            isJsonParsed = true;
                        }
                    } catch (parseError) {
                        // Try manual extraction
                        const thoughtMatch = rawText.match(/"THOUGHT"\s*:\s*"([\s\S]*?)"\s*,/);
                        if (thoughtMatch) {
                            thought = thoughtMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
                        }
                        
                        const answerMatch = rawText.match(/"ANSWER"\s*:\s*"([\s\S]*?)"\s*,?\s*"SUGGEST"/);
                        if (answerMatch) {
                            answer = answerMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
                            isJsonParsed = true;
                        }
                        
                        const suggestMatch = rawText.match(/"SUGGEST"\s*:\s*\[([\s\S]*?)\]/);
                        if (suggestMatch) {
                            const suggestItems = suggestMatch[1].match(/"([^"\\]*(\\.[^"\\]*)*)"/g);
                            if (suggestItems) {
                                suggestions = suggestItems.map(item => 
                                    item.slice(1, -1).replace(/\\n/g, '\n').replace(/\\"/g, '"')
                                );
                            }
                        }
                    }
                }
                
                if (!isJsonParsed && !rawText.trim().startsWith('{')) {
                    answer = rawText;
                } else if (!isJsonParsed) {
                    answer = '⚠️ ขออภัย ระบบมีปัญหา กรุณาลองถามใหม่';
                }
                
            } catch (e) {
                if (!rawText.trim().startsWith('{')) {
                    answer = rawText;
                } else {
                    answer = '⚠️ ขออภัย ระบบมีปัญหา กรุณาลองถามใหม่';
                }
            }

            // Update Bot Message
            updateBotMessage(botMsgDiv, thought, answer, suggestions);
            
            recentMessages.push({ role: 'assistant', content: answer });
            messageCount++;
            
            // Save AI response to Firebase
            saveChatMessage('assistant', answer, {
                thought_process: thought,
                suggestions: suggestions,
                model_used: currentModel.name,
                relevant_policies_count: relevantPolicies.length,
                has_member_info: relevantMembers !== null
            });
            
            // Track successful response with Analytics
            if (analytics) {
                analytics.logEvent('chat_response_success', {
                    session_id: sessionId,
                    model: currentModel.name,
                    response_length: answer.length,
                    has_suggestions: suggestions.length > 0
                });
            }
            
            if (messageCount >= 6 && recentMessages.length >= 4) {
                await summarizeConversation();
                messageCount = 0;
            }
            
        } catch (error) {
            console.error('Error:', error);
            
            // Track error with Analytics
            if (analytics) {
                analytics.logEvent('chat_error', {
                    session_id: sessionId,
                    error_message: error.message,
                    model_attempted: currentModel.name
                });
            }
            
            // Save error to Firebase
            if (database && sessionId) {
                database.ref('chat_sessions/' + sessionId + '/errors').push({
                    error: error.message,
                    timestamp: new Date().toISOString(),
                    model: currentModel.name
                }).catch(err => console.error('Failed to save error:', err));
            }
            
            // Show error message with retry button
            const errorStatus = error.message.match(/Error (\d+)/);
            const statusCode = errorStatus ? errorStatus[1] : null;
            
            // Create error message with retry button
            const msgWrapper = botMsgDiv.querySelector('.msg-wrapper');
            const errorHtml = `
                <div class="msg-content">
                    <div style="color: #ef4444; margin-bottom: 8px;">
                        <i class="fas fa-exclamation-circle"></i> ${escapeHtml(error.message)}
                    </div>
                    ${statusCode === '400' || error.message.includes('เกิดข้อผิดพลาด') ? 
                        `<button class="retry-btn" onclick="retryLastMessage()">
                            <i class="fas fa-redo"></i> ลองส่งอีกครั้ง
                        </button>` : ''}
                </div>
            `;
            msgWrapper.innerHTML = errorHtml;
            
            showError(error.message);
        }
        
        hideLoading();
        sendBtn.disabled = false;
        inputField.disabled = false;
        inputField.focus();
        updateSendButtonStyle();
        scrollToBottom();
    }

    // Retry last message function
    window.retryLastMessage = function() {
        const lastUserMessage = recentMessages[recentMessages.length - 1];
        if (lastUserMessage && lastUserMessage.role === 'user') {
            // Remove last user message from recentMessages
            recentMessages.pop();
            
            // Find and remove the error bot message
            const chatBox = document.getElementById('chat-box');
            const messages = chatBox.querySelectorAll('.message');
            if (messages.length >= 1) {
                // Remove last bot message (error message)
                messages[messages.length - 1].remove();
            }
            
            // Resend the message
            const inputField = document.getElementById('userInput');
            inputField.value = lastUserMessage.content;
            updateSendButtonStyle();
            sendMessage();
        }
    };

    // Message UI Functions
    function addUserMessage(text) {
        const chatBox = document.getElementById('chat-box');
        const div = document.createElement('div');
        div.className = 'message user-message';
        div.innerHTML = `<div class="msg-content">${escapeHtml(text)}</div>`;
        chatBox.appendChild(div);
        scrollToBottom();
    }

    function addBotMessage() {
        const chatBox = document.getElementById('chat-box');
        const div = document.createElement('div');
        div.className = 'message bot-message';
        div.innerHTML = `
            <div class="bot-avatar"><img src="./ai_logo.png" style="width: 100%;border-radius: 12px;"></div>
            <div class="msg-wrapper">
                <div class="msg-content">
                    <div class="typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            </div>
        `;
        chatBox.appendChild(div);
        scrollToBotMessage(div);
        return div;
    }

    function updateBotMessage(div, thought, answer, suggestions) {
        const msgId = 'thought-' + Date.now();
        const msgWrapper = div.querySelector('.msg-wrapper');
        
        // Scroll to show the beginning of the message
        setTimeout(() => scrollToBotMessage(div), 100);
        
        msgWrapper.innerHTML = `
            <div class="msg-content">
                <div class="thought-toggle" onclick="toggleThought('${msgId}')">
                    <i class="fas fa-lightbulb"></i> ดูกระบวนการคิด
                </div>
                <div id="${msgId}" class="thought-process">${escapeHtml(thought)}</div>
                <div class="answer-content">${formatText(answer)}</div>
                ${createSuggestions(suggestions)}
                <div class="model-badge">
                    <i class="fas fa-microchip"></i> ${currentModel.name}
                </div>
            </div>
        `;
    }

    function createSuggestions(suggestions) {
        if (!suggestions?.length) return '';
        
        let html = '<div class="suggestions">';
        suggestions.forEach(question => {
            const escaped = escapeHtml(question).replace(/'/g, "\\'");
            html += `<div class="suggestion-chip" onclick="askQuestion('${escaped}')">
                <i class="fas fa-comment"></i> ${escapeHtml(question)}
            </div>`;
        });
        html += '</div>';
        return html;
    }

    function askQuestion(question) {
        // Track suggestion click with Analytics
        if (analytics) {
            analytics.logEvent('suggestion_click', {
                session_id: sessionId,
                suggestion_text: question
            });
        }
        
        document.getElementById('userInput').value = question;
        sendMessage();
    }

    function toggleThought(id) {
        const thoughtDiv = document.getElementById(id);
        const toggleBtn = thoughtDiv.previousElementSibling;
        
        if (thoughtDiv.classList.contains('expanded')) {
            thoughtDiv.classList.remove('expanded');
            toggleBtn.innerHTML = '<i class="fas fa-lightbulb"></i> ดูกระบวนการคิด';
        } else {
            thoughtDiv.classList.add('expanded');
            toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i> ซ่อน';
        }
    }

    function scrollToBottom() {
        const chatBox = document.getElementById('chat-box');
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function scrollToBotMessage(botDiv) {
        // Scroll to show the beginning of bot message, not the bottom
        if (botDiv) {
            botDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    function formatText(text) {
        let formatted = escapeHtml(text);
        
        // Convert link syntax - Support multiple formats:
        // !$LINK$!text|url!$LINK$! or !$LINK$!text|url!$LINK$ (with or without ending !)
        // Pattern with text|url format - make ending ! optional
        formatted = formatted.replace(/[!{]*\$?LINK\$!([^|!$]+)\|([^!$]+)!?\$?LINK\$!?[}]?/g, '<a href="javascript:void(0)" onclick="openExternalLink(\'$2\')" class="chat-link"><i class="fas fa-external-link-alt"></i> $1</a>');
        
        // Pattern with just url format - make ending ! optional
        formatted = formatted.replace(/[!{]*\$?LINK\$!([^|!$]+)!?\$?LINK\$!?[}]?/g, (match, url) => {
            // Extract domain for display
            let displayText = url;
            try {
                const urlObj = new URL(url);
                displayText = urlObj.hostname.replace('www.', '');
            } catch (e) {
                displayText = url.length > 30 ? url.substring(0, 30) + '...' : url;
            }
            const escapedUrl = url.replace(/'/g, "\\'");
            return `<a href="javascript:void(0)" onclick="openExternalLink('${escapedUrl}')" class="chat-link"><i class="fas fa-external-link-alt"></i> ${displayText}</a>`;
        });
        
        // Auto-detect Instagram links from @username format
        // Only match @username that is NOT part of email or URL
        // Must be at start of line, after space, or after specific characters
        formatted = formatted.replace(/(?:^|[\s,;:!?(\[])@([a-zA-Z0-9._]{3,30})(?![a-zA-Z0-9._]*\.com|[a-zA-Z0-9._]*\.co|[a-zA-Z0-9._]*@)/gm, (match, username) => {
            // Skip if looks like email domain
            if (username.includes('gmail') || username.includes('hotmail') || username.includes('yahoo') || username.includes('outlook')) {
                return match;
            }
            const igUrl = `https://www.instagram.com/${username}`;
            const prefix = match.charAt(0) === '@' ? '' : match.charAt(0);
            return `${prefix}<a href="javascript:void(0)" onclick="openExternalLink('${igUrl}')" class="chat-link ig-link"><i class="fab fa-instagram"></i> @${username}</a>`;
        });
        
        // Bold text
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/__(.*?)__/g, '<strong>$1</strong>');
        
        // Bullet points with proper styling
        formatted = formatted.replace(/^([•\-\*]|\d+\.) (.+)$/gm, '<div class="list-item">$1 $2</div>');
        
        // Line breaks - use span instead of br for better control
        formatted = formatted.replace(/\n\n+/g, '</p><p class="msg-paragraph">');
        formatted = formatted.replace(/\n/g, '<br>');
        formatted = '<p class="msg-paragraph">' + formatted + '</p>';
        
        return formatted;
    }

    // Open external link with SweetAlert warning
    function openExternalLink(url) {
        // Track link click with Analytics
        if (analytics) {
            analytics.logEvent('external_link_click', {
                session_id: sessionId,
                url: url,
                timestamp: new Date().toISOString()
            });
        }
        
        let siteName = 'เว็บไซต์ภายนอก';
        let icon = 'fas fa-external-link-alt';
        let iconColor = '#38b6ff';
        
        if (url.includes('instagram.com')) {
            siteName = 'Instagram';
            icon = 'fab fa-instagram';
            iconColor = '#e440e4';
        } else if (url.includes('tiktok.com')) {
            siteName = 'TikTok';
            icon = 'fab fa-tiktok';
            iconColor = '#000000';
        } else if (url.includes('youtube.com')) {
            siteName = 'YouTube';
            icon = 'fab fa-youtube';
            iconColor = '#FF0000';
        } else if (url.includes('facebook.com')) {
            siteName = 'Facebook';
            icon = 'fab fa-facebook';
            iconColor = '#1877F2';
        }
        
        Swal.fire({
            title: 'กำลังจะออกจากเว็บไซต์พรรค',
            html: `
                <div style="font-size: 3rem; margin-bottom: 15px; color: ${iconColor};">
                    <i class="${icon}"></i>
                </div>
                <p>คุณกำลังจะไปยัง <strong>${siteName}</strong></p>
                <p style="font-size: 0.85rem; color: #64748b; margin-top: 8px;">ลิงก์นี้อยู่นอกเหนือการควบคุมของพรรคฮูลัลลา</p>
            `,
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#38b6ff',
            cancelButtonColor: '#64748b',
            confirmButtonText: '<i class="fas fa-external-link-alt"></i> ไปเลย',
            cancelButtonText: 'ยกเลิก',
            background: document.documentElement.getAttribute('data-theme') === 'light' ? '#ffffff' : '#1e293b',
            color: document.documentElement.getAttribute('data-theme') === 'light' ? '#1e293b' : '#f1f5f9',
        }).then((result) => {
            if (result.isConfirmed) {
                window.open(url, '_blank');
            }
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Load Initial Suggestions
    async function loadInitialSuggestions() {
        try {
            let currentKey = getRandomApiKey();
            
            // Try to find a working model with random API key
            for (const model of GROQ_MODELS) {
                for (let keyAttempt = 0; keyAttempt < GROQ_API_KEYS.length; keyAttempt++) {
                    try {
                        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                            method: 'POST',
                            headers: { 
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${currentKey}`
                            },
                            body: JSON.stringify({
                                model: model.id,
                                messages: [
                                    { role: 'system', content: `สร้าง 4 คำถามแนะนำสั้นๆ เกี่ยวกับพรรคฮูลัลลา เบอร์ 3 โรงเรียนสาธิต มข.
ตอบเป็น JSON ให้เกี่ยวกับพรรคฮูลัลลา นโยบาย สมาชิก อาจารย์ : {"SUGGEST": ["คำถาม1", "คำถาม2", "คำถาม3", "คำถาม4"]}` },
                                    { role: 'user', content: 'สร้างคำถามแนะนำ' }
                                ],
                                temperature: 0.8,
                                max_tokens: 256
                            })
                        });

                        if (response.ok) {
                            currentModel = model;
                            updateModelDisplay();
                            
                            const data = await response.json();
                            const rawText = data.choices[0].message.content;
                            
                            let jsonMatch = rawText.match(/\{[\s\S]*\}/);
                            if (jsonMatch) {
                                const jsonData = JSON.parse(jsonMatch[0]);
                                const container = document.getElementById('initial-suggestions');
                                if (container && jsonData.SUGGEST) {
                                    container.innerHTML = jsonData.SUGGEST.map(q => `
                                        <div class="suggestion-chip" onclick="askQuestion('${escapeHtml(q).replace(/'/g, "\\'")}')">
                                            <i class="fas fa-comment"></i> ${escapeHtml(q)}
                                        </div>
                                    `).join('');
                                }
                            }
                            return; // Success, exit
                        } else if (response.status === 429) {
                            // Rate limited, try different key
                            currentKey = getAlternativeApiKey(currentKey);
                            continue;
                        } else {
                            break; // Move to next model
                        }
                    } catch (e) {
                        console.log(`Model ${model.name} failed, trying next...`);
                        currentKey = getAlternativeApiKey(currentKey);
                        continue;
                    }
                }
            }
            
            // If all models fail, use fallback
            throw new Error('All models failed');
            
        } catch (error) {
            console.error('Failed to load AI suggestions:', error);
            // Keep the default HTML suggestions - no need to replace
            // User already has working suggestions from HTML
            console.log('✅ Using default suggestions from HTML');
            updateModelDisplay();
        }
    }

    // Update model display in UI
    function updateModelDisplay() {
        const modelNameEl = document.getElementById('model-name');
        if (modelNameEl) {
            modelNameEl.textContent = `HLL x ${currentModel.name}`;
        }
    }

    // Update send button style based on input
    function updateSendButtonStyle() {
        const inputField = document.getElementById('userInput');
        const sendBtn = document.getElementById('send-btn');
        
        if (inputField.value.trim().length > 0) {
            sendBtn.classList.add('has-text');
        } else {
            sendBtn.classList.remove('has-text');
        }
    }

    // Event Listeners
    const userInputField = document.getElementById("userInput");
    
    userInputField.addEventListener("keyup", function(event) {
        if (event.key === "Enter") sendMessage();
    });
    
    userInputField.addEventListener("input", function() {
        updateSendButtonStyle();
    });

    // Initialize
    window.addEventListener('load', async () => {
        // Initialize chat session
        initializeSession();
        
        await Promise.all([loadPolicies(), loadMembers()]);
        hideLoading();
        updateQuestionCounterDisplay(); // Show question count on load
        await loadInitialSuggestions();
        userInputField.focus();
        updateSendButtonStyle(); // Initialize button style
        
        // Track page view
        if (analytics) {
            analytics.logEvent('page_view', {
                page_title: 'Chat with LuLu',
                page_location: window.location.href
            });
        }
    });

    // Track session end when user leaves
    window.addEventListener('beforeunload', () => {
        if (analytics && sessionId) {
            analytics.logEvent('chat_session_end', {
                session_id: sessionId,
                duration_seconds: Math.floor((Date.now() - new Date(sessionStartTime).getTime()) / 1000),
                total_messages: messageCount
            });
        }
        
        // Update session end time in Firebase
        if (database && sessionId) {
            database.ref('chat_sessions/' + sessionId + '/ended_at').set(new Date().toISOString());
        }
    });