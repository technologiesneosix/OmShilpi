import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { TestimonialController } from '../controllers/testimonial.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import {
  createTestimonialSchema,
  updateTestimonialSchema,
  testimonialQuerySchema,
} from '../validators/testimonial.validator';

const publicRouter = Router();
const adminRouter = Router();

// Public Testimonial Routes
publicRouter.get('/', TestimonialController.getPublicTestimonials);

// Admin Testimonial Management Routes
adminRouter.use(requireAuth);
adminRouter.use(requireRole(UserRole.ADMIN, UserRole.STAFF, UserRole.SUPER_ADMIN));

adminRouter.get(
  '/',
  validateRequest({ query: testimonialQuerySchema }),
  TestimonialController.getAdminTestimonials
);

adminRouter.get('/:id', TestimonialController.getAdminTestimonialById);

adminRouter.post(
  '/',
  validateRequest({ body: createTestimonialSchema }),
  TestimonialController.createAdminTestimonial
);

adminRouter.patch(
  '/:id',
  validateRequest({ body: updateTestimonialSchema }),
  TestimonialController.updateAdminTestimonial
);

adminRouter.delete('/:id', TestimonialController.deleteAdminTestimonial);

export { publicRouter as testimonialPublicRoutes, adminRouter as testimonialAdminRoutes };
