/**
 * Contact API Client
 * Handles submission and retrieval of property inquiries
 */

const CONTACT_API_BASE = window.API_BASE_URL || 'http://localhost:8000';

/**
 * Submit a new property inquiry
 * @param {Object} contactData - Inquiry data
 * @param {string} contactData.name - User name
 * @param {string} contactData.phone - User phone
 * @param {string} contactData.message - Inquiry message
 * @param {number} contactData.property_id - ID of the property
 * @returns {Promise<Object>} Created inquiry
 */
async function submitInquiry(contactData) {
    const url = `${CONTACT_API_BASE}/contacts/`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contactData),
        });

        if (!response.ok) {
            let errorMsg = 'Failed to submit inquiry';
            try {
                const errorData = await response.json();
                errorMsg = errorData.detail || errorMsg;
            } catch (e) { }
            throw new Error(errorMsg);
        }

        return await response.json();
    } catch (error) {
        console.error('Contact API error:', error);
        throw error;
    }
}

/**
 * Fetch all contact inquiries (Admin only)
 * @param {Object} params - Query parameters
 * @param {number} params.skip - Offset
 * @param {number} params.limit - Limit
 * @returns {Promise<Array>} List of inquiries
 */
async function getInquiries(params = { skip: 0, limit: 100 }) {
    const token = localStorage.getItem('stafin_admin_token');
    if (!token) {
        const error = new Error('Not authenticated');
        error.type = 'AUTH_ERROR';
        throw error;
    }

    const url = new URL(`${CONTACT_API_BASE}/contacts/`);
    url.searchParams.append('skip', params.skip);
    url.searchParams.append('limit', params.limit);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.status === 401) {
            const error = new Error('Session expired. Please log in again.');
            error.type = 'AUTH_ERROR';
            throw error;
        }

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Inquiries API error:', error);
        throw error;
    }
}

// Global exposure
if (typeof window !== 'undefined') {
    window.submitInquiry = submitInquiry;
    window.getInquiries = getInquiries;
}
