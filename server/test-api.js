const axios = require('axios');

const testEndpoints = async () => {
    const query = 'paracetamol';

    const endpoints = [
        `https://api.cruzverde.cl/product-service/products?search=${query}`,
        `https://api.cruzverde.cl/product-service/search?q=${query}`,
        `https://api.cruzverde.cl/api/v1/products/search?term=${query}`,
        `https://api.cruzverde.cl/search-service/search?query=${query}`,
        `https://www.cruzverde.cl/api/products/search?q=${query}`,
        `https://api.cruzverde.cl/product-service/public/products/search?q=${query}`,
    ];

    console.log('Testing Cruz Verde API endpoints...\n');

    for (const url of endpoints) {
        try {
            console.log(`Testing: ${url}`);
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json'
                },
                timeout: 10000
            });

            console.log(`✅ SUCCESS! Status: ${response.status}`);
            console.log(`Response preview:`, JSON.stringify(response.data).substring(0, 300));
            console.log('\n---\n');

        } catch (error) {
            if (error.response) {
                console.log(`❌ Error ${error.response.status}: ${error.response.statusText}`);
            } else {
                console.log(`❌ Network error: ${error.message}`);
            }
            console.log('\n---\n');
        }
    }
};

testEndpoints();
