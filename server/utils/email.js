const { Resend } = require("resend");

// Resend's HTTP API is used instead of SMTP because Render's free tier
// blocks outbound SMTP ports (25/465/587) at the network level, which
// causes ETIMEDOUT regardless of which SMTP provider is configured.
// The HTTP API only needs outbound HTTPS (port 443), which is never blocked.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const sendEmail = async ({ to, subject, html }) => {
  if (!resend) {
    const error = new Error(
      "Email service is not configured. Set RESEND_API_KEY and EMAIL_FROM."
    );
    error.code = "SMTP_NOT_CONFIGURED";
    throw error;
  }

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });

  if (error) {
    const err = new Error(error.message || "Resend API error");
    // Preserve a recognizable code so existing route error-handling
    // (e.g. EENVELOPE/EAUTH branches in admin.js) still applies sensibly.
    err.code = error.name === "validation_error" ? "EENVELOPE" : "EMAIL_PROVIDER_ERROR";
    throw err;
  }

  return data;
};

const sendOrderConfirmation = async (order, userEmail) => {
  const firstName = String(order.shipping?.name || "Customer")
    .trim()
    .split(/\s+/)[0] || "Customer";
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">$${item.price.toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  await sendEmail({
    to: userEmail,
    subject: `${firstName}, your Zealc.ollection order ${order.orderNumber} is confirmed`,
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
        <h1 style="letter-spacing:0.3em;font-size:24px;text-align:center;margin-bottom:24px;">Zealc.ollection</h1>
        <p style="color:#555;">Hello ${firstName}, thank you for your order. Your confirmation number is <strong>${order.orderNumber}</strong>.</p>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="text-align:left;">
              <th style="padding:8px;border-bottom:2px solid #1a1a1a;">Item</th>
              <th style="padding:8px;border-bottom:2px solid #1a1a1a;text-align:center;">Qty</th>
              <th style="padding:8px;border-bottom:2px solid #1a1a1a;text-align:right;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p style="text-align:right;font-size:18px;margin-top:16px;">Total: <strong>$${order.total.toFixed(2)}</strong></p>
        <p style="color:#888;font-size:12px;">If you have any questions, contact concierge@zealcollection.com</p>
      </div>
    `,
  });
};

const sendDeliveryOtp = async (order, userEmail, otp) => {
  const firstName = String(order.shipping?.name || "Customer")
    .trim()
    .split(/\s+/)[0] || "Customer";
  await sendEmail({
    to: userEmail,
    subject: `${firstName}, your Zealc.ollection delivery code`,
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
        <h1 style="letter-spacing:0.3em;font-size:24px;text-align:center;margin-bottom:24px;">Zealc.ollection</h1>
        <p>Hello ${firstName}, your order <strong>${order.orderNumber}</strong> is out for delivery.</p>
        <p style="margin:28px 0;text-align:center;font-size:34px;letter-spacing:0.35em;"><strong>${otp}</strong></p>
        <p style="color:#555;">Give this six-digit code to the delivery person when you receive your package. It expires in 24 hours.</p>
        <p style="color:#888;font-size:12px;">Do not share this code before you have received your order.</p>
      </div>
    `,
  });
};

const sendPasswordReset = async (userEmail, resetUrl) => {
  await sendEmail({
    to: userEmail,
    subject: "Zealc.ollection - Password Reset Request",
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
        <h1 style="letter-spacing:0.3em;font-size:24px;text-align:center;margin-bottom:24px;">Zealc.ollection</h1>
        <p>A password reset was requested for this email address.</p>
        <p style="margin:24px 0;"><a href="${resetUrl}" style="display:inline-block;padding:12px 28px;background:#1a1a1a;color:#fff;text-decoration:none;letter-spacing:0.2em;font-size:12px;text-transform:uppercase;">Reset Password</a></p>
        <p style="color:#888;font-size:12px;">This link expires in 30 minutes. If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { sendEmail, sendOrderConfirmation, sendDeliveryOtp, sendPasswordReset };