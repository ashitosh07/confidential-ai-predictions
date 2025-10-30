import { useState, useCallback } from 'react';

interface ApiError {
  success: false;
  service: string;
  error: string;
  code: string;
}

interface EncryptedData {
  encrypted: any[];
  proof: string;
  timestamp: number;
}

export function useEncryptInput() {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptedData, setEncryptedData] = useState<EncryptedData | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const encryptInputs = useCallback(async (inputs: number[]): Promise<EncryptedData> => {
    setIsEncrypting(true);
    setError(null);
    
    try {
      // Call backend encryption API for FHE operations
      const response = await fetch('http://localhost:3001/api/encrypt-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: inputs })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw result;
      }
      
      const encryptedData = {
        encrypted: result.encrypted.encrypted,
        proof: generateProof(result.encrypted.encrypted),
        timestamp: result.encrypted.timestamp
      };
      
      setEncryptedData(encryptedData);
      return encryptedData;
      
    } catch (err: any) {
      const apiError: ApiError = err.success === false ? err : {
        success: false,
        service: 'zama_sdk',
        error: `Encryption failed: ${err.message}`,
        code: 'ENCRYPTION_ERROR'
      };
      
      setError(apiError);
      throw apiError;
    } finally {
      setIsEncrypting(false);
    }
  }, []);

  return {
    encryptInputs,
    isEncrypting,
    encryptedData,
    error,
    clearError: () => setError(null)
  };
}

// Helper function to generate proof
function generateProof(encrypted: any[]): string {
  const proofData = encrypted.map(e => e.data).join('');
  return `0x${proofData.slice(2, 66)}`; // Take first 32 bytes as proof
}