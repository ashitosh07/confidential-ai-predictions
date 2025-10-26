import { useState, useCallback } from 'react';
import { ethers } from 'ethers';

const CONTRACT_ABI = [
  "function submitEncrypted(bytes,bytes,bytes,bytes,string) external",
  "function requestDecryption() external",
  "function getDecryptedResults(address) external view returns (uint256[])",
  "function hasDecryptedResults(address) external view returns (bool)",
  "event PredictionSubmitted(address indexed user, string domain, uint256 timestamp)",
  "event DecryptionCompleted(address indexed user, uint256 requestId, uint256 prediction, uint256 confidence)"
];

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

export function useSubmitEncrypted() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const submitEncrypted = useCallback(async (
    encryptedData: EncryptedData,
    domain: string,
    signer: ethers.Signer
  ): Promise<string> => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw {
          success: false,
          service: 'contract',
          error: 'Contract address not configured - run deployment script',
          code: 'CONTRACT_NOT_DEPLOYED'
        };
      }
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);

      // Convert encrypted data to bytes format
      const encryptedBytes = encryptedData.encrypted.map(e => e.data);
      
      // Submit encrypted data to contract with zero gas
      const tx = await contract.submitEncrypted(
        encryptedBytes[0] || '0x',
        encryptedBytes[1] || '0x',
        encryptedBytes[2] || '0x',
        encryptedData.proof,
        domain,
        {
          gasLimit: 500000
        }
      );

      const receipt = await tx.wait();
      setTxHash(receipt.hash);
      
      return receipt.hash;
      
    } catch (err: any) {
      let apiError: ApiError;
      
      if (err.success === false) {
        apiError = err;
      } else if (err.code === 'INSUFFICIENT_FUNDS') {
        apiError = {
          success: false,
          service: 'fhevm_rpc',
          error: 'Insufficient funds for transaction',
          code: 'INSUFFICIENT_FUNDS'
        };
      } else if (err.code === 'NETWORK_ERROR') {
        apiError = {
          success: false,
          service: 'fhevm_rpc',
          error: 'FHEVM RPC unreachable - check network configuration',
          code: 'CONNECTION_ERROR'
        };
      } else {
        apiError = {
          success: false,
          service: 'contract',
          error: `Transaction failed: ${err.message}`,
          code: err.code || 'TRANSACTION_ERROR'
        };
      }
      
      setError(apiError);
      throw apiError;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const requestDecryption = useCallback(async (signer: ethers.Signer): Promise<string> => {
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
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
      
      const tx = await contract.requestDecryption({
        gasLimit: 100000
      });
      const receipt = await tx.wait();
      
      return receipt.hash;
    } catch (err: any) {
      throw {
        success: false,
        service: 'contract',
        error: `Decryption request failed: ${err.message}`,
        code: 'DECRYPTION_REQUEST_ERROR'
      };
    }
  }, []);

  return {
    submitEncrypted,
    requestDecryption,
    isSubmitting,
    txHash,
    error,
    clearError: () => setError(null)
  };
}