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

// MBTI Quiz Questions - 12 questions to determine E/I, S/N, T/F, J/P
const questions = [
    // E vs I (3 questions)
    {
        text: "ในงานปาร์ตี้ คุณจะทำอะไร?",
        options: [
            { text: "เข้าไปคุยกับคนใหม่ๆ เลย สนุกดี!", type: "E" },
            { text: "หาเพื่อนสนิทคุยเป็นกลุ่มเล็กๆ", type: "I" },
            { text: "เดินดูรอบๆ แล้วค่อยเริ่มคุย", type: "E" },
            { text: "นั่งชิลๆ รอให้คนมาคุยด้วย", type: "I" }
        ]
    },
    {
        text: "วันหยุดยาว คุณอยากทำอะไร?",
        options: [
            { text: "นัดเพื่อนไปเที่ยว ยิ่งเยอะยิ่งสนุก", type: "E" },
            { text: "อยู่บ้านอ่านหนังสือ ดูหนัง พักผ่อน", type: "I" },
            { text: "ไปคาเฟ่ใหม่ๆ หรือที่ที่คนเยอะๆ", type: "E" },
            { text: "ทำกิจกรรมที่ชอบคนเดียวหรือกับคนสนิท", type: "I" }
        ]
    },
    {
        text: "เวลาต้องตัดสินใจเรื่องสำคัญ คุณจะ...",
        options: [
            { text: "ปรึกษาเพื่อนหลายๆ คน ฟังความเห็น", type: "E" },
            { text: "คิดเองในหัว วิเคราะห์ข้อมูลคนเดียว", type: "I" },
            { text: "คุยกับคนที่ไว้ใจแล้วตัดสินใจ", type: "E" },
            { text: "เขียนข้อดีข้อเสีย ใช้เวลาคิดคนเดียว", type: "I" }
        ]
    },
    // S vs N (3 questions)
    {
        text: "เวลาเรียนหรือทำงาน คุณชอบแบบไหน?",
        options: [
            { text: "มีขั้นตอนชัดเจน ทำตามได้เลย", type: "S" },
            { text: "ให้โจทย์มา แล้วให้คิดวิธีเอง", type: "N" },
            { text: "มีตัวอย่างให้ดู แล้วทำตาม", type: "S" },
            { text: "ได้ทดลองไอเดียใหม่ๆ แม้จะไม่เคยทำ", type: "N" }
        ]
    },
    {
        text: "คุณสนใจเรื่องแบบไหนมากกว่า?",
        options: [
            { text: "เรื่องที่เกิดขึ้นจริง ใช้ได้จริงในชีวิต", type: "S" },
            { text: "ทฤษฎี ไอเดีย ความเป็นไปได้ในอนาคต", type: "N" },
            { text: "ข้อเท็จจริง ตัวเลข สถิติ", type: "S" },
            { text: "ความหมายลึกๆ สัญลักษณ์ที่ซ่อนอยู่", type: "N" }
        ]
    },
    {
        text: "เวลาอ่านนิยายหรือดูหนัง คุณสังเกตอะไร?",
        options: [
            { text: "รายละเอียดของเรื่อง ฉาก เครื่องแต่งกาย", type: "S" },
            { text: "ธีมหลัก ความหมายที่ซ่อนอยู่", type: "N" },
            { text: "เนื้อเรื่องว่าเกิดอะไรขึ้นบ้าง", type: "S" },
            { text: "ตัวละครจะพัฒนาไปยังไง จบแบบไหน", type: "N" }
        ]
    },
    // T vs F (3 questions)
    {
        text: "เพื่อนมาปรึกษาปัญหา คุณจะ...",
        options: [
            { text: "วิเคราะห์ปัญหา หาทางแก้ให้เลย", type: "T" },
            { text: "รับฟัง เข้าใจความรู้สึกก่อน", type: "F" },
            { text: "ถามคำถามให้เพื่อนคิดหาทางออกเอง", type: "T" },
            { text: "ให้กำลังใจ บอกว่าทุกอย่างจะดีขึ้น", type: "F" }
        ]
    },
    {
        text: "เวลาต้องให้ feedback คนอื่น คุณจะ...",
        options: [
            { text: "บอกตรงๆ ว่าต้องปรับอะไร ตรงประเด็น", type: "T" },
            { text: "ชมก่อน แล้วค่อยแนะนำอย่างนุ่มนวล", type: "F" },
            { text: "เน้นข้อเท็จจริง ไม่เอาอารมณ์มาเกี่ยว", type: "T" },
            { text: "คำนึงว่าเขาจะรู้สึกยังไง", type: "F" }
        ]
    },
    {
        text: "คุณภูมิใจกับตัวเองเมื่อไหร่?",
        options: [
            { text: "ทำเป้าหมายสำเร็จ แก้ปัญหายากๆ ได้", type: "T" },
            { text: "ช่วยให้คนอื่นมีความสุข สร้างความสัมพันธ์ดีๆ", type: "F" },
            { text: "ได้รับรางวัลหรือการยอมรับจากผลงาน", type: "T" },
            { text: "ทำให้คนรอบข้างภูมิใจในตัวเรา", type: "F" }
        ]
    },
    // J vs P (3 questions)
    {
        text: "เวลาไปเที่ยว คุณวางแผนยังไง?",
        options: [
            { text: "วางแผนล่วงหน้า จองที่พัก ลิสต์ที่เที่ยว", type: "J" },
            { text: "ไปถึงแล้วค่อยดูว่าอยากไปไหน", type: "P" },
            { text: "มีแผนหลัก แต่ยืดหยุ่นได้บ้าง", type: "J" },
            { text: "แค่จองตั๋วกับที่พัก ที่เหลือแล้วแต่อารมณ์", type: "P" }
        ]
    },
    {
        text: "ห้องของคุณเป็นยังไง?",
        options: [
            { text: "เป็นระเบียบ ของอยู่ที่เดิมเสมอ", type: "J" },
            { text: "รก แต่รู้ว่าของอยู่ไหน", type: "P" },
            { text: "มีระบบจัดเก็บชัดเจน", type: "J" },
            { text: "สร้างสรรค์! มีของวางเยอะแต่มีเสน่ห์", type: "P" }
        ]
    },
    {
        text: "เวลามี deadline คุณจะ...",
        options: [
            { text: "ทำเสร็จก่อนกำหนดเสมอ ไม่ชอบเร่ง", type: "J" },
            { text: "ทำตอนใกล้ deadline ทำได้ดีกว่าตอนกดดัน", type: "P" },
            { text: "วางแผนแบ่งทำทีละนิด ตรงเวลาพอดี", type: "J" },
            { text: "เริ่มทำแล้วหยุดไปทำอย่างอื่น กลับมาทำใหม่", type: "P" }
        ]
    }
];

// MBTI Results - 16 types
const results = {
    "INTJ": {
        emoji: "🦉",
        type: "INTJ",
        title: "สถาปนิกแห่งความคิด",
        desc: "คุณคือนักคิดที่มีวิสัยทัศน์กว้างไกล วางแผนอย่างรอบคอบ และมุ่งมั่นที่จะบรรลุเป้าหมาย คุณเชื่อในเหตุผลและความรู้ มีความสามารถในการมองเห็นภาพรวมและวางกลยุทธ์ได้ดีเยี่ยม",
        traits: ["มีวิสัยทัศน์", "มุ่งมั่น", "อิสระ", "วางแผนเก่ง"],
        match: "2%",
        compatible: "ENFP, ENTP"
    },
    "INTP": {
        emoji: "🧪",
        type: "INTP",
        title: "นักคิดวิเคราะห์",
        desc: "คุณคือนักคิดที่รักการเรียนรู้และวิเคราะห์ ชอบตั้งคำถามและหาคำตอบ สนใจทฤษฎีและความเป็นไปได้มากกว่าสิ่งที่เป็นอยู่ มีความคิดสร้างสรรค์และมองโลกในมุมที่ไม่เหมือนใคร",
        traits: ["ช่างวิเคราะห์", "สร้างสรรค์", "รักเรียนรู้", "มีเหตุผล"],
        match: "3%",
        compatible: "ENTJ, ESTJ"
    },
    "ENTJ": {
        emoji: "🦁",
        type: "ENTJ",
        title: "ผู้นำแห่งความมุ่งมั่น",
        desc: "คุณคือผู้นำที่เกิดมาเพื่อนำ! มีความมั่นใจ กล้าตัดสินใจ และสามารถสร้างแรงบันดาลใจให้คนรอบข้าง คุณมองเห็นปัญหาเป็นความท้าทาย และไม่กลัวที่จะเปลี่ยนแปลง",
        traits: ["ผู้นำ", "มั่นใจ", "มีประสิทธิภาพ", "กล้าหาญ"],
        match: "2%",
        compatible: "INFP, INTP"
    },
    "ENTP": {
        emoji: "🦊",
        type: "ENTP",
        title: "นักโต้วาทีสร้างสรรค์",
        desc: "คุณคือนักคิดที่รักการท้าทายไอเดีย ชอบถกเถียงและหาความจริง มีไอเดียใหม่ๆ อยู่เสมอ และกล้าที่จะตั้งคำถามกับสิ่งที่คนอื่นยอมรับ คุณเป็นคนที่ทำให้การสนทนาสนุกขึ้นเสมอ",
        traits: ["สร้างสรรค์", "ฉลาด", "กล้าท้าทาย", "ช่างคิด"],
        match: "3%",
        compatible: "INFJ, INTJ"
    },
    "INFJ": {
        emoji: "🦋",
        type: "INFJ",
        title: "ผู้สนับสนุนอันอ่อนโยน",
        desc: "คุณคือคนที่มีความเข้าใจคนอื่นอย่างลึกซึ้ง มีอุดมคติและต้องการทำให้โลกดีขึ้น คุณเป็นคนที่คนอื่นรู้สึกปลอดภัยที่จะเปิดใจ และคุณมักจะรู้ว่าคนอื่นรู้สึกอย่างไรโดยไม่ต้องบอก",
        traits: ["เข้าอกเข้าใจ", "มีอุดมคติ", "ลึกซึ้ง", "ทุ่มเท"],
        match: "1%",
        compatible: "ENFP, ENTP"
    },
    "INFP": {
        emoji: "🌸",
        type: "INFP",
        title: "นักฝันอันอ่อนโยน",
        desc: "คุณคือคนที่มีจินตนาการและความฝันสูง มีความอ่อนไหวและเข้าใจคนอื่นได้ดี คุณแสวงหาความหมายในชีวิตและต้องการใช้ชีวิตอย่างมีคุณค่า คุณเป็นตัวของตัวเองเสมอ",
        traits: ["ช่างฝัน", "อ่อนโยน", "สร้างสรรค์", "จริงใจ"],
        match: "4%",
        compatible: "ENFJ, ENTJ"
    },
    "ENFJ": {
        emoji: "🌟",
        type: "ENFJ",
        title: "ผู้นำที่เข้าถึงใจ",
        desc: "คุณคือคนที่มีพรสวรรค์ในการสร้างแรงบันดาลใจ คุณเข้าใจคนอื่นและรู้วิธีดึงศักยภาพของพวกเขาออกมา คุณเป็นคนที่ทำให้คนรอบข้างรู้สึกมีค่าและเป็นที่ต้องการ",
        traits: ["มีเสน่ห์", "เข้าใจคน", "สร้างแรงบันดาลใจ", "ใส่ใจ"],
        match: "2%",
        compatible: "INFP, ISFP"
    },
    "ENFP": {
        emoji: "🎈",
        type: "ENFP",
        title: "นักสำรวจอันร่าเริง",
        desc: "คุณคือคนที่เต็มไปด้วยพลังและความกระตือรือร้น! มองโลกในแง่ดีและเห็นความเป็นไปได้ในทุกที่ คุณทำให้คนรอบข้างมีความสุขและสร้างบรรยากาศที่สนุกสนานได้เสมอ",
        traits: ["ร่าเริง", "สร้างสรรค์", "เป็นกันเอง", "มองโลกในแง่ดี"],
        match: "8%",
        compatible: "INFJ, INTJ"
    },
    "ISTJ": {
        emoji: "📋",
        type: "ISTJ",
        title: "ผู้รักษากฎเกณฑ์",
        desc: "คุณคือคนที่เชื่อถือได้มากที่สุด! รับผิดชอบ ตรงเวลา และทำตามสิ่งที่สัญญาเสมอ คุณให้ความสำคัญกับประเพณีและความถูกต้อง เป็นเสาหลักที่มั่นคงของทุกกลุ่ม",
        traits: ["รับผิดชอบ", "เชื่อถือได้", "มีระเบียบ", "ซื่อสัตย์"],
        match: "12%",
        compatible: "ESFP, ESTP"
    },
    "ISFJ": {
        emoji: "🏠",
        type: "ISFJ",
        title: "ผู้พิทักษ์อันอบอุ่น",
        desc: "คุณคือคนที่ใส่ใจและดูแลคนรอบข้างอย่างเงียบๆ จดจำรายละเอียดเล็กๆ น้อยๆ และทำให้คนรู้สึกพิเศษ คุณเป็นคนที่ทำให้บ้านรู้สึกอบอุ่นและปลอดภัย",
        traits: ["ใส่ใจ", "อบอุ่น", "รับผิดชอบ", "ทุ่มเท"],
        match: "13%",
        compatible: "ESFP, ESTP"
    },
    "ESTJ": {
        emoji: "⚖️",
        type: "ESTJ",
        title: "ผู้จัดการที่เด็ดขาด",
        desc: "คุณคือคนที่มีความสามารถในการจัดการและบริหาร ชอบความเป็นระเบียบและทำงานอย่างมีระบบ คุณเป็นคนตรงไปตรงมาและไม่ชอบอ้อมค้อม สามารถสร้างความสำเร็จให้ทีมได้",
        traits: ["เด็ดขาด", "มีระบบ", "ตรงไปตรงมา", "มีความสามารถ"],
        match: "9%",
        compatible: "ISFP, ISTP"
    },
    "ESFJ": {
        emoji: "🤗",
        type: "ESFJ",
        title: "ผู้ดูแลที่เป็นกันเอง",
        desc: "คุณคือคนที่มีหัวใจที่อบอุ่นและรักที่จะช่วยเหลือคนอื่น! ชอบสร้างความสามัคคีและทำให้ทุกคนรู้สึกเป็นส่วนหนึ่ง คุณจำวันเกิดทุกคนและใส่ใจรายละเอียดเล็กๆ น้อยๆ",
        traits: ["อบอุ่น", "เป็นกันเอง", "ใส่ใจ", "ช่วยเหลือ"],
        match: "12%",
        compatible: "ISFP, ISTP"
    },
    "ISTP": {
        emoji: "🔧",
        type: "ISTP",
        title: "ช่างฝีมือผู้ชาญฉลาด",
        desc: "คุณคือคนที่ชอบลงมือทำและแก้ปัญหาด้วยตัวเอง มีความสามารถในการวิเคราะห์และหาทางออกอย่างรวดเร็ว คุณเป็นคนที่ใจเย็นแม้ในสถานการณ์กดดัน",
        traits: ["มีทักษะ", "ใจเย็น", "วิเคราะห์", "ลงมือทำ"],
        match: "5%",
        compatible: "ESFJ, ESTJ"
    },
    "ISFP": {
        emoji: "🎨",
        type: "ISFP",
        title: "ศิลปินผู้อ่อนโยน",
        desc: "คุณคือคนที่มีความรู้สึกอ่อนไหวและมีศิลปะ ชอบแสดงออกผ่านความสร้างสรรค์ คุณใช้ชีวิตตามแบบของตัวเองและให้ความสำคัญกับความสวยงามในทุกสิ่ง",
        traits: ["ศิลปิน", "อ่อนโยน", "เป็นตัวเอง", "รักสวยรักงาม"],
        match: "9%",
        compatible: "ENFJ, ESFJ"
    },
    "ESTP": {
        emoji: "🏍️",
        type: "ESTP",
        title: "นักผจญภัยที่กล้าหาญ",
        desc: "คุณคือคนที่รักความตื่นเต้นและการลงมือทำ! ไม่ชอบนั่งเฉยๆ และพร้อมที่จะลองสิ่งใหม่ๆ เสมอ คุณเป็นคนที่ทำให้ทุกอย่างสนุกขึ้นและไม่กลัวความเสี่ยง",
        traits: ["กล้าหาญ", "สนุกสนาน", "ลงมือทำ", "ผจญภัย"],
        match: "4%",
        compatible: "ISFJ, ISTJ"
    },
    "ESFP": {
        emoji: "🎉",
        type: "ESFP",
        title: "ดาวแห่งความสนุก",
        desc: "คุณคือคนที่ทำให้ทุกที่กลายเป็นปาร์ตี้! เต็มไปด้วยพลังงานและความสนุกสนาน คุณใช้ชีวิตอย่างเต็มที่ในปัจจุบันและทำให้คนรอบข้างมีความสุขได้เสมอ",
        traits: ["สนุกสนาน", "เป็นกันเอง", "มีชีวิตชีวา", "รักอิสระ"],
        match: "9%",
        compatible: "ISFJ, ISTJ"
    }
};

// Quiz state
let currentQuestion = 0;
let answers = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
let currentTraits = []; // Store traits for story image generation

// DOM Elements
const startScreen = document.getElementById('startScreen');
const questionScreen = document.getElementById('questionScreen');
const loadingScreen = document.getElementById('loadingScreen');
const resultScreen = document.getElementById('resultScreen');

// Start Quiz
function startQuiz() {
    currentQuestion = 0;
    answers = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    
    // Log analytics event
    logEvent('mbti_quiz_start');
    
    startScreen.classList.remove('active');
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
    
    // Update progress
    const progress = ((currentQuestion) / questions.length) * 100;
    progressFill.style.width = progress + '%';
    progressText.textContent = `${currentQuestion + 1}/${questions.length}`;
    
    // Update question
    questionNumber.textContent = `คำถามที่ ${currentQuestion + 1}`;
    questionText.textContent = question.text;
    
    // Shuffle options
    const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
    
    // Create options
    optionsContainer.innerHTML = '';
    shuffledOptions.forEach((option, index) => {
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

// Select Option
function selectOption(type) {
    answers[type]++;
    
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
        // Show loading then result
        showLoading();
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

// Calculate MBTI type
function calculateMBTI() {
    let type = '';
    type += answers.E >= answers.I ? 'E' : 'I';
    type += answers.S >= answers.N ? 'S' : 'N';
    type += answers.T >= answers.F ? 'T' : 'F';
    type += answers.J >= answers.P ? 'J' : 'P';
    return type;
}

// Show Result
function showResult() {
    const mbtiType = calculateMBTI();
    const result = results[mbtiType];
    
    // Log analytics event with result
    logEvent('mbti_quiz_complete', {
        mbti_type: mbtiType,
        result_title: result.title
    });
    
    document.getElementById('resultEmoji').textContent = result.emoji;
    document.getElementById('resultType').textContent = result.type;
    document.getElementById('resultTitle').textContent = result.title;
    document.getElementById('resultDesc').textContent = result.desc;
    document.getElementById('matchPercent').textContent = result.match;
    document.getElementById('compatibleTypes').textContent = result.compatible;
    
    // Store current traits for image generation
    currentTraits = result.traits;
    
    // Add traits
    const traitsContainer = document.getElementById('traitsContainer');
    traitsContainer.innerHTML = '';
    result.traits.forEach(trait => {
        const tag = document.createElement('span');
        tag.className = 'trait-tag';
        tag.textContent = trait;
        traitsContainer.appendChild(tag);
    });
    
    resultScreen.classList.add('active');
    
    // Confetti!
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6C5CE7', '#a29bfe', '#ffffff']
    });
}

// Open Share Modal
function openShareModal() {
    const shareUrl = window.location.href;
    const mbtiType = calculateMBTI();
    const result = results[mbtiType];
    
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
    logEvent('mbti_share_link_copy');
    
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
    const mbtiType = calculateMBTI();
    const result = results[mbtiType];
    
    // Log analytics event
    logEvent('mbti_share_story_image', { mbti_type: mbtiType });
    
    // Show loading
    Swal.fire({
        title: '🎨 กำลังสร้างรูปภาพ...',
        html: `
            <div style="text-align: center; padding: 20px 0;">
                <div style="font-size: 4rem; animation: bounce 0.6s ease infinite;">🧠</div>
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
                        background: linear-gradient(90deg, #6C5CE7, #a29bfe, #6C5CE7);
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
        background: linear-gradient(180deg, #6C5CE7 0%, #a29bfe 50%, #6C5CE7 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 80px 60px;
        z-index: 10000;
        font-family: 'Prompt', sans-serif;
    `;
    
    // Build traits HTML
    let traitsHtml = result.traits.map(trait => `
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
            <div style="position: absolute; top: 5%; left: 8%; font-size: 80px; opacity: 0.2;">🧠</div>
            <div style="position: absolute; top: 15%; right: 10%; font-size: 60px; opacity: 0.15;">✨</div>
            <div style="position: absolute; top: 70%; left: 5%; font-size: 70px; opacity: 0.2;">💭</div>
            <div style="position: absolute; top: 80%; right: 8%; font-size: 50px; opacity: 0.15;">🌟</div>
            <div style="position: absolute; top: 40%; right: 5%; font-size: 60px; opacity: 0.2;">💡</div>
        </div>
        
        <div style="text-align: center; margin-bottom: 40px; position: relative; z-index: 1;">
            <div style="font-size: 100px; margin-bottom: 20px;">🧠</div>
            <h1 style="
                font-size: 64px;
                color: white;
                text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                margin-bottom: 10px;
                font-weight: 700;
            ">MBTI by HULALLA #3</h1>
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
            <div style="font-size: 120px; margin-bottom: 20px;">${result.emoji}</div>
            
            <div style="
                font-size: 72px;
                font-weight: 800;
                color: #6C5CE7;
                margin-bottom: 15px;
                letter-spacing: 8px;
            ">${result.type}</div>
            
            <h2 style="
                font-size: 48px;
                font-weight: 700;
                color: #333;
                margin-bottom: 25px;
            ">${result.title}</h2>
            
            <p style="
                font-size: 30px;
                color: #666;
                margin-bottom: 35px;
                line-height: 1.6;
                padding: 0 20px;
            ">${result.desc}</p>
            
            <div style="
                display: flex;
                justify-content: center;
                gap: 30px;
                margin-bottom: 30px;
            ">
                <div style="
                    background: #F0EEFF;
                    padding: 20px 35px;
                    border-radius: 16px;
                    text-align: center;
                ">
                    <div style="font-size: 26px; color: #999; margin-bottom: 5px;">คนแบบคุณมี</div>
                    <div style="font-size: 42px; font-weight: 700; color: #6C5CE7;">${result.match}</div>
                </div>
                <div style="
                    background: #F0EEFF;
                    padding: 20px 35px;
                    border-radius: 16px;
                    text-align: center;
                ">
                    <div style="font-size: 26px; color: #999; margin-bottom: 5px;">เข้ากันได้ดีกับ</div>
                    <div style="font-size: 36px; font-weight: 700; color: #6C5CE7;">${result.compatible}</div>
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
                margin-bottom: 20px;
                text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            ">คุณสมบัติเด่น</p>
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
                <p style="font-size: 28px; color: white; opacity: 0.9;">มาทดสอบบุคลิกภาพ MBTI กันเถอะ!</p>
                <p style="font-size: 26px; color: white; margin-top: 10px; font-weight: 600;">hulalla.com/play/mbti</p>
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
            backgroundColor: '#6C5CE7',
            width: 1080,
            height: 1920
        });
        
        // Remove story container
        document.body.removeChild(storyContainer);
        
        // Convert to data URL
        const imageDataUrl = canvas.toDataURL('image/png');
        
        // Store for other functions
        window.currentStoryImageData = imageDataUrl;
        window.currentStoryFileName = `mbti-${mbtiType}-story.png`;
        window.currentShareUrl = shareUrl;
        window.currentMbtiType = mbtiType;
        
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
                            background: linear-gradient(135deg, #6C5CE7, #a29bfe);
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
            confirmButtonColor: '#6C5CE7'
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
    
    const mbtiType = window.currentMbtiType || 'MBTI';
    const newTab = window.open();
    if (newTab) {
        newTab.document.write(`
            <html>
                <head>
                    <title>MBTI Result - ${mbtiType}</title>
                    <style>
                        body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #1a1a2e; }
                        img { max-width: 100%; max-height: 100vh; }
                    </style>
                </head>
                <body>
                    <img src="${window.currentStoryImageData}" alt="MBTI Result">
                </body>
            </html>
        `);
        newTab.document.close();
    } else {
        Swal.fire({
            icon: 'warning',
            title: 'ไม่สามารถเปิดหน้าต่างใหม่ได้',
            text: 'กรุณาอนุญาต popup ในเบราว์เซอร์',
            confirmButtonColor: '#6C5CE7'
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
            confirmButtonColor: '#6C5CE7'
        });
    }
}

// Save Result (regular size)
function saveResult() {
    const resultCard = document.getElementById('resultCard');
    
    html2canvas(resultCard, {
        scale: 2,
        backgroundColor: '#6C5CE7',
        useCORS: true
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'my-mbti-result.png';
        link.href = canvas.toDataURL();
        link.click();
    });
}

// Share Result (legacy - kept for compatibility)
function shareResult() {
    openShareModal();
}

// Restart Quiz
function restartQuiz() {
    resultScreen.classList.remove('active');
    startScreen.classList.add('active');
}
