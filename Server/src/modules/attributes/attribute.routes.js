import { createAttribute, getAttributesByCategoryId, getAttributeById, deleteAttribute, updateAttribute } from './attribute.controller.js';
import express from 'express';
import { authorize } from '../../middlewares/authorize.js';

const router = express.Router();

router.post('/', authorize('super_admin', 'admin', 'manager'), createAttribute);
router.get('/category', getAttributesByCategoryId);
router.get('/:id', getAttributeById);
router.delete('/', authorize('super_admin', 'admin', 'manager'), deleteAttribute);
router.put('/:id', authorize('super_admin', 'admin', 'manager'), updateAttribute);

export default router;