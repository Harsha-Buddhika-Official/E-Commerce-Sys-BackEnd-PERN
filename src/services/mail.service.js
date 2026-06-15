import transporter from '../config/mailer.config.js';
import { orderConfirmationTemplate } from '../templates/orderConfirmation.template.js';

export const sendOrderConfirmationEmail = async (order) => {
  console.log('Preparing to send order confirmation email for order:', order);
  const html = orderConfirmationTemplate(order);

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: order.email,
    subject: `Order Confirmation - #${order.order_id}`,
    html,
  });
};