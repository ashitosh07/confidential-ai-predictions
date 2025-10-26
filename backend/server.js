const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { apiRoutes } = require('./routes/api');
const { validateEnvironment, performHealthChecks } = require('./utils/healthcheck');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware - Allow all origins for development
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));

// Input sanitization
app.use((req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    }
  }
  next();
});

// Add CORS headers for all API routes
app.use('/api', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Routes
app.use('/api', apiRoutes);

// Health check endpoint with CORS
app.options('/health', cors());
app.get('/health', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  // Add CORS headers for all API routes
  res.header('Access-Control-Allow-Credentials', 'true');
  try {
    const healthStatus = await performHealthChecks();
    
    // If any critical service fails (except CoinGecko rate limits and FHE for demo), return error
    const criticalFailure = Object.entries(healthStatus).find(([serviceName, status]) => 
      !status.success && serviceName !== 'coingecko' && serviceName !== 'fhevm_rpc'
    );
    if (criticalFailure) {
      const [serviceName, status] = criticalFailure;
      return res.status(503).json({
        success: false,
        service: serviceName,
        error: status.error,
        code: status.code
      });
    }
    
    // Return success even if CoinGecko is rate limited or FHE is in simulation mode
    const overallSuccess = !Object.entries(healthStatus).some(([serviceName, status]) => 
      !status.success && serviceName !== 'coingecko' && serviceName !== 'fhevm_rpc'
    );
    
    res.json({
      success: overallSuccess,
      services: healthStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      service: 'health_check',
      error: 'Health check system failure',
      code: 'HEALTH_CHECK_ERROR'
    });
  }
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    service: 'server',
    error: 'Internal server error',
    code: 'SERVER_ERROR'
  });
});

// Start server with environment validation
async function startServer() {
  try {
    // Validate required environment variables
    validateEnvironment();
    
    // Perform initial health checks
    console.log('🔍 Performing startup health checks...');
    const healthStatus = await performHealthChecks();
    
    // Check if any critical service is down (skip CoinGecko rate limits and FHE for demo)
    const failedService = Object.entries(healthStatus).find(([serviceName, status]) => 
      !status.success && serviceName !== 'coingecko' && serviceName !== 'fhevm_rpc'
    );
    if (failedService) {
      const [serviceName, status] = failedService;
      console.error('❌ Startup failed - service unavailable:', {
        success: false,
        service: serviceName,
        error: status.error,
        code: status.code
      });
      process.exit(1);
    }
    
    // Warn about services that are down but not critical for demo
    if (healthStatus.fhevm_rpc && !healthStatus.fhevm_rpc.success) {
      console.warn('⚠️  FHEVM RPC not available - using simulation mode');
    }
    
    // Warn about CoinGecko if rate limited
    if (healthStatus.coingecko && !healthStatus.coingecko.success) {
      console.warn('⚠️  CoinGecko rate limited - will retry later');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Z-AI Predictor Backend running on port ${PORT}`);
      console.log('✅ All external services validated');
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
}

startServer();