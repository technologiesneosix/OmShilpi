import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';

const v1Router = Router();

// Mount modular routes
v1Router.use('/', healthRoutes);
v1Router.use('/auth', authRoutes);

/*
 * Future modules to be registered here in later phases:
 * v1Router.use('/users', userRoutes);
 * v1Router.use('/products', productRoutes);
 * v1Router.use('/categories', categoryRoutes);
 * v1Router.use('/collections', collectionRoutes);
 * v1Router.use('/cart', cartRoutes);
 * v1Router.use('/wishlist', wishlistRoutes);
 * v1Router.use('/orders', orderRoutes);
 * v1Router.use('/payments', paymentRoutes);
 * v1Router.use('/enquiries', enquiryRoutes);
 * v1Router.use('/admin', adminRoutes);
 * v1Router.use('/content', contentRoutes);
 */

export default v1Router;
