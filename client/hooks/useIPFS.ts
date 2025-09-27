import { useState, useCallback, useEffect } from 'react';
import {
  uploadFileToIPFS,
  uploadMetadataToIPFS,
  createMarketMetadata,
  getMetadataFromIPFS,
  validateFile,
  isPinataConfigured,
  getPinataStatus,
  testPinataConnection,
  MarketMetadata,
  UploadResult,
} from '@/lib/ipfs';

interface UseIPFSReturn {
  uploadFile: (file: File) => Promise<UploadResult>;
  uploadMetadata: (metadata: MarketMetadata) => Promise<UploadResult>;
  createMetadata: (
    image: File | null,
    marketData: {
      title: string;
      category: string;
      description: string;
      tags?: string[];
      sourceUrl?: string;
      rules?: string;
    }
  ) => Promise<string>;
  getMetadata: (hash: string) => Promise<MarketMetadata>;
  validateFileInput: (file: File) => { isValid: boolean; error?: string };
  testConnection: () => Promise<void>;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  isPinataReady: boolean;
  pinataStatus: { hasApiKey: boolean; hasSecretKey: boolean; configured: boolean };
  connectionStatus: 'unknown' | 'testing' | 'success' | 'failed';
}

export const useIPFS = (): UseIPFSReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPinataReady, setIsPinataReady] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'testing' | 'success' | 'failed'>('unknown');
  const [pinataStatus, setPinataStatus] = useState({
    hasApiKey: false,
    hasSecretKey: false,
    configured: false,
  });

  const testConnection = useCallback(async () => {
    setConnectionStatus('testing');
    setError(null);
    
    try {
      const result = await testPinataConnection();
      if (result.success) {
        setConnectionStatus('success');
        setIsPinataReady(true);
      } else {
        setConnectionStatus('failed');
        setIsPinataReady(false);
        setError(`Pinata connection failed: ${result.error}`);
      }
    } catch (error) {
      setConnectionStatus('failed');
      setIsPinataReady(false);
      setError(`Pinata connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  // Check Pinata configuration and test connection on mount
  useEffect(() => {
    const status = getPinataStatus();
    setPinataStatus(status);
    setIsPinataReady(status.configured);
    
    if (!status.configured) {
      setError('Pinata API keys are not configured. Please set NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_SECRET_API_KEY environment variables.');
      setConnectionStatus('failed');
    } else {
      // Test connection automatically
      testConnection();
    }
  }, [testConnection]);

  const uploadFile = useCallback(async (file: File): Promise<UploadResult> => {
    if (!isPinataReady) {
      throw new Error('Pinata is not configured. Please check your API keys.');
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Validate file before upload
      const validation = validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      setUploadProgress(25);
      const result = await uploadFileToIPFS(file);
      setUploadProgress(100);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file to Pinata';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [isPinataReady]);

  const uploadMetadata = useCallback(async (metadata: MarketMetadata): Promise<UploadResult> => {
    if (!isPinataReady) {
      throw new Error('Pinata is not configured. Please check your API keys.');
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      setUploadProgress(25);
      const result = await uploadMetadataToIPFS(metadata);
      setUploadProgress(100);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload metadata to Pinata';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [isPinataReady]);

  const createMetadata = useCallback(async (
    image: File | null,
    marketData: {
      title: string;
      category: string;
      description: string;
      tags?: string[];
      sourceUrl?: string;
      rules?: string;
    }
  ): Promise<string> => {
    if (!isPinataReady) {
      throw new Error('Pinata is not configured. Please check your API keys.');
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      if (image) {
        // Validate image before upload
        const validation = validateFile(image);
        if (!validation.isValid) {
          throw new Error(validation.error);
        }
        setUploadProgress(25);
      }

      setUploadProgress(50);
      const metadataHash = await createMarketMetadata(image, marketData);
      setUploadProgress(100);
      return metadataHash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create metadata on Pinata';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [isPinataReady]);

  const getMetadata = useCallback(async (hash: string): Promise<MarketMetadata> => {
    setError(null);
    try {
      return await getMetadataFromIPFS(hash);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get metadata from Pinata';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const validateFileInput = useCallback((file: File) => {
    return validateFile(file);
  }, []);

  return {
    uploadFile,
    uploadMetadata,
    createMetadata,
    getMetadata,
    validateFileInput,
    testConnection,
    isUploading,
    uploadProgress,
    error,
    isPinataReady,
    pinataStatus,
    connectionStatus,
  };
};

export default useIPFS;
