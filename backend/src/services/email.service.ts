import { Enquiry, Order, OrderItem, Payment, OrderStatus } from '@prisma/client';
import { getEmailProvider, SendEmailResult } from '../emails/emailProvider';
import { env } from '../config/env';
import { logger } from '../config/logger';
import {
  renderWelcomeTemplate,
  renderPasswordResetTemplate,
  renderEnquiryAdminTemplate,
  renderEnquiryAcknowledgementTemplate,
  renderOrderConfirmationTemplate,
  renderPaymentConfirmationTemplate,
  renderOrderStatusTemplate,
  renderShippingTemplate,
  renderDeliveryTemplate,
  renderCancellationTemplate,
  renderReturnTemplate,
} from '../emails/templates';

// In-memory idempotency cache for duplicate payment confirmation emails
const sentPaymentEmailIds = new Set<string>();

export class EmailService {
  /**
   * 1. Sends Welcome Email to newly registered customer.
   */
  static async sendWelcomeEmail(user: { name: string; email: string }): Promise<SendEmailResult> {
    try {
      const html = renderWelcomeTemplate(user.name);
      return await getEmailProvider().sendEmail({
        to: user.email,
        subject: 'Welcome to Om Shilpi Jewellers',
        html,
      });
    } catch (error: any) {
      logger.error(`[EmailService] sendWelcomeEmail error for ${user.email}: ${error?.message || error}`);
      return { sent: false, error: error?.message || 'WELCOME_EMAIL_FAILED' };
    }
  }

  /**
   * 2. Sends Password Reset Email with reset token.
   */
  static async sendPasswordResetEmail(user: { name: string; email: string }, resetToken: string): Promise<SendEmailResult> {
    try {
      const html = renderPasswordResetTemplate(user.name, resetToken);
      return await getEmailProvider().sendEmail({
        to: user.email,
        subject: 'Reset Your Om Shilpi Jewels Password',
        html,
      });
    } catch (error: any) {
      logger.error(`[EmailService] sendPasswordResetEmail error for ${user.email}: ${error?.message || error}`);
      return { sent: false, error: error?.message || 'PASSWORD_RESET_EMAIL_FAILED' };
    }
  }

  /**
   * 3. Sends Admin New Enquiry Notification Email.
   */
  static async sendNewEnquiryAdminEmail(enquiry: Enquiry): Promise<SendEmailResult> {
    try {
      const adminEmail = env.CONTACT_RECEIVER_EMAIL || 'admin@omshilpiexample.com';
      const html = renderEnquiryAdminTemplate(enquiry);
      return await getEmailProvider().sendEmail({
        to: adminEmail,
        subject: `[New Enquiry] ${enquiry.subject} - ${enquiry.name}`,
        html,
      });
    } catch (error: any) {
      logger.error(`[EmailService] sendNewEnquiryAdminEmail error: ${error?.message || error}`);
      return { sent: false, error: error?.message || 'ENQUIRY_ADMIN_EMAIL_FAILED' };
    }
  }

  /**
   * 4. Sends Customer Enquiry Acknowledgement Email.
   */
  static async sendEnquiryAcknowledgementEmail(enquiry: Enquiry): Promise<SendEmailResult> {
    try {
      const html = renderEnquiryAcknowledgementTemplate(enquiry.name, enquiry.subject);
      return await getEmailProvider().sendEmail({
        to: enquiry.email,
        subject: 'We Received Your Enquiry - Om Shilpi Jewellers',
        html,
      });
    } catch (error: any) {
      logger.error(`[EmailService] sendEnquiryAcknowledgementEmail error for ${enquiry.email}: ${error?.message || error}`);
      return { sent: false, error: error?.message || 'ENQUIRY_ACK_EMAIL_FAILED' };
    }
  }

  /**
   * 5. Sends Order Confirmation Email upon successful checkout.
   */
  static async sendOrderConfirmationEmail(
    order: Order & { items: OrderItem[] },
    userEmail: string,
    userName?: string
  ): Promise<SendEmailResult> {
    try {
      const html = renderOrderConfirmationTemplate(order, userName);
      return await getEmailProvider().sendEmail({
        to: userEmail,
        subject: `Order Confirmation — ${order.orderNumber}`,
        html,
      });
    } catch (error: any) {
      logger.error(`[EmailService] sendOrderConfirmationEmail error for Order ${order.orderNumber}: ${error?.message || error}`);
      return { sent: false, error: error?.message || 'ORDER_CONFIRMATION_EMAIL_FAILED' };
    }
  }

  /**
   * 6. Sends Payment Confirmation Email upon backend verification (with duplicate event protection).
   */
  static async sendPaymentConfirmationEmail(
    order: Order,
    payment: Payment,
    userEmail: string,
    userName?: string
  ): Promise<SendEmailResult> {
    // Idempotency check: prevent duplicate payment emails
    const idempotencyKey = `${payment.id}:${payment.status}`;
    if (sentPaymentEmailIds.has(idempotencyKey)) {
      logger.info(`[EmailService] Payment confirmation email already sent for Payment ID ${payment.id}. Skipping duplicate email.`);
      return { sent: true, messageId: 'SKIPPED_DUPLICATE' };
    }

    try {
      const html = renderPaymentConfirmationTemplate(order, payment, userName);
      const result = await getEmailProvider().sendEmail({
        to: userEmail,
        subject: `Payment Confirmation — ${order.orderNumber}`,
        html,
      });

      if (result.sent) {
        sentPaymentEmailIds.add(idempotencyKey);
      }
      return result;
    } catch (error: any) {
      logger.error(`[EmailService] sendPaymentConfirmationEmail error for Order ${order.orderNumber}: ${error?.message || error}`);
      return { sent: false, error: error?.message || 'PAYMENT_CONFIRMATION_EMAIL_FAILED' };
    }
  }

  /**
   * 7. Sends Order Status Update Email (dispatches status-specific template).
   */
  static async sendOrderStatusEmail(
    order: Order,
    newStatus: OrderStatus,
    userEmail: string,
    userName?: string
  ): Promise<SendEmailResult> {
    try {
      let html = '';
      let subject = `Order Update — ${order.orderNumber}`;

      switch (newStatus) {
        case OrderStatus.SHIPPED:
          html = renderShippingTemplate(order, userName);
          subject = `Your Order Has Shipped — ${order.orderNumber}`;
          break;
        case OrderStatus.DELIVERED:
          html = renderDeliveryTemplate(order, userName);
          subject = `Your Order Has Been Delivered — ${order.orderNumber}`;
          break;
        case OrderStatus.CANCELLED:
          html = renderCancellationTemplate(order, userName);
          subject = `Order Cancelled — ${order.orderNumber}`;
          break;
        case OrderStatus.RETURNED:
          html = renderReturnTemplate(order, userName);
          subject = `Order Return Logged — ${order.orderNumber}`;
          break;
        default:
          html = renderOrderStatusTemplate(order, newStatus, userName);
          subject = `Order Status Update — ${order.orderNumber}`;
          break;
      }

      return await getEmailProvider().sendEmail({
        to: userEmail,
        subject,
        html,
      });
    } catch (error: any) {
      logger.error(`[EmailService] sendOrderStatusEmail error for Order ${order.orderNumber}: ${error?.message || error}`);
      return { sent: false, error: error?.message || 'ORDER_STATUS_EMAIL_FAILED' };
    }
  }
}
