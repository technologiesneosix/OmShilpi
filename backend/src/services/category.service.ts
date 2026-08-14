import { Category, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/apiError';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';
import { parseSort } from '../utils/queryHelpers';
import {
  CreateCategoryInput,
  UpdateCategoryInput,
  AdminCategoryQueryInput,
} from '../validators/category.validator';
import { PaginationMeta } from '../types';

export class CategoryService {
  /**
   * Generates a URL-friendly slug from a category name.
   */
  private static slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove non-word chars
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, ''); // Trim - from end of text
  }

  /**
   * Creates a new Category (Admin).
   */
  static async createCategory(input: CreateCategoryInput): Promise<Category> {
    const slug = input.slug && input.slug.trim() !== ''
      ? input.slug.trim().toLowerCase()
      : this.slugify(input.name);

    // Check duplicate slug
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      throw ApiError.conflict(`Category with slug '${slug}' already exists`, 'CATEGORY_SLUG_EXISTS');
    }

    return prisma.category.create({
      data: {
        name: input.name.trim(),
        slug,
        description: input.description ? input.description.trim() : null,
        image: input.image ? input.image.trim() : null,
        isActive: input.isActive ?? true,
        sortOrder: input.sortOrder ?? 0,
      },
    });
  }

  /**
   * Retrieves active categories for public browsing sorted by sortOrder asc, name asc.
   */
  static async getPublicCategories(): Promise<Category[]> {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  /**
   * Retrieves a single active category by slug for public browsing.
   */
  static async getPublicCategoryBySlug(slug: string): Promise<Category> {
    const category = await prisma.category.findFirst({
      where: {
        slug: slug.toLowerCase().trim(),
        isActive: true,
      },
    });

    if (!category) {
      throw ApiError.notFound(`Category with slug '${slug}' not found`, 'CATEGORY_NOT_FOUND');
    }

    return category;
  }

  /**
   * Retrieves paginated admin categories with search, status filtering, and whitelisted sorting.
   */
  static async getAdminCategories(query: AdminCategoryQueryInput): Promise<{
    categories: Category[];
    meta: PaginationMeta;
  }> {
    const { page, limit, skip, take } = parsePagination(query);

    // Build filter criteria
    const where: Prisma.CategoryWhereInput = {};

    if (query.status === 'active') {
      where.isActive = true;
    } else if (query.status === 'inactive') {
      where.isActive = false;
    }

    if (query.search && query.search.trim()) {
      const searchStr = query.search.trim();
      where.OR = [
        { name: { contains: searchStr } },
        { slug: { contains: searchStr } },
        { description: { contains: searchStr } },
      ];
    }

    // Whitelisted field sorting
    const allowedSortFields = ['name', 'sortOrder', 'createdAt', 'updatedAt'];
    const { field, order } = parseSort(query.sortBy, allowedSortFields, 'sortOrder', query.sortOrder);

    const [total, categories] = await Promise.all([
      prisma.category.count({ where }),
      prisma.category.findMany({
        where,
        skip,
        take,
        orderBy: { [field]: order },
      }),
    ]);

    const meta = buildPaginationMeta(total, page, limit);

    return { categories, meta };
  }

  /**
   * Retrieves category details by ID for admin management.
   */
  static async getAdminCategoryById(id: string): Promise<Category & { _count: { products: number } }> {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw ApiError.notFound(`Category with ID '${id}' not found`, 'CATEGORY_NOT_FOUND');
    }

    return category;
  }

  /**
   * Updates an existing Category (Admin).
   */
  static async updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw ApiError.notFound(`Category with ID '${id}' not found`, 'CATEGORY_NOT_FOUND');
    }

    const data: Prisma.CategoryUpdateInput = {};

    if (input.name !== undefined) {
      data.name = input.name.trim();
    }

    if (input.slug !== undefined) {
      const newSlug = input.slug.trim().toLowerCase();
      if (newSlug !== existingCategory.slug) {
        const slugCollision = await prisma.category.findUnique({
          where: { slug: newSlug },
        });

        if (slugCollision) {
          throw ApiError.conflict(`Category with slug '${newSlug}' already exists`, 'CATEGORY_SLUG_EXISTS');
        }
        data.slug = newSlug;
      }
    }

    if (input.description !== undefined) {
      data.description = input.description ? input.description.trim() : null;
    }

    if (input.image !== undefined) {
      data.image = input.image ? input.image.trim() : null;
    }

    if (input.isActive !== undefined) {
      data.isActive = input.isActive;
    }

    if (input.sortOrder !== undefined) {
      data.sortOrder = input.sortOrder;
    }

    return prisma.category.update({
      where: { id },
      data,
    });
  }

  /**
   * Safely deletes or deactivates a category.
   * If associated products exist, soft-deactivates (`isActive = false`) to prevent orphan records.
   * If no products exist, safely hard-deletes the category.
   */
  static async deleteCategory(id: string): Promise<{
    action: 'deactivated' | 'deleted';
    message: string;
    category?: Category;
  }> {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw ApiError.notFound(`Category with ID '${id}' not found`, 'CATEGORY_NOT_FOUND');
    }

    if (category._count.products > 0) {
      const updated = await prisma.category.update({
        where: { id },
        data: { isActive: false },
      });

      return {
        action: 'deactivated',
        message: `Category '${category.name}' has ${category._count.products} associated product(s). Soft-deactivated instead of deleting.`,
        category: updated,
      };
    }

    await prisma.category.delete({
      where: { id },
    });

    return {
      action: 'deleted',
      message: `Category '${category.name}' successfully deleted.`,
    };
  }
}
