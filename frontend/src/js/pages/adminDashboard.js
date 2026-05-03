/**
 * Admin Dashboard Page Logic (Controller Pattern)
 * Orchestrates property management, authentication, and UI state
 */

class AdminDashboard {
    constructor() {
        this.properties = [];
        this.currentProperty = null;
        this.isEditMode = false;

        this.elements = {
            loadingState: document.getElementById('loading-state'),
            errorState: document.getElementById('error-state'),
            errorMessage: document.getElementById('error-message'),
            retryButton: document.getElementById('retry-btn'),
            emptyState: document.getElementById('empty-state'),
            emptyAddButton: document.getElementById('empty-add-btn'),
            propertyList: document.getElementById('property-list'),
            tableContainer: document.getElementById('table-container'),
            addPropertyButton: document.getElementById('add-property-btn'),
            logoutButton: document.getElementById('logout-btn'),
            formModal: document.getElementById('form-modal'),
            formContainer: document.getElementById('form-container'),
        };

        this.init();
    }

    init() {
        // Check authentication
        if (!isAuthenticated()) {
            redirectToLogin();
            return;
        }

        this.setupEventListeners();
        this.loadProperties();
    }

    setupEventListeners() {
        this.elements.addPropertyButton.addEventListener('click', () => this.openForm());
        this.elements.emptyAddButton.addEventListener('click', () => this.openForm());
        this.elements.retryButton.addEventListener('click', () => this.loadProperties());
        this.elements.logoutButton.addEventListener('click', () => this.handleLogout());

        // Close modal on background click
        this.elements.formModal.addEventListener('click', (e) => {
            if (e.target === this.elements.formModal) {
                this.closeForm();
            }
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.elements.formModal.classList.contains('hidden')) {
                this.closeForm();
            }
        });
    }

    async loadProperties() {
        this.setState('loading');

        try {
            this.properties = await getProperties();
            this.renderProperties();
            this.setState('success');
        } catch (error) {
            console.error('Error loading properties:', error);
            this.handleLoadError(error);
        }
    }

    handleLoadError(error) {
        let message = 'Failed to load properties';

        if (error.type === 'NETWORK_ERROR') {
            message = 'Unable to connect to server. Please check your connection.';
        } else if (error.type === 'TIMEOUT') {
            message = 'Request timed out. Please try again.';
        } else if (error.type === 'AUTH_ERROR') {
            message = 'Session expired. Please login again.';
            redirectToLogin();
            return;
        }

        this.elements.errorMessage.textContent = message;
        this.setState('error');
        showErrorToast(message);
    }

    renderProperties() {
        this.elements.tableContainer.innerHTML = '';

        if (!this.properties || this.properties.length === 0) {
            this.setState('empty');
            return;
        }

        const table = renderPropertyTable(
            this.properties,
            (property) => this.handleEdit(property),
            (propertyId) => this.handleDelete(propertyId)
        );

        this.elements.tableContainer.appendChild(table);
    }

    openForm(property = null) {
        this.currentProperty = property;
        this.isEditMode = !!property;

        this.elements.formContainer.innerHTML = '';
        const form = renderPropertyForm(
            property,
            (data) => this.handleFormSubmit(data),
            () => this.closeForm()
        );

        this.elements.formContainer.appendChild(form);
        this.elements.formModal.classList.remove('hidden');
        this.elements.formModal.classList.add('flex');
    }

    closeForm() {
        this.elements.formModal.classList.add('hidden');
        this.elements.formModal.classList.remove('flex');
        this.elements.formContainer.innerHTML = '';
        this.currentProperty = null;
        this.isEditMode = false;
    }

    async handleFormSubmit(data) {
        const form = this.elements.formContainer.querySelector('form');

        try {
            if (this.isEditMode) {
                const updated = await updateProperty(this.currentProperty.id, data);
                // Update local property
                const index = this.properties.findIndex(p => p.id === this.currentProperty.id);
                if (index !== -1) {
                    this.properties[index] = updated;
                }
                showSuccessToast('Property updated successfully');
            } else {
                const created = await createProperty(data);
                this.properties.unshift(created);
                showSuccessToast('Property created successfully');
            }

            this.renderProperties();
            this.closeForm();
        } catch (error) {
            console.error('Error saving property:', error);
            this.handleFormError(form, error);
            throw error; // Re-throw to let form component reset state
        }
    }

    handleFormError(form, error) {
        let message = 'Failed to save property';

        if (error.type === 'NETWORK_ERROR') {
            message = 'Unable to connect to server. Please check your connection.';
        } else if (error.type === 'TIMEOUT') {
            message = 'Request timed out. Please try again.';
        } else if (error.type === 'AUTH_ERROR') {
            message = 'Session expired. Please login again.';
            redirectToLogin();
            return;
        } else if (error.type === 'API_ERROR') {
            message = error.message || 'Server error occurred';
        }

        showFormError(form, message);
    }

    handleEdit(property) {
        this.openForm(property);
    }

    async handleDelete(propertyId) {
        const confirmed = confirm('Are you sure you want to delete this property? This action cannot be undone.');
        
        if (!confirmed) {
            return;
        }

        try {
            await deleteProperty(propertyId);
            
            // Remove from local state
            this.properties = this.properties.filter(p => p.id !== propertyId);
            this.renderProperties();
            
            showSuccessToast('Property deleted successfully');
        } catch (error) {
            console.error('Error deleting property:', error);
            
            let message = 'Failed to delete property';
            if (error.type === 'NETWORK_ERROR') {
                message = 'Unable to connect to server. Please check your connection.';
            } else if (error.type === 'TIMEOUT') {
                message = 'Request timed out. Please try again.';
            } else if (error.type === 'AUTH_ERROR') {
                message = 'Session expired. Please login again.';
                redirectToLogin();
                return;
            }

            showErrorToast(message);
        }
    }

    handleLogout() {
        removeToken();
        redirectToLogin();
    }

    setState(state) {
        // Hide all states
        this.elements.loadingState.classList.add('hidden');
        this.elements.errorState.classList.add('hidden');
        this.elements.emptyState.classList.add('hidden');
        this.elements.propertyList.classList.add('hidden');

        // Show requested state
        switch (state) {
            case 'loading':
                this.elements.loadingState.classList.remove('hidden');
                break;
            case 'error':
                this.elements.errorState.classList.remove('hidden');
                break;
            case 'empty':
                this.elements.emptyState.classList.remove('hidden');
                break;
            case 'success':
                this.elements.propertyList.classList.remove('hidden');
                break;
        }
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard();
});
