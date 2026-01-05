# SharePoint Integration - Testing Guide

## ✅ What's Ready to Test

The SharePoint integration UI is now complete in the Admin Console! Here's what you can do:

### Frontend Features (Completed)
- ✅ SharePoint Connection tab in Admin Console
- ✅ Azure AD configuration form (Tenant ID, Client ID, Client Secret)
- ✅ SharePoint configuration form (Site URL, Site Name)
- ✅ Test Connection button with status indicators
- ✅ Create Lists button (appears after successful connection)
- ✅ Save Configuration button
- ✅ Connection status display with color-coded chips
- ✅ Quick setup guide with Azure Portal link
- ✅ Enable/Disable SharePoint integration toggle

### Backend API (Completed)
- ✅ `POST /api/sharepoint/test-connection` - Tests Azure AD credentials
- ✅ `POST /api/sharepoint/create-lists` - Creates 8 SharePoint lists
- ✅ `PUT /api/sharepoint/config` - Saves configuration
- ✅ `GET /api/sharepoint/status` - Gets current config status

### SharePoint Service Files (Ready)
- ✅ `server/sharepoint-service.js` - Microsoft Graph API wrapper
- ✅ `server/sharepoint-setup.js` - List creation script
- ✅ `server/test-sharepoint-connection.js` - Connection test utility
- ✅ `server/migrate-to-sharepoint.js` - Sample data migration

## 🚀 How to Test

### Step 1: Get Azure AD Credentials (10 minutes)

1. **Go to Azure Portal:**
   ```
   https://portal.azure.com
   ```

2. **Navigate to Azure Active Directory:**
   - Search for "Azure Active Directory"
   - Click "App registrations" in left menu

3. **Create New App Registration:**
   - Click "+ New registration"
   - Name: `CentraPro-SharePoint`
   - Supported account types: Single tenant
   - Redirect URI: Leave blank
   - Click "Register"

4. **Copy Application IDs:**
   - On the Overview page, copy:
     - **Directory (tenant) ID** → This is your Tenant ID
     - **Application (client) ID** → This is your Client ID

5. **Create Client Secret:**
   - Click "Certificates & secrets" in left menu
   - Click "+ New client secret"
   - Description: `CentraPro-Secret`
   - Expires: 24 months
   - Click "Add"
   - **IMMEDIATELY COPY THE SECRET VALUE** → This is your Client Secret
   - ⚠️ You can't see this again!

6. **Add API Permissions:**
   - Click "API permissions" in left menu
   - Click "+ Add a permission"
   - Choose "Microsoft Graph"
   - Choose "Application permissions"
   - Search and add:
     - `Sites.ReadWrite.All`
     - `Sites.FullControl.All`
     - `User.Read.All` (optional)
   - Click "Grant admin consent for [your org]"
   - Wait for green checkmarks

### Step 2: Configure in Admin Console (2 minutes)

1. **Start the Application:**
   ```powershell
   # Terminal 1 - Server
   cd server
   npm start

   # Terminal 2 - Client
   cd client
   npm run dev
   ```

2. **Login as Admin:**
   - Go to: http://localhost:5173
   - Email: `admin@example.com`
   - Password: `Password123`

3. **Navigate to Admin Console:**
   - Click "Admin Console" in sidebar
   - Click "SharePoint Connection" tab (5th tab)

4. **Enter Credentials:**
   - Paste **Tenant ID** from Azure
   - Paste **Client ID** from Azure
   - Paste **Client Secret** from Azure
   - Verify **Site URL**: `https://rightarcconsulting.sharepoint.com`
   - Verify **Site Name**: `rightarcconsulting.sharepoint.com`

5. **Test Connection:**
   - Click "Test Connection" button
   - Wait for status to change
   - ✅ Success: Green chip "Connected"
   - ❌ Failed: Red chip "Failed" with error message

### Step 3: Create SharePoint Lists (1 minute)

1. **After Successful Connection:**
   - "Create SharePoint Lists" button appears
   - Click the button
   - Wait for creation process (15-30 seconds)
   - Success message: "Successfully created 8 SharePoint lists"

2. **Verify in SharePoint:**
   - Go to: https://rightarcconsulting.sharepoint.com
   - Click "Site contents"
   - You should see 8 new lists:
     - Timesheets
     - Employees
     - Projects
     - Tasks
     - Invoices
     - LeaveRequests
     - Users
     - AuditLogs

### Step 4: Save Configuration (Optional)

1. **Save Settings:**
   - Click "Save SharePoint Configuration"
   - Configuration stored in memory (persists until server restart)

2. **Enable Integration:**
   - Toggle "Enable SharePoint Integration" switch
   - When enabled, app will use SharePoint instead of in-memory data
   - ⚠️ Requires backend integration (not yet implemented)

## 🧪 Command-Line Testing (Alternative)

If you prefer testing via command line first:

### Test Connection:
```powershell
cd server
node test-sharepoint-connection.js
```

**Expected Output:**
```
✓ Azure AD credentials loaded
✓ Successfully authenticated
✓ Site found: rightarcconsulting
✓ Lists found: 8
  - Timesheets
  - Employees
  - Projects
  - Tasks
  - Invoices
  - LeaveRequests
  - Users
  - AuditLogs
```

### Create Lists:
```powershell
node sharepoint-setup.js
```

**Expected Output:**
```
Starting SharePoint list creation...
✓ Authenticated successfully
✓ Site ID retrieved
Creating lists...
  ✓ Timesheets (20 columns)
  ✓ Employees (10 columns)
  ✓ Projects (8 columns)
  ✓ Tasks (4 columns)
  ✓ Invoices (11 columns)
  ✓ LeaveRequests (10 columns)
  ✓ Users (6 columns)
  ✓ AuditLogs (8 columns)
✅ All 8 lists created successfully!
```

### Migrate Sample Data:
```powershell
node migrate-to-sharepoint.js
```

## 🔍 Troubleshooting

### Error: "Missing required credentials"
- **Cause:** Tenant ID, Client ID, or Client Secret is empty
- **Fix:** Double-check you copied all values from Azure Portal

### Error: "Authentication failed"
- **Cause:** Invalid credentials or expired secret
- **Fix:** 
  - Verify credentials in Azure Portal → App registrations
  - Create new client secret if expired
  - Check Tenant ID matches your organization

### Error: "Access denied" or "Forbidden"
- **Cause:** Missing API permissions or admin consent not granted
- **Fix:**
  - Azure Portal → App registrations → API permissions
  - Ensure `Sites.ReadWrite.All` and `Sites.FullControl.All` are added
  - Click "Grant admin consent" button
  - Wait 5 minutes for permissions to propagate

### Error: "Site not found"
- **Cause:** Incorrect SharePoint site URL
- **Fix:**
  - Verify URL in browser: https://rightarcconsulting.sharepoint.com
  - Try format: `rightarcconsulting.sharepoint.com` (no https://)
  - For site collections: `rightarcconsulting.sharepoint.com:/sites/yoursite`

### Error: "Module not found: @microsoft/microsoft-graph-client"
- **Cause:** SharePoint dependencies not installed
- **Fix:**
  ```powershell
  cd server
  npm install @microsoft/microsoft-graph-client @azure/identity isomorphic-fetch
  ```

### Connection shows "Testing..." forever
- **Cause:** Server not running or API endpoint unreachable
- **Fix:**
  - Check Terminal 1: Server should show "🚀 Server running on http://localhost:4000"
  - Check browser console (F12) for network errors
  - Restart server: `Ctrl+C` then `npm start`

## 📊 What Data Gets Stored

When SharePoint integration is enabled, the following data is stored in SharePoint lists:

### 1. Timesheets List
- Employee, Week Ending, Project, Task
- Monday-Sunday hours
- Total Hours, Overtime Hours
- Status (Draft/Pending/Approved/Rejected)
- Submission Date, Approved By

### 2. Employees List
- Full Name, Email, Phone
- Department, Position, Manager
- Start Date, Employment Type
- Status (Active/Inactive)

### 3. Projects List
- Project Name, Client, Description
- Start Date, End Date
- Budget, Status
- Project Manager

### 4. Tasks List
- Task Name, Project (lookup)
- Description, Status

### 5. Invoices List
- Invoice Number, Client Name
- Amount, Tax, Total
- Issue Date, Due Date
- Status (Draft/Sent/Paid/Overdue)
- Payment Date

### 6. LeaveRequests List
- Employee, Leave Type
- Start Date, End Date, Total Days
- Reason, Status
- Approved By, Approved Date

### 7. Users List
- Email, Full Name, Role
- Department, Is Active
- Last Login

### 8. AuditLogs List
- User Email, Action, Resource
- Resource ID, Timestamp
- IP Address, Details

## 🎯 Next Steps After Testing

Once SharePoint connection is working:

1. **Backend Integration:**
   - Create `server/index-sharepoint.js` that uses `sharepoint-service.js`
   - Replace in-memory arrays with SharePoint calls
   - Add environment variable: `USE_SHAREPOINT=true`

2. **Real-time Sync:**
   - Implement SharePoint webhooks
   - Subscribe to list change notifications
   - Update frontend when data changes

3. **Data Migration:**
   - Run `migrate-to-sharepoint.js` to populate sample data
   - Export existing in-memory data to SharePoint
   - Verify data integrity

4. **Production Hardening:**
   - Move credentials to Azure Key Vault
   - Implement credential rotation
   - Add connection health monitoring
   - Set up automated backups

## 📚 Documentation

For more detailed information:

- **Complete Setup:** `Guides/SHAREPOINT_SETUP_COMPLETE.md`
- **Technical Guide:** `Guides/SHAREPOINT_INTEGRATION_GUIDE.md`
- **Quick Start:** `Guides/SHAREPOINT_QUICKSTART.md`
- **Architecture:** `Guides/SHAREPOINT_ARCHITECTURE.md`

## ✅ Success Checklist

You'll know everything is working when:

- [ ] Admin Console shows SharePoint Connection tab
- [ ] Can enter Azure AD credentials in the form
- [ ] Test Connection button shows "Connected" status (green chip)
- [ ] Create Lists button appears after successful connection
- [ ] Clicking Create Lists shows success message
- [ ] SharePoint site (https://rightarcconsulting.sharepoint.com) shows 8 new lists
- [ ] Lists have correct column schemas (20 columns for Timesheets, etc.)
- [ ] Can manually add items to SharePoint lists via web interface
- [ ] Command-line test scripts work: `node test-sharepoint-connection.js`

## 🆘 Need Help?

If you encounter issues:

1. Check Azure Portal → App registrations → Your app
2. Verify API permissions are granted (green checkmarks)
3. Check client secret hasn't expired
4. Run command-line tests first to isolate frontend vs. backend issues
5. Check browser console (F12) for JavaScript errors
6. Check server terminal for Node.js errors

---

**Ready to test?** Start with Step 1: Get Azure AD Credentials! 🚀
