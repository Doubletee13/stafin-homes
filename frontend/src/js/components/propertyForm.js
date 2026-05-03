/**
 * Property Form Component
 * Reusable form for adding and editing properties
 */

/**
 * Render property form
 * @param {Object} property - Property data for edit mode (null for add mode)
 * @param {Function} onSubmit - Callback when form is submitted (propertyData) => Promise<void>
 * @param {Function} onCancel - Callback when cancel button is clicked
 * @returns {HTMLElement} Form DOM element
 */
function renderPropertyForm(property, onSubmit, onCancel) {
    const isEditMode = !!property;
    let isSubmitting = false;

    const formContainer = document.createElement('div');
    formContainer.className = 'bg-white rounded-lg shadow-lg p-6';

    const form = document.createElement('form');
    form.className = 'space-y-6';
    form.noValidate = true;

    form.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-gray-900">
                ${isEditMode ? 'Edit Property' : 'Add New Property'}
            </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="col-span-2">
                <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value="${property?.title || ''}"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="e.g., Luxury Apartment in Lekki"
                />
                <p class="field-error text-red-500 text-sm mt-1 hidden" data-field="title"></p>
            </div>

            <div class="col-span-2">
                <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                </label>
                <textarea
                    id="description"
                    name="description"
                    required
                    rows="4"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                    placeholder="Describe the property..."
                >${property?.description || ''}</textarea>
                <p class="field-error text-red-500 text-sm mt-1 hidden" data-field="description"></p>
            </div>

            <div>
                <label for="price" class="block text-sm font-medium text-gray-700 mb-2">
                    Price (NGN) *
                </label>
                <input
                    type="number"
                    id="price"
                    name="price"
                    required
                    min="0"
                    step="0.01"
                    value="${property?.price || ''}"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="e.g., 50000000"
                />
                <p class="field-error text-red-500 text-sm mt-1 hidden" data-field="price"></p>
            </div>

            <div>
                <label for="location" class="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                </label>
                <input
                    type="text"
                    id="location"
                    name="location"
                    required
                    value="${property?.location || ''}"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="e.g., Lekki, Lagos"
                />
                <p class="field-error text-red-500 text-sm mt-1 hidden" data-field="location"></p>
            </div>

            <div>
                <label for="property_type" class="block text-sm font-medium text-gray-700 mb-2">
                    Property Type *
                </label>
                <select
                    id="property_type"
                    name="property_type"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                >
                    <option value="">Select type</option>
                    <option value="sale" ${property?.property_type === 'sale' ? 'selected' : ''}>For Sale</option>
                    <option value="rent" ${property?.property_type === 'rent' ? 'selected' : ''}>For Rent</option>
                    <option value="shortlet" ${property?.property_type === 'shortlet' ? 'selected' : ''}>Short Let</option>
                </select>
                <p class="field-error text-red-500 text-sm mt-1 hidden" data-field="property_type"></p>
            </div>

            <div>
                <label for="bedrooms" class="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms *
                </label>
                <input
                    type="number"
                    id="bedrooms"
                    name="bedrooms"
                    required
                    min="0"
                    value="${property?.bedrooms || ''}"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="e.g., 3"
                />
                <p class="field-error text-red-500 text-sm mt-1 hidden" data-field="bedrooms"></p>
            </div>

            <div>
                <label for="bathrooms" class="block text-sm font-medium text-gray-700 mb-2">
                    Bathrooms *
                </label>
                <input
                    type="number"
                    id="bathrooms"
                    name="bathrooms"
                    required
                    min="0"
                    value="${property?.bathrooms || ''}"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="e.g., 2"
                />
                <p class="field-error text-red-500 text-sm mt-1 hidden" data-field="bathrooms"></p>
            </div>

            <div class="col-span-2">
                <label for="image_urls" class="block text-sm font-medium text-gray-700 mb-2">
                    Image URLs (one per line)
                </label>
                <textarea
                    id="image_urls"
                    name="image_urls"
                    rows="3"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                    placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                >${property?.image_urls?.join('\n') || ''}</textarea>
                <p class="field-error text-red-500 text-sm mt-1 hidden" data-field="image_urls"></p>
            </div>
        </div>

        <div id="form-error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg hidden">
        </div>

        <div class="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
                type="button"
                id="cancel-btn"
                class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
                Cancel
            </button>
            <button
                type="submit"
                id="submit-btn"
                class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
            >
                ${isEditMode ? 'Update Property' : 'Add Property'}
            </button>
        </div>
    `;

    // Add event listeners
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Prevent duplicate submissions
        if (isSubmitting) {
            return;
        }

        const formData = getFormData(form);
        
        if (validateForm(formData, form)) {
            const submitBtn = form.querySelector('#submit-btn');
            const originalText = submitBtn.textContent;
            
            // Set submitting state
            isSubmitting = true;
            submitBtn.disabled = true;
            submitBtn.textContent = isEditMode ? 'Updating...' : 'Adding...';
            submitBtn.classList.add('opacity-75', 'cursor-not-allowed');

            try {
                await onSubmit(formData);
            } catch (error) {
                // Let the caller handle the error
                throw error;
            } finally {
                // Reset submitting state
                isSubmitting = false;
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
            }
        }
    });

    form.querySelector('#cancel-btn').addEventListener('click', onCancel);

    // Clear field errors on input
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            const fieldName = input.name;
            const errorElement = form.querySelector(`[data-field="${fieldName}"]`);
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.classList.add('hidden');
            }
        });
    });

    formContainer.appendChild(form);
    return formContainer;
}

/**
 * Get form data as object
 * @param {HTMLFormElement} form - Form element
 * @returns {Object} Form data object
 */
function getFormData(form) {
    const formData = new FormData(form);
    const data = {
        title: formData.get('title'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        location: formData.get('location'),
        property_type: formData.get('property_type'),
        bedrooms: parseInt(formData.get('bedrooms'), 10),
        bathrooms: parseInt(formData.get('bathrooms'), 10),
        image_urls: formData.get('image_urls')
            ? formData.get('image_urls').split('\n').map(url => url.trim()).filter(url => url)
            : []
    };

    return data;
}

/**
 * Validate form data
 * @param {Object} data - Form data object
 * @param {HTMLFormElement} form - Form element for error display
 * @returns {boolean} True if valid
 */
function validateForm(data, form) {
    let isValid = true;

    const validations = [
        { field: 'title', condition: data.title && data.title.trim(), message: 'Title is required' },
        { field: 'description', condition: data.description && data.description.trim(), message: 'Description is required' },
        { field: 'price', condition: !isNaN(data.price) && data.price >= 0, message: 'Valid price is required' },
        { field: 'location', condition: data.location && data.location.trim(), message: 'Location is required' },
        { field: 'property_type', condition: data.property_type, message: 'Property type is required' },
        { field: 'bedrooms', condition: !isNaN(data.bedrooms) && data.bedrooms >= 0, message: 'Valid bedrooms count is required' },
        { field: 'bathrooms', condition: !isNaN(data.bathrooms) && data.bathrooms >= 0, message: 'Valid bathrooms count is required' },
    ];

    validations.forEach(validation => {
        if (!validation.condition) {
            showFieldError(form, validation.field, validation.message);
            isValid = false;
        }
    });

    return isValid;
}

/**
 * Show field error
 * @param {HTMLFormElement} form - Form element
 * @param {string} field - Field name
 * @param {string} message - Error message
 */
function showFieldError(form, field, message) {
    const errorElement = form.querySelector(`[data-field="${field}"]`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
}

/**
 * Show form error
 * @param {HTMLFormElement} form - Form element
 * @param {string} message - Error message
 */
function showFormError(form, message) {
    const errorElement = form.querySelector('#form-error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
}

/**
 * Clear all form errors
 * @param {HTMLFormElement} form - Form element
 */
function clearFormErrors(form) {
    const errorElements = form.querySelectorAll('.field-error, #form-error');
    errorElements.forEach(el => {
        el.textContent = '';
        el.classList.add('hidden');
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { renderPropertyForm, getFormData, validateForm, showFieldError, showFormError, clearFormErrors };
}

// Make functions available globally for browser
if (typeof window !== 'undefined') {
    window.renderPropertyForm = renderPropertyForm;
    window.getFormData = getFormData;
    window.validateForm = validateForm;
    window.showFieldError = showFieldError;
    window.showFormError = showFormError;
    window.clearFormErrors = clearFormErrors;
}
