// Modern IPFS implementation using fetch API and multiple gateways

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || '';
const PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY || '';

// IPFS Gateway URLs
const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs',
  'https://gateway.pinata.cloud/ipfs',
  'https://cloudflare-ipfs.com/ipfs',
];

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
 * Upload a file to IPFS using Pinata or public gateway
 * @param file - File object to upload
 * @returns Promise<UploadResult>
 */
export async function uploadFileToIPFS(file: File): Promise<UploadResult> {
  try {
    // Try Pinata first if API keys are available
    if (PINATA_API_KEY && PINATA_SECRET_API_KEY) {
      return await uploadToPinata(file);
    }
    
    // Fallback to public IPFS gateway (limited functionality)
    return await uploadToPublicGateway(file);
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    throw new Error('Failed to upload file to IPFS');
  }
}

/**
 * Upload file to Pinata IPFS service
 */
async function uploadToPinata(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  
  const metadata = JSON.stringify({
    name: file.name,
    keyvalues: {
      uploadedBy: 'dike-protocol',
      timestamp: Date.now().toString(),
    }
  });
  formData.append('pinataMetadata', metadata);

  const options = JSON.stringify({
    cidVersion: 0,
  });
  formData.append('pinataOptions', options);

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'pinata_api_key': PINATA_API_KEY,
      'pinata_secret_api_key': PINATA_SECRET_API_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Pinata upload failed: ${response.statusText}`);
  }

  const result = await response.json();
  
  return {
    hash: result.IpfsHash,
    url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
    size: result.PinSize,
  };
}

/**
 * Upload to public IPFS gateway (simplified approach)
 */
async function uploadToPublicGateway(file: File): Promise<UploadResult> {
  // This is a simplified mock implementation
  // In a real scenario, you would need a proper IPFS node or service
  
  // For demo purposes, we'll create a fake hash based on file content
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  const fakeHash = `Qm${hashHex.substring(0, 44)}`; // Mock IPFS hash format
  
  // Store in localStorage for demo (in real app, this would be uploaded to IPFS)
  localStorage.setItem(`ipfs_${fakeHash}`, await fileToBase64(file));
  
  return {
    hash: fakeHash,
    url: `https://ipfs.io/ipfs/${fakeHash}`,
    size: file.size,
  };
}

/**
 * Convert file to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Upload JSON metadata to IPFS
 * @param metadata - Metadata object to upload
 * @returns Promise<UploadResult>
 */
export async function uploadMetadataToIPFS(metadata: MarketMetadata): Promise<UploadResult> {
  try {
    const metadataString = JSON.stringify(metadata, null, 2);
    const blob = new Blob([metadataString], { type: 'application/json' });
    const file = new File([blob], 'metadata.json', { type: 'application/json' });
    
    return await uploadFileToIPFS(file);
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error);
    throw new Error('Failed to upload metadata to IPFS');
  }
}

/**
 * Retrieve metadata from IPFS
 * @param hash - IPFS hash of the metadata
 * @returns Promise<MarketMetadata>
 */
export async function getMetadataFromIPFS(hash: string): Promise<MarketMetadata> {
  try {
    // Try multiple gateways for reliability
    for (const gateway of IPFS_GATEWAYS) {
      try {
        const url = `${gateway}/${hash}`;
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.text();
          return JSON.parse(data) as MarketMetadata;
        }
      } catch (gatewayError) {
        console.warn(`Failed to fetch from gateway ${gateway}:`, gatewayError);
      }
    }
    
    // Fallback to localStorage for demo hashes
    const localData = localStorage.getItem(`ipfs_${hash}`);
    if (localData) {
      // If it's a base64 data URL, extract the JSON content
      if (localData.startsWith('data:application/json')) {
        const base64Data = localData.split(',')[1];
        const jsonString = atob(base64Data);
        return JSON.parse(jsonString) as MarketMetadata;
      }
    }
    
    throw new Error('Failed to retrieve metadata from any IPFS gateway');
  } catch (error) {
    console.error('Error retrieving metadata from IPFS:', error);
    throw new Error('Failed to retrieve metadata from IPFS');
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
 * Get IPFS gateway URL for a hash
 * @param hash - IPFS hash
 * @param gateway - Gateway URL (default: first available)
 * @returns string - Full URL
 */
export function getIPFSUrl(hash: string, gateway?: string): string {
  const selectedGateway = gateway || IPFS_GATEWAYS[0];
  
  // Check if it's a demo hash stored locally
  if (hash.startsWith('Qm') && localStorage.getItem(`ipfs_${hash}`)) {
    const localData = localStorage.getItem(`ipfs_${hash}`);
    if (localData && localData.startsWith('data:')) {
      return localData; // Return the data URL directly for demo
    }
  }
  
  return `${selectedGateway}/${hash}`;
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
