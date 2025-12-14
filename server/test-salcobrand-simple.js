const scrapeSalcobrand = require('./scrapers/salcobrand');

// Test con diferentes queries
const query = process.argv[2] || 'paracetamol';

console.log(`\n🧪 Testing Salcobrand API-Only with: "${query}"`);
console.log('='.repeat(60));

scrapeSalcobrand(query)
    .then(products => {
        console.log(`\n✅ Success! Found ${products.length} products\n`);

        products.forEach((product, i) => {
            console.log(`${i + 1}. ${product.medicineName}`);
            console.log(`   Precio: $${product.price} (Normal: $${product.normalPrice})`);
            console.log(`   Tipo: ${product.medicineType}`);
            if (product.formato) console.log(`   Formato: ${product.formato}`);
            if (product.size) console.log(`   Tamaño: ${product.size}`);
            console.log(`   Imagen: ${product.medicineImage.substring(0, 50)}...`);
            console.log('');
        });

        console.log('='.repeat(60));
        console.log(`Total: ${products.length} productos encontrados`);
    })
    .catch(error => {
        console.error('❌ Error:', error.message);
    });
