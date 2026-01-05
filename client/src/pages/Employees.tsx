import React, { useEffect, useState, FC } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  Chip,
  IconButton,
  MenuItem,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Divider,
  TableContainer,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";

interface Employee {
  id: number;
  name: string;
  email: string;
  position: string;
  role: string;
  department?: string;
  phone?: string;
  dateOfBirth?: string;
  joinDate?: string;
  managerId?: number | null;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  profilePicture?: string;
  employeeId?: string;
  status?: string;
}

interface EmployeesProps {
  user?: any;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

const Employees: FC<EmployeesProps> = ({ user }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab, setCurrentTab] = useState(0);
  const [dialogTab, setDialogTab] = useState(0);
  const [documents, setDocuments] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    position: "",
    department: "",
    phone: "",
    dateOfBirth: "",
    joinDate: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    employeeId: "",
    managerId: null as number | null,
  });

  const departments = ["Engineering", "HR", "Finance", "Marketing", "Operations", "Sales"];
  const positions = ["Developer", "Manager", "Lead", "Analyst", "Director", "VP", "Executive"];

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, employees]);

  const fetchEmployees = () => {
    const t = localStorage.getItem("app_token");
    fetch(API_BASE + "/api/employees", {
      headers: { Authorization: "Bearer " + (t || "") },
    })
      .then((r) => r.json())
      .then((j) => {
        const data = Array.isArray(j) ? j : [];
        setEmployees(data);
        setFilteredEmployees(data);
      })
      .catch((e) => console.error(e));
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredEmployees(employees);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = employees.filter(
      (emp) =>
        emp.name?.toLowerCase().includes(query) ||
        emp.email?.toLowerCase().includes(query) ||
        emp.position?.toLowerCase().includes(query) ||
        emp.department?.toLowerCase().includes(query) ||
        emp.employeeId?.toLowerCase().includes(query)
    );
    setFilteredEmployees(filtered);
  };

  const handleAdd = () => {
    const t = localStorage.getItem("app_token");
    const payload = {
      ...formData,
      role: "user",
      status: "active",
    };

    fetch(API_BASE + "/api/employees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + (t || ""),
      },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then((j) => {
        fetchEmployees();
        resetForm();
        setDialogOpen(false);
        alert("Employee added successfully!");
      })
      .catch((e) => {
        console.error(e);
        alert("Error adding employee");
      });
  };

  const handleUpdate = () => {
    if (!selectedEmployee) return;

    const t = localStorage.getItem("app_token");
    fetch(API_BASE + `/api/employees/${selectedEmployee.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + (t || ""),
      },
      body: JSON.stringify(formData),
    })
      .then((r) => r.json())
      .then((j) => {
        fetchEmployees();
        resetForm();
        setDialogOpen(false);
        setIsEditMode(false);
        alert("Employee updated successfully!");
      })
      .catch((e) => {
        console.error(e);
        alert("Error updating employee");
      });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    const t = localStorage.getItem("app_token");
    fetch(API_BASE + `/api/employees/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + (t || "") },
    })
      .then(() => {
        fetchEmployees();
        alert("Employee deleted successfully!");
      })
      .catch((e) => {
        console.error(e);
        alert("Error deleting employee");
      });
  };

  const handleEdit = (emp: Employee) => {
    setSelectedEmployee(emp);
    setFormData({
      name: emp.name || "",
      email: emp.email || "",
      position: emp.position || "",
      department: emp.department || "",
      phone: emp.phone || "",
      dateOfBirth: emp.dateOfBirth || "",
      joinDate: emp.joinDate || "",
      address: emp.address || "",
      city: emp.city || "",
      state: emp.state || "",
      zipCode: emp.zipCode || "",
      employeeId: emp.employeeId || "",
      managerId: emp.managerId || null,
    });
    setIsEditMode(true);
    setDialogOpen(true);
  };

  const handleViewDetails = (emp: Employee) => {
    setSelectedEmployee(emp);
    setDetailsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      position: "",
      department: "",
      phone: "",
      dateOfBirth: "",
      joinDate: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      employeeId: "",
      managerId: null,
    });
    setSelectedEmployee(null);
    setIsEditMode(false);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "default";
      case "on-leave":
        return "warning";
      default:
        return "success";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: "#1D1D1D", mb: 1 }}>
            Employee Directory
          </Typography>
          <Typography variant="body2" sx={{ color: "#86868B" }}>
            Manage employee profiles and information
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
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
          Add Employee
        </Button>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2, mb: 4 }}>
        <Card sx={{ borderRadius: "16px", border: "1px solid #E5E5EA" }}>
          <CardContent>
            <Typography variant="body2" sx={{ color: "#86868B", mb: 1 }}>
              Total Employees
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, color: "#1D1D1D" }}>
              {employees.length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderRadius: "16px", border: "1px solid #E5E5EA" }}>
          <CardContent>
            <Typography variant="body2" sx={{ color: "#86868B", mb: 1 }}>
              Active
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, color: "#34C759" }}>
              {employees.filter((e) => e.status === "active" || !e.status).length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderRadius: "16px", border: "1px solid #E5E5EA" }}>
          <CardContent>
            <Typography variant="body2" sx={{ color: "#86868B", mb: 1 }}>
              Departments
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, color: "#0071E3" }}>
              {new Set(employees.map((e) => e.department).filter(Boolean)).size}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Search Bar */}
      <TextField
        fullWidth
        placeholder="Search by name, email, position, department, or employee ID..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{
          mb: 3,
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            bgcolor: "#fff",
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "#86868B" }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Employee Table */}
      <TableContainer
        component={Paper}
        sx={{ borderRadius: "16px", border: "1px solid #E5E5EA", boxShadow: "none" }}
      >
        <Table>
          <TableHead sx={{ bgcolor: "#F5F5F7" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Employee ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Position</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmployees.map((emp) => (
              <TableRow key={emp.id} hover>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: "#0071E3",
                        width: 40,
                        height: 40,
                      }}
                    >
                      {getInitials(emp.name)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {emp.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#86868B" }}>
                        {emp.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{emp.employeeId || "—"}</TableCell>
                <TableCell>{emp.position}</TableCell>
                <TableCell>{emp.department || "—"}</TableCell>
                <TableCell>{emp.phone || "—"}</TableCell>
                <TableCell>
                  <Chip
                    label={emp.status || "active"}
                    size="small"
                    color={getStatusColor(emp.status)}
                    sx={{ textTransform: "capitalize", borderRadius: "8px" }}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton size="small" onClick={() => handleViewDetails(emp)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleEdit(emp)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(emp.id)} sx={{ color: "#FF3B30" }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {filteredEmployees.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: "#86868B" }}>
                  No employees found. {searchQuery ? "Try a different search." : "Click 'Add Employee' to get started."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          resetForm();
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px" } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {isEditMode ? "Edit Employee" : "Add New Employee"}
        </DialogTitle>
        <DialogContent>
          <Tabs value={dialogTab} onChange={(e, v) => setDialogTab(v)} sx={{ mb: 3, mt: 2 }}>
            <Tab label="Basic Info" />
            <Tab label="Contact Details" />
            <Tab label="Employment" />
            <Tab label="Documents" />
          </Tabs>

          {/* Tab 0: Basic Info */}
          {dialogTab === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Full Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email *"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date of Birth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
            </Grid>
          )}

          {/* Tab 1: Contact Details */}
          {dialogTab === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Zip Code"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  fullWidth
                />
              </Grid>
            </Grid>
          )}

          {/* Tab 2: Employment */}
          {dialogTab === 2 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Employee ID"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Join Date"
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Position *"
                  select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  fullWidth
                >
                  {positions.map((pos) => (
                    <MenuItem key={pos} value={pos}>
                      {pos}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Department"
                  select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  fullWidth
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Manager ID"
                  type="number"
                  value={formData.managerId || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, managerId: e.target.value ? parseInt(e.target.value) : null })
                  }
                  helperText="Leave empty if no direct manager"
                  fullWidth
                />
              </Grid>
            </Grid>
          )}

          {/* Tab 3: Documents */}
          {dialogTab === 3 && (
            <Box>
              <Typography variant="body2" sx={{ mb: 2, color: "#86868B" }}>
                Upload employee documents (all optional)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{ py: 2, borderStyle: "dashed", textTransform: "none" }}
                  >
                    Upload Resume
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            setDocuments([...documents, { name: file.name, type: "resume", data: reader.result }]);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{ py: 2, borderStyle: "dashed", textTransform: "none" }}
                  >
                    Upload Immigration Documents
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            setDocuments([...documents, { name: file.name, type: "immigration", data: reader.result }]);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{ py: 2, borderStyle: "dashed", textTransform: "none" }}
                  >
                    Upload Other Documents
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            setDocuments([...documents, { name: file.name, type: "other", data: reader.result }]);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </Button>
                </Grid>
              </Grid>
              {documents.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Uploaded Documents:</Typography>
                  {documents.map((doc, idx) => (
                    <Chip
                      key={idx}
                      label={`${doc.type}: ${doc.name}`}
                      onDelete={() => setDocuments(documents.filter((_, i) => i !== idx))}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => {
              setDialogOpen(false);
              resetForm();
            }}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={isEditMode ? handleUpdate : handleAdd}
            disabled={!formData.name || !formData.email || !formData.position}
            sx={{
              bgcolor: "#0071E3",
              textTransform: "none",
              borderRadius: "8px",
              "&:hover": { bgcolor: "#005BB5" },
            }}
          >
            {isEditMode ? "Update Employee" : "Add Employee"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px" } }}
      >
        {selectedEmployee && (
          <>
            <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>Employee Details</DialogTitle>
            <DialogContent>
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: "#0071E3",
                    width: 80,
                    height: 80,
                    fontSize: "2rem",
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  {getInitials(selectedEmployee.name)}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {selectedEmployee.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {selectedEmployee.position} • {selectedEmployee.department || "No Department"}
                </Typography>
                <Chip
                  label={selectedEmployee.status || "active"}
                  size="small"
                  color={getStatusColor(selectedEmployee.status)}
                  sx={{ mt: 1, textTransform: "capitalize" }}
                />
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Employee ID
                  </Typography>
                  <Typography variant="body2">{selectedEmployee.employeeId || "—"}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Email
                  </Typography>
                  <Typography variant="body2">{selectedEmployee.email}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Phone
                  </Typography>
                  <Typography variant="body2">{selectedEmployee.phone || "—"}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Date of Birth
                  </Typography>
                  <Typography variant="body2">
                    {selectedEmployee.dateOfBirth
                      ? new Date(selectedEmployee.dateOfBirth).toLocaleDateString()
                      : "—"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Join Date
                  </Typography>
                  <Typography variant="body2">
                    {selectedEmployee.joinDate ? new Date(selectedEmployee.joinDate).toLocaleDateString() : "—"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Manager ID
                  </Typography>
                  <Typography variant="body2">{selectedEmployee.managerId || "—"}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    Address
                  </Typography>
                  <Typography variant="body2">
                    {selectedEmployee.address
                      ? `${selectedEmployee.address}, ${selectedEmployee.city || ""}, ${selectedEmployee.state || ""} ${selectedEmployee.zipCode || ""}`
                      : "—"}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={() => setDetailsDialogOpen(false)} sx={{ textTransform: "none" }}>
                Close
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setDetailsDialogOpen(false);
                  handleEdit(selectedEmployee);
                }}
                sx={{
                  bgcolor: "#0071E3",
                  textTransform: "none",
                  borderRadius: "8px",
                  "&:hover": { bgcolor: "#005BB5" },
                }}
              >
                Edit
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Employees;
