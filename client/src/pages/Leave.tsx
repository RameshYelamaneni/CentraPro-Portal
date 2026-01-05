import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  MenuItem,
  LinearProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PendingIcon from "@mui/icons-material/Pending";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

interface LeaveRequest {
  id: number;
  userId: number;
  userName: string;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  approvedBy: number | null;
  approvedAt: string | null;
}

const Leave: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userRole, setUserRole] = useState("user");

  // Form state
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    leaveType: "vacation",
    reason: "",
  });

  const leaveTypes = [
    { value: "vacation", label: "Vacation" },
    { value: "sick", label: "Sick Leave" },
    { value: "personal", label: "Personal Leave" },
    { value: "bereavement", label: "Bereavement" },
    { value: "unpaid", label: "Unpaid Leave" },
  ];

  useEffect(() => {
    fetchRequests();
    const token = localStorage.getItem("app_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserRole(payload.role || "user");
      } catch (e) {
        console.error("Error parsing token", e);
      }
    }
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("app_token");
      const res = await fetch(`${API_BASE}/api/leave`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error("Error fetching leave requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!formData.startDate || !formData.endDate || !formData.leaveType) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("app_token");
      const res = await fetch(`${API_BASE}/api/leave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const newRequest = await res.json();
        setRequests([...requests, newRequest]);
        setDialogOpen(false);
        setFormData({
          startDate: "",
          endDate: "",
          leaveType: "vacation",
          reason: "",
        });
        alert("Leave request submitted successfully!");
      } else {
        alert("Failed to submit request");
      }
    } catch (err) {
      console.error("Error submitting request:", err);
      alert("Error submitting request");
    }
  };

  const handleUpdateStatus = async (id: number, status: "approved" | "rejected") => {
    try {
      const token = localStorage.getItem("app_token");
      const res = await fetch(`${API_BASE}/api/leave/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, comment: `Request ${status}` }),
      });

      if (res.ok) {
        await fetchRequests();
        alert(`Leave request ${status}!`);
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Error updating status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "approved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircleIcon fontSize="small" />;
      case "rejected":
        return <CancelIcon fontSize="small" />;
      default:
        return <PendingIcon fontSize="small" />;
    }
  };

  const calculateLeaveDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Calculate leave balance (simplified - would be from backend in production)
  const totalLeave = 10;
  const usedLeave = requests.filter((r) => r.status === "approved").length;
  const leaveBalance = totalLeave - usedLeave;

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: "#1D1D1D", mb: 1 }}>
            Leave Management
          </Typography>
          <Typography variant="body2" sx={{ color: "#86868B" }}>
            Manage your leave requests and time off
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{
            bgcolor: "#0071E3",
            color: "#fff",
            textTransform: "none",
            borderRadius: "12px",
            px: 3,
            py: 1.5,
            "&:hover": { bgcolor: "#005BB5" },
          }}
        >
          Request Leave
        </Button>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2, mb: 4 }}>
        <Card sx={{ borderRadius: "16px", border: "1px solid #E5E5EA" }}>
          <CardContent>
            <Typography variant="body2" sx={{ color: "#86868B", mb: 1 }}>
              Leave Balance
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, color: "#34C759" }}>
              {leaveBalance} Days
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderRadius: "16px", border: "1px solid #E5E5EA" }}>
          <CardContent>
            <Typography variant="body2" sx={{ color: "#86868B", mb: 1 }}>
              Used Leave
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, color: "#FF3B30" }}>
              {usedLeave} Days
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderRadius: "16px", border: "1px solid #E5E5EA" }}>
          <CardContent>
            <Typography variant="body2" sx={{ color: "#86868B", mb: 1 }}>
              Pending Requests
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, color: "#FF9500" }}>
              {requests.filter((r) => r.status === "pending").length}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Requests Table */}
      {loading ? (
        <LinearProgress />
      ) : (
        <TableContainer
          component={Paper}
          sx={{ borderRadius: "16px", border: "1px solid #E5E5EA", boxShadow: "none" }}
        >
          <Table>
            <TableHead sx={{ bgcolor: "#F5F5F7" }}>
              <TableRow>
                {(userRole === "admin" || userRole === "manager") && (
                  <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                )}
                <TableCell sx={{ fontWeight: 600 }}>Leave Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>End Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Days</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                {(userRole === "admin" || userRole === "manager") && (
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id} hover>
                  {(userRole === "admin" || userRole === "manager") && (
                    <TableCell>{request.userName}</TableCell>
                  )}
                  <TableCell sx={{ textTransform: "capitalize" }}>{request.leaveType}</TableCell>
                  <TableCell>{new Date(request.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(request.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>{calculateLeaveDays(request.startDate, request.endDate)}</TableCell>
                  <TableCell sx={{ maxWidth: 200 }}>{request.reason || "—"}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(request.status)}
                      label={request.status}
                      size="small"
                      color={getStatusColor(request.status)}
                      sx={{ textTransform: "capitalize", borderRadius: "8px" }}
                    />
                  </TableCell>
                  {(userRole === "admin" || userRole === "manager") && (
                    <TableCell>
                      {request.status === "pending" && (
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              onClick={() => handleUpdateStatus(request.id, "approved")}
                              sx={{ color: "#34C759" }}
                            >
                              <ThumbUpIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              onClick={() => handleUpdateStatus(request.id, "rejected")}
                              sx={{ color: "#FF3B30" }}
                            >
                              <ThumbDownIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {requests.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={userRole === "admin" || userRole === "manager" ? 8 : 7}
                    align="center"
                    sx={{ py: 4, color: "#86868B" }}
                  >
                    No leave requests yet. Click "Request Leave" to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Request Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px" } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Request Leave</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="Leave Type"
              select
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
              fullWidth
            >
              {leaveTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Reason (Optional)"
              multiline
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitRequest}
            sx={{
              bgcolor: "#0071E3",
              textTransform: "none",
              borderRadius: "8px",
              "&:hover": { bgcolor: "#005BB5" },
            }}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Leave;
