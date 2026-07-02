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
// };

import resend from '../config/resend.config.js';
import { orderConfirmationTemplate } from '../templates/orderConfirmation.template.js';
import { orderStatusUpdateTemplate }  from '../templates/orderStatusUpdate.template.js';

const sendWithRetry = async (payload, maxAttempts = 3) => {
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const { data, error } = await resend.emails.send(payload);

        if (!error) {
            console.log(`[Mail] Sent successfully on attempt ${attempt} — id: ${data.id}`);
            return data;
        }

        lastError = error;
        console.error(`[Mail] Attempt ${attempt} failed:`, error.message);

        if (attempt < maxAttempts) {
            await new Promise((r) => setTimeout(r, attempt * 1000)); // 1s → 2s
        }
    }

    throw new Error(`[Mail] Failed after ${maxAttempts} attempts: ${lastError.message}`);
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