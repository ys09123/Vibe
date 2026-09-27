import { useState } from 'react';
import CurrencySelector from './CurrencySelector';
import ErrorMessage from './ErrorMessage';
import { api } from '../services/api';

const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'INR', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 
  'NZD', 'MXN', 'SGD', 'HKD', 'NOK', 'KRW', 'TRY', 'RUB', 'BRL', 'ZAR'
];

export default function TravelBudget() {
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [amount, setAmount] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCalculate = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await api.calculateTravelBudget(baseCurrency, parseFloat(amount));
      setResults(data);
    } catch (err) {
      setError(err.message || 'Failed to calculate travel budget');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <p className="text-sm text-gray-500">
        See how your budget converts across major global currencies.
      </p>

      <ErrorMessage message={error} onDismiss={() => setError(null)} />
      
      <div className="space-y-3">
        <CurrencySelector 
          label="Base Currency"
          value={baseCurrency} 
          onChange={setBaseCurrency}
          currencies={CURRENCIES} 
        />
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Total Budget</label>
          <input 
            type="number" 
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter total budget"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <button 
        onClick={handleCalculate}
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
      >
        {loading ? 'Calculating...' : 'Calculate'}
      </button>

      {results.length > 0 && (
        <div className="space-y-2 pt-2">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Budget Equivalents</h3>
          <div className="divide-y divide-gray-100">
            {results.map((res) => (
              <div key={res.currency} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">{res.currency}</span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {res.symbol}{res.equivalent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
