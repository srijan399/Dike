'use client';

import React, { useState } from 'react';
import { formatUnits, formatEther } from 'viem';
import { useAccount, useDisconnect } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  useUserProfile,
  useUserPyUSDBalance,
  useUserETHBalance,
  useUserAllowance,
  useUserChainData,
  useUserCreatedPredictions,
  usePredictionCounter,
  useMinimumLiquidity,
  useUserDetailedMarkets,
  useMarketPrices,
  DetailedMarket
} from '@/hooks/useProfile';
import { 
  useActivePredictions,
  useApproveToken,
  useSendTokens 
} from '@/hooks/createOpportunity';
import MarketDetails from '@/components/MarketDetails';

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  
  // Profile hooks
  const { profileData, isLoading: profileLoading, refetchAll } = useUserProfile();
  const { balance: pyusdBalance, refetch: refetchPyUSD } = useUserPyUSDBalance();
  const { ethBalance, refetch: refetchETH } = useUserETHBalance();
  const { allowance, refetch: refetchAllowance } = useUserAllowance();
  const { userChain, refetch: refetchChain } = useUserChainData();
  const { userPredictions, refetchUserPredictions } = useUserCreatedPredictions();
  const { predictionCounter } = usePredictionCounter();
  const { minimumLiquidity } = useMinimumLiquidity();
  const { activePredictions } = useActivePredictions();
  const { detailedMarkets, isLoading: marketsLoading } = useUserDetailedMarkets();
  
  // Transaction hooks
  const { approve, approveWallet, isApprovalPending } = useApproveToken();
  const { sendTokens } = useSendTokens();

  // Local state
  const [activeTab, setActiveTab] = useState<'overview' | 'predictions' | 'investments' | 'transactions'>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<DetailedMarket | null>(null);

  // Helper functions
  const formatPyUSD = (value: bigint | undefined): string => {
    if (!value) return '0.00';
    try {
      const formatted = formatUnits(value, 6);
      return parseFloat(formatted).toFixed(2);
    } catch (error) {
      return '0.00';
    }
  };

  const formatETH = (value: bigint | undefined): string => {
    if (!value) return '0.0000';
    try {
      const formatted = formatEther(value);
      return parseFloat(formatted).toFixed(4);
    } catch (error) {
      return '0.0000';
    }
  };

  const formatDate = (timestamp: number | bigint): string => {
    const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
    return new Date(ts * 1000).toLocaleDateString();
  };

  const formatDetailedDate = (timestamp: number | bigint): string => {
    const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
    return new Date(ts * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProfitLossColor = (value: bigint): string => {
    if (value > 0) return 'text-green-400';
    if (value < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const calculateProbability = (yesLiquidity: number | bigint, noLiquidity: number | bigint): number => {
    const yesLiq = typeof yesLiquidity === 'bigint' ? Number(yesLiquidity) : yesLiquidity;
    const noLiq = typeof noLiquidity === 'bigint' ? Number(noLiquidity) : noLiquidity;
    const total = yesLiq + noLiq;
    if (total === 0) return 50;
    return Math.round((yesLiq / total) * 100);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchAll();
      await refetchPyUSD();
      await refetchETH();
      await refetchAllowance();
      await refetchChain();
      await refetchUserPredictions();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleApproveMax = async () => {
    try {
      await approveWallet();
      await refetchAllowance();
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-900 border-gray-800 shadow-xl">
          <CardContent className="pt-6 text-center space-y-6">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-600 rounded-lg mx-auto flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white">Profile</h1>
              <p className="text-gray-400 text-lg">Connect your wallet to view your profile</p>
            </div>
            <ConnectKitButton.Custom>
              {({ show }) => (
                <Button 
                  onClick={show} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
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
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
            <p className="text-gray-400 text-lg">
              Manage your wallet and track your prediction market activity
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              {refreshing ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin"></div>
                  <span>Refreshing...</span>
                </div>
              ) : (
                'Refresh Data'
              )}
            </Button>
            <ConnectKitButton.Custom>
              {({ show }) => (
                <Button onClick={show} className="bg-blue-600 hover:bg-blue-700">
                  Wallet Settings
                </Button>
              )}
            </ConnectKitButton.Custom>
          </div>
        </div>

        {/* Wallet Address */}
        <Card className="mb-8 border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Wallet Address</p>
                <p className="text-lg font-mono text-white">
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
                </p>
              </div>
              <div className="flex space-x-2">
                <Badge variant="outline" className="border-green-600 text-green-400 bg-green-900/20">
                  Connected
                </Badge>
                <Badge variant="outline" className="border-blue-600 text-blue-400 bg-blue-900/20">
                  Sepolia
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'predictions', label: 'My Predictions', icon: '🎯' },
              { id: 'investments', label: 'Investments', icon: '💰' },
              { id: 'transactions', label: 'Transactions', icon: '📋' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Balance Cards */}
            <div className="lg:col-span-2 space-y-6">
              {/* Balances */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white text-lg flex items-center">
                      💵 PyUSD Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-3xl font-bold text-white">
                        {formatPyUSD(pyusdBalance?.value)} <span className="text-lg text-gray-400">PyUSD</span>
                      </p>
                      <div className="text-sm text-gray-400">
                        <p>Available for trading and liquidity</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white text-lg flex items-center">
                      ⚡ ETH Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-3xl font-bold text-white">
                        {formatETH(ethBalance?.value)} <span className="text-lg text-gray-400">ETH</span>
                      </p>
                      <div className="text-sm text-gray-400">
                        <p>For transaction fees</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Investment Summary */}
              <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white text-xl">📈 Investment Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Total Invested</p>
                      <p className="text-2xl font-bold text-white">
                        {userChain ? formatPyUSD(userChain.totalInvested) : '0.00'} PyUSD
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Total Claimed</p>
                      <p className="text-2xl font-bold text-white">
                        {userChain ? formatPyUSD(userChain.totalClaimed) : '0.00'} PyUSD
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Net Profit/Loss</p>
                      <p className={`text-2xl font-bold ${userChain ? getProfitLossColor(userChain.totalClaimed - userChain.totalInvested) : 'text-gray-400'}`}>
                        {userChain ? (
                          <>
                            {(userChain.totalClaimed - userChain.totalInvested) >= BigInt(0) ? '+' : ''}
                            {formatPyUSD(userChain.totalClaimed - userChain.totalInvested)} PyUSD
                          </>
                        ) : '0.00 PyUSD'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Market Activity */}
              <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white text-xl">🎯 Market Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Created Predictions</p>
                      <p className="text-2xl font-bold text-white">
                        {userPredictions?.length || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Active Markets</p>
                      <p className="text-2xl font-bold text-green-400">
                        {userPredictions?.filter(p => p.active).length || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Resolved Markets</p>
                      <p className="text-2xl font-bold text-blue-400">
                        {userPredictions?.filter(p => p.resolved).length || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Total Markets</p>
                      <p className="text-2xl font-bold text-white">
                        {predictionCounter ? Number(predictionCounter) : 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Allowance Management */}
              <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white text-lg">🔐 Allowance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Current Allowance</p>
                    <p className="text-lg font-bold text-white">
                      {allowance ? formatPyUSD(allowance as bigint) : '0.00'} PyUSD
                    </p>
                  </div>
                  <Button
                    onClick={handleApproveMax}
                    disabled={isApprovalPending}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {isApprovalPending ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Approving...</span>
                      </div>
                    ) : (
                      'Approve Max PyUSD'
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white text-lg">ℹ️ Platform Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Total Active Predictions</p>
                    <p className="text-lg font-semibold text-white">
                      {activePredictions?.length || 0}
                    </p>
                  </div>
                  <Separator className="bg-gray-700" />
                  <div>
                    <p className="text-sm text-gray-400">Minimum Liquidity</p>
                    <p className="text-lg font-semibold text-white">
                      {minimumLiquidity ? formatPyUSD(minimumLiquidity as bigint) : '0.00'} PyUSD
                    </p>
                  </div>
                  <Separator className="bg-gray-700" />
                  <div>
                    <p className="text-sm text-gray-400">Network</p>
                    <Badge variant="outline" className="border-blue-600 text-blue-400 bg-blue-900/20">
                      Sepolia Testnet
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'predictions' && !selectedMarket && (
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-xl">🎯 My Prediction Markets</CardTitle>
              <CardDescription className="text-gray-400">
                Detailed view of your created prediction markets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {marketsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                    <span className="text-gray-400">Loading markets...</span>
                  </div>
                </div>
              ) : detailedMarkets && detailedMarkets.length > 0 ? (
                <div className="space-y-4">
                  {detailedMarkets.map((market) => {
                    const probability = calculateProbability(market.yesLiquidity, market.noLiquidity);
                    return (
                      <Card key={market.id} className="border-gray-700 bg-gray-800/50 hover:bg-gray-800/70 transition-colors cursor-pointer">
                        <CardContent className="p-6" onClick={() => setSelectedMarket(market)}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-white">
                                  {market.title}
                                </h3>
                                <Badge variant="outline" className="text-xs">
                                  #{market.id}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                                <span>Category: {market.category}</span>
                                <span>•</span>
                                <span>Created: {formatDetailedDate(market.createdAt)}</span>
                                <span>•</span>
                                <span>Resolves: {formatDetailedDate(market.resolutionDate)}</span>
                              </div>

                              {/* Probability Bar */}
                              <div className="mb-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-gray-400">YES Probability</span>
                                  <span className="text-sm font-medium text-green-400">{probability}%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div 
                                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${probability}%` }}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-400">Total Liquidity: </span>
                                  <span className="text-white font-medium">
                                    {formatPyUSD(BigInt(market.yesLiquidity) + BigInt(market.noLiquidity))} PyUSD
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-400">YES Pool: </span>
                                  <span className="text-green-400 font-medium">
                                    {formatPyUSD(BigInt(market.yesLiquidity))} PyUSD
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-400">NO Pool: </span>
                                  <span className="text-red-400 font-medium">
                                    {formatPyUSD(BigInt(market.noLiquidity))} PyUSD
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col space-y-2 ml-4">
                              <Badge
                                variant="outline"
                                className={`${
                                  market.active
                                    ? 'border-green-600 text-green-400 bg-green-900/20'
                                    : market.resolved
                                    ? 'border-blue-600 text-blue-400 bg-blue-900/20'
                                    : 'border-gray-600 text-gray-400 bg-gray-800/20'
                                }`}
                              >
                                {market.active ? 'Active' : market.resolved ? 'Resolved' : 'Inactive'}
                              </Badge>
                              {market.resolved && (
                                <Badge
                                  variant="outline"
                                  className={`${
                                    market.outcome
                                      ? 'border-green-600 text-green-400 bg-green-900/20'
                                      : 'border-red-600 text-red-400 bg-red-900/20'
                                  }`}
                                >
                                  {market.outcome ? 'YES Won' : 'NO Won'}
                                </Badge>
                              )}
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMarket(market);
                                }}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-800 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No predictions yet</h3>
                  <p className="text-gray-400 mb-4">You haven't created any prediction markets yet.</p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Create Your First Prediction
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Market Details View */}
        {activeTab === 'predictions' && selectedMarket && (
          <div>
            <div className="mb-4">
              <Button
                onClick={() => setSelectedMarket(null)}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                ← Back to Markets
              </Button>
            </div>
            <MarketDetails 
              market={selectedMarket} 
              onClose={() => setSelectedMarket(null)}
            />
          </div>
        )}

        {activeTab === 'investments' && (
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-xl">💰 My Investments</CardTitle>
              <CardDescription className="text-gray-400">
                Your investments across all prediction markets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-800 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Investment tracking coming soon</h3>
                <p className="text-gray-400">We're working on detailed investment tracking features.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'transactions' && (
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-xl">📋 Transaction History</CardTitle>
              <CardDescription className="text-gray-400">
                Your transaction history on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-800 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Transaction history coming soon</h3>
                <p className="text-gray-400">We're working on comprehensive transaction tracking.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
