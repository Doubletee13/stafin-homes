/**
 * Inquiry Table Component
 * Renders a list of leads/inquiries for the admin dashboard
 */

/**
 * Render the inquiry table
 * @param {Array} inquiries - List of inquiry objects
 * @returns {HTMLElement} Table element
 */
function renderInquiryTable(inquiries) {
    if (!inquiries || inquiries.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'text-center py-12 text-gray-500 bg-white rounded-lg shadow';
        emptyMsg.innerHTML = '<p>No inquiries found.</p>';
        return emptyMsg;
    }

    const container = document.createElement('div');
    container.className = 'overflow-x-auto bg-white shadow rounded-lg';

    const table = document.createElement('table');
    table.className = 'min-w-full divide-y divide-gray-200';

    table.innerHTML = `
        <thead class="bg-gray-50">
            <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
            </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
            ${inquiries.map(inquiry => {
        const date = new Date(inquiry.created_at).toLocaleDateString('en-NG', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });

        const propTitle = inquiry.property?.title || `ID: ${inquiry.property_id}`;
        const propLocation = inquiry.property?.location || '';

        return `
                    <tr class="hover:bg-gray-50 transition-colors">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${date}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-gray-900">${inquiry.name}</div>
                            <div class="text-sm text-gray-500">${inquiry.phone}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-900 font-medium">${propTitle}</div>
                            <div class="text-xs text-gray-500">${propLocation}</div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="text-sm text-gray-700 max-w-md overflow-hidden text-ellipsis whitespace-pre-wrap">${inquiry.message}</div>
                        </td>
                    </tr>
                `;
    }).join('')}
        </tbody>
    `;

    container.appendChild(table);
    return container;
}

// Global exposure
if (typeof window !== 'undefined') {
    window.renderInquiryTable = renderInquiryTable;
}
