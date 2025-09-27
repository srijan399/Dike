# Dike Contracts Makefile

.PHONY: help install build test deploy clean

# Default target
help:
	@echo "Available commands:"
	@echo "  install    - Install dependencies"
	@echo "  build      - Build contracts"
	@echo "  test       - Run tests"
	@echo "  deploy     - Deploy Dike contracts (requires NETWORK and PRIVATE_KEY env vars)"
	@echo "  deploy-full - Deploy FullDike contracts (requires NETWORK and PRIVATE_KEY env vars)"
	@echo "  deploy-anvil - Deploy to local Anvil network"
	@echo "  verify-sepolia - Verify Dike contract on Sepolia"
	@echo "  verify-full-sepolia - Verify FullDike contract on Sepolia"
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

# Deploy Dike to specified network
deploy:
	forge script script/DeployDike.s.sol:DeployDikeScript --rpc-url https://eth-sepolia.g.alchemy.com/v2/IsiYA3L8QTZAaZm0_JNTt6qgw1yLehws --account default --broadcast --via-ir

deploySri:
	forge script script/DeployDike.s.sol:DeployDikeScript --rpc-url https://sepolia.infura.io/v3/1ea5690df9404cc282f3644cb559e6cd --account pvt --broadcast --via-ir


# Deploy FullDike to specified network
deploy-full:
	forge script script/DeployFullDike.s.sol:DeployFullDikeScript --rpc-url https://ethereum-sepolia-public.nodies.app --account default --broadcast --via-ir

verify-sepolia:
	forge verify-contract --chain-id 11155111 --num-of-optimizations 200 --watch \
		--etherscan-api-key $(ETHERSCAN_API_KEY) \
		$(CONTRACT_ADDRESS) src/Dike.sol:MultiversePrediction

verify-full-sepolia:
	forge verify-contract --chain-id 11155111 --num-of-optimizations 200 --watch \
		--etherscan-api-key $(ETHERSCAN_API_KEY) \
		$(CONTRACT_ADDRESS) src/FullDike.sol:FullDike

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
