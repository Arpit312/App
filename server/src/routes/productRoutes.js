import express from 'express';
import { getProducts, getProductById, getSearchSuggestions } from '../controllers/productController.js';

const router = express.Router();

router.get('/suggestions', getSearchSuggestions);
router.get('/', getProducts);
router.get('/:id', getProductById);

export default router;
