import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { CmsController } from '../controllers/cms.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { updateHomepageContentSchema } from '../validators/cms.validator';

const publicRouter = Router();
const adminRouter = Router();

// Public CMS Content Routes
publicRouter.get('/home', CmsController.getPublicHomepageContent);
publicRouter.get('/branding', CmsController.getPublicBranding);
publicRouter.get('/store-info', CmsController.getPublicStoreInfo);

// Admin CMS Content Routes
adminRouter.use(requireAuth);
adminRouter.use(requireRole(UserRole.ADMIN, UserRole.STAFF, UserRole.SUPER_ADMIN));

adminRouter.patch(
  '/home',
  validateRequest({ body: updateHomepageContentSchema }),
  CmsController.updateAdminHomepageContent
);

adminRouter.patch('/branding', CmsController.updateAdminBranding);
adminRouter.patch('/store-info', CmsController.updateAdminStoreInfo);

export { publicRouter as cmsPublicRoutes, adminRouter as cmsAdminRoutes };
