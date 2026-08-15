import { Request, Response } from 'express';
import { InventoryService } from '../services/inventory.service';
import { ApiResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const createInventoryHandler = asyncHandler(async (req: Request, res: Response) => {
  const adminId = req.user?.id;
  const inventory = await InventoryService.createInventory(req.body, adminId);
  ApiResponse.success(res, 'Inventory record created successfully', { inventory }, 201);
});

export const getInventoryByProductIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const productId = req.params.productId as string;
  const inventory = await InventoryService.getInventoryByProductId(productId);
  ApiResponse.success(res, 'Inventory details fetched successfully', { inventory }, 200);
});

export const getAdminInventoryListHandler = asyncHandler(async (req: Request, res: Response) => {
  const { inventory, meta } = await InventoryService.getAdminInventoryList(req.query as never);
  ApiResponse.paginated(res, 'Admin inventory list fetched successfully', inventory, meta, 200);
});

export const getLowStockInventoryHandler = asyncHandler(async (req: Request, res: Response) => {
  const { inventory, meta } = await InventoryService.getLowStockInventory(req.query as never);
  ApiResponse.paginated(res, 'Low stock items fetched successfully', inventory, meta, 200);
});

export const getOutOfStockInventoryHandler = asyncHandler(async (req: Request, res: Response) => {
  const { inventory, meta } = await InventoryService.getOutOfStockInventory(req.query as never);
  ApiResponse.paginated(res, 'Out of stock items fetched successfully', inventory, meta, 200);
});

export const updateInventoryConfigHandler = asyncHandler(async (req: Request, res: Response) => {
  const productId = req.params.productId as string;
  const inventory = await InventoryService.updateInventoryConfig(productId, req.body);
  ApiResponse.success(res, 'Inventory threshold updated successfully', { inventory }, 200);
});

export const adjustStockHandler = asyncHandler(async (req: Request, res: Response) => {
  const productId = req.params.productId as string;
  const adminId = req.user?.id;
  const inventory = await InventoryService.adjustStock(productId, req.body, adminId);
  ApiResponse.success(res, 'Stock adjusted successfully', { inventory }, 200);
});

export const setStockHandler = asyncHandler(async (req: Request, res: Response) => {
  const productId = req.params.productId as string;
  const adminId = req.user?.id;
  const inventory = await InventoryService.setStock(productId, req.body, adminId);
  ApiResponse.success(res, 'Stock set successfully', { inventory }, 200);
});

export const getInventoryHistoryHandler = asyncHandler(async (req: Request, res: Response) => {
  const productId = req.params.productId as string;
  const { transactions, meta } = await InventoryService.getInventoryHistory(productId, req.query as never);
  ApiResponse.paginated(res, 'Inventory audit history fetched successfully', transactions, meta, 200);
});
