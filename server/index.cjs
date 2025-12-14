const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const log = (message) => console.log(message);

const cleanPrice = (text) => {
    if (!text) return null;
    const match = text.match(/\$[\s]?(\d{1,3}(\.\d{3})*)/);
    if (match) {
        return parseInt(match[1].replace(/[^\d]/g, ''));
    }
    const numberMatch = text.match(/(\d{1,3}(\.\d{3})*)/);
    if (numberMatch) {
        return parseInt(numberMatch[0].replace(/[^\d]/g, ''));
    }
    return null;
};

const scrapers = {
    cruzverde: async (query) => {
        log('[Cruz Verde] Starting (Puppeteer with API interception)...');

        try {
            const browser = await puppeteer.launch({
                headless: "new",
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            });

            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36');

            let apiData = null;

            // Intercept API responses
            page.on('response', async (response) => {
                const url = response.url();

                if (url.includes('api.cruzverde.cl/product-service/products/search')) {
                    try {
                        const contentType = response.headers()['content-type'];
                        if (contentType && contentType.includes('application/json')) {
                            apiData = await response.json();
                            log(`[Cruz Verde] ✅ Intercepted API with ${apiData.products?.length || 0} products`);
                        }
                    } catch (err) {
                        log(`[Cruz Verde] Error parsing response: ${err.message}`);
                    }
                }
            });

            const url = `https://www.cruzverde.cl/search?query=${encodeURIComponent(query)}`;
            log(`[Cruz Verde] Loading: ${url}`);

            await page.goto(url, {
                waitUntil: 'networkidle2',
                timeout: 45000
            });

            // Wait for API to complete
            await new Promise(resolve => setTimeout(resolve, 3000));

            await browser.close();

            const results = [];

            if (apiData && apiData.products && Array.isArray(apiData.products)) {
                apiData.products.slice(0, 6).forEach((product, i) => {
                    const price = product.prices?.unitPrice || product.prices?.basePrice || product.price || 0;
                    const normalPrice = product.prices?.listPrice || price;
                    const image = product.images?.[0]?.url || product.image || '';

                    results.push({
                        id: `cruzverde-${i}`,
                        medicineName: product.name || product.productName || 'Producto',
                        medicineBrand: product.brand || 'Cruz Verde',
                        medicineType: 'Medicamento',
                        medicineImage: image.startsWith('http') ? image : `https://www.cruzverde.cl${image}`,
                        pharmacyName: 'Cruz Verde',
                        pharmacyLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Cruz_Verde_logo.svg/2560px-Cruz_Verde_logo.svg.png',
                        price: typeof price === 'number' ? price : parseInt(price) || 0,
                        normalPrice: typeof normalPrice === 'number' ? normalPrice : parseInt(normalPrice) || price,
                        stock: true
                    });
                });
            }

            log(`[Cruz Verde] Found ${results.length} results`);
            return results;

        } catch (error) {
            log(`[Cruz Verde] Error: ${error.message}`);
            return [];
        }
    },

    salcobrand: async (query) => {
        log('[Salcobrand] Starting (RetailRocket API)...');

        return new Promise((resolve) => {
            try {
                // Generate random session IDs
                const session = Math.random().toString(36).substring(7);
                const pvid = Math.floor(Math.random() * 1000000000000000);

                // API endpoint corregido con el ID correcto
                const url = `https://api.retailrocket.net/api/2.0/recommendation/Search/602bba6097a5281b4cc438c9/?phrase=${encodeURIComponent(query)}&session=${session}&pvid=${pvid}&isDebug=false&format=json`;

                log(`[Salcobrand] Calling API: ${url}`);

                const https = require('https');

                https.get(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': 'application/json'
                    }
                }, (res) => {
                    let data = '';

                    res.on('data', (chunk) => {
                        data += chunk;
                    });

                    res.on('end', () => {
                        try {
                            if (res.statusCode !== 200) {
                                log(`[Salcobrand] HTTP Error: ${res.statusCode}`);
                                return resolve([]);
                            }

                            const products = JSON.parse(data);
                            const results = [];

                            if (Array.isArray(products)) {
                                log(`[Salcobrand] API returned ${products.length} products`);
                                products.slice(0, 6).forEach((product, i) => {
                                    // Mapear los campos correctos del JSON RetailRocket
                                    results.push({
                                        id: `salcobrand-${product.ItemId || i}`,
                                        medicineName: product.Name || 'Producto sin nombre',
                                        medicineBrand: product.Vendor || 'Salcobrand',
                                        medicineType: 'Medicamento',
                                        medicineImage: product.PictureUrl || '',
                                        pharmacyName: 'Salcobrand',
                                        pharmacyLogo: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Salcobrand_logo.png',
                                        price: product.Price || 0,
                                        normalPrice: product.OldPrice || product.Price || 0,
                                        stock: true,
                                        url: product.Url || ''
                                    });
                                });
                            }

                            log(`[Salcobrand] Found ${results.length} results`);
                            resolve(results);
                        } catch (parseError) {
                            log(`[Salcobrand] Parse Error: ${parseError.message}`);
                            resolve([]);
                        }
                    });
                }).on('error', (error) => {
                    log(`[Salcobrand] Request Error: ${error.message}`);
                    resolve([]);
                }).setTimeout(15000, () => {
                    log(`[Salcobrand] Timeout`);
                    resolve([]);
                });

            } catch (error) {
                log(`[Salcobrand] Error: ${error.message}`);
                resolve([]);
            }
        });
    },

    ecofarmacias: async (query) => {
        log('[EcoFarmacias] Starting...');
        try {
            const url = `https://ecofarmacias.cl/?s=${encodeURIComponent(query)}&post_type=product`;
            const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const $ = cheerio.load(data);
            const results = [];

            $('.product').each((i, el) => {
                if (i > 5) return;
                const name = $(el).find('.woocommerce-loop-product__title').text().trim();

                let salePriceNode = $(el).find('.price ins .woocommerce-Price-amount bdi').first();
                let normalPriceNode = $(el).find('.price del .woocommerce-Price-amount bdi').first();
                let singlePriceNode = $(el).find('.price .woocommerce-Price-amount bdi').first();

                let salePriceVal = cleanPrice(salePriceNode.text());
                let normalPriceVal = cleanPrice(normalPriceNode.text());
                let singlePriceVal = cleanPrice(singlePriceNode.text());

                let price = salePriceVal || singlePriceVal || 0;
                let normalPrice = normalPriceVal || price;

                const image = $(el).find('img').attr('src');

                if (name && price) {
                    results.push({
                        id: `eco-${i}`,
                        medicineName: name,
                        medicineBrand: 'EcoFarmacias',
                        medicineType: 'Medicamento',
                        medicineImage: image,
                        pharmacyName: 'Farmacias Eco',
                        pharmacyLogo: 'https://ecofarmacias.cl/wp-content/uploads/2021/05/logo-eco.png',
                        price,
                        normalPrice,
                        stock: true
                    });
                }
            });
            log(`[EcoFarmacias] Found ${results.length} results`);
            return results;
        } catch (error) {
            log(`[EcoFarmacias] Error: ${error.message}`);
            return [];
        }
    }
};

app.get('/api/search', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query required' });

    log(`\n🔍 Searching for: ${q}`);
    log('Running: CruzVerde (Puppeteer), Salcobrand (API), EcoFarmacias');

    const promiseResults = await Promise.allSettled(Object.values(scrapers).map(s => s(q)));

    const results = promiseResults
        .filter(p => p.status === 'fulfilled')
        .flatMap(p => p.value)
        .sort((a, b) => a.price - b.price);

    log(`✅ Total: ${results.length} results\n`);
    res.json(results);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
