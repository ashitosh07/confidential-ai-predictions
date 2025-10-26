import { useState, useCallback } from 'react';

interface ApiError {
  success: false;
  service: string;
  error: string;
  code: string;
}

interface PredictionResult {
  prediction: string;
  model: string;
  confidence: number;
  domain: string;
  encryptedResult?: string;
}

export function useFetchPrediction() {
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchPrediction = useCallback(async (
    domain: string,
    inputs: { input1: string; input2: string; input3: string }
  ): Promise<PredictionResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      
      const response = await fetch(`${backendUrl}/api/fetch-prediction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          domain,
          inputs
        })
      });

      const data = await response.json();
      
      // Handle API error responses
      if (!response.ok || data.success === false) {
        const apiError: ApiError = {
          success: false,
          service: data.service || 'backend',
          error: data.error || 'Prediction request failed',
          code: data.code || response.status.toString()
        };
        
        setError(apiError);
        throw apiError;
      }

      const result = data.prediction;
      setPrediction(result);
      
      return result;
      
    } catch (err: any) {
      let apiError: ApiError;
      
      if (err.success === false) {
        apiError = err;
      } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
        apiError = {
          success: false,
          service: 'backend',
          error: 'Backend API unreachable - check if server is running',
          code: 'CONNECTION_ERROR'
        };
      } else {
        apiError = {
          success: false,
          service: 'backend',
          error: `Prediction fetch failed: ${err.message}`,
          code: 'FETCH_ERROR'
        };
      }
      
      setError(apiError);
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMarketData = useCallback(async (symbol: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      
      const response = await fetch(`${backendUrl}/api/fetch-market/${symbol}`);
      const data = await response.json();
      
      if (!response.ok || data.success === false) {
        throw data;
      }
      
      return data.data;
      
    } catch (err: any) {
      if (err.success === false) {
        setError(err);
        throw err;
      }
      
      const apiError: ApiError = {
        success: false,
        service: 'coingecko',
        error: `Market data fetch failed: ${err.message}`,
        code: 'FETCH_ERROR'
      };
      
      setError(apiError);
      throw apiError;
    }
  }, []);

  return {
    fetchPrediction,
    fetchMarketData,
    isLoading,
    prediction,
    error,
    clearError: () => setError(null)
  };
}