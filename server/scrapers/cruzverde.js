const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const log = (message) => console.log(message);

async function scrapeCruzVerde(query) {
    log('[Cruz Verde] Starting (Puppeteer)...');

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

        const url = `https://www.cruzverde.cl/search?query=${encodeURIComponent(query)}`;
        log(`[Cruz Verde] Loading: ${url}`);

        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 15000
        });

        // Wait for products to load
        try {
            await page.waitForSelector('ml-new-card-product', { timeout: 5000 });
        } catch (e) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Extract product information
        const products = await page.evaluate(() => {
            const results = [];
            const productElements = document.querySelectorAll('ml-new-card-product');

            productElements.forEach((el, i) => {
                if (i >= 6) return; // Limit to 6 products

                // Extract product name
                const nameEl = el.querySelector('[class*="name"], [class*="title"], h2, h3');
                const name = nameEl ? nameEl.textContent.trim() : '';

                // Extract laboratory/brand from paragraph
                const brandEl = el.querySelector('p.text-gray-dark.italic.uppercase, p.italic.uppercase');
                const brand = brandEl ? brandEl.textContent.trim() : 'Genérico';

                // Extract price
                const priceEl = el.querySelector('ml-price-tag-v2, [class*="price"]');
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
                        id: `cruzverde-${i}`,
                        medicineName: name,
                        medicineBrand: brand, // Extract from HTML
                        medicineType: 'Medicamento',
                        medicineImage: image.startsWith('http') ? image : `https://www.cruzverde.cl${image}`,
                        pharmacyName: 'Cruz Verde',
                        pharmacyLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Cruz_Verde_logo.svg/2560px-Cruz_Verde_logo.svg.png',
                        price: price,
                        normalPrice: price,
                        stock: true,
                        productUrl: productUrl.startsWith('http') ? productUrl : `https://www.cruzverde.cl${productUrl}`
                    });
                }
            });

            return results;
        });

        await browser.close();

        log(`[Cruz Verde] Found ${products.length} results`);
        return products;

    } catch (error) {
        log(`[Cruz Verde] Error: ${error.message}`);
        return [];
    }
}

module.exports = scrapeCruzVerde;
