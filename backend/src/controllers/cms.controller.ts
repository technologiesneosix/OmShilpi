import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { CmsService } from '../services/cms.service';

export class CmsController {
  static async getPublicHomepageContent(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const content = await CmsService.getHomepageContent();
      ApiResponse.success(res, 'Homepage content retrieved successfully', content);
    } catch (error) {
      next(error);
    }
  }

  static async updateAdminHomepageContent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const content = await CmsService.updateHomepageContent(req.body);
      ApiResponse.success(res, 'Homepage content updated successfully', content);
    } catch (error) {
      next(error);
    }
  }

  static async getPublicBranding(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const branding = await CmsService.getBrandingContent();
      ApiResponse.success(res, 'Branding retrieved successfully', branding);
    } catch (error) {
      next(error);
    }
  }

  static async updateAdminBranding(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const branding = await CmsService.updateBrandingContent(req.body);
      ApiResponse.success(res, 'Branding updated successfully', branding);
    } catch (error) {
      next(error);
    }
  }

  static async getPublicStoreInfo(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeInfo = await CmsService.getStoreInfo();
      ApiResponse.success(res, 'Store information retrieved successfully', storeInfo);
    } catch (error) {
      next(error);
    }
  }

  static async updateAdminStoreInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeInfo = await CmsService.updateStoreInfo(req.body);
      ApiResponse.success(res, 'Store information updated successfully', storeInfo);
    } catch (error) {
      next(error);
    }
  }
}
