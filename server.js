const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(express.static('.'));

const SECRET_KEY = 'your-secret-key'; // In production, use env variable
const users = [];
const jobs = [];
const applications = [];

app.post('/register', async (req, res) => {
    const { username, email, type, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const mfaSecret = speakeasy.generateSecret({ length: 20 });
    
    const user = {
        id: users.length + 1,
        username,
        email,
        type,
        password: hashedPassword,
        mfaSecret: mfaSecret.base32
    };
    users.push(user);
    res.status(201).json({ 
        message: 'Registration successful',
        mfaSecret: mfaSecret.base32 // For QR code generation in a real app
    });
});

app.post('/login', async (req, res) => {
    const { email, password, mfaCode } = req.body;
    const user = users.find(u => u.email === email);
    
    if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).send('Invalid credentials');
    }

    // MFA verification
    const isMfaValid = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: mfaCode,
        window: 1 // 30-second window
    });

    if (!isMfaValid) {
        return res.status(401).send('Invalid MFA code');
    }

    const token = jwt.sign(
        { id: user.id, type: user.type },
        SECRET_KEY,
        { expiresIn: '1h' }
    );
    res.json({ token });
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).send('Access denied');
    
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).send('Invalid token');
        req.user = user;
        next();
    });
};

app.post('/post-job', authenticateToken, (req, res) => {
    const { title, description } = req.body;
    const job = {
        id: jobs.length + 1,
        title,
        description,
        employerId: req.user.id
    };
    jobs.push(job);
    res.status(201).send();
});

app.get('/jobs', (req, res) => {
    res.json(jobs);
});

app.get('/employer-jobs/:employerId', authenticateToken, (req, res) => {
    if (req.user.id != req.params.employerId) {
        return res.status(403).send('Unauthorized');
    }
    const employerJobs = jobs.filter(job => job.employerId == req.params.employerId);
    res.json(employerJobs);
});

app.post('/apply-job', authenticateToken, (req, res) => {
    const { jobId } = req.body;
    applications.push({ jobId, userId: req.user.id });
    res.status(201).send();
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});