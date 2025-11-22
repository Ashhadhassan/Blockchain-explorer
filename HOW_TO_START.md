# 🚀 How to Start Backend and Frontend

## Quick Start Steps

### Option 1: Automated Script (Easiest)
```powershell
.\start-all.ps1
```

### Option 2: Manual Start

#### Step 1: Start Backend
1. Open PowerShell or Terminal
2. Navigate to backend directory:
   ```powershell
   cd "C:\Users\Ashhad Hassan\Videos\DB_PROJECT\Blockscan-Backend-main"
   ```
3. Start the server:
   ```powershell
   npm start
   ```
4. Wait for: `✅ Connected to PostgreSQL` and `🚀 Server running on port 5000`

#### Step 2: Start Frontend
1. Open a **NEW** PowerShell or Terminal window
2. Navigate to frontend directory:
   ```powershell
   cd "C:\Users\Ashhad Hassan\Videos\DB_PROJECT\Frontend"
   ```
3. Start the development server:
   ```powershell
   npm run dev
   ```
4. Wait for: `ready started server on 0.0.0.0:3000`

#### Step 3: Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Prerequisites Check

Before starting, ensure:
- ✅ PostgreSQL is running
- ✅ Database `test` exists
- ✅ Environment variables are configured (`.env` and `.env.local`)

## Stopping Servers

Press `Ctrl + C` in each terminal window to stop the servers.

## Troubleshooting

- **Backend won't start**: Check PostgreSQL is running and `.env` file is correct
- **Frontend won't start**: Check backend is running and `.env.local` has correct API URL
- **Port already in use**: Stop any existing Node.js processes first

