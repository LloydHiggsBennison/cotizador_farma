const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function testSalcobrandNew() {
    console.log('🧪 Testing Salcobrand (Puppeteer)...\n');

    try {
        const query = process.argv[2] || 'paracetamol';

        if (!query) {
            console.error("❌ No se ingresó una palabra para buscar.");
            return;
        }

        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

        const url = `https://salcobrand.cl/search_result?query=${encodeURIComponent(query)}`;

        console.log("📡 Loading URL:", url);
        console.log("");

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });

        // Wait for products to load
        try {
            await page.waitForSelector('.product', { timeout: 5000 });
        } catch (e) {
            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        // Extract product information
        const products = await page.evaluate(() => {
            const results = [];
            const productElements = document.querySelectorAll('.product');

            productElements.forEach((el, i) => {
                if (i >= 6) return; // Limit to 6 products

                // Extract product name from img alt or link
                const imgEl = el.querySelector('img');
                const linkEl = el.querySelector('a[href*="/products/"]');
                const name = imgEl ? imgEl.getAttribute('alt') : (linkEl ? linkEl.textContent.trim() : '');

                // Extract price - looking for price elements
                const priceEl = el.querySelector('.price, .amount, [class*="price"]');
                const priceText = priceEl ? priceEl.textContent.trim() : '0';
                const priceMatch = priceText.match(/[\d.]+/);
                const price = priceMatch ? parseInt(priceMatch[0].replace(/\./g, '')) : 0;

                // Extract image
                const image = imgEl ? (imgEl.getAttribute('src') || imgEl.getAttribute('data-src') || '') : '';

                if (name && price > 0) {
                    results.push({
                        id: `salcobrand-${i}`,
                        medicineName: name,
                        medicineBrand: 'Salcobrand',
                        medicineType: 'Medicamento',
                        medicineImage: image.startsWith('http') ? image : `https://salcobrand.cl${image}`,
                        pharmacyName: 'Salcobrand',
                        pharmacyLogo: 'https://www.salcobrand.cl/static/version1731361759/frontend/Cencosud/salcobrand/es_CL/images/logo.svg',
                        price: price,
                        normalPrice: price,
                        stock: true
                    });
                }
            });

            return results;
        });

        await browser.close();

        console.log(`✅ Found ${products.length} products\n`);

        if (products.length > 0) {
            console.log('📦 First product:');
            const product = products[0];
            console.log('  Name:', product.medicineName);
            console.log('  Brand:', product.medicineBrand);
            console.log('  Price:', product.price);
            console.log('  Image:', product.medicineImage);
            console.log('');

            console.log('🎯 Mapped result:');
            console.log(JSON.stringify(product, null, 2));
            console.log('');

            console.log('📋 All products:');
            products.forEach((p, i) => {
                console.log(`${i + 1}. ${p.medicineName} - $${p.price}`);
            });
        } else {
            console.log("⚠️ No products found");
        }

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

testSalcobrandNew();
