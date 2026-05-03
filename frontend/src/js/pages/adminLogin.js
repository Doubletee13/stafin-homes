/**
 * Admin Login Page Logic (Controller Pattern)
 * Handles authentication and redirects to dashboard
 */

class AdminLoginPage {
    constructor() {
        this.elements = {
            form: document.getElementById('login-form'),
            emailInput: document.getElementById('email'),
            passwordInput: document.getElementById('password'),
            submitBtn: document.getElementById('submit-btn'),
            formError: document.getElementById('form-error'),
            emailError: document.getElementById('email-error'),
            passwordError: document.getElementById('password-error'),
            loadingState: document.getElementById('loading-state'),
        };

        this.init();
    }

    init() {
        // Check if already authenticated
        if (isAuthenticated()) {
            window.location.href = '/admin-dashboard.html';
            return;
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.elements.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.elements.emailInput.addEventListener('input', () => this.clearFieldError('email'));
        this.elements.passwordInput.addEventListener('input', () => this.clearFieldError('password'));
    }

    async handleSubmit(e) {
        e.preventDefault();

        // Clear previous errors
        this.clearErrors();

        // Validate inputs
        const email = this.elements.emailInput.value.trim();
        const password = this.elements.passwordInput.value;

        if (!this.validateInputs(email, password)) {
            return;
        }

        // Show loading state
        this.setLoading(true);

        try {
            const response = await this.login(email, password);
            setToken(response.access_token);
            window.location.href = '/admin-dashboard.html';
        } catch (error) {
            this.handleError(error);
        } finally {
            this.setLoading(false);
        }
    }

    validateInputs(email, password) {
        let isValid = true;

        if (!email) {
            this.showFieldError('email', 'Email is required');
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            this.showFieldError('email', 'Please enter a valid email');
            isValid = false;
        }

        if (!password) {
            this.showFieldError('password', 'Password is required');
            isValid = false;
        }

        return isValid;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    async login(email, password) {
        const apiUrl = window.API_BASE_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Login failed');
        }

        return data;
    }

    handleError(error) {
        console.error('Login error:', error);

        if (error.message.includes('fetch') || error.message.includes('network')) {
            this.showFormError('Unable to connect to server. Please check your connection.');
        } else {
            this.showFormError(error.message || 'Invalid email or password');
        }
    }

    showFieldError(field, message) {
        const errorElement = this.elements[`${field}Error`];
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
    }

    clearFieldError(field) {
        const errorElement = this.elements[`${field}Error`];
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.add('hidden');
        }
    }

    showFormError(message) {
        if (this.elements.formError) {
            this.elements.formError.textContent = message;
            this.elements.formError.classList.remove('hidden');
        }
    }

    clearErrors() {
        this.clearFieldError('email');
        this.clearFieldError('password');
        if (this.elements.formError) {
            this.elements.formError.textContent = '';
            this.elements.formError.classList.add('hidden');
        }
    }

    setLoading(isLoading) {
        if (isLoading) {
            this.elements.form.classList.add('hidden');
            this.elements.loadingState.classList.remove('hidden');
        } else {
            this.elements.form.classList.remove('hidden');
            this.elements.loadingState.classList.add('hidden');
        }
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    new AdminLoginPage();
});
