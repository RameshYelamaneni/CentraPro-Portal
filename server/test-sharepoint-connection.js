/**
 * Test SharePoint Connection
 * Verifies Azure AD authentication and SharePoint access
 */

require('dotenv').config();
const sharepointService = require('./sharepoint-service');

async function testConnection() {
  console.log('🧪 Testing SharePoint Connection\n');
  console.log('Configuration:');
  console.log(`- Tenant ID: ${process.env.AZURE_TENANT_ID ? '✓ Set' : '✗ Missing'}`);
  console.log(`- Client ID: ${process.env.AZURE_CLIENT_ID ? '✓ Set' : '✗ Missing'}`);
  console.log(`- Client Secret: ${process.env.AZURE_CLIENT_SECRET ? '✓ Set' : '✗ Missing'}`);
  console.log(`- Site URL: ${process.env.SHAREPOINT_SITE_URL || '✗ Missing'}`);
  console.log(`- Site Name: ${process.env.SHAREPOINT_SITE_NAME || '✗ Missing'}\n`);

  if (!process.env.AZURE_TENANT_ID || !process.env.AZURE_CLIENT_ID || !process.env.AZURE_CLIENT_SECRET) {
    console.error('❌ Missing required environment variables!');
    console.error('Please check your .env file\n');
    process.exit(1);
  }

  try {
    // Test 1: Get Site ID
    console.log('Test 1: Getting SharePoint site...');
    const siteId = await sharepointService.getSiteId();
    console.log(`✅ Site ID: ${siteId}\n`);

    // Test 2: List all lists
    console.log('Test 2: Getting all lists...');
    const lists = await sharepointService.client
      .api(`/sites/${siteId}/lists`)
      .get();
    
    console.log(`✅ Found ${lists.value.length} lists:`);
    lists.value.forEach(list => {
      console.log(`   - ${list.displayName} (${list.id})`);
    });
    console.log();

    // Test 3: Check for required lists
    console.log('Test 3: Checking for required lists...');
    const requiredLists = ['Timesheets', 'Employees', 'Projects', 'Tasks', 'Invoices', 'LeaveRequests', 'Users', 'AuditLogs'];
    const existingListNames = lists.value.map(l => l.displayName);
    
    requiredLists.forEach(listName => {
      if (existingListNames.includes(listName)) {
        console.log(`   ✅ ${listName}`);
      } else {
        console.log(`   ⚠️  ${listName} - NOT FOUND`);
      }
    });
    console.log();

    console.log('🎉 SharePoint connection test successful!\n');
    
    const missingLists = requiredLists.filter(l => !existingListNames.includes(l));
    if (missingLists.length > 0) {
      console.log('📝 Next step: Create missing lists');
      console.log('   Run: node sharepoint-setup.js\n');
    } else {
      console.log('✅ All required lists exist!');
      console.log('📝 Next step: Start the server');
      console.log('   Run: node index-sharepoint.js\n');
    }

  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Verify Azure AD app registration');
    console.error('2. Check API permissions (Sites.ReadWrite.All)');
    console.error('3. Ensure admin consent is granted');
    console.error('4. Verify SharePoint site URL format\n');
    console.error('Expected format: rightarcconsulting.sharepoint.com:/sites/YourSiteName');
    console.error('Your current: ' + process.env.SHAREPOINT_SITE_NAME + '\n');
    process.exit(1);
  }
}

testConnection();
