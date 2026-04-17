import {createAttribute, getAttributesByCategoryId, getAttributeById, deleteAttribute, updateAttribute} from './attribute.controller.js';
import express from 'express';

const router = express.Router();

router.post('/', createAttribute);
router.get('/category', getAttributesByCategoryId);
router.get('/:id', getAttributeById);
router.delete('/', deleteAttribute);
router.put('/:id', updateAttribute);

export default router;