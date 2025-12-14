const axios = require('axios');
const cheerio = require('cheerio');

const log = (message) => console.log(message);

async function scrapeAhumada(query) {
    log('[Farmacias Ahumada] Starting (Axios + Cheerio)...');

    try {
        const url = `https://www.farmaciasahumada.cl/search?q=${encodeURIComponent(query)}&search-button=&lang=null`;
        log(`[Farmacias Ahumada] Loading: ${url}`);

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

            // Extract brand
            const brandEl = $(el).find('.product-tile-brand .link, .product-tile-brand span').first();
            const brand = brandEl.text().trim();

            // Extract product description
            const descEl = $(el).find('.pdp-link .link, .pdp-link a').first();
            const description = descEl.text().trim();

            const name = description || brand || '';

            // Extract price
            const priceEl = $(el).find('.price .value, .sales .value, [class*="price"] .value').first();
            const priceText = priceEl.text().trim();
            const priceMatch = priceText.match(/[\d.]+/);
            const price = priceMatch ? parseInt(priceMatch[0].replace(/\./g, '')) : 0;

            // Extract image
            const imgEl = $(el).find('.tile-image img, a.tile-image img, .image-container img').first();
            const image = imgEl.attr('src') || imgEl.attr('data-src') || imgEl.attr('data-lazy') || '';

            // Extract product URL
            const linkEl = $(el).find('.pdp-link a, .pdp-link .link, a.pdp-link').first();
            const productUrl = linkEl.attr('href') || '';

            // Extract product ID
            const pid = $(el).attr('data-pid') || i;

            if (name && price > 0) {
                products.push({
                    id: `ahumada-${pid}`,
                    medicineName: name,
                    medicineBrand: brand || 'Genérico',
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

        log(`[Farmacias Ahumada] Found ${products.length} results`);
        return products;

    } catch (error) {
        log(`[Farmacias Ahumada] Error: ${error.message}`);
        return [];
    }
}

module.exports = scrapeAhumada;
