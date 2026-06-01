/**
 * Property Form Component
 * Reusable form for adding and editing properties
 * Supports unified media[] (images + videos) with Cloudinary Dropzone
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
 * @param {Array} media - Array of media objects
 * @returns {string} HTML string
 */
function buildMediaPreviewHtml(media) {
    if (!media || media.length === 0) {
        return `<p class="text-gray-400 text-sm text-center py-4 col-span-full">No media added yet.</p>`;
    }

    return media.map((item, i) => {
        if (item.uploading) {
            return `
                <div class="relative border rounded-lg overflow-hidden border-indigo-200 flex flex-col items-center justify-center bg-gray-50 h-28 shadow-sm">
                    <svg class="animate-spin h-6 w-6 text-indigo-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    <span class="text-xs text-indigo-600 font-medium tracking-wide">Uploading...</span>
                </div>
            `;
        }

        const isValid = isValidUrl(item.url);
        const borderClass = item.featured ? 'border-2 border-yellow-400' : (isValid ? 'border-gray-200 border' : 'border-red-300 bg-red-50 border');
        const badgeClass = item.type === 'video'
            ? 'bg-purple-100 text-purple-700'
            : 'bg-blue-100 text-blue-700';

        if (!isValid) {
            return `
                <div class="flex items-center gap-2 p-2 rounded-lg ${borderClass} h-28">
                    <span class="text-red-500 text-xs">⚠ Invalid URL</span>
                    <button class="delete-media-btn ml-auto bg-red-500 text-white rounded p-1" data-index="${i}" type="button">Del</button>
                </div>
            `;
        }

        const starColor = item.featured ? 'text-yellow-400 fill-current' : 'text-gray-300 fill-transparent hover:text-yellow-400 transition-colors';

        // Set draggable natively
        return `
            <div data-index="${i}" draggable="true" class="media-preview-item relative rounded-lg overflow-hidden ${borderClass} group h-28 bg-black cursor-move">
                <span class="absolute bottom-1 right-1 z-10 text-xs px-2 py-0.5 rounded-full font-medium ${badgeClass} shadow-sm backdrop-blur-md bg-opacity-90">
                    ${item.type === 'video' ? '📹 Video' : '🖼️ Image'}
                </span>
                
                <button data-index="${i}" class="feature-media-btn absolute top-1 left-1 z-10 p-1 shadow-sm focus:outline-none" type="button" title="Set as Featured">
                    <svg class="w-5 h-5 ${starColor}" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                    </svg>
                </button>

                <button data-index="${i}" class="delete-media-btn absolute top-1 right-1 z-10 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 shadow-sm hover:bg-red-600" type="button" title="Remove">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                ${item.type === 'image'
                ? `<img src="${item.url}" alt="Preview ${i + 1}" class="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity pointer-events-none" draggable="false" onerror="this.src=''; this.alt='Load error';">`
                : `<video src="${item.url}" class="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity pointer-events-none" muted preload="metadata"></video>`
            }
            </div>
        `;
    }).join('');
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
    let isUploading = false;

    // Isolate media state for the interactive upload grid
    let currentMedia = [...(property?.media || [])];

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

        <div class="space-y-5">
            <div>
                <label for="title" class="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input type="text" id="title" name="title" required value="${property?.title || ''}"
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                       placeholder="e.g., Luxury Apartment in Lekki" />
                <p class="field-error text-red-500 text-sm mt-1 hidden" data-field="title"></p>
            </div>

            <div>
                <label for="description" class="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea id="description" name="description" required rows="4"
                          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                          placeholder="Describe the property...">${property?.description || ''}</textarea>
                <p class="field-error text-red-500 text-sm mt-1 hidden" data-field="description"></p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label for="price" class="block text-sm font-medium text-gray-700 mb-2">Price (NGN) *</label>
                    <input type="number" id="price" name="price" required min="0" step="0.01" value="${property?.price || ''}"
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                           placeholder="e.g., 50000000" />
                    <p class="field-error text-red-500 text-sm mt-1 hidden" data-field="price"></p>
                </div>

                <div>
                    <label for="location" class="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                    <input type="text" id="location" name="location" required value="${property?.location || ''}"
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                           placeholder="e.g., Lekki, Lagos" />
                    <p class="field-error text-red-500 text-sm mt-1 hidden" data-field="location"></p>
                </div>

                <div>
                    <label for="property_type" class="block text-sm font-medium text-gray-700 mb-2">Property Type *</label>
                    <select id="property_type" name="property_type" required
                        class="custom-select w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition">
                        <option value="">Select type</option>
                        <option value="sale" ${property?.property_type === 'sale' ? 'selected' : ''}>For Sale</option>
                        <option value="rent" ${property?.property_type === 'rent' ? 'selected' : ''}>For Rent</option>
                        <option value="shortlet" ${property?.property_type === 'shortlet' ? 'selected' : ''}>Short Let</option>
                    </select>
                    <p class="field-error text-red-500 text-sm mt-1 hidden" data-field="property_type"></p>
                </div>

                <div>
                    <label for="bedrooms" class="block text-sm font-medium text-gray-700 mb-2">Bedrooms *</label>
                    <input type="number" id="bedrooms" name="bedrooms" required min="0" value="${property?.bedrooms ?? ''}"
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                           placeholder="e.g., 3" />
                    <p class="field-error text-red-500 text-sm mt-1 hidden" data-field="bedrooms"></p>
                </div>

                <div class="sm:col-span-2">
                    <label for="bathrooms" class="block text-sm font-medium text-gray-700 mb-2">Bathrooms *</label>
                    <input type="number" id="bathrooms" name="bathrooms" required min="0" value="${property?.bathrooms ?? ''}"
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                           placeholder="e.g., 2" />
                    <p class="field-error text-red-500 text-sm mt-1 hidden" data-field="bathrooms"></p>
                </div>
            </div>
            
            <!-- Media Upload Dropzone -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Upload Content (Images & Videos) *</label>
                <div id="drop-zone" class="w-full flex justify-center px-6 pt-5 pb-6 border-2 border-indigo-200 bg-indigo-50/30 border-dashed rounded-lg cursor-pointer hover:bg-indigo-50 transition">
                    <div class="space-y-1 text-center">
                        <svg class="mx-auto h-12 w-12 text-indigo-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <div class="flex flex-col sm:flex-row text-sm text-gray-600 justify-center items-center gap-1">
                            <label for="file-upload" class="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                                <span>Upload files</span>
                                <input id="file-upload" name="file-upload" type="file" multiple class="sr-only" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm">
                            </label>
                            <p>or drag and drop them here</p>
                        </div>
                        <p class="text-xs text-gray-500">PNG, JPG, WEBP, MP4, WEBM up to 50MB</p>
                    </div>
                </div>
            </div>

            <!-- Live Media Preview -->
            <div>
                <p class="text-sm font-medium text-gray-700 mb-2 flex justify-between items-end">
                    <span>📷 Media View</span>
                    <span id="media-count" class="text-xs text-gray-400">0 items</span>
                </p>
                <div id="media-preview-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 min-h-[80px] p-3 border border-dashed border-gray-200 rounded-lg bg-gray-50">
                    <p class="text-gray-400 text-sm text-center py-4 col-span-full">No media added yet.</p>
                </div>
                <p class="field-error text-red-500 text-sm mt-1 hidden" id="media-error"></p>
            </div>
        </div>

        <div id="form-error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg hidden">
        </div>

        <div class="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button type="button" id="cancel-btn"
                class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">
                Cancel
            </button>
            <button type="submit" id="submit-btn"
                class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">
                ${isEditMode ? 'Update Property' : 'Add Property'}
            </button>
        </div>
    `;

    // Dropzone logic
    const dropZone = form.querySelector('#drop-zone');
    const fileInput = form.querySelector('#file-upload');
    const previewContainer = form.querySelector('#media-preview-grid');
    const submitBtn = form.querySelector('#submit-btn');

    const updateSubmitBtnState = () => {
        if (isUploading || isSubmitting) {
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
            submitBtn.textContent = isUploading ? 'Uploading...' : (isEditMode ? 'Updating...' : 'Adding...');
        } else {
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
            submitBtn.textContent = isEditMode ? 'Update Property' : 'Add Property';
        }
    };

    const renderPreview = () => {
        previewContainer.innerHTML = buildMediaPreviewHtml(currentMedia);
        form.querySelector('#media-count').textContent = `${currentMedia.length} item(s)`;

        // Ensure form knows to unhide errors resolving to valid
        if (currentMedia.length > 0 && currentMedia.every(m => !m.uploading && m.url)) {
            const errorElement = form.querySelector('#media-error');
            errorElement.classList.add('hidden');
        }

        // Attach delete listeners
        const delBtns = previewContainer.querySelectorAll('.delete-media-btn');
        delBtns.forEach(btn => {
            btn.onclick = async () => {
                const index = parseInt(btn.getAttribute('data-index'), 10);
                const item = currentMedia[index];

                // Check if they deleted the featured so we can assign a new native one next render
                const wasFeatured = item.featured;

                // Optimistically remove from UI
                currentMedia.splice(index, 1);

                // If it was featured, make the new first item featured safely if available
                if (wasFeatured && currentMedia.length > 0) {
                    currentMedia[0].featured = true;
                }

                renderPreview();

                // Permanently delete in background
                if (item && item.public_id) {
                    try {
                        const token = localStorage.getItem('stafin_admin_token');
                        await fetch(`${window.API_BASE_URL || 'http://localhost:8000'}/media/delete?public_id=${item.public_id}&resource_type=${item.type}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                    } catch (e) {
                        console.warn("Failed deleting cleanly over Cloudinary.", e)
                    }
                }
            };
        });

        // Attach feature star listeners
        const featBtns = previewContainer.querySelectorAll('.feature-media-btn');
        featBtns.forEach(btn => {
            btn.onclick = () => {
                const index = parseInt(btn.getAttribute('data-index'), 10);
                if (currentMedia[index].uploading) return; // Prevent setting placeholder as featured

                // Unset all and set current
                currentMedia.forEach((m, i) => { m.featured = (i === index); });
                renderPreview();
            };
        });

        // Attach Drag-and-Drop Reordering listeners
        let dragStartIndex = null;
        const dragItems = previewContainer.querySelectorAll('.media-preview-item');

        dragItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                dragStartIndex = parseInt(e.currentTarget.getAttribute('data-index'), 10);
                e.dataTransfer.effectAllowed = 'move';
                e.currentTarget.classList.add('opacity-50'); // visual cue
            });

            item.addEventListener('dragend', (e) => {
                e.currentTarget.classList.remove('opacity-50');
                dragItems.forEach(i => i.classList.remove('border-t-4', 'border-indigo-500'));
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault(); // Necessary to allow dropping
                e.dataTransfer.dropEffect = 'move';
                e.currentTarget.classList.add('border-t-4', 'border-indigo-500'); // hover indicator
            });

            item.addEventListener('dragleave', (e) => {
                e.currentTarget.classList.remove('border-t-4', 'border-indigo-500');
            });

            item.addEventListener('drop', (e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-t-4', 'border-indigo-500');
                const dropIndex = parseInt(e.currentTarget.getAttribute('data-index'), 10);

                if (dragStartIndex !== null && dragStartIndex !== dropIndex) {
                    // Extract item and splice it back to reorder array safely
                    const draggedItem = currentMedia.splice(dragStartIndex, 1)[0];
                    currentMedia.splice(dropIndex, 0, draggedItem);
                    renderPreview();
                }
            });
        });
    }

    const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
    const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

    const handleFiles = async (files) => {
        if (!files || files.length === 0) return;

        isUploading = true;
        updateSubmitBtnState();

        // Convert to array
        const filesArray = Array.from(files);

        for (let i = 0; i < filesArray.length; i++) {
            const file = filesArray[i];

            // --- Client-side validation: reject disallowed types immediately ---
            if (!ALLOWED_TYPES.includes(file.type)) {
                const formError = form.querySelector('#form-error');
                formError.textContent = `"${file.name}" is not supported. Allowed types: JPG, PNG, WEBP, MP4, WEBM.`;
                formError.classList.remove('hidden');
                setTimeout(() => formError.classList.add('hidden'), 5000);
                continue; // Skip this file
            }

            // --- Duplicate prevention ---
            const isDuplicate = currentMedia.some(m => m.filename === file.name && m.size === file.size);
            if (isDuplicate) {
                const formError = form.querySelector('#form-error');
                formError.textContent = `"${file.name}" has already been uploaded.`;
                formError.classList.remove('hidden');
                setTimeout(() => formError.classList.add('hidden'), 5000);
                continue; // Skip this duplicate
            }

            const mediaType = ALLOWED_VIDEO_TYPES.includes(file.type) ? 'video' : 'image';
            const tempId = Date.now() + i.toString();

            // Add placeholder instantly showing it as uploading (track filename/size for deduping)
            // Auto-feature the first item pushed
            const isFirst = currentMedia.length === 0;
            currentMedia.push({
                type: mediaType,
                url: '',
                uploading: true,
                tempId,
                filename: file.name,
                size: file.size,
                featured: isFirst
            });
            renderPreview();


            try {
                const fd = new FormData();
                fd.append('file', file);
                const token = localStorage.getItem('stafin_admin_token');

                const res = await fetch(`${window.API_BASE_URL || 'http://localhost:8000'}/media/upload`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: fd
                });

                if (!res.ok) {
                    const errorJson = await res.json().catch(() => ({}));
                    throw new Error(errorJson.detail || 'Upload failed');
                }

                const data = await res.json();

                // Find and merge into the temporary item to preserve local client state (filename, size, featured)
                const idx = currentMedia.findIndex(m => m.tempId === tempId);
                if (idx > -1) {
                    currentMedia[idx] = {
                        ...currentMedia[idx],
                        url: data.url,
                        public_id: data.public_id,
                        uploading: false
                    };
                }
            } catch (err) {
                // Wipe the invalid temp upload if error happens
                const idx = currentMedia.findIndex(m => m.tempId === tempId);
                if (idx > -1) {
                    currentMedia.splice(idx, 1);
                }

                // Show localized error natively without dropping component entirely
                const formError = form.querySelector('#form-error');
                formError.textContent = `Upload failed for ${file.name}: ${err.message}`;
                formError.classList.remove('hidden');
                setTimeout(() => formError.classList.add('hidden'), 5000);
            }
            renderPreview();
        }

        // Clear file input so the same files can be selected again
        fileInput.value = '';
        isUploading = false;
        updateSubmitBtnState();
    };

    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-indigo-500', 'bg-indigo-100');
    });

    ['dragleave', 'dragend'].forEach(type => {
        dropZone.addEventListener(type, () => dropZone.classList.remove('border-indigo-500', 'bg-indigo-100'));
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-indigo-500', 'bg-indigo-100');
        handleFiles(e.dataTransfer.files);
    });

    // Handle form bounds directly pointing to currentMedia cleanly
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (isSubmitting || isUploading) return;

        // Custom validation check enforcing at least one properly uploaded unit.
        if (currentMedia.length === 0 || currentMedia.some(m => !m.url)) {
            const errorElement = form.querySelector('#media-error');
            errorElement.textContent = "Please upload at least one valid media item before submitting.";
            errorElement.classList.remove('hidden');
            return;
        }

        const formData = getFormData(form, currentMedia);

        if (validateForm(formData, form)) {
            isSubmitting = true;
            updateSubmitBtnState();

            try {
                await onSubmit(formData);
            } catch (error) {
                isSubmitting = false;
                updateSubmitBtnState();
                throw error;
            }
        }
    });

    form.querySelector('#cancel-btn').addEventListener('click', onCancel);

    // Clear field errors on input
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            const errorElement = form.querySelector(`[data-field="${input.name}"]`);
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.classList.add('hidden');
            }
        });
    });

    // Initial preview render trigger
    setTimeout(() => renderPreview(), 0);

    formContainer.appendChild(form);
    return formContainer;
}

/**
 * Get form data as object
 * @param {HTMLFormElement} form - Form element
 * @param {Array} mediaArray - Current uploaded media instances tracking
 * @returns {Object} Form data object  
 */
function getFormData(form, mediaArray) {
    const formData = new FormData(form);

    return {
        title: formData.get('title'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        location: formData.get('location'),
        property_type: formData.get('property_type'),
        bedrooms: parseInt(formData.get('bedrooms'), 10),
        bathrooms: parseInt(formData.get('bathrooms'), 10),
        // Expose only unified payload standards ensuring back-compat preservation
        media: mediaArray.map(m => ({ type: m.type, url: m.url, featured: !!m.featured }))
    };
}

/**
 * Validate form data cleanly natively avoiding heavy 3rd-party libs
 * @param {Object} data 
 * @param {HTMLFormElement} form 
 * @returns {boolean}
 */
function validateForm(data, form) {
    let isValid = true;

    // Reset all error messages dynamically ensuring visual cleanup
    form.querySelectorAll('.field-error').forEach(el => el.classList.add('hidden'));

    const showError = (field, message) => {
        const errorElement = form.querySelector(`[data-field="${field}"]`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
        isValid = false;
    };

    if (!data.title || data.title.trim() === '') showError('title', 'Title is required');
    if (!data.description || data.description.trim() === '') showError('description', 'Description is required');
    if (isNaN(data.price) || data.price <= 0) showError('price', 'Please enter a valid positive price');
    if (!data.location || data.location.trim() === '') showError('location', 'Location is required');
    if (!data.property_type) showError('property_type', 'Property type is required');
    if (isNaN(data.bedrooms) || data.bedrooms < 0) showError('bedrooms', 'Please enter a valid number of bedrooms');
    if (isNaN(data.bathrooms) || data.bathrooms < 0) showError('bathrooms', 'Please enter a valid number of bathrooms');

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
