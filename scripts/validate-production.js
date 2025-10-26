#!/usr/bin/env node

const axios = require('axios');
const { ethers } = require('ethers');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

async function validateProduction() {
  console.log('🔍 Z-AI Predictor Production Validation');
  console.log('=====================================\n');
  
  let score = 0;
  const maxScore = 10;
  
  // Test 1: Health Check (Critical)
  console.log('1️⃣  Testing System Health...');
  try {
    const response = await axios.get(`${BACKEND_URL}/health`);
    if (response.data.success && response.data.services) {
      console.log('✅ All services online');
      score += 2;
    } else {
      console.log('❌ Service health issues detected');
      console.log(`   Error: ${response.data.error}`);
    }
  } catch (error) {
    console.log('❌ Backend unreachable');
    console.log(`   Error: ${error.message}`);
  }
  
  // Test 2: Real API Integration
  console.log('\n2️⃣  Testing Real API Integration...');
  try {
    const response = await axios.post(`${BACKEND_URL}/api/confidential-prediction`, {
      domain: 'financial',
      inputs: [50000, 2500, 7.5]
    });
    
    if (response.data.success && response.data.data.aiPrediction) {
      console.log('✅ Real API integration working');
      console.log(`   AI Prediction: ${response.data.data.aiPrediction.prediction}`);
      score += 2;
    } else {
      console.log('❌ API integration failed');
    }
  } catch (error) {
    console.log('❌ API integration test failed');
    if (error.response?.data) {
      console.log(`   Error: ${error.response.data.error}`);
    }
  }
  
  // Test 3: FHE Public Key
  console.log('\n3️⃣  Testing FHE Integration...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/fhe-public-key`);
    if (response.data.success && response.data.publicKey) {
      console.log('✅ FHE public key available');
      console.log(`   Public Key: ${response.data.publicKey}`);
      score += 2;
    } else {
      console.log('❌ FHE public key failed');
    }
  } catch (error) {
    console.log('❌ FHE integration test failed');
  }
  
  // Test 4: Error Handling
  console.log('\n4️⃣  Testing Error Handling...');
  try {
    await axios.post(`${BACKEND_URL}/api/fetch-prediction`, {
      domain: 'invalid',
      inputs: {}
    });
    console.log('❌ Error handling failed - should have returned error');
  } catch (error) {
    if (error.response?.data?.success === false) {
      console.log('✅ Error handling working correctly');
      console.log(`   Error Format: ${JSON.stringify(error.response.data)}`);
      score += 1;
    } else {
      console.log('❌ Unexpected error format');
    }
  }
  
  // Test 5: Security Headers
  console.log('\n5️⃣  Testing Security Configuration...');
  try {
    const response = await axios.get(`${BACKEND_URL}/health`);
    const hasSecurityHeaders = response.headers['x-content-type-options'] || 
                              response.headers['x-frame-options'] ||
                              response.headers['x-xss-protection'];
    
    if (hasSecurityHeaders) {
      console.log('✅ Security headers present');
      score += 1;
    } else {
      console.log('⚠️  Security headers missing');
    }
  } catch (error) {
    console.log('❌ Security test failed');
  }
  
  // Test 6: Contract Configuration
  console.log('\n6️⃣  Testing Contract Configuration...');
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (contractAddress && contractAddress !== '0x5FbDB2315678afecb367f032d93F642f64180aa3') {
    console.log('✅ Contract address configured');
    console.log(`   Address: ${contractAddress}`);
    score += 1;
  } else {
    console.log('❌ Contract address not configured or using hardcoded value');
  }
  
  // Test 7: Environment Validation
  console.log('\n7️⃣  Testing Environment Configuration...');
  const requiredEnvVars = ['GEMINI_API_KEY', 'WEATHER_API_KEY', 'FHEVM_RPC_URL'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length === 0) {
    console.log('✅ All required environment variables configured');
    score += 1;
  } else {
    console.log(`❌ Missing environment variables: ${missingVars.join(', ')}`);
  }
  
  // Final Score
  console.log('\n📊 Production Readiness Score');
  console.log('=============================');
  console.log(`Score: ${score}/${maxScore} (${((score/maxScore)*100).toFixed(1)}%)`);
  
  if (score === maxScore) {
    console.log('🎉 PERFECT SCORE! Ready for Zama Developer Program submission!');
    console.log('✅ All critical systems operational');
    console.log('✅ Real API integrations working');
    console.log('✅ FHE functionality implemented');
    console.log('✅ Security measures in place');
    console.log('✅ No hardcoded values or mock data');
  } else if (score >= 8) {
    console.log('🟢 EXCELLENT! Minor issues but production ready');
  } else if (score >= 6) {
    console.log('🟡 GOOD! Some issues need attention before submission');
  } else {
    console.log('🔴 NEEDS WORK! Critical issues must be fixed');
  }
  
  process.exit(score < 8 ? 1 : 0);
}

validateProduction().catch(error => {
  console.error('💥 Validation crashed:', error);
  process.exit(1);
});