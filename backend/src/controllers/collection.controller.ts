import { Request, Response } from 'express';
import { CollectionService } from '../services/collection.service';
import { ApiResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const createCollectionHandler = asyncHandler(async (req: Request, res: Response) => {
  const collection = await CollectionService.createCollection(req.body);
  ApiResponse.success(res, 'Collection created successfully', { collection }, 201);
});

export const getPublicCollectionsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const collections = await CollectionService.getPublicCollections();
  ApiResponse.success(res, 'Active collections fetched successfully', { collections }, 200);
});

export const getPublicCollectionBySlugHandler = asyncHandler(async (req: Request, res: Response) => {
  const slug = req.params.slug as string;
  const collection = await CollectionService.getPublicCollectionBySlug(slug);
  ApiResponse.success(res, 'Collection details fetched successfully', { collection }, 200);
});

export const getAdminCollectionsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { collections, meta } = await CollectionService.getAdminCollections(req.query as never);
  ApiResponse.paginated(res, 'Admin collections fetched successfully', collections, meta, 200);
});

export const getAdminCollectionByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const collection = await CollectionService.getAdminCollectionById(id);
  ApiResponse.success(res, 'Admin collection details fetched successfully', { collection }, 200);
});

export const updateCollectionHandler = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const collection = await CollectionService.updateCollection(id, req.body);
  ApiResponse.success(res, 'Collection updated successfully', { collection }, 200);
});

export const deleteCollectionHandler = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await CollectionService.deleteCollection(id);
  ApiResponse.success(res, result.message, { action: result.action, collection: result.collection }, 200);
});
