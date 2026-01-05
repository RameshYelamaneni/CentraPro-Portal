import React, { useEffect, useState, FC } from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Card,
  CardContent,
  Tooltip,
  TableContainer,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import { startOfWeek, addDays, format, parseISO } from "date-fns";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PendingIcon from "@mui/icons-material/Pending";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import ReceiptIcon from "@mui/icons-material/Receipt";

interface User {
  id?: number;
  name?: string;
  role?: string;
}

interface Timesheet {
  id: number;
  userId: number;
  date: string;
  hours: number;
  status: "Pending" | "Approved" | "Rejected";
  notes?: string;
  project?: string;
  task?: string;
  billable?: boolean;
  hourlyRate?: number;
  submittedAt?: string;
  approvedBy?: number;
  approvedAt?: string;
  rejectedBy?: number;
  rejectedAt?: string;
  rejectionReason?: string;
  attachments?: Array<{
    filename: string;
    url: string;
    uploadedAt: string;
  }>;
  weekOf?: string;
}

interface FileAttachment {
  name: string;
  data?: string;
  type?: string;
  path?: string;
}

interface WeeklyTimesheet {
  id: string;
  project: string;
  task: string;
  weekStart: string;
  hours: { [key: number]: number }; // 0=Mon, 1=Tue, ..., 6=Sun
  billable: boolean;
  hourlyRate: number;
  status: "Pending" | "Approved" | "Rejected";
  isEditing?: boolean;
  attachments?: FileAttachment[];
}

interface Project {
  id: number;
  name: string;
  code: string;
  status: string;
}

interface Task {
  id: number;
  name: string;
  category: string;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface TimesheetsProps {
  user?: User;
}

const Timesheets: FC<TimesheetsProps> = ({ user }) => {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [weeklyTimesheets, setWeeklyTimesheets] = useState<WeeklyTimesheet[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [selectedInvoiceRow, setSelectedInvoiceRow] = useState<WeeklyTimesheet | null>(null);
  const [selectedInvoiceWeeks, setSelectedInvoiceWeeks] = useState<WeeklyTimesheet[]>([]);
  const [includeTimesheetAttachments, setIncludeTimesheetAttachments] = useState(true);
  const [invoiceEmail, setInvoiceEmail] = useState("");
  const [sendingInvoice, setSendingInvoice] = useState(false);
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [selectedSummaryRows, setSelectedSummaryRows] = useState<string[]>([]);

  const isManager = user?.role === "admin" || user?.role === "manager";

  useEffect(() => {
    fetchTimesheets();
    fetchProjects();
    fetchTasks();
  }, []);

  useEffect(() => {
    aggregateWeeklyTimesheets();
  }, [timesheets]);

  const fetchTimesheets = async () => {
    try {
      const token = localStorage.getItem("app_token");
      const res = await fetch(`${API_BASE}/api/timesheets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTimesheets(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching timesheets:", err);
    }
  };

  const aggregateWeeklyTimesheets = () => {
    const grouped: { [key: string]: WeeklyTimesheet } = {};

    timesheets.forEach((ts) => {
      const tsDate = parseISO(ts.date);
      const weekStart = startOfWeek(tsDate, { weekStartsOn: 1 });
      const weekStartStr = format(weekStart, "yyyy-MM-dd");
      const dayIndex = (tsDate.getDay() + 6) % 7; // Mon=0, Sun=6
      
      const key = `${ts.project}-${ts.task}-${weekStartStr}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          id: key,
          project: ts.project || "",
          task: ts.task || "",
          weekStart: weekStartStr,
          hours: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
          billable: ts.billable || false,
          hourlyRate: ts.hourlyRate || 0,
          status: ts.status,
          isEditing: false,
          attachments: ts.attachments || [],
        };
      } else {
        // Merge attachments from multiple entries of same week/project/task
        grouped[key].attachments = [
          ...(grouped[key].attachments || []),
          ...(ts.attachments || []),
        ];
      }
      
      grouped[key].hours[dayIndex] = (grouped[key].hours[dayIndex] || 0) + ts.hours;
    });

    setWeeklyTimesheets(Object.values(grouped));
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("app_token");
      const res = await fetch(`${API_BASE}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("app_token");
      const res = await fetch(`${API_BASE}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const handleAddRow = () => {
    const ws = format(startOfWeek(currentWeekStart, { weekStartsOn: 1 }), "yyyy-MM-dd");
    const newRow: WeeklyTimesheet = {
      id: `new-${Date.now()}`,
      project: projects[0]?.name || "",
      task: tasks[0]?.name || "",
      weekStart: ws,
      hours: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
      billable: true,
      hourlyRate: 65,
      status: "Pending",
      isEditing: true,
      attachments: [],
    };
    setWeeklyTimesheets([newRow, ...weeklyTimesheets]);
    setSelectedRowId(newRow.id);
  };

  const handlePrefillFromPrevious = () => {
    // Find the most recent approved/submitted timesheet
    const sortedTimesheets = [...weeklyTimesheets]
      .filter(ts => ts.status === "Approved" || ts.status === "Pending")
      .sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime());
    
    if (sortedTimesheets.length === 0) {
      alert("No previous timesheet found to prefill from");
      return;
    }
    
    const previousTimesheet = sortedTimesheets[0];
    const ws = format(startOfWeek(currentWeekStart, { weekStartsOn: 1 }), "yyyy-MM-dd");
    
    const newRow: WeeklyTimesheet = {
      id: `new-${Date.now()}`,
      project: previousTimesheet.project,
      task: previousTimesheet.task,
      weekStart: ws,
      hours: { ...previousTimesheet.hours }, // Copy hours from previous week
      billable: previousTimesheet.billable,
      hourlyRate: previousTimesheet.hourlyRate,
      status: "Pending",
      isEditing: true,
      attachments: [], // Don't copy attachments
    };
    
    setWeeklyTimesheets([newRow, ...weeklyTimesheets]);
    setSelectedRowId(newRow.id);
  };

  const handleSaveRow = async (row: WeeklyTimesheet) => {
    const token = localStorage.getItem("app_token");
    const wsDate = parseISO(row.weekStart);

    // Create daily entries for each day with hours
    const entries = Object.keys(row.hours)
      .filter((dayIdx) => row.hours[parseInt(dayIdx)] > 0)
      .map((dayIdx) => {
        const idx = parseInt(dayIdx);
        const dayDate = addDays(wsDate, idx);
        return {
          userId: user?.id || 1,
          date: format(dayDate, "yyyy-MM-dd"),
          hours: row.hours[idx],
          notes: "",
          project: row.project,
          task: row.task,
          billable: row.billable,
          hourlyRate: row.hourlyRate,
          attachments: row.attachments || [],
          weekStart: row.weekStart,
        };
      });

    try {
      for (const entry of entries) {
        await fetch(`${API_BASE}/api/timesheets`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(entry),
        });
      }
      
      // Fetch updated timesheets from server - this will trigger useEffect to rebuild weekly view
      await fetchTimesheets();
      
      // Small delay to ensure state updates complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      alert("Timesheet saved successfully!");
    } catch (err) {
      console.error("Error saving timesheet:", err);
      alert("Error saving timesheet");
    }
  };

  const handleSelectRow = (rowId: string) => {
    setSelectedRowId(selectedRowId === rowId ? null : rowId);
  };

  const handleEditRow = (rowId: string) => {
    setWeeklyTimesheets((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, isEditing: true } : r))
    );
  };

  const handleDeleteRow = (rowId: string) => {
    if (window.confirm("Are you sure you want to delete this timesheet?")) {
      setWeeklyTimesheets((prev) => prev.filter((r) => r.id !== rowId));
      setSelectedRowId(null);
    }
  };

  const handleFileUpload = async (rowId: string, files: File[]) => {
    // Convert files to base64 for storage and sending
    const filePromises = files.map(file => {
      return new Promise<{ name: string; data: string; type: string }>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            name: file.name,
            data: e.target?.result as string,
            type: file.type
          });
        };
        reader.readAsDataURL(file);
      });
    });

    const fileData = await Promise.all(filePromises);
    
    setWeeklyTimesheets((prev) =>
      prev.map((r) =>
        r.id === rowId ? { ...r, attachments: [...(r.attachments || []), ...fileData as any] } : r
      )
    );
  };

  const handleRemoveFile = (rowId: string, fileIndex: number) => {
    setWeeklyTimesheets((prev) =>
      prev.map((r) => {
        if (r.id === rowId) {
          const newAttachments = [...(r.attachments || [])];
          newAttachments.splice(fileIndex, 1);
          return { ...r, attachments: newAttachments };
        }
        return r;
      })
    );
  };

  const handleGenerateInvoice = (row: WeeklyTimesheet) => {
    // Find all approved weeks to show as checkboxes
    const approvedWeeks = weeklyTimesheets.filter(wts => wts.status === "Approved");
    setSelectedInvoiceWeeks([row]); // Start with clicked week selected
    setSelectedInvoiceRow(row);
    setInvoiceEmail("");
    setIncludeTimesheetAttachments(true);
    setInvoiceDialogOpen(true);
  };

  const toggleInvoiceWeek = (week: WeeklyTimesheet) => {
    const isSelected = selectedInvoiceWeeks.some(w => w.id === week.id);
    if (isSelected) {
      setSelectedInvoiceWeeks(selectedInvoiceWeeks.filter(w => w.id !== week.id));
    } else {
      setSelectedInvoiceWeeks([...selectedInvoiceWeeks, week]);
    }
  };

  const handleSendInvoice = async () => {
    if (selectedInvoiceWeeks.length === 0 || !invoiceEmail.trim()) {
      alert("Please select at least one week and enter recipient email");
      return;
    }

    setSendingInvoice(true);
    try {
      const token = localStorage.getItem("app_token");
      
      // Prepare invoice data for all selected weeks
      const invoiceData = {
        to: invoiceEmail,
        weeks: selectedInvoiceWeeks.map(week => ({
          id: week.id,
          project: week.project,
          task: week.task,
          weekStart: week.weekStart,
          hours: week.hours,
          hourlyRate: week.hourlyRate,
          billable: week.billable,
          attachments: week.attachments || []
        })),
        employeeName: user?.name || 'Employee',
        includeTimesheetAttachments: includeTimesheetAttachments
      };

      const response = await fetch(`${API_BASE}/api/invoices/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(invoiceData),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Invoice sent successfully! Total: $${result.totalAmount.toFixed(2)} for ${result.totalHours}h`);
        setInvoiceDialogOpen(false);
        setSelectedInvoiceRow(null);
        setSelectedInvoiceWeeks([]);
      } else {
        const error = await response.json();
        alert(`Failed to send invoice: ${error.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error sending invoice:", err);
      alert("Error sending invoice");
    } finally {
      setSendingInvoice(false);
    }
  };

  const handleToggleSummaryRow = (rowId: string) => {
    setSelectedSummaryRows((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]
    );
  };

  const handleDeleteSelectedSummaryRows = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedSummaryRows.length} timesheet(s)?`)) return;
    
    const token = localStorage.getItem("app_token");
    
    // Get all timesheet IDs for selected weeks
    const selectedWeeks = weeklyTimesheets.filter((r) => selectedSummaryRows.includes(r.id));
    const allTimesheetIds: number[] = [];
    
    for (const week of selectedWeeks) {
      const weekTimesheets = timesheets.filter((ts) => ts.weekOf === week.weekStart);
      allTimesheetIds.push(...weekTimesheets.map((ts) => ts.id));
    }
    
    try {
      // Delete all timesheets
      for (const id of allTimesheetIds) {
        await fetch(`${API_BASE}/api/timesheets/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      
      fetchTimesheets();
      setSelectedSummaryRows([]);
      alert("Timesheets deleted successfully");
    } catch (err) {
      console.error("Error deleting timesheets:", err);
      alert("Error deleting timesheets");
    }
  };

  const handleEditSummaryRow = (rowId: string) => {
    setWeeklyTimesheets((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, isEditing: true } : r))
    );
    setSelectedRowId(rowId);
    setSelectedSummaryRows([]);
  };

  const getFilteredSummaryTimesheets = () => {
    return weeklyTimesheets
      .filter(wts => wts.status !== "Pending" || !wts.isEditing)
      .filter(wts => {
        if (!filterFromDate && !filterToDate) return true;
        const weekDate = parseISO(wts.weekStart);
        if (filterFromDate && weekDate < parseISO(filterFromDate)) return false;
        if (filterToDate && weekDate > parseISO(filterToDate)) return false;
        return true;
      })
      .sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime());
  };

  const handleUpdateRow = (rowId: string, field: string, value: any) => {
    setWeeklyTimesheets((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [field]: value } : r))
    );
  };

  const handleUpdateHours = (rowId: string, dayIndex: number, value: number) => {
    setWeeklyTimesheets((prev) =>
      prev.map((r) =>
        r.id === rowId ? { ...r, hours: { ...r.hours, [dayIndex]: value } } : r
      )
    );
  };

  const handleSubmitForApproval = async (row: WeeklyTimesheet) => {
    const token = localStorage.getItem("app_token");
    
    // Get all timesheet IDs for this week
    const weekTimesheets = timesheets.filter(
      (ts) => ts.weekOf === row.weekStart
    );
    const timesheetIds = weekTimesheets.map((ts) => ts.id);
    
    if (timesheetIds.length === 0) {
      alert("Please save the timesheet first before submitting for approval");
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}/api/timesheets/bulk-submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ timesheetIds }),
      });
      
      if (res.ok) {
        fetchTimesheets();
        alert("Timesheet submitted for approval!");
      } else {
        alert("Error submitting timesheet");
      }
    } catch (err) {
      console.error("Error submitting timesheet:", err);
      alert("Error submitting timesheet");
    }
  };

  const handleApprove = async (rowId: string) => {
    const token = localStorage.getItem("app_token");
    
    // Get all timesheet IDs for this week
    const row = weeklyTimesheets.find((r) => r.id === rowId);
    if (!row) return;
    
    const weekTimesheets = timesheets.filter(
      (ts) => ts.weekOf === row.weekStart
    );
    const timesheetIds = weekTimesheets.map((ts) => ts.id);
    
    try {
      const res = await fetch(`${API_BASE}/api/timesheets/bulk-approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ timesheetIds }),
      });
      
      if (res.ok) {
        fetchTimesheets();
        alert("Timesheet approved!");
      } else {
        alert("Error approving timesheet");
      }
    } catch (err) {
      console.error("Error approving timesheet:", err);
      alert("Error approving timesheet");
    }
  };

  const handleReject = async (rowId: string) => {
    const reason = window.prompt("Please provide a reason for rejection:");
    if (!reason) return;
    
    const token = localStorage.getItem("app_token");
    
    // Get all timesheet IDs for this week
    const row = weeklyTimesheets.find((r) => r.id === rowId);
    if (!row) return;
    
    const weekTimesheets = timesheets.filter(
      (ts) => ts.weekOf === row.weekStart
    );
    
    try {
      for (const ts of weekTimesheets) {
        await fetch(`${API_BASE}/api/timesheets/${ts.id}/reject`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason }),
        });
      }
      
      fetchTimesheets();
      alert("Timesheet rejected");
    } catch (err) {
      console.error("Error rejecting timesheet:", err);
      alert("Error rejecting timesheet");
    }
  };

  const getWeekTimesheets = () => {
    const weekStart = format(currentWeekStart, "yyyy-MM-dd");
    return weeklyTimesheets.filter((wts) => wts.weekStart === weekStart);
  };

  const getTotalHours = () => {
    return getWeekTimesheets().reduce((sum, wts) => {
      const weekHours = Object.values(wts.hours).reduce((s, h) => s + h, 0);
      return sum + weekHours;
    }, 0);
  };

  const getTotalBillable = () => {
    return getWeekTimesheets()
      .filter((wts) => wts.billable)
      .reduce((sum, wts) => {
        const weekHours = Object.values(wts.hours).reduce((s, h) => s + h, 0);
        return sum + weekHours * wts.hourlyRate;
      }, 0);
  };

  const getPendingCount = () => {
    return weeklyTimesheets.filter((wts) => wts.status === "Pending").length;
  };

  const calculateRowTotal = (hours: { [key: number]: number }) => {
    return Object.values(hours).reduce((sum, h) => sum + h, 0);
  };

  const calculateRowAmount = (row: WeeklyTimesheet) => {
    if (!row.billable) return 0;
    const totalHours = calculateRowTotal(row.hours);
    return totalHours * row.hourlyRate;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "warning";
      case "Approved":
        return "success";
      case "Rejected":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircleIcon fontSize="small" />;
      case "Rejected":
        return <CancelIcon fontSize="small" />;
      default:
        return <PendingIcon fontSize="small" />;
    }
  };

  const weekTimesheets = getWeekTimesheets();
  
  const isRowEditable = (row: WeeklyTimesheet) => {
    return row.status === "Pending" || row.isEditing;
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" }, mb: 4, flexDirection: { xs: "column", md: "row" }, gap: { xs: 2, md: 0 } }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: "#1D1D1D", mb: 1, fontSize: { xs: "1.5rem", md: "2rem" } }}>
            Timesheets
          </Typography>
          <Typography variant="body2" sx={{ color: "#86868B", fontSize: { xs: "0.813rem", md: "0.875rem" } }}>
            Track your hours, projects, and billable time - Edit directly in the grid
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handlePrefillFromPrevious}
            sx={{
              borderColor: "#0071E3",
              color: "#0071E3",
              textTransform: "none",
              borderRadius: "12px",
              px: 3,
              py: 1.5,
              "&:hover": { borderColor: "#005BB5", bgcolor: "rgba(0, 113, 227, 0.04)" },
            }}
          >
            Prefill from Previous
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddRow}
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
            Add Timesheet
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 2, mb: 4 }}>
        <Card sx={{ borderRadius: "16px", border: "1px solid #E5E5EA" }}>
          <CardContent>
            <Typography variant="body2" sx={{ color: "#86868B", mb: 1, fontSize: { xs: "0.813rem", md: "0.875rem" } }}>
              Total Hours This Week
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, color: "#1D1D1D", fontSize: { xs: "1.75rem", md: "2rem" } }}>
              {getTotalHours()}h
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderRadius: "16px", border: "1px solid #E5E5EA" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <AttachMoneyIcon sx={{ color: "#34C759", fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: "#86868B", fontSize: { xs: "0.813rem", md: "0.875rem" } }}>
                Billable Amount
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 600, color: "#34C759", fontSize: { xs: "1.75rem", md: "2rem" } }}>
              ${getTotalBillable().toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderRadius: "16px", border: "1px solid #E5E5EA" }}>
          <CardContent>
            <Typography variant="body2" sx={{ color: "#86868B", mb: 1, fontSize: { xs: "0.813rem", md: "0.875rem" } }}>
              Pending Approvals
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, color: "#FF9500", fontSize: { xs: "1.75rem", md: "2rem" } }}>
              {getPendingCount()}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Week Navigation */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <IconButton onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Week of {format(currentWeekStart, "MMM dd, yyyy")}
        </Typography>
        <IconButton onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}>
          <ArrowForwardIcon />
        </IconButton>
      </Box>

      {/* Timesheets Editable Grid */}
      <TableContainer
        component={Paper}
        sx={{ borderRadius: "16px", border: "1px solid #E5E5EA", boxShadow: "none", overflowX: "auto", width: "100%" }}
      >
        <Table size="small" sx={{ minWidth: 650, tableLayout: "auto" }}>
          <TableHead sx={{ bgcolor: "#F5F5F7" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, width: 50 }}></TableCell>
              <TableCell sx={{ fontWeight: 600, minWidth: 120, maxWidth: 200, whiteSpace: "normal", wordBreak: "break-word" }}>Project</TableCell>
              <TableCell sx={{ fontWeight: 600, minWidth: 100, maxWidth: 150, whiteSpace: "normal", wordBreak: "break-word" }}>Task</TableCell>
              <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>Week Start</TableCell>
              {daysOfWeek.map((day) => (
                <TableCell key={day} sx={{ fontWeight: 600, minWidth: 70 }} align="center">
                  {day}
                </TableCell>
              ))}
              <TableCell sx={{ fontWeight: 600, minWidth: 80 }} align="center">Billable</TableCell>
              <TableCell sx={{ fontWeight: 600, minWidth: 100 }} align="right">Amount</TableCell>
              <TableCell sx={{ fontWeight: 600, minWidth: 80 }} align="center">Total Hrs</TableCell>
              <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {weekTimesheets.map((row) => {
              const editable = isRowEditable(row);
              const totalHours = calculateRowTotal(row.hours);
              const amount = calculateRowAmount(row);
              const isSelected = selectedRowId === row.id;
              
              return (
                <React.Fragment key={row.id}>
                  <TableRow 
                    hover 
                    sx={{ 
                      bgcolor: isSelected ? "#E3F2FD" : (row.isEditing ? "#F0F8FF" : "transparent"),
                      cursor: "pointer",
                      "&:hover": { bgcolor: isSelected ? "#E3F2FD" : "#F5F5F7" }
                    }}
                  >
                    {/* Selection Checkbox */}
                    <TableCell>
                      <IconButton size="small" onClick={() => handleSelectRow(row.id)}>
                        {isSelected ? <CheckCircleIcon color="primary" /> : <PendingIcon />}
                      </IconButton>
                    </TableCell>
                    
                    {/* Project */}
                    <TableCell>
                    {editable ? (
                      <FormControl fullWidth size="small">
                        <Select
                          value={row.project}
                          onChange={(e) => handleUpdateRow(row.id, "project", e.target.value)}
                          disabled={!editable}
                        >
                          {projects.map((proj) => (
                            <MenuItem key={proj.id} value={proj.name}>
                              {proj.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {row.project}
                      </Typography>
                    )}
                  </TableCell>
                  
                  {/* Task */}
                  <TableCell>
                    {editable ? (
                      <FormControl fullWidth size="small">
                        <Select
                          value={row.task}
                          onChange={(e) => handleUpdateRow(row.id, "task", e.target.value)}
                          disabled={!editable}
                        >
                          {tasks.map((task) => (
                            <MenuItem key={task.id} value={task.name}>
                              {task.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <Chip label={row.task} size="small" sx={{ borderRadius: "8px" }} />
                    )}
                  </TableCell>
                  
                  {/* Week Start */}
                  <TableCell>
                    <Typography variant="body2">
                      {format(parseISO(row.weekStart), "MMM dd, yyyy")}
                    </Typography>
                  </TableCell>
                  
                  {/* Hours for each day */}
                  {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => (
                    <TableCell key={dayIdx} align="center">
                      {editable ? (
                        <TextField
                          type="number"
                          value={row.hours[dayIdx] || ""}
                          onChange={(e) =>
                            handleUpdateHours(row.id, dayIdx, parseFloat(e.target.value) || 0)
                          }
                          size="small"
                          inputProps={{ min: 0, max: 24, step: 0.5, style: { textAlign: "center" } }}
                          sx={{ width: 65 }}
                        />
                      ) : (
                        <Typography variant="body2" sx={{ fontWeight: row.hours[dayIdx] > 0 ? 600 : "normal" }}>
                          {row.hours[dayIdx] || "-"}
                        </Typography>
                      )}
                    </TableCell>
                  ))}
                  
                  {/* Billable */}
                  <TableCell align="center">
                    {editable ? (
                      <Box sx={{ display: "flex", justifyContent: "center", gap: 1, alignItems: "center" }}>
                        <input
                          type="checkbox"
                          checked={row.billable}
                          onChange={(e) => handleUpdateRow(row.id, "billable", e.target.checked)}
                        />
                        {row.billable && (
                          <TextField
                            type="number"
                            value={row.hourlyRate}
                            onChange={(e) =>
                              handleUpdateRow(row.id, "hourlyRate", parseFloat(e.target.value) || 0)
                            }
                            size="small"
                            placeholder="Rate"
                            sx={{ width: 70 }}
                            inputProps={{ min: 0, step: 5 }}
                          />
                        )}
                      </Box>
                    ) : row.billable ? (
                      <Chip
                        label={`$${row.hourlyRate}/hr`}
                        size="small"
                        color="success"
                        icon={<AttachMoneyIcon />}
                        sx={{ borderRadius: "8px" }}
                      />
                    ) : (
                      <Chip label="No" size="small" variant="outlined" sx={{ borderRadius: "8px" }} />
                    )}
                  </TableCell>
                  
                  {/* Amount */}
                  <TableCell align="right">
                    {row.billable ? (
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#34C759" }}>
                        ${amount.toFixed(2)}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        —
                      </Typography>
                    )}
                  </TableCell>
                  
                  {/* Total Hours */}
                  <TableCell align="center">
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#1D1D1D" }}>
                      {totalHours}h
                    </Typography>
                  </TableCell>
                  
                  {/* Status */}
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(row.status)}
                      label={row.status}
                      size="small"
                      color={getStatusColor(row.status)}
                      sx={{ borderRadius: "8px" }}
                    />
                  </TableCell>
                </TableRow>
                
                {/* Action Buttons Row - Shown when selected */}
                {isSelected && (
                  <TableRow>
                    <TableCell colSpan={13} sx={{ bgcolor: "#FAFAFA", borderBottom: "2px solid #E5E5EA" }}>
                      <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", py: 1 }}>
                        {/* File Upload Section */}
                        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexGrow: 1 }}>
                          <Button
                            variant="outlined"
                            component="label"
                            size="small"
                            startIcon={<AddIcon />}
                            sx={{ textTransform: "none" }}
                          >
                            Upload Files
                            <input
                              type="file"
                              hidden
                              multiple
                              onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                handleFileUpload(row.id, files);
                              }}
                            />
                          </Button>
                          {row.attachments && row.attachments.length > 0 && (
                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                              {row.attachments.map((file, idx) => (
                                <Chip
                                  key={idx}
                                  label={file.name}
                                  onDelete={() => handleRemoveFile(row.id, idx)}
                                  size="small"
                                  sx={{ maxWidth: 200 }}
                                />
                              ))}
                            </Box>
                          )}
                        </Box>
                        
                        {/* Action Buttons */}
                        <Box sx={{ display: "flex", gap: 1 }}>
                          {row.isEditing ? (
                            <>
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<SaveIcon />}
                                onClick={() => handleSaveRow(row)}
                                sx={{
                                  bgcolor: "#34C759",
                                  textTransform: "none",
                                  "&:hover": { bgcolor: "#28A745" },
                                }}
                              >
                                Save
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => handleDeleteRow(row.id)}
                                sx={{ textTransform: "none" }}
                              >
                                Delete
                              </Button>
                            </>
                          ) : row.status === "Pending" ? (
                            <>
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<SendIcon />}
                                onClick={() => handleSubmitForApproval(row)}
                                sx={{
                                  bgcolor: "#0071E3",
                                  textTransform: "none",
                                  "&:hover": { bgcolor: "#005BB5" },
                                }}
                              >
                                Submit for Approval
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<EditIcon />}
                                onClick={() => handleEditRow(row.id)}
                                sx={{ textTransform: "none" }}
                              >
                                Edit
                              </Button>
                              {isManager && (
                                <>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<ThumbUpIcon />}
                                    onClick={() => handleApprove(row.id)}
                                    sx={{
                                      bgcolor: "#34C759",
                                      textTransform: "none",
                                      "&:hover": { bgcolor: "#28A745" },
                                    }}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    color="error"
                                    startIcon={<ThumbDownIcon />}
                                    onClick={() => handleReject(row.id)}
                                    sx={{ textTransform: "none" }}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                            </>
                          ) : row.status === "Approved" ? (
                            <>
                              <Typography variant="body2" color="textSecondary" sx={{ py: 1, mr: 2 }}>
                                This timesheet is approved and read-only
                              </Typography>
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<ReceiptIcon />}
                                onClick={() => handleGenerateInvoice(row)}
                                sx={{
                                  bgcolor: "#0071E3",
                                  textTransform: "none",
                                  "&:hover": { bgcolor: "#005BB5" },
                                }}
                              >
                                Generate Invoice
                              </Button>
                            </>
                          ) : (
                            <Typography variant="body2" color="error" sx={{ py: 1 }}>
                              This timesheet was rejected
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
                </React.Fragment>
              );
            })}
            {weekTimesheets.length === 0 && (
              <TableRow>
                <TableCell colSpan={14} align="center" sx={{ py: 4, color: "#86868B" }}>
                  No timesheets for this week. Click "Add Timesheet" to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Invoice Generation Dialog */}
      <Dialog
        open={invoiceDialogOpen}
        onClose={() => !sendingInvoice && setInvoiceDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px" } }}
      >
        <DialogTitle sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
          <ReceiptIcon color="primary" />
          Generate & Send Invoice
        </DialogTitle>
        <DialogContent>
          {selectedInvoiceRow && (
            <Box sx={{ mt: 2 }}>
              {/* Select Weeks */}
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Select weeks to include in invoice:
              </Typography>
              <Box sx={{ mb: 3, maxHeight: 200, overflowY: "auto" }}>
                {weeklyTimesheets
                  .filter(wts => wts.status === "Approved")
                  .sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime())
                  .map(week => {
                    const weekHours = calculateRowTotal(week.hours);
                    const weekAmount = calculateRowAmount(week);
                    const isSelected = selectedInvoiceWeeks.some(w => w.id === week.id);
                    
                    return (
                      <Box 
                        key={week.id}
                        sx={{ 
                          display: "flex", 
                          alignItems: "center", 
                          p: 1.5, 
                          mb: 1,
                          bgcolor: isSelected ? "#E3F2FD" : "#F5F5F7",
                          borderRadius: "8px",
                          cursor: "pointer",
                          border: isSelected ? "2px solid #0071E3" : "2px solid transparent"
                        }}
                        onClick={() => toggleInvoiceWeek(week)}
                      >
                        <Checkbox 
                          checked={isSelected}
                          onChange={() => toggleInvoiceWeek(week)}
                          sx={{ mr: 2 }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {format(parseISO(week.weekStart), "MMM dd")} - {format(addDays(parseISO(week.weekStart), 6), "MMM dd, yyyy")}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {week.project} • {week.task} • {weekHours}h @ ${week.hourlyRate}/hr
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#34C759" }}>
                          ${weekAmount.toFixed(2)}
                        </Typography>
                      </Box>
                    );
                  })}
              </Box>

              {/* Invoice Summary */}
              <Card sx={{ mb: 3, bgcolor: "#F5F5F7", borderRadius: "12px" }}>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Invoice Summary ({selectedInvoiceWeeks.length} week{selectedInvoiceWeeks.length !== 1 ? 's' : ''})
                  </Typography>
                  <Box sx={{ display: "grid", gap: 1, mt: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2">Total Hours:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {selectedInvoiceWeeks.reduce((sum, w) => sum + calculateRowTotal(w.hours), 0)}h
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", pt: 1, borderTop: "1px solid #E5E5EA" }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>Total Amount:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: "#34C759" }}>
                        ${selectedInvoiceWeeks.reduce((sum, w) => sum + calculateRowAmount(w), 0).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Recipient Email */}
              <TextField
                label="Recipient Email *"
                type="email"
                value={invoiceEmail}
                onChange={(e) => setInvoiceEmail(e.target.value)}
                fullWidth
                placeholder="client@example.com"
                sx={{ mb: 2 }}
                disabled={sendingInvoice}
              />

              {/* Attachments Options */}
              <Box sx={{ mb: 2 }}>
                {(() => {
                  const allAttachments = selectedInvoiceWeeks.flatMap(w => w.attachments || []);
                  const totalAttachments = allAttachments.length;
                  
                  return (
                    <>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={includeTimesheetAttachments}
                            onChange={(e) => setIncludeTimesheetAttachments(e.target.checked)}
                            disabled={sendingInvoice || totalAttachments === 0}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2">Include Timesheet Attachments</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {totalAttachments > 0
                                ? `${totalAttachments} file(s) from ${selectedInvoiceWeeks.length} week(s)`
                                : "No attachments available"}
                            </Typography>
                          </Box>
                        }
                      />
                      
                      {/* Show attached files grouped by week */}
                      {includeTimesheetAttachments && totalAttachments > 0 && (
                        <Box sx={{ bgcolor: "#F5F5F7", p: 2, borderRadius: "8px", mt: 2 }}>
                          <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: "block", fontWeight: 600 }}>
                            Files to be attached:
                          </Typography>
                          {selectedInvoiceWeeks.map((week, weekIdx) => {
                            if (!week.attachments || week.attachments.length === 0) return null;
                            return (
                              <Box key={weekIdx} sx={{ mb: weekIdx < selectedInvoiceWeeks.length - 1 ? 2 : 0 }}>
                                <Typography variant="caption" color="textSecondary" sx={{ display: "block", mb: 0.5 }}>
                                  Week of {format(parseISO(week.weekStart), "MMM dd, yyyy")}:
                                </Typography>
                                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                  {week.attachments.map((file, idx) => (
                                    <Chip 
                                      key={idx} 
                                      label={file.name} 
                                      size="small"
                                      sx={{ bgcolor: "white" }}
                                    />
                                  ))}
                                </Box>
                              </Box>
                            );
                          })}
                        </Box>
                      )}
                    </>
                  );
                })()}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setInvoiceDialogOpen(false)}
            disabled={sendingInvoice}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSendInvoice}
            disabled={sendingInvoice || !invoiceEmail.trim()}
            startIcon={sendingInvoice ? <CircularProgress size={16} /> : <SendIcon />}
            sx={{
              bgcolor: "#0071E3",
              textTransform: "none",
              borderRadius: "8px",
              "&:hover": { bgcolor: "#005BB5" },
            }}
          >
            {sendingInvoice ? "Sending..." : "Send Invoice"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Submitted Weeks Summary Table */}
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: "#1D1D1D" }}>
            Submitted Weeks Summary
          </Typography>
          
          {/* Action Buttons for Selected Rows */}
          {selectedSummaryRows.length > 0 && (
            <Box sx={{ display: "flex", gap: 2 }}>
              {selectedSummaryRows.length === 1 && 
               weeklyTimesheets.find(r => r.id === selectedSummaryRows[0])?.status === "Pending" && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => handleEditSummaryRow(selectedSummaryRows[0])}
                  sx={{ textTransform: "none" }}
                >
                  Edit
                </Button>
              )}
              {weeklyTimesheets.filter(r => selectedSummaryRows.includes(r.id) && r.status === "Pending").length > 0 && (
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteSelectedSummaryRows}
                  sx={{ textTransform: "none" }}
                >
                  Delete ({selectedSummaryRows.length})
                </Button>
              )}
            </Box>
          )}
        </Box>

        {/* Date Filters */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
          <TextField
            label="From Date"
            type="date"
            value={filterFromDate}
            onChange={(e) => setFilterFromDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ width: 200 }}
          />
          <TextField
            label="To Date"
            type="date"
            value={filterToDate}
            onChange={(e) => setFilterToDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ width: 200 }}
          />
          {(filterFromDate || filterToDate) && (
            <Button
              variant="text"
              size="small"
              onClick={() => {
                setFilterFromDate("");
                setFilterToDate("");
              }}
              sx={{ textTransform: "none" }}
            >
              Clear Filters
            </Button>
          )}
        </Box>

        <TableContainer
          component={Paper}
          sx={{ borderRadius: "16px", border: "1px solid #E5E5EA", boxShadow: "none", overflowX: "auto", width: "100%" }}
        >
          <Table sx={{ minWidth: 650, tableLayout: "auto" }}>
            <TableHead sx={{ bgcolor: "#F5F5F7" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, width: 50 }} padding="checkbox">
                  <Checkbox
                    checked={selectedSummaryRows.length > 0 && selectedSummaryRows.length === getFilteredSummaryTimesheets().length}
                    indeterminate={selectedSummaryRows.length > 0 && selectedSummaryRows.length < getFilteredSummaryTimesheets().length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSummaryRows(getFilteredSummaryTimesheets().map(r => r.id));
                      } else {
                        setSelectedSummaryRows([]);
                      }
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 120, maxWidth: 180, whiteSpace: "normal", wordBreak: "break-word" }}>Week Period</TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 120, maxWidth: 200, whiteSpace: "normal", wordBreak: "break-word" }}>Project</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Task</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Total Hours</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Attachments</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Submitted Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getFilteredSummaryTimesheets().map((row) => {
                  const totalHours = calculateRowTotal(row.hours);
                  const amount = calculateRowAmount(row);
                  const weekEnd = format(addDays(parseISO(row.weekStart), 6), "MMM dd, yyyy");
                  const isSelected = selectedSummaryRows.includes(row.id);
                  
                  return (
                    <TableRow 
                      key={row.id} 
                      hover 
                      selected={isSelected}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleToggleSummaryRow(row.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {format(parseISO(row.weekStart), "MMM dd")} - {weekEnd}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{row.project}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={row.task} size="small" sx={{ borderRadius: "8px" }} />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {totalHours}h
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {row.billable ? (
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "#34C759" }}>
                            ${amount.toFixed(2)}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            Not Billable
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {row.attachments && row.attachments.length > 0 ? (
                          <Chip
                            label={`${row.attachments.length} file(s)`}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ borderRadius: "8px" }}
                          />
                        ) : (
                          <Typography variant="caption" color="textSecondary">
                            No files
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(row.status)}
                          label={row.status}
                          size="small"
                          color={getStatusColor(row.status)}
                          sx={{ borderRadius: "8px" }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="textSecondary">
                          {format(parseISO(row.weekStart), "MMM dd, yyyy")}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              {getFilteredSummaryTimesheets().length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4, color: "#86868B" }}>
                    {filterFromDate || filterToDate ? "No timesheets found in the selected date range" : "No submitted timesheets yet"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default Timesheets;
