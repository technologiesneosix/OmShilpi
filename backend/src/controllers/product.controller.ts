import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { ApiResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const createProductHandler = asyncHandler(async (req: Request, res: Response) => {
  const product = await ProductService.createProduct(req.body);
  ApiResponse.success(res, 'Product created successfully', { product }, 201);
});

export const getPublicProductsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { products, meta } = await ProductService.getPublicProducts(req.query as never);
  ApiResponse.paginated(res, 'Active products fetched successfully', products, meta, 200);
});

export const getPublicProductBySlugHandler = asyncHandler(async (req: Request, res: Response) => {
  const slug = req.params.slug as string;
  const product = await ProductService.getPublicProductBySlug(slug);
  ApiResponse.success(res, 'Product details fetched successfully', { product }, 200);
});

export const getAdminProductsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { products, meta } = await ProductService.getAdminProducts(req.query as never);
  ApiResponse.paginated(res, 'Admin products fetched successfully', products, meta, 200);
});

export const getAdminProductByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const product = await ProductService.getAdminProductById(id);
  ApiResponse.success(res, 'Admin product details fetched successfully', { product }, 200);
});

export const updateProductHandler = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const product = await ProductService.updateProduct(id, req.body);
  ApiResponse.success(res, 'Product updated successfully', { product }, 200);
});

export const deleteProductHandler = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await ProductService.deleteProduct(id);
  ApiResponse.success(res, result.message, { action: result.action, product: result.product }, 200);
});
