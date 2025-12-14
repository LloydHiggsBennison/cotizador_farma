const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function testBosquesAPI() {
    console.log('🧪 Testing Farmacia Bosques...\n');

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

        // Construcción de la URL - usa parámetros de búsqueda de WooCommerce
        const url = `https://www.farmaciabosques.com/?s=${encodeURIComponent(query)}&post_type=product&dgwt_wcas=1`;

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

                // Extract product name
                const nameEl = el.querySelector('.woocommerce-loop-product__title, h2, .product-title, [class*="product-name"]');
                const name = nameEl ? nameEl.textContent.trim() : '';

                // Extract price
                const priceEl = el.querySelector('.price .amount, .price, .woocommerce-Price-amount');
                const priceText = priceEl ? priceEl.textContent.trim() : '0';
                const priceMatch = priceText.match(/[\d.]+/);
                const price = priceMatch ? parseInt(priceMatch[0].replace(/\./g, '')) : 0;

                // Extract image
                const imgEl = el.querySelector('img');
                const image = imgEl ? (imgEl.getAttribute('src') || imgEl.getAttribute('data-src') || '') : '';

                if (name && price > 0) {
                    results.push({
                        id: `bosques-${i}`,
                        medicineName: name,
                        medicineBrand: 'Farmacia Bosques',
                        medicineType: 'Medicamento',
                        medicineImage: image.startsWith('http') ? image : `https://www.farmaciabosques.com${image}`,
                        pharmacyName: 'Farmacia Bosques',
                        pharmacyLogo: 'https://www.farmaciabosques.com/wp-content/uploads/2020/06/logo-farmacia-bosques.png',
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

testBosquesAPI();
