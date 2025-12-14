const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');
const path = require('path');

/**
 * Script to refresh Cruz Verde cookies
 * Run this manually or via cron/scheduler every 2-4 hours
 */

async function refreshCruzVerdeCookies() {
    console.log('🔄 Starting cookie refresh for Cruz Verde...');

    try {
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36');

        console.log('📡 Navigating to Cruz Verde...');
        await page.goto('https://www.cruzverde.cl', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Wait a bit for cookies to be set
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Get cookies
        const cookies = await page.cookies();

        // Format cookies as string
        const cookieString = cookies
            .map(cookie => `${cookie.name}=${cookie.value}`)
            .join('; ');

        // Save to file
        const cookiesData = {
            cruzverde: cookieString,
            lastUpdated: new Date().toISOString(),
            cookies: cookies // Also save raw for debugging
        };

        const cookiesPath = path.join(__dirname, 'cookies.json');
        fs.writeFileSync(cookiesPath, JSON.stringify(cookiesData, null, 2));

        console.log('✅ Cookies refreshed successfully!');
        console.log(`📝 Saved to: ${cookiesPath}`);
        console.log(`🕐 Last updated: ${cookiesData.lastUpdated}`);

        await browser.close();

        return cookiesData;

    } catch (error) {
        console.error('❌ Error refreshing cookies:', error.message);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    refreshCruzVerdeCookies()
        .then(() => {
            console.log('\n✨ Done! Cookies are ready to use.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Failed:', error.message);
            process.exit(1);
        });
}

module.exports = { refreshCruzVerdeCookies };
