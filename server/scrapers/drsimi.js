const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const log = (message) => console.log(message);

async function scrapeDrSimi(query) {
    log('[Dr. Simi] Starting (Puppeteer)...');

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

        const url = `https://www.drsimi.cl/${encodeURIComponent(query)}?_q=${encodeURIComponent(query)}&map=ft`;
        log(`[Dr. Simi] Loading: ${url}`);

        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 15000
        });

        // Wait for products to load
        try {
            await page.waitForSelector('.vtex-search-result-3-x-galleryItem', { timeout: 5000 });
        } catch (e) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Extract product information
        const products = await page.evaluate(() => {
            const results = [];
            const productElements = document.querySelectorAll('.vtex-search-result-3-x-galleryItem');

            productElements.forEach((el, i) => {
                if (i >= 6) return; // Limit to 6 products

                // Extract product name
                const nameEl = el.querySelector('.vtex-product-summary-2-x-brandName, .vtex-product-summary-2-x-productBrand, [class*="productName"]');
                const name = nameEl ? nameEl.textContent.trim() : '';

                // Extract price
                const priceEl = el.querySelector('.vtex-product-price-1-x-sellingPrice, .vtex-product-price-1-x-currencyContainer, [class*="sellingPrice"]');
                const priceText = priceEl ? priceEl.textContent.trim() : '0';
                const priceMatch = priceText.match(/[\d.]+/);
                const price = priceMatch ? parseInt(priceMatch[0].replace(/\./g, '')) : 0;

                // Extract image
                const imgEl = el.querySelector('img');
                const image = imgEl ? (imgEl.getAttribute('src') || imgEl.getAttribute('data-src') || '') : '';

                // Extract product URL
                const linkEl = el.querySelector('a[href]');
                const productUrl = linkEl ? linkEl.getAttribute('href') : '';

                if (name && price > 0) {
                    results.push({
                        id: `drsimi-${i}`,
                        medicineName: name,
                        medicineBrand: 'Dr. Simi', // No laboratory data available
                        medicineType: 'Medicamento',
                        medicineImage: image.startsWith('http') ? image : `https://www.drsimi.cl${image}`,
                        pharmacyName: 'Dr. Simi',
                        pharmacyLogo: 'https://www.drsimi.cl/arquivos/logo-drsimi.png',
                        price: price,
                        normalPrice: price,
                        stock: true,
                        productUrl: productUrl.startsWith('http') ? productUrl : `https://www.drsimi.cl${productUrl}`
                    });
                }
            });

            return results;
        });

        await browser.close();

        log(`[Dr. Simi] Found ${products.length} results`);
        return products;

    } catch (error) {
        log(`[Dr. Simi] Error: ${error.message}`);
        return [];
    }
}

module.exports = scrapeDrSimi;
