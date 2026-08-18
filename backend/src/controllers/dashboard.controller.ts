import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  static async getAdminDashboardSummary(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await DashboardService.getAdminDashboardSummary();
      ApiResponse.success(res, 'Dashboard data retrieved successfully', summary);
    } catch (error) {
      next(error);
    }
  }
}
