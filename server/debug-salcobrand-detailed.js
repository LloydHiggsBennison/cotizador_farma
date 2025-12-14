const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function debugSalcobrandDetailed() {
    console.log('🔍 Debugging Salcobrand (detailed extraction)...\n');

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    const url = 'https://salcobrand.cl/search_result?query=ambroxol';
    console.log(`📡 Loading: ${url}\n`);

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await new Promise(resolve => setTimeout(resolve, 3000));

    const analysis = await page.evaluate(() => {
        const products = document.querySelectorAll('.product');
        const firstProduct = products[0];

        if (!firstProduct) return { error: 'No products found' };

        return {
            productCount: products.length,
            firstProductHTML: firstProduct.outerHTML.substring(0, 2000),
            extractedData: {
                // Test all possible selectors
                imgTest: {
                    anyImg: firstProduct.querySelector('img') ? {
                        src: firstProduct.querySelector('img').getAttribute('src'),
                        alt: firstProduct.querySelector('img').getAttribute('alt'),
                        className: firstProduct.querySelector('img').className
                    } : null,
                    imgResponsive: firstProduct.querySelector('.img-responsive') ? {
                        src: firstProduct.querySelector('.img-responsive').getAttribute('src'),
                        alt: firstProduct.querySelector('.img-responsive').getAttribute('alt')
                    } : null,
                    productImage: firstProduct.querySelector('.product-image img') ? {
                        src: firstProduct.querySelector('.product-image img').getAttribute('src'),
                        alt: firstProduct.querySelector('.product-image img').getAttribute('alt')
                    } : null
                },
                nameTest: {
                    imgAlt: firstProduct.querySelector('img')?.getAttribute('alt'),
                    linkText: firstProduct.querySelector('a[href*="/products/"]')?.textContent.trim(),
                    infoName: firstProduct.querySelector('.info .name')?.textContent.trim(),
                    productNameClass: firstProduct.querySelector('[class*="product-name"]')?.textContent.trim()
                },
                price: {
                    priceClass: firstProduct.querySelector('.price')?.textContent.trim(),
                    amountClass: firstProduct.querySelector('.amount')?.textContent.trim()
                }
            }
        };
    });

    console.log('📦 Detailed analysis:');
    console.log(JSON.stringify(analysis, null, 2));

    const fs = require('fs');
    fs.writeFileSync('salcobrand-debug-detailed.json', JSON.stringify(analysis, null, 2));
    console.log('\n✅ Saved to salcobrand-debug-detailed.json');

    await browser.close();
}

debugSalcobrandDetailed().catch(console.error);
