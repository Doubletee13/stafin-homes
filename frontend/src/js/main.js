console.log("Frontend initialized");

// Basic dynamic component loading stub for Vanilla JS
async function loadComponents() {
    try {
        const navbar = await fetch('/src/components/navbar.html').then(res => res.text());
        const footer = await fetch('/src/components/footer.html').then(res => res.text());

        const navElem = document.getElementById('navbar');
        const footerElem = document.getElementById('footer');

        if (navElem) navElem.innerHTML = navbar;
        if (footerElem) footerElem.innerHTML = footer;
    } catch (error) {
        console.error("Error loading components:", error);
    }
}

/**
 * WhatsApp popup chat widget.
 * Issue #30: Add WhatsApp Contact Button (enhanced with popup UI)
 */
function injectWhatsAppWidget() {
    const number = window.WHATSAPP_NUMBER || '';

    // ── Modern WhatsApp logo SVG (2024 brand) ────────────────────────────
    const waSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 175.216 175.552" width="28" height="28" fill="white" aria-hidden="true">
            <defs><linearGradient id="wa-grad" x1="85.915" x2="86.535" y1="32.567" y2="137.092" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#57d163"/><stop offset="1" stop-color="#23b33a"/>
            </linearGradient></defs>
            <path fill="white" d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.312-6.179 22.559 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.517 31.126 8.521h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.926z"/>
            <path fill="url(#wa-grad)" d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.312-6.179 22.559 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.517 31.126 8.521h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.926z"/>
            <path fill="white" fill-rule="evenodd" d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.226 0-3.218.46-4.902 2.3s-6.435 6.287-6.435 15.332 6.588 17.785 7.506 19.013 12.718 20.381 31.405 27.75c15.529 6.124 18.689 4.906 22.061 4.6s10.877-4.447 12.408-8.74 1.532-7.971 1.073-8.74-1.685-1.226-3.525-2.146-10.877-5.367-12.562-5.981-2.91-.919-4.137.921-4.746 5.979-5.819 7.206-2.144 1.381-3.984.462-7.76-2.861-14.784-9.124c-5.465-4.873-9.154-10.891-10.228-12.73s-.114-2.835.808-3.751c.825-.824 1.838-2.147 2.759-3.22s1.224-1.84 1.836-3.065.307-2.301-.153-3.22-4.032-10.011-5.666-13.647z"/>
        </svg>`;

    // ── Popup card ───────────────────────────────────────────────────────
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
                <p style="margin:4px 0 0;font-size:11px;color:#999;text-align:right;">4:18 AM ✓✓</p>
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
    `;

    // ── Floating trigger button ──────────────────────────────────────────
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

    // ── Mount ────────────────────────────────────────────────────────────
    document.body.appendChild(popup);
    document.body.appendChild(fab);

    // ── Auto-resize textarea ─────────────────────────────────────────────
    const textarea = popup.querySelector('#wa-user-msg');
    textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 80) + 'px';
    });

    // ── Toggle popup ─────────────────────────────────────────────────────
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

    fab.addEventListener('click', (e) => {
        e.stopPropagation();
        isOpen ? closePopup() : openPopup();
    });
    fab.addEventListener('mouseenter', () => {
        fab.style.transform = 'scale(1.08)';
        fab.style.boxShadow = '0 6px 24px rgba(37,211,102,0.65)';
    });
    fab.addEventListener('mouseleave', () => {
        fab.style.transform = 'scale(1)';
        fab.style.boxShadow = '0 4px 16px rgba(37,211,102,0.5)';
    });

    popup.querySelector('#wa-popup-close').addEventListener('click', closePopup);

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (isOpen && !popup.contains(e.target) && e.target !== fab) closePopup();
    });

    // ── Send message ─────────────────────────────────────────────────────
    popup.querySelector('#wa-send-btn').addEventListener('click', () => {
        const msg = (textarea.value.trim() || "Hello! I'd like to enquire about properties on Stafin Homes.");
        const url = `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        closePopup();
    });

    // Also send on Enter (not Shift+Enter)
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            popup.querySelector('#wa-send-btn').click();
        }
    });

    // Send hover
    const sendBtn = popup.querySelector('#wa-send-btn');
    sendBtn.addEventListener('mouseenter', () => { sendBtn.style.background = '#1ebe5d'; });
    sendBtn.addEventListener('mouseleave', () => { sendBtn.style.background = '#25D366'; });
}

document.addEventListener('DOMContentLoaded', () => {
    loadComponents();
    injectWhatsAppWidget();
});
