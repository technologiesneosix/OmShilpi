import { prisma } from '../config/prisma';
import { ApiError } from '../utils/apiError';
import { parsePagination } from '../utils/pagination';
import { CreateTestimonialInput, UpdateTestimonialInput } from '../validators/testimonial.validator';

export class TestimonialService {
  /**
   * Retrieves active testimonials sorted by sortOrder ASC for public website.
   */
  static async getPublicTestimonials() {
    return prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        name: true,
        designation: true,
        content: true,
        rating: true,
        imageUrl: true,
        sortOrder: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Admin retrieves paginated testimonial list with optional isActive filter.
   */
  static async getAdminTestimonials(queryParams: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(queryParams);
    const where: any = {};

    if (queryParams.isActive !== undefined) {
      where.isActive = String(queryParams.isActive) === 'true';
    }

    const [testimonials, total] = await Promise.all([
      prisma.testimonial.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { sortOrder: 'asc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.testimonial.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: testimonials,
      meta: { page, limit, total, totalPages },
    };
  }

  /**
   * Admin retrieves single testimonial by ID.
   */
  static async getTestimonialById(id: string) {
    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!testimonial) {
      throw ApiError.notFound(`Testimonial with ID '${id}' not found`, 'TESTIMONIAL_NOT_FOUND');
    }

    return testimonial;
  }

  /**
   * Admin creates a new testimonial.
   */
  static async createTestimonial(input: CreateTestimonialInput) {
    return prisma.testimonial.create({
      data: {
        name: input.name,
        designation: input.designation || null,
        content: input.content,
        rating: input.rating ?? 5,
        imageUrl: input.imageUrl || null,
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive ?? true,
      },
    });
  }

  /**
   * Admin updates an existing testimonial partially.
   */
  static async updateTestimonial(id: string, input: UpdateTestimonialInput) {
    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound(`Testimonial with ID '${id}' not found`, 'TESTIMONIAL_NOT_FOUND');
    }

    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.designation !== undefined) updateData.designation = input.designation;
    if (input.content !== undefined) updateData.content = input.content;
    if (input.rating !== undefined) updateData.rating = input.rating;
    if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;
    if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    return prisma.testimonial.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Admin deletes a testimonial by ID.
   */
  static async deleteTestimonial(id: string) {
    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound(`Testimonial with ID '${id}' not found`, 'TESTIMONIAL_NOT_FOUND');
    }

    await prisma.testimonial.delete({
      where: { id },
    });

    return { id, deleted: true };
  }
}
