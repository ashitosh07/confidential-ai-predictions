#!/usr/bin/env node

const { Command } = require('commander');
const axios = require('axios');

const program = new Command();

program
  .name('z-ai-cli')
  .description('CLI for Z-AI Predictor - Production Confidential AI/ML Predictions')
  .version('1.0.0');

// Validate external services before proceeding
async function validateServices() {
  try {
    console.log('🔍 Validating external services...');
    
    const response = await axios.get('http://localhost:3001/health');
    
    if (!response.data.success) {
      console.error('❌ Service validation failed:', JSON.stringify(response.data, null, 2));
      process.exit(1);
    }
    
    console.log('✅ All services validated');
    return true;
  } catch (error) {
    console.error('❌ Backend unreachable:', {
      success: false,
      service: 'backend',
      error: 'Backend API unreachable - ensure server is running on port 3001',
      code: 'CONNECTION_ERROR'
    });
    process.exit(1);
  }
}

program
  .command('encrypt')
  .description('Encrypt input data using FHEVM')
  .argument('<data>', 'Comma-separated input values')
  .action(async (data) => {
    await validateServices();
    
    const inputs = data.split(',').map(x => parseFloat(x.trim()));
    console.log('🔐 Encrypting inputs:', inputs);
    
    // TODO: Real FHEVM encryption
    console.log('⚠️  Real FHEVM encryption not implemented - requires fhevmjs integration');
    console.log('Encrypted (mock):', inputs.map(x => `0x${x.toString(16).padStart(64, '0')}`));
  });

program
  .command('submit')
  .description('Submit encrypted data to FHEVM contract')
  .argument('<encrypted>', 'Encrypted data')
  .argument('<domain>', 'Prediction domain')
  .action(async (encrypted, domain) => {
    await validateServices();
    
    console.log('📡 Submitting to FHEVM contract...');
    console.log('Domain:', domain);
    console.log('Encrypted data:', encrypted);
    
    // TODO: Real contract submission
    console.log('⚠️  Real contract submission not implemented - requires contract deployment');
    console.log('Mock transaction hash:', `0x${Math.random().toString(16).substr(2, 64)}`);
  });

program
  .command('decrypt')
  .description('Decrypt FHEVM result')
  .argument('<ciphertext>', 'Encrypted result')
  .action(async (ciphertext) => {
    await validateServices();
    
    console.log('🔓 Decrypting result...');
    
    try {
      const response = await axios.post('http://localhost:3001/api/public-decrypt', {
        ciphertext
      });
      
      if (response.data.success) {
        console.log('✅ Decrypted value:', response.data.decryptedValue);
      } else {
        console.error('❌ Decryption failed:', JSON.stringify(response.data, null, 2));
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Decryption error:', {
        success: false,
        service: 'zama_sdk',
        error: error.message,
        code: 'DECRYPTION_ERROR'
      });
      process.exit(1);
    }
  });

program
  .command('predict')
  .description('Get AI prediction (full pipeline demo)')
  .option('-d, --domain <domain>', 'Prediction domain', 'financial')
  .option('-i, --inputs <inputs>', 'Input values (comma-separated)', '50000,2500,7.5')
  .action(async (options) => {
    await validateServices();
    
    console.log('🤖 Getting AI prediction...');
    console.log('Domain:', options.domain);
    console.log('Inputs:', options.inputs);
    
    try {
      const inputs = options.inputs.split(',');
      const response = await axios.post('http://localhost:3001/api/fetch-prediction', {
        domain: options.domain,
        inputs: {
          input1: inputs[0]?.trim() || '0',
          input2: inputs[1]?.trim() || '0', 
          input3: inputs[2]?.trim() || '0'
        }
      });
      
      if (response.data.success) {
        console.log('✅ Prediction received:');
        console.log('📊 Result:', response.data.prediction.prediction);
        console.log('🎯 Confidence:', (response.data.prediction.confidence * 100).toFixed(1) + '%');
        console.log('🤖 Model:', response.data.prediction.model);
      } else {
        console.error('❌ Prediction failed:', JSON.stringify(response.data, null, 2));
        process.exit(1);
      }
    } catch (error) {
      if (error.response?.data) {
        console.error('❌ API Error:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.error('❌ Request failed:', {
          success: false,
          service: 'backend',
          error: error.message,
          code: 'REQUEST_ERROR'
        });
      }
      process.exit(1);
    }
  });

program.parse();