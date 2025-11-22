# 🚀 Startup Guide - Blockchain Explorer

Complete guide to start the frontend and backend applications.

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ Node.js installed (v18 or higher)
- ✅ PostgreSQL installed and running
- ✅ Database `test` created
- ✅ All dependencies installed (`npm install` in both folders)

## 🗄️ Database Setup

1. **Start PostgreSQL Service:**
   - Open Services (press `Win + R`, type `services.msc`)
   - Find "PostgreSQL" service
   - Right-click → Start (if not running)

2. **Verify Database:**
   - Database name: `test`
   - Port: `5432`
   - User: `postgres`
   - Password: `ashhad12`

## 🔧 Backend Setup

### Step 1: Navigate to Backend Directory
```powershell
cd "C:\Users\Ashhad Hassan\Videos\DB_PROJECT\Blockscan-Backend-main"
```

### Step 2: Install Dependencies (First Time Only)
```powershell
npm install
```

### Step 3: Check Environment Variables
Ensure `.env` file exists with:
```
PORT=5000
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=ashhad12
PG_DATABASE=test
```

### Step 4: Start Backend Server
```powershell
npm start
```

### ✅ Expected Output:
```
[dotenv] injecting env...
Loaded ENV: { host: 'localhost', port: '5432', user: 'postgres', database: 'test' }
✅ Connected to PostgreSQL
🚀 Server running on port 5000
```

### 🌐 Backend URL:
- **API Base URL:** http://localhost:5000
- **Health Check:** http://localhost:5000/

## 🎨 Frontend Setup

### Step 1: Navigate to Frontend Directory
```powershell
cd "C:\Users\Ashhad Hassan\Videos\DB_PROJECT\DB"
```

### Step 2: Install Dependencies (First Time Only)
```powershell
npm install
```

### Step 3: Check Environment Variables
Create `.env.local` file (if not exists) with:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Step 4: Start Frontend Development Server
```powershell
npm run dev
```

### ✅ Expected Output:
```
▲ Next.js 16.0.3
- Local:        http://localhost:3000
- ready started server on 0.0.0.0:3000
```

### 🌐 Frontend URL:
- **Application:** http://localhost:3000
- **Login Page:** http://localhost:3000/login
- **Dashboard:** http://localhost:3000/dashboard

## 🚀 Quick Start (Both Servers)

### Option 1: Manual Start (Two Windows)

**Window 1 - Backend:**
```powershell
cd "C:\Users\Ashhad Hassan\Videos\DB_PROJECT\Blockscan-Backend-main"
npm start
```

**Window 2 - Frontend:**
```powershell
cd "C:\Users\Ashhad Hassan\Videos\DB_PROJECT\DB"
npm run dev
```

### Option 2: PowerShell Script (Automated)

Create a file `start-all.ps1` in the project root:

```powershell
# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Ashhad Hassan\Videos\DB_PROJECT\Blockscan-Backend-main'; Write-Host '🚀 Backend Starting...' -ForegroundColor Green; npm start"

Start-Sleep -Seconds 3

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Ashhad Hassan\Videos\DB_PROJECT\DB'; Write-Host '🎨 Frontend Starting...' -ForegroundColor Cyan; npm run dev"

Write-Host "`n✅ Both servers are starting in separate windows!" -ForegroundColor Green
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000`n" -ForegroundColor Cyan
```

Run it:
```powershell
.\start-all.ps1
```

## 🔍 Verification Steps

### 1. Check Backend is Running
Open browser: http://localhost:5000
- Should see: `SolScan Backend Running...`

### 2. Check Frontend is Running
Open browser: http://localhost:3000
- Should see: Login page or Dashboard

### 3. Test API Connection
Open browser: http://localhost:5000/api/p2p/users-with-tokens
- Should return JSON with users and tokens

## 👤 Login Credentials

Use any user from `DUMMY_USERS_DOCUMENTATION.md`:
- **Email:** Any email from the documentation
- **Password:** `password123`

Example:
- Email: `charlie.investor@example.com`
- Password: `password123`

## 🛑 Stopping Servers

### Stop Backend:
- Press `Ctrl + C` in the backend PowerShell window
- Or close the window

### Stop Frontend:
- Press `Ctrl + C` in the frontend PowerShell window
- Or close the window

### Stop All Node Processes:
```powershell
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
```

## 🐛 Troubleshooting

### Backend Won't Start

**Issue:** `Cannot connect to PostgreSQL`
- **Solution:** Start PostgreSQL service
- Check `.env` file has correct credentials
- Verify database `test` exists

**Issue:** `Port 5000 already in use`
- **Solution:** 
  ```powershell
  netstat -ano | findstr :5000
  # Find PID and kill it
  taskkill /PID <PID> /F
  ```

**Issue:** `Module not found`
- **Solution:** Run `npm install` in backend directory

### Frontend Won't Start

**Issue:** `Port 3000 already in use`
- **Solution:**
  ```powershell
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

**Issue:** `Cannot connect to backend`
- **Solution:** 
  - Ensure backend is running on port 5000
  - Check `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:5000`
  - Restart frontend after backend is running

**Issue:** `Module not found`
- **Solution:** Run `npm install` in frontend directory

### P2P Page Shows Empty

**Issue:** No users showing
- **Solution:** Run token holdings seed script:
  ```powershell
  cd "C:\Users\Ashhad Hassan\Videos\DB_PROJECT\Blockscan-Backend-main"
  node seed-token-holdings.js
  ```

## 📝 Important Notes

1. **Start Order:** Always start backend BEFORE frontend
2. **Wait Time:** Wait 5-10 seconds after backend starts before starting frontend
3. **Database:** PostgreSQL must be running before starting backend
4. **Ports:** 
   - Backend uses port `5000`
   - Frontend uses port `3000`
   - Make sure these ports are not in use by other applications

## 🎯 Quick Reference

| Service | Port | URL | Command |
|---------|------|-----|---------|
| Backend | 5000 | http://localhost:5000 | `npm start` |
| Frontend | 3000 | http://localhost:3000 | `npm run dev` |
| Database | 5432 | localhost:5432 | PostgreSQL Service |

## 📞 Support

If you encounter issues:
1. Check the PowerShell windows for error messages
2. Verify PostgreSQL is running
3. Check that ports 5000 and 3000 are available
4. Ensure all dependencies are installed (`npm install`)
5. Review the error messages in the console

---

**Last Updated:** November 2025
**Version:** 1.0

