// Main JavaScript file

// Auth state management
let isAuthenticated = false;
const TOKEN_KEY = 'auth_token';

// Check authentication status on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    setupEventListeners();
});

// Check if user is authenticated
function checkAuthStatus() {
    const token = localStorage.getItem(TOKEN_KEY);
    isAuthenticated = !!token;
    updateUIForAuth();
}

// Update UI based on authentication status
function updateUIForAuth() {
    const authButtons = document.getElementById('authButtons');
    if (!authButtons) return;

    if (isAuthenticated) {
        authButtons.innerHTML = `
            <a href="dashboard.html" class="btn btn-outline-light me-2">Dashboard</a>
            <button onclick="logout()" class="btn btn-light">Logout</button>
        `;
    } else {
        authButtons.innerHTML = `
            <a href="login.html" class="btn btn-outline-light me-2">Login</a>
            <a href="register.html" class="btn btn-light">Register</a>
        `;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem(TOKEN_KEY, data.token);
            isAuthenticated = true;
            window.location.href = 'dashboard.html';
        } else {
            showError(data.message);
        }
    } catch (error) {
        showError('An error occurred. Please try again.');
    }
}

// Handle register
async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }

    if (password.length < 8) {
        showError('Password must be at least 8 characters long');
        return;
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            window.location.href = 'login.html?registered=true';
        } else {
            showError(data.message);
        }
    } catch (error) {
        showError('An error occurred. Please try again.');
    }
}

// Logout function
function logout() {
    localStorage.removeItem(TOKEN_KEY);
    isAuthenticated = false;
    window.location.href = '/index.html';
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger alert-dismissible fade show';
    errorDiv.role = 'alert';
    errorDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    const form = document.querySelector('form');
    form.insertBefore(errorDiv, form.firstChild);
}

// API calls with authentication
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem(TOKEN_KEY);
    
    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
        },
    });
}

// Utility functions for date formatting
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}