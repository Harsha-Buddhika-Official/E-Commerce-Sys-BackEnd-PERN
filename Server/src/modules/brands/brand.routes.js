import express from 'express';
import { createBrand } from './brand.controller.js';

const router = express.Router();

router.post('/', createBrand);

export default router;