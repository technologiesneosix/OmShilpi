import { prisma } from '../config/prisma';
import { ApiError } from '../utils/apiError';
import { parsePagination } from '../utils/pagination';
import { CreateBannerInput, UpdateBannerInput } from '../validators/banner.validator';
import { AuditService } from './audit.service';

export class BannerService {
  /**
   * Retrieves active banners sorted by sortOrder ASC for the public homepage.
   */
  static async getPublicBanners() {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        title: true,
        subtitle: true,
        description: true,
        imageUrl: true,
        mobileImageUrl: true,
        buttonText: true,
        buttonUrl: true,
        ctaText: true,
        ctaLink: true,
        sortOrder: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return banners.map((b) => ({
      ...b,
      ctaText: b.ctaText || b.buttonText || null,
      ctaLink: b.ctaLink || b.buttonUrl || null,
    }));
  }

  /**
   * Admin retrieves paginated banner list with optional isActive filter.
   */
  static async getAdminBanners(queryParams: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(queryParams);
    const where: any = {};

    if (queryParams.isActive !== undefined) {
      where.isActive = String(queryParams.isActive) === 'true';
    }

    const [banners, total] = await Promise.all([
      prisma.banner.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { sortOrder: 'asc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.banner.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: banners.map((b) => ({
        ...b,
        ctaText: b.ctaText || b.buttonText || null,
        ctaLink: b.ctaLink || b.buttonUrl || null,
      })),
      meta: { page, limit, total, totalPages },
    };
  }

  /**
   * Admin retrieves single banner by ID.
   */
  static async getBannerById(id: string) {
    const banner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      throw ApiError.notFound(`Banner with ID '${id}' not found`, 'BANNER_NOT_FOUND');
    }

    return {
      ...banner,
      ctaText: banner.ctaText || banner.buttonText || null,
      ctaLink: banner.ctaLink || banner.buttonUrl || null,
    };
  }

  /**
   * Admin creates a new banner.
   */
  static async createBanner(input: CreateBannerInput, adminId?: string) {
    const ctaTextVal = input.ctaText || input.buttonText || null;
    const ctaLinkVal = input.ctaLink || input.buttonUrl || null;

    const banner = await prisma.banner.create({
      data: {
        title: input.title,
        subtitle: input.subtitle || null,
        description: input.description || null,
        imageUrl: input.imageUrl,
        mobileImageUrl: input.mobileImageUrl || null,
        buttonText: input.buttonText || ctaTextVal,
        buttonUrl: input.buttonUrl || ctaLinkVal,
        ctaText: ctaTextVal,
        ctaLink: ctaLinkVal,
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive ?? true,
      },
    });

    await AuditService.log({
      actorId: adminId || 'ADMIN',
      action: 'BANNER_CREATED',
      resourceType: 'BANNER',
      resourceId: banner.id,
      details: { title: banner.title },
    });

    return banner;
  }

  /**
   * Admin updates an existing banner partially.
   */
  static async updateBanner(id: string, input: UpdateBannerInput, adminId?: string) {
    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound(`Banner with ID '${id}' not found`, 'BANNER_NOT_FOUND');
    }

    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.subtitle !== undefined) updateData.subtitle = input.subtitle;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;
    if (input.mobileImageUrl !== undefined) updateData.mobileImageUrl = input.mobileImageUrl;
    if (input.buttonText !== undefined) updateData.buttonText = input.buttonText;
    if (input.buttonUrl !== undefined) updateData.buttonUrl = input.buttonUrl;
    if (input.ctaText !== undefined) updateData.ctaText = input.ctaText;
    if (input.ctaLink !== undefined) updateData.ctaLink = input.ctaLink;
    if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    const updated = await prisma.banner.update({
      where: { id },
      data: updateData,
    });

    await AuditService.log({
      actorId: adminId || 'ADMIN',
      action: 'BANNER_UPDATED',
      resourceType: 'BANNER',
      resourceId: id,
    });

    return updated;
  }

  /**
   * Admin deletes a banner by ID.
   */
  static async deleteBanner(id: string, adminId?: string) {
    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound(`Banner with ID '${id}' not found`, 'BANNER_NOT_FOUND');
    }

    await prisma.banner.delete({
      where: { id },
    });

    await AuditService.log({
      actorId: adminId || 'ADMIN',
      action: 'BANNER_DELETED',
      resourceType: 'BANNER',
      resourceId: id,
    });

    return { id, deleted: true };
  }
}
