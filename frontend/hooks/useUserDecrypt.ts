import { useState, useCallback } from 'react';
import { ethers } from 'ethers';

interface ApiError {
  success: false;
  service: string;
  error: string;
  code: string;
}

const CONTRACT_ABI = [
  "function getDecryptedResults(address) external view returns (uint256[])",
  "function hasDecryptedResults(address) external view returns (bool)"
];

export function useUserDecrypt() {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedData, setDecryptedData] = useState<any>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const decryptResult = useCallback(async (userAddress: string, provider: ethers.Provider): Promise<any> => {
    setIsDecrypting(true);
    setError(null);
    
    try {
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw {
          success: false,
          service: 'contract',
          error: 'Contract address not configured',
          code: 'CONTRACT_NOT_DEPLOYED'
        };
      }
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
      
      // Check if decrypted results are available
      const hasResults = await contract.hasDecryptedResults(userAddress);
      
      if (!hasResults) {
        throw {
          success: false,
          service: 'contract',
          error: 'No decrypted results available yet',
          code: 'NO_RESULTS'
        };
      }
      
      // Get decrypted results
      const results = await contract.getDecryptedResults(userAddress);
      
      const decryptedResult = {
        prediction: parseInt(results[0].toString()),
        confidence: parseInt(results[1].toString()),
        timestamp: results[2] ? parseInt(results[2].toString()) : Date.now()
      };
      
      setDecryptedData(decryptedResult);
      return decryptedResult;
      
    } catch (err: any) {
      let apiError: ApiError;
      
      if (err.success === false) {
        apiError = err;
      } else {
        apiError = {
          success: false,
          service: 'decryption',
          error: `Decryption failed: ${err.message}`,
          code: 'DECRYPTION_ERROR'
        };
      }
      
      setError(apiError);
      throw apiError;
    } finally {
      setIsDecrypting(false);
    }
  }, []);

  const checkDecryptionStatus = useCallback(async (userAddress: string, provider: ethers.Provider): Promise<boolean> => {
    try {
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (!contractAddress) return false;
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
      
      return await contract.hasDecryptedResults(userAddress);
    } catch {
      return false;
    }
  }, []);

  return {
    decryptResult,
    checkDecryptionStatus,
    isDecrypting,
    decryptedData,
    error,
    clearError: () => setError(null)
  };
}