import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

// Establish Database Connection
connectDB();

const app = express();

// Middleware Setups
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (using morgan Dev format)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Custom Detailed Request Logger Middleware
app.use((req, res, next) => {
  console.log(`\n=== [REQUEST] ${req.method} ${req.originalUrl} ===`);
  if (Object.keys(req.query).length > 0) {
    console.log('Query Params:', JSON.stringify(req.query, null, 2));
  }
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
  }
  console.log('====================================\n');
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'E-Commerce server is running smoothly.' });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Server listening in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});