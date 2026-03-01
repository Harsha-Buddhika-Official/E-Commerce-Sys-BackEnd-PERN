import express from 'express';
import cors from 'cors';
import productRoutes from './modules/products/product.routes.js';
import brandRoutes from './modules/brands/brand.routes.js';

const app = express();
app.use(express.json());
app.use(cors());

// app.use('/api/products', productRoutes);
app.use('/api/brand', brandRoutes);
// app.use('/api/admin',)

export default app;