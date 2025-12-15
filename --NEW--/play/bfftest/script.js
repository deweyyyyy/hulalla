// Firebase Configuration
const firebaseConfig = window.HLL_KEYS.firebase;

// Initialize Firebase
let analytics = null;
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    analytics = firebase.analytics ? firebase.analytics() : null;
    console.log('Firebase Analytics initialized');
} catch (e) {
    console.log('Firebase Analytics not available:', e);
}

// Log event helper function
function logEvent(eventName, params = {}) {
    if (analytics) {
        try {
            analytics.logEvent(eventName, params);
        } catch (e) {
            console.log('Error logging event:', e);
        }
    }
}

// BFF Compatibility Test - Questions for both players
const questions = [
    {
        text: "ถ้าได้เงินมา 1 ล้านบาท จะทำอะไรเป็นอย่างแรก?",
        options: [
            "ไปเที่ยวต่างประเทศเลย!",
            "เก็บไว้ก่อน ค่อยคิด",
            "ซื้อของที่อยากได้มานาน",
            "แบ่งให้ครอบครัว/เพื่อน"
        ]
    },
    {
        text: "วันหยุดในฝัน คือวันแบบไหน?",
        options: [
            "นอนอยู่บ้านทั้งวัน ดูหนัง",
            "ออกไปเที่ยว หาที่ใหม่ๆ",
            "นัดเจอเพื่อน กินข้าว คุยกัน",
            "ทำกิจกรรมที่ชอบ (วาดรูป/อ่านหนังสือ/เล่นเกม)"
        ]
    },
    {
        text: "เวลาเครียดหรือเศร้า ทำยังไง?",
        options: [
            "อยากอยู่คนเดียวเงียบๆ",
            "หาคนคุยด้วย ระบาย",
            "กินของอร่อยๆ ให้รางวัลตัวเอง",
            "ฟังเพลง ดูหนัง หาอะไรทำให้ลืม"
        ]
    },
    {
        text: "อาหารประเภทไหนที่ชอบที่สุด?",
        options: [
            "อาหารญี่ปุ่น (ซูชิ ราเมน)",
            "อาหารไทยรสจัด",
            "อาหารตะวันตก (พิซซ่า สเต็ก)",
            "ของหวาน/ชานม"
        ]
    },
    {
        text: "เพื่อนที่ดีที่สุดควรเป็นแบบไหน?",
        options: [
            "คนที่รับฟังและเข้าใจเรา",
            "คนที่ตลก ทำให้หัวเราะได้",
            "คนที่ซื่อสัตย์ พูดตรงๆ",
            "คนที่พร้อมอยู่ข้างๆ ไม่ว่าจะเกิดอะไร"
        ]
    },
    {
        text: "ถ้าต้องเลือกพลังพิเศษ 1 อย่าง?",
        options: [
            "อ่านใจคนอื่นได้",
            "ย้อนเวลาได้",
            "ล่องหนได้",
            "บินได้"
        ]
    },
    {
        text: "สิ่งที่กลัวที่สุดคืออะไร?",
        options: [
            "ความสูง",
            "แมลง/สัตว์บางชนิด",
            "ความมืด/ผี",
            "การถูกทิ้ง/อยู่คนเดียว"
        ]
    },
    {
        text: "ถ้าเกิดใหม่ อยากเป็นอะไร?",
        options: [
            "เกิดใหม่เป็นตัวเองนี่แหละ",
            "เป็นสัตว์น่ารัก (แมว/หมา)",
            "เป็นคนรวย มีชื่อเสียง",
            "เป็นคนต่างประเทศ"
        ]
    },
    {
        text: "สิ่งที่ทนไม่ได้ในตัวคนอื่น?",
        options: [
            "คนโกหก/ไม่จริงใจ",
            "คนเห็นแก่ตัว",
            "คนดราม่า/ชอบนินทา",
            "คนไม่ตรงเวลา"
        ]
    },
    {
        text: "ถ้าพรุ่งนี้โลกจะแตก วันนี้จะทำอะไร?",
        options: [
            "ใช้เวลากับคนที่รัก",
            "ทำสิ่งที่ไม่เคยกล้าทำ",
            "กินของอร่อยทั้งวัน",
            "ไปที่ที่อยากไปมานาน"
        ]
    }
];

// Compatibility Results
const compatibilityResults = {
    perfect: {
        emoji: "👯‍♀️",
        title: "Soul Mates ตัวจริง!",
        desc: "ว้าว! คุณสองคนเข้ากันได้อย่างไม่น่าเชื่อ เหมือนแยกออกมาจากคนเดียวกัน ความสัมพันธ์นี้หาได้ยากมาก รักษาไว้ให้ดีนะ!",
        level: "เพื่อนตายตลอดกาล"
    },
    great: {
        emoji: "💕",
        title: "Best Friends Forever!",
        desc: "คุณสองคนเป็นเพื่อนที่เข้าใจกันดีมาก มีอะไรเหมือนกันเยอะ และสามารถพึ่งพากันได้ มิตรภาพนี้แข็งแกร่งมาก!",
        level: "เพื่อนซี้ตลอดกาล"
    },
    good: {
        emoji: "✨",
        title: "เพื่อนสนิทที่ลงตัว",
        desc: "แม้จะมีบางอย่างที่ต่างกัน แต่นั่นทำให้เติมเต็มกันได้ดี คุณสองคนมีเคมีที่ลงตัวและเข้าใจกันดี!",
        level: "เพื่อนสนิท"
    },
    okay: {
        emoji: "🌈",
        title: "ต่างคนต่างสไตล์",
        desc: "คุณสองคนมีความต่างที่ทำให้การอยู่ด้วยกันไม่เคยน่าเบื่อ! ความต่างนี้สามารถทำให้เรียนรู้จากกันและกันได้",
        level: "เพื่อนที่น่าค้นหา"
    },
    different: {
        emoji: "🎭",
        title: "ขั้วตรงข้ามที่ดึงดูดกัน",
        desc: "ถึงจะต่างกันมาก แต่นั่นก็เป็นเสน่ห์! ความต่างทำให้เห็นมุมมองใหม่ๆ และท้าทายกันและกัน",
        level: "เพื่อนที่ท้าทาย"
    }
};

// Shared traits based on matching answers
const sharedTraits = [
    "ชอบผจญภัย",
    "รักอิสระ",
    "ใจกว้าง",
    "ซื่อสัตย์",
    "มีความฝัน",
    "รักครอบครัว",
    "ชอบอาหารอร่อย",
    "หัวใจกล้าหาญ",
    "โรแมนติก",
    "ยืดหยุ่น"
];

// Game state
let currentPlayer = 1;
let currentQuestion = 0;
let player1Answers = [];
let player2Answers = [];
let player1Name = "";
let player2Name = "";
let currentTraits = []; // Store traits to use in both web and image
let currentCompatibility = null; // Store compatibility result
let currentResultType = null; // Store result type

// DOM Elements
const startScreen = document.getElementById('startScreen');
const questionScreen = document.getElementById('questionScreen');
const switchScreen = document.getElementById('switchScreen');
const loadingScreen = document.getElementById('loadingScreen');
const resultScreen = document.getElementById('resultScreen');

// Start Quiz
function startQuiz() {
    player1Name = document.getElementById('player1Name').value.trim() || "เพื่อนคนที่ 1";
    
    // Log analytics event
    logEvent('bff_test_start');
    
    currentPlayer = 1;
    currentQuestion = 0;
    player1Answers = [];
    player2Answers = [];
    
    document.getElementById('currentPlayerName').textContent = player1Name;
    
    startScreen.classList.remove('active');
    questionScreen.classList.add('active');
    
    showQuestion();
}

// Start Player 2
function startPlayer2() {
    player2Name = document.getElementById('player2Name').value.trim() || "เพื่อนคนที่ 2";
    
    currentPlayer = 2;
    currentQuestion = 0;
    
    document.getElementById('currentPlayerName').textContent = player2Name;
    
    switchScreen.classList.remove('active');
    questionScreen.classList.add('active');
    
    showQuestion();
}

// Show Question
function showQuestion() {
    const question = questions[currentQuestion];
    const questionNumber = document.getElementById('questionNumber');
    const questionText = document.getElementById('questionText');
    const optionsContainer = document.getElementById('optionsContainer');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const playerIndicator = document.getElementById('playerIndicator');
    
    // Update player indicator
    const currentName = currentPlayer === 1 ? player1Name : player2Name;
    document.getElementById('currentPlayerName').textContent = currentName;
    
    // Update progress
    const totalProgress = currentPlayer === 1 
        ? currentQuestion 
        : questions.length + currentQuestion;
    const totalQuestions = questions.length * 2;
    const progress = (totalProgress / totalQuestions) * 100;
    progressFill.style.width = progress + '%';
    progressText.textContent = `${currentQuestion + 1}/${questions.length}`;
    
    // Update question
    questionNumber.textContent = `คำถามที่ ${currentQuestion + 1}`;
    questionText.textContent = question.text;
    
    // Create options
    optionsContainer.innerHTML = '';
    question.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.onclick = (e) => {
            e.target.blur();
            selectOption(index);
        };
        optionsContainer.appendChild(btn);
    });
}

// Select Option
function selectOption(optionIndex) {
    if (currentPlayer === 1) {
        player1Answers.push(optionIndex);
    } else {
        player2Answers.push(optionIndex);
    }
    
    currentQuestion++;
    
    if (currentQuestion < questions.length) {
        // Next question with animation
        const questionContainer = document.querySelector('.question-container');
        questionContainer.style.animation = 'none';
        setTimeout(() => {
            questionContainer.style.animation = 'fadeIn 0.5s ease';
            showQuestion();
        }, 50);
    } else {
        // Player finished all questions
        if (currentPlayer === 1) {
            // Switch to player 2
            questionScreen.classList.remove('active');
            switchScreen.classList.add('active');
        } else {
            // Both done, show loading then result
            showLoading();
        }
    }
}

// Show Loading
function showLoading() {
    questionScreen.classList.remove('active');
    loadingScreen.classList.add('active');
    
    setTimeout(() => {
        loadingScreen.classList.remove('active');
        showResult();
    }, 2500);
}

// Calculate Compatibility
function calculateCompatibility() {
    let matchCount = 0;
    
    for (let i = 0; i < questions.length; i++) {
        if (player1Answers[i] === player2Answers[i]) {
            matchCount++;
        }
    }
    
    // Calculate percentage with some randomness for variety
    const baseScore = (matchCount / questions.length) * 100;
    const randomBonus = Math.floor(Math.random() * 10) - 5; // -5 to +5
    const finalScore = Math.min(100, Math.max(50, baseScore + randomBonus));
    
    return {
        score: Math.round(finalScore),
        matchCount: matchCount
    };
}

// Get Result Based on Score
function getResultType(score) {
    if (score >= 90) return 'perfect';
    if (score >= 75) return 'great';
    if (score >= 60) return 'good';
    if (score >= 45) return 'okay';
    return 'different';
}

// Get Random Shared Traits
function getSharedTraits(matchCount) {
    const shuffled = [...sharedTraits].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.max(2, Math.min(matchCount, 5)));
}

// Show Result
function showResult() {
    const compatibility = calculateCompatibility();
    const resultType = getResultType(compatibility.score);
    const result = compatibilityResults[resultType];
    const traits = getSharedTraits(compatibility.matchCount);
    
    // Store results globally to use in story image
    currentTraits = traits;
    currentCompatibility = compatibility;
    currentResultType = resultType;
    
    // Log analytics event with result
    logEvent('bff_test_complete', {
        compatibility_score: compatibility.score,
        result_type: resultType,
        result_title: result.title,
        match_count: compatibility.matchCount
    });
    
    // Update display
    document.getElementById('name1Display').textContent = player1Name;
    document.getElementById('name2Display').textContent = player2Name;
    document.getElementById('compatibilityScore').textContent = compatibility.score;
    document.getElementById('resultEmoji').textContent = result.emoji;
    document.getElementById('resultTitle').textContent = result.title;
    document.getElementById('resultDesc').textContent = result.desc;
    document.getElementById('matchCount').textContent = `${compatibility.matchCount}/${questions.length}`;
    document.getElementById('friendLevel').textContent = result.level;
    
    // Add traits
    const traitsContainer = document.getElementById('traitsContainer');
    traitsContainer.innerHTML = '';
    traits.forEach(trait => {
        const tag = document.createElement('span');
        tag.className = 'trait-tag';
        tag.textContent = trait;
        traitsContainer.appendChild(tag);
    });
    
    resultScreen.classList.add('active');
    
    // Confetti based on score!
    const confettiColors = ['#FF6B9D', '#C44569', '#F38181', '#ffffff', '#FFD1DC'];
    
    if (compatibility.score >= 75) {
        // Big celebration
        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: confettiColors
        });
    } else {
        // Small celebration
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: confettiColors
        });
    }
}

// Open Share Modal
function openShareModal() {
    const shareUrl = window.location.href;
    
    Swal.fire({
        title: '📤 แชร์ผลลัพธ์',
        html: `
            <p style="margin-bottom: 15px; color: #666;">เลือกวิธีแชร์</p>
            <div class="share-options">
                <button class="share-option-btn" onclick="copyShareLink()">
                    <i class="fa-solid fa-link"></i>
                    <span>คัดลอกลิงก์</span>
                </button>
                <button class="share-option-btn story-btn" onclick="generateStoryImage()">
                    <i class="fa-brands fa-instagram"></i>
                    <span>บันทึกรูป 9:16</span>
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
        showCloseButton: true,
        customClass: {
            popup: 'share-modal-popup'
        }
    });
}

// Copy Share Link
function copyShareLink() {
    const shareUrl = window.location.href;
    
    // Log analytics event
    logEvent('bff_share_link_copy');
    
    navigator.clipboard.writeText(shareUrl).then(() => {
        Swal.fire({
            icon: 'success',
            title: 'คัดลอกลิงก์แล้ว! 📋',
            text: 'พร้อมส่งให้เพื่อนได้เลย',
            timer: 1500,
            showConfirmButton: false
        });
    });
}

// Generate Story Image (9:16)
async function generateStoryImage() {
    // Use stored results instead of recalculating
    const compatibility = currentCompatibility;
    const resultType = currentResultType;
    const result = compatibilityResults[resultType];
    // Use stored traits instead of generating new ones
    const traits = currentTraits;
    
    // Log analytics event
    logEvent('bff_share_story_image', { 
        compatibility_score: compatibility.score,
        result_type: resultType 
    });
    
    // Show loading
    Swal.fire({
        title: '🎨 กำลังสร้างรูปภาพ...',
        html: `
            <div style="text-align: center; padding: 20px 0;">
                <div style="font-size: 4rem; animation: bounce 0.6s ease infinite;">💕</div>
                <p style="color: #666; margin-top: 15px;">กรุณารอสักครู่...</p>
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
                        background: linear-gradient(90deg, #FF6B9D, #C44569, #FF6B9D);
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
        allowOutsideClick: false
    });
    
    // Create story canvas (1080x1920 - 9:16)
    const storyContainer = document.createElement('div');
    storyContainer.id = 'storyCanvas';
    storyContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 1080px;
        height: 1920px;
        background: linear-gradient(180deg, #FF6B9D 0%, #C44569 50%, #F38181 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 80px 60px;
        z-index: 10000;
        font-family: 'Prompt', sans-serif;
    `;
    
    // Build traits HTML
    let traitsHtml = traits.map(trait => `
        <span style="
            background: rgba(255, 255, 255, 0.25);
            padding: 12px 24px;
            border-radius: 50px;
            font-size: 32px;
            font-weight: 500;
        ">${trait}</span>
    `).join('');
    
    storyContainer.innerHTML = `
        <div style="
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            overflow: hidden;
        ">
            <div style="position: absolute; top: 5%; left: 8%; font-size: 80px; opacity: 0.2;">💕</div>
            <div style="position: absolute; top: 15%; right: 10%; font-size: 60px; opacity: 0.15;">✨</div>
            <div style="position: absolute; top: 70%; left: 5%; font-size: 70px; opacity: 0.2;">👯</div>
            <div style="position: absolute; top: 80%; right: 8%; font-size: 50px; opacity: 0.15;">💫</div>
            <div style="position: absolute; top: 40%; right: 5%; font-size: 60px; opacity: 0.2;">🌈</div>
        </div>
        
        <div style="text-align: center; margin-bottom: 40px; position: relative; z-index: 1;">
            <div style="font-size: 100px; margin-bottom: 20px;">👯‍♀️</div>
            <h1 style="
                font-size: 64px;
                color: white;
                text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                margin-bottom: 10px;
                font-weight: 700;
            ">BFF Compatibility Test</h1>
        </div>
        
        <div style="
            background: rgba(255, 255, 255, 0.95);
            border-radius: 40px;
            padding: 60px 50px;
            text-align: center;
            width: 900px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
            position: relative;
            z-index: 1;
        ">
            <div style="
                font-size: 42px;
                font-weight: 600;
                color: #FF6B9D;
                margin-bottom: 30px;
            ">
                ${player1Name} <span style="font-size: 50px;">💕</span> ${player2Name}
            </div>
            
            <div style="
                width: 220px;
                height: 220px;
                background: linear-gradient(135deg, #FF6B9D, #C44569);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 30px;
                box-shadow: 0 10px 40px rgba(255, 107, 157, 0.4);
            ">
                <span style="font-size: 72px; font-weight: 700; color: white;">${compatibility.score}%</span>
            </div>
            
            <div style="font-size: 80px; margin-bottom: 15px;">${result.emoji}</div>
            <h2 style="
                font-size: 48px;
                font-weight: 700;
                color: #333;
                margin-bottom: 20px;
            ">${result.title}</h2>
            
            <p style="
                font-size: 32px;
                color: #666;
                margin-bottom: 30px;
                line-height: 1.5;
            ">${result.desc}</p>
            
            <div style="
                display: flex;
                justify-content: center;
                gap: 30px;
                margin-bottom: 25px;
            ">
                <div style="
                    background: #FFF5F7;
                    padding: 20px 30px;
                    border-radius: 16px;
                    text-align: center;
                ">
                    <div style="font-size: 26px; color: #999; margin-bottom: 5px;">คำตอบที่ตรงกัน</div>
                    <div style="font-size: 36px; font-weight: 700; color: #FF6B9D;">${compatibility.matchCount}/${questions.length}</div>
                </div>
                <div style="
                    background: #FFF5F7;
                    padding: 20px 30px;
                    border-radius: 16px;
                    text-align: center;
                ">
                    <div style="font-size: 26px; color: #999; margin-bottom: 5px;">ระดับความสนิท</div>
                    <div style="font-size: 36px; font-weight: 700; color: #FF6B9D;">${result.level}</div>
                </div>
            </div>
        </div>
        
        <div style="
            margin-top: 50px;
            text-align: center;
            position: relative;
            z-index: 1;
        ">
            <p style="
                font-size: 36px;
                color: white;
                margin-bottom: 15px;
                text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            ">สิ่งที่คู่นี้มีเหมือนกัน</p>
            <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; color: white;">
                ${traitsHtml}
            </div>
        </div>
        
        <div style="
            position: absolute;
            bottom: 80px;
            left: 0;
            right: 0;
            text-align: center;
            z-index: 1;
        ">
            <div style="
                background: rgba(255, 255, 255, 0.2);
                padding: 20px 40px;
                border-radius: 20px;
                display: inline-block;
            ">
                <p style="font-size: 28px; color: white; opacity: 0.9;">มาทดสอบความเข้ากันกับเพื่อนกันเถอะ!</p>
                <p style="font-size: 26px; color: white; margin-top: 10px; font-weight: 600;">hulalla.com/play/bfftest</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(storyContainer);
    
    // Wait for fonts to load
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Store share URL
    const shareUrl = window.location.href;
    
    try {
        const canvas = await html2canvas(storyContainer, {
            scale: 1,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#FF6B9D',
            width: 1080,
            height: 1920
        });
        
        // Remove story container
        document.body.removeChild(storyContainer);
        
        // Convert to data URL
        const imageDataUrl = canvas.toDataURL('image/png');
        
        // Store for other functions
        window.currentStoryImageData = imageDataUrl;
        window.currentStoryFileName = `bff-test-${player1Name}-${player2Name}-story.png`;
        window.currentShareUrl = shareUrl;
        
        // Show modal with image preview and action buttons
        Swal.fire({
            title: '🎉 สร้างรูปสำเร็จ!',
            html: `
                <div style="text-align: center;">
                    <p style="color: #666; margin-bottom: 10px; font-size: 0.9rem;">
                        📋 กดปุ่มด้านล่างเพื่อดำเนินการ
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
                            background: linear-gradient(135deg, #FF6B9D, #C44569);
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
        
    } catch (error) {
        console.error('Error generating story image:', error);
        document.body.removeChild(storyContainer);
        
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถสร้างรูปภาพได้ กรุณาลองใหม่อีกครั้ง',
            confirmButtonColor: '#FF6B9D'
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
    
    Swal.fire({
        icon: 'success',
        title: 'กำลังดาวน์โหลด... 📥',
        timer: 1500,
        showConfirmButton: false
    });
}

// Copy current share URL
async function copyCurrentShareUrl() {
    if (!window.currentShareUrl) return;
    
    try {
        await navigator.clipboard.writeText(window.currentShareUrl);
        Swal.fire({
            icon: 'success',
            title: 'คัดลอกลิงก์แล้ว! 📋',
            timer: 1500,
            showConfirmButton: false
        });
    } catch (e) {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = window.currentShareUrl;
        textArea.style.cssText = 'position:fixed;top:0;left:0;width:2em;height:2em;padding:0;border:none;outline:none;box-shadow:none;background:transparent;';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            Swal.fire({
                icon: 'success',
                title: 'คัดลอกลิงก์แล้ว! 📋',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (err) {
            prompt('คัดลอกลิงก์นี้:', window.currentShareUrl);
        }
        
        document.body.removeChild(textArea);
    }
}

// Open story image URL in new tab
function openStoryImageUrl() {
    if (!window.currentStoryImageData) return;
    
    const newTab = window.open();
    if (newTab) {
        newTab.document.write(`
            <html>
                <head>
                    <title>BFF Test - ${player1Name} & ${player2Name}</title>
                    <style>
                        body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #1a1a2e; }
                        img { max-width: 100%; max-height: 100vh; }
                    </style>
                </head>
                <body>
                    <img src="${window.currentStoryImageData}" alt="BFF Test Result">
                </body>
            </html>
        `);
        newTab.document.close();
    } else {
        Swal.fire({
            icon: 'warning',
            title: 'ไม่สามารถเปิดหน้าต่างใหม่ได้',
            text: 'กรุณาอนุญาต popup ในเบราว์เซอร์',
            confirmButtonColor: '#FF6B9D'
        });
    }
}

// Copy story image to clipboard
async function copyStoryImage() {
    if (!window.currentStoryImageData) return;
    
    try {
        const response = await fetch(window.currentStoryImageData);
        const blob = await response.blob();
        
        await navigator.clipboard.write([
            new ClipboardItem({
                'image/png': blob
            })
        ]);
        
        Swal.fire({
            icon: 'success',
            title: 'คัดลอกรูปแล้ว! 📋',
            timer: 1500,
            showConfirmButton: false
        });
    } catch (error) {
        console.error('Copy failed:', error);
        Swal.fire({
            icon: 'info',
            title: 'กดค้างที่รูปเพื่อบันทึก 👆',
            text: 'เบราว์เซอร์ไม่รองรับการคัดลอกรูป',
            confirmButtonColor: '#FF6B9D'
        });
    }
}

// Save Result (regular size)
function saveResult() {
    const resultCard = document.getElementById('resultCard');
    
    html2canvas(resultCard, {
        scale: 2,
        backgroundColor: '#FF6B9D',
        useCORS: true
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `bff-test-${player1Name}-${player2Name}.png`;
        link.href = canvas.toDataURL();
        link.click();
    });
}

// Restart Quiz
function restartQuiz() {
    currentPlayer = 1;
    currentQuestion = 0;
    player1Answers = [];
    player2Answers = [];
    player1Name = "";
    player2Name = "";
    
    document.getElementById('player1Name').value = '';
    document.getElementById('player2Name').value = '';
    
    resultScreen.classList.remove('active');
    startScreen.classList.add('active');
}
