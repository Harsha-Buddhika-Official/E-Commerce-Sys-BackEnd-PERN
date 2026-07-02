// import transporter from '../config/mailer.config.js';
// import { orderConfirmationTemplate } from '../templates/orderConfirmation.template.js';
// import { orderStatusUpdateTemplate } from '../templates/orderStatusUpdate.template.js';

// export const sendOrderConfirmationEmail = async (order) => {
//   const html = orderConfirmationTemplate(order);

//   await transporter.sendMail({
//     from: process.env.MAIL_FROM,
//     to: order.email,
//     subject: `Order Confirmation - #${order.order_id}`,
//     html,
//   });
// };

// export const sendOrderStatusUpdateEmail = async (order) => {
//   if (!order.email) {
//     throw new Error('sendOrderStatusUpdateEmail: order.email is required');
//   }
//   const html = orderStatusUpdateTemplate(order);

//   await transporter.sendMail({
//     from: process.env.MAIL_FROM,
//     to: order.email,
//     subject: `Order Update - #${order.order_id}`,
//     html,
//   });
//   console.log(`Order email sent successfully to ${order.email} for order #${order.order_id}`);
// };

import resend from '../config/resend.config.js';
import { orderConfirmationTemplate }  from '../templates/orderConfirmation.template.js';
import { orderStatusUpdateTemplate }  from '../templates/orderStatusUpdate.template.js';

// Retry with exponential backoff: attempts 1s → 2s apart
const sendWithRetry = async (payload, maxAttempts = 3) => {
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const { data, error } = await resend.emails.send(payload);

        if (!error) {
            console.log(`Email sent successfully on attempt ${attempt}:`, data.id);
            return data;
        }

        lastError = error;
        console.error(`Email attempt ${attempt} failed:`, error.message);

        if (attempt < maxAttempts) {
            await new Promise((r) => setTimeout(r, attempt * 1000));
        }
    }

    throw new Error(`Email failed after ${maxAttempts} attempts: ${lastError.message}`);
};

export const sendOrderConfirmationEmail = async (order) => {
    if (!order.email) throw new Error('sendOrderConfirmationEmail: order.email is required');

    return sendWithRetry({
        from:    process.env.MAIL_FROM,
        to:      order.email,
        subject: `Order Confirmation - #${order.order_id}`,
        html:    orderConfirmationTemplate(order),
    });
};

export const sendOrderStatusUpdateEmail = async (order) => {
    if (!order.email) throw new Error('sendOrderStatusUpdateEmail: order.email is required');

    return sendWithRetry({
        from:    process.env.MAIL_FROM,
        to:      order.email,
        subject: `Order Update - #${order.order_id}`,
        html:    orderStatusUpdateTemplate(order),
    });
};