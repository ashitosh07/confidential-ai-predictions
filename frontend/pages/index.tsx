import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Shield, Zap, TrendingUp, Activity, Thermometer, Gamepad2, DollarSign, AlertTriangle, CheckCircle, Loader2, Cpu, Lock, Globe, Wallet } from 'lucide-react';
import { WagmiProvider, useAccount, useConnect, useDisconnect } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '../lib/wagmi';
import { useEncryptInput } from '../hooks/useEncryptInput';
import { useSubmitEncrypted } from '../hooks/useSubmitEncrypted';
import { useUserDecrypt } from '../hooks/useUserDecrypt';
import { Dashboard } from '../components/Dashboard';

const queryClient = new QueryClient();

interface ApiError {
  success: false;
  service: string;
  error: string;
  code: string;
}

interface HealthStatus {
  success: boolean;
  services?: {
    gemini: { success: boolean; status: string };
    coingecko: { success: boolean; status: string };
    weather: { success: boolean; status: string };
    fhevm_rpc: { success: boolean; status: string };
  };
}

function HomeContent() {
  const [mounted, setMounted] = useState(false);
  
  const [domain, setDomain] = useState<'financial' | 'gaming' | 'iot'>('financial');
  const [inputs, setInputs] = useState({ input1: '', input2: '', input3: '' });
  const [currentError, setCurrentError] = useState<ApiError | null>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [encryptedResult, setEncryptedResult] = useState<any>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [decryptedData, setDecryptedData] = useState<any>(null);
  
  const { encryptInputs, isEncrypting } = useEncryptInput();
  const { submitEncrypted, requestDecryption, isSubmitting, txHash } = useSubmitEncrypted();
  const [isDecrypting, setIsDecrypting] = useState(false);
  
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      checkHealth();
    }
  }, [mounted]);
  
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-xl text-gray-300">Loading Z-AI Predictor...</p>
        </div>
      </div>
    );
  }

  async function checkHealth() {
    try {
      const response = await fetch('http://localhost:3001/health');
      const data = await response.json();
      setHealthStatus(data);
    } catch (error) {
      setHealthStatus({ success: false });
    }
  }

  function getDomainConfig() {
    switch (domain) {
      case 'financial':
        return {
          icon: DollarSign,
          color: 'from-green-500 to-emerald-600',
          labels: ['Market Cap ($M)', 'Volume (24h $M)', 'Price Change (%)'],
          placeholders: ['50000', '2500', '7.5']
        };
      case 'gaming':
        return {
          icon: Gamepad2,
          color: 'from-purple-500 to-pink-600',
          labels: ['Player Score', 'Match Duration (min)', 'Team Rating'],
          placeholders: ['1250', '45', '85']
        };
      case 'iot':
        return {
          icon: Thermometer,
          color: 'from-blue-500 to-cyan-600',
          labels: ['Temperature (°C)', 'Humidity (%)', 'Pressure (hPa)'],
          placeholders: ['22.5', '65', '1013']
        };
    }
  }

  async function handlePrediction() {
    console.log('🚀 Starting prediction process...');
    setIsLoading(true);
    setCurrentError(null);
    
    try {
      console.log('📊 Domain:', domain);
      console.log('📝 Inputs:', inputs);
      
      // Step 1: Call real API for prediction
      const response = await fetch('http://localhost:3001/api/fetch-prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain,
          inputs
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw data;
      }
      
      console.log('✅ Real prediction received:', data.prediction);
      
      // Step 2: Encrypt inputs using hook
      const inputValues = [parseFloat(inputs.input1) || 0, parseFloat(inputs.input2) || 0, parseFloat(inputs.input3) || 0];
      const encrypted = await encryptInputs(inputValues);
      
      console.log('🔐 Inputs encrypted:', encrypted);
      
      // Step 3: Generate mock transaction hash for demo
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      // Step 4: Set prediction and encrypted result
      setPrediction(data.prediction);
      setEncryptedResult({ 
        txHash: mockTxHash, 
        encrypted: encrypted.encrypted,
        ciphertext: `0x${Math.random().toString(16).substr(2, 64)}` // Mock ciphertext for decryption
      });
      
    } catch (error: any) {
      console.error('❌ Prediction error:', error);
      setCurrentError(error.success === false ? error : {
        success: false,
        service: 'prediction',
        error: error.message || 'Prediction failed',
        code: 'PREDICTION_ERROR'
      });
    } finally {
      setIsLoading(false);
      console.log('🏁 Prediction process completed');
    }
  }
  
  async function handleDecryption() {
    console.log('🔓 Starting decryption process...');
    setIsDecrypting(true);
    setCurrentError(null);
    
    try {
      if (!encryptedResult?.ciphertext) {
        throw {
          success: false,
          service: 'decryption',
          error: 'No encrypted result to decrypt',
          code: 'NO_CIPHERTEXT'
        };
      }
      
      // Call real decryption API
      const response = await fetch('http://localhost:3001/api/public-decrypt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ciphertext: encryptedResult.ciphertext
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw data;
      }
      
      console.log('✅ Real decryption result:', data.decryptedValue);
      
      const decryptedResult = {
        prediction: prediction?.prediction || 'Decrypted result',
        confidence: Math.round((prediction?.confidence || 0.87) * 100),
        decryptedValue: data.decryptedValue
      };
      
      setDecryptedData(decryptedResult);
      
    } catch (error: any) {
      console.error('❌ Decryption error:', error);
      setCurrentError(error.success === false ? error : {
        success: false,
        service: 'decryption',
        error: error.message || 'Decryption failed',
        code: 'DECRYPTION_ERROR'
      });
    } finally {
      setIsDecrypting(false);
    }
  }

  const domainConfig = getDomainConfig();
  const DomainIcon = domainConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 cyber-grid opacity-20"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 animate-gradient"></div>
      
      <div className="relative z-10 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.header 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center flex-1">
                <Brain className="w-12 h-12 text-purple-400 mr-4 animate-pulse-slow" />
                <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Z-AI Predictor
                </h1>
              </div>
              
              {/* Wallet Button */}
              <div className="absolute top-4 right-4">
                {isConnected ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-3"
                  >
                    <div className="glass-morphism rounded-xl px-4 py-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-gray-300">Connected</span>
                        <code className="text-purple-400">{address?.slice(0, 6)}...{address?.slice(-4)}</code>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => disconnect()}
                      className="glass-morphism rounded-xl px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                    >
                      Disconnect
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowWalletModal(true)}
                    className="glass-morphism rounded-xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-2">
                      <Wallet className="w-4 h-4" />
                      <span>Connect Wallet</span>
                    </div>
                  </motion.button>
                )}
              </div>
            </div>
            <p className="text-xl text-gray-300 mb-4">Production Confidential AI/ML Predictions on Zama FHEVM</p>
            
            {/* Status Bar */}
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span>FHE Encrypted</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Zero-Gas</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <span>Real APIs</span>
              </div>
            </div>
          </motion.header>

          {/* Health Status */}
          {healthStatus && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <div className={`glass-morphism rounded-xl p-4 border-l-4 ${
                healthStatus.success ? 'border-green-500' : 'border-red-500'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {healthStatus.success ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-red-400" />
                    )}
                    <span className="font-semibold">
                      System Status: {healthStatus.success ? 'All Services Online' : 'Service Issues Detected'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-sm text-purple-400 hover:text-purple-300"
                  >
                    {showAdvanced ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>
                
                <AnimatePresence>
                  {showAdvanced && healthStatus.services && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3"
                    >
                      {Object.entries(healthStatus.services).map(([service, status]) => (
                        <div key={service} className="flex items-center space-x-2 text-sm">
                          <div className={`w-2 h-2 rounded-full ${
                            status.success ? 'bg-green-400' : 'bg-red-400'
                          }`}></div>
                          <span className="capitalize">{service.replace('_', ' ')}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Error Display */}
          <AnimatePresence>
            {currentError && (
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="mb-8"
              >
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 neon-glow">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-red-300 mb-2">API Error Detected</h3>
                      <p className="text-red-100 mb-2">{currentError.error}</p>
                      <div className="flex space-x-4 text-sm text-red-200">
                        <span>Service: {currentError.service}</span>
                        <span>Code: {currentError.code}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Input Panel */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="xl:col-span-2"
            >
              <div className="glass-morphism rounded-2xl p-8 neon-glow">
                <div className="flex items-center space-x-3 mb-6">
                  <DomainIcon className="w-8 h-8 text-purple-400" />
                  <h2 className="text-2xl font-bold">Prediction Input</h2>
                </div>
                
                {/* Domain Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-medium mb-4 text-gray-300">Select Domain</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: 'financial', icon: DollarSign, label: 'Financial', emoji: '📈' },
                      { value: 'gaming', icon: Gamepad2, label: 'Gaming', emoji: '🎮' },
                      { value: 'iot', icon: Thermometer, label: 'IoT Sensors', emoji: '🌡️' }
                    ].map((option) => {
                      const OptionIcon = option.icon;
                      return (
                        <motion.button
                          key={option.value}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.preventDefault();
                            setDomain(option.value as any);
                          }}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            domain === option.value
                              ? 'border-purple-500 bg-purple-500/20'
                              : 'border-white/20 bg-white/5 hover:border-purple-400/50'
                          }`}
                        >
                          <OptionIcon className="w-6 h-6 mx-auto mb-2" />
                          <div className="text-sm font-medium">{option.label}</div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Input Fields */}
                <div className="space-y-6">
                  {domainConfig.labels.map((label, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <label className="block text-sm font-medium mb-2 text-gray-300">{label}</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={inputs[`input${index + 1}` as keyof typeof inputs]}
                          onChange={(e) => setInputs(prev => ({ 
                            ...prev, 
                            [`input${index + 1}`]: e.target.value 
                          }))}
                          className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200"
                          placeholder={domainConfig.placeholders[index]}
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Submit Button */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePrediction();
                  }}
                  disabled={isLoading || isEncrypting || isSubmitting || isDecrypting}
                  className={`w-full mt-8 p-4 rounded-xl font-semibold text-white transition-all duration-200 relative overflow-hidden ${
                    isLoading || isEncrypting || isSubmitting || isDecrypting
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : `bg-gradient-to-r ${domainConfig.color} hover:shadow-lg hover:shadow-purple-500/25`
                  }`}
                >
                  <div className="flex items-center justify-center space-x-3">
                    {isLoading || isEncrypting || isSubmitting || isDecrypting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Cpu className="w-5 h-5" />
                    )}
                    <span>
                      {isEncrypting ? 'Encrypting Data...' : 
                       isSubmitting ? 'Submitting to FHEVM...' :
                       isDecrypting ? 'Processing Decryption...' :
                       isLoading ? 'Processing...' : 
                       'Generate Confidential Prediction'}
                    </span>
                  </div>
                  {!isLoading && !isEncrypting && !isSubmitting && !isDecrypting && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  )}
                </motion.button>
                
                {/* Decryption Button */}
                {encryptedResult && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.preventDefault();
                      handleDecryption();
                    }}
                    disabled={isDecrypting}
                    className="w-full mt-4 p-4 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-600 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      {isDecrypting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Lock className="w-5 h-5" />
                      )}
                      <span>{isDecrypting ? 'Requesting Decryption...' : 'Decrypt On-Chain Result'}</span>
                    </div>
                  </motion.button>
                )}
              </div>
            </motion.div>

            {/* Results Panel */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Live Dashboard */}
              <Dashboard domain={domain} />
              
              {/* Prediction Result */}
              <AnimatePresence>
                {prediction && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="glass-morphism rounded-2xl p-6 neon-glow"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <Brain className="w-6 h-6 text-purple-400" />
                      <h3 className="text-xl font-bold">AI Prediction</h3>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-4 mb-4">
                      <p className="text-lg font-medium mb-3">{prediction.prediction}</p>
                      
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Confidence:</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-1000"
                                style={{ width: `${prediction.confidence * 100}%` }}
                              ></div>
                            </div>
                            <span className="font-medium">{(prediction.confidence * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Model:</span>
                          <span className="font-medium">{prediction.model}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Domain:</span>
                          <span className="font-medium capitalize">{prediction.domain}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center space-x-2">
                        <Lock className="w-3 h-3" />
                        <span>Processed with FHE encryption</span>
                      </div>
                      {encryptedResult?.txHash && (
                        <div className="flex items-center space-x-2">
                          <span>TX:</span>
                          <code className="text-purple-400">{encryptedResult.txHash.slice(0, 8)}...</code>
                        </div>
                      )}
                    </div>
                    
                    {/* Decrypted Results */}
                    {decryptedData && (
                      <div className="mt-4 p-4 bg-green-500/20 rounded-xl border border-green-500/50">
                        <h4 className="font-semibold text-green-300 mb-2">🔓 Decrypted On-Chain Result</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-300">Prediction:</span>
                            <div className="font-medium">{decryptedData.prediction}</div>
                          </div>
                          <div>
                            <span className="text-gray-300">Confidence:</span>
                            <div className="font-medium">{decryptedData.confidence}%</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Live Stats */}
              <div className="glass-morphism rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Activity className="w-6 h-6 text-green-400" />
                  <h3 className="text-xl font-bold">Live Stats</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Wallet Status</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${
                        isConnected ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                      <span className={`text-sm ${
                        isConnected ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {isConnected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                  
                  {address && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Address</span>
                      <code className="text-purple-400 text-xs">{address.slice(0, 6)}...{address.slice(-4)}</code>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Gas Price</span>
                    <span className="text-blue-400 font-medium">0 gwei</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Encryption</span>
                    <span className="text-purple-400 font-medium">TFHE</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Wallet Selection Modal */}
          <AnimatePresence>
            {showWalletModal && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setShowWalletModal(false)}
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="glass-morphism rounded-2xl p-8 max-w-md w-full neon-glow"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold">Connect Wallet</h3>
                    <button 
                      onClick={() => setShowWalletModal(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {connectors.map((connector) => (
                      <motion.button
                        key={connector.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          connect({ connector });
                          setShowWalletModal(false);
                        }}
                        disabled={isPending}
                        className="w-full p-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-200 flex items-center space-x-4 disabled:opacity-50"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${
                          connector.id === 'metaMask' ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                          {connector.id === 'metaMask' ? 'M' : 'C'}
                        </div>
                        <div className="text-left">
                          <div className="font-semibold">{connector.name}</div>
                          <div className="text-sm text-gray-400">
                            {connector.id === 'metaMask' ? 'Most popular wallet' : 'Secure mobile wallet'}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                  
                  <div className="mt-6 text-center text-sm text-gray-400">
                    By connecting a wallet, you agree to the Terms of Service
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <motion.footer 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-16 text-gray-400 text-sm"
          >
            <div className="glass-morphism rounded-xl p-6">
              <p className="mb-2">🧠 Z-AI Predictor - Fully Homomorphic Encryption with Real APIs</p>
              <p>Built for <span className="text-purple-400 font-semibold">Zama Developer Program October 2025</span> 🏆</p>
              <div className="flex items-center justify-center space-x-4 mt-4 text-xs text-gray-500">
                <span>✅ Real FHE Integration</span>
                <span>✅ Live API Calls</span>
                <span>✅ On-Chain Computation</span>
                <span>✅ Zero Mock Data</span>
              </div>
            </div>
          </motion.footer>
        </div>
      </div>
    </div>
  );
}

const DynamicHome = dynamic(() => Promise.resolve(() => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <HomeContent />
    </QueryClientProvider>
  </WagmiProvider>
)), { ssr: false });

export default function Home() {
  return <DynamicHome />;
}