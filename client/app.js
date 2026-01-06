const API_URL = 'http://localhost:3000/api';

const loginForm = document.getElementById('login-form');
const loginFormContainer = document.getElementById('login-form-container');
const dashboard = document.getElementById('dashboard');
const messageDiv = document.getElementById('message');
const tokenValue = document.getElementById('token-value');
const logoutBtn = document.getElementById('logout-btn');
const registerBtn = document.getElementById('register-btn');

// Login Handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    showMessage('Logging in...', '');

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            handleLoginSuccess(data.token);
        } else {
            showMessage(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Network error. Is the server running?', 'error');
    }
});

// Quick Register Handler (For testing purposes)
registerBtn.addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        showMessage('Please enter username and password to register', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Registered successfully! You can now login.', 'success');
        } else {
            showMessage(data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        showMessage('Network error during registration', 'error');
    }
});

function handleLoginSuccess(token) {
    loginFormContainer.classList.add('hidden');
    dashboard.classList.remove('hidden');
    tokenValue.textContent = token;
    showMessage('', '');
}

logoutBtn.addEventListener('click', () => {
    loginFormContainer.classList.remove('hidden');
    dashboard.classList.add('hidden');
    document.getElementById('login-form').reset();
    tokenValue.textContent = '';
});

function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = 'message ' + type;
}
