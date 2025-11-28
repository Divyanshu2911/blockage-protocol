# Multi-Machine Setup Guide

This guide explains how to run the `blockage-protocol` across multiple machines using Docker.

## Prerequisites
- Docker and Docker Compose installed on all machines.

## Architecture
- **Machine A (Host)**: Runs the Blockchain (Hardhat) and L1 Simulator.
- **Machine B, C, ... (Nodes)**: Run Blockage Nodes connecting to Machine A.

## Step 1: Start the Chain (Machine A)

1.  Edit `docker-compose.yml` to only run the chain and sim:
    ```bash
    docker-compose up chain l1-sim
    ```
2.  Note the IP address of Machine A (e.g., `192.168.1.100`).

## Step 2: Deploy Contracts

You need to deploy contracts once the chain is running.
```bash
cd contracts
npx hardhat run scripts/deploy.ts --network localhost
```
Note the `Registry` and `SeedIngestion` addresses.

## Step 3: Start Nodes (Machine B, C...)

1.  Clone the repo.
2.  Update `.env` or set environment variables:
    ```bash
    export RPC_URL="http://192.168.1.100:8545"
    export REGISTRY_ADDRESS="0x..."
    export SEED_INGESTION_ADDRESS="0x..."
    export PRIVATE_KEY="0x..." # Use a unique key for each node
    ```
3.  Run the node:
    ```bash
    docker-compose up node-1
    # OR manually
    cd node
    npm install && npm start
    ```

## Troubleshooting
- Ensure port `8545` is open on Machine A's firewall.
- Use `telnet 192.168.1.100 8545` to verify connectivity.
