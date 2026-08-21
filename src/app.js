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
import comparisonRoutes from './modules/comparison/comparison.route.js';
import chatRoutes from './modules/chat/chat.route.js';

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://e-commerce-sys-front-end-pern-eta.vercel.app"
];

const app = express();
app.use(express.json({
    limit: '1mb'
}));
app.set("trust proxy", 1);
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
            console.log(`Blocked CORS request from origin`);
        }
    },
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
app.use("/api/ai", comparisonRoutes);
app.use("/api/chat", chatRoutes);

app.use(errorHandler);

export default app;