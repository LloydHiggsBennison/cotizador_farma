const https = require('https');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function testBothSources(query) {
    console.log(`\n🧪 Testing Salcobrand Dual Strategy with: "${query}"`);
    console.log('='.repeat(60));

    // Test API
    console.log('\n📡 Testing RetailRocket API...');
    const apiProducts = await new Promise((resolve) => {
        const session = "68bdef6d7427bddf5be5f61a";
        const pvid = "362457347968736";
        const url = `https://api.retailrocket.net/api/2.0/recommendation/Search/602bba6097a5281b4cc438c9/?&phrase=${encodeURIComponent(query)}&session=${session}&pvid=${pvid}&isDebug=false&format=json`;

        console.log(`URL: ${url}`);

        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    console.log(`Status Code: ${res.statusCode}`);

                    if (res.statusCode !== 200) {
                        console.log(`❌ API Error: ${res.statusCode}`);
                        return resolve([]);
                    }

                    const products = JSON.parse(data);
                    console.log(`Parsed ${Array.isArray(products) ? products.length : 0} products`);

                    if (Array.isArray(products) && products.length > 0) {
                        console.log('First product sample:', JSON.stringify(products[0], null, 2));
                    }

                    const results = [];
                    if (Array.isArray(products)) {
                        products.slice(0, 6).forEach((product) => {
                            if (product.Name && product.Price) {
                                results.push({
                                    name: product.Name,
                                    price: product.Price,
                                    image: product.PictureUrl || ''
                                });
                            }
                        });
                    }

                    console.log(`✅ API returned ${results.length} products`);
                    results.forEach((p, i) => console.log(`  ${i + 1}. ${p.name} - $${p.price}`));
                    resolve(results);
                } catch (error) {
                    console.log(`❌ Parse Error: ${error.message}`);
                    resolve([]);
                }
            });
        }).on('error', (error) => {
            console.log(`❌ Request Error: ${error.message}`);
            resolve([]);
        });
    });

    // Test Puppeteer
    console.log('\n🌐 Testing Puppeteer Scraper...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    const url = `https://salcobrand.cl/search_result?query=${encodeURIComponent(query)}`;
    console.log(`URL: ${url}`);

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });

    try {
        await page.waitForSelector('.product', { timeout: 5000 });
    } catch (e) {
        await new Promise(resolve => setTimeout(resolve, 1500));
    }

    const puppeteerProducts = await page.evaluate(() => {
        const results = [];
        const productElements = document.querySelectorAll('.product');
        console.log(`Found ${productElements.length} .product elements`);

        productElements.forEach((el, i) => {
            if (i >= 6) return;

            let name = '';
            const imgEl = el.querySelector('.img-responsive');
            const altText = imgEl ? imgEl.getAttribute('alt') : '';
            const productInfoEl = el.querySelector('.product-info');
            const productNameEl = el.querySelector('.product-name');

            console.log(`Product ${i}:`);
            console.log(`  alt: ${altText}`);
            console.log(`  .product-info: ${productInfoEl ? productInfoEl.textContent.trim().substring(0, 50) : 'null'}`);
            console.log(`  .product-name: ${productNameEl ? productNameEl.textContent.trim() : 'null'}`);

            if (altText && !altText.toLowerCase().includes('msb logo') && !altText.toLowerCase().includes('misalcobrand')) {
                name = altText;
            } else if (productInfoEl && productInfoEl.textContent.trim()) {
                name = productInfoEl.textContent.trim();
            } else if (productNameEl && productNameEl.textContent.trim()) {
                name = productNameEl.textContent.trim();
            }

            if (name && !name.toLowerCase().includes('msb logo')) {
                const priceEl = el.querySelector('.display-price-normal, .price, .amount');
                const priceText = priceEl ? priceEl.textContent.trim() : '0';
                const priceMatch = priceText.match(/[\d.]+/);
                const price = priceMatch ? parseInt(priceMatch[0].replace(/\./g, '')) : 0;

                console.log(`  -> Selected name: ${name}, price: ${price}`);

                if (price > 0) {
                    results.push({ name, price });
                }
            }
        });

        return results;
    });

    await browser.close();

    console.log(`✅ Puppeteer returned ${puppeteerProducts.length} products`);
    puppeteerProducts.forEach((p, i) => console.log(`  ${i + 1}. ${p.name} - $${p.price}`));

    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`API: ${apiProducts.length} products`);
    console.log(`Puppeteer: ${puppeteerProducts.length} products`);
    console.log(`Total unique would be: ~${apiProducts.length + puppeteerProducts.length} (before dedup)`);
}

// Test with different queries
const query = process.argv[2] || 'paracetamol';
testBothSources(query).catch(console.error);
