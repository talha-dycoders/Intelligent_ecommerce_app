const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');

// AI Recommendation Engine
router.post('/recommendations', async (req, res) => {
  try {
    const { userId, limit = 10 } = req.body;
    
    let user = null;
    if (userId) {
      user = await User.findById(userId).populate('aiProfile.purchaseHistory.product');
    }

    // Simple collaborative filtering algorithm
    let recommendations = [];
    
    if (user && user.aiProfile.purchaseHistory.length > 0) {
      // Get user's purchase history categories
      const userCategories = user.aiProfile.purchaseHistory.map(p => p.product.category);
      const categoryCounts = {};
      userCategories.forEach(cat => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });

      // Find similar users and their preferences
      const similarUsers = await User.find({
        'aiProfile.purchaseHistory.product': { $exists: true },
        _id: { $ne: userId }
      }).populate('aiProfile.purchaseHistory.product');

      // Get products from similar categories
      const recommendedCategories = Object.keys(categoryCounts);
      recommendations = await Product.find({
        category: { $in: recommendedCategories },
        isActive: true
      }).limit(limit);
    } else {
      // For new users, recommend popular products
      recommendations = await Product.find({ isActive: true })
        .sort({ 'rating.average': -1, 'rating.count': -1 })
        .limit(limit);
    }

    res.json({
      recommendations,
      algorithm: 'collaborative_filtering',
      confidence: user ? 0.8 : 0.6
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Price Prediction
router.post('/price-prediction', async (req, res) => {
  try {
    const { productId, marketData } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Simple price prediction algorithm
    const basePrice = product.price;
    const category = product.category;
    const rating = product.rating.average;
    const demandScore = product.aiFeatures?.demandScore || 0.5;
    
    // Price prediction factors
    let predictedPrice = basePrice;
    
    // Category-based adjustments
    const categoryMultipliers = {
      'electronics': 1.1,
      'clothing': 0.95,
      'books': 0.9,
      'home': 1.05,
      'sports': 1.0,
      'beauty': 1.08,
      'toys': 0.92,
      'other': 1.0
    };
    
    predictedPrice *= categoryMultipliers[category] || 1.0;
    
    // Rating-based adjustment
    if (rating > 4) predictedPrice *= 1.05;
    else if (rating < 3) predictedPrice *= 0.95;
    
    // Demand-based adjustment
    predictedPrice *= (1 + (demandScore - 0.5) * 0.2);
    
    // Market data adjustment (if provided)
    if (marketData) {
      const { competitorPrice, marketTrend } = marketData;
      if (competitorPrice) {
        predictedPrice = (predictedPrice + competitorPrice) / 2;
      }
      if (marketTrend === 'increasing') predictedPrice *= 1.02;
      else if (marketTrend === 'decreasing') predictedPrice *= 0.98;
    }

    res.json({
      currentPrice: basePrice,
      predictedPrice: Math.round(predictedPrice * 100) / 100,
      confidence: 0.75,
      factors: {
        category: categoryMultipliers[category],
        rating: rating > 4 ? 1.05 : rating < 3 ? 0.95 : 1.0,
        demand: 1 + (demandScore - 0.5) * 0.2
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Sentiment Analysis
router.post('/sentiment-analysis', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    // Simple sentiment analysis (in real app, use proper NLP library)
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect', 'wonderful', 'fantastic', 'awesome', 'brilliant'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disappointed', 'poor', 'cheap', 'broken'];
    
    const words = text.toLowerCase().split(/\s+/);
    let positiveScore = 0;
    let negativeScore = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveScore++;
      if (negativeWords.includes(word)) negativeScore++;
    });
    
    let sentiment = 'neutral';
    let confidence = 0.5;
    
    if (positiveScore > negativeScore) {
      sentiment = 'positive';
      confidence = Math.min(0.9, 0.5 + (positiveScore - negativeScore) * 0.1);
    } else if (negativeScore > positiveScore) {
      sentiment = 'negative';
      confidence = Math.min(0.9, 0.5 + (negativeScore - positiveScore) * 0.1);
    }

    res.json({
      sentiment,
      confidence,
      scores: {
        positive: positiveScore,
        negative: negativeScore
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Dynamic Pricing
router.post('/dynamic-pricing', async (req, res) => {
  try {
    const { productId, marketConditions } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const basePrice = product.price;
    let dynamicPrice = basePrice;
    
    // Time-based pricing (seasonal)
    const now = new Date();
    const month = now.getMonth();
    const hour = now.getHours();
    
    // Seasonal adjustments
    const seasonalMultipliers = {
      0: 1.1,  // January - post-holiday sales
      1: 0.95, // February - low season
      2: 1.0,  // March - normal
      3: 1.0,  // April - normal
      4: 1.05, // May - spring shopping
      5: 1.0,  // June - normal
      6: 1.0,  // July - normal
      7: 1.0,  // August - back to school
      8: 1.0,  // September - normal
      9: 1.0,  // October - normal
      10: 1.1, // November - pre-holiday
      11: 1.15 // December - holiday season
    };
    
    dynamicPrice *= seasonalMultipliers[month] || 1.0;
    
    // Time-of-day pricing
    if (hour >= 9 && hour <= 17) {
      dynamicPrice *= 1.02; // Business hours premium
    } else if (hour >= 20 || hour <= 6) {
      dynamicPrice *= 0.98; // Off-hours discount
    }
    
    // Stock-based pricing
    if (product.stock < 5) {
      dynamicPrice *= 1.05; // Low stock premium
    } else if (product.stock > 50) {
      dynamicPrice *= 0.98; // High stock discount
    }
    
    // Market conditions
    if (marketConditions) {
      const { demand, competition, trends } = marketConditions;
      
      if (demand === 'high') dynamicPrice *= 1.03;
      else if (demand === 'low') dynamicPrice *= 0.97;
      
      if (competition === 'high') dynamicPrice *= 0.98;
      else if (competition === 'low') dynamicPrice *= 1.02;
    }

    res.json({
      originalPrice: basePrice,
      dynamicPrice: Math.round(dynamicPrice * 100) / 100,
      adjustments: {
        seasonal: seasonalMultipliers[month],
        timeOfDay: hour >= 9 && hour <= 17 ? 1.02 : hour >= 20 || hour <= 6 ? 0.98 : 1.0,
        stock: product.stock < 5 ? 1.05 : product.stock > 50 ? 0.98 : 1.0
      },
      confidence: 0.8
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search with AI
router.post('/search', async (req, res) => {
  try {
    const { query, userId, limit = 10 } = req.body;
    
    // Basic text search
    let products = await Product.find({
      $text: { $search: query },
      isActive: true
    }).limit(limit);
    
    // If no results, try fuzzy search
    if (products.length === 0) {
      products = await Product.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ],
        isActive: true
      }).limit(limit);
    }
    
    // Personalize results if user is provided
    if (userId && products.length > 0) {
      const user = await User.findById(userId);
      if (user && user.aiProfile.preferences) {
        // Boost products in user's preferred categories
        products = products.sort((a, b) => {
          const aScore = user.aiProfile.preferences.categories.includes(a.category) ? 1 : 0;
          const bScore = user.aiProfile.preferences.categories.includes(b.category) ? 1 : 0;
          return bScore - aScore;
        });
      }
    }
    
    res.json({
      products,
      query,
      total: products.length,
      personalized: !!userId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
