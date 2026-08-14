import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';
import { ApiResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const createCategoryHandler = asyncHandler(async (req: Request, res: Response) => {
  const category = await CategoryService.createCategory(req.body);
  ApiResponse.success(res, 'Category created successfully', { category }, 201);
});

export const getPublicCategoriesHandler = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await CategoryService.getPublicCategories();
  ApiResponse.success(res, 'Active categories fetched successfully', { categories }, 200);
});

export const getPublicCategoryBySlugHandler = asyncHandler(async (req: Request, res: Response) => {
  const slug = req.params.slug as string;
  const category = await CategoryService.getPublicCategoryBySlug(slug);
  ApiResponse.success(res, 'Category details fetched successfully', { category }, 200);
});

export const getAdminCategoriesHandler = asyncHandler(async (req: Request, res: Response) => {
  const { categories, meta } = await CategoryService.getAdminCategories(req.query as never);
  ApiResponse.paginated(res, 'Admin categories fetched successfully', categories, meta, 200);
});

export const getAdminCategoryByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const category = await CategoryService.getAdminCategoryById(id);
  ApiResponse.success(res, 'Admin category details fetched successfully', { category }, 200);
});

export const updateCategoryHandler = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const category = await CategoryService.updateCategory(id, req.body);
  ApiResponse.success(res, 'Category updated successfully', { category }, 200);
});

export const deleteCategoryHandler = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await CategoryService.deleteCategory(id);
  ApiResponse.success(res, result.message, { action: result.action, category: result.category }, 200);
});
