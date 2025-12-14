const https = require('https');

const query = 'paracetamol';
const session = "68bdef6d7427bddf5be5f61a";
const pvid = "362457347968736";
const url = `https://api.retailrocket.net/api/2.0/recommendation/Search/602bba6097a5281b4cc438c9/?&phrase=${encodeURIComponent(query)}&session=${session}&pvid=${pvid}&isDebug=false&format=json`;

console.log('Fetching from API...');

https.get(url, {
    headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
    }
}, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        const products = JSON.parse(data);
        console.log('\nFirst product from API:');
        console.log(JSON.stringify(products[0], null, 2));

        console.log('\n\nAvailable fields:');
        console.log(Object.keys(products[0]));
    });
}).on('error', (e) => {
    console.error(e);
});
