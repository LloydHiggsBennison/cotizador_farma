const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function testSalcobrand() {
    console.log('🧪 Testing Salcobrand (updated selectors)...\n');

    try {
        const query = process.argv[2] || 'ambroxol';

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

        try {
            await page.waitForSelector('.product', { timeout: 5000 });
        } catch (e) {
            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        const products = await page.evaluate(() => {
            const results = [];
            const productElements = document.querySelectorAll('.product');

            console.log(`Found ${productElements.length} product elements`);

            productElements.forEach((el, i) => {
                if (i >= 6) return;

                // Extract using the same logic as server
                const productInfoEl = el.querySelector('.product-info');
                const productNameEl = el.querySelector('.product-name');
                const imgEl = el.querySelector('.img-responsive');

                let name = '';
                if (productInfoEl && productInfoEl.textContent.trim()) {
                    name = productInfoEl.textContent.trim();
                } else if (imgEl && imgEl.getAttribute('alt')) {
                    name = imgEl.getAttribute('alt');
                } else if (productNameEl && productNameEl.textContent.trim()) {
                    name = productNameEl.textContent.trim();
                }

                const priceEl = el.querySelector('.display-price-normal, .price, .amount');
                const priceText = priceEl ? priceEl.textContent.trim() : '0';
                const priceMatch = priceText.match(/[\d.]+/);
                const price = priceMatch ? parseInt(priceMatch[0].replace(/\./g, '')) : 0;

                const image = imgEl ? (imgEl.getAttribute('src') || '') : '';

                console.log(`Product ${i}: name="${name}" price=${price} hasImg=${!!imgEl}`);

                if (name && price > 0) {
                    results.push({
                        id: `salcobrand-${i}`,
                        medicineName: name,
                        price: price,
                        medicineImage: image
                    });
                } else {
                    console.log(`  -> SKIPPED (name empty or price 0)`);
                }
            });

            return results;
        });

        await browser.close();

        console.log(`\n✅ Found ${products.length} valid products\n`);

        products.forEach((p, i) => {
            console.log(`${i + 1}. ${p.medicineName} - $${p.price}`);
        });

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

testSalcobrand();
