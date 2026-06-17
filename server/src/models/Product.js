import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  brand: {
    type: String,
    required: [true, 'Brand name is required'],
    trim: true,
    index: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Clothing', 'Shoes', 'Accessories'],
      message: '{VALUE} is not a supported category'
    },
    index: true,
  },
  sub_category: {
    type: String, // e.g. 'Shirts', 'Sneakers', 'Jeans'
    trim: true,
    index: true,
  },
  gender: {
    type: String,
    enum: ['Men', 'Women', 'Kids', 'Unisex'],
    default: 'Unisex',
    index: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  stock_quantity: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  image_urls: [{
    type: String,
    required: [true, 'Product must have at least one image url']
  }],
  specifications: {
    size_guide: [{
      type: String, // e.g. ['S', 'M', 'L', 'XL'] or ['US 8', 'US 9']
    }],
    color: [{
      type: String,
    }],
    material: {
      type: String,
      trim: true,
    }
  }
}, {
  timestamps: true
});

// Setup indexes for sorting/filtering search combinations
productSchema.index({ category: 1, price: 1 });
productSchema.index({ brand: 1, price: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
