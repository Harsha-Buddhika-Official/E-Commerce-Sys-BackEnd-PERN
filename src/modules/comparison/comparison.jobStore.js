// src/modules/comparison/comparison.jobStore.js
import crypto from "crypto";

const jobs = new Map();
const JOB_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

export function createJob() {
  const jobId = crypto.randomUUID();
  jobs.set(jobId, { status: "pending", result: null, error: null, createdAt: Date.now() });
  return jobId;
}

export function updateJob(jobId, updates) {
  const job = jobs.get(jobId);
  if (job) jobs.set(jobId, { ...job, ...updates });
}

export function getJob(jobId) {
  return jobs.get(jobId) || null;
}

setInterval(() => {
  const now = Date.now();
  for (const [id, job] of jobs.entries()) {
    if (now - job.createdAt > JOB_EXPIRY_MS) jobs.delete(id);
  }
}, 60 * 1000);