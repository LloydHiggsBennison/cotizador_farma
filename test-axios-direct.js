const axios = require('axios');

async function testDirect() {
    const query = 'paracetamol';
    const session = Math.random().toString(36).substring(7);
    const pvid = Math.floor(Math.random() * 1000000000000000);

    const url = `https://api.retailrocket.net/api/2.0/recommendation/Search/602bba6097a5281b4cc438c9/?phrase=${encodeURIComponent(query)}&session=${session}&pvid=${pvid}&isDebug=false&format=json`;

    console.log('Testing URL:', url);
    console.log('');

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            },
            timeout: 15000
        });

        console.log('✅ SUCCESS!');
        console.log('Total products:', response.data.length);

        if (response.data.length > 0) {
            console.log('\nFirst 3 products:');
            response.data.slice(0, 3).forEach((p, i) => {
                console.log(`${i + 1}. ${p.Name} - $${p.Price}`);
            });
        }
    } catch (error) {
        console.log('❌ ERROR:', error.message);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        }
    }
}

testDirect();
