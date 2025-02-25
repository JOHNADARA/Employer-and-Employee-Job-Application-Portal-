let currentUser = null;
let token = null;

function toggleMenu() {
    const menu = document.getElementById('nav-menu');
    menu.classList.toggle('active');
}

function updateMenu() {
    const menu = document.getElementById('nav-menu');
    const authButtons = document.getElementById('auth-buttons');
    menu.innerHTML = '<li><a href="#" onclick="showHome()">Home</a></li>';

    if (currentUser) {
        authButtons.style.display = 'none';
        if (currentUser.type === 'jobseeker') {
            menu.innerHTML += `
                <li><a href="#" onclick="showJobs()">Find Jobs</a></li>
                <li><a href="#" onclick="alert('Profile feature coming soon!')">Profile</a></li>
                <li><a href="#" onclick="logout()">Logout</a></li>
            `;
        } else if (currentUser.type === 'employer') {
            menu.innerHTML += `
                <li><a href="#" onclick="showEmployerDashboard()">Dashboard</a></li>
                <li><a href="#" onclick="alert('Profile feature coming soon!')">Profile</a></li>
                <li><a href="#" onclick="logout()">Logout</a></li>
            `;
        }
    } else {
        authButtons.style.display = 'block';
        menu.innerHTML += `
            <li><a href="#" onclick="showRegister()">Register</a></li>
            <li><a href="#" onclick="showLogin()">Login</a></li>
        `;
    }
}

function showHome() {
    hideAll();
    document.getElementById('home-content').style.display = 'block';
    toggleMenu();
}

function showRegister() {
    hideAll();
    document.getElementById('register-form').style.display = 'block';
    toggleMenu();
}

function showLogin() {
    hideAll();
    document.getElementById('login-form').style.display = 'block';
    toggleMenu();
}

function showJobs() {
    hideAll();
    document.getElementById('main-content').style.display = 'block';
    document.getElementById('jobseeker-view').style.display = 'block';
    loadJobs();
    toggleMenu();
}

function showEmployerDashboard() {
    hideAll();
    document.getElementById('main-content').style.display = 'block';
    document.getElementById('employer-view').style.display = 'block';
    loadEmployerJobs();
    toggleMenu();
}

function hideAll() {
    document.getElementById('home-content').style.display = 'none';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('jobseeker-view').style.display = 'none';
    document.getElementById('employer-view').style.display = 'none';
}

async function registerUser(event) {
    event.preventDefault();
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const type = document.getElementById('reg-type').value;
    const password = document.getElementById('reg-password').value;

    const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, type, password })
    });

    if (response.ok) {
        const data = await response.json();
        alert(`Registration successful! Set up MFA with this secret: ${data.mfaSecret}`);
        showLogin();
    }
}

async function loginUser(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const mfaCode = prompt('Enter your MFA code');

    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, mfaCode })
    });

    if (response.ok) {
        const data = await response.json();
        token = data.token;
        currentUser = jwt_decode(token); // Assumes jwt-decode is included
        updateMenu();
        showMainContent();
    }
}

function showMainContent() {
    hideAll();
    document.getElementById('main-content').style.display = 'block';
    if (currentUser.type === 'jobseeker') {
        showJobs();
    } else {
        showEmployerDashboard();
    }
}

function logout() {
    currentUser = null;
    token = null;
    updateMenu();
    showHome();
}

// Include other existing functions (postJob, loadJobs, etc.) here
// Make sure to add toggleMenu() to their respective navigation calls

updateMenu(); // Initial menu setup