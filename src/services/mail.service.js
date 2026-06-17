import transporter from '../config/mailer.config.js';
import { orderConfirmationTemplate } from '../templates/orderConfirmation.template.js';
import { orderStatusUpdateTemplate } from '../templates/orderStatusUpdate.template.js';

export const sendOrderConfirmationEmail = async (order) => {
  const html = orderConfirmationTemplate(order);

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: order.email,
    subject: `Order Confirmation - #${order.order_id}`,
    html,
  });
};

export const sendOrderStatusUpdateEmail = async (order) => {
  // console.log('sendOrderStatusUpdateEmail called with order:', order);
  if (!order.email) {
    throw new Error('sendOrderStatusUpdateEmail: order.email is required');
  }

  const html = orderStatusUpdateTemplate(order);

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: order.email,
    subject: `Order Update - #${order.order_id}`,
    html,
  });
};