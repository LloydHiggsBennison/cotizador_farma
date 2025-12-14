import React, { useState } from 'react';
import { ShoppingCart, Tag } from 'lucide-react';

const ProductCard = ({ result }) => {
    const [imageError, setImageError] = useState(false);
    const [logoError, setLogoError] = useState(false);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
    };

    // Extraer laboratorio/marca del producto
    const extractBrand = () => {
        // El backend envía el Vendor/Laboratorio en medicineBrand
        return result.medicineBrand || result.pharmacyName;
    };

    // Construir información de dosis y uso 
    const getDosageAndUsage = () => {
        if (!result.medicineName) return 'Medicamento';

        const name = result.medicineName;
        const parts = [];

        // 1. Usar campos de la API si existen
        if (result.size) {
            parts.push(result.size);
        } else if (result.formato) {
            parts.push(result.formato);
        } else {
            // 2. Extraer del nombre: dosis (mg, ml, g) y cantidad (comprimidos, ml)
            // Buscar patrones como: "50 mg", "100ml", "325/37,5", "x 30 comprimidos"
            const dosagePattern = /(\d+(?:[.,\/]\d+)?\s*(?:mg|ml|g|mcg))/gi;
            const dosages = name.match(dosagePattern);

            const quantityPattern = /(?:x\s*)?(\d+\s+(?:comprimidos?|tabletas?|cápsulas?|gotas?|ml))/i;
            const quantity = name.match(quantityPattern);

            if (dosages && dosages.length > 0) {
                parts.push(dosages.join('/'));
            }
            if (quantity) {
                parts.push(quantity[1]);
            }
        }

        // 3. Agregar categoría si existe
        if (result.medicineType && result.medicineType !== 'Medicamento') {
            parts.push(result.medicineType);
        }

        return parts.length > 0 ? parts.join(' • ') : 'Medicamento';
    };

    return (
        <div className="glass-panel rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group flex flex-col relative">
            {/* Pharmacy Badge - Now more prominent at the top */}
            <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start z-10">
                <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2">
                    {!logoError && result.pharmacyLogo ? (
                        <img
                            src={result.pharmacyLogo}
                            alt={result.pharmacyName}
                            className="h-6 object-contain"
                            onError={() => setLogoError(true)}
                        />
                    ) : (
                        <span className="text-xs font-bold text-slate-700">{result.pharmacyName}</span>
                    )}
                </div>
            </div>

            <div className="relative h-56 p-6 bg-white flex items-center justify-center pt-12">
                {!imageError ? (
                    <img
                        src={result.medicineImage}
                        alt={result.medicineName}
                        className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-slate-300">
                        <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                            <span className="text-4xl">💊</span>
                        </div>
                        <span className="text-sm font-medium">Imagen no disponible</span>
                    </div>
                )}
            </div>

            <div className="p-5 flex-1 flex flex-col bg-slate-50/50">
                <div className="mb-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                        <Tag className="w-3 h-3 mr-1.5" />
                        {extractBrand()}
                    </span>
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-1 leading-tight line-clamp-2" title={result.medicineName}>
                    {result.medicineName}
                </h3>
                <p className="text-sm text-slate-500 mb-4">{getDosageAndUsage()}</p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200/60">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Precio Internet</span>
                        <span className="text-2xl font-bold text-emerald-600">{formatPrice(result.price)}</span>
                    </div>

                    <button
                        onClick={() => result.productUrl && window.open(result.productUrl, '_blank', 'noopener,noreferrer')}
                        className="h-11 w-11 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 hover:scale-105 transition-all duration-200 shadow-lg shadow-primary/20 cursor-pointer"
                        title={result.productUrl ? "Ver en tienda" : "URL no disponible"}
                    >
                        <ShoppingCart className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
