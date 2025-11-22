// src/utils/emailService.js
const nodemailer = require("nodemailer");

// Create transporter - for development, we'll use a test account
// In production, configure with real SMTP credentials
const createTransporter = () => {
  // Check if SMTP is configured in environment variables
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // For development/testing, use Ethereal Email (fake SMTP service)
  // This will log the email URL to console instead of actually sending
  return nodemailer.createTransporter({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: process.env.ETHEREAL_USER || "ethereal.user@ethereal.email",
      pass: process.env.ETHEREAL_PASS || "ethereal.pass",
    },
  });
};

// Send verification email
const sendVerificationEmail = async (email, token, fullName) => {
  try {
    const transporter = createTransporter();
    
    // Create verification URL
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@blockchain-explorer.com",
      to: email,
      subject: "Verify Your Email - Blockchain Explorer",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #DC2626; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; background: #DC2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .token-box { background: #fff; border: 2px solid #DC2626; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; font-family: monospace; font-size: 18px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Email Verification</h1>
            </div>
            <div class="content">
              <p>Hello ${fullName || "there"},</p>
              <p>Thank you for registering with Blockchain Explorer! Please verify your email address to complete your registration.</p>
              
              <p><strong>Click the button below to verify your email:</strong></p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <p>Or copy and paste this verification token:</p>
              <div class="token-box">${token}</div>
              
              <p>Or visit this link directly:</p>
              <p style="word-break: break-all; color: #DC2626;">${verificationUrl}</p>
              
              <p><strong>This link will expire in 24 hours.</strong></p>
              
              <p>If you didn't create an account, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Blockchain Explorer. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Hello ${fullName || "there"},
        
        Thank you for registering with Blockchain Explorer! Please verify your email address to complete your registration.
        
        Verification Token: ${token}
        
        Or visit this link: ${verificationUrl}
        
        This link will expire in 24 hours.
        
        If you didn't create an account, please ignore this email.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
    // If using Ethereal, log the preview URL
    if (info.messageId && info.response && info.response.includes("ethereal")) {
      console.log("📧 Email sent! Preview URL:", nodemailer.getTestMessageUrl(info));
      console.log("📧 Verification Token:", token);
      console.log("📧 Verification URL:", verificationUrl);
    } else {
      console.log("✅ Verification email sent to:", email);
    }
    
    return { success: true, messageId: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) };
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
    
    // In development, still return success but log the token
    if (process.env.NODE_ENV !== "production") {
      console.log("⚠️ Email sending failed, but in development mode.");
      console.log("📧 Verification Token for", email, ":", token);
      console.log("📧 Verification URL:", `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${token}`);
      return { success: true, error: error.message, token }; // Return token for development
    }
    
    throw error;
  }
};

// Send resend verification email
const sendResendVerificationEmail = async (email, token, fullName) => {
  return sendVerificationEmail(email, token, fullName);
};

module.exports = {
  sendVerificationEmail,
  sendResendVerificationEmail,
};

