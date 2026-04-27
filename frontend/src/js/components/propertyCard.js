/**
 * Property Card Component
 * Renders a single property card with image, price, location, and type
 * Card is clickable and navigates to property details page
 */

/**
 * Format price to currency string
 * @param {number} price - Property price
 * @returns {string} Formatted price string
 */
function formatPrice(price) {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
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
 * Render a property card element
 * @param {Object} property - Property object from API
 * @returns {HTMLElement} Property card DOM element
 */
function renderPropertyCard(property) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer';
    card.setAttribute('data-property-id', property.id);
    
    // Navigate to property details on click
    card.addEventListener('click', () => {
        window.location.href = `/property-details.html?id=${property.id}`;
    });

    // Get first image or use placeholder
    const imageUrl = property.image_urls && property.image_urls.length > 0 
        ? property.image_urls[0] 
        : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=60';

    const typeLabel = getPropertyTypeLabel(property.property_type);
    const typeColor = getPropertyTypeColor(property.property_type);
    const safePrice = property.price ?? 0;
    const formattedPrice = formatPrice(safePrice);

    card.innerHTML = `
        <div class="relative h-48 overflow-hidden">
            <img 
                src="${imageUrl}" 
                alt="${property.title || 'Property'}"
                class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                onerror="this.src='https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=60'"
            />
            <div class="absolute top-3 right-3">
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${typeColor}">
                    ${typeLabel}
                </span>
            </div>
        </div>
        <div class="p-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                ${property.title || 'Property'}
            </h3>
            <div class="flex items-center text-gray-600 mb-2">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span class="text-sm">${property.location || 'Location not specified'}</span>
            </div>
            <div class="flex items-center justify-between mt-3">
                <p class="text-xl font-bold text-blue-600">
                    ${formattedPrice}
                </p>
                <div class="flex items-center space-x-3 text-gray-500 text-sm">
                    ${property.bedrooms > 0 ? `
                        <span class="flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                            </svg>
                            ${property.bedrooms}
                        </span>
                    ` : ''}
                    ${property.bathrooms > 0 ? `
                        <span class="flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/>
                            </svg>
                            ${property.bathrooms}
                        </span>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    return card;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { renderPropertyCard };
}
