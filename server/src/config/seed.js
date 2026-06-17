import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Product from '../models/Product.js';

/**
 * Seeds the database with demo products and a default demo user.
 */
const seedDatabase = async () => {
  try {
    // 1. Seed Demo Products if empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('Database empty. Seeding demo products...');
      const demoProducts = [
        {
          name: 'Nike Air Zoom Pegasus',
          brand: 'Nike',
          category: 'Shoes',
          price: 129.99,
          stock_quantity: 45,
          description: 'A classic everyday trainer designed for runners. Experience lightweight comfort and responsiveness with Nike Air technology.',
          image_urls: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff'],
          specifications: {
            size_guide: ['US 8', 'US 9', 'US 10', 'US 11'],
            color: ['Red/Black', 'Blue/White'],
            material: 'Synthetic Mesh'
          }
        },
        {
          name: 'Adidas Originals Essentials Hoodie',
          brand: 'Adidas',
          category: 'Clothing',
          price: 69.99,
          stock_quantity: 30,
          description: 'A cozy cotton fleece hoodie built for lounging. Features the signature trefoil logo embroidered on the chest.',
          image_urls: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7'],
          specifications: {
            size_guide: ['S', 'M', 'L', 'XL'],
            color: ['Gray', 'Black', 'Navy'],
            material: '70% Cotton / 30% Polyester'
          }
        },
        {
          name: 'Zara Slim Fit Cotton Chinos',
          brand: 'Zara',
          category: 'Clothing',
          price: 49.99,
          stock_quantity: 20,
          description: 'Stylishly tailored slim-fit chino trousers crafted from a comfortable elasticated cotton blend.',
          image_urls: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80'],
          specifications: {
            size_guide: ['30', '32', '34', '36'],
            color: ['Beige', 'Olive Green', 'Khaki'],
            material: 'Cotton Blend'
          }
        },
        {
          name: 'Classic Vintage Leather Backpack',
          brand: 'Zara',
          category: 'Accessories',
          price: 89.99,
          stock_quantity: 15,
          description: 'A hand-crafted genuine leather backpack with adjustable straps and dedicated laptop sleeve compartment.',
          image_urls: ['https://images.unsplash.com/photo-1547949003-9792a18a2601'],
          specifications: {
            size_guide: ['One Size'],
            color: ['Tan Brown', 'Dark Coffee'],
            material: 'Full-Grain Leather'
          }
        },
        {
          name: 'Gucci Rectangular Acetate Sunglasses',
          brand: 'Gucci',
          category: 'Accessories',
          price: 350.00,
          stock_quantity: 5,
          description: 'Elegant rectangular sunglasses made from durable acetate frame with 100% UVA/UVB protection tinted lenses.',
          image_urls: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083'],
          specifications: {
            size_guide: ['Standard'],
            color: ['Tortoiseshell/Gold', 'Shiny Black'],
            material: 'Acetate Frame'
          }
        },
        {
          name: 'Puma Hybrid Running Shoes',
          brand: 'Puma',
          category: 'Shoes',
          price: 99.99,
          stock_quantity: 12,
          description: 'Combining ignite foam and energy beads for the ultimate cushioning and energy return on morning road runs.',
          image_urls: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5'],
          specifications: {
            size_guide: ['US 9', 'US 10', 'US 11'],
            color: ['Black/Yellow', 'White/Orange'],
            material: 'Performance Mesh'
          }
        }
      ];

      await Product.insertMany(demoProducts);
      console.log('Demo products seeded successfully.');
    }

    // 2. Seed Default User if empty
    const demoUser = await User.findOne({ email: 'demo@example.com' });
    if (!demoUser) {
      console.log('Demo user not found. Seeding demo user...');
      const password_hash = await bcrypt.hash('password123', 10);
      
      const newDemoUser = new User({
        name: 'Demo User',
        email: 'demo@example.com',
        password_hash,
        address_book: [
          {
            street: '123 Fashion Blvd',
            city: 'New York',
            state: 'NY',
            postal_code: '10001',
            country: 'United States',
            is_default: true
          }
        ],
        wishlist_ids: []
      });

      await newDemoUser.save();
      console.log('Demo user seeded successfully (demo@example.com / password123).');
    }

  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
  }
};

export default seedDatabase;
