/**
 * seed.js — Run with: npm run seed
 * Creates demo admin, user, and sample products.
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User    = require('./models/User');
const Product = require('./models/Product');
const Order   = require('./models/Order');

const USERS = [
  { name: 'Admin User',  email: 'admin@shopflow.com', password: 'admin123', role: 'admin' },
  { name: 'Jane Doe',    email: 'user@shopflow.com',  password: 'user1234', role: 'user'  },
];

const PRODUCTS = [
  { name: 'Wireless Noise-Cancelling Headphones', description: 'Premium sound with 30hr battery and active noise cancellation.', price: 129.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', category: 'Electronics', stock: 50 },
  { name: 'Mechanical Keyboard', description: 'Tactile Cherry MX switches, RGB backlight, compact TKL layout.', price: 89.99, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400', category: 'Electronics', stock: 30 },
  { name: 'Running Shoes - Pro X', description: 'Lightweight mesh upper, responsive cushioning, anti-slip sole.', price: 74.99, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', category: 'Sports', stock: 80 },
  { name: 'Minimalist Watch', description: 'Stainless steel case, sapphire glass, 5ATM water resistance.', price: 199.00, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', category: 'Other', stock: 20 },
  { name: 'Linen Button Shirt', description: '100% linen, relaxed fit, available in 6 colours.', price: 39.99, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', category: 'Clothing', stock: 100 },
  { name: 'JavaScript: The Good Parts', description: 'Douglas Crockford\'s classic guide to the best of JS.', price: 19.99, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', category: 'Books', stock: 60 },
  { name: 'Yoga Mat (6mm)', description: 'Non-slip natural rubber, alignment lines, carry strap included.', price: 44.99, image: 'https://images.unsplash.com/photo-1601925228847-8b6d33b57fae?w=400', category: 'Sports', stock: 45 },
  { name: 'Smart Home Speaker', description: 'Voice-controlled, 360° sound, compatible with all major assistants.', price: 59.99, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', category: 'Electronics', stock: 35 },
  { name: 'Vitamin C Serum', description: '20% vitamin C, hyaluronic acid, brightening formula.', price: 24.99, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400', category: 'Beauty', stock: 90 },
  { name: 'Ceramic Coffee Mug Set', description: 'Set of 4 handmade ceramic mugs, dishwasher-safe, 350ml.', price: 34.99, image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400', category: 'Home', stock: 55 },
];

async function seed() {
  try {
    await mongoose.connect("mongodb+srv://akshaykalakonda9_db_user:<db_password>@cluster0.ijmiwlr.mongodb.net/?appName=Cluster0");
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([User.deleteMany(), Product.deleteMany(), Order.deleteMany()]);
    console.log('🗑️  Cleared existing data');

    // Create users
    const users = await User.create(USERS);
    const admin = users.find((u) => u.role === 'admin');
    const regularUser = users.find((u) => u.role === 'user');
    console.log(`👤 Created ${users.length} users`);

    // Create products
    const products = await Product.create(
      PRODUCTS.map((p) => ({ ...p, createdBy: admin._id }))
    );
    console.log(`📦 Created ${products.length} products`);

    // Create a sample order
    await Order.create({
      user: regularUser._id,
      items: [
        { product: products[0]._id, name: products[0].name, image: products[0].image, price: products[0].price, quantity: 1 },
        { product: products[5]._id, name: products[5].name, image: products[5].image, price: products[5].price, quantity: 2 },
      ],
      shippingAddress: { fullName: 'Jane Doe', address: '123 Main St', city: 'New York', zip: '10001' },
      totalAmount: products[0].price + products[5].price * 2,
      status: 'Processing',
    });
    console.log('🧾 Created sample order');

    console.log('\n🎉 Seed complete!\n');
    console.log('  Admin → admin@shopflow.com / admin123');
    console.log('  User  → user@shopflow.com  / user1234\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
