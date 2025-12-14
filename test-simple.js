const axios = require('axios');

async function testAPI() {
    try {
        const query = 'paracetamol';
        const session = 'test123';
        const pvid = '123456789';

        // Probar con la URL exacta que funciona
        const url = `https://api.retailrocket.net/api/2.0/recommendation/Search/602bba6097a5281b4cc438c9/?phrase=${encodeURIComponent(query)}&session=${session}&pvid=${pvid}&isDebug=false&format=json`;

        console.log('URL:', url);
        console.log('');

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        });

        console.log('✅ Success!');
        console.log('Total products:', response.data.length);

        if (response.data.length > 0) {
            const product = response.data[0];
            console.log('\n📦 First product:');
            console.log('  Name:', product.Name);
            console.log('  Price:', product.Price);
            console.log('  OldPrice:', product.OldPrice);
            console.log('  Vendor:', product.Vendor);
            console.log('  PictureUrl:', product.PictureUrl);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testAPI();
