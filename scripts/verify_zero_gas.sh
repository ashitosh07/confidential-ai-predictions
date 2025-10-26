#!/bin/bash

# Z-AI Predictor Zero-Gas Verification Script
# Validates that FHEVM RPC accepts zero-gas transactions

set -e

echo "🔍 Z-AI Predictor Zero-Gas Verification"
echo "======================================="

# Check if backend is running
echo "📡 Checking backend health..."
HEALTH_RESPONSE=$(curl -s http://localhost:3001/health || echo "FAILED")

if [[ "$HEALTH_RESPONSE" == "FAILED" ]]; then
    echo "❌ Backend not reachable at http://localhost:3001"
    echo "   Start backend with: cd backend && npm start"
    exit 1
fi

# Parse health response
if echo "$HEALTH_RESPONSE" | grep -q '"success":false'; then
    echo "❌ Health check failed:"
    echo "$HEALTH_RESPONSE" | jq '.'
    exit 1
fi

echo "✅ Backend health check passed"

# Extract FHEVM RPC URL from environment or default
FHEVM_RPC_URL=${FHEVM_RPC_URL:-"http://127.0.0.1:8545"}
echo "🔗 Testing FHEVM RPC: $FHEVM_RPC_URL"

# Test zero-gas transaction using curl
echo "⛽ Testing zero-gas transaction acceptance..."

# Create test transaction with zero gas price
TEST_TX='{
  "jsonrpc": "2.0",
  "method": "eth_estimateGas",
  "params": [{
    "to": "0x0000000000000000000000000000000000000001",
    "value": "0x0",
    "gasPrice": "0x0",
    "data": "0x"
  }],
  "id": 1
}'

# Send test transaction
RPC_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$TEST_TX" \
  "$FHEVM_RPC_URL" || echo "FAILED")

if [[ "$RPC_RESPONSE" == "FAILED" ]]; then
    echo "❌ FHEVM RPC unreachable"
    echo '{"success":false,"service":"fhevm_rpc","error":"RPC endpoint unreachable","code":"CONNECTION_ERROR"}'
    exit 1
fi

# Check for gas-related errors
if echo "$RPC_RESPONSE" | grep -q -i "gas\|insufficient"; then
    echo "❌ RPC rejected zero-gas transaction:"
    echo "$RPC_RESPONSE" | jq '.'
    echo ""
    echo '{"success":false,"service":"fhevm_rpc","error":"Sandbox RPC rejected transaction: gas required","code":"GAS_REQUIRED"}'
    exit 1
fi

# Check for other RPC errors
if echo "$RPC_RESPONSE" | grep -q '"error"'; then
    echo "❌ RPC error:"
    echo "$RPC_RESPONSE" | jq '.'
    ERROR_MSG=$(echo "$RPC_RESPONSE" | jq -r '.error.message // "Unknown RPC error"')
    echo ""
    echo "{\"success\":false,\"service\":\"fhevm_rpc\",\"error\":\"RPC error: $ERROR_MSG\",\"code\":\"RPC_ERROR\"}"
    exit 1
fi

echo "✅ Zero-gas transaction accepted"

# Test with actual account if available
if [[ -n "$TEST_PRIVATE_KEY" ]]; then
    echo "🔑 Testing with configured test account..."
    
    # TODO: Add actual transaction test with test account
    # This would require ethers.js or web3.js to sign and send
    echo "⚠️  Test account validation not implemented yet"
fi

echo ""
echo "🎉 Zero-gas verification completed successfully!"
echo "✅ Backend health: PASSED"
echo "✅ FHEVM RPC connectivity: PASSED" 
echo "✅ Zero-gas acceptance: PASSED"
echo ""
echo "Ready for Z-AI Predictor demo! 🚀"