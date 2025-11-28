import { config } from './config';
import { ethers } from 'ethers';

// Minimal ABI for SeedIngestion
const SEED_ABI = [
    "function currentSeed() view returns (bytes32)",
    "function currentEpoch() view returns (uint256)",
    "event SeedUpdated(uint256 indexed epoch, bytes32 seed)"
];

async function main() {
    console.log("Starting Blockage Node...");
    console.log(`Config: Alpha=${config.alpha}, Beta=${config.beta}, Gamma=${config.gamma}`);
    console.log(`Contracts: Registry=${config.registryAddress}, Seed=${config.seedIngestionAddress}`);

    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    const wallet = new ethers.Wallet(config.privateKey, provider);

    const seedContract = new ethers.Contract(config.seedIngestionAddress, SEED_ABI, provider);

    console.log(`Connected to ${config.rpcUrl} with address ${wallet.address}`);

    let lastEpoch = -1;

    while (true) {
        try {
            const currentEpoch = Number(await seedContract.currentEpoch());

            if (currentEpoch > lastEpoch) {
                const seed = await seedContract.currentSeed();
                console.log(`\n--- New Epoch: ${currentEpoch} ---`);
                console.log(`Seed: ${seed}`);

                // Simulate VRF (Stub)
                // In real protocol: Proof = VRF(privKey, seed)
                const vrfInput = ethers.solidityPacked(["bytes32", "address"], [seed, wallet.address]);
                const vrfOutput = ethers.keccak256(vrfInput);
                console.log(`VRF Output (Stub): ${vrfOutput}`);

                // Check if winner (Stub: simple modulo for demo)
                // Real protocol would use the weight formula
                const isWinner = BigInt(vrfOutput) % 10n === 0n; // 10% chance
                if (isWinner) {
                    console.log("🎉 WINNER! Proposing block...");
                } else {
                    console.log("Not selected this epoch.");
                }

                lastEpoch = currentEpoch;
            } else {
                process.stdout.write("."); // Heartbeat
            }
        } catch (e) {
            console.error("Error polling:", e);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

main().catch(console.error);
