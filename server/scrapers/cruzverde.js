const axios = require('axios');
const cheerio = require('cheerio');

const log = (message) => console.log(message);

async function scrapeCruzVerde(query) {
    log('[Cruz Verde] Starting (Axios + Cheerio)...');

    try {
        const url = `https://www.cruzverde.cl/search?query=${encodeURIComponent(query)}`;
        log(`[Cruz Verde] Loading: ${url}`);

        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(data);
        const products = [];

        $('ml-new-card-product').each((i, el) => {
            if (i >= 6) return; // Limit to 6 products

            // Extract product name
            const nameEl = $(el).find('[class*="name"], [class*="title"], h2, h3').first();
            const name = nameEl.text().trim();

            // Extract laboratory/brand
            const brandEl = $(el).find('p.text-gray-dark.italic.uppercase, p.italic.uppercase').first();
            const brand = brandEl.text().trim() || 'Genérico';

            // Extract price
            const priceEl = $(el).find('ml-price-tag-v2, [class*="price"]').first();
            const priceText = priceEl.text().trim();
            const priceMatch = priceText.match(/[\d.]+/);
            const price = priceMatch ? parseInt(priceMatch[0].replace(/\./g, '')) : 0;

            // Extract image
            const imgEl = $(el).find('img').first();
            const image = imgEl.attr('src') || imgEl.attr('data-src') || '';

            // Extract product URL
            const linkEl = $(el).find('a[href]').first();
            const productUrl = linkEl.attr('href') || '';

            if (name && price > 0) {
                products.push({
                    id: `cruzverde-${i}`,
                    medicineName: name,
                    medicineBrand: brand,
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

        log(`[Cruz Verde] Found ${products.length} results`);
        return products;

    } catch (error) {
        log(`[Cruz Verde] Error: ${error.message}`);
        return [];
    }
}

module.exports = scrapeCruzVerde;
