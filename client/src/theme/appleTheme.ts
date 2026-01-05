import { createTheme } from "@mui/material/styles";

const appleTheme = createTheme({
  palette: {
    primary: {
      main: "#0071E3", // Apple Blue
      light: "#E7F3FF",
      dark: "#0051BA",
    },
    secondary: {
      main: "#A2845E", // Apple Bronze
      light: "#F5F5F7",
    },
    success: {
      main: "#34C759", // Apple Green
      light: "#E8F5E9",
    },
    warning: {
      main: "#FF9500", // Apple Orange
      light: "#FFF3E0",
    },
    error: {
      main: "#FF3B30", // Apple Red
      light: "#FFEBEE",
    },
    background: {
      default: "#FFFFFF",
      paper: "#F5F5F7",
    },
    text: {
      primary: "#1D1D1D",
      secondary: "#86868B",
      disabled: "#A2A2A7",
    },
    divider: "#E5E5EA",
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    h1: {
      fontSize: "3.5rem",
      fontWeight: 700,
      letterSpacing: "-0.5px",
      lineHeight: 1.1,
    },
    h2: {
      fontSize: "2.5rem",
      fontWeight: 700,
      letterSpacing: "-0.3px",
      lineHeight: 1.2,
    },
    h3: {
      fontSize: "2rem",
      fontWeight: 600,
      letterSpacing: "-0.2px",
      lineHeight: 1.3,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      letterSpacing: "-0.1px",
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      letterSpacing: "-0.05px",
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
      letterSpacing: "0px",
    },
    body1: {
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: "-0.01em",
    },
    body2: {
      fontSize: "0.9375rem",
      fontWeight: 400,
      lineHeight: 1.5,
    },
    subtitle1: {
      fontSize: "0.9375rem",
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: "0.8125rem",
      fontWeight: 500,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: "0.75rem",
      fontWeight: 400,
      lineHeight: 1.4,
      letterSpacing: "-0.01em",
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
      letterSpacing: "-0.01em",
      fontSize: "1rem",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "1000px",
          textTransform: "none",
          fontWeight: 500,
          fontSize: "1rem",
          padding: "10px 28px",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        contained: {
          backgroundColor: "#0071E3",
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: "#0051BA",
          },
          "&:active": {
            backgroundColor: "#003A8C",
          },
        },
        outlined: {
          borderColor: "#E5E5EA",
          color: "#1D1D1D",
          borderWidth: "1px",
          "&:hover": {
            backgroundColor: "transparent",
            borderColor: "#0071E3",
            color: "#0071E3",
          },
        },
        text: {
          color: "#0071E3",
          "&:hover": {
            backgroundColor: "transparent",
            opacity: 0.7,
          },
        },
        sizeSmall: {
          padding: "6px 16px",
          fontSize: "0.875rem",
        },
        sizeLarge: {
          padding: "12px 36px",
          fontSize: "1.125rem",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          color: "#1D1D1D",
          borderRadius: "50%",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
          "&:active": {
            backgroundColor: "rgba(0, 0, 0, 0.08)",
          },
        },
        colorPrimary: {
          color: "#0071E3",
          "&:hover": {
            backgroundColor: "rgba(0, 113, 227, 0.1)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          borderRadius: "18px",
          border: "1px solid #E5E5EA",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
          transition: "all 0.2s ease",
        },
        elevation0: {
          boxShadow: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "18px",
          border: "1px solid #E5E5EA",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: "999px",
          fontWeight: 500,
          fontSize: "0.875rem",
          border: "1px solid #E5E5EA",
        },
        filled: {
          backgroundColor: "#F5F5F7",
        },
        colorPrimary: {
          backgroundColor: "#E7F3FF",
          color: "#0071E3",
          border: "1px solid #B8D9FF",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            backgroundColor: "#F5F5F7",
            border: "1px solid #E5E5EA",
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: "#D2D2D7",
            },
            "&.Mui-focused": {
              backgroundColor: "#FFFFFF",
              borderColor: "#0071E3",
              boxShadow: "0 0 0 3px rgba(0, 113, 227, 0.1)",
            },
          },
          "& .MuiOutlinedInput-input": {
            fontSize: "1rem",
            fontWeight: 400,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          backgroundColor: "#F5F5F7",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#D2D2D7",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#0071E3",
            boxShadow: "0 0 0 3px rgba(0, 113, 227, 0.1)",
          },
        },
        notchedOutline: {
          borderColor: "#E5E5EA",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "20px",
          border: "1px solid #E5E5EA",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.12)",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-head": {
            backgroundColor: "#F5F5F7",
            color: "#1D1D1D",
            fontWeight: 600,
            fontSize: "0.875rem",
            borderColor: "#E5E5EA",
            borderBottom: "1px solid #E5E5EA",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: "#E5E5EA",
          fontSize: "0.9375rem",
          padding: "16px 12px",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: "background-color 0.2s ease",
          "&:hover": {
            backgroundColor: "#F5F5F7",
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          marginBottom: "4px",
          transition: "all 0.2s ease",
          color: "#1D1D1D",
          "&:hover": {
            backgroundColor: "rgba(0, 113, 227, 0.06)",
            color: "#0071E3",
          },
          "&.Mui-selected": {
            backgroundColor: "rgba(0, 113, 227, 0.1)",
            color: "#0071E3",
            fontWeight: 600,
            "&:hover": {
              backgroundColor: "rgba(0, 113, 227, 0.15)",
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
          boxShadow: "none",
          color: "#1D1D1D",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#FFFFFF",
          borderRight: "1px solid #E5E5EA",
          boxShadow: "none",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: "#E5E5EA",
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          backgroundColor: "#FF3B30",
          color: "#FFFFFF",
          fontWeight: 600,
          fontSize: "0.75rem",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          fontSize: "0.9375rem",
          fontWeight: 500,
          border: "1px solid",
        },
        standardSuccess: {
          backgroundColor: "#F0FFF4",
          borderColor: "#34C759",
          color: "#1D1D1D",
        },
        standardError: {
          backgroundColor: "#FFF5F5",
          borderColor: "#FF3B30",
          color: "#1D1D1D",
        },
        standardWarning: {
          backgroundColor: "#FFFAF0",
          borderColor: "#FF9500",
          color: "#1D1D1D",
        },
        standardInfo: {
          backgroundColor: "#F0F9FF",
          borderColor: "#0071E3",
          color: "#1D1D1D",
        },
      },
    },
  },
});

export default appleTheme;
