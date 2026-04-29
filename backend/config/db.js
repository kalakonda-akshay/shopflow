const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Connection options for stability and deployment
    const options = {
      serverSelectionTimeoutMS: 5000, // 5 seconds limit to connect
      socketTimeoutMS: 45000,         // Close sockets after 45s of inactivity
      family: 4                       // Force IPv4 (Fixes many DNS/ENOTFOUND issues)
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    
    // Deployment tip: In production, you might want to retry instead of exiting
    if (process.env.NODE_ENV === 'production') {
      console.log('Retrying connection in 5 seconds...');
      setTimeout(connectDB, 5000);
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
