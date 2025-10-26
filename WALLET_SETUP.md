# 🔧 Wallet Setup for Zero-Gas Demo

## 🎯 **MetaMask Configuration**

### **1. Add Local Network**
```
Network Name: Hardhat Local
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency Symbol: ETH
```

### **2. Import Test Account**
```
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Balance: 10,000 ETH
```

### **3. Zero Gas Configuration**
The Hardhat node is configured for zero gas fees:
- Base Fee: 0
- Gas Price: 0
- All transactions are free

## 🚨 **OKX Wallet Issues**

If using OKX Wallet instead of MetaMask:

### **Problem**: OKX may not support zero gas transactions
### **Solution**: Switch to MetaMask for demo

```bash
# 1. Install MetaMask extension
# 2. Add Hardhat network (settings above)
# 3. Import test account
# 4. Refresh page and connect MetaMask
```

## 🔧 **Alternative: Skip Wallet Demo**

For API-only demonstration:

```bash
# Test real API integrations without wallet
curl -X POST http://localhost:3001/api/fetch-prediction \
  -H "Content-Type: application/json" \
  -d '{"domain":"financial","inputs":{"input1":"50000","input2":"2500","input3":"7.5"}}'

curl http://localhost:3001/api/fetch-market/bitcoin
curl http://localhost:3001/api/fetch-weather/London
```

## ✅ **Demo Ready Checklist**
- [ ] Hardhat node running (`npx hardhat node`)
- [ ] MetaMask connected to local network
- [ ] Test account imported with 10,000 ETH
- [ ] Backend running (`cd backend && npm start`)
- [ ] Frontend running (`cd frontend && npm run dev`)
- [ ] Health check passing (`curl http://localhost:3001/health`)