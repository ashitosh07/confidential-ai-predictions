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
      // Simulate FHE encryption for demo purposes
      // In production, this would use real fhevmjs SDK
      const encrypted = await Promise.all(
        inputs.map(async (input, index) => {
          // Simulate encryption delay
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Generate deterministic "encrypted" data for demo
          const inputBytes = new TextEncoder().encode(input.toString());
          const hash = await crypto.subtle.digest('SHA-256', inputBytes);
          const hashArray = new Uint8Array(hash);
          
          return {
            data: `0x${Array.from(hashArray.slice(0, 32)).map(b => b.toString(16).padStart(2, '0')).join('')}`,
            handles: `0x${Array.from(hashArray.slice(0, 16)).map(b => b.toString(16).padStart(2, '0')).join('')}`
          };
        })
      );
      
      const result = {
        encrypted,
        proof: generateProof(encrypted),
        timestamp: Date.now()
      };
      
      setEncryptedData(result);
      return result;
      
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