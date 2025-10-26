const express = require('express');
const { GeminiClient } = require('../utils/geminiClient');
const { CoinGeckoClient } = require('../utils/coingeckoClient');
const { WeatherClient } = require('../utils/weatherClient');
const { FHEClient } = require('../utils/fheClient');

const router = express.Router();

// Initialize clients - will throw on invalid configuration
const geminiClient = new GeminiClient();
const coingeckoClient = new CoinGeckoClient();
const weatherClient = new WeatherClient();
const fheClient = new FHEClient();

// Initialize FHE client on startup
fheClient.initialize().catch(console.error);

/**
 * POST /api/fetch-prediction
 * Real Gemini API call for AI predictions - NO FALLBACKS
 */
router.post('/fetch-prediction', async (req, res) => {
  try {
    const { domain, inputs } = req.body;
    
    if (!domain || !inputs) {
      return res.status(400).json({
        success: false,
        service: 'api_validation',
        error: 'Missing required fields: domain, inputs',
        code: 'VALIDATION_ERROR'
      });
    }

    // Real Gemini API call - will throw on failure
    const prediction = await geminiClient.getPrediction(domain, inputs);
    
    res.json({
      success: true,
      prediction,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Propagate exact error from Gemini client
    if (error.service) {
      return res.status(error.statusCode || 500).json(error);
    }
    
    res.status(500).json({
      success: false,
      service: 'gemini',
      error: error.message,
      code: 'GEMINI_ERROR'
    });
  }
});

/**
 * GET /api/fetch-market/:symbol
 * Real CoinGecko API call - NO FALLBACKS
 */
router.get('/fetch-market/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // Real CoinGecko API call - will throw on failure
    const marketData = await coingeckoClient.getPrice(symbol);
    
    res.json({
      success: true,
      data: marketData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Propagate exact error from CoinGecko client
    if (error.service) {
      return res.status(error.statusCode || 500).json(error);
    }
    
    res.status(500).json({
      success: false,
      service: 'coingecko',
      error: error.message,
      code: 'COINGECKO_ERROR'
    });
  }
});

/**
 * GET /api/fetch-weather/:city
 * Real Weather API call - NO FALLBACKS
 */
router.get('/fetch-weather/:city', async (req, res) => {
  try {
    const { city } = req.params;
    
    // Real Weather API call - will throw on failure
    const weatherData = await weatherClient.getWeather(city);
    
    res.json({
      success: true,
      data: weatherData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Propagate exact error from Weather client
    if (error.service) {
      return res.status(error.statusCode || 500).json(error);
    }
    
    res.status(500).json({
      success: false,
      service: 'weather',
      error: error.message,
      code: 'WEATHER_ERROR'
    });
  }
});

/**
 * GET /api/fhe-public-key
 * Get FHE public key for encryption
 */
router.get('/fhe-public-key', async (req, res) => {
  try {
    await fheClient.initialize();
    const publicKey = await fheClient._getPublicKey();
    res.json({
      success: true,
      publicKey: publicKey || '0x'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      service: 'zama_sdk',
      error: error.message,
      code: 'PUBLIC_KEY_ERROR'
    });
  }
});

/**
 * POST /api/encrypt-data
 * Encrypt data using FHE
 */
router.post('/encrypt-data', async (req, res) => {
  try {
    const { data } = req.body;
    
    if (!Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        service: 'validation',
        error: 'Data must be an array of numbers',
        code: 'INVALID_INPUT'
      });
    }
    
    const encrypted = await fheClient.encrypt(data);
    
    res.json({
      success: true,
      encrypted
    });
  } catch (error) {
    if (error.success === false) {
      return res.status(500).json(error);
    }
    
    res.status(500).json({
      success: false,
      service: 'zama_sdk',
      error: error.message,
      code: 'ENCRYPTION_ERROR'
    });
  }
});

/**
 * POST /api/confidential-prediction
 * Combined prediction endpoint with FHE and AI
 */
router.post('/confidential-prediction', async (req, res) => {
  try {
    const { inputs, domain } = req.body;
    
    if (!Array.isArray(inputs) || !domain) {
      return res.status(400).json({
        success: false,
        service: 'validation',
        error: 'inputs (array) and domain (string) are required',
        code: 'INVALID_INPUT'
      });
    }
    
    // Step 1: Encrypt inputs
    const encrypted = await fheClient.encrypt(inputs);
    
    // Step 2: Get AI prediction
    const aiPrediction = await geminiClient.getPrediction(domain, {
      input1: inputs[0],
      input2: inputs[1],
      input3: inputs[2]
    });
    
    // Step 3: Compute encrypted prediction
    const encryptedPrediction = await fheClient.computeEncryptedPrediction(
      encrypted.encrypted,
      domain
    );
    
    res.json({
      success: true,
      data: {
        aiPrediction,
        encryptedPrediction: {
          domain,
          timestamp: encryptedPrediction.timestamp,
          encrypted: true
        }
      }
    });
    
  } catch (error) {
    if (error.success === false) {
      return res.status(500).json(error);
    }
    
    res.status(500).json({
      success: false,
      service: 'confidential_prediction',
      error: error.message,
      code: 'PREDICTION_ERROR'
    });
  }
});

/**
 * POST /api/compute-encrypted-prediction
 * Compute encrypted prediction using homomorphic operations
 */
router.post('/compute-encrypted-prediction', async (req, res) => {
  try {
    const { encryptedInputs, domain } = req.body;
    
    if (!Array.isArray(encryptedInputs) || !domain) {
      return res.status(400).json({
        success: false,
        service: 'validation',
        error: 'encryptedInputs (array) and domain (string) are required',
        code: 'INVALID_INPUT'
      });
    }
    
    const prediction = await fheClient.computeEncryptedPrediction(encryptedInputs, domain);
    
    res.json({
      success: true,
      prediction
    });
  } catch (error) {
    if (error.success === false) {
      return res.status(500).json(error);
    }
    
    res.status(500).json({
      success: false,
      service: 'zama_sdk',
      error: error.message,
      code: 'COMPUTATION_ERROR'
    });
  }
});

/**
 * POST /api/public-decrypt
 * Decrypt FHE ciphertext for public results
 */
router.post('/public-decrypt', async (req, res) => {
  try {
    const { ciphertext } = req.body;
    
    if (!ciphertext) {
      return res.status(400).json({
        success: false,
        service: 'validation',
        error: 'ciphertext is required',
        code: 'INVALID_INPUT'
      });
    }
    
    const decryptedValue = await fheClient.decrypt(ciphertext);
    
    res.json({
      success: true,
      decryptedValue
    });
  } catch (error) {
    if (error.success === false) {
      return res.status(500).json(error);
    }
    
    res.status(500).json({
      success: false,
      service: 'zama_sdk',
      error: error.message,
      code: 'DECRYPTION_ERROR'
    });
  }
});

module.exports = { apiRoutes: router };