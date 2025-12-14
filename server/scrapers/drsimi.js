const axios = require('axios');
const cheerio = require('cheerio');

const log = (message) => console.log(message);

async function scrapeDrSimi(query) {
    log('[Dr. Simi] Starting (Axios + Cheerio)...');

    try {
        const url = `https://www.drsimi.cl/${encodeURIComponent(query)}?_q=${encodeURIComponent(query)}&map=ft`;
        log(`[Dr. Simi] Loading: ${url}`);

        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(data);
        const products = [];

        $('.vtex-search-result-3-x-galleryItem').each((i, el) => {
            if (i >= 6) return; // Limit to 6 products

            // Extract product name
            const nameEl = $(el).find('.vtex-product-summary-2-x-brandName, .vtex-product-summary-2-x-productBrand, [class*="productName"]').first();
            const name = nameEl.text().trim();

            // Extract price
            const priceEl = $(el).find('.vtex-product-price-1-x-sellingPrice, .vtex-product-price-1-x-currencyContainer, [class*="sellingPrice"]').first();
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
                    id: `drsimi-${i}`,
                    medicineName: name,
                    medicineBrand: 'Dr. Simi',
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

        log(`[Dr. Simi] Found ${products.length} results`);
        return products;

    } catch (error) {
        log(`[Dr. Simi] Error: ${error.message}`);
        return [];
    }
}

module.exports = scrapeDrSimi;
