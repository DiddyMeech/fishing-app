import puppeteer from 'puppeteer';

(async () => {
    const url = 'https://mymeridiantrust.com/';
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const data = await page.evaluate(() => {
        let logo = null;
        // Search for images with logo in src
        const allImages = Array.from(document.querySelectorAll('img'));
        for (const img of allImages) {
            if (img.src && img.src.toLowerCase().includes('logo') && !img.src.includes('certification')) {
                return img.src;
            }
        }
        
        // Search for svg inside a prominent home link
        return null;
    });

    console.log("Logo: " + data);
    await browser.close();
})();
