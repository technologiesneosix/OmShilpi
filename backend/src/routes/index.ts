import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import { categoryPublicRoutes, categoryAdminRoutes } from './category.routes';
import { collectionPublicRoutes, collectionAdminRoutes } from './collection.routes';

const v1Router = Router();

// Mount modular routes
v1Router.use('/', healthRoutes);
v1Router.use('/auth', authRoutes);
v1Router.use('/categories', categoryPublicRoutes);
v1Router.use('/admin/categories', categoryAdminRoutes);
v1Router.use('/collections', collectionPublicRoutes);
v1Router.use('/admin/collections', collectionAdminRoutes);

/*
 * Future modules to be registered here in later phases:
 * v1Router.use('/users', userRoutes);
 * v1Router.use('/products', productRoutes);
 * v1Router.use('/cart', cartRoutes);
 * v1Router.use('/wishlist', wishlistRoutes);
 * v1Router.use('/orders', orderRoutes);
 * v1Router.use('/payments', paymentRoutes);
 * v1Router.use('/enquiries', enquiryRoutes);
 * v1Router.use('/content', contentRoutes);
 */

export default v1Router;
