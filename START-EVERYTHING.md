# Quick Start Guide

## Current Status
- ✅ Backend Server: Running on http://localhost:5000
- ✅ Frontend Server: Running on http://localhost:3000  
- ✅ PostgreSQL: Installed and Running
- ❌ Database Connection: Needs password fix

## Fix Database Password (Choose One)

### Option 1: Automated Script (Recommended)
1. Navigate to: `Blockscan-Backend-main\`
2. **Right-click** `fix-password.ps1`
3. Select **"Run with PowerShell"** (as Administrator)
4. Wait for it to complete
5. Done! Password is now `1234`

### Option 2: pgAdmin (Manual)
1. Open **pgAdmin** from Start menu
2. Connect to PostgreSQL server (enter your current password)
3. Click **Tools** → **Query Tool**
4. Run this SQL:
   ```sql
   ALTER USER postgres WITH PASSWORD '1234';
   ```
5. Click **Execute** (F5)
6. Done!

### Option 3: Update .env File
If you know your PostgreSQL password:
1. Edit `Blockscan-Backend-main\.env`
2. Change `PG_PASSWORD=1234` to your actual password
3. Save and restart backend

## After Fixing Password

1. Test connection:
   ```bash
   cd Blockscan-Backend-main
   node check-db.js
   ```

2. Create database (if needed):
   ```sql
   CREATE DATABASE test;
   ```

3. Both servers should auto-connect!

## Access Your Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Troubleshooting

If servers aren't running:
```bash
# Backend
cd Blockscan-Backend-main
npm start

# Frontend (new terminal)
cd DB
npm run dev
```

