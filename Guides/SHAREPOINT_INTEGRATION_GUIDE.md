# SharePoint Integration Guide for CentraPro

## Overview
This guide covers integrating SharePoint as the primary database for CentraPro, replacing in-memory storage with real-time SharePoint Lists.

**SharePoint Site:** https://rightarcconsulting.sharepoint.com

## Architecture

```
Frontend (React) → Backend (Node.js/Express) → Microsoft Graph API → SharePoint Lists
```

## Prerequisites

### 1. Azure AD App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations** > **New registration**
3. Configure:
   - **Name:** CentraPro-Integration
   - **Supported account types:** Single tenant
   - **Redirect URI:** Web - `http://localhost:4000/auth/callback`
4. Note down:
   - **Application (client) ID**
   - **Directory (tenant) ID**
5. Go to **Certificates & secrets** > **New client secret**
   - Note down the **Client Secret Value** (save immediately!)
6. Go to **API permissions** > **Add a permission**
   - **Microsoft Graph** > **Application permissions**
   - Add permissions:
     - `Sites.ReadWrite.All`
     - `Sites.FullControl.All`
     - `User.Read.All`
   - Click **Grant admin consent**

### 2. SharePoint Site Setup

Your site: `https://rightarcconsulting.sharepoint.com`

**Required Lists to Create:**

#### List 1: Timesheets
Columns:
- Title (Single line of text)
- EmployeeId (Number)
- EmployeeName (Single line of text)
- WeekStart (Date)
- WeekEnd (Date)
- Project (Single line of text)
- Task (Single line of text)
- MondayHours (Number)
- TuesdayHours (Number)
- WednesdayHours (Number)
- ThursdayHours (Number)
- FridayHours (Number)
- SaturdayHours (Number)
- SundayHours (Number)
- TotalHours (Number)
- HourlyRate (Number)
- TotalAmount (Currency)
- Billable (Yes/No)
- Status (Choice: Pending, Submitted, Approved, Rejected)
- SubmittedAt (Date and Time)
- ApprovedBy (Number)
- ApprovedAt (Date and Time)
- RejectionReason (Multiple lines of text)
- Attachments (Allow attachments: Yes)

#### List 2: Employees
Columns:
- Title (Employee Name)
- EmployeeId (Number)
- Email (Single line of text)
- Department (Choice)
- Position (Single line of text)
- HireDate (Date)
- Manager (Person or Group)
- Status (Choice: Active, Inactive, On Leave)
- HourlyRate (Currency)
- Phone (Single line of text)
- Address (Multiple lines of text)

#### List 3: Projects
Columns:
- Title (Project Name)
- ProjectCode (Single line of text)
- ClientName (Single line of text)
- StartDate (Date)
- EndDate (Date)
- Budget (Currency)
- ProjectManager (Person or Group)
- Status (Choice: Active, Completed, On Hold, Cancelled)
- Description (Multiple lines of text)

#### List 4: Tasks
Columns:
- Title (Task Name)
- TaskCategory (Choice: Development, Testing, Design, Documentation, Meeting)
- Description (Multiple lines of text)
- EstimatedHours (Number)
- BillableDefault (Yes/No)

#### List 5: Invoices
Columns:
- Title (Invoice Number)
- InvoiceDate (Date)
- VendorEmail (Single line of text)
- ClientName (Single line of text)
- TotalHours (Number)
- TotalAmount (Currency)
- Status (Choice: Draft, Sent, Paid, Overdue)
- DueDate (Date)
- WeeksIncluded (Multiple lines of text - JSON array)
- SentAt (Date and Time)
- PaidAt (Date and Time)
- Attachments (Allow attachments: Yes)

#### List 6: LeaveRequests
Columns:
- Title (Employee Name)
- EmployeeId (Number)
- LeaveType (Choice: Vacation, Sick, Personal, Unpaid)
- StartDate (Date)
- EndDate (Date)
- TotalDays (Number)
- Reason (Multiple lines of text)
- Status (Choice: Pending, Approved, Rejected)
- ApprovedBy (Number)
- ApprovedAt (Date and Time)
- RejectionReason (Multiple lines of text)

#### List 7: Users
Columns:
- Title (Full Name)
- Email (Single line of text)
- Password (Single line of text - encrypted)
- Role (Choice: admin, manager, user)
- EmployeeId (Number)
- Active (Yes/No)
- LastLogin (Date and Time)

#### List 8: AuditLogs
Columns:
- Title (Action)
- UserId (Number)
- UserEmail (Single line of text)
- Action (Single line of text)
- Resource (Single line of text)
- ResourceId (Number)
- Details (Multiple lines of text - JSON)
- IPAddress (Single line of text)
- Timestamp (Date and Time)

## Environment Variables

Create `.env` file in `server/` directory:

```env
# Server Config
PORT=4000
JWT_SECRET=your_jwt_secret_here

# Azure AD / Microsoft Graph
AZURE_TENANT_ID=your_tenant_id_here
AZURE_CLIENT_ID=your_client_id_here
AZURE_CLIENT_SECRET=your_client_secret_here

# SharePoint Config
SHAREPOINT_SITE_URL=https://rightarcconsulting.sharepoint.com
SHAREPOINT_SITE_NAME=rightarcconsulting.sharepoint.com:/sites/YourSiteName
```

## Installation

### Backend Dependencies

```bash
cd server
npm install @microsoft/microsoft-graph-client @azure/identity isomorphic-fetch dotenv
```

## Implementation Files

See the following files in the server directory:
- `sharepoint-service.js` - SharePoint API wrapper
- `index-sharepoint.js` - Main server with SharePoint integration
- `sharepoint-setup.js` - Script to create all lists

## Usage

### 1. Create SharePoint Lists
```bash
cd server
node sharepoint-setup.js
```

### 2. Start Server with SharePoint
```bash
cd server
node index-sharepoint.js
```

## API Endpoints (SharePoint-backed)

All existing endpoints remain the same, but now they interact with SharePoint:

### Timesheets
- `GET /api/timesheets` - Fetch from SharePoint Timesheets list
- `POST /api/timesheets` - Create in SharePoint
- `PUT /api/timesheets/:id` - Update in SharePoint
- `DELETE /api/timesheets/:id` - Delete from SharePoint
- `POST /api/timesheets/bulk-submit` - Update multiple items
- `POST /api/timesheets/bulk-approve` - Update multiple items

### Employees
- `GET /api/employees` - Fetch from SharePoint Employees list
- `POST /api/employees` - Create in SharePoint
- `PUT /api/employees/:id` - Update in SharePoint
- `DELETE /api/employees/:id` - Delete from SharePoint

### Projects
- `GET /api/projects` - Fetch from SharePoint Projects list
- `POST /api/projects` - Create in SharePoint

### Invoices
- `POST /api/invoices/send` - Create invoice and attach PDF to SharePoint

## Real-Time Sync

SharePoint webhook support for real-time updates:

```javascript
// Subscribe to list changes
POST /api/sharepoint/subscribe/:listName
{
  "notificationUrl": "https://your-server.com/api/webhooks/sharepoint",
  "expirationDateTime": "2025-12-31T00:00:00Z"
}
```

## Security Considerations

1. **Never expose Azure credentials** in client-side code
2. **Use environment variables** for all secrets
3. **Implement JWT authentication** before SharePoint calls
4. **Validate all inputs** before sending to SharePoint
5. **Use SharePoint permissions** for granular access control
6. **Enable audit logging** for all operations

## Migration from In-Memory

To migrate existing in-memory data to SharePoint:

```bash
cd server
node migrate-to-sharepoint.js
```

This script will:
1. Connect to SharePoint
2. Create all required lists (if not exists)
3. Upload sample data
4. Verify data integrity

## Troubleshooting

### Error: "Application not found in directory"
- Verify Azure App Registration tenant ID
- Ensure admin consent is granted

### Error: "Access denied"
- Check API permissions in Azure AD
- Verify Sites.ReadWrite.All is granted
- Re-grant admin consent

### Error: "List does not exist"
- Run `node sharepoint-setup.js` to create lists
- Verify site URL in .env file

### Error: "Invalid client secret"
- Regenerate client secret in Azure Portal
- Update .env file immediately

## Performance Optimization

1. **Caching:** Implement Redis for frequently accessed data
2. **Batch Operations:** Use Graph API batch requests
3. **Pagination:** Implement proper pagination for large lists
4. **Indexing:** Create indexes on SharePoint list columns
5. **Delta Queries:** Use Microsoft Graph delta queries for sync

## Testing

Test SharePoint connection:
```bash
cd server
node test-sharepoint-connection.js
```

## Support

For issues with:
- **SharePoint Lists:** Contact SharePoint admin
- **Azure AD:** Contact Azure admin
- **Application:** Refer to README.md
