import { prisma } from '../config/prisma';
import { UpdateHomepageContentInput } from '../validators/cms.validator';

const HOMEPAGE_CONTENT_KEY = 'home_content';

const DEFAULT_HOMEPAGE_CONTENT = {
  hero: {
    title: 'Timeless Elegance',
    subtitle: 'Discover Fine Jewellery',
    description: 'Crafted with precision and passion for every celebration.',
    ctaText: 'Explore Collection',
    ctaLink: '/collections',
  },
  brandMessage: {
    title: 'Crafted for Generations',
    description: 'Om Shilpi Jewellers combines heritage gold artistry with contemporary bridal aesthetics.',
  },
  about: {
    title: 'About Om Shilpi Jewellers',
    description: 'Pioneering luxury jewellery design with pure certified hallmarked gold and conflict-free diamonds.',
  },
  featuredCollections: [],
  featuredProducts: [],
};

export class CmsService {
  /**
   * Public retrieves active homepage configuration JSON.
   */
  static async getHomepageContent() {
    const record = await prisma.websiteContent.findUnique({
      where: { key: HOMEPAGE_CONTENT_KEY },
    });

    if (!record || !record.metadata) {
      return DEFAULT_HOMEPAGE_CONTENT;
    }

    return record.metadata;
  }

  /**
   * Admin updates homepage configuration.
   * Deeply merges incoming sections into existing JSON metadata so unmentioned sections are preserved.
   */
  static async updateHomepageContent(input: UpdateHomepageContentInput) {
    const existing = await prisma.websiteContent.findUnique({
      where: { key: HOMEPAGE_CONTENT_KEY },
    });

    const currentMetadata: any = existing && existing.metadata ? existing.metadata : DEFAULT_HOMEPAGE_CONTENT;

    // Deep merge sections
    const updatedMetadata = {
      ...currentMetadata,
      ...(input.hero !== undefined && { hero: { ...currentMetadata.hero, ...input.hero } }),
      ...(input.brandMessage !== undefined && { brandMessage: { ...currentMetadata.brandMessage, ...input.brandMessage } }),
      ...(input.about !== undefined && { about: { ...currentMetadata.about, ...input.about } }),
      ...(input.featuredCollections !== undefined && { featuredCollections: input.featuredCollections }),
      ...(input.featuredProducts !== undefined && { featuredProducts: input.featuredProducts }),
      ...(input.promotionalBanner !== undefined && { promotionalBanner: { ...currentMetadata.promotionalBanner, ...input.promotionalBanner } }),
      ...(input.customSections !== undefined && { customSections: { ...currentMetadata.customSections, ...input.customSections } }),
    };

    const record = await prisma.websiteContent.upsert({
      where: { key: HOMEPAGE_CONTENT_KEY },
      create: {
        key: HOMEPAGE_CONTENT_KEY,
        title: 'Homepage Content',
        metadata: updatedMetadata,
      },
      update: {
        metadata: updatedMetadata,
      },
    });

    return record.metadata;
  }

  /**
   * Retrieves brand asset configuration (logo and favicon).
   */
  static async getBrandingContent() {
    const record = await prisma.websiteContent.findUnique({
      where: { key: 'brand_assets' },
    });

    if (!record || !record.metadata) {
      return {
        logoUrl: '/logo.png',
        faviconUrl: '/favicon.png',
      };
    }

    return record.metadata;
  }

  /**
   * Admin updates brand assets (logo and favicon).
   */
  static async updateBrandingContent(input: { logoUrl?: string; faviconUrl?: string }) {
    const existing = (await this.getBrandingContent()) as any;
    const updated = {
      ...existing,
      ...(input.logoUrl && { logoUrl: input.logoUrl.trim() }),
      ...(input.faviconUrl && { faviconUrl: input.faviconUrl.trim() }),
    };

    const record = await prisma.websiteContent.upsert({
      where: { key: 'brand_assets' },
      create: {
        key: 'brand_assets',
        title: 'Brand Assets (Logo & Favicon)',
        metadata: updated,
      },
      update: {
        metadata: updated,
      },
    });

    return record.metadata;
  }

  /**
   * Retrieves Store Headquarters information.
   */
  static async getStoreInfo() {
    const record = await prisma.websiteContent.findUnique({
      where: { key: 'store_info' },
    });

    if (!record || !record.metadata) {
      return {
        brandName: 'Om Shilpi Jewels Private Limited',
        flagshipAddress: 'Flagship Store, Zaveri Bazaar, Mumbai, Maharashtra, 400002',
        conciergeEmail: 'care@omshilpijewels.com',
        phone: '+91 (022) 2890-4821 / +91 98200 12345',
        bisHallmarkId: 'HM-MH-1985-OSJ',
      };
    }

    return record.metadata;
  }

  /**
   * Admin updates Store Headquarters information.
   */
  static async updateStoreInfo(input: {
    brandName?: string;
    flagshipAddress?: string;
    conciergeEmail?: string;
    phone?: string;
    bisHallmarkId?: string;
  }) {
    const existing = (await this.getStoreInfo()) as any;
    const updated = {
      ...existing,
      ...(input.brandName && { brandName: input.brandName.trim() }),
      ...(input.flagshipAddress && { flagshipAddress: input.flagshipAddress.trim() }),
      ...(input.conciergeEmail && { conciergeEmail: input.conciergeEmail.trim() }),
      ...(input.phone && { phone: input.phone.trim() }),
      ...(input.bisHallmarkId && { bisHallmarkId: input.bisHallmarkId.trim() }),
    };

    const record = await prisma.websiteContent.upsert({
      where: { key: 'store_info' },
      create: {
        key: 'store_info',
        title: 'Store Headquarters Information',
        metadata: updated,
      },
      update: {
        metadata: updated,
      },
    });

    return record.metadata;
  }
}
