import { EnquiryStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/apiError';
import { CreateEnquiryInput, EnquiryQueryInput } from '../validators/enquiry.validator';
import { EmailService } from './email.service';
import { AuditService } from './audit.service';

export class EnquiryService {
  /**
   * Public enquiry submission.
   * Forces status = NEW, saves in MySQL, and triggers background email dispatch.
   */
  static async createEnquiry(input: CreateEnquiryInput) {
    const enquiry = await prisma.enquiry.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        subject: input.subject,
        message: input.message,
        status: EnquiryStatus.NEW,
      },
    });

    // Decoupled Email Dispatch: Failure to send email must NOT roll back enquiry persistence
    EmailService.sendNewEnquiryAdminEmail(enquiry).catch(() => {});
    EmailService.sendEnquiryAcknowledgementEmail(enquiry).catch(() => {});

    return enquiry;
  }

  /**
   * Admin enquiry listing with pagination, status filtering, and SQL-injection safe search.
   */
  static async getEnquiries(query: EnquiryQueryInput) {
    const { page, limit, search, status, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const whereConditions: Prisma.EnquiryWhereInput = {};

    // Status filter
    if (status && status !== 'all') {
      whereConditions.status = status as EnquiryStatus;
    }

    // Parameterized search across name, email, phone, subject, message
    if (search && search.trim() !== '') {
      const searchTerms = search.trim();
      whereConditions.OR = [
        { name: { contains: searchTerms } },
        { email: { contains: searchTerms } },
        { phone: { contains: searchTerms } },
        { subject: { contains: searchTerms } },
        { message: { contains: searchTerms } },
      ];
    }

    const [enquiries, total] = await Promise.all([
      prisma.enquiry.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.enquiry.count({ where: whereConditions }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: enquiries,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Admin enquiry details lookup by ID.
   */
  static async getEnquiryById(id: string) {
    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
    });

    if (!enquiry) {
      throw ApiError.notFound(`Enquiry with ID '${id}' not found`, 'ENQUIRY_NOT_FOUND');
    }

    return enquiry;
  }

  /**
   * Admin enquiry status update.
   */
  static async updateEnquiryStatus(id: string, newStatus: EnquiryStatus, adminId?: string) {
    const existingEnquiry = await prisma.enquiry.findUnique({
      where: { id },
    });

    if (!existingEnquiry) {
      throw ApiError.notFound(`Enquiry with ID '${id}' not found`, 'ENQUIRY_NOT_FOUND');
    }

    const updatedEnquiry = await prisma.enquiry.update({
      where: { id },
      data: { status: newStatus },
    });

    AuditService.log({
      actorId: adminId || 'ADMIN',
      action: 'ENQUIRY_STATUS_CHANGED',
      resourceType: 'ENQUIRY',
      resourceId: id,
      details: { newStatus },
    }).catch(() => {});

    return updatedEnquiry;
  }
}
