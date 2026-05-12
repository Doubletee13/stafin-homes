/**
 * Skeleton Card Component (Issue #13)
 * Renders a shimmer placeholder while properties are loading.
 * Used in place of property cards during `showState('loading')`.
 *
 * @returns {HTMLElement} Skeleton card element
 */
function renderSkeletonCard() {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl shadow-md overflow-hidden animate-pulse';
    card.setAttribute('aria-hidden', 'true');

    card.innerHTML = `
        <!-- Image placeholder -->
        <div class="h-48 bg-gray-200"></div>

        <div class="p-5 space-y-3">
            <!-- Title placeholder -->
            <div class="h-5 bg-gray-200 rounded w-3/4"></div>

            <!-- Location placeholder -->
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>

            <!-- Price placeholder -->
            <div class="h-6 bg-gray-200 rounded w-1/3"></div>

            <!-- Badges row -->
            <div class="flex gap-2">
                <div class="h-6 bg-gray-200 rounded-full w-16"></div>
                <div class="h-6 bg-gray-200 rounded-full w-16"></div>
                <div class="h-6 bg-gray-200 rounded-full w-16"></div>
            </div>
        </div>
    `;

    return card;
}

/**
 * Render a grid of N skeleton cards
 * @param {number} count - Number of skeleton cards to render (default: 6)
 * @returns {DocumentFragment}
 */
function renderSkeletonGrid(count = 6) {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
        fragment.appendChild(renderSkeletonCard());
    }
    return fragment;
}

// Export for CommonJS environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { renderSkeletonCard, renderSkeletonGrid };
}
