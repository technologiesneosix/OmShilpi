import { prisma } from '../config/prisma';
import { logger } from '../config/logger';

export interface LogAuditOptions {
  actorId: string;
  actorEmail?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  details?: Record<string, any> | null;
}

export class AuditService {
  /**
   * Non-blocking audit logger for security-sensitive administrative operations.
   */
  static async log(options: LogAuditOptions): Promise<void> {
    try {
      // Sanitize details: ensure sensitive keys (passwords, tokens, secrets) are NEVER stored in audit logs
      const sanitizedDetails = options.details ? { ...options.details } : null;
      if (sanitizedDetails) {
        delete sanitizedDetails.password;
        delete sanitizedDetails.passwordHash;
        delete sanitizedDetails.token;
        delete sanitizedDetails.secret;
        delete sanitizedDetails.apiKey;
      }

      await prisma.auditLog.create({
        data: {
          actorId: options.actorId,
          actorEmail: options.actorEmail || null,
          action: options.action,
          resourceType: options.resourceType,
          resourceId: options.resourceId || null,
          ...(sanitizedDetails ? { details: sanitizedDetails } : {}),
        },
      });

      logger.info(`[AuditLog] Action '${options.action}' on '${options.resourceType}' logged for actor '${options.actorId}'`);
    } catch (error: any) {
      logger.error(`[AuditLog] Failed to record audit log: ${error?.message || error}`);
    }
  }
}
