import puppeteer from 'puppeteer';

(async () => {
    const url = 'https://mymeridiantrust.com/';
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const data = await page.evaluate(() => {
        const header = document.querySelector('header') || document.body;
        const images = [];

        // imgs
        header.querySelectorAll('img').forEach(img => {
            if (img.width > 20 && img.height > 20 && img.src && !img.src.includes('data:image')) {
                images.push({ type: 'img', src: img.src, width: img.naturalWidth, height: img.naturalHeight, class: img.className });
            }
        });

        // svgs
        header.querySelectorAll('svg').forEach(svg => {
            const rect = svg.getBoundingClientRect();
            if (rect.width > 20 && rect.height > 20) {
                images.push({ type: 'svg', width: rect.width, height: rect.height, class: svg.className.baseVal, html: svg.outerHTML.substring(0, 100) });
            }
        });
        
        // bg images
        header.querySelectorAll('*').forEach(el => {
            const bg = window.getComputedStyle(el).backgroundImage;
            if (bg && bg !== 'none' && bg.includes('url')) {
                const rect = el.getBoundingClientRect();
                images.push({ type: 'bg', src: bg, width: rect.width, height: rect.height, class: el.className });
            }
        });

        return images;
    });

    console.log(JSON.stringify(data, null, 2));

    await browser.close();
})();
