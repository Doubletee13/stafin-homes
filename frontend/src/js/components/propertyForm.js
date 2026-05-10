/**
 * Property Form Component
 * Reusable form for adding and editing properties
 * Supports unified media[] (images + videos)
 */

/**
 * Validate a single URL string
 * @param {string} url
 * @returns {boolean}
 */
function isValidUrl(url) {
    try {
        const parsed = new URL(url.trim());
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

/**
 * Build media preview HTML for admin form
 * @param {Array} media - Array of {type, url} objects
 * @returns {string} HTML string
 */
function buildMediaPreviewHtml(media) {
    if (!media || media.length === 0) {
        return `<p class="text-gray-400 text-sm text-center py-4">No media added yet.</p>`;
    }

    return media.map((item, i) => {
        const isValid = isValidUrl(item.url);
        const borderClass = isValid ? 'border-green-200' : 'border-red-300 bg-red-50';
        const badgeClass = item.type === 'video'
            ? 'bg-purple-100 text-purple-700'
            : 'bg-blue-100 text-blue-700';

        if (!isValid) {
            return `
                <div class="flex items-center gap-2 p-2 border rounded-lg ${borderClass}">
                    <span class="text-red-500 text-xs">⚠ Invalid URL</span>
                    <span class="text-gray-500 text-xs truncate flex-1">${item.url}</span>
                </div>
            `;
        }

        if (item.type === 'image') {
            return `
                <div class="relative border rounded-lg overflow-hidden ${borderClass}">
                    <span class="absolute top-1 left-1 text-xs px-2 py-0.5 rounded-full font-medium ${badgeClass}">Image</span>
                    <img src="${item.url}"
                         alt="Preview ${i + 1}"
                         class="w-full h-28 object-cover"
                         onerror="this.parentElement.classList.add('border-red-300'); this.src=''; this.alt='Load error'; this.className='hidden';" />
                </div>
            `;
        } else {
            return `
                <div class="relative border rounded-lg overflow-hidden ${borderClass}">
                    <span class="absolute top-1 left-1 z-10 text-xs px-2 py-0.5 rounded-full font-medium ${badgeClass}">Video</span>
                    <video src="${item.url}"
                           class="w-full h-28 object-cover bg-black"
                           muted preload="metadata">
                    </video>
                </div>
            `;
        }
    }).join('');
}

/**
 * Update media preview panel from form inputs
 * @param {HTMLFormElement} form
 */
function updateMediaPreview(form) {
    const imageInput = form.querySelector('#media_images');
    const videoInput = form.querySelector('#media_videos');
    const previewContainer = form.querySelector('#media-preview-grid');
    if (!previewContainer) return;

    const imageUrls = (imageInput?.value || '')
        .split('\n').map(u => u.trim()).filter(Boolean)
        .map(url => ({ type: 'image', url }));

    const videoUrls = (videoInput?.value || '')
        .split('\n').map(u => u.trim()).filter(Boolean)
        .map(url => ({ type: 'video', url }));

    const all = [...imageUrls, ...videoUrls];
    previewContainer.innerHTML = buildMediaPreviewHtml(all);
}

/**
 * Build initial textarea values from media array
 * @param {Array} media
 * @param {'image'|'video'} type
 * @returns {string}
 */
function buildTextareaValue(media, type) {
    if (!Array.isArray(media)) return '';
    return media.filter(m => m.type === type).map(m => m.url).join('\n');
}

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

    const existingMedia = property?.media || [];
    const existingImgText = buildTextareaValue(existingMedia, 'image');
    const existingVidText = buildTextareaValue(existingMedia, 'video');

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
                    value="${property?.bedrooms ?? ''}"
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
                    value="${property?.bathrooms ?? ''}"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="e.g., 2"
                />
                <p class="field-error text-red-500 text-sm mt-1 hidden" data-field="bathrooms"></p>
            </div>

            <!-- Media Section: Images -->
            <div class="col-span-2">
                <label for="media_images" class="block text-sm font-medium text-gray-700 mb-2">
                    🖼 Image URLs <span class="text-gray-400 font-normal">(one per line)</span>
                </label>
                <textarea
                    id="media_images"
                    name="media_images"
                    rows="3"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none font-mono text-sm"
                    placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                >${existingImgText}</textarea>
                <p class="field-error text-red-500 text-sm mt-1 hidden" data-field="media_images"></p>
            </div>

            <!-- Media Section: Videos -->
            <div class="col-span-2">
                <label for="media_videos" class="block text-sm font-medium text-gray-700 mb-2">
                    🎥 Video URLs <span class="text-gray-400 font-normal">(one per line)</span>
                </label>
                <textarea
                    id="media_videos"
                    name="media_videos"
                    rows="3"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none font-mono text-sm"
                    placeholder="https://example.com/tour.mp4&#10;https://example.com/walkthrough.mp4"
                >${existingVidText}</textarea>
                <p class="field-error text-red-500 text-sm mt-1 hidden" data-field="media_videos"></p>
            </div>

            <!-- Live Media Preview -->
            <div class="col-span-2">
                <p class="text-sm font-medium text-gray-700 mb-2">📷 Media Preview</p>
                <div id="media-preview-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 min-h-[80px] p-3 border border-dashed border-gray-200 rounded-lg bg-gray-50">
                    <p class="text-gray-400 text-sm text-center py-4 col-span-full">No media added yet.</p>
                </div>
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

        if (isSubmitting) return;

        const formData = getFormData(form);

        if (validateForm(formData, form)) {
            const submitBtn = form.querySelector('#submit-btn');
            const originalText = submitBtn.textContent;

            isSubmitting = true;
            submitBtn.disabled = true;
            submitBtn.textContent = isEditMode ? 'Updating...' : 'Adding...';
            submitBtn.classList.add('opacity-75', 'cursor-not-allowed');

            try {
                await onSubmit(formData);
            } catch (error) {
                throw error;
            } finally {
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

    // Live preview: update on media textarea input
    const mediaImages = form.querySelector('#media_images');
    const mediaVideos = form.querySelector('#media_videos');
    const onMediaInput = () => updateMediaPreview(form);
    mediaImages?.addEventListener('input', onMediaInput);
    mediaVideos?.addEventListener('input', onMediaInput);

    // Initial preview render
    setTimeout(() => updateMediaPreview(form), 0);

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

    // Parse images and videos textareas into unified media array
    const imageUrls = (formData.get('media_images') || '')
        .split('\n').map(url => url.trim()).filter(url => url);
    const videoUrls = (formData.get('media_videos') || '')
        .split('\n').map(url => url.trim()).filter(url => url);

    const media = [
        ...imageUrls.map(url => ({ type: 'image', url })),
        ...videoUrls.map(url => ({ type: 'video', url }))
    ];

    return {
        title: formData.get('title'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        location: formData.get('location'),
        property_type: formData.get('property_type'),
        bedrooms: parseInt(formData.get('bedrooms'), 10),
        bathrooms: parseInt(formData.get('bathrooms'), 10),
        media
    };
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

    // Validate media URLs if any were entered
    const invalidImages = (data.media || []).filter(m => !isValidUrl(m.url));
    if (invalidImages.length > 0) {
        showFieldError(form, 'media_images', `${invalidImages.length} invalid URL(s) detected — please fix highlighted entries in the preview.`);
        isValid = false;
    }

    return isValid;
}

/**
 * Show field error
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
