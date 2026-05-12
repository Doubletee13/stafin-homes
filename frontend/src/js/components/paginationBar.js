/**
 * Pagination Bar Component (Issue #13)
 * Renders numbered page controls with Prev / Next buttons.
 * Mobile-friendly, keyboard accessible.
 *
 * @param {Object} config
 * @param {number} config.currentPage - 1-indexed current page
 * @param {number} config.totalPages  - Total number of pages
 * @param {Function} config.onPageChange - Called with new page number (1-indexed)
 * @returns {HTMLElement|null} Pagination bar element, or null if only 1 page
 */
function renderPaginationBar({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    const container = document.createElement('div');
    container.className = 'flex items-center justify-center gap-2 mt-8 flex-wrap';
    container.setAttribute('role', 'navigation');
    container.setAttribute('aria-label', 'Pagination');

    const makeBtn = (label, page, isActive = false, isDisabled = false) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = label;
        btn.setAttribute('aria-label', `Page ${label}`);

        if (isActive) {
            btn.className = 'px-4 py-2 rounded-md text-sm font-semibold bg-blue-600 text-white cursor-default';
            btn.setAttribute('aria-current', 'page');
        } else if (isDisabled) {
            btn.className = 'px-4 py-2 rounded-md text-sm font-medium text-gray-400 bg-gray-100 cursor-not-allowed';
            btn.disabled = true;
        } else {
            btn.className = 'px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-blue-50 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500';
            btn.addEventListener('click', () => onPageChange(page));
        }

        return btn;
    };

    // Prev button
    container.appendChild(makeBtn('← Prev', currentPage - 1, false, currentPage === 1));

    // Page number buttons — show max 7 pages with ellipsis logic
    const pageNumbers = buildPageRange(currentPage, totalPages);

    pageNumbers.forEach(p => {
        if (p === '...') {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '…';
            ellipsis.className = 'px-2 py-2 text-sm text-gray-500';
            container.appendChild(ellipsis);
        } else {
            container.appendChild(makeBtn(p, p, p === currentPage));
        }
    });

    // Next button
    container.appendChild(makeBtn('Next →', currentPage + 1, false, currentPage === totalPages));

    return container;
}

/**
 * Build a compact page range array with ellipsis:
 * e.g. [1, '...', 4, 5, 6, '...', 12]
 */
function buildPageRange(current, total) {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages = [];
    const delta = 2; // pages around current

    const left = Math.max(2, current - delta);
    const right = Math.min(total - 1, current + delta);

    pages.push(1);
    if (left > 2) pages.push('...');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < total - 1) pages.push('...');
    pages.push(total);

    return pages;
}

// Export for CommonJS environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { renderPaginationBar };
}
