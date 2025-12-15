        // Firebase Configuration
        const firebaseConfig = window.HLL_KEYS.firebase;
        
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        
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
        
        // Questions data
        const questions = [
            {
                text: "เช้าวันหยุด คุณจะทำอะไรเป็นอย่างแรก?",
                options: [
                    { text: "ออกไปวิ่งหรือออกกำลังกาย", type: "surfer" },
                    { text: "นอนต่ออีกสัก 2 ชั่วโมง", type: "chill" },
                    { text: "เปิดมือถือเช็คโซเชียล", type: "social" },
                    { text: "อ่านหนังสือหรือทำงานอดิเรก", type: "artist" }
                ]
            },
            {
                text: "ถ้าได้ไปเที่ยวทะเล คุณจะ...",
                options: [
                    { text: "เล่นกีฬาทางน้ำ เช่น เซิร์ฟ ดำน้ำ", type: "surfer" },
                    { text: "นอนอาบแดดริมหาด ชิลๆ", type: "chill" },
                    { text: "ถ่ายรูปเยอะๆ ลง IG", type: "social" },
                    { text: "เดินสำรวจธรรมชาติ หาที่สวยๆ", type: "artist" }
                ]
            },
            {
                text: "คุณชอบดนตรีแบบไหน?",
                options: [
                    { text: "เพลงมันๆ ฟังแล้วอยากขยับตัว", type: "surfer" },
                    { text: "เพลงชิลๆ Acoustic หรือ Lo-fi", type: "chill" },
                    { text: "เพลงฮิตติดชาร์ต อะไรก็ได้ที่คนฟังกัน", type: "social" },
                    { text: "เพลง Indie หรือแนวทดลอง", type: "artist" }
                ]
            },
            {
                text: "ในกลุ่มเพื่อน คุณเป็นคนแบบไหน?",
                options: [
                    { text: "คนชวนไปทำกิจกรรมแอดเวนเจอร์", type: "surfer" },
                    { text: "คนที่ทุกคนมาปรึกษาได้", type: "chill" },
                    { text: "คนที่รู้ข่าวสารทุกอย่าง", type: "social" },
                    { text: "คนที่มีไอเดียแปลกใหม่เสมอ", type: "artist" }
                ]
            },
            {
                text: "อาหารโปรดของคุณคือ?",
                options: [
                    { text: "อะไรก็ได้ที่ Healthy", type: "surfer" },
                    { text: "ของหวานหรือกาแฟ", type: "chill" },
                    { text: "ร้านเปิดใหม่ที่กำลังดัง", type: "social" },
                    { text: "อาหารแปลกๆ ที่ไม่เคยลอง", type: "artist" }
                ]
            },
            {
                text: "วันที่เครียดที่สุด คุณจะทำอะไร?",
                options: [
                    { text: "ออกไปวิ่งหรือเล่นกีฬา", type: "surfer" },
                    { text: "นอนดูหนังหรือฟังเพลง", type: "chill" },
                    { text: "คุยกับเพื่อนหรือโทรหาใครสักคน", type: "social" },
                    { text: "วาดรูป เขียนไดอารี่ หรือทำงานศิลปะ", type: "artist" }
                ]
            },
            {
                text: "สิ่งที่คุณให้ความสำคัญที่สุดคือ?",
                options: [
                    { text: "สุขภาพและความแข็งแรง", type: "surfer" },
                    { text: "ความสงบและความสุขใจ", type: "chill" },
                    { text: "ความสัมพันธ์กับคนรอบข้าง", type: "social" },
                    { text: "การได้แสดงออกตัวตน", type: "artist" }
                ]
            },
            {
                text: "ถ้าให้เลือกของขวัญ คุณจะเลือก?",
                options: [
                    { text: "อุปกรณ์กีฬาหรือแกดเจ็ตสุขภาพ", type: "surfer" },
                    { text: "หมอนหรือผ้าห่มนุ่มๆ", type: "chill" },
                    { text: "บัตรไปงานคอนเสิร์ตหรือปาร์ตี้", type: "social" },
                    { text: "อุปกรณ์ศิลปะหรือหนังสือ", type: "artist" }
                ]
            },
            {
                text: "คุณมองตัวเองในอีก 5 ปีเป็นแบบไหน?",
                options: [
                    { text: "ท่องเที่ยวผจญภัยไปทั่วโลก", type: "surfer" },
                    { text: "มีชีวิตที่สมดุลและมีความสุข", type: "chill" },
                    { text: "มีคนรู้จักเยอะและ connections ดีๆ", type: "social" },
                    { text: "ทำงานที่รักและสร้างสรรค์สิ่งใหม่", type: "artist" }
                ]
            },
            {
                text: "คำที่อธิบายตัวคุณได้ดีที่สุดคือ?",
                options: [
                    { text: "กล้าหาญ", type: "surfer" },
                    { text: "ใจเย็น", type: "chill" },
                    { text: "เป็นกันเอง", type: "social" },
                    { text: "สร้างสรรค์", type: "artist" }
                ]
            }
        ];
        
        // Results data
        const results = {
            surfer: {
                emoji: "🏄",
                type: "THE SURFER",
                title: "นักท่องคลื่นแห่งชีวิต",
                desc: "คุณคือคนที่ไม่กลัวความท้าทาย! ชีวิตของคุณเต็มไปด้วยพลังงานและความกล้า พร้อมจะลองสิ่งใหม่ๆ เสมอ คุณเชื่อว่าชีวิตคือการผจญภัย และทุกคลื่นคือโอกาส",
                traits: ["กล้าหาญ", "มีพลัง", "รักอิสระ", "Adventurous"],
                match: "12%"
            },
            chill: {
                emoji: "🌴",
                type: "THE CHILL VIBES",
                title: "ผู้รักความสงบแห่งเกาะ",
                desc: "คุณคือคนที่รู้จักใช้ชีวิต! ไม่ว่าจะเกิดอะไรขึ้น คุณก็ยังคงสงบและมีความสุขได้ คนรอบข้างรู้สึกผ่อนคลายเมื่ออยู่กับคุณ คุณคือ good vibes ที่ทุกคนต้องการ",
                traits: ["ใจเย็น", "มีเสน่ห์", "เป็นที่พึ่งได้", "Peaceful"],
                match: "28%"
            },
            social: {
                emoji: "🦋",
                type: "THE SOCIAL BUTTERFLY",
                title: "ผีเสื้อสังคมแห่งฮาวาย",
                desc: "คุณคือดาวเด่นในทุกที่! มีพรสวรรค์ในการเข้าสังคมและสร้างความสัมพันธ์ คุณทำให้ทุกที่กลายเป็นปาร์ตี้ และทุกคนอยากอยู่ใกล้ๆ คุณ",
                traits: ["เป็นกันเอง", "สนุกสนาน", "ช่างพูด", "Energetic"],
                match: "35%"
            },
            artist: {
                emoji: "🎨",
                type: "THE ISLAND ARTIST",
                title: "ศิลปินแห่งเกาะสวรรค์",
                desc: "คุณมองโลกในมุมที่ไม่เหมือนใคร! ความคิดสร้างสรรค์คือพลังพิเศษของคุณ คุณสามารถสร้างความงามจากสิ่งธรรมดา และแรงบันดาลใจไม่เคยหมดจากตัวคุณ",
                traits: ["สร้างสรรค์", "มีเอกลักษณ์", "ช่างฝัน", "Creative"],
                match: "25%"
            }
        };
        
        let currentQuestion = 0;
        let scores = { surfer: 0, chill: 0, social: 0, artist: 0 };
        
        function startQuiz() {
            document.getElementById('startScreen').classList.add('hidden');
            document.getElementById('quizSection').classList.add('active');
            currentQuestion = 0;
            scores = { surfer: 0, chill: 0, social: 0, artist: 0 };
            showQuestion();
            
            // Log analytics
            logEvent('haleana_quiz_start');
        }
        
        function showQuestion() {
            const question = questions[currentQuestion];
            document.getElementById('questionNumber').textContent = `คำถามที่ ${currentQuestion + 1}/${questions.length}`;
            document.getElementById('progressFill').style.width = `${((currentQuestion) / questions.length) * 100}%`;
            document.getElementById('questionText').textContent = question.text;
            
            const optionsContainer = document.getElementById('options');
            optionsContainer.innerHTML = '';
            
            // Shuffle options
            const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
            
            shuffledOptions.forEach(option => {
                const btn = document.createElement('button');
                btn.className = 'option-btn';
                btn.textContent = option.text;
                btn.onclick = (e) => {
                    e.target.blur();
                    selectOption(option.type);
                };
                optionsContainer.appendChild(btn);
            });
        }
        
        function selectOption(type) {
            scores[type]++;
            currentQuestion++;
            
            if (currentQuestion < questions.length) {
                showQuestion();
            } else {
                showResult();
            }
        }
        
        function showResult() {
            document.getElementById('quizSection').classList.remove('active');
            document.getElementById('resultSection').classList.add('active');
            document.getElementById('progressFill').style.width = '100%';
            
            // Find highest score
            let maxType = 'chill';
            let maxScore = 0;
            for (const [type, score] of Object.entries(scores)) {
                if (score > maxScore) {
                    maxScore = score;
                    maxType = type;
                }
            }
            
            const result = results[maxType];
            
            // Update result card
            document.getElementById('resultEmoji').textContent = result.emoji;
            document.getElementById('resultType').textContent = result.type;
            document.getElementById('resultTitle').textContent = result.title;
            document.getElementById('resultDesc').textContent = result.desc;
            document.getElementById('matchValue').textContent = `${result.match} ของคนที่เล่น`;
            
            // Update share card
            document.getElementById('shareEmoji').textContent = result.emoji;
            document.getElementById('shareType').textContent = result.type;
            document.getElementById('shareTitle').textContent = result.title;
            document.getElementById('shareDesc').textContent = result.desc;
            
            // Traits
            const traitsHtml = result.traits.map(t => `<span class="trait-tag">${t}</span>`).join('');
            document.getElementById('resultTraits').innerHTML = traitsHtml;
            document.getElementById('shareTraits').innerHTML = traitsHtml;
            
            // Confetti!
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            
            // Log analytics
            logEvent('haleana_quiz_complete', {
                result_type: maxType,
                result_title: result.title
            });
        }
        
        function shareResult() {
            const shareUrl = window.location.href;
            
            Swal.fire({
                title: '🔗 แชร์ผลลัพธ์',
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
                        <div style="font-size: 4rem; animation: bounce 0.6s ease infinite;">🌺</div>
                        <p style="color: #38b6ff; margin-top: 15px;">✅ คัดลอกลิงก์รอแล้ว! กรุณารอสักครู่...</p>
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
            
            try {
                const shareCard = document.getElementById('shareCard');
                shareCard.style.left = '0';
                
                await new Promise(resolve => setTimeout(resolve, 300));
                
                const canvas = await html2canvas(shareCard, {
                    width: 1080,
                    height: 1920,
                    scale: 1
                });
                
                shareCard.style.left = '-9999px';
                
                const imageDataUrl = canvas.toDataURL('image/png');
                window.currentStoryImage = imageDataUrl;
                
                Swal.fire({
                    title: '🎉 สร้างรูปสำเร็จ!',
                    html: `
                        <div style="text-align: center;">
                            <p style="color: #38b6ff; margin-bottom: 10px;">✅ คัดลอกลิงก์แล้ว!</p>
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
                                <img src="${imageDataUrl}" style="width: 100%; display: block;">
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                                <button onclick="downloadStoryImage()" class="swal2-styled" style="
                                    background: linear-gradient(135deg, #38b6ff, #1a8fcc);
                                    padding: 10px 12px;
                                    border-radius: 10px;
                                    font-size: 0.8rem;
                                    width: 100%;
                                ">
                                    <i class="fa-solid fa-download"></i> ดาวน์โหลด
                                </button>
                                <button onclick="copyShareLink()" class="swal2-styled" style="
                                    background: linear-gradient(135deg, #e3b93d, #d4a52a);
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
                
            } catch (error) {
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
                link.download = 'Haleana-result.png';
                link.href = window.currentStoryImage;
                link.click();
                
                // Log analytics
                logEvent('haleana_share_download');
            }
        }
        
        function retryQuiz() {
            document.getElementById('resultSection').classList.remove('active');
            document.getElementById('startScreen').classList.remove('hidden');
            
            // Log analytics
            logEvent('haleana_quiz_retry');
        }