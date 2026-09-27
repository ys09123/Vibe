import { useState } from 'react';
import CurrencyConverter from './components/CurrencyConverter';
import TrendChart from './components/TrendChart';
import TravelBudget from './components/TravelBudget';
import FavoritesList from './components/FavoritesList';
import ConversionHistory from './components/ConversionHistory';

function App() {
  const [currentPair, setCurrentPair] = useState({ from: 'USD', to: 'INR' });
  const [favoritesKey, setFavoritesKey] = useState(0);
  const [historyKey, setHistoryKey] = useState(0);
  const [travelOpen, setTravelOpen] = useState(false);

  const handleSelectPair = (source, target) => {
    setCurrentPair({ from: source, to: target });
  };

  const handleFavoriteAdded = () => {
    setFavoritesKey(prev => prev + 1);
  };

  const handleConversionDone = () => {
    setHistoryKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">💱 Currency Converter</h1>
          <button
            onClick={() => setTravelOpen(!travelOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              travelOpen
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>✈</span>
            <span className="hidden sm:inline">Travel Budget</span>
          </button>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <CurrencyConverter 
              currentPair={currentPair}
              onPairChange={setCurrentPair}
              onFavoriteAdded={handleFavoriteAdded}
              onConversionDone={handleConversionDone}
            />
            <TrendChart 
              baseCurrency={currentPair.from} 
              targetCurrency={currentPair.to} 
            />
          </div>
          
          {/* Right column (1/3 width) */}
          <div className="space-y-6">
            <FavoritesList 
              key={favoritesKey}
              onSelectPair={handleSelectPair} 
            />
            <ConversionHistory 
              key={historyKey}
              onSelectPair={handleSelectPair} 
            />
          </div>
        </div>
      </main>

      {/* Travel Budget Sidebar Overlay */}
      {travelOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 transition-opacity"
          onClick={() => setTravelOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          travelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">✈ Travel Budget</h2>
          <button
            onClick={() => setTravelOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-64px)]">
          <TravelBudget />
        </div>
      </div>
    </div>
  );
}

export default App;
