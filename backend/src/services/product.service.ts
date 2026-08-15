import { Product, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/apiError';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';
import { parseSort } from '../utils/queryHelpers';
import {
  CreateProductInput,
  UpdateProductInput,
  PublicProductQueryInput,
  AdminProductQueryInput,
} from '../validators/product.validator';
import { PaginationMeta } from '../types';

export class ProductService {
  /**
   * Generates a URL-friendly slug from a product name.
   */
  private static slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  /**
   * Helper to convert number or numeric string to Prisma.Decimal safely.
   */
  private static toDecimal(val: number | string | null | undefined): Prisma.Decimal | null | undefined {
    if (val === null || val === undefined) return val as null | undefined;
    return new Prisma.Decimal(String(val));
  }

  /**
   * Creates a new Product (Admin).
   */
  static async createProduct(input: CreateProductInput): Promise<Product> {
    const slug = input.slug && input.slug.trim() !== ''
      ? input.slug.trim().toLowerCase()
      : this.slugify(input.name);

    const sku = input.sku.trim().toUpperCase();

    // Check category foreign key if provided
    if (input.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: input.categoryId },
      });
      if (!category) {
        throw ApiError.notFound(`Category with ID '${input.categoryId}' not found`, 'CATEGORY_NOT_FOUND');
      }
    }

    // Check collection foreign key if provided
    if (input.collectionId) {
      const collection = await prisma.collection.findUnique({
        where: { id: input.collectionId },
      });
      if (!collection) {
        throw ApiError.notFound(`Collection with ID '${input.collectionId}' not found`, 'COLLECTION_NOT_FOUND');
      }
    }

    // Check SKU duplicate
    const existingSku = await prisma.product.findUnique({
      where: { sku },
    });
    if (existingSku) {
      throw ApiError.conflict(`Product with SKU '${sku}' already exists`, 'PRODUCT_SKU_EXISTS');
    }

    // Check Slug duplicate
    const existingSlug = await prisma.product.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      throw ApiError.conflict(`Product with slug '${slug}' already exists`, 'PRODUCT_SLUG_EXISTS');
    }

    return prisma.product.create({
      data: {
        name: input.name.trim(),
        slug,
        sku,
        shortDescription: input.shortDescription ? input.shortDescription.trim() : null,
        description: input.description ? input.description.trim() : null,
        price: new Prisma.Decimal(String(input.price)),
        compareAtPrice: this.toDecimal(input.compareAtPrice),

        // Jewellery specifications
        metal: input.metal ? input.metal.trim() : null,
        purity: input.purity ? input.purity.trim() : null,
        grossWeight: this.toDecimal(input.grossWeight),
        netWeight: this.toDecimal(input.netWeight),
        stoneType: input.stoneType ? input.stoneType.trim() : null,
        stoneWeight: this.toDecimal(input.stoneWeight),
        certification: input.certification ? input.certification.trim() : null,

        // Merchandising flags & relations
        categoryId: input.categoryId || null,
        collectionId: input.collectionId || null,
        isActive: input.isActive ?? true,
        isFeatured: input.isFeatured ?? false,
        isNewArrival: input.isNewArrival ?? false,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        collection: { select: { id: true, name: true, slug: true } },
        images: true,
      },
    });
  }

  /**
   * Retrieves active products for public catalog browsing with search, filtering, and whitelisted sorting.
   */
  static async getPublicProducts(query: PublicProductQueryInput): Promise<{
    products: Product[];
    meta: PaginationMeta;
  }> {
    const { page, limit, skip, take } = parsePagination(query);

    // Public catalog strictly exposes active products
    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    // Category filter by ID or slug
    if (query.categoryId) {
      where.categoryId = query.categoryId;
    } else if (query.category) {
      where.category = { slug: query.category.toLowerCase().trim() };
    }

    // Collection filter by ID or slug
    if (query.collectionId) {
      where.collectionId = query.collectionId;
    } else if (query.collection) {
      where.collection = { slug: query.collection.toLowerCase().trim() };
    }

    // Merchandising flags
    if (query.featured === 'true') {
      where.isFeatured = true;
    }
    if (query.newArrival === 'true') {
      where.isNewArrival = true;
    }

    // Price range filters
    if (query.minPrice || query.maxPrice) {
      where.price = {};
      if (query.minPrice && !isNaN(parseFloat(query.minPrice))) {
        where.price.gte = new Prisma.Decimal(query.minPrice);
      }
      if (query.maxPrice && !isNaN(parseFloat(query.maxPrice))) {
        where.price.lte = new Prisma.Decimal(query.maxPrice);
      }
    }

    // Search filter
    if (query.search && query.search.trim()) {
      const searchStr = query.search.trim();
      where.OR = [
        { name: { contains: searchStr } },
        { sku: { contains: searchStr } },
        { slug: { contains: searchStr } },
        { description: { contains: searchStr } },
      ];
    }

    // Whitelisted sorting fields
    const allowedSortFields = ['name', 'price', 'createdAt', 'updatedAt'];
    const { field, order } = parseSort(query.sortBy, allowedSortFields, 'createdAt', query.sortOrder);

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { [field]: order },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          collection: { select: { id: true, name: true, slug: true } },
          images: {
            select: { id: true, url: true, altText: true, isPrimary: true, sortOrder: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
      }),
    ]);

    const meta = buildPaginationMeta(total, page, limit);

    return { products, meta };
  }

  /**
   * Retrieves a single active product by slug for public browsing.
   */
  static async getPublicProductBySlug(slug: string): Promise<Product> {
    const product = await prisma.product.findFirst({
      where: {
        slug: slug.toLowerCase().trim(),
        isActive: true,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        collection: { select: { id: true, name: true, slug: true } },
        images: {
          select: { id: true, url: true, altText: true, isPrimary: true, sortOrder: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!product) {
      throw ApiError.notFound(`Product with slug '${slug}' not found`, 'PRODUCT_NOT_FOUND');
    }

    return product;
  }

  /**
   * Retrieves paginated admin products with search, status filtering, and whitelisted sorting.
   */
  static async getAdminProducts(query: AdminProductQueryInput): Promise<{
    products: Product[];
    meta: PaginationMeta;
  }> {
    const { page, limit, skip, take } = parsePagination(query);

    const where: Prisma.ProductWhereInput = {};

    if (query.status === 'active') {
      where.isActive = true;
    } else if (query.status === 'inactive') {
      where.isActive = false;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    } else if (query.category) {
      where.category = { slug: query.category.toLowerCase().trim() };
    }

    if (query.collectionId) {
      where.collectionId = query.collectionId;
    } else if (query.collection) {
      where.collection = { slug: query.collection.toLowerCase().trim() };
    }

    if (query.featured === 'true') {
      where.isFeatured = true;
    }
    if (query.newArrival === 'true') {
      where.isNewArrival = true;
    }

    if (query.search && query.search.trim()) {
      const searchStr = query.search.trim();
      where.OR = [
        { name: { contains: searchStr } },
        { sku: { contains: searchStr } },
        { slug: { contains: searchStr } },
        { description: { contains: searchStr } },
      ];
    }

    const allowedSortFields = ['name', 'price', 'createdAt', 'updatedAt'];
    const { field, order } = parseSort(query.sortBy, allowedSortFields, 'createdAt', query.sortOrder);

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { [field]: order },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          collection: { select: { id: true, name: true, slug: true } },
          images: true,
          inventory: true,
        },
      }),
    ]);

    const meta = buildPaginationMeta(total, page, limit);

    return { products, meta };
  }

  /**
   * Retrieves product details by ID for admin management.
   */
  static async getAdminProductById(id: string): Promise<Product> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        collection: true,
        images: true,
        inventory: true,
      },
    });

    if (!product) {
      throw ApiError.notFound(`Product with ID '${id}' not found`, 'PRODUCT_NOT_FOUND');
    }

    return product;
  }

  /**
   * Updates an existing Product (Admin).
   */
  static async updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw ApiError.notFound(`Product with ID '${id}' not found`, 'PRODUCT_NOT_FOUND');
    }

    // Check category foreign key if updated
    if (input.categoryId !== undefined && input.categoryId !== null && input.categoryId !== existingProduct.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: input.categoryId },
      });
      if (!category) {
        throw ApiError.notFound(`Category with ID '${input.categoryId}' not found`, 'CATEGORY_NOT_FOUND');
      }
    }

    // Check collection foreign key if updated
    if (input.collectionId !== undefined && input.collectionId !== null && input.collectionId !== existingProduct.collectionId) {
      const collection = await prisma.collection.findUnique({
        where: { id: input.collectionId },
      });
      if (!collection) {
        throw ApiError.notFound(`Collection with ID '${input.collectionId}' not found`, 'COLLECTION_NOT_FOUND');
      }
    }

    // Check SKU collision if updated
    if (input.sku !== undefined) {
      const newSku = input.sku.trim().toUpperCase();
      if (newSku !== existingProduct.sku) {
        const skuCollision = await prisma.product.findUnique({
          where: { sku: newSku },
        });
        if (skuCollision) {
          throw ApiError.conflict(`Product with SKU '${newSku}' already exists`, 'PRODUCT_SKU_EXISTS');
        }
      }
    }

    // Check Slug collision if updated
    if (input.slug !== undefined) {
      const newSlug = input.slug.trim().toLowerCase();
      if (newSlug !== existingProduct.slug) {
        const slugCollision = await prisma.product.findUnique({
          where: { slug: newSlug },
        });
        if (slugCollision) {
          throw ApiError.conflict(`Product with slug '${newSlug}' already exists`, 'PRODUCT_SLUG_EXISTS');
        }
      }
    }

    const data: Prisma.ProductUpdateInput = {};

    if (input.name !== undefined) data.name = input.name.trim();
    if (input.slug !== undefined) data.slug = input.slug.trim().toLowerCase();
    if (input.sku !== undefined) data.sku = input.sku.trim().toUpperCase();
    if (input.shortDescription !== undefined) data.shortDescription = input.shortDescription ? input.shortDescription.trim() : null;
    if (input.description !== undefined) data.description = input.description ? input.description.trim() : null;

    if (input.price !== undefined) data.price = new Prisma.Decimal(String(input.price));
    if (input.compareAtPrice !== undefined) data.compareAtPrice = this.toDecimal(input.compareAtPrice);

    if (input.metal !== undefined) data.metal = input.metal ? input.metal.trim() : null;
    if (input.purity !== undefined) data.purity = input.purity ? input.purity.trim() : null;
    if (input.grossWeight !== undefined) data.grossWeight = this.toDecimal(input.grossWeight);
    if (input.netWeight !== undefined) data.netWeight = this.toDecimal(input.netWeight);
    if (input.stoneType !== undefined) data.stoneType = input.stoneType ? input.stoneType.trim() : null;
    if (input.stoneWeight !== undefined) data.stoneWeight = this.toDecimal(input.stoneWeight);
    if (input.certification !== undefined) data.certification = input.certification ? input.certification.trim() : null;

    if (input.categoryId !== undefined) {
      data.category = input.categoryId ? { connect: { id: input.categoryId } } : { disconnect: true };
    }

    if (input.collectionId !== undefined) {
      data.collection = input.collectionId ? { connect: { id: input.collectionId } } : { disconnect: true };
    }

    if (input.isActive !== undefined) data.isActive = input.isActive;
    if (input.isFeatured !== undefined) data.isFeatured = input.isFeatured;
    if (input.isNewArrival !== undefined) data.isNewArrival = input.isNewArrival;

    return prisma.product.update({
      where: { id },
      data,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        collection: { select: { id: true, name: true, slug: true } },
        images: true,
      },
    });
  }

  /**
   * Deactivates or deletes a product (Admin).
   * Default safe action soft-deactivates (`isActive = false`) to preserve potential order historical snapshots.
   */
  static async deleteProduct(id: string): Promise<{
    action: 'deactivated' | 'deleted';
    message: string;
    product?: Product;
  }> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orderItems: true },
        },
      },
    });

    if (!product) {
      throw ApiError.notFound(`Product with ID '${id}' not found`, 'PRODUCT_NOT_FOUND');
    }

    if (product._count.orderItems > 0) {
      const updated = await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
      return {
        action: 'deactivated',
        message: `Product '${product.name}' has historical order reference(s). Soft-deactivated instead of deleting.`,
        product: updated,
      };
    }

    await prisma.product.delete({
      where: { id },
    });

    return {
      action: 'deleted',
      message: `Product '${product.name}' successfully deleted.`,
    };
  }
}
