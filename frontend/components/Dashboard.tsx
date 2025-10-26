import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Zap, Shield, Globe, Thermometer, Droplets, Wind } from 'lucide-react';

interface MarketData {
  symbol: string;
  price: number;
  change_24h: number;
  market_cap: number;
  volume_24h: number;
}

interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  humidity: number;
  pressure: number;
  description: string;
  wind_speed: number;
}

interface DashboardProps {
  domain: string;
}

export function Dashboard({ domain }: DashboardProps) {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (domain === 'financial') {
      fetchMarketData();
    } else if (domain === 'iot') {
      fetchWeatherData();
    }
  }, [domain]);

  async function fetchMarketData() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/api/fetch-market/bitcoin');
      const data = await response.json();
      if (data.success) {
        setMarketData(data.data);
      } else {
        setError(data.error || 'Failed to fetch market data');
      }
    } catch (error: any) {
      console.error('Failed to fetch market data:', error);
      setError('Network error - check if backend is running');
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchWeatherData() {
    setIsWeatherLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/api/fetch-weather/London');
      const data = await response.json();
      if (data.success) {
        setWeatherData(data.data);
      } else {
        setError(data.error || 'Failed to fetch weather data');
      }
    } catch (error: any) {
      console.error('Failed to fetch weather data:', error);
      setError('Network error - check if backend is running');
    } finally {
      setIsWeatherLoading(false);
    }
  }

  const stats = [
    { label: 'Predictions Made', value: '1,247', icon: Activity, color: 'text-blue-400' },
    { label: 'Accuracy Rate', value: '94.2%', icon: TrendingUp, color: 'text-green-400' },
    { label: 'Zero Gas Txns', value: '100%', icon: Zap, color: 'text-yellow-400' },
    { label: 'FHE Encrypted', value: 'Active', icon: Shield, color: 'text-purple-400' }
  ];

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="glass-morphism rounded-xl p-4 border-l-4 border-red-500">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <span className="text-red-300 text-sm">{error}</span>
          </div>
        </div>
      )}
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-morphism rounded-xl p-4"
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-5 h-5 ${stat.color}`} />
                <div>
                  <div className="text-lg font-bold">{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Market Data (Financial Domain) */}
      {domain === 'financial' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-morphism rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Globe className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-bold">Live Market Data</h3>
          </div>
          
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-white/10 rounded"></div>
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
            </div>
          ) : marketData ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Bitcoin Price</span>
                <span className="font-bold">${marketData.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">24h Change</span>
                <div className="flex items-center space-x-1">
                  {marketData.change_24h >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span className={marketData.change_24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {marketData.change_24h.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Volume 24h</span>
                <span className="text-sm">${(marketData.volume_24h / 1e9).toFixed(2)}B</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-gray-400 text-sm mb-2">Market data unavailable</div>
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  fetchMarketData();
                }}
                className="text-purple-400 hover:text-purple-300 text-sm underline"
              >
                Retry
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Weather Data (IoT Domain) */}
      {domain === 'iot' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-morphism rounded-xl p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Thermometer className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold">Live Weather Data</h3>
          </div>
          
          {isWeatherLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-white/10 rounded"></div>
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
            </div>
          ) : weatherData ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Location</span>
                <span className="font-bold">{weatherData.city}, {weatherData.country}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 flex items-center space-x-1">
                  <Thermometer className="w-4 h-4" />
                  <span>Temperature</span>
                </span>
                <span className="font-bold">{weatherData.temperature.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 flex items-center space-x-1">
                  <Droplets className="w-4 h-4" />
                  <span>Humidity</span>
                </span>
                <span className="text-sm">{weatherData.humidity}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 flex items-center space-x-1">
                  <Wind className="w-4 h-4" />
                  <span>Wind Speed</span>
                </span>
                <span className="text-sm">{weatherData.wind_speed.toFixed(1)} m/s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Condition</span>
                <span className="text-sm capitalize">{weatherData.description}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-gray-400 text-sm mb-2">Weather data unavailable</div>
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  fetchWeatherData();
                }}
                className="text-purple-400 hover:text-purple-300 text-sm underline"
              >
                Retry
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}