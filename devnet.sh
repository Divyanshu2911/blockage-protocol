#!/bin/bash
set -e

# Cleanup function
cleanup() {
    echo "Stopping nodes..."
    kill $HARDHAT_PID 2>/dev/null || true
    kill $NODE_PID 2>/dev/null || true
    exit
}
trap cleanup SIGINT SIGTERM

echo "Starting Hardhat node..."
cd contracts
npx hardhat node > ../hardhat.log 2>&1 &
HARDHAT_PID=$!
cd ..

echo "Waiting for Hardhat node to be ready..."
sleep 5

echo "Deploying contracts..."
cd contracts
# Capture output to parse addresses
DEPLOY_OUTPUT=$(npx hardhat run scripts/deploy.ts --network localhost)
echo "$DEPLOY_OUTPUT"

# Extract addresses (simple grep/awk, assumes standard output format)
REGISTRY_ADDR=$(echo "$DEPLOY_OUTPUT" | grep "Registry deployed to:" | awk '{print $4}')
SEED_ADDR=$(echo "$DEPLOY_OUTPUT" | grep "SeedIngestion deployed to:" | awk '{print $4}')

echo "Registry: $REGISTRY_ADDR"
echo "SeedIngestion: $SEED_ADDR"
cd ..

echo "Starting Blockage Node..."
cd node
# Export env vars for the node
export REGISTRY_ADDRESS=$REGISTRY_ADDR
export SEED_INGESTION_ADDRESS=$SEED_ADDR
export RPC_URL="http://127.0.0.1:8545"
export PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" # Hardhat Account #0

npm start &
NODE_PID=$!

echo "Starting L1 Simulator..."
cd ../contracts
export SEED_INGESTION_ADDRESS=$SEED_ADDR
npx hardhat run scripts/simulate_l1.ts --network localhost &
SIM_PID=$!

echo "Starting Dashboard..."
cd ../dashboard
# Pass env vars to Vite
export VITE_REGISTRY_ADDRESS=$REGISTRY_ADDR
export VITE_SEED_INGESTION_ADDRESS=$SEED_ADDR
# Hardcoded key from Hardhat Account #0 (same as node)
export VITE_NODE_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
npm run dev -- --port 3000 &
DASH_PID=$!

# Update cleanup to kill dash too
trap "kill $HARDHAT_PID $NODE_PID $SIM_PID $DASH_PID 2>/dev/null || true; exit" SIGINT SIGTERM

wait $NODE_PID
