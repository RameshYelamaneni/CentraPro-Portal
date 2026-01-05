import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tab,
  Tabs,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Mail as MailIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Add as AddIcon,
  Send as SendIcon,
} from '@mui/icons-material';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface Email {
  id: string;
  subject: string;
  from: string;
  to: string;
  text: string;
  date: string;
  hasAttachments: boolean;
}

interface SentEmail {
  id: number;
  to: string;
  subject: string;
  body: string;
  purpose: string;
  sentAt: string;
  status: string;
}

interface SMTPAccount {
  id: number;
  name: string;
  host: string;
  port: number;
  secure: boolean;
  auth: { user: string; pass: string };
  purpose: string;
  testStatus: string;
  type?: string;
}

const EmailManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0); // Default to Inbox tab
  const [inboxEmails, setInboxEmails] = useState<Email[]>([]);
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [smtpAccounts, setSmtpAccounts] = useState<SMTPAccount[]>([]);
  const [editingAccount, setEditingAccount] = useState<SMTPAccount | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [composeDialogOpen, setComposeDialogOpen] = useState(false);
  const [composeForm, setComposeForm] = useState({
    to: '',
    subject: '',
    body: '',
    purpose: 'invoice'
  });
  useEffect(() => {
    fetchSMTPAccounts();
    fetchInbox();
    fetchSentEmails();
  }, []);

  const fetchSMTPAccounts = async () => {
    try {
      const token = localStorage.getItem('app_token');
      const res = await fetch(`${API_BASE}/api/email/smtp-accounts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSmtpAccounts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching SMTP accounts:', err);
    }
  };

  const fetchInbox = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('app_token');
      const res = await fetch(`${API_BASE}/api/email/inbox`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInboxEmails(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching inbox:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSentEmails = async () => {
    try {
      const token = localStorage.getItem('app_token');
      const res = await fetch(`${API_BASE}/api/email/sent`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSentEmails(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching sent emails:', err);
    }
  };

  const handleSendEmail = async () => {
    try {
      const token = localStorage.getItem('app_token');
      const res = await fetch(`${API_BASE}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(composeForm)
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Email sent successfully!' });
        setComposeDialogOpen(false);
        setComposeForm({ to: '', subject: '', body: '', purpose: 'invoice' });
        fetchSentEmails();
      } else {
        setMessage({ type: 'error', text: 'Failed to send email' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error sending email' });
    }
  };

  const handleTestConnection = async () => {
    if (!editingAccount) return;
    setTestingConnection(true);
    setTestSuccess(false);
    setTestMessage('Testing...');

    try {
      const token = localStorage.getItem('app_token');
      const res = await fetch(`${API_BASE}/api/email/test-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          host: editingAccount.host,
          port: editingAccount.port,
          secure: editingAccount.secure,
          user: editingAccount.auth.user,
          pass: editingAccount.auth.pass
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestSuccess(true);
        setTestMessage(data.message || 'Connection successful');
      } else {
        setTestMessage(data.message || 'Test failed');
      }
    } catch (err) {
      setTestMessage(`Error: ${String(err)}`);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveAccount = async () => {
    if (!editingAccount) return;
    
    try {
      const token = localStorage.getItem('app_token');
      const res = await fetch(`${API_BASE}/api/email/smtp-accounts/${editingAccount.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          host: editingAccount.host,
          port: editingAccount.port,
          secure: editingAccount.secure,
          auth: editingAccount.auth
        })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Account saved successfully' });
        setEditDialogOpen(false);
        fetchSMTPAccounts();
      } else {
        setMessage({ type: 'error', text: 'Failed to save account' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error saving account' });
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <MailIcon />
          Email Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setComposeDialogOpen(true)}
          sx={{ borderRadius: '1000px', px: 3 }}
        >
          Compose
        </Button>
      </Box>

      {message && (
        <Alert severity={message.type} onClose={() => setMessage(null)} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab label="Inbox" />
        <Tab label="Sent Emails" />
        <Tab label="Drafts" />
        <Tab label="SMTP Accounts" />
      </Tabs>

      {/* Inbox Tab */}
      {tabValue === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Inbox ({inboxEmails.length})</Typography>
            <Button startIcon={<RefreshIcon />} onClick={fetchInbox} disabled={loading}>
              Refresh
            </Button>
          </Box>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : inboxEmails.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="textSecondary">
                📧 No emails in inbox
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: '16px' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>From</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Attachments</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inboxEmails.map((email) => (
                    <TableRow key={email.id} hover>
                      <TableCell>{email.from}</TableCell>
                      <TableCell>{email.subject}</TableCell>
                      <TableCell>{new Date(email.date).toLocaleDateString()}</TableCell>
                      <TableCell>{email.hasAttachments ? '📎' : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Sent Emails Tab */}
      {tabValue === 1 && (
        <Box>
          {sentEmails.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="textSecondary">
                📤 No sent emails yet
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: '16px' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>To</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Purpose</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sentEmails.map((email) => (
                    <TableRow key={email.id} hover>
                      <TableCell>{email.to}</TableCell>
                      <TableCell>{email.subject}</TableCell>
                      <TableCell>
                        <Chip label={email.purpose} size="small" />
                      </TableCell>
                      <TableCell>{new Date(email.sentAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={email.status}
                          size="small"
                          color={email.status === 'delivered' ? 'success' : 'default'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Drafts Tab */}
      {tabValue === 2 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="textSecondary">
            📝 Draft emails will appear here
          </Typography>
        </Box>
      )}

      {/* SMTP Accounts Tab */}
      {tabValue === 3 && (
        <Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
            {smtpAccounts.map((account) => (
              <Card key={account.id} sx={{ borderRadius: '16px' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {account.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    {account.purpose}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', mb: 2 }}>
                    {account.auth.user}
                  </Typography>
                  <Chip
                    icon={account.testStatus === 'success' ? <CheckCircleIcon /> : <ErrorIcon />}
                    label={account.testStatus === 'success' ? 'Connected' : 'Not Tested'}
                    size="small"
                    color={account.testStatus === 'success' ? 'success' : 'default'}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setEditingAccount(account);
                      setTestSuccess(false);
                      setTestMessage('');
                      setEditDialogOpen(true);
                    }}
                    fullWidth
                  >
                    Edit & Test
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* Edit Dialog - unchanged */}
      {/* Compose Dialog */}
      <Dialog open={composeDialogOpen} onClose={() => setComposeDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Compose Email</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="To"
              value={composeForm.to}
              onChange={(e) => setComposeForm({ ...composeForm, to: e.target.value })}
              fullWidth
              placeholder="recipient@example.com"
            />
            <TextField
              label="Purpose"
              select
              value={composeForm.purpose}
              onChange={(e) => setComposeForm({ ...composeForm, purpose: e.target.value })}
              fullWidth
              SelectProps={{ native: true }}
            >
              <option value="invoice">Invoice</option>
              <option value="notification">Notification</option>
              <option value="hr">HR</option>
              <option value="support">Support</option>
              <option value="marketing">Marketing</option>
            </TextField>
            <TextField
              label="Subject"
              value={composeForm.subject}
              onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
              fullWidth
            />
            <TextField
              label="Message"
              value={composeForm.body}
              onChange={(e) => setComposeForm({ ...composeForm, body: e.target.value })}
              fullWidth
              multiline
              rows={8}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComposeDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleSendEmail}
            disabled={!composeForm.to || !composeForm.subject || !composeForm.body}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Configuration</DialogTitle>
        <DialogContent>
          {editingAccount && (
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Host"
                value={editingAccount.host}
                onChange={(e) => setEditingAccount({ ...editingAccount, host: e.target.value })}
                fullWidth
                size="small"
              />
              <TextField
                label="Port"
                type="number"
                value={editingAccount.port}
                onChange={(e) => setEditingAccount({ ...editingAccount, port: parseInt(e.target.value) })}
                fullWidth
                size="small"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editingAccount.secure}
                    onChange={(e) => setEditingAccount({ ...editingAccount, secure: e.target.checked })}
                  />
                }
                label="Use TLS/SSL"
              />
              <TextField
                label="Email"
                value={editingAccount.auth.user}
                onChange={(e) => setEditingAccount({
                  ...editingAccount,
                  auth: { ...editingAccount.auth, user: e.target.value }
                })}
                fullWidth
                size="small"
              />
              <TextField
                label="Password"
                type="password"
                value={editingAccount.auth.pass}
                onChange={(e) => setEditingAccount({
                  ...editingAccount,
                  auth: { ...editingAccount.auth, pass: e.target.value }
                })}
                fullWidth
                size="small"
              />
              {testMessage && (
                <Alert severity={testSuccess ? 'success' : 'error'}>{testMessage}</Alert>
              )}
              <Button
                variant="outlined"
                onClick={handleTestConnection}
                disabled={testingConnection}
                fullWidth
              >
                {testingConnection ? 'Testing...' : 'Test Connection'}
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveAccount}>
            Save Configuration
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailManagement;
