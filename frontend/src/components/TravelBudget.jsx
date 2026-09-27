import React, { useState } from 'react';
import CurrencySelector from './CurrencySelector';
import ErrorMessage from './ErrorMessage';
import { api } from '../services/api';

const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'INR', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 
  'NZD', 'MXN', 'SGD', 'HKD', 'NOK', 'KRW', 'TRY', 'RUB', 'BRL', 'ZAR'
];

export default function TravelBudget() {
  const [enabled, setEnabled] = useState(false);
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
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setEnabled(!enabled)}
      >
        <h2 className="text-lg font-semibold text-gray-800">✈ Travel Budget Mode</h2>
        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-blue-600' : 'bg-gray-200'}`}>
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </div>
      </div>

      {enabled && (
        <div className="p-6 border-t border-gray-100">
          <ErrorMessage message={error} onDismiss={() => setError(null)} />
          
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <CurrencySelector 
                label="Base Currency"
                value={baseCurrency} 
                onChange={setBaseCurrency}
                currencies={CURRENCIES} 
              />
            </div>
            <div className="flex-1">
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
            className="w-full py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors disabled:opacity-50 font-medium mb-6"
          >
            {loading ? 'Calculating...' : 'Calculate Budget Equivalents'}
          </button>

          {results.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Budget Equivalents</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-2 font-medium">Currency</th>
                      <th className="px-4 py-2 font-medium text-right">Equivalent Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((res) => (
                      <tr key={res.currency} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-800 font-medium">{res.currency}</td>
                        <td className="px-4 py-2 text-right text-gray-600">
                          {res.symbol}{res.equivalent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
