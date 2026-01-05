import React, { useEffect, useState, FC } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  IconButton,
  MenuItem,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";

interface Employee {
  id: number;
  name: string;
  email: string;
  position: string;
  role: string;
}

interface Timesheet {
  id: number;
  userId: number;
  date: string;
  hours: number;
  status: string;
  notes: string;
  attachments?: Array<{
    name: string;
    data?: string;
    type?: string;
    path?: string;
  }>;
  weekStart?: string;
}

interface Invoice {
  id: number;
  employeeId: number;
  employeeName: string;
  month: string;
  year: number;
  totalHours: number;
  totalAmount: number;
  createdDate: string;
  status: string;
}

interface InvoiceConfig {
  companyName: string;
  logo: string;
  vendorEmail: string;
  companyEmail: string;
}

interface InvoicingProps {
  user?: any;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

const Invoicing: FC<InvoicingProps> = ({ user }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | "">("");
  const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [includeTimesheetAttachments, setIncludeTimesheetAttachments] = useState(true);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [config, setConfig] = useState<InvoiceConfig>({
    companyName: "CentraPro",
    logo: "/centrapro-logo-new.png",
    vendorEmail: "vendor@example.com",
    companyEmail: "invoices@centrapro.com",
  });

  // Load config from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem("invoiceConfig");
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Failed to load config:", e);
      }
    }
  }, []);

  // Load employees on mount
  useEffect(() => {
    const loadEmployees = () => {
      const t = localStorage.getItem("app_token");
      fetch(API_BASE + "/api/employees", {
        headers: { Authorization: "Bearer " + (t || "") },
      })
        .then((r) => r.json())
        .then((j) => {
          setEmployees(Array.isArray(j) ? j : []);
        })
        .catch((e) => console.error(e));
    };
    loadEmployees();
  }, []);

  // Load all invoices
  useEffect(() => {
    const loadInvoices = () => {
      const t = localStorage.getItem("app_token");
      fetch(API_BASE + "/api/invoices", {
        headers: { Authorization: "Bearer " + (t || "") },
      })
        .then((r) => {
          if (r.status === 404) return [];
          return r.json();
        })
        .then((j) => {
          setInvoices(Array.isArray(j) ? j : []);
        })
        .catch((e) => {
          console.error(e);
          setInvoices([]);
        });
    };
    loadInvoices();
  }, []);

  // Filter invoices based on month/year and employee
  useEffect(() => {
    let filtered = invoices;

    if (selectedEmployeeId) {
      filtered = filtered.filter((inv) => inv.employeeId === selectedEmployeeId);
    }

    filtered = filtered.filter(
      (inv) =>
        inv.year === selectedYear &&
        inv.month === new Date(selectedYear, parseInt(selectedMonth) - 1).toLocaleString("default", { month: "long" })
    );

    setFilteredInvoices(filtered);
  }, [invoices, selectedMonth, selectedYear, selectedEmployeeId]);

  // Generate invoice
  const generateInvoice = () => {
    if (!selectedEmployeeId) {
      setMessage({ type: "error", text: "Please select an employee" });
      return;
    }

    setLoading(true);
    const t = localStorage.getItem("app_token");
    fetch(API_BASE + "/api/timesheets", {
      headers: { Authorization: "Bearer " + (t || "") },
    })
      .then((r) => r.json())
      .then((allTimesheets: Timesheet[]) => {
        // Store timesheets for attachment access
        setTimesheets(allTimesheets);
        
        // Filter timesheets for selected employee and month/year
        const employeeTimesheets = allTimesheets.filter(
          (ts) =>
            ts.userId === selectedEmployeeId &&
            ts.date.startsWith(`${selectedYear}-${String(selectedMonth).padStart(2, "0")}`)
        );

        // Calculate total hours
        const totalHours = employeeTimesheets.reduce((sum, ts) => sum + ts.hours, 0);

        // Check if we have at least 4 weeks of timesheets
        const uniqueWeeks = new Set<string>();
        employeeTimesheets.forEach((ts) => {
          const date = new Date(ts.date);
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay() + 1);
          uniqueWeeks.add(weekStart.toISOString().split("T")[0]);
        });

        if (uniqueWeeks.size < 4) {
          setMessage({
            type: "error",
            text: `Employee has only ${uniqueWeeks.size} complete weeks submitted. Need at least 4 weeks to generate invoice.`,
          });
          setLoading(false);
          return;
        }

        // Generate invoice
        const employee = employees.find((e) => e.id === selectedEmployeeId);
        const hourlyRate = 50; // Default rate
        const invoice: Invoice = {
          id: Math.floor(Math.random() * 10000),
          employeeId: selectedEmployeeId as number,
          employeeName: employee?.name || "Unknown",
          month: new Date(selectedYear, parseInt(selectedMonth) - 1).toLocaleString("default", {
            month: "long",
          }),
          year: selectedYear,
          totalHours,
          totalAmount: totalHours * hourlyRate,
          createdDate: new Date().toISOString().split("T")[0],
          status: "Generated",
        };

        setGeneratedInvoice(invoice);
        setShowInvoiceDialog(true);
        setMessage({
          type: "success",
          text: `Invoice generated for ${employee?.name || "Unknown"} - ${totalHours} hours @ $${hourlyRate}/hr`,
        });
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setMessage({ type: "error", text: "Failed to load timesheets" });
        setLoading(false);
      });
  };

  const handleSendEmail = async () => {
    if (!generatedInvoice) return;

    setSendingEmail(true);
    const t = localStorage.getItem("app_token");

    try {
      // Get attachments from timesheets for the specific month/year
      const attachments = includeTimesheetAttachments ? timesheets
        .filter(ts => 
          ts.userId === generatedInvoice.employeeId &&
          ts.date.startsWith(`${generatedInvoice.year}-${String(new Date(generatedInvoice.month + ' 1, ' + generatedInvoice.year).getMonth() + 1).padStart(2, '0')}`)
        )
        .flatMap(ts => ts.attachments || [])
        .filter((att, index, self) => 
          // Remove duplicates by name
          index === self.findIndex(a => a.name === att.name)
        )
        : [];

      const response = await fetch(API_BASE + "/api/invoices/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + (t || ""),
        },
        body: JSON.stringify({
          invoice: generatedInvoice,
          vendorEmail: config.vendorEmail,
          companyEmail: config.companyEmail,
          includeTimesheetAttachments,
          attachments,
        }),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: `Invoice sent successfully to ${config.vendorEmail}`,
        });
        // Add to invoices list
        setInvoices([...invoices, generatedInvoice]);
        setShowInvoiceDialog(false);
        setGeneratedInvoice(null);
      } else {
        const err = await response.json();
        setMessage({
          type: "error",
          text: `Failed to send invoice: ${err.error || "Unknown error"}`,
        });
      }
    } catch (e) {
      setMessage({
        type: "error",
        text: `Error sending invoice: ${String(e)}`,
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const generatePDF = (invoice: Invoice) => {
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice #${invoice.id}</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; 
            margin: 0; 
            padding: 40px; 
            background-color: #F5F5F7; 
          }
          .container { 
            background-color: white; 
            border-radius: 18px; 
            padding: 40px; 
            max-width: 900px; 
            margin: 0 auto;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start;
            margin-bottom: 40px; 
            border-bottom: 1px solid #E5E5EA;
            padding-bottom: 20px;
          }
          .company-info h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 700;
            color: #1D1D1D;
          }
          .company-info p { 
            margin: 5px 0; 
            color: #86868B; 
            font-size: 14px;
          }
          .invoice-details { 
            text-align: right;
          }
          .invoice-details p { 
            margin: 5px 0; 
            color: #86868B;
            font-size: 14px;
          }
          .invoice-id { 
            font-size: 18px; 
            font-weight: 700; 
            color: #0071E3;
          }
          .section-title {
            font-size: 12px;
            font-weight: 600;
            color: #86868B;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 30px 0 15px 0;
          }
          .bill-to {
            margin-bottom: 30px;
          }
          .bill-to p {
            margin: 5px 0;
            color: #1D1D1D;
            font-size: 14px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 30px 0; 
          }
          th { 
            background-color: #F5F5F7; 
            border-bottom: 2px solid #E5E5EA;
            padding: 15px; 
            text-align: left;
            font-weight: 600;
            font-size: 12px;
            color: #1D1D1D;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          td { 
            border-bottom: 1px solid #E5E5EA; 
            padding: 15px;
            font-size: 14px;
            color: #1D1D1D;
          }
          .text-right { text-align: right; }
          .amount { font-weight: 600; }
          .total-row { background-color: #F5F5F7; }
          .total-row td { 
            border-bottom: 2px solid #E5E5EA;
            font-weight: 700;
            font-size: 16px;
            padding: 20px 15px;
          }
          .total-amount { 
            color: #0071E3;
            font-size: 18px;
          }
          .footer { 
            margin-top: 40px; 
            text-align: center; 
            color: #86868B; 
            font-size: 12px;
            border-top: 1px solid #E5E5EA;
            padding-top: 20px;
          }
          .footer p { margin: 5px 0; }
          .notes {
            margin-top: 20px;
            padding: 15px;
            background-color: #F5F5F7;
            border-radius: 12px;
            font-size: 13px;
            color: #86868B;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${config.logo}" alt="CentraPro Logo" style="width:48px;height:48px;margin-right:16px;vertical-align:middle;" />
            <div class="company-info">
              <h1>${config.companyName}</h1>
              <p>${config.companyEmail}</p>
              <p>Timesheet & Invoice Management System</p>
            </div>
            <div class="invoice-details">
              <p class="invoice-id">INVOICE #${invoice.id}</p>
              <p><strong>Date:</strong> ${invoice.createdDate}</p>
              <p><strong>Period:</strong> ${invoice.month} ${invoice.year}</p>
            </div>
          </div>
          
          <div class="bill-to">
            <div class="section-title">Bill To</div>
            <p><strong>${invoice.employeeName}</strong></p>
            <p>${config.vendorEmail}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="width: 120px;" class="text-right">Hours</th>
                <th style="width: 120px;" class="text-right">Rate</th>
                <th style="width: 150px;" class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Consulting Services - ${invoice.month} ${invoice.year}</td>
                <td class="text-right amount">${invoice.totalHours}</td>
                <td class="text-right amount">$50.00</td>
                <td class="text-right amount">$${invoice.totalAmount.toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td colspan="3" class="text-right">TOTAL:</td>
                <td class="text-right total-amount">$${invoice.totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="notes">
            <strong>Status:</strong> ${invoice.status}<br>
            <strong>Note:</strong> Invoice generated on ${new Date().toLocaleString()}. This is an electronically generated document.
          </div>
          
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${config.companyName}. All rights reserved.</p>
            <p>Generated by CentraPro Timesheet & Invoice Management System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([invoiceHTML], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice-${invoice.id}-${invoice.employeeName}-${invoice.createdDate}.html`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const deleteInvoice = (invoiceId: number) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    setInvoices(invoices.filter((inv) => inv.id !== invoiceId));
    setMessage({ type: "success", text: "Invoice deleted successfully" });
  };

  const saveConfig = () => {
    localStorage.setItem("invoiceConfig", JSON.stringify(config));
    setMessage({ type: "success", text: "Invoice configuration saved" });
    setShowConfigDialog(false);
  };

  const currentMonth = new Date(selectedYear, parseInt(selectedMonth) - 1);
  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Invoice Management
        </Typography>
        <Typography variant="body2" sx={{ color: "#86868B", mb: 3 }}>
          Generate, manage, and send invoices to vendors
        </Typography>

        {message && (
          <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}

        {/* Generate Invoice Section */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: "18px", border: "1px solid #E5E5EA" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Generate New Invoice
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 2, alignItems: "flex-end" }}>
            <TextField
              select
              label="Select Employee"
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value ? parseInt(e.target.value as string) : "")}
              fullWidth
            >
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.name} - {emp.position}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <MenuItem key={i + 1} value={i + 1}>
                  {new Date(2024, i).toLocaleString("default", { month: "long" })}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((yr) => (
                <MenuItem key={yr} value={yr}>
                  {yr}
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                onClick={generateInvoice}
                disabled={loading}
                sx={{ borderRadius: "1000px" }}
              >
                {loading ? <CircularProgress size={20} /> : "Generate"}
              </Button>
              <Button
                variant="outlined"
                onClick={() => setShowConfigDialog(true)}
                sx={{ borderRadius: "1000px" }}
              >
                Config
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Past Invoices Section */}
        <Paper sx={{ p: 3, borderRadius: "18px", border: "1px solid #E5E5EA" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Invoice History - {monthName}
          </Typography>
          {filteredInvoices.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F5F5F7" }}>
                  <TableCell sx={{ fontWeight: 700, borderRadius: "12px 0 0 0" }}>Invoice #</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Period</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Hours</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: "center" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: "center", borderRadius: "0 12px 0 0" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} sx={{ "&:hover": { bgcolor: "#F5F5F7" } }}>
                    <TableCell sx={{ fontWeight: 600, color: "#0071E3" }}># {invoice.id}</TableCell>
                    <TableCell>{invoice.employeeName}</TableCell>
                    <TableCell>
                      {invoice.month} {invoice.year}
                    </TableCell>
                    <TableCell sx={{ textAlign: "right", fontWeight: 600 }}>{invoice.totalHours} hrs</TableCell>
                    <TableCell sx={{ textAlign: "right", fontWeight: 700, color: "#0071E3" }}>
                      ${invoice.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      <Typography
                        variant="caption"
                        sx={{
                          py: 0.5,
                          px: 1.5,
                          borderRadius: "999px",
                          display: "inline-block",
                          fontSize: "12px",
                          fontWeight: 600,
                          bgcolor: "#E7F3FF",
                          color: "#0071E3",
                        }}
                      >
                        {invoice.status}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      <IconButton
                        size="small"
                        onClick={() => generatePDF(invoice)}
                        title="Download PDF"
                        sx={{ color: "#0071E3" }}
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => deleteInvoice(invoice.id)}
                        title="Delete"
                        sx={{ color: "#FF3B30" }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography sx={{ textAlign: "center", color: "#86868B", py: 4 }}>
              No invoices found for {monthName}
            </Typography>
          )}
        </Paper>
      </Box>

      {/* Generated Invoice Dialog */}
      <Dialog open={showInvoiceDialog} onClose={() => setShowInvoiceDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Invoice Preview
          <Typography sx={{ fontSize: "14px", color: "#0071E3", fontWeight: 600 }}>
            # {generatedInvoice?.id}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {generatedInvoice && (
            <Box sx={{ display: "grid", gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: "#86868B", fontWeight: 600 }}>
                  EMPLOYEE
                </Typography>
                <Typography sx={{ fontWeight: 600 }}>{generatedInvoice.employeeName}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "#86868B", fontWeight: 600 }}>
                  PERIOD
                </Typography>
                <Typography sx={{ fontWeight: 600 }}>
                  {generatedInvoice.month} {generatedInvoice.year}
                </Typography>
              </Box>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#86868B", fontWeight: 600 }}>
                    TOTAL HOURS
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: "18px" }}>{generatedInvoice.totalHours} hrs</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#86868B", fontWeight: 600 }}>
                    TOTAL AMOUNT
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: "18px", color: "#0071E3" }}>
                    ${generatedInvoice.totalAmount.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" sx={{ color: "#86868B" }}>
                Rate: $50.00/hour
              </Typography>
              
              {/* Attachment Checkbox */}
              <Box sx={{ mt: 2, p: 2, bgcolor: "#F5F5F7", borderRadius: "8px" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <input
                    type="checkbox"
                    checked={includeTimesheetAttachments}
                    onChange={(e) => setIncludeTimesheetAttachments(e.target.checked)}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Include Timesheet Attachments
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#86868B" }}>
                      {(() => {
                        const monthTimesheets = timesheets.filter(ts => 
                          ts.userId === generatedInvoice?.employeeId &&
                          ts.date.startsWith(`${generatedInvoice?.year}-${String(new Date(generatedInvoice?.month + ' 1, ' + generatedInvoice?.year).getMonth() + 1).padStart(2, '0')}`)
                        );
                        const uniqueAttachments = monthTimesheets
                          .flatMap(ts => ts.attachments || [])
                          .filter((att, index, self) => 
                            index === self.findIndex(a => a.name === att.name)
                          );
                        return uniqueAttachments.length > 0
                          ? `${uniqueAttachments.length} file(s) will be attached`
                          : "No attachments available";
                      })()}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setShowInvoiceDialog(false)}>Cancel</Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => {
              if (generatedInvoice) generatePDF(generatedInvoice);
            }}
          >
            Download
          </Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleSendEmail}
            disabled={sendingEmail}
            sx={{ borderRadius: "1000px" }}
          >
            {sendingEmail ? <CircularProgress size={20} /> : "Send"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Config Dialog */}
      <Dialog open={showConfigDialog} onClose={() => setShowConfigDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Invoice Configuration</DialogTitle>
        <DialogContent sx={{ pt: 2, display: "grid", gap: 2 }}>
          <TextField
            label="Company Name"
            value={config.companyName}
            onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
            fullWidth
          />
          <TextField
            label="Logo URL"
            value={config.logo}
            onChange={(e) => setConfig({ ...config, logo: e.target.value })}
            fullWidth
            placeholder="https://..."
          />
          <TextField
            label="Company Email"
            value={config.companyEmail}
            onChange={(e) => setConfig({ ...config, companyEmail: e.target.value })}
            fullWidth
            type="email"
          />
          <TextField
            label="Vendor/Receiver Email"
            value={config.vendorEmail}
            onChange={(e) => setConfig({ ...config, vendorEmail: e.target.value })}
            fullWidth
            type="email"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setShowConfigDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveConfig} sx={{ borderRadius: "1000px" }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Invoicing;
