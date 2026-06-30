import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/errorHandler.js';
import './config/cloudinary.js'; // Initialize Cloudinary
import productRoutes from './modules/products/product.routes.js';
import brandRoutes from './modules/brands/brand.routes.js';
import categoryRoutes from './modules/categories/categories.routes.js';
import cartRoutes from './modules/cart/cart.routes.js';
import orderRoutes from './modules/order/order.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import attributeRoutes from './modules/attributes/attribute.routes.js';
import offerRoutes from './modules/offers/offers.routes.js';
import bannerRoutes from './modules/banners/banner.router.js';

const app = express();
app.use(express.json({
    limit:'1mb'
}));
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://e-commerce-sys-frontend-pern-production.up.railway.app",
        "https://e-commerce-sys-backend-pern-production.up.railway.app/api",
    ],
    credentials: true,
}));
app.use(cookieParser());

app.use('/api/categories', categoryRoutes); 
app.use('/api/brands', brandRoutes); 
app.use('/api/products', productRoutes); 
app.use('/api/cart', cartRoutes);  
app.use('/api/orders', orderRoutes); 
app.use('/api/admin', adminRoutes); 
app.use('/api/attributes', attributeRoutes);
app.use('/api/offers', offerRoutes);
app.use("/api/banners", bannerRoutes);

app.use(errorHandler);

export default app;