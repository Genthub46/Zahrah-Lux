import { Order, CartItem } from '../types';

// Base layout wrapper to ensure consistent urban premium styling across all emails
const baseTemplate = (content: string, preheader: string = '') => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ZAHRAH LUXURY</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap');
        body {
            margin: 0;
            padding: 0;
            background-color: #f8f8f8;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #111111;
            -webkit-font-smoothing: antialiased;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            padding: 40px 20px;
            text-align: center;
            border-bottom: 1px solid #eeeeee;
        }
        .logo {
            font-size: 24px;
            font-weight: 800;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: #111111;
            text-decoration: none;
            margin: 0;
        }
        .content {
            padding: 40px 30px;
        }
        .footer {
            padding: 40px 30px;
            background-color: #111111;
            color: #888888;
            text-align: center;
            font-size: 11px;
            letter-spacing: 0.05em;
        }
        h1, h2, h3 {
            margin: 0 0 20px 0;
            font-weight: 600;
            letter-spacing: 0.02em;
        }
        p {
            margin: 0 0 20px 0;
            font-size: 14px;
            line-height: 1.6;
            color: #444444;
        }
        .btn {
            display: inline-block;
            padding: 16px 32px;
            background-color: #111111;
            color: #ffffff !important;
            text-decoration: none;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            margin-top: 20px;
            margin-bottom: 20px;
        }
        .btn-gold {
            background-color: #C5A059;
            color: #ffffff !important;
        }
        .divider {
            height: 1px;
            background-color: #eeeeee;
            margin: 30px 0;
        }
        .item-row {
            display: flex;
            align-items: center;
            padding: 15px 0;
            border-bottom: 1px solid #eeeeee;
        }
    </style>
</head>
<body>
    <span style="display:none !important; visibility:hidden; mso-hide:all; font-size:1px; color:#ffffff; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
        ${preheader}
    </span>
    <div class="container">
        <div class="header">
            <a href="https://zahrahluxury.com" class="logo">ZAHRAH</a>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p style="color: #888888; margin-bottom: 10px;">ZAHRAH LUXURY COLLECTIONS</p>
            <p style="color: #666666; font-size: 10px;">This email was sent to you because you are subscribed to Zahrah Luxury updates or recently made a transaction.</p>
        </div>
    </div>
</body>
</html>
`;

export const getWelcomeEmailTemplate = (name: string) => {
    const content = `
        <h2 style="font-size: 20px; text-transform: uppercase;">Welcome to the Inner Circle.</h2>
        <p>Hi ${name},</p>
        <p>Your account has been created. You now have exclusive access to our latest drops, curated collections, and seamless checkout experiences.</p>
        <p>Urban luxury, redefined.</p>
        <a href="https://zahrahluxury.com/shop" class="btn">Explore the Collection</a>
    `;
    return baseTemplate(content, "Welcome to Zahrah Luxury.");
};

export const getPasswordRecoveryTemplate = (resetLink: string) => {
    const content = `
        <h2 style="font-size: 20px; text-transform: uppercase;">Reset Your Access.</h2>
        <p>A request was made to reset the password for your Zahrah Luxury account.</p>
        <p>If you made this request, click the button below to set a new password. If you didn't, you can safely ignore this email.</p>
        <a href="${resetLink}" class="btn">Reset Password</a>
        <div class="divider"></div>
        <p style="font-size: 12px; color: #888888;">For security reasons, this link will expire in 24 hours.</p>
    `;
    return baseTemplate(content, "Reset your Zahrah Luxury account password.");
};

export const getOrderConfirmationTemplate = (order: Order, name: string) => {
    const itemsHtml = order.items.map((item: CartItem) => `
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px; border-bottom: 1px solid #eeeeee; padding-bottom: 15px;">
            <tr>
                <td width="80" valign="top">
                    <img src="${item.images?.[0] || 'https://via.placeholder.com/80'}" width="80" style="display: block; background: #f8f8f8;" alt="${item.name}">
                </td>
                <td valign="top" style="padding-left: 20px;">
                    <p style="margin: 0 0 5px 0; font-weight: 600; font-size: 14px;">${item.name}</p>
                    <p style="margin: 0 0 5px 0; font-size: 12px; color: #888888;">
                        ${item.selectedColor ? `Color: ${item.selectedColor}` : ''}
                        ${item.selectedSize ? ` | Size: ${item.selectedSize}` : ''}
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #444444;">Qty: ${item.quantity} x ₦${item.price.toLocaleString()}</p>
                </td>
                <td valign="top" align="right">
                    <p style="margin: 0; font-weight: 600; font-size: 14px;">₦${(item.price * item.quantity).toLocaleString()}</p>
                </td>
            </tr>
        </table>
    `).join('');

    const content = `
        <h2 style="font-size: 20px; text-transform: uppercase; color: #111111;">Order Confirmed.</h2>
        <p>Thank you for your purchase, ${name}. Your order has been received and is currently being processed.</p>
        
        <div style="background-color: #f8f8f8; padding: 20px; margin: 30px 0;">
            <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #888888; margin-bottom: 10px;">Order Reference</h3>
            <p style="font-size: 16px; font-weight: 600; margin: 0;">${order.paymentReference || order.id}</p>
        </div>

        <h3 style="font-size: 14px; text-transform: uppercase; margin-bottom: 20px;">Order Summary</h3>
        ${itemsHtml}
        
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
            <tr>
                <td align="right" style="padding-bottom: 10px;"><p style="margin: 0; font-size: 14px;">Total:</p></td>
                <td width="120" align="right" style="padding-bottom: 10px;"><p style="margin: 0; font-size: 16px; font-weight: 600;">₦${order.total.toLocaleString()}</p></td>
            </tr>
        </table>

        <div class="divider"></div>
        
        <h3 style="font-size: 14px; text-transform: uppercase; margin-bottom: 15px;">Shipping Details</h3>
        <p style="margin-bottom: 5px;">${order.customerName}</p>
        <p style="color: #666666;">${order.customerAddress}</p>
        
        <div style="margin-top: 40px; text-align: center;">
            <a href="https://zahrahluxury.com/account" class="btn">View Order Status</a>
        </div>
    `;
    return baseTemplate(content, `Your Zahrah Luxury order ${order.paymentReference || order.id} is confirmed.`);
};

export const getAbandonedCartTemplate = (name: string, checkoutLink: string = 'https://zahrahluxury.com/checkout') => {
    const content = `
        <h2 style="font-size: 20px; text-transform: uppercase;">You Left Something Behind.</h2>
        <p>Hi ${name || 'there'},</p>
        <p>We noticed you didn't complete your purchase. Your curated selections are still waiting for you in your cart.</p>
        <p>High-demand items sell out quickly. Secure your pieces before they are gone.</p>
        <a href="${checkoutLink}" class="btn">Complete Checkout</a>
    `;
    return baseTemplate(content, "Your curated pieces are waiting.");
};

export const getRestockAlertTemplate = (name: string, productName: string, productUrl: string) => {
    const content = `
        <h2 style="font-size: 20px; text-transform: uppercase; color: #C5A059;">Back in Stock.</h2>
        <p>Hi ${name},</p>
        <p>The wait is over. <strong>${productName}</strong> is now back in stock.</p>
        <p>Quantities are strictly limited. Secure yours now.</p>
        <a href="${productUrl}" class="btn btn-gold">Shop Now</a>
    `;
    return baseTemplate(content, `${productName} is back in stock.`);
};

export const getNewArrivalAlertTemplate = (name: string, collectionName: string, shopUrl: string) => {
    const content = `
        <h2 style="font-size: 20px; text-transform: uppercase;">New Drop: ${collectionName}</h2>
        <p>Hi ${name},</p>
        <p>Our latest collection has officially landed. Discover the new standard in urban luxury.</p>
        <p>Explore the new arrivals before anyone else.</p>
        <a href="${shopUrl}" class="btn">Explore the Drop</a>
    `;
    return baseTemplate(content, `The ${collectionName} drop is live.`);
};
