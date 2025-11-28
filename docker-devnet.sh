#!/bin/bash
set -e

# Cleanup function
cleanup() {
    echo "Stopping containers..."
    docker-compose down
    exit
}
trap cleanup SIGINT SIGTERM

echo "Building images..."
docker-compose build

echo "Starting Blockchain Node (Chain)..."
# Start only the chain first
docker-compose up -d chain

echo "Waiting for Chain to be ready..."
sleep 5

echo "Deploying contracts..."
# We deploy from the HOST, connecting to the container's exposed port.
# We'll assume the host port is 8545 (default) or we can change it if needed.
# If 8545 is blocked, we might need to edit docker-compose.yml to map 8546:8545
# For now, let's try to use the default and assume the user can clear the port if needed.
# But since the user had an error, let's try to detect or just proceed.

cd contracts
# Note: We need to tell Hardhat to talk to localhost:8545 (which is mapped to container)
DEPLOY_OUTPUT=$(npx hardhat run scripts/deploy.ts --network localhost)
echo "$DEPLOY_OUTPUT"

REGISTRY_ADDR=$(echo "$DEPLOY_OUTPUT" | grep "Registry deployed to:" | awk '{print $4}')
SEED_ADDR=$(echo "$DEPLOY_OUTPUT" | grep "SeedIngestion deployed to:" | awk '{print $4}')

echo "Registry: $REGISTRY_ADDR"
echo "SeedIngestion: $SEED_ADDR"
cd ..

echo "Starting L1 Simulator and Nodes..."
# Now we start the rest, passing in the env vars
export REGISTRY_ADDRESS=$REGISTRY_ADDR
export SEED_INGESTION_ADDRESS=$SEED_ADDR

docker-compose up l1-sim node-1 node-2
