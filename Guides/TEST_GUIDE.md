# Quick Test Guide

## Login
- Email: `admin@example.com`
- Password: `Password123`

## Test Timesheet with New Features

1. **Navigate to Timesheets**
   - Click "Timesheets" in sidebar
   - Should show existing timesheets table

2. **Add New Timesheet**
   - Click "+ Add New Timesheet" button
   - Dialog opens with:
     - Project dropdown (select any project)
     - Date picker showing current week
     - Week navigation arrows (Previous/Next)
     - Display: "Week of [Date] - [Date]"
     - 7 days with checkboxes

3. **Test Date Navigation**
   - Click left arrow to go to previous week
   - Click right arrow to go to next week
   - Click date picker to jump to specific date
   - Watch week dates update automatically

4. **Fill in Hours**
   - Check boxes for days you worked
   - Enter hours (e.g., 8, 8, 8, 8, 8 for M-F)
   - Note: Hours field only enabled when checkbox is checked
   - Leave unchecked days empty

5. **Submit**
   - Click "Submit"
   - Dialog closes
   - Timesheets table updates with new entry
   - Verify week appears with correct total hours

6. **Resubmit Week**
   - Click on any week row to select it
   - Click "Resubmit" button
   - Dialog opens with pre-filled data
   - Modify hours as needed
   - Click "Update"
   - Table updates with new values

## Test Invoicing

1. **Navigate to Invoicing**
   - Click "Invoicing" in sidebar (with Receipt icon)
   - Should show generation form and empty invoice list

2. **Generate Invoice**
   - Select employee from dropdown (e.g., "Ramesh Y")
   - Select month (e.g., "July")
   - Select year (2025)
   - Click "Check & Generate"
   - If employee has 4+ weeks submitted in that month:
     - Shows success message
     - Dialog opens with invoice details
     - Displays employee name, period, total hours, total amount
   - If less than 4 weeks:
     - Shows error: "Employee has only X weeks submitted. Need at least 4 weeks."

3. **Send Invoice**
   - In confirmation dialog, click "Send to Vendor"
   - Shows success message
   - Invoice appears in table below with:
     - Invoice ID
     - Employee name
     - Period (Month Year)
     - Total hours
     - Amount (blue, bold)
     - Generated date
     - Status (yellow "Generated" or green "Sent")

4. **Download Invoice PDF**
   - In invoices table, click download icon (arrow down)
   - Downloads HTML file: `Invoice-{ID}-{EmployeeName}.html`
   - Open in browser to view formatted invoice
   - Contains all invoice details in professional format

5. **Filter by Different Employee**
   - Change employee selection
   - Table immediately filters to show only that employee's invoices
   - Try with different employees to see filtering works

## Test Data Submitted to Backend

All timesheet entries and invoices are stored in backend memory and can be verified:
- Frontend shows real data from backend API
- Each day submitted creates separate timesheet entry
- Invoices stored with all metadata

## Expected Behavior

✅ Timesheet dialog shows week dates and navigation
✅ Only checked days are submitted
✅ Hours field only enabled for selected days
✅ Hours persist when switching dates in same dialog
✅ Invoice generated only with 4+ weeks data
✅ Invoice table filters by employee
✅ PDF downloads with invoice details
✅ Status updates to "Sent" after sending
✅ Real data from backend displays in all tables

