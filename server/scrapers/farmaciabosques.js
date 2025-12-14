const axios = require('axios');
const cheerio = require('cheerio');

const log = (message) => console.log(message);

async function scrapeFarmaciaBosques(query) {
    log('[Farmacia Bosques] Starting (Axios + Cheerio)...');

    try {
        const url = `https://www.farmaciabosques.com/?s=${encodeURIComponent(query)}&post_type=product&dgwt_wcas=1`;
        log(`[Farmacia Bosques] Loading: ${url}`);

        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(data);
        const products = [];

        $('.product').each((i, el) => {
            if (i >= 6) return; // Limit to 6 products

            // Extract product name
            const nameEl = $(el).find('.woocommerce-loop-product__title, h2, h3').first();
            const name = nameEl.text().trim();

            // Extract price
            const priceEl = $(el).find('.price .woocommerce-Price-amount bdi, .price ins .amount, .price .amount').first();
            const priceText = priceEl.text().trim();
            const priceMatch = priceText.match(/[\d.]+/);
            const price = priceMatch ? parseInt(priceMatch[0].replace(/\./g, '')) : 0;

            // Extract image
            const imgEl = $(el).find('img').first();
            const image = imgEl.attr('src') || imgEl.attr('data-src') || '';

            // Extract product URL
            const linkEl = $(el).find('a.woocommerce-LoopProduct-link, a[href]').first();
            const productUrl = linkEl.attr('href') || '';

            if (name && price > 0) {
                products.push({
                    id: `bosques-${i}`,
                    medicineName: name,
                    medicineBrand: 'Farmacia Bosques',
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

        log(`[Farmacia Bosques] Found ${products.length} results`);
        return products;

    } catch (error) {
        log(`[Farmacia Bosques] Error: ${error.message}`);
        return [];
    }
}

module.exports = scrapeFarmaciaBosques;
