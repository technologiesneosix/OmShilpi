import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { DashboardController } from '../controllers/dashboard.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const adminRouter = Router();

adminRouter.use(requireAuth);
adminRouter.use(requireRole(UserRole.ADMIN, UserRole.STAFF, UserRole.SUPER_ADMIN));

/**
 * @route GET /api/v1/admin/dashboard
 * @desc Retrieve aggregated admin dashboard business summary & recent orders
 * @access Admin, Staff, Super Admin
 */
adminRouter.get('/', DashboardController.getAdminDashboardSummary);

export { adminRouter as dashboardAdminRoutes };
