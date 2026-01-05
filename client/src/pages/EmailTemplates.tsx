import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Tabs,
  Tab,
  Alert,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Switch,
  Tooltip,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  ContentCopy as ContentCopyIcon,
  Send as SendIcon,
  Email as EmailIcon,
  Settings as SettingsIcon,
  Code as CodeIcon,
  Check as CheckIcon
} from '@mui/icons-material';

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  category: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  lastModified: string;
}

interface SMTPConfig {
  id: number;
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: {
    name: string;
    email: string;
  };
  isConfigured: boolean;
  lastTested: string;
  testStatus: string;
}

interface PreviewData {
  subject: string;
  body: string;
  originalTemplate: {
    id: number;
    name: string;
  };
}

const EmailTemplates: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<EmailTemplate[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openSMTPDialog, setOpenSMTPDialog] = useState(false);
  const [openTestEmailDialog, setOpenTestEmailDialog] = useState(false);

  // Form states
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    category: 'Onboarding',
    isActive: true,
    variables: [] as string[]
  });

  // Preview states
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [previewVariables, setPreviewVariables] = useState<Record<string, string>>({});

  // SMTP states
  const [smtpConfig, setSMTPConfig] = useState<SMTPConfig | null>(null);
  const [smtpForm, setSMTPForm] = useState({
    host: '',
    port: 587,
    secure: false,
    authUser: '',
    authPass: '',
    fromName: '',
    fromEmail: ''
  });
  const [testEmail, setTestEmail] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<EmailTemplate | null>(null);

  useEffect(() => {
    fetchTemplates();
    fetchCategories();
    fetchSMTPConfig();
  }, []);

  useEffect(() => {
    // Filter templates by category
    if (selectedCategory === 'All') {
      setFilteredTemplates(templates);
    } else {
      setFilteredTemplates(templates.filter(t => t.category === selectedCategory));
    }
  }, [selectedCategory, templates]);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('app_token');
      console.log('Fetching templates with token:', token ? 'present' : 'missing');
      const response = await fetch('http://localhost:4000/api/email-templates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        const errData = await response.text();
        throw new Error(`Failed to fetch templates: ${response.status} ${errData}`);
      }
      
      const data = await response.json();
      console.log('Templates loaded:', data);
      setTemplates(data);
      setFilteredTemplates(data);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching templates:', err);
      setError(`Failed to load email templates: ${err.message}`);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('app_token');
      const response = await fetch('http://localhost:4000/api/email-templates/meta/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        console.warn('Failed to fetch categories');
        return;
      }
      
      const data = await response.json();
      console.log('Categories loaded:', data);
      setCategories(['All', ...data]);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchSMTPConfig = async () => {
    try {
      const token = localStorage.getItem('app_token');
      const response = await fetch('http://localhost:4000/api/smtp-config', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        console.log('SMTP config not available or not admin');
        return;
      }
      
      const data = await response.json();
      setSMTPConfig(data);
      setSMTPForm({
        host: data.host,
        port: data.port,
        secure: data.secure,
        authUser: data.auth.user,
        authPass: '',
        fromName: data.from.name,
        fromEmail: data.from.email
      });
    } catch (err) {
      console.error('Failed to load SMTP config');
    }
  };

  const handleOpenDialog = (template?: EmailTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        subject: template.subject,
        body: template.body,
        category: template.category,
        isActive: template.isActive,
        variables: template.variables
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: '',
        subject: '',
        body: '',
        category: 'Onboarding',
        isActive: true,
        variables: []
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTemplate(null);
    setError('');
  };

  const extractVariables = (text: string): string[] => {
    const regex = /{{(\w+)}}/g;
    const matches = text.matchAll(regex);
    const vars = new Set<string>();
    for (const match of matches) {
      vars.add(match[1]);
    }
    return Array.from(vars);
  };

  const handleSaveTemplate = async () => {
    try {
      // Extract variables from subject and body
      const subjectVars = extractVariables(formData.subject);
      const bodyVars = extractVariables(formData.body);
      const allVars = Array.from(new Set([...subjectVars, ...bodyVars]));

      const token = localStorage.getItem('app_token');
      const url = editingTemplate
        ? `http://localhost:4000/api/email-templates/${editingTemplate.id}`
        : 'http://localhost:4000/api/email-templates';
      
      const method = editingTemplate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          variables: allVars
        })
      });

      if (!response.ok) throw new Error('Failed to save template');

      setSuccess(editingTemplate ? 'Template updated successfully' : 'Template created successfully');
      handleCloseDialog();
      fetchTemplates();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save template');
    }
  };

  const handleDeleteTemplate = async () => {
    if (!deleteTarget) return;

    try {
      const token = localStorage.getItem('app_token');
      const response = await fetch(`http://localhost:4000/api/email-templates/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete template');

      setSuccess('Template deleted successfully');
      setOpenDeleteDialog(false);
      setDeleteTarget(null);
      fetchTemplates();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete template');
    }
  };

  const handleDuplicateTemplate = async (template: EmailTemplate) => {
    try {
      const token = localStorage.getItem('app_token');
      const response = await fetch(`http://localhost:4000/api/email-templates/${template.id}/duplicate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to duplicate template');

      setSuccess('Template duplicated successfully');
      fetchTemplates();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to duplicate template');
    }
  };

  const handlePreview = async (template: EmailTemplate) => {
    // Initialize preview variables with template variables
    const initialVars: Record<string, string> = {};
    template.variables.forEach(v => {
      initialVars[v] = `[${v}]`;
    });
    setPreviewVariables(initialVars);

    try {
      const token = localStorage.getItem('app_token');
      const response = await fetch(`http://localhost:4000/api/email-templates/${template.id}/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ variables: initialVars })
      });

      if (!response.ok) throw new Error('Failed to generate preview');

      const data = await response.json();
      setPreviewData(data);
      setOpenPreviewDialog(true);
    } catch (err) {
      setError('Failed to generate preview');
    }
  };

  const handleUpdatePreview = async () => {
    if (!previewData) return;

    try {
      const token = localStorage.getItem('app_token');
      const response = await fetch(`http://localhost:4000/api/email-templates/${previewData.originalTemplate.id}/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ variables: previewVariables })
      });

      if (!response.ok) throw new Error('Failed to update preview');

      const data = await response.json();
      setPreviewData(data);
    } catch (err) {
      setError('Failed to update preview');
    }
  };

  const handleSaveSMTPConfig = async () => {
    try {
      const token = localStorage.getItem('app_token');
      const response = await fetch('http://localhost:4000/api/smtp-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          host: smtpForm.host,
          port: smtpForm.port,
          secure: smtpForm.secure,
          auth: {
            user: smtpForm.authUser,
            pass: smtpForm.authPass || undefined
          },
          from: {
            name: smtpForm.fromName,
            email: smtpForm.fromEmail
          }
        })
      });

      if (!response.ok) throw new Error('Failed to save SMTP config');

      setSuccess('SMTP configuration saved successfully');
      setOpenSMTPDialog(false);
      fetchSMTPConfig();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save SMTP configuration');
    }
  };

  const handleTestSMTPConnection = async () => {
    setTestingConnection(true);
    try {
      const token = localStorage.getItem('app_token');
      const response = await fetch('http://localhost:4000/api/smtp-config/test', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Connection test failed');

      const data = await response.json();
      setSuccess(data.message);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('SMTP connection test failed');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSendTestEmail = async () => {
    try {
      const token = localStorage.getItem('app_token');
      const response = await fetch('http://localhost:4000/api/smtp-config/send-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ recipient: testEmail })
      });

      if (!response.ok) throw new Error('Failed to send test email');

      const data = await response.json();
      setSuccess(data.message);
      setOpenTestEmailDialog(false);
      setTestEmail('');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to send test email');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          <EmailIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Email Templates
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setOpenSMTPDialog(true)}
            sx={{ mr: 2 }}
          >
            SMTP Settings
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Create Template
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Templates" />
          <Tab label="Categories" />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <>
          <Paper sx={{ mb: 2, p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Filter by Category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  size="small"
                >
                  {categories.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Typography variant="body2" color="text.secondary">
                  Showing {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Category</strong></TableCell>
                  <TableCell><strong>Subject</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Last Modified</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTemplates.map(template => (
                  <TableRow key={template.id} hover>
                    <TableCell>{template.name}</TableCell>
                    <TableCell>
                      <Chip label={template.category} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {template.subject}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={template.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={template.isActive ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{new Date(template.lastModified).toLocaleDateString()}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Preview">
                        <IconButton size="small" onClick={() => handlePreview(template)} color="info">
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpenDialog(template)} color="primary">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Duplicate">
                        <IconButton size="small" onClick={() => handleDuplicateTemplate(template)} color="secondary">
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setDeleteTarget(template);
                            setOpenDeleteDialog(true);
                          }}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTemplates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No templates found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          {categories.filter(c => c !== 'All').map(category => {
            const count = templates.filter(t => t.category === category).length;
            return (
              <Grid item xs={12} sm={6} md={4} key={category}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>{category}</Typography>
                    <Typography variant="h4" color="primary" sx={{ mb: 1 }}>{count}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Template{count !== 1 ? 's' : ''}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Create/Edit Template Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTemplate ? 'Edit Template' : 'Create New Template'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Template Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <MenuItem value="Onboarding">Onboarding</MenuItem>
                  <MenuItem value="Leave Management">Leave Management</MenuItem>
                  <MenuItem value="Timesheets">Timesheets</MenuItem>
                  <MenuItem value="Security">Security</MenuItem>
                  <MenuItem value="Notifications">Notifications</MenuItem>
                  <MenuItem value="Invoicing">Invoicing</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  helperText="Use {{variableName}} for dynamic content"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <CodeIcon fontSize="small" color="action" />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Body (HTML)"
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  required
                  multiline
                  rows={12}
                  helperText="HTML content with {{variableName}} for dynamic values"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveTemplate} variant="contained">
            {editingTemplate ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={openPreviewDialog} onClose={() => setOpenPreviewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Template Preview</DialogTitle>
        <DialogContent>
          {previewData && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Template: {previewData.originalTemplate.name}</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>Variables:</Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {Object.keys(previewVariables).map(varName => (
                  <Grid item xs={12} sm={6} key={varName}>
                    <TextField
                      fullWidth
                      size="small"
                      label={varName}
                      value={previewVariables[varName]}
                      onChange={(e) => {
                        setPreviewVariables({
                          ...previewVariables,
                          [varName]: e.target.value
                        });
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
              
              <Button
                variant="outlined"
                size="small"
                onClick={handleUpdatePreview}
                sx={{ mb: 2 }}
              >
                Update Preview
              </Button>
              
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>Subject:</Typography>
              <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
                <Typography>{previewData.subject}</Typography>
              </Paper>
              
              <Typography variant="subtitle2" gutterBottom>Body:</Typography>
              <Paper sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
                <div dangerouslySetInnerHTML={{ __html: previewData.body }} />
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreviewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Template</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the template "{deleteTarget?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteTemplate} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* SMTP Configuration Dialog */}
      <Dialog open={openSMTPDialog} onClose={() => setOpenSMTPDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>SMTP Configuration</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="SMTP Host"
                  value={smtpForm.host}
                  onChange={(e) => setSMTPForm({ ...smtpForm, host: e.target.value })}
                  placeholder="smtp.example.com"
                />
              </Grid>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  type="number"
                  label="Port"
                  value={smtpForm.port}
                  onChange={(e) => setSMTPForm({ ...smtpForm, port: parseInt(e.target.value) })}
                />
              </Grid>
              <Grid item xs={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={smtpForm.secure}
                      onChange={(e) => setSMTPForm({ ...smtpForm, secure: e.target.checked })}
                    />
                  }
                  label="SSL/TLS"
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>Authentication</Divider>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username"
                  value={smtpForm.authUser}
                  onChange={(e) => setSMTPForm({ ...smtpForm, authUser: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  label="Password"
                  value={smtpForm.authPass}
                  onChange={(e) => setSMTPForm({ ...smtpForm, authPass: e.target.value })}
                  placeholder="Leave empty to keep existing"
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>From Address</Divider>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="From Name"
                  value={smtpForm.fromName}
                  onChange={(e) => setSMTPForm({ ...smtpForm, fromName: e.target.value })}
                  placeholder="CentraPro"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="email"
                  label="From Email"
                  value={smtpForm.fromEmail}
                  onChange={(e) => setSMTPForm({ ...smtpForm, fromEmail: e.target.value })}
                  placeholder="noreply@centrapro.com"
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleTestSMTPConnection}
                    disabled={testingConnection}
                    startIcon={testingConnection ? <CircularProgress size={16} /> : <CheckIcon />}
                  >
                    Test Connection
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setOpenTestEmailDialog(true)}
                    startIcon={<SendIcon />}
                  >
                    Send Test Email
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSMTPDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveSMTPConfig} variant="contained">
            Save Configuration
          </Button>
        </DialogActions>
      </Dialog>

      {/* Send Test Email Dialog */}
      <Dialog open={openTestEmailDialog} onClose={() => setOpenTestEmailDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Send Test Email</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              type="email"
              label="Recipient Email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTestEmailDialog(false)}>Cancel</Button>
          <Button onClick={handleSendTestEmail} variant="contained" disabled={!testEmail}>
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailTemplates;
