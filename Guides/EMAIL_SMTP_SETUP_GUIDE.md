# Email & SMTP Setup Guide - Office 365 Configuration

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Initial Setup](#initial-setup)
4. [Common Issues & Resolutions](#common-issues--resolutions)
5. [Testing & Verification](#testing--verification)
6. [Security Considerations](#security-considerations)

---

## Overview

This guide documents the complete setup process for configuring Office 365 SMTP authentication in the CentraPro application, including all issues encountered and their resolutions.

**Email System Features:**
- Email template management with variable substitution
- SMTP configuration with Office 365
- Real-time email sending via nodemailer
- Support for HTML email templates
- Test connection and send test email functionality

**Final Working Configuration:**
```javascript
Host: smtp.office365.com
Port: 587
Security: STARTTLS (SSL/TLS toggle OFF)
Authentication: Basic Auth (username/password)
Account: invoice@rightarc.com
```

---

## Prerequisites

### Required Software
- Node.js (v14 or higher)
- PowerShell (v5.1 or higher)
- Microsoft 365 Admin Access
- Azure AD Admin Access

### Required Packages
```bash
# Backend dependencies
npm install nodemailer

# PowerShell module (for admin configuration)
Install-Module -Name ExchangeOnlineManagement -Force -Scope CurrentUser
```

---

## Initial Setup

### 1. Backend Configuration

**File:** `server/index.js`

Add nodemailer import:
```javascript
const nodemailer = require('nodemailer');
```

Configure SMTP settings:
```javascript
let smtpConfig = {
  id: 1,
  host: 'smtp.office365.com',
  port: 587,
  secure: false, // CRITICAL: false for port 587 (STARTTLS)
  auth: {
    user: 'invoice@rightarc.com',
    pass: 'YOUR_PASSWORD'
  },
  from: {
    name: 'CentraPro',
    email: 'invoice@rightarc.com'
  },
  isConfigured: true,
  lastTested: new Date().toISOString(),
  testStatus: 'success'
};
```

### 2. SMTP Test Endpoint

```javascript
app.post('/api/smtp-config/test', authMiddleware, adminOnly, async (req, res) => {
  try {
    console.log('Testing SMTP with config:', {
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      user: smtpConfig.auth.user,
      hasPassword: !!smtpConfig.auth.pass
    });

    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.auth.user,
        pass: smtpConfig.auth.pass
      },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      },
      requireTLS: true,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000
    });

    await transporter.verify();
    
    smtpConfig.lastTested = new Date().toISOString();
    smtpConfig.testStatus = 'success';
    
    res.json({ 
      success: true, 
      message: 'SMTP connection test successful',
      config: {
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure
      }
    });
  } catch (error) {
    console.error('SMTP Test Error:', error);
    smtpConfig.testStatus = 'failure';
    res.status(500).json({ 
      success: false, 
      message: 'SMTP connection test failed', 
      error: error.message 
    });
  }
});
```

### 3. Frontend SMTP Configuration UI

**File:** `client/src/pages/EmailTemplates.tsx`

SMTP Settings Dialog with proper configuration options:
```tsx
<TextField
  label="Host"
  value={smtpSettings.host}
  onChange={(e) => setSmtpSettings({...smtpSettings, host: e.target.value})}
  fullWidth
  margin="normal"
/>
<TextField
  label="Port"
  type="number"
  value={smtpSettings.port}
  onChange={(e) => setSmtpSettings({...smtpSettings, port: parseInt(e.target.value)})}
  fullWidth
  margin="normal"
/>
<FormControlLabel
  control={
    <Switch
      checked={smtpSettings.secure}
      onChange={(e) => setSmtpSettings({...smtpSettings, secure: e.target.checked})}
    />
  }
  label="Use SSL/TLS (Port 465 only)"
/>
```

---

## Common Issues & Resolutions

### Issue 1: SSL/TLS Protocol Mismatch ❌

**Error Message:**
```
Error: 44A90000:error:0A00010B:SSL routines:ssl3_get_record:wrong version number
Code: ESOCKET
Command: CONN
```

**Root Cause:**
Port 587 was configured with `secure: true`, but Office 365 expects STARTTLS (secure upgrade after initial plain connection).

**Resolution:** ✅
- Set `secure: false` for port 587
- Port 587 uses STARTTLS protocol
- Port 465 uses SSL/TLS and requires `secure: true`

**Screenshot Reference:** SSL error in terminal logs showing wrong version number

---

### Issue 2: SMTP Authentication Disabled ❌

**Error Message:**
```
535 5.7.139 Authentication unsuccessful, SmtpClientAuthentication is disabled for the Tenant
Visit https://aka.ms/smtp_auth_disabled
```

**Root Cause:**
SMTP AUTH protocol was disabled at the organization level in Microsoft 365 settings.

**Resolution:** ✅

#### Step 1: Navigate to Mail Flow Settings
1. Go to Microsoft 365 Admin Center: https://admin.microsoft.com
2. Navigate to **Settings** → **Org settings** → **Mail**
3. Click on **Mail** service item

#### Step 2: Enable SMTP AUTH
1. In the **Mail flow settings** panel, find the **Security** section
2. **UNCHECK** the checkbox: "Turn off SMTP AUTH protocol for your organization"
3. Click **Save** at the bottom
4. Wait 5-10 minutes for propagation

**Screenshot Reference:** Mail flow settings showing "Turn off SMTP AUTH protocol" checkbox that was checked (blocking SMTP)

---

### Issue 3: Security Defaults Blocking Legacy Authentication ❌

**Error Message:**
```
535 5.7.139 Authentication unsuccessful, user is locked by your organization's security defaults policy
Contact your administrator
```

**Root Cause:**
Microsoft 365 Security Defaults were enabled, blocking legacy authentication methods like SMTP.

**Resolution Options:** ✅

#### Option A: Disable Security Defaults (Organization-Wide)

**⚠️ Warning:** This affects all users in the organization.

1. Go to Azure AD Admin Center: https://aad.portal.azure.com
2. Navigate to **Azure Active Directory** → **Properties**
3. Click **Manage security defaults**
4. Select reason: "My organization is unable to use apps/devices"
5. Toggle **Security defaults** to **Disabled**
6. Click **Save**

**Screenshot Reference:** Security defaults panel showing enabled status with reason selection

#### Option B: Enable SMTP for Specific User (Recommended) ✅

Using PowerShell (more secure, user-specific):

```powershell
# Install Exchange Online Management module
Install-Module -Name ExchangeOnlineManagement -Force -Scope CurrentUser

# Connect to Exchange Online (will prompt for admin credentials)
Connect-ExchangeOnline

# Enable SMTP AUTH for specific mailbox
Set-CASMailbox -Identity "invoice@rightarc.com" -SmtpClientAuthenticationDisabled $false

# Verify the setting
Get-CASMailbox -Identity "invoice@rightarc.com" | Select-Object SmtpClientAuthenticationDisabled
# Should return: SmtpClientAuthenticationDisabled : False

# Disconnect
Disconnect-ExchangeOnline
```

**Screenshot Reference:** Azure AD user sign-in logs showing failure with error code 530035

---

### Issue 4: Authentication Methods Policy ❌

**Symptom:**
SMTP authentication still blocked despite enabling SMTP AUTH.

**Root Cause:**
Authentication methods policies may restrict certain authentication types.

**Resolution:** ✅

1. Go to Azure AD Admin Center: https://aad.portal.azure.com
2. Navigate to **Security** → **Authentication methods** → **Policies**
3. Review the **Authentication method policies** section
4. Ensure legacy authentication is allowed for the specific user or group
5. Check that "Email OTP" or other methods are enabled if needed

**Screenshot Reference:** Authentication methods policies page showing Built-in methods and their enabled status

---

### Issue 5: Connection Timeout ❌

**Error Message:**
```
Error: Connection timeout
Code: ETIMEDOUT
Command: CONN
```

**Root Cause:**
- Network firewall blocking outbound SMTP traffic
- Incorrect port configuration (port 465 with `secure: true`)
- Server DNS resolution issues

**Resolution:** ✅

1. **Verify port and security settings:**
   - Port 587: Use `secure: false` (STARTTLS)
   - Port 465: Use `secure: true` (SSL/TLS)

2. **Add timeout configurations:**
   ```javascript
   const transporter = nodemailer.createTransport({
     host: 'smtp.office365.com',
     port: 587,
     secure: false,
     connectionTimeout: 10000, // 10 seconds
     greetingTimeout: 10000,
     socketTimeout: 10000,
     tls: {
       ciphers: 'SSLv3',
       rejectUnauthorized: false
     },
     requireTLS: true
   });
   ```

3. **Check firewall rules:**
   - Ensure outbound traffic on port 587 is allowed
   - Verify DNS can resolve smtp.office365.com

---

### Issue 6: Password Not Saving ❌

**Symptom:**
SMTP password field shows asterisks (********) and doesn't update with new password.

**Root Cause:**
Password save logic was preserving old password when empty string was passed from UI.

**Resolution:** ✅

Update password save logic in backend:

```javascript
app.put('/api/smtp-config', authMiddleware, adminOnly, (req, res) => {
  const { host, port, secure, auth, from } = req.body;
  
  smtpConfig.host = host;
  smtpConfig.port = port;
  smtpConfig.secure = secure;
  smtpConfig.auth.user = auth.user;
  
  // Only update password if a non-empty value is provided
  if (auth.pass && auth.pass.trim() !== '') {
    smtpConfig.auth.pass = auth.pass;
  }
  
  smtpConfig.from = from;
  
  // Audit log
  auditLogs.push({
    id: auditLogs.length + 1,
    userId: req.user.id,
    userName: req.user.name,
    action: 'update',
    resource: 'smtp_config',
    timestamp: new Date().toISOString()
  });
  
  res.json({ success: true, message: 'SMTP configuration updated' });
});
```

---

## Testing & Verification

### Step 1: Test SMTP Connection

1. Navigate to Email Templates page: `http://localhost:5173/email-templates`
2. Click **"SMTP Settings"** button
3. Verify configuration:
   - Host: `smtp.office365.com`
   - Port: `587`
   - SSL/TLS toggle: **OFF** (for port 587)
   - Username: `invoice@rightarc.com`
   - Password: (your password)
4. Click **"Test Connection"**
5. Expected result: ✅ "SMTP connection test successful"

### Step 2: Send Test Email

1. In SMTP Settings dialog, click **"Send Test Email"**
2. Enter recipient email address
3. Click **"Send"**
4. Check recipient inbox for test email
5. Expected result: ✅ Email received with CentraPro branding

### Step 3: Verify Onboarding Emails

1. Navigate to Employees page
2. Click **"Add Employee"**
3. Fill in employee details with valid email
4. Enable "Send onboarding email" checkbox
5. Click **"Add"**
6. Check backend logs for:
   ```
   [EMAIL] Onboarding invite sent to employee@example.com
   [EMAIL] Invite link: /onboarding/eyJh...
   ```
7. Verify employee receives onboarding email

### Step 4: Check Audit Logs

Backend logs should show successful SMTP operations:
```
SMTP Config Updated: {
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  user: 'invoice@rightarc.com',
  hasPassword: true
}
[AUDIT] Admin User update smtp_config #1
[AUDIT] Admin User test smtp_config #1
[EMAIL] Onboarding invite sent to user@example.com
```

---

## Security Considerations

### Best Practices

1. **Use App Passwords (Recommended):**
   - Go to https://myaccount.microsoft.com/security
   - Generate app-specific password
   - Use instead of main account password
   - Can be revoked independently

2. **Least Privilege Access:**
   - Only enable SMTP AUTH for specific users who need it
   - Use PowerShell method instead of disabling Security Defaults org-wide

3. **Monitor Sign-in Logs:**
   - Regularly check Azure AD sign-in logs
   - Look for unusual SMTP authentication attempts
   - Location: Azure AD → Users → Sign-in logs

4. **Secure Password Storage:**
   - Never commit passwords to version control
   - Use environment variables for production:
     ```javascript
     auth: {
       user: process.env.SMTP_USER,
       pass: process.env.SMTP_PASS
     }
     ```

5. **Enable Audit Logging:**
   - Track all SMTP configuration changes
   - Log email sending attempts
   - Monitor for failures

### Network Security

1. **Firewall Rules:**
   - Allow outbound TCP port 587 (STARTTLS)
   - Optionally allow port 465 (SSL/TLS)
   - Restrict to smtp.office365.com if possible

2. **TLS Configuration:**
   ```javascript
   tls: {
     ciphers: 'SSLv3',
     rejectUnauthorized: false, // Use true in production with valid certs
     minVersion: 'TLSv1.2'
   }
   ```

---

## Troubleshooting Checklist

When SMTP is not working, check these items in order:

### 1. Configuration
- [ ] Host: `smtp.office365.com` (correct)
- [ ] Port: `587` (for STARTTLS)
- [ ] Secure: `false` (for port 587)
- [ ] Username: Valid Office 365 email
- [ ] Password: Correct and not placeholder

### 2. Microsoft 365 Settings
- [ ] SMTP AUTH enabled (Mail flow settings)
- [ ] Security defaults adjusted or user exempted
- [ ] User has Exchange Online license
- [ ] User not locked or disabled

### 3. Network
- [ ] Outbound port 587 allowed
- [ ] DNS resolves smtp.office365.com
- [ ] No proxy blocking SMTP traffic
- [ ] Server has internet connectivity

### 4. Code
- [ ] nodemailer installed (`npm install nodemailer`)
- [ ] Proper error handling implemented
- [ ] Timeout values configured
- [ ] TLS settings appropriate

### 5. Verification
- [ ] Backend logs show successful connection
- [ ] Frontend displays success message
- [ ] Test email received
- [ ] Audit logs record activity

---

## Quick Reference Commands

### PowerShell - Enable SMTP for User
```powershell
Install-Module -Name ExchangeOnlineManagement -Force -Scope CurrentUser
Connect-ExchangeOnline
Set-CASMailbox -Identity "invoice@rightarc.com" -SmtpClientAuthenticationDisabled $false
Get-CASMailbox -Identity "invoice@rightarc.com" | Select-Object SmtpClientAuthenticationDisabled
Disconnect-ExchangeOnline
```

### PowerShell - Check User Sign-in Logs
```powershell
Connect-AzureAD
Get-AzureADAuditSignInLogs -Filter "userPrincipalName eq 'invoice@rightarc.com'" -Top 10
```

### Node.js - Test SMTP Connection
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: 'invoice@rightarc.com',
    pass: 'YOUR_PASSWORD'
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Error:', error);
  } else {
    console.log('✅ SMTP Ready:', success);
  }
});
```

---

## Office 365 Port Reference

| Port | Protocol | Secure Setting | Use Case |
|------|----------|----------------|----------|
| 587  | STARTTLS | `secure: false` | **Recommended** - Modern, widely supported |
| 465  | SSL/TLS  | `secure: true`  | Legacy, implicit SSL |
| 25   | Plain    | Not supported   | Blocked by Office 365 |

---

## Additional Resources

### Microsoft Documentation
- [SMTP AUTH in Exchange Online](https://aka.ms/smtp_auth_disabled)
- [Exchange Online PowerShell](https://docs.microsoft.com/en-us/powershell/exchange/exchange-online-powershell)
- [Security Defaults in Azure AD](https://docs.microsoft.com/en-us/azure/active-directory/fundamentals/concept-fundamentals-security-defaults)

### Nodemailer Documentation
- [Nodemailer Official Docs](https://nodemailer.com/)
- [Office 365 Configuration](https://nodemailer.com/usage/using-gmail/)
- [TLS Options](https://nodemailer.com/smtp/#tls-options)

### Troubleshooting Tools
- Azure AD Sign-in Logs: https://aad.portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/SignIns
- Microsoft 365 Admin Center: https://admin.microsoft.com
- Exchange Admin Center: https://admin.exchange.microsoft.com

---

## Success Criteria

Your SMTP setup is complete when:

1. ✅ Test Connection shows "SMTP connection test successful"
2. ✅ Test email is received in recipient inbox
3. ✅ Onboarding emails are sent automatically
4. ✅ Backend logs show successful email operations
5. ✅ No errors in SMTP authentication
6. ✅ Security settings properly configured

---

## Support

If issues persist after following this guide:

1. **Check Backend Logs:** Look for detailed error messages
2. **Review Audit Trail:** Check Azure AD sign-in logs for blocked attempts
3. **Verify License:** Ensure user has Exchange Online license
4. **Contact Support:** Microsoft 365 support for authentication issues

---

**Document Version:** 1.0  
**Last Updated:** December 4, 2025  
**Author:** CentraPro Development Team  
**Status:** ✅ Production Ready
