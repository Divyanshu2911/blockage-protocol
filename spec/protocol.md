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

### VRF Scheme
- **Algorithm**: EC-VRF (Elliptic Curve Verifiable Random Function) per RFC 9381.
- **Fallback**: Commit-reveal scheme if VRF generation fails or for specific phases.

## 4. Message Formats

### Join/Leave
- `Join`: `{ pid, stake, vrf_key, comm_key, signature }`
- `Leave`: `{ pid, epoch, signature }`

### Delegation
- `Delegate`: `{ delegator_pid, validator_pid, amount, signature }`

### Epoch Roll
- `EpochStart`: `{ epoch_number, seed, active_set_root }`

## 5. PBS Hooks (Proposer-Builder Separation)
- `Propose`: `{ slot, builder_bid, validator_signature }`
