// src/modules/comparison/comparison.controller.js
import * as comparisonService from './comparison.service.js';
import { createJob, updateJob, getJob } from './comparison.jobStore.js';

export const startComparison = async (req, res, next) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length < 2) {
      return res.status(400).json({ success: false, message: "Please provide at least 2 product IDs." });
    }

    const jobId = createJob();

    comparisonService.compareProducts(productIds)
      .then((result) => updateJob(jobId, { status: "done", result }))
      .catch((err) => updateJob(jobId, { status: "error", error: err.message }));

    res.status(202).json({
      success: true,
      message: "Comparison started",
      data: { jobId },
    });
  } catch (error) {
    next(error);
  }
};

export const getComparisonResult = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = getJob(jobId);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found or expired." });
    }

    if (job.status === "pending") {
      return res.status(200).json({ success: true, data: { status: "pending" } });
    }

    if (job.status === "error") {
      return res.status(200).json({ success: true, data: { status: "error", message: job.error } });
    }

    res.status(200).json({
      success: true,
      message: "Comparison ready",
      data: { status: "done", result: job.result },
    });
  } catch (error) {
    next(error);
  }
};