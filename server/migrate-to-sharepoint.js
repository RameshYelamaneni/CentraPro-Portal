/**
 * Migration Script - In-Memory to SharePoint
 * Migrates existing sample data to SharePoint lists
 */

require('dotenv').config();
const sharepointService = require('./sharepoint-service');

// Sample data to migrate
const sampleData = {
  Users: [
    {
      Title: 'Admin User',
      Email: 'admin@example.com',
      Password: 'Password123', // In production, use bcrypt
      Role: 'admin',
      EmployeeId: 1,
      Active: true,
      LastLogin: new Date().toISOString()
    },
    {
      Title: 'Manager User',
      Email: 'manager@example.com',
      Password: 'manager123',
      Role: 'manager',
      EmployeeId: 2,
      Active: true,
      LastLogin: new Date().toISOString()
    },
    {
      Title: 'Regular User',
      Email: 'user@example.com',
      Password: 'Password123',
      Role: 'user',
      EmployeeId: 3,
      Active: true,
      LastLogin: new Date().toISOString()
    }
  ],

  Projects: [
    {
      Title: 'Spruce',
      ProjectCode: 'SPR-001',
      ClientName: 'Tech Corp',
      StartDate: new Date('2025-01-01').toISOString(),
      EndDate: new Date('2025-12-31').toISOString(),
      Budget: 500000,
      ProjectManager: 'John Smith',
      Status: 'Active',
      Description: 'Enterprise software development project'
    },
    {
      Title: 'Pine',
      ProjectCode: 'PIN-001',
      ClientName: 'Retail Solutions',
      StartDate: new Date('2025-02-01').toISOString(),
      EndDate: new Date('2025-08-31').toISOString(),
      Budget: 250000,
      ProjectManager: 'Jane Doe',
      Status: 'Active',
      Description: 'E-commerce platform development'
    },
    {
      Title: 'Oak',
      ProjectCode: 'OAK-001',
      ClientName: 'Finance Group',
      StartDate: new Date('2024-10-01').toISOString(),
      EndDate: new Date('2025-03-31').toISOString(),
      Budget: 350000,
      ProjectManager: 'Bob Wilson',
      Status: 'Active',
      Description: 'Financial analytics dashboard'
    }
  ],

  Tasks: [
    {
      Title: 'Development',
      TaskCategory: 'Development',
      Description: 'Software development and coding',
      EstimatedHours: 40,
      BillableDefault: true
    },
    {
      Title: 'Testing',
      TaskCategory: 'Testing',
      Description: 'Quality assurance and testing',
      EstimatedHours: 16,
      BillableDefault: true
    },
    {
      Title: 'Design',
      TaskCategory: 'Design',
      Description: 'UI/UX design work',
      EstimatedHours: 20,
      BillableDefault: true
    },
    {
      Title: 'Documentation',
      TaskCategory: 'Documentation',
      Description: 'Technical documentation',
      EstimatedHours: 8,
      BillableDefault: true
    }
  ],

  Employees: [
    {
      Title: 'John Developer',
      EmployeeId: 1,
      Email: 'john@example.com',
      Department: 'Engineering',
      Position: 'Senior Developer',
      HireDate: new Date('2024-01-15').toISOString(),
      Manager: 'Manager User',
      Status: 'Active',
      HourlyRate: 65,
      Phone: '555-0101',
      Address: '123 Main St, City, State 12345'
    },
    {
      Title: 'Jane Designer',
      EmployeeId: 2,
      Email: 'jane@example.com',
      Department: 'Design',
      Position: 'UX Designer',
      HireDate: new Date('2024-03-01').toISOString(),
      Manager: 'Manager User',
      Status: 'Active',
      HourlyRate: 60,
      Phone: '555-0102',
      Address: '456 Oak Ave, City, State 12345'
    }
  ],

  Timesheets: [
    // Week 1: Dec 01-07, 2025
    {
      Title: 'Spruce - Development - Week 1',
      EmployeeId: 1,
      EmployeeName: 'John Developer',
      WeekStart: new Date('2025-12-01').toISOString(),
      WeekEnd: new Date('2025-12-07').toISOString(),
      Project: 'Spruce',
      Task: 'Development',
      MondayHours: 8,
      TuesdayHours: 8,
      WednesdayHours: 8,
      ThursdayHours: 8,
      FridayHours: 8,
      SaturdayHours: 0,
      SundayHours: 0,
      TotalHours: 40,
      HourlyRate: 65,
      TotalAmount: 2600,
      Billable: true,
      Status: 'Pending',
      SubmittedAt: null,
      ApprovedBy: null,
      ApprovedAt: null,
      RejectionReason: null
    },
    // Week 2: Dec 08-14, 2025
    {
      Title: 'Spruce - Development - Week 2',
      EmployeeId: 1,
      EmployeeName: 'John Developer',
      WeekStart: new Date('2025-12-08').toISOString(),
      WeekEnd: new Date('2025-12-14').toISOString(),
      Project: 'Spruce',
      Task: 'Development',
      MondayHours: 8,
      TuesdayHours: 8,
      WednesdayHours: 8,
      ThursdayHours: 8,
      FridayHours: 8,
      SaturdayHours: 0,
      SundayHours: 0,
      TotalHours: 40,
      HourlyRate: 65,
      TotalAmount: 2600,
      Billable: true,
      Status: 'Approved',
      SubmittedAt: new Date('2025-12-14').toISOString(),
      ApprovedBy: 2,
      ApprovedAt: new Date('2025-12-15').toISOString(),
      RejectionReason: null
    }
  ]
};

async function migrate() {
  console.log('🚀 Starting migration to SharePoint...\n');

  try {
    // Verify connection
    console.log('1️⃣ Verifying SharePoint connection...');
    const siteId = await sharepointService.getSiteId();
    console.log(`✅ Connected to site: ${siteId}\n`);

    // Migrate data for each list
    for (const [listName, items] of Object.entries(sampleData)) {
      console.log(`2️⃣ Migrating ${listName}...`);
      
      try {
        // Check if list exists
        const list = await sharepointService.getList(listName);
        if (!list) {
          console.error(`   ❌ List "${listName}" not found. Run sharepoint-setup.js first.`);
          continue;
        }

        // Create items
        let successCount = 0;
        for (const item of items) {
          try {
            await sharepointService.createListItem(listName, item);
            successCount++;
          } catch (error) {
            console.error(`   ⚠️  Failed to create item: ${error.message}`);
          }
        }

        console.log(`   ✅ Created ${successCount}/${items.length} items in ${listName}\n`);
        
        // Wait to avoid throttling
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`   ❌ Error migrating ${listName}:`, error.message);
      }
    }

    console.log('\n🎉 Migration completed!');
    console.log('\nNext step: Start the SharePoint-integrated server');
    console.log('Run: node index-sharepoint.js\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nEnsure you have:');
    console.error('1. Created all lists (run sharepoint-setup.js)');
    console.error('2. Configured .env file correctly');
    console.error('3. Granted proper API permissions\n');
    process.exit(1);
  }
}

migrate();
