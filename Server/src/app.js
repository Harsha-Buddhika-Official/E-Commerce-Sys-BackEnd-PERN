import express from 'express';
import cors from 'cors';
import productRoutes from './modules/products/product.routes.js';
import brandRoutes from './modules/brands/brand.routes.js';
import categoryRoutes from './modules/categories/categories.routes.js';
import cartRoutes from './modules/cart/cart.routes.js';
import orderRoutes from './modules/order/order.routes.js';

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/categories', categoryRoutes); //done testing
app.use('/api/brands', brandRoutes); //done testing
app.use('/api/products', productRoutes); //done testing
app.use('/api/cart', cartRoutes); 
app.use('/api/orders', orderRoutes);

export default app;