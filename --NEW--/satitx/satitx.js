        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
		import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, GoogleAuthProvider, signInWithPopup, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
		import { getDatabase, ref, onValue, push, set, update, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
		import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

		// ========== FIREBASE CONFIG ==========
		const firebaseConfig = window.SATITX_CONFIG || window.HLL_KEYS.firebase;

		let app, auth, db, storage;
		let firebaseReady = false;

		// ========== STATE MANAGEMENT ==========
		const state = {
			currentView: 'home',
			user: null,
			foodItems: [],
			marketItems: [],
			notifications: [],
			likedItems: new Set(JSON.parse(localStorage.getItem('satitx_likes') || '[]')),
			cart: [],
			foodFilter: 'all',
			marketFilter: 'all',
			language: localStorage.getItem('satitx_lang') || 'th',
			theme: 'system',
		};

		// ========== i18n TRANSLATIONS ==========
		const translations = {
			th: {
				// Header & Search
				search_placeholder: 'ค้นหาอาหาร, สิ่งของ, อะไรก็ได้...',
				
				// Hero Cards
				grab_go: 'Grab & Go',
				grab_go_desc: 'จับจ่ายอาหารทันใจ ไม่ต้องรอคิว',
				marketplace: 'Marketplace',
				marketplace_desc: 'ซื้อขายกับนักเรียนที่ไว้ใจได้',
				open_now: 'เปิดแล้ว',
				trusted: 'น่าเชื่อถือ',
				
				// Trending
				trending_today: 'มาแรงวันนี้',
				noodles: 'เมนูเส้น',
				drinks: 'เครื่องดื่ม',
				uniform: 'เครื่องแบบ',
				rice: 'ข้าว',
				snacks: 'ขนม',
				
				// Filters
				filter_all: 'ทั้งหมด',
				category: 'หมวดหมู่',
				student: 'นักเรียน',
				
				// Cart
				my_cart: 'ตะกร้าของฉัน',
				clear_all: 'ล้างทั้งหมด',
				subtotal: 'ยอดรวม:',
				checkout: 'ชำระเงิน',
				
				// Navigation
				nav_home: 'หน้าหลัก',
				nav_food: 'อาหาร',
				nav_market: 'ชุมชน',
				nav_cart: 'ตะกร้า',
				nav_profile: 'โปรไฟล์',
				
				// Profile & Notifications
				profile: 'โปรไฟล์',
				notifications: 'การแจ้งเตือน',
				no_notifications: 'ไม่มีการแจ้งเตือนใหม่',
				mark_all_read: 'อ่านทั้งหมด',
				
				// Live Activity
				preparing_order: 'กำลังเตรียมออร์เดอร์',
				status_pending: 'รอดำเนินการ',
				status_preparing: 'กำลังเตรียม',
				status_ready: 'พร้อมรับ',
				status_complete: 'เสร็จสิ้น',
				
				// Misc
				sell: 'ขาย',
				add_to_cart: 'หยิบใส่ตะกร้า',
				order_now: 'สั่งเลย',
				contact: 'ติดต่อ',
				view_details: 'ดูรายละเอียด',
				my_orders: 'ออร์เดอร์ของฉัน',
				no_orders: 'ยังไม่มีออร์เดอร์',
				
				// Search
				search_results: 'ผลการค้นหา',
				clear_search: 'ล้างการค้นหา',
				food_section: 'อาหาร',
				market_section: 'ตลาดนัด',
				
				// Theme
				theme_light: 'สว่าง',
				theme_dark: 'มืด',
				theme_system: 'ตามระบบ',
			},
			en: {
				// Header & Search
				search_placeholder: 'Search food, uniforms, anything...',
				
				// Hero Cards
				grab_go: 'Grab & Go',
				grab_go_desc: 'Get your trendy eat-easy food and skip the line',
				marketplace: 'Marketplace',
				marketplace_desc: 'Buy & sell with trusted students',
				open_now: 'Open now',
				trusted: 'Trusted',
				
				// Trending
				trending_today: 'Trending Today',
				noodles: 'Noodles',
				drinks: 'Drinks',
				uniform: 'Uniform',
				rice: 'Rice',
				snacks: 'Snacks',
				
				// Filters
				filter_all: 'All',
				category: 'Category',
				student: 'Student',
				
				// Cart
				my_cart: 'My Cart',
				clear_all: 'Clear All',
				subtotal: 'Subtotal:',
				checkout: 'Checkout',
				
				// Navigation
				nav_home: 'Home',
				nav_food: 'Food',
				nav_market: 'Market',
				nav_cart: 'Cart',
				nav_profile: 'Profile',
				
				// Profile & Notifications
				profile: 'Profile',
				notifications: 'Notifications',
				no_notifications: 'You\'re all caught up!<br>No new notifications.',
				mark_all_read: 'Mark all read',
				
				// Live Activity
				preparing_order: 'Preparing your order',
				status_pending: 'Pending',
				status_preparing: 'Preparing',
				status_ready: 'Ready',
				status_complete: 'Complete',
				
				// Misc
				sell: 'Sell',
				add_to_cart: 'Add to Cart',
				order_now: 'Order Now',
				contact: 'Contact',
				view_details: 'View Details',
				my_orders: 'My Orders',
				no_orders: 'No orders yet',
				
				// Search
				search_results: 'Search Results',
				clear_search: 'Clear Search',
				food_section: 'Food',
				market_section: 'Marketplace',
				
				// Theme
				theme_light: 'Light',
				theme_dark: 'Dark',
				theme_system: 'System',
			}
		};

		// ========== i18n FUNCTIONS ==========
		function t(key) {
			return translations[state.language]?.[key] || translations.en[key] || key;
		}

		function translatePage() {
			// Set language attribute on HTML for CSS font switching
			document.documentElement.setAttribute('data-lang', state.language);
			
			// Translate elements with data-i18n
			$$('[data-i18n]').forEach(el => {
				const key = el.getAttribute('data-i18n');
				if (translations[state.language]?.[key]) {
					el.innerHTML = translations[state.language][key];
				}
			});
			
			// Translate placeholders
			$$('[data-i18n-placeholder]').forEach(el => {
				const key = el.getAttribute('data-i18n-placeholder');
				if (translations[state.language]?.[key]) {
					el.placeholder = translations[state.language][key];
				}
			});
			
			// Update language toggle button
			const langFlag = $('#langFlag');
			const langCode = $('#langCode');
			if (langFlag && langCode) {
				langFlag.textContent = state.language === 'th' ? '🇹🇭' : '🇬🇧';
				langCode.textContent = state.language.toUpperCase();
			}
		}

		function toggleLanguage() {
			state.language = state.language === 'th' ? 'en' : 'th';
			localStorage.setItem('satitx_lang', state.language);
			translatePage();
			showToast(state.language === 'th' ? 'เปลี่ยนเป็นภาษาไทย' : 'Changed to English', 'success');
		}

		// ========== THEME FUNCTIONS ==========
		function getCookie(name) {
			const value = `; ${document.cookie}`;
			const parts = value.split(`; ${name}=`);
			if (parts.length === 2) return parts.pop().split(';').shift();
			return null;
		}

		function setCookie(name, value, days = 365) {
			const date = new Date();
			date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
			document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;SameSite=Lax`;
		}

		function getSystemTheme() {
			return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		}

		function initTheme() {
			const savedTheme = getCookie('satitx_theme') || 'system';
			state.theme = savedTheme;
			applyTheme(savedTheme);
			
			// Listen for system theme changes
			window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
				if (state.theme === 'system') {
					applyTheme('system');
				}
			});

			// Update theme menu UI
			updateThemeMenuUI();
		}

		function applyTheme(theme) {
			let actualTheme;
			if (theme === 'system') {
				actualTheme = getSystemTheme();
			} else {
				actualTheme = theme;
			}
			
			document.documentElement.setAttribute('data-theme', actualTheme);
		}

		function setTheme(theme) {
			state.theme = theme;
			setCookie('satitx_theme', theme);
			applyTheme(theme);
			updateThemeMenuUI();
			hideThemeMenu();
			
			const messages = {
				light: { th: 'เปลี่ยนเป็นโหมดสว่าง', en: 'Changed to Light Mode' },
				dark: { th: 'เปลี่ยนเป็นโหมดมืด', en: 'Changed to Dark Mode' },
				system: { th: 'ใช้ธีมตามระบบ', en: 'Using System Theme' }
			};
			showToast(messages[theme][state.language], 'success');
		}

		function updateThemeMenuUI() {
			// Remove active class from all buttons
			$$('.theme-menu-item').forEach(btn => btn.classList.remove('active'));
			
			// Add active class to current theme
			const activeBtn = $(`.theme-menu-item[data-theme="${state.theme}"]`);
			if (activeBtn) activeBtn.classList.add('active');
		}

		function toggleThemeMenu() {
			const menu = $('.theme-menu');
			if (menu) {
				menu.classList.toggle('show');
			}
		}

		function hideThemeMenu() {
			const menu = $('.theme-menu');
			if (menu) {
				menu.classList.remove('show');
			}
		}

		// ========== UTILITIES ==========
		function $(selector) {
			return document.querySelector(selector);
		}

		function $$(selector) {
			return document.querySelectorAll(selector);
		}

		function showToast(message, icon = 'success') {
			Swal.fire({
				toast: true,
				position: 'top-end',
				icon: icon,
				title: message,
				showConfirmButton: false,
				timer: 3000,
				timerProgressBar: true,
			});
		}

		// ========== VIEW NAVIGATION ==========
		function switchView(viewName) {
			// Hide all views
			$$('.view-container').forEach(view => {
				view.classList.add('hidden');
				view.classList.remove('active', 'fade-in');
			});

			// Show selected view
			const targetView = $(`#view${viewName.charAt(0).toUpperCase() + viewName.slice(1)}`);
			if (targetView) {
				targetView.classList.remove('hidden');
				targetView.classList.add('active', 'fade-in');
			}

			// Update nav
			$$('.nav-item').forEach(item => {
				item.classList.toggle('active', item.dataset.view === viewName);
			});

			// Render specific views
			if (viewName === 'profile') {
				renderProfile();
			} else if (viewName === 'notifications') {
				renderNotifications();
			} else if (viewName === 'cart') {
				renderCart();
			}

			state.currentView = viewName;
		}

		// ========== GLOBAL FUNCTIONS (for onclick handlers) ==========
		window.updateCartQuantity = function(itemId, change) {
			const item = state.cart.find(c => c.id === itemId);
			if (!item) return;

			item.quantity += change;
			
			if (item.quantity <= 0) {
				window.removeFromCart(itemId);
			} else {
				renderCart();
				updateCartBadge();
			}
		};

		window.removeFromCart = function(itemId) {
			state.cart = state.cart.filter(c => c.id !== itemId);
			renderCart();
			updateCartBadge();
			showToast('Item removed from cart', 'success');
		};

		window.showContactModal = function(itemId) {
			const item = state.marketItems.find(i => i.id === itemId);
			if (!item) return;

			$('#contactItemImage').src = item.image;
			$('#contactItemName').textContent = item.name;
			$('#contactItemPrice').textContent = `฿${item.price}`;
			$('#contactSellerName').textContent = item.seller;

			let contactHTML = '';
			if (item.lineId) {
				contactHTML += `
					<a href="https://line.me/ti/p/~${item.lineId.replace('@', '')}" target="_blank" class="btn-add" style="width: 100%; margin-bottom: 8px; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px;">
						<i class="fa-brands fa-line" style="color: #06C755;"></i> Line: ${item.lineId}
					</a>
				`;
			}
			if (item.instagram) {
				contactHTML += `
					<a href="https://instagram.com/${item.instagram.replace('@', '')}" target="_blank" class="btn-add" style="width: 100%; margin-bottom: 8px; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px;">
						<i class="fa-brands fa-instagram" style="color: #E4405F;"></i> Instagram: ${item.instagram}
					</a>
				`;
			}
			if (item.facebook) {
				contactHTML += `
					<a href="${item.facebook.startsWith('http') ? item.facebook : 'https://facebook.com/' + item.facebook}" target="_blank" class="btn-add" style="width: 100%; margin-bottom: 8px; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px;">
						<i class="fa-brands fa-facebook" style="color: #1877F2;"></i> Facebook
					</a>
				`;
			}
			if (item.phone) {
				contactHTML += `
					<a href="tel:${item.phone}" class="btn-add" style="width: 100%; margin-bottom: 8px; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px;">
						<i class="fa-solid fa-phone" style="color: #34C759;"></i> ${item.phone}
					</a>
				`;
			}

			if (!contactHTML) {
				contactHTML = '<p style="text-align: center; color: var(--text-secondary);">No contact information available</p>';
			}

			$('#contactMethods').innerHTML = contactHTML;
			$('#contactModal').classList.add('active');
		};

		window.quickAddToCart = function(itemId) {
			if (!state.user) {
				showToast('Please sign in to add items', 'error');
				$('#authModal').classList.add('active');
				return;
			}

			const item = state.foodItems.find(f => f.id === itemId);
			if (!item) return;

			const cartItem = {
				id: itemId,
				name: item.name,
				price: item.price,
				quantity: 1,
				store: item.store,
				storeId: item.storeId,
				image: item.image
			};

			const existingIndex = state.cart.findIndex(c => c.id === itemId);
			if (existingIndex >= 0) {
				state.cart[existingIndex].quantity += 1;
				showToast(`${item.name} quantity updated! (${state.cart[existingIndex].quantity})`, 'success');
			} else {
				state.cart.push(cartItem);
				showToast(`${item.name} added to cart!`, 'success');
			}

			updateCartBadge();
		};

		// ========== PROFILE RENDERING ==========
		function renderProfile() {
			const container = $('#profileContent');
			
			if (!state.user) {
				container.innerHTML = `
					<div style="padding: 40px 20px;">
						<i class="fa-regular fa-user" style="font-size: 64px; color: var(--text-muted); margin-bottom: 16px;"></i>
						<h3 style="margin: 0 0 8px; font-size: 20px;">Not Signed In</h3>
						<p style="margin: 0 0 24px; color: var(--text-secondary); font-size: 14px;">Sign in to access your profile and list items</p>
						<button class="btn btn-primary" onclick="showAuthModal()" style="padding: 12px 32px;">
							<i class="fa-solid fa-right-to-bracket"></i> Sign In
						</button>
					</div>
				`;
				return;
			}

		const displayName = state.user.displayName || 'User';
		const email = state.user.email || 'user@student.edu';
		const initial = displayName.charAt(0).toUpperCase();
		const isEmailVerified = state.user.emailVerified;
		
		// Determine login provider
		let loginProvider = 'Email/Password';
		let providerIcon = 'fa-envelope';
		let providerColor = '#667eea';
		
		if (state.user.providerData && state.user.providerData.length > 0) {
			const provider = state.user.providerData[0].providerId;
			if (provider === 'google.com') {
				loginProvider = 'Google';
				providerIcon = 'fa-brands fa-google';
				providerColor = '#4285F4';
			} else if (provider === 'facebook.com') {
				loginProvider = 'Facebook';
				providerIcon = 'fa-brands fa-facebook';
				providerColor = '#1877F2';
			}
		}

		container.innerHTML = `
			<div style="width: 80px; height: 80px; border-radius: 50%; background: var(--primary-gradient); margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-weight: 800;">
			${initial}
		</div>
		<h3 style="margin: 0 0 4px; font-size: 20px;">${displayName}</h3>
		<p style="margin: 0 0 24px; color: var(--text-secondary); font-size: 14px;">${email}</p>
		
		<!-- Account Settings -->
		<div style="background: rgba(255,255,255,0.5); border-radius: 16px; padding: 20px; margin-bottom: 20px; text-align: left;">
			<h4 style="margin: 0 0 16px; font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
				<i class="fa-solid fa-gear"></i> Account Settings
			</h4>
			
			<div style="margin-bottom: 16px;">
				<div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: white; border-radius: 12px; margin-bottom: 8px;">
					<div style="display: flex; align-items: center; gap: 12px;">
						<i class="fa-solid fa-envelope" style="color: var(--text-muted); font-size: 18px;"></i>
						<div>
							<div style="font-size: 12px; color: var(--text-muted); margin-bottom: 2px;">Email</div>
							<div style="font-size: 14px; font-weight: 600;">${email}</div>
						</div>
					</div>
				</div>
				
				<div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: white; border-radius: 12px; margin-bottom: 8px;">
					<div style="display: flex; align-items: center; gap: 12px;">
						<i class="fa-solid fa-user" style="color: var(--text-muted); font-size: 18px;"></i>
						<div>
							<div style="font-size: 12px; color: var(--text-muted); margin-bottom: 2px;">Display Name</div>
							<div style="font-size: 14px; font-weight: 600;">${displayName}</div>
						</div>
					</div>
				</div>
				
				<div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: white; border-radius: 12px; margin-bottom: 8px;">
					<div style="display: flex; align-items: center; gap: 12px;">
						<i class="${providerIcon}" style="color: ${providerColor}; font-size: 18px;"></i>
						<div>
							<div style="font-size: 12px; color: var(--text-muted); margin-bottom: 2px;">Login Method</div>
							<div style="font-size: 14px; font-weight: 600;">${loginProvider}</div>
						</div>
					</div>
				</div>
				
				<div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: white; border-radius: 12px;">
					<div style="display: flex; align-items: center; gap: 12px;">
						<i class="fa-solid ${isEmailVerified ? 'fa-circle-check' : 'fa-circle-xmark'}" style="color: ${isEmailVerified ? '#10b981' : '#ef4444'}; font-size: 18px;"></i>
						<div>
							<div style="font-size: 12px; color: var(--text-muted); margin-bottom: 2px;">Verification Status</div>
							<div style="font-size: 14px; font-weight: 600; color: ${isEmailVerified ? '#10b981' : '#ef4444'};">
								${isEmailVerified ? 'Verified ✓' : 'Not Verified'}
							</div>
						</div>
					</div>
					${!isEmailVerified && loginProvider !== 'Google' ? `
						<button onclick="resendVerificationEmail()" style="padding: 6px 12px; background: #667eea; color: white; border: none; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer;">
							Verify
						</button>
					` : ''}
				</div>
			</div>
		</div>
		
		<button class="btn btn-secondary" id="btnSignOut" style="padding: 10px 24px; border-radius: 12px; border: none; font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 24px;">
			<i class="fa-solid fa-right-from-bracket"></i> Sign Out
		</button>
		<div id="userOrders"></div>
	`;

	// Re-attach sign out listener
	$('#btnSignOut').addEventListener('click', handleSignOut);		// Load user orders
		loadUserOrders();
	}

	function loadUserOrders() {
		if (!firebaseReady || !state.user) return;
		
		const ordersRef = ref(db, 'orders');
		onValue(ordersRef, (snapshot) => {
			const orders = [];
			snapshot.forEach((child) => {
				const order = child.val();
				if (order.userId === state.user.uid) {
					orders.push({ id: child.key, ...order });
				}
			});
			
			// Sort by newest first
			orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
			renderUserOrders(orders);
			updateLiveActivity(orders);
		});
	}

	function updateLiveActivity(orders) {
		const liveActivityBar = $('#liveActivityBar');
		const appContainer = $('.app-container');
		if (!liveActivityBar) return;

		// Find the most recent active order (not completed or cancelled)
		const activeOrder = orders.find(o => 
			o.status === 'pending' || o.status === 'preparing' || o.status === 'ready'
		);

		if (!activeOrder) {
			liveActivityBar.classList.remove('active');
			if (appContainer) appContainer.classList.remove('has-live-activity');
			return;
		}

		// Show the live activity bar
		liveActivityBar.classList.add('active');
		if (appContainer) appContainer.classList.add('has-live-activity');

		// Update content based on status
		const statusConfig = {
			pending: {
				icon: 'clock',
				title: 'Order Received',
				progress: 25,
				steps: ['pending']
			},
			preparing: {
				icon: 'fire-burner',
				title: 'Preparing your order',
				progress: 50,
				steps: ['pending', 'preparing']
			},
			ready: {
				icon: 'check-circle',
				title: 'Order Ready for Pickup!',
				progress: 75,
				steps: ['pending', 'preparing', 'ready']
			}
		};

		const config = statusConfig[activeOrder.status] || statusConfig.pending;
		const orderNumber = activeOrder.id.slice(-6).toUpperCase();

		// Update icon
		const iconEl = liveActivityBar.querySelector('.live-activity-icon i');
		iconEl.className = `fa-solid fa-${config.icon}`;

		// Update title and subtitle with order number
		$('#liveActivityTitle').textContent = `${config.title}`;
		$('#liveActivitySubtitle').textContent = `#${orderNumber} • ${activeOrder.storeName}`;

		// Update progress bar
		$('#liveActivityProgressBar').style.width = `${config.progress}%`;

		// Update steps
		$$('.live-activity-step').forEach(step => step.classList.remove('active'));
		config.steps.forEach(stepName => {
			const stepEl = stepName === 'pending' ? 
				$$('.live-activity-step')[0] : 
				$(`#step${stepName.charAt(0).toUpperCase() + stepName.slice(1)}`);
			if (stepEl) stepEl.classList.add('active');
		});

		// Click handler to show order details
		liveActivityBar.onclick = () => {
			showOrderDetail(activeOrder);
		};
	}

	function showOrderDetail(order) {
		const modal = $('#orderDetailModal');
		const content = $('#orderDetailContent');
		
		const statusColors = {
			pending: '#f59e0b',
			preparing: '#3b82f6',
			ready: '#10b981',
			completed: '#6b7280',
			cancelled: '#ef4444'
		};

		const statusIcons = {
			pending: 'clock',
			preparing: 'fire-burner',
			ready: 'check-circle',
			completed: 'circle-check',
			cancelled: 'circle-xmark'
		};

		const statusColor = statusColors[order.status] || '#6b7280';
		const statusIcon = statusIcons[order.status] || 'circle';
		const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

		const orderDate = new Date(order.createdAt);
		const formattedDate = orderDate.toLocaleDateString('en-US', { 
			month: 'short', 
			day: 'numeric', 
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});

		content.innerHTML = `
			<!-- Order Header -->
			<div style="text-align: center; padding: 20px; background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%); border-radius: 16px; margin-bottom: 16px;">
				<div style="width: 60px; height: 60px; margin: 0 auto 12px; background: ${statusColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
					<i class="fa-solid fa-${statusIcon}" style="color: white; font-size: 28px;"></i>
				</div>
				<h3 style="margin: 0 0 8px; font-size: 18px; font-weight: 700; text-transform: capitalize;">${order.status}</h3>
				<p style="margin: 0; color: var(--text-secondary); font-size: 13px;">Order #${order.id.slice(-8).toUpperCase()}</p>
			</div>

			<!-- Restaurant Info -->
			<div style="background: rgba(255,255,255,0.5); border-radius: 12px; padding: 16px; margin-bottom: 16px;">
				<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
					<div style="width: 48px; height: 48px; background: var(--primary-gradient); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px;">
						${order.storeName.charAt(0)}
					</div>
					<div style="flex: 1;">
						<h4 style="margin: 0 0 4px; font-size: 16px; font-weight: 700;">${order.storeName}</h4>
						<p style="margin: 0; font-size: 13px; color: var(--text-secondary);">
							<i class="fa-solid fa-clock"></i> ${formattedDate}
						</p>
					</div>
				</div>
			</div>

			<!-- Items List -->
			<div style="background: rgba(255,255,255,0.5); border-radius: 12px; padding: 16px; margin-bottom: 16px;">
				<h4 style="margin: 0 0 12px; font-size: 14px; font-weight: 700;">
					<i class="fa-solid fa-shopping-bag"></i> Items (${itemCount})
				</h4>
				${order.items.map(item => `
					<div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.05);">
						<div style="flex: 1;">
							<div style="font-weight: 600; margin-bottom: 4px;">${item.name}</div>
							<div style="font-size: 13px; color: var(--text-secondary);">฿${item.price} × ${item.quantity}</div>
						</div>
						<div style="font-weight: 700; color: var(--primary);">฿${(item.price * item.quantity).toFixed(2)}</div>
					</div>
				`).join('')}
				<div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 0 0; font-size: 18px; font-weight: 700;">
					<span>Total</span>
					<span style="background: var(--primary-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">฿${order.totalAmount.toFixed(2)}</span>
				</div>
			</div>

			<!-- Status Timeline -->
			${order.statusHistory && order.statusHistory.length > 0 ? `
				<div style="background: rgba(255,255,255,0.5); border-radius: 12px; padding: 16px;">
					<h4 style="margin: 0 0 12px; font-size: 14px; font-weight: 700;">
						<i class="fa-solid fa-timeline"></i> Order Timeline
					</h4>
					${order.statusHistory.map((history, index) => {
						const historyDate = new Date(history.timestamp);
						const historyTime = historyDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
						return `
							<div style="display: flex; gap: 12px; padding: 8px 0; ${index < order.statusHistory.length - 1 ? 'border-left: 2px solid #e5e7eb; margin-left: 8px;' : ''}">
								<div style="width: 16px; height: 16px; background: ${statusColors[history.status] || '#6b7280'}; border-radius: 50%; margin-left: -9px; margin-top: 2px;"></div>
								<div style="flex: 1; padding-bottom: 12px;">
									<div style="font-weight: 600; font-size: 13px; text-transform: capitalize; margin-bottom: 2px;">${history.status}</div>
									<div style="font-size: 12px; color: var(--text-muted);">${historyTime}</div>
									${history.note ? `<div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">${history.note}</div>` : ''}
								</div>
							</div>
						`;
					}).reverse().join('')}
				</div>
			` : ''}
		`;

		modal.classList.add('active');
	}

	function renderUserOrders(orders) {
		const container = $('#userOrders');
		if (!container) return;

		if (orders.length === 0) {
			container.innerHTML = `
				<div style="text-align: left; padding: 16px; background: rgba(255,255,255,0.5); border-radius: 12px;">
					<h4 style="margin: 0 0 8px; font-size: 14px; font-weight: 600;">My Orders</h4>
					<p style="margin: 0; font-size: 13px; color: var(--text-secondary);">No orders yet</p>
				</div>
			`;
			return;
		}

		const statusColors = {
			pending: '#f59e0b',
			preparing: '#3b82f6',
			ready: '#10b981',
			completed: '#6b7280',
			cancelled: '#ef4444'
		};

		const statusIcons = {
			pending: 'clock',
			preparing: 'fire-burner',
			ready: 'check-circle',
			completed: 'circle-check',
			cancelled: 'circle-xmark'
		};

		const ordersHTML = orders.map(order => {
			const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
			const statusColor = statusColors[order.status] || '#6b7280';
			const statusIcon = statusIcons[order.status] || 'circle';
			const orderNumber = order.id.slice(-6).toUpperCase();
			
			return `
				<div class="widget order-card-clickable" data-order-id="${order.id}" style="padding: 12px; margin-bottom: 12px; border-left: 4px solid ${statusColor}; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;">
					<div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
						<div>
							<p style="margin: 0 0 4px; font-size: 11px; color: var(--ocean-blue); font-weight: 600;">#${orderNumber}</p>
							<h4 style="margin: 0 0 4px; font-size: 14px; font-weight: 600;">${order.storeName}</h4>
							<p style="margin: 0; font-size: 12px; color: var(--text-secondary);">${itemCount} item${itemCount > 1 ? 's' : ''} • ฿${order.totalAmount}</p>
						</div>
						<div style="text-align: right;">
							<div style="display: flex; align-items: center; gap: 4px; padding: 4px 8px; background: ${statusColor}20; border-radius: 6px; margin-bottom: 4px;">
								<i class="fa-solid fa-${statusIcon}" style="font-size: 10px; color: ${statusColor};"></i>
								<span style="font-size: 11px; font-weight: 600; color: ${statusColor}; text-transform: capitalize;">${order.status}</span>
							</div>
							<p style="margin: 0; font-size: 10px; color: var(--text-muted);">${formatOrderTime(order.createdAt)}</p>
						</div>
					</div>
					<div style="display: flex; align-items: center; justify-content: flex-end; gap: 4px; color: var(--text-muted); font-size: 11px;">
						<span>ดูรายละเอียด</span>
						<i class="fa-solid fa-chevron-right" style="font-size: 10px;"></i>
					</div>
				</div>
			`;
		}).join('');
		
		// Store orders for click handler
		window._userOrders = orders;

		container.innerHTML = `
			<div style="text-align: left;">
				<h4 style="margin: 0 0 12px; font-size: 16px; font-weight: 700;">My Orders</h4>
				${ordersHTML}
			</div>
		`;
		
		// Add click handlers for order cards
		$$('.order-card-clickable').forEach(card => {
			card.addEventListener('click', () => {
				const orderId = card.dataset.orderId;
				const order = window._userOrders?.find(o => o.id === orderId);
				if (order) {
					showOrderDetail(order);
				}
			});
			// Hover effect
			card.addEventListener('mouseenter', () => {
				card.style.transform = 'translateX(4px)';
				card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
			});
			card.addEventListener('mouseleave', () => {
				card.style.transform = '';
				card.style.boxShadow = '';
			});
		});
	}

	function formatOrderTime(timestamp) {
		const date = new Date(timestamp);
		const now = new Date();
		const diff = now - date;
		const minutes = Math.floor(diff / 60000);
		
		if (minutes < 1) return 'Just now';
		if (minutes < 60) return `${minutes}m ago`;
		if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
		return date.toLocaleDateString();
	}		// ========== CART RENDERING ==========
		function renderCart() {
			const cartContent = $('#cartContent');
			const cartSummary = $('#cartSummary');
			
			if (state.cart.length === 0) {
				cartContent.innerHTML = `
					<div class="empty-state">
						<i class="fa-solid fa-cart-shopping"></i>
						<p>Your cart is empty<br>Add items from the Food menu!</p>
					</div>
				`;
				cartSummary.style.display = 'none';
				return;
			}

			const cartHTML = state.cart.map(item => `
				<div class="widget" style="padding: 12px; margin-bottom: 12px;">
					<div style="display: flex; gap: 12px; align-items: center;">
						<img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">
						<div style="flex: 1;">
							<h4 style="margin: 0 0 4px; font-size: 14px; font-weight: 600;">${item.name}</h4>
							<p style="margin: 0; font-size: 12px; color: var(--text-secondary);">${item.store}</p>
							<p style="margin: 4px 0 0; font-size: 14px; font-weight: 700; color: var(--primary);">฿${item.price}</p>
						</div>
						<div style="display: flex; align-items: center; gap: 8px;">
							<button class="btn-icon" onclick="updateCartQuantity('${item.id}', -1)" style="width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--border-glass); background: white; cursor: pointer;">
								<i class="fa-solid fa-minus" style="font-size: 10px;"></i>
							</button>
							<span style="font-weight: 600; min-width: 24px; text-align: center;">${item.quantity}</span>
							<button class="btn-icon" onclick="updateCartQuantity('${item.id}', 1)" style="width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--border-glass); background: white; cursor: pointer;">
								<i class="fa-solid fa-plus" style="font-size: 10px;"></i>
							</button>
							<button class="btn-icon" onclick="removeFromCart('${item.id}')" style="width: 28px; height: 28px; border-radius: 6px; border: none; background: #fee; color: #ef4444; cursor: pointer; margin-left: 4px;">
								<i class="fa-solid fa-trash" style="font-size: 10px;"></i>
							</button>
						</div>
					</div>
				</div>
			`).join('');

			cartContent.innerHTML = cartHTML;

			// Calculate total
			const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
			$('#cartSubtotal').textContent = `฿${subtotal.toFixed(2)}`;
			cartSummary.style.display = 'block';
		}

		function clearCart() {
			if (state.cart.length === 0) return;
			
			Swal.fire({
				title: 'Clear Cart?',
				text: 'Are you sure you want to remove all items?',
				icon: 'warning',
				showCancelButton: true,
				confirmButtonText: 'Yes, clear it',
				cancelButtonText: 'Cancel'
			}).then((result) => {
				if (result.isConfirmed) {
					state.cart = [];
					renderCart();
					updateCartBadge();
					showToast('Cart cleared', 'success');
				}
			});
		}

		// ========== NOTIFICATIONS RENDERING ==========
		function renderNotifications() {
			const container = $('#viewNotifications .section');
			
			if (state.notifications.length === 0) {
				container.innerHTML = `
					<div class="section-header">
						<h2 class="section-title">Notifications</h2>
					</div>
					<div class="empty-state">
						<i class="fa-regular fa-bell"></i>
						<p>You're all caught up!<br>No new notifications.</p>
					</div>
				`;
				return;
			}

			const notifHtml = state.notifications.map(n => {
				const orderNumber = n.orderId ? n.orderId.slice(-6).toUpperCase() : '';
				const isOrderNotif = n.type === 'order' && n.orderId;
				return `
					<div class="widget notif-card-clickable" data-notif-id="${n.id}" data-order-id="${n.orderId || ''}" style="padding: 16px; margin-bottom: 12px; ${n.read ? 'opacity: 0.7;' : ''} ${isOrderNotif ? 'cursor: pointer;' : ''} transition: transform 0.2s, box-shadow 0.2s;">
						<div style="display: flex; gap: 12px; align-items: start;">
							<div style="width: 40px; height: 40px; border-radius: 50%; background: ${n.type === 'order' ? 'var(--gradient-sunset)' : n.type === 'marketplace' ? 'var(--gradient-ocean)' : 'var(--gradient-ocean)'}; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px;">
								<i class="fa-solid fa-${n.type === 'order' ? 'receipt' : n.type === 'marketplace' ? 'bag-shopping' : 'bell'}"></i>
							</div>
							<div style="flex: 1;">
								${orderNumber ? `<p style="margin: 0 0 4px; font-size: 11px; color: var(--ocean-blue); font-weight: 600;">#${orderNumber}</p>` : ''}
								<div style="font-weight: 700; margin-bottom: 4px;">${n.title}</div>
								<div style="color: var(--text-secondary); font-size: 13px; margin-bottom: 6px; line-height: 1.4;">${n.message}</div>
								<div style="display: flex; justify-content: space-between; align-items: center;">
									<span style="color: var(--text-muted); font-size: 11px;">${formatTime(n.createdAt)}</span>
									${isOrderNotif ? '<span style="color: var(--ocean-blue); font-size: 11px; font-weight: 600;">ดูรายละเอียด <i class="fa-solid fa-chevron-right" style="font-size: 9px;"></i></span>' : ''}
								</div>
							</div>
							${!n.read ? '<div style="width: 8px; height: 8px; border-radius: 50%; background: var(--ocean-blue); flex-shrink: 0;"></div>' : ''}
						</div>
					</div>
				`;
			}).join('');

			container.innerHTML = `
				<div class="section-header">
					<h2 class="section-title">Notifications</h2>
					<button id="markAllRead">Mark all read</button>
				</div>
				${notifHtml}
			`;

			// Add mark all read handler
			const markAllBtn = $('#markAllRead');
			if (markAllBtn) {
				markAllBtn.addEventListener('click', markAllNotificationsRead);
			}
			
			// Add click handlers for notification cards
			$$('.notif-card-clickable').forEach(card => {
				const orderId = card.dataset.orderId;
				if (orderId) {
					card.addEventListener('click', () => {
						// Mark as read
						const notifId = card.dataset.notifId;
						if (notifId && firebaseReady && state.user) {
							const notifRef = ref(db, `notifications/${state.user.uid}/${notifId}`);
							update(notifRef, { read: true });
						}
						// Find and show order detail
						fetchAndShowOrderDetail(orderId);
					});
					// Hover effect
					card.addEventListener('mouseenter', () => {
						card.style.transform = 'translateX(4px)';
						card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
					});
					card.addEventListener('mouseleave', () => {
						card.style.transform = '';
						card.style.boxShadow = '';
					});
				}
			});
		}
		
		// Fetch order and show detail (for notifications)
		function fetchAndShowOrderDetail(orderId) {
			if (!firebaseReady) return;
			
			// First check if we have it in cached orders
			if (window._userOrders) {
				const order = window._userOrders.find(o => o.id === orderId);
				if (order) {
					showOrderDetail(order);
					return;
				}
			}
			
			// Otherwise fetch from Firebase
			const orderRef = ref(db, `orders/${orderId}`);
			onValue(orderRef, (snapshot) => {
				const orderData = snapshot.val();
				if (orderData) {
					showOrderDetail({ id: orderId, ...orderData });
				} else {
					showToast('ไม่พบข้อมูลออร์เดอร์', 'error');
				}
			}, { onlyOnce: true });
		}

		function formatTime(timestamp) {
			if (!timestamp) return 'Just now';
			const date = new Date(timestamp);
			const now = new Date();
			const diffMs = now - date;
			const diffMins = Math.floor(diffMs / 60000);
			
			if (diffMins < 1) return 'Just now';
			if (diffMins < 60) return `${diffMins}m ago`;
			if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
			return `${Math.floor(diffMins / 1440)}d ago`;
		}

		function markAllNotificationsRead() {
			if (!firebaseReady || !state.user) return;
			
			state.notifications.forEach(notif => {
				if (!notif.read) {
					const notifRef = ref(db, `notifications/${state.user.uid}/${notif.id}`);
					update(notifRef, { read: true });
				}
			});
			showToast('All notifications marked as read', 'success');
		}

		// ========== FOOD RENDERING =================
		function loadFoodItems() {
			if (!firebaseReady) return;
			
			const productsRef = ref(db, 'products');
			onValue(productsRef, (snapshot) => {
				state.foodItems = [];
				snapshot.forEach((child) => {
					const product = child.val();
					if (product.available !== false) {
						state.foodItems.push({
							id: child.key,
							name: product.name,
							description: product.description || '',
							price: product.price,
							category: product.category,
							image: product.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
							store: product.storeName || 'Cafeteria',
							storeId: product.storeId
						});
					}
				});
				renderFoodItems();
			}, (error) => {
				console.error('Error loading products:', error);
			});
		}

	function loadMarketItems() {
		if (!firebaseReady) return;
		
		const marketRef = ref(db, 'marketplace/items');
		onValue(marketRef, (snapshot) => {
			state.marketItems = [];
			snapshot.forEach((child) => {
				const item = child.val();
				state.marketItems.push({
					id: child.key,
					name: item.title || item.name,
					description: item.desc || item.description || '',
					price: item.price,
					category: item.category,
					image: item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
					seller: item.seller || 'Student',
					sellerId: item.sellerId,
					lineId: item.lineId,
					instagram: item.instagram,
					facebook: item.facebook,
					phone: item.phone,
					verified: true
				});
			});
			// Reverse to show newest first
			state.marketItems.reverse();
			renderMarketItems();
		}, (error) => {
			console.error('Error loading marketplace:', error);
		});
	}		function loadNotifications() {
			if (!firebaseReady || !state.user) return;
			
			const notifRef = ref(db, `notifications/${state.user.uid}`);
			onValue(notifRef, (snapshot) => {
				state.notifications = [];
				snapshot.forEach((child) => {
					const notif = child.val();
					state.notifications.push({
						id: child.key,
						...notif
					});
				});
				// Reverse to show newest first
				state.notifications.reverse();
				renderNotifications();
				updateNotificationBadge();
			}, (error) => {
				console.error('Error loading notifications:', error);
			});
		}

		function updateNotificationBadge() {
			const unreadCount = state.notifications.filter(n => !n.read).length;
			const badge = $('.notification-badge');
			if (unreadCount > 0) {
				if (!badge) {
					const btn = $('#btnNotifications');
					const newBadge = document.createElement('span');
					newBadge.className = 'notification-badge';
					newBadge.textContent = unreadCount > 9 ? '9+' : unreadCount;
					btn.appendChild(newBadge);
				} else {
					badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
				}
			} else if (badge) {
				badge.remove();
			}
		}

		// ========== QUICK ADD TO CART ==========
		function quickAddToCart(itemId) {
			if (!state.user) {
				showToast('Please sign in to add items', 'error');
				$('#authModal').classList.add('active');
				return;
			}

			const item = state.foodItems.find(f => f.id === itemId);
			if (!item) return;

			// Add to cart with default quantity 1
			const cartItem = {
				id: itemId,
				name: item.name,
				price: item.price,
				quantity: 1,
				store: item.store,
				storeId: item.storeId,
				image: item.image
			};

			const existingIndex = state.cart.findIndex(c => c.id === itemId);
			if (existingIndex >= 0) {
				state.cart[existingIndex].quantity += 1;
				showToast(`${item.name} quantity updated! (${state.cart[existingIndex].quantity})`, 'success');
			} else {
				state.cart.push(cartItem);
				showToast(`${item.name} added to cart!`, 'success');
			}

			updateCartBadge();
		}

	function updateCartBadge() {
		const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
		let badge = $('.cart-badge');
		
		if (totalItems > 0) {
			if (!badge) {
				const cartBtn = $('#cartNavBtn');
				badge = document.createElement('div');
				badge.className = 'cart-badge';
				badge.style.position = 'absolute';
				badge.style.top = '4px';
				badge.style.right = '4px';
				cartBtn.appendChild(badge);
			}
			badge.textContent = totalItems > 99 ? '99+' : totalItems;
		} else if (badge) {
			badge.remove();
		}
	}		// ========== FOOD RENDERING ==========
		function renderFoodItems() {
			const container = $('#foodGrid');
			const filtered = state.foodItems.filter(item => 
				state.foodFilter === 'all' || item.category === state.foodFilter
			);

			if (filtered.length === 0) {
				container.innerHTML = `
					<div class="empty-state">
						<i class="fa-solid fa-utensils"></i>
						<p>No items found.<br>Try a different filter!</p>
					</div>
				`;
				return;
			}

			container.innerHTML = filtered.map(item => `
				<div class="food-card fade-in">
					<div class="food-card-layout">
						<div class="food-image" style="background-image: url('${item.image}')"></div>
						<div class="food-info">
							<div class="food-header">
								<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
									<img src="${item.storeLogo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(item.store || 'Store') + '&background=667eea&color=fff'}" alt="${item.store || 'Store'}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">
									<span style="font-size: 12px; color: var(--text-secondary); font-weight: 600;">${item.store || 'Cafeteria'}</span>
								</div>
								<h3 class="food-name">${item.name}</h3>
								<p class="food-description">${item.description || ''}</p>
								<span class="food-tag">${item.category}</span>
							</div>
							<div class="food-footer">
								<div class="food-price">฿${item.price}</div>
								<button class="btn-add-cart" data-food-id="${item.id}" data-action="quick">
									<i class="fa-solid fa-cart-plus"></i>
									Add
								</button>
							</div>
						</div>
					</div>
				</div>
			`).join('');

			// Add event listeners
			$$('[data-food-id]').forEach(btn => {
				btn.addEventListener('click', (e) => {
					const foodId = e.currentTarget.dataset.foodId;
					const action = e.currentTarget.dataset.action;
					if (action === 'quick') {
						quickAddToCart(foodId);
					} else {
						showPickupModal(foodId);
					}
				});
			});
		}

		// ========== MARKET RENDERING ==========
		function renderMarketItems() {
			const container = $('#marketGrid');
			const filtered = state.marketItems.filter(item => 
				state.marketFilter === 'all' || item.category === state.marketFilter
			);

			if (filtered.length === 0) {
				container.innerHTML = `
					<div class="empty-state">
						<i class="fa-solid fa-bag-shopping"></i>
						<p>No items listed yet.<br>Be the first to sell!</p>
					</div>
				`;
				return;
			}

			container.innerHTML = filtered.map(item => {
				const isLiked = state.likedItems.has(item.id);
				return `
					<div class="market-card fade-in">
						<div class="market-image" style="background-image: url('${item.image}')">
							<button class="like-button ${isLiked ? 'liked' : ''}" data-item-id="${item.id}">
								<i class="fa-${isLiked ? 'solid' : 'regular'} fa-heart"></i>
							</button>
						</div>
						<div class="market-body">
							<h3 class="market-title">${item.name}</h3>
							<p class="food-description" style="margin: 4px 0 8px; font-size: 13px;">${item.description || ''}</p>
							<div class="market-price">฿${item.price}</div>
							<div class="seller-info">
								<div class="seller-avatar">${item.seller.charAt(0)}</div>
								<span class="seller-name">${item.seller}</span>
							</div>
							${item.verified ? '<div class="verified-badge"><i class="fa-solid fa-circle-check"></i> Verified</div>' : ''}
							<button class="btn-add" style="width: 100%; margin-top: 8px; font-size: 13px;" onclick="showContactModal('${item.id}')">
								<i class="fa-solid fa-message"></i> Contact Seller
							</button>
						</div>
					</div>
				`;
			}).join('');

			// Add like button listeners
			$$('.like-button').forEach(btn => {
				btn.addEventListener('click', (e) => {
					e.stopPropagation();
					const itemId = e.currentTarget.dataset.itemId;
					toggleLike(itemId);
				});
			});
		}

		// ========== CONTACT SELLER ==========
		function showContactModal(itemId) {
			const item = state.marketItems.find(i => i.id === itemId);
			if (!item) return;

			$('#contactItemImage').src = item.image;
			$('#contactItemName').textContent = item.name;
			$('#contactItemPrice').textContent = `฿${item.price}`;
			$('#contactSellerName').textContent = item.seller;

			let contactHTML = '';
			if (item.lineId) {
				contactHTML += `
					<a href="https://line.me/ti/p/~${item.lineId.replace('@', '')}" target="_blank" class="btn-add" style="width: 100%; margin-bottom: 8px; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px;">
						<i class="fa-brands fa-line" style="color: #06C755;"></i> Line: ${item.lineId}
					</a>
				`;
			}
			if (item.instagram) {
				contactHTML += `
					<a href="https://instagram.com/${item.instagram.replace('@', '')}" target="_blank" class="btn-add" style="width: 100%; margin-bottom: 8px; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px;">
						<i class="fa-brands fa-instagram" style="color: #E4405F;"></i> Instagram: ${item.instagram}
					</a>
				`;
			}
			if (item.facebook) {
				contactHTML += `
					<a href="${item.facebook.startsWith('http') ? item.facebook : 'https://facebook.com/' + item.facebook}" target="_blank" class="btn-add" style="width: 100%; margin-bottom: 8px; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px;">
						<i class="fa-brands fa-facebook" style="color: #1877F2;"></i> Facebook
					</a>
				`;
			}
			if (item.phone) {
				contactHTML += `
					<a href="tel:${item.phone}" class="btn-add" style="width: 100%; margin-bottom: 8px; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px;">
						<i class="fa-solid fa-phone" style="color: #34C759;"></i> ${item.phone}
					</a>
				`;
			}

			if (!contactHTML) {
				contactHTML = '<p style="text-align: center; color: var(--text-secondary);">No contact information available</p>';
			}

			$('#contactMethods').innerHTML = contactHTML;
			showModal('contactModal');
		}

		// ========== SUBMIT LISTING ==========
		function submitListing() {
			if (!state.user) {
				showToast('Please sign in first', 'error');
				hideModal('sellModal');
				showModal('authModal');
				return;
			}

			const name = $('#sellItemName').value.trim();
			const desc = $('#sellItemDesc').value.trim();
			const price = parseFloat($('#sellItemPrice').value);
			const category = $('#sellItemCategory').value;
			const image = $('#sellItemImage').value.trim();
			const lineId = $('#sellLineID').value.trim();
			const instagram = $('#sellInstagram').value.trim();
			const facebook = $('#sellFacebook').value.trim();
			const phone = $('#sellPhone').value.trim();
			const consent = $('#sellPrivacyConsent').checked;

			if (!name || !price || !image) {
				showToast('Please fill in all required fields', 'error');
				return;
			}

			if (!lineId && !instagram && !facebook && !phone) {
				showToast('Please provide at least one contact method', 'error');
				return;
			}

			if (!consent) {
				showToast('Please accept the Terms and Privacy Policy', 'error');
				return;
			}

			if (!firebaseReady) {
				showToast('Please wait, connecting to database...', 'error');
				return;
			}

			const listing = {
				title: name,
				description: desc,
				price: price,
				category: category,
				image: image,
				seller: state.user.displayName || 'Student',
				sellerId: state.user.uid,
				lineId: lineId || null,
				instagram: instagram || null,
				facebook: facebook || null,
				phone: phone || null,
				createdAt: new Date().toISOString(),
				status: 'active'
			};

			const itemsRef = ref(db, 'marketplace/items');
			const newItemRef = push(itemsRef);
			set(newItemRef, listing)
				.then(() => {
					showToast('Item listed successfully!', 'success');
					hideModal('sellModal');
					// Clear form
					$('#sellItemName').value = '';
					$('#sellItemDesc').value = '';
					$('#sellItemPrice').value = '';
					$('#sellItemImage').value = '';
					$('#sellLineID').value = '';
					$('#sellInstagram').value = '';
					$('#sellFacebook').value = '';
					$('#sellPhone').value = '';
					$('#sellPrivacyConsent').checked = false;
				})
				.catch(error => {
					console.error('Error listing item:', error);
					showToast('Error listing item. Please try again.', 'error');
				});
		}

		// ========== LIKE FUNCTIONALITY ==========
		function toggleLike(itemId) {
			if (state.likedItems.has(itemId)) {
				state.likedItems.delete(itemId);
			} else {
				state.likedItems.add(itemId);
			}
			// Persist to localStorage
			localStorage.setItem('satitx_likes', JSON.stringify(Array.from(state.likedItems)));
			renderMarketItems();
		}

		// ========== PICKUP MODAL ==========
		let selectedFoodItem = null;

		function showPickupModal(foodId) {
			const item = state.foodItems.find(f => f.id === foodId);
			if (!item) return;

			selectedFoodItem = item;
			$('#pickupItemName').value = item.name;
			$('#pickupStoreName').value = item.store || 'Cafeteria';
			$('#pickupQuantity').value = 1;
			$('#pickupNotes').value = '';
			$('#pickupTotalPrice').textContent = `฿${item.price.toFixed(2)}`;
			$('#pickupModal').classList.add('active');

			// Update price when quantity changes
			$('#pickupQuantity').addEventListener('input', updatePickupPrice);
		}

		function updatePickupPrice() {
			if (!selectedFoodItem) return;
			const quantity = parseInt($('#pickupQuantity').value) || 1;
			const total = selectedFoodItem.price * quantity;
			$('#pickupTotalPrice').textContent = `฿${total.toFixed(2)}`;
		}

		function closePickupModal() {
			$('#pickupModal').classList.remove('active');
			selectedFoodItem = null;
			$('#pickupTimeSlot').value = '';
			$('#pickupQuantity').value = 1;
			$('#pickupNotes').value = '';
		}

		function confirmPickup() {
			const timeSlot = $('#pickupTimeSlot').value;
			const quantity = parseInt($('#pickupQuantity').value) || 1;
			const notes = $('#pickupNotes').value.trim();

			if (!timeSlot) {
				showToast('Please select a pickup time!', 'warning');
				return;
			}

			if (!state.user) {
				showToast('Please sign in to place an order', 'warning');
				closePickupModal();
				showAuthModal();
				return;
			}

			// Calculate total
			const total = selectedFoodItem.price * quantity;

			// Create order object
			const order = {
				itemId: selectedFoodItem.id,
				itemName: selectedFoodItem.name,
				storeId: selectedFoodItem.storeId || 'store1',
				storeName: selectedFoodItem.store || 'Cafeteria',
				price: selectedFoodItem.price,
				quantity: quantity,
				total: total,
				timeSlot: timeSlot,
				notes: notes,
				userId: state.user.uid,
				userName: state.user.displayName || state.user.email,
				userEmail: state.user.email,
				status: 'pending',
				createdAt: serverTimestamp(),
				orderDate: new Date().toISOString()
			};

			// Save to Firebase
			if (firebaseReady) {
				try {
					const ordersRef = ref(db, 'orders');
					const newOrderRef = push(ordersRef);
					set(newOrderRef, order)
						.then(() => {
							// Create notification for user
							const notifRef = ref(db, `notifications/${state.user.uid}`);
							const newNotif = push(notifRef);
							set(newNotif, {
								type: 'order',
								title: 'Order Confirmed!',
								message: `Your order for ${order.itemName} (${order.quantity}x) has been placed. Pickup: ${order.timeSlot}`,
								read: false,
								createdAt: new Date().toISOString(),
								orderId: newOrderRef.key
							});

							// Fly-to-cart animation
							const btn = $('#confirmPickup');
							const clone = btn.cloneNode(true);
							clone.style.position = 'fixed';
							clone.style.zIndex = '9999';
							const rect = btn.getBoundingClientRect();
							clone.style.top = rect.top + 'px';
							clone.style.left = rect.left + 'px';
							document.body.appendChild(clone);
							clone.classList.add('fly-animation');
							
							setTimeout(() => {
								clone.remove();
								state.cart.push(order);

								Swal.fire({
									icon: 'success',
									title: 'Order Placed! 🎉',
									html: `
										<p><strong>${selectedFoodItem.name}</strong></p>
										<p>Quantity: ${quantity}</p>
										<p>Pickup: ${timeSlot}</p>
										<p>Total: ฿${total.toFixed(2)}</p>
									`,
									showConfirmButton: true,
									confirmButtonText: 'OK'
								});
								closePickupModal();

								// Show current order widget
								$('#currentOrderWidget').style.display = 'block';
							}, 600);
						})
						.catch(err => {
							console.error('Error saving order:', err);
							showToast('Failed to place order. Please try again.', 'error');
						});
				} catch (err) {
					console.error('Error:', err);
					showToast('Failed to place order', 'error');
				}
			} else {
				showToast('Database not configured', 'error');
			}
		}

		// ========== AUTH MODAL ==========
		window.showAuthModal = function() {
			$('#authModal').classList.add('active');
		}

		function closeAuthModal() {
			$('#authModal').classList.remove('active');
			$('#authEmail').value = '';
			$('#authPassword').value = '';
			$('#authName').value = '';
			$('#authToggleMode').checked = false;
			$('#authNameGroup').style.display = 'none';
			$('#authModalTitle').textContent = 'Sign In';
		}

		function handleGoogleSignIn() {
			if (!firebaseReady) {
				showToast('Authentication service not configured', 'error');
				return;
			}

			const provider = new GoogleAuthProvider();
			signInWithPopup(auth, provider)
				.then((result) => {
					closeAuthModal();
					showToast(`Welcome ${result.user.displayName}! 👋`, 'success');
				})
				.catch((error) => {
					console.error('Google sign-in error:', error);
					let message = 'Google sign-in failed';
					if (error.code === 'auth/popup-closed-by-user') {
						message = 'Sign-in cancelled';
					} else if (error.code === 'auth/popup-blocked') {
						message = 'Please allow popups for this site';
					} else if (error.code === 'auth/account-exists-with-different-credential') {
						message = 'Email already used with different sign-in method';
					}
					showToast(message, 'error');
				});
		}

	function confirmAuth() {
		const email = $('#authEmail').value.trim();
		const password = $('#authPassword').value.trim();
		const name = $('#authName').value.trim();
		const isSignUp = $('#authToggleMode').checked;
		const consent = $('#authPrivacyConsent')?.checked;

		if (!email || !password) {
			showToast('Please enter email and password', 'error');
			return;
		}

		if (isSignUp && !name) {
			showToast('Please enter your name', 'error');
			return;
		}

		if (isSignUp && !consent) {
			showToast('Please accept the Terms and Privacy Policy', 'error');
			return;
		}

		if (!firebaseReady) {
			showToast('Authentication service not configured', 'error');
			return;
		}

		if (isSignUp) {
			// Sign up flow with email verification
			createUserWithEmailAndPassword(auth, email, password)
				.then(cred => {
					// Update profile with display name
					const updatePromise = name ? updateProfile(cred.user, { displayName: name }) : Promise.resolve();
					
					return updatePromise.then(() => {
						// Send email verification
						return sendEmailVerification(cred.user);
					}).then(() => {
						closeAuthModal();
						Swal.fire({
							icon: 'success',
							title: 'Account Created!',
							html: `
								<p>Welcome! 🎉</p>
								<p style="font-size: 14px; color: #6b7280; margin-top: 12px;">
									A verification email has been sent to <strong>${email}</strong>.<br>
									Please verify your email before using all features.
								</p>
							`,
							confirmButtonText: 'Got it!'
						});
						// Sign out until verified
						signOut(auth);
					});
				})
				.catch(err => {
					console.error('Sign up error:', err);
					let message = 'Sign up failed';
					if (err.code === 'auth/email-already-in-use') {
						message = 'Email already in use';
					} else if (err.code === 'auth/weak-password') {
						message = 'Password should be at least 6 characters';
					} else if (err.code === 'auth/invalid-email') {
						message = 'Invalid email address';
					}
					showToast(message, 'error');
				});
		} else {
			// Sign in flow with email verification check
			signInWithEmailAndPassword(auth, email, password)
				.then((cred) => {
					if (!cred.user.emailVerified) {
						// Email not verified
						signOut(auth);
						Swal.fire({
							icon: 'warning',
							title: 'Email Not Verified',
							html: `
								<p>Please verify your email address before signing in.</p>
								<p style="font-size: 14px; color: #6b7280; margin-top: 12px;">
									Check your inbox for the verification link.
								</p>
							`,
							showCancelButton: true,
							confirmButtonText: 'Resend Email',
							cancelButtonText: 'OK'
						}).then((result) => {
							if (result.isConfirmed) {
								// Resend verification email
								sendEmailVerification(cred.user)
									.then(() => {
										showToast('Verification email sent!', 'success');
									})
									.catch(err => {
										console.error('Resend error:', err);
										showToast('Failed to resend email', 'error');
									});
							}
						});
						return;
					}
					// Email verified, proceed
					closeAuthModal();
					showToast('Welcome back! 👋', 'success');
				})
				.catch(err => {
					console.error('Sign in error:', err);
					let message = 'Sign in failed';
					if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
						message = 'Invalid email or password';
					} else if (err.code === 'auth/invalid-email') {
						message = 'Invalid email address';
					} else if (err.code === 'auth/too-many-requests') {
						message = 'Too many failed attempts. Try again later.';
					}
					showToast(message, 'error');
				});
		}
	}		// ========== SELL MODAL ==========
		function showSellModal() {
			if (!state.user) {
				Swal.fire({
					icon: 'info',
					title: 'Sign In Required',
					text: 'Please sign in to list items for sale',
					confirmButtonText: 'Sign In',
					showCancelButton: true
				}).then((result) => {
					if (result.isConfirmed) {
						showAuthModal();
					}
				});
				return;
			}
			$('#sellModal').classList.add('active');
		}

		function closeSellModal() {
			$('#sellModal').classList.remove('active');
			$('#itemPhoto').value = '';
			$('#sellItemName').value = '';
			$('#sellItemPrice').value = '';
			$('#sellItemDesc').value = '';
			$('#sellLineID').value = '';
			$('#sellInstagram').value = '';
			$('#sellFacebook').value = '';
			$('#sellPhone').value = '';
			$('#sellPrivacyConsent').checked = false;
		}

		function confirmSell() {
			if (!state.user) {
				showToast('Please sign in first', 'error');
				closeSellModal();
				showAuthModal();
				return;
			}

			const name = $('#sellItemName')?.value.trim();
			const desc = $('#sellItemDesc')?.value.trim();
			const price = parseFloat($('#sellItemPrice')?.value);
			const category = $('#sellItemCategory')?.value;
			const image = $('#sellItemImage')?.value.trim();
			const lineId = $('#sellLineID')?.value.trim();
			const instagram = $('#sellInstagram')?.value.trim();
			const facebook = $('#sellFacebook')?.value.trim();
			const phone = $('#sellPhone')?.value.trim();
			const consent = $('#sellPrivacyConsent')?.checked;

			if (!name || !price || !image) {
				showToast('Please fill in all required fields', 'error');
				return;
			}

			if (!lineId && !instagram && !facebook && !phone) {
				showToast('Please provide at least one contact method', 'error');
				return;
			}

			if (!consent) {
				showToast('Please accept the Terms and Privacy Policy', 'error');
				return;
			}

			if (!firebaseReady) {
				showToast('Please wait, connecting to database...', 'error');
				return;
			}

			const listing = {
				title: name,
				description: desc,
				price: price,
				category: category,
				image: image,
				seller: state.user.displayName || 'Student',
				sellerId: state.user.uid,
				lineId: lineId || null,
				instagram: instagram || null,
				facebook: facebook || null,
				phone: phone || null,
				createdAt: new Date().toISOString(),
				status: 'active'
			};

			const itemsRef = ref(db, 'marketplace/items');
			const newItemRef = push(itemsRef);
			set(newItemRef, listing)
				.then(() => {
					showToast('Item listed successfully!', 'success');
					closeSellModal();
				})
				.catch(error => {
					console.error('Error listing item:', error);
					showToast('Error listing item. Please try again.', 'error');
				});
		}

		// ========== FILTER FUNCTIONALITY ==========
		function setupFilters() {
			// Food filters
			$$('#foodFilters .chip').forEach(chip => {
				chip.addEventListener('click', (e) => {
					$$('#foodFilters .chip').forEach(c => c.classList.remove('active'));
					e.target.classList.add('active');
					state.foodFilter = e.target.dataset.filter;
					renderFoodItems();
				});
			});

			// Market filters
			$$('#marketFilters .chip').forEach(chip => {
				chip.addEventListener('click', (e) => {
					$$('#marketFilters .chip').forEach(c => c.classList.remove('active'));
					e.target.classList.add('active');
					state.marketFilter = e.target.dataset.filter;
					renderMarketItems();
				});
			});
		}

		// ========== GLOBAL SEARCH ==========
		let originalFoodItems = [];
		let originalMarketItems = [];
		let lastSearchQuery = '';
		
		function setupSearch() {
			const searchInput = $('#globalSearch');
			let searchTimeout;

			searchInput.addEventListener('input', (e) => {
				clearTimeout(searchTimeout);
				searchTimeout = setTimeout(() => {
					const query = e.target.value.toLowerCase().trim();
					lastSearchQuery = query;
					
					// Store original items on first search
					if (originalFoodItems.length === 0 && state.foodItems.length > 0) {
						originalFoodItems = [...state.foodItems];
					}
					if (originalMarketItems.length === 0 && state.marketItems.length > 0) {
						originalMarketItems = [...state.marketItems];
					}
					
					// Reset and go back to home if empty query
					if (!query) {
						if (originalFoodItems.length > 0) {
							state.foodItems = [...originalFoodItems];
						}
						if (originalMarketItems.length > 0) {
							state.marketItems = [...originalMarketItems];
						}
						renderFoodItems();
						renderMarketItems();
						if (state.currentView === 'search') {
							switchView('home');
						}
						return;
					}

					// Use original items for filtering
					const sourceFood = originalFoodItems.length > 0 ? originalFoodItems : state.foodItems;
					const sourceMarket = originalMarketItems.length > 0 ? originalMarketItems : state.marketItems;

					// Search food
					const filteredFood = sourceFood.filter(item =>
						(item.name && item.name.toLowerCase().includes(query)) ||
						(item.description && item.description.toLowerCase().includes(query)) ||
						(item.category && item.category.toLowerCase().includes(query)) ||
						(item.store && item.store.toLowerCase().includes(query))
					);

					// Search market
					const filteredMarket = sourceMarket.filter(item =>
						(item.name && item.name.toLowerCase().includes(query)) ||
						(item.description && item.description.toLowerCase().includes(query)) ||
						(item.category && item.category.toLowerCase().includes(query)) ||
						(item.seller && item.seller.toLowerCase().includes(query))
					);

					// Render search results in dedicated view
					renderSearchResults(query, filteredFood, filteredMarket);
					
					// Switch to search view
					switchView('search');
					
				}, 300);
			});
			
			// Select all text on focus for easy re-search
			searchInput.addEventListener('focus', () => {
				searchInput.select();
			});
			
			// Clear search button
			const clearBtn = $('#clearSearch');
			if (clearBtn) {
				clearBtn.addEventListener('click', () => {
					searchInput.value = '';
					lastSearchQuery = '';
					if (originalFoodItems.length > 0) {
						state.foodItems = [...originalFoodItems];
					}
					if (originalMarketItems.length > 0) {
						state.marketItems = [...originalMarketItems];
					}
					renderFoodItems();
					renderMarketItems();
					switchView('home');
				});
			}
		}
		
		// ========== RENDER SEARCH RESULTS ==========
		function renderSearchResults(query, foodResults, marketResults) {
			const foodCount = foodResults.length;
			const marketCount = marketResults.length;
			const totalCount = foodCount + marketCount;
			
			// Update search query text
			const queryEl = $('#searchQuery');
			if (queryEl) {
				queryEl.innerHTML = totalCount > 0 
					? `พบ <strong>${totalCount}</strong> รายการสำหรับ "<strong>${query}</strong>"`
					: `ไม่พบผลลัพธ์สำหรับ "<strong>${query}</strong>"`;
			}
			
			// Update counts
			const foodCountEl = $('#searchFoodCount');
			const marketCountEl = $('#searchMarketCount');
			if (foodCountEl) foodCountEl.textContent = foodCount;
			if (marketCountEl) marketCountEl.textContent = marketCount;
			
			// Food section
			const foodSection = $('#searchFoodSection');
			const foodGrid = $('#searchFoodGrid');
			if (foodSection && foodGrid) {
				if (foodCount === 0) {
					foodSection.style.display = 'none';
				} else {
					foodSection.style.display = 'block';
					foodGrid.innerHTML = foodResults.map(item => `
						<div class="food-card fade-in">
							<div class="food-card-layout">
								<div class="food-image" style="background-image: url('${item.image}')"></div>
								<div class="food-info">
									<div class="food-header">
										<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
											<img src="${item.storeLogo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(item.store || 'Store') + '&background=1289A7&color=fff'}" alt="${item.store || 'Store'}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">
											<span style="font-size: 12px; color: var(--text-secondary); font-weight: 600;">${item.store || 'Cafeteria'}</span>
										</div>
										<h3 class="food-name">${highlightText(item.name, query)}</h3>
										<p class="food-description">${item.description || ''}</p>
										<span class="food-tag">${item.category}</span>
									</div>
									<div class="food-footer">
										<div class="food-price">฿${item.price}</div>
										<button class="btn-add-cart" onclick="quickAddToCart('${item.id}')">
											<i class="fa-solid fa-cart-plus"></i>
											Add
										</button>
									</div>
								</div>
							</div>
						</div>
					`).join('');
				}
			}
			
			// Market section
			const marketSection = $('#searchMarketSection');
			const marketGrid = $('#searchMarketGrid');
			if (marketSection && marketGrid) {
				if (marketCount === 0) {
					marketSection.style.display = 'none';
				} else {
					marketSection.style.display = 'block';
					marketGrid.innerHTML = marketResults.map(item => {
						const isLiked = state.likedItems.has(item.id);
						return `
							<div class="market-card fade-in">
								<div class="market-image" style="background-image: url('${item.image}')">
									<button class="like-button ${isLiked ? 'liked' : ''}" onclick="toggleLikeFromSearch('${item.id}')">
										<i class="fa-${isLiked ? 'solid' : 'regular'} fa-heart"></i>
									</button>
								</div>
								<div class="market-body">
									<h3 class="market-title">${highlightText(item.name, query)}</h3>
									<p class="food-description" style="margin: 4px 0 8px; font-size: 13px;">${item.description || ''}</p>
									<div class="market-price">฿${item.price}</div>
									<div class="seller-info">
										<div class="seller-avatar">${item.seller.charAt(0)}</div>
										<span class="seller-name">${item.seller}</span>
									</div>
									${item.verified ? '<div class="verified-badge"><i class="fa-solid fa-circle-check"></i> Verified</div>' : ''}
									<button class="btn-add" style="width: 100%; margin-top: 8px; font-size: 13px;" onclick="showContactModal('${item.id}')">
										<i class="fa-solid fa-message"></i> Contact Seller
									</button>
								</div>
							</div>
						`;
					}).join('');
				}
			}
			
			// Show empty state if no results
			if (totalCount === 0) {
				const foodGrid = $('#searchFoodGrid');
				const marketGrid = $('#searchMarketGrid');
				if (foodGrid) foodGrid.innerHTML = '';
				if (marketGrid) marketGrid.innerHTML = '';
				if (foodSection) foodSection.style.display = 'none';
				if (marketSection) marketSection.style.display = 'none';
			}
		}
		
		// Highlight matching text
		function highlightText(text, query) {
			if (!text || !query) return text || '';
			const regex = new RegExp(`(${query})`, 'gi');
			return text.replace(regex, '<mark style="background: var(--sun-light); padding: 0 2px; border-radius: 2px;">$1</mark>');
		}
		
		// Toggle like from search results
		window.toggleLikeFromSearch = function(itemId) {
			if (state.likedItems.has(itemId)) {
				state.likedItems.delete(itemId);
			} else {
				state.likedItems.add(itemId);
			}
			localStorage.setItem('satitx_likes', JSON.stringify(Array.from(state.likedItems)));
			// Re-render search if we have a query
			if (lastSearchQuery) {
				const sourceFood = originalFoodItems.length > 0 ? originalFoodItems : state.foodItems;
				const sourceMarket = originalMarketItems.length > 0 ? originalMarketItems : state.marketItems;
				const filteredFood = sourceFood.filter(item =>
					(item.name && item.name.toLowerCase().includes(lastSearchQuery)) ||
					(item.description && item.description.toLowerCase().includes(lastSearchQuery)) ||
					(item.category && item.category.toLowerCase().includes(lastSearchQuery)) ||
					(item.store && item.store.toLowerCase().includes(lastSearchQuery))
				);
				const filteredMarket = sourceMarket.filter(item =>
					(item.name && item.name.toLowerCase().includes(lastSearchQuery)) ||
					(item.description && item.description.toLowerCase().includes(lastSearchQuery)) ||
					(item.category && item.category.toLowerCase().includes(lastSearchQuery)) ||
					(item.seller && item.seller.toLowerCase().includes(lastSearchQuery))
				);
				renderSearchResults(lastSearchQuery, filteredFood, filteredMarket);
			}
		}

		// ========== HERO CARDS NAVIGATION ==========
		function setupHeroCards() {
			$$('.hero-card').forEach(card => {
				card.addEventListener('click', (e) => {
					const view = e.currentTarget.dataset.navigate;
					if (view) {
						switchView(view);
					}
				});
			});
		}

		// ========== BOTTOM NAVIGATION ==========
		function setupBottomNav() {
			$$('.nav-item').forEach(item => {
				item.addEventListener('click', (e) => {
					const view = e.currentTarget.dataset.view;
					switchView(view);
				});
			});
		}

		// ========== SIGN OUT HANDLER ==========
		function handleSignOut() {
			Swal.fire({
				title: 'Sign Out?',
				text: 'Are you sure you want to sign out?',
				icon: 'question',
				showCancelButton: true,
				confirmButtonText: 'Yes, sign out',
				cancelButtonText: 'Cancel'
			}).then((result) => {
				if (result.isConfirmed) {
					if (firebaseReady && auth.currentUser) {
						signOut(auth);
					}
					state.user = null;
					$('#userName').textContent = 'There';
					switchView('home');
					showToast('Signed out successfully', 'success');
				}
			});
		}

		// ========== RESEND VERIFICATION EMAIL ==========
		window.resendVerificationEmail = function() {
			if (!state.user) {
				showToast('No user logged in', 'error');
				return;
			}

			sendEmailVerification(state.user)
				.then(() => {
					Swal.fire({
						icon: 'success',
						title: 'Email Sent!',
						html: `
							<p>A verification email has been sent to:</p>
							<p style="font-weight: 600; margin-top: 8px;">${state.user.email}</p>
							<p style="font-size: 14px; color: #6b7280; margin-top: 12px;">
								Please check your inbox and click the verification link.
							</p>
						`,
						confirmButtonText: 'Got it!'
					});
				})
				.catch((error) => {
					console.error('Resend verification error:', error);
					let message = 'Failed to send verification email';
					if (error.code === 'auth/too-many-requests') {
						message = 'Too many requests. Please try again later.';
					}
					showToast(message, 'error');
				});
		}

		// ========== FIREBASE AUTH ==========
		function initFirebase() {
			try {
				app = initializeApp(firebaseConfig);
				auth = getAuth(app);
				db = getDatabase(app);
				storage = getStorage(app);
				firebaseReady = true;

			onAuthStateChanged(auth, (user) => {
				state.user = user;
				if (user) {
					const firstName = user.displayName ? user.displayName.split(' ')[0] : 'There';
					$('#userName').textContent = firstName;
					loadNotifications();
					loadUserOrders(); // Load orders to show in live activity
				} else {
					$('#userName').textContent = 'There';
				}
				// Update profile view if currently viewing it
				if (state.currentView === 'profile') {
					renderProfile();
				}
			});				// Load data from Firebase
				loadFoodItems();
				loadMarketItems();
			} catch (err) {
				console.warn('Firebase initialization skipped:', err);
			}
		}

		// ========== INITIALIZATION ==========
		function init() {
			// Initialize Firebase
			initFirebase();

			// Setup navigation
			setupBottomNav();
			setupHeroCards();

			// Setup filters
			setupFilters();

			// Setup search
			setupSearch();

			// Initial renders
			renderFoodItems();
			renderMarketItems();

			// Modal controls
			$('#closePickupModal').addEventListener('click', closePickupModal);
			$('#cancelPickup').addEventListener('click', closePickupModal);
			$('#confirmPickup').addEventListener('click', confirmPickup);

			$('#btnSellItem').addEventListener('click', showSellModal);
			$('#closeSellModal').addEventListener('click', closeSellModal);
			$('#cancelSell').addEventListener('click', closeSellModal);
			$('#confirmSell').addEventListener('click', confirmSell);

		// Auth modal controls
		$('#closeAuthModal').addEventListener('click', closeAuthModal);
		$('#cancelAuth').addEventListener('click', closeAuthModal);
		$('#confirmAuth').addEventListener('click', confirmAuth);
		$('#googleSignInBtn').addEventListener('click', handleGoogleSignIn);
		
		$('#authToggleMode').addEventListener('change', (e) => {
			const isSignUp = e.target.checked;
			$('#authModalTitle').textContent = isSignUp ? 'Create Account' : 'Sign In';
			$('#authNameGroup').style.display = isSignUp ? 'block' : 'none';
			$('#authConsentGroup').style.display = isSignUp ? 'block' : 'none';
		});			// Close modals on overlay click
			$('#pickupModal').addEventListener('click', (e) => {
				if (e.target === e.currentTarget) closePickupModal();
			});
			$('#sellModal').addEventListener('click', (e) => {
				if (e.target === e.currentTarget) closeSellModal();
			});
			$('#authModal').addEventListener('click', (e) => {
				if (e.target === e.currentTarget) closeAuthModal();
			});

		// Profile/Notifications buttons
		$('#btnNotifications').addEventListener('click', () => switchView('notifications'));
		$('#btnProfile').addEventListener('click', () => {
			if (!state.user) {
				showAuthModal();
			} else {
				switchView('profile');
			}
		});

		// Language toggle
		$('#btnLanguage')?.addEventListener('click', toggleLanguage);
		
		// Theme toggle
		$('#btnTheme')?.addEventListener('click', (e) => {
			e.stopPropagation();
			toggleThemeMenu();
		});

		// Theme menu items
		$$('.theme-menu-item').forEach(btn => {
			btn.addEventListener('click', (e) => {
				e.stopPropagation();
				const theme = btn.getAttribute('data-theme');
				if (theme) setTheme(theme);
			});
		});

		// Close theme menu when clicking outside
		document.addEventListener('click', (e) => {
			const themeToggle = $('.theme-toggle');
			if (themeToggle && !themeToggle.contains(e.target)) {
				hideThemeMenu();
			}
		});

		// Initialize theme
		initTheme();
		
		// Initial translation
		translatePage();

		// Cart controls
		$('#clearCart')?.addEventListener('click', clearCart);
		$('#checkoutBtn')?.addEventListener('click', handleCheckout);

		console.log('✨ Satit X initialized successfully!');
	}

	// ========== CHECKOUT HANDLER ==========
	async function handleCheckout() {
		if (state.cart.length === 0) return;
		
		if (!state.user) {
			showToast('Please sign in to checkout', 'error');
			$('#authModal').classList.add('active');
			return;
		}

		if (!firebaseReady) {
			showToast('Please wait, connecting to database...', 'error');
			return;
		}

		// Group cart items by store
		const ordersByStore = {};
		state.cart.forEach(item => {
			if (!ordersByStore[item.storeId]) {
				ordersByStore[item.storeId] = {
					storeId: item.storeId,
					storeName: item.store,
					items: []
				};
			}
			ordersByStore[item.storeId].items.push(item);
		});

		try {
			const orderPromises = [];
			
			// Create separate orders for each store
			Object.values(ordersByStore).forEach(storeOrder => {
				const totalAmount = storeOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
				
				const order = {
					userId: state.user.uid,
					userName: state.user.displayName || 'Customer',
					userEmail: state.user.email,
					storeId: storeOrder.storeId,
					storeName: storeOrder.storeName,
					items: storeOrder.items,
					totalAmount: totalAmount,
					status: 'pending',
					statusHistory: [{
						status: 'pending',
						timestamp: new Date().toISOString(),
						note: 'Order placed'
					}],
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				};

				const ordersRef = ref(db, 'orders');
				const newOrderRef = push(ordersRef);
				orderPromises.push(
					set(newOrderRef, order).then(() => {
						// Create user notification
						const notifRef = ref(db, `notifications/${state.user.uid}`);
						const newNotif = push(notifRef);
						return set(newNotif, {
							type: 'order',
							title: 'Order Placed!',
							message: `Your order from ${storeOrder.storeName} has been placed successfully.`,
							orderId: newOrderRef.key,
							status: 'pending',
							read: false,
							createdAt: new Date().toISOString()
						});
					})
				);
			});

			await Promise.all(orderPromises);

			// Clear cart
			state.cart = [];
			updateCartBadge();
			renderCart();

			// Show success message
			Swal.fire({
				icon: 'success',
				title: 'Order Placed!',
				text: 'Your order has been sent to the store. Check notifications for updates!',
				confirmButtonText: 'View Orders'
			}).then((result) => {
				if (result.isConfirmed) {
					switchView('profile');
				}
			});

		} catch (error) {
			console.error('Checkout error:', error);
			showToast('Error placing order. Please try again.', 'error');
		}
	}

		// Start the app
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', init);
		} else {
			init();
		}