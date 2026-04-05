import express from 'express';
import cors from 'cors';
import productRoutes from './modules/products/product.routes.js';
import brandRoutes from './modules/brands/brand.routes.js';
import categoryRoutes from './modules/categories/categories.routes.js';

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/categories', categoryRoutes); //done testing
app.use('/api/brands', brandRoutes); //done testing
app.use('/api/products', productRoutes); //done testing

export default app;