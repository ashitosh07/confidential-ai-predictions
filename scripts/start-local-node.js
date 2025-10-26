#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🚀 Starting Local FHEVM Node for Development');
console.log('===========================================\n');

console.log('For this demo, you can use any of these options:\n');

console.log('1️⃣  **Hardhat Local Node** (Recommended for demo):');
console.log('   npx hardhat node');
console.log('   - Provides 20 test accounts with 10,000 ETH each');
console.log('   - Zero gas fees for development');
console.log('   - Runs on http://127.0.0.1:8545\n');

console.log('2️⃣  **Ganache CLI**:');
console.log('   npx ganache-cli --deterministic --accounts 10 --balance 1000 --gasPrice 0');
console.log('   - Zero gas price for testing');
console.log('   - Deterministic accounts\n');

console.log('3️⃣  **Anvil (Foundry)**:');
console.log('   anvil --gas-price 0 --base-fee 0');
console.log('   - Zero gas configuration');
console.log('   - Fast local development\n');

console.log('⚠️  **For Production**: Use actual Zama FHEVM testnet');
console.log('   FHEVM_RPC_URL=https://devnet.zama.ai (when available)');
console.log('   FHEVM_CHAIN_ID=8009\n');

console.log('💡 **Quick Start**:');
console.log('   1. Run: npx hardhat node');
console.log('   2. Keep this terminal open');
console.log('   3. In another terminal: npm run deploy');
console.log('   4. Start backend: cd backend && npm start');
console.log('   5. Start frontend: cd frontend && npm run dev\n');

console.log('🔗 **Test the deployment**:');
console.log('   curl http://localhost:3001/health');