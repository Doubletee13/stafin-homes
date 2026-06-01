console.log("Frontend initialized");

// Basic dynamic component loading stub for Vanilla JS
async function loadComponents() {
    // Inject Loader early
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = `
        <div class="loader-square"></div>
        <div class="loader-square"></div>
        <div class="loader-square"></div>
        <div class="loader-square"></div>
    `;
    document.body.appendChild(loader);

    try {
        const navbar = await fetch('/src/components/navbar.html').then(res => res.text());
        const footer = await fetch('/src/components/footer.html').then(res => res.text());

        const navElem = document.getElementById('navbar');
        const footerElem = document.getElementById('footer');

        if (navElem) {
            navElem.innerHTML = navbar;
            if (typeof initializeNewsTicker === 'function') {
                initializeNewsTicker();
            }
            initNavbarInteractions();
            initSmartNavbar();
        }
        if (footerElem) footerElem.innerHTML = footer;
    } catch (error) {
        console.error("Error loading components:", error);
    } finally {
        loader.classList.add('hidden-loader');
        setTimeout(() => loader.remove(), 400);
    }
}

/**
 * Initialise all navbar interactive behaviours after the navbar HTML is injected.
 * - Mobile side drawer open/close
 * - Drawer tab switching (Menu / Categories)
 * - Desktop Browse Categories dropdown (hover + click)
 */
function initNavbarInteractions() {
    const hamburgerBtn = document.getElementById('mobile-menu-btn');
    const sideDrawer = document.getElementById('side-drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');
    const drawerCloseBtn = document.getElementById('drawer-close-btn');

    // ── Helper: open / close drawer ──────────────────────────────────────
    function openDrawer() {
        if (!sideDrawer || !drawerOverlay) return;
        sideDrawer.classList.add('open');
        sideDrawer.setAttribute('aria-hidden', 'false');
        sideDrawer.removeAttribute('inert');
        drawerOverlay.classList.remove('hidden');
        // Trigger transition next frame
        requestAnimationFrame(() => drawerOverlay.classList.add('open'));
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        if (!sideDrawer || !drawerOverlay) return;
        sideDrawer.classList.remove('open');
        sideDrawer.setAttribute('aria-hidden', 'true');
        sideDrawer.setAttribute('inert', '');
        drawerOverlay.classList.remove('open');
        document.body.style.overflow = '';
        // Hide overlay once transition done
        setTimeout(() => drawerOverlay.classList.add('hidden'), 350);
    }

    if (hamburgerBtn) hamburgerBtn.addEventListener('click', openDrawer);
    if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
    if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

    // ── Drawer Tab Switching ─────────────────────────────────────────────
    const drawerTabs = document.querySelectorAll('.drawer-tab');
    const drawerPanels = document.querySelectorAll('.drawer-panel');

    drawerTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;

            // Update tab styles
            drawerTabs.forEach(t => {
                t.classList.remove('text-primary', 'border-primary');
                t.classList.add('text-gray-400', 'border-transparent');
            });
            tab.classList.add('text-primary', 'border-primary');
            tab.classList.remove('text-gray-400', 'border-transparent');

            // Show/hide panels
            drawerPanels.forEach(panel => {
                if (panel.id === `drawer-panel-${target}`) {
                    panel.classList.remove('hidden');
                } else {
                    panel.classList.add('hidden');
                }
            });
        });
    });

    // ── Desktop Browse Categories Dropdown ───────────────────────────────
    const categoriesWrapper = document.getElementById('categories-dropdown-wrapper');
    const categoriesBtn = document.getElementById('browse-categories-btn');
    const categoriesMenu = document.getElementById('categories-dropdown');
    const categoriesChevron = document.getElementById('categories-chevron');

    if (categoriesWrapper && categoriesBtn && categoriesMenu) {
        let hideTimeout;

        function showDropdown() {
            clearTimeout(hideTimeout);
            categoriesMenu.classList.remove('hidden');
            // Trigger CSS transition next frame
            requestAnimationFrame(() => categoriesMenu.classList.add('open'));
            categoriesBtn.setAttribute('aria-expanded', 'true');
            if (categoriesChevron) categoriesChevron.style.transform = 'rotate(180deg)';
        }

        function hideDropdown() {
            hideTimeout = setTimeout(() => {
                categoriesMenu.classList.remove('open');
                categoriesBtn.setAttribute('aria-expanded', 'false');
                if (categoriesChevron) categoriesChevron.style.transform = '';
                setTimeout(() => categoriesMenu.classList.add('hidden'), 200);
            }, 120);
        }

        categoriesWrapper.addEventListener('mouseenter', showDropdown);
        categoriesWrapper.addEventListener('mouseleave', hideDropdown);
        categoriesBtn.addEventListener('click', () => {
            const isOpen = categoriesMenu.classList.contains('open');
            isOpen ? hideDropdown() : showDropdown();
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!categoriesWrapper.contains(e.target)) hideDropdown();
        });
    }

    // ── Dark Mode Toggle (wired after component injection) ───────────────
    wireDarkModeToggle();
}

/**
 * Smart Sticky Navbar — Hides on scroll down, shows on scroll up
 */
function initSmartNavbar() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    // Apply smooth transition
    nav.style.transition = 'transform 0.3s ease-in-out';

    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        // Don't hide navbar at the very top
        if (currentScrollY < 100) {
            nav.style.transform = 'translateY(0)';
        } else if (currentScrollY > lastScrollY) {
            // Scrolling down -> hide navbar
            nav.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up -> show navbar
            nav.style.transform = 'translateY(0)';
        }

        lastScrollY = currentScrollY;
    }, { passive: true });
}

/**
 * Dark Mode — initialise on page load and wire toggle button
 */
function initDarkMode() {
    const saved = localStorage.getItem('stafin-theme');
    if (saved === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

function wireDarkModeToggle() {
    const toggleBtns = document.querySelectorAll('.dark-mode-toggle, #admin-dark-toggle, #admin-dark-toggle-mobile');
    if (!toggleBtns.length) return;

    const isDark = () => document.documentElement.classList.contains('dark');

    function updateIcons() {
        const svgContent = isDark() ? `
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
        ` : `
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
            </svg>
        `;

        toggleBtns.forEach(btn => {
            btn.innerHTML = svgContent;
            btn.setAttribute('aria-label', isDark() ? 'Switch to light mode' : 'Switch to dark mode');
            btn.title = isDark() ? 'Light Mode' : 'Dark Mode';
        });
    }

    updateIcons();

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const nowDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('stafin-theme', nowDark ? 'dark' : 'light');
            updateIcons();
        });
    });
}

/**
 * WhatsApp popup chat widget.
 */
function injectWhatsAppWidget() {
    const number = window.WHATSAPP_NUMBER || '';

    // Official WhatsApp brand logo SVG
    const waSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
            <path d="M16 0C7.163 0 0 7.163 0 16c0 2.822.736 5.472 2.025 7.773L0 32l8.476-2.003A15.937 15.937 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0z" fill="#25D366"/>
            <path d="M23.334 19.74c-.354-.177-2.094-1.033-2.419-1.15-.324-.118-.56-.177-.797.177-.236.354-.914 1.15-1.12 1.387-.207.236-.413.265-.767.089-.354-.177-1.495-.551-2.847-1.757-1.052-.938-1.762-2.097-1.969-2.451-.207-.354-.022-.545.155-.721.159-.158.354-.413.531-.619.177-.207.236-.354.354-.59.118-.236.059-.442-.03-.619-.089-.177-.797-1.92-1.09-2.628-.287-.69-.579-.596-.797-.607a14.3 14.3 0 00-.678-.012c-.236 0-.619.089-.943.442-.324.354-1.238 1.21-1.238 2.95s1.267 3.42 1.444 3.657c.177.236 2.493 3.806 6.042 5.337.845.364 1.504.582 2.018.745.848.27 1.62.232 2.231.141.68-.102 2.094-.856 2.39-1.683.295-.826.295-1.534.207-1.683-.089-.148-.324-.236-.678-.413z" fill="#fff"/>
        </svg>`;

    const popup = document.createElement('div');
    popup.id = 'wa-popup';
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-label', 'Chat with Stafin Homes on WhatsApp');
    popup.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 24px;
        z-index: 10000;
        width: 320px;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0,0,0,0.18);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        display: none;
        transform: scale(0.95) translateY(8px);
        opacity: 0;
        transition: transform 0.22s ease, opacity 0.22s ease;
    `;

    popup.innerHTML = `
        <!-- Header -->
        <div style="background:#075E54;padding:16px 16px 20px;display:flex;align-items:center;gap:12px;position:relative;">
            <div style="width:46px;height:46px;border-radius:50%;background:#128C7E;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="white">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
            </div>
            <div>
                <p style="margin:0;color:#fff;font-weight:700;font-size:15px;line-height:1.2;">Stafin Homes</p>
                <p style="margin:0;color:#dcf8c6;font-size:12px;margin-top:2px;">Typically replies within 10 minutes</p>
            </div>
            <button id="wa-popup-close" aria-label="Close WhatsApp chat"
                style="position:absolute;top:10px;right:12px;background:none;border:none;cursor:pointer;color:#ccc;font-size:20px;line-height:1;padding:4px;">✕</button>
        </div>
        <!-- Chat bubble -->
        <div style="background:#ece5dd;padding:16px;">
            <div style="background:#fff;border-radius:0 8px 8px 8px;padding:10px 14px;max-width:85%;box-shadow:0 1px 2px rgba(0,0,0,0.1);margin-bottom:12px;">
                <p style="margin:0;font-size:14px;color:#303030;line-height:1.5;">👋 Hi there! How can we help you find your dream property today?</p>
                <p style="margin:4px 0 0;font-size:11px;color:#999;text-align:right;">Now ✓✓</p>
            </div>
            <!-- Message input -->
            <div style="background:#fff;border-radius:24px;display:flex;align-items:flex-end;gap:8px;padding:8px 12px;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
                <textarea id="wa-user-msg" placeholder="Type a message..."
                    style="flex:1;border:none;outline:none;resize:none;font-size:14px;color:#303030;background:transparent;max-height:80px;min-height:20px;line-height:1.5;"
                    rows="1"></textarea>
                <button id="wa-send-btn" aria-label="Send message on WhatsApp"
                    style="background:#25D366;border:none;border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:background 0.2s;">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="white">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                </button>
            </div>
        </div>
        <style>
            @media (max-width: 640px) {
                #wa-fab { bottom: 80px !important; }
                #wa-popup { bottom: 150px !important; }
            }
        </style>
    `;

    const fab = document.createElement('button');
    fab.id = 'wa-fab';
    fab.setAttribute('aria-label', 'Open WhatsApp chat');
    fab.style.cssText = `
        position: fixed;
        bottom: 28px;
        right: 28px;
        z-index: 10001;
        width: 60px;
        height: 60px;
        background-color: #25D366;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 16px rgba(37,211,102,0.5);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    `;
    fab.innerHTML = waSVG;

    document.body.appendChild(popup);
    document.body.appendChild(fab);

    const textarea = popup.querySelector('#wa-user-msg');
    textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 80) + 'px';
    });

    let isOpen = false;
    function openPopup() {
        popup.style.display = 'block';
        requestAnimationFrame(() => {
            popup.style.transform = 'scale(1) translateY(0)';
            popup.style.opacity = '1';
        });
        isOpen = true;
        setTimeout(() => textarea.focus(), 250);
    }
    function closePopup() {
        popup.style.transform = 'scale(0.95) translateY(8px)';
        popup.style.opacity = '0';
        setTimeout(() => { popup.style.display = 'none'; }, 220);
        isOpen = false;
    }

    fab.addEventListener('click', (e) => { e.stopPropagation(); isOpen ? closePopup() : openPopup(); });
    fab.addEventListener('mouseenter', () => { fab.style.transform = 'scale(1.08)'; fab.style.boxShadow = '0 6px 24px rgba(37,211,102,0.65)'; });
    fab.addEventListener('mouseleave', () => { fab.style.transform = 'scale(1)'; fab.style.boxShadow = '0 4px 16px rgba(37,211,102,0.5)'; });

    popup.querySelector('#wa-popup-close').addEventListener('click', closePopup);
    document.addEventListener('click', (e) => { if (isOpen && !popup.contains(e.target) && e.target !== fab) closePopup(); });

    popup.querySelector('#wa-send-btn').addEventListener('click', () => {
        const msg = (textarea.value.trim() || "Hello! I'd like to enquire about properties on Stafin Homes.");
        const url = `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        closePopup();
    });

    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            popup.querySelector('#wa-send-btn').click();
        }
    });

    const sendBtn = popup.querySelector('#wa-send-btn');
    sendBtn.addEventListener('mouseenter', () => { sendBtn.style.background = '#1ebe5d'; });
    sendBtn.addEventListener('mouseleave', () => { sendBtn.style.background = '#25D366'; });
}

document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
    loadComponents();
    injectWhatsAppWidget();
});
