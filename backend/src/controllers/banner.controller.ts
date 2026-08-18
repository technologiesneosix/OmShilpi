import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { BannerService } from '../services/banner.service';

export class BannerController {
  static async getPublicBanners(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const banners = await BannerService.getPublicBanners();
      ApiResponse.success(res, 'Banners retrieved successfully', banners);
    } catch (error) {
      next(error);
    }
  }

  static async getAdminBanners(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await BannerService.getAdminBanners(req.query as Record<string, unknown>);
      ApiResponse.paginated(res, 'Banners retrieved successfully', result.data, result.meta);
    } catch (error) {
      next(error);
    }
  }

  static async getAdminBannerById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bannerId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const banner = await BannerService.getBannerById(bannerId);
      ApiResponse.success(res, 'Banner details retrieved successfully', banner);
    } catch (error) {
      next(error);
    }
  }

  static async createAdminBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminId = req.user?.id;
      const banner = await BannerService.createBanner(req.body, adminId);
      ApiResponse.success(res, 'Banner created successfully', banner, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateAdminBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bannerId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const adminId = req.user?.id;
      const banner = await BannerService.updateBanner(bannerId, req.body, adminId);
      ApiResponse.success(res, 'Banner updated successfully', banner);
    } catch (error) {
      next(error);
    }
  }

  static async deleteAdminBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bannerId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const adminId = req.user?.id;
      const result = await BannerService.deleteBanner(bannerId, adminId);
      ApiResponse.success(res, 'Banner deleted successfully', result);
    } catch (error) {
      next(error);
    }
  }
}
