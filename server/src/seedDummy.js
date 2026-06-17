import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import connectDB from './config/db.js';

dotenv.config();

const dummyProducts = [
  // Shoes (Men/Women/Kids)
  {
    name: 'Nike Air Max 270',
    brand: 'Nike',
    category: 'Shoes',
    sub_category: 'Sneakers',
    gender: 'Men',
    price: 150,
    stock_quantity: 45,
    description: 'Iconic Nike sneakers with premium air cushioning.',
    image_urls: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800'],
    specifications: { size_guide: ['US 9', 'US 10', 'US 11'], color: ['Red/Black'] }
  },
  {
    name: 'Adidas Ultraboost Light',
    brand: 'Adidas',
    category: 'Shoes',
    sub_category: 'Sports Shoes',
    gender: 'Women',
    price: 190,
    stock_quantity: 30,
    description: 'Lightweight running shoes for all-day energy.',
    image_urls: ['https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&q=80&w=800'],
    specifications: { size_guide: ['US 6', 'US 7', 'US 8'], color: ['White'] }
  },
  {
    name: 'Kids Light-Up Sneakers',
    brand: 'Puma',
    category: 'Shoes',
    sub_category: 'Sneakers',
    gender: 'Kids',
    price: 45,
    stock_quantity: 100,
    description: 'Fun and durable light-up sneakers for kids.',
    image_urls: ['https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&q=80&w=800'],
    specifications: { size_guide: ['KIDS 4', 'KIDS 5'], color: ['Blue'] }
  },
  {
    name: 'Classic Oxford Formal Shoes',
    brand: 'Clarks',
    category: 'Shoes',
    sub_category: 'Formal Shoes',
    gender: 'Men',
    price: 120,
    stock_quantity: 25,
    description: 'Premium leather formal shoes for men.',
    image_urls: ['https://images.unsplash.com/photo-1614252339460-e1ff83fb69b1?auto=format&fit=crop&q=80&w=800'],
    specifications: { size_guide: ['US 9', 'US 10', 'US 11'], color: ['Brown'] }
  },
  // Shirts & T-Shirts (Men/Women/Kids)
  {
    name: 'Levi\'s Classic Denim Shirt',
    brand: 'Levi\'s',
    category: 'Clothing',
    sub_category: 'Shirts',
    gender: 'Men',
    price: 65,
    stock_quantity: 50,
    description: 'Timeless denim shirt with a relaxed fit.',
    image_urls: ['https://images.unsplash.com/photo-1588359348347-9bc6cbea68cb?auto=format&fit=crop&q=80&w=800'],
    specifications: { size_guide: ['M', 'L', 'XL'], color: ['Blue'] }
  },
  {
    name: 'Zara Silk Blouse',
    brand: 'Zara',
    category: 'Clothing',
    sub_category: 'Shirts',
    gender: 'Women',
    price: 49,
    stock_quantity: 80,
    description: 'Elegant silk blouse for formal or casual wear.',
    image_urls: ['https://images.unsplash.com/photo-1551799517-eb8f03cb5e6a?auto=format&fit=crop&q=80&w=800'],
    specifications: { size_guide: ['S', 'M', 'L'], color: ['White'] }
  },
  {
    name: 'Puma Essential Graphic T-Shirt',
    brand: 'Puma',
    category: 'Clothing',
    sub_category: 'T-Shirts',
    gender: 'Men',
    price: 25,
    stock_quantity: 150,
    description: 'Comfortable everyday graphic tee.',
    image_urls: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800'],
    specifications: { size_guide: ['M', 'L', 'XL'], color: ['Black'] }
  },
  {
    name: 'Nike Dri-FIT Running Tee',
    brand: 'Nike',
    category: 'Clothing',
    sub_category: 'T-Shirts',
    gender: 'Women',
    price: 35,
    stock_quantity: 120,
    description: 'Moisture-wicking t-shirt for workouts.',
    image_urls: ['https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?auto=format&fit=crop&q=80&w=800'],
    specifications: { size_guide: ['XS', 'S', 'M'], color: ['Pink'] }
  },
  {
    name: 'Kids Dinosaur Print T-Shirt',
    brand: 'Gap',
    category: 'Clothing',
    sub_category: 'T-Shirts',
    gender: 'Kids',
    price: 15,
    stock_quantity: 200,
    description: 'Fun graphic t-shirt for boys and girls.',
    image_urls: ['https://images.unsplash.com/photo-1519238263530-99abad674e40?auto=format&fit=crop&q=80&w=800'],
    specifications: { size_guide: ['4T', '5T', 'Youth S'], color: ['Green'] }
  },
  // Jeans & Jackets
  {
    name: 'Levi\'s 501 Original Fit Jeans',
    brand: 'Levi\'s',
    category: 'Clothing',
    sub_category: 'Jeans',
    gender: 'Men',
    price: 79,
    stock_quantity: 60,
    description: 'The blueprint for every pair of jeans in existence.',
    image_urls: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800'],
    specifications: { size_guide: ['30x32', '32x32', '34x32'], color: ['Indigo'] }
  },
  {
    name: 'High-Waisted Skinny Jeans',
    brand: 'Zara',
    category: 'Clothing',
    sub_category: 'Jeans',
    gender: 'Women',
    price: 59,
    stock_quantity: 80,
    description: 'Flattering high-waisted skinny jeans for women.',
    image_urls: ['https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=800'],
    specifications: { size_guide: ['26', '28', '30'], color: ['Black'] }
  },
  {
    name: 'The North Face Puffer Jacket',
    brand: 'The North Face',
    category: 'Clothing',
    sub_category: 'Jackets',
    gender: 'Unisex',
    price: 250,
    stock_quantity: 40,
    description: 'Warm and stylish winter puffer jacket.',
    image_urls: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800'],
    specifications: { size_guide: ['S', 'M', 'L'], color: ['Black'] }
  },
  {
    name: 'Women\'s Leather Moto Jacket',
    brand: 'Gucci',
    category: 'Clothing',
    sub_category: 'Jackets',
    gender: 'Women',
    price: 1200,
    stock_quantity: 10,
    description: 'Premium Italian leather motorcycle jacket.',
    image_urls: ['https://images.unsplash.com/photo-1559551409-dadc959f76b8?auto=format&fit=crop&q=80&w=800'],
    specifications: { size_guide: ['S', 'M'], color: ['Black'] }
  }
];

const seedData = async () => {
  try {
    await connectDB();
    console.log('Database connected!');
    
    console.log('Wiping existing database to ensure clean search index...');
    await Product.deleteMany({});

    await Product.insertMany(dummyProducts);
    console.log(`Successfully inserted ${dummyProducts.length} dummy products!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
