.PHONY: help install compile deploy upgrade downgrade stream-start stream-check stream-stop balance clean

# Network configuration
NETWORK ?= sepolia

help: ## Show this help message
	@echo "SafeStream Contract Management"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Setup:"
	@echo "  install         Install dependencies"
	@echo "  compile         Compile Superfluid interfaces"
	@echo ""
	@echo "Deployment:"
	@echo "  deploy          Deploy SuperToken wrapper (update .env after!)"
	@echo ""
	@echo "Token Operations:"
	@echo "  upgrade         Wrap PYUSD → SuperToken"
	@echo "  downgrade       Unwrap SuperToken → PYUSD"
	@echo "  balance         Check token balances"
	@echo ""
	@echo "Streaming:"
	@echo "  stream-start    Start payment stream"
	@echo "  stream-check    Check active streams"
	@echo "  stream-stop     Stop payment stream"
	@echo ""
	@echo "Utilities:"
	@echo "  clean           Clean build artifacts"
	@echo ""

install: ## Install dependencies
	pnpm install

compile: ## Compile contracts
	npx hardhat compile

deploy: ## Deploy SuperToken wrapper
	@echo "🚀 Deploying SuperToken..."
	npx hardhat run scripts/supertoken/registration/deployWrappedSuperToken.ts --network $(NETWORK)
	@echo ""
	@echo "⚠️  ACTION REQUIRED: Update SUPERTOKEN_ADDRESS in .env with deployed address!"
	@echo ""

upgrade: ## Wrap PYUSD to SuperToken
	@echo "📦 Wrapping PYUSD to SuperToken..."
	npx hardhat run scripts/supertoken/upgrade-token/upgradePYUSDBatch.ts --network $(NETWORK)

downgrade: ## Unwrap SuperToken to PYUSD
	@echo "📤 Unwrapping SuperToken to PYUSD..."
	npx hardhat run scripts/supertoken/downgrade-token/downgradePYUSD.ts --network $(NETWORK)

stream-start: ## Start payment stream
	@echo "▶️  Starting payment stream..."
	npx hardhat run scripts/supertoken/create-streaming/batchCreateFlow.ts --network $(NETWORK)

stream-check: ## Check active streams
	@echo "🔍 Checking active streams..."
	npx hardhat run scripts/supertoken/get-streaming/checkFlow.ts --network $(NETWORK)

stream-stop: ## Stop payment stream
	@echo "⏹️  Stopping payment stream..."
	npx hardhat run scripts/supertoken/stop-streaming/deleteFlowForwarder.ts --network $(NETWORK)

balance: ## Check token balances
	@echo "💰 Checking balances..."
	npx hardhat run scripts/supertoken/get-streaming/checkBalances.ts --network $(NETWORK)

clean: ## Clean build artifacts
	npx hardhat clean
	rm -rf cache artifacts