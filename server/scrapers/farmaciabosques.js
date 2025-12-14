const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const log = (message) => console.log(message);

async function scrapeFarmaciaBosques(query) {
    log('[Farmacia Bosques] Starting (Puppeteer)...');

    try {
        const browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();

        // Block unnecessary resources for faster loading
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const resourceType = req.resourceType();
            if (resourceType === 'image' || resourceType === 'stylesheet' || resourceType === 'font' || resourceType === 'media') {
                req.abort();
            } else {
                req.continue();
            }
        });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36');

        const url = `https://www.farmaciabosques.com/?s=${encodeURIComponent(query)}&post_type=product&dgwt_wcas=1`;
        log(`[Farmacia Bosques] Loading: ${url}`);

        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 15000
        });

        // Wait for products to load
        try {
            await page.waitForSelector('.product', { timeout: 5000 });
        } catch (e) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Extract product information
        const products = await page.evaluate(() => {
            const results = [];
            const productElements = document.querySelectorAll('.product');

            productElements.forEach((el, i) => {
                if (i >= 6) return; // Limit to 6 products

                // Extract product name
                const nameEl = el.querySelector('.woocommerce-loop-product__title, h2, h3');
                const name = nameEl ? nameEl.textContent.trim() : '';

                // Extract price
                const priceEl = el.querySelector('.price .woocommerce-Price-amount bdi, .price ins .amount, .price .amount');
                const priceText = priceEl ? priceEl.textContent.trim() : '0';
                const priceMatch = priceText.match(/[\d.]+/);
                const price = priceMatch ? parseInt(priceMatch[0].replace(/\./g, '')) : 0;

                // Extract image
                const imgEl = el.querySelector('img');
                const image = imgEl ? (imgEl.getAttribute('src') || imgEl.getAttribute('data-src') || '') : '';

                // Extract product URL
                const linkEl = el.querySelector('a.woocommerce-LoopProduct-link, a[href]');
                const productUrl = linkEl ? linkEl.getAttribute('href') : '';

                if (name && price > 0) {
                    results.push({
                        id: `bosques-${i}`,
                        medicineName: name,
                        medicineBrand: 'Farmacia Bosques', // No laboratory data available
                        medicineType: 'Medicamento',
                        medicineImage: image.startsWith('http') ? image : `https://www.farmaciabosques.com${image}`,
                        pharmacyName: 'Farmacia Bosques',
                        pharmacyLogo: 'https://www.farmaciabosques.com/wp-content/uploads/2021/01/logo.png',
                        price: price,
                        normalPrice: price,
                        stock: true,
                        productUrl: productUrl || ''
                    });
                }
            });

            return results;
        });

        await browser.close();

        log(`[Farmacia Bosques] Found ${products.length} results`);
        return products;

    } catch (error) {
        log(`[Farmacia Bosques] Error: ${error.message}`);
        return [];
    }
}

module.exports = scrapeFarmaciaBosques;
