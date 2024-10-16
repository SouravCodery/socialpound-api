//todo: Replace this JobBatch by using a queue which supports batch processing
//This JobBatch is a temporary solution for batch processing, this is not a full proof solution
//Jobs may get loss if the server crashes between the batch processing
export class JobBatch<T> {
  private jobs: T[];
  private batchSize: number;
  private batchInterval: number;

  private isProcessing: boolean;
  private lastProcessed: number;

  constructor({
    batchSize = 1000,
    batchInterval = 1000,
  }: {
    batchSize?: number;
    batchInterval?: number;
  }) {
    this.jobs = [];
    this.batchSize = batchSize;
    this.batchInterval = batchInterval;

    this.isProcessing = false;
    this.lastProcessed = Date.now();
  }

  addJob({ job }: { job: T }) {
    this.jobs.push(job);
  }

  private shouldProcess() {
    if (this.isProcessing) {
      return false;
    }
    if (this.jobs.length === 0) {
      return false;
    }
    if (this.jobs.length - this.batchSize >= 0) {
      return true;
    }
    if (Date.now() - this.lastProcessed > this.batchInterval) {
      return true;
    }

    return false;
  }

  getJobs() {
    if (this.shouldProcess() === false) {
      return [];
    }

    const maxNumberOfJobsToBeProcessed = Math.min(
      this.jobs.length,
      this.batchSize
    );

    this.processingStart();
    const jobs = this.jobs.splice(0, maxNumberOfJobsToBeProcessed);
    return jobs;
  }

  private processingStart() {
    this.isProcessing = true;
  }

  processingEnd() {
    this.isProcessing = false;
  }

  updateLastProcessed() {
    this.lastProcessed = Date.now();
  }
}
