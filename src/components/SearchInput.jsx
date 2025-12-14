import React from 'react';
import { Search } from 'lucide-react';

const SearchInput = ({ value, onChange, onSearch, isLoading }) => {
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && value.trim().length >= 3) {
            onSearch();
        }
    };

    return (
        <div className="relative max-w-2xl mx-auto w-full group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Search className={`h-6 w-6 ${isLoading ? 'text-primary animate-pulse' : 'text-slate-400 group-focus-within:text-primary'} transition-colors duration-300`} />
            </div>
            <input
                type="text"
                className="input-premium pl-16 pr-28"
                placeholder="Busca un medicamento (ej. Paracetamol)..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyPress={handleKeyPress}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
                {isLoading && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                )}
                <button
                    onClick={onSearch}
                    disabled={value.trim().length < 3 || isLoading}
                    className="px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                >
                    Buscar
                </button>
            </div>
        </div>
    );
};

export default SearchInput;
