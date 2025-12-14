const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function debugCruzVerde() {
    console.log('🔍 Debugging Cruz Verde products...\n');

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    const url = 'https://www.cruzverde.cl/search?query=paracetamol';
    console.log(`📡 Loading: ${url}\n`);

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait longer for products to load
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Try to extract products
    const products = await page.evaluate(() => {
        // List all custom element tags
        const allElements = document.querySelectorAll('*');
        const customTags = new Set();

        allElements.forEach(el => {
            if (el.tagName.includes('-')) {
                customTags.add(el.tagName.toLowerCase());
            }
        });

        // Find the most promising custom tag for products
        const productTags = Array.from(customTags).filter(tag =>
            tag.includes('product') || tag.includes('card') || tag.includes('item')
        );

        const result = {
            allCustomTags: Array.from(customTags),
            productRelatedTags: productTags,
            samples: {}
        };

        // Try each product-related tag
        productTags.forEach(tag => {
            const elements = document.querySelectorAll(tag);
            if (elements.length > 0 && elements.length < 20) {
                result.samples[tag] = {
                    count: elements.length,
                    firstElement: elements[0].outerHTML.substring(0, 1000)
                };
            }
        });

        return result;
    });

    console.log('📦 Custom elements found:');
    console.log(JSON.stringify(products, null, 2));

    const fs = require('fs');
    fs.writeFileSync('cruzverde-custom-elements.json', JSON.stringify(products, null, 2));
    console.log('\n✅ Saved to cruzverde-custom-elements.json');

    await browser.close();
}

debugCruzVerde().catch(console.error);
