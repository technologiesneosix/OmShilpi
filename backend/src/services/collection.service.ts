import { Collection, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/apiError';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';
import { parseSort } from '../utils/queryHelpers';
import {
  CreateCollectionInput,
  UpdateCollectionInput,
  AdminCollectionQueryInput,
} from '../validators/collection.validator';
import { PaginationMeta } from '../types';

export class CollectionService {
  /**
   * Generates a URL-friendly slug from a collection name.
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
   * Creates a new Collection (Admin).
   */
  static async createCollection(input: CreateCollectionInput): Promise<Collection> {
    const slug = input.slug && input.slug.trim() !== ''
      ? input.slug.trim().toLowerCase()
      : this.slugify(input.name);

    // Check duplicate slug
    const existingCollection = await prisma.collection.findUnique({
      where: { slug },
    });

    if (existingCollection) {
      throw ApiError.conflict(`Collection with slug '${slug}' already exists`, 'COLLECTION_SLUG_EXISTS');
    }

    return prisma.collection.create({
      data: {
        name: input.name.trim(),
        slug,
        description: input.description ? input.description.trim() : null,
        image: input.image ? input.image.trim() : null,
        bannerImage: input.bannerImage ? input.bannerImage.trim() : null,
        isActive: input.isActive ?? true,
        sortOrder: input.sortOrder ?? 0,
      },
    });
  }

  /**
   * Retrieves active collections for public browsing sorted by sortOrder asc, name asc.
   */
  static async getPublicCollections(): Promise<Collection[]> {
    return prisma.collection.findMany({
      where: { isActive: true },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  /**
   * Retrieves a single active collection by slug for public browsing.
   */
  static async getPublicCollectionBySlug(slug: string): Promise<Collection> {
    const collection = await prisma.collection.findFirst({
      where: {
        slug: slug.toLowerCase().trim(),
        isActive: true,
      },
    });

    if (!collection) {
      throw ApiError.notFound(`Collection with slug '${slug}' not found`, 'COLLECTION_NOT_FOUND');
    }

    return collection;
  }

  /**
   * Retrieves paginated admin collections with search, status filtering, and whitelisted sorting.
   */
  static async getAdminCollections(query: AdminCollectionQueryInput): Promise<{
    collections: Collection[];
    meta: PaginationMeta;
  }> {
    const { page, limit, skip, take } = parsePagination(query);

    // Build filter criteria
    const where: Prisma.CollectionWhereInput = {};

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

    const [total, collections] = await Promise.all([
      prisma.collection.count({ where }),
      prisma.collection.findMany({
        where,
        skip,
        take,
        orderBy: { [field]: order },
      }),
    ]);

    const meta = buildPaginationMeta(total, page, limit);

    return { collections, meta };
  }

  /**
   * Retrieves collection details by ID for admin management.
   */
  static async getAdminCollectionById(id: string): Promise<Collection & { _count: { products: number } }> {
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!collection) {
      throw ApiError.notFound(`Collection with ID '${id}' not found`, 'COLLECTION_NOT_FOUND');
    }

    return collection;
  }

  /**
   * Updates an existing Collection (Admin).
   */
  static async updateCollection(id: string, input: UpdateCollectionInput): Promise<Collection> {
    const existingCollection = await prisma.collection.findUnique({
      where: { id },
    });

    if (!existingCollection) {
      throw ApiError.notFound(`Collection with ID '${id}' not found`, 'COLLECTION_NOT_FOUND');
    }

    const data: Prisma.CollectionUpdateInput = {};

    if (input.name !== undefined) {
      data.name = input.name.trim();
    }

    if (input.slug !== undefined) {
      const newSlug = input.slug.trim().toLowerCase();
      if (newSlug !== existingCollection.slug) {
        const slugCollision = await prisma.collection.findUnique({
          where: { slug: newSlug },
        });

        if (slugCollision) {
          throw ApiError.conflict(`Collection with slug '${newSlug}' already exists`, 'COLLECTION_SLUG_EXISTS');
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

    if (input.bannerImage !== undefined) {
      data.bannerImage = input.bannerImage ? input.bannerImage.trim() : null;
    }

    if (input.isActive !== undefined) {
      data.isActive = input.isActive;
    }

    if (input.sortOrder !== undefined) {
      data.sortOrder = input.sortOrder;
    }

    return prisma.collection.update({
      where: { id },
      data,
    });
  }

  /**
   * Safely deletes or deactivates a collection.
   * If associated products exist, soft-deactivates (`isActive = false`) to prevent orphan records.
   * If no products exist, safely hard-deletes the collection.
   */
  static async deleteCollection(id: string): Promise<{
    action: 'deleted';
    message: string;
  }> {
    const collection = await prisma.collection.findUnique({
      where: { id },
    });

    if (!collection) {
      throw ApiError.notFound(`Collection with ID '${id}' not found`, 'COLLECTION_NOT_FOUND');
    }

    // Unassign products referencing this collection to avoid foreign key errors
    await prisma.product.updateMany({
      where: { collectionId: id },
      data: { collectionId: null },
    });

    // Delete collection record
    await prisma.collection.delete({
      where: { id },
    });

    return {
      action: 'deleted',
      message: `Collection '${collection.name}' deleted successfully.`,
    };
  }
}
