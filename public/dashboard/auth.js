/**
 * Authentication Module for Dashboard
 * Password Gate System with Glassmorphism Design
 */

// Configuration
const AUTH_CONFIG = {
    PASSWORD: 'dpkpp123', // Change this to your desired password
    SESSION_KEY: 'dashboard_authenticated',
    SESSION_DURATION: 8 * 60 * 60 * 1000 // 8 hours in milliseconds
};

/**
 * Check authentication status from sessionStorage
 * @returns {boolean} True if authenticated, false otherwise
 */
function isAuthenticated() {
    const sessionData = sessionStorage.getItem(AUTH_CONFIG.SESSION_KEY);
    if (!sessionData) return false;
    
    try {
        const { authenticated, timestamp } = JSON.parse(sessionData);
        if (!authenticated) return false;
        
        // Check if session has expired
        const now = Date.now();
        if (now - timestamp > AUTH_CONFIG.SESSION_DURATION) {
            // Session expired
            sessionStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error parsing session data:', error);
        sessionStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
        return false;
    }
}

/**
 * Set authentication status
 * @param {boolean} authenticated - Authentication status
 */
function setAuthenticated(authenticated) {
    if (authenticated) {
        const sessionData = {
            authenticated: true,
            timestamp: Date.now()
        };
        sessionStorage.setItem(AUTH_CONFIG.SESSION_KEY, JSON.stringify(sessionData));
    } else {
        sessionStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
    }
}

/**
 * Clear authentication (logout)
 */
function logout() {
    sessionStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
    location.reload();
}

/**
 * Validate password input
 * @param {string} password - Password to validate
 * @returns {boolean} True if password is correct
 */
function validatePassword(password) {
    return password === AUTH_CONFIG.PASSWORD;
}

/**
 * Initialize authentication check when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
    const passwordGate = document.getElementById('passwordGate');
    const passwordInput = document.getElementById('passwordInput');
    
    if (!passwordGate) {
        console.error('Password gate element not found');
        return;
    }
    
    // Check if user is already authenticated
    if (isAuthenticated()) {
        // User is authenticated, hide gate immediately
        passwordGate.style.display = 'none';
        
        // Trigger Alpine to update state
        if (window.Alpine && window.Alpine.store) {
            window.Alpine.store('auth', {
                isAuthenticated: true
            });
        }
        
        // Dispatch event to notify app
        window.dispatchEvent(new CustomEvent('authenticated'));
        return;
    }
    
    // Show password gate
    passwordGate.style.display = 'flex';
    
    // Setup password form submission
    const passwordForm = passwordGate.querySelector('form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const password = passwordInput ? passwordInput.value : '';
            const errorElement = passwordGate.querySelector('[x-show="passwordError"]');
            
            if (validatePassword(password)) {
                // Password correct
                setAuthenticated(true);
                
                // Animate fade out
                passwordGate.classList.add('fadeOutDown');
                
                // Remove gate after animation
                setTimeout(function() {
                    passwordGate.style.display = 'none';
                    
                    // Dispatch event to notify app
                    window.dispatchEvent(new CustomEvent('authenticated'));
                }, 400);
                
            } else {
                // Password incorrect
                if (passwordInput) {
                    passwordInput.value = '';
                    passwordInput.focus();
                }
                
                // Show error message through Alpine
                if (window.Alpine) {
                    // Alpine will handle the error display through x-model
                }
            }
        });
    }
    
    // Allow Enter key to submit form
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                if (passwordForm) {
                    passwordForm.dispatchEvent(new Event('submit'));
                }
            }
        });
        
        // Focus input on load
        setTimeout(function() {
            passwordInput.focus();
        }, 100);
    }
});

// Export functions for use in app.js
window.Auth = {
    isAuthenticated,
    setAuthenticated,
    logout,
    validatePassword,
    PASSWORD: AUTH_CONFIG.PASSWORD
};
