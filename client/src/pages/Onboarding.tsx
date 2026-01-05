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
  IconButton,
  MenuItem,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

interface OnboardingRecord {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  designation: string;
  department: string;
  managerId: number | null;
  inviteToken: string;
  status: "invited" | "in-progress" | "completed";
  invitedAt: string;
  completedAt: string | null;
  documents: Document[];
  profileData: any;
}

interface Document {
  id: number;
  name: string;
  type: string;
  path: string;
  uploadedAt: string;
}

const Onboarding: React.FC = () => {
  const [records, setRecords] = useState<OnboardingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<OnboardingRecord | null>(null);

  // Invite form state
  const [inviteForm, setInviteForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    designation: "",
    department: "",
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("app_token");
      const res = await fetch(`${API_BASE}/api/onboarding`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch (err) {
      console.error("Error fetching onboarding records:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteForm.email || !inviteForm.firstName || !inviteForm.lastName) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("app_token");
      const res = await fetch(`${API_BASE}/api/onboarding/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(inviteForm),
      });

      if (res.ok) {
        const newRecord = await res.json();
        setRecords([...records, newRecord]);
        setInviteDialogOpen(false);
        setInviteForm({
          email: "",
          firstName: "",
          lastName: "",
          designation: "",
          department: "",
        });
        alert("Invitation sent successfully!");
      } else {
        alert("Failed to send invitation");
      }
    } catch (err) {
      console.error("Error sending invite:", err);
      alert("Error sending invitation");
    }
  };

  const handleCompleteOnboarding = async (recordId: number) => {
    try {
      const token = localStorage.getItem("app_token");
      const res = await fetch(`${API_BASE}/api/onboarding/${recordId}/complete`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        await fetchRecords();
        setDetailsDialogOpen(false);
        alert("Onboarding completed! Employee and user accounts created.");
      } else {
        alert("Failed to complete onboarding");
      }
    } catch (err) {
      console.error("Error completing onboarding:", err);
      alert("Error completing onboarding");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "invited":
        return "warning";
      case "in-progress":
        return "info";
      case "completed":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon fontSize="small" />;
      default:
        return <PendingIcon fontSize="small" />;
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: "#1D1D1D", mb: 1 }}>
            Employee Onboarding
          </Typography>
          <Typography variant="body2" sx={{ color: "#86868B" }}>
            Manage employee invitations and onboarding progress
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setInviteDialogOpen(true)}
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
          Invite Employee
        </Button>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2, mb: 4 }}>
        <Card sx={{ borderRadius: "16px", border: "1px solid #E5E5EA" }}>
          <CardContent>
            <Typography variant="body2" sx={{ color: "#86868B", mb: 1 }}>
              Total Invites
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, color: "#1D1D1D" }}>
              {records.length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderRadius: "16px", border: "1px solid #E5E5EA" }}>
          <CardContent>
            <Typography variant="body2" sx={{ color: "#86868B", mb: 1 }}>
              In Progress
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, color: "#0071E3" }}>
              {records.filter((r) => r.status === "in-progress").length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderRadius: "16px", border: "1px solid #E5E5EA" }}>
          <CardContent>
            <Typography variant="body2" sx={{ color: "#86868B", mb: 1 }}>
              Completed
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, color: "#34C759" }}>
              {records.filter((r) => r.status === "completed").length}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Records Table */}
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
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Designation</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Invited</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id} hover>
                  <TableCell>{`${record.firstName} ${record.lastName}`}</TableCell>
                  <TableCell>{record.email}</TableCell>
                  <TableCell>{record.designation || "—"}</TableCell>
                  <TableCell>{record.department || "—"}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(record.status)}
                      label={record.status}
                      size="small"
                      color={getStatusColor(record.status)}
                      sx={{ textTransform: "capitalize", borderRadius: "8px" }}
                    />
                  </TableCell>
                  <TableCell>{new Date(record.invitedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => {
                        setSelectedRecord(record);
                        setDetailsDialogOpen(true);
                      }}
                      sx={{ textTransform: "none" }}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {records.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: "#86868B" }}>
                    No onboarding records yet. Click "Invite Employee" to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Invite Dialog */}
      <Dialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px" } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Invite New Employee</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="First Name *"
              value={inviteForm.firstName}
              onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
              fullWidth
            />
            <TextField
              label="Last Name *"
              value={inviteForm.lastName}
              onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email *"
              type="email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Designation"
              value={inviteForm.designation}
              onChange={(e) => setInviteForm({ ...inviteForm, designation: e.target.value })}
              fullWidth
            />
            <TextField
              label="Department"
              value={inviteForm.department}
              onChange={(e) => setInviteForm({ ...inviteForm, department: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setInviteDialogOpen(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSendInvite}
            sx={{
              bgcolor: "#0071E3",
              textTransform: "none",
              borderRadius: "8px",
              "&:hover": { bgcolor: "#005BB5" },
            }}
          >
            Send Invitation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px" } }}
      >
        {selectedRecord && (
          <>
            <DialogTitle sx={{ fontWeight: 600 }}>
              Onboarding Details - {selectedRecord.firstName} {selectedRecord.lastName}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Status
                </Typography>
                <Chip
                  icon={getStatusIcon(selectedRecord.status)}
                  label={selectedRecord.status}
                  color={getStatusColor(selectedRecord.status)}
                  sx={{ textTransform: "capitalize", mb: 3 }}
                />

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Basic Information
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 3 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Email
                    </Typography>
                    <Typography variant="body1">{selectedRecord.email}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Designation
                    </Typography>
                    <Typography variant="body1">{selectedRecord.designation || "—"}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Department
                    </Typography>
                    <Typography variant="body1">{selectedRecord.department || "—"}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Invited On
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedRecord.invitedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Documents ({selectedRecord.documents.length})
                </Typography>
                {selectedRecord.documents.length > 0 ? (
                  <List>
                    {selectedRecord.documents.map((doc) => (
                      <ListItem key={doc.id}>
                        <ListItemIcon>
                          <UploadFileIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={doc.name}
                          secondary={`Uploaded: ${new Date(doc.uploadedAt).toLocaleDateString()}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    No documents uploaded yet
                  </Typography>
                )}

                {selectedRecord.status !== "completed" && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: "#F5F5F7", borderRadius: "12px" }}>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Invite Link (share with employee):
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "monospace",
                        bgcolor: "#fff",
                        p: 1.5,
                        borderRadius: "8px",
                        wordBreak: "break-all",
                      }}
                    >
                      {`${window.location.origin}/onboarding/${selectedRecord.inviteToken}`}
                    </Typography>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={() => setDetailsDialogOpen(false)} sx={{ textTransform: "none" }}>
                Close
              </Button>
              {selectedRecord.status !== "completed" && (
                <Button
                  variant="contained"
                  onClick={() => handleCompleteOnboarding(selectedRecord.id)}
                  sx={{
                    bgcolor: "#34C759",
                    textTransform: "none",
                    borderRadius: "8px",
                    "&:hover": { bgcolor: "#28A745" },
                  }}
                >
                  Mark as Completed
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Onboarding;
