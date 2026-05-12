/**
 * Properties Page Logic (Issue #13: Extended)
 * Adds pagination, sorting, keyword search, and bathroom filtering
 * while preserving all existing filter/URL sync behaviour.
 */

const PROPERTIES_PER_PAGE = 12;

class PropertiesPage {
    constructor() {
        this.filters = {
            // Existing filters (preserved)
            location: null,
            property_type: null,
            min_price: null,
            max_price: null,
            bedrooms: null,
            // New filters (Issue #13)
            keyword: null,
            sort: 'newest',
            bathrooms: null,
        };

        // Pagination state
        this.page = 1;
        this.totalPages = 1;
        this.totalCount = 0;

        // Abort controller to cancel in-flight requests on rapid filter changes
        this._abortController = null;

        this.elements = {
            filterBarContainer: document.getElementById('filter-bar-container'),
            loadingState: document.getElementById('loading-state'),
            errorState: document.getElementById('error-state'),
            emptyState: document.getElementById('empty-state'),
            propertiesGrid: document.getElementById('properties-grid'),
            paginationContainer: document.getElementById('pagination-container'),
            retryButton: null,
            emptyMessage: null,
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
     * Read filter + pagination values from URL query parameters
     */
    readFiltersFromUrl() {
        const p = new URLSearchParams(window.location.search);

        this.filters = {
            location: p.get('location') || null,
            property_type: p.get('property_type') || null,
            min_price: p.get('min_price') ? parseFloat(p.get('min_price')) : null,
            max_price: p.get('max_price') ? parseFloat(p.get('max_price')) : null,
            bedrooms: p.get('bedrooms') ? parseInt(p.get('bedrooms'), 10) : null,
            keyword: p.get('keyword') || null,
            sort: p.get('sort') || 'newest',
            bathrooms: p.get('bathrooms') ? parseInt(p.get('bathrooms'), 10) : null,
        };

        this.page = p.get('page') ? parseInt(p.get('page'), 10) : 1;
    }

    /**
     * Write current filter + pagination state to URL (no reload)
     */
    updateUrlWithFilters() {
        const url = new URL(window.location);
        url.search = '';

        const f = this.filters;
        if (f.location) url.searchParams.set('location', f.location);
        if (f.property_type) url.searchParams.set('property_type', f.property_type);
        if (f.min_price) url.searchParams.set('min_price', f.min_price);
        if (f.max_price) url.searchParams.set('max_price', f.max_price);
        if (f.bedrooms) url.searchParams.set('bedrooms', f.bedrooms);
        if (f.keyword) url.searchParams.set('keyword', f.keyword);
        if (f.sort && f.sort !== 'newest') url.searchParams.set('sort', f.sort);
        if (f.bathrooms) url.searchParams.set('bathrooms', f.bathrooms);
        if (this.page > 1) url.searchParams.set('page', this.page);

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
     * Handle filter changes — resets to page 1
     */
    handleFilterChange(newFilters) {
        this.filters = { sort: 'newest', ...newFilters };
        this.page = 1; // Reset to first page on any filter change
        this.updateUrlWithFilters();
        this.loadProperties();
    }

    /**
     * Handle page change from pagination bar
     */
    handlePageChange(newPage) {
        this.page = newPage;
        this.updateUrlWithFilters();
        this.loadProperties();
        // Scroll back to top of listing
        this.elements.filterBarContainer?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    /**
     * Setup retry button handler on error state
     */
    setupRetryHandler() {
        this.elements.retryButton = this.elements.errorState?.querySelector('.retry-button');
        this.elements.emptyMessage = this.elements.emptyState?.querySelector('.empty-message');

        if (this.elements.retryButton) {
            this.elements.retryButton.addEventListener('click', () => this.loadProperties());
        }
    }

    /**
     * Show skeleton loaders in the grid during fetch
     */
    showSkeletons() {
        const { propertiesGrid, loadingState, errorState, emptyState, paginationContainer } = this.elements;

        loadingState?.classList.add('hidden');
        errorState?.classList.add('hidden');
        emptyState?.classList.add('hidden');
        if (paginationContainer) paginationContainer.innerHTML = '';

        if (propertiesGrid) {
            propertiesGrid.classList.remove('hidden');
            propertiesGrid.innerHTML = '';
            propertiesGrid.appendChild(renderSkeletonGrid(PROPERTIES_PER_PAGE));
        }
    }

    /**
     * Show specific UX state
     */
    showState(state, customMessage = null) {
        const { loadingState, errorState, emptyState, propertiesGrid } = this.elements;

        loadingState?.classList.add('hidden');
        errorState?.classList.add('hidden');
        emptyState?.classList.add('hidden');
        propertiesGrid?.classList.add('hidden');

        switch (state) {
            case 'loading':
                loadingState?.classList.remove('hidden');
                break;
            case 'error':
                errorState?.classList.remove('hidden');
                if (customMessage) {
                    const el = errorState?.querySelector('.error-message');
                    if (el) el.textContent = customMessage;
                }
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
     * Handle structured API errors
     */
    handleError(error) {
        console.error('Failed to load properties:', error);
        if (this.elements.paginationContainer) {
            this.elements.paginationContainer.innerHTML = '';
        }

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

    hasActiveFilters() {
        const f = this.filters;
        return !!(f.location || f.property_type || f.min_price || f.max_price ||
            f.bedrooms || f.keyword || f.bathrooms || (f.sort && f.sort !== 'newest'));
    }

    /**
     * Load and display properties with current filters + pagination
     */
    async loadProperties() {
        // Cancel any in-flight request
        if (this._abortController) {
            this._abortController.abort();
        }
        this._abortController = new AbortController();

        // Show skeleton grid while fetching
        this.showSkeletons();

        try {
            const skip = (this.page - 1) * PROPERTIES_PER_PAGE;

            // Build API filter object
            const apiFilters = {};
            const f = this.filters;
            if (f.location) apiFilters.location = f.location;
            if (f.property_type) apiFilters.property_type = f.property_type;
            if (f.min_price) apiFilters.min_price = f.min_price;
            if (f.max_price) apiFilters.max_price = f.max_price;
            if (f.bedrooms) apiFilters.bedrooms = f.bedrooms;
            if (f.keyword) apiFilters.keyword = f.keyword;
            if (f.sort) apiFilters.sort = f.sort;
            if (f.bathrooms) apiFilters.bathrooms = f.bathrooms;
            apiFilters.skip = skip;
            apiFilters.limit = PROPERTIES_PER_PAGE;

            const response = await getProperties(apiFilters);

            // Handle new paginated response shape {items, total, skip, limit}
            const properties = response?.items ?? response;
            const total = response?.total ?? properties.length;

            this.totalCount = total;
            this.totalPages = Math.max(1, Math.ceil(total / PROPERTIES_PER_PAGE));

            if (!properties || properties.length === 0) {
                this.elements.propertiesGrid && (this.elements.propertiesGrid.innerHTML = '');
                if (this.hasActiveFilters()) {
                    this.showState('empty', 'No properties match your current filters. Try adjusting your search criteria.');
                } else {
                    this.showState('empty', 'There are currently no properties listed. Please check back later.');
                }
                if (this.elements.paginationContainer) {
                    this.elements.paginationContainer.innerHTML = '';
                }
                return;
            }

            // Render property cards
            this.showState('success');
            if (this.elements.propertiesGrid) {
                this.elements.propertiesGrid.innerHTML = '';
                const fragment = document.createDocumentFragment();
                properties.forEach(property => {
                    const card = renderPropertyCard(property);
                    fragment.appendChild(card);
                });
                this.elements.propertiesGrid.appendChild(fragment);
            }

            // Render pagination bar
            if (this.elements.paginationContainer) {
                this.elements.paginationContainer.innerHTML = '';
                const paginationBar = renderPaginationBar({
                    currentPage: this.page,
                    totalPages: this.totalPages,
                    onPageChange: (p) => this.handlePageChange(p),
                });
                if (paginationBar) {
                    this.elements.paginationContainer.appendChild(paginationBar);
                }
            }

        } catch (error) {
            if (error.name === 'AbortError') return; // Cancelled — ignore
            this.handleError(error);
        }
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function () {
    new PropertiesPage();
});
