import React, { useState, useEffect } from 'react';
import SearchInput from './components/SearchInput';
import ResultsGrid from './components/ResultsGrid';
import LoadingProgress from './components/LoadingProgress';
import { searchMedicines } from './services/pharmacyService';
import { Pill } from 'lucide-react';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (query.trim().length >= 3) {
      setIsLoading(true);
      setHasSearched(true);
      try {
        const data = await searchMedicines(query);
        setResults(data);
      } catch (error) {
        console.error("Error searching medicines:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-50 relative overflow-hidden">
      {/* Clean professional background */}
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-blue-100/40 to-transparent -z-10"></div>

      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-md mb-6 border border-slate-100">
            <Pill className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-2xl font-bold text-slate-800">
              FarmaciaCompare
            </h1>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 tracking-tight">
            Cotiza tus remedios <br />
            <span className="text-primary">al mejor precio</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Compara precios en tiempo real de las principales farmacias de Chile.
            <br />
            Encuentra lo que necesitas, al precio que mereces.
          </p>
        </header>

        <section className="mb-12">
          <SearchInput
            value={query}
            onChange={setQuery}
            onSearch={handleSearch}
            isLoading={isLoading}
          />

          {/* Disclaimer */}
          <div className="max-w-2xl mx-auto mt-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-blue-800 leading-relaxed">
                <strong className="font-semibold">Información importante:</strong> Los precios presentados en la web son obtenidos de las páginas oficiales en tiempo real, los precios pueden variar al comprar presencialmente.
              </p>
            </div>
          </div>
        </section>

        <section>
          {hasSearched || results.length > 0 ? (
            <ResultsGrid results={results} isSearching={false} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-12 opacity-50">
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-slate-200 rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2 mx-auto"></div>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-slate-200 rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2 mx-auto"></div>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-slate-200 rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Loading Modal - Renders on top */}
      {isLoading && <LoadingProgress />}
    </div>
  );
}

export default App;
