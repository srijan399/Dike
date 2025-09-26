#!/bin/bash

# Dike Contract Deployment Script
# Usage: ./scripts/deploy.sh [network] [private_key_env_var]

set -e

# Default values
NETWORK=${1:-"anvil"}
PRIVATE_KEY_ENV=${2:-"PRIVATE_KEY"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Dike Contract Deployment Script${NC}"
echo -e "${BLUE}===================================${NC}"

# Check if private key is set
if [ -z "${!PRIVATE_KEY_ENV}" ]; then
    echo -e "${RED}❌ Error: Private key not found in environment variable: $PRIVATE_KEY_ENV${NC}"
    echo -e "${YELLOW}💡 Set your private key: export $PRIVATE_KEY_ENV=your_private_key_here${NC}"
    exit 1
fi

# Check if network is valid
case $NETWORK in
    "anvil"|"localhost"|"mainnet"|"sepolia")
        echo -e "${GREEN}✅ Valid network: $NETWORK${NC}"
        ;;
    *)
        echo -e "${RED}❌ Error: Invalid network: $NETWORK${NC}"
        echo -e "${YELLOW}💡 Valid networks: anvil, localhost, mainnet, sepolia${NC}"
        exit 1
        ;;
esac

# Create deployments directory if it doesn't exist
mkdir -p deployments

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo -e "   Network: $NETWORK"
echo -e "   Private Key Env: $PRIVATE_KEY_ENV"
echo -e "   Script: script/DeployDike.s.sol"
echo ""

# Set environment variables for the script
export NETWORK=$NETWORK

# Deploy the contract
echo -e "${YELLOW}⏳ Deploying contract...${NC}"

if forge script script/DeployDike.s.sol:DeployDikeScript \
    --rpc-url $NETWORK \
    --broadcast \
    --verify \
    --etherscan-api-key $ETHERSCAN_API_KEY 2>/dev/null; then
    echo -e "${GREEN}✅ Contract deployed successfully!${NC}"
else
    echo -e "${YELLOW}⚠️  Deployment completed (verification may have failed)${NC}"
fi

echo ""
echo -e "${BLUE}📄 Deployment Summary:${NC}"

# Check if deployment file was created
DEPLOYMENT_FILE="deployments/$NETWORK.json"
if [ -f "$DEPLOYMENT_FILE" ]; then
    echo -e "${GREEN}✅ Deployment info saved to: $DEPLOYMENT_FILE${NC}"
    echo ""
    echo -e "${BLUE}📋 Deployment Details:${NC}"
    cat $DEPLOYMENT_FILE | jq '.' 2>/dev/null || cat $DEPLOYMENT_FILE
else
    echo -e "${YELLOW}⚠️  Deployment file not found: $DEPLOYMENT_FILE${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment process completed!${NC}"

# Show next steps
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo -e "   1. Verify the contract on block explorer (if not auto-verified)"
echo -e "   2. Update your frontend with the new contract address"
echo -e "   3. Test the contract functionality"
echo -e "   4. Consider setting up a multisig for production deployments"
