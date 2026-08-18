import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { BannerController } from '../controllers/banner.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import {
  createBannerSchema,
  updateBannerSchema,
  bannerQuerySchema,
} from '../validators/banner.validator';

const publicRouter = Router();
const adminRouter = Router();

// Public Banner Routes
publicRouter.get('/', BannerController.getPublicBanners);

// Admin Banner Management Routes
adminRouter.use(requireAuth);
adminRouter.use(requireRole(UserRole.ADMIN, UserRole.STAFF, UserRole.SUPER_ADMIN));

adminRouter.get(
  '/',
  validateRequest({ query: bannerQuerySchema }),
  BannerController.getAdminBanners
);

adminRouter.get('/:id', BannerController.getAdminBannerById);

adminRouter.post(
  '/',
  validateRequest({ body: createBannerSchema }),
  BannerController.createAdminBanner
);

adminRouter.patch(
  '/:id',
  validateRequest({ body: updateBannerSchema }),
  BannerController.updateAdminBanner
);

adminRouter.delete('/:id', BannerController.deleteAdminBanner);

export { publicRouter as bannerPublicRoutes, adminRouter as bannerAdminRoutes };
