import { ethers } from 'ethers';

export const CONTRACTS = {
    // Addresses will be loaded from env or passed in
    REGISTRY: import.meta.env.VITE_REGISTRY_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    SEED: import.meta.env.VITE_SEED_INGESTION_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    RPC: typeof window !== 'undefined' ? window.location.origin + "/rpc" : "http://127.0.0.1:8545"
};

export const SEED_ABI = [
    "function currentSeed() view returns (bytes32)",
    "function currentEpoch() view returns (uint256)",
    "event SeedUpdated(uint256 indexed epoch, bytes32 seed)"
];

export const REGISTRY_ABI = [
    "function register(bytes32 _vrfKey, uint8 _role) external payable",
    "function getRole(address node) external view returns (uint8)",
    "function getStake(address node) external view returns (uint256)"
];

export const getProvider = () => new ethers.JsonRpcProvider(CONTRACTS.RPC);
export const getSeedContract = (provider: ethers.Provider) => new ethers.Contract(CONTRACTS.SEED, SEED_ABI, provider);
