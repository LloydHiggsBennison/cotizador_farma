import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 20;

const ResultsGrid = ({ results, isSearching }) => {
    const [currentPage, setCurrentPage] = useState(1);

    // Reset to page 1 when results change
    useEffect(() => {
        setCurrentPage(1);
    }, [results]);

    if (isSearching) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-96 bg-slate-200 rounded-2xl"></div>
                ))}
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="inline-block p-6 rounded-full bg-slate-100 mb-4">
                    <span className="text-4xl">💊</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">Sin resultados</h3>
                <p className="text-slate-500">Intenta buscar otro medicamento como "Paracetamol" o "Ibuprofeno"</p>
            </div>
        );
    }

    // Pagination Logic
    const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentResults = results.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        // Scroll to very top of page
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Also ensure we're at the top (backup for compatibility)
        document.documentElement.scrollTop = 0;
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center px-2">
                <p className="text-slate-500">
                    Mostrando <span className="font-bold text-slate-800">{results.length}</span> resultados
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentResults.map((result) => (
                    <ProductCard key={result.id} result={result} />
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 py-8">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5 text-slate-600" />
                    </button>

                    <div className="flex items-center space-x-1">
                        {[...Array(totalPages)].map((_, i) => {
                            const page = i + 1;
                            // Show first, last, and pages around current
                            if (
                                page === 1 ||
                                page === totalPages ||
                                (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                                return (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`w-10 h-10 rounded-lg font-medium transition-all ${currentPage === page
                                            ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                            : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                );
                            } else if (
                                (page === currentPage - 2 && page > 1) ||
                                (page === currentPage + 2 && page < totalPages)
                            ) {
                                return <span key={page} className="text-slate-400 px-1">...</span>;
                            }
                            return null;
                        })}
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="h-5 w-5 text-slate-600" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ResultsGrid;
