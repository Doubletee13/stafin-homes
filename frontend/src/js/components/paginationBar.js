/**
 * Pagination Bar Component (Issue #35)
 * Renders numbered page controls with Prev / Next buttons.
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
    container.className = 'pagination';

    // Generate inner HTML string
    const pages = getPageNumbers(currentPage, totalPages);

    container.innerHTML = `
        <button class="pag-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">← Prev</button>
        ${pages.map(p => p === '...'
        ? `<span class="pag-ellipsis">...</span>`
        : `<button class="pag-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`
    ).join('')}
        <button class="pag-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">Next →</button>
    `;

    // Attach event listeners
    container.querySelectorAll('button[data-page]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (btn.disabled) return;
            const p = parseInt(btn.dataset.page, 10);
            if (!isNaN(p)) {
                onPageChange(p);
            }
        });
    });

    return container;
}

function getPageNumbers(current, total) {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, 4, '...', total];
    if (current >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total];
    return [1, '...', current - 1, current, current + 1, '...', total];
}

// Export for CommonJS environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { renderPaginationBar };
}
