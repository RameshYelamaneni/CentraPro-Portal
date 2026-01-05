import React, { useState, FC, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Grid,
  Tabs,
  Tab,
  Card,
  CardContent,
  Slider,
  MenuItem,
  Alert,
} from "@mui/material";
import {
  Palette,
  Notifications,
  Security,
  ViewSidebar,
  Save,
  RestartAlt,
} from "@mui/icons-material";

interface SettingsProps {
  user?: any;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Settings: FC<SettingsProps> = ({ user }) => {
  const [tabValue, setTabValue] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [generalSettings, setGeneralSettings] = useState({
    theme: "light",
    notifications: true,
    emailNotifications: true,
    workingHours: 8,
  });

  const [navConfig, setNavConfig] = useState({
    sidebarMode: "expanded", // "expanded" | "collapsed" | "hover"
    sidebarBgColor: "#1D1D1F",
    sidebarTextColor: "#FFFFFF",
    sidebarHoverColor: "#0071E3",
    sidebarActiveColor: "#0071E3",
    sidebarActiveBgColor: "rgba(0, 113, 227, 0.1)",
    sidebarWidth: 240,
    showIcons: true,
    showLabels: true,
    animateTransitions: true,
  });

  const [themeConfig, setThemeConfig] = useState({
    primaryColor: "#0071E3",
    secondaryColor: "#667eea",
    successColor: "#34C759",
    warningColor: "#FF9500",
    errorColor: "#FF3B30",
    backgroundColor: "#F5F5F7",
    cardRadius: 16,
    buttonRadius: 12,
    fontSize: 14,
  });

  // Load saved settings on mount
  useEffect(() => {
    const savedGeneral = localStorage.getItem("app_settings");
    const savedNav = localStorage.getItem("nav_config");
    const savedTheme = localStorage.getItem("theme_config");

    if (savedGeneral) setGeneralSettings(JSON.parse(savedGeneral));
    if (savedNav) setNavConfig(JSON.parse(savedNav));
    if (savedTheme) setThemeConfig(JSON.parse(savedTheme));
  }, []);

  const handleSaveGeneral = () => {
    localStorage.setItem("app_settings", JSON.stringify(generalSettings));
    showSuccess();
  };

  const handleSaveNavigation = () => {
    localStorage.setItem("nav_config", JSON.stringify(navConfig));
    showSuccess();
    // Trigger a custom event to update sidebar
    window.dispatchEvent(new CustomEvent("navConfigUpdated", { detail: navConfig }));
  };

  const handleSaveTheme = () => {
    localStorage.setItem("theme_config", JSON.stringify(themeConfig));
    showSuccess();
    // Apply theme changes
    document.documentElement.style.setProperty("--primary-color", themeConfig.primaryColor);
    document.documentElement.style.setProperty("--card-radius", `${themeConfig.cardRadius}px`);
  };

  const handleResetNavigation = () => {
    const defaultNav = {
      sidebarMode: "expanded",
      sidebarBgColor: "#1D1D1F",
      sidebarTextColor: "#FFFFFF",
      sidebarHoverColor: "#0071E3",
      sidebarActiveColor: "#0071E3",
      sidebarActiveBgColor: "rgba(0, 113, 227, 0.1)",
      sidebarWidth: 240,
      showIcons: true,
      showLabels: true,
      animateTransitions: true,
    };
    setNavConfig(defaultNav);
    localStorage.setItem("nav_config", JSON.stringify(defaultNav));
    window.dispatchEvent(new CustomEvent("navConfigUpdated", { detail: defaultNav }));
    showSuccess();
  };

  const showSuccess = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: "#1D1D1D", mb: 1 }}>
          Settings
        </Typography>
        <Typography variant="body2" sx={{ color: "#86868B" }}>
          Customize your CentraPro experience
        </Typography>
      </Box>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: "12px" }}>
          Settings saved successfully!
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ borderRadius: "16px", border: "1px solid #E5E5EA" }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            px: 2,
            borderBottom: "1px solid #E5E5EA",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 500,
              minHeight: 64,
            },
          }}
        >
          <Tab icon={<Palette />} iconPosition="start" label="General" />
          <Tab icon={<ViewSidebar />} iconPosition="start" label="Navigation & UI" />
          <Tab icon={<Notifications />} iconPosition="start" label="Notifications" />
          <Tab icon={<Security />} iconPosition="start" label="Security" />
        </Tabs>

        {/* General Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ px: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: "12px", border: "1px solid #E5E5EA" }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      Appearance
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      <TextField
                        select
                        label="Theme"
                        value={generalSettings.theme}
                        onChange={(e) =>
                          setGeneralSettings({ ...generalSettings, theme: e.target.value })
                        }
                        fullWidth
                      >
                        <MenuItem value="light">Light</MenuItem>
                        <MenuItem value="dark">Dark</MenuItem>
                        <MenuItem value="auto">Auto (System)</MenuItem>
                      </TextField>

                      <TextField
                        label="Working Hours Per Day"
                        type="number"
                        value={generalSettings.workingHours}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            workingHours: parseInt(e.target.value),
                          })
                        }
                        fullWidth
                        inputProps={{ min: 1, max: 24 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: "12px", border: "1px solid #E5E5EA" }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      Preferences
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={generalSettings.notifications}
                            onChange={(e) =>
                              setGeneralSettings({
                                ...generalSettings,
                                notifications: e.target.checked,
                              })
                            }
                            color="primary"
                          />
                        }
                        label="Desktop Notifications"
                      />

                      <FormControlLabel
                        control={
                          <Switch
                            checked={generalSettings.emailNotifications}
                            onChange={(e) =>
                              setGeneralSettings({
                                ...generalSettings,
                                emailNotifications: e.target.checked,
                              })
                            }
                            color="primary"
                          />
                        }
                        label="Email Notifications"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSaveGeneral}
                sx={{
                  bgcolor: "#0071E3",
                  borderRadius: "12px",
                  textTransform: "none",
                  px: 3,
                  py: 1.5,
                }}
              >
                Save General Settings
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {/* Navigation & UI Configuration Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ px: 3 }}>
            <Grid container spacing={3}>
              {/* Sidebar Behavior */}
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: "12px", border: "1px solid #E5E5EA" }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      Sidebar Behavior
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      <TextField
                        select
                        label="Sidebar Mode"
                        value={navConfig.sidebarMode}
                        onChange={(e) =>
                          setNavConfig({ ...navConfig, sidebarMode: e.target.value })
                        }
                        fullWidth
                        helperText="Choose how the sidebar behaves"
                      >
                        <MenuItem value="expanded">Always Expanded</MenuItem>
                        <MenuItem value="collapsed">Always Collapsed</MenuItem>
                        <MenuItem value="hover">Expand on Hover</MenuItem>
                      </TextField>

                      <Box>
                        <Typography variant="body2" sx={{ mb: 2, color: "#86868B" }}>
                          Sidebar Width: {navConfig.sidebarWidth}px
                        </Typography>
                        <Slider
                          value={navConfig.sidebarWidth}
                          onChange={(e, value) =>
                            setNavConfig({ ...navConfig, sidebarWidth: value as number })
                          }
                          min={200}
                          max={320}
                          step={10}
                          valueLabelDisplay="auto"
                        />
                      </Box>

                      <FormControlLabel
                        control={
                          <Switch
                            checked={navConfig.showIcons}
                            onChange={(e) =>
                              setNavConfig({ ...navConfig, showIcons: e.target.checked })
                            }
                          />
                        }
                        label="Show Icons"
                      />

                      <FormControlLabel
                        control={
                          <Switch
                            checked={navConfig.showLabels}
                            onChange={(e) =>
                              setNavConfig({ ...navConfig, showLabels: e.target.checked })
                            }
                          />
                        }
                        label="Show Labels"
                      />

                      <FormControlLabel
                        control={
                          <Switch
                            checked={navConfig.animateTransitions}
                            onChange={(e) =>
                              setNavConfig({ ...navConfig, animateTransitions: e.target.checked })
                            }
                          />
                        }
                        label="Animate Transitions"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Sidebar Colors */}
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: "12px", border: "1px solid #E5E5EA" }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      Sidebar Colors
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1, color: "#86868B" }}>
                          Background Color
                        </Typography>
                        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                          <input
                            type="color"
                            value={navConfig.sidebarBgColor}
                            onChange={(e) =>
                              setNavConfig({ ...navConfig, sidebarBgColor: e.target.value })
                            }
                            style={{ width: 60, height: 40, borderRadius: 8, cursor: "pointer" }}
                          />
                          <TextField
                            value={navConfig.sidebarBgColor}
                            onChange={(e) =>
                              setNavConfig({ ...navConfig, sidebarBgColor: e.target.value })
                            }
                            size="small"
                            fullWidth
                          />
                        </Box>
                      </Box>

                      <Box>
                        <Typography variant="body2" sx={{ mb: 1, color: "#86868B" }}>
                          Text Color
                        </Typography>
                        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                          <input
                            type="color"
                            value={navConfig.sidebarTextColor}
                            onChange={(e) =>
                              setNavConfig({ ...navConfig, sidebarTextColor: e.target.value })
                            }
                            style={{ width: 60, height: 40, borderRadius: 8, cursor: "pointer" }}
                          />
                          <TextField
                            value={navConfig.sidebarTextColor}
                            onChange={(e) =>
                              setNavConfig({ ...navConfig, sidebarTextColor: e.target.value })
                            }
                            size="small"
                            fullWidth
                          />
                        </Box>
                      </Box>

                      <Box>
                        <Typography variant="body2" sx={{ mb: 1, color: "#86868B" }}>
                          Hover Color
                        </Typography>
                        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                          <input
                            type="color"
                            value={navConfig.sidebarHoverColor}
                            onChange={(e) =>
                              setNavConfig({ ...navConfig, sidebarHoverColor: e.target.value })
                            }
                            style={{ width: 60, height: 40, borderRadius: 8, cursor: "pointer" }}
                          />
                          <TextField
                            value={navConfig.sidebarHoverColor}
                            onChange={(e) =>
                              setNavConfig({ ...navConfig, sidebarHoverColor: e.target.value })
                            }
                            size="small"
                            fullWidth
                          />
                        </Box>
                      </Box>

                      <Box>
                        <Typography variant="body2" sx={{ mb: 1, color: "#86868B" }}>
                          Active Item Color
                        </Typography>
                        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                          <input
                            type="color"
                            value={navConfig.sidebarActiveColor}
                            onChange={(e) =>
                              setNavConfig({ ...navConfig, sidebarActiveColor: e.target.value })
                            }
                            style={{ width: 60, height: 40, borderRadius: 8, cursor: "pointer" }}
                          />
                          <TextField
                            value={navConfig.sidebarActiveColor}
                            onChange={(e) =>
                              setNavConfig({ ...navConfig, sidebarActiveColor: e.target.value })
                            }
                            size="small"
                            fullWidth
                          />
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Theme Colors */}
              <Grid item xs={12}>
                <Card sx={{ borderRadius: "12px", border: "1px solid #E5E5EA" }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      Theme Colors
                    </Typography>
                    <Grid container spacing={2}>
                      {[
                        { key: "primaryColor", label: "Primary" },
                        { key: "secondaryColor", label: "Secondary" },
                        { key: "successColor", label: "Success" },
                        { key: "warningColor", label: "Warning" },
                        { key: "errorColor", label: "Error" },
                      ].map((colorItem) => (
                        <Grid item xs={12} sm={6} md={4} key={colorItem.key}>
                          <Box>
                            <Typography variant="body2" sx={{ mb: 1, color: "#86868B" }}>
                              {colorItem.label}
                            </Typography>
                            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                              <input
                                type="color"
                                value={themeConfig[colorItem.key as keyof typeof themeConfig] as string}
                                onChange={(e) =>
                                  setThemeConfig({ ...themeConfig, [colorItem.key]: e.target.value })
                                }
                                style={{ width: 50, height: 40, borderRadius: 8, cursor: "pointer" }}
                              />
                              <TextField
                                value={themeConfig[colorItem.key as keyof typeof themeConfig]}
                                onChange={(e) =>
                                  setThemeConfig({ ...themeConfig, [colorItem.key]: e.target.value })
                                }
                                size="small"
                                fullWidth
                              />
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
              <Button
                variant="outlined"
                startIcon={<RestartAlt />}
                onClick={handleResetNavigation}
                sx={{
                  borderRadius: "12px",
                  textTransform: "none",
                  px: 3,
                  py: 1.5,
                }}
              >
                Reset to Defaults
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={() => {
                  handleSaveNavigation();
                  handleSaveTheme();
                }}
                sx={{
                  bgcolor: "#0071E3",
                  borderRadius: "12px",
                  textTransform: "none",
                  px: 3,
                  py: 1.5,
                }}
              >
                Save Navigation & Theme
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ px: 3 }}>
            <Typography variant="body1" sx={{ color: "#86868B", mb: 2 }}>
              Configure how you receive notifications for different events
            </Typography>
            <Grid container spacing={2}>
              {[
                "Leave Requests",
                "Timesheet Approvals",
                "Employee Onboarding",
                "System Updates",
                "Invoice Reminders",
              ].map((item) => (
                <Grid item xs={12} key={item}>
                  <Card sx={{ borderRadius: "12px", border: "1px solid #E5E5EA" }}>
                    <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography>{item}</Typography>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <FormControlLabel control={<Switch defaultChecked />} label="Email" />
                        <FormControlLabel control={<Switch defaultChecked />} label="In-App" />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ px: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: "12px", border: "1px solid #E5E5EA" }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      Change Password
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <TextField label="Current Password" type="password" fullWidth />
                      <TextField label="New Password" type="password" fullWidth />
                      <TextField label="Confirm Password" type="password" fullWidth />
                      <Button variant="contained" color="warning" sx={{ borderRadius: "12px", textTransform: "none" }}>
                        Update Password
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: "12px", border: "1px solid #E5E5EA" }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      Security Options
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <FormControlLabel control={<Switch defaultChecked />} label="Two-Factor Authentication" />
                      <FormControlLabel control={<Switch />} label="Login Notifications" />
                      <FormControlLabel control={<Switch defaultChecked />} label="Session Timeout (30 min)" />
                      <Button variant="outlined" sx={{ borderRadius: "12px", textTransform: "none", mt: 2 }}>
                        View Login History
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Settings;
