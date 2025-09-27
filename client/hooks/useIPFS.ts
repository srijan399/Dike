import { useState, useCallback } from 'react';
import {
  uploadFileToIPFS,
  uploadMetadataToIPFS,
  createMarketMetadata,
  getMetadataFromIPFS,
  validateFile,
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
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
}

export const useIPFS = (): UseIPFSReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File): Promise<UploadResult> => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Validate file before upload
      const validation = validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const result = await uploadFileToIPFS(file);
      setUploadProgress(100);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const uploadMetadata = useCallback(async (metadata: MarketMetadata): Promise<UploadResult> => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const result = await uploadMetadataToIPFS(metadata);
      setUploadProgress(100);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload metadata';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

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

      const metadataHash = await createMarketMetadata(image, marketData);
      setUploadProgress(100);
      return metadataHash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create metadata';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const getMetadata = useCallback(async (hash: string): Promise<MarketMetadata> => {
    setError(null);
    try {
      return await getMetadataFromIPFS(hash);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get metadata';
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
    isUploading,
    uploadProgress,
    error,
  };
};

export default useIPFS;
