CentraPro - Timesheet & Invoice Management
============================================

This is a full-stack application for managing employee timesheets and generating invoices.

**Features:**
- Employee timesheet submission with weekly views
- Automatic invoice generation based on completed timesheets
- Invoice management with PDF download and email sending
- Apple-inspired modern UI
- JWT-based authentication
- Real-time data synchronization

**Tech Stack:**
- Frontend: React 18 + TypeScript + Vite + Material-UI (MUI)
- Backend: Node.js + Express
- Styling: MUI Theme System + CSS

**Sample users:**
- admin@example.com / Password123 (admin)
- manager@example.com / Password123 (manager)
- user@example.com / Password123 (user)

**How to run (two terminals):**

1) Start server:
   ```bash
   cd server
   npm install
   npm start
   ```
   (server will run on http://localhost:4000)

2) Start client:
   ```bash
   cd client
   npm install
   npm run dev
   ```
   (Vite dev server will run on http://localhost:5173)

**Notes:**
- This is a demo app with in-memory data persistence (data resets on server restart).
- Passwords are stored in plaintext for demo use only.
- JWT secret is hardcoded in server/index.js for demo purposes.
- Invoice configuration can be set in Settings page.

