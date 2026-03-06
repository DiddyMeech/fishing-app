const https = require('https');
const url = 'https://dupagecustage.idevdesign.net/wp-content/uploads/logo.png';
const options = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.dupagecu.com/'
    }
};

https.get(url, options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    res.on('data', (chunk) => {
        console.log(`Received ${chunk.length} bytes`);
    });
}).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
});
