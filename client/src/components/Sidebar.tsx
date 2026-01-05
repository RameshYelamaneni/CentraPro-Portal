import React, { useState, FC, useEffect } from "react";
import {
  Box,
  Tooltip,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SettingsIcon from "@mui/icons-material/Settings";
import GroupIcon from "@mui/icons-material/Group";
import ReceiptIcon from "@mui/icons-material/Receipt";
import EmailIcon from "@mui/icons-material/Email";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { Link, useLocation } from "react-router-dom";

interface SidebarItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  // Optional props can be added here
}

interface NavConfig {
  sidebarMode: string;
  sidebarBgColor: string;
  sidebarTextColor: string;
  sidebarHoverColor: string;
  sidebarActiveColor: string;
  sidebarActiveBgColor: string;
  sidebarWidth: number;
  showIcons: boolean;
  showLabels: boolean;
  animateTransitions: boolean;
}

const defaultNavConfig: NavConfig = {
  sidebarMode: "expanded",
  sidebarBgColor: "#FFFFFF",
  sidebarTextColor: "#86868B",
  sidebarHoverColor: "#0071E3",
  sidebarActiveColor: "#0071E3",
  sidebarActiveBgColor: "#E7F3FF",
  sidebarWidth: 260,
  showIcons: true,
  showLabels: true,
  animateTransitions: true,
};

const items: SidebarItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: <DashboardIcon sx={{ fontSize: 22 }} /> },
  { to: "/profile", label: "Profile", icon: <PersonIcon sx={{ fontSize: 22 }} /> },
  { to: "/employees", label: "Employees", icon: <GroupIcon sx={{ fontSize: 22 }} /> },
  { to: "/onboarding", label: "Onboarding", icon: <PersonAddIcon sx={{ fontSize: 22 }} /> },
  { to: "/timesheets", label: "Timesheets", icon: <CalendarTodayIcon sx={{ fontSize: 22 }} /> },
  { to: "/leave", label: "Leave", icon: <BeachAccessIcon sx={{ fontSize: 22 }} /> },
  { to: "/approvals", label: "Approvals", icon: <CheckCircleIcon sx={{ fontSize: 22 }} /> },
  { to: "/invoicing", label: "Invoicing", icon: <ReceiptIcon sx={{ fontSize: 22 }} /> },
  { to: "/email-management", label: "Email Management", icon: <EmailIcon sx={{ fontSize: 22 }} /> },
  { to: "/email-templates", label: "Email Templates", icon: <EmailIcon sx={{ fontSize: 22 }} /> },
  { to: "/licensing", label: "Licensing", icon: <CreditCardIcon sx={{ fontSize: 22 }} /> },
  { to: "/admin", label: "Admin Console", icon: <AdminPanelSettingsIcon sx={{ fontSize: 22 }} /> },
  { to: "/settings", label: "Settings", icon: <SettingsIcon sx={{ fontSize: 22 }} /> },
];

const Sidebar: FC<SidebarProps> = () => {
  const loc = useLocation();
  const [expanded, setExpanded] = useState(true);
  const [hovering, setHovering] = useState(false);
  const [config, setConfig] = useState<NavConfig>(defaultNavConfig);

  // Load configuration from localStorage
  useEffect(() => {
    const loadConfig = () => {
      const savedConfig = localStorage.getItem("nav_config");
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        setConfig({ ...defaultNavConfig, ...parsed });
        
        // Set initial expanded state based on config
        if (parsed.sidebarMode === "collapsed") {
          setExpanded(false);
        } else if (parsed.sidebarMode === "expanded") {
          setExpanded(true);
        }
      }
    };

    loadConfig();

    // Listen for config updates
    const handleConfigUpdate = (event: any) => {
      const newConfig = event.detail;
      setConfig({ ...defaultNavConfig, ...newConfig });
      
      // Update expanded state based on new mode
      if (newConfig.sidebarMode === "collapsed") {
        setExpanded(false);
      } else if (newConfig.sidebarMode === "expanded") {
        setExpanded(true);
      }
    };

    window.addEventListener("navConfigUpdated", handleConfigUpdate);
    return () => window.removeEventListener("navConfigUpdated", handleConfigUpdate);
  }, []);

  // Determine if sidebar should be shown as expanded
  const isExpanded = () => {
    if (config.sidebarMode === "hover") {
      return hovering;
    }
    return expanded;
  };

  const shouldShowExpanded = isExpanded();

  return (
    <Box
      className="sidebar-compact"
      onMouseEnter={() => config.sidebarMode === "hover" && setHovering(true)}
      onMouseLeave={() => config.sidebarMode === "hover" && setHovering(false)}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: shouldShowExpanded ? "flex-start" : "center",
        py: 3,
        px: shouldShowExpanded ? 2 : 1,
        width: shouldShowExpanded ? config.sidebarWidth : 72,
        minWidth: shouldShowExpanded ? config.sidebarWidth : 72,
        maxWidth: shouldShowExpanded ? config.sidebarWidth : 72,
        transition: config.animateTransitions
          ? "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          : "none",
        borderRight: "1px solid #E5E5EA",
        height: "100vh",
        overflowY: "auto",
        overflowX: "hidden",
        backgroundColor: config.sidebarBgColor,
        position: "relative",
        flexShrink: 0,
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: shouldShowExpanded ? "flex-start" : "center",
          gap: 1,
          mb: 3,
          width: "100%",
          px: shouldShowExpanded ? 1 : 0,
        }}
      >
        <img
          src="/centrapro-logo-new.png"
          alt="CentraPro Logo"
          style={{
            width: shouldShowExpanded ? 56 : 40,
            height: shouldShowExpanded ? 56 : 40,
            borderRadius: shouldShowExpanded ? 16 : 12,
            background: "#fff",
            transition: config.animateTransitions ? "all 0.3s ease" : "none",
          }}
        />
        {shouldShowExpanded && (
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: config.sidebarTextColor,
              ml: 1,
              opacity: shouldShowExpanded ? 1 : 0,
              transition: config.animateTransitions ? "opacity 0.3s ease" : "none",
              whiteSpace: "nowrap",
            }}
          >
            CentraPro
          </Typography>
        )}
      </Box>

      {/* Collapse/Expand Button - Only show if not in hover mode */}
      {config.sidebarMode !== "hover" && (
        <IconButton
          onClick={() => setExpanded(!expanded)}
          sx={{
            alignSelf: "center",
            mb: 2,
            color: config.sidebarTextColor,
            borderRadius: "50%",
            transition: config.animateTransitions ? "all 0.2s ease" : "none",
            "&:hover": {
              backgroundColor: `${config.sidebarHoverColor}22`,
              color: config.sidebarHoverColor,
            },
          }}
        >
          {expanded ? <CloseIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
        </IconButton>
      )}

      {/* Divider */}
      <Box
        sx={{
          height: "1px",
          backgroundColor: `${config.sidebarTextColor}33`,
          width: "100%",
          mb: 2,
        }}
      />

      {/* Navigation List */}
      <List
        sx={{
          p: 0,
          px: 1.5,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 0.2,
        }}
      >
        {items.map((it) => {
          const isActive = loc.pathname === it.to;
          const showLabel = config.showLabels && shouldShowExpanded;
          const showIcon = config.showIcons;

          return (
            <Tooltip
              title={shouldShowExpanded || !showIcon ? "" : it.label}
              placement="right"
              key={it.to}
            >
              <ListItemButton
                component={Link}
                to={it.to}
                selected={isActive}
                sx={{
                  justifyContent: shouldShowExpanded ? "flex-start" : "center",
                  pl: shouldShowExpanded ? 2 : 1,
                  pr: shouldShowExpanded ? 2 : 1,
                  py: 1.25,
                  width: "100%",
                  minHeight: 44,
                  borderRadius: "10px",
                  transition: config.animateTransitions
                    ? "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                    : "none",
                  color: isActive ? config.sidebarActiveColor : config.sidebarTextColor,
                  backgroundColor: isActive ? config.sidebarActiveBgColor : "transparent",
                  fontWeight: isActive ? 600 : 500,
                  "&:hover": {
                    backgroundColor: isActive
                      ? config.sidebarActiveBgColor
                      : `${config.sidebarHoverColor}11`,
                    color: isActive ? config.sidebarActiveColor : config.sidebarHoverColor,
                  },
                }}
              >
                {showIcon && (
                  <ListItemIcon
                    sx={{
                      minWidth: shouldShowExpanded ? "auto" : 40,
                      width: shouldShowExpanded ? "auto" : 40,
                      color: "inherit",
                      mr: showLabel ? 1.5 : 0,
                      fontSize: 22,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {it.icon}
                  </ListItemIcon>
                )}
                {showLabel && (
                  <ListItemText
                    primary={it.label}
                    sx={{
                      m: 0,
                      fontSize: "0.875rem",
                      fontWeight: "inherit",
                      opacity: shouldShowExpanded ? 1 : 0,
                      transition: config.animateTransitions ? "opacity 0.2s ease" : "none",
                      "& .MuiTypography-root": {
                        fontSize: "inherit",
                        fontWeight: "inherit",
                        color: "inherit",
                        lineHeight: 1.4,
                        wordWrap: "break-word",
                        whiteSpace: "normal",
                      },
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      {/* Footer - Show Mode Indicator on Hover Mode */}
      {config.sidebarMode === "hover" && shouldShowExpanded && (
        <Box
          sx={{
            mt: "auto",
            pt: 2,
            borderTop: `1px solid ${config.sidebarTextColor}33`,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: `${config.sidebarTextColor}88`,
              textAlign: "center",
              display: "block",
              fontSize: "0.75rem",
            }}
          >
            Hover Mode Active
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Sidebar;
