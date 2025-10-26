import React from 'react';

interface PredictionCardProps {
  prediction: {
    prediction: string;
    model: string;
    confidence: number;
    domain: string;
  };
  txHash?: string | null;
  decryptedValue?: number | null;
  domain: string;
}

export function PredictionCard({ prediction, txHash, decryptedValue, domain }: PredictionCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">🤖 AI Prediction Result</h2>
      
      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-2xl">🧠</span>
          <span className="font-semibold">Prediction</span>
        </div>
        
        <p className="text-lg mb-3">{prediction.prediction}</p>
        
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <span className="font-medium">Confidence:</span> {(prediction.confidence * 100).toFixed(1)}%
          </div>
          <div>
            <span className="font-medium">Model:</span> {prediction.model}
          </div>
          <div>
            <span className="font-medium">Domain:</span> {prediction.domain}
          </div>
          {txHash && (
            <div>
              <span className="font-medium">TX:</span> {txHash.slice(0, 10)}...
            </div>
          )}
        </div>
        
        {decryptedValue && (
          <div className="mt-3 p-3 bg-green-500/20 border border-green-500/30 rounded">
            <span className="font-medium">Decrypted Value:</span> {decryptedValue}
          </div>
        )}
      </div>
    </div>
  );
}