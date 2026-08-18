import { Enquiry, Order, OrderItem, Payment } from '@prisma/client';

const EMAIL_HEADER = `
  <div style="background-color: #0f172a; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #f59e0b; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px;">OM SHILPI JEWELLERS</h1>
    <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px; font-family: sans-serif;">Crafting Timeless Elegance</p>
  </div>
`;

const EMAIL_FOOTER = `
  <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-radius: 0 0 8px 8px; font-family: sans-serif;">
    <p style="margin: 0 0 4px 0;">© ${new Date().getFullYear()} Om Shilpi Jewellers. All rights reserved.</p>
    <p style="margin: 0;">This is an automated notification. Please do not reply directly to this message.</p>
  </div>
`;

function wrapTemplate(title: string, bodyContent: string): string {
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      ${EMAIL_HEADER}
      <div style="padding: 24px; color: #334155; line-height: 1.6;">
        <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">${title}</h2>
        ${bodyContent}
      </div>
      ${EMAIL_FOOTER}
    </div>
  `;
}

// 1. Welcome Email
export function renderWelcomeTemplate(name: string): string {
  const content = `
    <p>Dear <strong>${name}</strong>,</p>
    <p>Welcome to <strong>Om Shilpi Jewellers</strong>! We are delighted to have you as a valued customer.</p>
    <p>Explore our exquisite handcrafted gold, diamond, and bridal jewellery collections crafted with timeless perfection.</p>
    <div style="margin: 24px 0; text-align: center;">
      <a href="http://localhost:3000" style="background-color: #f59e0b; color: #0f172a; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Explore Collections</a>
    </div>
    <p>If you have any questions or require bespoke jewellery customization, our team is always at your service.</p>
  `;
  return wrapTemplate('Welcome to Om Shilpi Jewellers', content);
}

// 2. Password Reset Email
export function renderPasswordResetTemplate(name: string, resetToken: string): string {
  const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
  const content = `
    <p>Dear <strong>${name}</strong>,</p>
    <p>We received a request to reset the password for your Om Shilpi Jewellers account.</p>
    <p>Click the button below to set a new password. This link is valid for <strong>15 minutes</strong>.</p>
    <div style="margin: 24px 0; text-align: center;">
      <a href="${resetUrl}" style="background-color: #0f172a; color: #f59e0b; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
    </div>
    <div style="background-color: #f8fafc; padding: 12px; border-left: 4px solid #94a3b8; font-size: 13px; color: #64748b;">
      <p style="margin: 0;">Reset Token: <code>${resetToken}</code></p>
      <p style="margin: 4px 0 0 0;">If you did not request a password reset, please ignore this email.</p>
    </div>
  `;
  return wrapTemplate('Reset Your Password', content);
}

// 3. Admin New Enquiry Email
export function renderEnquiryAdminTemplate(enquiry: Enquiry): string {
  const content = `
    <p>A new customer enquiry has been submitted through the Om Shilpi Jewellers website.</p>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 14px;">
      <tr><td style="padding: 6px 0; font-weight: bold; color: #64748b; width: 120px;">Enquiry ID:</td><td>${enquiry.id}</td></tr>
      <tr><td style="padding: 6px 0; font-weight: bold; color: #64748b;">Customer Name:</td><td>${enquiry.name}</td></tr>
      <tr><td style="padding: 6px 0; font-weight: bold; color: #64748b;">Email:</td><td><a href="mailto:${enquiry.email}">${enquiry.email}</a></td></tr>
      <tr><td style="padding: 6px 0; font-weight: bold; color: #64748b;">Phone:</td><td>${enquiry.phone || 'N/A'}</td></tr>
      <tr><td style="padding: 6px 0; font-weight: bold; color: #64748b;">Subject:</td><td>${enquiry.subject}</td></tr>
      <tr><td style="padding: 6px 0; font-weight: bold; color: #64748b;">Date:</td><td>${enquiry.createdAt.toISOString()}</td></tr>
    </table>
    <div style="background-color: #f8fafc; padding: 16px; border-left: 4px solid #f59e0b; border-radius: 4px;">
      <h4 style="margin: 0 0 8px 0;">Message:</h4>
      <p style="margin: 0; white-space: pre-wrap; color: #475569;">${enquiry.message}</p>
    </div>
  `;
  return wrapTemplate('New Customer Enquiry Received', content);
}

// 4. Customer Enquiry Acknowledgement
export function renderEnquiryAcknowledgementTemplate(name: string, subject: string): string {
  const content = `
    <p>Dear <strong>${name}</strong>,</p>
    <p>Thank you for contacting Om Shilpi Jewellers! We have received your enquiry regarding <strong>"${subject}"</strong>.</p>
    <p>Our team is reviewing your request and will get back to you shortly.</p>
    <div style="background-color: #f8fafc; padding: 16px; border-left: 4px solid #10b981; border-radius: 4px; margin-top: 16px;">
      <p style="margin: 0; color: #065f46; font-size: 14px;">Your enquiry has been assigned to our customer support desk under status <strong>NEW</strong>.</p>
    </div>
  `;
  return wrapTemplate('We Have Received Your Enquiry', content);
}

// 5. Order Confirmation Email
export function renderOrderConfirmationTemplate(order: Order & { items: OrderItem[] }, userName?: string): string {
  const customerName = userName || order.shippingFullName || 'Valued Customer';
  const itemsTableRows = order.items.map((item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${item.productNameSnapshot} <br><small style="color: #64748b;">SKU: ${item.skuSnapshot}</small></td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">₹${Number(item.unitPrice).toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;">₹${Number(item.totalPrice).toFixed(2)}</td>
    </tr>
  `).join('');

  const content = `
    <p>Dear <strong>${customerName}</strong>,</p>
    <p>Thank you for your order with <strong>Om Shilpi Jewellers</strong>! Your order number is <strong>${order.orderNumber}</strong>.</p>
    
    <h3 style="color: #1e293b; margin-top: 20px;">Order Details</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
      <thead>
        <tr style="background-color: #f8fafc; color: #475569; text-align: left;">
          <th style="padding: 10px;">Item</th>
          <th style="padding: 10px; text-align: center;">Qty</th>
          <th style="padding: 10px; text-align: right;">Unit Price</th>
          <th style="padding: 10px; text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsTableRows}
      </tbody>
    </table>

    <table style="width: 100%; max-width: 280px; margin-left: auto; border-collapse: collapse; font-size: 14px;">
      <tr><td style="padding: 4px 0; color: #64748b;">Subtotal:</td><td style="text-align: right;">₹${Number(order.subtotal).toFixed(2)}</td></tr>
      <tr><td style="padding: 4px 0; color: #64748b;">Shipping:</td><td style="text-align: right;">₹${Number(order.shippingAmount).toFixed(2)}</td></tr>
      <tr><td style="padding: 4px 0; color: #64748b;">Tax:</td><td style="text-align: right;">₹${Number(order.tax).toFixed(2)}</td></tr>
      <tr><td style="padding: 4px 0; color: #64748b;">Discount:</td><td style="text-align: right;">-₹${Number(order.discount).toFixed(2)}</td></tr>
      <tr style="font-weight: bold; font-size: 16px; border-top: 2px solid #0f172a;">
        <td style="padding: 8px 0; color: #0f172a;">Grand Total:</td>
        <td style="text-align: right; color: #f59e0b;">₹${Number(order.total).toFixed(2)}</td>
      </tr>
    </table>

    <h3 style="color: #1e293b; margin-top: 20px;">Shipping Address</h3>
    <div style="background-color: #f8fafc; padding: 12px; border-radius: 6px; font-size: 14px; color: #334155;">
      <strong>${order.shippingFullName}</strong><br>
      ${order.shippingAddressLine1}${order.shippingAddressLine2 ? `, ${order.shippingAddressLine2}` : ''}<br>
      ${order.shippingCity}, ${order.shippingState} - ${order.shippingPostalCode}<br>
      ${order.shippingCountry}<br>
      Phone: ${order.shippingPhone}
    </div>
  `;
  return wrapTemplate(`Order Confirmation — ${order.orderNumber}`, content);
}

// 6. Payment Confirmation Email
export function renderPaymentConfirmationTemplate(order: Order, payment: Payment, userName?: string): string {
  const customerName = userName || order.shippingFullName || 'Valued Customer';
  const content = `
    <p>Dear <strong>${customerName}</strong>,</p>
    <p>We have successfully verified your payment for order <strong>${order.orderNumber}</strong>.</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
      <tr><td style="padding: 6px 0; font-weight: bold; color: #64748b; width: 140px;">Order Number:</td><td>${order.orderNumber}</td></tr>
      <tr><td style="padding: 6px 0; font-weight: bold; color: #64748b;">Amount Paid:</td><td style="font-weight: bold; color: #10b981;">₹${Number(payment.amount).toFixed(2)} ${payment.currency}</td></tr>
      <tr><td style="padding: 6px 0; font-weight: bold; color: #64748b;">Payment Method:</td><td>${payment.method}</td></tr>
      <tr><td style="padding: 6px 0; font-weight: bold; color: #64748b;">Payment Status:</td><td>${payment.status}</td></tr>
      <tr><td style="padding: 6px 0; font-weight: bold; color: #64748b;">Payment Date:</td><td>${payment.createdAt.toISOString()}</td></tr>
    </table>
    <p>Your order is now being processed by our team.</p>
  `;
  return wrapTemplate(`Payment Confirmation — ${order.orderNumber}`, content);
}

// 7. Order Status Update Email
export function renderOrderStatusTemplate(order: Order, status: string, userName?: string): string {
  const customerName = userName || order.shippingFullName || 'Valued Customer';
  const content = `
    <p>Dear <strong>${customerName}</strong>,</p>
    <p>Your order <strong>${order.orderNumber}</strong> status has been updated to <strong>${status}</strong>.</p>
    <div style="background-color: #f8fafc; padding: 16px; border-left: 4px solid #f59e0b; margin: 16px 0; border-radius: 4px;">
      <p style="margin: 0; font-weight: bold; color: #1e293b;">Current Order Status: ${status}</p>
    </div>
    <p>Thank you for choosing Om Shilpi Jewellers.</p>
  `;
  return wrapTemplate(`Order Status Update — ${order.orderNumber}`, content);
}

// 8. Shipping Email
export function renderShippingTemplate(order: Order, userName?: string): string {
  const customerName = userName || order.shippingFullName || 'Valued Customer';
  const content = `
    <p>Dear <strong>${customerName}</strong>,</p>
    <p>Great news! Your order <strong>${order.orderNumber}</strong> has been shipped and is on its way to you.</p>
    <div style="background-color: #f8fafc; padding: 16px; border-left: 4px solid #3b82f6; margin: 16px 0; border-radius: 4px;">
      <p style="margin: 0; font-weight: bold; color: #1e293b;">Shipment Status: SHIPPED</p>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Destination: ${order.shippingCity}, ${order.shippingState}</p>
    </div>
  `;
  return wrapTemplate(`Your Order Has Shipped — ${order.orderNumber}`, content);
}

// 9. Delivery Email
export function renderDeliveryTemplate(order: Order, userName?: string): string {
  const customerName = userName || order.shippingFullName || 'Valued Customer';
  const content = `
    <p>Dear <strong>${customerName}</strong>,</p>
    <p>Your order <strong>${order.orderNumber}</strong> has been successfully delivered!</p>
    <div style="background-color: #ecfdf5; padding: 16px; border-left: 4px solid #10b981; margin: 16px 0; border-radius: 4px;">
      <p style="margin: 0; font-weight: bold; color: #065f46;">Delivery Status: DELIVERED</p>
    </div>
    <p>We hope you cherish your new jewellery. Thank you for shopping with Om Shilpi Jewellers!</p>
  `;
  return wrapTemplate(`Your Order Has Been Delivered — ${order.orderNumber}`, content);
}

// 10. Cancellation Email
export function renderCancellationTemplate(order: Order, userName?: string): string {
  const customerName = userName || order.shippingFullName || 'Valued Customer';
  const content = `
    <p>Dear <strong>${customerName}</strong>,</p>
    <p>Your order <strong>${order.orderNumber}</strong> has been cancelled.</p>
    <div style="background-color: #fef2f2; padding: 16px; border-left: 4px solid #ef4444; margin: 16px 0; border-radius: 4px;">
      <p style="margin: 0; font-weight: bold; color: #991b1b;">Order Status: CANCELLED</p>
    </div>
    <p>If you have any questions regarding refunds or cancellations, please reach out to customer support.</p>
  `;
  return wrapTemplate(`Order Cancelled — ${order.orderNumber}`, content);
}

// 11. Return Email
export function renderReturnTemplate(order: Order, userName?: string): string {
  const customerName = userName || order.shippingFullName || 'Valued Customer';
  const content = `
    <p>Dear <strong>${customerName}</strong>,</p>
    <p>Your return request for order <strong>${order.orderNumber}</strong> has been logged into our system under status <strong>RETURNED</strong>.</p>
    <p>Our quality support team will verify the return items.</p>
  `;
  return wrapTemplate(`Order Return Logged — ${order.orderNumber}`, content);
}
