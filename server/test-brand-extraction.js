// Helper function to extract brand/laboratory from product name
// Best practices for Chilean pharmacy products
function extractBrandFromName(name) {
    if (!name) return 'Genérico';

    const cleanName = name.trim();

    // Common patterns in Chilean pharmacy product names:
    // 1. "MARCA Formato Dosis" -> Extract MARCA
    // 2. "Marca (B) Nombre..." -> Extract Marca
    // 3. "Nombre generico Marca x cantidad" -> Extract Marca (harder)

    // Remove common prefixes/suffixes that aren't brands
    const nonBrands = /^(generico|medicamento|producto|farmaco)/i;

    // Split by common delimiters
    const words = cleanName.split(/\s+/);

    if (words.length === 0) return 'Genérico';

    // First word is usually the brand (unless it's a non-brand word)
    const firstWord = words[0];

    if (nonBrands.test(firstWord)) {
        // If first word is generic, try second word
        return words.length > 1 ? words[1] : 'Genérico';
    }

    return firstWord;
}

// Test cases
const testCases = [
    'Paracetamol 500Mg X 16 comprimidos',
    'PARACETAMOL COM. 500MG. 16 COMPRIMIDOS',
    'Kitadol (B) Paracetamol 500mg 24 Comprimidos',
    'Tapsin Limonada Noche (B) Paracetamol 5g',
    'TRAMADOL GOTAS 100 MG X 10 ML',
    'Ambroxol clorhidrato jarabe infantil15mg/5ml 100ml Ascend...',
    'EUFINDOL 50 mg x 10 comprimidos'
];

console.log('Testing brand extraction:\n');
testCases.forEach(name => {
    console.log(`Input:  "${name}"`);
    console.log(`Brand:  "${extractBrandFromName(name)}"`);
    console.log('---');
});
