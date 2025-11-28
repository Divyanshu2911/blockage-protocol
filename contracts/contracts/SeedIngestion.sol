// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SeedIngestion {
    bytes32 public currentSeed;
    uint256 public currentEpoch;

    event SeedUpdated(uint256 indexed epoch, bytes32 seed);

    // Only authorized L1 bridge or oracle can call this
    function updateSeed(uint256 _l1Epoch, bytes32 _beaconRand, bytes32 _blockHash) external {
        // Simple mixing for demonstration
        currentSeed = keccak256(abi.encodePacked(
            block.chainid,
            _l1Epoch,
            _beaconRand,
            _blockHash,
            currentEpoch
        ));
        
        currentEpoch++;
        emit SeedUpdated(currentEpoch, currentSeed);
    }
}
