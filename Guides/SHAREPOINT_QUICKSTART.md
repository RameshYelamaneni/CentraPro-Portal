# SharePoint Integration - Quick Start Guide

## 🎯 What This Does

This integration connects your CentraPro application to **SharePoint Lists** as a real-time database, replacing the in-memory storage. All data (timesheets, employees, projects, invoices, etc.) will be stored in SharePoint and synced in real-time.

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] Access to Azure Portal with admin privileges
- [ ] Access to SharePoint site: https://rightarcconsulting.sharepoint.com
- [ ] Node.js installed (v14 or higher)
- [ ] All npm dependencies installed

## 🚀 Step-by-Step Setup (30 minutes)

### Step 1: Azure AD App Registration (10 minutes)

1. **Open Azure Portal**
   - Go to https://portal.azure.com
   - Sign in with your admin account

2. **Create App Registration**
   ```
   Navigate: Azure Active Directory > App registrations > New registration
   
   Settings:
   - Name: CentraPro-SharePoint-Integration
   - Supported account types: Accounts in this organizational directory only
   - Redirect URI: Web - http://localhost:4000/auth/callback
   
   Click: Register
   ```

3. **Copy Important IDs**
   ```
   From the Overview page, copy:
   - Application (client) ID: [Save this]
   - Directory (tenant) ID: [Save this]
   ```

4. **Create Client Secret**
   ```
   Navigate: Certificates & secrets > Client secrets > New client secret
   
   Settings:
   - Description: CentraPro Secret
   - Expires: 24 months
   
   Click: Add
   IMPORTANT: Copy the secret VALUE immediately (you can't see it again!)
   ```

5. **Grant API Permissions**
   ```
   Navigate: API permissions > Add a permission
   
   Select: Microsoft Graph > Application permissions
   
   Add these permissions:
   - Sites.ReadWrite.All
   - Sites.FullControl.All  
   - User.Read.All
   
   Click: Grant admin consent for [Your Organization]
   
   CRITICAL: Wait for status to show green checkmarks
   ```

### Step 2: Configure Environment Variables (5 minutes)

1. **Create .env file**
   ```bash
   cd server
   copy .env.example .env
   ```

2. **Edit .env file with your values:**
   ```env
   PORT=4000
   JWT_SECRET=your_secure_random_string_here
   
   # FROM AZURE PORTAL:
   AZURE_TENANT_ID=paste_your_tenant_id_here
   AZURE_CLIENT_ID=paste_your_client_id_here
   AZURE_CLIENT_SECRET=paste_your_client_secret_here
   
   # SHAREPOINT CONFIG:
   SHAREPOINT_SITE_URL=https://rightarcconsulting.sharepoint.com
   
   # FORMAT: domain:/sites/sitename
   # If using root site, just use: rightarcconsulting.sharepoint.com
   # If using subsite like /sites/CentraPro, use: rightarcconsulting.sharepoint.com:/sites/CentraPro
   SHAREPOINT_SITE_NAME=rightarcconsulting.sharepoint.com
   ```

### Step 3: Test Connection (2 minutes)

```bash
cd server
node test-sharepoint-connection.js
```

**Expected Output:**
```
🧪 Testing SharePoint Connection

Configuration:
- Tenant ID: ✓ Set
- Client ID: ✓ Set
- Client Secret: ✓ Set
- Site URL: https://rightarcconsulting.sharepoint.com

Test 1: Getting SharePoint site...
✅ Site ID: rightarcconsulting.sharepoint.com,12345...

Test 2: Getting all lists...
✅ Found X lists

🎉 SharePoint connection test successful!
```

**If you see errors:**
- Double-check tenant ID, client ID, and client secret
- Verify admin consent was granted
- Wait 5-10 minutes for Azure AD permissions to propagate

### Step 4: Create SharePoint Lists (5 minutes)

```bash
cd server
node sharepoint-setup.js
```

This will create 8 lists:
- ✅ Timesheets (with 20+ columns)
- ✅ Employees
- ✅ Projects  
- ✅ Tasks
- ✅ Invoices
- ✅ LeaveRequests
- ✅ Users
- ✅ AuditLogs

**Expected Output:**
```
🚀 Starting SharePoint setup...

1️⃣ Verifying SharePoint connection...
✅ Connected to SharePoint site

2️⃣ Creating SharePoint lists...
📝 Creating list: Timesheets...
✅ Created list: Timesheets with 20 columns

[... repeats for each list ...]

🎉 SharePoint setup completed successfully!
```

### Step 5: Migrate Sample Data (3 minutes)

```bash
cd server
node migrate-to-sharepoint.js
```

This populates your lists with sample data:
- 3 users (admin, manager, user)
- 3 projects (Spruce, Pine, Oak)
- 4 tasks (Development, Testing, Design, Documentation)
- 2 employees
- 2 sample timesheets

**Expected Output:**
```
🚀 Starting migration to SharePoint...

2️⃣ Migrating Users...
   ✅ Created 3/3 items in Users

2️⃣ Migrating Projects...
   ✅ Created 3/3 items in Projects

[... continues for all lists ...]

🎉 Migration completed!
```

### Step 6: Verify in SharePoint (2 minutes)

1. Open your SharePoint site: https://rightarcconsulting.sharepoint.com
2. Click "Site contents"
3. You should see all 8 lists
4. Click "Timesheets" to verify sample data is there

### Step 7: Start Application (3 minutes)

**Terminal 1 - Backend:**
```bash
cd server
node index.js
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

**Access application:**
- Frontend: http://localhost:5173
- Backend: http://localhost:4000

**Test login:**
- Email: admin@example.com
- Password: Password123

## 🔧 Architecture Changes

### Before (In-Memory):
```
Frontend → Backend → Arrays in RAM → Data lost on restart
```

### After (SharePoint):
```
Frontend → Backend → SharePoint Service → Microsoft Graph API → SharePoint Lists
```

### Real-Time Features:
- ✅ All data persists in SharePoint
- ✅ Multi-user support (no conflicts)
- ✅ SharePoint permissions applied
- ✅ Audit trail in SharePoint
- ✅ File attachments stored in SharePoint
- ✅ Search across all data
- ✅ Data accessible via SharePoint UI

## 📊 What Gets Stored Where

| Feature | SharePoint List | Columns |
|---------|----------------|---------|
| Timesheets | Timesheets | Employee, Week, Hours, Status, Attachments |
| Employees | Employees | Name, Email, Department, Hourly Rate |
| Projects | Projects | Name, Client, Budget, Status |
| Tasks | Tasks | Name, Category, Billable |
| Invoices | Invoices | Number, Amount, Status, Attachments |
| Leave | LeaveRequests | Employee, Dates, Type, Status |
| Users | Users | Email, Password, Role |
| Activity | AuditLogs | User, Action, Resource, Timestamp |

## 🔐 Security Notes

### What's Secure:
- ✅ Azure AD authentication
- ✅ Application-level permissions
- ✅ JWT tokens for frontend
- ✅ SharePoint access controls
- ✅ Audit logging enabled

### What to Improve for Production:
- ⚠️ Encrypt passwords (use bcrypt)
- ⚠️ Use Key Vault for secrets
- ⚠️ Enable HTTPS
- ⚠️ Implement row-level security
- ⚠️ Add rate limiting

## 🐛 Troubleshooting

### Error: "Application not found"
**Solution:** Verify AZURE_TENANT_ID is correct

### Error: "Access denied"  
**Solution:** 
1. Check API permissions include Sites.ReadWrite.All
2. Click "Grant admin consent"
3. Wait 5-10 minutes

### Error: "Site not found"
**Solution:** Verify SHAREPOINT_SITE_NAME format:
- Root site: `rightarcconsulting.sharepoint.com`
- Subsite: `rightarcconsulting.sharepoint.com:/sites/YourSite`

### Error: "List does not exist"
**Solution:** Run `node sharepoint-setup.js`

### Error: "Invalid client secret"
**Solution:** 
1. Go to Azure Portal > App Registration
2. Create new client secret
3. Update .env immediately (expires in 24-48 months)

### Connection hangs
**Solution:**
1. Check internet connection
2. Verify no firewall blocking
3. Test: `Invoke-RestMethod https://graph.microsoft.com/v1.0/me -Headers @{Authorization="Bearer YOUR_TOKEN"}`

## 📈 Performance Tips

1. **Caching:** Implement Redis for frequently accessed data
   ```bash
   npm install redis
   ```

2. **Batch Operations:** Use batch API for multiple updates
   ```javascript
   await sharepointService.batchCreateItems('Timesheets', items);
   ```

3. **Pagination:** Limit query results
   ```javascript
   await sharepointService.getListItems('Timesheets', null, null, 'top=100');
   ```

4. **Indexes:** Create indexes in SharePoint for:
   - EmployeeId
   - WeekStart
   - Status
   - Project

5. **Webhooks:** Subscribe to list changes for real-time sync
   ```javascript
   POST /api/sharepoint/subscribe/Timesheets
   ```

## 🔄 Switching Between In-Memory and SharePoint

Your original server is still at `server/index.js`. To switch:

**Use In-Memory (current):**
```bash
node index.js
```

**Use SharePoint:**
```bash
node index-sharepoint.js  # (needs to be created)
```

## 📝 Next Steps

1. ✅ Complete this setup guide
2. ⬜ Test all CRUD operations
3. ⬜ Upload real employee data
4. ⬜ Configure SharePoint permissions
5. ⬜ Set up backups
6. ⬜ Enable webhooks for real-time sync
7. ⬜ Implement caching with Redis
8. ⬜ Deploy to production environment

## 🆘 Support

**Azure Issues:**
- Azure Support: https://portal.azure.com/#blade/Microsoft_Azure_Support/HelpAndSupportBlade

**SharePoint Issues:**
- Microsoft 365 Admin Center: https://admin.microsoft.com

**Application Issues:**
- Check SHAREPOINT_INTEGRATION_GUIDE.md
- Review console logs
- Run test scripts

## 📚 Additional Resources

- [Microsoft Graph API Docs](https://docs.microsoft.com/en-us/graph/)
- [SharePoint REST API](https://docs.microsoft.com/en-us/sharepoint/dev/sp-add-ins/get-to-know-the-sharepoint-rest-service)
- [Azure AD App Registration](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [SharePoint List Schema](https://docs.microsoft.com/en-us/sharepoint/dev/schema/list-schema)

---

**Estimated Total Setup Time:** 30 minutes  
**Estimated Testing Time:** 15 minutes  
**Production Deployment:** 2-4 hours (with security hardening)
