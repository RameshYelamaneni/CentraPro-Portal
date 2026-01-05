# Email Management System - Complete Guide

## Overview

The Email Management System is a comprehensive email solution integrated into CentraPro that provides:

- **Multiple SMTP Configurations** for different purposes (Invoice, Notifications, HR, Support)
- **Compose & Send Emails** with rich text support
- **Draft Management** to save and edit emails before sending
- **Sent Email Tracking** with delivery status and analytics
- **Email Search** across all sent emails and drafts
- **Actual Email Sending** for invoices with professional HTML templates

---

## Features

### 1. Multiple SMTP Accounts ✅

Configure different email accounts for different purposes:

| Account | Purpose | From Address | Use Case |
|---------|---------|--------------|----------|
| **Invoice** | Billing & Invoicing | invoice@rightarc.com | Sending invoices to customers |
| **Notification** | System Alerts | notifications@rightarc.com | System notifications, reminders |
| **HR** | Human Resources | hr@rightarc.com | Onboarding, employee communications |
| **Support** | Customer Support | support@rightarc.com | Support tickets, customer inquiries |

### 2. Email Compose 📝

**Features:**
- Purpose selection (Invoice, Notification, HR, Support)
- To, CC, BCC fields
- Subject and body
- Save as draft or send immediately
- Attachment support (coming soon)

**Usage:**
1. Click **"Compose"** button
2. Select email purpose
3. Fill in recipient, subject, and body
4. **Send** or **Save as Draft**

### 3. Sent Emails 📤

**View sent emails with:**
- Recipient information
- Subject line
- Purpose/Type labels
- Sent timestamp
- Delivery status (Delivered/Failed)
- View full email content

**Filtering:**
- By purpose (Invoice, Notification, HR, Support)
- By type (invoice, custom, notification)
- Search by subject, recipient, or body content

### 4. Drafts 📝

**Draft Management:**
- Save incomplete emails
- Edit drafts anytime
- Send drafts when ready
- Delete unused drafts
- Auto-save last modified timestamp

### 5. Invoice Email Sending 💼

**NEW: Actual Invoice Sending**

When you send an invoice, the system now:
- Creates professional HTML email template
- Includes invoice details (customer, date, items, totals)
- Calculates tax (10%) and total automatically
- Sends via invoice@rightarc.com SMTP account
- Tracks sent email in Email Management
- Updates invoice status to "Sent"
- Creates audit log entry

**Invoice Email Template Includes:**
- Company branding header
- Invoice number and details
- Customer information
- Itemized services/products table
- Subtotal, tax, and total calculations
- Payment instructions
- Professional footer with contact info

### 6. Email Analytics 📊

**Statistics Dashboard:**
- Total sent emails count
- Emails by purpose (breakdown)
- Emails by type (breakdown)
- Delivery status metrics
- Recent activity feed

### 7. Search & Filter 🔍

**Search capabilities:**
- Search across sent emails and drafts
- Filter by purpose
- Filter by date range
- Full-text search in subject and body

---

## API Endpoints

### SMTP Configuration

#### Get All SMTP Configs
```http
GET /api/email/smtp-configs
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Invoice Email",
    "host": "smtp.office365.com",
    "port": 587,
    "secure": false,
    "auth": { "user": "invoice@rightarc.com", "pass": "********" },
    "from": { "name": "CentraPro Billing", "email": "invoice@rightarc.com" },
    "purpose": "Invoices and billing",
    "isConfigured": true
  }
]
```

#### Update SMTP Config
```http
PUT /api/email/smtp-configs/{purpose}
Authorization: Bearer {token}
Content-Type: application/json

{
  "host": "smtp.office365.com",
  "port": 587,
  "secure": false,
  "auth": { "user": "invoice@rightarc.com", "pass": "password" },
  "from": { "name": "CentraPro", "email": "invoice@rightarc.com" }
}
```

---

### Email Sending

#### Send Email
```http
POST /api/email/send
Authorization: Bearer {token}
Content-Type: application/json

{
  "to": "recipient@example.com",
  "cc": "cc@example.com",
  "bcc": "bcc@example.com",
  "subject": "Email Subject",
  "body": "<h1>HTML Body</h1>",
  "purpose": "notification"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "<message-id@server>",
  "sentEmail": {
    "id": 1,
    "type": "custom",
    "purpose": "notification",
    "from": "invoice@rightarc.com",
    "to": "recipient@example.com",
    "subject": "Email Subject",
    "body": "<h1>HTML Body</h1>",
    "sentAt": "2025-12-04T10:00:00Z",
    "sentBy": "admin@example.com",
    "messageId": "<message-id@server>",
    "status": "sent",
    "deliveryStatus": "delivered"
  }
}
```

#### Send Invoice Email
```http
POST /api/invoices/send
Authorization: Bearer {token}
Content-Type: application/json

{
  "invoice": {
    "id": 1,
    "invoiceNumber": "INV-2025-001",
    "customer": "Acme Corp",
    "date": "2025-12-04",
    "dueDate": "2026-01-03",
    "items": [
      {
        "description": "Consulting Services",
        "quantity": 10,
        "rate": 150
      }
    ]
  },
  "vendorEmail": "billing@acme.com",
  "message": "Thank you for your business!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invoice sent successfully to billing@acme.com",
  "messageId": "<message-id@server>",
  "sentEmail": {
    "id": 2,
    "type": "invoice",
    "purpose": "invoice",
    "invoice": { "..." }
  }
}
```

---

### Drafts Management

#### Get All Drafts
```http
GET /api/email/drafts
Authorization: Bearer {token}
```

#### Create Draft
```http
POST /api/email/drafts
Authorization: Bearer {token}
Content-Type: application/json

{
  "to": "recipient@example.com",
  "subject": "Draft Subject",
  "body": "Draft body",
  "purpose": "notification"
}
```

#### Update Draft
```http
PUT /api/email/drafts/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "to": "updated@example.com",
  "subject": "Updated Subject"
}
```

#### Send Draft
```http
POST /api/email/drafts/{id}/send
Authorization: Bearer {token}
```

#### Delete Draft
```http
DELETE /api/email/drafts/{id}
Authorization: Bearer {token}
```

---

### Sent Emails

#### Get Sent Emails
```http
GET /api/email/sent?purpose=invoice&search=acme
Authorization: Bearer {token}
```

**Query Parameters:**
- `type` - Filter by type (invoice, custom, notification)
- `purpose` - Filter by purpose (invoice, notification, hr, support)
- `search` - Search in subject and body
- `from` - Filter by sender
- `to` - Filter by recipient

#### Get Single Email
```http
GET /api/email/sent/{id}
Authorization: Bearer {token}
```

---

### Email Analytics

#### Get Email Statistics
```http
GET /api/email/stats?purpose=invoice&startDate=2025-01-01&endDate=2025-12-31
Authorization: Bearer {token}
```

**Response:**
```json
{
  "totalSent": 45,
  "byPurpose": {
    "invoice": 12,
    "notification": 20,
    "hr": 8,
    "support": 5
  },
  "byType": {
    "invoice": 12,
    "custom": 25,
    "onboarding": 8
  },
  "byStatus": {
    "delivered": 43,
    "failed": 2
  },
  "recentActivity": [
    {
      "id": 45,
      "to": "customer@example.com",
      "subject": "Invoice #2025-045",
      "sentAt": "2025-12-04T10:00:00Z",
      "purpose": "invoice",
      "type": "invoice"
    }
  ]
}
```

---

### Search

#### Search Emails
```http
GET /api/email/search?q=invoice&type=all
Authorization: Bearer {token}
```

**Query Parameters:**
- `q` - Search query (required)
- `type` - Search scope: `all`, `sent`, `drafts` (default: `all`)

**Response:**
```json
{
  "query": "invoice",
  "totalResults": 15,
  "results": {
    "sent": [ /* sent emails matching query */ ],
    "drafts": [ /* drafts matching query */ ]
  }
}
```

---

## Frontend Components

### EmailManagement Component

**Location:** `client/src/pages/EmailManagement.tsx`

**Features:**
- 3 tabs: Sent, Drafts, SMTP Accounts
- Compose email dialog
- View email dialog
- Draft editing
- Search and filter
- Statistics cards
- Refresh functionality

**Props:** None (uses authentication from localStorage)

**State Management:**
- `sentEmails` - Array of sent emails
- `drafts` - Array of draft emails
- `smtpConfigs` - Array of SMTP configurations
- `composeForm` - Current email being composed
- `selectedEmail` - Email being viewed
- `selectedDraft` - Draft being edited

---

## Testing Guide

### Test 1: Compose and Send Email

1. Navigate to **Email Management**
2. Click **"Compose"** button
3. Fill in:
   - Purpose: Notification
   - To: your-email@example.com
   - Subject: Test Email
   - Body: This is a test email
4. Click **"Send"**
5. Check:
   - ✅ Success message appears
   - ✅ Email appears in Sent tab
   - ✅ Email received in inbox

### Test 2: Save Draft

1. Click **"Compose"**
2. Fill in partial information
3. Click **"Save as Draft"**
4. Switch to **Drafts** tab
5. Verify draft is saved
6. Click **"Edit"** on draft
7. Complete and send

### Test 3: Send Invoice Email

1. Navigate to **Invoicing**
2. Create new invoice:
   - Customer: Test Corp
   - Items: Add services
3. Click **"Send"** action
4. Enter recipient email
5. Click **"Send Invoice"**
6. Check:
   - ✅ Invoice marked as "Sent"
   - ✅ Email appears in Email Management → Sent
   - ✅ Recipient receives professional invoice email
   - ✅ HTML template renders correctly
   - ✅ All invoice details included

### Test 4: Search Emails

1. Go to **Email Management**
2. Enter search query in search bar
3. Click **"Search"**
4. Verify results match query
5. Try filtering by purpose
6. Verify filtered results

### Test 5: Multiple SMTP Configs

1. Go to **SMTP Accounts** tab
2. View all 4 SMTP configurations
3. Verify each shows:
   - Name and purpose
   - Host and port
   - From email address
   - Active status
4. Test composing emails with different purposes
5. Verify correct SMTP account used

### Test 6: Email Analytics

1. Send emails with different purposes
2. Check statistics cards:
   - Total sent emails
   - Drafts count
   - SMTP accounts count
   - Delivered count
3. Verify numbers are accurate

---

## Configuration

### SMTP Setup

Edit `server/index.js` to configure SMTP accounts:

```javascript
let smtpConfigs = {
  invoice: {
    id: 1,
    name: 'Invoice Email',
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
      user: 'invoice@yourcompany.com',
      pass: 'your-password'
    },
    from: {
      name: 'Your Company Billing',
      email: 'invoice@yourcompany.com'
    },
    purpose: 'Invoices and billing'
  },
  // ... other configs
};
```

### Invoice Email Template

Edit the invoice HTML template in `/api/invoices/send` endpoint to customize:
- Company branding
- Colors and styling
- Payment instructions
- Footer information

---

## Security Considerations

### Authentication
- All email endpoints require JWT authentication
- Token passed in `Authorization: Bearer {token}` header
- Admin-only endpoints for SMTP configuration

### Password Protection
- SMTP passwords masked in API responses (`********`)
- Only updated when new password provided
- Stored in server memory (use environment variables in production)

### Email Validation
- Validate recipient email addresses
- Prevent email injection attacks
- Sanitize HTML content

### Rate Limiting
- Implement rate limiting for email sending
- Prevent spam and abuse
- Monitor sending patterns

---

## Troubleshooting

### Issue: Emails Not Sending

**Check:**
1. SMTP configuration correct (host, port, secure setting)
2. Credentials valid (username, password)
3. SMTP AUTH enabled in Office 365
4. Security defaults allow legacy authentication
5. Network allows outbound port 587/465
6. Backend logs for detailed error messages

### Issue: Invoice Emails Not Received

**Check:**
1. Invoice SMTP config active
2. Recipient email address valid
3. Check spam/junk folder
4. Backend logs show successful send
5. Delivery status in Sent emails tab

### Issue: Drafts Not Saving

**Check:**
1. User authenticated
2. Backend server running
3. Browser console for errors
4. Network tab for failed requests

### Issue: Search Not Working

**Check:**
1. Search query not empty
2. Results match search criteria
3. Filter settings correct
4. Backend search endpoint responding

---

## Future Enhancements

### Planned Features

1. **Attachment Support** 📎
   - File upload functionality
   - Multiple attachments per email
   - File size limits
   - Preview attachments

2. **Rich Text Editor** ✍️
   - WYSIWYG editor
   - Formatting options (bold, italic, colors)
   - Insert images
   - Insert links

3. **Email Scheduling** ⏰
   - Schedule emails for later
   - Recurring emails
   - Time zone support

4. **Email Inbox** 📥
   - Receive emails via IMAP
   - Reply to emails
   - Forward emails
   - Email threading

5. **Read Receipts** 👁️
   - Track when emails opened
   - Track link clicks
   - Email engagement analytics

6. **Templates Library** 📚
   - Pre-built email templates
   - Template variables
   - Template categories
   - Custom templates

7. **Email Signatures** ✒️
   - Personal signatures
   - Company signatures
   - HTML signatures
   - Auto-append to emails

8. **Contact Management** 👥
   - Address book
   - Contact groups
   - Frequent contacts
   - Auto-complete suggestions

---

## Support

For issues or questions:
- Check backend logs: `server/index.js` console output
- Check browser console for frontend errors
- Review API endpoint responses
- Verify SMTP configuration settings

---

## Version History

**v1.0.0** (December 4, 2025)
- Initial release
- Multiple SMTP configurations
- Compose and send emails
- Draft management
- Sent email tracking
- Invoice email sending with HTML template
- Email search and filtering
- Email analytics
- SMTP account management

---

**Document Status:** ✅ Production Ready  
**Last Updated:** December 4, 2025  
**Author:** CentraPro Development Team
