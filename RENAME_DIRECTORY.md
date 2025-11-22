# 📁 Rename DB to Frontend

## ⚠️ Important: Directory Rename Required

All files have been updated to reference `Frontend` instead of `DB`, but the directory itself needs to be renamed manually.

## 🔧 Steps to Rename

1. **Close the `DB` folder in Cursor IDE** (if it's open)
   - Close any files from the DB directory
   - Close the folder in the file explorer

2. **Rename the directory** using one of these methods:

   **Option A: Using PowerShell**
   ```powershell
   cd "C:\Users\Ashhad Hassan\Videos\DB_PROJECT"
   Rename-Item -Path "DB" -NewName "Frontend"
   ```

   **Option B: Using File Explorer**
   - Navigate to `C:\Users\Ashhad Hassan\Videos\DB_PROJECT`
   - Right-click on the `DB` folder
   - Select "Rename"
   - Type `Frontend` and press Enter

3. **Reopen the folder in Cursor IDE**
   - The folder should now be named `Frontend`

## ✅ Verification

After renaming, verify the start script works:
```powershell
.\start-all.ps1
```

The script should now successfully start both backend and frontend servers.

## 🚀 Quick Start (After Rename)

Once the directory is renamed, you can start everything with:

```powershell
.\start-all.ps1
```

Or manually:

**Backend:**
```powershell
cd "C:\Users\Ashhad Hassan\Videos\DB_PROJECT\Blockscan-Backend-main"
npm start
```

**Frontend:**
```powershell
cd "C:\Users\Ashhad Hassan\Videos\DB_PROJECT\Frontend"
npm run dev
```

