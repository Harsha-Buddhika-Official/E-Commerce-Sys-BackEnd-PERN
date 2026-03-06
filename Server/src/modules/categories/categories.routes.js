import express from 'express';
import { createCategory } from './categories.controller.js';

const router = express.Router();

router.post('/', createCategory);

export default router;