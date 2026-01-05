import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Business,
  CreditCard,
  TrendingUp,
  CheckCircle,
  Warning,
  People,
  Storage,
  Api,
  EventSeat,
  Receipt,
  Upgrade,
  Settings,
  Info
} from '@mui/icons-material';

const API_BASE = 'http://localhost:4000/api';

interface License {
  id: number;
  tenantId: number;
  planName: string;
  planType: string;
  status: string;
  totalSeats: number;
  usedSeats: number;
  availableSeats: number;
  pricePerSeat: number;
  totalPrice: number;
  billingCycle: string;
  startDate: string;
  expiryDate: string;
  renewalDate: string;
  autoRenew: boolean;
  features: string[];
  limits: {
    maxEmployees: number;
    maxStorageGB: number;
    maxAPICallsPerDay: number;
  };
  usage: {
    employees: number;
    storageGB: number;
    apiCallsToday: number;
  };
  paymentMethod: {
    type: string;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
  };
  billingHistory: Array<{
    id: number;
    date: string;
    amount: number;
    status: string;
    invoiceNumber: string;
  }>;
}

interface UsageStats {
  employees: { used: number; limit: number; percentage: number };
  storage: { used: number; limit: number; percentage: number };
  apiCalls: { today: number; limit: number; percentage: number };
  seats: { used: number; total: number; available: number; percentage: number };
}

interface LicensePlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  maxSeats: number;
  features: string[];
  limits: {
    maxEmployees: number;
    maxStorageGB: number;
    maxAPICallsPerDay: number;
  };
}

const TenantManagement: React.FC = () => {
  const [license, setLicense] = useState<License | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [licensePlans, setLicensePlans] = useState<LicensePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Purchase seats dialog
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [additionalSeats, setAdditionalSeats] = useState(1);

  // Upgrade plan dialog
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [licenseRes, usageRes, plansRes] = await Promise.all([
        fetch(`${API_BASE}/license`, { headers }),
        fetch(`${API_BASE}/license/usage`, { headers }),
        fetch(`${API_BASE}/license-plans`, { headers })
      ]);

      if (!licenseRes.ok || !usageRes.ok || !plansRes.ok) {
        throw new Error('Failed to fetch license data');
      }

      const licenseData = await licenseRes.json();
      const usageData = await usageRes.json();
      const plansData = await plansRes.json();

      setLicense(licenseData);
      setUsageStats(usageData);
      setLicensePlans(plansData);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handlePurchaseSeats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/license/purchase-seats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ additionalSeats })
      });

      if (!response.ok) throw new Error('Failed to purchase seats');

      const data = await response.json();
      setSuccess(`Successfully purchased ${additionalSeats} additional seats for $${data.purchaseAmount.toFixed(2)}`);
      setPurchaseDialogOpen(false);
      setAdditionalSeats(1);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'info' => {
    const colors: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
      active: 'success',
      trial: 'info',
      expired: 'error',
      cancelled: 'warning'
    };
    return colors[status] || 'default' as any;
  };

  const getUsageColor = (percentage: number): 'success' | 'warning' | 'error' => {
    if (percentage >= 90) return 'error';
    if (percentage >= 75) return 'warning';
    return 'success';
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading license information...</Typography>
      </Box>
    );
  }

  if (!license) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">No active license found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Business sx={{ fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" gutterBottom>
            License & Subscription
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your subscription, seats, and usage
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

      {/* License Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {license.planName} Plan
                  </Typography>
                  <Chip 
                    label={license.status.toUpperCase()} 
                    color={getStatusColor(license.status)}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Billing: {license.billingCycle === 'monthly' ? 'Monthly' : 'Annual'}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" color="primary.main">
                    ${license.totalPrice.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    per {license.billingCycle === 'monthly' ? 'month' : 'year'}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Start Date
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(license.startDate)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Renewal Date
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(license.renewalDate)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Auto-Renew
                  </Typography>
                  <Typography variant="body2">
                    {license.autoRenew ? 'Enabled' : 'Disabled'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Price per Seat
                  </Typography>
                  <Typography variant="body2">
                    ${license.pricePerSeat}/seat
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Upgrade />}
                  onClick={() => setUpgradeDialogOpen(true)}
                >
                  Upgrade Plan
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Settings />}
                >
                  Manage Subscription
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Method
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <CreditCard sx={{ fontSize: 40, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2">
                    {license.paymentMethod.type === 'credit_card' ? 'Credit Card' : license.paymentMethod.type}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    •••• {license.paymentMethod.last4}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Expires {license.paymentMethod.expiryMonth}/{license.paymentMethod.expiryYear}
                  </Typography>
                </Box>
              </Box>
              <Button fullWidth variant="outlined" size="small">
                Update Payment Method
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Seat Management */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Seat Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {license.usedSeats} of {license.totalSeats} seats used ({license.availableSeats} available)
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<EventSeat />}
              onClick={() => setPurchaseDialogOpen(true)}
            >
              Purchase Seats
            </Button>
          </Box>

          <Box sx={{ mb: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={usageStats?.seats.percentage || 0}
              color={getUsageColor(usageStats?.seats.percentage || 0)}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                <Typography variant="h4" color="success.dark">
                  {license.usedSeats}
                </Typography>
                <Typography variant="caption" color="success.dark">
                  Used Seats
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                <Typography variant="h4" color="primary.dark">
                  {license.availableSeats}
                </Typography>
                <Typography variant="caption" color="primary.dark">
                  Available Seats
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.200', borderRadius: 1 }}>
                <Typography variant="h4">
                  {license.totalSeats}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Seats
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      {usageStats && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Usage & Limits
            </Typography>
            
            <Grid container spacing={3}>
              {/* Employees */}
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <People color="primary" />
                  <Typography variant="subtitle2">Employees</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {usageStats.employees.used} / {usageStats.employees.limit}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={usageStats.employees.percentage}
                  color={getUsageColor(usageStats.employees.percentage)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  {usageStats.employees.percentage}% used
                </Typography>
              </Grid>

              {/* Storage */}
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Storage color="primary" />
                  <Typography variant="subtitle2">Storage</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {usageStats.storage.used} GB / {usageStats.storage.limit} GB
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={usageStats.storage.percentage}
                  color={getUsageColor(usageStats.storage.percentage)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  {usageStats.storage.percentage}% used
                </Typography>
              </Grid>

              {/* API Calls */}
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Api color="primary" />
                  <Typography variant="subtitle2">API Calls (Today)</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {usageStats.apiCalls.today.toLocaleString()} / {usageStats.apiCalls.limit.toLocaleString()}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={usageStats.apiCalls.percentage}
                  color={getUsageColor(usageStats.apiCalls.percentage)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  {usageStats.apiCalls.percentage}% used
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Features */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Included Features
              </Typography>
              <List>
                {license.features.map((feature, index) => (
                  <ListItem key={index} dense>
                    <ListItemIcon>
                      <CheckCircle color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={feature} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Plan Limits
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Info color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Max Employees"
                    secondary={`${license.limits.maxEmployees} employees`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Info color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Storage Limit"
                    secondary={`${license.limits.maxStorageGB} GB`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Info color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="API Calls per Day"
                    secondary={`${license.limits.maxAPICallsPerDay.toLocaleString()} calls`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Billing History */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Billing History
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {license.billingHistory.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell>{bill.invoiceNumber}</TableCell>
                    <TableCell>{formatDate(bill.date)}</TableCell>
                    <TableCell>${bill.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={bill.status.toUpperCase()} 
                        color={bill.status === 'paid' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Download Invoice">
                        <IconButton size="small">
                          <Receipt fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Purchase Seats Dialog */}
      <Dialog open={purchaseDialogOpen} onClose={() => setPurchaseDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Purchase Additional Seats</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, mt: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Current: {license.totalSeats} seats (${license.totalPrice.toFixed(2)}/{license.billingCycle})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Price per seat: ${license.pricePerSeat}/{license.billingCycle}
            </Typography>
          </Box>

          <TextField
            fullWidth
            type="number"
            label="Number of Seats"
            value={additionalSeats}
            onChange={(e) => setAdditionalSeats(Math.max(1, parseInt(e.target.value) || 1))}
            inputProps={{ min: 1 }}
            sx={{ mb: 2 }}
          />

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Total Cost:</strong> ${(additionalSeats * license.pricePerSeat).toFixed(2)}
            </Typography>
            <Typography variant="caption">
              You will be charged immediately for the additional seats.
            </Typography>
          </Alert>

          <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              After Purchase:
            </Typography>
            <Typography variant="body2">
              Total Seats: {license.totalSeats + additionalSeats}
            </Typography>
            <Typography variant="body2">
              Monthly Cost: ${((license.totalSeats + additionalSeats) * license.pricePerSeat).toFixed(2)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPurchaseDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handlePurchaseSeats}>
            Purchase ${(additionalSeats * license.pricePerSeat).toFixed(2)}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upgrade Plan Dialog */}
      <Dialog open={upgradeDialogOpen} onClose={() => setUpgradeDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Upgrade Your Plan</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {licensePlans.map((plan) => (
              <Grid item xs={12} md={4} key={plan.id}>
                <Card 
                  variant="outlined"
                  sx={{ 
                    height: '100%',
                    border: plan.name === license.planName ? 2 : 1,
                    borderColor: plan.name === license.planName ? 'primary.main' : 'divider'
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {plan.name}
                    </Typography>
                    {plan.name === license.planName && (
                      <Chip label="Current Plan" color="primary" size="small" sx={{ mb: 1 }} />
                    )}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {plan.description}
                    </Typography>
                    <Typography variant="h4" color="primary.main" gutterBottom>
                      ${plan.priceMonthly}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      per seat/month
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Features:
                    </Typography>
                    <List dense>
                      {plan.features.slice(0, 5).map((feature, idx) => (
                        <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircle fontSize="small" color="success" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={feature}
                            primaryTypographyProps={{ variant: 'caption' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Button 
                      fullWidth 
                      variant={plan.name === license.planName ? 'outlined' : 'contained'}
                      disabled={plan.name === license.planName}
                      sx={{ mt: 2 }}
                    >
                      {plan.name === license.planName ? 'Current Plan' : 'Upgrade'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpgradeDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TenantManagement;
