/**
 * Client-side iframe-based scraper for Cruz Verde
 * Bypasses backend authentication by using user's browser cookies
 */

const scrapeCruzVerdeIframe = async (query) => {
    return new Promise((resolve, reject) => {
        console.log('[Cruz Verde Iframe] Starting scrape for:', query);

        // Create hidden iframe
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';

        const url = `https://www.cruzverde.cl/search?query=${encodeURIComponent(query)}`;

        let timeoutId;

        // Cleanup function
        const cleanup = () => {
            clearTimeout(timeoutId);
            if (iframe.parentNode) {
                document.body.removeChild(iframe);
            }
        };

        // Set timeout (30 seconds max)
        timeoutId = setTimeout(() => {
            console.log('[Cruz Verde Iframe] Timeout');
            cleanup();
            resolve([]); // Return empty on timeout
        }, 30000);

        // Listen for iframe load
        iframe.onload = () => {
            try {
                console.log('[Cruz Verde Iframe] Page loaded, extracting data...');

                // Try to access iframe content
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

                if (!iframeDoc) {
                    throw new Error('Cannot access iframe document');
                }

                // Wait a bit for JavaScript to render
                setTimeout(() => {
                    try {
                        const results = [];

                        // Try multiple possible selectors
                        const productSelectors = [
                            '.product-tile',
                            '.product-item',
                            '[data-testid*="product"]',
                            '.product-card'
                        ];

                        let products = null;
                        for (const selector of productSelectors) {
                            const elements = iframeDoc.querySelectorAll(selector);
                            if (elements.length > 0) {
                                products = elements;
                                console.log(`[Cruz Verde Iframe] Found ${elements.length} products with selector: ${selector}`);
                                break;
                            }
                        }

                        if (!products || products.length === 0) {
                            console.log('[Cruz Verde Iframe] No products found');
                            cleanup();
                            resolve([]);
                            return;
                        }

                        // Extract data from products
                        Array.from(products).slice(0, 6).forEach((product, i) => {
                            try {
                                const nameEl = product.querySelector('.pdp-link, .product-name, h3, [class*="name"]');
                                const priceEl = product.querySelector('.sales .value, .price, [class*="price"]');
                                const imageEl = product.querySelector('img');

                                const name = nameEl?.innerText?.trim();
                                const priceText = priceEl?.innerText?.trim();
                                const image = imageEl?.src;

                                // Clean price
                                let price = 0;
                                if (priceText) {
                                    const match = priceText.match(/\$[\s]?(\d{1,3}(\.\d{3})*)/);
                                    if (match) {
                                        price = parseInt(match[1].replace(/[^\d]/g, ''));
                                    }
                                }

                                if (name && price) {
                                    results.push({
                                        id: `cruzverde-iframe-${i}`,
                                        medicineName: name,
                                        medicineBrand: 'Cruz Verde',
                                        medicineType: 'Medicamento',
                                        medicineImage: image || '',
                                        pharmacyName: 'Cruz Verde',
                                        pharmacyLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Cruz_Verde_logo.svg/2560px-Cruz_Verde_logo.svg.png',
                                        price: price,
                                        normalPrice: price,
                                        stock: true
                                    });
                                }
                            } catch (err) {
                                console.warn('[Cruz Verde Iframe] Error parsing product:', err);
                            }
                        });

                        console.log(`[Cruz Verde Iframe] Extracted ${results.length} results`);
                        cleanup();
                        resolve(results);

                    } catch (error) {
                        console.error('[Cruz Verde Iframe] Error extracting data:', error);
                        cleanup();
                        resolve([]);
                    }
                }, 2000); // Wait 2 seconds for JS to render

            } catch (error) {
                console.error('[Cruz Verde Iframe] Error accessing iframe:', error);
                cleanup();
                resolve([]);
            }
        };

        // Handle iframe error
        iframe.onerror = (error) => {
            console.error('[Cruz Verde Iframe] Load error:', error);
            cleanup();
            resolve([]);
        };

        // Add iframe to page and start loading
        document.body.appendChild(iframe);
        iframe.src = url;

        console.log('[Cruz Verde Iframe] Loading:', url);
    });
};

export default scrapeCruzVerdeIframe;
