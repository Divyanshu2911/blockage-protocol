import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy Registry
    const Registry = await ethers.getContractFactory("Registry");
    const registry = await Registry.deploy();
    await registry.waitForDeployment();
    const registryAddress = await registry.getAddress();
    console.log("Registry deployed to:", registryAddress);

    // Deploy SeedIngestion
    const SeedIngestion = await ethers.getContractFactory("SeedIngestion");
    const seedIngestion = await SeedIngestion.deploy();
    await seedIngestion.waitForDeployment();
    const seedIngestionAddress = await seedIngestion.getAddress();
    console.log("SeedIngestion deployed to:", seedIngestionAddress);

    // Initialize Seed (optional, for demo)
    // await seedIngestion.updateSeed(1, ethers.randomBytes(32), ethers.randomBytes(32));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
