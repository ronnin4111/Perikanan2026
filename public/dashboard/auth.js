/**
 * Authentication Module for Dashboard
 * Simplified version - Alpine.js handles the form
 */

// Configuration
const AUTH_CONFIG = {
    PASSWORD: 'dpkpp123',
    SESSION_KEY: 'dashboard_authenticated',
    SESSION_DURATION: 8 * 60 * 60 * 1000 // 8 hours
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
        console.log('✅ Authentication saved to session');
    } else {
        sessionStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
        console.log('🔓 Authentication cleared from session');
    }
}

/**
 * Clear authentication (logout)
 */
function logout() {
    sessionStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
    console.log('👋 Logging out...');
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

// Export functions for use in app.js
window.Auth = {
    isAuthenticated,
    setAuthenticated,
    logout,
    validatePassword,
    PASSWORD: AUTH_CONFIG.PASSWORD
};

console.log('🔐 Auth module loaded');
