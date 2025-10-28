const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
require('dotenv').config();

const sampleProducts = [
  {
    name: "iPhone 15 Pro",
    description: "Latest iPhone with advanced camera system and A17 Pro chip",
    price: 999,
    originalPrice: 1099,
    category: "electronics",
    brand: "Apple",
    images: ["iphone15pro.jpg"],
    stock: 50,
    tags: ["smartphone", "apple", "premium", "camera"],
    rating: { average: 4.8, count: 120 }
  },
  {
    name: "Samsung Galaxy S24",
    description: "Powerful Android smartphone with AI features",
    price: 899,
    originalPrice: 999,
    category: "electronics",
    brand: "Samsung",
    images: ["galaxys24.jpg"],
    stock: 75,
    tags: ["smartphone", "android", "ai", "samsung"],
    rating: { average: 4.6, count: 95 }
  },
  {
    name: "Nike Air Max 270",
    description: "Comfortable running shoes with Max Air cushioning",
    price: 150,
    category: "sports",
    brand: "Nike",
    images: ["nikeairmax270.jpg"],
    stock: 100,
    tags: ["shoes", "running", "nike", "comfort"],
    rating: { average: 4.4, count: 200 }
  },
  {
    name: "MacBook Pro 16-inch",
    description: "Professional laptop with M3 Pro chip",
    price: 2499,
    originalPrice: 2699,
    category: "electronics",
    brand: "Apple",
    images: ["macbookpro16.jpg"],
    stock: 25,
    tags: ["laptop", "apple", "professional", "m3"],
    rating: { average: 4.9, count: 85 }
  },
  {
    name: "Adidas Ultraboost 22",
    description: "Premium running shoes with Boost technology",
    price: 180,
    category: "sports",
    brand: "Adidas",
    images: ["ultraboost22.jpg"],
    stock: 80,
    tags: ["shoes", "running", "boost", "premium"],
    rating: { average: 4.5, count: 150 }
  },
  {
    name: "Sony WH-1000XM5",
    description: "Industry-leading noise canceling headphones",
    price: 399,
    originalPrice: 449,
    category: "electronics",
    brand: "Sony",
    images: ["sonywh1000xm5.jpg"],
    stock: 60,
    tags: ["headphones", "noise-canceling", "wireless", "sony"],
    rating: { average: 4.7, count: 300 }
  },
  {
    name: "The Great Gatsby",
    description: "Classic American novel by F. Scott Fitzgerald",
    price: 12,
    category: "books",
    brand: "Penguin Classics",
    images: ["greatgatsby.jpg"],
    stock: 200,
    tags: ["book", "classic", "literature", "fiction"],
    rating: { average: 4.3, count: 500 }
  },
  {
    name: "Dyson V15 Detect",
    description: "Cordless vacuum with laser dust detection",
    price: 649,
    originalPrice: 699,
    category: "home",
    brand: "Dyson",
    images: ["dysonv15.jpg"],
    stock: 30,
    tags: ["vacuum", "cordless", "laser", "dyson"],
    rating: { average: 4.6, count: 180 }
  }
];

const sampleUsers = [
  {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    role: "customer",
    preferences: {
      categories: ["electronics", "sports"],
      priceRange: { min: 50, max: 1000 }
    }
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "password123",
    role: "admin",
    preferences: {
      categories: ["books", "home"],
      priceRange: { min: 10, max: 500 }
    }
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/intelligent-ecommerce');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert sample products
    const products = await Product.insertMany(sampleProducts);
    console.log(`📦 Inserted ${products.length} products`);

    // Insert sample users
    const users = await User.insertMany(sampleUsers);
    console.log(`👥 Inserted ${users.length} users`);

    console.log('🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
