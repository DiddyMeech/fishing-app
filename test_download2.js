const url = 'https://dupagecustage.idevdesign.net/wp-content/uploads/logo.png';
const options = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.dupagecu.com/'
    }
};

async function testFetch() {
    try {
        const res = await fetch(url, options);
        console.log(`Status Code: ${res.status}`);
        console.log(`Headers: ${JSON.stringify(Object.fromEntries(res.headers.entries()))}`);
        const buffer = await res.arrayBuffer();
        console.log(`Received ${buffer.byteLength} bytes`);
    } catch (e) {
        console.error(`Fetch failed with error:`, e);
    }
}
testFetch();
