import React, { useState, FC, FormEvent } from "react";
import {
  Button,
  TextField,
  Box,
  Typography,
  Paper,
  Container,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  Link,
  Divider,
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";

interface LoginPageProps {
  onLogin: (user: any, token: string) => void;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

const LoginPage: FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(API_BASE + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();

      if (json.token) {
        onLogin(json.user, json.token);
      } else {
        setError(json.error || "Login failed");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative Background Elements */}
      <Box
        sx={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.1)",
          filter: "blur(100px)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-10%",
          left: "-5%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.1)",
          filter: "blur(80px)",
        }}
      />

      <Container maxWidth="sm">
        <Card
          sx={{
            borderRadius: "24px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            overflow: "hidden",
            backdropFilter: "blur(10px)",
            background: "rgba(255, 255, 255, 0.95)",
          }}
        >
          <CardContent sx={{ p: 5 }}>
            {/* Logo Section */}
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Box
                component="img"
                src="/centrapro-logo-new.png"
                alt="CentraPro"
                sx={{
                  height: 80,
                  mb: 3,
                  filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
                }}
              />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: "#1D1D1D",
                  mb: 1,
                }}
              >
                Welcome Back
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#86868B",
                }}
              >
                Sign in to your CentraPro account
              </Typography>
            </Box>

            {/* Login Form */}
            <form onSubmit={submit}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="outlined"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: "#86868B" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      bgcolor: "#F5F5F7",
                      "& fieldset": {
                        borderColor: "transparent",
                      },
                      "&:hover fieldset": {
                        borderColor: "#667eea",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#667eea",
                      },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="outlined"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: "#86868B" }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      bgcolor: "#F5F5F7",
                      "& fieldset": {
                        borderColor: "transparent",
                      },
                      "&:hover fieldset": {
                        borderColor: "#667eea",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#667eea",
                      },
                    },
                  }}
                />

                {error && (
                  <Typography
                    color="error"
                    sx={{
                      fontSize: "0.875rem",
                      textAlign: "center",
                      p: 1.5,
                      bgcolor: "#FEE",
                      borderRadius: "8px",
                    }}
                  >
                    {error}
                  </Typography>
                )}

                <Box sx={{ textAlign: "right" }}>
                  <Link
                    href="#"
                    sx={{
                      color: "#667eea",
                      textDecoration: "none",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    Forgot Password?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  fullWidth
                  sx={{
                    py: 1.8,
                    borderRadius: "12px",
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                      boxShadow: "0 6px 20px rgba(102, 126, 234, 0.5)",
                    },
                    "&:disabled": {
                      background: "#E5E5EA",
                      color: "#86868B",
                    },
                  }}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>

                <Divider sx={{ my: 1 }}>
                  <Typography variant="body2" sx={{ color: "#86868B" }}>
                    Quick Access
                  </Typography>
                </Divider>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setEmail("admin@example.com");
                      setPassword("Password123");
                    }}
                    fullWidth
                    sx={{
                      py: 1.2,
                      borderRadius: "10px",
                      textTransform: "none",
                      borderColor: "#E5E5EA",
                      color: "#667eea",
                      fontWeight: 500,
                      "&:hover": {
                        borderColor: "#667eea",
                        bgcolor: "rgba(102, 126, 234, 0.05)",
                      },
                    }}
                  >
                    Admin Demo
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setEmail("user@example.com");
                      setPassword("Password123");
                    }}
                    fullWidth
                    sx={{
                      py: 1.2,
                      borderRadius: "10px",
                      textTransform: "none",
                      borderColor: "#E5E5EA",
                      color: "#667eea",
                      fontWeight: 500,
                      "&:hover": {
                        borderColor: "#667eea",
                        bgcolor: "rgba(102, 126, 234, 0.05)",
                      },
                    }}
                  >
                    User Demo
                  </Button>
                </Box>
              </Box>
            </form>

            {/* Footer */}
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Typography variant="body2" sx={{ color: "#86868B" }}>
                © 2024 CentraPro. All rights reserved.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginPage;
