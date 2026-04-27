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
 * Fetch all properties from the API
 * @returns {Promise<Array>} Array of property objects
 * @throws {Error} If network request fails or response is invalid
 */
async function getProperties() {
    const url = `${API_BASE_URL}/properties/`;
    
    try {
        const response = await fetchWithTimeout(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        
        // Handle empty response
        if (!data || !Array.isArray(data)) {
            console.warn('API returned non-array data:', data);
            return [];
        }

        return data;
    } catch (error) {
        if (error instanceof SyntaxError) {
            console.error('Invalid JSON response from API:', error);
            throw new Error('Invalid response from server');
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error('Network error:', error);
            throw new Error('Unable to connect to server. Please check your network connection.');
        } else {
            console.error('API error:', error);
            throw error;
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
