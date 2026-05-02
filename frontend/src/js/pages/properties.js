/**
 * Properties Page Logic (Controller Pattern)
 * Orchestrates property filtering, fetching, and rendering
 * Handles filter state, URL sync, debouncing, and error handling
 */

class PropertiesPage {
    constructor() {
        this.filters = {
            location: null,
            property_type: null,
            min_price: null,
            max_price: null,
            bedrooms: null
        };
        
        this.elements = {
            filterBarContainer: document.getElementById('filter-bar-container'),
            loadingState: document.getElementById('loading-state'),
            errorState: document.getElementById('error-state'),
            emptyState: document.getElementById('empty-state'),
            propertiesGrid: document.getElementById('properties-grid'),
            retryButton: null,
            emptyMessage: null
        };
        
        this.init();
    }

    init() {
        this.readFiltersFromUrl();
        this.renderFilterBar();
        this.setupRetryHandler();
        this.loadProperties();
    }

    /**
     * Read filter values from URL query parameters
     */
    readFiltersFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        
        this.filters = {
            location: urlParams.get('location') || null,
            property_type: urlParams.get('property_type') || null,
            min_price: urlParams.get('min_price') ? parseFloat(urlParams.get('min_price')) : null,
            max_price: urlParams.get('max_price') ? parseFloat(urlParams.get('max_price')) : null,
            bedrooms: urlParams.get('bedrooms') ? parseInt(urlParams.get('bedrooms'), 10) : null
        };
    }

    /**
     * Update URL with current filter values (without reload)
     */
    updateUrlWithFilters() {
        const url = new URL(window.location);
        
        // Clear existing search params
        url.search = '';
        
        // Add non-null filters to URL
        if (this.filters.location) url.searchParams.set('location', this.filters.location);
        if (this.filters.property_type) url.searchParams.set('property_type', this.filters.property_type);
        if (this.filters.min_price) url.searchParams.set('min_price', this.filters.min_price);
        if (this.filters.max_price) url.searchParams.set('max_price', this.filters.max_price);
        if (this.filters.bedrooms) url.searchParams.set('bedrooms', this.filters.bedrooms);
        
        // Update URL without reloading
        window.history.pushState({}, '', url.toString());
    }

    /**
     * Render filter bar with current filter values
     */
    renderFilterBar() {
        if (!this.elements.filterBarContainer) return;
        
        this.elements.filterBarContainer.innerHTML = '';
        const filterBar = renderFilterBar(this.filters, (newFilters) => {
            this.handleFilterChange(newFilters);
        });
        this.elements.filterBarContainer.appendChild(filterBar);
    }

    /**
     * Handle filter changes
     */
    handleFilterChange(newFilters) {
        this.filters = newFilters;
        this.updateUrlWithFilters();
        this.loadProperties();
    }

    /**
     * Setup retry button handler
     */
    setupRetryHandler() {
        this.elements.retryButton = this.elements.errorState?.querySelector('.retry-button');
        this.elements.emptyMessage = this.elements.emptyState?.querySelector('.empty-message');
        
        if (this.elements.retryButton) {
            this.elements.retryButton.addEventListener('click', () => {
                this.loadProperties();
            });
        }
    }

    /**
     * Show specific UX state with accessibility support
     */
    showState(state, customMessage = null) {
        const { loadingState, errorState, emptyState, propertiesGrid } = this.elements;

        // Hide all states first
        loadingState?.classList.add('hidden');
        errorState?.classList.add('hidden');
        emptyState?.classList.add('hidden');
        propertiesGrid?.classList.add('hidden');

        // Show requested state
        switch (state) {
            case 'loading':
                loadingState?.classList.remove('hidden');
                break;
            case 'error':
                errorState?.classList.remove('hidden');
                if (customMessage) {
                    const errorMessageElement = errorState?.querySelector('.error-message');
                    if (errorMessageElement) {
                        errorMessageElement.textContent = customMessage;
                    }
                }
                // Move focus to error for accessibility
                errorState?.focus();
                break;
            case 'empty':
                emptyState?.classList.remove('hidden');
                if (customMessage && this.elements.emptyMessage) {
                    this.elements.emptyMessage.textContent = customMessage;
                }
                break;
            case 'success':
                propertiesGrid?.classList.remove('hidden');
                break;
        }
    }

    /**
     * Handle structured errors
     */
    handleError(error) {
        console.error('Failed to load properties:', error);

        switch (error.type) {
            case 'TIMEOUT':
                this.showState('error', 'Request timed out. Please check your connection and try again.');
                break;
            case 'NETWORK_ERROR':
                this.showState('error', 'Unable to connect to server. Please check your network connection.');
                break;
            case 'API_ERROR':
                this.showState('error', `Server error (${error.statusCode}). Please try again later.`);
                break;
            case 'INVALID_RESPONSE':
                this.showState('error', 'Received invalid data from server. Please try again.');
                break;
            default:
                this.showState('error', error.message || 'Failed to load properties. Please try again.');
        }
    }

    /**
     * Check if any filters are active
     */
    hasActiveFilters() {
        return Object.values(this.filters).some(value => value !== null);
    }

    /**
     * Load and display properties with current filters
     */
    async loadProperties() {
        this.showState('loading');

        try {
            // Build API filter object (remove null values)
            const apiFilters = {};
            if (this.filters.location) apiFilters.location = this.filters.location;
            if (this.filters.property_type) apiFilters.property_type = this.filters.property_type;
            if (this.filters.min_price) apiFilters.min_price = this.filters.min_price;
            if (this.filters.max_price) apiFilters.max_price = this.filters.max_price;
            if (this.filters.bedrooms) apiFilters.bedrooms = this.filters.bedrooms;

            const properties = await getProperties(apiFilters);

            // Check if properties array is empty
            if (!properties || properties.length === 0) {
                if (this.hasActiveFilters()) {
                    this.showState('empty', 'No properties match your current filters. Try adjusting your search criteria.');
                } else {
                    this.showState('empty', 'There are currently no properties listed. Please check back later.');
                }
                return;
            }

            // Render properties
            this.showState('success');
            
            if (this.elements.propertiesGrid) {
                this.elements.propertiesGrid.innerHTML = '';

                // Use DocumentFragment for batch DOM insertion
                const fragment = document.createDocumentFragment();
                properties.forEach(property => {
                    const card = renderPropertyCard(property);
                    fragment.appendChild(card);
                });
                this.elements.propertiesGrid.appendChild(fragment);
            }
        } catch (error) {
            this.handleError(error);
        }
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    new PropertiesPage();
});
