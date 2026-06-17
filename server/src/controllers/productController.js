import Product from '../models/Product.js';
import Fuse from 'fuse.js';

// ═══════════════════════════════════════════════════════════════
// SHARED SEARCH INTELLIGENCE — Used by BOTH getProducts AND suggestions
// ═══════════════════════════════════════════════════════════════

const SYNONYM_MAP = {
  'sneakers': { sub_category: 'Sneakers' },
  'tshirt': { sub_category: 'T-Shirts' },
  't-shirt': { sub_category: 'T-Shirts' },
  'tshirts': { sub_category: 'T-Shirts' },
  't-shirts': { sub_category: 'T-Shirts' },
  'tees': { sub_category: 'T-Shirts' },
  'sports shoes': { sub_category: 'Sports Shoes' },
  'formal shoes': { sub_category: 'Formal Shoes' },
  'shirts': { sub_category: 'Shirts' },
  'jeans': { sub_category: 'Jeans' },
  'jackets': { sub_category: 'Jackets' },
  'shoes': { category: 'Shoes' },
  'clothing': { category: 'Clothing' },
  'accessories': { category: 'Accessories' },
};

const GENDER_KEYWORDS = {
  'men': 'Men', "men's": 'Men', 'male': 'Men',
  'women': 'Women', "women's": 'Women', 'female': 'Women',
  'kids': 'Kids', "kid's": 'Kids', "kids'": 'Kids',
  'boys': 'Kids', 'girls': 'Kids',
  'unisex': 'Unisex',
};

const STOP_WORDS = new Set(['for', 'and', 'in', 'all', 'with', 'the', 'a', 'an', 'of']);

/**
 * Parses a natural language search query into structured filters.
 * e.g. "Shirts for Men" → { sub_category: "Shirts", gender: "Men" }
 * e.g. "Nike" → { brand: "Nike" }  (detected from DB brands)
 * e.g. "Sneakers" → { sub_category: "Sneakers" }
 * Returns: { category, sub_category, gender, brand, freeText }
 */
const parseSearchQuery = (rawQuery, knownBrands = []) => {
  const result = { category: null, sub_category: null, gender: null, brand: null, freeText: '' };
  if (!rawQuery) return result;

  const q = rawQuery.toLowerCase().trim();

  // 1. Extract gender keywords
  for (const [keyword, genderValue] of Object.entries(GENDER_KEYWORDS)) {
    if (q.includes(keyword)) {
      result.gender = genderValue;
      break;
    }
  }

  // 2. Check synonym map (longest match first to prefer "sports shoes" over "shoes")
  const sortedSynonyms = Object.keys(SYNONYM_MAP).sort((a, b) => b.length - a.length);
  for (const synonym of sortedSynonyms) {
    if (q.includes(synonym)) {
      const mapping = SYNONYM_MAP[synonym];
      if (mapping.category) result.category = mapping.category;
      if (mapping.sub_category) result.sub_category = mapping.sub_category;
      break;
    }
  }

  // 3. Check brand names (case-insensitive)
  for (const brand of knownBrands) {
    if (q.includes(brand.toLowerCase())) {
      result.brand = brand;
      break;
    }
  }

  // 4. Extract remaining free text (strip known tokens)
  const words = q.split(/\s+/).filter(w =>
    !STOP_WORDS.has(w) &&
    !Object.keys(GENDER_KEYWORDS).includes(w) &&
    !Object.keys(SYNONYM_MAP).some(s => s.includes(w))
  );
  // If no structured match was found, keep the free text for fuzzy/regex fallback
  if (!result.category && !result.sub_category && !result.brand) {
    result.freeText = words.join(' ');
  }

  return result;
};

// Cache known brands from DB
let cachedBrands = [];
let brandsCacheTime = 0;
const BRANDS_TTL = 5 * 60 * 1000;

const getKnownBrands = async () => {
  const now = Date.now();
  if (cachedBrands.length > 0 && now - brandsCacheTime < BRANDS_TTL) {
    return cachedBrands;
  }
  cachedBrands = await Product.distinct('brand');
  brandsCacheTime = now;
  return cachedBrands;
};

// ═══════════════════════════════════════════════════════════════
// GET /api/products — Main product listing with intelligent search
// ═══════════════════════════════════════════════════════════════

export const getProducts = async (req, res, next) => {
  try {
    const { category, brand, sort, search, page = 1, limit = 10 } = req.query;
    const query = {};

    // 1. Explicit category/brand filters from UI tabs
    if (category) {
      query.category = category;
    }
    if (brand) {
      query.brand = brand;
    }

    // 2. Intelligent search parsing (shared logic)
    if (search) {
      const knownBrands = await getKnownBrands();
      const parsed = parseSearchQuery(search, knownBrands);

      // Apply structured filters from parsed query
      if (parsed.category && !category) query.category = parsed.category;
      if (parsed.sub_category) query.sub_category = { $regex: parsed.sub_category, $options: 'i' };
      if (parsed.gender) {
        // Include both the specific gender AND Unisex products
        query.gender = { $in: [parsed.gender, 'Unisex'] };
      }
      if (parsed.brand && !brand) query.brand = { $regex: parsed.brand, $options: 'i' };

      // Free text fallback — search name/description/brand if no structured match
      if (parsed.freeText) {
        query.$or = [
          { name: { $regex: parsed.freeText, $options: 'i' } },
          { description: { $regex: parsed.freeText, $options: 'i' } },
          { brand: { $regex: parsed.freeText, $options: 'i' } },
          { sub_category: { $regex: parsed.freeText, $options: 'i' } },
        ];
      }
    }

    // 3. Sorting
    let sortOptions = { createdAt: -1 };
    if (sort) {
      if (sort === 'price_asc') sortOptions = { price: 1 };
      else if (sort === 'price_desc') sortOptions = { price: -1 };
      else if (sort === 'name_asc') sortOptions = { name: 1 };
      else if (sort === 'name_desc') sortOptions = { name: -1 };
    }

    // 4. Pagination
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

// ═══════════════════════════════════════════════════════════════
// GET /api/products/:id
// ═══════════════════════════════════════════════════════════════

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
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════
// GET /api/products/suggestions — Fuzzy predictive dropdown
// ═══════════════════════════════════════════════════════════════

let fuseInstance = null;
let lastCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

export const getSearchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.status(200).json({ success: true, results: [], quickLinks: [] });
    }

    const now = Date.now();
    if (!fuseInstance || now - lastCacheTime > CACHE_TTL) {
      const products = await Product.find({}, '_id name brand category sub_category gender price image_urls').lean();

      const searchableProducts = products.map(p => ({
        ...p,
        searchString: `${p.name} ${p.brand} ${p.category} ${p.sub_category || ''} ${p.gender || ''}`.toLowerCase()
      }));

      const options = {
        includeScore: true,
        threshold: 0.4,
        ignoreLocation: true,
        keys: ['searchString', 'name']
      };

      fuseInstance = new Fuse(searchableProducts, options);
      lastCacheTime = now;
    }

    // Use the SAME parseSearchQuery to understand intent
    const knownBrands = await getKnownBrands();
    const parsed = parseSearchQuery(q, knownBrands);

    // Build a clean search string from parsed tokens
    const searchTokens = [];
    if (parsed.sub_category) searchTokens.push(parsed.sub_category);
    else if (parsed.category) searchTokens.push(parsed.category);
    if (parsed.gender) searchTokens.push(parsed.gender);
    if (parsed.brand) searchTokens.push(parsed.brand);
    if (parsed.freeText) searchTokens.push(parsed.freeText);

    const finalQuery = searchTokens.length > 0 ? searchTokens.join(' ') : q;

    const searchResults = fuseInstance.search(finalQuery, { limit: 5 });
    const results = searchResults.map(result => result.item);

    // Generate quick links based on parsed intent
    const quickLinks = [];
    const qLower = q.toLowerCase();

    if (parsed.sub_category) {
      const sub = parsed.sub_category;
      if (parsed.gender && parsed.gender !== 'Unisex') {
        quickLinks.push({ label: `${sub} for ${parsed.gender}`, query: `${sub} ${parsed.gender}` });
      }
      quickLinks.push({ label: `All ${sub}`, query: sub });
    } else if (parsed.category) {
      const cat = parsed.category;
      if (parsed.gender && parsed.gender !== 'Unisex') {
        quickLinks.push({ label: `${cat} for ${parsed.gender}`, query: `${cat} ${parsed.gender}` });
      }
      quickLinks.push({ label: `All ${cat}`, query: cat });
    }

    if (parsed.brand) {
      quickLinks.push({ label: `All ${parsed.brand} products`, query: parsed.brand });
    }

    return res.status(200).json({
      success: true,
      results,
      quickLinks
    });

  } catch (error) {
    next(error);
  }
};
