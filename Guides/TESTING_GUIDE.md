# CentraPro - Complete Testing Guide

## Testing Overview

This guide provides comprehensive testing procedures for all modules in the CentraPro application. Follow the test cases in order to ensure all functionality is working correctly.

**Testing Environment:**
- Backend: http://localhost:4000
- Frontend: http://localhost:5173
- Test Accounts: See credentials section below

---

## Table of Contents

1. [Test Accounts & Credentials](#test-accounts--credentials)
2. [Module 1: Authentication & Login](#module-1-authentication--login)
3. [Module 2: Employee Management](#module-2-employee-management)
4. [Module 3: Onboarding System](#module-3-onboarding-system)
5. [Module 4: Leave Management](#module-4-leave-management)
6. [Module 5: Timesheets](#module-5-timesheets)
7. [Module 6: Approvals Workflow](#module-6-approvals-workflow)
8. [Module 7: Admin Console & RBAC](#module-7-admin-console--rbac)
9. [Module 8: Tenant/Licensing](#module-8-tenantlicensing)
10. [Module 9: Email Templates](#module-9-email-templates)
11. [Module 10: Invoicing](#module-10-invoicing)
12. [Test Results Summary](#test-results-summary)

---

## Test Accounts & Credentials

### Admin Account
```
Email: admin@example.com
Password: admin123
Role: Admin
Permissions: Full access to all modules
```

### Manager Account
```
Email: manager@example.com
Password: manager123
Role: Manager
Permissions: Employee management, approvals, reports
```

### Employee Account
```
Email: employee@example.com
Password: employee123
Role: Employee
Permissions: Basic access, timesheets, leave requests
```

---

## Module 1: Authentication & Login

### Test Case 1.1: Login with Valid Credentials ✅
**Steps:**
1. Navigate to http://localhost:5173
2. Enter email: `admin@example.com`
3. Enter password: `admin123`
4. Click "Login" button

**Expected Results:**
- ✅ Login successful
- ✅ Redirected to Dashboard
- ✅ User name displayed in topbar
- ✅ Token stored in localStorage as 'app_token'

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 1.2: Login with Invalid Credentials ❌
**Steps:**
1. Navigate to http://localhost:5173
2. Enter email: `admin@example.com`
3. Enter password: `wrongpassword`
4. Click "Login" button

**Expected Results:**
- ❌ Login fails
- ❌ Error message: "Invalid credentials"
- ❌ Remains on login page

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 1.3: Session Persistence
**Steps:**
1. Login as admin
2. Refresh the browser (F5)
3. Check if still logged in

**Expected Results:**
- ✅ User remains logged in
- ✅ Dashboard displayed
- ✅ No redirect to login page

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 1.4: Logout Functionality
**Steps:**
1. Login as admin
2. Click user menu (top right)
3. Click "Logout"

**Expected Results:**
- ✅ Logged out successfully
- ✅ Redirected to login page
- ✅ Token removed from localStorage
- ✅ Cannot access protected routes

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

## Module 2: Employee Management

### Test Case 2.1: View Employees List
**Steps:**
1. Login as admin
2. Click "Employees" in sidebar
3. View the employees table

**Expected Results:**
- ✅ Employees table displayed
- ✅ Columns: Name, Email, Department, Position, Status, Actions
- ✅ At least 3 employees visible (admin, manager, employee)
- ✅ Search bar present
- ✅ "Add Employee" button visible

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 2.2: Add New Employee
**Steps:**
1. Click "Add Employee" button
2. Fill in details:
   - Name: `Test Employee`
   - Email: `test@example.com`
   - Phone: `555-1234`
   - Department: `Engineering`
   - Position: `Developer`
   - Joining Date: Today's date
   - Status: Active
3. Enable "Send onboarding email" checkbox
4. Click "Add Employee"

**Expected Results:**
- ✅ Success message displayed
- ✅ New employee appears in table
- ✅ Onboarding email sent (check backend logs)
- ✅ Dialog closes

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 2.3: Search Employees
**Steps:**
1. In Employees page, use search bar
2. Type: `admin`
3. Observe results

**Expected Results:**
- ✅ Only matching employees shown
- ✅ Search is case-insensitive
- ✅ Results update in real-time

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 2.4: Edit Employee
**Steps:**
1. Click "Edit" (pencil icon) on any employee
2. Change Department to `Sales`
3. Change Status to `Inactive`
4. Click "Update"

**Expected Results:**
- ✅ Success message
- ✅ Changes reflected in table
- ✅ Dialog closes

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 2.5: Delete Employee
**Steps:**
1. Click "Delete" (trash icon) on test employee
2. Confirm deletion in dialog
3. Click "Delete" button

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ Employee removed from table
- ✅ Success message displayed

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

## Module 3: Onboarding System

### Test Case 3.1: Send Onboarding Email
**Steps:**
1. Add a new employee with valid email
2. Enable "Send onboarding email" checkbox
3. Click "Add Employee"
4. Check backend terminal logs

**Expected Results:**
- ✅ Log shows: `[EMAIL] Onboarding invite sent to [email]`
- ✅ Invite link generated
- ✅ Email sent successfully (if SMTP configured)

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 3.2: Access Onboarding Link
**Steps:**
1. Copy the onboarding link from backend logs
   - Format: `/onboarding/[JWT_TOKEN]`
2. Navigate to: `http://localhost:5173/onboarding/[JWT_TOKEN]`
3. View the onboarding form

**Expected Results:**
- ✅ Onboarding form displayed
- ✅ Welcome message with employee name
- ✅ Multiple steps/tabs visible
- ✅ Form fields are editable

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 3.3: Complete Onboarding
**Steps:**
1. Access onboarding link
2. Fill in personal information:
   - Address, Phone, Emergency Contact
3. Upload profile photo (optional)
4. Upload documents (ID, contracts)
5. Review and accept policies
6. Click "Complete Onboarding"

**Expected Results:**
- ✅ All steps completed
- ✅ Success message displayed
- ✅ Redirected to confirmation page
- ✅ Data saved in backend

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

## Module 4: Leave Management

### Test Case 4.1: View Leave Dashboard
**Steps:**
1. Login as employee
2. Click "Leave Management" in sidebar
3. View leave dashboard

**Expected Results:**
- ✅ Leave balance cards displayed (Annual, Sick, Personal)
- ✅ Leave history table visible
- ✅ "Apply for Leave" button present
- ✅ Calendar view available

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 4.2: Apply for Leave
**Steps:**
1. Click "Apply for Leave" button
2. Fill in details:
   - Leave Type: `Annual Leave`
   - Start Date: Tomorrow
   - End Date: 3 days later
   - Reason: `Family vacation`
3. Click "Submit"

**Expected Results:**
- ✅ Leave request submitted
- ✅ Status shows "Pending"
- ✅ Appears in leave history table
- ✅ Leave balance updated (reduced)

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 4.3: Approve Leave (Manager)
**Steps:**
1. Logout and login as manager
2. Go to "Leave Management"
3. Click "Pending Requests" tab
4. Find the pending leave request
5. Click "Approve" button

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ Leave status changes to "Approved"
- ✅ Notification sent to employee
- ✅ Removed from pending list

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 4.4: Reject Leave (Manager)
**Steps:**
1. Login as manager
2. View pending leave request
3. Click "Reject" button
4. Enter rejection reason
5. Click "Confirm"

**Expected Results:**
- ✅ Leave status changes to "Rejected"
- ✅ Reason stored and visible
- ✅ Employee's leave balance restored
- ✅ Notification sent to employee

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 4.5: Leave Calendar View
**Steps:**
1. Login as manager or admin
2. Go to Leave Management
3. Click "Calendar" tab
4. View leave schedule

**Expected Results:**
- ✅ Calendar displayed with month view
- ✅ Approved leaves shown on calendar
- ✅ Color-coded by leave type
- ✅ Hover shows leave details

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

## Module 5: Timesheets

### Test Case 5.1: View Timesheet Dashboard
**Steps:**
1. Login as employee
2. Click "Timesheets" in sidebar
3. View timesheet interface

**Expected Results:**
- ✅ Current week displayed
- ✅ Days of week shown (Mon-Sun)
- ✅ Time entry form visible
- ✅ Total hours calculated
- ✅ "Submit for Approval" button present

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 5.2: Add Timesheet Entry
**Steps:**
1. Select a date (e.g., Today)
2. Fill in details:
   - Project: `Project Alpha`
   - Task: `Development`
   - Hours: `8`
   - Description: `Implemented new feature`
3. Click "Add Entry"

**Expected Results:**
- ✅ Entry added to timesheet
- ✅ Total hours updated
- ✅ Entry appears in table
- ✅ Can edit or delete entry

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 5.3: Edit Timesheet Entry
**Steps:**
1. Click "Edit" on an existing entry
2. Change hours to `6`
3. Update description
4. Click "Save"

**Expected Results:**
- ✅ Entry updated
- ✅ Total hours recalculated
- ✅ Changes reflected immediately

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 5.4: Submit Timesheet for Approval
**Steps:**
1. Add entries for at least 5 days
2. Ensure total hours ≥ 40
3. Click "Submit for Approval"
4. Confirm submission

**Expected Results:**
- ✅ Timesheet status changes to "Pending"
- ✅ Cannot edit entries after submission
- ✅ Manager notified of submission
- ✅ Success message displayed

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 5.5: Approve Timesheet (Manager)
**Steps:**
1. Login as manager
2. Go to Timesheets
3. Click "Pending Approvals" tab
4. View submitted timesheet
5. Click "Approve"

**Expected Results:**
- ✅ Timesheet status changes to "Approved"
- ✅ Employee notified
- ✅ Hours counted towards payroll
- ✅ Removed from pending list

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

## Module 6: Approvals Workflow

### Test Case 6.1: View Approvals Dashboard
**Steps:**
1. Login as manager
2. Click "Approvals" in sidebar
3. View approvals dashboard

**Expected Results:**
- ✅ Tabs: Leave Requests, Timesheets, Expenses (if applicable)
- ✅ Count of pending approvals shown
- ✅ Table with pending items
- ✅ Approve/Reject buttons visible

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 6.2: Bulk Approve Items
**Steps:**
1. Select multiple pending requests (checkboxes)
2. Click "Bulk Approve" button
3. Confirm action

**Expected Results:**
- ✅ All selected items approved
- ✅ Status updated for each
- ✅ Success message shows count
- ✅ Notifications sent to requestors

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 6.3: Filter Approvals
**Steps:**
1. Use filter dropdown
2. Select "Leave Requests Only"
3. Observe filtered results

**Expected Results:**
- ✅ Only leave requests shown
- ✅ Timesheets hidden
- ✅ Filter persists when switching tabs

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

## Module 7: Admin Console & RBAC

### Test Case 7.1: View Admin Console
**Steps:**
1. Login as admin
2. Click "Admin Console" in sidebar
3. View admin dashboard

**Expected Results:**
- ✅ Tabs: Users, Roles, Permissions, Audit Logs
- ✅ System statistics displayed
- ✅ Recent activity shown
- ✅ Quick actions available

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 7.2: Create New Role
**Steps:**
1. Go to "Roles" tab
2. Click "Create Role" button
3. Fill in details:
   - Name: `Supervisor`
   - Description: `Team supervisor role`
4. Select permissions:
   - ✅ View Employees
   - ✅ Approve Leave
   - ✅ Approve Timesheets
5. Click "Create"

**Expected Results:**
- ✅ New role created
- ✅ Appears in roles table
- ✅ Permissions saved correctly
- ✅ Success message displayed

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 7.3: Assign Role to User
**Steps:**
1. Go to "Users" tab
2. Click "Edit" on a user
3. Change role to `Supervisor`
4. Click "Update"

**Expected Results:**
- ✅ User role updated
- ✅ User now has supervisor permissions
- ✅ Can access supervisor features
- ✅ Audit log entry created

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 7.4: View Audit Logs
**Steps:**
1. Go to "Audit Logs" tab
2. View recent activities
3. Filter by action type
4. Search by user

**Expected Results:**
- ✅ All system actions logged
- ✅ Shows: User, Action, Resource, Timestamp
- ✅ Filters work correctly
- ✅ Pagination available
- ✅ Can export to CSV

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 7.5: Manage Permissions
**Steps:**
1. Go to "Permissions" tab
2. View permission matrix
3. Edit role permissions
4. Save changes

**Expected Results:**
- ✅ Permission matrix displayed
- ✅ Shows all modules and actions
- ✅ Can toggle permissions on/off
- ✅ Changes apply immediately
- ✅ Audit log records changes

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

## Module 8: Tenant/Licensing

### Test Case 8.1: View License Overview
**Steps:**
1. Login as admin
2. Click "Licensing" in sidebar
3. View license dashboard

**Expected Results:**
- ✅ Current plan displayed (Professional)
- ✅ Seat usage shown (e.g., 3/25)
- ✅ Storage usage shown
- ✅ Plan features listed
- ✅ Billing date displayed

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 8.2: Purchase Additional Seats
**Steps:**
1. Click "Purchase Seats" button
2. Enter number of seats: `5`
3. View price calculation
4. Click "Purchase"
5. Confirm order

**Expected Results:**
- ✅ Price calculated correctly ($50 × 5 = $250)
- ✅ Order summary displayed
- ✅ Seat count updated (25 → 30)
- ✅ Success message shown
- ✅ Invoice generated

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 8.3: View Usage Statistics
**Steps:**
1. In Licensing page, view "Usage" tab
2. Check employee count
3. Check storage usage
4. View feature usage

**Expected Results:**
- ✅ Employee count accurate (3/30)
- ✅ Storage shown (e.g., 2.3 GB / 50 GB)
- ✅ Progress bars displayed
- ✅ Usage percentages calculated
- ✅ Warning if approaching limits

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 8.4: View Billing History
**Steps:**
1. Click "Billing History" tab
2. View past invoices
3. Download invoice PDF

**Expected Results:**
- ✅ Table with past invoices
- ✅ Columns: Date, Description, Amount, Status
- ✅ Can download PDF (if implemented)
- ✅ Shows payment status (Paid/Pending)

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 8.5: Upgrade Plan Dialog
**Steps:**
1. Click "Upgrade Plan" button
2. View available plans
3. Compare features
4. Close dialog without upgrading

**Expected Results:**
- ✅ Plan comparison table shown
- ✅ Features listed per plan
- ✅ Pricing displayed
- ✅ Can close without action
- ✅ Current plan highlighted

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

## Module 9: Email Templates

### Test Case 9.1: View Email Templates
**Steps:**
1. Login as admin
2. Click "Email Templates" in sidebar
3. View templates list

**Expected Results:**
- ✅ Templates table displayed
- ✅ 5 pre-built templates visible
- ✅ Columns: Name, Category, Subject, Status
- ✅ Actions: Preview, Edit, Delete, Duplicate
- ✅ SMTP Settings button visible

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 9.2: Preview Email Template
**Steps:**
1. Click "Preview" on "Employee Welcome Email"
2. Fill in variable values:
   - companyName: `CentraPro`
   - employeeName: `John Doe`
   - startDate: `2025-01-15`
3. Click "Update Preview"
4. View rendered HTML

**Expected Results:**
- ✅ Variable input form displayed
- ✅ HTML preview rendered with values
- ✅ Variables substituted correctly
- ✅ Email looks professional
- ✅ Links and formatting intact

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 9.3: Edit Email Template
**Steps:**
1. Click "Edit" on any template
2. Change subject line
3. Modify body HTML
4. Add new variable: `{{department}}`
5. Click "Save"

**Expected Results:**
- ✅ Template updated
- ✅ New variable extracted automatically
- ✅ Changes reflected in preview
- ✅ Success message displayed

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 9.4: Create New Template
**Steps:**
1. Click "Create Template" button
2. Fill in details:
   - Name: `Birthday Greeting`
   - Category: `Notifications`
   - Subject: `Happy Birthday {{employeeName}}!`
   - Body: HTML with {{employeeName}} variable
3. Click "Create"

**Expected Results:**
- ✅ New template created
- ✅ Appears in templates list
- ✅ Variables extracted correctly
- ✅ Can preview immediately

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 9.5: Configure SMTP Settings
**Steps:**
1. Click "SMTP Settings" button
2. Verify configuration:
   - Host: `smtp.office365.com`
   - Port: `587`
   - SSL/TLS: OFF
   - Username: `invoice@rightarc.com`
   - Password: (configured)
3. Click "Test Connection"

**Expected Results:**
- ✅ Connection test successful
- ✅ Success message: "SMTP connection test successful"
- ✅ No errors in backend logs
- ✅ Settings saved

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 9.6: Send Test Email
**Steps:**
1. In SMTP Settings dialog
2. Click "Send Test Email" button
3. Enter recipient email: `your-email@example.com`
4. Click "Send"
5. Check recipient inbox

**Expected Results:**
- ✅ Email sent successfully
- ✅ Success message displayed
- ✅ Email received in inbox
- ✅ Email has correct branding
- ✅ Backend logs show: `[EMAIL] Test email sent`

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 9.7: Duplicate Template
**Steps:**
1. Click "Duplicate" on any template
2. Modify the duplicated template name
3. Click "Duplicate"

**Expected Results:**
- ✅ Template duplicated
- ✅ New template appears in list
- ✅ Has " (Copy)" appended to name
- ✅ All content copied correctly

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 9.8: Delete Template
**Steps:**
1. Click "Delete" on a template
2. Confirm deletion
3. Click "Delete" in dialog

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ Template removed from list
- ✅ Success message displayed
- ✅ Cannot be recovered

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

## Module 10: Invoicing

### Test Case 10.1: View Invoices List
**Steps:**
1. Login as admin
2. Click "Invoicing" in sidebar
3. View invoices dashboard

**Expected Results:**
- ✅ Invoices table displayed
- ✅ Columns: Invoice #, Customer, Amount, Date, Status
- ✅ "Create Invoice" button visible
- ✅ Filter/search available
- ✅ At least 3 sample invoices visible

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 10.2: Create New Invoice
**Steps:**
1. Click "Create Invoice" button
2. Fill in details:
   - Customer: `Acme Corp`
   - Invoice Date: Today
   - Due Date: 30 days later
   - Items:
     - Service: `Consulting`, Qty: 10, Rate: $150
     - Service: `Development`, Qty: 20, Rate: $100
3. Review total calculation
4. Click "Create Invoice"

**Expected Results:**
- ✅ Invoice created successfully
- ✅ Total calculated: $3,500
- ✅ Invoice appears in list
- ✅ Status: Draft or Pending
- ✅ Invoice number generated automatically

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 10.3: Edit Invoice
**Steps:**
1. Click "Edit" on a draft invoice
2. Change customer name
3. Add new line item
4. Update total
5. Click "Save"

**Expected Results:**
- ✅ Invoice updated
- ✅ Total recalculated automatically
- ✅ Changes reflected in list
- ✅ Success message displayed

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 10.4: View Invoice Details
**Steps:**
1. Click on an invoice number
2. View invoice detail page
3. Check all information

**Expected Results:**
- ✅ Full invoice details displayed
- ✅ Customer information shown
- ✅ Line items listed with calculations
- ✅ Tax and total displayed
- ✅ Payment status visible
- ✅ Actions available (Edit, Delete, Send)

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 10.5: Filter Invoices
**Steps:**
1. Use filter dropdown
2. Select "Paid" status
3. Observe filtered results

**Expected Results:**
- ✅ Only paid invoices shown
- ✅ Count updated
- ✅ Can clear filter
- ✅ Multiple filters can be applied

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 10.6: Search Invoices
**Steps:**
1. Use search bar
2. Search by customer name: `Acme`
3. Observe results

**Expected Results:**
- ✅ Matching invoices displayed
- ✅ Search is case-insensitive
- ✅ Real-time results

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

### Test Case 10.7: Update Payment Status
**Steps:**
1. Click on an invoice with "Pending" status
2. Click "Mark as Paid" button
3. Enter payment details (date, method)
4. Click "Confirm"

**Expected Results:**
- ✅ Status updated to "Paid"
- ✅ Payment date recorded
- ✅ Success message displayed
- ✅ Cannot edit paid invoice

**Status:** [ ] Pass [ ] Fail  
**Notes:** _____________________

---

## Test Results Summary

### Overall Test Statistics

**Total Test Cases:** 78  
**Passed:** _____ / 78  
**Failed:** _____ / 78  
**Pass Rate:** _____% 

### Module Status

| Module | Total Tests | Passed | Failed | Status |
|--------|-------------|--------|--------|--------|
| Authentication & Login | 4 | ___ | ___ | ⬜ |
| Employee Management | 5 | ___ | ___ | ⬜ |
| Onboarding System | 3 | ___ | ___ | ⬜ |
| Leave Management | 5 | ___ | ___ | ⬜ |
| Timesheets | 5 | ___ | ___ | ⬜ |
| Approvals Workflow | 3 | ___ | ___ | ⬜ |
| Admin Console & RBAC | 5 | ___ | ___ | ⬜ |
| Tenant/Licensing | 5 | ___ | ___ | ⬜ |
| Email Templates | 8 | ___ | ___ | ⬜ |
| Invoicing | 7 | ___ | ___ | ⬜ |

---

## Critical Issues Found

### High Priority 🔴
_List any critical bugs that prevent core functionality_

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Medium Priority 🟡
_List issues that affect user experience but have workarounds_

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Low Priority 🟢
_List minor issues or improvements_

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

---

## Recommendations

### Before Production Deployment

- [ ] All critical issues resolved
- [ ] Pass rate ≥ 95%
- [ ] Performance testing completed
- [ ] Security audit performed
- [ ] Backup and recovery tested
- [ ] Documentation updated
- [ ] User training materials prepared

### Performance Benchmarks

- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Support for 50+ concurrent users
- [ ] Database queries optimized
- [ ] Frontend bundle size < 2MB

### Security Checklist

- [ ] JWT tokens properly secured
- [ ] Password hashing implemented
- [ ] CORS configured correctly
- [ ] SQL injection prevention
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented
- [ ] Rate limiting configured

---

## Testing Environment Details

**Browser:** ___________________  
**OS:** ___________________  
**Node Version:** ___________________  
**Database:** ___________________  

**Tested By:** ___________________  
**Date:** ___________________  
**Testing Duration:** ___________________  

---

## Sign-off

**QA Lead:** ___________________ Date: ___________  
**Developer:** ___________________ Date: ___________  
**Project Manager:** ___________________ Date: ___________  

---

**Testing Status:** ⬜ In Progress  ⬜ Completed  ⬜ Approved  

