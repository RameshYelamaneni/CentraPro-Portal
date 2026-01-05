import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Security,
  Person,
  Settings,
  Assessment,
  Shield,
  AdminPanelSettings,
  Group,
  History,
  VerifiedUser
} from '@mui/icons-material';
import { API_BASE } from '../utils/api';

interface Role {
  id: number;
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  id: string;
  name: string;
  category: string;
}

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  roleInfo?: Role;
}

interface AuditLog {
  id: number;
  userId: number;
  userName: string;
  action: string;
  resource: string;
  resourceId: number | null;
  details: string;
  ipAddress: string;
  timestamp: string;
}

interface AuditStats {
  total: number;
  last24h: number;
  last7d: number;
  byAction: Record<string, number>;
  byResource: Record<string, number>;
  byUser: Record<string, number>;
}

interface SystemSettings {
  modules: {
    onboarding: { enabled: boolean; requireApproval: boolean };
    timesheets: { enabled: boolean; requireApproval: boolean };
    leave: { enabled: boolean; maxDaysPerRequest: number };
    invoicing: { enabled: boolean };
    reporting: { enabled: boolean };
  };
  security: {
    passwordMinLength: number;
    passwordRequireSpecialChar: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
  };
  notifications: {
    emailEnabled: boolean;
    smtpConfigured: boolean;
  };
}

interface SharePointConfig {
  enabled: boolean;
  tenantId: string;
  clientId: string;
  clientSecret: string;
  siteUrl: string;
  siteName: string;
  connectionStatus: 'not_tested' | 'testing' | 'connected' | 'failed';
  lastTested: string | null;
  listsCreated: boolean;
  listsCount: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminConsole: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Roles state
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: [] as string[]
  });

  // Permissions state
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [userRoleDialogOpen, setUserRoleDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState('');

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditStats, setAuditStats] = useState<AuditStats | null>(null);
  const [auditFilters, setAuditFilters] = useState({
    action: '',
    resource: '',
    limit: 100
  });

  // Settings state
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [settingsChanged, setSettingsChanged] = useState(false);

  // SharePoint state - Load from localStorage
  const [sharepointConfig, setSharepointConfig] = useState<SharePointConfig>(() => {
    const saved = localStorage.getItem('sharepoint_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved SharePoint config:', e);
      }
    }
    return {
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
  });
  const [testingConnection, setTestingConnection] = useState(false);
  const [creatingLists, setCreatingLists] = useState(false);

  // Save SharePoint config to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sharepoint_config', JSON.stringify(sharepointConfig));
  }, [sharepointConfig]);

  // Restore SharePoint config to backend on mount
  useEffect(() => {
    const restoreSharePointConfig = async () => {
      // Use current sharepointConfig state which has default credentials merged
      if (sharepointConfig.enabled && sharepointConfig.connectionStatus === 'connected') {
        try {
          const response = await fetch(`${API_BASE}/api/sharepoint/restore-config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sharepointConfig)
          });
          if (response.ok) {
            console.log('✅ SharePoint config restored to backend');
          }
        } catch (e) {
          console.error('Failed to restore SharePoint config:', e);
        }
      }
    };
    
    restoreSharePointConfig();
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      await Promise.all([
        fetchRoles(),
        fetchPermissions(),
        fetchUsers(),
        fetchAuditLogs(),
        fetchAuditStats(),
        fetchSettings()
      ]);

      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/admin/roles`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch roles');
    const data = await response.json();
    setRoles(data);
  };

  const fetchPermissions = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/admin/permissions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch permissions');
    const data = await response.json();
    setAvailablePermissions(data);
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    const data = await response.json();
    setUsers(data);
  };

  const fetchAuditLogs = async () => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    if (auditFilters.action) params.append('action', auditFilters.action);
    if (auditFilters.resource) params.append('resource', auditFilters.resource);
    params.append('limit', auditFilters.limit.toString());

    const response = await fetch(`${API_BASE}/admin/audit-logs?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch audit logs');
    const data = await response.json();
    setAuditLogs(data);
  };

  const fetchAuditStats = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/admin/audit-stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch audit stats');
    const data = await response.json();
    setAuditStats(data);
  };

  const fetchSettings = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/admin/settings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch settings');
    const data = await response.json();
    setSettings(data);
  };

  // Role management functions
  const openRoleDialog = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setRoleFormData({
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        permissions: role.permissions
      });
    } else {
      setEditingRole(null);
      setRoleFormData({
        name: '',
        displayName: '',
        description: '',
        permissions: []
      });
    }
    setRoleDialogOpen(true);
  };

  const handleSaveRole = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = editingRole
        ? `${API_BASE}/admin/roles/${editingRole.id}`
        : `${API_BASE}/admin/roles`;
      
      const method = editingRole ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(roleFormData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save role');
      }

      setSuccess(`Role ${editingRole ? 'updated' : 'created'} successfully`);
      setRoleDialogOpen(false);
      fetchRoles();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteRole = async (role: Role) => {
    if (!confirm(`Are you sure you want to delete role "${role.displayName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/roles/${role.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete role');
      }

      setSuccess('Role deleted successfully');
      fetchRoles();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setRoleFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  // User role management
  const openUserRoleDialog = (user: User) => {
    setEditingUser(user);
    setSelectedRole(user.role);
    setUserRoleDialogOpen(true);
  };

  const handleUpdateUserRole = async () => {
    if (!editingUser) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/users/${editingUser.id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: selectedRole })
      });

      if (!response.ok) throw new Error('Failed to update user role');

      setSuccess('User role updated successfully');
      setUserRoleDialogOpen(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Settings management
  const handleSettingsChange = (path: string[], value: any) => {
    setSettings(prev => {
      if (!prev) return prev;
      const newSettings = { ...prev };
      let current: any = newSettings;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newSettings;
    });
    setSettingsChanged(true);
  };

  const handleSaveSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) throw new Error('Failed to save settings');

      setSuccess('Settings saved successfully');
      setSettingsChanged(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, 'success' | 'info' | 'warning' | 'error'> = {
      create: 'success',
      update: 'info',
      delete: 'error',
      login: 'info',
      approve: 'success',
      reject: 'warning'
    };
    return colors[action] || 'default';
  };

  // SharePoint handlers
  const handleTestSharePointConnection = async () => {
    setTestingConnection(true);
    setSharepointConfig(prev => ({ ...prev, connectionStatus: 'testing' }));
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/sharepoint/test-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tenantId: sharepointConfig.tenantId,
          clientId: sharepointConfig.clientId,
          clientSecret: sharepointConfig.clientSecret,
          siteUrl: sharepointConfig.siteUrl,
          siteName: sharepointConfig.siteName
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setSharepointConfig(prev => ({
          ...prev,
          connectionStatus: 'connected',
          lastTested: new Date().toISOString(),
          listsCount: result.listsCount || 0
        }));
        setSuccess('SharePoint connection successful!');
      } else {
        setSharepointConfig(prev => ({
          ...prev,
          connectionStatus: 'failed',
          lastTested: new Date().toISOString()
        }));
        setError(result.message || 'Connection failed');
      }
    } catch (err: any) {
      setSharepointConfig(prev => ({
        ...prev,
        connectionStatus: 'failed',
        lastTested: new Date().toISOString()
      }));
      setError('Connection test failed: ' + err.message);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleCreateSharePointLists = async () => {
    setCreatingLists(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/sharepoint/create-lists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setSharepointConfig(prev => ({
          ...prev,
          listsCreated: true,
          listsCount: result.listsCreated || 8
        }));
        setSuccess(`Successfully created ${result.listsCreated || 8} SharePoint lists!`);
      } else {
        setError(result.message || 'Failed to create lists');
      }
    } catch (err: any) {
      setError('Failed to create lists: ' + err.message);
    } finally {
      setCreatingLists(false);
    }
  };

  const handleSaveSharePointConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/sharepoint/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(sharepointConfig)
      });

      if (!response.ok) throw new Error('Failed to save SharePoint configuration');

      setSuccess('SharePoint configuration saved successfully');
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Group permissions by category
  const permissionsByCategory = availablePermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading admin console...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <AdminPanelSettings sx={{ fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" gutterBottom>
            Admin Console
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage roles, permissions, users, and system settings
          </Typography>
        </Box>
      </Box>

      {/* Alerts */}
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

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab icon={<Shield />} label="Roles & Permissions" iconPosition="start" />
          <Tab icon={<Group />} label="User Roles" iconPosition="start" />
          <Tab icon={<History />} label="Audit Logs" iconPosition="start" />
          <Tab icon={<Settings />} label="System Settings" iconPosition="start" />
          <Tab icon={<Assessment />} label="SharePoint Connection" iconPosition="start" />
        </Tabs>

        {/* Roles & Permissions Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Roles Management</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => openRoleDialog()}
            >
              Create Role
            </Button>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Role Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Permissions</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <VerifiedUser color="primary" />
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {role.displayName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {role.name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell>
                      <Chip
                        label={role.permissions.length === 1 && role.permissions[0] === 'all' 
                          ? 'All Permissions' 
                          : `${role.permissions.length} permissions`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={role.isSystem ? 'System' : 'Custom'}
                        size="small"
                        color={role.isSystem ? 'default' : 'success'}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => openRoleDialog(role)}
                          disabled={role.isSystem}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteRole(role)}
                          disabled={role.isSystem}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* User Roles Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            User Role Assignments
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Manage role assignments for all users in the system
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Current Role</TableCell>
                  <TableCell>Permissions Count</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person />
                        {user.name}
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.roleInfo?.displayName || user.role}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {user.roleInfo?.permissions.length || 0} permissions
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => openUserRoleDialog(user)}
                      >
                        Change Role
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Audit Logs Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Audit Trail
          </Typography>

          {/* Stats Cards */}
          {auditStats && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Total Events
                    </Typography>
                    <Typography variant="h4">{auditStats.total}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Last 24 Hours
                    </Typography>
                    <Typography variant="h4">{auditStats.last24h}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Last 7 Days
                    </Typography>
                    <Typography variant="h4">{auditStats.last7d}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Action</InputLabel>
                <Select
                  value={auditFilters.action}
                  label="Filter by Action"
                  onChange={(e) => {
                    setAuditFilters(prev => ({ ...prev, action: e.target.value }));
                    fetchAuditLogs();
                  }}
                >
                  <MenuItem value="">All Actions</MenuItem>
                  <MenuItem value="create">Create</MenuItem>
                  <MenuItem value="update">Update</MenuItem>
                  <MenuItem value="delete">Delete</MenuItem>
                  <MenuItem value="login">Login</MenuItem>
                  <MenuItem value="approve">Approve</MenuItem>
                  <MenuItem value="reject">Reject</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Resource</InputLabel>
                <Select
                  value={auditFilters.resource}
                  label="Filter by Resource"
                  onChange={(e) => {
                    setAuditFilters(prev => ({ ...prev, resource: e.target.value }));
                    fetchAuditLogs();
                  }}
                >
                  <MenuItem value="">All Resources</MenuItem>
                  <MenuItem value="auth">Auth</MenuItem>
                  <MenuItem value="employee">Employee</MenuItem>
                  <MenuItem value="role">Role</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="settings">Settings</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setAuditFilters({ action: '', resource: '', limit: 100 });
                  fetchAuditLogs();
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>

          {/* Audit Logs Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Resource</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>IP Address</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{formatDate(log.timestamp)}</TableCell>
                    <TableCell>{log.userName}</TableCell>
                    <TableCell>
                      <Chip
                        label={log.action}
                        size="small"
                        color={getActionColor(log.action)}
                      />
                    </TableCell>
                    <TableCell>
                      {log.resource}
                      {log.resourceId && ` #${log.resourceId}`}
                    </TableCell>
                    <TableCell>{log.details}</TableCell>
                    <TableCell>
                      <Typography variant="caption">{log.ipAddress}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* System Settings Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">System Configuration</Typography>
            {settingsChanged && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveSettings}
              >
                Save Changes
              </Button>
            )}
          </Box>

          {settings && (
            <Grid container spacing={3}>
              {/* Module Settings */}
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Module Settings
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Onboarding Module"
                          secondary="Employee onboarding workflow"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={settings.modules.onboarding.enabled}
                            onChange={(e) => handleSettingsChange(['modules', 'onboarding', 'enabled'], e.target.checked)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      
                      <ListItem>
                        <ListItemText
                          primary="Timesheets Module"
                          secondary="Time tracking and approval"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={settings.modules.timesheets.enabled}
                            onChange={(e) => handleSettingsChange(['modules', 'timesheets', 'enabled'], e.target.checked)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      
                      <ListItem>
                        <ListItemText
                          primary="Leave Management"
                          secondary="PTO and leave requests"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={settings.modules.leave.enabled}
                            onChange={(e) => handleSettingsChange(['modules', 'leave', 'enabled'], e.target.checked)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      
                      <ListItem>
                        <ListItemText
                          primary="Invoicing Module"
                          secondary="Invoice generation and tracking"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={settings.modules.invoicing.enabled}
                            onChange={(e) => handleSettingsChange(['modules', 'invoicing', 'enabled'], e.target.checked)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Security Settings */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Security Settings
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <TextField
                      fullWidth
                      label="Password Min Length"
                      type="number"
                      value={settings.security.passwordMinLength}
                      onChange={(e) => handleSettingsChange(['security', 'passwordMinLength'], parseInt(e.target.value))}
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Session Timeout (minutes)"
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => handleSettingsChange(['security', 'sessionTimeout'], parseInt(e.target.value))}
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Max Login Attempts"
                      type="number"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) => handleSettingsChange(['security', 'maxLoginAttempts'], parseInt(e.target.value))}
                      sx={{ mb: 2 }}
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.security.passwordRequireSpecialChar}
                          onChange={(e) => handleSettingsChange(['security', 'passwordRequireSpecialChar'], e.target.checked)}
                        />
                      }
                      label="Require Special Character in Password"
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* Notification Settings */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Notification Settings
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notifications.emailEnabled}
                          onChange={(e) => handleSettingsChange(['notifications', 'emailEnabled'], e.target.checked)}
                        />
                      }
                      label="Enable Email Notifications"
                    />
                    
                    <Box sx={{ mt: 2 }}>
                      <Alert severity={settings.notifications.smtpConfigured ? 'success' : 'warning'}>
                        SMTP: {settings.notifications.smtpConfigured ? 'Configured' : 'Not Configured'}
                      </Alert>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </TabPanel>
      </Card>

      {/* Role Dialog */}
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRole ? 'Edit Role' : 'Create New Role'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Role Name (identifier)"
            value={roleFormData.name}
            onChange={(e) => setRoleFormData(prev => ({ ...prev, name: e.target.value }))}
            disabled={!!editingRole}
            sx={{ mt: 2, mb: 2 }}
            helperText="Lowercase, no spaces (e.g., 'hr_manager')"
          />
          
          <TextField
            fullWidth
            label="Display Name"
            value={roleFormData.displayName}
            onChange={(e) => setRoleFormData(prev => ({ ...prev, displayName: e.target.value }))}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Description"
            value={roleFormData.description}
            onChange={(e) => setRoleFormData(prev => ({ ...prev, description: e.target.value }))}
            sx={{ mb: 3 }}
          />

          <Typography variant="subtitle1" gutterBottom>
            Permissions
          </Typography>
          
          {Object.entries(permissionsByCategory).map(([category, perms]) => (
            <Box key={category} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                {category}
              </Typography>
              <FormGroup>
                {perms.map((perm) => (
                  <FormControlLabel
                    key={perm.id}
                    control={
                      <Checkbox
                        checked={roleFormData.permissions.includes(perm.id)}
                        onChange={() => handlePermissionToggle(perm.id)}
                      />
                    }
                    label={perm.name}
                  />
                ))}
              </FormGroup>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveRole}>
            {editingRole ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Role Dialog */}
      <Dialog open={userRoleDialogOpen} onClose={() => setUserRoleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change User Role</DialogTitle>
        <DialogContent>
          {editingUser && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                User: <strong>{editingUser.name}</strong> ({editingUser.email})
              </Typography>
              
              <FormControl fullWidth>
                <InputLabel>Select Role</InputLabel>
                <Select
                  value={selectedRole}
                  label="Select Role"
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.name}>
                      {role.displayName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserRoleDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateUserRole}>
            Update Role
          </Button>
        </DialogActions>
      </Dialog>

      {/* SharePoint Connection Tab */}
      <TabPanel value={tabValue} index={4}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            SharePoint Integration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure connection to Microsoft SharePoint for real-time data persistence
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Connection Status Card */}
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ 
              borderColor: sharepointConfig.connectionStatus === 'connected' ? 'success.main' : 
                           sharepointConfig.connectionStatus === 'failed' ? 'error.main' : 'grey.300'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Connection Status</Typography>
                  <Chip 
                    label={sharepointConfig.connectionStatus === 'connected' ? 'Connected' :
                           sharepointConfig.connectionStatus === 'testing' ? 'Testing...' :
                           sharepointConfig.connectionStatus === 'failed' ? 'Failed' : 'Not Tested'}
                    color={sharepointConfig.connectionStatus === 'connected' ? 'success' :
                           sharepointConfig.connectionStatus === 'failed' ? 'error' : 'default'}
                    icon={sharepointConfig.connectionStatus === 'connected' ? <VerifiedUser /> : undefined}
                  />
                </Box>

                {sharepointConfig.lastTested && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Last tested: {formatDate(sharepointConfig.lastTested)}
                  </Typography>
                )}

                {sharepointConfig.connectionStatus === 'connected' && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Successfully connected to SharePoint! {sharepointConfig.listsCount} lists detected.
                  </Alert>
                )}

                {sharepointConfig.connectionStatus === 'failed' && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    Connection failed. Please check your Azure AD credentials and try again.
                  </Alert>
                )}

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button 
                    variant="contained" 
                    onClick={handleTestSharePointConnection}
                    disabled={testingConnection || !sharepointConfig.tenantId || !sharepointConfig.clientId}
                  >
                    {testingConnection ? 'Testing...' : 'Test Connection'}
                  </Button>

                  {sharepointConfig.connectionStatus === 'connected' && !sharepointConfig.listsCreated && (
                    <Button 
                      variant="contained" 
                      color="success"
                      onClick={handleCreateSharePointLists}
                      disabled={creatingLists}
                    >
                      {creatingLists ? 'Creating Lists...' : 'Create SharePoint Lists'}
                    </Button>
                  )}

                  {sharepointConfig.connectionStatus === 'connected' && (
                    <Button 
                      variant="outlined" 
                      onClick={() => window.open(`${sharepointConfig.siteUrl}/_layouts/15/viewlsts.aspx?view=14`, '_blank')}
                    >
                      View Lists in SharePoint
                    </Button>
                  )}

                  {sharepointConfig.listsCreated && (
                    <Chip 
                      label={`${sharepointConfig.listsCount} Lists Created`}
                      color="success"
                      icon={<VerifiedUser />}
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Azure AD Configuration */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Azure AD Configuration
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <TextField
                  fullWidth
                  label="Tenant ID"
                  value={sharepointConfig.tenantId}
                  onChange={(e) => setSharepointConfig(prev => ({ ...prev, tenantId: e.target.value }))}
                  placeholder="your-tenant-id"
                  sx={{ mb: 2 }}
                  helperText="Azure AD Directory (tenant) ID"
                />

                <TextField
                  fullWidth
                  label="Client ID"
                  value={sharepointConfig.clientId}
                  onChange={(e) => setSharepointConfig(prev => ({ ...prev, clientId: e.target.value }))}
                  placeholder="your-client-id"
                  sx={{ mb: 2 }}
                  helperText="Application (client) ID from Azure Portal"
                />

                <TextField
                  fullWidth
                  label="Client Secret"
                  type="password"
                  value={sharepointConfig.clientSecret}
                  onChange={(e) => setSharepointConfig(prev => ({ ...prev, clientSecret: e.target.value }))}
                  placeholder="your-client-secret"
                  sx={{ mb: 2 }}
                  helperText="Client secret value (keep secure!)"
                />

                <Alert severity="info" sx={{ mt: 2 }}>
                  Get these values from Azure Portal → App Registrations → Your App
                </Alert>
              </CardContent>
            </Card>
          </Grid>

          {/* SharePoint Configuration */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  SharePoint Configuration
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <TextField
                  fullWidth
                  label="SharePoint Site URL"
                  value={sharepointConfig.siteUrl}
                  onChange={(e) => setSharepointConfig(prev => ({ ...prev, siteUrl: e.target.value }))}
                  placeholder="https://rightarcconsulting.sharepoint.com"
                  sx={{ mb: 2 }}
                  helperText="Your SharePoint site URL"
                />

                <TextField
                  fullWidth
                  label="SharePoint Site Name"
                  value={sharepointConfig.siteName}
                  onChange={(e) => setSharepointConfig(prev => ({ ...prev, siteName: e.target.value }))}
                  placeholder="rightarcconsulting.sharepoint.com"
                  sx={{ mb: 2 }}
                  helperText="Format: domain or domain:/sites/sitename"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={sharepointConfig.enabled}
                      onChange={(e) => setSharepointConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                      disabled={sharepointConfig.connectionStatus !== 'connected'}
                    />
                  }
                  label="Enable SharePoint Integration"
                />

                <Alert severity="warning" sx={{ mt: 2 }}>
                  When enabled, all data will be stored in SharePoint instead of in-memory.
                </Alert>
              </CardContent>
            </Card>
          </Grid>

          {/* Setup Instructions */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Setup Guide
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                  Step 1: Azure AD App Registration
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="1. Go to Azure Portal → Azure Active Directory → App registrations" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="2. Create new registration: CentraPro-SharePoint" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="3. Copy Tenant ID and Client ID" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="4. Create Client Secret (Certificates & secrets)" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="5. Add API permissions: Sites.ReadWrite.All, Sites.FullControl.All" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="6. Grant admin consent" />
                  </ListItem>
                </List>

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  Step 2: Configure & Test
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="1. Enter Azure AD credentials above" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="2. Click 'Test Connection'" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="3. If successful, click 'Create SharePoint Lists'" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="4. Enable SharePoint Integration" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="5. Save configuration" />
                  </ListItem>
                </List>

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => window.open('/Guides/SHAREPOINT_SETUP_COMPLETE.md', '_blank')}
                  >
                    View Complete Guide
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={() => window.open('https://portal.azure.com', '_blank')}
                  >
                    Open Azure Portal
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Save Button */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button 
                variant="contained" 
                size="large"
                onClick={handleSaveSharePointConfig}
                disabled={!sharepointConfig.tenantId || !sharepointConfig.clientId || !sharepointConfig.clientSecret}
              >
                Save SharePoint Configuration
              </Button>
            </Box>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default AdminConsole;
