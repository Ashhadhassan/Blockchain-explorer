# How to View Your Database Data

Your PostgreSQL database is running locally and contains all your blockchain explorer data.

## Database Connection Information

- **Host:** localhost
- **Port:** 5432
- **Database Name:** blockscan
- **Username:** postgres
- **Password:** ashhad12

---

## Method 1: Using pgAdmin (Recommended - GUI Tool)

### Step 1: Open pgAdmin
1. Search for "pgAdmin" in Windows Start Menu
2. Open pgAdmin 4

### Step 2: Connect to Server
1. Right-click on "Servers" in the left panel
2. Select "Create" → "Server"
3. In the "General" tab:
   - **Name:** Local PostgreSQL (or any name you prefer)
4. In the "Connection" tab:
   - **Host name/address:** localhost
   - **Port:** 5432
   - **Maintenance database:** postgres
   - **Username:** postgres
   - **Password:** ashhad12
   - Check "Save password"
5. Click "Save"

### Step 3: Browse Your Data
1. Expand "Servers" → "Local PostgreSQL" → "Databases"
2. Expand "blockscan" database
3. Expand "Schemas" → "public" → "Tables"
4. Right-click any table → "View/Edit Data" → "All Rows"

### View Your Views
1. Expand "blockscan" → "Schemas" → "public" → "Views"
2. Right-click any view → "View/Edit Data" → "All Rows"

---

## Method 2: Using psql Command Line

### Open PowerShell and Connect
```powershell
# Set password environment variable
$env:PGPASSWORD = "ashhad12"

# Connect to database
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -d blockscan
```

### Useful Commands in psql
```sql
-- List all tables
\dt

-- List all views
\dv

-- List all functions
\df

-- View table data
SELECT * FROM users LIMIT 10;
SELECT * FROM wallets LIMIT 10;
SELECT * FROM transactions LIMIT 10;
SELECT * FROM tokens LIMIT 10;

-- View data from views
SELECT * FROM wallet_summary LIMIT 10;
SELECT * FROM transaction_history LIMIT 10;
SELECT * FROM user_statistics LIMIT 10;
SELECT * FROM token_market_summary LIMIT 10;

-- Count records
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM wallets;
SELECT COUNT(*) FROM transactions;

-- Exit psql
\q
```

---

## Method 3: Using VS Code Extension

### Install PostgreSQL Extension
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "PostgreSQL" by Chris Kolkman
4. Install it

### Connect to Database
1. Click the PostgreSQL icon in the left sidebar
2. Click "+" to add connection
3. Enter:
   - **Host:** localhost
   - **Port:** 5432
   - **Database:** blockscan
   - **User:** postgres
   - **Password:** ashhad12
4. Click "Connect"

### Query Data
1. Right-click on "blockscan" database
2. Select "New Query"
3. Write SQL queries and execute them

---

## Method 4: Quick View Script

I've created a PowerShell script (`view-database.ps1`) that you can run to quickly view your data.

---

## Quick SQL Queries to View Data

### View All Users
```sql
SELECT * FROM users ORDER BY created_at DESC LIMIT 20;
```

### View All Wallets
```sql
SELECT * FROM wallets ORDER BY created_at DESC LIMIT 20;
```

### View All Transactions
```sql
SELECT * FROM transactions ORDER BY timestamp DESC LIMIT 20;
```

### View All Tokens
```sql
SELECT * FROM tokens ORDER BY market_cap_usd DESC;
```

### View Wallet Summary (Using View)
```sql
SELECT * FROM wallet_summary ORDER BY total_balance_usd DESC LIMIT 10;
```

### View Transaction History (Using View)
```sql
SELECT * FROM transaction_history ORDER BY timestamp DESC LIMIT 20;
```

### View User Statistics (Using View)
```sql
SELECT * FROM user_statistics ORDER BY total_balance_usd DESC;
```

### View Token Market Data (Using View)
```sql
SELECT * FROM token_market_summary ORDER BY market_cap_usd DESC;
```

### View P2P Orders (Using View)
```sql
SELECT * FROM p2p_order_summary WHERE status = 'active' ORDER BY created_at DESC;
```

### View Block Summary (Using View)
```sql
SELECT * FROM block_summary ORDER BY height DESC LIMIT 10;
```

---

## Database Location

Your PostgreSQL data is stored in:
```
C:\Program Files\PostgreSQL\18\data
```

**Note:** Don't modify files in this directory directly. Always use PostgreSQL tools to access the data.

---

## Quick Access Script

Run the `view-database.ps1` script I created to quickly view your data without opening pgAdmin.

---

## Troubleshooting

### If you can't connect:
1. Make sure PostgreSQL service is running:
   - Open Services (services.msc)
   - Find "postgresql-x64-18" (or similar)
   - Make sure it's "Running"

2. Check if port 5432 is available:
   ```powershell
   Get-NetTCPConnection -LocalPort 5432
   ```

3. Verify database exists:
   ```powershell
   $env:PGPASSWORD = "ashhad12"
   & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -d postgres -c "\l"
   ```

---

## Recommended: Use pgAdmin

For the best experience viewing your data, I recommend using **pgAdmin** as it provides:
- Visual table browser
- Query editor with syntax highlighting
- Data export capabilities
- Easy navigation of database structure
- View execution plans
- Manage database objects

