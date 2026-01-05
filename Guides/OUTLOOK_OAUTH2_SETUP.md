# Outlook OAuth2 Email Integration - Setup Guide

## Overview
This guide walks through setting up Outlook/Microsoft 365 OAuth2 authentication to fetch inbox emails in the CentraPro portal.

---

## ✅ Prerequisites

- ✅ Node.js + npm installed
- ✅ Azure AD account (free tier available)
- ✅ CentraPro application running locally
- ✅ Internet connection for OAuth callback

---

## 📋 Step 1: Register Application in Azure AD

### 1.1 Go to Azure Portal
1. Navigate to https://portal.azure.com
2. Sign in with your Microsoft account
3. Search for "App registrations"
4. Click **"New registration"**

### 1.2 Configure Application
- **Name**: `CentraPro Email Integration`
- **Supported account types**: `Accounts in any organizational directory (Any Azure AD directory - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)`
- **Redirect URI**: 
  - Platform: Web
  - URI: `http://localhost:4000/api/auth/outlook/callback`
- Click **"Register"**

### 1.3 Get Credentials
1. Copy **Application (client) ID** → Save as `OUTLOOK_CLIENT_ID`
2. Go to **"Certificates & secrets"**
3. Click **"New client secret"**
4. Description: `CentraPro Development`
5. Copy **Value** → Save as `OUTLOOK_CLIENT_SECRET`

### 1.4 Configure API Permissions
1. Go to **"API permissions"**
2. Click **"Add a permission"**
3. Select **"Microsoft Graph"**
4. Select **"Delegated permissions"**
5. Search and add:
   - `Mail.Read` - Read mail in all mailboxes
   - `Mail.ReadWrite` - Read and write mail
   - `offline_access` - Maintain access to data
6. Click **"Grant admin consent"**

---

## 🔧 Step 2: Update Environment Variables

### 2.1 Create or Update `.env` File

```bash
# server/.env
OUTLOOK_CLIENT_ID=your-client-id-from-step-1.3
OUTLOOK_CLIENT_SECRET=your-client-secret-from-step-1.3
OUTLOOK_REDIRECT_URI=http://localhost:4000/api/auth/outlook/callback

JWT_SECRET=dev_secret_please_change
PORT=4000
```

### 2.2 Load Environment Variables
```bash
cd server
npm install dotenv  # if not already installed
```

---

## 📦 Step 3: Install Dependencies

```bash
# Backend
cd server
npm install axios

# Frontend (already included in existing setup)
cd ../client
npm install
```

---

## 🚀 Step 4: Start Application

### Terminal 1 - Backend
```bash
cd server
npm start
# Should see: Server running on http://localhost:4000
```

### Terminal 2 - Frontend
```bash
cd client
npm run dev
# Should see: Local: http://localhost:5173
```

---

## 🔐 Step 5: Test OAuth2 Flow

### 5.1 Navigate to Email Management
1. Open http://localhost:5173
2. Login with: `admin@example.com` / `Password123`
3. Click **"Email Management"** in sidebar

### 5.2 Authorize Outlook
1. Click **"Authorize Outlook"** button
2. You'll be redirected to Microsoft login page
3. Sign in with your Microsoft/Outlook account
4. Grant permission to CentraPro
5. You'll be redirected back to the app

### 5.3 Fetch Inbox
1. After authorization, click **"Refresh Inbox"**
2. Wait for emails to load (should see ~20 most recent emails)
3. Verify emails display with:
   - From address
   - Subject line
   - Preview text
   - Received date
   - Read status

---

## 🧪 Testing Scenarios

### Scenario 1: Complete OAuth Flow
```
✓ Click "Authorize Outlook"
✓ Redirected to Microsoft login
✓ Successfully authenticated
✓ Redirected back with success message
✓ Status shows "Connected"
```

### Scenario 2: Fetch Inbox Emails
```
✓ Click "Refresh Inbox"
✓ Loading indicator appears
✓ Success message: "Loaded X emails"
✓ Table populates with emails
✓ Email count matches count shown
```

### Scenario 3: Disconnect Account
```
✓ Click "Disconnect" button
✓ Status changes to "Not Connected"
✓ Inbox emails cleared
✓ Success message displayed
```

### Scenario 4: Reconnect After Disconnect
```
✓ After disconnect, "Authorize Outlook" button reappears
✓ Can authorize again
✓ Successfully fetches emails again
```

### Scenario 5: Error Handling
```
✓ Invalid credentials show error
✓ Network errors handled gracefully
✓ Expired tokens automatically refreshed
✓ User-friendly error messages
```

---

## 🔗 API Endpoints Reference

### Outlook OAuth2 Endpoints

**GET /api/auth/outlook**
- Purpose: Get OAuth authorization URL
- Returns: `{ authUrl: "https://login.microsoftonline.com/..." }`
- Public (no auth required)

**GET /api/auth/outlook/callback**
- Purpose: Handle OAuth callback from Microsoft
- Params: `code`, `state`
- Protected: Redirects to frontend after success

**GET /api/email/inbox**
- Purpose: Fetch user's inbox emails
- Returns: 
  ```json
  {
    "total": 20,
    "emails": [
      {
        "id": "outlook-email-id",
        "subject": "Email subject",
        "from": "sender@example.com",
        "receivedDateTime": "2024-12-03T10:30:00Z",
        "bodyPreview": "Email preview text...",
        "isRead": false,
        "hasAttachments": true
      }
    ]
  }
  ```
- Protected: JWT authentication required

**GET /api/email/outlook-status**
- Purpose: Check if user is connected to Outlook
- Returns: `{ connected: true, expiresAt: "2024-12-03T20:30:00Z" }`
- Protected: JWT authentication required

**POST /api/email/outlook-disconnect**
- Purpose: Disconnect Outlook account
- Returns: `{ message: "...", connected: false }`
- Protected: JWT authentication required

---

## 🐛 Troubleshooting

### Issue: "Invalid Client ID" Error
**Solution:**
1. Verify `OUTLOOK_CLIENT_ID` in `.env` matches Azure AD registration
2. Check for typos or extra spaces
3. Restart backend server after updating `.env`

### Issue: "Redirect URI Mismatch"
**Solution:**
1. In Azure AD, verify redirect URI exactly matches:
   `http://localhost:4000/api/auth/outlook/callback`
2. Check for trailing slashes or protocol mismatches
3. Cannot use `https` with localhost - use `http` for development

### Issue: "Permission Denied" or "AADSTS65001"
**Solution:**
1. Go to Azure AD > API permissions
2. Click "Grant admin consent for [Org Name]"
3. Confirm the consent action
4. Try authorization again

### Issue: Emails Not Loading
**Solution:**
1. Verify you clicked "Authorize Outlook" first
2. Check browser console for errors (F12)
3. Verify token is valid (check expiresAt timestamp)
4. Check network tab - see if API request succeeds

### Issue: "Token Expired" Message
**Solution:**
1. This is automatic and handled by backend
2. Background token refresh happens automatically
3. If refresh fails, click "Disconnect" then "Authorize Outlook" again

### Issue: CORS Errors
**Solution:**
1. Ensure backend is running on http://localhost:4000
2. Verify frontend is running on http://localhost:5173
3. Check that API_BASE in frontend code uses correct URL
4. Restart both frontend and backend

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│           CentraPro Frontend (React)                    │
│  - Email Management Component                           │
│  - Shows inbox emails in table                          │
│  - OAuth button for authorization                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTP Requests
                     ↓
┌─────────────────────────────────────────────────────────┐
│        CentraPro Backend (Express.js)                   │
│  - OAuth2 flow handling                                 │
│  - Token storage & refresh                              │
│  - Microsoft Graph API integration                      │
└────────────┬────────────────────────────────┬───────────┘
             │                                │
             │ OAuth2 Flow                    │ Microsoft Graph API
             ↓                                ↓
    ┌─────────────────────┐        ┌──────────────────────┐
    │  Microsoft Azure AD │        │ Microsoft Graph      │
    │  - Authorization    │        │ - Mail API           │
    │  - Token Exchange   │        │ - Inbox Endpoint     │
    └─────────────────────┘        └──────────────────────┘
```

---

## 🔒 Security Best Practices

### ✅ Implemented
- Token stored server-side only (not in localStorage)
- Automatic token refresh before expiry
- HTTPS recommended for production
- Environment variables for secrets
- JWT authentication on all endpoints

### ⚠️ For Production
- Use HTTPS for all redirects
- Store tokens in secure database
- Implement token revocation
- Add rate limiting on OAuth endpoints
- Use httpOnly cookies for token storage
- Implement PKCE for additional security

---

## 📈 Next Steps

### Phase 2: Enhanced Features
1. **Email Search**
   - Search by subject, sender, date range
   - Filter by folder (Inbox, Sent, Drafts)

2. **Email Composition**
   - Send emails from CentraPro
   - Draft saving

3. **Attachment Handling**
   - Download email attachments
   - Upload and attach files

4. **Folder Management**
   - View other folders (Sent, Drafts, Archive)
   - Create custom folders

5. **Multi-Account Support**
   - Connect multiple Outlook accounts
   - Switch between accounts

6. **Email Sync**
   - Background sync every N minutes
   - Notification on new emails
   - Email threading

---

## 📞 Support

### Common Issues
- See **Troubleshooting** section above
- Check browser console (F12 → Console tab)
- Check backend logs (terminal where server runs)
- Verify network requests (F12 → Network tab)

### Additional Resources
- [Microsoft Graph Mail API Docs](https://learn.microsoft.com/en-us/graph/api/resources/message)
- [OAuth2 Authorization Code Flow](https://learn.microsoft.com/en-us/graph/auth-v2-authorization-code-flow)
- [Azure AD Documentation](https://learn.microsoft.com/en-us/azure/active-directory/)

---

**Setup Date:** December 3, 2025  
**Version:** 1.0  
**Status:** ✅ Complete
