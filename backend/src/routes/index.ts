import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import { categoryPublicRoutes, categoryAdminRoutes } from './category.routes';
import { collectionPublicRoutes, collectionAdminRoutes } from './collection.routes';
import { productPublicRoutes, productAdminRoutes } from './product.routes';
import { inventoryAdminRoutes } from './inventory.routes';
import mediaAdminRoutes from './media.routes';
import cartRoutes from './cart.routes';
import wishlistRoutes from './wishlist.routes';
import addressRoutes from './address.routes';
import checkoutRoutes from './checkout.routes';
import { orderCustomerRouter, orderAdminRouter } from './order.routes';
import paymentRoutes from './payment.routes';
import { contactPublicRoutes, enquiryAdminRoutes } from './enquiry.routes';
import { bannerPublicRoutes, bannerAdminRoutes } from './banner.routes';
import { testimonialPublicRoutes, testimonialAdminRoutes } from './testimonial.routes';
import { cmsPublicRoutes, cmsAdminRoutes } from './cms.routes';
import { dashboardAdminRoutes } from './dashboard.routes';

const v1Router = Router();

// Mount modular routes
v1Router.use('/', healthRoutes);
v1Router.use('/auth', authRoutes);
v1Router.use('/categories', categoryPublicRoutes);
v1Router.use('/admin/categories', categoryAdminRoutes);
v1Router.use('/collections', collectionPublicRoutes);
v1Router.use('/admin/collections', collectionAdminRoutes);
v1Router.use('/products', productPublicRoutes);
v1Router.use('/admin/products', productAdminRoutes);
v1Router.use('/admin/inventory', inventoryAdminRoutes);
v1Router.use('/admin/products', mediaAdminRoutes);
v1Router.use('/cart', cartRoutes);
v1Router.use('/wishlist', wishlistRoutes);
v1Router.use('/addresses', addressRoutes);
v1Router.use('/checkout', checkoutRoutes);
v1Router.use('/orders', orderCustomerRouter);
v1Router.use('/admin/orders', orderAdminRouter);
v1Router.use('/payments', paymentRoutes);
v1Router.use('/contact', contactPublicRoutes);
v1Router.use('/enquiries', contactPublicRoutes);
v1Router.use('/admin/enquiries', enquiryAdminRoutes);

// B18 Homepage & CMS Routes
v1Router.use('/banners', bannerPublicRoutes);
v1Router.use('/admin/banners', bannerAdminRoutes);
v1Router.use('/testimonials', testimonialPublicRoutes);
v1Router.use('/admin/testimonials', testimonialAdminRoutes);
v1Router.use('/content', cmsPublicRoutes);
v1Router.use('/admin/content', cmsAdminRoutes);

// B19 Admin Dashboard Route
v1Router.use('/admin/dashboard', dashboardAdminRoutes);

export default v1Router;
