/**
 * Property Details View Component
 * Renders full property details with defensive programming
 * Handles missing data gracefully
 * Uses unified media[] format and the mediaCarousel component.
 */


/**
 * Format price to currency string
 * @param {number} price - Property price
 * @returns {string} Formatted price string
 */
function formatPrice(price) {
    const safePrice = price ?? 0;
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(safePrice);
}

/**
 * Get property type display label
 * @param {string} type - Property type (sale, rent, shortlet)
 * @returns {string} Display label
 */
function getPropertyTypeLabel(type) {
    const labels = {
        'sale': 'For Sale',
        'rent': 'For Rent',
        'shortlet': 'Short Let'
    };
    return labels[type] || type;
}

/**
 * Get property type badge color class
 * @param {string} type - Property type
 * @returns {string} Tailwind CSS color classes
 */
function getPropertyTypeColor(type) {
    const colors = {
        'sale': 'bg-green-100 text-green-800',
        'rent': 'bg-blue-100 text-blue-800',
        'shortlet': 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
}

/**
 * Render property details view
 * @param {Object} property - Property object from API
 * @returns {HTMLElement} Property details DOM element
 */
function renderPropertyDetails(property) {
    const container = document.createElement('div');
    container.className = 'bg-white shadow-lg rounded-lg overflow-hidden';

    // Defensive: Safely extract all fields with fallbacks
    const title = property.title || 'Property';
    const description = property.description || 'No description available.';
    const location = property.location || 'Location not specified';
    const propertyType = property.property_type || 'sale';
    const price = property.price ?? 0;
    const bedrooms = property.bedrooms ?? 0;
    const bathrooms = property.bathrooms ?? 0;
    // Support unified media[] and also legacy image_urls for read safety
    let media = property.media || [];
    if ((!media || media.length === 0) && property.image_urls && property.image_urls.length > 0) {
        media = property.image_urls.map(url => ({ type: 'image', url }));
    }
    const createdAt = property.created_at || '';

    const typeLabel = getPropertyTypeLabel(propertyType);
    const typeColor = getPropertyTypeColor(propertyType);
    const formattedPrice = formatPrice(price);
    const mediaCount = media.length;
    const imageCount = media.filter(m => m.type === 'image').length;
    const videoCount = media.filter(m => m.type === 'video').length;

    // Format date if available
    const formattedDate = createdAt
        ? new Date(createdAt).toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : '';

    // ── Build static HTML shell (carousel injected via DOM) ──────────────
    container.innerHTML = `
        <!-- Media Carousel Slot -->
        <div id="carousel-slot" class="relative">
            <div class="absolute top-4 right-4 z-30">
                <span class="px-4 py-2 rounded-full text-sm font-semibold ${typeColor}">
                    ${typeLabel}
                </span>
            </div>
        </div>

        <!-- Property Info -->
        <div class="p-8">
            <!-- Title and Price -->
            <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                <div class="flex-1">
                    <h1 class="text-3xl font-bold text-gray-900 mb-2">${title}</h1>
                    <div class="flex items-center text-gray-600">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        <span class="text-lg">${location}</span>
                    </div>
                </div>
                <div class="mt-4 md:mt-0 md:ml-8 text-right">
                    <p class="text-3xl font-bold text-blue-600">${formattedPrice}</p>
                    ${formattedDate ? `<p class="text-sm text-gray-500 mt-1">Listed on ${formattedDate}</p>` : ''}
                </div>
            </div>

            <!-- Property Features -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-6 bg-gray-50 rounded-lg">
                <div class="text-center">
                    <div class="flex items-center justify-center text-gray-600 mb-2">
                        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                        </svg>
                        <span class="text-2xl font-semibold text-gray-900">${bedrooms}</span>
                    </div>
                    <p class="text-sm text-gray-600">Bedrooms</p>
                </div>
                <div class="text-center">
                    <div class="flex items-center justify-center text-gray-600 mb-2">
                        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/>
                        </svg>
                        <span class="text-2xl font-semibold text-gray-900">${bathrooms}</span>
                    </div>
                    <p class="text-sm text-gray-600">Bathrooms</p>
                </div>
                <div class="text-center">
                    <div class="flex items-center justify-center text-gray-600 mb-2">
                        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                        </svg>
                        <span class="text-lg font-semibold text-gray-900 capitalize">${propertyType}</span>
                    </div>
                    <p class="text-sm text-gray-600">Type</p>
                </div>
                <div class="text-center">
                    <div class="flex items-center justify-center text-gray-600 mb-2">
                        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <span class="text-lg font-semibold text-gray-900">${mediaCount}</span>
                    </div>
                    <p class="text-sm text-gray-600">${imageCount > 0 && videoCount > 0 ? 'Photos & Videos' : imageCount > 0 ? 'Photos' : 'Videos'}</p>
                </div>
            </div>

            <!-- Description -->
            <div class="mb-8">
                <h2 class="text-xl font-semibold text-gray-900 mb-4">Description</h2>
                <p class="text-gray-700 leading-relaxed whitespace-pre-line">${description}</p>
            </div>
        </div>
    `;

    // ── Inject media carousel into the slot ──────────────────────────────
    const carouselSlot = container.querySelector('#carousel-slot');
    if (carouselSlot && typeof createMediaCarousel === 'function') {
        const carousel = createMediaCarousel(media, title);
        carouselSlot.insertBefore(carousel, carouselSlot.firstChild);
    }

    // ── Inject Inquiry Form ──────────────────────────────────────────────
    const infoSection = container.querySelector('.p-8');
    if (infoSection && typeof createInquiryForm === 'function') {
        const contactForm = createInquiryForm(property.id);
        infoSection.appendChild(contactForm);
    }

    // ── Inject WhatsApp "Chat About This Property" Button (Issue #30) ─────
    if (infoSection) {
        const number = window.WHATSAPP_NUMBER || '';
        const waMessage = encodeURIComponent(
            `Hi! I'm interested in the property: "${title}". Can you share more details?`
        );
        const waHref = `https://wa.me/${number}?text=${waMessage}`;

        const waSection = document.createElement('div');
        waSection.className = 'mt-4';
        waSection.innerHTML = `
            <a id="whatsapp-property-btn"
               href="${waHref}"
               target="_blank"
               rel="noopener noreferrer"
               aria-label="Chat about ${title} on WhatsApp"
               class="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-md font-bold text-white transition-all duration-200"
               style="background-color:#25D366;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 175.216 175.552" width="22" height="22" fill="white" aria-hidden="true">
                    <defs><linearGradient id="wa-prop-grad" x1="85.915" x2="86.535" y1="32.567" y2="137.092" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stop-color="#57d163"/><stop offset="1" stop-color="#23b33a"/>
                    </linearGradient></defs>
                    <path fill="white" d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.312-6.179 22.559 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.517 31.126 8.521h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.926z"/>
                    <path fill="url(#wa-prop-grad)" d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.312-6.179 22.559 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.517 31.126 8.521h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.926z"/>
                    <path fill="white" fill-rule="evenodd" d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.226 0-3.218.46-4.902 2.3s-6.435 6.287-6.435 15.332 6.588 17.785 7.506 19.013 12.718 20.381 31.405 27.75c15.529 6.124 18.689 4.906 22.061 4.6s10.877-4.447 12.408-8.74 1.532-7.971 1.073-8.74-1.685-1.226-3.525-2.146-10.877-5.367-12.562-5.981-2.91-.919-4.137.921-4.746 5.979-5.819 7.206-2.144 1.381-3.984.462-7.76-2.861-14.784-9.124c-5.465-4.873-9.154-10.891-10.228-12.73s-.114-2.835.808-3.751c.825-.824 1.838-2.147 2.759-3.22s1.224-1.84 1.836-3.065.307-2.301-.153-3.22-4.032-10.011-5.666-13.647z"/>
                </svg>
                Chat About This Property
            </a>
        `;

        const waBtn = waSection.querySelector('#whatsapp-property-btn');
        waBtn.addEventListener('mouseenter', () => {
            waBtn.style.filter = 'brightness(1.1)';
            waBtn.style.boxShadow = '0 4px 14px rgba(37, 211, 102, 0.5)';
        });
        waBtn.addEventListener('mouseleave', () => {
            waBtn.style.filter = '';
            waBtn.style.boxShadow = '';
        });

        infoSection.appendChild(waSection);
    }

    return container;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { renderPropertyDetails };
}
