import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Tooltip
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  HourglassEmpty,
  Visibility,
  Comment,
  Search,
  FilterList,
  TrendingUp,
  Schedule,
  Assignment
} from '@mui/icons-material';

const API_BASE = 'http://localhost:4000/api';

interface Approval {
  id: number;
  type: string;
  referenceId: number;
  requesterId: number;
  requesterName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  decidedBy?: number;
  decidedAt?: string;
  approvers: string[];
  currentApprover: string;
  comments: Array<{
    userId: number;
    userName: string;
    comment: string;
    timestamp: string;
  }>;
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

const Approvals: React.FC = () => {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [filteredApprovals, setFilteredApprovals] = useState<Approval[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Decision dialog state
  const [decisionDialogOpen, setDecisionDialogOpen] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [decision, setDecision] = useState<'approved' | 'rejected'>('approved');
  const [comment, setComment] = useState('');

  // Details drawer state
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [viewApproval, setViewApproval] = useState<Approval | null>(null);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchApprovals();
  }, []);

  useEffect(() => {
    filterApprovals();
  }, [approvals, tabValue, searchTerm, typeFilter]);

  const fetchApprovals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/approvals`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch approvals');

      const data = await response.json();
      setApprovals(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const filterApprovals = () => {
    let filtered = [...approvals];

    // Filter by tab (status)
    if (tabValue === 1) {
      filtered = filtered.filter(a => a.status === 'pending');
    } else if (tabValue === 2) {
      filtered = filtered.filter(a => a.status === 'approved');
    } else if (tabValue === 3) {
      filtered = filtered.filter(a => a.status === 'rejected');
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(a => a.type === typeFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.id.toString().includes(searchTerm)
      );
    }

    setFilteredApprovals(filtered);
  };

  const handleDecide = async () => {
    if (!selectedApproval) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/approvals/${selectedApproval.id}/decide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ decision, comment })
      });

      if (!response.ok) throw new Error('Failed to process decision');

      setSuccess(`Request ${decision} successfully`);
      setDecisionDialogOpen(false);
      setComment('');
      fetchApprovals();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openDecisionDialog = (approval: Approval, dec: 'approved' | 'rejected') => {
    setSelectedApproval(approval);
    setDecision(dec);
    setDecisionDialogOpen(true);
  };

  const openDetailsDrawer = (approval: Approval) => {
    setViewApproval(approval);
    setDetailsDrawerOpen(true);
  };

  const getStatusChip = (status: string) => {
    const statusConfig = {
      pending: { color: 'warning' as const, icon: <HourglassEmpty fontSize="small" /> },
      approved: { color: 'success' as const, icon: <CheckCircle fontSize="small" /> },
      rejected: { color: 'error' as const, icon: <Cancel fontSize="small" /> }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Chip
        icon={config.icon}
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        color={config.color}
        size="small"
      />
    );
  };

  const getTypeIcon = (type: string): React.ReactElement => {
    const icons: Record<string, React.ReactElement> = {
      leave: <Schedule />,
      timesheet: <Assignment />,
      employee: <Avatar sx={{ width: 24, height: 24 }} />,
      onboarding: <TrendingUp />
    };
    return icons[type] || <Assignment />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate stats
  const stats = {
    pending: approvals.filter(a => a.status === 'pending').length,
    todayApproved: approvals.filter(a => {
      if (a.status !== 'approved' || !a.decidedAt) return false;
      const decidedDate = new Date(a.decidedAt).toDateString();
      const today = new Date().toDateString();
      return decidedDate === today;
    }).length,
    avgResponseTime: (() => {
      const decided = approvals.filter(a => a.decidedAt);
      if (decided.length === 0) return 0;
      const totalHours = decided.reduce((sum, a) => {
        const created = new Date(a.createdAt).getTime();
        const decided = new Date(a.decidedAt!).getTime();
        return sum + (decided - created) / (1000 * 60 * 60);
      }, 0);
      return Math.round(totalHours / decided.length);
    })()
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading approvals...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Approvals & Workflows
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage all approval requests across the organization
        </Typography>
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

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Pending Approvals
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 1, color: 'warning.main' }}>
                    {stats.pending}
                  </Typography>
                </Box>
                <HourglassEmpty sx={{ fontSize: 48, color: 'warning.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Approved Today
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 1, color: 'success.main' }}>
                    {stats.todayApproved}
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 48, color: 'success.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Avg Response Time
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 1, color: 'info.main' }}>
                    {stats.avgResponseTime}h
                  </Typography>
                </Box>
                <Schedule sx={{ fontSize: 48, color: 'info.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by requester, type, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Type</InputLabel>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  label="Filter by Type"
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterList />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="leave">Leave Requests</MenuItem>
                  <MenuItem value="timesheet">Timesheets</MenuItem>
                  <MenuItem value="employee">Employee Changes</MenuItem>
                  <MenuItem value="onboarding">Onboarding</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label={`All (${approvals.length})`} />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Pending
                {stats.pending > 0 && (
                  <Chip
                    label={stats.pending}
                    size="small"
                    color="warning"
                    sx={{ height: 20, minWidth: 20 }}
                  />
                )}
              </Box>
            }
          />
          <Tab label={`Approved (${approvals.filter(a => a.status === 'approved').length})`} />
          <Tab label={`Rejected (${approvals.filter(a => a.status === 'rejected').length})`} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <ApprovalTable
            approvals={filteredApprovals}
            onApprove={(a) => openDecisionDialog(a, 'approved')}
            onReject={(a) => openDecisionDialog(a, 'rejected')}
            onViewDetails={openDetailsDrawer}
            getStatusChip={getStatusChip}
            getTypeIcon={getTypeIcon}
            formatDate={formatDate}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <ApprovalTable
            approvals={filteredApprovals}
            onApprove={(a) => openDecisionDialog(a, 'approved')}
            onReject={(a) => openDecisionDialog(a, 'rejected')}
            onViewDetails={openDetailsDrawer}
            getStatusChip={getStatusChip}
            getTypeIcon={getTypeIcon}
            formatDate={formatDate}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <ApprovalTable
            approvals={filteredApprovals}
            onApprove={(a) => openDecisionDialog(a, 'approved')}
            onReject={(a) => openDecisionDialog(a, 'rejected')}
            onViewDetails={openDetailsDrawer}
            getStatusChip={getStatusChip}
            getTypeIcon={getTypeIcon}
            formatDate={formatDate}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <ApprovalTable
            approvals={filteredApprovals}
            onApprove={(a) => openDecisionDialog(a, 'approved')}
            onReject={(a) => openDecisionDialog(a, 'rejected')}
            onViewDetails={openDetailsDrawer}
            getStatusChip={getStatusChip}
            getTypeIcon={getTypeIcon}
            formatDate={formatDate}
          />
        </TabPanel>
      </Card>

      {/* Decision Dialog */}
      <Dialog open={decisionDialogOpen} onClose={() => setDecisionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {decision === 'approved' ? 'Approve Request' : 'Reject Request'}
        </DialogTitle>
        <DialogContent>
          {selectedApproval && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Request from: <strong>{selectedApproval.requesterName}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Type: <strong>{selectedApproval.type.toUpperCase()}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Submitted: <strong>{formatDate(selectedApproval.createdAt)}</strong>
              </Typography>
            </Box>
          )}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Comment (Optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add any comments or notes..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDecisionDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color={decision === 'approved' ? 'success' : 'error'}
            onClick={handleDecide}
          >
            {decision === 'approved' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Drawer */}
      <Drawer
        anchor="right"
        open={detailsDrawerOpen}
        onClose={() => setDetailsDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 400 } } }}
      >
        {viewApproval && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Approval Details
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <List>
              <ListItem>
                <ListItemText
                  primary="Request ID"
                  secondary={`#${viewApproval.id}`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Type"
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      {getTypeIcon(viewApproval.type)}
                      {viewApproval.type.toUpperCase()}
                    </Box>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Requester"
                  secondary={viewApproval.requesterName}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Status"
                  secondary={getStatusChip(viewApproval.status)}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Created"
                  secondary={formatDate(viewApproval.createdAt)}
                />
              </ListItem>
              {viewApproval.decidedAt && (
                <ListItem>
                  <ListItemText
                    primary="Decided"
                    secondary={formatDate(viewApproval.decidedAt)}
                  />
                </ListItem>
              )}
              <ListItem>
                <ListItemText
                  primary="Current Approver"
                  secondary={viewApproval.currentApprover.toUpperCase()}
                />
              </ListItem>
            </List>

            {viewApproval.comments.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Comments ({viewApproval.comments.length})
                </Typography>
                {viewApproval.comments.map((c, idx) => (
                  <Card key={idx} sx={{ mb: 1, backgroundColor: 'grey.50' }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" fontWeight="bold">
                          {c.userName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(c.timestamp)}
                        </Typography>
                      </Box>
                      <Typography variant="body2">{c.comment}</Typography>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              {viewApproval.status === 'pending' && (
                <>
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => {
                      setDetailsDrawerOpen(false);
                      openDecisionDialog(viewApproval, 'approved');
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => {
                      setDetailsDrawerOpen(false);
                      openDecisionDialog(viewApproval, 'rejected');
                    }}
                  >
                    Reject
                  </Button>
                </>
              )}
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};

// Table component
interface ApprovalTableProps {
  approvals: Approval[];
  onApprove: (approval: Approval) => void;
  onReject: (approval: Approval) => void;
  onViewDetails: (approval: Approval) => void;
  getStatusChip: (status: string) => React.ReactElement;
  getTypeIcon: (type: string) => React.ReactElement;
  formatDate: (date: string) => string;
}

const ApprovalTable: React.FC<ApprovalTableProps> = ({
  approvals,
  onApprove,
  onReject,
  onViewDetails,
  getStatusChip,
  getTypeIcon,
  formatDate
}) => {
  if (approvals.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <HourglassEmpty sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography color="text.secondary">No approvals found</Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Requester</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {approvals.map((approval) => (
            <TableRow key={approval.id} hover>
              <TableCell>#{approval.id}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getTypeIcon(approval.type)}
                  <Typography variant="body2">
                    {approval.type.charAt(0).toUpperCase() + approval.type.slice(1)}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>{approval.requesterName}</TableCell>
              <TableCell>
                <Typography variant="body2">{formatDate(approval.createdAt)}</Typography>
              </TableCell>
              <TableCell>{getStatusChip(approval.status)}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="View Details">
                    <IconButton size="small" onClick={() => onViewDetails(approval)}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {approval.status === 'pending' && (
                    <>
                      <Tooltip title="Approve">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => onApprove(approval)}
                        >
                          <CheckCircle fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onReject(approval)}
                        >
                          <Cancel fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Approvals;
