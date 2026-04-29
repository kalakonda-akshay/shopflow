const Order = require('../models/Order');
const Product = require('../models/Product');

/** POST /api/orders — User: place order */
exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ message: 'No order items' });

    // Validate stock & build order items
    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive)
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      if (product.stock < item.quantity)
        return res.status(400).json({ message: `Insufficient stock for: ${product.name}` });

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: item.quantity,
      });
      totalAmount += product.price * item.quantity;

      // Decrement stock
      product.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      totalAmount,
    });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

/** GET /api/orders/mine — User: their orders */
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort('-createdAt')
      .populate('items.product', 'name image');
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

/** GET /api/orders/:id — User: single order */
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Users can only view their own orders
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorised' });

    res.json(order);
  } catch (err) {
    next(err);
  }
};

/** GET /api/orders — Admin: all orders */
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .sort('-createdAt')
      .populate('user', 'name email');
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

/** PUT /api/orders/:id — Admin: update status */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    if (status === 'Delivered') {
      order.isPaid = true;
      order.paidAt = new Date();
      order.deliveredAt = new Date();
    }
    await order.save();
    res.json(order);
  } catch (err) {
    next(err);
  }
};

/** GET /api/orders/admin/stats — Admin: revenue stats */
exports.getStats = async (req, res, next) => {
  try {
    const [totalOrders, totalRevenue, statusBreakdown] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      statusBreakdown,
    });
  } catch (err) {
    next(err);
  }
};
