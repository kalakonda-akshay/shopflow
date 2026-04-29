const express = require('express');
const { body } = require('express-validator');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProductsAdmin,
} = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price required'),
  body('stock').isInt({ min: 0 }).withMessage('Valid stock required'),
  body('category').notEmpty().withMessage('Category is required'),
];

// Public
router.get('/', getProducts);
router.get('/admin/all', protect, restrictTo('admin'), getAllProductsAdmin);
router.get('/:id', getProduct);

// Admin only
router.post('/', protect, restrictTo('admin'), productValidation, createProduct);
router.put('/:id', protect, restrictTo('admin'), updateProduct);
router.delete('/:id', protect, restrictTo('admin'), deleteProduct);

module.exports = router;
