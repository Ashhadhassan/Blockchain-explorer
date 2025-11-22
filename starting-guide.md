# 🚀 Starting Guide - Blockchain Explorer

Complete guide to get the Blockchain Explorer up and running.

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ **Node.js** installed (v18 or higher)
- ✅ **PostgreSQL** installed and running (version 18 recommended)
- ✅ **npm** or **yarn** package manager
- ✅ **PowerShell** (for Windows automation scripts)

---

## 🗄️ Database Setup

### Step 1: Start PostgreSQL Service

**Windows:**
1. Press `Win + R`, type `services.msc`, and press Enter
2. Find "PostgreSQL" service (may be named `postgresql-x64-18` or similar)
3. Right-click → **Start** (if not running)

**Command Line (Run as Administrator):**
```powershell
# Find PostgreSQL service
Get-Service | Where-Object {$_.Name -like "*postgres*"}

# Start it (replace with actual service name)
net start postgresql-x64-18
# or
Start-Service postgresql-x64-18
```

### Step 2: Verify Database Configuration

**Database Details:**
- **Database name:** `test`
- **Port:** `5432`
- **User:** `postgres`
- **Password:** `ashhad12` (or your configured password)

### Step 3: Create Database (If Needed)

If the database doesn't exist:

1. **Using pgAdmin:**
   - Open pgAdmin
   - Connect to PostgreSQL server
   - Right-click "Databases" → "Create" → "Database"
   - Name: `test`
   - Click "Save"

2. **Using Command Line:**
   ```bash
   psql -U postgres
   CREATE DATABASE test;
   \q
   ```

### Step 4: Fix Database Password (If Needed)

If you get connection errors, the password might not match:

**Option 1: Update .env File**
Edit `Blockscan-Backend-main/.env` and set:
```env
PG_PASSWORD=your_actual_password
```

**Option 2: Reset PostgreSQL Password via pgAdmin**
1. Open **pgAdmin**
2. Connect to PostgreSQL server
3. Right-click "Login/Group Roles" → "postgres" → "Properties"
4. Go to "Definition" tab
5. Enter new password: `ashhad12`
6. Click "Save"

**Option 3: Command Line (Run as Administrator)**
```bash
cd "C:\Program Files\PostgreSQL\18\bin"
psql -U postgres
ALTER USER postgres WITH PASSWORD 'ashhad12';
\q
```

**Option 4: Create New User (Alternative)**
If you can't reset postgres password, create a new user:
```sql
CREATE USER dbuser WITH PASSWORD 'ashhad12';
ALTER USER dbuser CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE test TO dbuser;
```
Then update `.env`:
```env
PG_USER=dbuser
PG_PASSWORD=ashhad12
```

### Step 5: Run Database Schema

Navigate to backend directory and run:
```bash
cd Blockscan-Backend-main
psql -U postgres -d test -f database-schema.sql
```

Or use pgAdmin Query Tool to execute `database-schema.sql`.

---

## 🔧 Backend Setup

### Step 1: Navigate to Backend Directory
```powershell
cd "C:\Users\Ashhad Hassan\Videos\DB_PROJECT\Blockscan-Backend-main"
```

### Step 2: Install Dependencies
```powershell
npm install
```

### Step 3: Configure Environment Variables

Create or edit `.env` file with:
```env
PORT=5000
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=ashhad12
PG_DATABASE=test
```

### Step 4: Verify Database Connection
```powershell
node check-db.js
```

Expected output: `✅ Connected to PostgreSQL`

### Step 5: Seed Dummy Data (Optional)

Create dummy users:
```powershell
node generate-dummy-users.js
```

Seed token holdings:
```powershell
node seed-token-holdings.js
```

### Step 6: Start Backend Server
```powershell
npm start
```

**✅ Expected Output:**
```
[dotenv] injecting env...
Loaded ENV: { host: 'localhost', port: '5432', user: 'postgres', database: 'test' }
✅ Connected to PostgreSQL
🚀 Server running on port 5000
```

**🌐 Backend URL:** http://localhost:5000

---

## 🎨 Frontend Setup

### Step 1: Navigate to Frontend Directory
```powershell
cd "C:\Users\Ashhad Hassan\Videos\DB_PROJECT\Frontend"
```

### Step 2: Install Dependencies
```powershell
npm install
```

### Step 3: Configure Environment Variables

Create or edit `.env.local` file with:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Step 4: Start Frontend Development Server
```powershell
npm run dev
```

**✅ Expected Output:**
```
▲ Next.js 16.0.3
- Local:        http://localhost:3000
- ready started server on 0.0.0.0:3000
```

**🌐 Frontend URL:** http://localhost:3000

---

## 🚀 Quick Start (Both Servers)

### Option 1: Automated Script (Recommended)

Run the PowerShell script from project root:
```powershell
.\start-all.ps1
```

This will:
- Check PostgreSQL connection
- Start backend in a new window
- Wait 5 seconds
- Start frontend in a new window
- Display access URLs and login credentials

### Option 2: Manual Start (Two Windows)

**Window 1 - Backend:**
```powershell
cd "C:\Users\Ashhad Hassan\Videos\DB_PROJECT\Blockscan-Backend-main"
npm start
```

**Window 2 - Frontend:**
```powershell
cd "C:\Users\Ashhad Hassan\Videos\DB_PROJECT\Frontend"
npm run dev
```

**⚠️ Important:** Always start backend BEFORE frontend, and wait 5-10 seconds after backend starts.

---

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

### 4. Test Database Connection
```powershell
cd Blockscan-Backend-main
node check-db.js
```

---

## 👤 Login Credentials

### Default Test Users

**Password for ALL users:** `password123`

**Quick Test Users:**
- **Email:** `charlie.investor@example.com`
- **Email:** `alice.crypto@example.com`
- **Email:** `bob.trader@example.com`
- **Email:** `ivan.seller@example.com`
- **Email:** `helen.buyer@example.com`

**Complete List:** See `DUMMY_USERS_DOCUMENTATION.md` for all 20 test users.

### Login Steps

1. Navigate to: http://localhost:3000/login
2. Enter any email from the test users list
3. Enter password: `password123`
4. Click "Sign in"

**Note:** All test users are pre-verified and ready to use immediately.

---

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

---

## 🐛 Troubleshooting

### Backend Won't Start

**Issue:** `Cannot connect to PostgreSQL`
- **Solution:** 
  - Start PostgreSQL service (see Database Setup)
  - Check `.env` file has correct credentials
  - Verify database `test` exists
  - Run `node check-db.js` to diagnose

**Issue:** `Port 5000 already in use`
- **Solution:**
  ```powershell
  netstat -ano | findstr :5000
  # Find PID and kill it
  taskkill /PID <PID> /F
  ```

**Issue:** `Module not found`
- **Solution:** Run `npm install` in backend directory

**Issue:** `ECONNREFUSED`
- **Solution:** PostgreSQL service is not running - start it first

**Issue:** `28P01` (authentication failed)
- **Solution:** Password mismatch - update `.env` or reset PostgreSQL password

**Issue:** `3D000` (database does not exist)
- **Solution:** Create database: `CREATE DATABASE test;`

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
  - Wait 10 seconds after backend starts

**Issue:** `Module not found`
- **Solution:** Run `npm install` in frontend directory

### P2P Page Shows Empty

**Issue:** No users showing
- **Solution:** Run token holdings seed script:
  ```powershell
  cd "C:\Users\Ashhad Hassan\Videos\DB_PROJECT\Blockscan-Backend-main"
  node seed-token-holdings.js
  ```

### Database Connection Issues

**Issue:** Connection refused
- **Solution:** 
  1. Check PostgreSQL service is running
  2. Verify port 5432 is not blocked
  3. Check firewall settings

**Issue:** Wrong password
- **Solution:**
  1. Update `.env` file with correct password
  2. Or reset PostgreSQL password (see Database Setup)

**Issue:** Database doesn't exist
- **Solution:**
  ```sql
  CREATE DATABASE test;
  ```

---

## 📝 Important Notes

1. **Start Order:** Always start backend BEFORE frontend
2. **Wait Time:** Wait 5-10 seconds after backend starts before starting frontend
3. **Database:** PostgreSQL must be running before starting backend
4. **Ports:**
   - Backend uses port `5000`
   - Frontend uses port `3000`
   - Database uses port `5432`
   - Make sure these ports are not in use by other applications
5. **Environment Files:**
   - Backend: `Blockscan-Backend-main/.env`
   - Frontend: `Frontend/.env.local`
6. **Dummy Data:** Run seed scripts after creating database schema for testing

---

## 🎯 Quick Reference

| Service | Port | URL | Command |
|---------|------|-----|---------|
| Backend | 5000 | http://localhost:5000 | `npm start` |
| Frontend | 3000 | http://localhost:3000 | `npm run dev` |
| Database | 5432 | localhost:5432 | PostgreSQL Service |

---

## 📞 Support

If you encounter issues:
1. Check the PowerShell windows for error messages
2. Verify PostgreSQL is running
3. Check that ports 5000 and 3000 are available
4. Ensure all dependencies are installed (`npm install`)
5. Review the error messages in the console
6. Check `.env` and `.env.local` files have correct values
7. Run `node check-db.js` to verify database connection

---

**Last Updated:** January 2025  
**Version:** 1.0
