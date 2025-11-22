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

// Send account deletion verification code
const sendDeleteAccountCode = async (email, code, fullName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@blockchain-explorer.com",
      to: email,
      subject: "Account Deletion Verification Code - Blockchain Explorer",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #DC2626; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
            .code-box { background: #fff; border: 3px solid #DC2626; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #DC2626; }
            .warning { background: #FEF2F2; border-left: 4px solid #DC2626; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Account Deletion Request</h1>
            </div>
            <div class="content">
              <p>Hello ${fullName || "there"},</p>
              <p>You have requested to delete your Blockchain Explorer account. To confirm this action, please use the verification code below:</p>
              
              <div class="code-box">${code}</div>
              
              <div class="warning">
                <p><strong>⚠️ Warning:</strong></p>
                <p>This action is <strong>irreversible</strong>. Once your account is deleted:</p>
                <ul>
                  <li>All your data will be permanently removed</li>
                  <li>All your wallets and token holdings will be deleted</li>
                  <li>All your transaction history will be lost</li>
                  <li>You will not be able to recover your account</li>
                </ul>
              </div>
              
              <p><strong>This code will expire in 15 minutes.</strong></p>
              
              <p>If you did not request this, please ignore this email and your account will remain safe.</p>
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
        
        You have requested to delete your Blockchain Explorer account. To confirm this action, please use the verification code below:
        
        Verification Code: ${code}
        
        ⚠️ WARNING: This action is IRREVERSIBLE. Once your account is deleted, all your data, wallets, and transaction history will be permanently removed.
        
        This code will expire in 15 minutes.
        
        If you did not request this, please ignore this email and your account will remain safe.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
    // If using Ethereal, log the preview URL
    if (info.messageId && info.response && info.response.includes("ethereal")) {
      console.log("📧 Delete account verification email sent! Preview URL:", nodemailer.getTestMessageUrl(info));
      console.log("📧 Verification Code:", code);
    } else {
      console.log("✅ Delete account verification code sent to:", email);
    }
    
    return { success: true, messageId: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) };
  } catch (error) {
    console.error("❌ Error sending delete account verification email:", error);
    
    // In development, still return success but log the code
    if (process.env.NODE_ENV !== "production") {
      console.log("⚠️ Email sending failed, but in development mode.");
      console.log("📧 Delete Account Verification Code for", email, ":", code);
      return { success: true, error: error.message, code }; // Return code for development
    }
    
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendResendVerificationEmail,
  sendDeleteAccountCode,
};

