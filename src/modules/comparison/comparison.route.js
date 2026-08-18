import express from 'express';
import { responseHandler } from './comparison.controller.js';

const router = express.Router();

router.post('/', responseHandler);

export default router;