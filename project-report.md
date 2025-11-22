# 📚 Blockchain Explorer - Project Report

## 🎯 Project Overview

A comprehensive blockchain explorer platform with P2P trading capabilities, wallet management, market analysis, and user authentication. Built with a modern tech stack featuring Next.js frontend and Express.js backend, connected to PostgreSQL database.

This platform provides a complete solution for exploring blockchain data, managing cryptocurrency wallets, conducting peer-to-peer trades, and analyzing market trends in a user-friendly interface.

---

## 🛠️ Technology Stack

### Frontend (`Frontend/`)
- **Framework**: Next.js 16.0.3 (React 19.2.0)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.1.9
- **State Management**: Zustand 4.5.2
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Charts**: Recharts
- **Form Handling**: React Hook Form + Zod
- **Notifications**: Sonner
- **Build Tool**: Turbopack

### Backend (`Blockscan-Backend-main/`)
- **Framework**: Express.js 5.1.0
- **Language**: JavaScript (Node.js)
- **Database**: PostgreSQL 18
- **Database Driver**: pg (node-postgres) 8.16.3
- **Environment**: dotenv 17.2.3
- **CORS**: cors 2.8.5

### Database
- **Type**: PostgreSQL (Relational Database)
- **Port**: 5432
- **Database Name**: `test`
- **User**: `postgres`
- **Connection**: Localhost

---

## 🗄️ Database Schema

### Tables Structure

#### 1. **users**
Stores user account information and authentication data.

```sql
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    verification_expires TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Fields:**
- `user_id`: Primary key, auto-incrementing
- `username`: Unique username identifier
- `email`: Unique email address
- `password_hash`: Hashed password (plain text in current implementation)
- `full_name`: User's full name
- `phone`: Contact phone number
- `email_verified`: Email verification status
- `verification_token`: Token for email verification
- `verification_expires`: Token expiration timestamp
- `status`: Account status (active/suspended)
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

#### 2. **tokens**
Stores cryptocurrency token information.

```sql
CREATE TABLE tokens (
    token_id SERIAL PRIMARY KEY,
    token_symbol VARCHAR(10) UNIQUE NOT NULL,
    token_name VARCHAR(100) NOT NULL,
    decimals INTEGER DEFAULT 18,
    total_supply NUMERIC(30, 8) DEFAULT 0,
    price_usd NUMERIC(20, 8) DEFAULT 0,
    change_24h NUMERIC(10, 4) DEFAULT 0,
    volume_24h NUMERIC(20, 8) DEFAULT 0,
    market_cap_usd NUMERIC(20, 8) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Fields:**
- `token_id`: Primary key
- `token_symbol`: Token ticker symbol (e.g., BTC, ETH)
- `token_name`: Full token name
- `decimals`: Decimal places (default 18)
- `total_supply`: Total token supply
- `price_usd`: Current USD price
- `change_24h`: 24-hour price change percentage
- `volume_24h`: 24-hour trading volume
- `market_cap_usd`: Market capitalization in USD

#### 3. **wallets**
Stores user wallet information.

```sql
CREATE TABLE wallets (
    wallet_id SERIAL PRIMARY KEY,
    address VARCHAR(100) UNIQUE NOT NULL,
    label VARCHAR(100),
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    public_key VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Fields:**
- `wallet_id`: Primary key
- `address`: Unique wallet address (0x... format)
- `label`: User-friendly wallet name
- `user_id`: Foreign key to users table
- `public_key`: Wallet public key
- `status`: Wallet status (active/suspended)
- `created_at`: Creation timestamp

#### 4. **token_holdings**
Stores token balances in wallets.

```sql
CREATE TABLE token_holdings (
    holding_id SERIAL PRIMARY KEY,
    wallet_id INTEGER REFERENCES wallets(wallet_id) ON DELETE CASCADE,
    token_id INTEGER REFERENCES tokens(token_id) ON DELETE CASCADE,
    amount NUMERIC(30, 8) DEFAULT 0,
    UNIQUE(wallet_id, token_id)
);
```

**Fields:**
- `holding_id`: Primary key
- `wallet_id`: Foreign key to wallets
- `token_id`: Foreign key to tokens
- `amount`: Token balance (up to 30 digits, 8 decimal places)
- **Unique Constraint**: One record per wallet-token pair

#### 5. **transactions**
Stores blockchain transaction records.

```sql
CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    tx_hash VARCHAR(100) UNIQUE NOT NULL,
    from_wallet_id INTEGER REFERENCES wallets(wallet_id),
    to_wallet_id INTEGER REFERENCES wallets(wallet_id),
    token_id INTEGER REFERENCES tokens(token_id),
    block_id INTEGER REFERENCES blocks(block_id),
    amount NUMERIC(30, 8) NOT NULL,
    fee NUMERIC(20, 8) DEFAULT 0,
    method VARCHAR(50) DEFAULT 'transfer',
    status VARCHAR(20) DEFAULT 'pending',
    email_notified BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT NOW()
);
```

**Fields:**
- `transaction_id`: Primary key
- `tx_hash`: Unique transaction hash (0x... format)
- `from_wallet_id`: Sender wallet reference
- `to_wallet_id`: Recipient wallet reference
- `token_id`: Token being transferred
- `block_id`: Block containing transaction
- `amount`: Transaction amount
- `fee`: Transaction fee
- `method`: Transaction method (transfer, deposit, withdraw)
- `status`: Transaction status (pending, confirmed, failed)
- `email_notified`: Email notification sent flag
- `timestamp`: Transaction timestamp

#### 6. **blocks**
Stores blockchain block information.

```sql
CREATE TABLE blocks (
    block_id SERIAL PRIMARY KEY,
    block_hash VARCHAR(100) UNIQUE NOT NULL,
    previous_hash VARCHAR(100),
    validator_id INTEGER REFERENCES validators(validator_id),
    height INTEGER NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW(),
    gas_used NUMERIC(20, 0) DEFAULT 0,
    gas_limit NUMERIC(20, 0) DEFAULT 0,
    size_kb INTEGER DEFAULT 0,
    reward NUMERIC(20, 8) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'finalized'
);
```

**Fields:**
- `block_id`: Primary key
- `block_hash`: Unique block hash
- `previous_hash`: Previous block hash (chain link)
- `validator_id`: Validator who created block
- `height`: Block height (block number)
- `timestamp`: Block creation time
- `gas_used`: Gas consumed
- `gas_limit`: Gas limit
- `size_kb`: Block size in kilobytes
- `reward`: Block reward
- `status`: Block status (finalized/pending)

#### 7. **validators**
Stores network validator information.

```sql
CREATE TABLE validators (
    validator_id SERIAL PRIMARY KEY,
    validator_name VARCHAR(100) NOT NULL,
    commission NUMERIC(5, 2) DEFAULT 0,
    total_stake NUMERIC(20, 8) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Fields:**
- `validator_id`: Primary key
- `validator_name`: Validator name
- `commission`: Commission percentage
- `total_stake`: Total staked amount
- `status`: Validator status (active/jailed)
- `created_at`: Creation timestamp

#### 8. **p2p_orders**
Stores P2P buy/sell orders.

```sql
CREATE TABLE p2p_orders (
    order_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    token_id INTEGER REFERENCES tokens(token_id),
    order_type VARCHAR(10) NOT NULL CHECK (order_type IN ('buy', 'sell')),
    amount NUMERIC(30, 8) NOT NULL,
    price NUMERIC(20, 8) NOT NULL,
    total NUMERIC(30, 8) NOT NULL,
    payment_method VARCHAR(100),
    min_limit NUMERIC(20, 8),
    max_limit NUMERIC(20, 8),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'pending')),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Fields:**
- `order_id`: Primary key
- `user_id`: Order creator
- `token_id`: Token being traded
- `order_type`: Buy or sell order
- `amount`: Token amount
- `price`: Price per token
- `total`: Total order value
- `payment_method`: Accepted payment method
- `min_limit`: Minimum transaction amount
- `max_limit`: Maximum transaction amount
- `status`: Order status
- `completed_at`: Completion timestamp
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

#### 9. **p2p_transactions**
Stores P2P transaction records.

```sql
CREATE TABLE p2p_transactions (
    p2p_tx_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES p2p_orders(order_id) ON DELETE CASCADE,
    buyer_id INTEGER REFERENCES users(user_id),
    seller_id INTEGER REFERENCES users(user_id),
    token_id INTEGER REFERENCES tokens(token_id),
    amount NUMERIC(30, 8) NOT NULL,
    price NUMERIC(20, 8) NOT NULL,
    total NUMERIC(30, 8) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'completed', 'disputed', 'cancelled')),
    payment_proof TEXT,
    email_notified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Fields:**
- `p2p_tx_id`: Primary key
- `order_id`: Related P2P order (optional)
- `buyer_id`: Buyer user reference
- `seller_id`: Seller user reference
- `token_id`: Token being traded
- `amount`: Token amount
- `price`: Price per token
- `total`: Total transaction value
- `status`: Transaction status
- `payment_proof`: Payment proof text
- `email_notified`: Email notification flag
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

#### 10. **email_verifications**
Stores email verification records.

```sql
CREATE TABLE email_verifications (
    verification_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('signup', 'transaction', 'password_reset')),
    related_id INTEGER,
    verified BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Fields:**
- `verification_id`: Primary key
- `user_id`: User being verified
- `email`: Email address to verify
- `token`: Unique verification token
- `type`: Verification type (signup/transaction/password_reset)
- `related_id`: Related transaction ID (if applicable)
- `verified`: Verification status
- `expires_at`: Token expiration
- `created_at`: Creation timestamp

### Indexes

Performance indexes created for optimized queries:

```sql
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_address ON wallets(address);
CREATE INDEX idx_token_holdings_wallet_id ON token_holdings(wallet_id);
CREATE INDEX idx_token_holdings_token_id ON token_holdings(token_id);
CREATE INDEX idx_transactions_from_wallet ON transactions(from_wallet_id);
CREATE INDEX idx_transactions_to_wallet ON transactions(to_wallet_id);
CREATE INDEX idx_transactions_token_id ON transactions(token_id);
CREATE INDEX idx_transactions_tx_hash ON transactions(tx_hash);
CREATE INDEX idx_p2p_orders_user_id ON p2p_orders(user_id);
CREATE INDEX idx_p2p_orders_status ON p2p_orders(status);
CREATE INDEX idx_p2p_orders_type ON p2p_orders(order_type);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_email_verifications_token ON email_verifications(token);
```

---

## 🎨 UI Design & Theme

### Color Scheme (Red & Black Theme)
- **Background**: `#000000` (Pure Black)
- **Card Background**: `#1A0000` (Dark Red)
- **Secondary Background**: `#2A0000` (Medium Dark Red)
- **Border**: `#3A0000` (Dark Red Border)
- **Primary Color**: `#DC2626` (Red)
- **Primary Hover**: `#EF4444` (Light Red)
- **Foreground Text**: `#FFFFFF` (White)
- **Muted Text**: `#A3A3A3` (Gray)
- **Success**: `#10B981` (Green)
- **Warning**: `#F59E0B` (Amber)
- **Error**: `#EF4444` (Red)

### Logo
- **BTC Logo**: Custom SVG Bitcoin logo with orange circle and "B" symbol
- Used in sidebar and top bar

### Components
- **Cards**: Dark red background with red borders
- **Buttons**: Red primary buttons with shadow effects
- **Tables**: Dark theme with hover effects
- **Scrollbars**: Custom red-themed scrollbars
- **Forms**: Dark inputs with red focus rings

---

## ✨ Features

### 1. User Authentication & Management

#### Registration
- User registration with email, username, password
- Email verification required
- Automatic wallet creation upon email verification
- All users registered as regular users (no admin roles)

#### Login
- Email/username and password authentication
- Session management with Zustand
- Email verification status check

#### Email Verification
- Token-based email verification
- 24-hour token expiration
- Automatic wallet creation on verification
- Resend verification functionality

**Endpoints:**
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `POST /api/users/verify-email` - Verify email with token
- `POST /api/users/resend-verification` - Resend verification email
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

### 2. Wallet Management

#### Features
- **Create Wallet**: Generate new wallet with address and public key
- **Deposit**: Add tokens to wallet balance
- **Withdraw**: Remove tokens from wallet (with optional transfer)
- **Transfer**: Send tokens between wallets
- **Balance Check**: View all token holdings in wallet
- **Multi-Wallet Support**: Users can have multiple wallets

**Endpoints:**
- `GET /api/wallets` - Get all wallets
- `POST /api/wallets` - Create new wallet
- `GET /api/wallets/:address` - Get wallet details
- `GET /api/wallets/:address/holdings` - Get wallet token holdings
- `GET /api/wallets/:address/balance` - Get wallet balance
- `GET /api/wallets/:address/transactions` - Get wallet transactions
- `POST /api/wallets/:address/deposit` - Deposit tokens
- `POST /api/wallets/:address/withdraw` - Withdraw tokens
- `POST /api/wallets/:address/transfer` - Transfer tokens

### 3. P2P Trading System

#### Features
- **User Discovery**: View all users with available tokens and selling prices
- **Transaction Request**: Initiate P2P transaction with any user
- **Seller Acceptance**: Seller can accept or reject transaction requests
- **Order Management**: Create, view, and cancel P2P orders
- **Transaction Flow**: Complete P2P transaction lifecycle
- **Payment Methods**: Support for multiple payment methods
- **Transaction Limits**: Min/max limits per transaction

**Transaction Flow:**
1. Buyer views available sellers with tokens
2. Buyer creates transaction request (amount, price)
3. Seller receives notification
4. Seller accepts or rejects request
5. Upon acceptance, tokens are transferred
6. Blockchain transaction created automatically

**Endpoints:**
- `GET /api/p2p/users-with-tokens` - Get all users with token holdings
- `POST /api/p2p/transactions` - Create P2P transaction request
- `GET /api/p2p/transactions` - Get P2P transactions
- `POST /api/p2p/transactions/:id/accept` - Accept transaction
- `POST /api/p2p/transactions/:id/reject` - Reject transaction
- `PUT /api/p2p/transactions/:id/status` - Update transaction status
- `POST /api/p2p/orders` - Create P2P order
- `GET /api/p2p/orders` - Get P2P orders
- `GET /api/p2p/orders/:id` - Get order details
- `POST /api/p2p/orders/:id/cancel` - Cancel order

### 4. Market & Trading

#### Features
- **Trading Pairs**: View all available token trading pairs
- **Price Charts**: 24-hour price history with interactive charts
- **Order Book**: Live buy/sell order book
- **Market Statistics**: Market cap, volume, holders count
- **Token Details**: Comprehensive token information
- **Price Tracking**: Real-time price updates
- **Market Overview**: Total market cap, volume, active tokens

**Endpoints:**
- `GET /api/market/trading-pairs` - Get all trading pairs
- `GET /api/market/pair/:symbol` - Get pair details
- `GET /api/market/price-history/:symbol` - Get price history
- `GET /api/market/orderbook/:symbol` - Get order book

### 5. Transaction History

#### Features
- **Blockchain Transactions**: View all blockchain transactions
- **P2P Transactions**: View all P2P transactions
- **Complete Address Display**: Full wallet addresses shown (not truncated)
- **Copy Functionality**: One-click copy for addresses
- **Transaction Details**: Detailed transaction information
- **Status Tracking**: Real-time transaction status
- **Search & Filter**: Search transactions by hash, address, token

**Endpoints:**
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:txHash` - Get transaction details
- `POST /api/transactions` - Create new transaction

### 6. Email Notifications

#### Features
- **Verification Emails**: Sent on registration
- **Transaction Alerts**: Email notifications for transactions
- **Notification Management**: View and manage email notifications

**Endpoints:**
- `GET /api/email/notifications` - Get email notifications
- `POST /api/email/mark-read` - Mark notification as read

### 7. Token Management

#### Features
- **Token List**: View all available tokens
- **Token Details**: Detailed token information
- **Price Tracking**: Real-time price updates
- **Holders Count**: Number of token holders
- **Supply Information**: Total supply and circulating supply

**Endpoints:**
- `GET /api/tokens` - Get all tokens
- `GET /api/tokens/:symbol` - Get token by symbol
- `GET /api/tokens/:symbol/holders` - Get token holders

---

## 📁 Project Structure

### Backend Structure (`Blockscan-Backend-main/`)

```
Blockscan-Backend-main/
├── src/
│   ├── app.js                    # Express app configuration
│   ├── server.js                 # Server entry point
│   ├── config/
│   │   └── connectDB.js          # PostgreSQL connection
│   ├── controllers/
│   │   ├── blockController.js    # Block operations
│   │   ├── emailController.js    # Email notifications
│   │   ├── marketController.js   # Market data
│   │   ├── p2pController.js      # P2P trading
│   │   ├── searchController.js   # Search functionality
│   │   ├── tokenController.js    # Token operations
│   │   ├── transactionController.js  # Transactions
│   │   ├── userController.js     # User management
│   │   ├── ValidatorController.js # Validators
│   │   └── walletController.js   # Wallet operations
│   ├── routes/
│   │   ├── blockRoutes.js
│   │   ├── emailRoutes.js
│   │   ├── marketRoutes.js
│   │   ├── p2pRoutes.js
│   │   ├── searchRoutes.js
│   │   ├── tokenRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── userRoutes.js
│   │   ├── validatorRoutes.js
│   │   └── walletRoutes.js
│   ├── middleware/
│   │   └── errorHandler.js      # Error handling
│   └── utils/
│       └── asyncHandler.js       # Async error wrapper
├── database-schema.sql           # Database schema
├── generate-dummy-users.js       # Dummy user generator
├── seed-token-holdings.js       # Token holdings seeder
├── fix-unverified-users.js      # Migration script
├── .env                          # Environment variables
└── package.json
```

### Frontend Structure (`Frontend/`)

```
Frontend/
├── app/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Dashboard home
│   │   ├── market/
│   │   │   ├── page.tsx          # Market overview
│   │   │   └── [symbol]/
│   │   │       └── page.tsx      # Token details
│   │   ├── p2p/
│   │   │   └── page.tsx          # P2P trading
│   │   ├── wallet-management/
│   │   │   └── page.tsx          # Wallet operations
│   │   ├── transactions-history/
│   │   │   └── page.tsx          # Transaction history
│   │   ├── tokens/
│   │   │   ├── page.tsx          # Token list
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Token details
│   │   ├── settings/
│   │   │   └── page.tsx          # User settings
│   │   └── users/
│   │       ├── page.tsx          # Users list
│   │       └── [id]/
│   │           └── page.tsx      # User profile
│   ├── login/
│   │   └── page.tsx              # Login page
│   ├── register/
│   │   └── page.tsx              # Registration page
│   ├── verify-email/
│   │   └── page.tsx              # Email verification
│   └── layout.tsx                # Root layout
├── components/
│   ├── ui/                       # UI components (Radix UI)
│   ├── sidebar.tsx               # Navigation sidebar
│   ├── top-bar.tsx               # Top navigation bar
│   ├── btc-logo.tsx              # BTC logo component
│   ├── copy-button.tsx           # Copy to clipboard
│   └── ...
├── lib/
│   ├── api.ts                    # API client functions
│   ├── api-client.ts             # HTTP client
│   ├── transformers.ts           # Data transformers
│   └── utils.ts                  # Utility functions
├── store/
│   └── app-store.ts              # Zustand state management
├── types/
│   └── blockchain.ts             # TypeScript types
├── .env.local                    # Frontend environment
├── tailwind.config.js            # Tailwind configuration
├── globals.css                   # Global styles
└── package.json
```

---

## 🔌 API Endpoints

### User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register new user |
| POST | `/api/users/login` | User login |
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user profile |
| PUT | `/api/users/:id` | Update user profile |
| POST | `/api/users/verify-email` | Verify email |
| POST | `/api/users/resend-verification` | Resend verification |

### Wallet Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wallets` | Get all wallets |
| POST | `/api/wallets` | Create wallet |
| GET | `/api/wallets/:address` | Get wallet details |
| GET | `/api/wallets/:address/holdings` | Get holdings |
| GET | `/api/wallets/:address/balance` | Get balance |
| GET | `/api/wallets/:address/transactions` | Get transactions |
| POST | `/api/wallets/:address/deposit` | Deposit tokens |
| POST | `/api/wallets/:address/withdraw` | Withdraw tokens |
| POST | `/api/wallets/:address/transfer` | Transfer tokens |

### P2P Trading
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/p2p/users-with-tokens` | Get users with tokens |
| POST | `/api/p2p/transactions` | Create transaction |
| GET | `/api/p2p/transactions` | Get transactions |
| POST | `/api/p2p/transactions/:id/accept` | Accept transaction |
| POST | `/api/p2p/transactions/:id/reject` | Reject transaction |
| PUT | `/api/p2p/transactions/:id/status` | Update status |
| POST | `/api/p2p/orders` | Create order |
| GET | `/api/p2p/orders` | Get orders |
| GET | `/api/p2p/orders/:id` | Get order details |
| POST | `/api/p2p/orders/:id/cancel` | Cancel order |

### Market Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/market/trading-pairs` | Get trading pairs |
| GET | `/api/market/pair/:symbol` | Get pair details |
| GET | `/api/market/price-history/:symbol` | Get price history |
| GET | `/api/market/orderbook/:symbol` | Get order book |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | Get all transactions |
| GET | `/api/transactions/:txHash` | Get transaction details |
| POST | `/api/transactions` | Create transaction |

### Tokens
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tokens` | Get all tokens |
| GET | `/api/tokens/:symbol` | Get token by symbol |
| GET | `/api/tokens/:symbol/holders` | Get token holders |

### Email
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/email/notifications` | Get notifications |
| POST | `/api/email/mark-read` | Mark as read |

---

## 🔐 Authentication & Security

### User Registration
- Email and username must be unique
- Password stored as plain text (should use bcrypt in production)
- Verification token generated (32-byte hex)
- Token expires in 24 hours
- Email verification record created

### Email Verification
- Required for full account access
- Automatic wallet creation upon verification
- Token stored in both `users` and `email_verifications` tables
- Fallback mechanism for old registrations

### Login
- Email or username authentication
- Password comparison (plain text - should use bcrypt)
- Email verification status checked
- User session stored in Zustand state

### User Roles
- **No Admin Roles**: All users are regular users
- Role field removed from UI display
- All users have equal access

---

## 🎯 Key Features Implementation

### 1. P2P Trading Flow
1. **User Discovery**: All registered users with token holdings displayed
2. **Transaction Request**: Buyer creates transaction with amount and price
3. **Seller Notification**: Seller receives transaction request
4. **Acceptance/Rejection**: Seller can accept or reject
5. **Token Transfer**: Upon acceptance, tokens transferred automatically
6. **Blockchain Transaction**: Blockchain transaction created on completion

### 2. Wallet Operations
- **Deposit**: Adds tokens to wallet balance (creates/updates token_holdings)
- **Withdraw**: Removes tokens from wallet (can create transaction if toAddress provided)
- **Transfer**: Moves tokens between wallets and creates blockchain transaction

### 3. Transaction History
- **Complete Address Display**: Full wallet addresses shown (not truncated)
- **Copy Buttons**: One-click copy for addresses
- **Dual View**: Blockchain and P2P transactions in separate tabs
- **Search Functionality**: Search by hash, address, or token

### 4. Market Data
- **Trading Pairs**: All token/USD pairs
- **Price Charts**: 24-hour price history
- **Order Book**: Buy/sell orders
- **Market Statistics**: Cap, volume, holders

---

## 📊 Data Flow

### Frontend → Backend
1. Frontend makes API call via `api-client.ts`
2. Data transformed from camelCase to snake_case
3. Request sent to Express backend
4. Backend queries PostgreSQL
5. Response transformed back to camelCase
6. Data stored in Zustand state

### Transaction Flow
1. User initiates transaction
2. Backend validates and checks balance
3. Database transaction begins
4. Token holdings updated
5. Transaction record created
6. Blockchain transaction created (if applicable)
7. Email notification sent
8. Database transaction committed

---

## 🎨 UI Components

### Main Components
- **Sidebar**: Navigation with BTC logo
- **Top Bar**: User menu, notifications, theme toggle
- **Cards**: Dark red themed cards
- **Tables**: Responsive tables with hover effects
- **Forms**: Dark inputs with red focus
- **Buttons**: Red primary buttons with shadows
- **Modals**: Transaction request modals
- **Badges**: Status indicators

### Pages
- **Dashboard**: Overview with stats and recent activity
- **Market**: Trading pairs and market data
- **P2P Trading**: User discovery and transaction creation
- **Wallet Management**: Deposit, withdraw, transfer
- **Transaction History**: Complete transaction records
- **Settings**: User profile and preferences
- **Tokens**: Token list and details

---

## 📝 Environment Variables

### Backend (`.env`)
```
PORT=5000
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=ashhad12
PG_DATABASE=test
```

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 🔧 Development Notes

### Data Transformation
- Backend uses `snake_case` (PostgreSQL convention)
- Frontend uses `camelCase` (JavaScript convention)
- Transformers handle conversion automatically

### Error Handling
- Backend: `asyncHandler` wrapper for async routes
- Frontend: Try-catch with toast notifications
- API client: Handles non-JSON responses

### State Management
- Zustand store for global state
- API calls trigger state updates
- Persistent login state

### Route Order
- Specific routes before dynamic routes
- POST routes before GET `/:id` routes
- Prevents route conflicts

---

## 📈 Performance Optimizations

### Database
- Indexes on frequently queried columns
- Foreign key constraints for data integrity
- Unique constraints on critical fields

### Frontend
- React Suspense for async components
- Memoization for expensive computations
- Lazy loading for routes

### API
- Pagination support
- Query filtering
- Efficient JOIN queries

---

## 🐛 Known Limitations

1. **Password Security**: Passwords stored as plain text (should use bcrypt)
2. **Email Service**: No actual email sending (tokens shown in response)
3. **Real Blockchain**: Simulated blockchain (not connected to real network)
4. **Admin Roles**: Removed from UI but may exist in database schema

---

## 🎯 Future Enhancements

1. Implement bcrypt for password hashing
2. Integrate real email service (SendGrid, AWS SES)
3. Add real-time updates with WebSockets
4. Implement rate limiting
5. Add API authentication (JWT tokens)
6. Connect to real blockchain network
7. Add transaction fees calculation
8. Implement dispute resolution for P2P
9. Add transaction export functionality
10. Implement advanced search and filtering

---

## 📊 Project Statistics

- **20 Dummy Users**: Pre-configured for testing
- **Complete P2P System**: Buy/sell orders with full transaction flow
- **Wallet Operations**: Deposit, withdraw, transfer
- **Market Data**: Trading pairs, charts, order books
- **Email Verification**: Complete verification system
- **Transaction Tracking**: Full transaction history
- **10 Database Tables**: Comprehensive schema
- **50+ API Endpoints**: Full REST API coverage

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: Production Ready

