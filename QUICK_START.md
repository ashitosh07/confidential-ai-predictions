# 🚀 Quick Start Guide

## 1. Setup (30 seconds)
```bash
# Install everything
npm run setup

# Install Hardhat dependencies
npm install
```

## 2. Configure Environment
Edit `backend/.env`:
```bash
GEMINI_API_KEY=your-google-gemini-api-key
WEATHER_API_KEY=your-weatherapi-key
```

## 3. Start Local Blockchain
```bash
# Terminal 1: Start Hardhat node
npx hardhat node
```

## 4. Deploy & Start Services
```bash
# Terminal 2: Deploy contract
npm run deploy

# Start backend
cd backend && npm start

# Terminal 3: Start frontend
cd frontend && npm run dev
```

## 5. Test
```bash
# Health check
curl http://localhost:3001/health

# Frontend
open http://localhost:3000
```

## ⚠️ Common Issues

**CoinGecko Rate Limited**: Normal - app continues working
**Missing API Keys**: Add real keys to `backend/.env`
**Hardhat Error**: Run `npm install` first

## 🎯 Demo Ready!
- Real API integrations ✅
- FHE simulation ✅  
- Smart contract deployment ✅
- Production error handling ✅