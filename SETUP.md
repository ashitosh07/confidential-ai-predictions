# 🚀 Z-AI Predictor Setup Guide

**Complete setup instructions for the Zama FHEVM Confidential AI/ML Predictions dApp**

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- MetaMask or compatible Web3 wallet
- FHEVM-compatible RPC endpoint (local or testnet)

## 🔧 Installation Steps

### 1. Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies  
cd ../frontend
npm install

# Install FHE dependencies
node ../backend/install-fhe.js
```

### 2. Environment Configuration

```bash
# Copy environment template
cp backend/.env.example backend/.env
```

**Edit `backend/.env` with your API keys:**

```bash
# REQUIRED API KEYS
GEMINI_API_KEY=your-google-gemini-api-key
WEATHER_API_KEY=your-weatherapi-key

# FHEVM CONFIGURATION
FHEVM_RPC_URL=http://127.0.0.1:8545
FHEVM_CHAIN_ID=31337

# BACKEND CONFIGURATION
PORT=3001
NODE_ENV=production
```

### 3. Deploy Smart Contract

```bash
# Deploy to FHEVM network
node scripts/deploy-contract.js
```

### 4. Start Services

```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend  
cd frontend && npm run dev
```

## 🧪 Testing & Validation

### Run Integration Tests

```bash
# Test all functionality
node scripts/test-integration.js
```

### Manual Testing

1. **Health Check**: `curl http://localhost:3001/health`
2. **Frontend**: Open `http://localhost:3000`
3. **Connect Wallet**: Use MetaMask with FHEVM network
4. **Test Prediction**: Submit encrypted prediction
5. **Verify Decryption**: Request and verify on-chain results

## 🔍 Verification Checklist

- [ ] ✅ All API integrations working (Gemini, CoinGecko, Weather)
- [ ] ✅ FHE encryption/decryption functional
- [ ] ✅ Smart contract deployed and accessible
- [ ] ✅ Frontend wallet integration working
- [ ] ✅ End-to-end encrypted prediction flow
- [ ] ✅ No mock data or fallbacks
- [ ] ✅ Error handling comprehensive
- [ ] ✅ Zero-gas transactions supported

## 🚨 Troubleshooting

### Common Issues

**1. API Key Errors**
```bash
# Verify API keys are valid
curl -H "Authorization: Bearer $GEMINI_API_KEY" https://generativelanguage.googleapis.com/v1beta/models
```

**2. FHEVM Connection Issues**
```bash
# Test RPC connectivity
curl -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
  $FHEVM_RPC_URL
```

**3. Frontend Build Issues**
```bash
# Clear Next.js cache
cd frontend && rm -rf .next && npm run build
```

**4. FHE SDK Issues**
```bash
# Reinstall FHE dependencies
npm uninstall fhevmjs && npm install fhevmjs@latest
```

## 📊 Performance Expectations

- **API Response Time**: < 2 seconds
- **Encryption Time**: < 1 second for 3 inputs
- **Contract Interaction**: < 5 seconds
- **Decryption Request**: < 10 seconds

## 🏆 Golden Ticket Compliance

This implementation meets all Zama Developer Program requirements:

✅ **Real FHE Integration**: Uses fhevmjs SDK for actual encryption/decryption
✅ **No Mock Data**: All APIs are real with proper error handling  
✅ **Production Ready**: Comprehensive error handling and validation
✅ **Confidential Computing**: End-to-end encrypted ML predictions
✅ **Zero Fallbacks**: System fails loudly when services are unavailable

## 🔗 API Endpoints

### Backend Endpoints

- `GET /health` - System health check
- `POST /api/fetch-prediction` - Real Gemini AI predictions
- `GET /api/fetch-market/:symbol` - Real CoinGecko market data
- `GET /api/fetch-weather/:city` - Real weather data
- `GET /api/fhe-public-key` - FHE public key for encryption
- `POST /api/encrypt-data` - Encrypt data using FHE
- `POST /api/confidential-prediction` - Combined AI + FHE prediction
- `POST /api/compute-encrypted-prediction` - Homomorphic computation

### Smart Contract Functions

- `submitEncrypted()` - Submit encrypted prediction inputs
- `requestDecryption()` - Request decryption of results
- `getDecryptedResults()` - Get decrypted prediction results
- `hasDecryptedResults()` - Check if results are available

## 📈 Demo Script

```bash
# 1. Health check
curl http://localhost:3001/health | jq

# 2. Test prediction
curl -X POST http://localhost:3001/api/confidential-prediction \
  -H "Content-Type: application/json" \
  -d '{"domain":"financial","inputs":[50000,2500,7.5]}' | jq

# 3. Test market data
curl http://localhost:3001/api/fetch-market/bitcoin | jq

# 4. Open frontend and test full flow
open http://localhost:3000
```

## 🎯 Success Criteria

The system is ready for submission when:

1. All integration tests pass (8/8)
2. Health check returns all services online
3. Frontend loads without errors
4. Wallet connection works
5. End-to-end prediction flow completes
6. Decryption returns valid results
7. No console errors or warnings

---

**Built for Zama Developer Program October 2025 🏆**