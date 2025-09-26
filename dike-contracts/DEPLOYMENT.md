# Dike Contract Deployment Guide

This guide explains how to deploy the MultiversePrediction contract to various networks.

## Prerequisites

1. **Foundry**: Install [Foundry](https://book.getfoundry.sh/getting-started/installation)
2. **Private Key**: Your wallet's private key for deployment
3. **RPC URLs**: Access to RPC endpoints for your target networks
4. **API Keys**: Etherscan/Basescan API keys for contract verification

## Environment Setup

### 1. Set Environment Variables

```bash
# Required: Your private key
export PRIVATE_KEY="your_private_key_here"

# Optional: API keys for verification
export ETHERSCAN_API_KEY="your_etherscan_api_key"
export BASESCAN_API_KEY="your_basescan_api_key"

# Optional: Custom RPC URLs
export MAINNET_RPC_URL="https://eth-mainnet.g.alchemy.com/v2/your_key"
export SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/your_key"
```

### 2. Install Dependencies

```bash
make install
```

## Deployment Methods

### Method 1: Using the Makefile (Recommended)

```bash
# Deploy to local Anvil network
make deploy-anvil

# Deploy to testnet
make deploy NETWORK=sepolia

# Deploy to mainnet
make deploy NETWORK=mainnet
```

### Method 2: Using the Deployment Script Directly

```bash
# Make the script executable
chmod +x scripts/deploy.sh

# Deploy to specific network
./scripts/deploy.sh sepolia

# Deploy with custom private key environment variable
./scripts/deploy.sh mainnet MY_PRIVATE_KEY
```

### Method 3: Using Foundry Scripts Directly

```bash
# Deploy to Anvil (local)
forge script script/DeployDikeWithConfig.s.sol:DeployDikeWithConfigScript \
    --rpc-url anvil \
    --broadcast

# Deploy to Sepolia
forge script script/DeployDikeWithConfig.s.sol:DeployDikeWithConfigScript \
    --rpc-url sepolia \
    --broadcast \
    --verify \
    --etherscan-api-key $ETHERSCAN_API_KEY
```

## Network Configurations

### Supported Networks

| Network      | Chain ID | Status        | pyUSD Address                              |
| ------------ | -------- | ------------- | ------------------------------------------ |
| Anvil        | 31337    | ✅ Local      | Mock token                                 |
| Sepolia      | 11155111 | ✅ Testnet    | TBD                                        |
| Mainnet      | 1        | ✅ Production | 0x6c3ea903640685200629e0f9E2e963c3c9659d1F |
| Base         | 8453     | ✅ Production | TBD                                        |
| Base Sepolia | 84532    | ✅ Testnet    | TBD                                        |

### Network-Specific Notes

#### Local Development (Anvil)

- Automatically deploys a mock pyUSD token
- No verification needed
- Perfect for testing

#### Testnets (Sepolia, Base Sepolia)

- Use testnet pyUSD tokens
- Contract verification enabled
- Safe for testing

#### Mainnets (Ethereum, Base)

- Use real pyUSD tokens
- Contract verification enabled
- **⚠️ Production deployments - double-check everything!**

## Contract Details

### Constructor Parameters

- `_pyUSD`: Address of the pyUSD token contract

### Key Features

- **Minimum Liquidity**: 10 pyUSD tokens required to create predictions
- **Owner Functions**: Only owner can resolve predictions
- **Reentrancy Protection**: Built-in security measures
- **Event Logging**: Comprehensive event emission

## Post-Deployment Steps

### 1. Verify Contract

```bash
# If auto-verification failed, verify manually
forge verify-contract <CONTRACT_ADDRESS> \
    --chain-id <CHAIN_ID> \
    --etherscan-api-key $ETHERSCAN_API_KEY \
    --constructor-args $(cast abi-encode "constructor(address)" <PYUSD_ADDRESS>)
```

### 2. Update Frontend Configuration

Update your frontend with the new contract address:

```typescript
const CONTRACT_ADDRESS = "0x..."; // Your deployed contract address
const PYUSD_ADDRESS = "0x..."; // pyUSD token address
```

### 3. Test Contract Functions

```bash
# Test creating a prediction
cast send $CONTRACT_ADDRESS \
    "createPrediction(string,string,string,uint256,uint256)" \
    "Test Prediction" "test" "{}" $(date -d "+1 day" +%s) 10000000 \
    --rpc-url $NETWORK \
    --private-key $PRIVATE_KEY
```

## Troubleshooting

### Common Issues

#### 1. "Insufficient funds"

- Ensure your wallet has enough ETH for gas fees
- Check gas price settings

#### 2. "Transfer failed"

- Ensure you have pyUSD tokens in your wallet
- Check token allowance if needed

#### 3. "Verification failed"

- Wait a few minutes and try manual verification
- Check constructor arguments are correct

#### 4. "Network not found"

- Ensure RPC URL is correct
- Check network configuration in `deployments/config.json`

### Getting Help

1. Check the deployment logs in `deployments/` directory
2. Verify your environment variables
3. Test on a local network first
4. Check network status and gas prices

## Security Considerations

### Production Deployments

- **Never** use the same private key for multiple networks
- **Always** test on testnets first
- **Consider** using a multisig wallet for production
- **Verify** all contract addresses before use

### Private Key Security

- Store private keys in environment variables, not in code
- Use hardware wallets for production deployments
- Consider using key management services

## Deployment History

Deployment information is automatically saved to `deployments/<network>.json`:

```json
{
  "network": "sepolia",
  "contract": "0x...",
  "pyUSD": "0x...",
  "timestamp": "1234567890"
}
```

## Additional Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Ethereum Gas Tracker](https://ethgasstation.info/)
- [Base Gas Tracker](https://basescan.org/gastracker)
