const axios = require('axios');

async function testCruzVerdeAPI() {
    console.log('🧪 Testing Cruz Verde API...\n');

    try {
        // Obtener el término desde un input
        const query = process.argv[2] || 'paracetamol';

        if (!query) {
            console.error("❌ No se ingresó una palabra para buscar.");
            return;
        }

        // Construcción limpia de la URL
        const baseUrl = "https://api.cruzverde.cl/product-service/products/search";

        const url = `${baseUrl}?limit=12&offset=0&sort=&q=${encodeURIComponent(query)}&isAndes=true&inventoryId=zona51&inventoryZone=zona51`;

        console.log("📡 Calling API:", url);
        console.log("");

        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
                "Accept": "application/json, text/plain, */*",
                "Accept-Language": "es-CL,es;q=0.9,en;q=0.8",
                "Origin": "https://www.cruzverde.cl",
                "Referer": "https://www.cruzverde.cl/",
                "Cookie": "visid_incap_3139068=urbDeCK4RvKlcZR9N46PgH20M2kAAAAAQUIPAAAAAAB8pshcOtTJoWMuDNQzjfGo; _gcl_au=1.1.510357888.1764996222; _ga=GA1.1.1435293757.1764996222; _fbp=fb.1.1764996222048.2024275444; visid_incap_3140215=qNgSqQYzS9mlbPTd6JPhQ360M2kAAAAAQUIPAAAAAADkEyYrURFuHGHPnsp7ZL9m; _tt_enable_cookie=1; _ttp=01KBRZJ4B7G4V79S3ZJPJB6RSH_.tt.1; _hjSessionUser_1614665=eyJpZCI6IjQzMDUwZWEzLThlYTEtNWMxMC1iZWZiLThiODhkOTNiNTBjOSIsImNyZWF0ZWQiOjE3NjQ5OTYyMjMzNjEsImV4aXN0aW5nIjp0cnVlfQ==; nlbi_3139068=3nNsSNDjY0Ndpevp2rCdXQAAAADDGxmbxOUTScAu0HOIm9C6; incap_ses_529_3139068=+qOQCUQEwjR5Y0QNEmNXB2YGNWkAAAAAmZYwPZA1eBMB18amIJmNaA==; _hjSession_1614665=eyJpZCI6IjZiMTljYzg3LThiYTEtNGY3Yi04YWIyLTgyMzZmZGRlMzI5MCIsImMiOjE3NjUwODI3MjYzODUsInMiOjAsInIiOjAsInNiIjowLCJzciI6MCwic2UiOjAsImZzIjowLCJzcCI6MX0=; nlbi_3140215=gf1qAThuOlG/z2SNxkkkqQAAAACk+68OWIxMxr+XUV3gSwqA; incap_ses_529_3140215=6cvVQk5PzFsKZEQNEmNXB2YGNWkAAAAArbq7gcM6qdedzynebklJ5Q==; ttcsid=1765082727022::AswilbaDAaVL8oQ_jjrc.3.1765082727258.0; ttcsid_D0EEUDRC77UCMMV6IDS0=1765082727022::UnNYAtUSMDEVI9he2z8t.3.1765082727258.0; connect.sid=s%3Acruzverde-1ab2dda3-8779-4fee-b26c-948ee6ac9e64.prscPxlJKH1OEMV%2BCRZ9gAZdzPBS1gofb2cu8bGtzXQ; _ga_CVCL=GS2.1.s1765082726$o3$g1$t1765082733$j53$l0$h153940358; _ga_GMKXQPNSW5=GS2.1.s1765082726$o3$g1$t1765082733$j53$l0$h1114808124",
                "sec-ch-ua": "\"Chromium\";v=\"142\", \"Google Chrome\";v=\"142\", \"Not_A Brand\";v=\"99\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site"
            },
            timeout: 15000
        });

        console.log("✅ API Response received!");
        console.log(`   Total products: ${data.products?.length || 0}`);
        console.log(`   Total results: ${data.totalResults || 0}`);

        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
            console.log(`\n📦 Found ${data.products.length} products`);
            console.log('\nFirst product:');
            const product = data.products[0];
            console.log('  Name:', product.name || product.productName);
            console.log('  Brand:', product.brand);
            console.log('  Unit Price:', product.prices?.unitPrice);
            console.log('  List Price:', product.prices?.listPrice);
            console.log('  Base Price:', product.prices?.basePrice);
            console.log('  Image:', product.images?.[0]?.url);
            console.log('');

            console.log('🎯 Mapped result:');
            const price = product.prices?.unitPrice || product.prices?.basePrice || product.price || 0;
            const normalPrice = product.prices?.listPrice || price;
            const image = product.images?.[0]?.url || product.image || '';

            const mapped = {
                id: `cruzverde-${product.code || 0}`,
                medicineName: product.name || product.productName || 'Producto',
                medicineBrand: product.brand || 'Cruz Verde',
                medicineType: 'Medicamento',
                medicineImage: image.startsWith('http') ? image : `https://www.cruzverde.cl${image}`,
                pharmacyName: 'Cruz Verde',
                pharmacyLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Cruz_Verde_logo.svg/2560px-Cruz_Verde_logo.svg.png',
                price: typeof price === 'number' ? price : parseInt(price) || 0,
                normalPrice: typeof normalPrice === 'number' ? normalPrice : parseInt(normalPrice) || price,
                stock: true
            };
            console.log(JSON.stringify(mapped, null, 2));
        } else {
            console.log("⚠️ No products found in response");
        }

    } catch (error) {
        console.error("❌ API error:", error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testCruzVerdeAPI();
