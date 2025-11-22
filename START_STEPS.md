# 🚀 Steps to Start Backend and Frontend

## ⚠️ Prerequisites
- PostgreSQL must be running
- Database `test` must exist

## 📝 Quick Start Steps

### Step 1: Rename Directory (One-time only)
If you haven't already, rename `DB` folder to `Frontend`:
```powershell
cd "C:\Users\Ashhad Hassan\Videos\DB_PROJECT"
Rename-Item -Path "DB" -NewName "Frontend"
```

### Step 2: Start Backend
Open PowerShell and run:
```powershell
cd "C:\Users\Ashhad Hassan\Videos\DB_PROJECT\Blockscan-Backend-main"
npm start
```

**Wait for:** `🚀 Server running on port 5000`

### Step 3: Start Frontend
Open a **NEW** PowerShell window and run:
```powershell
cd "C:\Users\Ashhad Hassan\Videos\DB_PROJECT\Frontend"
npm run dev
```

**Wait for:** `ready started server on 0.0.0.0:3000`

### Step 4: Access Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

## 🔄 Alternative: Use Start Script

After renaming the directory, you can use the automated script:
```powershell
cd "C:\Users\Ashhad Hassan\Videos\DB_PROJECT"
.\start-all.ps1
```

This will start both servers automatically in separate windows.

## 🛑 To Stop Servers
Press `Ctrl + C` in each PowerShell window.

## 🔑 Login Credentials
- **Email:** Any from `DUMMY_USERS_DOCUMENTATION.md`
- **Password:** `password123`

