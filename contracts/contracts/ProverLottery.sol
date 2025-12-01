// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Registry.sol";
import "./SeedIngestion.sol";

/**
 * @title ProverLottery
 * @notice Selects a Prover (or Pool) for each epoch using the Age-Weighted Exponential Race.
 * @dev This is a simplified version of the Sequencer lottery, adapted for Provers.
 */
contract ProverLottery {
    Registry public registry;
    SeedIngestion public seedIngestion;

    // Constants for weight calculation (scaled by 1e18)
    uint256 public constant ALPHA = 1e18; // Stake exponent
    uint256 public constant BETA = 3e17;  // Age exponent (0.3)
    uint256 public constant GAMMA = 4e16; // Age scaling (0.04)
    uint256 public constant A_MAX = 256;  // Max age cap

    event ProverSelected(uint256 indexed epoch, address indexed prover);

    constructor(address _registry, address _seedIngestion) {
        registry = Registry(_registry);
        seedIngestion = SeedIngestion(_seedIngestion);
    }

    /**
     * @notice Checks if a node is the selected Prover for the current epoch.
     * @dev In a real implementation, this would verify a VRF proof.
     *      For this prototype, we use a public VRF check: keccak256(seed, prover)
     */
    function isProver(address node) public view returns (bool) {
        // 1. Must be active in Registry
        if (!registry.isActive(node)) return false;

        // 2. Must have Prover role (bit 2 set)
        // Role 2 (Prover) or 3 (Both) -> (role & 2) != 0
        if ((registry.getRole(node) & 2) == 0) return false;

        // 3. Get current seed
        bytes32 seed = seedIngestion.currentSeed();

        // 3. Calculate "VRF" output (Stub)
        uint256 vrfOutput = uint256(keccak256(abi.encodePacked(seed, node)));

        // 4. Calculate Weight
        // w = s^alpha * (1 + gamma * min(age, A_max))^beta
        // For prototype: Simplified to just Stake * Randomness
        // Real implementation requires fixed-point math library for exponents
        
        uint256 stake = registry.getStake(node);
        
        // Simple probabilistic check:
        // Threshold = Stake * Multiplier
        // Win if (vrf % GlobalDifficulty) < Threshold
        // For demo: 10% chance per 10 tokens
        uint256 chance = (stake / 10 ether) * 10; // 10% per 10 tokens
        if (chance > 100) chance = 100;

        uint256 roll = vrfOutput % 100;
        return roll < chance;
    }
}
