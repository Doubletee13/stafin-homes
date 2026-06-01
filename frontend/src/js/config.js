// API Configuration
// Automatically selects the correct backend URL based on environment
(function() {
    const hostname = window.location.hostname;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Local development
        window.API_BASE_URL = 'http://localhost:8000';
    } else {
        // Production (Vercel)
        window.API_BASE_URL = 'https://stafin-homes.onrender.com';
    }

    console.log('[Config] API_BASE_URL:', window.API_BASE_URL);
})();
