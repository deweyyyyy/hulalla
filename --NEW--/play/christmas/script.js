  
        // Firebase Configuration
        const firebaseConfig = window.HLL_KEYS.firebase;
        
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        const database = firebase.database();
        
        // Initialize Analytics (if available)
        let analytics = null;
        if (typeof firebase.analytics === 'function') {
            analytics = firebase.analytics();
        }
        
        // Log analytics event helper
        function logEvent(eventName, params = {}) {
            if (analytics) {
                analytics.logEvent(eventName, params);
            }
        }
        
        // Available Ornaments
        const ORNAMENTS = [
            '⭐', '3️⃣', '🌸', '💍', '🍍', '☃️', '🎄', '🎁', '🎀', '🔔',
            '🎶', '❄️', '🌟', '✨', '🎊', '🎉', '🧦', '🕯️', '🍪', '🥛',
            '🍬', '🍭', '🧁', '🎂', '❤️', '💚', '💛', '💙', '💜', '🩷'
        ];
        
        // Ornament positions on tree (percentage based)
        const ORNAMENT_POSITIONS = [
            { top: '12%', left: '47%' },
            { top: '20%', left: '35%' },
            { top: '20%', left: '60%' },
            { top: '28%', left: '25%' },
            { top: '28%', left: '50%' },
            { top: '28%', left: '72%' },
            { top: '38%', left: '18%' },
            { top: '38%', left: '40%' },
            { top: '38%', left: '60%' },
            { top: '38%', left: '80%' },
            { top: '50%', left: '12%' },
            { top: '50%', left: '32%' },
            { top: '50%', left: '50%' },
            { top: '50%', left: '68%' },
            { top: '50%', left: '86%' },
            { top: '62%', left: '8%' },
            { top: '62%', left: '25%' },
            { top: '62%', left: '42%' },
            { top: '62%', left: '58%' },
            { top: '62%', left: '75%' },
            { top: '62%', left: '92%' },
            { top: '75%', left: '5%' },
            { top: '75%', left: '20%' },
            { top: '75%', left: '35%' },
            { top: '75%', left: '50%' },
            { top: '75%', left: '65%' },
            { top: '75%', left: '80%' },
            { top: '75%', left: '95%' }
        ];
        
        // App State
        let currentTreeId = null;
        let currentTreeData = null;
        let decorations = [];
        let isMusicPlaying = false;
        
        // Christmas Music URLs (royalty-free)
        const CHRISTMAS_MUSIC_URL = 'https://firebasestorage.googleapis.com/v0/b/i-dewey-world.appspot.com/o/TbwP4wPNumUuN8yMrAcVAHZAaus2%2F52KQSMC9W%2Fchristmas-holiday-festive-cheer-snow-427231.mp3?alt=media';
        
        // Initialize music
        function initMusic() {
            const bgMusic = document.getElementById('bgMusic');
            bgMusic.src = CHRISTMAS_MUSIC_URL;
            bgMusic.volume = 0.3;
        }
        
        // Toggle music play/pause
        function toggleMusic() {
            const bgMusic = document.getElementById('bgMusic');
            const musicIcon = document.getElementById('musicIcon');
            const musicControl = document.getElementById('musicControl');
            
            if (isMusicPlaying) {
                bgMusic.pause();
                musicIcon.className = 'fa-solid fa-volume-xmark';
                musicControl.classList.remove('playing');
                isMusicPlaying = false;
            } else {
                bgMusic.play().then(() => {
                    musicIcon.className = 'fa-solid fa-volume-high';
                    musicControl.classList.add('playing');
                    isMusicPlaying = true;
                }).catch(err => {
                    console.log('Music play failed:', err);
                    showToast('คลิกอีกครั้งเพื่อเล่นเพลง 🎵');
                });
            }
        }
        
        // Toggle How To Play section
        function toggleHowToPlay(element) {
            element.classList.toggle('expanded');
        }
        
        function generateTreeId() {
            return 'tree_' + Math.random().toString(36).substr(2, 9);
        }
        
        function getTreeIdFromURL() {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('id');
        }
        
        function showToast(message) {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }
        
        function formatTimeAgo(timestamp) {
            const now = Date.now();
            const diff = now - timestamp;
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(diff / 3600000);
            const days = Math.floor(diff / 86400000);
            
            if (minutes < 1) return 'เมื่อสักครู่';
            if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
            if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
            return `${days} วันที่แล้ว`;
        }
        
        // ========================================
        // SNOW EFFECT
        // ========================================
        
        function createSnowflakes() {
            const container = document.getElementById('snowContainer');
            const snowflakes = ['❄', '❅', '❆', '✻', '✼', '❉', '•'];
            
            for (let i = 0; i < 50; i++) {
                const snowflake = document.createElement('div');
                snowflake.className = 'snowflake';
                snowflake.innerHTML = snowflakes[Math.floor(Math.random() * snowflakes.length)];
                snowflake.style.left = Math.random() * 100 + '%';
                snowflake.style.animationDuration = (Math.random() * 10 + 10) + 's';
                snowflake.style.animationDelay = Math.random() * 10 + 's';
                snowflake.style.fontSize = (Math.random() * 10 + 8) + 'px';
                snowflake.style.opacity = Math.random() * 0.6 + 0.4;
                container.appendChild(snowflake);
            }
        }
        
        // ========================================
        // CONFETTI EFFECT
        // ========================================
        
        function fireConfetti() {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#c41e3a', '#1a472a', '#ffd700', '#ffffff']
            });
        }
        
        // ========================================
        // TREE COUNT FUNCTIONS
        // ========================================
        
        async function loadTreeCount() {
            try {
                const snapshot = await database.ref('trees').once('value');
                const trees = snapshot.val();
                const treeCount = trees ? Object.keys(trees).length : 0;
                
                // Calculate total decorations
                const decoSnapshot = await database.ref('decorations').once('value');
                const decorations = decoSnapshot.val();
                let totalDecorations = 0;
                if (decorations) {
                    Object.keys(decorations).forEach(treeId => {
                        const treeDeco = decorations[treeId];
                        if (treeDeco) {
                            totalDecorations += Object.keys(treeDeco).length;
                        }
                    });
                }
                
                // Update UI
                const statsContainer = document.getElementById('treeStats');
                if (statsContainer) {
                    statsContainer.innerHTML = `
                        <div class="stats-box">
                            <div class="stat-item">
                                <span class="stat-icon">🎄</span>
                                <span class="stat-value">${treeCount.toLocaleString()}</span>
                                <span class="stat-label">ต้นคริสต์มาสถูกสร้าง</span>
                            </div>
                            <div class="stat-divider"></div>
                            <div class="stat-item">
                                <span class="stat-icon">✨</span>
                                <span class="stat-value">${totalDecorations.toLocaleString()}</span>
                                <span class="stat-label">ของตกแต่งที่ถูกเพิ่ม</span>
                            </div>
                        </div>
                    `;
                }
            } catch (error) {
                console.error('Error loading tree count:', error);
                const statsContainer = document.getElementById('treeStats');
                if (statsContainer) {
                    statsContainer.innerHTML = '';
                }
            }
        }
        
        // Increment view count for a tree
        function incrementTreeViews(treeId) {
            // Use transaction to safely increment
            const viewsRef = database.ref(`trees/${treeId}/views`);
            viewsRef.transaction((currentViews) => {
                return (currentViews || 0) + 1;
            }).catch(err => {
                console.log('Could not increment views:', err);
            });
        }
        
        // ========================================
        // RENDERING FUNCTIONS
        // ========================================
        
        function renderLandingPage() {
            const container = document.getElementById('appContainer');
            container.innerHTML = `
                <a href="/play/" class="back-btn" title="กลับหน้ารวมเกม">
                    <i class="fa-solid fa-arrow-left"></i>
                </a>
                <div class="landing-container">
                    <div class="landing-tree">🎄</div>
                    <h1 class="landing-title">Deco a Christmas Tree</h1>
                    <h3 class="landing-title2">by HULALLA #3</h3>
                    <p class="landing-subtitle">
                        สร้างต้นคริสต์มาสของคุณเอง แล้วให้เพื่อนๆ มาตกแต่งและส่งข้อความอวยพร
                    </p>
                    <div class="tree-stats" id="treeStats">
                        <div class="stat-loading">
                            <i class="fa-solid fa-spinner fa-spin"></i>
                        </div>
                    </div>
                    <div class="landing-buttons">
                        <button class="btn-landing btn-create" onclick="showCreateTreeModal()">
                            <i class="fa-solid fa-tree"></i> สร้างต้นคริสต์มาสของฉัน
                        </button>
                        <button class="btn-landing btn-visit" onclick="showVisitTreeModal()">
                            <i class="fa-solid fa-link"></i> เยี่ยมชมต้นคริสต์มาสเพื่อน
                        </button>
                    </div>
                    
                    <div class="how-to-play" onclick="toggleHowToPlay(this)">
                        <h3 class="how-to-title">
                            <i class="fa-solid fa-circle-question"></i>
                            <span>วิธีเล่น</span>
                            <i class="fa-solid fa-chevron-down how-to-arrow"></i>
                        </h3>
                        <div class="how-to-steps">
                            <div class="step-item">
                                <div class="step-number">1</div>
                                <div class="step-content">
                                    <div class="step-title">สร้างต้นไม้</div>
                                    <div class="step-desc">กดปุ่ม "สร้างต้นคริสต์มาสของฉัน" แล้วตั้งชื่อ</div>
                                </div>
                            </div>
                            <div class="step-item">
                                <div class="step-number">2</div>
                                <div class="step-content">
                                    <div class="step-title">แชร์ให้เพื่อน</div>
                                    <div class="step-desc">คัดลอกลิงก์หรือบันทึกรูปแล้วส่งให้เพื่อนๆ</div>
                                </div>
                            </div>
                            <div class="step-item">
                                <div class="step-number">3</div>
                                <div class="step-content">
                                    <div class="step-title">เพื่อนมาตกแต่ง</div>
                                    <div class="step-desc">เพื่อนๆ เลือกของตกแต่งและเขียนข้อความอวยพร</div>
                                </div>
                            </div>
                            <div class="step-item">
                                <div class="step-number">4</div>
                                <div class="step-content">
                                    <div class="step-title">ดูข้อความ</div>
                                    <div class="step-desc">กลับมาดูต้นไม้ของคุณที่เพื่อนๆ มาตกแต่ง!</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="footer">
                    Made by <a href="/">Hulalla #3</a> | 🎄 Merry Christmas 2025<br>
                    <a href="https://decomytree.com" target="_blank" rel="noopener noreferrer">Inspired by https://decomytree.com</a>
                </div>
            `;
            
            // Load and display tree count
            loadTreeCount();
        }
        
        function renderTreePage(treeData, ornaments, isLocked = false) {
            const container = document.getElementById('appContainer');
            const ornamentCount = ornaments.length;
            const hasPin = !!treeData.pin;
            
            // Messages section HTML based on lock status
            let messagesHtml = '';
            if (hasPin && isLocked) {
                messagesHtml = `
                    <div class="messages-section">
                        <div class="section-header">
                            <h3 class="section-title">
                                <i class="fa-solid fa-lock"></i> ข้อความอวยพร
                            </h3>
                            <span class="view-all" id="messageCount">${ornamentCount} ข้อความ</span>
                        </div>
                        <div class="locked-messages" style="
                            background: var(--glass-light);
                            backdrop-filter: blur(20px);
                            border-radius: var(--radius-lg);
                            border: 1px solid rgba(255, 255, 255, 0.15);
                            padding: 30px 20px;
                            text-align: center;
                        ">
                            <div style="font-size: 3rem; margin-bottom: 15px;">🔐</div>
                            <h3 style="font-size: 1.1rem; margin-bottom: 10px;">ข้อความถูกล็อค</h3>
                            <p style="color: rgba(255,255,255,0.7); font-size: 0.9rem; margin-bottom: 20px;">
                                กรอก PIN 4 หลักเพื่อดูข้อความอวยพร
                            </p>
                            <button class="btn btn-primary" onclick="showUnlockModal()" style="width: auto; padding: 12px 30px;">
                                <i class="fa-solid fa-key"></i> ปลดล็อค
                            </button>
                        </div>
                    </div>
                `;
            } else {
                messagesHtml = `
                    <div class="messages-section">
                        <div class="section-header">
                            <h3 class="section-title">
                                <i class="fa-solid fa-envelope"></i> ข้อความอวยพร
                            </h3>
                            <span class="view-all" id="messageCount">${ornamentCount} ข้อความ</span>
                        </div>
                        <div class="messages-list" id="messagesList">
                            <!-- Messages will be rendered here -->
                        </div>
                    </div>
                `;
            }
            
            container.innerHTML = `
                <header class="header">
                    <h1 class="header-title">Deco a Christmas Tree</h1>
                    <p class="header-subtitle">ตกแต่งต้นคริสต์มาสและส่งความสุข</p>
                </header>
                
                <div class="owner-card">
                    <div class="owner-avatar">🎅</div>
                    <div class="owner-info">
                        <h2>${treeData.ownerName}'s Tree ${hasPin ? '<i class="fa-solid fa-shield-halved" style="font-size: 0.8rem; color: var(--christmas-gold);"></i>' : ''}</h2>
                        <p>สร้างเมื่อ ${new Date(treeData.createdAt).toLocaleDateString('th-TH')}</p>
                    </div>
                    <div class="owner-stats">
                        <div class="stat-number" id="ornamentCount">${ornamentCount}</div>
                        <div class="stat-label">ของตกแต่ง</div>
                    </div>
                </div>
                
                <div class="tree-section">
                    <div class="tree-star">⭐</div>
                    <div class="tree-container">
                        <svg class="tree-svg" viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg">
                            <!-- Tree layers -->
                            <polygon points="100,10 130,60 70,60" fill="#2d5a3f"/>
                            <polygon points="100,30 145,90 55,90" fill="#3d7a55"/>
                            <polygon points="100,55 160,130 40,130" fill="#2d5a3f"/>
                            <polygon points="100,85 175,170 25,170" fill="#3d7a55"/>
                            <polygon points="100,115 190,210 10,210" fill="#2d5a3f"/>
                            <!-- Snow on tree -->
                            <ellipse cx="100" cy="10" rx="8" ry="3" fill="#fff" opacity="0.8"/>
                            <ellipse cx="85" cy="60" rx="10" ry="3" fill="#fff" opacity="0.6"/>
                            <ellipse cx="115" cy="60" rx="8" ry="3" fill="#fff" opacity="0.6"/>
                            <ellipse cx="70" cy="130" rx="12" ry="4" fill="#fff" opacity="0.5"/>
                            <ellipse cx="130" cy="130" rx="10" ry="3" fill="#fff" opacity="0.5"/>
                            <!-- Tree trunk -->
                            <rect x="85" y="210" width="30" height="35" fill="#654321" rx="3"/>
                        </svg>
                        <div class="ornaments-container" id="ornamentsContainer">
                            <!-- Ornaments will be rendered here -->
                        </div>
                    </div>
                    <div class="tree-trunk"></div>
                    <div class="presents-row">
                        <span class="present">🎁</span>
                        <span class="present">🎀</span>
                        <span class="present">🎁</span>
                    </div>
                </div>
                
                <div class="deco-counter">
                    <i class="fa-solid fa-gift"></i>
                    <span><span id="decoCount">มีของตกแต่งแล้ว ${ornamentCount}</span> ชิ้น</span>
                </div>
                
                <div class="action-buttons">
                    <button class="btn btn-primary" onclick="showDecorationModal()">
                        <i class="fa-solid fa-wand-magic-sparkles"></i> เพิ่มของตกแต่ง
                    </button>
                    <button class="btn btn-secondary" onclick="shareTree()">
                        <i class="fa-solid fa-share-nodes"></i> แชร์
                    </button>
                </div>
                
                ${messagesHtml}

                                
                <div class="action-buttons" style="margin-top: 52px;">
                    <button class="btn btn-secondary" onclick="showCreateTreeModal()" style="background: linear-gradient(135deg, var(--christmas-green) 0%, var(--christmas-green-light) 100%); border: none;">
                        <i class="fa-solid fa-tree"></i> สร้างต้นคริสต์มาสของคุณ
                    </button>
                </div>
                                <div class="how-to-play" onclick="toggleHowToPlay(this)">
                    <h3 class="how-to-title">
                        <i class="fa-solid fa-circle-question"></i>
                        <span>วิธีเล่น</span>
                        <i class="fa-solid fa-chevron-down how-to-arrow"></i>
                    </h3>
                    <div class="how-to-steps">
                        <div class="step-item">
                            <div class="step-number">1</div>
                            <div class="step-content">
                                <div class="step-title">เลือกของตกแต่ง</div>
                                <div class="step-desc">กดปุ่ม "เพิ่มของตกแต่ง" แล้วเลือก emoji ที่ชอบ</div>
                            </div>
                        </div>
                        <div class="step-item">
                            <div class="step-number">2</div>
                            <div class="step-content">
                                <div class="step-title">เขียนข้อความ</div>
                                <div class="step-desc">ใส่ชื่อและเขียนข้อความอวยพรให้เจ้าของต้นไม้</div>
                            </div>
                        </div>
                        <div class="step-item">
                            <div class="step-number">3</div>
                            <div class="step-content">
                                <div class="step-title">ส่งความสุข</div>
                                <div class="step-desc">ของตกแต่งจะปรากฏบนต้นไม้ทันที!</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <a href="/play/" class="more-games-link">
                    <i class="fa-solid fa-gamepad"></i>
                    <span>มินิเกมและกิจกรรมอื่นๆ</span>
                    <i class="fa-solid fa-chevron-right"></i>
                </a>
                
                <div class="footer">
                    Made by <a href="/">Hulalla #3</a> | 🎄 Merry Christmas 2025<br>
                    <a href="https://decomytree.com" target="_blank" rel="noopener noreferrer">Inspired by https://decomytree.com</a>
                </div>
            `;
            
            renderOrnaments(ornaments);
            if (!isLocked) {
                renderMessages(ornaments);
            }
        }
        
        function renderOrnaments(ornaments) {
            const container = document.getElementById('ornamentsContainer');
            if (!container) return;
            
            container.innerHTML = '';
            
            ornaments.forEach((ornament, index) => {
                if (index >= ORNAMENT_POSITIONS.length) return;
                
                const pos = ORNAMENT_POSITIONS[index];
                const div = document.createElement('div');
                div.className = 'ornament';
                div.style.top = pos.top;
                div.style.left = pos.left;
                div.style.animationDelay = `${index * 0.1}s`;
                
                // Truncate message for tooltip
                const truncatedMsg = ornament.message.length > 50 
                    ? ornament.message.substring(0, 50) + '...' 
                    : ornament.message;
                
                div.innerHTML = `
                    <span class="ornament-icon">${ornament.icon}</span>
                    <div class="ornament-tooltip">
                        <div class="tooltip-author">${ornament.senderName}</div>
                        <div class="tooltip-message">${truncatedMsg}</div>
                    </div>
                `;
                div.onclick = () => showOrnamentDetail(ornament);
                container.appendChild(div);
            });
        }
        
        function renderMessages(ornaments) {
            const container = document.getElementById('messagesList');
            if (!container) return;
            
            if (ornaments.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fa-solid fa-tree"></i>
                        <h3>ยังไม่มีข้อความ</h3>
                        <p>เป็นคนแรกที่ตกแต่งต้นคริสต์มาสนี้!</p>
                    </div>
                `;
                return;
            }
            
            // Show latest messages first
            const sortedOrnaments = [...ornaments].sort((a, b) => b.timestamp - a.timestamp);
            
            container.innerHTML = sortedOrnaments.slice(0, 999).map(ornament => `
                <div class="message-card animate__animated animate__fadeInUp">
                    <div class="message-header">
                        <span class="message-ornament">${ornament.icon}</span>
                        <span class="message-author">${ornament.senderName}</span>
                        <span class="message-time">${formatTimeAgo(ornament.timestamp)}</span>
                    </div>
                    <p class="message-content">${ornament.message}</p>
                </div>
            `).join('');
        }
        
        // ========================================
        // MODALS
        // ========================================
        
        function showCreateTreeModal() {
            Swal.fire({
                title: '🎄 สร้างต้นคริสต์มาส',
                html: `
                    <div class="create-tree-form">
                        <div class="form-group">
                            <label><i class="fa-solid fa-user" style="color: #c41e3a;"></i> ชื่อของคุณ</label>
                            <input type="text" id="ownerName" placeholder="ใส่ชื่อที่จะแสดงบนต้นคริสต์มาส" maxlength="33" style="font-size: 0.9rem;">
                            <p style="font-size: 0.75rem; color: #888; margin-top: 5px;">
                                ชื่อนี้จะแสดงเป็น "[ ชื่อที่กรอก ]'s Tree"
                            </p>
                        </div>
                        
                        <div class="form-group" style="background: rgba(0,0,0,0.03); padding: 10px; border-radius: 12px; margin-top: 9px;">
                            <label style="margin-bottom: 8px;"><i class="fa-solid fa-link" style="color: #2d5a3f;"></i> ลิงก์ของคุณ <span style="font-size: 0.75rem; color: #888; font-weight: normal;">(ไม่บังคับ)</span></label>
                            <div style="background: rgba(255,255,255,0.8); padding: 10px 12px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #e5e7eb;">
                                <p style="font-size: 0.55rem; color: #666; margin: 0; font-family: monospace; word-break: break-all;">
                                    https://hulalla.party/play/christmas?id=<span id="customIdPreview" style="color: #888; font-weight: 600; transition: color 0.2s;">___</span>
                                </p>
                            </div>
                            <input type="text" id="customTreeId" placeholder="พิมพ์ ID ที่ต้องการ เช่น myname" maxlength="30" style="font-family: monospace; font-size: 0.9rem;">
                            <div id="customIdStatus" style="font-size: 0.7rem; margin-top: 8px; min-height: 22px;"></div>
                            <p style="font-size: 0.6rem; color: #999; margin-top: 5px; margin-bottom: 0;">
                                💡 ใช้ได้เฉพาะ a-z, 0-9 และ - (ถ้าไม่กรอก ระบบจะสุ่มให้)
                            </p>
                        </div>
                        
                        <div class="toggle-container" style="margin-top: 9px; background: rgba(0,0,0,0.03); padding: 10px 12px; border-radius: 12px;">
                            <span class="toggle-label">
                                <i class="fa-solid fa-lock" style="color: #f59e0b;"></i>
                                <span>ล็อกข้อความด้วย PIN</span>
                            </span>
                            <label class="toggle-switch">
                                <input type="checkbox" id="enablePin" onchange="togglePinSection()">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        
                        <div class="pin-section" id="pinSection">
                            <p style="font-size: 0.85rem; color: #666; margin-bottom: 12px; text-align: center;">
                                🔐 เฉพาะคนที่กรอก PIN ถูกเท่านั้นจึงอ่านข้อความได้
                            </p>
                            <div class="pin-container">
                                <input type="text" class="pin-box" id="pin1" maxlength="1" inputmode="numeric" pattern="[0-9]" placeholder="•">
                                <input type="text" class="pin-box" id="pin2" maxlength="1" inputmode="numeric" pattern="[0-9]" placeholder="•">
                                <input type="text" class="pin-box" id="pin3" maxlength="1" inputmode="numeric" pattern="[0-9]" placeholder="•">
                                <input type="text" class="pin-box" id="pin4" maxlength="1" inputmode="numeric" pattern="[0-9]" placeholder="•">
                            </div>
                        </div>
                    </div>
                `,
                didOpen: () => {
                    // Setup PIN box navigation
                    const pinBoxes = document.querySelectorAll('.pin-box');
                    pinBoxes.forEach((box, index) => {
                        box.addEventListener('input', (e) => {
                            // Only allow numbers
                            e.target.value = e.target.value.replace(/[^0-9]/g, '');
                            
                            if (e.target.value && index < pinBoxes.length - 1) {
                                pinBoxes[index + 1].focus();
                            }
                        });
                        
                        box.addEventListener('keydown', (e) => {
                            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                                pinBoxes[index - 1].focus();
                            }
                        });
                        
                        // Handle paste
                        box.addEventListener('paste', (e) => {
                            e.preventDefault();
                            const paste = (e.clipboardData || window.clipboardData).getData('text');
                            const digits = paste.replace(/[^0-9]/g, '').slice(0, 4);
                            digits.split('').forEach((digit, i) => {
                                if (pinBoxes[i]) pinBoxes[i].value = digit;
                            });
                            if (digits.length > 0) {
                                pinBoxes[Math.min(digits.length, 3)].focus();
                            }
                        });
                    });
                    
                    // Format custom ID input with real-time availability check
                    const customIdInput = document.getElementById('customTreeId');
                    const customIdStatus = document.getElementById('customIdStatus');
                    const customIdPreview = document.getElementById('customIdPreview');
                    let checkTimeout = null;
                    
                    customIdInput.addEventListener('input', (e) => {
                        // Only allow lowercase letters, numbers, and hyphens
                        e.target.value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                        
                        const customId = e.target.value.trim();
                        
                        // Update preview in real-time
                        customIdPreview.textContent = customId || '___';
                        
                        // Clear previous timeout
                        if (checkTimeout) clearTimeout(checkTimeout);
                        
                        // Reset status and preview color if empty
                        if (!customId) {
                            customIdStatus.innerHTML = '';
                            customIdPreview.style.color = '#888';
                            return;
                        }
                        
                        // Show validation errors immediately
                        if (customId.length < 3) {
                            customIdStatus.innerHTML = '<span style="color: #f59e0b;">⚠️ ต้องมีอย่างน้อย 3 ตัวอักษร</span>';
                            customIdPreview.style.color = '#f59e0b';
                            return;
                        }
                        
                        // Show checking status - gray
                        customIdStatus.innerHTML = '<span style="color: #888;"><i class="fa-solid fa-spinner fa-spin"></i> กำลังตรวจสอบ...</span>';
                        customIdPreview.style.color = '#888';
                        
                        // Debounce the check (wait 400ms after typing stops)
                        checkTimeout = setTimeout(async () => {
                            try {
                                const exists = await checkTreeIdExists(customId);
                                // Make sure the input still has the same value
                                if (customIdInput.value.trim() === customId) {
                                    if (exists) {
                                        // Not available - red
                                        customIdStatus.innerHTML = '<span style="color: #ef4444;">❌ ID นี้ถูกใช้แล้ว ลองใช้ชื่ออื่น</span>';
                                        customIdPreview.style.color = '#ef4444';
                                    } else {
                                        // Available - green
                                        customIdStatus.innerHTML = '<span style="color: #22c55e;">✅ ID นี้ว่างอยู่ ใช้ได้เลย!</span>';
                                        customIdPreview.style.color = '#22c55e';
                                    }
                                }
                            } catch (error) {
                                customIdStatus.innerHTML = '<span style="color: #f59e0b;">⚠️ ไม่สามารถตรวจสอบได้</span>';
                                customIdPreview.style.color = '#f59e0b';
                            }
                        }, 400);
                    });
                },
                showCancelButton: true,
                confirmButtonText: '<i class="fa-solid fa-tree"></i> สร้างเลย!',
                cancelButtonText: 'ยกเลิก',
                confirmButtonColor: '#c41e3a',
                cancelButtonColor: '#6c757d',
                preConfirm: async () => {
                    const ownerName = document.getElementById('ownerName').value.trim();
                    const customId = document.getElementById('customTreeId').value.trim();
                    const enablePin = document.getElementById('enablePin').checked;
                    
                    if (!ownerName) {
                        Swal.showValidationMessage('กรุณากรอกชื่อของคุณ');
                        return false;
                    }
                    
                    // Validate custom ID if provided
                    if (customId) {
                        if (customId.length < 3) {
                            Swal.showValidationMessage('Custom ID ต้องมีอย่างน้อย 3 ตัวอักษร');
                            return false;
                        }
                        if (!/^[a-z0-9-]+$/.test(customId)) {
                            Swal.showValidationMessage('Custom ID ใช้ได้เฉพาะ a-z, 0-9 และ - เท่านั้น');
                            return false;
                        }
                        
                        // Check if ID already exists
                        Swal.showLoading();
                        const exists = await checkTreeIdExists(customId);
                        if (exists) {
                            Swal.hideLoading();
                            Swal.showValidationMessage('❌ ID นี้ถูกใช้แล้ว กรุณาเลือก ID อื่น');
                            return false;
                        }
                        Swal.hideLoading();
                    }
                    
                    let pin = null;
                    if (enablePin) {
                        const pin1 = document.getElementById('pin1').value;
                        const pin2 = document.getElementById('pin2').value;
                        const pin3 = document.getElementById('pin3').value;
                        const pin4 = document.getElementById('pin4').value;
                        pin = pin1 + pin2 + pin3 + pin4;
                        
                        if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
                            Swal.showValidationMessage('กรุณากรอก PIN ให้ครบ 4 หลัก');
                            return false;
                        }
                    }
                    
                    return { ownerName, pin, customId };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    createTree(result.value.ownerName, result.value.pin, result.value.customId);
                }
            });
        }
        
        // Toggle PIN section visibility
        function togglePinSection() {
            const pinSection = document.getElementById('pinSection');
            const enablePin = document.getElementById('enablePin').checked;
            
            if (enablePin) {
                pinSection.classList.add('active');
                setTimeout(() => document.getElementById('pin1').focus(), 100);
            } else {
                pinSection.classList.remove('active');
            }
        }
        
        function showVisitTreeModal() {
            Swal.fire({
                title: '🔗 เยี่ยมชมต้นคริสต์มาส',
                html: `
                    <div class="create-tree-form">
                        <div class="form-group">
                            <label>ID ต้นคริสต์มาสหรือลิงก์</label>
                            <input type="text" id="treeLink" placeholder="วางลิงก์หรือกรอก ID ที่นี่">
                        </div>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'ไปเลย!',
                cancelButtonText: 'ยกเลิก',
                confirmButtonColor: '#2d5a3f',
                cancelButtonColor: '#6c757d',
                preConfirm: () => {
                    const input = document.getElementById('treeLink').value.trim();
                    if (!input) {
                        Swal.showValidationMessage('กรุณากรอก ID หรือลิงก์');
                        return false;
                    }
                    // Extract tree ID from link or use directly
                    let treeId = input;
                    if (input.includes('?id=')) {
                        treeId = input.split('?id=')[1].split('&')[0];
                    }
                    return { treeId };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = `?id=${result.value.treeId}`;
                }
            });
        }
        
        function showUnlockModal() {
            Swal.fire({
                title: '🔐 ปลดล็อคข้อความ',
                html: `
                    <div class="create-tree-form">
                        <p style="color: #666; margin-bottom: 15px;">กรอก PIN 4 หลักที่เจ้าของต้นคริสต์มาสตั้งไว้</p>
                        <div class="form-group">
                            <label>🔑 รหัส PIN</label>
                            <input type="password" id="unlockPin" placeholder="• • • •" maxlength="4" pattern="[0-9]*" inputmode="numeric" style="text-align: center; font-size: 1.5rem; letter-spacing: 10px;">
                        </div>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'ปลดล็อค',
                cancelButtonText: 'ยกเลิก',
                confirmButtonColor: '#c41e3a',
                cancelButtonColor: '#6c757d',
                preConfirm: () => {
                    const pin = document.getElementById('unlockPin').value.trim();
                    if (!pin || pin.length !== 4) {
                        Swal.showValidationMessage('กรุณากรอก PIN 4 หลัก');
                        return false;
                    }
                    
                    // Verify PIN
                    if (pin !== currentTreeData.pin) {
                        Swal.showValidationMessage('❌ PIN ไม่ถูกต้อง ลองใหม่อีกครั้ง');
                        return false;
                    }
                    
                    return { pin };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    // Save unlocked state to session
                    const unlockedTrees = JSON.parse(sessionStorage.getItem('unlockedTrees') || '[]');
                    if (!unlockedTrees.includes(currentTreeId)) {
                        unlockedTrees.push(currentTreeId);
                        sessionStorage.setItem('unlockedTrees', JSON.stringify(unlockedTrees));
                    }
                    
                    // Re-render page unlocked
                    renderTreePage(currentTreeData, decorations, false);
                    renderMessages(decorations);
                    
                    fireConfetti();
                    showToast('🎉 ปลดล็อคสำเร็จ!');
                }
            });
        }
        
        function showDecorationModal() {
            let selectedOrnament = '🎄';
            
            Swal.fire({
                title: '✨ ตกแต่งต้นคริสต์มาส',
                html: `
                    <div class="create-tree-form">
                        <div class="form-group">
                            <label>ชื่อของคุณ</label>
                            <input type="text" id="senderName" placeholder="ชื่อที่จะแสดง" maxlength="20">
                        </div>
                        <div class="form-group">
                            <label>เลือกของตกแต่ง</label>
                            <div class="ornament-picker" id="ornamentPicker">
                                ${ORNAMENTS.map((orn, i) => `
                                    <div class="ornament-option ${i === 0 ? 'selected' : ''}" data-ornament="${orn}">${orn}</div>
                                `).join('')}
                            </div>
                        </div>
                        <div class="form-group">
                            <label>ข้อความอวยพร</label>
                            <input type="text" id="message" placeholder="สุขสันต์วันคริสต์มาส! 🎉" maxlength="100">
                        </div>
                    </div>
                `,
                didOpen: () => {
                    document.querySelectorAll('.ornament-option').forEach(option => {
                        option.addEventListener('click', function() {
                            document.querySelectorAll('.ornament-option').forEach(o => o.classList.remove('selected'));
                            this.classList.add('selected');
                            selectedOrnament = this.dataset.ornament;
                        });
                    });
                },
                showCancelButton: true,
                confirmButtonText: 'ตกแต่ง!',
                cancelButtonText: 'ยกเลิก',
                confirmButtonColor: '#c41e3a',
                cancelButtonColor: '#6c757d',
                preConfirm: () => {
                    const senderName = document.getElementById('senderName').value.trim() || 'ไม่ระบุ';
                    const message = document.getElementById('message').value.trim();
                    
                    if (!message) {
                        Swal.showValidationMessage('กรุณาเขียนข้อความอวยพร');
                        return false;
                    }
                    
                    return { senderName, message, icon: selectedOrnament };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    addDecoration(result.value);
                }
            });
        }
        
        function showOrnamentDetail(ornament) {
            Swal.fire({
                title: `${ornament.icon} ${ornament.senderName}`,
                html: `
                    <p style="font-size: 1.1rem; margin-top: 10px;">"${ornament.message}"</p>
                    <p style="font-size: 0.85rem; color: #888; margin-top: 15px;">${formatTimeAgo(ornament.timestamp)}</p>
                `,
                confirmButtonText: 'ปิด',
                confirmButtonColor: '#2d5a3f'
            });
        }
        
        function shareTree() {
            const shareUrl = `${window.location.origin}${window.location.pathname}?id=${currentTreeId}`;
            
            Swal.fire({
                title: '🔗 แชร์ต้นคริสต์มาส',
                html: `
                    <p style="margin-bottom: 15px;">เลือกวิธีแชร์</p>
                    <div class="share-options">
                        <button class="share-option-btn" onclick="copyShareLinkFromModal()">
                            <i class="fa-solid fa-link"></i>
                            <span>คัดลอกลิงก์</span>
                        </button>
                        <button class="share-option-btn story-btn" onclick="generateStoryImage()">
                            <i class="fa-solid fa-mobile-screen"></i>
                            <span>บันทึกรูป (ลง IG Story)</span>
                        </button>
                    </div>
                    <div class="share-link-container">
                        <input type="text" class="share-link-input" id="shareLink" value="${shareUrl}" readonly>
                        <button class="share-copy-btn" onclick="copyShareLink()">
                            <i class="fa-solid fa-copy"></i>
                        </button>
                    </div>
                `,
                showConfirmButton: false,
                showCloseButton: true
            });
        }
        
        function copyShareLinkFromModal() {
            const shareUrl = `${window.location.origin}${window.location.pathname}?id=${currentTreeId}`;
            navigator.clipboard.writeText(shareUrl).then(() => {
                showToast('คัดลอกลิงก์แล้ว! 📋');
            });
        }
        
        async function generateStoryImage() {
            // Build share URL first
            const shareUrl = window.location.origin + window.location.pathname + '?id=' + currentTreeId;
            
            // Copy link BEFORE generating image (treat gen button as copy+gen)
            let linkCopied = false;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                try {
                    await navigator.clipboard.writeText(shareUrl);
                    linkCopied = true;
                } catch (e) {
                    console.log('Clipboard API failed');
                }
            }
            
            if (!linkCopied) {
                // Fallback copy
                const textArea = document.createElement('textarea');
                textArea.value = shareUrl;
                textArea.style.cssText = 'position:fixed;top:0;left:0;width:2em;height:2em;padding:0;border:none;outline:none;box-shadow:none;background:transparent;';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    linkCopied = document.execCommand('copy');
                } catch (e) {}
                document.body.removeChild(textArea);
            }
            
            // Show loading with animation
            Swal.fire({
                title: '🎨 กำลังสร้างรูปภาพ...',
                html: `
                    <div style="text-align: center; padding: 20px 0;">
                        <div class="loading-tree" style="font-size: 4rem; animation: bounce 0.6s ease infinite;">🎄</div>
                        <p style="color: ${linkCopied ? '#2d5a3f' : '#666'}; margin-top: 15px;">
                            ${linkCopied ? '✅ คัดลอกลิงก์รอแล้ว! กรุณารอภาพสักครู่...' : 'กรุณารอสักครู่...'}
                        </p>
                        <div style="
                            width: 200px;
                            height: 6px;
                            background: rgba(0,0,0,0.1);
                            border-radius: 10px;
                            margin: 15px auto 0;
                            overflow: hidden;
                        ">
                            <div style="
                                width: 30%;
                                height: 100%;
                                background: linear-gradient(90deg, #c41e3a, #2d5a3f, #c41e3a);
                                background-size: 200% 100%;
                                border-radius: 10px;
                                animation: loadingBar 1.5s ease-in-out infinite;
                            "></div>
                        </div>
                    </div>
                    <style>
                        @keyframes bounce {
                            0%, 100% { transform: translateY(0); }
                            50% { transform: translateY(-10px); }
                        }
                        @keyframes loadingBar {
                            0% { width: 20%; margin-left: 0%; }
                            50% { width: 40%; margin-left: 30%; }
                            100% { width: 20%; margin-left: 80%; }
                        }
                    </style>
                `,
                showConfirmButton: false,
                allowOutsideClick: false,
                customClass: {
                    popup: 'swal-loading-popup'
                }
            });
            
            // Add z-index style for loading popup
            const loadingStyle = document.createElement('style');
            loadingStyle.id = 'loadingZIndexStyle';
            loadingStyle.textContent = '.swal-loading-popup { z-index: 99999 !important; } .swal2-container { z-index: 99998 !important; }';
            document.head.appendChild(loadingStyle);
            
            // Create story canvas
            const storyContainer = document.createElement('div');
            storyContainer.id = 'storyCanvas';
            storyContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 1080px;
                height: 1920px;
                background: linear-gradient(180deg, #0a1628 0%, #1a2744 40%, #1a472a 100%);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 80px 60px;
                z-index: 10000;
                font-family: 'Prompt', sans-serif;
            `;
            
            const ornamentCount = decorations.length;
            const shortUrl = window.location.host + window.location.pathname;
            
            // Build ornaments HTML for story
            let ornamentsHtml = '';
            decorations.slice(0, 20).forEach((ornament, index) => {
                if (index < ORNAMENT_POSITIONS.length) {
                    const pos = ORNAMENT_POSITIONS[index];
                    ornamentsHtml += `
                        <div style="
                            position: absolute;
                            top: ${pos.top};
                            left: ${pos.left};
                            font-size: 48px;
                            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
                        ">${ornament.icon}</div>
                    `;
                }
            });
            
            storyContainer.innerHTML = `
                <div style="text-align: center; margin-bottom: 60px;">
                    <div style="font-size: 100px; margin-bottom: 10px;">⭐</div>
                    <h1 style="
                        font-family: 'Mountains of Christmas', cursive;
                        font-size: 80px;
                        color: #ffd700;
                        text-shadow: 0 4px 20px rgba(255, 215, 0, 0.5);
                        margin-bottom: 0px;
                    ">Deco a Christmas Tree</h1>
                    <h3 style="
                        font-family: 'Mountains of Christmas', cursive;
                        font-size: 30px;
                        color: #ffd700;
                        text-shadow: 0 4px 20px rgba(255, 215, 0, 0.5);
                        margin-bottom: 20px;
                    ">by HULALLA #3</h3>
                    <p style="font-size: 48px; color: white; font-weight: 600;">
                        ${currentTreeData.ownerName}'s Tree
                    </p>
                </div>
                
                <div style="position: relative; width: 700px; height: 800px;">
                    <svg viewBox="0 0 200 250" style="width: 100%; height: 100%;">
                        <polygon points="100,10 130,60 70,60" fill="#2d5a3f"/>
                        <polygon points="100,30 145,90 55,90" fill="#3d7a55"/>
                        <polygon points="100,55 160,130 40,130" fill="#2d5a3f"/>
                        <polygon points="100,85 175,170 25,170" fill="#3d7a55"/>
                        <polygon points="100,115 190,210 10,210" fill="#2d5a3f"/>
                        <ellipse cx="100" cy="10" rx="8" ry="3" fill="#fff" opacity="0.8"/>
                        <ellipse cx="85" cy="60" rx="10" ry="3" fill="#fff" opacity="0.6"/>
                        <ellipse cx="115" cy="60" rx="8" ry="3" fill="#fff" opacity="0.6"/>
                        <rect x="85" y="210" width="30" height="35" fill="#654321" rx="3"/>
                    </svg>
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
                        ${ornamentsHtml}
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <div style="
                        display: flex;
                        justify-content: center;
                        gap: 30px;
                        margin-bottom: 20px;
                    ">
                        <span style="font-size: 60px;">🎁</span>
                        <span style="font-size: 60px;">🎀</span>
                        <span style="font-size: 60px;">🎁</span>
                    </div>
                    <p style="font-size: 42px; color: white; margin-bottom: 20px;">
                        <span style="color: #ffd700; font-weight: 700;">${ornamentCount}</span> คน มาตกแต่งแล้ว!
                    </p>
                    <div style="
                        background: rgba(255,255,255,0.15);
                        padding: 20px 40px;
                        border-radius: 20px;
                        display: inline-block;
                    ">
                        <p style="font-size: 32px; color: rgba(255,255,255,0.7);">มาตกแต่งต้นคริสต์มาสด้วยข้อความสุดแสนพิเศษกันเถอะ!</p>
                        <p style="font-size: 30px; color: #ffd700; margin-top: 20px;margin-bottom: 20px;">${shortUrl}?id=${currentTreeId}</p>
                    </div>
                </div>
                
                <div style="
                    position: absolute;
                    bottom: 50px;
                    left: 0;
                    right: 0;
                    text-align: center;
                    color: rgba(255,255,255,0.4);
                    font-size: 24px;
                    font-weight: 400;
                ">
                    🎄 Merry Christmas 2025 · ฮูลัลลา · HULALLA · #3
                </div>
            `;
            
            document.body.appendChild(storyContainer);
            
            // Wait for fonts to load
            await new Promise(resolve => setTimeout(resolve, 500));
            
            try {
                const canvas = await html2canvas(storyContainer, {
                    width: 1080,
                    height: 1920,
                    scale: 1,
                    useCORS: true,
                    backgroundColor: null
                });
                
                // Remove the container
                document.body.removeChild(storyContainer);
                
                // Convert to blob for sharing/copying
                const imageDataUrl = canvas.toDataURL('image/png');
                
                // Remove loading z-index style
                const loadingStyle = document.getElementById('loadingZIndexStyle');
                if (loadingStyle) loadingStyle.remove();
                
                // Store share URL globally for copy button
                window.currentShareUrl = shareUrl;
                
                // Show modal with image preview and action buttons
                Swal.fire({
                    title: '🎉 สร้างรูปสำเร็จ!',
                    html: `
                        <div style="text-align: center;">
                            <p style="color: ${linkCopied ? '#2d5a3f' : '#666'}; margin-bottom: 10px; font-size: 0.9rem;">
                                ${linkCopied ? '✅ คัดลอกลิงก์แล้ว!' : '📋 กดปุ่มด้านล่างเพื่อคัดลอกลิงก์'}
                            </p>
                            <div style="
                                background: rgba(0,0,0,0.05);
                                padding: 8px 12px;
                                border-radius: 8px;
                                margin-bottom: 15px;
                                font-size: 0.75rem;
                                color: #888;
                                word-break: break-all;
                            ">${shareUrl}</div>
                            <p style="color: #666; margin-bottom: 15px; font-size: 0.85rem;">
                                👆 กดค้างที่รูปเพื่อบันทึก
                            </p>
                            <div style="
                                max-height: 280px;
                                overflow: hidden;
                                border-radius: 12px;
                                margin-bottom: 15px;
                                box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                            ">
                                <img src="${imageDataUrl}" style="width: 100%; display: block;" id="storyPreviewImg">
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                                <button onclick="copyCurrentShareUrl()" class="swal2-styled" style="
                                    background: linear-gradient(135deg, #f59e0b, #d97706);
                                    padding: 10px 12px;
                                    border-radius: 10px;
                                    font-size: 0.8rem;
                                    width: 100%;
                                ">
                                    <i class="fa-solid fa-link"></i> คัดลอกลิงก์
                                </button>
                                <button onclick="downloadStoryImage()" class="swal2-styled" style="
                                    background: linear-gradient(135deg, #2d5a3f, #3d7a55);
                                    padding: 10px 12px;
                                    border-radius: 10px;
                                    font-size: 0.8rem;
                                    width: 100%;
                                ">
                                    <i class="fa-solid fa-download"></i> ดาวน์โหลด
                                </button>
                                <button onclick="copyStoryImage()" class="swal2-styled" style="
                                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                                    padding: 10px 12px;
                                    border-radius: 10px;
                                    font-size: 0.8rem;
                                    width: 100%;
                                ">
                                    <i class="fa-solid fa-copy"></i> คัดลอกรูป
                                </button>
                                <button onclick="openStoryImageUrl()" class="swal2-styled" style="
                                    background: linear-gradient(135deg, #ec4899, #db2777);
                                    padding: 10px 12px;
                                    border-radius: 10px;
                                    font-size: 0.8rem;
                                    width: 100%;
                                ">
                                    <i class="fa-solid fa-up-right-from-square"></i> เปิดรูป
                                </button>
                            </div>
                        </div>
                    `,
                    showConfirmButton: false,
                    showCloseButton: true,
                    width: '90%',
                    maxWidth: '400px',
                    customClass: {
                        popup: 'story-preview-popup'
                    }
                });
                
                // Store image data for download/copy functions
                window.currentStoryImageData = imageDataUrl;
                window.currentStoryFileName = `christmas-tree-${currentTreeData.ownerName}.png`;
                
            } catch (error) {
                console.error('Error generating image:', error);
                document.body.removeChild(storyContainer);
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ไม่สามารถสร้างรูปได้ กรุณาลองใหม่',
                    confirmButtonColor: '#c41e3a'
                });
            }
        }
        
        // Download story image
        function downloadStoryImage() {
            if (!window.currentStoryImageData) return;
            
            const link = document.createElement('a');
            link.download = window.currentStoryFileName;
            link.href = window.currentStoryImageData;
            link.click();
            showToast('กำลังดาวน์โหลด... 📥');
        }
        
        // Copy current share URL
        async function copyCurrentShareUrl() {
            if (!window.currentShareUrl) return;
            
            // Try modern clipboard API first
            if (navigator.clipboard && navigator.clipboard.writeText) {
                try {
                    await navigator.clipboard.writeText(window.currentShareUrl);
                    showToast('คัดลอกลิงก์แล้ว! 📋');
                    return;
                } catch (e) {
                    console.log('Clipboard API failed, trying fallback');
                }
            }
            
            // Fallback: create textarea and copy
            const textArea = document.createElement('textarea');
            textArea.value = window.currentShareUrl;
            textArea.style.cssText = 'position:fixed;top:0;left:0;width:2em;height:2em;padding:0;border:none;outline:none;box-shadow:none;background:transparent;';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    showToast('คัดลอกลิงก์แล้ว! 📋');
                } else {
                    // Show link in prompt for manual copy
                    prompt('คัดลอกลิงก์นี้:', window.currentShareUrl);
                }
            } catch (e) {
                // Show link in prompt for manual copy
                prompt('คัดลอกลิงก์นี้:', window.currentShareUrl);
            }
            
            document.body.removeChild(textArea);
        }
        
        // Open story image URL in new tab
        function openStoryImageUrl() {
            if (!window.currentStoryImageData) return;
            
            // Open image in new tab
            const newTab = window.open();
            if (newTab) {
                newTab.document.write(`
                    <html>
                        <head>
                            <title>Christmas Tree - ${currentTreeData.ownerName}</title>
                            <style>
                                body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #1a1a2e; }
                                img { max-width: 100%; max-height: 100vh; }
                            </style>
                        </head>
                        <body>
                            <img src="${window.currentStoryImageData}" alt="Christmas Tree">
                        </body>
                    </html>
                `);
                newTab.document.close();
            } else {
                showToast('ไม่สามารถเปิดหน้าต่างใหม่ได้ 😢');
            }
        }
        
        // Copy story image to clipboard
        async function copyStoryImage() {
            if (!window.currentStoryImageData) return;
            
            try {
                // Convert data URL to blob
                const response = await fetch(window.currentStoryImageData);
                const blob = await response.blob();
                
                // Try to copy image to clipboard
                await navigator.clipboard.write([
                    new ClipboardItem({
                        'image/png': blob
                    })
                ]);
                
                showToast('คัดลอกรูปแล้ว! 📋');
            } catch (error) {
                console.error('Copy failed:', error);
                // Fallback: show instruction
                showToast('กดค้างที่รูปเพื่อบันทึก 👆');
            }
        }
        
        function copyShareLink() {
            const input = document.getElementById('shareLink');
            input.select();
            document.execCommand('copy');
            showToast('คัดลอกลิงก์แล้ว! 📋');
        }
        
        // ========================================
        // FIREBASE FUNCTIONS
        // ========================================
        
        // Check if tree ID already exists
        async function checkTreeIdExists(treeId) {
            try {
                const snapshot = await database.ref(`trees/${treeId}`).once('value');
                return snapshot.exists();
            } catch (error) {
                console.error('Error checking tree ID:', error);
                return false;
            }
        }
        
        async function createTree(ownerName, pin, customId = null) {
            // Use custom ID or generate one
            const treeId = customId || generateTreeId();
            const treeData = {
                ownerName,
                pin: pin, // Store PIN for verification
                createdAt: Date.now(),
                views: 0,
                customId: !!customId // Track if it's a custom ID
            };
            
            try {
                await database.ref(`trees/${treeId}`).set(treeData);
                
                // Track tree creation in Analytics
                logEvent('create_tree', {
                    tree_id: treeId,
                    owner_name: ownerName,
                    has_pin: !!pin
                });
                
                // Update URL without reload
                window.history.pushState({}, '', `?id=${treeId}`);
                
                currentTreeId = treeId;
                currentTreeData = treeData;
                decorations = [];
                
                renderTreePage(treeData, []);
                fireConfetti();
                
                Swal.fire({
                    icon: 'success',
                    title: '🎄 สร้างต้นคริสต์มาสสำเร็จ!',
                    text: 'แชร์ลิงก์ให้เพื่อนมาตกแต่งกันเลย!',
                    confirmButtonText: 'แชร์เลย!',
                    confirmButtonColor: '#c41e3a'
                }).then(() => {
                    shareTree();
                });
                
            } catch (error) {
                console.error('Error creating tree:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ไม่สามารถสร้างต้นคริสต์มาสได้ กรุณาลองใหม่',
                    confirmButtonColor: '#c41e3a'
                });
            }
        }
        
        async function loadTree(treeId) {
            try {
                // Load tree data
                const treeSnapshot = await database.ref(`trees/${treeId}`).once('value');
                const treeData = treeSnapshot.val();
                
                if (!treeData) {
                    Swal.fire({
                        icon: 'error',
                        title: 'ไม่พบต้นคริสต์มาส',
                        text: 'ต้นคริสต์มาสนี้อาจถูกลบหรือไม่มีอยู่',
                        confirmButtonColor: '#c41e3a'
                    }).then(() => {
                        window.location.href = window.location.pathname;
                    });
                    return;
                }
                
                currentTreeId = treeId;
                currentTreeData = treeData;
                
                // Track tree view in Analytics
                logEvent('view_tree', {
                    tree_id: treeId,
                    owner_name: treeData.ownerName
                });
                
                // Increment view count in database
                incrementTreeViews(treeId);
                
                // Load decorations with keys
                const decoSnapshot = await database.ref(`decorations/${treeId}`).once('value');
                const decoData = decoSnapshot.val();
                decorations = [];
                if (decoData) {
                    Object.keys(decoData).forEach(key => {
                        const deco = decoData[key];
                        deco._key = key;
                        decorations.push(deco);
                    });
                }
                
                // Reset listener flag
                realtimeListenerSetup = false;
                
                // Check if tree has PIN protection
                if (treeData.pin) {
                    // Check if already unlocked in this session
                    const unlockedTrees = JSON.parse(sessionStorage.getItem('unlockedTrees') || '[]');
                    if (!unlockedTrees.includes(treeId)) {
                        renderTreePage(treeData, decorations, true); // locked = true
                        // Still setup listener for real-time updates (ornaments only)
                        setupRealtimeListener(treeId);
                        return;
                    }
                }
                
                renderTreePage(treeData, decorations, false); // locked = false
                
                // Setup real-time listener
                setupRealtimeListener(treeId);
                
            } catch (error) {
                console.error('Error loading tree:', error);
                renderLandingPage();
            }
        }
        
        // Setup real-time listener for decorations
        let realtimeListenerSetup = false;
        let loadedDecoKeys = new Set(); // Track all loaded decoration keys
        let isAddingDecoration = false; // Flag to prevent duplicate during add
        
        function setupRealtimeListener(treeId) {
            // Prevent duplicate listeners
            if (realtimeListenerSetup) return;
            realtimeListenerSetup = true;
            
            // Remove any existing listener first
            database.ref(`decorations/${treeId}`).off();
            
            // Store existing keys from already loaded decorations
            loadedDecoKeys = new Set(decorations.map(d => d._key).filter(Boolean));
            
            // Use 'value' event to get all data and detect changes
            database.ref(`decorations/${treeId}`).on('value', (snapshot) => {
                // Skip if we're in the middle of adding a decoration
                if (isAddingDecoration) return;
                
                const allData = snapshot.val();
                if (!allData) return;
                
                let hasNewData = false;
                
                Object.keys(allData).forEach(key => {
                    // Check if this key already exists in decorations array
                    const existsInArray = decorations.some(d => d._key === key);
                    if (!existsInArray && !loadedDecoKeys.has(key)) {
                        const newDeco = allData[key];
                        newDeco._key = key;
                        loadedDecoKeys.add(key);
                        decorations.push(newDeco);
                        hasNewData = true;
                    } else {
                        // Make sure key is in the set even if already in array
                        loadedDecoKeys.add(key);
                    }
                });
                
                if (hasNewData) {
                    renderOrnaments(decorations);
                    updateCounters();
                    
                    // Only update messages if unlocked
                    const unlockedTrees = JSON.parse(sessionStorage.getItem('unlockedTrees') || '[]');
                    if (!currentTreeData.pin || unlockedTrees.includes(currentTreeId)) {
                        renderMessages(decorations);
                    }
                }
            });
        }
        
        async function addDecoration(data) {
            const decoration = {
                ...data,
                timestamp: Date.now()
            };
            
            // Set flag to prevent listener from duplicating
            isAddingDecoration = true;
            
            try {
                // Push to Firebase and get the key
                const newRef = await database.ref(`decorations/${currentTreeId}`).push(decoration);
                
                // Track decoration in Analytics
                logEvent('add_decoration', {
                    tree_id: currentTreeId,
                    ornament: data.icon,
                    sender_name: data.senderName
                });
                
                // Add key to local copy and tracking set
                decoration._key = newRef.key;
                loadedDecoKeys.add(newRef.key);
                
                // Immediately update local state and UI
                decorations.push(decoration);
                renderOrnaments(decorations);
                updateCounters();
                
                // Update messages if unlocked
                const unlockedTrees = JSON.parse(sessionStorage.getItem('unlockedTrees') || '[]');
                if (!currentTreeData.pin || unlockedTrees.includes(currentTreeId)) {
                    renderMessages(decorations);
                }
                
                // Reset flag after a short delay to allow Firebase to settle
                setTimeout(() => {
                    isAddingDecoration = false;
                }, 500);
                
                fireConfetti();
                
                // Show success and prompt to create own tree
                Swal.fire({
                    icon: 'success',
                    title: '🎉 ตกแต่งสำเร็จ!',
                    html: `
                        <p style="margin-bottom: 20px;">ข้อความของคุณถูกเพิ่มบนต้นคริสต์มาสแล้ว</p>
                        <p style="color: #666;">อยากมีต้นคริสต์มาสของตัวเองมั้ย?</p>
                    `,
                    showCancelButton: true,
                    confirmButtonText: '🎄 สร้างต้นคริสต์มาสของฉัน',
                    cancelButtonText: 'ไว้ทีหลัง',
                    confirmButtonColor: '#c41e3a',
                    cancelButtonColor: '#6c757d'
                }).then((result) => {
                    if (result.isConfirmed) {
                        showCreateTreeModal();
                    }
                });
                
            } catch (error) {
                console.error('Error adding decoration:', error);
                isAddingDecoration = false; // Reset flag on error
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ไม่สามารถเพิ่มของตกแต่งได้ กรุณาลองใหม่',
                    confirmButtonColor: '#c41e3a'
                });
            }
        }
        
        function updateCounters() {
            const count = decorations.length;
            const ornamentCountEl = document.getElementById('ornamentCount');
            const decoCountEl = document.getElementById('decoCount');
            const messageCountEl = document.getElementById('messageCount');
            
            if (ornamentCountEl) ornamentCountEl.textContent = count;
            if (decoCountEl) decoCountEl.textContent = count;
            if (messageCountEl) messageCountEl.textContent = `${count} ข้อความ`;
        }
        
        // ========================================
        // INITIALIZATION
        // ========================================
        
        async function init() {
            createSnowflakes();
            initMusic();
            
            const treeId = getTreeIdFromURL();
            
            if (treeId) {
                await loadTree(treeId);
            } else {
                renderLandingPage();
            }
        }
        
        // Start the app
        document.addEventListener('DOMContentLoaded', init);