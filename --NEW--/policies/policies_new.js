// =============================================
document.getElementById('buildver').innerText = 'Build Version: 2026.01.20.3';
// =============================================

// ========== FIREBASE CONFIGURATION ==========
const firebaseConfig = window.HLL_KEYS.firebase;

// Initialize Firebase 
let analytics = null;
try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        analytics = firebase.analytics();
        console.log('✅ Firebase Analytics initialized for Policies page');
        
        // Track page view
        analytics.logEvent('page_view', {
            page_title: 'Hulalla Policies',
            page_location: window.location.href,
            page_path: window.location.pathname
        });
    }
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
}

// ========== POLICY DATA CONFIGURATION ==========
const policyImages = {
    1: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&h=600&fit=crop",
    2: "https://www.lek.com/sites/default/files/hero-images/insights/2323-grocery-pickup-retail-hero.png",
    3: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800&h=600&fit=crop",
    4: "https://marvel-b1-cdn.bc0a.com/f00000000212114/www.lmc.edu/_images/enews-article/all-about-club.jpg",
    5: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop",
    6: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=600&fit=crop",
    7: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&h=600&fit=crop",
    8: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop",
    9: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRs5Qfx4P9xnczQWoNyqcGLaYWVsHkcAHGm1EcJxjZXqO0xeBl-bxDHzeRIVqXNE3EUpdM&usqp=CAU",
    10: "https://images.unsplash.com/photo-1487611459768-bd414656ea10?w=800&h=600&fit=crop",
    11: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop",
    12: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&h=600&fit=crop",
    13: "https://www.partydelights.co.uk/media/blog/WBD_Kids_Header_2.jpg",
    14: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop",
    15: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=600&fit=crop",
    16: "https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=800&h=600&fit=crop",
    17: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=600&fit=crop",
    18: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop",
    19: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop",
    20: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&h=600&fit=crop",
    21: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&h=600&fit=crop",
    22: "https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=800&h=600&fit=crop",
    23: "https://www.thebetter.co.th/upload/news/thumb/5101.jpg?t=1763956680",
    24: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9OCFWnbzXpdgtc2dOuIeKTYCEYGGmym7Ssg&s",
    25: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&h=600&fit=crop"
};

const categoryConfig = {
    "student-life": { icon: "fa-user-graduate", color: "#FF6B6B", name: "นักเรียนและคุณภาพชีวิต" },
    "activities": { icon: "fa-calendar-alt", color: "#6C5CE7", name: "กิจกรรมและความสามารถพิเศษ" },
    "academic": { icon: "fa-book", color: "#4ECDC4", name: "การเรียนและวิชาการ" },
    "innovation": { icon: "fa-lightbulb", color: "#FD79A8", name: "นวัตกรรมและการพัฒนาโรงเรียน" },
    "environment": { icon: "fa-leaf", color: "#95E1D3", name: "สิ่งแวดล้อมและความสะอาด" },
    "inclusive": { icon: "fa-hands-helping", color: "#A29BFE", name: "สภาพแวดล้อมที่เปิดกว้างและเอื้อต่อการเรียนรู้" },
    "communication": { icon: "fa-comments", color: "#0984E3", name: "การสื่อสารและการมีส่วนร่วม" }
};

const policyMeta = {
    // ID 1-3: สวัสดิการและนวัตกรรม
    "นโยบายสหกรณ์": { icon: "fa-store", color: "#FF6B6B", category: "innovation" },
    "นโยบายแพลตฟอร์ม Satit E-Marketplace และ Satit Grab and Go": { icon: "fa-shopping-cart", color: "#4ECDC4", category: "innovation" },
    "นโยบายการแก้ปัญหาบริเวณห้องน้ำให้ถูกสุขลักษณะ": { icon: "fa-toilet", color: "#95E1D3", category: "environment" },
    
    // ID 4-7: ดิจิทัลและวิชาการ
    "นโยบายชุมนุมนำโดยนักเรียน (Student-Led Clubs)": { icon: "fa-users", color: "#6C5CE7", category: "communication" },
    "นโยบายการผลักดันการปรับปรุงเว็บไซต์และระบบดิจิทัลของโรงเรียน": { icon: "fa-laptop-code", color: "#FD79A8", category: "innovation" },
    "นโยบายคลังความรู้ดิจิทัล (Digital Knowledge Repository)": { icon: "fa-book", color: "#4ECDC4", category: "academic" },
    "นโยบายสะท้อนผลหลักสูตรเพื่อปรับปรุงคุณภาพการสอน": { icon: "fa-chalkboard-teacher", color: "#0984E3", category: "communication" },
    
    // ID 8-11: กิจกรรมและสวัสดิการ
    "นโยบายด้านการส่งเสริมศักยภาพและความถนัดรอบด้าน": { icon: "fa-star", color: "#FDCB6E", category: "activities" },
    "นโยบายด้านสวัสดิการและสิ่งอำนวยความสะดวกในห้องน้ำ": { icon: "fa-heart", color: "#FF7675", category: "student-life" },
    "นโยบายด้านการสื่อสารและการประชาสัมพันธ์": { icon: "fa-bullhorn", color: "#0984E3", category: "communication" },
    "นโยบายด้านการปฏิสัมพันธ์: กิจกรรมบัดดี้-บัดเดอร์": { icon: "fa-user-friends", color: "#FD79A8", category: "activities" },
    
    // ID 12-17: สิทธิและกิจกรรม
    "นโยบายด้านสิทธิเสรีภาพและการมีส่วนร่วมกับสภา": { icon: "fa-balance-scale", color: "#E84393", category: "communication" },
    "นโยบายด้านการแต่งกายตามเทศกาล (Themed Dress-Up Days)": { icon: "fa-masks-theater", color: "#FD79A8", category: "activities" },
    "นโยบายจัดติววิชาการช่วงเตรียมสอบ (Exam Prep Study Boost)": { icon: "fa-graduation-cap", color: "#6C5CE7", category: "academic" },
    "นโยบายงานเทศกาลประกวดความคิดสร้างสรรค์": { icon: "fa-palette", color: "#E17055", category: "activities" },
    "นโยบายเติมไฟในใจคุณ": { icon: "fa-fire", color: "#FF6348", category: "student-life" },
    "นโยบายด้านบรรยากาศและดนตรี": { icon: "fa-music", color: "#0984E3", category: "activities" },
    
    // ID 18-22: สวัสดิการและสิ่งแวดล้อม
    "นโยบายรับเรื่องร้องทุกข์และข้อพิพาทนักเรียนอย่างทันท่วงที (Quick Response Issue & Dispute)": { icon: "fa-bell", color: "#E84393", category: "student-life" },
    "นโยบายด้านสวัสดิการกีฬา (Sport Gear Station)": { icon: "fa-table-tennis", color: "#00B894", category: "inclusive" },
    "นโยบายด้านสิ่งแวดล้อม - ขยะแลกขนม (Trash to Treat)": { icon: "fa-recycle", color: "#00D2D3", category: "environment" },
    "นโยบายขยายพื้นที่และช่วงเวลาในการเข้าถึงแหล่งความรู้": { icon: "fa-book-reader", color: "#6C5CE7", category: "inclusive" },
    "นโยบายการประกวดการออกแบบเสื้อผ้า, ปกสมุด และอื่น ๆ": { icon: "fa-pen-nib", color: "#E17055", category: "activities" },
    
    // ID 23-25: ความปลอดภัยและสิทธิ
    "นโยบายการอบรมรับมือสถานการณ์ฉุกเฉิน": { icon: "fa-fire-extinguisher", color: "#D63031", category: "student-life" },
    "นโยบายด้านความหลากหลายและความเท่าเทียม": { icon: "fa-rainbow", color: "#A29BFE", category: "inclusive" },
    "นโยบายการปรับเปลี่ยนการแต่งกายชุดนักเรียน (Flexible Uniform Policy)": { icon: "fa-tshirt", color: "#74B9FF", category: "innovation" }
};

let policies = [];
let currentFilter = 'all';

// ========== DATA LOADING ==========
async function loadPolicies() {
    try {
        const response = await fetch('./policies.json');
        const jsonData = await response.json();
        
        policies = jsonData.map(policy => {
            const meta = policyMeta[policy.title] || { icon: "fa-file-alt", color: "#95A5A6", category: "welfare" };
            
            return {
                id: policy.id,
                title: policy.title,
                icon: meta.icon,
                color: meta.color,
                category: meta.category,
                image: policyImages[policy.id] || "https://via.placeholder.com/800x600?text=Policy",
                summary: policy.description.substring(0, 120) + (policy.description.length > 120 ? "..." : ""),
                description: policy.description,
                objectives: policy.objectives || [],
                actions: policy.actions || []
            };
        });
        
        return policies;
    } catch (error) {
        console.error('Error loading policies:', error);
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถโหลดข้อมูลนโยบายได้',
            confirmButtonColor: '#38b6ff'
        });
        return [];
    }
}

// ========== RENDERING ==========
async function renderPolicies(filter = 'all') {
    if (policies.length === 0) {
        await loadPolicies();
    }
    
    currentFilter = filter;
    const policyGrid = document.getElementById('policyGrid');
    
    let filteredPolicies = filter === 'all' 
        ? policies 
        : policies.filter(p => p.category === filter);
    
    if (filteredPolicies.length === 0) {
        policyGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>ไม่พบนโยบายที่ค้นหา</p>
            </div>
        `;
        return;
    }
    
    policyGrid.innerHTML = filteredPolicies.map(policy => `
        <div class="policy-card" data-category="${policy.category}" data-id="${policy.id}" onclick="showPolicyDetail(${policy.id})">
            <div class="policy-card-image" style="background-image: url('${policy.image}')">
                <div class="policy-card-overlay">
                    <i class="fas ${policy.icon}"></i>
                </div>
            </div>
            <div class="policy-card-content">
                <div class="policy-card-category" style="background-color: ${policy.color}">
                    <i class="fas ${categoryConfig[policy.category]?.icon || 'fa-tag'}"></i>
                    ${categoryConfig[policy.category]?.name || 'ทั่วไป'}
                </div>
                <h3 class="policy-card-title">${policy.title}</h3>
                <p class="policy-card-summary">${policy.summary}</p>
                <button class="policy-card-button" style="background-color: ${policy.color}">
                    อ่านเพิ่มเติม <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// ========== FILTER FUNCTIONS ==========
function filterByCategory(category) {
    // Track category filter with Firebase Analytics
    if (analytics) {
        analytics.logEvent('policy_filter', {
            filter_category: category,
            timestamp: new Date().toISOString()
        });
        console.log('📊 Tracked policy filter:', category);
    }
    
    // Update active state
    document.querySelectorAll('.filter-card').forEach(card => {
        card.classList.remove('active');
        if (card.dataset.category === category) {
            card.classList.add('active');
        }
    });
    
    renderPolicies(category);
}

// ========== SEARCH FUNCTIONS ==========
function searchPolicies() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase().trim();
    const searchClear = document.querySelector('.search-clear');
    
    // Track search with Firebase Analytics
    if (analytics && searchTerm) {
        analytics.logEvent('policy_search', {
            search_term: searchTerm,
            timestamp: new Date().toISOString()
        });
        console.log('📊 Tracked policy search:', searchTerm);
    }
    
    // Show/hide clear button
    searchClear.style.display = searchTerm ? 'flex' : 'none';
    
    const policyCards = document.querySelectorAll('.policy-card');
    let visibleCount = 0;
    
    policyCards.forEach(card => {
        const title = card.querySelector('.policy-card-title').textContent.toLowerCase();
        const summary = card.querySelector('.policy-card-summary').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || summary.includes(searchTerm)) {
            card.style.display = 'flex';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    const policyGrid = document.getElementById('policyGrid');
    if (visibleCount === 0 && searchTerm !== '') {
        policyGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>ไม่พบนโยบายที่ค้นหา "${searchTerm}"</p>
            </div>
        `;
    }
}

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.querySelector('.search-clear');
    
    searchInput.value = '';
    searchClear.style.display = 'none';
    
    renderPolicies(currentFilter);
}

// ========== MODAL FUNCTIONS ==========
function showPolicyDetail(policyId) {
    const policy = policies.find(p => p.id === policyId);
    if (!policy) return;
    
    // Track policy view with Firebase Analytics
    if (analytics) {
        analytics.logEvent('policy_view', {
            policy_id: policy.id,
            policy_title: policy.title,
            policy_category: policy.category,
            timestamp: new Date().toISOString()
        });
        console.log('📊 Tracked policy view:', policy.title);
    }
    
    const modal = document.getElementById('policyModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.innerHTML = policy.title;
    
    modalBody.innerHTML = `
        <div class="modal-section">
            <h3><i class="fas fa-info-circle"></i> ที่มาและความสำคัญ</h3>
            <p>${policy.description}</p>
        </div>
        
        ${policy.objectives.length > 0 ? `
        <div class="modal-section">
            <h3><i class="fas fa-bullseye"></i> วัตถุประสงค์</h3>
            <ul>
                ${policy.objectives.map(obj => `<li>${obj}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
        
        ${policy.actions.length > 0 ? `
        <div class="modal-section">
            <h3><i class="fas fa-tasks"></i> แนวทางการดำเนินงาน</h3>
            <ul>
                ${policy.actions.map(action => `<li>${action}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
    `;
    
    // Create fixed action buttons container
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'modal-actions-fixed';
    actionsContainer.innerHTML = `
        <button class="policy-card-button" onclick="sharePolicy(${policy.id})" style="background-color: ${policy.color}">
            <i class="fas fa-share-alt"></i> แชร์นโยบายนี้
        </button>
        <button class="policy-card-button" onclick="generatePolicyImage(${policy.id}); event.stopPropagation();" style="background: linear-gradient(135deg, #38b6ff, #e3b93d);display:none;">
            <i class="fas fa-image"></i> สร้างภาพนโยบาย
        </button>
    `;
    
    // Clear any existing action buttons and add new one
    const existingActions = modal.querySelector('.modal-actions-fixed');
    if (existingActions) {
        existingActions.remove();
    }
    
    // Append to modal container instead of modal-content
    const modalContainer = modal.querySelector('.modal-container');
    if (modalContainer) {
        modalContainer.appendChild(actionsContainer);
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePolicyModal() {
    const modal = document.getElementById('policyModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function closeModalOnOverlay(event) {
    if (event.target.id === 'policyModal') {
        closePolicyModal();
    }
}

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closePolicyModal();
    }
});

// ========== FLOATING ACTION BUTTON ==========
function toggleFAB() {
    const fabMenu = document.getElementById('fabMenu');
    fabMenu.classList.toggle('active');
}

// ========== UTILITY FUNCTIONS ==========
function randomPolicy() {
    if (policies.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * policies.length);
    showPolicyDetail(policies[randomIndex].id);
}

// ========== IMAGE GENERATION FUNCTIONS ==========
async function generatePolicyImage(policyId) {
    const policy = policies.find(p => p.id === policyId);
    if (!policy) return;
    
    // Track policy image generation with Firebase Analytics
    if (analytics) {
        analytics.logEvent('policy_image_generate', {
            policy_id: policy.id,
            policy_title: policy.title,
            policy_category: policy.category,
            timestamp: new Date().toISOString()
        });
        console.log('📊 Tracked policy image generation:', policy.title);
    }
    
    // Show customization form
    const { value: formValues } = await Swal.fire({
        title: 'ปรับแต่งภาพนโยบาย',
        html: `
            <div style="text-align: left; padding: 10px;">
                <label style="display: block; margin-bottom: 8px; color: #ffffff; font-weight: 500;">
                    <i class="fas fa-heading"></i> ชื่อนโยบาย
                </label>
                <input id="policy-title" class="swal2-input" value="${policy.title}" 
                    style="width: 95%; margin: 0 0 15px 0; padding: 10px; border-radius: 8px; border: 2px solid #38b6ff;">
                
                <label style="display: block; margin-bottom: 8px; color: #ffffff; font-weight: 500;">
                    <i class="fas fa-align-left"></i> รายละเอียด
                </label>
                <textarea id="policy-detail" class="swal2-textarea" 
                    style="width: 95%; margin: 0 0 15px 0; height: 100px; padding: 10px; border-radius: 8px; border: 2px solid #38b6ff;">${policy.summary}</textarea>
                
                <label style="display: block; margin-bottom: 8px; color: #ffffff; font-weight: 500;">
                    <i class="fas fa-comment"></i> ข้อความพิเศษ (ถ้ามี)
                </label>
                <input id="custom-message" class="swal2-input" placeholder="เช่น: มาร่วมสร้างอนาคตด้วยกัน" 
                    style="width: 95%; margin: 0; padding: 10px; border-radius: 8px; border: 2px solid #e3b93d;">
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-magic"></i> สร้างภาพ',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#38b6ff',
        cancelButtonColor: '#6c757d',
        width: '600px',
        background: 'linear-gradient(135deg, rgba(26, 20, 100, 0.98), rgba(56, 182, 255, 0.95))',
        backdrop: 'rgba(0, 0, 0, 0.7)',
        preConfirm: () => {
            return {
                title: document.getElementById('policy-title').value,
                detail: document.getElementById('policy-detail').value,
                customMessage: document.getElementById('custom-message').value
            }
        }
    });
    
    if (!formValues) return;
    
    Swal.fire({
        title: 'กำลังสร้างภาพนโยบาย...',
        text: 'กรุณารอสักครู่',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    try {
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size (Instagram square format)
        canvas.width = 1080;
        canvas.height = 1080;
        
        // Load background image
        const bgImage = new Image();
        bgImage.crossOrigin = 'anonymous';
        
        const imageUrl = policyImages[policy.id] || policyImages[1];
        
        bgImage.onload = async function() {
            // Draw background image
            ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
            
            // Add dark overlay for better text visibility
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, 'rgba(26, 20, 100, 0.75)');
            gradient.addColorStop(0.5, 'rgba(56, 182, 255, 0.6)');
            gradient.addColorStop(1, 'rgba(26, 20, 100, 0.85)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Load and draw logo in top right corner
            const logo = new Image();
            logo.crossOrigin = 'anonymous';
            logo.onload = function() {
                const logoSize = 120;
                ctx.drawImage(logo, canvas.width - logoSize - 40, 40, logoSize, logoSize);
                
                // Continue with text drawing
                drawTextOnCanvas(ctx, formValues, policy, canvas);
            };
            logo.onerror = function() {
                // Continue without logo if it fails to load
                drawTextOnCanvas(ctx, formValues, policy, canvas);
            };
            logo.src = '../nav_white.png';
        };
        
        bgImage.onerror = function() {
            // If image fails to load, use gradient background
            createGradientBackground(canvas, ctx, formValues, policy);
        };
        
        // Try to load the image
        bgImage.src = imageUrl;
        
    } catch (error) {
        console.error('Error generating image:', error);
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถสร้างภาพได้ กรุณาลองใหม่อีกครั้ง',
            confirmButtonColor: '#38b6ff'
        });
    }
}

function drawTextOnCanvas(ctx, formValues, policy, canvas) {
    // Set text properties
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw "นโยบายพรรคฮูลัลลา" at top
    ctx.font = 'bold 48px "Prompt", sans-serif';
    ctx.fillStyle = '#e3b93d';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.fillText('นโยบายพรรคฮูลัลลา', canvas.width / 2, 70);
    
    // Draw policy number
    ctx.font = 'bold 36px "Prompt", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`นโยบายที่ ${policy.id}`, canvas.width / 2, 130);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Draw policy title with word wrapping
    ctx.font = 'bold 56px "Prompt", sans-serif';
    ctx.fillStyle = '#38b6ff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    const titleLines = wrapText(ctx, formValues.title, canvas.width - 120);
    const titleStartY = 450;
    titleLines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, titleStartY + (index * 70));
    });
    
    // Draw detail with word wrapping
    ctx.font = '32px "Prompt", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 10;
    
    const detailLines = wrapText(ctx, formValues.detail, canvas.width - 160);
    const detailStartY = titleStartY + (titleLines.length * 70) + 60;
    detailLines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, detailStartY + (index * 45));
    });
    
    // Draw custom message if provided
    if (formValues.customMessage && formValues.customMessage.trim()) {
        ctx.font = 'bold 38px "Prompt", sans-serif';
        ctx.fillStyle = '#e3b93d';
        ctx.shadowBlur = 15;
        
        const messageLines = wrapText(ctx, formValues.customMessage, canvas.width - 140);
        const messageStartY = detailStartY + (detailLines.length * 45) + 70;
        messageLines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, messageStartY + (index * 50));
        });
    }
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    
    // Draw bottom section with party info
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, canvas.height - 150, canvas.width, 150);
    
    // Draw "HULALLA PARTY" text
    ctx.font = 'bold 40px "Prompt", sans-serif';
    ctx.fillStyle = '#38b6ff';
    ctx.fillText('HULALLA #3', canvas.width / 2, canvas.height - 106);
    
    // Draw "เบอร์ 3" text
    ctx.font = 'bold 36px "Prompt", sans-serif';
    ctx.fillStyle = '#e3b93d';
    ctx.fillText('10 กุมภา กาเบอร์ 3', canvas.width / 2, canvas.height - 56);

    // Draw disclaimer text
    ctx.font = '10px "Prompt", sans-serif';
    ctx.fillStyle = '#ffffffb6';
    ctx.fillText('ข้อความบนภาพถูกสร้างขึ้นโดยผู้ใช้งาน ซึ่งเป็นความรับผิดชอบของบุคคลทั่วไป ซึ่งอยู่นอกเหนือการควบคุมของพรรค และทางพรรคฮูลัลลาไม่มีส่วนเกี่ยวข้องใด ๆ ทั้งสิ้น', canvas.width -720, canvas.height - 10);

    ctx.font = '10px "Prompt", sans-serif';
    ctx.fillStyle = '#ffffffff';
    const noww = new Date();
    const nowtime = `สร้างเมื่อ ${noww.getDate()}/${noww.getMonth()+1}/${noww.getFullYear()} ${noww.getHours()}:${noww.getMinutes().toString().padStart(2, '0')}`;
    ctx.fillText(nowtime, canvas.width -70, canvas.height - 10);
    
    // Convert canvas to image and show in modal
    showImagePreview(canvas, policy);
}

function createGradientBackground(canvas, ctx, formValues, policy) {
    // Create gradient background if image fails to load
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1464');
    gradient.addColorStop(0.3, '#2d5aa8');
    gradient.addColorStop(0.6, '#1e3c72');
    gradient.addColorStop(1, '#8e44ad');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Load and draw logo in top right corner
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    logo.onload = function() {
        const logoSize = 120;
        ctx.drawImage(logo, canvas.width - logoSize - 40, 40, logoSize, logoSize);
        
        // Continue with text drawing
        drawTextOnCanvas(ctx, formValues, policy, canvas);
    };
    logo.onerror = function() {
        // Continue without logo if it fails to load
        drawTextOnCanvas(ctx, formValues, policy, canvas);
    };
    logo.src = '../nav_white.png';
}

function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (let i = 0; i < words.length; i++) {
        const testLine = currentLine + (currentLine ? ' ' : '') + words[i];
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = words[i];
        } else {
            currentLine = testLine;
        }
    }
    
    if (currentLine) {
        lines.push(currentLine);
    }
    
    return lines;
}

function showImagePreview(canvas, policy) {
    const imageDataUrl = canvas.toDataURL('image/png');
    
    Swal.fire({
        title: 'ภาพนโยบายของคุณ',
        html: `
            <div style="margin: 20px 0;">
                <img src="${imageDataUrl}" style="max-width: 100%; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);" />
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-download"></i> ดาวน์โหลดภาพ',
        cancelButtonText: 'ปิด',
        confirmButtonColor: '#38b6ff',
        cancelButtonColor: '#6c757d',
        width: '600px',
        customClass: {
            popup: 'image-preview-popup'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            downloadPolicyImage(imageDataUrl, policy);
        }
    });
}

function downloadPolicyImage(imageDataUrl, policy) {
    const link = document.createElement('a');
    link.download = `นโยบาย-${policy.id}-${policy.title.substring(0, 20)}.png`;
    link.href = imageDataUrl;
    link.click();
    
    Swal.fire({
        icon: 'success',
        title: 'ดาวน์โหลดสำเร็จ!',
        text: 'บันทึกภาพนโยบายเรียบร้อยแล้ว',
        timer: 2000,
        showConfirmButton: false,
        confirmButtonColor: '#38b6ff'
    });
}

function sharePolicy(policyId) {
    const policy = policies.find(p => p.id === policyId);
    if (!policy) return;
    
    // Track policy share with Firebase Analytics
    if (analytics) {
        analytics.logEvent('policy_share', {
            policy_id: policy.id,
            policy_title: policy.title,
            policy_category: policy.category,
            method: 'button_click',
            timestamp: new Date().toISOString()
        });
        console.log('📊 Tracked policy share:', policy.title);
    }
    
    const shareData = {
        title: `นโยบายพรรคฮูลัลลา: ${policy.title}`,
        text: policy.summary,
        url: window.location.href + `?policy=${policyId}`
    };
    
    if (navigator.share) {
        navigator.share(shareData)
            .catch(err => console.log('Error sharing:', err));
    } else {
        navigator.clipboard.writeText(shareData.url);
        Swal.fire({
            icon: 'success',
            title: 'คัดลอกลิงก์แล้ว!',
            text: 'สามารถแชร์ลิงก์ให้เพื่อนได้เลย',
            timer: 2000,
            showConfirmButton: false
        });
    }
}

function shareAllPolicies() {
    const shareData = {
        title: 'นโยบายพรรคฮูลัลลา เบอร์ 3',
        text: `ดูนโยบายทั้งหมด ${policies.length} นโยบายของพรรคฮูลัลลา เพื่อส่งเสริมนักเรียนอย่างรอบด้าน`,
        url: window.location.href
    };
    
    if (navigator.share) {
        navigator.share(shareData)
            .catch(err => console.log('Error sharing:', err));
    } else {
        navigator.clipboard.writeText(shareData.url);
        Swal.fire({
            icon: 'success',
            title: 'คัดลอกลิงก์แล้ว!',
            text: 'สามารถแชร์ลิงก์ให้เพื่อนได้เลย',
            timer: 2000,
            showConfirmButton: false
        });
    }
}

function downloadPolicies() {
    Swal.fire({
        title: 'กำลังเตรียมไฟล์...',
        text: 'กรุณารอสักครู่',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    setTimeout(() => {
        let content = '═══════════════════════════════════════════════════════════════\n';
        content += '              นโยบายพรรคฮูลัลลา เบอร์ 3\n';
        content += '═══════════════════════════════════════════════════════════════\n\n';
        content += 'พรรคฮูลัลลา (Hulalla) - พรรคสภานักเรียนรุ่นที่ 15\n';
        content += 'โรงเรียนสาธิตมหาวิทยาลัยขอนแก่น ฝ่ายมัธยมศึกษา (ศึกษาศาสตร์)\n\n';
        content += '═══════════════════════════════════════════════════════════════\n\n';
        
        policies.forEach((policy, index) => {
            content += `\n[นโยบายที่ ${policy.id}]\n`;
            content += `${policy.title}\n`;
            content += '───────────────────────────────────────────────────────────────\n\n';
            content += `📋 สรุป:\n${policy.summary}\n\n`;
            content += `📝 ที่มาและความสำคัญ:\n${policy.description}\n\n`;
            
            if (policy.objectives.length > 0) {
                content += `🎯 วัตถุประสงค์:\n`;
                policy.objectives.forEach((obj, i) => {
                    content += `   ${i + 1}. ${obj}\n`;
                });
                content += '\n';
            }
            
            if (policy.actions.length > 0) {
                content += `✅ แนวทางการดำเนินงาน:\n`;
                policy.actions.forEach((action, i) => {
                    content += `   ${i + 1}. ${action}\n`;
                });
                content += '\n';
            }
            
            if (index < policies.length - 1) {
                content += '═══════════════════════════════════════════════════════════════\n';
            }
        });
        
        content += '\n\n═══════════════════════════════════════════════════════════════\n';
        content += '© 2026 Hulalla Party. All rights reserved.\n';
        content += 'Made with ❤️ for students\n';
        content += '═══════════════════════════════════════════════════════════════\n';
        
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'นโยบายพรรคฮูลัลลา.txt';
        link.click();
        
        Swal.fire({
            icon: 'success',
            title: 'ดาวน์โหลดสำเร็จ!',
            text: 'บันทึกนโยบายทั้งหมดเรียบร้อยแล้ว',
            timer: 2000,
            showConfirmButton: false
        });
    }, 500);
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ========== SCROLL EFFECTS ==========
window.addEventListener('scroll', () => {
    const backToTop = document.getElementById('backToTop');
    
    if (window.pageYOffset > 500) {
        backToTop.classList.add('active');
    } else {
        backToTop.classList.remove('active');
    }
});

// Hero scroll arrow
document.addEventListener('DOMContentLoaded', () => {
    const heroScroll = document.querySelector('.hero-scroll');
    if (heroScroll) {
        heroScroll.addEventListener('click', () => {
            const filterSection = document.querySelector('.filter-section');
            if (filterSection) {
                filterSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});

// ========== AI POPUP INVITATION ==========
function showAIPopup() {
    const popup = document.getElementById('aiPopupInvitation');
    if (popup) {
        setTimeout(() => {
            popup.classList.add('show');
        }, 1500); // Show after 1 second
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            popup.classList.remove('show');
        }, 13000); // 1s delay + 3s display = 4s total
    }
}

function closeAIPopup() {
    const popup = document.getElementById('aiPopupInvitation');
    if (popup) {
        popup.classList.remove('show');
    }
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Initializing Hulalla Policies...');
    
    // Load and render policies
    await loadPolicies();
    renderPolicies();
    
    // Check for specific policy in URL
    const urlParams = new URLSearchParams(window.location.search);
    const policyId = urlParams.get('policy');
    if (policyId) {
        showPolicyDetail(parseInt(policyId));
    }
    
    // Show AI popup invitation
    showAIPopup();
    
    console.log('✅ Hulalla Policies loaded successfully!');
    console.log(`📊 Total policies: ${policies.length}`);
});
