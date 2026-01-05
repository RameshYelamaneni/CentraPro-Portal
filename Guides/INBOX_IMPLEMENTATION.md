# Inbox Email Fetching - Implementation Guide

## ✅ What Was Implemented

The Inbox now has **real IMAP email fetching** capability!

### Features Added:
1. **IMAP Connection** - Connects to your email server to fetch emails
2. **Email Parsing** - Parses email headers, body, and attachments
3. **Automatic Fetching** - Fetches up to 50 most recent emails
4. **Full Email Display** - Shows from, to, subject, body, date, attachments

---

## 📋 How It Works

### Backend Implementation:
1. **IMAP Library**: Uses `imap` and `mailparser` packages
2. **Connection**: Connects to IMAP server (outlook.office365.com:993)
3. **Fetching**: Retrieves last 50 emails from INBOX folder
4. **Parsing**: Converts raw email data to structured format
5. **Response**: Returns emails sorted by date (newest first)

### What Gets Fetched:
- **From**: Sender email address and name
- **To**: Recipient email address
- **Subject**: Email subject line
- **Body**: HTML or plain text content
- **Date**: When the email was sent
- **Attachments**: File information (filename, type, size)
- **Status**: Read/Unread (currently all marked as unread)

---

## 🔧 Configuration Requirements

### For Office 365 (Outlook):

#### 1. Enable IMAP in Email Account
**Via Web:**
1. Go to https://outlook.office365.com
2. Click **Settings** (gear icon) → **View all Outlook settings**
3. Go to **Mail** → **Sync email**
4. Under **POP and IMAP**, enable **"Let devices and apps use IMAP"**
5. Click **Save**

**Via Admin Center (for organization):**
1. Go to https://admin.microsoft.com
2. Navigate to **Users** → **Active users**
3. Select the user → **Mail** tab
4. Under **Email apps**, enable **IMAP**

#### 2. Configure Inbox in CentraPro
1. Go to **Email Management** → **SMTP Accounts** tab
2. Find **"Inbox / IMAP"** card
3. Click **"Edit"**
4. Enter settings:
   - **Host**: `outlook.office365.com`
   - **Port**: `993`
   - **Secure**: `true` (SSL)
   - **Email**: Your Office 365 email
   - **Password**: Your email password
5. Click **"Test Connection"** → Should see green checkmark
6. Click **"Save Configuration"**

#### 3. Test Inbox
1. Go to **Inbox** tab (first tab)
2. Click **Refresh** button or reload page
3. Your emails should now appear!

---

## 🔐 Security & Authentication

### Office 365 Requirements:
- **IMAP must be enabled** (see above)
- **SMTP AUTH must be enabled** (see EMAIL_SMTP_SETUP_GUIDE.md)
- **Modern Authentication** may need to be disabled for IMAP access
- **App passwords** recommended for accounts with 2FA

### For Gmail:
1. Enable IMAP in Gmail settings
2. Use App Password (not regular password) if 2FA is enabled
3. Settings:
   - Host: `imap.gmail.com`
   - Port: `993`
   - Secure: `true`

---

## 🎯 How to Use the Inbox

### View Emails:
1. Navigate to **Email Management**
2. Click **Inbox** tab (first tab with envelope icon)
3. Emails will load automatically
4. Click **"View"** button to see full email content

### Email Information Displayed:
| Column | Description |
|--------|-------------|
| From | Sender's email address |
| Subject | Email subject line |
| Purpose | inbox (received emails) |
| Received At | Date and time received |
| Status | Read/Unread indicator |
| Actions | View button to see full email |

### Search and Filter:
- Use the search bar to find specific emails
- Filter by purpose (shows "inbox" for received emails)
- Click Refresh icon to reload emails

---

## ⚙️ Technical Details

### API Endpoint:
```javascript
GET /api/email/inbox?limit=50
Authorization: Bearer {token}

Response:
{
  total: 25,
  emails: [
    {
      id: 1,
      from: "sender@example.com",
      to: "you@company.com",
      subject: "Meeting Tomorrow",
      body: "<html>...",
      sentAt: "2025-12-04T10:00:00Z",
      readStatus: false,
      purpose: "inbox",
      type: "received",
      attachments: [...]
    }
  ],
  message: "Fetched 25 emails from inbox"
}
```

### Query Parameters:
- `limit` - Number of emails to fetch (default: 50, max: 200)

### IMAP Connection Settings:
```javascript
{
  user: "email@company.com",
  password: "password",
  host: "outlook.office365.com",
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
}
```

---

## 🐛 Troubleshooting

### Issue: "Inbox IMAP configuration not found"
**Solution:**
- Configure the Inbox account in SMTP Accounts tab
- Make sure email and password are filled in
- Test connection before saving

### Issue: "Failed to fetch inbox emails: Authentication failed"
**Solutions:**
1. Verify email and password are correct
2. Enable IMAP in your email account settings
3. For Office 365: Enable SMTP AUTH
4. For Gmail: Use App Password if 2FA enabled
5. Check if Modern Authentication is blocking legacy IMAP

### Issue: "Connection timeout"
**Solutions:**
1. Check firewall allows outbound port 993
2. Verify host name is correct
3. Try with different network/VPN

### Issue: No emails appear (empty inbox)
**Possible Causes:**
1. No emails in your INBOX folder
2. Emails are in other folders (Sent, Drafts, etc.)
3. IMAP is looking at wrong mailbox
4. Connection succeeded but no messages to fetch

**Check:**
- Log into webmail and verify emails exist
- Check console for error messages
- Verify fetch limit is high enough

### Issue: Emails showing HTML code instead of formatted text
**This is expected:**
- Emails are stored with HTML content
- The View Email dialog renders the HTML properly
- Use dangerouslySetInnerHTML to display formatted emails

---

## 📈 Performance Considerations

### Fetch Limits:
- **Default**: 50 emails per request
- **Recommended**: 20-100 emails for fast loading
- **Maximum**: 200 emails (can be slow)

### Caching:
Currently no caching implemented. Each page load fetches fresh emails from server.

**Future Enhancement:**
- Cache emails locally
- Only fetch new emails since last check
- Store emails in database

### Load Time:
- **Fast**: 1-3 seconds for 20-50 emails
- **Medium**: 3-5 seconds for 50-100 emails
- **Slow**: 5-10+ seconds for 100+ emails

---

## 🚀 Next Steps & Enhancements

### Immediate Improvements:
1. **Mark as Read**: Update readStatus when viewing email
2. **Delete Emails**: Add delete functionality
3. **Move to Folder**: Move emails to Sent, Trash, etc.
4. **Reply/Forward**: Add email reply functionality

### Advanced Features:
1. **Real-time Sync**: Periodically check for new emails
2. **Push Notifications**: Notify user of new emails
3. **Multiple Folders**: Browse Sent, Drafts, Spam folders
4. **Search**: Server-side email search
5. **Attachments Download**: Download email attachments
6. **Compose Reply**: Reply to inbox emails

### Database Integration:
Store fetched emails in database:
```sql
CREATE TABLE inbox_emails (
  id INT PRIMARY KEY,
  user_id INT,
  from_email VARCHAR(255),
  subject TEXT,
  body TEXT,
  received_at TIMESTAMP,
  read_status BOOLEAN,
  folder VARCHAR(50),
  attachments JSON
);
```

---

## 📊 Summary

### What Works Now:
✅ IMAP connection to email server  
✅ Fetch last 50 emails from INBOX  
✅ Display emails in Inbox tab  
✅ View full email content  
✅ Show attachments info  
✅ Sort by date (newest first)  

### What's Needed for Production:
- Enable IMAP in your email account
- Configure Inbox with correct credentials
- Test connection successfully
- Refresh Inbox tab to see emails

### Testing Checklist:
- [ ] Enable IMAP in email account
- [ ] Configure Inbox IMAP settings
- [ ] Test connection (green checkmark)
- [ ] Save configuration
- [ ] Go to Inbox tab
- [ ] Verify emails load
- [ ] Click View on an email
- [ ] Check email displays correctly

---

**Status**: ✅ Implemented and Ready to Test  
**Date**: December 4, 2025  
**Version**: 2.0 - IMAP Support Added
