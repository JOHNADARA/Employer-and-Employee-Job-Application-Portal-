let currentUser = null;

function showRegister() {
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('main-content').style.display = 'none';
}

function showLogin() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('main-content').style.display = 'none';
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
        alert('Registration successful! Please login.');
        showLogin();
    }
}

async function loginUser(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (response.ok) {
        const user = await response.json();
        currentUser = user;
        showMainContent();
    }
}

function showMainContent() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';

    if (currentUser.type === 'jobseeker') {
        document.getElementById('jobseeker-view').style.display = 'block';
        document.getElementById('employer-view').style.display = 'none';
        loadJobs();
    } else {
        document.getElementById('jobseeker-view').style.display = 'none';
        document.getElementById('employer-view').style.display = 'block';
        loadEmployerJobs();
    }
}

async function postJob(event) {
    event.preventDefault();
    const title = document.getElementById('job-title').value;
    const description = document.getElementById('job-desc').value;

    const response = await fetch('/post-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, employerId: currentUser.id })
    });

    if (response.ok) {
        loadEmployerJobs();
    }
}

async function loadJobs() {
    const response = await fetch('/jobs');
    const jobs = await response.json();
    const jobListings = document.getElementById('job-listings');
    jobListings.innerHTML = jobs.map(job => `
        <div class="job-listing">
            <h3>${job.title}</h3>
            <p>${job.description}</p>
            <button onclick="applyJob(${job.id})">Apply</button>
        </div>
    `).join('');
}

async function loadEmployerJobs() {
    const response = await fetch(`/employer-jobs/${currentUser.id}`);
    const jobs = await response.json();
    const employerJobs = document.getElementById('employer-jobs');
    employerJobs.innerHTML = jobs.map(job => `
        <div class="job-listing">
            <h3>${job.title}</h3>
            <p>${job.description}</p>
        </div>
    `).join('');
}

async function applyJob(jobId) {
    const response = await fetch('/apply-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, userId: currentUser.id })
    });

    if (response.ok) {
        alert('Application submitted successfully!');
    }
}