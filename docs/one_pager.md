# Blockage Protocol One-Pager

**Blockage Protocol** is an L2 zk-rollup designed for fairness and decentralization using an **age-weighted exponential race** mechanism.

## Key Features

1.  **Age-Weighted Selection**: Combats the "rich-get-richer" problem by increasing the selection probability of nodes that haven't won recently.
2.  **Off-Chain Membership**: Scalable node registry managed via smart contracts but operated off-chain.
3.  **L1 Seed Generation**: Unbiasable randomness derived from L1 beacons (Ethereum).
4.  **Crowd-Proving**: Inclusive proving mechanism allowing low-power devices to participate via pooling and delegation.

## Architecture

- **L1 Contracts**: Registry, Staking, Seed Ingestion, Proof Escrow.
- **L2 Nodes**:
    - **Sequencer**: Proposes blocks (selected via VRF).
    - **Prover**: Generates ZK proofs (crowd-sourced).
- **Network**: P2P gossip for block propagation and proof submission.

## Status
- **Spec**: Draft complete.
- **Sim**: Python simulation available.
- **Node**: Skeleton implementation ready.
