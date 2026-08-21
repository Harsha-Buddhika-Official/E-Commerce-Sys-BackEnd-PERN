// src/modules/comparison/comparison.route.js
import express from 'express';
import { startComparison, getComparisonResult } from './comparison.controller.js';

const router = express.Router();

router.post('/', startComparison);
router.get('/:jobId', getComparisonResult);

export default router;