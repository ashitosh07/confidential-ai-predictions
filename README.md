# 🧠 Z-AI Predictor - Confidential AI/ML Predictions

**Next-generation privacy-preserving AI predictions using Zama FHEVM**

## 🚀 **Quick Start**

### **1. Quick Setup**
```bash
# One-command setup
npm run setup
```

**Edit `backend/.env` with REAL API keys:**
```bash
# REQUIRED - App will fail without these
GEMINI_API_KEY=your-google-gemini-api-key
WEATHER_API_KEY=your-weatherapi-key

# Local development (default)
FHEVM_RPC_URL=http://127.0.0.1:8545
FHEVM_CHAIN_ID=31337
```

### **2. Install Dependencies**
```bash
# Install all dependencies
npm run install-all

# Or install individually:
# Root (for scripts)
npm install

# Backend
cd backend && npm install

# Frontend  
cd ../frontend && npm install
```

### **3. Validate External Services**
```bash
# Test all APIs before starting
curl http://localhost:3001/health
```

**Expected success response:**
```json
{
  "success": true,
  "services": {
    "gemini": {"success": true, "status": "connected"},
    "coingecko": {"success": true, "status": "connected"},
    "weather": {"success": true, "status": "connected"},
    "fhevm_rpc": {"success": true, "status": "connected"}
  }
}
```

**Example failure response:**
```json
{
  "success": false,
  "service": "gemini",
  "error": "Gemini API key invalid or expired",
  "code": "401"
}
```

### **4. Zero-Gas Verification**
```bash
# Verify RPC accepts zero-gas transactions
chmod +x scripts/verify_zero_gas.sh
./scripts/verify_zero_gas.sh
```

### **4. Start Local Blockchain**
```bash
# Start local node (in separate terminal)
npm run start-node
# Then run: npx hardhat node
```

### **5. Deploy Smart Contract**
```bash
# Deploy to local network
npm run deploy
```

### **6. Start Services**
```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend
cd frontend && npm run dev
```

### **7. Validate Production Readiness**
```bash
# Run comprehensive validation
node scripts/validate-production.js
```

## 🔗 **API Testing Commands**

### **Health Check**
```bash
curl http://localhost:3001/health
```

### **Real Gemini AI Prediction**
```bash
curl -X POST http://localhost:3001/api/fetch-prediction \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "financial",
    "inputs": {"input1": "50000", "input2": "2500", "input3": "7.5"}
  }'
```

**Success Response:**
```json
{
  "success": true,
  "prediction": {
    "prediction": "Price trend: UP 8.3%",
    "model": "gemini-pro",
    "confidence": 0.87,
    "domain": "financial"
  }
}
```

**Failure Response (API key invalid):**
```json
{
  "success": false,
  "service": "gemini", 
  "error": "Gemini API key invalid or expired",
  "code": "401"
}
```

### **Real CoinGecko Market Data**
```bash
curl http://localhost:3001/api/fetch-market/bitcoin
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "bitcoin",
    "price": 43250.67,
    "change_24h": 2.34,
    "market_cap": 847392847392,
    "volume_24h": 23847293847
  }
}
```

**Rate Limit Response:**
```json
{
  "success": false,
  "service": "coingecko",
  "error": "CoinGecko rate limit reached — retry later", 
  "code": "429"
}
```

### **Real Weather Data**
```bash
curl http://localhost:3001/api/fetch-weather/London
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "city": "London",
    "country": "United Kingdom",
    "temperature": 15.2,
    "humidity": 78,
    "pressure": 1013.2,
    "description": "Partly cloudy",
    "wind_speed": 3.6
  }
}
```

## 🎬 **Demo Script (90-120 seconds)**

### **Preparation**
1. Ensure all APIs are working: `curl http://localhost:3001/health`
2. Have MetaMask connected to local network (http://127.0.0.1:8545)
3. Verify zero-gas: `./scripts/verify_zero_gas.sh`

### **Demo Flow**
```bash
# 1. Show health check (15s)
curl http://localhost:3001/health | jq

# 2. Financial prediction (30s)
# - Open frontend: http://localhost:3000
# - Select "Financial Markets"
# - Input: Market Cap: 50000, Volume: 2500, Price Change: 7.5
# - Click "Get Prediction"
# - Show real Gemini response

# 3. Show API integration (20s)
curl -X POST http://localhost:3001/api/fetch-prediction \
  -H "Content-Type: application/json" \
  -d '{"domain":"financial","inputs":{"input1":"50000","input2":"2500","input3":"7.5"}}'

# 4. Show market data (15s)
curl http://localhost:3001/api/fetch-market/bitcoin | jq

# 5. Failure test (30s) - Demonstrate hard-fail behavior
# Temporarily revoke Gemini API key and show error:
export GEMINI_API_KEY="invalid-key"
curl -X POST http://localhost:3001/api/fetch-prediction \
  -H "Content-Type: application/json" \
  -d '{"domain":"financial","inputs":{"input1":"100","input2":"75","input3":"5"}}'
```

### **Expected Failure Output**
```json
{
  "success": false,
  "service": "gemini",
  "error": "Gemini API key invalid or expired",
  "code": "401"
}
```

## 🚨 **Error Scenarios for Judges**

### **Missing API Key**
```bash
# Remove Gemini key
unset GEMINI_API_KEY
npm start
# Result: Server startup fails with clear error
```

### **Rate Limit Hit**
```bash
# Make many requests to trigger CoinGecko rate limit
for i in {1..100}; do curl http://localhost:3001/api/fetch-market/bitcoin; done
# Result: {"success":false,"service":"coingecko","error":"CoinGecko rate limit reached — retry later","code":"429"}
```

### **Non-Zero-Gas RPC**
```bash
# Point to mainnet RPC (requires gas)
export FHEVM_RPC_URL="https://mainnet.infura.io/v3/your-key"
./scripts/verify_zero_gas.sh
# Result: {"success":false,"service":"fhevm_rpc","error":"Sandbox RPC rejected transaction: gas required","code":"GAS_REQUIRED"}
```

### **Service Unreachable**
```bash
# Point to invalid endpoint
export FHEVM_RPC_URL="http://invalid-endpoint:8545"
curl http://localhost:3001/health
# Result: {"success":false,"service":"fhevm_rpc","error":"FHEVM RPC connection failed: ...","code":"CONNECTION_ERROR"}
```

## 🏗️ **Architecture**

```
Frontend (Next.js + Ethers v6) ↔ Backend (Express + Real APIs) ↔ FHEVM Network
     ↓                              ↓                           ↓
EIP-712 Signing              Gemini + CoinGecko APIs       Smart Contracts
     ↓                              ↓                           ↓
Zero-Gas Validation          Weather + FHE SDK             Homomorphic ML
```

## 📁 **Project Structure**

```
z-ai-predictor/
├── contracts/
│   └── ZAIPredictor.sol          # FHEVM smart contract
├── backend/
│   ├── server.js                 # Express server
│   ├── routes/api.js             # API endpoints
│   └── utils/
│       ├── geminiClient.js       # Real Gemini integration
│       ├── coingeckoClient.js    # Real CoinGecko integration
│       ├── weatherClient.js      # Real Weather API integration
│       ├── fheClient.js          # Zama FHE SDK wrapper
│       └── healthcheck.js        # Service validation
├── frontend/
│   ├── pages/index.tsx           # Main UI with error handling
│   ├── hooks/                    # React hooks for FHE operations
│   └── components/
│       ├── ErrorBanner.tsx       # API error display
│       ├── Dashboard.tsx         # Real-time data dashboard
│       └── PredictionCard.tsx    # Results display
├── scripts/
│   └── verify_zero_gas.sh        # Zero-gas validation
└── .env.example                  # Required API keys
```

## 🔧 **Technical Implementation**

### **Smart Contract (FHEVM)**
- Real TFHE operations for encrypted ML
- Zero-gas transaction validation
- Federated learning aggregation
- Gateway integration for decryption

### **Backend (Node.js)**
- **Google Gemini Pro**: Real AI predictions
- **CoinGecko API**: Live cryptocurrency data
- **WeatherAPI**: Real weather data
- **Zama FHE SDK**: Encryption/decryption operations
- **Strict Error Handling**: No fallbacks or mock data

### **Frontend (Next.js)**
- **Ethers v6**: Wallet integration and EIP-712 signing
- **Zero-Gas Validation**: RPC compatibility checks
- **Error Display**: Clear API failure messages
- **Real-Time Data**: Live market and weather integration

## 🎯 **Why This Wins the Golden Ticket**

### **1. Production Quality**
- ✅ **Real API integrations only** - no mock data
- ✅ **Comprehensive error handling** - fails loudly and clearly
- ✅ **Zero-gas enforcement** - validates sandbox environment
- ✅ **Professional architecture** - enterprise-ready codebase

### **2. Technical Innovation**
- ✅ **Novel FHEVM application** - encrypted ML predictions
- ✅ **Multi-domain support** - financial, gaming, IoT
- ✅ **EIP-712 integration** - secure decryption flow
- ✅ **Federated learning** - privacy-preserving aggregation

### **3. Judge-Friendly**
- ✅ **One-line health check** - `curl /health`
- ✅ **Clear error messages** - JSON format for all failures
- ✅ **Reproducible demos** - exact curl commands provided
- ✅ **Failure testing** - deliberate error scenarios included

---

**Built for Zama Developer Program October 2025 - Demonstrating the future of confidential AI** 🏆🚀
