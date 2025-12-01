import dotenv from 'dotenv';

dotenv.config();

export const config = {
    alpha: parseFloat(process.env.ALPHA || '1.0'),
    beta: parseFloat(process.env.BETA || '0.3'),
    gamma: parseFloat(process.env.GAMMA || '0.04'),
    aMax: parseInt(process.env.A_MAX || '256'),
    epochLength: parseInt(process.env.EPOCH_LENGTH || '100'),
    rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
    privateKey: process.env.PRIVATE_KEY || '',
    registryAddress: process.env.REGISTRY_ADDRESS || '',
    seedIngestionAddress: process.env.SEED_INGESTION_ADDRESS || '',
    proofEscrowAddress: process.env.PROOF_ESCROW_ADDRESS || '',
    chainId: parseInt(process.env.CHAIN_ID || '31337'),
    logLevel: process.env.LOG_LEVEL || 'info',
    // CrowdProve Config
    mode: process.env.MODE || 'sequencer', // sequencer, coordinator, worker
    jdUrl: process.env.JD_URL || 'http://localhost:3000', // For workers to connect to JD
};
