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
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-800">💱 Currency Converter</h1>
        </div>
      </header>
      
      {/* Main content: 2-column grid */}
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
            <TravelBudget />
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
    </div>
  );
}

export default App;
