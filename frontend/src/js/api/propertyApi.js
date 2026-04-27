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
 * @throws {Error} If network request fails or property not found
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
                throw new Error('Property not found');
            }
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        
        if (!data) {
            throw new Error('Invalid response from server');
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

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getProperties, getPropertyById };
}
