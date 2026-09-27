import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function FavoritesList({ onSelectPair }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const data = await api.getFavorites();
      setFavorites(data || []);
    } catch (err) {
      console.error('Failed to fetch favorites', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await api.deleteFavorite(id);
      setFavorites(favorites.filter(f => f.id !== id));
    } catch (err) {
      console.error('Failed to delete favorite', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-gray-800">★ Favorites</h2>
        <span className="text-xs text-gray-500 font-medium">{favorites.length} saved</span>
      </div>
      
      {loading && favorites.length === 0 ? (
        <div className="text-sm text-gray-500 py-2">Loading...</div>
      ) : favorites.length === 0 ? (
        <div className="text-sm text-gray-500 py-2">No favorites yet</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {favorites.map((fav) => (
            <div 
              key={fav.id}
              onClick={() => onSelectPair(fav.source_currency, fav.target_currency)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-full cursor-pointer hover:bg-blue-100 transition-colors border border-blue-100"
            >
              <span>{fav.source_currency} → {fav.target_currency}</span>
              <button 
                onClick={(e) => handleDelete(e, fav.id)}
                className="ml-1 text-blue-400 hover:text-red-500 focus:outline-none"
                aria-label="Delete favorite"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
