import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { EnquiryController } from '../controllers/enquiry.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { contactRateLimiter } from '../middleware/rateLimiter.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import {
  createEnquirySchema,
  updateEnquiryStatusSchema,
  enquiryQuerySchema,
} from '../validators/enquiry.validator';

const publicRouter = Router();
const adminRouter = Router();

// ===================================================
// PUBLIC CONTACT & ENQUIRY ROUTES (Unauthenticated)
// ===================================================

/**
 * @route POST /api/v1/enquiries
 * @route POST /api/v1/contact/enquiries
 * @desc Public contact enquiry submission
 * @access Public
 */
publicRouter.post(
  '/',
  contactRateLimiter,
  validateRequest({ body: createEnquirySchema }),
  EnquiryController.submitPublicEnquiry
);

publicRouter.post(
  '/enquiries',
  contactRateLimiter,
  validateRequest({ body: createEnquirySchema }),
  EnquiryController.submitPublicEnquiry
);

// ===================================================
// ADMIN ENQUIRY MANAGEMENT ROUTES (Protected)
// ===================================================

adminRouter.use(requireAuth);
adminRouter.use(requireRole(UserRole.ADMIN, UserRole.STAFF, UserRole.SUPER_ADMIN));

/**
 * @route GET /api/v1/admin/enquiries
 * @desc List enquiries with pagination, search, and status filtering
 * @access Admin, Staff, Super Admin
 */
adminRouter.get(
  '/',
  validateRequest({ query: enquiryQuerySchema }),
  EnquiryController.getAdminEnquiries
);

/**
 * @route GET /api/v1/admin/enquiries/:id
 * @desc Get enquiry details by ID
 * @access Admin, Staff, Super Admin
 */
adminRouter.get('/:id', EnquiryController.getAdminEnquiryById);

/**
 * @route PATCH /api/v1/admin/enquiries/:id
 * @route PATCH /api/v1/admin/enquiries/:id/status
 * @desc Update enquiry status
 * @access Admin, Staff, Super Admin
 */
adminRouter.patch(
  '/:id',
  validateRequest({ body: updateEnquiryStatusSchema }),
  EnquiryController.updateAdminEnquiryStatus
);

adminRouter.patch(
  '/:id/status',
  validateRequest({ body: updateEnquiryStatusSchema }),
  EnquiryController.updateAdminEnquiryStatus
);

export { publicRouter as contactPublicRoutes, adminRouter as enquiryAdminRoutes };
