const nodemailer = require("nodemailer");

const getTransporter = () => {
  // If SMTP is not configured, log emails to console instead of failing
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[Email - SMTP not configured] To: ${to} | Subject: ${subject}`);
    return;
  }
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
};

const sendOrderConfirmation = async (order, userEmail) => {
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
    subject: `Zealc.ollection Order Confirmation - ${order.orderNumber}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
        <h1 style="letter-spacing:0.3em;font-size:24px;text-align:center;margin-bottom:24px;">Zealc.ollection</h1>
        <p style="color:#555;">Thank you for your order. Your reference number is <strong>${order.orderNumber}</strong>.</p>
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

module.exports = { sendEmail, sendOrderConfirmation, sendPasswordReset };
