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
    
    // Add query parameters for filters
    if (filters.location) url.searchParams.append('location', filters.location);
    if (filters.property_type) url.searchParams.append('property_type', filters.property_type);
    if (filters.min_price) url.searchParams.append('min_price', filters.min_price);
    if (filters.max_price) url.searchParams.append('max_price', filters.max_price);
    if (filters.bedrooms) url.searchParams.append('bedrooms', filters.bedrooms);
    
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
        
        // Handle empty response
        if (!data || !Array.isArray(data)) {
            console.warn('API returned non-array data:', data);
            return [];
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
 * Fetch a single property by ID
 * @param {number} id - Property ID
 * @returns {Promise<Object>} Property object
 * @throws {Error} Structured error with type property
 */
async function getPropertyById(id) {
    const url = `${API_BASE_URL}/properties/${id}/`;
    
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

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getProperties, getPropertyById };
}
