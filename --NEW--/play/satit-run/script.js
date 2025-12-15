        // Firebase Configuration
        const firebaseConfig = window.HLL_KEYS.firebase;
        
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        
        // Initialize Analytics (if available)
        let analytics = null;
        if (typeof firebase.analytics === 'function') {
            analytics = firebase.analytics();
        }
        
        // Log analytics event helper (non-blocking)
        function logEvent(eventName, params = {}) {
            if (analytics) {
                // Use setTimeout to prevent blocking game loop
                setTimeout(() => {
                    analytics.logEvent(eventName, params);
                }, 0);
            }
        }
        
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        // Cache DOM elements for performance
        const distanceEl = document.getElementById('distance');
        const coinsEl = document.getElementById('coins');
        let lastDisplayedScore = -1;
        let lastDisplayedCoins = -1;
        
        // Game state
        let gameRunning = false;
        let score = 0;
        let coins = 0;
        let highScore = localStorage.getItem('satitRunHighScore') || 0;
        let gameSpeed = 5;
        let animationId;
        
        // Sound state
        let soundEnabled = localStorage.getItem('satitRunSound') !== 'false';
        let bgMusicPlaying = false;
        let soundSettingsShown = false;
        
        // Player
        const player = {
            x: 0,
            y: 0,
            width: 50,
            height: 70,
            lane: 1, // 0, 1, 2
            velocityY: 0,
            jumping: false,
            emoji: '🏃'
        };
        
        // Lanes
        const lanes = [0, 0, 0]; // Will be calculated based on canvas width
        
        // Objects
        let obstacles = [];
        let coinItems = [];
        let teacher = {
            x: 0,
            y: 0,
            distance: 300,
            emoji: '👨‍🏫'
        };
        
        // Obstacle types
        const obstacleTypes = [
            { emoji: '🏢', width: 70, height: 70 },
            { emoji: '🏗️', width: 65, height: 65 },
            { emoji: '🌲', width: 60, height: 60 },
            { emoji: '🌳', width: 55, height: 55 },
            { emoji: '⛰️', width: 65, height: 60 },
            { emoji: '🪨', width: 50, height: 50 }
        ];
        
        // Resize canvas
        function resizeCanvas() {
            const container = document.querySelector('.game-container');
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            
            // Calculate lanes
            const laneWidth = canvas.width / 3;
            lanes[0] = laneWidth / 2;
            lanes[1] = canvas.width / 2;
            lanes[2] = canvas.width - laneWidth / 2;
            
            // Position player
            player.x = lanes[player.lane];
            player.y = canvas.height - 200;
        }
        
        // Initialize
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Sound functions
        function playSound(soundId) {
            if (!soundEnabled) return;
            
            const sound = document.getElementById(soundId);
            if (sound) {
                sound.currentTime = 0;
                sound.volume = soundId === 'bgMusic' ? 0.3 : 0.5;
                sound.play().catch(() => {
                    console.log('Sound not available:', soundId);
                });
            }
        }
        
        function stopSound(soundId) {
            const sound = document.getElementById(soundId);
            if (sound) {
                sound.pause();
                sound.currentTime = 0;
            }
        }
        
        function toggleSound() {
            soundEnabled = !soundEnabled;
            localStorage.setItem('satitRunSound', soundEnabled);
            
            const btn = document.getElementById('soundToggle');
            const icon = btn.querySelector('i');
            
            if (soundEnabled) {
                icon.className = 'fas fa-volume-up';
                btn.classList.remove('muted');
                if (gameRunning && !bgMusicPlaying) {
                    playSound('bgMusic');
                    bgMusicPlaying = true;
                }
            } else {
                icon.className = 'fas fa-volume-mute';
                btn.classList.add('muted');
                stopSound('bgMusic');
                bgMusicPlaying = false;
            }
        }
        
        // Update sound toggle button UI on page load
        window.addEventListener('load', () => {
            const btn = document.getElementById('soundToggle');
            const icon = btn.querySelector('i');
            if (!soundEnabled) {
                icon.className = 'fas fa-volume-mute';
                btn.classList.add('muted');
            }
            
            // Show sound settings popup on first load
            if (!soundSettingsShown) {
                document.getElementById('soundSettings').classList.remove('hidden');
            }
        });
        
        // Start with sound choice
        function startWithSound(enableSound) {
            soundEnabled = enableSound;
            localStorage.setItem('satitRunSound', soundEnabled);
            soundSettingsShown = true;
            
            document.getElementById('soundSettings').classList.add('hidden');
            
            // Update toggle button UI
            const btn = document.getElementById('soundToggle');
            const icon = btn.querySelector('i');
            if (soundEnabled) {
                icon.className = 'fas fa-volume-up';
                btn.classList.remove('muted');
                // Start background music immediately
                playSound('bgMusic');
                bgMusicPlaying = true;
            } else {
                icon.className = 'fas fa-volume-mute';
                btn.classList.add('muted');
            }
        }
        
        // Start game
        function startGame() {
            document.getElementById('startScreen').classList.add('hidden');
            document.getElementById('hud').style.display = 'flex';
            document.getElementById('mobileControls').style.display = 'flex';
            document.getElementById('soundToggle').style.display = 'block';
            
            // Resume background music if enabled (for restart)
            if (soundEnabled && !bgMusicPlaying) {
                playSound('bgMusic');
                bgMusicPlaying = true;
            }
            
            gameRunning = true;
            score = 0;
            coins = 0;
            gameSpeed = 5;
            player.lane = 1;
            player.x = lanes[1];
            player.jumping = false;
            player.velocityY = 0;
            obstacles = [];
            coinItems = [];
            teacher.distance = 300;
            
            // Log analytics (non-blocking)
            logEvent('satitrun_game_start');
            
            gameLoop();
        }
        
        // Game loop
        function gameLoop() {
            if (!gameRunning) return;
            
            update();
            draw();
            
            animationId = requestAnimationFrame(gameLoop);
        }
        
        // Update game state
        function update() {
            // Update score
            score += gameSpeed / 10;
            
            // Only update DOM when value changes (reduce reflow)
            const displayScore = Math.floor(score);
            if (displayScore !== lastDisplayedScore) {
                distanceEl.textContent = displayScore;
                lastDisplayedScore = displayScore;
            }
            if (coins !== lastDisplayedCoins) {
                coinsEl.textContent = coins;
                lastDisplayedCoins = coins;
            }
            
            // Increase difficulty
            if (score % 100 < 1 && gameSpeed < 15) {
                gameSpeed += 0.1;
            }
            
            // Update player position (smooth lane change)
            const targetX = lanes[player.lane];
            player.x += (targetX - player.x) * 0.15;
            
            // Jump physics
            if (player.jumping) {
                player.velocityY += 0.8; // Gravity
                player.y += player.velocityY;
                
                if (player.y >= canvas.height - 200) {
                    player.y = canvas.height - 200;
                    player.jumping = false;
                    player.velocityY = 0;
                }
            }
            
            // Spawn obstacles (reduced frequency)
            if (Math.random() < 0.015) {
                spawnObstacle();
            }
            
            // Spawn coins (reduced frequency)
            if (Math.random() < 0.02) {
                spawnCoin();
            }
            
            // Update obstacles - use filter instead of splice in forEach
            let hitObstacle = false;
            obstacles = obstacles.filter(obs => {
                obs.y += gameSpeed;
                
                // Check collision
                if (!hitObstacle && checkCollision(player, obs)) {
                    hitObstacle = true;
                    playSound('sfxCollision');
                }
                
                // Keep if still on screen
                return obs.y <= canvas.height + 100;
            });
            
            if (hitObstacle) {
                gameOver('โดนสิ่งกีดขวาง!');
                return;
            }
            
            // Update coins - use filter instead of splice in forEach
            coinItems = coinItems.filter(coin => {
                coin.y += gameSpeed;
                
                // Check collection
                if (checkCoinCollision(player, coin)) {
                    coins++;
                    playSound('sfxCollect');
                    return false; // Remove collected coin
                }
                
                // Keep if still on screen
                return coin.y <= canvas.height + 50;
            });
            
            // Teacher chasing
            teacher.distance -= 0.01 * gameSpeed;
            if (teacher.distance < 0) {
                gameOver('โดนครูเวรจับ!');
            }
        }
        
        // Draw game
        function draw() {
            // Clear canvas
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw road
            ctx.fillStyle = '#555';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw lane lines
            ctx.strokeStyle = '#fff';
            ctx.setLineDash([30, 20]);
            ctx.lineWidth = 3;
            
            const laneWidth = canvas.width / 3;
            ctx.beginPath();
            ctx.moveTo(laneWidth, 0);
            ctx.lineTo(laneWidth, canvas.height);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(laneWidth * 2, 0);
            ctx.lineTo(laneWidth * 2, canvas.height);
            ctx.stroke();
            
            ctx.setLineDash([]);
            
            // Draw grass on sides
            ctx.fillStyle = '#4ade80';
            ctx.fillRect(0, 0, 20, canvas.height);
            ctx.fillRect(canvas.width - 20, 0, 20, canvas.height);
            
            // Draw obstacles
            obstacles.forEach(obs => {
                ctx.font = `${obs.height}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(obs.emoji, obs.x, obs.y);
            });
            
            // Draw coins (books)
            coinItems.forEach(coin => {
                ctx.font = '35px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('📚', coin.x, coin.y);
            });
            
            // Draw player
            ctx.font = `${player.height}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(player.emoji, player.x, player.y);
            
            // Draw teacher indicator
            const teacherIndicatorY = Math.max(50, 50 + (300 - teacher.distance));
            ctx.font = '40px Arial';
            ctx.fillText(teacher.emoji, canvas.width / 2, teacherIndicatorY);
            
            // Teacher distance bar
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(canvas.width / 2 - 50, teacherIndicatorY + 30, 100, 10);
            ctx.fillStyle = teacher.distance > 150 ? '#4ade80' : teacher.distance > 75 ? '#fbbf24' : '#ef4444';
            ctx.fillRect(canvas.width / 2 - 50, teacherIndicatorY + 30, teacher.distance / 3, 10);
        }
        
        // Spawn obstacle
        function spawnObstacle() {
            const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
            const lane = Math.floor(Math.random() * 3);
            
            obstacles.push({
                x: lanes[lane],
                y: -100,
                width: type.width,
                height: type.height,
                emoji: type.emoji
            });
        }
        
        // Spawn coin
        function spawnCoin() {
            const lane = Math.floor(Math.random() * 3);
            
            coinItems.push({
                x: lanes[lane],
                y: -50,
                width: 30,
                height: 30
            });
        }
        
        // Collision detection
        function checkCollision(player, obstacle) {
            const playerRadius = 25;
            const obsRadius = obstacle.width / 2 - 10;
            
            const dx = player.x - obstacle.x;
            const dy = player.y - obstacle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            return distance < playerRadius + obsRadius && !player.jumping;
        }
        
        // Coin collision
        function checkCoinCollision(player, coin) {
            const dx = player.x - coin.x;
            const dy = player.y - coin.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            return distance < 40;
        }
        
        // Game over
        function gameOver(reason) {
            gameRunning = false;
            cancelAnimationFrame(animationId);
            
            // Stop music and play game over sound
            stopSound('bgMusic');
            bgMusicPlaying = false;
            playSound('sfxGameOver');
            
            const finalScore = Math.floor(score);
            document.getElementById('caughtBy').textContent = reason;
            document.getElementById('finalScore').textContent = finalScore;
            
            if (finalScore > highScore) {
                highScore = finalScore;
                localStorage.setItem('satitRunHighScore', highScore);
                document.getElementById('highScoreText').textContent = `🎉 สถิติใหม่! ${highScore}m`;
            } else {
                document.getElementById('highScoreText').textContent = `🏆 สถิติสูงสุด: ${highScore}m`;
            }
            
            document.getElementById('hud').style.display = 'none';
            document.getElementById('mobileControls').style.display = 'none';
            document.getElementById('soundToggle').style.display = 'none';
            document.getElementById('gameOver').classList.add('show');
            
            // Log analytics (non-blocking)
            logEvent('satitrun_game_over', {
                score: finalScore,
                coins: coins,
                reason: reason
            });
        }
        
        // Restart game
        function restartGame() {
            document.getElementById('gameOver').classList.remove('show');
            startGame();
        }
        
        // Share score
        function shareScore() {
            const shareUrl = window.location.href;
            const finalScore = Math.floor(score);
            
            Swal.fire({
                title: '🔗 แชร์คะแนน',
                html: `
                    <p style="margin-bottom: 15px;">เลือกวิธีแชร์</p>
                    <div class="share-options">
                        <button class="share-option-btn" onclick="copyShareLink()">
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
        
        function copyShareLink() {
            const shareUrl = window.location.href;
            navigator.clipboard.writeText(shareUrl).then(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'คัดลอกลิงก์แล้ว! 📋',
                    showConfirmButton: false,
                    timer: 1500
                });
            });
        }
        
        async function generateStoryImage() {
            const finalScore = Math.floor(score);
            const shareUrl = window.location.href;
            
            // Copy link first
            try {
                await navigator.clipboard.writeText(shareUrl);
            } catch (e) {}
            
            // Show loading
            Swal.fire({
                title: '🎨 กำลังสร้างรูปภาพ...',
                html: `
                    <div style="text-align: center; padding: 20px 0;">
                        <div style="font-size: 4rem; animation: bounce 0.6s ease infinite;">🏃</div>
                        <p style="color: #4ade80; margin-top: 15px;">✅ คัดลอกลิงก์รอแล้ว! กรุณารอสักครู่...</p>
                    </div>
                    <style>
                        @keyframes bounce {
                            0%, 100% { transform: translateY(0); }
                            50% { transform: translateY(-10px); }
                        }
                    </style>
                `,
                showConfirmButton: false,
                allowOutsideClick: false
            });
            
            // Create story container
            const storyContainer = document.createElement('div');
            storyContainer.id = 'storyCanvas';
            storyContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 1080px;
                height: 1920px;
                background: linear-gradient(180deg, #1a472a 0%, #2d5a3d 50%, #4ade80 100%);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 80px 60px;
                z-index: 10000;
                font-family: 'Prompt', sans-serif;
            `;
            
            storyContainer.innerHTML = `
                <div style="text-align: center; margin-bottom: 40px;">
                    <div style="font-size: 120px; margin-bottom: 20px;">🏃</div>
                    <h1 style="
                        font-size: 70px;
                        color: white;
                        text-shadow: 0 4px 20px rgba(0,0,0,0.3);
                        margin-bottom: 10px;
                    ">SATIT RUN</h1>
                    <p style="font-size: 36px; color: rgba(255,255,255,0.9);">วิ่งหนีครูเวรยาม!</p>
                </div>
                
                <div style="
                    background: rgba(255,255,255,0.15);
                    border-radius: 40px;
                    padding: 50px 80px;
                    text-align: center;
                    margin-bottom: 40px;
                ">
                    <p style="font-size: 36px; color: rgba(255,255,255,0.8); margin-bottom: 15px;">ระยะทาง</p>
                    <div style="font-size: 100px; font-weight: 800; color: #fbbf24; text-shadow: 0 4px 20px rgba(251,191,36,0.5);">
                        ${finalScore} m
                    </div>
                    <p style="font-size: 30px; color: rgba(255,255,255,0.8); margin-top: 20px;">
                        📚 เก็บได้ ${coins} เล่ม
                    </p>
                </div>
                
                <div style="
                    display: flex;
                    gap: 30px;
                    margin-bottom: 40px;
                ">
                    <span style="font-size: 60px;">👨‍🏫</span>
                    <span style="font-size: 60px;">🏢</span>
                    <span style="font-size: 60px;">📚</span>
                </div>
                
                <div style="
                    background: rgba(255,255,255,0.2);
                    padding: 25px 50px;
                    border-radius: 20px;
                    text-align: center;
                ">
                    <p style="font-size: 28px; color: white;">มาลองวิ่งหนีครูเวรกันเถอะ!</p>
                    <p style="font-size: 24px; color: rgba(255,255,255,0.7); margin-top: 10px;">https://hulalla.party/play/satit-run</p>
                </div>
                
                <div style="
                    position: absolute;
                    bottom: 50px;
                    left: 0;
                    right: 0;
                    text-align: center;
                    color: rgba(255,255,255,0.5);
                    font-size: 24px;
                ">
                    🏫 HULALLA #3 · Satit Run
                </div>
            `;
            
            document.body.appendChild(storyContainer);
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
            try {
                const canvas = await html2canvas(storyContainer, {
                    width: 1080,
                    height: 1920,
                    scale: 1,
                    useCORS: true,
                    backgroundColor: null
                });
                
                document.body.removeChild(storyContainer);
                
                const imageDataUrl = canvas.toDataURL('image/png');
                
                Swal.fire({
                    title: '🎉 สร้างรูปสำเร็จ!',
                    html: `
                        <div style="text-align: center;">
                            <p style="color: #4ade80; margin-bottom: 10px;">✅ คัดลอกลิงก์แล้ว!</p>
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
                                <button onclick="downloadStoryImage()" class="swal2-styled" style="
                                    background: linear-gradient(135deg, #4ade80, #22c55e);
                                    padding: 10px 12px;
                                    border-radius: 10px;
                                    font-size: 0.8rem;
                                    width: 100%;
                                ">
                                    <i class="fa-solid fa-download"></i> ดาวน์โหลด
                                </button>
                                <button onclick="copyShareLink()" class="swal2-styled" style="
                                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                                    padding: 10px 12px;
                                    border-radius: 10px;
                                    font-size: 0.8rem;
                                    width: 100%;
                                ">
                                    <i class="fa-solid fa-link"></i> คัดลอกลิงก์
                                </button>
                            </div>
                        </div>
                    `,
                    showConfirmButton: false,
                    showCloseButton: true
                });
                
                // Store image for download
                window.currentStoryImage = imageDataUrl;
                
            } catch (error) {
                document.body.removeChild(storyContainer);
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ไม่สามารถสร้างรูปได้ กรุณาลองใหม่'
                });
            }
        }
        
        function downloadStoryImage() {
            if (window.currentStoryImage) {
                const link = document.createElement('a');
                link.download = 'SatitRun-score.png';
                link.href = window.currentStoryImage;
                link.click();
                
                // Log analytics
                logEvent('satitrun_share_download');
            }
        }
        
        // Controls
        document.addEventListener('keydown', (e) => {
            if (!gameRunning) return;
            
            switch(e.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    if (player.lane > 0) player.lane--;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    if (player.lane < 2) player.lane++;
                    break;
                case 'ArrowUp':
                case 'KeyW':
                case 'Space':
                    if (!player.jumping) {
                        player.jumping = true;
                        player.velocityY = -15;
                        playSound('sfxJump');
                    }
                    e.preventDefault();
                    break;
            }
        });
        
        // Mobile controls
        document.getElementById('leftBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (gameRunning && player.lane > 0) player.lane--;
        });
        
        document.getElementById('rightBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (gameRunning && player.lane < 2) player.lane++;
        });
        
        document.getElementById('jumpBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (gameRunning && !player.jumping) {
                player.jumping = true;
                player.velocityY = -15;
                playSound('sfxJump');
            }
        });
        
        // Swipe controls
        let touchStartX = 0;
        let touchStartY = 0;
        
        canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        canvas.addEventListener('touchend', (e) => {
            if (!gameRunning) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;
            
            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Horizontal swipe
                if (diffX > 30 && player.lane < 2) player.lane++;
                else if (diffX < -30 && player.lane > 0) player.lane--;
            } else {
                // Vertical swipe
                if (diffY < -30 && !player.jumping) {
                    player.jumping = true;
                    player.velocityY = -15;
                    playSound('sfxJump');
                }
            }
        });