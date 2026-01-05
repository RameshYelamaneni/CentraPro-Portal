# CentraPro - AI Coding Agent Instructions

## Project Overview

**CentraPro** is a full-stack employee management portal with timesheets, invoicing, onboarding, leave management, and RBAC. Built as a **demo/prototype application** with in-memory data persistence (resets on server restart).

**Architecture:**
- **Frontend:** React 18 + TypeScript + Vite + Material-UI (port 5173)
- **Backend:** Node.js + Express (port 4000)
- **Data:** In-memory arrays (no database) - see documentation for full API models
- **Auth:** JWT with hardcoded secret (`dev_secret_please_change`)

## Critical Development Patterns

### 1. Running the Application

**Always use TWO separate terminals:**

```powershell
# Terminal 1 - Server
cd server
npm start

# Terminal 2 - Client  
cd client
npm run dev
```

**Stop processes before restarting:**
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

The server is a **stub implementation** (`server/index.js` only ~36 lines). The extensive backend API described in documentation (ADMIN_CONSOLE_RBAC_IMPLEMENTATION.md, EMAIL_MANAGEMENT_GUIDE.md, etc.) represents planned/designed features, not current implementation.

### 2. API Communication Pattern

**Client-side API calls use direct fetch, not a centralized HTTP client:**

```typescript
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Pattern used throughout pages/
const res = await fetch(`${API_BASE}/api/endpoint`, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('app_token')
  },
  body: JSON.stringify(data)
});
```

**Note:** `client/src/utils/api.js` exports `API_BASE` and `apiFetch` helper, but most components use direct fetch.

### 3. Apple Design System (Critical UI Standards)

The entire UI follows Apple's design philosophy defined in `client/src/theme/appleTheme.ts`:

- **Colors:** Apple Blue (#0071E3), clean backgrounds (#F5F5F7), precise text colors (#1D1D1D, #86868B)
- **Typography:** System fonts (`-apple-system`), precise weights (600 for headings, 500 for buttons)
- **Buttons:** Pill-shaped (borderRadius: 1000px), padding: 10px 28px, no text transform
- **Spacing:** Generous whitespace, 16px/24px standard gaps
- **Transitions:** 0.2s cubic-bezier(0.4, 0, 0.2, 1)

**When adding/modifying UI components:**
- Import and use `appleTheme` from `client/src/theme/appleTheme.ts`
- Match existing component styling patterns (see AdminConsole.tsx, EmailManagement.tsx)
- Never use default MUI colors directly - use theme palette

### 4. Authentication & State Management

**User state stored in localStorage + React useState:**

```typescript
// Pattern from App.tsx
const [user, setUser] = useState<User | null>(() => {
  const stored = localStorage.getItem("app_user");
  return stored ? JSON.parse(stored) : null;
});

// Token stored separately
localStorage.setItem("app_token", token);
localStorage.setItem("app_user", JSON.stringify(user));
```

**Test accounts (hardcoded in stub server):**
- admin@example.com / Password123
- manager@example.com / manager123  
- user@example.com / Password123

### 5. Routing Structure

All routes defined in `client/src/App.tsx` with protected route pattern:

```typescript
<Route path="/*" element={
  user ? (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Topbar user={user} logout={logout} />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        {/* ... 15+ routes ... */}
      </Routes>
    </Box>
  ) : <Navigate to="/login" />
} />
```

**Available routes:** /dashboard, /employees, /onboarding, /timesheets, /leave, /approvals, /invoicing, /licensing, /email-templates, /email-management, /admin, /settings, /profile

### 6. Documentation-Driven Development

**Extensive markdown docs describe designed (not implemented) features:**

- `FEATURES.md` - Feature catalog with checkboxes (✅ = designed, not necessarily implemented)
- `ADMIN_CONSOLE_RBAC_IMPLEMENTATION.md` - Complete RBAC design (22 permissions, audit logs)
- `EMAIL_MANAGEMENT_GUIDE.md` - Multi-SMTP design with template system
- `APPLE_DESIGN_SYSTEM.md` - Complete UI specification
- `TESTING_GUIDE.md` - Test cases for all modules

**When implementing features:**
1. Check if design docs exist first
2. Follow documented data models exactly (especially for backend)
3. Update docs when implementation deviates from design
4. Mark incomplete features in FEATURE_STATUS_ROADMAP.md

### 7. Component Organization

**Page components are large monoliths (500-1000+ lines):**
- `AdminConsole.tsx` - 1150+ lines with 4-tab interface
- `EmailManagement.tsx` - 520+ lines with Outlook OAuth
- `Employees.tsx` - 756+ lines with CRUD + multi-tab forms

**Pattern:** Single-file pages with inline state management, no component splitting. When creating new features, follow this monolithic pattern unless complexity demands splitting.

### 8. Key File Locations

```
client/src/
  pages/          # 16 page components (Dashboard, Employees, etc.)
  components/     # Shared (Sidebar, Topbar, RightPanel)
  theme/          # appleTheme.ts - DO NOT MODIFY colors without review
  utils/          # api.js (API_BASE constant)

server/
  index.js        # Stub server (~36 lines)
  package.json    # Dependencies: express, cors, jwt, nodemailer, puppeteer, imap

*.md              # 15+ design/guide documents (source of truth for features)
```

### 9. Data Models (In-Memory Design)

Backend designed to use in-memory arrays for:
- **users[]** - { id, email, password (plaintext!), name, role }
- **employees[]** - Full schema in FEATURES.md
- **roles[]** - { id, name, displayName, permissions[], isSystem }
- **permissions[]** - 22 granular permissions (see ADMIN_CONSOLE_RBAC_IMPLEMENTATION.md)
- **auditLogs[]** - { userId, action, resource, timestamp, details }
- **invoices[]**, **timesheets[]**, **leaveRequests[]**, etc.

**Security note:** This is a DEMO - plaintext passwords, hardcoded JWT secret, no database, no production security measures.

### 10. Common Pitfalls

❌ **Don't assume backend APIs exist** - only `/api/test` and `/api/auth/login` are implemented  
❌ **Don't modify appleTheme.ts colors** without understanding the design system  
❌ **Don't create new HTTP clients** - use existing fetch pattern  
❌ **Don't split components prematurely** - follow monolithic page pattern  
❌ **Don't add real database** - this is intentionally in-memory  

✅ **Do check documentation first** before implementing features  
✅ **Do follow Apple design system strictly** for all UI work  
✅ **Do use TypeScript** for new client code (pages/*.tsx pattern)  
✅ **Do maintain backward compatibility** with localStorage auth pattern  

## Quick Start for New Features

1. **Check docs:** Look in FEATURES.md, FEATURE_STATUS_ROADMAP.md
2. **UI Design:** Reference APPLE_DESIGN_SYSTEM.md, existing pages for patterns
3. **Backend:** Add routes to `server/index.js`, follow in-memory data model from docs
4. **Frontend:** Create page in `client/src/pages/`, add route to App.tsx
5. **Testing:** Follow patterns in TESTING_GUIDE.md, test with demo accounts

## Environment Variables

```bash
# Client (.env in client/)
VITE_API_URL=http://localhost:4000  # Optional, defaults used

# Server (.env in server/)
PORT=4000
JWT_SECRET=dev_secret_please_change
```

## Troubleshooting

**Port conflicts:** Kill node processes before restarting  
**API errors:** Verify server is running on :4000  
**Auth issues:** Check localStorage for `app_token` and `app_user`  
**Style issues:** Verify appleTheme is imported and ThemeProvider wraps app  

For more context, reference the 15+ markdown documentation files in the root directory.
