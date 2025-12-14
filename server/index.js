const express = require('express');
const cors = require('cors');

// Import all pharmacy scrapers
const scrapeCruzVerde = require('./scrapers/cruzverde');
const scrapeSalcobrand = require('./scrapers/salcobrand');
const scrapeEcoFarmacias = require('./scrapers/ecofarmacias');
const scrapeAhumada = require('./scrapers/ahumada');
const scrapeDrSimi = require('./scrapers/drsimi');
const scrapeFarmaciaBosques = require('./scrapers/farmaciabosques');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const log = (message) => console.log(message);

// Scrapers object for easy management
const scrapers = {
    cruzverde: scrapeCruzVerde,
    salcobrand: scrapeSalcobrand,
    ecofarmacias: scrapeEcoFarmacias,
    ahumada: scrapeAhumada,
    drsimi: scrapeDrSimi,
    bosques: scrapeFarmaciaBosques
};

// Main search endpoint
app.get('/api/search', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query required' });

    log(`\n🔍 Searching for: ${q}`);
    log('\nRunning: Cruz Verde, Salcobrand (API Only), EcoFarmacias, Ahumada, Dr. Simi, Farmacia Bosques\n');

    // Run all scrapers in parallel
    const scraperNames = Object.keys(scrapers);
    const promiseResults = await Promise.allSettled(Object.values(scrapers).map(scraper => scraper(q)));

    // Process results with detailed logging
    const allResults = promiseResults
        .map((p, index) => {
            const scraperName = scraperNames[index];
            if (p.status === 'fulfilled') {
                const count = p.value.length;
                log(`✅ ${scraperName}: ${count} products`);
                if (count > 0 && scraperName === 'salcobrand') {
                    log(`   First product: ${p.value[0].medicineName}`);
                }
                return p.value;
            } else {
                log(`❌ ${scraperName} failed: ${p.reason?.message || 'Unknown error'}`);
                return [];
            }
        })
        .flat()
        .sort((a, b) => a.price - b.price);

    // Count by pharmacy
    const byPharmacy = {};
    allResults.forEach(product => {
        byPharmacy[product.pharmacyName] = (byPharmacy[product.pharmacyName] || 0) + 1;
    });

    log('\n📊 Products by pharmacy:');
    Object.entries(byPharmacy).forEach(([name, count]) => {
        log(`   ${name}: ${count}`);
    });

    log(`\n✅ Total: ${allResults.length} results\n`);
    res.json(allResults);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', scrapers: Object.keys(scrapers) });
});

app.listen(PORT, () => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 Cotizador Farmacias Server`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Available scrapers: ${Object.keys(scrapers).join(', ')}`);
    console.log(`${'='.repeat(60)}\n`);
});
