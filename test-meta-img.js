import puppeteer from 'puppeteer';

(async () => {
    const url = 'https://mymeridiantrust.com/';
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const data = await page.evaluate(() => {
        const ogImage = document.querySelector('meta[property="og:image"]');
        const ogImageSec = document.querySelector('meta[property="og:image:secure_url"]');
        const appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
        return {
            og: ogImage ? ogImage.content : null,
            ogSec: ogImageSec ? ogImageSec.content : null,
            apple: appleIcon ? appleIcon.href : null
        };
    });

    console.log(JSON.stringify(data, null, 2));

    await browser.close();
})();
