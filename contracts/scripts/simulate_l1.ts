import { ethers } from "hardhat";

async function main() {
    const seedIngestionAddress = process.env.SEED_INGESTION_ADDRESS;
    if (!seedIngestionAddress) {
        throw new Error("SEED_INGESTION_ADDRESS not set");
    }

    const SeedIngestion = await ethers.getContractFactory("SeedIngestion");
    const seedIngestion = SeedIngestion.attach(seedIngestionAddress);

    console.log(`Attached to SeedIngestion at ${seedIngestionAddress}`);
    console.log("Simulating L1 updates every 5 seconds...");

    let l1Epoch = 1;

    while (true) {
        const beaconRand = ethers.randomBytes(32);
        const blockHash = ethers.randomBytes(32);

        try {
            const tx = await seedIngestion.updateSeed(l1Epoch, beaconRand, blockHash);
            await tx.wait();
            console.log(`Updated seed for L1 Epoch ${l1Epoch}`);
            l1Epoch++;
        } catch (e) {
            console.error("Error updating seed:", e);
        }

        await new Promise((resolve) => setTimeout(resolve, 5000));
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
