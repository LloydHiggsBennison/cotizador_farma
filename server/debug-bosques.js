const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function debugBosques() {
    console.log('🔍 Debugging Farmacia Bosques HTML structure...\n');

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    const url = 'https://www.farmaciabosques.com/?s=ambroxol&post_type=product&dgwt_wcas=1';
    console.log(`📡 Loading: ${url}\n`);

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for dynamic content
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Extract product elements structure
    const products = await page.evaluate(() => {
        // Try multiple possible selectors for WooCommerce
        const selectors = [
            '.product',
            '.product-item',
            '.woocommerce-loop-product',
            '[class*="product"]',
            '.type-product',
            'li.product'
        ];

        for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                console.log(`Found ${elements.length} elements with: ${selector}`);

                const first = elements[0];
                return {
                    selector: selector,
                    count: elements.length,
                    outerHTML: first.outerHTML.substring(0, 1000),
                    className: first.className,
                    children: Array.from(first.children).map(child => ({
                        tag: child.tagName,
                        className: child.className,
                        text: child.textContent?.substring(0, 100)
                    }))
                };
            }
        }

        return { error: 'No products found' };
    });

    console.log('📦 Product structure:');
    console.log(JSON.stringify(products, null, 2));

    // Also write to file
    const fs = require('fs');
    fs.writeFileSync('bosques-structure.json', JSON.stringify(products, null, 2));
    console.log('\n✅ Structure saved to bosques-structure.json');

    await browser.close();
}

debugBosques().catch(console.error);
