#!/usr/bin/env node

const axios = require('axios');

async function checkStatus() {
  console.log('🔍 Z-AI Predictor Status Check\n');
  
  try {
    // 1. Backend Health Check
    console.log('1. Backend Health Check...');
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log(`   ✅ Backend: ${healthResponse.data.success ? 'ONLINE' : 'ISSUES'}`);
    
    if (healthResponse.data.services) {
      Object.entries(healthResponse.data.services).forEach(([service, status]) => {
        console.log(`   ${status.success ? '✅' : '❌'} ${service}: ${status.success ? 'OK' : 'FAILED'}`);
      });
    }
    
    // 2. API Endpoints Check
    console.log('\n2. API Endpoints Check...');
    
    // Market Data
    try {
      const marketResponse = await axios.get('http://localhost:3001/api/fetch-market/bitcoin');
      console.log(`   ✅ Market API: ${marketResponse.data.success ? 'WORKING' : 'FAILED'}`);
      if (marketResponse.data.success) {
        console.log(`      Bitcoin: $${marketResponse.data.data.price.toLocaleString()}`);
      }
    } catch (error) {
      console.log(`   ❌ Market API: ERROR - ${error.response?.data?.error || error.message}`);
    }
    
    // Weather Data
    try {
      const weatherResponse = await axios.get('http://localhost:3001/api/fetch-weather/London');
      console.log(`   ✅ Weather API: ${weatherResponse.data.success ? 'WORKING' : 'FAILED'}`);
      if (weatherResponse.data.success) {
        console.log(`      London: ${weatherResponse.data.data.temperature}°C`);
      }
    } catch (error) {
      console.log(`   ❌ Weather API: ERROR - ${error.response?.data?.error || error.message}`);
    }
    
    // Prediction API
    try {
      const predictionResponse = await axios.post('http://localhost:3001/api/fetch-prediction', {
        domain: 'financial',
        inputs: { input1: '50000', input2: '2500', input3: '7.5' }
      });
      console.log(`   ✅ Prediction API: ${predictionResponse.data.success ? 'WORKING' : 'FAILED'}`);
      if (predictionResponse.data.success) {
        console.log(`      Result: ${predictionResponse.data.prediction.prediction}`);
      }
    } catch (error) {
      console.log(`   ❌ Prediction API: ERROR - ${error.response?.data?.error || error.message}`);
    }
    
    // Decryption API
    try {
      const decryptResponse = await axios.post('http://localhost:3001/api/public-decrypt', {
        ciphertext: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      });
      console.log(`   ✅ Decryption API: ${decryptResponse.data.success ? 'WORKING' : 'FAILED'}`);
    } catch (error) {
      console.log(`   ❌ Decryption API: ERROR - ${error.response?.data?.error || error.message}`);
    }
    
    // 3. CORS Check
    console.log('\n3. CORS Configuration...');
    try {
      const corsResponse = await axios.options('http://localhost:3001/health');
      console.log('   ✅ CORS: Properly configured');
    } catch (error) {
      console.log('   ❌ CORS: May have issues');
    }
    
    console.log('\n🎉 Status check completed!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Start frontend: cd frontend && npm run dev');
    console.log('   2. Open browser: http://localhost:3000');
    console.log('   3. Test Live Market Data dashboard');
    
  } catch (error) {
    console.error('❌ Status check failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure backend is running: cd backend && npm start');
    console.log('   2. Check API keys in backend/.env');
    console.log('   3. Verify port 3001 is not blocked');
  }
}

checkStatus();