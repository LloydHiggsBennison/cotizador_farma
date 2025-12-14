const axios = require('axios');

async function testSalcobrandAPI() {
    console.log('🧪 Testing Salcobrand API...\n');

    try {
        // Obtener el término desde un input
        const query = process.argv[2] || 'paracetamol';

        if (!query) {
            console.error("❌ No se ingresó una palabra para buscar.");
            return;
        }

        const session = "68bdef6d7427bddf5be5f61a";
        const pvid = "362457347968736";

        // Construcción limpia de la URL
        const baseUrl = "https://api.retailrocket.net/api/2.0/recommendation/Search/602bba6097a5281b4cc438c9/";

        const url = `${baseUrl}?phrase=${encodeURIComponent(query)}&session=${session}&pvid=${pvid}&isDebug=false&format=json`;

        console.log("📡 Calling API:", url);
        console.log("");

        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "application/json"
            },
            timeout: 15000
        });

        console.log("✅ API Response:", data);

        if (Array.isArray(data) && data.length > 0) {
            console.log('📦 First product:');
            const product = data[0];
            console.log('  ItemId:', product.ItemId);
            console.log('  Name:', product.Name);
            console.log('  Vendor:', product.Vendor);
            console.log('  Price:', product.Price);
            console.log('  OldPrice:', product.OldPrice);
            console.log('  PictureUrl:', product.PictureUrl);
            console.log('  Url:', product.Url);
            console.log('');

            console.log('🎯 Mapped result:');
            const mapped = {
                id: `salcobrand-${product.ItemId}`,
                medicineName: product.Name || 'Producto sin nombre',
                medicineBrand: product.Vendor || 'Salcobrand',
                medicineType: 'Medicamento',
                medicineImage: product.PictureUrl || '',
                pharmacyName: 'Salcobrand',
                pharmacyLogo: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Salcobrand_logo.png',
                price: product.Price || 0,
                normalPrice: product.OldPrice || product.Price || 0,
                stock: true,
                url: product.Url || ''
            };
            console.log(JSON.stringify(mapped, null, 2));
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testSalcobrandAPI();
