import React, { useState } from 'react';
import CurrencySelector from './CurrencySelector';
import ErrorMessage from './ErrorMessage';
import { api } from '../services/api';

const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'INR', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 
  'NZD', 'MXN', 'SGD', 'HKD', 'NOK', 'KRW', 'TRY', 'RUB', 'BRL', 'ZAR', 
  'AED', 'SAR', 'THB', 'PHP', 'IDR', 'MYR', 'PLN', 'TWD', 'CZK', 'HUF'
];

export default function CurrencyConverter({ currentPair, onPairChange, onFavoriteAdded, onConversionDone }) {
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState(null);
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConvert = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.convert(currentPair.from, currentPair.to, parseFloat(amount));
      setResult(res.convertedAmount);
      setRate(res.rate);
      if (onConversionDone) onConversionDone();
    } catch (err) {
      setError(err.message || 'Failed to convert currency');
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    onPairChange({ from: currentPair.to, to: currentPair.from });
    setResult(null);
    setRate(null);
  };

  const handleSaveFavorite = async () => {
    try {
      await api.addFavorite(currentPair.from, currentPair.to);
      if (onFavoriteAdded) onFavoriteAdded();
    } catch (err) {
      setError(err.message || 'Failed to save favorite');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Currency Converter</h2>
      
      <ErrorMessage message={error} onDismiss={() => setError(null)} />

      <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
        <CurrencySelector 
          label="From"
          value={currentPair.from} 
          onChange={(val) => onPairChange({ ...currentPair, from: val })}
          currencies={CURRENCIES} 
        />
        
        <button 
          onClick={handleSwap}
          className="mt-5 p-2 rounded-full hover:bg-gray-100 transition-colors"
          title="Swap Currencies"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>
        
        <CurrencySelector 
          label="To"
          value={currentPair.to} 
          onChange={(val) => onPairChange({ ...currentPair, to: val })}
          currencies={CURRENCIES} 
        />
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 mb-1 block">Amount</label>
        <input 
          type="number" 
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button 
        onClick={handleConvert}
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium mb-4"
      >
        {loading ? 'Converting...' : 'Convert'}
      </button>

      {result !== null && (
        <div className="p-4 bg-gray-50 rounded-md border border-gray-100 text-center">
          <div className="text-sm text-gray-500 mb-1">
            {amount} {currentPair.from} =
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-2">
            {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {currentPair.to}
          </div>
          {rate && (
            <div className="text-sm text-gray-500">
              1 {currentPair.from} = {rate} {currentPair.to}
            </div>
          )}
          
          <button 
            onClick={handleSaveFavorite}
            className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            ★ Save to Favorites
          </button>
        </div>
      )}
    </div>
  );
}
