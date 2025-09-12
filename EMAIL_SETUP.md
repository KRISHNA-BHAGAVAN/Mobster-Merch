# Email Configuration Setup

## Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Copy the 16-character password

3. **Update .env file**:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-char-app-password
EMAIL_FROM=OG Merchandise <your-gmail@gmail.com>
```

## Other Email Providers

### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

### Yahoo
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

## Testing Email Setup

Run the test script to verify email configuration:
```bash
cd backend
node test-email.js
```

## Password Reset Workflow

1. **User enters username** (not email) on forgot password form
2. **System looks up email** from database using username
3. **6-digit token generated** and stored in Redis (15 min expiry)
4. **Email sent** to user's registered email with token
5. **User enters token** from email
6. **User sets new password** with confirmation
7. **Password updated** and token deleted

## Security Features

- Username-based lookup (email not exposed)
- 6-digit numeric tokens
- 15-minute token expiration
- Password confirmation required
- Secure email templates
- No sensitive data in URLs