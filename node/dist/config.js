"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
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
};
