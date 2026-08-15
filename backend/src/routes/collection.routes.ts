import { Router } from 'express';
import { UserRole } from '@prisma/client';
import {
  createCollectionHandler,
  getPublicCollectionsHandler,
  getPublicCollectionBySlugHandler,
  getAdminCollectionsHandler,
  getAdminCollectionByIdHandler,
  updateCollectionHandler,
  deleteCollectionHandler,
} from '../controllers/collection.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import {
  createCollectionSchema,
  updateCollectionSchema,
  collectionIdParamSchema,
  collectionSlugParamSchema,
  adminCollectionQuerySchema,
} from '../validators/collection.validator';

const publicRouter = Router();
const adminRouter = Router();

// Public Collection Endpoints
publicRouter.get('/', getPublicCollectionsHandler);

publicRouter.get(
  '/:slug',
  validateRequest({ params: collectionSlugParamSchema }),
  getPublicCollectionBySlugHandler
);

// Admin Collection Endpoints (Requires ADMIN or SUPER_ADMIN role)
adminRouter.use(requireAuth);
adminRouter.use(requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN));

adminRouter.post(
  '/',
  validateRequest({ body: createCollectionSchema }),
  createCollectionHandler
);

adminRouter.get(
  '/',
  validateRequest({ query: adminCollectionQuerySchema }),
  getAdminCollectionsHandler
);

adminRouter.get(
  '/:id',
  validateRequest({ params: collectionIdParamSchema }),
  getAdminCollectionByIdHandler
);

adminRouter.patch(
  '/:id',
  validateRequest({ params: collectionIdParamSchema, body: updateCollectionSchema }),
  updateCollectionHandler
);

adminRouter.delete(
  '/:id',
  validateRequest({ params: collectionIdParamSchema }),
  deleteCollectionHandler
);

export { publicRouter as collectionPublicRoutes, adminRouter as collectionAdminRoutes };
