/**
 * Properties Page Logic
 * Orchestrates fetching properties from API and rendering them
 * Handles loading, error, and empty states
 */

document.addEventListener('DOMContentLoaded', async function() {
    await loadProperties();
});

/**
 * Load and display properties
 */
async function loadProperties() {
    const propertiesGrid = document.getElementById('properties-grid');
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const emptyState = document.getElementById('empty-state');

    // Show loading state
    if (loadingState) loadingState.classList.remove('hidden');
    if (errorState) errorState.classList.add('hidden');
    if (emptyState) emptyState.classList.add('hidden');
    if (propertiesGrid) propertiesGrid.classList.add('hidden');

    try {
        const properties = await getProperties();

        // Hide loading state
        if (loadingState) loadingState.classList.add('hidden');

        // Check if properties array is empty
        if (!properties || properties.length === 0) {
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        // Render properties
        if (propertiesGrid) {
            propertiesGrid.innerHTML = '';
            propertiesGrid.classList.remove('hidden');

            // Use DocumentFragment for batch DOM insertion (avoids multiple reflows)
            const fragment = document.createDocumentFragment();
            properties.forEach(property => {
                const card = renderPropertyCard(property);
                fragment.appendChild(card);
            });
            propertiesGrid.appendChild(fragment);
        }
    } catch (error) {
        console.error('Failed to load properties:', error);
        
        // Hide loading state
        if (loadingState) loadingState.classList.add('hidden');
        
        // Show error state with error message
        if (errorState) {
            errorState.classList.remove('hidden');
            const errorMessage = errorState.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.textContent = error.message || 'Failed to load properties. Please try again later.';
            }
        }
    }
}
