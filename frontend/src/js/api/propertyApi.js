/**
 * Property API Client
 * Handles all property-related API calls with proper error handling
 * Works in both local and Docker environments
 */

// Centralized API base URL configuration
// For Docker: backend service name, for local: localhost
// Can be overridden by setting window.API_BASE_URL before loading this script
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:8000';

// Request timeout in milliseconds
const REQUEST_TIMEOUT = 10000; // 10 seconds

/**
 * Fetch with timeout using AbortController
 * @param {string} url - The URL to fetch
 * @param {object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 * @throws {Error} If request times out or fails
 */
async function fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please check your connection and try again.');
        }
        throw error;
    }
}

/**
 * Inspect a response and throw an AUTH_ERROR for 401 Unauthorized responses.
 * This prevents the raw backend JWT error message from reaching the user.
 * @param {Response} response
 */
function throwIfAuthError(response) {
    if (response.status === 401) {
        const error = new Error('Your session has expired. Please log in again.');
        error.type = 'AUTH_ERROR';
        error.statusCode = 401;
        throw error;
    }
}

/**
 * Fetch all properties from the API with optional filters
 * @param {Object} filters - Filter parameters
 * @param {string} filters.location - Location filter
 * @param {string} filters.property_type - Property type filter (sale, rent, shortlet)
 * @param {number} filters.min_price - Minimum price filter
 * @param {number} filters.max_price - Maximum price filter
 * @param {number} filters.bedrooms - Bedrooms filter
 * @returns {Promise<Array>} Array of property objects
 * @throws {Error} Structured error with type property
 */
async function getProperties(filters = {}) {
    const url = new URL(`${API_BASE_URL}/properties/`);

    // Existing filters (preserved)
    if (filters.location) url.searchParams.append('location', filters.location);
    if (filters.property_type) url.searchParams.append('property_type', filters.property_type);
    if (filters.min_price) url.searchParams.append('min_price', filters.min_price);
    if (filters.max_price) url.searchParams.append('max_price', filters.max_price);
    if (filters.bedrooms) url.searchParams.append('bedrooms', filters.bedrooms);
    // New filters (Issue #13)
    if (filters.keyword) url.searchParams.append('keyword', filters.keyword);
    if (filters.bathrooms) url.searchParams.append('bathrooms', filters.bathrooms);
    if (filters.sort) url.searchParams.append('sort', filters.sort);
    if (filters.skip !== undefined) url.searchParams.append('skip', filters.skip);
    if (filters.limit !== undefined) url.searchParams.append('limit', filters.limit);

    try {
        const response = await fetchWithTimeout(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = new Error(`API request failed with status ${response.status}`);
            error.type = 'API_ERROR';
            error.statusCode = response.status;
            throw error;
        }

        const data = await response.json();

        // Support paginated response shape { items, total, skip, limit }
        // as well as legacy bare array format for backward compatibility
        if (data && typeof data === 'object' && Array.isArray(data.items)) {
            return data; // Paginated response
        }

        if (Array.isArray(data)) {
            // Legacy bare array — wrap into paginated shape for consistency
            return { items: data, total: data.length, skip: 0, limit: data.length };
        }

        console.warn('API returned unexpected data shape:', data);
        return { items: [], total: 0, skip: 0, limit: 20 };

    } catch (error) {
        if (error.type) {
            throw error;
        }

        if (error instanceof SyntaxError) {
            console.error('Invalid JSON response from API:', error);
            const structuredError = new Error('Invalid response from server');
            structuredError.type = 'INVALID_RESPONSE';
            throw structuredError;
        } else if (error.name === 'AbortError') {
            const structuredError = new Error('Request timed out');
            structuredError.type = 'TIMEOUT';
            throw structuredError;
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error('Network error:', error);
            const structuredError = new Error('Unable to connect to server');
            structuredError.type = 'NETWORK_ERROR';
            throw structuredError;
        } else {
            console.error('API error:', error);
            const structuredError = new Error(error.message || 'An unexpected error occurred');
            structuredError.type = 'UNKNOWN';
            throw structuredError;
        }
    }
}

/**
 * Fetch a single property by ID
 * @param {number} id - Property ID
 * @returns {Promise<Object>} Property object
 * @throws {Error} Structured error with type property
 */
async function getPropertyById(id) {
    const url = `${API_BASE_URL}/properties/${id}`;

    try {
        const response = await fetchWithTimeout(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                const error = new Error('Property not found');
                error.type = 'NOT_FOUND';
                error.statusCode = 404;
                throw error;
            }
            const error = new Error(`API request failed with status ${response.status}`);
            error.type = 'API_ERROR';
            error.statusCode = response.status;
            throw error;
        }

        const data = await response.json();

        if (!data) {
            const error = new Error('Invalid response from server');
            error.type = 'INVALID_RESPONSE';
            throw error;
        }

        return data;
    } catch (error) {
        if (error.type) {
            // Already a structured error, re-throw
            throw error;
        }

        if (error instanceof SyntaxError) {
            console.error('Invalid JSON response from API:', error);
            const structuredError = new Error('Invalid response from server');
            structuredError.type = 'INVALID_RESPONSE';
            throw structuredError;
        } else if (error.name === 'AbortError') {
            const structuredError = new Error('Request timed out');
            structuredError.type = 'TIMEOUT';
            throw structuredError;
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error('Network error:', error);
            const structuredError = new Error('Unable to connect to server');
            structuredError.type = 'NETWORK_ERROR';
            throw structuredError;
        } else {
            console.error('API error:', error);
            const structuredError = new Error(error.message || 'An unexpected error occurred');
            structuredError.type = 'UNKNOWN';
            throw structuredError;
        }
    }
}

/**
 * Create a new property (requires authentication)
 * @param {Object} propertyData - Property data to create
 * @param {string} propertyData.title - Property title
 * @param {string} propertyData.description - Property description
 * @param {number} propertyData.price - Property price
 * @param {string} propertyData.location - Property location
 * @param {string} propertyData.property_type - Property type (sale, rent, shortlet)
 * @param {number} propertyData.bedrooms - Number of bedrooms
 * @param {number} propertyData.bathrooms - Number of bathrooms
 * @param {Array<string>} propertyData.image_urls - Array of image URLs
 * @returns {Promise<Object>} Created property object
 * @throws {Error} Structured error with type property
 */
async function createProperty(propertyData) {
    const token = localStorage.getItem('stafin_admin_token');

    if (!token) {
        const error = new Error('Not authenticated');
        error.type = 'AUTH_ERROR';
        throw error;
    }

    const url = `${API_BASE_URL}/properties/`;

    try {
        const response = await fetchWithTimeout(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(propertyData),
        });

        throwIfAuthError(response);

        if (!response.ok) {
            let errorMsg = `API request failed with status ${response.status}`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.detail || errorData.message || errorMsg;
            } catch (e) {
                // Ignore parse errors
            }
            const error = new Error(errorMsg);
            error.type = 'API_ERROR';
            error.statusCode = response.status;
            throw error;
        }

        const data = await response.json();

        if (!data) {
            const error = new Error('Invalid response from server');
            error.type = 'INVALID_RESPONSE';
            throw error;
        }

        return data;
    } catch (error) {
        if (error.type) {
            throw error;
        }

        if (error instanceof SyntaxError) {
            console.error('Invalid JSON response from API:', error);
            const structuredError = new Error('Invalid response from server');
            structuredError.type = 'INVALID_RESPONSE';
            throw structuredError;
        } else if (error.name === 'AbortError') {
            const structuredError = new Error('Request timed out');
            structuredError.type = 'TIMEOUT';
            throw structuredError;
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error('Network error:', error);
            const structuredError = new Error('Unable to connect to server');
            structuredError.type = 'NETWORK_ERROR';
            throw structuredError;
        } else {
            console.error('API error:', error);
            const structuredError = new Error(error.message || 'An unexpected error occurred');
            structuredError.type = 'UNKNOWN';
            throw structuredError;
        }
    }
}

/**
 * Update an existing property (requires authentication)
 * @param {number} id - Property ID
 * @param {Object} propertyData - Property data to update
 * @returns {Promise<Object>} Updated property object
 * @throws {Error} Structured error with type property
 */
async function updateProperty(id, propertyData) {
    const token = localStorage.getItem('stafin_admin_token');

    if (!token) {
        const error = new Error('Not authenticated');
        error.type = 'AUTH_ERROR';
        throw error;
    }

    const url = `${API_BASE_URL}/properties/${id}`;

    try {
        const response = await fetchWithTimeout(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(propertyData),
        });

        throwIfAuthError(response);

        if (!response.ok) {
            let errorMsg = `API request failed with status ${response.status}`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.detail || errorData.message || errorMsg;
            } catch (e) {
                // Ignore parse errors
            }
            const error = new Error(errorMsg);
            error.type = 'API_ERROR';
            error.statusCode = response.status;
            throw error;
        }

        const data = await response.json();

        if (!data) {
            const error = new Error('Invalid response from server');
            error.type = 'INVALID_RESPONSE';
            throw error;
        }

        return data;
    } catch (error) {
        if (error.type) {
            throw error;
        }

        if (error instanceof SyntaxError) {
            console.error('Invalid JSON response from API:', error);
            const structuredError = new Error('Invalid response from server');
            structuredError.type = 'INVALID_RESPONSE';
            throw structuredError;
        } else if (error.name === 'AbortError') {
            const structuredError = new Error('Request timed out');
            structuredError.type = 'TIMEOUT';
            throw structuredError;
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error('Network error:', error);
            const structuredError = new Error('Unable to connect to server');
            structuredError.type = 'NETWORK_ERROR';
            throw structuredError;
        } else {
            console.error('API error:', error);
            const structuredError = new Error(error.message || 'An unexpected error occurred');
            structuredError.type = 'UNKNOWN';
            throw structuredError;
        }
    }
}

/**
 * Delete a property (requires authentication)
 * @param {number} id - Property ID
 * @returns {Promise<void>}
 * @throws {Error} Structured error with type property
 */
async function deleteProperty(id) {
    const token = localStorage.getItem('stafin_admin_token');

    if (!token) {
        const error = new Error('Not authenticated');
        error.type = 'AUTH_ERROR';
        throw error;
    }

    const url = `${API_BASE_URL}/properties/${id}`;

    try {
        const response = await fetchWithTimeout(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        throwIfAuthError(response);

        if (!response.ok) {
            let errorMsg = `API request failed with status ${response.status}`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.detail || errorData.message || errorMsg;
            } catch (e) {
                // Ignore parse errors
            }
            const error = new Error(errorMsg);
            error.type = 'API_ERROR';
            error.statusCode = response.status;
            throw error;
        }
    } catch (error) {
        if (error.type) {
            throw error;
        }

        if (error.name === 'AbortError') {
            const structuredError = new Error('Request timed out');
            structuredError.type = 'TIMEOUT';
            throw structuredError;
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error('Network error:', error);
            const structuredError = new Error('Unable to connect to server');
            structuredError.type = 'NETWORK_ERROR';
            throw structuredError;
        } else {
            console.error('API error:', error);
            const structuredError = new Error(error.message || 'An unexpected error occurred');
            structuredError.type = 'UNKNOWN';
            throw structuredError;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getProperties, getPropertyById, createProperty, updateProperty, deleteProperty };
}

// Make functions available globally for browser
if (typeof window !== 'undefined') {
    window.getProperties = getProperties;
    window.getPropertyById = getPropertyById;
    window.createProperty = createProperty;
    window.updateProperty = updateProperty;
    window.deleteProperty = deleteProperty;
}
