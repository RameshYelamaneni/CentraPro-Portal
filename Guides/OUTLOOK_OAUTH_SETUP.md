# Outlook OAuth2 Integration - Setup Guide

## Overview
This guide will help you set up Microsoft Outlook OAuth2 authentication for fetching inbox emails.

## Step 1: Register Azure Application

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Azure Active Directory" → "App registrations" → "New registration"
3. Fill in the form:
   - **Name**: CentraPro Email Manager
   - **Supported account types**: Accounts in any organizational directory (Any Azure AD directory - Multitenant)
   - **Redirect URI**: Web - `http://localhost:4000/api/auth/outlook/callback`
4. Click "Register"

## Step 2: Get Credentials

1. From the app page, copy the **Application (client) ID**
2. Go to "Certificates & secrets" → "Client secrets" → "New client secret"
3. Create a secret (set expiry to 24 months)
4. Copy the secret value (you won't see it again)

## Step 3: Configure API Permissions

1. Go to "API permissions"
2. Click "Add a permission" → "Microsoft Graph" → "Delegated permissions"
3. Search and select:
   - `Mail.Read`
   - `Mail.ReadWrite`
4. Click "Grant admin consent"

## Step 4: Update Environment Variables

Create or update `.env` in the server directory:

```env
OUTLOOK_CLIENT_ID=your-client-id-here
OUTLOOK_CLIENT_SECRET=your-client-secret-here
OUTLOOK_REDIRECT_URI=http://localhost:4000/api/auth/outlook/callback
```

## Step 5: Install Dependencies

```bash
cd server
npm install axios dotenv
```

## Step 6: Start Application

```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd client
npm run dev
```

## Step 7: Test OAuth Flow

1. Navigate to `http://localhost:5173/email-management`
2. Click "Authorize Outlook"
3. Login with your Microsoft account
4. Grant permissions when prompted
5. You'll be redirected back with your inbox loaded

## Troubleshooting

### "Invalid client" Error
- Verify Client ID and Secret are correct
- Check they're in the `.env` file in the server directory

### "Redirect URI mismatch"
- Ensure `OUTLOOK_REDIRECT_URI` matches exactly in:
  - Azure Portal app registration
  - `.env` file
  - server code

### "Insufficient privileges"
- Go back to Azure Portal
- Check "API permissions" has Mail.Read permission
- Click "Grant admin consent"

### Token Expired Error
- Token automatically refreshes using refresh token
- Check browser console for detailed error

## API Endpoints

### GET /api/auth/outlook
Returns OAuth authorization URL

### GET /api/auth/outlook/callback
Handles OAuth callback (automatic redirect)

### GET /api/email/inbox
Fetches inbox emails (requires auth token)

**Response:**
```json
{
  "total": 20,
  "emails": [
    {
      "id": "email_id",
      "subject": "Email Subject",
      "from": "sender@example.com",
      "fromName": "Sender Name",
      "receivedDateTime": "2025-01-01T10:00:00Z",
      "bodyPreview": "Preview text...",
      "isRead": false,
      "hasAttachments": false,
      "importance": "normal"
    }
  ]
}
```

### GET /api/email/outlook-status
Check connection status

### POST /api/email/outlook-disconnect
Disconnect Outlook account

## Features

✅ OAuth2 authentication with Microsoft
✅ Automatic token refresh
✅ Fetch up to 20 latest emails
✅ Email preview, sender info, read status
✅ Secure token storage
✅ SMTP configuration management
✅ Connection testing

## Next Steps

- Implement sent emails fetching
- Add draft compose functionality
- Enable email search
- Implement folder navigation
- Add email reply/forward

---

**Status**: ✅ Ready for use
**Last Updated**: December 2025
