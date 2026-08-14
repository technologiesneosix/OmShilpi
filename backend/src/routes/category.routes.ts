import { Router } from 'express';
import { UserRole } from '@prisma/client';
import {
  createCategoryHandler,
  getPublicCategoriesHandler,
  getPublicCategoryBySlugHandler,
  getAdminCategoriesHandler,
  getAdminCategoryByIdHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
} from '../controllers/category.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
  categorySlugParamSchema,
  adminCategoryQuerySchema,
} from '../validators/category.validator';

const publicRouter = Router();
const adminRouter = Router();

// Public Category Endpoints
publicRouter.get('/', getPublicCategoriesHandler);

publicRouter.get(
  '/:slug',
  validateRequest({ params: categorySlugParamSchema }),
  getPublicCategoryBySlugHandler
);

// Admin Category Endpoints (Requires ADMIN or SUPER_ADMIN role)
adminRouter.use(requireAuth);
adminRouter.use(requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN));

adminRouter.post(
  '/',
  validateRequest({ body: createCategorySchema }),
  createCategoryHandler
);

adminRouter.get(
  '/',
  validateRequest({ query: adminCategoryQuerySchema }),
  getAdminCategoriesHandler
);

adminRouter.get(
  '/:id',
  validateRequest({ params: categoryIdParamSchema }),
  getAdminCategoryByIdHandler
);

adminRouter.patch(
  '/:id',
  validateRequest({ params: categoryIdParamSchema, body: updateCategorySchema }),
  updateCategoryHandler
);

adminRouter.delete(
  '/:id',
  validateRequest({ params: categoryIdParamSchema }),
  deleteCategoryHandler
);

export { publicRouter as categoryPublicRoutes, adminRouter as categoryAdminRoutes };
