        const allowedHosts = ['hulalla.party', 'localhost', '127.0.0.1'];
        let members = [];

        // fallbackMembers is loaded from roster.js

        async function loadMembersFromApi() {
            if (!allowedHosts.includes(location.hostname)) {
                return fallbackMembers;
            }
            const endpoint = 'https://api.hulalla.party/members';
            try {
                const res = await fetch(endpoint, { cache: 'no-cache' });
                if (!res.ok) throw new Error('fetch failed');
                const apiMembers = await res.json();
                return apiMembers.map(m => ({
                    ...m,
                    gender: m.gender || 'นาย',
                    ig: m.ig || ''
                }));
            } catch (err) {
                console.error('Load members API failed, fallback used', err);
                return fallbackMembers;
            }
        }

        // Role mappings
        const roleMap = {
            'บริหาร': 'executive',
            'วิชาการ': 'academic',
            'ศิลป์': 'arts',
            'กิจกรรม': 'activity',
            'กีฬา': 'sports',
            'ประชาสัมพันธ์': 'pr',
            'ปฏฺิคม': 'welfare',
            'เหรัญญิก': 'finance'
        };

        // Department heads mapping
        const deptHeads = {
            'ประชาสัมพันธ์': 'ออม',
            'ปฏฺิคม': 'แก้มใส',
            'เหรัญญิก': 'เลโอ',
            'กิจกรรม': 'แคนน่อน',
            'ศิลป์': 'หยก',
            'วิชาการ': 'เคอิจิ',
            'กีฬา': 'บูม'
        };

        // Create member card
        function createMemberCard(member, isHead = false) {
            const imagePath = `images/${member.id}.png`;
            const defaultIcon = member.gender === 'นาย' ? '👨‍🎓' : '👩‍🎓';
            const headClass = isHead ? ' head' : '';
            const igText = member.ig ? `<div class="member-ig"><i class="fab fa-instagram"></i> ${member.ig}</div>` : '';
            
            // สีตามฝ่าย
            const roleColors = {
                'วิชาการ': 'rgba(37, 99, 235, 0.25)',       // น้ำเงินสดใสขึ้น
                'ศิลป์': 'rgba(6, 182, 212, 0.25)',         // ฟ้าน้ำทะเล
                'กิจกรรม': 'rgba(16, 185, 129, 0.25)',      // เขียวมิ้นต์
                'กีฬา': 'rgba(147, 51, 234, 0.25)',          // ม่วงเด่นชัด
                'ประชาสัมพันธ์': 'rgba(239, 68, 68, 0.25)', // แดงเข้ม
                'ปฏฺิคม': 'rgba(249, 115, 22, 0.25)',       // ส้มเด่น
                'เหรัญญิก': 'rgba(234, 179, 8, 0.25)',      // เหลืองทอง
                'บริหาร': 'rgba(132, 204, 22, 0.25)'        // เขียวมะนาว
            };
            const bgColor = roleColors[member.role] || 'rgba(255, 255, 255, 0.03)';
            
            // สีตัวอักษรตามฝ่าย
            const roleTextColors = {
                'วิชาการ': '#60a5fa',
                'ศิลป์': '#38bdf8',
                'กิจกรรม': '#4ade80',
                'กีฬา': '#c084fc',
                'ประชาสัมพันธ์': '#f87171',
                'ปฏฺิคม': '#fb923c',
                'เหรัญญิก': '#facc15',
                'บริหาร': '#fbbf24'
            };
            const roleColor = roleTextColors[member.role] || '#c4b5fd';
            const roleBorder = roleColors[member.role] || 'rgba(139, 92, 246, 0.4)';
            const roleBg = roleColors[member.role] || 'rgba(139, 92, 246, 0.2)';
            
            return `
                <div class="member-card${headClass}" onclick="showMemberDetail('${member.nickname}', '${member.fullname}', '${member.ig || ''}', '${imagePath}', '${defaultIcon}', '${member.role}', '${member.class}')" style="background: linear-gradient(135deg, ${bgColor}, rgba(255, 255, 255, 0.03));">
                    <div class="member-avatar">
                        <img src="${imagePath}" alt="${member.nickname}" loading="lazy"
                             onerror="this.parentElement.innerHTML='${defaultIcon}'">
                    </div>
                    <div class="member-nickname">${member.nickname}</div>
                    <div class="member-fullname">${member.fullname}</div>
                    <div class="member-role" style="color: ${roleColor}; background: ${roleBg}; border: 1px solid ${roleBorder};">${member.role}</div>
                    <div class="member-class">ชั้น ม.${member.class}</div>
                    ${igText}
                    <div class="member-id" style="display: none;">#${member.id}</div>
                </div>
            `;
        }

        // Show member detail with Instagram
        function showMemberDetail(nickname, fullname, ig, imagePath, defaultIcon, role, classRoom) {
            const igButton = ig ? `
                <a href="https://instagram.com/${ig}" target="_blank" 
                   style="display: inline-block; margin-top: 15px; padding: 12px 30px; 
                          background: linear-gradient(135deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%);
                          color: white; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 16px;
                          box-shadow: 0 4px 15px rgba(188, 24, 136, 0.4); transition: all 0.3s;">
                    <i class="fab fa-instagram"></i> ${ig}
                </a>
            ` : '';

            Swal.fire({
                title: nickname,
                html: `
                    <div style="text-align: center;">
                        <div style="width: 150px; height: 150px; margin: 0 auto 20px; border-radius: 50%; 
                                    overflow: hidden; border: 4px solid rgba(139, 92, 246, 0.6);
                                    background: linear-gradient(135deg, #667eea, #764ba2);">
                            <img src="${imagePath}" alt="${nickname}" 
                                 style="width: 100%; height: 100%; object-fit: cover;"
                                 onerror="this.parentElement.innerHTML='<div style=\\'font-size:4rem;display:flex;align-items:center;justify-content:center;height:100%;\\'>${defaultIcon}</div>'">
                        </div>
                        <p style="font-size: 1.1rem; color: #a5b4fc; margin-bottom: 10px;">${fullname}</p>
                        <p style="font-size: 0.95rem; color: #cbd5e1;">ฝ่าย${role} | ม.${classRoom}</p>
                        ${igButton}
                    </div>
                `,
                showConfirmButton: false,
                showCloseButton: true,
                color: '#e9d5ff',
                customClass: {
                    popup: 'swal-dark-popup',
                    closeButton: 'swal-close-btn'
                }
            });
        }

        // Show executive detail (for board members)
        function showExecutiveDetail(nickname, fullname, ig, imagePath, defaultIcon, position) {
            const igButton = ig ? `
                <a href="https://instagram.com/${ig}" target="_blank" 
                   style="display: inline-block; margin-top: 15px; padding: 12px 30px; 
                          background: linear-gradient(135deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%);
                          color: white; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 16px;
                          box-shadow: 0 4px 15px rgba(188, 24, 136, 0.4); transition: all 0.3s;">
                    <i class="fab fa-instagram"></i> ${ig}
                </a>
            ` : '';

            Swal.fire({
                title: nickname,
                html: `
                    <div style="text-align: center;">
                        <div style="width: 150px; height: 150px; margin: 0 auto 20px; border-radius: 50%; 
                                    overflow: hidden; border: 4px solid rgba(251, 191, 36, 0.8);
                                    background: linear-gradient(135deg, #667eea, #764ba2);
                                    box-shadow: 0 0 30px rgba(251, 191, 36, 0.4);">
                            <img src="${imagePath}" alt="${nickname}" 
                                 style="width: 100%; height: 100%; object-fit: cover;"
                                 onerror="this.parentElement.innerHTML='<div style=\\'font-size:4rem;display:flex;align-items:center;justify-content:center;height:100%;\\'>${defaultIcon}</div>'">
                        </div>
                        <p style="font-size: 1.1rem; color: #a5b4fc; margin-bottom: 10px;">${fullname}</p>
                        <p style="font-size: 0.95rem; color: #fbbf24; font-weight: 600;">${position}</p>
                        ${igButton}
                    </div>
                `,
                showConfirmButton: false,
                showCloseButton: true,
                color: '#e9d5ff',
                customClass: {
                    popup: 'swal-dark-popup',
                    closeButton: 'swal-close-btn'
                }
            });
        }

        // Render members
        function renderMembers() {
            // All members
            document.getElementById('allMembers').innerHTML = 
                members.map(m => createMemberCard(m)).join('');

            // By role with department heads highlighted
            Object.entries(roleMap).forEach(([thai, eng]) => {
                const filtered = members.filter(m => m.role === thai);
                const headName = deptHeads[thai];
                
                document.getElementById(`${eng}Members`).innerHTML = 
                    filtered.map(m => {
                        const isHead = m.nickname === headName;
                        return createMemberCard(m, isHead);
                    }).join('');
            });
        }

        // Show section
        function showSection(section) {
            // Hide all sections
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));

            // Show selected section
            document.getElementById(section).classList.add('active');
            event.target.classList.add('active');
        }

        // Toggle search
        function toggleSearch() {
            const wrapper = document.getElementById('searchWrapper');
            const input = document.getElementById('searchInputNav');
            
            if (!wrapper || !input) return;
            
            wrapper.classList.toggle('active');
            
            if (wrapper.classList.contains('active')) {
                setTimeout(() => input.focus(), 100);
            } else {
                input.value = '';
                // Clear search
                document.querySelectorAll('.member-card').forEach(card => {
                    card.style.display = 'block';
                });
            }
        }

        // Search functionality - support both inputs
        function setupSearch(inputId) {
            const input = document.getElementById(inputId);
            if (!input) return;
            
            input.addEventListener('input', function(e) {
                const searchTerm = e.target.value.toLowerCase();
                const cards = document.querySelectorAll('.member-card');

                cards.forEach(card => {
                    const text = card.textContent.toLowerCase();
                    if (text.includes(searchTerm)) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        }

        // Old search input (if exists)
        const oldSearchInput = document.getElementById('searchInput');
        if (oldSearchInput) {
            oldSearchInput.addEventListener('input', function(e) {
                const searchTerm = e.target.value.toLowerCase();
                const cards = document.querySelectorAll('.member-card');

                cards.forEach(card => {
                    const text = card.textContent.toLowerCase();
                    if (text.includes(searchTerm)) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        }

        // Setup navbar search
        setTimeout(() => {
            setupSearch('searchInputNav');
        }, 500);

        // Show scroll hint on mobile
        function showScrollHint() {
            const navContainer = document.querySelector('.nav-container');
            const navTabsLeft = document.querySelector('.nav-tabs-left');
            if (!navTabsLeft || !navContainer) return;
            
            // Check if content overflows (scrollable)
            if (navTabsLeft.scrollWidth > navTabsLeft.clientWidth) {
                navContainer.classList.add('scrollable');
                navContainer.classList.add('show-hint');
                
                // Remove hint animation after 4.5 seconds, but keep arrow
                setTimeout(() => {
                    navContainer.classList.remove('show-hint');
                }, 4500);
                
                // Hide arrow when scrolled to end
                navTabsLeft.addEventListener('scroll', function() {
                    const isAtEnd = this.scrollLeft + this.clientWidth >= this.scrollWidth - 20;
                    if (isAtEnd) {
                        navContainer.classList.remove('scrollable');
                    } else {
                        navContainer.classList.add('scrollable');
                    }
                });
            }
        }

        // Generate particles
        function createParticles() {
            const container = document.getElementById('particles');
            for (let i = 0; i < 50; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 20 + 's';
                particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
                container.appendChild(particle);
            }
        }

        // Leadership cards (executives + department heads), data from roster.js
        function createEl(tag, className, text) {
            const el = document.createElement(tag);
            if (className) el.className = className;
            if (text !== undefined) el.textContent = text;
            return el;
        }

        function createAvatar(className, person, lazy, iconStyle) {
            const avatar = createEl('div', className);
            const img = createEl('img');
            img.src = person.image;
            img.alt = person.nickname;
            if (lazy) img.loading = 'lazy';
            img.onerror = () => {
                avatar.textContent = '';
                const icon = createEl('div', '', person.icon);
                if (iconStyle) icon.style.cssText = iconStyle;
                avatar.appendChild(icon);
            };
            avatar.appendChild(img);
            return avatar;
        }

        function renderLeadership() {
            const grid = document.getElementById('executivesGrid');
            executives.forEach(p => {
                const card = createEl('div', `executive-card ${p.card}`);
                card.appendChild(createAvatar('executive-avatar', p, false, ''));
                card.appendChild(createEl('div', 'executive-position', p.position));
                card.appendChild(createEl('div', 'executive-name', p.nickname));
                card.addEventListener('click', () => showExecutiveDetail(p.nickname, p.fullname, p.ig, p.image, p.icon, p.position));
                grid.appendChild(card);
            });

            document.querySelectorAll('.dept-head-showcase[data-dept]').forEach(showcase => {
                const p = deptHeadCards[showcase.dataset.dept];
                if (!p) return;
                const card = createEl('div', `dept-head-card ${showcase.dataset.dept}`);
                card.appendChild(createEl('div', 'dept-head-crown', '👑'));
                card.appendChild(createAvatar('dept-head-avatar', p, true, 'font-size:3rem;display:flex;align-items:center;justify-content:center;height:100%;'));
                card.appendChild(createEl('div', 'dept-head-title', 'หัวหน้าฝ่าย'));
                card.appendChild(createEl('div', 'dept-head-nickname', p.nickname));
                card.appendChild(createEl('div', 'dept-head-fullname', p.fullname));
                card.appendChild(createEl('div', 'dept-head-class', `ม.${p.classRoom}`));
                card.addEventListener('click', () => showMemberDetail(p.nickname, p.fullname, p.ig, p.image, p.icon, p.role, p.classRoom));
                showcase.appendChild(card);
            });
        }

        // Initialize
        (async function init() {
            renderLeadership();
            members = await loadMembersFromApi();
            renderMembers();
            createParticles();
            setTimeout(showScrollHint, 1000);
        })();