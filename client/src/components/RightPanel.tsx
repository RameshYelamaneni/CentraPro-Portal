import React, { useEffect, useState, FC } from "react";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from "@mui/material";

interface AlertItem {
  id: number;
  project: string;
  date: string;
  hours: number;
  status: string;
  text: string;
}

interface RightPanelProps {
  // Optional props can be added here
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

const RightPanel: FC<RightPanelProps> = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("app_token");
    if (!t) {
      setLoading(false);
      return;
    }
    fetch(`${API_BASE}/api/timesheets`, {
      headers: { Authorization: "Bearer " + t },
    })
      .then((r) => r.json())
      .then((timesheets: any) => {
        // Convert timesheets to alerts: pending/resubmitted ones
        const alertItems: AlertItem[] = (timesheets || [])
          .filter(
            (ts: any) =>
              ts.status === "Pending" || ts.status === "Resubmitted"
          )
          .map((ts: any) => ({
            id: ts.id,
            project:
              ts.notes && ts.notes.startsWith("project:")
                ? ts.notes.split(";")[0].replace("project:", "")
                : "Project",
            date: ts.date,
            hours: ts.hours,
            status: ts.status,
            text: `Please fill in your Timesheet for the project "${
              ts.notes && ts.notes.startsWith("project:")
                ? ts.notes.split(";")[0].replace("project:", "")
                : "Project"
            }" on ${ts.date}.`,
          }));
        setAlerts(alertItems);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setAlerts([]);
      });
  }, []);

  const statusColor = (status: string): "warning" | "info" | "default" => {
    if (status === "Pending") return "warning";
    if (status === "Resubmitted") return "info";
    return "default";
  };

  return (
    <Box sx={{ width: 320, px: 1 }}>
      <Paper
        sx={{ p: 2, height: "80vh", overflow: "auto" }}
        className="card"
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Alerts
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 600 }}
          >
            {alerts.length}
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {loading ? (
          <Typography variant="body2" color="text.secondary">
            Loading...
          </Typography>
        ) : alerts.length > 0 ? (
          <List sx={{ p: 0 }}>
            {alerts.map((a, idx) => (
              <ListItem
                key={a.id}
                alignItems="flex-start"
                sx={{
                  pb: 2,
                  borderBottom:
                    idx < alerts.length - 1 ? "1px solid #e6e9ef" : "none",
                  "&:hover": { bgcolor: "#f8fafc" },
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {a.project}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mb: 0.5 }}
                      >
                        {a.text}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                        <Chip
                          label={a.status}
                          size="small"
                          color={statusColor(a.status)}
                          variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {a.date}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No pending timesheets
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default RightPanel;
