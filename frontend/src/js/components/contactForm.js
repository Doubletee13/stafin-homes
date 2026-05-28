/**
 * Inquiry Form Component
 * Handles user contact submissions for a specific property
 */

/**
 * Create and return the inquiry form element
 * @param {number} propertyId - ID of the property being inquired about
 * @returns {HTMLElement} The form element
 */
function createInquiryForm(propertyId) {
    const container = document.createElement('div');
    container.className = 'bg-white border border-gray-200 rounded-lg shadow-sm p-6 mt-8';

    container.innerHTML = `
        <h3 class="text-xl font-bold text-gray-900 mb-4 text-center md:text-left">Inquire About This Property</h3>
        <p class="text-sm text-gray-600 mb-6 text-center md:text-left">Fill out the form below and an agent will contact you shortly.</p>
        
        <form id="inquiry-form" class="space-y-4">
            <input type="hidden" name="property_id" value="${propertyId}">
            
            <div>
                <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" id="name" name="name" required 
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="John Doe">
            </div>
            
            <div>
                <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" id="phone" name="phone" required 
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="+234 800 000 0000">
            </div>
            
            <div>
                <label for="message" class="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea id="message" name="message" rows="4" required 
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    placeholder="I am interested in this property. Please provide more details..."></textarea>
            </div>
            
            <div id="form-message" class="hidden text-sm p-3 rounded-md"></div>
            
            <button type="submit" id="submit-btn" 
                class="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex justify-center items-center">
                <span>Send Inquiry</span>
                <div id="loading-spinner" class="hidden ml-3 animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            </button>
        </form>
    `;

    const form = container.querySelector('#inquiry-form');
    const submitBtn = container.querySelector('#submit-btn');
    const spinner = container.querySelector('#loading-spinner');
    const formMessage = container.querySelector('#form-message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Reset state
        formMessage.className = 'hidden text-sm p-3 rounded-md';
        formMessage.textContent = '';

        // Basic validation
        const formData = new FormData(form);
        const data = {
            name: formData.get('name').trim(),
            phone: formData.get('phone').trim(),
            message: formData.get('message').trim(),
            property_id: parseInt(formData.get('property_id'))
        };

        if (data.name.length < 1) return showMessage('Please enter your name', 'error');
        if (data.phone.length < 5) return showMessage('Please enter a valid phone number', 'error');
        if (data.message.length < 1) return showMessage('Please enter a message', 'error');

        // Submit
        try {
            setLoading(true);

            if (typeof submitInquiry !== 'function') {
                throw new Error('Inquiry service unavailable');
            }

            await submitInquiry(data);

            showMessage('Thank you! Your inquiry has been sent.', 'success');
            form.reset();

        } catch (error) {
            showMessage(error.message || 'Failed to send inquiry. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        submitBtn.disabled = isLoading;
        submitBtn.querySelector('span').textContent = isLoading ? 'Sending...' : 'Send Inquiry';
        spinner.classList.toggle('hidden', !isLoading);
        submitBtn.classList.toggle('opacity-75', isLoading);
        submitBtn.classList.toggle('cursor-not-allowed', isLoading);
    }

    function showMessage(text, type) {
        formMessage.textContent = text;
        formMessage.className = `block text-sm p-3 rounded-md mb-4 ${type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`;
    }

    return container;
}

// Global exposure
if (typeof window !== 'undefined') {
    window.createInquiryForm = createInquiryForm;
}
