# CentraPro - Email & Timesheet Enhancements Summary

## Overview
This document summarizes the enhancements made to the Email Management and Timesheet systems based on user requirements.

---

## 1. Email Management Enhancements ✅

### 1.1 Inbox Feature Added
**Status:** ✅ Complete

**Changes Made:**
- Added new "Inbox" tab as the first tab in Email Management
- Created `inboxEmails` state to store received emails
- Added `fetchInboxEmails()` function to retrieve inbox emails
- Updated summary cards to show Inbox count instead of Delivered count
- Inbox currently returns empty array (requires IMAP setup for production)

**API Endpoint:**
```javascript
GET /api/email/inbox
Response: { total: 0, emails: [] }
```

**Future Enhancement:**
- Implement IMAP integration to fetch actual received emails
- Add email threading/conversation view
- Implement mark as read/unread functionality

---

### 1.2 SMTP Configuration Editing
**Status:** ✅ Complete

**Changes Made:**
- Added "Edit" button to each SMTP account card
- Created edit config dialog with full configuration form
- Implemented connection testing before saving
- Added visual feedback for connection status (success/error)
- Passwords are optional when editing (blank = keep existing)

**Features:**
1. **Editable Fields:**
   - Configuration Name
   - SMTP Host
   - Port (with secure/TLS selector)
   - Email Address (username)
   - Password (optional)
   - From Name
   - From Email

2. **Connection Test:**
   - Real-time SMTP connection verification
   - Success/error visual feedback with icons
   - Error messages displayed to user
   - Must pass connection test before saving

3. **Save Protection:**
   - Save button disabled until connection test passes
   - Validates all required fields
   - Audit logging for all configuration changes

**API Endpoints:**
```javascript
// Test SMTP Connection
POST /api/email/test-connection
Body: {
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  user: "email@company.com",
  pass: "password"
}
Response: {
  success: true,
  message: "SMTP connection successful"
}

// Update SMTP Config
PUT /api/email/smtp-configs/:purpose
Body: {
  name: "Updated Name",
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  auth: { user: "email@company.com", pass: "newpassword" },
  from: { name: "Company Name", email: "noreply@company.com" }
}
```

**How to Use:**
1. Navigate to **Email Management** → **SMTP Accounts** tab
2. Click **"Edit"** button on any account card
3. Update the configuration fields as needed
4. Click **"Test Connection"** to verify settings
5. Wait for green checkmark (success) or red error message
6. Click **"Save Configuration"** (only enabled after successful test)
7. Configuration will be updated and reflected immediately

**Current SMTP Accounts:**
| Purpose | Default From | Use Case |
|---------|--------------|----------|
| invoice | invoice@rightarc.com | Billing & invoices |
| notification | invoice@rightarc.com | System notifications |
| hr | invoice@rightarc.com | HR communications |
| support | invoice@rightarc.com | Customer support |

**Action Required:**
- Update each SMTP account with different email addresses
- Test connection for each account before saving
- Ensure SMTP AUTH is enabled in Microsoft 365

---

### 1.3 Tab Structure Updated
**Old Structure:**
1. Sent Emails
2. Drafts
3. SMTP Accounts

**New Structure:**
1. **Inbox** (new)
2. Sent Emails
3. Drafts
4. SMTP Accounts

---

## 2. Timesheet System Enhancements 🔄

### 2.1 File Upload Feature
**Status:** ✅ Complete (Frontend)
**Backend Status:** ⏳ Needs Implementation

**Changes Made:**
- Added `attachments` field to Timesheet interface
- Added `attachments` array to FormState
- Created file upload UI in timesheet dialog
- Added file chip display with delete option
- Multiple file upload support

**UI Features:**
- "Upload Files" button with file input
- Visual display of selected files as chips
- Individual file removal option
- Supports multiple file selection

**Data Structure:**
```typescript
interface Timesheet {
  // ... existing fields ...
  attachments?: Array<{
    filename: string;
    url: string;
    uploadedAt: string;
  }>;
}
```

**Backend Implementation Needed:**
```javascript
// Server endpoint needed
POST /api/timesheets/upload
Content-Type: multipart/form-data

// Store files in:
// - File system: /uploads/timesheets/{userId}/{filename}
// - Or cloud storage: AWS S3, Azure Blob, etc.

// Return URLs for stored files
Response: {
  files: [
    { filename: "timesheet.pdf", url: "/uploads/timesheets/1/timesheet.pdf" }
  ]
}
```

---

### 2.2 Weekly Timesheet View
**Status:** ⏳ Pending Implementation

**Requirements:**
- Group timesheets by week (week of date)
- Show weekly summary instead of daily entries
- Display total hours for the week
- Show week range (e.g., "Dec 2 - Dec 8, 2025")
- Managers approve entire week, not individual days

**Proposed Changes:**

**Backend:**
```javascript
// Add weekOf field to timesheet model
interface Timesheet {
  weekOf: string; // "2025-12-02" (Monday of the week)
  // ... other fields ...
}

// Modify POST /api/timesheets to group by week
// Modify GET /api/timesheets to return weekly summaries
```

**Frontend:**
- Change timesheet table to show weekly rows
- Aggregate daily hours into weekly total
- Show expandable row for daily details
- Update approval flow to approve entire week

**Weekly Summary Display:**
```
Week Of       | Project    | Task      | Total Hours | Billable | Status    | Actions
Dec 2 - 8     | Website    | Frontend  | 40.0        | Yes      | Pending   | Approve/Reject
Dec 9 - 15    | Marketing  | Design    | 38.5        | Yes      | Approved  | View
```

---

### 2.3 Invoice Generation After Approval
**Status:** ⏳ Pending Implementation

**Requirements:**
- Show "Generate Invoice" button after timesheet approval
- Create invoice from approved timesheet data
- Include all timesheet details in invoice

**Proposed Implementation:**

**Backend:**
```javascript
// New endpoint
POST /api/timesheets/:id/generate-invoice
Response: {
  invoiceId: 123,
  invoiceNumber: "INV-2025-123",
  amount: 2600.00
}

// Invoice creation logic:
// - Total hours × hourly rate = amount
// - Customer = employee's client/manager
// - Line items = weekly timesheet entries
// - Attach timesheet as supporting document
```

**Frontend:**
- Add "Generate Invoice" button in approved timesheet row
- Show confirmation dialog with invoice preview
- Redirect to Invoicing page after creation
- Show success message with invoice number

---

### 2.4 Send Timesheet Attachments with Invoice
**Status:** ⏳ Pending Implementation

**Requirements:**
- Add checkbox in invoice sending dialog: "Include timesheet attachments"
- If checked, attach all timesheet files to invoice email
- Show list of files that will be attached

**Proposed Implementation:**

**Invoicing Page Changes:**
```typescript
// Add to send invoice dialog
<FormControlLabel
  control={
    <Checkbox
      checked={includeTimesheetAttachments}
      onChange={(e) => setIncludeTimesheetAttachments(e.target.checked)}
    />
  }
  label="Include timesheet attachments"
/>

{includeTimesheetAttachments && relatedTimesheets.length > 0 && (
  <Box sx={{ mt: 2 }}>
    <Typography variant="subtitle2">Files to attach:</Typography>
    {relatedTimesheets.map(ts => 
      ts.attachments?.map(file => (
        <Chip key={file.filename} label={file.filename} />
      ))
    )}
  </Box>
)}
```

**Backend Changes:**
```javascript
// Modify POST /api/invoices/send
{
  invoice: { ... },
  vendorEmail: "customer@company.com",
  message: "optional message",
  includeTimesheetAttachments: true  // NEW
}

// Email sending logic:
if (includeTimesheetAttachments) {
  // Find timesheets for this invoice
  const timesheets = await getTimesheetsForInvoice(invoice.id);
  
  // Collect all attachments
  const allAttachments = timesheets
    .flatMap(ts => ts.attachments || [])
    .map(att => ({
      filename: att.filename,
      path: att.url  // local file path or download URL
    }));
  
  // Add to email
  mailOptions.attachments = allAttachments;
}
```

---

## 3. Code Cleanup ✅

**Files Removed:**
- ✅ `client/src/pages/TimesheetsOld.tsx` (old backup file)
- ✅ `client/src/pages/Dashboard.jsx` (unused old JSX file)

**Remaining Files:**
- All current files are in active use
- No duplicate or backup files found
- Codebase is clean and organized

---

## 4. Testing Instructions

### 4.1 Email Management Testing

**Test 1: Edit SMTP Configuration**
1. Go to **Email Management** → **SMTP Accounts** tab
2. Click **"Edit"** on Invoice Email account
3. Change email to: `billing@yourcompany.com`
4. Change password to your actual password
5. Click **"Test Connection"**
6. Verify you see green checkmark and "Connection Successful"
7. Click **"Save Configuration"**
8. Verify success message appears

**Test 2: Test All 4 SMTP Accounts**
- Edit each account (invoice, notification, hr, support)
- Use different email addresses for each
- Test connection for each
- Save all configurations

**Test 3: Inbox Tab**
1. Click on **Inbox** tab (first tab)
2. Verify it shows "No emails in inbox" message
3. (In production, this will show received emails via IMAP)

### 4.2 Timesheet Testing

**Test 1: File Upload**
1. Go to **Timesheets** page
2. Click **"Add Timesheet"**
3. Fill in project, task, and hours
4. Scroll to **"Attachments"** section
5. Click **"Upload Files"**
6. Select one or more files (PDF, Excel, images, etc.)
7. Verify files appear as chips below upload button
8. Click X on a chip to remove a file
9. Add more files if needed
10. Submit timesheet
11. **Note:** Files are not yet saved to server (backend implementation needed)

---

## 5. Pending Backend Implementation

### 5.1 File Upload Backend
**Priority:** HIGH

**Implementation Steps:**
1. Install multer for file uploads: `npm install multer`
2. Create uploads directory: `mkdir server/uploads/timesheets`
3. Add file upload endpoint:
```javascript
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: './uploads/timesheets/',
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

app.post('/api/timesheets/upload', authMiddleware, upload.array('files'), (req, res) => {
  const files = req.files.map(f => ({
    filename: f.filename,
    originalName: f.originalname,
    url: `/uploads/timesheets/${f.filename}`,
    uploadedAt: new Date().toISOString()
  }));
  
  res.json({ success: true, files });
});
```

4. Update timesheet submission to include file URLs
5. Serve uploaded files as static:
```javascript
app.use('/uploads', express.static('uploads'));
```

### 5.2 Weekly Timesheet Grouping
**Priority:** MEDIUM

**Implementation Steps:**
1. Add `weekOf` field to timesheet model
2. Calculate weekOf date (Monday of the week) on submission
3. Group timesheets by weekOf in GET /api/timesheets
4. Aggregate daily hours into weekly totals
5. Update approval endpoints to handle weekly approval

### 5.3 Invoice Generation from Timesheet
**Priority:** MEDIUM

**Implementation Steps:**
1. Create POST /api/timesheets/:id/generate-invoice endpoint
2. Extract timesheet data (hours, rate, project, task)
3. Create invoice with calculated amount
4. Link invoice to timesheet (add timesheetId field to invoice)
5. Return invoice ID and number

### 5.4 Timesheet Attachments in Invoice Email
**Priority:** LOW

**Implementation Steps:**
1. Add `includeTimesheetAttachments` parameter to invoice send API
2. Query timesheets linked to invoice
3. Collect all attachment URLs
4. Download files from URLs (if remote) or read from disk
5. Add to nodemailer attachments array
6. Send email with attachments

---

## 6. System Status Summary

| Feature | Status | Notes |
|---------|--------|-------|
| **Email Management** |
| Inbox Tab | ✅ Complete | Shows empty array (needs IMAP) |
| Edit SMTP Configs | ✅ Complete | With connection testing |
| Test SMTP Connection | ✅ Complete | Real-time verification |
| 4 Separate SMTP Accounts | ✅ Complete | Ready to configure |
| **Timesheets** |
| File Upload UI | ✅ Complete | Frontend only |
| File Upload Backend | ⏳ Pending | Implementation needed |
| Weekly View | ⏳ Pending | Requires backend changes |
| Invoice Generation | ⏳ Pending | New feature |
| Timesheet Attachments in Invoice | ⏳ Pending | Depends on file upload |
| **Code Cleanup** |
| Remove Old Files | ✅ Complete | 2 files removed |

---

## 7. Next Steps

### Immediate Actions:
1. **Test Email SMTP Configuration**
   - Edit all 4 SMTP accounts with different emails
   - Verify connection tests work correctly
   - Save all configurations

2. **Test Timesheet File Upload (UI only)**
   - Verify file selection works
   - Check file chip display
   - Test file removal

### Short-term Development (1-2 days):
1. **Implement File Upload Backend**
   - Install multer
   - Create upload endpoint
   - Store files in server/uploads
   - Return file URLs
   - Update timesheet submission to save attachments

2. **Implement Weekly Timesheet View**
   - Add weekOf field
   - Group by week on backend
   - Update frontend table to show weekly rows
   - Modify approval to approve entire week

### Medium-term Development (3-5 days):
1. **Invoice Generation from Timesheet**
   - Create generate-invoice endpoint
   - Link timesheets to invoices
   - Add "Generate Invoice" button to approved timesheets
   - Implement invoice creation logic

2. **Timesheet Attachments in Invoice Email**
   - Add checkbox to invoice send dialog
   - Collect timesheet attachments
   - Attach files to invoice email
   - Test with multiple file types

---

## 8. Configuration Reference

### SMTP Configuration Format
```javascript
{
  id: 1,
  name: "Invoice Email",
  host: "smtp.office365.com",
  port: 587,
  secure: false,  // false for TLS (port 587), true for SSL (port 465)
  auth: {
    user: "invoice@yourcompany.com",
    pass: "your-password-here"
  },
  from: {
    name: "Your Company Billing",
    email: "invoice@yourcompany.com"
  },
  purpose: "invoice",  // invoice | notification | hr | support
  isConfigured: true
}
```

### Common SMTP Settings
| Provider | Host | Port | Secure |
|----------|------|------|--------|
| Office 365 | smtp.office365.com | 587 | false (TLS) |
| Gmail | smtp.gmail.com | 587 | false (TLS) |
| Gmail SSL | smtp.gmail.com | 465 | true (SSL) |
| Outlook | smtp-mail.outlook.com | 587 | false (TLS) |
| SendGrid | smtp.sendgrid.net | 587 | false (TLS) |

---

## 9. Troubleshooting

### Issue: SMTP Connection Test Fails
**Solution:**
1. Verify host and port are correct
2. Check username (full email address)
3. Verify password is correct
4. Ensure SMTP AUTH is enabled in email provider
5. Check firewall allows outbound connections on port 587/465
6. For Office 365: Disable Security Defaults if they block legacy auth

### Issue: Files Not Uploading
**Current Limitation:**
- File upload backend is not yet implemented
- Files are only stored in browser state
- Will be lost on page refresh
- Backend implementation required for persistence

### Issue: Timesheets Still Show Daily View
**Expected:**
- Weekly view is not yet implemented
- Currently shows individual daily entries
- Backend changes required for weekly grouping

---

## 10. Documentation Links

- **Email SMTP Setup Guide:** `/EMAIL_SMTP_SETUP_GUIDE.md`
- **Email Management Guide:** `/EMAIL_MANAGEMENT_GUIDE.md`
- **Testing Guide:** `/TESTING_GUIDE.md`
- **This Summary:** `/ENHANCEMENTS_SUMMARY.md`

---

**Last Updated:** December 3, 2025  
**Version:** 1.0  
**Author:** CentraPro Development Team  
**Status:** Phase 1 Complete, Phase 2 Pending
