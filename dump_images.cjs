const puppeteer = require('puppeteer');
const fs = require('fs');

async function run() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    try {
        await page.goto('https://www.dupagecu.com/', { waitUntil: 'networkidle2' });
        const images = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('img')).map(img => ({
                src: img.src,
                alt: img.alt,
                className: img.className,
                id: img.id,
                rect: img.getBoundingClientRect()
            }));
        });
        fs.writeFileSync('dupage_images.json', JSON.stringify(images, null, 2));
        console.log(`Saved ${images.length} images.`);
    } catch(e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}
run();
