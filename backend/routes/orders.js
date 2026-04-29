const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getStats,
} = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// All order routes require login
router.use(protect);

router.post('/', createOrder);
router.get('/mine', getMyOrders);
router.get('/admin/stats', restrictTo('admin'), getStats);
router.get('/', restrictTo('admin'), getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id', restrictTo('admin'), updateOrderStatus);

module.exports = router;
