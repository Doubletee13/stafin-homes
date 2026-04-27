/**
 * Property Details Page Logic (Controller Pattern)
 * Orchestrates fetching property details from API and rendering them
 * Handles all UX states with structured error handling and caching
 */

class PropertyDetailsPage {
    constructor() {
        this.cache = new Map();
        this.currentPropertyId = null;
        this.elements = {
            loadingState: document.getElementById('loading-state'),
            errorState: document.getElementById('error-state'),
            notFoundState: document.getElementById('not-found-state'),
            invalidIdState: document.getElementById('invalid-id-state'),
            propertyDetails: document.getElementById('property-details'),
            retryButton: null
        };
        
        this.init();
    }

    init() {
        this.setupRetryHandler();
        this.load();
    }

    /**
     * Setup retry button handler
     */
    setupRetryHandler() {
        this.elements.retryButton = this.elements.errorState?.querySelector('.retry-button');
        if (this.elements.retryButton) {
            this.elements.retryButton.addEventListener('click', () => {
                this.load();
            });
        }
    }

    /**
     * Extract property ID from URL query string
     * @returns {number|null} Property ID as number or null if invalid
     */
    getPropertyIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        
        if (!id || id.trim() === '') {
            return null;
        }
        
        const numericId = parseInt(id, 10);
        if (isNaN(numericId) || numericId <= 0) {
            return null;
        }
        
        return numericId;
    }

    /**
     * Show specific UX state with accessibility support
     * @param {string} state - State to show
     * @param {string} [errorMessage] - Optional error message
     */
    showState(state, errorMessage = null) {
        const { loadingState, errorState, notFoundState, invalidIdState, propertyDetails } = this.elements;

        // Hide all states first
        loadingState?.classList.add('hidden');
        errorState?.classList.add('hidden');
        notFoundState?.classList.add('hidden');
        invalidIdState?.classList.add('hidden');
        propertyDetails?.classList.add('hidden');

        // Show requested state
        switch (state) {
            case 'loading':
                loadingState?.classList.remove('hidden');
                break;
            case 'error':
                errorState?.classList.remove('hidden');
                if (errorMessage) {
                    const errorMessageElement = errorState?.querySelector('.error-message');
                    if (errorMessageElement) {
                        errorMessageElement.textContent = errorMessage;
                    }
                }
                // Move focus to error for accessibility
                errorState?.focus();
                break;
            case 'not-found':
                notFoundState?.classList.remove('hidden');
                break;
            case 'invalid-id':
                invalidIdState?.classList.remove('hidden');
                break;
            case 'success':
                propertyDetails?.classList.remove('hidden');
                break;
        }
    }

    /**
     * Handle structured errors
     * @param {Error} error - Error object with type property
     */
    handleError(error) {
        console.error('Failed to load property details:', error);

        switch (error.type) {
            case 'NOT_FOUND':
            case 404:
                this.showState('not-found');
                break;
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
                this.showState('error', error.message || 'Failed to load property details. Please try again.');
        }
    }

    /**
     * Load and display property details
     */
    async load() {
        this.showState('loading');

        const propertyId = this.getPropertyIdFromUrl();
        
        if (!propertyId) {
            this.showState('invalid-id');
            return;
        }

        this.currentPropertyId = propertyId;

        try {
            // Check cache first
            let property;
            if (this.cache.has(propertyId)) {
                property = this.cache.get(propertyId);
                console.log('Using cached property data');
            } else {
                property = await getPropertyById(propertyId);
                this.cache.set(propertyId, property);
            }

            this.showState('success');

            const propertyDetails = this.elements.propertyDetails;
            if (propertyDetails) {
                propertyDetails.innerHTML = '';
                const detailsElement = renderPropertyDetails(property);
                propertyDetails.appendChild(detailsElement);
            }
        } catch (error) {
            this.handleError(error);
        }
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    new PropertyDetailsPage();
});
