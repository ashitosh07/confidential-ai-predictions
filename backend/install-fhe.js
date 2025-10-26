// Install script for FHEVM dependencies
const { execSync } = require('child_process');

console.log('Installing FHEVM dependencies...');

try {
  // Install fhevmjs for backend
  execSync('npm install fhevmjs@0.5.0', { stdio: 'inherit', cwd: __dirname });
  
  // Install frontend dependencies
  execSync('npm install fhevmjs@0.5.0', { 
    stdio: 'inherit', 
    cwd: require('path').join(__dirname, '../frontend') 
  });
  
  console.log('✅ FHEVM dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}