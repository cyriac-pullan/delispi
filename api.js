
// Frontend API helper functions
class API {
    constructor() {
        this.baseURL = window.location.origin + '/api';
        this.token = localStorage.getItem('authToken');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth methods
    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (data.token) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            this.token = data.token;
        }
        
        return data;
    }

    async register(userData) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        if (data.token) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            this.token = data.token;
        }
        
        return data;
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        this.token = null;
        window.location.href = '/';
    }

    // Product methods
    async getProducts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/products?${queryString}`);
    }

    async getProduct(id) {
        return this.request(`/products/${id}`);
    }

    // Category methods
    async getCategories() {
        return this.request('/categories');
    }

    // Order methods
    async createOrder(orderData) {
        return this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    async getOrders() {
        return this.request('/orders');
    }

    // Contact method
    async submitContactForm(formData) {
        return this.request('/contact', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
    }

    // Utility methods
    isAuthenticated() {
        return !!this.token;
    }

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
}

// Initialize API instance
const api = new API();

// Export for use in other files
window.api = api;
