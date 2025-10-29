// MongoDB initialization script
db = db.getSiblingDB('intelligent-ecommerce');

// Create application user
db.createUser({
  user: 'ecommerce_user',
  pwd: 'ecommerce_password',
  roles: [
    {
      role: 'readWrite',
      db: 'intelligent-ecommerce'
    }
  ]
});

// Create collections with indexes
db.createCollection('products');
db.createCollection('users');
db.createCollection('orders');

// Create indexes for better performance
db.products.createIndex({ name: 'text', description: 'text', tags: 'text' });
db.products.createIndex({ category: 1, price: 1 });
db.products.createIndex({ 'rating.average': -1 });
db.products.createIndex({ isActive: 1 });

db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

db.orders.createIndex({ orderNumber: 1 }, { unique: true });
db.orders.createIndex({ user: 1 });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ createdAt: -1 });

print('Database initialized successfully!');
