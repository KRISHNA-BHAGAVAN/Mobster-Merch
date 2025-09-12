import dotenv from 'dotenv';
import { sendPasswordResetEmail } from './utils/emailService.js';

// Load environment variables
dotenv.config();

// Test email sending
async function testEmail() {
  try {
    console.log('Testing email service...');
    console.log('Email config:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER,
      from: process.env.EMAIL_FROM
    });
    
    const result = await sendPasswordResetEmail(
      'test@example.com', 
      'TestUser', 
      '123456'
    );
    
    console.log('Email sent successfully:', result);
  } catch (error) {
    console.error('Email test failed:', error.message);
  }
}

testEmail();