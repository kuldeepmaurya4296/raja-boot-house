import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465", 10);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || SMTP_USER || "care@rajaboothouse.com";

// Setup transporter
function getTransporter() {
  if (!SMTP_USER || !SMTP_PASS) {
    console.warn("SMTP configuration is missing. Emails will not be sent.");
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

/**
 * Sends a welcome email to a new subscriber
 */
export async function sendWelcomeEmail(toEmail: string, name: string) {
  const transporter = getTransporter();
  if (!transporter) return false;

  const mailOptions = {
    from: `"Raja Boot House" <${SUPPORT_EMAIL}>`,
    to: toEmail,
    subject: "Welcome to Raja Footwear Club — Raja Boot House",
    html: `
      <div style="font-family: 'Georgia', 'Times New Roman', serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #E4E4E7; background-color: #FAF9F6; color: #1C1917;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="font-size: 28px; margin: 0; color: #1C1917; letter-spacing: 0.05em; text-transform: uppercase;">Raja Boot House</h2>
          <p style="font-size: 10px; text-transform: uppercase; tracking-spacing: 0.2em; color: #8C6D58; margin-top: 5px; font-weight: bold;">Handcrafted Footwear & Premium Brands since 1972</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #E4E4E7; margin-bottom: 35px;" />
        
        <p style="font-size: 15px; line-height: 1.6; color: #27272A;">Dear ${name},</p>
        <p style="font-size: 15px; line-height: 1.6; color: #27272A;">Thank you for subscribing to <strong>The Raja Footwear Club</strong>.</p>
        <p style="font-size: 15px; line-height: 1.6; color: #27272A;">We are delighted to welcome you. We look forward to sharing our latest footwear collections, updates on local craftsmanship, and exclusive festive discount alerts directly from Gorakhpur's premium footwear house.</p>
        
        <div style="margin: 40px 0; text-align: center;">
          <a href="${process.env.NEXTAUTH_URL || "https://rajaboothouse.com"}/shop" style="background-color: #1C1917; color: #FAF9F6; text-decoration: none; padding: 12px 28px; border-radius: 20px; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; display: inline-block;">
            Explore The Catalog
          </a>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #27272A;">As a thank you, keep an eye out for our exclusive upcoming drops and special member-only offers.</p>
        
        <hr style="border: 0; border-top: 1px solid #E4E4E7; margin: 35px 0 20px 0;" />
        <div style="text-align: center; font-size: 11px; color: #71717A;">
          <p style="margin: 0 0 5px 0;">Raja Boot House, Main Footwear Market, Gorakhpur, UP, India</p>
          <p style="margin: 0;">You received this email because you subscribed to our newsletter on our website.</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return false;
  }
}

/**
 * Sends a general newsletter blast email to a subscriber
 */
export async function sendNewsletterEmail(toEmail: string, subject: string, htmlContent: string) {
  const transporter = getTransporter();
  if (!transporter) return false;

  const mailOptions = {
    from: `"Raja Boot House" <${SUPPORT_EMAIL}>`,
    to: toEmail,
    subject: subject,
    html: `
      <div style="font-family: 'Georgia', 'Times New Roman', serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #E4E4E7; background-color: #FAF9F6; color: #1C1917;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="font-size: 28px; margin: 0; color: #1C1917; letter-spacing: 0.05em; text-transform: uppercase;">Raja Boot House</h2>
          <p style="font-size: 10px; text-transform: uppercase; tracking-spacing: 0.2em; color: #8C6D58; margin-top: 5px; font-weight: bold;">Artisan Craftsmanship & Premium Brands</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #E4E4E7; margin-bottom: 35px;" />
        
        <div style="font-size: 15px; line-height: 1.6; color: #27272A; text-align: left;">
          ${htmlContent}
        </div>
        
        <hr style="border: 0; border-top: 1px solid #E4E4E7; margin: 35px 0 20px 0;" />
        <div style="text-align: center; font-size: 11px; color: #71717A;">
          <p style="margin: 0 0 5px 0;">Raja Boot House, Main Footwear Market, Gorakhpur, UP, India</p>
          <p style="margin: 0;">If you wish to unsubscribe, please contact us at ${SUPPORT_EMAIL}</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(`Failed to send newsletter email to ${toEmail}:`, error);
    return false;
  }
}
