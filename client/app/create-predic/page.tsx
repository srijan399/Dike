'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { ConnectKitButton } from 'connectkit';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import abi from '../abi';

// Contract addresses
const CONTRACT_ADDRESS = '0x5Fe9A48aaD87824d0DCa6A4A0107d435853fd9a3' as const;
const PYUSD_ADDRESS = '0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9' as const;

// PyUSD ABI for approval and transfer
const PYUSD_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" }
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

interface Prediction {
  id: bigint;
  creator: string;
  title: string;
  category: string;
  metadata: string;
  resolutionDate: bigint;
  initialLiquidity: bigint;
  yesLiquidity: bigint;
  noLiquidity: bigint;
  resolved: boolean;
  outcome: boolean;
  createdAt: bigint;
  active: boolean;
}

interface FormData {
  title: string;
  category: string;
  metadata: string;
  resolutionDate: string;
  initialLiquidity: string;
}

export default function CreatePredictionPage() {
  const { address, isConnected } = useAccount();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    category: '',
    metadata: '',
    resolutionDate: '',
    initialLiquidity: '10'
  });
  const [isCreating, setIsCreating] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  // Contract write hooks
  const { writeContract: writeCreatePrediction, data: createTxHash, isPending: isCreatePending } = useWriteContract();
  const { writeContract: writeApproval, data: approvalTxHash, isPending: isApprovalPending } = useWriteContract();

  // Transaction receipt hooks
  const { isLoading: isCreateTxLoading, isSuccess: isCreateTxSuccess } = useWaitForTransactionReceipt({
    hash: createTxHash,
  });
  const { isLoading: isApprovalTxLoading, isSuccess: isApprovalTxSuccess } = useWaitForTransactionReceipt({
    hash: approvalTxHash,
  });

  // Read contract hooks - Get user's prediction chain
  const { data: userChainData, refetch: refetchUserChain } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'getUserChain',
    args: address ? [address] : undefined,
  });

  // Also get all active predictions for reference
  const { data: activePredictionIds, refetch: refetchActivePredictions } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'getActivePredictions',
  });

  const { data: pyUSDBalance, error: balanceError, isLoading: balanceLoading } = useReadContract({
    address: PYUSD_ADDRESS,
    abi: PYUSD_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Console log the balance for debugging
  useEffect(() => {
    console.log('=== PyUSD Balance Debug ===');
    console.log('Connected Address:', address);
    console.log('Is Connected:', isConnected);
    console.log('PyUSD Contract Address:', PYUSD_ADDRESS);
    console.log('Balance Loading:', balanceLoading);
    console.log('Balance Error:', balanceError);
    console.log('PyUSD Balance Raw:', pyUSDBalance);
    console.log('PyUSD Balance Type:', typeof pyUSDBalance);
    console.log('PyUSD Balance String:', pyUSDBalance?.toString());
    if (pyUSDBalance) {
      console.log('PyUSD Balance Formatted:', formatPyUSD(pyUSDBalance as bigint));
    }
    console.log('Args passed to contract:', address ? [address] : undefined);
    console.log('========================');
  }, [pyUSDBalance, address, isConnected, balanceError, balanceLoading]);

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: PYUSD_ADDRESS,
    abi: PYUSD_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACT_ADDRESS] : undefined,
  });

  // Console log allowance details for debugging
  useEffect(() => {
    console.log('=== Allowance Debug ===');
    console.log('Current Allowance Raw:', allowance);
    console.log('Current Allowance String:', allowance?.toString());
    console.log('Required Amount:', formData.initialLiquidity);
    if (allowance && formData.initialLiquidity) {
      try {
        const requiredAmount = parseUnits(formData.initialLiquidity, 6);
        console.log('Required Amount (Wei):', requiredAmount.toString());
        console.log('Current Allowance >= Required:', BigInt(allowance.toString()) >= requiredAmount);
        console.log('Needs Approval:', BigInt(allowance.toString()) < requiredAmount);
      } catch (error) {
        console.log('Error parsing amounts:', error);
      }
    }
    console.log('======================');
  }, [allowance, formData.initialLiquidity]);

  // Helper functions
  const formatPyUSD = (value: bigint | string | number | undefined): string => {
    if (value === undefined || value === null) {
      return '0.00 PyUSD';
    }
    try {
      const formatted = formatUnits(BigInt(value.toString()), 6);
      return `${parseFloat(formatted).toFixed(2)} PyUSD`;
    } catch (error) {
      return `${value.toString()} (raw)`;
    }
  };

  const formatDate = (timestamp: bigint): string => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  // Load predictions created by the user
  const loadUserPredictions = async () => {
    if (!userChainData || !Array.isArray(userChainData) || !Array.isArray(userChainData[0]) || userChainData[0].length === 0) {
      setPredictions([]);
      return;
    }

    const userPredictionIds = userChainData[0]; // First element is the array of prediction IDs
    console.log('User prediction IDs:', userPredictionIds.map((id: bigint) => id.toString()));

    const predictionPromises = userPredictionIds.map(async (id: bigint) => {
      try {
        // Use getPrediction contract function directly
        const prediction = await fetch('/api/prediction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            predictionId: id.toString(),
            useContractCall: true // Flag to use getPrediction contract function
          })
        });
        
        if (!prediction.ok) {
          console.error(`Failed to fetch prediction ${id}`);
          return null;
        }
        
        const predictionData = await prediction.json();
        
        // Filter to show only predictions created by the current user
        if (predictionData.creator.toLowerCase() === address?.toLowerCase()) {
          return predictionData;
        }
        
        return null;
      } catch (error) {
        console.error(`Error loading prediction ${id}:`, error);
        return null;
      }
    });

    const loadedPredictions = await Promise.all(predictionPromises);
    const userPredictions = loadedPredictions.filter((p): p is Prediction => p !== null);
    
    console.log('Loaded user predictions:', userPredictions.length);
    setPredictions(userPredictions);
  };

  // Effects
  useEffect(() => {
    if (userChainData) {
      loadUserPredictions();
    }
  }, [userChainData, address]);

  useEffect(() => {
    if (isCreateTxSuccess) {
      console.log('Create prediction transaction successful');
      // Refetch user chain data after successful prediction creation
      refetchUserChain();
      refetchActivePredictions();
      // Reset form
      setFormData(prev => ({ ...prev, title: '' }));
      setFormData(prev => ({ ...prev, metadata: '' }));
      setFormData(prev => ({ ...prev, initialLiquidity: '10' }));
      setFormData(prev => ({ ...prev, resolutionDate: '' }));
      setFormData(prev => ({ ...prev, initialLiquidity: '10' }));
    }
  }, [isCreateTxSuccess]);

  useEffect(() => {
    if (isApprovalTxSuccess) {
      refetchAllowance();
      setNeedsApproval(false);
    }
  }, [isApprovalTxSuccess]);

  // Check if approval is needed
  useEffect(() => {
    if (allowance && formData.initialLiquidity) {
      try {
        const requiredAmount = parseUnits(formData.initialLiquidity, 6);
        setNeedsApproval(BigInt(allowance.toString()) < requiredAmount);
      } catch (error) {
        setNeedsApproval(true);
      }
    }
  }, [allowance, formData.initialLiquidity]);

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleApproval = async () => {
    if (!formData.initialLiquidity) return;
    
    try {
      const amount = parseUnits(formData.initialLiquidity, 6);
      console.log('=== Approval Debug ===');
      console.log('Approving amount:', amount.toString());
      console.log('Spender (Contract):', CONTRACT_ADDRESS);
      console.log('PyUSD Contract:', PYUSD_ADDRESS);
      console.log('User Address:', address);
      console.log('=====================');
      
      writeApproval({
        address: PYUSD_ADDRESS,
        abi: PYUSD_ABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESS, amount],
      });
    } catch (error) {
      console.error('Approval error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !formData.title || !formData.resolutionDate || !formData.initialLiquidity) return;

    console.log('=== Create Prediction Debug ===');
    console.log('Needs Approval:', needsApproval);
    console.log('Current Allowance:', allowance?.toString());
    console.log('Required Amount:', formData.initialLiquidity);
    
    // Check if we need approval first
    if (needsApproval) {
      console.log('❌ Approval required first - stopping submission');
      return;
    }

    console.log('✅ Proceeding with prediction creation');
    setIsCreating(true);

    try {
      const resolutionTimestamp = Math.floor(new Date(formData.resolutionDate).getTime() / 1000);
      const liquidityAmount = parseUnits(formData.initialLiquidity, 6);

      console.log('=== Contract Call Parameters ===');
      console.log('Title:', formData.title);
      console.log('Category:', formData.category || 'General');
      console.log('Metadata:', formData.metadata || '');
      console.log('Resolution Timestamp:', resolutionTimestamp);
      console.log('Liquidity Amount (Wei):', liquidityAmount.toString());
      console.log('Contract Address:', CONTRACT_ADDRESS);
      console.log('================================');

      writeCreatePrediction({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'createPrediction',
        args: [
          formData.title,
          formData.category || 'General',
          formData.metadata || '',
          BigInt(resolutionTimestamp),
          liquidityAmount,
        ],
      });
    } catch (error) {
      console.error('Create prediction error:', error);
      setIsCreating(false);
    }
  };

  // Validation
  const isFormValid = formData.title && formData.resolutionDate && formData.initialLiquidity && 
                     new Date(formData.resolutionDate) > new Date();

  const hasInsufficientBalance = pyUSDBalance && formData.initialLiquidity ? 
    BigInt(pyUSDBalance.toString()) < parseUnits(formData.initialLiquidity, 6) : false;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h1>
            <p className="text-slate-300 mb-6">Connect your wallet to create and view predictions</p>
            <ConnectKitButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">Prediction Market</h1>
          <p className="text-slate-300 text-lg">Create and explore decentralized predictions</p>
          <div className="flex justify-center">
            <ConnectKitButton />
          </div>
        </div>

        {/* Balance Info */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-slate-300">Your PyUSD Balance</p>
                <p className="text-2xl font-bold text-white">
                  {formatPyUSD(pyUSDBalance as bigint | undefined)}
                </p>
              </div>
              <Badge variant="outline" className="border-blue-400 text-blue-400">
                Sepolia Testnet
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Create Prediction Form */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Create New Prediction</CardTitle>
              <CardDescription className="text-slate-300">
                Create a new prediction market with initial liquidity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Title *</label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Will Bitcoin reach $100k by end of 2024?"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Category</label>
                  <Input
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="Cryptocurrency, Sports, Politics, etc."
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Description</label>
                  <textarea
                    name="metadata"
                    value={formData.metadata}
                    onChange={handleInputChange}
                    placeholder="Additional details about the prediction..."
                    className="w-full h-20 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Resolution Date *</label>
                  <Input
                    name="resolutionDate"
                    type="datetime-local"
                    value={formData.resolutionDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().slice(0, 16)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Initial Liquidity (PyUSD) *</label>
                  <Input
                    name="initialLiquidity"
                    type="number"
                    value={formData.initialLiquidity}
                    onChange={handleInputChange}
                    placeholder="10"
                    min="1"
                    step="0.01"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    required
                  />
                  {hasInsufficientBalance && (
                    <p className="text-red-400 text-sm">Insufficient PyUSD balance</p>
                  )}
                </div>

                {needsApproval && (
                  <Button
                    type="button"
                    onClick={handleApproval}
                    disabled={isApprovalPending || isApprovalTxLoading}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    {isApprovalPending || isApprovalTxLoading ? 'Approving...' : 'Approve PyUSD'}
                  </Button>
                )}

                <Button
                  type="submit"
                  disabled={!isFormValid || isCreating || isCreatePending || isCreateTxLoading || needsApproval || hasInsufficientBalance}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                  {isCreating || isCreatePending || isCreateTxLoading ? 'Creating...' : 'Create Prediction'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Active Predictions */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Active Predictions</CardTitle>
              <CardDescription className="text-slate-300">
                Current prediction markets available for trading
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {predictions.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No active predictions found</p>
                ) : (
                  predictions.map((prediction) => (
                    <div
                      key={prediction.id.toString()}
                      className="p-4 bg-slate-700/30 rounded-lg border border-slate-600 space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-white text-sm leading-tight">
                          {prediction.title}
                        </h3>
                        <Badge variant="outline" className="border-green-400 text-green-400 text-xs">
                          Active
                        </Badge>
                      </div>
                      
                      {prediction.category && (
                        <Badge variant="secondary" className="text-xs">
                          {prediction.category}
                        </Badge>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-slate-400">Yes Liquidity</p>
                          <p className="text-green-400 font-medium">
                            {formatPyUSD(prediction.yesLiquidity)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">No Liquidity</p>
                          <p className="text-red-400 font-medium">
                            {formatPyUSD(prediction.noLiquidity)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-xs text-slate-400">
                        <p>Resolves: {formatDate(prediction.resolutionDate)}</p>
                        <p>Created: {formatDate(prediction.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}