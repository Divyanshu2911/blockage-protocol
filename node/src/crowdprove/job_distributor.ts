import { ethers } from 'ethers';

export interface Job {
    id: string;
    batchId: number;
    chunkId: number;
    witnessData: string; // Mock data
    status: 'pending' | 'assigned' | 'completed';
    assignedTo?: string; // Prover ID (address)
    lastAssignedAt?: number;
}

export class JobDistributor {
    private jobs: Job[] = [];
    private proverQueue: string[] = []; // LRP Queue: [prover1, prover2, ...]
    private proverLastSeen: Map<string, number> = new Map();

    constructor() {
        console.log("JobDistributor initialized.");
    }

    // --- Job Management ---

    public createBatch(batchId: number, size: number) {
        console.log(`[JD] Creating batch ${batchId} with ${size} chunks.`);
        for (let i = 0; i < size; i++) {
            this.jobs.push({
                id: `${batchId}-${i}`,
                batchId,
                chunkId: i,
                witnessData: `0x${Math.random().toString(16).slice(2)}`,
                status: 'pending'
            });
        }
    }

    public getJob(proverId: string): Job | null {
        this.registerProver(proverId);

        // 1. Check for pending jobs
        const pendingJob = this.jobs.find(j => j.status === 'pending');
        if (pendingJob) {
            this.assignJob(pendingJob, proverId);
            return pendingJob;
        }

        // 2. Check for timed-out jobs (Simple timeout: 30s)
        const now = Date.now();
        const timedOutJob = this.jobs.find(j =>
            j.status === 'assigned' &&
            j.lastAssignedAt &&
            (now - j.lastAssignedAt > 30000)
        );

        if (timedOutJob) {
            console.log(`[JD] Job ${timedOutJob.id} timed out. Reassigning to ${proverId}`);
            this.assignJob(timedOutJob, proverId);
            return timedOutJob;
        }

        return null;
    }

    public submitResult(proverId: string, jobId: string, proof: string): boolean {
        const job = this.jobs.find(j => j.id === jobId);
        if (!job) return false;

        if (job.assignedTo !== proverId) {
            console.warn(`[JD] Rejected submission for ${jobId} from ${proverId} (assigned to ${job.assignedTo})`);
            return false;
        }

        // Verify Proof (Stub: check if proof is not empty)
        if (!proof || proof.length < 10) {
            console.warn(`[JD] Invalid proof for ${jobId}`);
            return false;
        }

        console.log(`[JD] Proof verified for ${jobId} from ${proverId}`);
        job.status = 'completed';
        return true;
    }

    // --- LRP / Queue Logic ---

    private registerProver(proverId: string) {
        this.proverLastSeen.set(proverId, Date.now());
        if (!this.proverQueue.includes(proverId)) {
            this.proverQueue.push(proverId);
            console.log(`[JD] New prover registered: ${proverId}`);
        }
        // In a real LRP system, we might rotate the queue here or on assignment.
        // For now, we just track them.
    }

    private assignJob(job: Job, proverId: string) {
        job.status = 'assigned';
        job.assignedTo = proverId;
        job.lastAssignedAt = Date.now();
        console.log(`[JD] Assigned job ${job.id} to ${proverId}`);
    }

    public getStats() {
        const pending = this.jobs.filter(j => j.status === 'pending').length;
        const assigned = this.jobs.filter(j => j.status === 'assigned').length;
        const completed = this.jobs.filter(j => j.status === 'completed').length;
        return { pending, assigned, completed, activeProvers: this.proverQueue.length };
    }
}
