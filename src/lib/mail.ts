import nodemailer from "nodemailer";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // True for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"Raja Boot House Support" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  };

  console.log(`Sending email to ${to} using SMTP...`);
  const info = await transporter.sendMail(mailOptions);
  console.log("Email sent successfully: %s", info.messageId);
  return info;
}
