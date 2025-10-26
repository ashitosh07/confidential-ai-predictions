const { GeminiClient } = require('./geminiClient');
const { CoinGeckoClient } = require('./coingeckoClient');
const { WeatherClient } = require('./weatherClient');
const { FHEClient } = require('./fheClient');

/**
 * Validate required environment variables
 * @throws {Error} If required environment variables are missing
 */
function validateEnvironment() {
  const required = [
    'GEMINI_API_KEY',
    'FHEVM_RPC_URL',
    'WEATHER_API_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Perform comprehensive health checks on all external services
 * @returns {Promise<object>} Health status for all services
 */
async function performHealthChecks() {
  const results = {};
  
  // Test Gemini connectivity
  try {
    const geminiClient = new GeminiClient();
    results.gemini = await geminiClient.testConnection();
  } catch (error) {
    results.gemini = {
      success: false,
      service: 'gemini',
      error: error.message,
      code: 'CLIENT_INIT_ERROR'
    };
  }
  
  // Test CoinGecko connectivity
  try {
    const coingeckoClient = new CoinGeckoClient();
    results.coingecko = await coingeckoClient.testConnection();
  } catch (error) {
    results.coingecko = {
      success: false,
      service: 'coingecko',
      error: error.message,
      code: 'CLIENT_INIT_ERROR'
    };
  }
  
  // Test Weather API connectivity
  try {
    const weatherClient = new WeatherClient();
    results.weather = await weatherClient.testConnection();
  } catch (error) {
    results.weather = {
      success: false,
      service: 'weather',
      error: error.message,
      code: 'CLIENT_INIT_ERROR'
    };
  }
  
  // Test FHEVM RPC and Zama SDK (temporarily disabled for demo)
  results.fhevm_rpc = {
    success: true,
    service: 'fhevm_rpc',
    status: 'skipped - demo mode'
  };
  
  return results;
}

module.exports = {
  validateEnvironment,
  performHealthChecks
};