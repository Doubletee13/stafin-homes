/**
 * Filter Bar Component (Issue #13: Extended)
 * Adds keyword search, sorting, and bathroom controls
 * to the existing location/type/price/bedrooms filters.
 */

/**
 * Render filter bar with all filter controls
 * @param {Object} currentFilters - Current filter values
 * @param {Function} onFilterChange - Callback when filter changes
 * @returns {HTMLElement} Filter bar DOM element
 */
function renderFilterBar(currentFilters, onFilterChange) {
    const container = document.createElement('div');
    container.className = 'bg-white rounded-lg shadow-md p-6 mb-8';
    container.setAttribute('role', 'search');
    container.setAttribute('aria-label', 'Filter properties');

    container.innerHTML = `
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Filter Properties</h2>
            <button 
                type="button" 
                class="clear-filters-btn text-sm text-blue-600 hover:text-blue-800 transition-colors focus:outline-none focus:underline"
                aria-label="Clear all filters"
            >
                Clear Filters
            </button>
        </div>
        
        <form id="filter-form" class="space-y-4">
            <!-- Row 1: Keyword + Sort -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Keyword Search -->
                <div>
                    <label for="filter-keyword" class="block text-sm font-medium text-gray-700 mb-1">
                        Search
                    </label>
                    <input 
                        type="text" 
                        id="filter-keyword" 
                        name="keyword"
                        value="${currentFilters.keyword || ''}"
                        placeholder="e.g. pool, furnished, penthouse..."
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        aria-describedby="keyword-help"
                    />
                    <p id="keyword-help" class="mt-1 text-xs text-gray-500">Search by title or description</p>
                </div>

                <!-- Sort -->
                <div>
                    <label for="filter-sort" class="block text-sm font-medium text-gray-700 mb-1">
                        Sort By
                    </label>
                    <select 
                        id="filter-sort" 
                        name="sort"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="newest" ${(currentFilters.sort || 'newest') === 'newest' ? 'selected' : ''}>Newest Listings</option>
                        <option value="oldest" ${currentFilters.sort === 'oldest' ? 'selected' : ''}>Oldest Listings</option>
                        <option value="price_asc" ${currentFilters.sort === 'price_asc' ? 'selected' : ''}>Price: Low → High</option>
                        <option value="price_desc" ${currentFilters.sort === 'price_desc' ? 'selected' : ''}>Price: High → Low</option>
                    </select>
                </div>
            </div>

            <!-- Row 2: Location + Type -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- Location Filter -->
                <div>
                    <label for="filter-location" class="block text-sm font-medium text-gray-700 mb-1">
                        Location
                    </label>
                    <input 
                        type="text" 
                        id="filter-location" 
                        name="location"
                        value="${currentFilters.location || ''}"
                        placeholder="e.g., Lagos, Abuja"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        aria-describedby="location-help"
                    />
                    <p id="location-help" class="mt-1 text-xs text-gray-500">Search by city or area</p>
                </div>

                <!-- Property Type Filter -->
                <div>
                    <label for="filter-property-type" class="block text-sm font-medium text-gray-700 mb-1">
                        Property Type
                    </label>
                    <select 
                        id="filter-property-type" 
                        name="property_type"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Types</option>
                        <option value="sale" ${currentFilters.property_type === 'sale' ? 'selected' : ''}>For Sale</option>
                        <option value="rent" ${currentFilters.property_type === 'rent' ? 'selected' : ''}>For Rent</option>
                        <option value="shortlet" ${currentFilters.property_type === 'shortlet' ? 'selected' : ''}>Short Let</option>
                    </select>
                </div>

                <!-- Bedrooms Filter -->
                <div>
                    <label for="filter-bedrooms" class="block text-sm font-medium text-gray-700 mb-1">
                        Bedrooms
                    </label>
                    <select 
                        id="filter-bedrooms" 
                        name="bedrooms"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Any</option>
                        <option value="1" ${currentFilters.bedrooms === 1 ? 'selected' : ''}>1+ Bedroom</option>
                        <option value="2" ${currentFilters.bedrooms === 2 ? 'selected' : ''}>2+ Bedrooms</option>
                        <option value="3" ${currentFilters.bedrooms === 3 ? 'selected' : ''}>3+ Bedrooms</option>
                        <option value="4" ${currentFilters.bedrooms === 4 ? 'selected' : ''}>4+ Bedrooms</option>
                        <option value="5" ${currentFilters.bedrooms === 5 ? 'selected' : ''}>5+ Bedrooms</option>
                    </select>
                </div>
            </div>

            <!-- Row 3: Price + Bathrooms -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Min Price Filter -->
                <div>
                    <label for="filter-min-price" class="block text-sm font-medium text-gray-700 mb-1">
                        Min Price (₦)
                    </label>
                    <input 
                        type="number" 
                        id="filter-min-price" 
                        name="min_price"
                        value="${currentFilters.min_price || ''}"
                        placeholder="Min"
                        min="0"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <!-- Max Price Filter -->
                <div>
                    <label for="filter-max-price" class="block text-sm font-medium text-gray-700 mb-1">
                        Max Price (₦)
                    </label>
                    <input 
                        type="number" 
                        id="filter-max-price" 
                        name="max_price"
                        value="${currentFilters.max_price || ''}"
                        placeholder="Max"
                        min="0"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <!-- Bathrooms Filter (NEW) -->
                <div>
                    <label for="filter-bathrooms" class="block text-sm font-medium text-gray-700 mb-1">
                        Bathrooms
                    </label>
                    <select 
                        id="filter-bathrooms" 
                        name="bathrooms"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Any</option>
                        <option value="1" ${currentFilters.bathrooms === 1 ? 'selected' : ''}>1+ Bathroom</option>
                        <option value="2" ${currentFilters.bathrooms === 2 ? 'selected' : ''}>2+ Bathrooms</option>
                        <option value="3" ${currentFilters.bathrooms === 3 ? 'selected' : ''}>3+ Bathrooms</option>
                        <option value="4" ${currentFilters.bathrooms === 4 ? 'selected' : ''}>4+ Bathrooms</option>
                    </select>
                </div>
            </div>
        </form>
    `;

    // --- DOM references ---
    const keywordInput = container.querySelector('#filter-keyword');
    const sortSelect = container.querySelector('#filter-sort');
    const locationInput = container.querySelector('#filter-location');
    const propertyTypeSelect = container.querySelector('#filter-property-type');
    const minPriceInput = container.querySelector('#filter-min-price');
    const maxPriceInput = container.querySelector('#filter-max-price');
    const bedroomsSelect = container.querySelector('#filter-bedrooms');
    const bathroomsSelect = container.querySelector('#filter-bathrooms');
    const clearFiltersBtn = container.querySelector('.clear-filters-btn');
    const filterForm = container.querySelector('#filter-form');

    // --- Helper: collect all current filter values ---
    const getFilterValues = () => ({
        keyword: keywordInput.value.trim() || null,
        sort: sortSelect.value || 'newest',
        location: locationInput.value.trim() || null,
        property_type: propertyTypeSelect.value || null,
        min_price: minPriceInput.value ? parseFloat(minPriceInput.value) : null,
        max_price: maxPriceInput.value ? parseFloat(maxPriceInput.value) : null,
        bedrooms: bedroomsSelect.value ? parseInt(bedroomsSelect.value, 10) : null,
        bathrooms: bathroomsSelect.value ? parseInt(bathroomsSelect.value, 10) : null,
    });

    // --- Debounce for text inputs ---
    let debounceTimeout;
    const debounce = (callback, delay) => (...args) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => callback(...args), delay);
    };

    const notifyChange = () => onFilterChange(getFilterValues());
    const debouncedNotify = debounce(notifyChange, 400);

    // Text inputs — debounced
    keywordInput.addEventListener('input', debouncedNotify);
    locationInput.addEventListener('input', debouncedNotify);
    minPriceInput.addEventListener('input', debouncedNotify);
    maxPriceInput.addEventListener('input', debouncedNotify);

    // Select dropdowns — immediate
    sortSelect.addEventListener('change', notifyChange);
    propertyTypeSelect.addEventListener('change', notifyChange);
    bedroomsSelect.addEventListener('change', notifyChange);
    bathroomsSelect.addEventListener('change', notifyChange);

    // Clear all
    clearFiltersBtn.addEventListener('click', () => {
        keywordInput.value = '';
        sortSelect.value = 'newest';
        locationInput.value = '';
        propertyTypeSelect.value = '';
        minPriceInput.value = '';
        maxPriceInput.value = '';
        bedroomsSelect.value = '';
        bathroomsSelect.value = '';
        onFilterChange({ sort: 'newest' });
    });

    // Prevent native form submission
    filterForm.addEventListener('submit', (e) => e.preventDefault());

    return container;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { renderFilterBar };
}
