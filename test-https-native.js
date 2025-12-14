const https = require('https');

const query = 'paracetamol';
const session = 'test123';
const pvid = '123456789';

const url = `https://api.retailrocket.net/api/2.0/recommendation/Search/602bba6097a5281b4cc438c9/?phrase=${encodeURIComponent(query)}&session=${session}&pvid=${pvid}&isDebug=false&format=json`;

console.log('Testing URL:', url);
console.log('');

https.get(url, {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
    }
}, (res) => {
    console.log('Status Code:', res.statusCode);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode === 200) {
            const products = JSON.parse(data);
            console.log('✅ SUCCESS! Products:', products.length);
            console.log('First:', products[0].Name);
        } else {
            console.log('❌ Error:', res.statusCode);
            console.log('Response:', data);
        }
    });
}).on('error', (error) => {
    console.log('❌ Request Error:', error.message);
});
