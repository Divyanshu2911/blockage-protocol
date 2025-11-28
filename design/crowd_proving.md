# Crowd-Proving Escrow Flows

## Overview
Crowd-proving allows decentralized generation of ZK proofs for the rollup, enabling low-power nodes to contribute.

## Flow

1.  **Task Submission**:
    - Sequencer posts a state transition task (block) to the `ProofEscrow` contract.
    - Includes a bounty for the proof.

2.  **Claiming**:
    - Provers (or pools) claim a task by locking a small bond.
    - This prevents spam and ensures commitment.

3.  **Proof Generation**:
    - Prover generates the ZK proof off-chain.

4.  **Submission & Verification**:
    - Prover submits the proof to the `ProofEscrow`.
    - Contract verifies the proof (or uses an optimistic challenge window).

5.  **Payout**:
    - Upon successful verification, the bounty + bond is returned to the prover.
    - If verification fails or timeout, bond is slashed.

## Low-Power Participation
- **Delegation**: Low-power nodes can delegate their compute power to a pool.
- **Split Tasks**: Large proofs can be split into smaller chunks (if the ZK scheme supports recursion/aggregation) to be proven by smaller devices.
