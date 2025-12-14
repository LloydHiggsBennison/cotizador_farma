const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function debugSalcobrand() {
    console.log('🔍 Debugging Salcobrand HTML structure...\n');

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    const url = 'https://salcobrand.cl/search_result?query=paracetamol';
    console.log(`📡 Loading: ${url}\n`);

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for dynamic content
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Extract product elements structure
    const analysis = await page.evaluate(() => {
        // Try multiple possible selectors
        const potentialSelectors = [
            '[class*="product"]',
            '[class*="card"]',
            '[class*="item"]',
            '.product',
            '.product-card',
            'article'
        ];

        const results = {
            selectors: {},
            customElements: []
        };

        // Check each selector
        potentialSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0 && elements.length < 50) {
                results.selectors[selector] = {
                    count: elements.length,
                    sample: {
                        html: elements[0].outerHTML.substring(0, 800),
                        className: elements[0].className
                    }
                };
            }
        });

        // Look for custom elements
        const allElements = document.querySelectorAll('*');
        const customTags = new Set();

        allElements.forEach(el => {
            if (el.tagName.includes('-') &&
                (el.tagName.toLowerCase().includes('product') ||
                    el.tagName.toLowerCase().includes('card'))) {
                customTags.add(el.tagName.toLowerCase());
            }
        });

        results.customElements = Array.from(customTags);

        return results;
    });

    console.log('📦 Analysis:');
    console.log(JSON.stringify(analysis, null, 2));

    const fs = require('fs');
    fs.writeFileSync('salcobrand-structure.json', JSON.stringify(analysis, null, 2));
    console.log('\n✅ Saved to salcobrand-structure.json');

    await browser.close();
}

debugSalcobrand().catch(console.error);
