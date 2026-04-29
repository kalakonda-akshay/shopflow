const Product = require('../models/Product');
const { validationResult } = require('express-validator');

/** GET /api/products  — public, supports ?search=&category=&sort= */
exports.getProducts = async (req, res, next) => {
  try {
    const { search, category, sort = '-createdAt', page = 1, limit = 20 } = req.query;

    const filter = { isActive: true };
    if (category && category !== 'All') filter.category = category;
    if (search) filter.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

/** GET /api/products/:id — public */
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

/** POST /api/products — Admin only */
exports.createProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const product = await Product.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

/** PUT /api/products/:id — Admin only */
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/products/:id — Admin only (soft delete) */
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product removed' });
  } catch (err) {
    next(err);
  }
};

/** GET /api/products/admin/all — Admin: includes inactive */
exports.getAllProductsAdmin = async (req, res, next) => {
  try {
    const products = await Product.find().sort('-createdAt').populate('createdBy', 'name');
    res.json(products);
  } catch (err) {
    next(err);
  }
};
