/**
 * SharePoint Setup Script
 * Creates all required SharePoint lists with proper columns
 * Run this once to initialize your SharePoint site
 */

require('dotenv').config();
const sharepointService = require('./sharepoint-service');

// List definitions with columns
const listDefinitions = {
  Timesheets: [
    { name: 'EmployeeId', text: {} },
    { name: 'EmployeeName', text: {} },
    { name: 'WeekStart', dateTime: {} },
    { name: 'WeekEnd', dateTime: {} },
    { name: 'Project', text: {} },
    { name: 'Task', text: {} },
    { name: 'MondayHours', number: { decimalPlaces: 1 } },
    { name: 'TuesdayHours', number: { decimalPlaces: 1 } },
    { name: 'WednesdayHours', number: { decimalPlaces: 1 } },
    { name: 'ThursdayHours', number: { decimalPlaces: 1 } },
    { name: 'FridayHours', number: { decimalPlaces: 1 } },
    { name: 'SaturdayHours', number: { decimalPlaces: 1 } },
    { name: 'SundayHours', number: { decimalPlaces: 1 } },
    { name: 'TotalHours', number: { decimalPlaces: 1 } },
    { name: 'HourlyRate', number: { decimalPlaces: 2 } },
    { name: 'TotalAmount', number: { decimalPlaces: 2 } },
    { name: 'Billable', boolean: {} },
    { 
      name: 'Status', 
      choice: { 
        choices: ['Pending', 'Submitted', 'Approved', 'Rejected'],
        displayAs: 'dropDownMenu'
      } 
    },
    { name: 'SubmittedAt', dateTime: {} },
    { name: 'ApprovedBy', number: {} },
    { name: 'ApprovedAt', dateTime: {} },
    { name: 'RejectionReason', text: { allowMultipleLines: true } },
  ],
  
  Employees: [
    { name: 'EmployeeId', number: {} },
    { name: 'Email', text: {} },
    { name: 'Department', text: {} },
    { name: 'Position', text: {} },
    { name: 'HireDate', dateTime: {} },
    { name: 'Manager', text: {} },
    { 
      name: 'Status', 
      choice: { 
        choices: ['Active', 'Inactive', 'On Leave'],
        displayAs: 'dropDownMenu'
      } 
    },
    { name: 'HourlyRate', number: { decimalPlaces: 2 } },
    { name: 'Phone', text: {} },
    { name: 'Address', text: { allowMultipleLines: true } },
  ],
  
  Projects: [
    { name: 'ProjectCode', text: {} },
    { name: 'ClientName', text: {} },
    { name: 'StartDate', dateTime: {} },
    { name: 'EndDate', dateTime: {} },
    { name: 'Budget', number: { decimalPlaces: 2 } },
    { name: 'ProjectManager', text: {} },
    { 
      name: 'Status', 
      choice: { 
        choices: ['Active', 'Completed', 'On Hold', 'Cancelled'],
        displayAs: 'dropDownMenu'
      } 
    },
    { name: 'Description', text: { allowMultipleLines: true } },
  ],
  
  Tasks: [
    { 
      name: 'TaskCategory', 
      choice: { 
        choices: ['Development', 'Testing', 'Design', 'Documentation', 'Meeting'],
        displayAs: 'dropDownMenu'
      } 
    },
    { name: 'Description', text: { allowMultipleLines: true } },
    { name: 'EstimatedHours', number: { decimalPlaces: 1 } },
    { name: 'BillableDefault', boolean: {} },
  ],
  
  Invoices: [
    { name: 'InvoiceNumber', text: {} },
    { name: 'InvoiceDate', dateTime: {} },
    { name: 'VendorEmail', text: {} },
    { name: 'ClientName', text: {} },
    { name: 'TotalHours', number: { decimalPlaces: 1 } },
    { name: 'TotalAmount', number: { decimalPlaces: 2 } },
    { 
      name: 'Status', 
      choice: { 
        choices: ['Draft', 'Sent', 'Paid', 'Overdue'],
        displayAs: 'dropDownMenu'
      } 
    },
    { name: 'DueDate', dateTime: {} },
    { name: 'WeeksIncluded', text: { allowMultipleLines: true } },
    { name: 'SentAt', dateTime: {} },
    { name: 'PaidAt', dateTime: {} },
  ],
  
  LeaveRequests: [
    { name: 'EmployeeId', number: {} },
    { 
      name: 'LeaveType', 
      choice: { 
        choices: ['Vacation', 'Sick', 'Personal', 'Unpaid'],
        displayAs: 'dropDownMenu'
      } 
    },
    { name: 'StartDate', dateTime: {} },
    { name: 'EndDate', dateTime: {} },
    { name: 'TotalDays', number: {} },
    { name: 'Reason', text: { allowMultipleLines: true } },
    { 
      name: 'Status', 
      choice: { 
        choices: ['Pending', 'Approved', 'Rejected'],
        displayAs: 'dropDownMenu'
      } 
    },
    { name: 'ApprovedBy', number: {} },
    { name: 'ApprovedAt', dateTime: {} },
    { name: 'RejectionReason', text: { allowMultipleLines: true } },
  ],
  
  Users: [
    { name: 'Email', text: {} },
    { name: 'Password', text: {} },
    { 
      name: 'Role', 
      choice: { 
        choices: ['admin', 'manager', 'user'],
        displayAs: 'dropDownMenu'
      } 
    },
    { name: 'EmployeeId', number: {} },
    { name: 'Active', boolean: {} },
    { name: 'LastLogin', dateTime: {} },
  ],
  
  AuditLogs: [
    { name: 'UserId', number: {} },
    { name: 'UserEmail', text: {} },
    { name: 'Action', text: {} },
    { name: 'Resource', text: {} },
    { name: 'ResourceId', number: {} },
    { name: 'Details', text: { allowMultipleLines: true } },
    { name: 'IPAddress', text: {} },
    { name: 'Timestamp', dateTime: {} },
  ],
};

async function setupSharePointLists() {
  console.log('🚀 Starting SharePoint setup...\n');

  try {
    // Verify connection
    console.log('1️⃣ Verifying SharePoint connection...');
    const siteId = await sharepointService.getSiteId();
    console.log(`✅ Connected to SharePoint site: ${siteId}\n`);

    // Create lists
    console.log('2️⃣ Creating SharePoint lists...');
    for (const [listName, columns] of Object.entries(listDefinitions)) {
      try {
        // Check if list exists
        const existingList = await sharepointService.getList(listName);
        
        if (existingList) {
          console.log(`⏭️  List "${listName}" already exists, skipping...`);
          continue;
        }

        // Create list
        console.log(`📝 Creating list: ${listName}...`);
        await sharepointService.createList(listName, columns);
        console.log(`✅ Created list: ${listName} with ${columns.length} columns\n`);
        
        // Wait a bit between list creations to avoid throttling
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ Error creating list ${listName}:`, error.message);
      }
    }

    console.log('\n🎉 SharePoint setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Verify lists in SharePoint: ' + process.env.SHAREPOINT_SITE_URL);
    console.log('2. Run: node migrate-to-sharepoint.js (to populate sample data)');
    console.log('3. Start server: node index-sharepoint.js\n');
    
  } catch (error) {
    console.error('\n❌ SharePoint setup failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Verify .env file contains correct Azure AD credentials');
    console.error('2. Ensure SharePoint site URL is correct');
    console.error('3. Check Azure AD app permissions (Sites.ReadWrite.All)');
    console.error('4. Verify admin consent is granted\n');
    process.exit(1);
  }
}

// Run setup
setupSharePointLists();
