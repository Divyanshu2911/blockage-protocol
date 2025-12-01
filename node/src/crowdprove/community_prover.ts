import { JobDistributor, Job } from './job_distributor';
import { ethers } from 'ethers';

export class CommunityProver {
    public id: string;
    private jd: JobDistributor;
    private working: boolean = false;

    constructor(jd: JobDistributor, privateKey?: string) {
        if (privateKey) {
            this.id = new ethers.Wallet(privateKey).address;
        } else {
            this.id = ethers.Wallet.createRandom().address;
        }
        this.jd = jd;
        console.log(`[Worker] Started ${this.id}`);
    }

    public async start() {
        setInterval(async () => {
            if (this.working) return;

            const job = this.jd.getJob(this.id);
            if (job) {
                this.working = true;
                await this.processJob(job);
                this.working = false;
            }
        }, 2000); // Poll every 2s
    }

    private async processJob(job: Job) {
        console.log(`[Worker ${this.id.slice(0, 6)}] Processing job ${job.id}...`);

        // Simulate Work (Computation)
        // In real ZK, this is where we run the prover
        const processingTime = Math.floor(Math.random() * 3000) + 1000; // 1-4s
        await new Promise(resolve => setTimeout(resolve, processingTime));

        // Generate "Proof"
        const proof = ethers.keccak256(ethers.toUtf8Bytes(job.witnessData + this.id));

        console.log(`[Worker ${this.id.slice(0, 6)}] Submitting proof for ${job.id}`);
        this.jd.submitResult(this.id, job.id, proof);
    }
}
