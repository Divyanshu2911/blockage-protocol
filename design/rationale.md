# Design Rationale

## 1. Comparison with Existing Protocols

### vs. Algorand
- **Algorand**: Uses pure stake-weighted VRF sortition.
- **Blockage**: Adds **age-weighting** to combat "rich-get-richer" dynamics and encourage long-term participation.

### vs. Ouroboros (Cardano)
- **Ouroboros**: Stake-based slot leadership.
- **Blockage**: Uses an exponential race mechanism (Gumbel-Max trick equivalent) combined with age, offering a different fairness distribution.

### vs. Tendermint / Starknet
- **Tendermint**: Round-robin proposer selection (deterministic).
- **Blockage**: Probabilistic selection via VRF, reducing predictability and DDoS vectors.

## 2. Threat Model & Anti-Grinding

### Grinding Attacks
- **Mitigation**: Use of L1 beacon randomness (unbiasable) for seed generation.
- **Stake-Bound Keys**: VRF keys are bound to stake; generating new keys requires staking, making grinding expensive.
- **Domain Separation**: Distinct seeds for different roles (proposer vs. prover) to prevent cross-domain grinding.

## 3. Incentive Model

### Rewards
- **Block Rewards**: Proportional to selection probability but boosted by age.
- **Fees**: Transaction fees go to the sequencer/proposer.

### Slashing
- **Equivocation**: Double signing results in slashing of stake.
- **Liveness**: Penalties for missing assigned slots (though less severe than safety violations).

## 4. Crowd-Proving Escrow

Inspired by Crowdprove, we enable low-power nodes to participate in proving.
- **Mechanism**: Provers submit proofs to an escrow contract.
- **Verification**: Once verified, the reward is released.
- **Pooling**: Small provers can pool resources or delegate to larger aggregators.
