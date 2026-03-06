import puppeteer from 'puppeteer';

(async () => {
    const url = 'https://mymeridiantrust.com/';
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const data = await page.evaluate(() => {
        const els = Array.from(document.querySelectorAll('.logo, [id*="logo"], [class*="logo"]')).map(el => ({
            tag: el.tagName,
            className: typeof el.className === 'string' ? el.className : (el.className && el.className.baseVal),
            id: el.id,
            html: el.outerHTML.substring(0, 200)
        }));
        return els;
    });

    console.log(JSON.stringify(data, null, 2));
    await browser.close();
})();
