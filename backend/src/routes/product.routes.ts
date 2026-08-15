import { Router } from 'express';
import { UserRole } from '@prisma/client';
import {
  createProductHandler,
  getPublicProductsHandler,
  getPublicProductBySlugHandler,
  getAdminProductsHandler,
  getAdminProductByIdHandler,
  updateProductHandler,
  deleteProductHandler,
} from '../controllers/product.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import {
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
  productSlugParamSchema,
  publicProductQuerySchema,
  adminProductQuerySchema,
} from '../validators/product.validator';

const publicRouter = Router();
const adminRouter = Router();

// Public Product Catalog Endpoints
publicRouter.get(
  '/',
  validateRequest({ query: publicProductQuerySchema }),
  getPublicProductsHandler
);

publicRouter.get(
  '/:slug',
  validateRequest({ params: productSlugParamSchema }),
  getPublicProductBySlugHandler
);

// Admin Product Endpoints (Requires ADMIN or SUPER_ADMIN role)
adminRouter.use(requireAuth);
adminRouter.use(requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN));

adminRouter.post(
  '/',
  validateRequest({ body: createProductSchema }),
  createProductHandler
);

adminRouter.get(
  '/',
  validateRequest({ query: adminProductQuerySchema }),
  getAdminProductsHandler
);

adminRouter.get(
  '/:id',
  validateRequest({ params: productIdParamSchema }),
  getAdminProductByIdHandler
);

adminRouter.patch(
  '/:id',
  validateRequest({ params: productIdParamSchema, body: updateProductSchema }),
  updateProductHandler
);

adminRouter.delete(
  '/:id',
  validateRequest({ params: productIdParamSchema }),
  deleteProductHandler
);

export { publicRouter as productPublicRoutes, adminRouter as productAdminRoutes };
