'use client';

import React, { useState } from 'react';
import { formatUnits, parseUnits } from 'viem';
import { useAccount, useDisconnect } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import useCreatePrediction, {
  useApproveToken,
  usePyUSDBalance,
  useAllowance,
  useMinimumLiquidity,
  useActivePredictions,
  useCurrentPrices,
  useSendTokens,
  PredictionFormData,
  Prediction
} from '@/hooks/createOpportunity';
import useIPFS from '@/hooks/useIPFS';

export default function CreatePredictionPage() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  
  // Hooks
  const { createPrediction, isCreatePending } = useCreatePrediction();
  const { approve, approveWallet, isApprovalPending } = useApproveToken();
  const { balance, isLoading: balanceLoading, refetch: refetchBalance } = usePyUSDBalance();
  const { allowance, refetch: refetchAllowance } = useAllowance();
  const { minimumLiquidity } = useMinimumLiquidity();
  const { activePredictions, refetchPredictions } = useActivePredictions();
  const { sendTokens } = useSendTokens();
  const {
    createMetadata,
    validateFileInput,
    isUploading: isUploadingToIPFS,
    uploadProgress,
    error: ipfsError
  } = useIPFS();

  // State
  const [formData, setFormData] = useState<PredictionFormData>({
    title: '',
    category: '',
    metadata: '',
    resolutionDate: '',
    initialLiquidity: '10'
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  // IPFS and image state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState<string>('');
  const [sourceUrl, setSourceUrl] = useState<string>('');
  const [rules, setRules] = useState<string>('');

  // Helper functions
  const formatPyUSD = (value: bigint | undefined): string => {
    if (!value) return '0.00 PyUSD';
    try {
      const formatted = formatUnits(value, 6);
      return `${parseFloat(formatted).toFixed(2)} PyUSD`;
    } catch (error) {
      return '0.00 PyUSD';
    }
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  // Image handling functions
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateFileInput(file);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    setError('');
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Tag handling functions
  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const needsApproval = (): boolean => {
    if (!allowance || !formData.initialLiquidity) return true;
    try {
      const requiredAmount = parseUnits(formData.initialLiquidity, 6);
      return (allowance as bigint) < requiredAmount;
    } catch {
      return true;
    }
  };

  const hasInsufficientBalance = (): boolean => {
    if (!balance?.value || !formData.initialLiquidity) return false;
    try {
      const requiredAmount = parseUnits(formData.initialLiquidity, 6);
      return balance.value < requiredAmount;
    } catch {
      return false;
    }
  };

  const hasInsufficientLiquidity = (): boolean => {
    if (!minimumLiquidity || !formData.initialLiquidity) return false;
    try {
      const liquidityAmount = parseUnits(formData.initialLiquidity, 6);
      return liquidityAmount < (minimumLiquidity as bigint);
    } catch {
      return false;
    }
  };

  const handleApproval = async () => {
    if (!formData.initialLiquidity) return;
    
    try {
      setError('');
      setSuccess('');
      console.log('Starting approval process...');
      
      const tx = await approve(formData.initialLiquidity);
      console.log('Approval transaction submitted:', tx);
      
      // Wait a bit for the transaction to be mined
      setTimeout(async () => {
        await refetchAllowance();
        console.log('Allowance refetched');
      }, 2000);
      
      setSuccess('PyUSD spending approved successfully!');
    } catch (error) {
      console.error('Approval failed:', error);
      setError('Approval failed. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !formData.title || !formData.resolutionDate || !formData.initialLiquidity) return;

    // Validation
    if (hasInsufficientLiquidity()) {
      const minLiquidityFormatted = formatUnits(minimumLiquidity! as bigint, 6);
      setError(`Initial liquidity must be at least ${minLiquidityFormatted} PyUSD`);
      return;
    }

    if (hasInsufficientBalance()) {
      setError('Insufficient PyUSD balance');
      return;
    }

    if (needsApproval()) {
      setError('Please approve PyUSD spending first');
      return;
    }

    if (new Date(formData.resolutionDate) <= new Date()) {
      setError('Resolution date must be in the future');
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      // Create metadata with IPFS
      let metadataHash = '';
      if (selectedImage || formData.metadata || tags.length > 0 || sourceUrl || rules) {
        setSuccess('📤 Uploading metadata to IPFS...');
        
        metadataHash = await createMetadata(selectedImage, {
          title: formData.title,
          category: formData.category || 'General',
          description: formData.metadata || '',
          tags: tags.length > 0 ? tags : undefined,
          sourceUrl: sourceUrl || undefined,
          rules: rules || undefined,
        });
        
        setSuccess('✅ Metadata uploaded to IPFS! Creating prediction...');
      }
      
      // Create prediction with IPFS metadata hash
      const updatedFormData = {
        ...formData,
        metadata: metadataHash || formData.metadata || ''
      };
      
      await createPrediction(updatedFormData);
      
      // Reset form on success
      setFormData({
        title: '',
        category: '',
        metadata: '',
        resolutionDate: '',
        initialLiquidity: '10'
      });
      
      // Reset IPFS-related state
      setSelectedImage(null);
      setImagePreview(null);
      setTags([]);
      setCurrentTag('');
      setSourceUrl('');
      setRules('');
      
      setSuccess('🎉 Prediction market created successfully with IPFS metadata!');
    } catch (error) {
      console.error('Create prediction error:', error);
      if (error instanceof Error && error.message.includes('IPFS')) {
        setError(`IPFS Error: ${error.message}`);
      } else {
        setError('Failed to create prediction. Please try again.');
      }
    }
  };

  const isFormValid = formData.title && formData.resolutionDate && formData.initialLiquidity && 
                     new Date(formData.resolutionDate) > new Date();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black border-white shadow-xl">
          <CardContent className="pt-6 text-center space-y-6">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-600 rounded-lg mx-auto flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white">Create Prediction</h1>
              <p className="text-blue-300 text-lg">Connect your wallet to start creating prediction markets</p>
            </div>
            <ConnectKitButton.Custom>
              {({ show }) => (
                <Button 
                  onClick={show} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200 border border-white"
                >
                  Connect Wallet
                </Button>
              )}
            </ConnectKitButton.Custom>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Account Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-white bg-black shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-lg">Account Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-blue-300 mb-1">PyUSD Balance</p>
                  <p className="text-2xl font-bold text-white">
                    {formatPyUSD(balance?.value)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-300 mb-1">Network</p>
                  <Badge variant="outline" className="border-white text-blue-300 bg-blue-600/20">
                    Sepolia Testnet
                  </Badge>
                </div>
                {minimumLiquidity ? (
                  <div>
                    <p className="text-sm text-blue-300 mb-1">Minimum Liquidity</p>
                    <p className="text-sm font-medium text-white">
                      {formatUnits(minimumLiquidity as bigint, 6)} PyUSD
                    </p>
                  </div>
                ) : null}
                <div>
                  <p className="text-sm text-blue-300 mb-1">Current Allowance</p>
                  <p className="text-xs font-medium text-white">
                    {allowance ? formatUnits(allowance as bigint, 6) : '0'} PyUSD
                  </p>
                  <Button
                    onClick={() => refetchAllowance()}
                    className="mt-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 h-6"
                  >
                    Refresh
                  </Button>
                </div>
                <div>
                  <p className="text-sm text-blue-300 mb-1">Debug Info</p>
                  <p className="text-xs text-gray-400">
                    Needs Approval: {needsApproval() ? 'Yes' : 'No'}
                  </p>
                  <p className="text-xs text-gray-400">
                    Form Valid: {isFormValid ? 'Yes' : 'No'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Success/Error Messages */}
            {(error || ipfsError) && (
              <Card className="border-white bg-red-900/20">
                <CardContent className="pt-4">
                  <p className="text-red-300 text-sm">{error || ipfsError}</p>
                </CardContent>
              </Card>
            )}

            {success && (
              <Card className="border-white bg-green-900/20">
                <CardContent className="pt-4">
                  <p className="text-green-300 text-sm">{success}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="border-white bg-black shadow-sm">
              <CardHeader>
                <CardTitle className="text-white text-xl">Prediction Details</CardTitle>
                <CardDescription className="text-blue-300">
                  Fill in the details for your prediction market
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-6">
                    {/* Image Upload Section */}
                    <div>
                      <label className="block text-sm font-medium text-blue-300 mb-2">
                        Market Image
                      </label>
                      <div className="space-y-4">
                        {!imagePreview ? (
                          <div className="border-2 border-dashed border-white bg-gray-800 rounded-lg p-6 text-center">
                            <svg className="mx-auto h-12 w-12 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
                            </svg>
                            <div className="mt-4">
                              <label htmlFor="image-upload" className="cursor-pointer">
                                <span className="text-blue-300 hover:text-blue-200">Upload an image</span>
                                <input
                                  id="image-upload"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageSelect}
                                  className="hidden"
                                />
                              </label>
                              <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-48 object-cover rounded-lg border border-white"
                            />
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-blue-300 mb-2">
                          Prediction Title *
                        </label>
                        <Input
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="Will Bitcoin reach $100k by end of 2024?"
                          className="border-white bg-gray-800 text-white placeholder:text-blue-300/60 focus:border-blue-400 focus:ring-blue-400"
                          required
                        />
                      </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-300 mb-2">
                        Category
                      </label>
                      <Input
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        placeholder="Cryptocurrency"
                        className="border-white bg-gray-800 text-white placeholder:text-blue-300/60 focus:border-blue-400 focus:ring-blue-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-300 mb-2">
                        Initial Liquidity (PyUSD) *
                      </label>
                      <Input
                        name="initialLiquidity"
                        type="number"
                        value={formData.initialLiquidity}
                        onChange={handleInputChange}
                        placeholder="10"
                        min="1"
                        step="0.01"
                        className="border-white bg-gray-800 text-white placeholder:text-blue-300/60 focus:border-blue-400 focus:ring-blue-400"
                        required
                      />
                      {hasInsufficientBalance() && (
                        <p className="text-red-300 text-sm mt-1">Insufficient PyUSD balance</p>
                      )}
                      {hasInsufficientLiquidity() && minimumLiquidity ? (
                        <p className="text-amber-300 text-sm mt-1">
                          Minimum liquidity: {formatUnits(minimumLiquidity as bigint, 6)} PyUSD
                        </p>
                      ) : null}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-blue-300 mb-2">
                        Resolution Date *
                      </label>
                      <Input
                        name="resolutionDate"
                        type="datetime-local"
                        value={formData.resolutionDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().slice(0, 16)}
                        className="border-white bg-gray-800 text-white focus:border-blue-400 focus:ring-blue-400"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-blue-300 mb-2">
                        Description
                      </label>
                      <textarea
                        name="metadata"
                        value={formData.metadata}
                        onChange={handleInputChange}
                        placeholder="Additional details about the prediction..."
                        rows={3}
                        className="w-full px-3 py-2 border border-white bg-gray-800 rounded-md text-white placeholder:text-blue-300/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-none"
                      />
                    </div>

                    {/* Tags Section */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-blue-300 mb-2">
                        Tags
                      </label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            value={currentTag}
                            onChange={(e) => setCurrentTag(e.target.value)}
                            onKeyPress={handleTagKeyPress}
                            placeholder="Add a tag (press Enter)"
                            className="border-white bg-gray-800 text-white placeholder:text-blue-300/60 focus:border-blue-400 focus:ring-blue-400"
                          />
                          <Button
                            type="button"
                            onClick={addTag}
                            className="bg-blue-600 hover:bg-blue-700 text-white border border-white px-4"
                          >
                            Add
                          </Button>
                        </div>
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 bg-blue-600/20 border border-blue-400 text-blue-300 text-sm rounded-md"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeTag(tag)}
                                  className="ml-2 text-blue-300 hover:text-white"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Source URL */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-blue-300 mb-2">
                        Source URL (optional)
                      </label>
                      <Input
                        value={sourceUrl}
                        onChange={(e) => setSourceUrl(e.target.value)}
                        placeholder="https://example.com/source"
                        className="border-white bg-gray-800 text-white placeholder:text-blue-300/60 focus:border-blue-400 focus:ring-blue-400"
                      />
                    </div>

                    {/* Rules */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-blue-300 mb-2">
                        Resolution Rules (optional)
                      </label>
                      <textarea
                        value={rules}
                        onChange={(e) => setRules(e.target.value)}
                        placeholder="Specific rules for how this prediction will be resolved..."
                        rows={3}
                        className="w-full px-3 py-2 border border-white bg-gray-800 rounded-md text-white placeholder:text-blue-300/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-none"
                      />
                    </div>
                  </div>
                  </div>

                  <div className="border-t border-white pt-6 space-y-4">
                    {needsApproval() && (
                      <Button
                        type="button"
                        onClick={handleApproval}
                        disabled={isApprovalPending}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white border border-white"
                      >
                        {isApprovalPending ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Approving PyUSD...</span>
                          </div>
                        ) : (
                          'Approve PyUSD Spending'
                        )}
                      </Button>
                    )}

                    <Button
                      type="submit"
                      disabled={!isFormValid || isCreatePending || isUploadingToIPFS || needsApproval() || hasInsufficientBalance() || hasInsufficientLiquidity()}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 border border-white"
                    >
                      {isUploadingToIPFS ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Uploading to IPFS... {uploadProgress}%</span>
                        </div>
                      ) : isCreatePending ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Creating Prediction...</span>
                        </div>
                      ) : (
                        'Create Prediction Market'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}