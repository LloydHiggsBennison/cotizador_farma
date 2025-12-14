const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const log = (message) => console.log(message);

async function scrapeAhumada(query) {
    log('[Farmacias Ahumada] Starting (Puppeteer)...');

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

        const url = `https://www.farmaciasahumada.cl/search?q=${encodeURIComponent(query)}&search-button=&lang=null`;
        log(`[Farmacias Ahumada] Loading: ${url}`);

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

                // Extract brand from product-tile-brand
                const brandEl = el.querySelector('.product-tile-brand .link, .product-tile-brand span');
                const brand = brandEl ? brandEl.textContent.trim() : '';

                // Extract product description from pdp-link
                const descEl = el.querySelector('.pdp-link .link, .pdp-link a');
                const description = descEl ? descEl.textContent.trim() : '';

                // Use only description for name (brand goes in badge to avoid duplication)
                const name = description || brand || '';

                // Extract price
                const priceEl = el.querySelector('.price .value, .sales .value, [class*="price"] .value');
                const priceText = priceEl ? priceEl.textContent.trim() : '0';
                const priceMatch = priceText.match(/[\d.]+/);
                const price = priceMatch ? parseInt(priceMatch[0].replace(/\./g, '')) : 0;

                // Extract image from tile-image link
                const imgEl = el.querySelector('.tile-image img, a.tile-image img, .image-container img');
                const image = imgEl ? (imgEl.getAttribute('src') || imgEl.getAttribute('data-src') || imgEl.getAttribute('data-lazy') || '') : '';

                // Extract product URL from pdp-link
                const linkEl = el.querySelector('.pdp-link a, .pdp-link .link, a.pdp-link');
                const productUrl = linkEl ? linkEl.getAttribute('href') : '';

                // Extract product ID
                const pid = el.getAttribute('data-pid') || i;

                if (name && price > 0) {
                    results.push({
                        id: `ahumada-${pid}`,
                        medicineName: name,
                        medicineBrand: brand || 'Genérico', // Use extracted brand from HTML
                        medicineType: 'Medicamento',
                        medicineImage: image.startsWith('http') ? image : `https://www.farmaciasahumada.cl${image}`,
                        pharmacyName: 'Farmacias Ahumada',
                        pharmacyLogo: 'https://www.farmaciasahumada.cl/arquivos/logo-farmacias-ahumada.png',
                        price: price,
                        normalPrice: price,
                        stock: true,
                        productUrl: productUrl.startsWith('http') ? productUrl : `https://www.farmaciasahumada.cl${productUrl}`
                    });
                }
            });

            return results;
        });

        await browser.close();

        log(`[Farmacias Ahumada] Found ${products.length} results`);
        return products;

    } catch (error) {
        log(`[Farmacias Ahumada] Error: ${error.message}`);
        return [];
    }
}

module.exports = scrapeAhumada;
