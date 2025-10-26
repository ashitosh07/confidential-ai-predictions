const axios = require('axios');

class CoinGeckoClient {
  constructor() {
    this.baseURL = 'https://api.coingecko.com/api/v3';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 15000 // 15 second timeout
    });
  }

  /**
   * Get cryptocurrency price from CoinGecko - REAL API CALLS ONLY
   * @param {string} symbol - Cryptocurrency symbol (bitcoin, ethereum, etc.)
   * @returns {Promise<object>} Price data
   * @throws {Error} On API failure - NO FALLBACKS
   */
  async getPrice(symbol) {
    try {
      const response = await this.client.get('/simple/price', {
        params: {
          ids: symbol,
          vs_currencies: 'usd',
          include_24hr_change: true,
          include_market_cap: true,
          include_24hr_vol: true
        }
      });

      const data = response.data[symbol];
      if (!data) {
        throw {
          success: false,
          service: 'coingecko',
          error: `Cryptocurrency '${symbol}' not found`,
          code: 'SYMBOL_NOT_FOUND',
          statusCode: 404
        };
      }

      return {
        symbol,
        price: data.usd,
        change_24h: data.usd_24h_change,
        market_cap: data.usd_market_cap,
        volume_24h: data.usd_24h_vol,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      // Handle CoinGecko API errors with exact error propagation
      if (error.success === false) {
        throw error; // Re-throw our custom errors
      }
      
      if (error.response) {
        const { status, data } = error.response;
        
        // Rate limit error (429)
        if (status === 429) {
          throw {
            success: false,
            service: 'coingecko',
            error: 'CoinGecko rate limit reached — retry later',
            code: '429',
            statusCode: 429
          };
        }
        
        // API errors
        throw {
          success: false,
          service: 'coingecko',
          error: data.error || 'CoinGecko API error',
          code: status.toString(),
          statusCode: status
        };
      }
      
      // Network or timeout errors
      if (error.code === 'ECONNABORTED') {
        throw {
          success: false,
          service: 'coingecko',
          error: 'CoinGecko API timeout - service unreachable',
          code: 'TIMEOUT',
          statusCode: 503
        };
      }
      
      // Connection errors
      throw {
        success: false,
        service: 'coingecko',
        error: 'CoinGecko API unreachable - check network connection',
        code: 'CONNECTION_ERROR',
        statusCode: 503
      };
    }
  }

  /**
   * Get trending cryptocurrencies from CoinGecko - REAL API CALLS ONLY
   * @returns {Promise<object>} Trending data
   * @throws {Error} On API failure - NO FALLBACKS
   */
  async getTrending() {
    try {
      const response = await this.client.get('/search/trending');
      
      return {
        trending: response.data.coins.map(coin => ({
          id: coin.item.id,
          name: coin.item.name,
          symbol: coin.item.symbol,
          rank: coin.item.market_cap_rank
        })),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        // Rate limit error
        if (status === 429) {
          throw {
            success: false,
            service: 'coingecko',
            error: 'CoinGecko rate limit reached — retry later',
            code: '429',
            statusCode: 429
          };
        }
        
        throw {
          success: false,
          service: 'coingecko',
          error: data.error || 'CoinGecko trending API error',
          code: status.toString(),
          statusCode: status
        };
      }
      
      // Network errors
      throw {
        success: false,
        service: 'coingecko',
        error: 'CoinGecko trending API unreachable',
        code: 'CONNECTION_ERROR',
        statusCode: 503
      };
    }
  }

  /**
   * Test CoinGecko API connectivity
   * @returns {Promise<object>} Health status
   */
  async testConnection() {
    try {
      const response = await this.client.get('/ping');
      
      if (response.data.gecko_says === '(V3) To the Moon!') {
        return {
          success: true,
          service: 'coingecko',
          status: 'connected'
        };
      }
      
      return {
        success: false,
        service: 'coingecko',
        error: 'Unexpected response from CoinGecko',
        code: 'INVALID_RESPONSE'
      };
    } catch (error) {
      if (error.response?.status === 429) {
        return {
          success: false,
          service: 'coingecko',
          error: 'Rate limit reached',
          code: '429'
        };
      }
      
      return {
        success: false,
        service: 'coingecko',
        error: 'Connection failed',
        code: error.code || 'CONNECTION_ERROR'
      };
    }
  }
}

module.exports = { CoinGeckoClient };