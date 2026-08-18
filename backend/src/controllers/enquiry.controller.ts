import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { EnquiryService } from '../services/enquiry.service';
import {
  createEnquirySchema,
  updateEnquiryStatusSchema,
  enquiryQuerySchema,
} from '../validators/enquiry.validator';

export class EnquiryController {
  /**
   * Public contact enquiry submission.
   * POST /api/v1/contact/enquiries
   * Access: Public (Unauthenticated)
   */
  static submitPublicEnquiry = asyncHandler(async (req: Request, res: Response) => {
    const input = createEnquirySchema.parse(req.body);
    const enquiry = await EnquiryService.createEnquiry(input);

    return ApiResponse.success(res, 'Enquiry submitted successfully', enquiry, 201);
  });

  /**
   * Admin enquiry listing with search, filtering, and pagination.
   * GET /api/v1/admin/enquiries
   * Access: Admin, Super Admin
   */
  static getAdminEnquiries = asyncHandler(async (req: Request, res: Response) => {
    const query = enquiryQuerySchema.parse(req.query);
    const result = await EnquiryService.getEnquiries(query);

    return ApiResponse.paginated(
      res,
      'Enquiries retrieved successfully',
      result.data,
      result.meta
    );
  });

  /**
   * Admin enquiry details lookup.
   * GET /api/v1/admin/enquiries/:id
   * Access: Admin, Super Admin
   */
  static getAdminEnquiryById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const enquiry = await EnquiryService.getEnquiryById(id);

    return ApiResponse.success(res, 'Enquiry details retrieved successfully', enquiry);
  });

  /**
   * Admin enquiry status update.
   * PATCH /api/v1/admin/enquiries/:id/status
   * Access: Admin, Super Admin
   */
  static updateAdminEnquiryStatus = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const input = updateEnquiryStatusSchema.parse(req.body);
    const updatedEnquiry = await EnquiryService.updateEnquiryStatus(id, input.status);

    return ApiResponse.success(res, 'Enquiry status updated successfully', updatedEnquiry);
  });
}
