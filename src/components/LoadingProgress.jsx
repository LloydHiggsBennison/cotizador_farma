import React, { useState, useEffect } from 'react';
import { Loader2, Check } from 'lucide-react';

const pharmacies = [
    { name: 'Salcobrand', color: 'text-blue-600' },
    { name: 'Cruz Verde', color: 'text-green-600' },
    { name: 'Farmacias Eco', color: 'text-emerald-600' },
    { name: 'Farmacias Ahumada', color: 'text-orange-600' },
    { name: 'Dr. Simi', color: 'text-purple-600' },
    { name: 'Farmacia Bosques', color: 'text-teal-600' }
];

const LoadingProgress = () => {
    const [completedPharmacies, setCompletedPharmacies] = useState([]);
    const [currentPharmacy, setCurrentPharmacy] = useState(0);

    useEffect(() => {
        // Simulate progressive loading
        const intervals = [800, 1200, 600, 1400, 1000, 1100];

        const timers = [];

        pharmacies.forEach((pharmacy, index) => {
            const delay = intervals.slice(0, index).reduce((sum, val) => sum + val, 0);

            const timer = setTimeout(() => {
                setCurrentPharmacy(index);
                setTimeout(() => {
                    setCompletedPharmacies(prev => [...prev, index]);
                }, intervals[index] - 200);
            }, delay);

            timers.push(timer);
        });

        return () => timers.forEach(timer => clearTimeout(timer));
    }, []);

    return (
        // Modal overlay with backdrop
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="flex flex-col items-center justify-center space-y-8 bg-white rounded-3xl p-8 shadow-2xl max-w-lg w-full mx-4 animate-scaleIn">
                {/* Main spinner */}
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-blue-200 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                </div>

                {/* Title */}
                <div className="text-center">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                        Obteniendo precios...
                    </h3>
                    <p className="text-slate-500">Consultando farmacias en tiempo real</p>
                </div>

                {/* Pharmacy progress list */}
                <div className="bg-slate-50 rounded-2xl p-6 w-full border border-slate-200">
                    <div className="space-y-3">
                        {pharmacies.map((pharmacy, index) => {
                            const isCompleted = completedPharmacies.includes(index);
                            const isCurrent = currentPharmacy === index && !isCompleted;

                            return (
                                <div
                                    key={pharmacy.name}
                                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${isCurrent ? 'bg-blue-50 border border-blue-200' :
                                            isCompleted ? 'bg-green-50 border border-green-200' :
                                                'bg-white border border-slate-200'
                                        }`}
                                >
                                    <div className="flex-shrink-0">
                                        {isCompleted ? (
                                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                        ) : isCurrent ? (
                                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                        ) : (
                                            <div className="w-6 h-6 border-2 border-slate-300 rounded-full"></div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <p className={`font-medium ${isCompleted ? 'text-green-700' :
                                                isCurrent ? 'text-primary' :
                                                    'text-slate-400'
                                            }`}>
                                            {pharmacy.name}
                                        </p>
                                    </div>

                                    {isCurrent && (
                                        <span className="text-xs text-primary font-medium">
                                            Consultando...
                                        </span>
                                    )}
                                    {isCompleted && (
                                        <span className="text-xs text-green-600 font-medium">
                                            ✓
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingProgress;
