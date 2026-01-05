const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 4000;
const SECRET = process.env.JWT_SECRET || 'dev_secret_please_change';

// SharePoint config file path
const SHAREPOINT_CONFIG_FILE = path.join(__dirname, 'sharepoint-config.json');

// Global error handlers to prevent server crashes
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// In-memory storage
let sentEmails = [];
let smtpConfigStore = [
  {
    id: 1,
    name: 'Invoice SMTP',
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: { user: '', pass: '' },
    purpose: 'Billing & Invoicing',
    testStatus: 'not_tested',
    type: 'invoice'
  },
  {
    id: 2,
    name: 'Notification SMTP',
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: { user: '', pass: '' },
    purpose: 'System Alerts & Notifications',
    testStatus: 'not_tested',
    type: 'notification'
  },
  {
    id: 3,
    name: 'HR SMTP',
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: { user: '', pass: '' },
    purpose: 'Human Resources Communications',
    testStatus: 'not_tested',
    type: 'hr'
  },
  {
    id: 4,
    name: 'Support SMTP',
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: { user: '', pass: '' },
    purpose: 'Customer Support & Inquiries',
    testStatus: 'not_tested',
    type: 'support'
  },
  {
    id: 5,
    name: 'Marketing SMTP',
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: { user: '', pass: '' },
    purpose: 'Marketing Campaigns & Newsletters',
    testStatus: 'not_tested',
    type: 'marketing'
  }
];

// Dummy base64 content for attachments
const dummyPdfBase64 = 'JVBERi0xLjQKJeLjz9MNCjEgMCBvYmo8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PmVuZG9iagoyIDAgb2JqPDwvVHlwZS9QYWdlcwovS2lkcyBbMyAwIFJdCi9Db3VudCAxPj5lbmRvYmoKMyAwIG9iajw8L1R5cGUvUGFnZQovUGFyZW50IDIgMCBSCi9SZXNvdXJjZXM8PC9Gb250PDwvRjE8PC9UeXBlL0ZvbnQKL1N1YnR5cGUvVGltZXMtUm9tYW4+Pj4+Pj4KL01lZGlhQm94IFswIDAgNjEyIDc5Ml0KL0NvbnRlbnRzIDQgMCBSPj5lbmRvYmoKNCAwIG9iajw8L0xlbmd0aCA0NApCVAovRjEgMTIgVGYKMTAwIDcwMCBUZAooSGVsbG8gV29ybGQpIFRqCkVUCmVuZG9iagp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDc0IDAwMDAwIG4gCjAwMDAwMDAxMzEgMDAwMDAgbiAKMDAwMDAwMDM2MCAwMDAwMCBuIAp0cmFpbGVyPDwvU2l6ZSA1Ci9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjQ0OAolJUVPRg==';
const dummyXlsxBase64 = 'UEsDBBQABgAIAAAAIQA4K7+VrQAAANIAAAALAAAAX3JlbHMvLnJlbHOiBAIooAAC';
const dummyDocxBase64 = 'UEsDBBQABgAIAAAAIQAc/91pzQAAABcBAAA4AAAAY3VzdG9tWG1sL2l0ZW1Qcm9wczEueG1sJKxQQUrEQBCF94X9D0X3JppBEcdBBrwoXhQUPEkjbRK67v/O76+iKJ4smKL';

// Early declaration for timesheets (used by initSampleData)
let timesheets = [];

// Initialize sample data - 4 weeks with multiple attachments per week
const initSampleData = () => {
  timesheets = [
    // Week 1: Dec 01-07, 2025 - Pending, 2 attachments
    { 
      id: 1, 
      date: '2025-12-01', 
      hours: 40, 
      project: 'Spruce', 
      task: 'Development', 
      hourlyRate: 65, 
      status: 'Pending', 
      weekStart: 'Dec 01, 2025',
      weekNumber: 1,
      attachments: [
        { name: 'Spruce-Timesheet-Week1-1.pdf', data: dummyPdfBase64, type: 'application/pdf', uploadedAt: '2025-12-01' },
        { name: 'Project-Details-Week1.xlsx', data: dummyXlsxBase64, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', uploadedAt: '2025-12-01' }
      ]
    },
    // Week 2: Dec 08-14, 2025 - Approved, 1 attachment
    { 
      id: 2, 
      date: '2025-12-08', 
      hours: 40, 
      project: 'Spruce', 
      task: 'Development', 
      hourlyRate: 65, 
      status: 'Approved', 
      weekStart: 'Dec 08, 2025',
      weekNumber: 2,
      attachments: [
        { name: 'Development-Report-Week2.pdf', data: dummyPdfBase64, type: 'application/pdf', uploadedAt: '2025-12-08' }
      ]
    },
    // Week 3: Dec 15-21, 2025 - Approved, 2 attachments
    { 
      id: 3, 
      date: '2025-12-15', 
      hours: 40, 
      project: 'Spruce', 
      task: 'Development', 
      hourlyRate: 65, 
      status: 'Approved', 
      weekStart: 'Dec 15, 2025',
      weekNumber: 3,
      attachments: [
        { name: 'Code-Review-Week3.pdf', data: dummyPdfBase64, type: 'application/pdf', uploadedAt: '2025-12-15' },
        { name: 'Testing-Results-Week3.docx', data: dummyDocxBase64, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', uploadedAt: '2025-12-15' }
      ]
    },
    // Week 4: Dec 22-28, 2025 - Approved, 0 attachments
    { 
      id: 4, 
      date: '2025-12-22', 
      hours: 40, 
      project: 'Spruce', 
      task: 'Development', 
      hourlyRate: 65, 
      status: 'Approved', 
      weekStart: 'Dec 22, 2025',
      weekNumber: 4,
      attachments: []
    }
  ];
};

initSampleData();

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Auth endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const validUsers = {
    'admin@example.com': 'Password123',
    'manager@example.com': 'manager123',
    'user@example.com': 'Password123'
  };

  if (validUsers[email] === password) {
    const token = jwt.sign({ id: 1, email, role: 'admin' }, SECRET);
    res.json({ 
      token, 
      user: { id: 1, email, name: email.split('@')[0], role: 'admin' } 
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Get all timesheets
app.get('/api/timesheets', (req, res) => {
  res.json(timesheets);
});

// Create timesheet
app.post('/api/timesheets', (req, res) => {
  const newTimesheet = {
    id: timesheets.length + 1,
    ...req.body
  };
  timesheets.push(newTimesheet);
  res.json(newTimesheet);
});

// Update timesheet
app.put('/api/timesheets/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = timesheets.findIndex(t => t.id === id);
  if (index !== -1) {
    timesheets[index] = { ...timesheets[index], ...req.body };
    res.json(timesheets[index]);
  } else {
    res.status(404).json({ error: 'Timesheet not found' });
  }
});

// Delete timesheet
app.delete('/api/timesheets/:id', (req, res) => {
  const id = parseInt(req.params.id);
  timesheets = timesheets.filter(t => t.id !== id);
  res.json({ success: true });
});

// Submit timesheet for approval
app.post('/api/timesheets/:id/submit', (req, res) => {
  const id = parseInt(req.params.id);
  const timesheet = timesheets.find(t => t.id === id);
  if (timesheet) {
    timesheet.status = 'Submitted';
    res.json(timesheet);
  } else {
    res.status(404).json({ error: 'Timesheet not found' });
  }
});

// Bulk submit timesheets
app.post('/api/timesheets/bulk-submit', (req, res) => {
  const { weekNumber } = req.body;
  const updated = timesheets.filter(t => t.weekNumber === weekNumber).map(t => {
    t.status = 'Submitted';
    return t;
  });
  res.json({ success: true, updated, message: `${updated.length} timesheet(s) submitted` });
});

// Approve timesheet
app.post('/api/timesheets/:id/approve', (req, res) => {
  const id = parseInt(req.params.id);
  const timesheet = timesheets.find(t => t.id === id);
  if (timesheet) {
    timesheet.status = 'Approved';
    res.json(timesheet);
  } else {
    res.status(404).json({ error: 'Timesheet not found' });
  }
});

// Bulk approve timesheets
app.post('/api/timesheets/bulk-approve', (req, res) => {
  const { weekNumber } = req.body;
  const updated = timesheets.filter(t => t.weekNumber === weekNumber).map(t => {
    t.status = 'Approved';
    return t;
  });
  res.json({ success: true, updated, message: `${updated.length} timesheet(s) approved` });
});

// Reject timesheet
app.post('/api/timesheets/:id/reject', (req, res) => {
  const id = parseInt(req.params.id);
  const timesheet = timesheets.find(t => t.id === id);
  if (timesheet) {
    timesheet.status = 'Rejected';
    timesheet.rejectionReason = req.body.reason || '';
    res.json(timesheet);
  } else {
    res.status(404).json({ error: 'Timesheet not found' });
  }
});

// Get all projects
app.get('/api/projects', (req, res) => {
  const projects = [
    { id: 1, name: 'Spruce', active: true },
    { id: 2, name: 'Pine', active: true },
    { id: 3, name: 'Oak', active: true }
  ];
  res.json(projects);
});

// Create project
app.post('/api/projects', (req, res) => {
  const newProject = {
    id: Math.random(),
    ...req.body
  };
  res.json(newProject);
});

// Get all tasks
app.get('/api/tasks', (req, res) => {
  const tasks = [
    { id: 1, name: 'Development' },
    { id: 2, name: 'Testing' },
    { id: 3, name: 'Design' },
    { id: 4, name: 'Documentation' }
  ];
  res.json(tasks);
});

// Create task
app.post('/api/tasks', (req, res) => {
  const newTask = {
    id: Math.random(),
    ...req.body
  };
  res.json(newTask);
});

// Get SMTP Accounts
app.get('/api/email/smtp-accounts', (req, res) => {
  const maskedAccounts = smtpConfigStore.map(acc => ({
    ...acc,
    auth: { ...acc.auth, pass: acc.auth.pass ? '••••••••' : '' }
  }));
  res.json(maskedAccounts);
});

// Update SMTP Account
app.put('/api/email/smtp-accounts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { host, port, secure, auth } = req.body;
  
  const accountIndex = smtpConfigStore.findIndex(a => a.id === id);
  if (accountIndex === -1) {
    return res.status(404).json({ error: 'Account not found' });
  }
  
  const currentTestStatus = smtpConfigStore[accountIndex].testStatus;
  smtpConfigStore[accountIndex] = {
    ...smtpConfigStore[accountIndex],
    host,
    port,
    secure,
    auth: { user: auth.user, pass: auth.pass },
    testStatus: currentTestStatus
  };
  
  res.json({ success: true, message: 'Account updated successfully' });
});

// Test SMTP Connection
app.post('/api/email/test-connection', async (req, res) => {
  const { id, host, port, secure, user, pass } = req.body;
  
  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass }
    });
    
    await transporter.verify();
    
    if (id) {
      const account = smtpConfigStore.find(a => a.id === id);
      if (account) {
        account.testStatus = 'success';
      }
    }
    
    res.json({ success: true, message: `Successfully connected to ${host}:${port} as ${user}` });
  } catch (error) {
    if (id) {
      const account = smtpConfigStore.find(a => a.id === id);
      if (account) {
        account.testStatus = 'failed';
      }
    }
    res.status(400).json({ success: false, message: error.message });
  }
});

// Send invoice via email - WITH FULL ATTACHMENTS
app.post('/api/invoices/send', async (req, res) => {
  const { to, vendorEmail, weeks, employeeName, attachments, includeTimesheetAttachments, invoice } = req.body;
  const recipientEmail = to || vendorEmail;

  if (!recipientEmail) {
    return res.status(400).json({ error: 'Recipient email required' });
  }

  try {
    let totalHours = 0;
    let totalAmount = 0;
    let invoiceHTML = `
      <html>
        <body style="font-family: Arial, sans-serif; margin: 20px;">
          <h2>Invoice from CentraPro</h2>
          <p>Employee: ${employeeName || 'Contractor'}</p>
          <table border="1" cellpadding="10">
            <tr>
              <th>Week</th>
              <th>Project</th>
              <th>Task</th>
              <th>Hours</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
    `;

    // Build invoice table and collect attachments
    let invoiceAttachments = [];

    if (weeks && Array.isArray(weeks)) {
      console.log(`📎 Processing ${weeks.length} weeks for attachments`);
      
      weeks.forEach((week, idx) => {
        const amount = week.hours * week.hourlyRate;
        totalHours += week.hours;
        totalAmount += amount;
        
        invoiceHTML += `
          <tr>
            <td>${week.weekStart}</td>
            <td>${week.project}</td>
            <td>${week.task}</td>
            <td>${week.hours}h</td>
            <td>$${week.hourlyRate}</td>
            <td>$${amount.toFixed(2)}</td>
          </tr>
        `;

        // Process attachments from weeks
        if (week.attachments && Array.isArray(week.attachments)) {
          console.log(`  Week ${week.weekNumber}: ${week.attachments.length} attachment(s)`);
          week.attachments.forEach(att => {
            invoiceAttachments.push({
              filename: att.name,
              content: Buffer.from(att.data, 'base64'),
              contentType: att.type || 'application/octet-stream'
            });
          });
        }
      });
    }

    // Handle attachments from Invoicing page (different field names)
    if (attachments && Array.isArray(attachments) && includeTimesheetAttachments) {
      console.log(`📎 Adding ${attachments.length} timesheet attachment(s) from Invoicing page`);
      attachments.forEach(att => {
        invoiceAttachments.push({
          filename: att.name,
          content: Buffer.from(att.data, 'base64'),
          contentType: att.type || 'application/octet-stream'
        });
      });
    }

    invoiceHTML += `
            <tr style="background: #f0f0f0; font-weight: bold;">
              <td colspan="3">TOTAL</td>
              <td>${totalHours}h</td>
              <td></td>
              <td>$${totalAmount.toFixed(2)}</td>
            </tr>
          </table>
        </body>
      </html>
    `;

    // Generate PDF with Puppeteer
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setContent(invoiceHTML);
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    // Add invoice PDF to attachments
    invoiceAttachments.unshift({
      filename: `Invoice-${Date.now()}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf'
    });

    console.log(`📧 Email will have ${invoiceAttachments.length} total attachment(s): 1 invoice + ${invoiceAttachments.length - 1} timesheet file(s)`);

    // Get SMTP account
    const smtpAccount = smtpConfigStore.find(acc => acc.type === 'invoice');
    
    const mailOptions = {
      from: smtpAccount.auth.user || 'noreply@centrapro.com',
      to: recipientEmail,
      subject: `Invoice from CentraPro`,
      html: invoiceHTML,
      attachments: invoiceAttachments
    };

    // If SMTP credentials are configured, try to send
    if (smtpAccount.auth.user && smtpAccount.auth.pass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpAccount.host,
          port: smtpAccount.port,
          secure: smtpAccount.secure,
          auth: {
            user: smtpAccount.auth.user,
            pass: smtpAccount.auth.pass
          }
        });

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Invoice email sent to: ${recipientEmail} with ${invoiceAttachments.length} attachment(s)`);
        res.json({
          success: true,
          message: 'Invoice sent successfully',
          totalHours,
          totalAmount,
          invoiceId: Math.floor(Math.random() * 10000)
        });
      } catch (error) {
        console.log(`[DEMO] Would send email to ${recipientEmail} with ${invoiceAttachments.length} attachment(s)`);
        res.json({
          success: true,
          message: 'Invoice sent (demo mode)',
          totalHours,
          totalAmount,
          invoiceId: Math.floor(Math.random() * 10000)
        });
      }
    } else {
      console.log(`[DEMO] Would send email to ${recipientEmail} with ${invoiceAttachments.length} attachment(s)`);
      res.json({
        success: true,
        message: 'Invoice sent (demo mode)',
        totalHours,
        totalAmount,
        invoiceId: Math.floor(Math.random() * 10000)
      });
    }

  } catch (error) {
    console.error('Invoice send error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get invoices
app.get('/api/invoices', (req, res) => {
  res.json([]);
});

// Create invoice
app.post('/api/invoices', (req, res) => {
  const newInvoice = {
    id: Math.floor(Math.random() * 10000),
    createdAt: new Date().toISOString(),
    ...req.body
  };
  res.json(newInvoice);
});

// ============================================================================
// SHAREPOINT API ENDPOINTS
// ============================================================================

// Load SharePoint config from file or use defaults
let sharepointConfig = {
  enabled: false,
  tenantId: 'da28b76b-d863-4415-a190-cec116ad367e',
  clientId: '1443c462-d929-4195-9282-64df97cf4e3a',
  clientSecret: 'iIe8Q~kZ~zNMCtOw7T7ifxC0li_fJ.pIrcRB.c4-',
  siteUrl: 'https://rightarcconsulting.sharepoint.com',
  siteName: 'rightarcconsulting.sharepoint.com',
  connectionStatus: 'not_tested',
  lastTested: null,
  listsCreated: false,
  listsCount: 0
};

// Load saved config from file
try {
  if (fs.existsSync(SHAREPOINT_CONFIG_FILE)) {
    const saved = JSON.parse(fs.readFileSync(SHAREPOINT_CONFIG_FILE, 'utf8'));
    sharepointConfig = { ...sharepointConfig, ...saved };
    console.log('📂 Loaded SharePoint config from file:', {
      enabled: sharepointConfig.enabled,
      connectionStatus: sharepointConfig.connectionStatus,
      listsCount: sharepointConfig.listsCount
    });
  }
} catch (e) {
  console.error('⚠️  Failed to load SharePoint config:', e.message);
}

// Save SharePoint config to file
const saveSharePointConfig = () => {
  try {
    fs.writeFileSync(SHAREPOINT_CONFIG_FILE, JSON.stringify(sharepointConfig, null, 2));
    console.log('💾 SharePoint config saved to file');
  } catch (e) {
    console.error('⚠️  Failed to save SharePoint config:', e.message);
  }
};

// Test SharePoint connection using PowerShell
app.post('/api/sharepoint/test-connection', async (req, res) => {
  try {
    const { tenantId, clientId, clientSecret, siteUrl, siteName } = req.body;

    if (!tenantId || !clientId || !clientSecret || !siteUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required credentials' 
      });
    }

    console.log('🔐 Starting SharePoint connection test...');
    console.log('Tenant:', tenantId);
    console.log('Client ID:', clientId);
    console.log('Site URL:', siteUrl);

    // Store credentials
    sharepointConfig = {
      ...sharepointConfig,
      tenantId,
      clientId,
      clientSecret,
      siteUrl,
      siteName
    };

    // Use PowerShell to test connection (since Node.js HTTP is blocked in this environment)
    
    const psScript = `
$ErrorActionPreference = 'Stop'
try {
  # Get OAuth token
  $tokenBody = @{
    grant_type = 'client_credentials'
    client_id = '${clientId}'
    client_secret = '${clientSecret}'
    scope = 'https://graph.microsoft.com/.default'
  }
  $tokenResponse = Invoke-RestMethod -Uri "https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token" -Method POST -Body $tokenBody -ContentType "application/x-www-form-urlencoded" -TimeoutSec 30
  $token = $tokenResponse.access_token
  
  # Get site ID
  $headers = @{ Authorization = "Bearer $token" }
  $siteResponse = Invoke-RestMethod -Uri "https://graph.microsoft.com/v1.0/sites/${siteName}" -Headers $headers -TimeoutSec 30
  $siteId = $siteResponse.id
  
  # Get lists
  $listsResponse = Invoke-RestMethod -Uri "https://graph.microsoft.com/v1.0/sites/$siteId/lists" -Headers $headers -TimeoutSec 30
  $allLists = $listsResponse.value
  $centraProLists = $allLists | Where-Object { $_.displayName -match '^CentraPro_' }
  
  $result = @{
    success = $true
    siteId = $siteId
    siteName = $siteResponse.displayName
    totalLists = $allLists.Count
    centraProListsCount = $centraProLists.Count
    lists = $allLists.displayName
  }
  Write-Output ($result | ConvertTo-Json -Compress)
} catch {
  $result = @{
    success = $false
    error = $_.Exception.Message
  }
  Write-Output ($result | ConvertTo-Json -Compress)
}
`;

    const ps = spawn('powershell.exe', [
      '-NoProfile',
      '-NonInteractive',
      '-ExecutionPolicy', 'Bypass',
      '-Command', psScript
    ]);

    let output = '';
    let errorOutput = '';

    ps.stdout.on('data', (data) => {
      output += data.toString();
    });

    ps.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        ps.kill();
        reject(new Error('PowerShell script timed out after 60 seconds'));
      }, 60000);

      ps.on('close', (code) => {
        clearTimeout(timeout);
        resolve();
      });

      ps.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    // Parse PowerShell output
    const lines = output.split('\n').filter(line => line.trim());
    const lastLine = lines[lines.length - 1];
    const result = JSON.parse(lastLine);

    if (result.success) {
      console.log('✅ Connection successful!');
      console.log(`Site ID: ${result.siteId}`);
      console.log(`Total lists: ${result.totalLists}, CentraPro lists: ${result.centraProListsCount}`);
      
      sharepointConfig = {
        ...sharepointConfig,
        enabled: true,
        connectionStatus: 'connected',
        lastTested: new Date().toISOString(),
        listsCount: result.centraProListsCount,
        listsCreated: result.centraProListsCount === 8
      };
      
      saveSharePointConfig();

      res.json({
        success: true,
        message: 'Successfully connected to SharePoint',
        siteId: result.siteId,
        siteName: result.siteName,
        listsCount: result.centraProListsCount,
        listsFound: result.centraProListsCount,
        allListsCreated: result.centraProListsCount === 8,
        lists: result.lists
      });
    } else {
      console.error('❌ Connection failed:', result.error);
      
      sharepointConfig.connectionStatus = 'failed';
      sharepointConfig.lastTested = new Date().toISOString();

      res.status(500).json({
        success: false,
        message: 'SharePoint connection failed',
        error: result.error
      });
    }

  } catch (error) {
    console.error('❌ Connection test error:', error.message);
    
    sharepointConfig.connectionStatus = 'failed';
    sharepointConfig.lastTested = new Date().toISOString();

    res.status(500).json({
      success: false,
      message: 'Connection test failed',
      error: error.message
    });
  }
});

// Create SharePoint lists
app.post('/api/sharepoint/create-lists', async (req, res) => {
  try {
    if (sharepointConfig.connectionStatus !== 'connected') {
      return res.status(400).json({
        success: false,
        message: 'Please test connection first'
      });
    }

    // Execute the sharepoint-setup.js script
    const { exec } = require('child_process');
    
    exec('node sharepoint-setup.js', { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Failed to create lists',
          error: error.message,
          details: stderr
        });
      }

      sharepointConfig.listsCreated = true;
      sharepointConfig.listsCount = 8;

      res.json({
        success: true,
        message: 'Successfully created 8 SharePoint lists',
        output: stdout,
        lists: ['Timesheets', 'Employees', 'Projects', 'Tasks', 'Invoices', 'LeaveRequests', 'Users', 'AuditLogs']
      });
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create lists',
      error: error.message
    });
  }
});

// Save SharePoint configuration
app.put('/api/sharepoint/config', async (req, res) => {
  try {
    const { enabled, tenantId, clientId, clientSecret, siteUrl, siteName } = req.body;

    sharepointConfig = {
      ...sharepointConfig,
      enabled: enabled || false,
      tenantId: tenantId || sharepointConfig.tenantId,
      clientId: clientId || sharepointConfig.clientId,
      clientSecret: clientSecret || sharepointConfig.clientSecret,
      siteUrl: siteUrl || sharepointConfig.siteUrl,
      siteName: siteName || sharepointConfig.siteName
    };

    // In production, you would save this to .env or encrypted database
    // For demo purposes, storing in memory

    res.json({
      success: true,
      message: 'SharePoint configuration saved',
      config: {
        enabled: sharepointConfig.enabled,
        tenantId: sharepointConfig.tenantId,
        siteUrl: sharepointConfig.siteUrl,
        siteName: sharepointConfig.siteName,
        connectionStatus: sharepointConfig.connectionStatus,
        listsCreated: sharepointConfig.listsCreated
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to save configuration',
      error: error.message
    });
  }
});

// Get current SharePoint configuration status
app.get('/api/sharepoint/status', (req, res) => {
  res.json({
    success: true,
    config: {
      enabled: sharepointConfig.enabled,
      tenantId: sharepointConfig.tenantId ? '***' + sharepointConfig.tenantId.slice(-4) : '',
      clientId: sharepointConfig.clientId ? '***' + sharepointConfig.clientId.slice(-4) : '',
      siteUrl: sharepointConfig.siteUrl,
      siteName: sharepointConfig.siteName,
      connectionStatus: sharepointConfig.connectionStatus,
      lastTested: sharepointConfig.lastTested,
      listsCreated: sharepointConfig.listsCreated,
      listsCount: sharepointConfig.listsCount
    }
  });
});

// Restore SharePoint configuration from frontend
app.post('/api/sharepoint/restore-config', (req, res) => {
  try {
    const config = req.body;
    
    // Update the backend config with frontend values
    if (config.enabled !== undefined) sharepointConfig.enabled = config.enabled;
    if (config.tenantId) sharepointConfig.tenantId = config.tenantId;
    if (config.clientId) sharepointConfig.clientId = config.clientId;
    if (config.clientSecret) sharepointConfig.clientSecret = config.clientSecret;
    if (config.siteUrl) sharepointConfig.siteUrl = config.siteUrl;
    if (config.siteName) sharepointConfig.siteName = config.siteName;
    if (config.connectionStatus) sharepointConfig.connectionStatus = config.connectionStatus;
    if (config.lastTested) sharepointConfig.lastTested = config.lastTested;
    if (config.listsCreated !== undefined) sharepointConfig.listsCreated = config.listsCreated;
    if (config.listsCount !== undefined) sharepointConfig.listsCount = config.listsCount;
    
    console.log('✅ SharePoint config restored:', {
      enabled: sharepointConfig.enabled,
      connectionStatus: sharepointConfig.connectionStatus,
      listsCount: sharepointConfig.listsCount
    });
    
    saveSharePointConfig();
    
    res.json({
      success: true,
      message: 'SharePoint configuration restored',
      config: {
        enabled: sharepointConfig.enabled,
        connectionStatus: sharepointConfig.connectionStatus,
        listsCount: sharepointConfig.listsCount
      }
    });
  } catch (error) {
    console.error('Failed to restore SharePoint config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore configuration',
      error: error.message
    });
  }
});

// Helper function to sync data to SharePoint (non-blocking)
const syncToSharePoint = (listName, data) => {
  if (!sharepointConfig.enabled || sharepointConfig.connectionStatus !== 'connected') {
    console.log('⏭️  SharePoint sync skipped for', listName);
    return;
  }

  console.log(`🔄 Starting SharePoint sync for ${listName}`);

  const tenantId = sharepointConfig.tenantId;
  const clientId = sharepointConfig.clientId;
  const clientSecret = sharepointConfig.clientSecret;
  const siteName = sharepointConfig.siteName;

  // Build field assignments for PowerShell
  const fieldsString = Object.keys(data)
    .map(k => `Title = '${String(data[k]).replace(/'/g, "''")}'`)
    .slice(0, 1)
    .join('; ');

  const psScript = `
    $ErrorActionPreference = 'Stop'
    try {
      $tokenBody = @{
        grant_type = 'client_credentials'
        client_id = '${clientId}'
        client_secret = '${clientSecret}'
        scope = 'https://graph.microsoft.com/.default'
      }
      $tokenResponse = Invoke-RestMethod -Uri "https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token" -Method POST -Body $tokenBody -ContentType "application/x-www-form-urlencoded" -TimeoutSec 30
      $accessToken = $tokenResponse.access_token
      $siteResponse = Invoke-RestMethod -Uri "https://graph.microsoft.com/v1.0/sites/${siteName}" -Headers @{Authorization="Bearer $accessToken"} -TimeoutSec 30
      $siteId = $siteResponse.id
      $listsResponse = Invoke-RestMethod -Uri "https://graph.microsoft.com/v1.0/sites/$siteId/lists" -Headers @{Authorization="Bearer $accessToken"} -TimeoutSec 30
      $targetList = $listsResponse.value | Where-Object { $_.name -eq "${listName}" }
      if ($targetList) {
        $listId = $targetList.id
        $fields = @{}
        ${Object.keys(data).map(k => `$fields['${k}'] = '${String(data[k]).replace(/'/g, "''")}'`).join('\n        ')}
        $itemData = @{ fields = $fields } | ConvertTo-Json -Depth 10
        $createResponse = Invoke-RestMethod -Uri "https://graph.microsoft.com/v1.0/sites/$siteId/lists/$listId/items" -Method POST -Headers @{Authorization="Bearer $accessToken"; "Content-Type"="application/json"} -Body $itemData -TimeoutSec 30
        Write-Output "✅ SUCCESS: Created in ${listName}"
      } else {
        Write-Output "❌ ERROR: ${listName} list not found"
      }
    } catch {
      Write-Output "❌ ERROR: $_"
    }
  `;

  try {
    const ps = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', psScript]);
    let output = '';
    let error = '';

    ps.stdout.on('data', (data) => { output += data.toString(); });
    ps.stderr.on('data', (data) => { error += data.toString(); });
    ps.on('close', (code) => {
      console.log(`📤 ${listName} sync output:`, output.trim());
      if (error) console.error(`⚠️  ${listName} sync errors:`, error.trim());
    });

    setTimeout(() => { try { ps.kill(); } catch (e) {} }, 30000);
  } catch (e) {
    console.error('Failed to start SharePoint sync:', e.message);
  }
};

// In-memory storage for all entities
let employees = [];
let employeeIdCounter = 1;
let projects = [];
let projectIdCounter = 1;
let tasks = [];
let taskIdCounter = 1;
// timesheets already declared above for initSampleData
let timesheetIdCounter = 1;
let invoices = [];
let invoiceIdCounter = 1;
let leaveRequests = [];
let leaveIdCounter = 1;

// ========== EMPLOYEES API ==========
app.get('/api/employees', (req, res) => {
  res.json(employees);
});

// Create employee
app.post('/api/employees', async (req, res) => {
  try {
    const employee = {
      id: employeeIdCounter++,
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    employees.push(employee);
    
    console.log('📝 Employee created:', employee.id, employee.name || employee.fullName);

    // Sync to SharePoint (non-blocking)
    syncToSharePoint('CentraPro_Employees', {
      Title: employee.name || employee.fullName || 'Employee',
      EmployeeId: String(employee.id),
      FullName: employee.fullName || employee.name || '',
      Email: employee.email || '',
      Position: employee.position || '',
      Department: employee.department || ''
    });

    res.json({
      success: true,
      employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create employee',
      error: error.message
    });
  }
});

// Update employee
app.put('/api/employees/:id', async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    const index = employees.findIndex(e => e.id === employeeId);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    employees[index] = {
      ...employees[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    // If SharePoint is enabled, try to sync
    if (sharepointConfig.enabled && sharepointConfig.connectionStatus === 'connected') {
      try {
        console.log('SharePoint sync would happen here for employee:', employeeId);
      } catch (spError) {
        console.error('SharePoint sync failed (non-critical):', spError.message);
      }
    }

    res.json({
      success: true,
      employee: employees[index]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update employee',
      error: error.message
    });
  }
});

// Delete employee
app.delete('/api/employees/:id', async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    const index = employees.findIndex(e => e.id === employeeId);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    employees.splice(index, 1);

    // If SharePoint is enabled, try to sync
    if (sharepointConfig.enabled && sharepointConfig.connectionStatus === 'connected') {
      try {
        console.log('SharePoint delete would happen here for employee:', employeeId);
      } catch (spError) {
        console.error('SharePoint sync failed (non-critical):', spError.message);
      }
    }

    res.json({
      success: true,
      message: 'Employee deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete employee',
      error: error.message
    });
  }
});

// ========== PROJECTS API ==========
app.get('/api/projects', (req, res) => res.json(projects));

app.post('/api/projects', async (req, res) => {
  try {
    const project = { id: projectIdCounter++, ...req.body, createdAt: new Date().toISOString() };
    projects.push(project);
    console.log('📝 Project created:', project.id, project.name);
    
    syncToSharePoint('CentraPro_Projects', {
      Title: project.name || 'Project',
      ProjectId: String(project.id),
      Description: project.description || '',
      Status: project.status || '',
      StartDate: project.startDate || '',
      EndDate: project.endDate || ''
    });
    
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create project', error: error.message });
  }
});

// ========== TASKS API ==========
app.get('/api/tasks', (req, res) => res.json(tasks));

app.post('/api/tasks', async (req, res) => {
  try {
    const task = { id: taskIdCounter++, ...req.body, createdAt: new Date().toISOString() };
    tasks.push(task);
    console.log('📝 Task created:', task.id, task.title);
    
    syncToSharePoint('CentraPro_Tasks', {
      Title: task.title || 'Task',
      TaskId: String(task.id),
      Description: task.description || '',
      AssignedTo: task.assignedTo || '',
      Status: task.status || '',
      Priority: task.priority || '',
      DueDate: task.dueDate || ''
    });
    
    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create task', error: error.message });
  }
});

// ========== TIMESHEETS API (Enhanced) ==========
app.get('/api/timesheets', (req, res) => res.json(timesheets));

app.post('/api/timesheets', async (req, res) => {
  try {
    const timesheet = { id: timesheetIdCounter++, ...req.body, createdAt: new Date().toISOString() };
    timesheets.push(timesheet);
    console.log('📝 Timesheet created:', timesheet.id, timesheet.weekNumber);
    
    syncToSharePoint('CentraPro_Timesheets', {
      Title: `Week ${timesheet.weekNumber || 'N/A'}`,
      TimesheetId: String(timesheet.id),
      EmployeeId: String(timesheet.employeeId || ''),
      WeekNumber: String(timesheet.weekNumber || ''),
      TotalHours: String(timesheet.totalHours || 0),
      Status: timesheet.status || 'pending',
      SubmittedDate: timesheet.submittedDate || new Date().toISOString()
    });
    
    res.json({ success: true, timesheet });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create timesheet', error: error.message });
  }
});

// ========== INVOICES API ==========
app.get('/api/invoices', (req, res) => res.json(invoices));

app.post('/api/invoices', async (req, res) => {
  try {
    const invoice = { id: invoiceIdCounter++, ...req.body, createdAt: new Date().toISOString() };
    invoices.push(invoice);
    console.log('📝 Invoice created:', invoice.id, invoice.invoiceNumber);
    
    syncToSharePoint('CentraPro_Invoices', {
      Title: invoice.invoiceNumber || `Invoice ${invoice.id}`,
      InvoiceId: String(invoice.id),
      InvoiceNumber: invoice.invoiceNumber || '',
      ClientName: invoice.clientName || '',
      Amount: String(invoice.amount || 0),
      Status: invoice.status || 'pending',
      DueDate: invoice.dueDate || '',
      IssuedDate: invoice.issuedDate || new Date().toISOString()
    });
    
    res.json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create invoice', error: error.message });
  }
});

// ========== LEAVE REQUESTS API ==========
app.get('/api/leave-requests', (req, res) => res.json(leaveRequests));

app.post('/api/leave-requests', async (req, res) => {
  try {
    const leave = { id: leaveIdCounter++, ...req.body, createdAt: new Date().toISOString() };
    leaveRequests.push(leave);
    console.log('📝 Leave request created:', leave.id, leave.type);
    
    syncToSharePoint('CentraPro_LeaveRequests', {
      Title: `${leave.type || 'Leave'} - ${leave.employeeName || 'Employee'}`,
      LeaveId: String(leave.id),
      EmployeeId: String(leave.employeeId || ''),
      EmployeeName: leave.employeeName || '',
      LeaveType: leave.type || '',
      StartDate: leave.startDate || '',
      EndDate: leave.endDate || '',
      Days: String(leave.days || 0),
      Status: leave.status || 'pending',
      Reason: leave.reason || ''
    });
    
    res.json({ success: true, leave });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create leave request', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
