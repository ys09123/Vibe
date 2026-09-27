import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { api } from '../services/api';

export default function TrendChart({ baseCurrency, targetCurrency }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const historyData = await api.getHistory(baseCurrency, targetCurrency, 30);
        
        // Transform data for chart if needed. Assuming API returns { date: 'YYYY-MM-DD', rate: 1.23 }
        const formattedData = (historyData || []).map(item => {
          const dateObj = new Date(item.date);
          return {
            ...item,
            formattedDate: `${dateObj.getMonth() + 1}/${dateObj.getDate()}`
          };
        });
        
        setData(formattedData);
      } catch (err) {
        setError('Failed to load historical data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (baseCurrency && targetCurrency) {
      fetchHistory();
    }
  }, [baseCurrency, targetCurrency]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        30-Day Trend: {baseCurrency} → {targetCurrency}
      </h2>
      
      <div className="h-[250px] w-full flex items-center justify-center bg-gray-50 rounded-md border border-gray-100">
        {loading ? (
          <div className="text-gray-500">Loading chart data...</div>
        ) : error ? (
          <div className="text-red-500 text-sm">{error}</div>
        ) : data.length === 0 ? (
          <div className="text-gray-500">No historical data available yet</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <XAxis 
                dataKey="formattedDate" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickMargin={10}
              />
              <YAxis 
                domain={['auto', 'auto']} 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(value) => value.toFixed(2)}
                width={60}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                formatter={(value) => [value, 'Rate']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={false} 
                activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
