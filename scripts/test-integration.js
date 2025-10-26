#!/usr/bin/env node

const axios = require('axios');
const { ethers } = require('ethers');

const BACKEND_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:3000';

async function testIntegration() {
  console.log('🧪 Z-AI Predictor Integration Test Suite');
  console.log('=====================================\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Backend Health Check
  console.log('1️⃣  Testing Backend Health...');
  try {
    const response = await axios.get(`${BACKEND_URL}/health`);
    if (response.data.success) {
      console.log('✅ Backend health check passed');
      console.log(`   Services: ${Object.keys(response.data.services || {}).join(', ')}`);
      passed++;
    } else {
      console.log('❌ Backend health check failed');
      console.log(`   Error: ${response.data.error}`);
      failed++;
    }
  } catch (error) {
    console.log('❌ Backend unreachable');
    console.log(`   Error: ${error.message}`);
    failed++;
  }
  
  // Test 2: Real Gemini API Integration
  console.log('\n2️⃣  Testing Real Gemini API...');
  try {
    const response = await axios.post(`${BACKEND_URL}/api/fetch-prediction`, {
      domain: 'financial',
      inputs: { input1: '50000', input2: '2500', input3: '7.5' }
    });
    
    if (response.data.success && response.data.prediction) {
      console.log('✅ Gemini API integration working');
      console.log(`   Prediction: ${response.data.prediction.prediction}`);
      console.log(`   Model: ${response.data.prediction.model}`);
      console.log(`   Confidence: ${(response.data.prediction.confidence * 100).toFixed(1)}%`);
      passed++;
    } else {
      console.log('❌ Gemini API failed');
      console.log(`   Response: ${JSON.stringify(response.data)}`);
      failed++;
    }
  } catch (error) {
    console.log('❌ Gemini API test failed');
    if (error.response?.data) {
      console.log(`   API Error: ${error.response.data.error}`);
      console.log(`   Service: ${error.response.data.service}`);
      console.log(`   Code: ${error.response.data.code}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    failed++;
  }
  
  // Test 3: Real CoinGecko API Integration
  console.log('\n3️⃣  Testing Real CoinGecko API...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/fetch-market/bitcoin`);
    
    if (response.data.success && response.data.data) {
      console.log('✅ CoinGecko API integration working');
      console.log(`   Bitcoin Price: $${response.data.data.price.toLocaleString()}`);
      console.log(`   24h Change: ${response.data.data.change_24h.toFixed(2)}%`);
      passed++;
    } else {
      console.log('❌ CoinGecko API failed');
      console.log(`   Response: ${JSON.stringify(response.data)}`);
      failed++;
    }
  } catch (error) {
    console.log('❌ CoinGecko API test failed');
    if (error.response?.data) {
      console.log(`   API Error: ${error.response.data.error}`);
      console.log(`   Service: ${error.response.data.service}`);
      console.log(`   Code: ${error.response.data.code}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    failed++;
  }
  
  // Test 4: Real Weather API Integration
  console.log('\n4️⃣  Testing Real Weather API...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/fetch-weather/London`);
    
    if (response.data.success && response.data.data) {
      console.log('✅ Weather API integration working');
      console.log(`   Location: ${response.data.data.city}, ${response.data.data.country}`);
      console.log(`   Temperature: ${response.data.data.temperature}°C`);
      console.log(`   Conditions: ${response.data.data.description}`);
      passed++;
    } else {
      console.log('❌ Weather API failed');
      console.log(`   Response: ${JSON.stringify(response.data)}`);
      failed++;
    }
  } catch (error) {
    console.log('❌ Weather API test failed');
    if (error.response?.data) {
      console.log(`   API Error: ${error.response.data.error}`);
      console.log(`   Service: ${error.response.data.service}`);
      console.log(`   Code: ${error.response.data.code}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    failed++;
  }
  
  // Test 5: FHE Public Key Endpoint
  console.log('\n5️⃣  Testing FHE Public Key...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/fhe-public-key`);
    
    if (response.data.success) {
      console.log('✅ FHE public key endpoint working');
      console.log(`   Public Key: ${response.data.publicKey}`);
      passed++;
    } else {
      console.log('❌ FHE public key failed');
      console.log(`   Response: ${JSON.stringify(response.data)}`);
      failed++;
    }
  } catch (error) {
    console.log('❌ FHE public key test failed');
    if (error.response?.data) {
      console.log(`   API Error: ${error.response.data.error}`);
      console.log(`   Service: ${error.response.data.service}`);
      console.log(`   Code: ${error.response.data.code}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    failed++;
  }
  
  // Test 6: Confidential Prediction Endpoint
  console.log('\n6️⃣  Testing Confidential Prediction...');
  try {
    const response = await axios.post(`${BACKEND_URL}/api/confidential-prediction`, {
      domain: 'financial',
      inputs: [50000, 2500, 7.5]
    });
    
    if (response.data.success && response.data.data) {
      console.log('✅ Confidential prediction endpoint working');
      console.log(`   AI Prediction: ${response.data.data.aiPrediction.prediction}`);
      console.log(`   Encrypted: ${response.data.data.encryptedPrediction.encrypted}`);
      console.log(`   Domain: ${response.data.data.encryptedPrediction.domain}`);
      passed++;
    } else {
      console.log('❌ Confidential prediction failed');
      console.log(`   Response: ${JSON.stringify(response.data)}`);
      failed++;
    }
  } catch (error) {
    console.log('❌ Confidential prediction test failed');
    if (error.response?.data) {
      console.log(`   API Error: ${error.response.data.error}`);
      console.log(`   Service: ${error.response.data.service}`);
      console.log(`   Code: ${error.response.data.code}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    failed++;
  }
  
  // Test 7: Frontend Accessibility
  console.log('\n7️⃣  Testing Frontend Accessibility...');
  try {
    const response = await axios.get(FRONTEND_URL, { timeout: 5000 });
    
    if (response.status === 200) {
      console.log('✅ Frontend accessible');
      console.log(`   Status: ${response.status}`);
      passed++;
    } else {
      console.log('❌ Frontend not accessible');
      console.log(`   Status: ${response.status}`);
      failed++;
    }
  } catch (error) {
    console.log('❌ Frontend accessibility test failed');
    console.log(`   Error: ${error.message}`);
    failed++;
  }
  
  // Test 8: Error Handling (Intentional Failure)
  console.log('\n8️⃣  Testing Error Handling...');
  try {
    const response = await axios.post(`${BACKEND_URL}/api/fetch-prediction`, {
      domain: 'invalid',
      inputs: {}
    });
    
    // This should fail
    console.log('❌ Error handling test failed - should have returned error');
    failed++;
  } catch (error) {
    if (error.response?.data?.success === false) {
      console.log('✅ Error handling working correctly');
      console.log(`   Error: ${error.response.data.error}`);
      console.log(`   Service: ${error.response.data.service}`);
      console.log(`   Code: ${error.response.data.code}`);
      passed++;
    } else {
      console.log('❌ Error handling test failed');
      console.log(`   Unexpected error: ${error.message}`);
      failed++;
    }
  }
  
  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('======================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! System is ready for Zama Developer Program submission.');
  } else if (passed >= 6) {
    console.log('\n⚠️  Most tests passed. Minor issues detected but system is largely functional.');
  } else {
    console.log('\n🚨 Multiple test failures detected. System needs attention before submission.');
  }
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
testIntegration().catch(error => {
  console.error('💥 Test suite crashed:', error);
  process.exit(1);
});