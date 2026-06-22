const STATUS_META = {
    pending_payment: { label: 'Pending Payment',    emoji: '⏳', bg: '#fef9c3', border: '#fde047', color: '#ca8a04', meaning: "We've received your order and are waiting for your payment receipt to be uploaded and verified." },
    pending:         { label: 'Pending',             emoji: '🕐', bg: '#fef9c3', border: '#fde047', color: '#ca8a04', meaning: 'Your order is queued and will be processed shortly.' },
    paid:            { label: 'Payment Confirmed',   emoji: '✅', bg: '#dcfce7', border: '#86efac', color: '#16a34a', meaning: "Your payment has been verified. We're now preparing your order for dispatch." },
    processing:      { label: 'Processing',          emoji: '⚙️', bg: '#dbeafe', border: '#93c5fd', color: '#1d4ed8', meaning: 'Your order is currently being packed and prepared for shipment.' },
    shipped:         { label: 'Shipped',             emoji: '🚚', bg: '#fef3c7', border: '#facc15', color: '#d97706', meaning: 'Your order has left our facility and is on its way to you. Expect delivery within 3–7 business days.' },
    delivered:       { label: 'Delivered',           emoji: '🎉', bg: '#d1fae5', border: '#34d399', color: '#059669', meaning: 'Your order has been successfully delivered. We hope you love your purchase!' },
    cancelled:       { label: 'Cancelled',           emoji: '❌', bg: '#fee2e2', border: '#fca5a5', color: '#dc2626', meaning: "Your order has been cancelled. If you didn't request this, please contact us immediately." },
};

const fmt = (amount) =>
    new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 2 })
        .format(Number(amount) || 0);

export const orderStatusUpdateTemplate = (order) => {
    const meta        = STATUS_META[order.order_status] ?? STATUS_META.pending;
    const isCancelled = order.order_status === 'cancelled';

    const updatedOn = new Date().toLocaleDateString('en-LK', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

    const deliveryEstimate =
        ['shipped', 'processing'].includes(order.order_status) ? '3–7 business days from dispatch' :
        order.order_status === 'delivered'  ? 'Your order has been delivered' :
        order.order_status === 'cancelled'  ? 'N/A — order has been cancelled' :
        'Will be updated once your order ships';

    const detailRows = [
        ['Order Number',   `#${order.order_id}`,    false, false],
        ['Tracking Code',  order.tracking_code,      true,  false],
        ['Current Status', meta.label,               false, true ],
        ['Updated On',     updatedOn,                false, false],
        ['Order Total',    fmt(order.total_amount),  false, false],
    ].map(([label, value, mono, isStatus], i, arr) => `
        <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f9f9f9'};">
            <td style="padding:10px 16px;font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:#aaa;width:38%;${i < arr.length - 1 ? 'border-bottom:1px solid #f0f0f0;' : ''}">${label}</td>
            <td style="padding:10px 16px;font-family:${mono ? "'Courier New',monospace" : 'Arial,sans-serif'};font-size:13px;font-weight:600;color:${isStatus ? meta.color : label === 'Order Total' ? '#e53935' : '#111'};${i < arr.length - 1 ? 'border-bottom:1px solid #f0f0f0;' : ''}">${value ?? '—'}</td>
        </tr>
    `).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Order Status Update</title></head>
<body style="margin:0;padding:0;background:#f2f2f2;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f2;padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

    <!-- HEADER -->
    <tr>
        <td style="background:#111;border-radius:14px 14px 0 0;padding:28px 36px;text-align:center;">
            <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">Ozone Computers</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:0.1em;">Order Status Update</p>
        </td>
    </tr>

    <!-- STATUS HERO -->
    <tr>
        <td style="background:${meta.bg};border-left:2px solid ${meta.border};border-right:2px solid ${meta.border};padding:24px 36px;text-align:center;">
            <p style="margin:0 0 8px;font-size:34px;">${meta.emoji}</p>
            <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:20px;font-weight:900;color:${meta.color};">${meta.label}</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:${meta.color};line-height:1.7;">${meta.meaning}</p>
        </td>
    </tr>

    <!-- BODY -->
    <tr>
        <td style="background:#fff;padding:32px 36px 0;">

            <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:13px;color:#555;line-height:1.75;">
                Hi <strong style="color:#111;">${order.full_name}</strong>, the status of your order has been updated. Here is a summary below.
            </p>

            <!-- Order Details -->
            <p style="margin:0 0 10px;font-family:Arial,sans-serif;font-size:13px;font-weight:800;color:#111;border-bottom:2px solid #f0f0f0;padding-bottom:8px;">🧾 Order Details</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #ebebeb;border-radius:10px;overflow:hidden;margin-bottom:24px;">
                ${detailRows}
            </table>

            ${isCancelled ? `
            <!-- Cancelled Notice -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                    <td style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px 20px;">
                        <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:13px;font-weight:800;color:#dc2626;">❌ Order Cancelled</p>
                        <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#555;line-height:1.7;">Your order has been cancelled. If you believe this is a mistake or need assistance, please reply to this email. Any payment made will be reviewed for a refund.</p>
                    </td>
                </tr>
            </table>
            ` : ''}

            <!-- Tracking -->
            <p style="margin:0 0 10px;font-family:Arial,sans-serif;font-size:13px;font-weight:800;color:#111;border-bottom:2px solid #f0f0f0;padding-bottom:8px;">🚚 Tracking Information</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border:1px solid #ebebeb;border-radius:10px;overflow:hidden;margin-bottom:32px;">
                <tr>
                    <td style="padding:14px 18px;border-bottom:1px solid #f0f0f0;">
                        <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:0.07em;">Tracking Code</p>
                        <p style="margin:0;font-family:'Courier New',monospace;font-size:16px;font-weight:700;color:#111;letter-spacing:0.05em;">${order.tracking_code}</p>
                    </td>
                </tr>
                <tr>
                    <td style="padding:14px 18px;">
                        <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:0.07em;">Estimated Delivery</p>
                        <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;font-weight:600;color:#111;">${deliveryEstimate}</p>
                    </td>
                </tr>
            </table>

            <p style="margin:0 0 32px;font-family:Arial,sans-serif;font-size:12px;color:#aaa;text-align:center;line-height:1.7;">Questions about your order? Reply to this email and we'll be happy to help.</p>
        </td>
    </tr>

    <!-- FOOTER -->
    <tr>
        <td style="background:#ebebeb;border-radius:0 0 14px 14px;padding:18px 36px;text-align:center;border-top:1px solid #ddd;">
            <p style="margin:0 0 3px;font-family:Arial,sans-serif;font-size:11px;color:#999;">© ${new Date().getFullYear()} Ozone Computers · All rights reserved</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#bbb;">You received this email because you have an active order with us.</p>
        </td>
    </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
};