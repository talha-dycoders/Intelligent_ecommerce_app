const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// GET /api/orders - Get all orders (with pagination and filtering)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      userId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (userId) filter.user = userId;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .populate('items.product', 'name images')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/:id - Get single order
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images description');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/orders - Create new order
router.post('/', async (req, res) => {
  try {
    const { items, shipping, payment, pricing } = req.body;
    
    // Validate required fields
    if (!items || !shipping || !payment || !pricing) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get product details for items
    const productIds = items.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    
    // Create order items with product details
    const orderItems = items.map(item => {
      const product = products.find(p => p._id.toString() === item.product);
      return {
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        name: product?.name || 'Unknown Product',
        image: product?.images?.[0] || ''
      };
    });

    // Create order
    const order = new Order({
      user: req.body.userId || null, // Optional user ID
      items: orderItems,
      shipping,
      payment,
      pricing,
      status: 'pending'
    });

    await order.save();

    // Populate the order for response
    await order.populate('items.product', 'name images');

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { status, tracking } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update status
    await order.updateStatus(status);

    // Add tracking if provided
    if (tracking && tracking.number && tracking.carrier) {
      await order.addTracking(tracking.number, tracking.carrier);
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/orders/:id/payment - Update payment status
router.put('/:id/payment', async (req, res) => {
  try {
    const { status, transactionId, cardLast4, cardBrand } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.payment.status = status;
    if (transactionId) order.payment.transactionId = transactionId;
    if (cardLast4) order.payment.cardLast4 = cardLast4;
    if (cardBrand) order.payment.cardBrand = cardBrand;

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/orders/user/:userId - Get orders for specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const filter = { user: req.params.userId };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/stats/summary - Get order statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $in: ['delivered', 'shipped'] } } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      ordersByStatus,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/orders/:id - Cancel order (only if pending)
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }

    await order.updateStatus('cancelled');
    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;




