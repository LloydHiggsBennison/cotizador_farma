const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function testAhumadaAPI() {
    console.log('🧪 Testing Farmacias Ahumada...\n');

    try {
        // Obtener el término desde un input
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

        // Construcción limpia de la URL
        const url = `https://www.farmaciasahumada.cl/search?q=${encodeURIComponent(query)}&search-button=&lang=null`;

        console.log("📡 Loading URL:", url);
        console.log("");

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Wait for products to load
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Extract product information
        const products = await page.evaluate(() => {
            const results = [];
            const productElements = document.querySelectorAll('.product');

            productElements.forEach((el, i) => {
                if (i >= 6) return; // Limit to 6 products

                // Extract brand from product-tile-brand
                const brandEl = el.querySelector('.product-tile-brand .link, .product-tile-brand span');
                const brand = brandEl ? brandEl.textContent.trim() : '';

                // Extract product description from pdp-link
                const descEl = el.querySelector('.pdp-link .link, .pdp-link a');
                const description = descEl ? descEl.textContent.trim() : '';

                // Combine brand and description: "Brand - Description"
                const name = brand && description ? `${brand} - ${description}` : (description || brand || '');

                // Extract price
                const priceEl = el.querySelector('.price .value, .sales .value, [class*="price"] .value');
                const priceText = priceEl ? priceEl.textContent.trim() : '0';
                const priceMatch = priceText.match(/[\d.]+/);
                const price = priceMatch ? parseInt(priceMatch[0].replace(/\./g, '')) : 0;

                // Extract image from tile-image link
                const imgEl = el.querySelector('.tile-image img, a.tile-image img, .image-container img');
                const image = imgEl ? (imgEl.getAttribute('src') || imgEl.getAttribute('data-src') || imgEl.getAttribute('data-lazy') || '') : '';

                // Extract product ID
                const pid = el.getAttribute('data-pid') || i;

                if (name && price > 0) {
                    results.push({
                        id: `ahumada-${pid}`,
                        medicineName: name,
                        medicineBrand: 'Ahumada',
                        medicineType: 'Medicamento',
                        medicineImage: image.startsWith('http') ? image : `https://www.farmaciasahumada.cl${image}`,
                        pharmacyName: 'Farmacias Ahumada',
                        pharmacyLogo: 'https://www.farmaciasahumada.cl/arquivos/logo-farmacias-ahumada.png',
                        price: price,
                        normalPrice: price, // Ahumada no siempre muestra precio antiguo
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

testAhumadaAPI();
