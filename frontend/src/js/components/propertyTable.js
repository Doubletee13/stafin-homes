/**
 * Property Table Component
 * Renders properties in a table format with action buttons
 */

/**
 * Format price to currency string
 * @param {number} price - Property price
 * @returns {string} Formatted price string
 */
function formatPrice(price) {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
}

/**
 * Get property type display label
 * @param {string} type - Property type (sale, rent, shortlet)
 * @returns {string} Display label
 */
function getPropertyTypeLabel(type) {
    const labels = {
        'sale': 'For Sale',
        'rent': 'For Rent',
        'shortlet': 'Short Let'
    };
    return labels[type] || type;
}

/**
 * Get property type badge color class
 * @param {string} type - Property type
 * @returns {string} Tailwind CSS color classes
 */
function getPropertyTypeColor(type) {
    const colors = {
        'sale': 'bg-green-100 text-green-800',
        'rent': 'bg-blue-100 text-blue-800',
        'shortlet': 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
}

/**
 * Render property table
 * @param {Array} properties - Array of property objects
 * @param {Function} onEdit - Callback when edit button is clicked (property) => void
 * @param {Function} onDelete - Callback when delete button is clicked (propertyId) => void
 * @returns {HTMLElement} Table DOM element
 */
function renderPropertyTable(properties, onEdit, onDelete) {
    const tableContainer = document.createElement('div');
    tableContainer.className = 'overflow-x-auto';

    const table = document.createElement('table');
    table.className = 'min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden';

    const thead = document.createElement('thead');
    thead.className = 'bg-gray-50 border-b border-gray-200';

    thead.innerHTML = `
        <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bedrooms</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
    `;

    const tbody = document.createElement('tbody');
    tbody.className = 'divide-y divide-gray-200';

    if (!properties || properties.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                    No properties found. Add your first property to get started.
                </td>
            </tr>
        `;
    } else {
        properties.forEach(property => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-gray-50 transition-colors';

            const typeLabel = getPropertyTypeLabel(property.property_type);
            const typeColor = getPropertyTypeColor(property.property_type);
            const safePrice = property.price ?? 0;
            const formattedPrice = formatPrice(safePrice);

            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${property.title || 'N/A'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${formattedPrice}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${property.location || 'N/A'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${typeColor}">
                        ${typeLabel}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${property.bedrooms || 0}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                        <button class="edit-btn text-indigo-600 hover:text-indigo-900 transition-colors" data-property-id="${property.id}">
                            Edit
                        </button>
                        <button class="delete-btn text-red-600 hover:text-red-900 transition-colors" data-property-id="${property.id}">
                            Delete
                        </button>
                    </div>
                </td>
            `;

            // Add event listeners for buttons
            const editBtn = tr.querySelector('.edit-btn');
            const deleteBtn = tr.querySelector('.delete-btn');

            editBtn.addEventListener('click', () => onEdit(property));
            deleteBtn.addEventListener('click', () => onDelete(property.id));

            tbody.appendChild(tr);
        });
    }

    table.appendChild(thead);
    table.appendChild(tbody);
    tableContainer.appendChild(table);

    return tableContainer;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { renderPropertyTable };
}

// Make functions available globally for browser
if (typeof window !== 'undefined') {
    window.renderPropertyTable = renderPropertyTable;
}
