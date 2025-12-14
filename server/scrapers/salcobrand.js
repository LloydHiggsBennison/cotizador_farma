const https = require('https');

const log = (message) => console.log(message);

async function scrapeSalcobrand(query) {
    log('[Salcobrand] Starting (API Only)...');

    return new Promise((resolve) => {
        try {
            const session = "68bdef6d7427bddf5be5f61a";
            const pvid = "362457347968736";
            const url = `https://api.retailrocket.net/api/2.0/recommendation/Search/602bba6097a5281b4cc438c9/?&phrase=${encodeURIComponent(query)}&session=${session}&pvid=${pvid}&isDebug=false&format=json`;

            log(`[Salcobrand] Calling API: ${url}`);

            https.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json'
                }
            }, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    try {
                        if (res.statusCode !== 200) {
                            log(`[Salcobrand] HTTP Error: ${res.statusCode}`);
                            return resolve([]);
                        }

                        const products = JSON.parse(data);
                        const results = [];

                        if (Array.isArray(products)) {
                            // Procesar hasta 6 productos
                            products.forEach((product, i) => {
                                // Validar que tenga los campos necesarios
                                if (product.Name && product.Price) {
                                    const productName = product.Name.toLowerCase();
                                    const searchTerm = query.toLowerCase();

                                    // Filtro de relevancia: el nombre debe contener la palabra buscada
                                    if (productName.includes(searchTerm)) {
                                        results.push({
                                            id: `salcobrand-${i}`,
                                            medicineName: product.Name,
                                            medicineBrand: product.Vendor || 'Genérico', // Laboratorio/Fabricante
                                            medicineType: product.CategoryNames ? product.CategoryNames[0] : 'Medicamento',
                                            medicineImage: product.PictureUrl || '',
                                            pharmacyName: 'Salcobrand',
                                            pharmacyLogo: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Salcobrand_logo.png',
                                            price: product.Price,
                                            normalPrice: product.OldPrice || product.Price,
                                            stock: true,
                                            productUrl: product.Url || '',
                                            // Campos adicionales de la API
                                            formato: product.Formato || '',
                                            size: product.Size || ''
                                        });
                                    }
                                }
                            });

                            // Limitar a 6 productos después del filtro
                            results.splice(6);
                        }

                        log(`[Salcobrand] Found ${results.length} relevant products from API`);
                        resolve(results);
                    } catch (parseError) {
                        log(`[Salcobrand] Parse Error: ${parseError.message}`);
                        resolve([]);
                    }
                });
            }).on('error', (error) => {
                log(`[Salcobrand] Request Error: ${error.message}`);
                resolve([]);
            }).setTimeout(10000, () => {
                log(`[Salcobrand] Timeout`);
                resolve([]);
            });
        } catch (error) {
            log(`[Salcobrand] Error: ${error.message}`);
            resolve([]);
        }
    });
}

module.exports = scrapeSalcobrand;
