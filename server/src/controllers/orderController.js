import Order from '../models/Order.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

/**
 * Create a new order with price calculations and stock checking/deductions.
 * POST /api/orders
 */
export const createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { user_id, items, shipping_address } = req.body;

    // 1. Basic Field Validations
    if (!user_id || !items || !items.length || !shipping_address) {
      return res.status(400).json({
        success: false,
        message: 'Missing required order fields: user_id, items, and shipping_address are required'
      });
    }

    let calculatedTotalPrice = 0;
    const orderItems = [];

    // 2. Validate products, sizes, stock, and calculate prices
    for (const item of items) {
      const { product_id, quantity, size } = item;

      if (!product_id || !quantity || !size) {
        throw new Error('Each order item must specify product_id, quantity, and size');
      }

      if (quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }

      // Fetch product inside transaction
      const product = await Product.findById(product_id).session(session);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${product_id} not found`
        });
      }

      // Check stock availability
      if (product.stock_quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${product.name}. Available: ${product.stock_quantity}, Requested: ${quantity}`
        });
      }

      // Validate size selection (check if size is in the product's size guide specifications)
      if (product.specifications?.size_guide?.length && !product.specifications.size_guide.includes(size)) {
        return res.status(400).json({
          success: false,
          message: `Selected size "${size}" is invalid for product: ${product.name}. Available: ${product.specifications.size_guide.join(', ')}`
        });
      }

      // Deduct stock quantity atomatically
      product.stock_quantity -= quantity;
      await product.save({ session });

      // Calculate total item price
      calculatedTotalPrice += product.price * quantity;

      // Add to verified order items list
      orderItems.push({
        product_id,
        quantity,
        size
      });
    }

    // 3. Create order
    const newOrder = new Order({
      user_id,
      items: orderItems,
      total_price: Number(calculatedTotalPrice.toFixed(2)),
      status: 'Pending',
      shipping_address
    });

    await newOrder.save({ session });

    // Commit Transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: newOrder
    });

  } catch (error) {
    // Abort Transaction in case of errors
    await session.abortTransaction();
    session.endSession();
    
    return res.status(400).json({
      success: false,
      message: error.message || 'Error processing order placement'
    });
  }
};
