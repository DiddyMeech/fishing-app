import puppeteer from 'puppeteer';

(async () => {
    const url = 'https://mymeridiantrust.com/';
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const data = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img')).map(img => ({
            src: img.src,
            alt: img.alt,
            className: img.className,
            id: img.id,
            width: img.naturalWidth,
            height: img.naturalHeight
        }));
        
        const svgs = Array.from(document.querySelectorAll('svg')).map(svg => ({
            className: svg.className.baseVal,
            id: svg.id
        }));

        return { imgs, svgs };
    });

    console.log("--- LOGO MATCHES ---");
    console.log(JSON.stringify(data.imgs.filter(i => i.src && i.src.toLowerCase().includes('logo')), null, 2));
    console.log("--- Header imgs ---");
    console.log(JSON.stringify(data.imgs.filter(i => i.width > 50 && i.height > 20 && i.height < 200), null, 2));

    await browser.close();
})();
