// Roster data (departments, deptHeads, partyLeadership, advisors, membersData) is loaded from roster.js

// State
let currentView = 'main';
let currentFilter = 'all';
let searchQuery = '';
let currentSectionIndex = 0;

// DOM Elements
const mainView = document.getElementById('mainView');
const departmentsView = document.getElementById('departmentsView');
const individualsView = document.getElementById('individualsView');
const fullscreenSections = document.getElementById('fullscreenSections');
const sectionNavDots = document.getElementById('sectionNavDots');
const departmentsGrid = document.getElementById('departmentsGrid');
const membersGrid = document.getElementById('membersGrid');
const memberSearch = document.getElementById('memberSearch');
const searchClear = document.getElementById('searchClear');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeViewToggle();
    initializeFilterButtons();
    initializeSearch();
    renderFullscreenSections();
    renderDepartments();
    renderMembers();
    initializeNavigation();
    initializeScrollEffects();
    createParticles();
    initializeFullscreenScroll();
});

// View Toggle
function initializeViewToggle() {
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            switchView(view);
            
            toggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function switchView(view) {
    currentView = view;
    
    // Hide all views
    if (mainView) mainView.classList.remove('active');
    if (departmentsView) departmentsView.classList.remove('active');
    if (individualsView) individualsView.classList.remove('active');
    
    // Manage body class for fullscreen
    if (view === 'main') {
        document.body.classList.add('fullscreen-active');
    } else {
        document.body.classList.remove('fullscreen-active');
        // Scroll to top when switching from fullscreen to other views
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Show selected view
    if (view === 'main' && mainView) {
        mainView.classList.add('active');
    } else if (view === 'departments' && departmentsView) {
        departmentsView.classList.add('active');
    } else if (view === 'individuals' && individualsView) {
        individualsView.classList.add('active');
    }
    
    // Ensure nav is visible when not in fullscreen mode
    const nav = document.querySelector('nav');
    if (nav && view !== 'main') {
        nav.classList.remove('hide');
    }
}

// Render Fullscreen Sections
function renderFullscreenSections() {
    if (!fullscreenSections || !sectionNavDots) return;
    
    fullscreenSections.innerHTML = '';
    sectionNavDots.innerHTML = '';
    
    // Create intro section
    const introSection = createIntroSection();
    fullscreenSections.appendChild(introSection);
    
    // Create intro nav dot
    const introDot = document.createElement('div');
    introDot.className = 'nav-dot active';
    introDot.dataset.index = 0;
    introDot.innerHTML = `<span class="nav-dot-label">หน้าหลัก</span>`;
    introDot.addEventListener('click', () => scrollToSection(0));
    sectionNavDots.appendChild(introDot);
    
    departments.forEach((dept, index) => {
        const deptMembers = membersData.filter(m => {
            if (dept.name === 'ปฏิคม') return m.role === 'ปฏิคม' || m.role === 'ปฏิคม';
            return m.role === dept.name;
        });
        
        // Create section (index + 1 because of intro)
        const section = createFullscreenSection(dept, deptMembers, index + 1);
        fullscreenSections.appendChild(section);
        
        // Create nav dot
        const dot = document.createElement('div');
        dot.className = 'nav-dot';
        dot.dataset.index = index + 1;
        dot.innerHTML = `<span class="nav-dot-label">${dept.name}</span>`;
        dot.addEventListener('click', () => scrollToSection(index + 1));
        sectionNavDots.appendChild(dot);
    });
    
    // Create advisors section (section 10)
    const advisorsSection = createAdvisorsSection();
    fullscreenSections.appendChild(advisorsSection);
    
    // Create advisors nav dot
    const advisorsDot = document.createElement('div');
    advisorsDot.className = 'nav-dot';
    advisorsDot.dataset.index = 9;
    advisorsDot.innerHTML = `<span class="nav-dot-label">อาจารย์ที่ปรึกษา</span>`;
    advisorsDot.addEventListener('click', () => scrollToSection(9));
    sectionNavDots.appendChild(advisorsDot);
}

function createIntroSection() {
    const section = document.createElement('div');
    section.className = 'fullscreen-section intro-section';
    section.dataset.index = 0;
    
    section.innerHTML = `
        <div class="intro-content">
            <div class="intro-logo">
                <img src="../nav_white.png" alt="Hulalla Logo">
            </div>
            <h1 class="intro-title">สมาชิกพรรค</h1>
            <p class="intro-subtitle">Hulalla #3</p>
            <p class="intro-description">Hulalla * Haleana</p>
            <div class="intro-stats">
                <div class="intro-stat">
                    <div class="intro-stat-number">${membersData.length}</div>
                    <div class="intro-stat-label">คน</div>
                </div>
                <div class="intro-stat">
                    <div class="intro-stat-number">8</div>
                    <div class="intro-stat-label">ฝ่าย</div>
                </div>
            </div>
        </div>
    `;
    
    return section;
}

function createAdvisorsSection() {
    const section = document.createElement('div');
    section.className = 'fullscreen-section advisors-section';
    section.dataset.index = 9;
    
    section.innerHTML = `
        <div class="section-overlay" style="background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 40%, #667eea 100%);"></div>
        <div class="section-content">
            <div class="section-header">
                <div class="section-icon">👨‍🏫</div>
                <h2 class="section-dept-name">อาจารย์ที่ปรึกษา</h2>
                <p class="section-dept-name-en">Advisors</p>
            </div>
            
            <div class="section-description">อาจารย์ที่ให้คำปรึกษาและสนับสนุนการทำงานของพรรค</div>
            
            <div class="advisors-grid-fullscreen">
                ${advisors.map(advisor => `
                    <div class="advisor-card-fullscreen">
                        <div class="advisor-avatar-large">
                            <img src="${advisor.image}" alt="${advisor.nickname}" onerror="this.parentElement.innerHTML='👨‍🏫'">
                        </div>
                        <div class="advisor-name-large">${advisor.name}</div>
                        <div class="advisor-nickname-large">${advisor.nickname}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    return section;
}

function createFullscreenSection(dept, deptMembers, index) {
    const section = document.createElement('div');
    section.className = 'fullscreen-section dept-section';
    section.style.setProperty('--section-color', dept.color);
    section.style.setProperty('--section-color-light', dept.colorLight);
    section.dataset.index = index;
    
    // Get group image number (17-24 corresponds to departments 0-7)
    const groupImageNum = 17 + (index - 1);
    
    // Get department head
    const deptHead = dept.name === 'บริหาร' ? partyLeadership : 
                     deptHeads[dept.name] ? deptMembers.find(m => m.nickname === deptHeads[dept.name]) : null;
    
    section.innerHTML = `
        <div class="section-image-container">
            <img src="./assets/group/${groupImageNum}.png" alt="${dept.name}" class="section-group-image" onerror="this.style.display='none'">
        </div>
        <div class="section-overlay"></div>
        <div class="section-content">
            <div class="section-header">
                <div class="section-icon">${dept.icon}</div>
                <h2 class="section-dept-name">${dept.name}</h2>
                <p class="section-dept-name-en">${dept.nameEn}</p>
            </div>
            
            <div class="section-description">${dept.description}</div>
            
            <div class="section-members-list">
                ${deptMembers.sort((a, b) => {
                    const aIsHead = deptHeads[dept.name] === a.nickname || (dept.name === 'บริหาร' && partyLeadership.some(l => l.nickname === a.nickname));
                    const bIsHead = deptHeads[dept.name] === b.nickname || (dept.name === 'บริหาร' && partyLeadership.some(l => l.nickname === b.nickname));
                    if (aIsHead && !bIsHead) return -1;
                    if (!aIsHead && bIsHead) return 1;
                    return 0;
                }).map(member => {
                    const isHead = deptHeads[dept.name] === member.nickname;
                    const isLeader = dept.name === 'บริหาร' && partyLeadership.some(l => l.nickname === member.nickname);
                    return `
                        <div class="member-name-tag ${isHead || isLeader ? 'is-head' : ''}" 
                             data-member='${JSON.stringify(member)}' 
                             onclick="showMemberDetailFromData(this)"
                             style="${isHead || isLeader ? `background: ${dept.color}; border-color: ${dept.color}; color: white;` : ''}">
                            ${isHead || isLeader ? '<i class="fas fa-crown"></i> ' : ''}${member.nickname}
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div class="section-footer">
                <div class="section-member-count">
                    <i class="fas fa-users"></i>
                    <span>${deptMembers.length} คน</span>
                </div>
            </div>
        </div>
    `;
    
    return section;
}

// Initialize Fullscreen Scroll
function initializeFullscreenScroll() {
    if (!fullscreenSections) return;
    
    let isScrolling = false;
    let scrollTimeout;
    
    fullscreenSections.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        
        scrollTimeout = setTimeout(() => {
            updateActiveSection();
        }, 100);
        
        // Hide scroll indicator after first scroll
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator && fullscreenSections.scrollTop > 50) {
            scrollIndicator.classList.add('hide');
        } else if (scrollIndicator) {
            scrollIndicator.classList.remove('hide');
        }
    });
}

function updateActiveSection() {
    if (!fullscreenSections) return;
    
    const sections = fullscreenSections.querySelectorAll('.fullscreen-section');
    const dots = sectionNavDots.querySelectorAll('.nav-dot');
    const scrollTop = fullscreenSections.scrollTop;
    const sectionHeight = window.innerHeight - 70;
    
    sections.forEach((section, index) => {
        const sectionTop = section.offsetTop - fullscreenSections.offsetTop;
        const sectionBottom = sectionTop + sectionHeight;
        
        if (scrollTop >= sectionTop - sectionHeight / 2 && scrollTop < sectionBottom - sectionHeight / 2) {
            currentSectionIndex = index;
            dots.forEach(d => d.classList.remove('active'));
            if (dots[index]) dots[index].classList.add('active');
        }
    });
}

function scrollToSection(index) {
    if (!fullscreenSections) return;
    
    const sectionHeight = window.innerHeight - 70;
    fullscreenSections.scrollTo({
        top: sectionHeight * index,
        behavior: 'smooth'
    });
}

// Render Departments
function renderDepartments() {
    departmentsGrid.innerHTML = '';
    
    departments.forEach(dept => {
        const deptMembers = membersData.filter(m => {
            if (dept.name === 'ปฏิคม') return m.role === 'ปฏิคม' || m.role === 'ปฏิคม';
            return m.role === dept.name;
        });
        
        const card = createDepartmentCard(dept, deptMembers);
        departmentsGrid.appendChild(card);
    });
}

function createDepartmentCard(dept, deptMembers) {
    const card = document.createElement('div');
    card.className = 'department-card';
    card.style.setProperty('--dept-color', dept.color);
    card.style.setProperty('--dept-color-light', dept.colorLight);
    
    // Get department head
    const deptHead = dept.name === 'บริหาร' ? 
                     membersData.find(m => m.nickname === 'ปาล์มมี่') : 
                     deptHeads[dept.name] ? deptMembers.find(m => m.nickname === deptHeads[dept.name]) : null;
    
    // Sort members - head first
    const sortedMembers = [...deptMembers].sort((a, b) => {
        const aIsHead = deptHeads[dept.name] === a.nickname || (dept.name === 'บริหาร' && partyLeadership.some(l => l.nickname === a.nickname));
        const bIsHead = deptHeads[dept.name] === b.nickname || (dept.name === 'บริหาร' && partyLeadership.some(l => l.nickname === b.nickname));
        if (aIsHead && !bIsHead) return -1;
        if (!aIsHead && bIsHead) return 1;
        return 0;
    });
    
    // Get first 3 members for preview
    const previewMembers = sortedMembers.slice(0, 3);
    
    card.innerHTML = `
        <div class="dept-banner">
            <img src="${dept.groupImage}" alt="${dept.name}" loading="lazy" 
                 onerror="this.style.display='none'">
            <div class="dept-overlay">
                <div class="dept-name-overlay">${dept.nameEn}</div>
            </div>
        </div>
        <div class="dept-info">
            ${deptHead ? `
                <div class="dept-head-preview">
                    <div class="dept-head-avatar-small">
                        <img src="./assets/indi/${deptHead.id}.png" alt="${deptHead.nickname}" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-user\\'></i>'">
                    </div>
                    <div class="dept-head-info-small">
                        <div class="dept-head-label-small"><i class="fas fa-crown"></i> ${dept.name === 'บริหาร' ? 'ประธานพรรค' : 'หัวหน้าฝ่าย'}</div>
                        <div class="dept-head-name-small">${deptHead.nickname}</div>
                    </div>
                </div>
            ` : ''}
            <div class="dept-header">
                <div class="dept-name" style="font-weight: bold;font-size: 1.8em;">ฝ่าย${dept.name}</div>
                <div class="dept-count">
                    <i class="fas fa-users"></i> ${deptMembers.length} คน
                </div>
            </div>
            <div class="dept-description">${dept.description}</div>
            <div class="dept-members-preview">
                <div class="members-avatars">
                    ${previewMembers.map(member => `
                        <img src="./assets/indi/${member.id}.png" 
                             alt="${member.nickname}" 
                             class="member-avatar-small"
                             loading="lazy"
                             onerror="this.style.display='none'">
                    `).join('')}
                </div>
                ${deptMembers.length > 3 ? `<div class="members-more">+${deptMembers.length - 3} คน</div>` : ''}
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        switchView('individuals');
        document.querySelector('.toggle-btn[data-view="individuals"]').classList.add('active');
        document.querySelector('.toggle-btn[data-view="departments"]').classList.remove('active');
        
        // Update filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => btn.classList.remove('active'));
        const targetBtn = document.querySelector(`.filter-btn[data-dept="${dept.name}"]`);
        if (targetBtn) targetBtn.classList.add('active');
        
        filterMembers(dept.name);
    });
    
    return card;
}

// Render Members
function renderMembers() {
    membersGrid.innerHTML = '';
    
    let filteredMembers = membersData;
    
    // Apply department filter
    if (currentFilter !== 'all') {
        filteredMembers = filteredMembers.filter(m => {
            if (currentFilter === 'ปฏิคม') return m.role === 'ปฏิคม' || m.role === 'ปฏิคม';
            return m.role === currentFilter;
        });
    }
    
    // Apply search filter
    if (searchQuery) {
        filteredMembers = filteredMembers.filter(m => 
            m.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.class.includes(searchQuery)
        );
    }
    
    if (filteredMembers.length === 0) {
        showNoResults();
        return;
    }
    
    filteredMembers.forEach(member => {
        const card = createMemberCard(member);
        membersGrid.appendChild(card);
    });
}

function createMemberCard(member) {
    const dept = departments.find(d => {
        if (member.role === 'ปฏิคม' || member.role === 'ปฏิคม') return d.name === 'ปฏิคม';
        return d.name === member.role;
    });
    
    const card = document.createElement('div');
    card.className = 'member-card';
    
    card.innerHTML = `
        <div class="member-image">
            <img src="./assets/indi/${member.id}.png" 
                 alt="${member.nickname}" 
                 loading="lazy"
                 onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%2338b6ff%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%22 y=%2250%22 font-size=%2240%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${member.gender === 'นาย' ? '👨' : '👩'}%3C/text%3E%3C/svg%3E';">
            <div class="member-dept-badge" style="background: ${dept?.color || '#38b6ff'}">
                ${member.role}
            </div>
        </div>
        <div class="member-info">
            <div class="member-nickname">${member.nickname}</div>
            <div class="member-fullname">${member.fullname}</div>
            <div class="member-class">ม.${member.class}</div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        showMemberDetail(member);
    });
    
    return card;
}

function showNoResults() {
    membersGrid.innerHTML = `
        <div class="no-results" style="grid-column: 1/-1;">
            <i class="fas fa-search"></i>
            <h3>ไม่พบข้อมูล</h3>
            <p>ลองค้นหาด้วยคำอื่นหรือเปลี่ยนฟิลเตอร์</p>
        </div>
    `;
}

// Filter Members
function initializeFilterButtons() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const dept = btn.dataset.dept;
            filterMembers(dept);
            
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function filterMembers(dept) {
    currentFilter = dept;
    renderMembers();
}

// Search
function initializeSearch() {
    if (memberSearch) {
        memberSearch.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderMembers();
            
            if (searchQuery) {
                searchClear.classList.add('show');
            } else {
                searchClear.classList.remove('show');
            }
        });
    }
    
    if (searchClear) {
        searchClear.addEventListener('click', () => {
            memberSearch.value = '';
            searchQuery = '';
            searchClear.classList.remove('show');
            renderMembers();
        });
    }
}

// Show Member Detail
function showMemberDetail(member) {
    // Handle both object and string input
    if (typeof member === 'string') {
        member = JSON.parse(member);
    }
    
    Swal.fire({
        title: member.nickname,
        html: `
            <div style="text-align: center;">
                <img src="./assets/indi/${member.id}.png" 
                     style="width: 200px; height: 200px; object-fit: cover; border-radius: 50%; margin-bottom: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);"
                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle fill=%22%2338b6ff%22 cx=%2250%22 cy=%2250%22 r=%2250%22/%3E%3Ctext x=%2250%22 y=%2250%22 font-size=%2240%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${member.gender === 'นาย' ? '👨' : '👩'}%3C/text%3E%3C/svg%3E';">
                <h3 style="margin: 10px 0; color: #333;">${member.fullname}</h3>
                <p style="color: #666; margin: 5px 0;">
                    <strong>ฝ่าย:</strong> ${member.role}<br>
                    <strong>ชั้น:</strong> ม.${member.class}
                </p>
                ${member.ig ? `
                    <a href="https://instagram.com/${member.ig}" target="_blank" rel="noopener" 
                       style="display: inline-flex; align-items: center; gap: 8px; margin-top: 15px; padding: 10px 20px; background: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: 600;">
                        <i class="fab fa-instagram"></i>
                        @${member.ig}
                    </a>
                ` : ''}
            </div>
        `,
        confirmButtonText: 'ปิด',
        confirmButtonColor: '#38b6ff',
        customClass: {
            popup: 'member-detail-popup'
        }
    });
}

// Helper function to show member detail from data attribute
function showMemberDetailFromData(element) {
    const memberData = element.getAttribute('data-member');
    if (memberData) {
        const member = JSON.parse(memberData);
        showMemberDetail(member);
    }
}

// Navigation
function initializeNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = navToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = navToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }
}

// Scroll Effects
function initializeScrollEffects() {
    // Hide/Show Navigation on Scroll
    let lastScroll = 0;
    const nav = document.querySelector('nav');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            nav.classList.remove('hide');
            return;
        }
        
        if (currentScroll > lastScroll && currentScroll > 100) {
            nav.classList.add('hide');
        } else {
            nav.classList.remove('hide');
        }
        
        lastScroll = currentScroll;
    });

    // Scroll to Top Button
    const scrollTopBtn = document.querySelector('.scroll-top');

    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollTopBtn.classList.add('show');
            } else {
                scrollTopBtn.classList.remove('show');
            }
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Create Particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 10 + 5}px;
            height: ${Math.random() * 10 + 5}px;
            background: rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${Math.random() * 10 + 10}s ease-in-out infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        particlesContainer.appendChild(particle);
    }
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% {
                transform: translateY(0) translateX(0);
                opacity: 0.3;
            }
            25% {
                transform: translateY(-30px) translateX(20px);
                opacity: 0.7;
            }
            50% {
                transform: translateY(-60px) translateX(-20px);
                opacity: 0.5;
            }
            75% {
                transform: translateY(-30px) translateX(20px);
                opacity: 0.7;
            }
        }
    `;
    document.head.appendChild(style);
}

// Click Particle Effect
document.addEventListener('click', (e) => {
    if (e.target.closest('a, button, .member-card, .department-card')) return;
    
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        width: 15px;
        height: 15px;
        background: white;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        animation: pop 0.6s ease-out forwards;
    `;
    document.body.appendChild(particle);
    
    setTimeout(() => particle.remove(), 600);
});

// Inject animation for click particles
const clickStyle = document.createElement('style');
clickStyle.textContent = `
    @keyframes pop {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(3); opacity: 0; }
    }
`;
document.head.appendChild(clickStyle);
