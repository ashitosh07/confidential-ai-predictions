#!/usr/bin/env node

const axios = require('axios');

async function testAPI() {
  console.log('🧪 Testing Z-AI Predictor API...\n');
  
  try {
    // Test 1: Health Check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log('✅ Health check:', healthResponse.data.success ? 'PASSED' : 'FAILED');
    
    // Test 2: Prediction API
    console.log('\n2. Testing prediction endpoint...');
    const predictionResponse = await axios.post('http://localhost:3001/api/fetch-prediction', {
      domain: 'financial',
      inputs: {
        input1: '50000',
        input2: '2500', 
        input3: '7.5'
      }
    });
    console.log('✅ Prediction API:', predictionResponse.data.success ? 'PASSED' : 'FAILED');
    if (predictionResponse.data.success) {
      console.log('   Prediction:', predictionResponse.data.prediction.prediction);
    }
    
    // Test 3: Decryption API
    console.log('\n3. Testing decryption endpoint...');
    const decryptResponse = await axios.post('http://localhost:3001/api/public-decrypt', {
      ciphertext: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    });
    console.log('✅ Decryption API:', decryptResponse.data.success ? 'PASSED' : 'FAILED');
    if (decryptResponse.data.success) {
      console.log('   Decrypted value:', decryptResponse.data.decryptedValue);
    }
    
    console.log('\n🎉 All API tests completed!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testAPI();