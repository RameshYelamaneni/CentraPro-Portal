import React, { useState, useEffect, FC } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  InputBase,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Popover,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Drawer,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";

interface User {
  name?: string;
  email?: string;
  id?: number;
}

interface Alert {
  id: number;
  project: string;
  date: string;
  hours: number;
  status: string;
}

interface SearchResult {
  id: number;
  name: string;
  type: string;
  path: string;
}

interface TopbarProps {
  user?: User;
  logout?: () => void;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const companyName = "RightArc Technologies & Consulting Solutions";

const Topbar: FC<TopbarProps> = ({ user, logout }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  const [alertsDrawerOpen, setAlertsDrawerOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchAnchor, setSearchAnchor] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  // Set page title
  useEffect(() => {
    document.title = `${companyName} E-Portal`;
  }, []);

  // Fetch alerts when drawer opens
  useEffect(() => {
    if (alertsDrawerOpen) {
      setAlertsLoading(true);
      const token = localStorage.getItem("app_token");
      fetch(`${API_BASE}/api/timesheets`, {
        headers: { Authorization: `Bearer ${token || ""}` },
      })
        .then((r) => r.json())
        .then((data: any) => {
          if (Array.isArray(data)) {
            const pending = data.filter(
              (t: any) => t.status === "Pending" || t.status === "Resubmitted"
            );
            setAlerts(
              pending.map((t: any) => ({
                id: t.id,
                project: t.notes?.includes("project:")
                  ? t.notes.split("project:")[1].split(";")[0]
                  : "Unknown",
                date: t.date,
                hours: t.hours,
                status: t.status,
              }))
            );
          }
          setAlertsLoading(false);
        })
        .catch(() => setAlertsLoading(false));
    }
  }, [alertsDrawerOpen]);

  // Handle search - fetch real data from backend
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    
    if (q.length > 1) {
      setSearchAnchor(e.currentTarget);
      const token = localStorage.getItem("app_token");
      const results: SearchResult[] = [];

      try {
        // Search employees
        const empRes = await fetch(`${API_BASE}/api/employees`, {
          headers: { Authorization: `Bearer ${token || ""}` },
        });
        if (empRes.ok) {
          const employees = await empRes.json();
          employees.forEach((emp: any) => {
            if (emp.name?.toLowerCase().includes(q.toLowerCase()) || 
                emp.email?.toLowerCase().includes(q.toLowerCase())) {
              results.push({
                id: emp.id,
                name: emp.name,
                type: "Employee",
                path: "/employees",
              });
            }
          });
        }

        // Search timesheets
        const timeRes = await fetch(`${API_BASE}/api/timesheets`, {
          headers: { Authorization: `Bearer ${token || ""}` },
        });
        if (timeRes.ok) {
          const timesheets = await timeRes.json();
          timesheets.forEach((ts: any) => {
            if (ts.date?.toLowerCase().includes(q.toLowerCase()) || 
                ts.notes?.toLowerCase().includes(q.toLowerCase()) ||
                ts.status?.toLowerCase().includes(q.toLowerCase())) {
              results.push({
                id: ts.id,
                name: `Timesheet - ${ts.date} (${ts.hours}h)`,
                type: "Timesheet",
                path: "/timesheets",
              });
            }
          });
        }

        // Search invoices
        const invRes = await fetch(`${API_BASE}/api/invoices`, {
          headers: { Authorization: `Bearer ${token || ""}` },
        });
        if (invRes.ok) {
          const invoices = await invRes.json();
          invoices.forEach((inv: any) => {
            if (inv.invoiceNumber?.toLowerCase().includes(q.toLowerCase()) || 
                inv.vendorName?.toLowerCase().includes(q.toLowerCase()) ||
                inv.status?.toLowerCase().includes(q.toLowerCase())) {
              results.push({
                id: inv.id,
                name: `Invoice ${inv.invoiceNumber} - ${inv.vendorName}`,
                type: "Invoice",
                path: "/invoicing",
              });
            }
          });
        }

        setSearchResults(results.slice(0, 10)); // Limit to 10 results
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      }
    } else {
      setSearchAnchor(null);
      setSearchResults([]);
    }
  };

  const handleSearchResult = (result: SearchResult) => {
    navigate(result.path);
    setSearchQuery("");
    setSearchAnchor(null);
    setSearchResults([]);
  };

  const handleLogout = () => {
    closeMenu();
    if (logout) logout();
  };

  return (
    <AppBar position="static" elevation={0} sx={{ bgcolor: "rgba(255,255,255,0.8)", borderBottom: "1px solid #E5E5EA", backdropFilter: "blur(10px)" }}>
      <Toolbar sx={{ minHeight: { xs: 64, md: 72 }, px: { xs: 2, md: 3 }, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 2 } }}>
          <img src="/centrapro-logo-new.png" alt="CentraPro Logo" style={{ width: 40, height: 40, borderRadius: 12 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#1D1D1D", fontSize: { xs: "1rem", md: "1.25rem" }, display: { xs: "none", sm: "block" } }}>
            CentraPro
          </Typography>
        </Box>
        <Box sx={{ flex: 1, display: "flex", justifyContent: "center", maxWidth: 600, mx: { xs: 1, md: 3 }, position: "relative" }}>
          <InputBase
            placeholder="Search employees, timesheets, invoices..."
            value={searchQuery}
            onChange={handleSearch}
            sx={{ 
              bgcolor: "#F5F5F7", 
              px: 2, 
              py: 1, 
              borderRadius: 12, 
              width: "100%",
              fontSize: { xs: 14, md: 15 },
              display: { xs: "none", md: "flex" }
            }}
            startAdornment={<SearchIcon sx={{ color: "#86868B", mr: 1 }} />}
          />
          <Popover
            open={Boolean(searchAnchor) && searchResults.length > 0}
            anchorEl={searchAnchor}
            onClose={() => {
              setSearchAnchor(null);
              setSearchResults([]);
            }}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: "12px",
                border: "1px solid #E5E5EA",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.12)",
                minWidth: 400,
              },
            }}
          >
            <Paper sx={{ maxHeight: 400, overflow: "auto" }}>
              <List sx={{ p: 0 }}>
                {searchResults.map((result) => (
                  <ListItem
                    key={`${result.type}-${result.id}`}
                    button
                    onClick={() => handleSearchResult(result)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      "&:hover": { backgroundColor: "#F5F5F7" },
                      borderBottom: "1px solid #E5E5EA",
                      "&:last-child": { borderBottom: "none" },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 500, color: "#1D1D1D" }}>
                          {result.name}
                        </Typography>
                      }
                      secondary={
                        <Chip
                          label={result.type}
                          size="small"
                          sx={{
                            mt: 0.5,
                            height: 20,
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            backgroundColor: 
                              result.type === "Employee" ? "#E3F2FD" :
                              result.type === "Timesheet" ? "#FFF3E0" : "#F3E5F5",
                            color:
                              result.type === "Employee" ? "#1976D2" :
                              result.type === "Timesheet" ? "#F57C00" : "#7B1FA2",
                          }}
                        />
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Popover>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton color="inherit" onClick={() => setAlertsDrawerOpen(true)}>
            <Badge badgeContent={alerts.length} color="error">
              <NotificationsIcon sx={{ color: "#0071E3", fontSize: 28 }} />
            </Badge>
          </IconButton>
          <IconButton color="inherit" onClick={handleMenu}>
            <Avatar sx={{ bgcolor: "#0071E3", width: 36, height: 36 }}>
              {user?.name ? user.name[0] : "A"}
            </Avatar>
          </IconButton>
        </Box>
      </Toolbar>

      {/* Alerts Drawer */}
      <Drawer
        anchor="right"
        open={alertsDrawerOpen}
        onClose={() => setAlertsDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 400,
            backgroundColor: "#FFFFFF",
            borderLeft: "1px solid #E5E5EA",
          },
        }}
      >
            <Box
              sx={{
                width: 400,
                p: 3,
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2.5,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#1D1D1D" }}>
                  Notifications
                </Typography>
                <IconButton
                  onClick={() => setAlertsDrawerOpen(false)}
                  size="small"
                  sx={{
                    color: "#86868B",
                    "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
              <Divider sx={{ mb: 2, backgroundColor: "#E5E5EA" }} />
              {alertsLoading ? (
                <Typography sx={{ p: 2, color: "#86868B" }}>Loading...</Typography>
              ) : alerts.length > 0 ? (
                <Box sx={{ flex: 1, overflow: "auto" }}>
                  {alerts.map((alert, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        mb: 2,
                        p: 2.5,
                        backgroundColor: "#F5F5F7",
                        borderRadius: "12px",
                        border: "1px solid #E5E5EA",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#1D1D1D" }}>
                          {alert.project}
                        </Typography>
                        <Chip
                          label={alert.status}
                          size="small"
                          sx={{
                            borderRadius: "999px",
                            height: "20px",
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            backgroundColor:
                              alert.status === "Pending" ? "#FFF3E0" : "#E0F7FA",
                            color: alert.status === "Pending" ? "#B45309" : "#00838F",
                          }}
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{ color: "#86868B", display: "block", mb: 0.5 }}
                      >
                        Date: {alert.date}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#86868B", display: "block" }}>
                        Hours: {alert.hours}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography sx={{ p: 2, color: "#86868B" }}>No notifications</Typography>
              )}
            </Box>
      </Drawer>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={closeMenu}
        PaperProps={{
          sx: {
            mt: 1.5,
            borderRadius: "12px",
            border: "1px solid #E5E5EA",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.12)",
          },
        }}
      >
        <MenuItem
          onClick={() => {
            navigate("/profile");
            closeMenu();
          }}
          sx={{
            fontSize: "0.9375rem",
            color: "#1D1D1D",
            py: 1.25,
            px: 2,
            "&:hover": {
              backgroundColor: "#F5F5F7",
            },
          }}
        >
          Profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate("/settings");
            closeMenu();
          }}
          sx={{
            fontSize: "0.9375rem",
            color: "#1D1D1D",
            py: 1.25,
            px: 2,
            "&:hover": {
              backgroundColor: "#F5F5F7",
            },
          }}
        >
          Settings
        </MenuItem>
        <Divider sx={{ my: 0.5, backgroundColor: "#E5E5EA" }} />
        <MenuItem
          onClick={handleLogout}
          sx={{
            fontSize: "0.9375rem",
            color: "#FF3B30",
            py: 1.25,
            px: 2,
            "&:hover": {
              backgroundColor: "#FFF5F5",
            },
          }}
        >
          Logout
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Topbar;
