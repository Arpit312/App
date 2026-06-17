import Order from '../models/Order.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

/**
 * Create a new order with price calculations and stock checking/deductions.
 * POST /api/orders
 */
export const createOrder = async (req, res, next) => {
  const { user_id, items, shipping_address } = req.body;

  // 1. Basic Field Validations
  if (!user_id || !items || !items.length || !shipping_address) {
    return res.status(400).json({
      success: false,
      message: 'Missing required order fields: user_id, items, and shipping_address are required'
    });
  }

  // Helper function to execute order placement
  const executeOrderPlacement = async (sessionParam) => {
    let calculatedTotalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const { product_id, quantity, size } = item;

      if (!product_id || !quantity || !size) {
        const err = new Error('Each order item must specify product_id, quantity, and size');
        err.statusCode = 400;
        throw err;
      }

      if (quantity <= 0) {
        const err = new Error('Quantity must be greater than 0');
        err.statusCode = 400;
        throw err;
      }

      const query = Product.findById(product_id);
      if (sessionParam) {
        query.session(sessionParam);
      }
      const product = await query;

      if (!product) {
        const err = new Error(`Product with ID ${product_id} not found`);
        err.statusCode = 404;
        throw err;
      }

      // Check stock availability
      if (product.stock_quantity < quantity) {
        const err = new Error(`Insufficient stock for product: ${product.name}. Available: ${product.stock_quantity}, Requested: ${quantity}`);
        err.statusCode = 400;
        throw err;
      }

      // Validate size selection
      if (product.specifications?.size_guide?.length && !product.specifications.size_guide.includes(size)) {
        const err = new Error(`Selected size "${size}" is invalid for product: ${product.name}. Available: ${product.specifications.size_guide.join(', ')}`);
        err.statusCode = 400;
        throw err;
      }

      // Deduct stock quantity
      product.stock_quantity -= quantity;
      
      if (sessionParam) {
        await product.save({ session: sessionParam });
      } else {
        await product.save();
      }

      // Calculate total item price
      calculatedTotalPrice += product.price * quantity;

      // Add to verified order items list
      orderItems.push({
        product_id,
        quantity,
        size
      });
    }

    // Create order
    const newOrder = new Order({
      user_id,
      items: orderItems,
      total_price: Number(calculatedTotalPrice.toFixed(2)),
      status: 'Pending',
      shipping_address
    });

    if (sessionParam) {
      await newOrder.save({ session: sessionParam });
    } else {
      await newOrder.save();
    }

    return newOrder;
  };

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const order = await executeOrderPlacement(session);

    // Commit Transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order
    });

  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }

    // Check if error is due to MongoDB transactions not being supported on standalone setups
    const isTxnError = error.message && (
      error.message.includes('transaction') ||
      error.message.includes('Transaction') ||
      error.message.includes('replica set')
    );

    if (isTxnError) {
      // Fallback: Run without transactions sequentially
      try {
        const order = await executeOrderPlacement(null);
        return res.status(201).json({
          success: true,
          message: 'Order placed successfully (standalone fallback mode)',
          order
        });
      } catch (fallbackError) {
        return res.status(fallbackError.statusCode || 400).json({
          success: false,
          message: fallbackError.message || 'Error processing order placement'
        });
      }
    }
    
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || 'Error processing order placement'
    });
  }
};

/**
 * Fetch all orders for a specific user.
 * GET /api/orders/user/:userId
 */
export const getUserOrders = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ user_id: userId })
      .populate('items.product_id', 'name price image_urls brand')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    next(error);
  }
};
