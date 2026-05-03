/**
 * Toast Notification Component
 * Lightweight toast notification system for success/error feedback
 */

/**
 * Show a toast notification
 * @param {string} message - Notification message
 * @param {string} type - 'success' or 'error'
 * @param {number} duration - Duration in milliseconds (default: 4000)
 */
function showToast(message, type = 'success', duration = 4000) {
    // Remove existing toasts
    removeExistingToasts();

    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 max-w-sm transform transition-all duration-300 translate-x-full opacity-0`;
    
    const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
    const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
    const icon = type === 'success' 
        ? '<svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>'
        : '<svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>';

    toast.innerHTML = `
        <div class="${bgColor} border rounded-lg shadow-lg p-4 flex items-start space-x-3">
            <div class="flex-shrink-0">
                ${icon}
            </div>
            <div class="flex-1">
                <p class="${textColor} text-sm font-medium">${message}</p>
            </div>
            <button class="flex-shrink-0 ${textColor} hover:opacity-75 transition" onclick="this.closest('.fixed').remove()">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
            </button>
        </div>
    `;

    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.classList.remove('translate-x-full', 'opacity-0');
    });

    // Auto-dismiss
    setTimeout(() => {
        dismissToast(toast);
    }, duration);

    return toast;
}

/**
 * Dismiss a toast notification
 * @param {HTMLElement} toast - Toast element to dismiss
 */
function dismissToast(toast) {
    toast.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 300);
}

/**
 * Remove all existing toasts
 */
function removeExistingToasts() {
    const existingToasts = document.querySelectorAll('.fixed.top-4.right-4.z-50');
    existingToasts.forEach(toast => toast.remove());
}

/**
 * Show success toast
 * @param {string} message - Success message
 */
function showSuccessToast(message) {
    showToast(message, 'success');
}

/**
 * Show error toast
 * @param {string} message - Error message
 */
function showErrorToast(message) {
    showToast(message, 'error');
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { showToast, showSuccessToast, showErrorToast, dismissToast };
}

// Make functions available globally for browser
if (typeof window !== 'undefined') {
    window.showToast = showToast;
    window.showSuccessToast = showSuccessToast;
    window.showErrorToast = showErrorToast;
    window.dismissToast = dismissToast;
}
