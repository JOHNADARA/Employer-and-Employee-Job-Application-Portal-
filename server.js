const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(express.static('.'));

// In-memory storage (replace with database in production)
const users = [];
const jobs = [];
const applications = [];

app.post('/register', async (req, res) => {
    const { username, email, type, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
        id: users.length + 1,
        username,
        email,
        type,
        password: hashedPassword
    };
    users.push(user);
    res.status(201).send();
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (user && await bcrypt.compare(password, user.password)) {
        res.json({ id: user.id, type: user.type });
    } else {
        res.status(401).send('Invalid credentials');
    }
});

app.post('/post-job', (req, res) => {
    const { title, description, employerId } = req.body;
    const job = {
        id: jobs.length + 1,
        title,
        description,
        employerId
    };
    jobs.push(job);
    res.status(201).send();
});

app.get('/jobs', (req, res) => {
    res.json(jobs);
});

app.get('/employer-jobs/:employerId', (req, res) => {
    const employerJobs = jobs.filter(job => job.employerId == req.params.employerId);
    res.json(employerJobs);
});

app.post('/apply-job', (req, res) => {
    const { jobId, userId } = req.body;
    applications.push({ jobId, userId });
    res.status(201).send();
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});