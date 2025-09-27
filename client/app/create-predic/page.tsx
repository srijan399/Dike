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
    testConnection,
    isUploading: isUploadingToIPFS,
    uploadProgress,
    error: ipfsError,
    isPinataReady,
    pinataStatus,
    connectionStatus
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

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState<number>(0);
  
  const steps = [
    { id: 'basic', title: 'Basic Details', description: 'Title and core information' },
    { id: 'media', title: 'Media & Details', description: 'Image, description, and metadata' },
    { id: 'settings', title: 'Market Settings', description: 'Liquidity and resolution details' },
    { id: 'review', title: 'Review & Submit', description: 'Final review and submission' }
  ];

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
      
      // Create metadata with Pinata IPFS
      let metadataHash = '';
      if (selectedImage || formData.metadata || tags.length > 0 || sourceUrl || rules) {
        setSuccess('📤 Uploading metadata to Pinata IPFS...');
        
        metadataHash = await createMetadata(selectedImage, {
          title: formData.title,
          category: formData.category || 'General',
          description: formData.metadata || '',
          tags: tags.length > 0 ? tags : undefined,
          sourceUrl: sourceUrl || undefined,
          rules: rules || undefined,
        });
        
        setSuccess('✅ Metadata uploaded to Pinata IPFS! Creating prediction...');
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
      
      // Reset to first step
      setCurrentStep(0);
      
      setSuccess('🎉 Prediction market created successfully with Pinata IPFS metadata!');
    } catch (error) {
      console.error('Create prediction error:', error);
      if (error instanceof Error && (error.message.includes('IPFS') || error.message.includes('Pinata'))) {
        setError(`Pinata IPFS Error: ${error.message}`);
      } else {
        setError('Failed to create prediction. Please try again.');
      }
    }
  };

  const isFormValid = formData.title && formData.resolutionDate && formData.initialLiquidity && 
                     new Date(formData.resolutionDate) > new Date();

  // Step navigation functions
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setError('');
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
      setError('');
    }
  };

  // Step validation functions
  const isStepValid = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: // Basic Details
        return formData.title.trim().length > 0 && formData.category.trim().length > 0;
      case 1: // Media & Details
        return true; // Optional fields
      case 2: // Market Settings
        return Boolean(formData.resolutionDate) && Boolean(formData.initialLiquidity) && 
               new Date(formData.resolutionDate) > new Date() &&
               !hasInsufficientBalance() && !hasInsufficientLiquidity();
      case 3: // Review & Submit
        return Boolean(isFormValid) && !needsApproval();
      default:
        return false;
    }
  };

  const canProceedToNextStep = (): boolean => {
    return isStepValid(currentStep);
  };

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
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Create Prediction Market</h1>
          <p className="text-gray-400 text-lg">Design your prediction market in a few simple steps</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Progress Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Step Progress */}
              <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white text-lg">Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        index === currentStep 
                          ? 'bg-blue-600 text-white' 
                          : index < currentStep 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-700 text-gray-400'
                      }`}>
                        {index < currentStep ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium ${
                          index === currentStep ? 'text-white' : index < currentStep ? 'text-green-400' : 'text-gray-400'
                        }`}>
                          {step.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Account Info */}
              <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white text-lg">Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Balance</p>
                    <p className="text-lg font-semibold text-white">{formatPyUSD(balance?.value)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Network</p>
                    <Badge variant="outline" className="border-gray-600 text-gray-300 bg-gray-800/50">
                      Sepolia
                    </Badge>
                  </div>
                  {minimumLiquidity ? (
                    <div>
                      <p className="text-sm text-gray-400">Min. Liquidity</p>
                      <p className="text-sm text-gray-300">{formatUnits(minimumLiquidity as bigint, 6)} PyUSD</p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              {/* Pinata IPFS Status */}
              <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white text-lg">IPFS Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Pinata Service</p>
                    <Badge 
                      variant="outline" 
                      className={`${
                        connectionStatus === 'success' 
                          ? 'border-green-600 text-green-300 bg-green-800/20'
                          : connectionStatus === 'testing'
                          ? 'border-yellow-600 text-yellow-300 bg-yellow-800/20'
                          : 'border-red-600 text-red-300 bg-red-800/20'
                      }`}
                    >
                      {connectionStatus === 'success' && 'Connected'}
                      {connectionStatus === 'testing' && 'Testing...'}
                      {connectionStatus === 'failed' && 'Failed'}
                      {connectionStatus === 'unknown' && 'Unknown'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      API Key: {pinataStatus.hasApiKey ? '✓' : '✗'} | 
                      Secret: {pinataStatus.hasSecretKey ? '✓' : '✗'}
                    </p>
                  </div>
                  {pinataStatus.configured && (
                    <Button
                      type="button"
                      onClick={testConnection}
                      disabled={connectionStatus === 'testing'}
                      variant="outline"
                      size="sm"
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      {connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Messages */}
              {(error || ipfsError) && (
                <Card className="border-red-800 bg-red-900/20 backdrop-blur-sm">
                  <CardContent className="pt-4">
                    <p className="text-red-300 text-sm">{error || ipfsError}</p>
                  </CardContent>
                </Card>
              )}

              {success && (
                <Card className="border-green-800 bg-green-900/20 backdrop-blur-sm">
                  <CardContent className="pt-4">
                    <p className="text-green-300 text-sm">{success}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-3">
            <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm min-h-[600px]">
              <CardHeader className="border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-2xl">{steps[currentStep].title}</CardTitle>
                    <CardDescription className="text-gray-400 mt-1">
                      {steps[currentStep].description}
                    </CardDescription>
                  </div>
                  <div className="text-sm text-gray-400">
                    Step {currentStep + 1} of {steps.length}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Step Content */}
                  <div className="min-h-[400px]">
                    {currentStep === 0 && (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Prediction Title *
                          </label>
                          <Input
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Will Bitcoin reach $100k by end of 2024?"
                            className="h-12 border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Category *
                          </label>
                          <Input
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            placeholder="Cryptocurrency, Sports, Politics, etc."
                            className="h-12 border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Description
                          </label>
                          <textarea
                            name="metadata"
                            value={formData.metadata}
                            onChange={handleInputChange}
                            placeholder="Provide additional context and details about your prediction..."
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-700 bg-gray-800/50 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                          />
                        </div>
                      </div>
                    )}

                    {currentStep === 1 && (
                      <div className="space-y-6">
                        {/* Image Upload */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Market Image
                          </label>
                          {!imagePreview ? (
                            <div className="border-2 border-dashed border-gray-700 bg-gray-800/30 rounded-xl p-8 text-center hover:border-gray-600 transition-colors">
                              <svg className="mx-auto h-16 w-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
                              </svg>
                              <div className="mt-6">
                                <label htmlFor="image-upload" className="cursor-pointer">
                                  <span className="text-blue-400 hover:text-blue-300 font-medium">Upload an image</span>
                                  <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                  />
                                </label>
                                <p className="text-sm text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
                              </div>
                            </div>
                          ) : (
                            <div className="relative">
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-64 object-cover rounded-xl border border-gray-700"
                              />
                              <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Tags */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Tags
                          </label>
                          <div className="space-y-3">
                            <div className="flex gap-3">
                              <Input
                                value={currentTag}
                                onChange={(e) => setCurrentTag(e.target.value)}
                                onKeyPress={handleTagKeyPress}
                                placeholder="Add a tag and press Enter"
                                className="h-12 border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                              />
                              <Button
                                type="button"
                                onClick={addTag}
                                className="h-12 bg-blue-600 hover:bg-blue-700 text-white px-6"
                              >
                                Add
                              </Button>
                            </div>
                            {tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-3 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-300 text-sm rounded-full"
                                  >
                                    {tag}
                                    <button
                                      type="button"
                                      onClick={() => removeTag(tag)}
                                      className="ml-2 text-blue-400 hover:text-white"
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
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Source URL (optional)
                          </label>
                          <Input
                            value={sourceUrl}
                            onChange={(e) => setSourceUrl(e.target.value)}
                            placeholder="https://example.com/source"
                            className="h-12 border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                          />
                        </div>

                        {/* Rules */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Resolution Rules (optional)
                          </label>
                          <textarea
                            value={rules}
                            onChange={(e) => setRules(e.target.value)}
                            placeholder="Specific rules for how this prediction will be resolved..."
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-700 bg-gray-800/50 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                          />
                        </div>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">
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
                            className="h-12 border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                            required
                          />
                          {hasInsufficientBalance() && (
                            <p className="text-red-400 text-sm mt-2">Insufficient PyUSD balance</p>
                          )}
                          {hasInsufficientLiquidity() && minimumLiquidity ? (
                            <p className="text-amber-400 text-sm mt-2">
                              Minimum liquidity: {formatUnits(minimumLiquidity as bigint, 6)} PyUSD
                            </p>
                          ) : null}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Resolution Date *
                          </label>
                          <Input
                            name="resolutionDate"
                            type="datetime-local"
                            value={formData.resolutionDate}
                            onChange={handleInputChange}
                            min={new Date().toISOString().slice(0, 16)}
                            className="h-12 border-gray-700 bg-gray-800/50 text-white focus:border-blue-500 focus:ring-blue-500/20"
                            required
                          />
                        </div>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <div className="bg-gray-800/30 rounded-xl p-6 space-y-4">
                          <h3 className="text-lg font-medium text-white">Review Your Prediction</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400">Title</p>
                              <p className="text-white font-medium">{formData.title}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Category</p>
                              <p className="text-white">{formData.category}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Initial Liquidity</p>
                              <p className="text-white">{formData.initialLiquidity} PyUSD</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Resolution Date</p>
                              <p className="text-white">
                                {formData.resolutionDate ? new Date(formData.resolutionDate).toLocaleString() : 'Not set'}
                              </p>
                            </div>
                            {formData.metadata && (
                              <div className="md:col-span-2">
                                <p className="text-gray-400">Description</p>
                                <p className="text-white">{formData.metadata}</p>
                              </div>
                            )}
                          </div>
                          {tags.length > 0 && (
                            <div>
                              <p className="text-gray-400 mb-2">Tags</p>
                              <div className="flex flex-wrap gap-2">
                                {tags.map((tag, index) => (
                                  <span key={index} className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-300 text-sm rounded-full">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {needsApproval() && (
                          <div className="bg-orange-900/20 border border-orange-800 rounded-xl p-6">
                            <h4 className="text-orange-300 font-medium mb-3">Approval Required</h4>
                            <p className="text-gray-300 text-sm mb-4">You need to approve PyUSD spending before creating the prediction.</p>
                            <Button
                              type="button"
                              onClick={handleApproval}
                              disabled={isApprovalPending}
                              className="bg-orange-600 hover:bg-orange-700 text-white"
                            >
                              {isApprovalPending ? (
                                <div className="flex items-center space-x-2">
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                  <span>Approving...</span>
                                </div>
                              ) : (
                                'Approve PyUSD Spending'
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-800">
                    <Button
                      type="button"
                      onClick={prevStep}
                      disabled={currentStep === 0}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Previous
                    </Button>

                    <div className="flex space-x-3">
                      {currentStep < steps.length - 1 ? (
                        <Button
                          type="button"
                          onClick={nextStep}
                          disabled={!canProceedToNextStep()}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                        >
                          Next
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          disabled={!isFormValid || isCreatePending || isUploadingToIPFS || needsApproval() || hasInsufficientBalance() || hasInsufficientLiquidity()}
                          className="bg-green-600 hover:bg-green-700 text-white px-8"
                        >
                          {isUploadingToIPFS ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              <span>Uploading... {uploadProgress}%</span>
                            </div>
                          ) : isCreatePending ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              <span>Creating...</span>
                            </div>
                          ) : (
                            'Create Prediction Market'
                          )}
                        </Button>
                      )}
                    </div>
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