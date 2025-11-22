# ⚡ Quick Start Guide

## 🚀 Start Everything (Easiest Way)

Run the automated script:
```powershell
.\start-all.ps1
```

This will start both backend and frontend in separate windows automatically.

## 📝 Manual Start

### 1️⃣ Start Backend (Window 1)
```powershell
cd "C:\Users\Ashhad Hassan\Videos\DB_PROJECT\Blockscan-Backend-main"
npm start
```

Wait for: `🚀 Server running on port 5000`

### 2️⃣ Start Frontend (Window 2)
```powershell
cd "C:\Users\Ashhad Hassan\Videos\DB_PROJECT\Frontend"
npm run dev
```

Wait for: `ready started server on 0.0.0.0:3000`

### 3️⃣ Open Browser
Go to: **http://localhost:3000**

## 🔑 Login
- **Email:** `charlie.investor@example.com` (or any from DUMMY_USERS_DOCUMENTATION.md)
- **Password:** `password123`

## ✅ Verify It's Working

1. Backend: http://localhost:5000 → Should show "SolScan Backend Running..."
2. Frontend: http://localhost:3000 → Should show login page
3. P2P Page: After login, go to P2P Trading → Should show users with tokens

## 🛑 Stop Servers
Press `Ctrl + C` in each PowerShell window, or close the windows.

## ⚠️ Troubleshooting

**Backend won't start?**
- Check PostgreSQL is running
- Verify `.env` file has correct password: `ashhad12`

**Frontend can't connect?**
- Make sure backend is running first
- Check `.env.local` has: `NEXT_PUBLIC_API_URL=http://localhost:5000`

**P2P page empty?**
- Run: `cd Blockscan-Backend-main && node seed-token-holdings.js`

---

For detailed instructions, see **STARTUP_GUIDE.md**

