# Database Setup Guide

## Issue: Database Connection Error (ECONNREFUSED)

The backend cannot connect to PostgreSQL. Here's how to fix it:

## Option 1: Start PostgreSQL Service (If Installed)

### Windows:
1. Press `Win + R`, type `services.msc`, and press Enter
2. Look for a service named:
   - `postgresql-x64-XX` (where XX is version number)
   - `PostgreSQL Server XX`
   - Any service with "postgres" in the name
3. Right-click the service and select "Start"
4. Wait for it to start, then try running the backend again

### Command Line (Run as Administrator):
```powershell
# Find PostgreSQL service
Get-Service | Where-Object {$_.Name -like "*postgres*"}

# Start it (replace with actual service name)
net start postgresql-x64-16
# or
Start-Service postgresql-x64-16
```

## Option 2: Install PostgreSQL (If Not Installed)

1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer
3. During installation:
   - Remember the password you set for the `postgres` user
   - Note the port (default is 5432)
   - Choose a data directory
4. After installation, start the PostgreSQL service
5. Create your database:
   ```sql
   CREATE DATABASE test;
   ```

## Option 3: Update .env File

If PostgreSQL is running on a different host/port, update `.env`:

```env
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=your_password_here
PG_DATABASE=test
```

## Option 4: Use Docker (Alternative)

If you have Docker installed:

```bash
docker run --name postgres-db -e POSTGRES_PASSWORD=1234 -e POSTGRES_DB=test -p 5432:5432 -d postgres
```

## Verify Connection

Run the database checker:
```bash
node check-db.js
```

This will tell you exactly what's wrong with the connection.

## Create Database (If Needed)

If PostgreSQL is running but the database doesn't exist:

1. Connect to PostgreSQL:
   ```bash
   psql -U postgres
   ```

2. Create the database:
   ```sql
   CREATE DATABASE test;
   ```

3. Exit:
   ```sql
   \q
   ```

## Common Issues

- **ECONNREFUSED**: PostgreSQL service is not running
- **28P01**: Wrong username/password in .env
- **3D000**: Database doesn't exist - create it first
- **Port already in use**: Another PostgreSQL instance is running on that port

