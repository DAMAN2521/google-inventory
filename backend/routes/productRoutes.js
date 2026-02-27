const express = require('express');
const router = express.Router();
const {
    createProduct,
    updateProduct,
    deleteProduct,
    getProducts,
    searchProducts
} = require('../controllers/productController');
const { authMiddleware } = require('../middleware/auth');

// Protected Routes
router.use(authMiddleware);

// Order matters here! /search must come before /:id parameter matching
router.get('/search', searchProducts);
router.get('/', getProducts);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
