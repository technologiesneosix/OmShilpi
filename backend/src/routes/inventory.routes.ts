import { Router } from 'express';
import { UserRole } from '@prisma/client';
import {
  createInventoryHandler,
  getInventoryByProductIdHandler,
  getAdminInventoryListHandler,
  getLowStockInventoryHandler,
  getOutOfStockInventoryHandler,
  updateInventoryConfigHandler,
  adjustStockHandler,
  setStockHandler,
  getInventoryHistoryHandler,
} from '../controllers/inventory.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import {
  createInventorySchema,
  updateInventoryConfigSchema,
  adjustStockSchema,
  setStockSchema,
  productIdParamSchema,
  inventoryQuerySchema,
} from '../validators/inventory.validator';

const adminRouter = Router();

// All Admin Inventory Endpoints require ADMIN or SUPER_ADMIN role
adminRouter.use(requireAuth);
adminRouter.use(requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN));

adminRouter.post(
  '/',
  validateRequest({ body: createInventorySchema }),
  createInventoryHandler
);

adminRouter.get(
  '/',
  validateRequest({ query: inventoryQuerySchema }),
  getAdminInventoryListHandler
);

// Register static filter routes BEFORE parameterized /:productId routes
adminRouter.get('/low-stock', getLowStockInventoryHandler);
adminRouter.get('/out-of-stock', getOutOfStockInventoryHandler);

adminRouter.get(
  '/:productId',
  validateRequest({ params: productIdParamSchema }),
  getInventoryByProductIdHandler
);

adminRouter.patch(
  '/:productId',
  validateRequest({ params: productIdParamSchema, body: updateInventoryConfigSchema }),
  updateInventoryConfigHandler
);

adminRouter.patch(
  '/:productId/adjust',
  validateRequest({ params: productIdParamSchema, body: adjustStockSchema }),
  adjustStockHandler
);

adminRouter.patch(
  '/:productId/stock',
  validateRequest({ params: productIdParamSchema, body: setStockSchema }),
  setStockHandler
);

adminRouter.get(
  '/:productId/history',
  validateRequest({ params: productIdParamSchema }),
  getInventoryHistoryHandler
);

export { adminRouter as inventoryAdminRoutes };
