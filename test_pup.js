import puppeteer from 'puppeteer';
import fs from 'fs';

async function test() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    console.log('Going to URL...');
    await page.goto('https://digital.dupagecu.com/Authentication', { waitUntil: 'networkidle2' });
    
    console.log('Finding favicon...');
    const favUrl = await page.evaluate(() => {
        const el = document.querySelector('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');
        return el ? el.href : new URL('/favicon.ico', window.location.href).href;
    });
    console.log('Favicon URL:', favUrl);
    
    if (favUrl) {
        try {
            const favPage = await browser.newPage();
            await favPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            console.log('Navigating to favicon URL natively...');
            await favPage.goto(favUrl, { waitUntil: 'networkidle0' });
            
            const favImg = await favPage.$('img');
            if (favImg) {
                await favImg.screenshot({ path: 'test_fav.png', omitBackground: true });
                console.log('Saved favicon via direct navigation screenshot.');
            } else {
                console.log('Favicon URL did not render a direct image tag.');
            }
            await favPage.close();
        } catch(e) {
            console.log('Favicon native extraction failed:', e.message);
        }
    }
    await browser.close();
}
test().catch(console.error);
