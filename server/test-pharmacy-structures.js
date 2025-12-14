const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function testCruzVerde() {
    console.log('\n=== TESTING CRUZ VERDE ===\n');

    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
    const page = await browser.newPage();

    await page.goto('https://www.cruzverde.cl/search?query=paracetamol', {
        waitUntil: 'domcontentloaded',
        timeout: 20000
    });

    await new Promise(r => setTimeout(r, 3000));

    const data = await page.evaluate(() => {
        const el = document.querySelector('ml-new-card-product');
        if (!el) return { error: 'No product found' };

        return {
            html: el.innerHTML.substring(0, 1000),
            attributes: Array.from(el.attributes).map(a => `${a.name}="${a.value}"`),
            allText: el.textContent.substring(0, 500)
        };
    });

    console.log('Cruz Verde product data:', JSON.stringify(data, null, 2));

    await browser.close();
}

async function testEcoFarmacias() {
    console.log('\n=== TESTING ECOFARMACIAS ===\n');

    const axios = require('axios');
    const cheerio = require('cheerio');

    const { data } = await axios.get('https://ecofarmacias.cl/?s=paracetamol&post_type=product');
    const $ = cheerio.load(data);

    const product = $('.product').first();
    console.log('Product HTML snippet:', product.html().substring(0, 800));
    console.log('\nProduct title:', product.find('.woocommerce-loop-product__title').text());
    console.log('All classes:', product.attr('class'));
}

async function testDrSimi() {
    console.log('\n=== TESTING DR. SIMI ===\n');

    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
    const page = await browser.newPage();

    await page.goto('https://www.drsimi.cl/paracetamol?_q=paracetamol&map=ft', {
        waitUntil: 'domcontentloaded',
        timeout: 20000
    });

    await new Promise(r => setTimeout(r, 3000));

    const data = await page.evaluate(() => {
        const el = document.querySelector('.vtex-search-result-3-x-galleryItem');
        if (!el) return { error: 'No product found' };

        return {
            html: el.innerHTML.substring(0, 1000),
            brandName: el.querySelector('.vtex-product-summary-2-x-brandName')?.textContent,
            productBrand: el.querySelector('.vtex-product-summary-2-x-productBrand')?.textContent,
            allClasses: Array.from(el.querySelectorAll('[class*="brand"], [class*="vendor"], [class*="manufacturer"]')).map(e => ({
                class: e.className,
                text: e.textContent.substring(0, 100)
            }))
        };
    });

    console.log('Dr. Simi product data:', JSON.stringify(data, null, 2));

    await browser.close();
}

async function testFarmaciaBosques() {
    console.log('\n=== TESTING FARMACIA BOSQUES ===\n');

    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
    const page = await browser.newPage();

    await page.goto('https://www.farmaciabosques.com/?s=paracetamol&post_type=product&dgwt_wcas=1', {
        waitUntil: 'domcontentloaded',
        timeout: 20000
    });

    await new Promise(r => setTimeout(r, 3000));

    const data = await page.evaluate(() => {
        const el = document.querySelector('.product');
        if (!el) return { error: 'No product found' };

        return {
            html: el.innerHTML.substring(0, 1000),
            title: el.querySelector('.woocommerce-loop-product__title')?.textContent,
            allClasses: el.className,
            brandElements: Array.from(el.querySelectorAll('[class*="brand"], [class*="vendor"], [class*="manufacturer"]')).map(e => ({
                class: e.className,
                text: e.textContent
            }))
        };
    });

    console.log('Farmacia Bosques product data:', JSON.stringify(data, null, 2));

    await browser.close();
}

// Run all tests
(async () => {
    try {
        await testCruzVerde();
        await testEcoFarmacias();
        await testDrSimi();
        await testFarmaciaBosques();
    } catch (error) {
        console.error('Error:', error.message);
    }
})();
