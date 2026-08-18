import { Resend } from 'resend';
import { env } from '../config/env';
import { logger } from '../config/logger';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  fromName?: string;
}

export interface SendEmailResult {
  sent: boolean;
  messageId?: string;
  error?: string;
}

export interface IEmailProvider {
  sendEmail(options: SendEmailOptions): Promise<SendEmailResult>;
}

export class ResendEmailProvider implements IEmailProvider {
  private resend: Resend | null = null;

  constructor() {
    if (env.RESEND_API_KEY) {
      this.resend = new Resend(env.RESEND_API_KEY);
    }
  }

  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    if (!this.resend || !env.RESEND_API_KEY) {
      logger.info(`[ResendEmailProvider] RESEND_API_KEY not set. Skipping email dispatch to ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
      return { sent: false, error: 'RESEND_API_KEY_NOT_SET' };
    }

    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    const fromAddress = env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev';

    try {
      const response = await this.resend.emails.send({
        from: fromAddress,
        to: recipients,
        subject: options.subject,
        html: options.html,
      });

      if (response.error) {
        logger.error(`[ResendEmailProvider] Dispatch error: ${response.error.message}`);
        return { sent: false, error: response.error.message };
      }

      logger.info(`[ResendEmailProvider] Email sent successfully to [${recipients.join(', ')}] (Message ID: ${response.data?.id})`);
      return { sent: true, messageId: response.data?.id };
    } catch (error: any) {
      logger.error(`[ResendEmailProvider] Exception during email dispatch: ${error?.message || error}`);
      return { sent: false, error: error?.message || 'EMAIL_DISPATCH_EXCEPTION' };
    }
  }
}

let providerInstance: IEmailProvider | null = null;

export function getEmailProvider(): IEmailProvider {
  if (!providerInstance) {
    providerInstance = new ResendEmailProvider();
  }
  return providerInstance;
}
