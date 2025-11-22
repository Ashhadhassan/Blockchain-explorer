# Reset PostgreSQL Password

## Current Issue
PostgreSQL is running, but the password in `.env` file doesn't match.

## Solution Options

### Option 1: Use pgAdmin (Easiest)
1. Open **pgAdmin** (should be installed with PostgreSQL)
2. Connect to PostgreSQL server (you may need to enter the password you set during installation)
3. Right-click on "Login/Group Roles" → "postgres" → "Properties"
4. Go to "Definition" tab
5. Enter new password: `1234`
6. Click "Save"

### Option 2: Reset via Command Line
1. Open Command Prompt as Administrator
2. Navigate to PostgreSQL bin:
   ```cmd
   cd "C:\Program Files\PostgreSQL\18\bin"
   ```
3. Connect as postgres user (you'll need the current password):
   ```cmd
   psql -U postgres
   ```
4. Change password:
   ```sql
   ALTER USER postgres WITH PASSWORD '1234';
   ```
5. Exit:
   ```sql
   \q
   ```

### Option 3: Update .env with Correct Password
If you know the current PostgreSQL password, just update the `.env` file:
```env
PG_PASSWORD=your_actual_password_here
```

### Option 4: Create New User (Alternative)
If you can't reset postgres password, create a new user:
```sql
CREATE USER dbuser WITH PASSWORD '1234';
ALTER USER dbuser CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE test TO dbuser;
```

Then update `.env`:
```env
PG_USER=dbuser
PG_PASSWORD=1234
```

## Verify Connection
After fixing the password, run:
```bash
node check-db.js
```

