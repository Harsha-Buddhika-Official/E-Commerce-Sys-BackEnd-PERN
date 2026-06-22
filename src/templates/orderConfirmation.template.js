const fmt = (amount) =>
    new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 2 })
        .format(Number(amount) || 0);

const itemRow = (item, i, arr) => `
    <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f9f9f9'};">
        <td style="padding:10px 16px;font-family:Arial,sans-serif;font-size:13px;font-weight:600;color:#111;${i < arr.length - 1 ? 'border-bottom:1px solid #f0f0f0;' : ''}">
            ${item.product_name}
            ${item.brand_name || item.category_name
                ? `<br/><span style="font-size:11px;color:#aaa;font-weight:500;">${[item.brand_name, item.category_name].filter(Boolean).join(' · ')}</span>`
                : ''}
        </td>
        <td style="padding:10px 16px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#111;text-align:center;white-space:nowrap;${i < arr.length - 1 ? 'border-bottom:1px solid #f0f0f0;' : ''}">${item.quantity}</td>
        <td style="padding:10px 16px;font-family:Arial,sans-serif;font-size:13px;font-weight:600;color:#555;text-align:right;white-space:nowrap;${i < arr.length - 1 ? 'border-bottom:1px solid #f0f0f0;' : ''}">${fmt(item.price_at_purchase)}</td>
        <td style="padding:10px 16px;font-family:Arial,sans-serif;font-size:13px;font-weight:800;color:#e53935;text-align:right;white-space:nowrap;${i < arr.length - 1 ? 'border-bottom:1px solid #f0f0f0;' : ''}">${fmt(Number(item.price_at_purchase) * item.quantity)}</td>
    </tr>
`;

export const orderConfirmationTemplate = (order) => {
    const items      = order.items ?? [];
    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const orderDate  = new Date().toLocaleDateString('en-LK', { year: 'numeric', month: 'long', day: 'numeric' });

    const detailRows = [
        ['Order Number',   `#${order.order_id}`,  false],
        ['Order Date',     orderDate,              false],
        ['Tracking Code',  order.tracking_code,   true ],
        ['Status',         'Pending Payment',      false],
    ].map(([label, value, mono], i, arr) => `
        <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f9f9f9'};">
            <td style="padding:10px 16px;font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:#aaa;width:38%;${i < arr.length - 1 ? 'border-bottom:1px solid #f0f0f0;' : ''}">${label}</td>
            <td style="padding:10px 16px;font-family:${mono ? "'Courier New',monospace" : 'Arial,sans-serif'};font-size:13px;font-weight:${label === 'Order Number' ? 800 : 600};color:${label === 'Status' ? '#ca8a04' : '#111'};${i < arr.length - 1 ? 'border-bottom:1px solid #f0f0f0;' : ''}">${value ?? '—'}</td>
        </tr>
    `).join('');

    const shippingRows = [
        ['Recipient',          order.full_name],
        ['Address',            order.shipping_address],
        ['City',               order.city],
        ['Postal Code',        order.postal_code],
        ['Phone',              order.phone_number],
        ['Estimated Delivery', '3–7 business days'],
    ].map(([label, value], i, arr) => `
        <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f9f9f9'};">
            <td style="padding:10px 16px;font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:#aaa;width:38%;${i < arr.length - 1 ? 'border-bottom:1px solid #f0f0f0;' : ''}">${label}</td>
            <td style="padding:10px 16px;font-family:Arial,sans-serif;font-size:13px;font-weight:600;color:#111;${i < arr.length - 1 ? 'border-bottom:1px solid #f0f0f0;' : ''}">${value ?? '—'}</td>
        </tr>
    `).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Order Confirmation</title></head>
<body style="margin:0;padding:0;background:#f2f2f2;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f2;padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

    <!-- HEADER -->
    <tr>
        <td style="background:#111;border-radius:14px 14px 0 0;padding:28px 36px;text-align:center;">
            <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">Ozone Computers</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:0.1em;">Order Confirmation</p>
        </td>
    </tr>

    <!-- GREETING -->
    <tr>
        <td style="background:#fff;padding:32px 36px 0;">
            <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:20px;font-weight:900;color:#111;">Thank you, ${order.full_name}! 🎉</p>
            <p style="margin:0 0 28px;font-family:Arial,sans-serif;font-size:13px;color:#555;line-height:1.75;">
                We've received your order and it is now pending payment verification. We'll notify you once your payment is confirmed.
            </p>

            <!-- Order Details -->
            <p style="margin:0 0 10px;font-family:Arial,sans-serif;font-size:13px;font-weight:800;color:#111;border-bottom:2px solid #f0f0f0;padding-bottom:8px;">🧾 Order Details</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #ebebeb;border-radius:10px;overflow:hidden;margin-bottom:24px;">
                ${detailRows}
            </table>

            <!-- Items Ordered -->
            <p style="margin:0 0 10px;font-family:Arial,sans-serif;font-size:13px;font-weight:800;color:#111;border-bottom:2px solid #f0f0f0;padding-bottom:8px;">📦 Items Ordered <span style="font-size:11px;font-weight:600;color:#aaa;">(${totalItems} item${totalItems !== 1 ? 's' : ''})</span></p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #ebebeb;border-radius:10px;overflow:hidden;margin-bottom:24px;">
                <tr style="background:#f9f9f9;">
                    <th style="padding:9px 16px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:0.07em;text-align:left;border-bottom:1px solid #ebebeb;">Product</th>
                    <th style="padding:9px 16px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:0.07em;text-align:center;border-bottom:1px solid #ebebeb;">Qty</th>
                    <th style="padding:9px 16px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:0.07em;text-align:right;border-bottom:1px solid #ebebeb;">Unit Price</th>
                    <th style="padding:9px 16px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:0.07em;text-align:right;border-bottom:1px solid #ebebeb;">Subtotal</th>
                </tr>
                ${items.map(itemRow).join('')}
            </table>

            <!-- Order Summary -->
            <p style="margin:0 0 10px;font-family:Arial,sans-serif;font-size:13px;font-weight:800;color:#111;border-bottom:2px solid #f0f0f0;padding-bottom:8px;">💰 Order Summary</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #ebebeb;border-radius:10px;overflow:hidden;margin-bottom:24px;">
                <tr style="background:#f9f9f9;">
                    <td style="padding:10px 16px;font-family:Arial,sans-serif;font-size:13px;font-weight:600;color:#555;border-bottom:1px solid #f0f0f0;">Subtotal (${totalItems} item${totalItems !== 1 ? 's' : ''})</td>
                    <td style="padding:10px 16px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#111;text-align:right;border-bottom:1px solid #f0f0f0;">${fmt(order.total_amount)}</td>
                </tr>
                <tr style="background:#f9f9f9;">
                    <td style="padding:10px 16px;font-family:Arial,sans-serif;font-size:13px;font-weight:600;color:#555;border-bottom:1px solid #f0f0f0;">Shipping</td>
                    <td style="padding:10px 16px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#16a34a;text-align:right;border-bottom:1px solid #f0f0f0;">Free</td>
                </tr>
                <tr style="background:#111;">
                    <td style="padding:14px 16px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#aaa;">Total Paid</td>
                    <td style="padding:14px 16px;font-family:Arial,sans-serif;font-size:18px;font-weight:900;color:#fff;text-align:right;letter-spacing:-0.5px;">${fmt(order.total_amount)}</td>
                </tr>
            </table>

            <!-- Shipping Details -->
            <p style="margin:0 0 10px;font-family:Arial,sans-serif;font-size:13px;font-weight:800;color:#111;border-bottom:2px solid #f0f0f0;padding-bottom:8px;">🚚 Shipping Details</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #ebebeb;border-radius:10px;overflow:hidden;margin-bottom:32px;">
                ${shippingRows}
            </table>

            <p style="margin:0 0 32px;font-family:Arial,sans-serif;font-size:12px;color:#aaa;text-align:center;line-height:1.7;">Questions about your order? Reply to this email and we'll be happy to help.</p>
        </td>
    </tr>

    <!-- FOOTER -->
    <tr>
        <td style="background:#ebebeb;border-radius:0 0 14px 14px;padding:18px 36px;text-align:center;border-top:1px solid #ddd;">
            <p style="margin:0 0 3px;font-family:Arial,sans-serif;font-size:11px;color:#999;">© ${new Date().getFullYear()} Ozone Computers · All rights reserved</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#bbb;">You received this email because you placed an order on our store.</p>
        </td>
    </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
};