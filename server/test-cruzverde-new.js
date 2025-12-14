const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function testCruzVerdeNew() {
    console.log('🧪 Testing Cruz Verde (new approach)...\n');

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

        const url = `https://www.cruzverde.cl/search?query=${encodeURIComponent(query)}`;

        console.log("📡 Loading URL:", url);
        console.log("");

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Wait for products to load
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Extract product information
        const products = await page.evaluate(() => {
            const results = [];
            const productElements = document.querySelectorAll('ml-new-card-product');

            productElements.forEach((el, i) => {
                if (i >= 6) return; // Limit to 6 products

                // Extract product name - looking in common places
                const nameEl = el.querySelector('[class*="name"], [class*="title"], h2, h3');
                const name = nameEl ? nameEl.textContent.trim() : '';

                // Extract price - looking for ml-price-tag-v2 or general price elements
                const priceEl = el.querySelector('ml-price-tag-v2, [class*="price"]');
                const priceText = priceEl ? priceEl.textContent.trim() : '0';
                const priceMatch = priceText.match(/[\d.]+/);
                const price = priceMatch ? parseInt(priceMatch[0].replace(/\./g, '')) : 0;

                // Extract image - from ml-product-image-new
                const imgEl = el.querySelector('img');
                const image = imgEl ? (imgEl.getAttribute('src') || imgEl.getAttribute('data-src') || '') : '';

                if (name && price > 0) {
                    results.push({
                        id: `cruzverde-${i}`,
                        medicineName: name,
                        medicineBrand: 'Cruz Verde',
                        medicineType: 'Medicamento',
                        medicineImage: image.startsWith('http') ? image : `https://www.cruzverde.cl${image}`,
                        pharmacyName: 'Cruz Verde',
                        pharmacyLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Cruz_Verde_logo.svg/2560px-Cruz_Verde_logo.svg.png',
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

testCruzVerdeNew();
