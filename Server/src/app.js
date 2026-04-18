import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import errorHandler from './middlewares/errorHandler.js';
import productRoutes from './modules/products/product.routes.js';
import brandRoutes from './modules/brands/brand.routes.js';
import categoryRoutes from './modules/categories/categories.routes.js';
import cartRoutes from './modules/cart/cart.routes.js';
import orderRoutes from './modules/order/order.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import attributeRoutes from './modules/attributes/attribute.routes.js';

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use('/api/categories', categoryRoutes); //done testing
app.use('/api/brands', brandRoutes); //done testing
app.use('/api/products', productRoutes); //done testing
app.use('/api/cart', cartRoutes);  //done testing
app.use('/api/orders', orderRoutes); //done testing
app.use('/api/admin', adminRoutes); //done testing
app.use('/api/attributes', attributeRoutes);

app.use(errorHandler);

export default app;