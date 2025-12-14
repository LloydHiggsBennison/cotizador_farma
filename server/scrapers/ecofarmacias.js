const axios = require('axios');
const cheerio = require('cheerio');

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

async function scrapeEcoFarmacias(query) {
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
            const productUrl = $(el).find('a.woocommerce-LoopProduct-link, a[href]').first().attr('href') || '';

            if (name && price) {
                results.push({
                    id: `eco-${i}`,
                    medicineName: name,
                    medicineBrand: 'EcoFarmacias', // No laboratory data available
                    medicineType: 'Medicamento',
                    medicineImage: image,
                    pharmacyName: 'Farmacias Eco',
                    pharmacyLogo: 'https://ecofarmacias.cl/wp-content/uploads/2021/05/logo-eco.png',
                    price,
                    normalPrice,
                    stock: true,
                    productUrl
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

module.exports = scrapeEcoFarmacias;
