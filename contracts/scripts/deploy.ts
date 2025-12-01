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

    // Deploy ProverLottery
    const ProverLottery = await ethers.getContractFactory("ProverLottery");
    const proverLottery = await ProverLottery.deploy(registryAddress, seedIngestionAddress);
    await proverLottery.waitForDeployment();
    console.log("ProverLottery deployed to:", await proverLottery.getAddress());

    // --- Devnet Setup: Register Nodes ---
    // Node 1 (Sequencer) - Account 0
    // Node 2 (Sequencer) - Account 1
    // Coordinator (Prover) - Account 2

    // We need the signers for these accounts.
    // Hardhat default accounts:
    // 0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (Deployer) -> Let's use this as Node 1
    // 1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 -> Node 2
    // 2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC -> Coordinator

    const signers = await ethers.getSigners();
    const node1 = signers[0]; // Already deployer
    const node2 = signers[1];
    const coordinator = signers[2];

    console.log("\nRegistering Devnet Nodes...");

    // Register Node 1 as Sequencer (Role 1)
    // Stake: 10 ETH
    const tx1 = await registry.connect(node1).register(ethers.randomBytes(32), 1, { value: ethers.parseEther("10") });
    await tx1.wait();
    await registry.connect(node1).activate();
    console.log("Node 1 registered as Sequencer.");

    // Register Node 2 as Sequencer (Role 1)
    const tx2 = await registry.connect(node2).register(ethers.randomBytes(32), 1, { value: ethers.parseEther("10") });
    await tx2.wait();
    await registry.connect(node2).activate();
    console.log("Node 2 registered as Sequencer.");

    // Register Coordinator as Prover (Role 2)
    const tx3 = await registry.connect(coordinator).register(ethers.randomBytes(32), 2, { value: ethers.parseEther("20") }); // Higher stake for Prover
    await tx3.wait();
    await registry.connect(coordinator).activate();
    console.log("Coordinator registered as Prover.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
