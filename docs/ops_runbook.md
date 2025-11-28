# Operations Runbook

## Deployment

1.  **Deploy Contracts**:
    ```bash
    cd contracts
    # Use Hardhat/Foundry to deploy
    npx hardhat run scripts/deploy.ts
    ```

2.  **Initialize Seed**:
    - Call `SeedIngestion.updateSeed()` with initial L1 values.

## Node Operation

1.  **Configuration**:
    - Set `RPC_URL` and `PRIVATE_KEY` in `.env`.
    - Adjust `ALPHA`, `BETA`, `GAMMA` to match protocol parameters.

2.  **Start Node**:
    ```bash
    cd node
    npm start
    ```

## Monitoring

- **Logs**: Check `stdout` for "Epoch processed" and "Winner" messages.
- **Metrics**: Monitor `active_nodes` and `epoch_latency`.

## Emergency Procedures

- **L1 Halt**: If L1 stops producing blocks, the seed will not update. The protocol pauses until L1 resumes.
- **Slashing**: If a node is slashed, it enters `Exited` state immediately.
