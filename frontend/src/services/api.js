const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return 'http://localhost:5000/api';
  const clean = envUrl.replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

const BASE_URL = getBaseUrl();

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  const errorMessage = data?.error?.message || (typeof data?.error === 'string' ? data.error : null) || data?.message || 'An error occurred';

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  if (data && data.success === false) {
    throw new Error(errorMessage);
  }

  return data ? (data.data !== undefined ? data.data : data) : null;
}

export const api = {
  getRates: (base) => fetchJson(`${BASE_URL}/rates?base=${base}`),
  
  getHistory: (base, target, days = 30) => 
    fetchJson(`${BASE_URL}/rates/history?base=${base}&target=${target}&days=${days}`),
  
  convert: (from, to, amount) => 
    fetchJson(`${BASE_URL}/convert`, {
      method: 'POST',
      body: JSON.stringify({ from, to, amount }),
    }),
  
  getFavorites: () => fetchJson(`${BASE_URL}/favorites`),
  
  addFavorite: (sourceCurrency, targetCurrency) => 
    fetchJson(`${BASE_URL}/favorites`, {
      method: 'POST',
      body: JSON.stringify({ source_currency: sourceCurrency, target_currency: targetCurrency }),
    }),
  
  deleteFavorite: (id) => 
    fetchJson(`${BASE_URL}/favorites/${id}`, {
      method: 'DELETE',
    }),
  
  getConversionHistory: () => fetchJson(`${BASE_URL}/history`),
  
  calculateTravelBudget: (baseCurrency, amount) => 
    fetchJson(`${BASE_URL}/travel-budget`, {
      method: 'POST',
      body: JSON.stringify({ baseCurrency, amount }),
    }),
};
