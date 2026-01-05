# Portal Updates - December 3, 2025

## 1. Enhanced Timesheet Dialog

### New Features:
- **Date Range Picker**: Choose week start date with date picker
- **Previous/Next Week Navigation**: Arrow buttons to navigate between weeks
- **Week Display**: Shows "Week of [Date] - [Date]" for clarity
- **Daily Hours Input**: 
  - Show all 7 days with dates
  - Checkbox to select which days to include
  - Hours field only enabled when day is checked
  - Visual indicator (blue border) when day is selected
  - Each day shows: Day name | Hours input | Date

### Workflow:
1. Click "Add New Timesheet"
2. Select project from dropdown
3. Use date picker or arrow buttons to navigate to desired week
4. Check the days you worked
5. Enter hours for each checked day
6. Optionally upload file attachment
7. Click "Submit"
8. Days not checked are NOT submitted to backend

### Resubmit Flow:
- Same interface but pre-fills existing hours for that week
- "Update" button instead of "Submit"
- Can modify hours for any day and submit

---

## 2. Enhanced Invoicing Module

### Key Improvements:

#### Invoice Generation:
- **Employee Filter**: Select employee from dropdown
- **Month/Year Selection**: Choose any month/year combination
- **Automatic Validation**: 
  - Checks if employee has submitted 4+ weeks in that month
  - Shows error if incomplete
  - Displays all timesheets for that period
- **Real Data**: Uses actual submitted timesheets from backend

#### Invoice Details Shown:
- Invoice ID (randomly generated)
- Employee name
- Period (Month Year)
- Total hours worked
- Total amount ($50/hour rate)
- Generated date
- Status (Generated/Sent)

#### Invoice Table Filtered by Employee:
- Only shows invoices when employee is selected
- Displays:
  - Invoice ID
  - Employee name
  - Period (Month Year)
  - Total hours
  - Amount (formatted with $ sign, bold in blue)
  - Generated date
  - Status badge (yellow=Generated, green=Sent)
  - Download button

#### PDF Download:
- Click download icon on any invoice
- Generates HTML invoice document
- Downloads as: `Invoice-{ID}-{EmployeeName}.html`
- Includes:
  - Company header
  - Employee info and invoice date
  - Period details
  - Line item breakdown (Consulting Services)
  - Total amount
  - Generation timestamp
  - Professional formatting

#### Email Sending:
- Dialog confirms invoice details
- "Send to Vendor" button sends to vendor@example.com
- Shows success/error message
- Updates invoice status to "Sent" in table
- Adds to generated invoices list

### Backend Endpoints Added:
```
GET /api/invoices
- Returns all invoices

POST /api/invoices
- Creates new invoice
- Payload: { employeeId, month, year, totalHours, totalAmount, employeeName }

POST /api/invoices/send
- Sends invoice to vendor email
- Payload: { invoice, vendorEmail }
- Returns: { ok: true, message: "..." }
```

---

## 3. Data Flow

### Timesheets:
User fills dialog → Selects days → Enters hours → Submits
→ Backend POST /api/timesheets for each day
→ Stored in backend in-memory array
→ Can be retrieved via GET /api/timesheets

### Invoicing:
1. Select Employee
2. Choose Month/Year
3. Click "Check & Generate"
4. Backend validates (4+ weeks submitted)
5. Calculates total hours
6. Creates invoice object
7. Shows confirmation dialog
8. User clicks "Send to Vendor"
9. Backend stores invoice
10. Returns to list with new invoice visible

---

## 4. UI/UX Improvements

### Timesheet Dialog:
- Increased maxWidth from "sm" to "md" for better spacing
- Week date range displayed prominently
- Selected days have blue border highlight
- Only enabled inputs for selected days
- Previous/Next buttons with arrow icons

### Invoicing Interface:
- Employee filter shows current selection
- Contextual messages ("Select an employee", "No invoices yet")
- Color-coded status badges
- Download icon on each invoice
- Real-time table updates
- Success/error alerts
- Loading state during generation

---

## 5. Technical Stack

### Frontend Updates:
- Added `ArrowBackIcon` and `ArrowForwardIcon` from @mui/icons-material
- Added `DownloadIcon` for invoice download
- Enhanced date handling with `subWeeks` and `addWeeks` from date-fns
- PDF generation using HTML blob conversion
- Improved TypeScript interfaces for real data

### Backend Updates:
- Added `invoices` array to store generated invoices
- New POST /api/invoices endpoint
- New POST /api/invoices/send endpoint
- Invoice persistence in memory (survives until server restart)
- Structured invoice object with all required fields

---

## 6. Files Modified

### Frontend:
- `client/src/pages/Timesheets.tsx` - Enhanced dialog with date picker and week navigation
- `client/src/pages/Invoicing.tsx` - Added real data flow, filtering, PDF download
- `client/src/components/Sidebar.tsx` - Added Invoicing menu item with Receipt icon

### Backend:
- `server/index.js` - Added invoice endpoints and data storage

---

## 7. Next Steps / Future Enhancements

### Could Add:
- PDF generation library (jsPDF) for better formatting
- Email template customization
- Invoice numbering sequence
- Tax/GST calculation
- Multiple rate tiers by employee
- Invoice approval workflow
- Email notifications to employee
- Database persistence (instead of in-memory)
- Invoice history/archive
- Edit invoice details before sending
- Multiple vendor email addresses
- Invoice cancellation

