import Product from '../models/Product.js';

/**
 * Fetch products with optional filtering, sorting, and search querying.
 * GET /api/products
 */
export const getProducts = async (req, res, next) => {
  try {
    const { category, brand, sort, search, page = 1, limit = 10 } = req.query;
    const query = {};

    // 1. Filtering by Category (Exact Match)
    if (category) {
      query.category = category;
    }

    // 2. Filtering by Brand (Exact Match)
    if (brand) {
      query.brand = brand;
    }

    // 3. Optional Search Query (Regex match on name or description)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // 4. Sorting Parameters
    let sortOptions = { createdAt: -1 }; // Default: Newest first
    if (sort) {
      if (sort === 'price_asc') {
        sortOptions = { price: 1 };
      } else if (sort === 'price_desc') {
        sortOptions = { price: -1 };
      } else if (sort === 'name_asc') {
        sortOptions = { name: 1 };
      } else if (sort === 'name_desc') {
        sortOptions = { name: -1 };
      }
    }

    // 5. Pagination Calculation
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Product.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: products.length,
      total: totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      products
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch details of a single product.
 * GET /api/products/:id
 */
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${req.params.id} not found`
      });
    }

    return res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    // If invalid Mongoose ObjectId, return 404 instead of throwing 500 error
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }
    next(error);
  }
};
