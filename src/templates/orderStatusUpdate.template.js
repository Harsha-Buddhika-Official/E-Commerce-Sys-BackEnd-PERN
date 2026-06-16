export const orderStatusUpdateTemplate = (order) => `
  <div style="font-family: Arial, sans-serif;">
    <h2>Your order status has been updated</h2>

    <p>Hello ${order.full_name},</p>

    <p>Your order status has changed to: <strong>${order.order_status}</strong></p>

    <hr>

    <p><strong>Order ID:</strong> ${order.order_id}</p>
    <p><strong>Tracking Code:</strong> ${order.tracking_code}</p>

    <hr>

    <p>Thank you for shopping with us.</p>
  </div>
`;