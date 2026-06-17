export const orderConfirmationTemplate = (order) => `
  <div style="font-family: Arial, sans-serif;">
    <h2>Thank you for your order!</h2>

    <p>Hello ${order.full_name},</p>

    <p>We have successfully received your order.</p>

    <hr>

    <h3>Order Details</h3>
    
    <p><strong>Order ID:</strong> ${order.order_id}</p>
    <p><strong>Tracking Code:</strong> ${order.tracking_code}</p>
    <p><strong>Total Amount:</strong> LKR ${Number(order.total_amount).toFixed(2)}</p>
    <p><strong>Status:</strong> Pending Verification</p>

    <hr>

    <p>Your payment receipt is under review.</p>
    <p>We will notify you once confirmed.</p>

    <br>

    <p>Thank you for shopping with us.</p>
  </div>
`;