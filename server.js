import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Initialize SQLite Database
const dbPath = join(__dirname, 'imrs.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS storage (
            id TEXT PRIMARY KEY,
            data TEXT
        )`, (err) => {
            if (err) console.error('Error creating table', err.message);
        });
    }
});

// Serve static files from the Vite build output
app.use(express.static(join(__dirname, 'dist')));

// API Endpoints
app.get('/api/data/:id', (req, res) => {
    const id = req.params.id;
    db.get(`SELECT data FROM storage WHERE id = ?`, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(row ? JSON.parse(row.data) : null);
    });
});

app.post('/api/data/:id', (req, res) => {
    const id = req.params.id;
    const data = JSON.stringify(req.body);
    db.run(`INSERT OR REPLACE INTO storage (id, data) VALUES (?, ?)`, [id, data], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true });
    });
});

// Handle AI Chat Proxy (NVIDIA - Bypass CORS)
app.post('/api/ai/chat', async (req, res) => {
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'NVIDIA API Key not configured on server' });
    }

    try {
        const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json(errorData);
        }

        const data = await response.json();
        res.json(data);
    } catch (e) {
        console.error("AI Proxy error:", e);
        res.status(500).json({ error: e.message || 'Failed to connect to AI service' });
    }
});

// Handle Serper Search Intelligence Proxy (Bypass CORS)
app.post('/api/ai/intel', async (req, res) => {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Serper API Key not configured on server' });
    }

    try {
        const { q, num = 5 } = req.body;
        
        if (!q) {
            return res.status(400).json({ error: 'Missing search query parameter' });
        }

        const response = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: {
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ q, num })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json(errorData);
        }

        const data = await response.json();
        res.json(data);
    } catch (e) {
        console.error("Serper Proxy error:", e);
        res.status(500).json({ error: e.message || 'Failed to connect to Serper service' });
    }
});

// Handle Email Sending
app.post('/api/send-email', async (req, res) => {
    try {
        const { smtpHost, smtpPort, smtpUser, smtpPass, to, subject, html, replyTo, fromName, attachments } = req.body;
        
        if (!smtpHost || !smtpUser || !smtpPass) {
            return res.status(400).json({ error: 'Missing SMTP configuration parameters.'});
        }

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort || 587,
            secure: smtpPort == 465, // true for 465, false for other ports
            auth: {
                user: smtpUser,
                pass: smtpPass
            }
        });

        const mailOptions = {
            from: `"${fromName || 'IMRS System'}" <${smtpUser}>`,
            to,
            subject,
            html,
            replyTo: replyTo || smtpUser,
            attachments: attachments || []
        };

        const info = await transporter.sendMail(mailOptions);
        res.json({ success: true, messageId: info.messageId });
    } catch (e) {
        console.error("Email send error:", e);
        res.status(500).json({ error: e.message || 'Failed to send email' });
    }
});

// Handle React Router - serve index.html for all non-file routes
app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`IMRS server running on port ${PORT}`);
});
