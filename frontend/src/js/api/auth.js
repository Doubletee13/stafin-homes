/**
 * Authentication Token Management
 * Handles JWT token storage and retrieval for authenticated requests
 */

const TOKEN_KEY = 'stafin_admin_token';

/**
 * Get the stored JWT token
 * @returns {string|null} The access token or null if not found
 */
function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * Store the JWT token
 * @param {string} token - The access token to store
 */
function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove the stored JWT token (logout)
 */
function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if token exists
 */
function isAuthenticated() {
    const token = getToken();
    if (!token) return false;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        return payload.exp > now;
    } catch (e) {
        return false;
    }
}

/**
 * Redirect to login page
 */
function redirectToLogin() {
    window.location.href = '/admin/login.html';
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getToken, setToken, removeToken, isAuthenticated, redirectToLogin };
}

// Make functions available globally for browser
if (typeof window !== 'undefined') {
    window.getToken = getToken;
    window.setToken = setToken;
    window.removeToken = removeToken;
    window.isAuthenticated = isAuthenticated;
    window.redirectToLogin = redirectToLogin;
}
