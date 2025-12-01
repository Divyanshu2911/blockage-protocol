import { config } from './config';
import { ethers } from 'ethers';

// Minimal ABI for SeedIngestion
const SEED_ABI = [
    "function currentSeed() view returns (bytes32)",
    "function currentEpoch() view returns (uint256)",
    "event SeedUpdated(uint256 indexed epoch, bytes32 seed)"
];

import { JobDistributor } from './crowdprove/job_distributor';
import { CommunityProver } from './crowdprove/community_prover';

async function main() {
    console.log(`Starting Blockage Node in ${config.mode.toUpperCase()} mode...`);
    console.log(`Config: Alpha=${config.alpha}, Beta=${config.beta}, Gamma=${config.gamma}`);
    console.log(`Contracts: Registry=${config.registryAddress}, Seed=${config.seedIngestionAddress}`);

    // --- Coordinator Mode (Job Distributor) ---
    if (config.mode === 'coordinator') {
        const jd = new JobDistributor();
        console.log("Job Distributor running...");

        // Simulate receiving a batch every 10s
        let batchId = 1;
        setInterval(() => {
            jd.createBatch(batchId++, 5); // Create batch with 5 chunks
        }, 10000);

        // --- Demo: Spawn internal workers to simulate network ---
        console.log("Spawning 3 internal workers for demo...");
        const w1 = new CommunityProver(jd); w1.start();
        const w2 = new CommunityProver(jd); w2.start();
        const w3 = new CommunityProver(jd); w3.start();

        // Keep process alive
        setInterval(() => {
            const stats = jd.getStats();
            console.log(`[JD Stats] Pending: ${stats.pending}, Assigned: ${stats.assigned}, Completed: ${stats.completed}, Provers: ${stats.activeProvers}`);
        }, 5000);
        return;
    }

    // --- Worker Mode (Community Prover) ---
    if (config.mode === 'worker') {
        // In a real setup, Worker connects to JD via HTTP/WS.
        // Here, for simplicity in a single process demo, we'd need a shared JD instance.
        // BUT, since we run separate processes, we need a way to communicate.
        // For this prototype, we will assume the Worker is instantiated WITH the JD in the same process 
        // OR we implement a simple HTTP server for the JD.

        // To keep it simple for the prototype without adding Express/HTTP server code:
        // We will run a "Demo Mode" where if mode is 'coordinator', it also spawns internal workers.
        console.error("Worker mode requires a running JD server (not implemented in this prototype).");
        console.error("Please run in 'coordinator' mode to see the full flow simulated.");
        return;
    }

    // --- Sequencer Mode (Default) ---
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
