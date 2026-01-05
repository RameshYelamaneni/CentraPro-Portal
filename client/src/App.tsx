import React, { useEffect, useState, FC } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { Container, Box } from "@mui/material";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Employees from "./pages/Employees";
import Timesheets from "./pages/Timesheets";
import Settings from "./pages/Settings";
import Invoicing from "./pages/Invoicing";
import Onboarding from "./pages/Onboarding";
import Leave from "./pages/Leave";
import Approvals from "./pages/Approvals";
import AdminConsole from "./pages/AdminConsole";
import TenantManagement from "./pages/TenantManagement";
import EmailManagement from "./pages/EmailManagement";
import EmailTemplates from "./pages/EmailTemplates";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";

interface User {
  id?: number;
  email?: string;
  name?: string;
}

function useAuthState(): [User | null, (user: User | null) => void] {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("app_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("app_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("app_user");
    }
  }, [user]);

  return [user, setUser];
}

const App: FC = () => {
  const [user, setUser] = useAuthState();
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("app_token");
    setUser(null);
    navigate("/login");
  }

  useEffect(() => {
    const token = localStorage.getItem("app_token");
    if (token && !user) {
      const url =
        (import.meta.env.VITE_API_URL || "http://localhost:4000") +
        "/api/auth/me";
      fetch(url, { headers: { Authorization: "Bearer " + token } })
        .then((r) => r.json())
        .then((data: any) => {
          if (!data.error) {
            setUser(data);
          } else {
            localStorage.removeItem("app_token");
          }
        })
        .catch(() => {});
    }
  }, []);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <LoginPage
            onLogin={(u: User, token: string) => {
              setUser(u);
              localStorage.setItem("app_token", token);
              navigate("/dashboard");
            }}
          />
        }
      />

      <Route
        path="/*"
        element={
          user ? (
            <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#FAFAFA" }}>
              <Sidebar />
              <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <Topbar user={user} logout={logout} />
                <Box component="main" sx={{ flex: 1, p: 3, overflow: "auto" }}>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard user={user} />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/employees" element={<Employees />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/timesheets" element={<Timesheets user={user} />} />
                    <Route path="/leave" element={<Leave />} />
                    <Route path="/approvals" element={<Approvals />} />
                    <Route path="/invoicing" element={<Invoicing user={user} />} />
                    <Route path="/licensing" element={<TenantManagement />} />
                    <Route path="/email-templates" element={<EmailTemplates />} />
                    <Route path="/email-management" element={<EmailManagement />} />
                    <Route path="/admin" element={<AdminConsole />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Box>
              </Box>
            </Box>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

export default App;
