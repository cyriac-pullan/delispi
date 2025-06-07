
// Authentication Modal Functionality
class AuthModal {
    constructor() {
        this.createModal();
        this.bindEvents();
    }

    createModal() {
        const modalHTML = `
            <div id="authModal" class="auth-modal" style="display: none;">
                <div class="auth-modal-content">
                    <div class="auth-modal-header">
                        <h2 id="authModalTitle">Login</h2>
                        <span class="auth-modal-close">&times;</span>
                    </div>
                    <div class="auth-modal-body">
                        <!-- Login Form -->
                        <form id="loginForm" class="auth-form">
                            <div class="form-group">
                                <label for="loginEmail">Email</label>
                                <input type="email" id="loginEmail" required>
                            </div>
                            <div class="form-group">
                                <label for="loginPassword">Password</label>
                                <input type="password" id="loginPassword" required>
                            </div>
                            <button type="submit" class="auth-btn">Login</button>
                            <p class="auth-switch">
                                Don't have an account? 
                                <a href="#" id="showRegister">Register here</a>
                            </p>
                        </form>

                        <!-- Register Form -->
                        <form id="registerForm" class="auth-form" style="display: none;">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="registerFirstName">First Name</label>
                                    <input type="text" id="registerFirstName" required>
                                </div>
                                <div class="form-group">
                                    <label for="registerLastName">Last Name</label>
                                    <input type="text" id="registerLastName" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="registerEmail">Email</label>
                                <input type="email" id="registerEmail" required>
                            </div>
                            <div class="form-group">
                                <label for="registerPhone">Phone</label>
                                <input type="tel" id="registerPhone">
                            </div>
                            <div class="form-group">
                                <label for="registerPassword">Password</label>
                                <input type="password" id="registerPassword" required minlength="6">
                            </div>
                            <div class="form-group">
                                <label for="confirmPassword">Confirm Password</label>
                                <input type="password" id="confirmPassword" required>
                            </div>
                            <button type="submit" class="auth-btn">Register</button>
                            <p class="auth-switch">
                                Already have an account? 
                                <a href="#" id="showLogin">Login here</a>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        `;

        const style = `
            <style>
                .auth-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .auth-modal-content {
                    background: white;
                    border-radius: 8px;
                    width: 90%;
                    max-width: 400px;
                    max-height: 80vh;
                    overflow-y: auto;
                }

                .auth-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    border-bottom: 1px solid #eee;
                }

                .auth-modal-header h2 {
                    margin: 0;
                    color: var(--dark-color);
                }

                .auth-modal-close {
                    font-size: 24px;
                    cursor: pointer;
                    color: #999;
                }

                .auth-modal-close:hover {
                    color: var(--dark-color);
                }

                .auth-modal-body {
                    padding: 20px;
                }

                .auth-form .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                }

                .auth-form .form-group {
                    margin-bottom: 15px;
                }

                .auth-form label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: 600;
                    color: var(--dark-color);
                }

                .auth-form input {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 14px;
                }

                .auth-form input:focus {
                    outline: none;
                    border-color: var(--primary-color);
                }

                .auth-btn {
                    width: 100%;
                    padding: 12px;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 4px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.3s;
                }

                .auth-btn:hover {
                    background: var(--secondary-color);
                }

                .auth-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .auth-switch {
                    text-align: center;
                    margin-top: 15px;
                    color: var(--text-color);
                }

                .auth-switch a {
                    color: var(--primary-color);
                    text-decoration: none;
                }

                .auth-switch a:hover {
                    text-decoration: underline;
                }

                @media (max-width: 480px) {
                    .auth-form .form-row {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', style);
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    bindEvents() {
        const modal = document.getElementById('authModal');
        const closeBtn = document.querySelector('.auth-modal-close');
        const showRegisterLink = document.getElementById('showRegister');
        const showLoginLink = document.getElementById('showLogin');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        // Close modal events
        closeBtn.addEventListener('click', () => this.hideModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.hideModal();
        });

        // Switch between login and register
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterForm();
        });

        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginForm();
        });

        // Form submissions
        loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }

    showModal(type = 'login') {
        const modal = document.getElementById('authModal');
        modal.style.display = 'flex';
        
        if (type === 'register') {
            this.showRegisterForm();
        } else {
            this.showLoginForm();
        }
    }

    hideModal() {
        const modal = document.getElementById('authModal');
        modal.style.display = 'none';
        
        // Reset forms
        document.getElementById('loginForm').reset();
        document.getElementById('registerForm').reset();
    }

    showLoginForm() {
        document.getElementById('authModalTitle').textContent = 'Login';
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('registerForm').style.display = 'none';
    }

    showRegisterForm() {
        document.getElementById('authModalTitle').textContent = 'Register';
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('.auth-btn');
        const originalText = submitBtn.textContent;
        
        try {
            submitBtn.textContent = 'Logging in...';
            submitBtn.disabled = true;
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            await api.login(email, password);
            
            this.hideModal();
            this.showSuccessMessage('Logged in successfully!');
            this.updateAuthUI();
            
        } catch (error) {
            this.showErrorMessage(error.message || 'Login failed');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('.auth-btn');
        const originalText = submitBtn.textContent;
        
        try {
            submitBtn.textContent = 'Registering...';
            submitBtn.disabled = true;
            
            const formData = {
                firstName: document.getElementById('registerFirstName').value,
                lastName: document.getElementById('registerLastName').value,
                email: document.getElementById('registerEmail').value,
                phone: document.getElementById('registerPhone').value,
                password: document.getElementById('registerPassword').value
            };
            
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (formData.password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }
            
            await api.register(formData);
            
            this.hideModal();
            this.showSuccessMessage('Account created successfully!');
            this.updateAuthUI();
            
        } catch (error) {
            this.showErrorMessage(error.message || 'Registration failed');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    updateAuthUI() {
        const user = api.getCurrentUser();
        const userIcons = document.querySelectorAll('.user-icon');
        
        userIcons.forEach(icon => {
            if (user) {
                icon.innerHTML = `<i class="fas fa-user-circle"></i>`;
                icon.href = '/user-account.html';
                icon.title = `${user.firstName} ${user.lastName}`;
            } else {
                icon.innerHTML = `<i class="fas fa-user"></i>`;
                icon.href = '#';
                icon.title = 'Login / Register';
            }
        });
    }

    showSuccessMessage(message) {
        this.showNotification(message, 'success');
    }

    showErrorMessage(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `auth-notification auth-notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        const style = `
            .auth-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                padding: 15px 20px;
                border-radius: 5px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10001;
                display: flex;
                align-items: center;
                gap: 10px;
                animation: slideInRight 0.3s ease;
                max-width: 300px;
            }
            
            .auth-notification-success {
                border-left: 4px solid #28a745;
                color: #28a745;
            }
            
            .auth-notification-error {
                border-left: 4px solid #dc3545;
                color: #dc3545;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;

        if (!document.querySelector('#auth-notification-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'auth-notification-styles';
            styleElement.textContent = style;
            document.head.appendChild(styleElement);
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize auth modal
const authModal = new AuthModal();

// Update auth UI on page load
document.addEventListener('DOMContentLoaded', () => {
    authModal.updateAuthUI();
    
    // Add click handlers to user icons
    document.querySelectorAll('.user-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.preventDefault();
            if (!api.isAuthenticated()) {
                authModal.showModal('login');
            } else {
                window.location.href = '/user-account.html';
            }
        });
    });
    
    // Add logout functionality
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            api.logout();
        });
    });
});

// Export for global use
window.authModal = authModal;
