import puppeteer from 'puppeteer';
import fs from 'fs';

async function inspectLogo() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await page.goto('https://digital.dupagecu.com/Authentication', { waitUntil: 'networkidle2' });

    const brandInfo = await page.evaluate(() => {
        const title = document.title;
        const icon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]')?.href;
        
        const imgs = Array.from(document.querySelectorAll('img, svg')).map(el => {
            const rect = el.getBoundingClientRect();
            return {
                tag: el.tagName,
                src: el.src || '',
                className: typeof el.className === 'string' ? el.className : (el.className && el.className.baseVal ? el.className.baseVal : ''),
                width: rect.width,
                height: rect.height,
                top: rect.top,
                html: el.outerHTML.substring(0, 150)
            };
        });
        
        return { title, icon, imgs };
    });

    fs.writeFileSync('test_out.json', JSON.stringify(brandInfo, null, 2));
    await browser.close();
}

inspectLogo().catch(console.error);
