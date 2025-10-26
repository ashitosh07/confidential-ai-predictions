import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X, Bot, TrendingUp, Cloud, Link, Shield, Wallet } from 'lucide-react';

interface ApiError {
  success: false;
  service: string;
  error: string;
  code: string;
}

interface ErrorBannerProps {
  error: ApiError;
  onDismiss: () => void;
}

export function ErrorBanner({ error, onDismiss }: ErrorBannerProps) {
  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'gemini': return Bot;
      case 'openai': return Bot;
      case 'coingecko': return TrendingUp;
      case 'weather': return Cloud;
      case 'fhevm_rpc': return Link;
      case 'zama_sdk': return Shield;
      case 'wallet': return Wallet;
      default: return AlertTriangle;
    }
  };

  const getServiceName = (service: string) => {
    switch (service) {
      case 'gemini': return 'Gemini API';
      case 'openai': return 'OpenAI API';
      case 'coingecko': return 'CoinGecko API';
      case 'weather': return 'Weather API';
      case 'fhevm_rpc': return 'FHEVM RPC';
      case 'zama_sdk': return 'Zama SDK';
      case 'wallet': return 'Wallet';
      default: return service.toUpperCase();
    }
  };

  const getSeverityColor = (code: string) => {
    if (code === '401' || code === 'INVALID_API_KEY') {
      return 'border-red-500/50 bg-red-500/10';
    }
    if (code === '429' || code.includes('RATE_LIMIT')) {
      return 'border-yellow-500/50 bg-yellow-500/10';
    }
    if (code.includes('CONNECTION') || code.includes('TIMEOUT')) {
      return 'border-orange-500/50 bg-orange-500/10';
    }
    return 'border-red-500/50 bg-red-500/10';
  };

  const ServiceIcon = getServiceIcon(error.service);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className={`glass-morphism rounded-xl p-6 mb-6 border-l-4 ${getSeverityColor(error.code)} neon-glow`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-white/10 rounded-lg">
            <ServiceIcon className="w-6 h-6 text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-red-300 mb-2">
              {getServiceName(error.service)} Error
            </h3>
            <p className="text-red-100 mb-3">{error.error}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-black/30 rounded-full text-xs font-mono">
                Code: {error.code}
              </span>
              <span className="px-3 py-1 bg-black/30 rounded-full text-xs font-mono">
                Service: {error.service}
              </span>
            </div>
            
            {/* Helpful suggestions */}
            <div className="bg-white/5 rounded-lg p-3 text-sm">
              <div className="flex items-start space-x-2">
                <span className="text-blue-400">💡</span>
                <div>
                  {error.code === '401' && (
                    <p>Check your API key configuration in environment variables</p>
                  )}
                  {error.code === '429' && (
                    <p>Rate limit reached - wait a few minutes before retrying</p>
                  )}
                  {error.code.includes('CONNECTION') && (
                    <p>Check your internet connection and service availability</p>
                  )}
                  {error.service === 'fhevm_rpc' && error.code === 'GAS_REQUIRED' && (
                    <p>This RPC requires gas fees - switch to a zero-gas FHEVM sandbox</p>
                  )}
                  {!['401', '429'].includes(error.code) && !error.code.includes('CONNECTION') && (
                    <p>Verify service configuration and try again</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onDismiss}
          className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>
      
      {/* JSON Error Display for Judges */}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300 transition-colors">
          Show Raw Error (for debugging)
        </summary>
        <motion.pre 
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          className="mt-3 text-xs bg-black/40 p-4 rounded-lg overflow-x-auto border border-white/10"
        >
          {JSON.stringify(error, null, 2)}
        </motion.pre>
      </details>
    </motion.div>
  );
}