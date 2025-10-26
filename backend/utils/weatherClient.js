const axios = require('axios');

class WeatherClient {
  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY;
    
    if (!this.apiKey) {
      throw new Error('WEATHER_API_KEY environment variable is required');
    }
    
    this.baseURL = 'http://api.weatherapi.com/v1';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 15000 // 15 second timeout
    });
  }

  /**
   * Get weather data from WeatherAPI - REAL API CALLS ONLY
   * @param {string} city - City name
   * @returns {Promise<object>} Weather data
   * @throws {Error} On API failure - NO FALLBACKS
   */
  async getWeather(city) {
    try {
      const response = await this.client.get('/current.json', {
        params: {
          key: this.apiKey,
          q: city,
          aqi: 'no'
        }
      });

      const data = response.data;
      
      return {
        city: data.location.name,
        country: data.location.country,
        temperature: data.current.temp_c,
        humidity: data.current.humidity,
        pressure: data.current.pressure_mb,
        description: data.current.condition.text,
        main: data.current.condition.text,
        wind_speed: data.current.wind_kph / 3.6, // Convert to m/s
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      // Handle WeatherAPI errors with exact error propagation
      if (error.response) {
        const { status, data } = error.response;
        
        // Invalid API key
        if (status === 401 || status === 403) {
          throw {
            success: false,
            service: 'weather',
            error: 'WeatherAPI key invalid or expired',
            code: status.toString(),
            statusCode: status
          };
        }
        
        // City not found
        if (status === 400) {
          throw {
            success: false,
            service: 'weather',
            error: `City '${city}' not found`,
            code: '400',
            statusCode: 400
          };
        }
        
        // Rate limit
        if (status === 429) {
          throw {
            success: false,
            service: 'weather',
            error: 'WeatherAPI rate limit exceeded - retry later',
            code: '429',
            statusCode: 429
          };
        }
        
        // Other API errors
        throw {
          success: false,
          service: 'weather',
          error: data.error?.message || 'WeatherAPI error',
          code: status.toString(),
          statusCode: status
        };
      }
      
      // Network or timeout errors
      if (error.code === 'ECONNABORTED') {
        throw {
          success: false,
          service: 'weather',
          error: 'WeatherAPI timeout - service unreachable',
          code: 'TIMEOUT',
          statusCode: 503
        };
      }
      
      // Connection errors
      throw {
        success: false,
        service: 'weather',
        error: 'WeatherAPI unreachable - check network connection',
        code: 'CONNECTION_ERROR',
        statusCode: 503
      };
    }
  }

  /**
   * Get weather forecast from WeatherAPI - REAL API CALLS ONLY
   * @param {string} city - City name
   * @returns {Promise<object>} Forecast data
   * @throws {Error} On API failure - NO FALLBACKS
   */
  async getForecast(city) {
    try {
      const response = await this.client.get('/forecast.json', {
        params: {
          key: this.apiKey,
          q: city,
          days: 1,
          aqi: 'no',
          alerts: 'no'
        }
      });

      const data = response.data;
      
      return {
        city: data.location.name,
        country: data.location.country,
        forecast: data.forecast.forecastday[0].hour.slice(0, 8).map(item => ({
          datetime: item.time,
          temperature: item.temp_c,
          humidity: item.humidity,
          pressure: item.pressure_mb,
          description: item.condition.text
        })),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      // Same error handling as getWeather
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 401 || status === 403) {
          throw {
            success: false,
            service: 'weather',
            error: 'WeatherAPI key invalid or expired',
            code: status.toString(),
            statusCode: status
          };
        }
        
        if (status === 400) {
          throw {
            success: false,
            service: 'weather',
            error: `City '${city}' not found`,
            code: '400',
            statusCode: 400
          };
        }
        
        throw {
          success: false,
          service: 'weather',
          error: data.error?.message || 'WeatherAPI forecast error',
          code: status.toString(),
          statusCode: status
        };
      }
      
      throw {
        success: false,
        service: 'weather',
        error: 'WeatherAPI forecast unreachable',
        code: 'CONNECTION_ERROR',
        statusCode: 503
      };
    }
  }

  /**
   * Test WeatherAPI connectivity
   * @returns {Promise<object>} Health status
   */
  async testConnection() {
    try {
      // Test with a known city
      const response = await this.client.get('/current.json', {
        params: {
          key: this.apiKey,
          q: 'London',
          aqi: 'no'
        }
      });
      
      if (response.data.location?.name) {
        return {
          success: true,
          service: 'weather',
          status: 'connected'
        };
      }
      
      return {
        success: false,
        service: 'weather',
        error: 'Unexpected response from WeatherAPI',
        code: 'INVALID_RESPONSE'
      };
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        return {
          success: false,
          service: 'weather',
          error: 'Invalid API key',
          code: error.response.status.toString()
        };
      }
      
      return {
        success: false,
        service: 'weather',
        error: 'Connection failed',
        code: error.code || 'CONNECTION_ERROR'
      };
    }
  }
}

module.exports = { WeatherClient };