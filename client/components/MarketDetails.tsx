'use client';

import React, { useState } from 'react';
import { formatUnits } from 'viem';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DetailedMarket, MarketInvestment, useDetailedMarket, useMarketPrices } from '@/hooks/useProfile';

interface MarketDetailsProps {
  market: DetailedMarket;
  onClose?: () => void;
  showInvestors?: boolean;
}

export default function MarketDetails({ market, onClose, showInvestors = true }: MarketDetailsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'investors' | 'activity'>('overview');
  const { marketPrices } = useMarketPrices(market.id);
  
  const formatPyUSD = (value: bigint): string => {
    try {
      const formatted = formatUnits(value, 6);
      return parseFloat(formatted).toFixed(2);
    } catch (error) {
      return '0.00';
    }
  };

  const formatDate = (timestamp: number | bigint): string => {
    const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
    return new Date(ts * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateProbability = (yesLiquidity: bigint, noLiquidity: bigint): number => {
    const total = yesLiquidity + noLiquidity;
    if (total === BigInt(0)) return 50;
    return Number((yesLiquidity * BigInt(100)) / total);
  };

  const getStatusColor = (market: DetailedMarket): string => {
    if (market.resolved) {
      return market.outcome ? 'text-green-400' : 'text-red-400';
    }
    return market.active ? 'text-blue-400' : 'text-gray-400';
  };

  const getStatusText = (market: DetailedMarket): string => {
    if (market.resolved) {
      return market.outcome ? 'Resolved - YES' : 'Resolved - NO';
    }
    return market.active ? 'Active' : 'Inactive';
  };

  const probabilityYes = calculateProbability(BigInt(market.yesLiquidity), BigInt(market.noLiquidity));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h2 className="text-2xl font-bold text-white">{market.title}</h2>
            {onClose && (
              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-400 hover:bg-gray-800"
              >
                ✕
              </Button>
            )}
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span>ID: #{market.id}</span>
            <span>•</span>
            <span>Category: {market.category}</span>
            <span>•</span>
            <span className={getStatusColor(market)}>{getStatusText(market)}</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white text-lg">📊 Market Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-400 mb-1">Current Probability</p>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${probabilityYes}%` }}
                  />
                </div>
                <span className="text-lg font-bold text-green-400">{probabilityYes.toFixed(0)}%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">YES probability</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Liquidity</p>
              <p className="text-2xl font-bold text-white">
                {formatPyUSD(BigInt(market.yesLiquidity) + BigInt(market.noLiquidity))} <span className="text-lg text-gray-400">PyUSD</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">YES Pool</p>
              <p className="text-xl font-bold text-green-400">
                {formatPyUSD(BigInt(market.yesLiquidity))} PyUSD
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">NO Pool</p>
              <p className="text-xl font-bold text-red-400">
                {formatPyUSD(BigInt(market.noLiquidity))} PyUSD
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Prices */}
      {marketPrices && (
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-lg">💰 Current Prices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-green-400 font-medium">YES Token</span>
                  <span className="text-2xl font-bold text-green-400">
                    ${formatPyUSD(marketPrices.yesPrice)}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-1">Price per YES token</p>
              </div>
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-red-400 font-medium">NO Token</span>
                  <span className="text-2xl font-bold text-red-400">
                    ${formatPyUSD(marketPrices.noPrice)}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-1">Price per NO token</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: '📋' },
          { id: 'investors', label: 'Investors', icon: '👥' },
          { id: 'activity', label: 'Activity', icon: '📈' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors flex-1 justify-center ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Market Information */}
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-lg">📝 Market Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">Description</p>
                <p className="text-white">
                  {market.metadata || 'No description provided'}
                </p>
              </div>
              <Separator className="bg-gray-700" />
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Created</p>
                  <p className="text-white">{formatDate(market.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Resolution Date</p>
                  <p className="text-white">{formatDate(market.resolutionDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Initial Liquidity</p>
                  <p className="text-white">{formatPyUSD(BigInt(market.initialLiquidity))} PyUSD</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Creator</p>
                  <p className="text-white font-mono text-sm">
                    {market.creator.slice(0, 6)}...{market.creator.slice(-4)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'investors' && (
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-lg">👥 Market Investors</CardTitle>
          </CardHeader>
          <CardContent>
            {market.investments && market.investments.length > 0 ? (
              <div className="space-y-3">
                {market.investments.map((investment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {investment.investor.slice(2, 4).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-mono text-sm">
                          {investment.investor.slice(0, 6)}...{investment.investor.slice(-4)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(investment.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">
                        {formatPyUSD(investment.amount)} PyUSD
                      </p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          investment.side 
                            ? 'border-green-600 text-green-400 bg-green-900/20' 
                            : 'border-red-600 text-red-400 bg-red-900/20'
                        }`}
                      >
                        {investment.side ? 'YES' : 'NO'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-800 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No investors yet</h3>
                <p className="text-gray-400">This market hasn't received any investments yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'activity' && (
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-lg">📈 Market Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-800 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Activity tracking coming soon</h3>
              <p className="text-gray-400">We're working on detailed market activity tracking.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
