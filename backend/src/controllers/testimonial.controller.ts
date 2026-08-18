import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { TestimonialService } from '../services/testimonial.service';

export class TestimonialController {
  static async getPublicTestimonials(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const testimonials = await TestimonialService.getPublicTestimonials();
      ApiResponse.success(res, 'Testimonials retrieved successfully', testimonials);
    } catch (error) {
      next(error);
    }
  }

  static async getAdminTestimonials(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await TestimonialService.getAdminTestimonials(req.query as Record<string, unknown>);
      ApiResponse.paginated(res, 'Testimonials retrieved successfully', result.data, result.meta);
    } catch (error) {
      next(error);
    }
  }

  static async getAdminTestimonialById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const testimonialId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const testimonial = await TestimonialService.getTestimonialById(testimonialId);
      ApiResponse.success(res, 'Testimonial details retrieved successfully', testimonial);
    } catch (error) {
      next(error);
    }
  }

  static async createAdminTestimonial(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const testimonial = await TestimonialService.createTestimonial(req.body);
      ApiResponse.success(res, 'Testimonial created successfully', testimonial, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateAdminTestimonial(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const testimonialId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const testimonial = await TestimonialService.updateTestimonial(testimonialId, req.body);
      ApiResponse.success(res, 'Testimonial updated successfully', testimonial);
    } catch (error) {
      next(error);
    }
  }

  static async deleteAdminTestimonial(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const testimonialId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await TestimonialService.deleteTestimonial(testimonialId);
      ApiResponse.success(res, 'Testimonial deleted successfully', result);
    } catch (error) {
      next(error);
    }
  }
}
