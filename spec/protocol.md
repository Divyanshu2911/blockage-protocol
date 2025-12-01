# Protocol Specification

## 1. State Machine

Nodes in the `blockage-protocol` move through the following states:

`Pending` -> `Active` -> `Unbonding` -> `Exited`

- **Pending**: Node has registered but is not yet eligible for selection.
- **Active**: Node is eligible for selection in lotteries. Accumulates block-age ($a_i$).
- **Unbonding**: Node has requested to leave. No longer eligible for selection. No age accrual.
- **Exited**: Node has fully withdrawn.

### Transitions
- `register(stake, keys)`: `None` -> `Pending`
- `activate()`: `Pending` -> `Active` (after epoch transition)
- `unbond()`: `Active` -> `Unbonding`
- `withdraw()`: `Unbonding` -> `Exited` (after unbonding period)

## 2. Lottery Mechanism (Age-Weighted Exponential Race)

### Parameters
- $\alpha$: Stake weight exponent (default: 1.0)
- $\beta$: Age weight exponent (default: 0.3)
- $\gamma$: Age scaling factor (default: 0.04)
- $A_{\max}$: Maximum age cap (default: 256)

### Selection Weight ($w_i$)
For a node $i$ with stake $s_i$ and block-age $a_i$:

$$ w_i = s_i^{\alpha} \cdot (1 + \gamma \cdot \min(a_i, A_{\max}))^{\beta} $$

### Tie-Breaking
Tie-break using `H(PID || σ)`, where:
- `PID`: Persistent on-chain identity.
- `σ`: Epoch seed.

## 3. VRF & Seed Generation

### Seed Source
The seed $\sigma$ is derived from L1 beacons to ensure unpredictability and unbiasability.

$$ \sigma = H(\textsf{chainId} \mid \textsf{l1Epoch} \mid \textsf{beaconRand} \mid \textsf{blockHash} \mid \textsf{rollupEpoch} \mid \textsf{slot} \mid \textsf{role}) $$

### VRF Input (Domain Separation)
To ensure the Sequencer and Prover lotteries are independent, we include a **Role** domain separator in the VRF input:
- **Sequencer**: `VRF(privateKey, seed || "SEQUENCER")`
- **Prover**: `VRF(privateKey, seed || "PROVER")`

### VRF Scheme
- **Algorithm**: EC-VRF (Elliptic Curve Verifiable Random Function) per RFC 9381.
- **Fallback**: Commit-reveal scheme if VRF generation fails or for specific phases.

## 4. Message Formats

### Join/Leave
- `Join`: `{ pid, stake, vrf_key, comm_key, role, signature }`
  - **Role Bitmask**: `1 = Sequencer`, `2 = Prover`, `3 = Both`
- `Leave`: `{ pid, epoch, signature }`

### Delegation
- `Delegate`: `{ delegator_pid, validator_pid, amount, signature }`

### Epoch Roll
- `EpochStart`: `{ epoch_number, seed, active_set_root }`

## 5. Prover Lottery & Crowd-Proving

### Prover Selection
The protocol runs a second lottery to select the **Prover** for an epoch.
- **Weighting**: Same age-weighted formula as the Sequencer lottery.
- **Role**: The winner is responsible for submitting the ZK proof for the batch.

### Prover Types
1.  **Solo Prover**:
    - A single node wins and generates the full proof.
    - **Submission**: `submitProof(batchId, proof)`

### CrowdProve Architecture (Delegation Pool)
Based on the CrowdProve methodology, the "Delegation Pool" operates as a **Job Distributor (JD)** connecting to **Community Provers**.

1.  **Job Distributor (JD)**:
    - Managed by the Pool Operator (the lottery winner).
    - Acts as a proxy between the core rollup system and community provers.
    - **Responsibilities**:
        - Fetching proving jobs (batches) from the rollup.
        - Splitting batches into chunks.
        - Assigning chunks to Community Provers.
        - Verifying sub-proofs.
        - Aggregating and submitting the final proof.
        - Managing the "Least-Recently-Processed" (LRP) queue for fairness.

2.  **Community Prover (Worker)**:
    - Lightweight software running on commodity hardware (Consumer GPUs/CPUs).
    - **Workflow**:
        1.  **Poll**: Periodically polls the JD for work (`get_job`).
        2.  **Compute**: Generates ZK proof for the assigned chunk.
        3.  **Submit**: Returns proof to JD (`submit_result`).
    - **Incentive**: Paid by the JD upon successful verification of their sub-proof.

### Work Splitting & Assignment (Off-Chain)
- **Protocol**: JSON-RPC over HTTP/WebSocket.
- **Job Assignment**:
    - **LRP Mechanism**: Jobs are assigned to the least recently served prover to prevent hoarding and ensure liveness.
    - **Timeout**: If a prover fails to submit within $T_{timeout}$, the job is reassigned.
- **Job Object**: `{ jobId, chunkId, witnessData, deadline }`
- **Result Object**: `{ jobId, chunkId, proof, publicInputs }`

## 6. PBS Hooks (Proposer-Builder Separation)
- `Propose`: `{ slot, builder_bid, validator_signature }`
