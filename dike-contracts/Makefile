# Dike Contracts Makefile

.PHONY: help install build test deploy clean

# Default target
help:
	@echo "Available commands:"
	@echo "  install    - Install dependencies"
	@echo "  build      - Build contracts"
	@echo "  test       - Run tests"
	@echo "  deploy     - Deploy contracts (requires NETWORK and PRIVATE_KEY env vars)"
	@echo "  deploy-anvil - Deploy to local Anvil network"
	@echo "  clean      - Clean build artifacts"

# Install dependencies
install:
	forge install

# Build contracts
build:
	forge build

# Run tests
test:
	forge test

# Deploy to specified network
deploy:
	forge script script/DeployDike.s.sol:DeployDikeScript --rpc-url https://ethereum-sepolia-public.nodies.app --account default --via-ir

verify-sepolia:
		forge verify-contract --chain-id 11155111 --num-of-optimizations 200 --watch \
			--etherscan-api-key $(ETHERSCAN_API_KEY) \
			$$CONTRACT_ADDRESS src/Dike.sol:MultiversePrediction

# Deploy to local Anvil network
deploy-anvil:
	@echo "Starting Anvil in background..."
	anvil --host 0.0.0.0 --port 8545 &
	@sleep 2
	@echo "Deploying to Anvil..."
	NETWORK=anvil PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 ./scripts/deploy.sh anvil
	@echo "Deployment complete. Anvil is running in background."

# Clean build artifacts
clean:
	forge clean
	rm -rf deployments/
