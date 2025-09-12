import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  // Validate email configuration
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email configuration is incomplete. Please check EMAIL_HOST, EMAIL_USER, and EMAIL_PASS in .env file.');
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.NODE_ENV=="production" ? 587 : 465,
    secure: process.env.NODE_ENV=="production",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (email, username, resetToken) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password Reset - OG Merchandise',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #dc2626; margin: 0; font-size: 28px;">OG Merchandise</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Password Reset Request</p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6;">Hello <strong>${username}</strong>,</p>
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password. Use the token below to reset your password:
              </p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
              <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">Your Reset Token:</p>
              <div style="font-size: 32px; font-weight: bold; color: #dc2626; letter-spacing: 4px; font-family: monospace;">
                ${resetToken}
              </div>
              <p style="color: #666; margin: 10px 0 0 0; font-size: 12px;">This token will expire in 15 minutes</p>
            </div>
            
            <div style="margin: 30px 0;">
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Copy this token and paste it in the password reset form on our website.
              </p>
              <p style="color: #666; font-size: 14px; line-height: 1.6;">
                If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
              </p>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © 2025 OG Merchandise. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};