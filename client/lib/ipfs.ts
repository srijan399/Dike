// Pinata IPFS implementation using their API (matching NFT marketplace format)
import axios from 'axios';

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || '';
const PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY || '';

// Pinata API endpoints
const PINATA_API_URL = 'https://api.pinata.cloud';
const PINATA_GATEWAY_URL = 'https://gateway.pinata.cloud/ipfs';

export interface MarketMetadata {
  title: string;
  category: string;
  description: string;
  image?: string; // IPFS hash of the image
  tags?: string[];
  sourceUrl?: string;
  rules?: string;
  createdAt: number;
  version: string;
}

export interface UploadResult {
  hash: string;
  url: string;
  size: number;
}

/**
 * Upload a file to IPFS using Pinata
 * @param file - File object to upload
 * @returns Promise<UploadResult>
 */
export async function uploadFileToIPFS(file: File): Promise<UploadResult> {
  try {
    // Validate API keys
    if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
      throw new Error('Pinata API keys are not configured. Please set NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_SECRET_API_KEY environment variables.');
    }
    
    return await uploadToPinata(file);
  } catch (error) {
    console.error('Error uploading file to Pinata IPFS:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to upload file to Pinata IPFS');
  }
}

/**
 * Upload file to Pinata IPFS service (using axios like NFT marketplace)
 */
async function uploadToPinata(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const res = await axios.post(`${PINATA_API_URL}/pinning/pinFileToIPFS`, formData, {
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_API_KEY,
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return {
      hash: res.data.IpfsHash,
      url: `${PINATA_GATEWAY_URL}/${res.data.IpfsHash}`,
      size: res.data.PinSize,
    };
  } catch (error: any) {
    console.error('Pinata API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      error: error.response?.data,
      hasApiKey: !!PINATA_API_KEY,
      hasSecretKey: !!PINATA_SECRET_API_KEY,
    });
    
    // Provide more specific error messages
    if (error.response?.status === 401) {
      throw new Error('Pinata authentication failed. Please check your API keys.');
    } else if (error.response?.status === 403) {
      throw new Error('Pinata access forbidden. Please verify your API key has upload permissions.');
    } else if (error.response?.status === 413) {
      throw new Error('File too large for Pinata upload.');
    } else {
      throw new Error(`Pinata upload failed: ${error.message}`);
    }
  }
}

/**
 * Upload JSON metadata to Pinata IPFS (using axios like NFT marketplace)
 */
async function uploadJSONToPinata(jsonData: any, filename: string): Promise<UploadResult> {
  try {
    const res = await axios.post(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, jsonData, {
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_API_KEY,
        'Content-Type': 'application/json',
      },
    });
    
    return {
      hash: res.data.IpfsHash,
      url: `${PINATA_GATEWAY_URL}/${res.data.IpfsHash}`,
      size: JSON.stringify(jsonData).length,
    };
  } catch (error: any) {
    console.error('Pinata JSON API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      error: error.response?.data,
      hasApiKey: !!PINATA_API_KEY,
      hasSecretKey: !!PINATA_SECRET_API_KEY,
    });
    
    // Provide more specific error messages
    if (error.response?.status === 401) {
      throw new Error('Pinata authentication failed. Please check your API keys.');
    } else if (error.response?.status === 403) {
      throw new Error('Pinata access forbidden. Please verify your API key has upload permissions.');
    } else if (error.response?.status === 413) {
      throw new Error('Metadata too large for Pinata upload.');
    } else {
      throw new Error(`Pinata JSON upload failed: ${error.message}`);
    }
  }
}

/**
 * Upload JSON metadata to IPFS using Pinata's JSON endpoint
 * @param metadata - Metadata object to upload
 * @returns Promise<UploadResult>
 */
export async function uploadMetadataToIPFS(metadata: MarketMetadata): Promise<UploadResult> {
  try {
    // Validate API keys
    if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
      throw new Error('Pinata API keys are not configured. Please set NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_SECRET_API_KEY environment variables.');
    }
    
    return await uploadJSONToPinata(metadata, `metadata-${metadata.title.toLowerCase().replace(/\s+/g, '-')}.json`);
  } catch (error) {
    console.error('Error uploading metadata to Pinata IPFS:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to upload metadata to Pinata IPFS');
  }
}

/**
 * Retrieve metadata from IPFS using Pinata gateway (using axios like NFT marketplace)
 * @param hash - IPFS hash of the metadata
 * @returns Promise<MarketMetadata>
 */
export async function getMetadataFromIPFS(hash: string): Promise<MarketMetadata> {
  try {
    const url = `${PINATA_GATEWAY_URL}/${hash}`;
    const res = await axios.get(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    const metadata = res.data as MarketMetadata;
    
    // Validate metadata structure
    if (!metadata.title || !metadata.category || !metadata.description) {
      throw new Error('Invalid metadata structure received from IPFS');
    }
    
    return metadata;
  } catch (error: any) {
    console.error('Error retrieving metadata from Pinata IPFS:', error);
    if (error.response?.status === 404) {
      throw new Error('Metadata not found on IPFS');
    }
    throw new Error(`Failed to retrieve metadata from Pinata IPFS: ${error.message}`);
  }
}

/**
 * Upload image and create complete metadata
 * @param image - Image file to upload
 * @param marketData - Market information
 * @returns Promise<string> - IPFS hash of the complete metadata
 */
export async function createMarketMetadata(
  image: File | null,
  marketData: {
    title: string;
    category: string;
    description: string;
    tags?: string[];
    sourceUrl?: string;
    rules?: string;
  }
): Promise<string> {
  try {
    let imageHash: string | undefined;

    // Upload image if provided
    if (image) {
      const imageResult = await uploadFileToIPFS(image);
      imageHash = imageResult.hash;
    }

    // Create complete metadata
    const metadata: MarketMetadata = {
      ...marketData,
      image: imageHash,
      createdAt: Date.now(),
      version: '1.0.0',
    };

    // Upload metadata to IPFS
    const metadataResult = await uploadMetadataToIPFS(metadata);
    return metadataResult.hash;
  } catch (error) {
    console.error('Error creating market metadata:', error);
    throw new Error('Failed to create market metadata');
  }
}

/**
 * Get Pinata IPFS gateway URL for a hash
 * @param hash - IPFS hash
 * @returns string - Full Pinata gateway URL
 */
export function getIPFSUrl(hash: string): string {
  return `${PINATA_GATEWAY_URL}/${hash}`;
}

/**
 * Check if Pinata API keys are configured
 * @returns boolean
 */
export function isPinataConfigured(): boolean {
  return !!(PINATA_API_KEY && PINATA_SECRET_API_KEY);
}

/**
 * Test Pinata API connection (using axios like NFT marketplace)
 * @returns Promise<boolean>
 */
export async function testPinataConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isPinataConfigured()) {
      return { success: false, error: 'Pinata API keys not configured' };
    }

    const res = await axios.get(`${PINATA_API_URL}/data/testAuthentication`, {
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_API_KEY,
      },
    });

    if (res.status === 200) {
      return { success: true };
    } else {
      return { success: false, error: `Authentication failed: ${res.status} ${res.statusText}` };
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.response?.data?.error || error.message || 'Unknown error testing Pinata connection'
    };
  }
}

/**
 * Get Pinata API key status (for debugging)
 * @returns object with key status
 */
export function getPinataStatus(): { 
  hasApiKey: boolean; 
  hasSecretKey: boolean; 
  configured: boolean;
} {
  return {
    hasApiKey: !!PINATA_API_KEY,
    hasSecretKey: !!PINATA_SECRET_API_KEY,
    configured: isPinataConfigured(),
  };
}

/**
 * Validate file before upload
 * @param file - File to validate
 * @param maxSize - Maximum file size in bytes (default: 10MB)
 * @param allowedTypes - Allowed MIME types
 * @returns boolean
 */
export function validateFile(
  file: File,
  maxSize: number = 10 * 1024 * 1024, // 10MB
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
): { isValid: boolean; error?: string } {
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type must be one of: ${allowedTypes.join(', ')}`,
    };
  }

  return { isValid: true };
}
