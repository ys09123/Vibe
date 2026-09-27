import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function ConversionHistory({ onSelectPair }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getConversionHistory();
      setHistory(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const displayCount = expanded ? history.length : Math.min(10, history.length);
  const visibleHistory = history.slice(0, displayCount);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Recent Conversions</h2>
      
      {error && (
        <div className="text-xs text-red-500 py-1 mb-2">{error}</div>
      )}
      
      {loading && history.length === 0 ? (
        <div className="text-sm text-gray-500 py-2">Loading...</div>
      ) : history.length === 0 ? (
        <div className="text-sm text-gray-500 py-2">No conversions yet</div>
      ) : (
        <div className="space-y-2">
          {visibleHistory.map((item, index) => (
            <div 
              key={item.id || index} 
              onClick={() => onSelectPair(item.source_currency, item.target_currency)}
              className="p-2.5 rounded-md hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-100 transition-colors"
            >
              <div className="text-sm font-medium text-gray-800">
                {item.amount} {item.source_currency} → {item.converted_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {item.target_currency}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(item.created_at || Date.now()).toLocaleString()}
              </div>
            </div>
          ))}
          
          {history.length > 10 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-2 font-medium"
            >
              {expanded ? 'Show less' : `Show more (${history.length - 10})`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
