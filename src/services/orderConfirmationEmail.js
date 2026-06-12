import { transporter } from './mail.service.js';
import AppError from '../utils/AppError.js';
import dotenv from 'dotenv';

dotenv.config();

export const sendOrderConfirmationEmail = async (order) => {
    try {

        await transporter.sendMail({
            from: `"Your Store" <${process.env.EMAIL_USER}>`,

            to: order.customer_email,

            subject: `Order Confirmation - ${order.tracking_code}`,

            html: `
                <div style="font-family: Arial, sans-serif;">

                    <h2>Thank you for your order!</h2>

                    <p>Hello ${order.full_name},</p>

                    <p>
                        We have successfully received your order.
                    </p>

                    <hr>

                    <h3>Order Details</h3>

                    <p><strong>Order ID:</strong> ${order.order_id}</p>

                    <p><strong>Tracking Code:</strong> ${order.tracking_code}</p>

                    <p><strong>Total Amount:</strong> LKR ${Number(order.total_amount).toFixed(2)}</p>

                    <p><strong>Status:</strong> Pending Verification</p>

                    <hr>

                    <p>
                        Your payment receipt has been received and is currently under review.
                    </p>

                    <p>
                        We will notify you once your order has been verified and confirmed.
                    </p>

                    <br>

                    <p>Thank you for shopping with us.</p>

                </div>
            `,
        });

    } catch (error) {

        console.error(
            "Failed to send order confirmation email:",
            error
        );
    }
};