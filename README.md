# 🐉 Blockchain Explorer

A comprehensive blockchain explorer platform with P2P trading capabilities, wallet management, market analysis, and user authentication.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-ISC-green)

## 🎯 Features

- **🔐 User Authentication**: Registration, login, and email verification
- **💼 Wallet Management**: Deposit, withdraw, and transfer tokens
- **🤝 P2P Trading**: Peer-to-peer token trading with seller acceptance flow
- **📊 Market Analysis**: Trading pairs, price charts, and market statistics
- **📜 Transaction History**: Complete transaction records with full address display
- **🎨 Modern UI**: Red & black theme with BTC logo

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16.0.3 (React 19.2.0)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **UI Components**: Radix UI

### Backend
- **Framework**: Express.js 5.1.0
- **Language**: JavaScript (Node.js)
- **Database**: PostgreSQL 18
- **ORM**: node-postgres (pg)

## 📁 Project Structure

```
DB_PROJECT/
├── Blockscan-Backend-main/    # Backend API
│   ├── src/
│   │   ├── controllers/      # Business logic
│   │   ├── routes/            # API routes
│   │   └── config/            # Database config
│   └── database-schema.sql    # Database schema
├── DB/                        # Frontend application
│   ├── app/                   # Next.js pages
│   ├── components/            # React components
│   ├── lib/                   # Utilities & API
│   └── store/                 # State management
└── Documentation/             # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL 18
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ashhadhassan/Blockchain-explorer.git
   cd Blockchain-explorer
   ```

2. **Setup Backend**
   ```bash
   cd Blockscan-Backend-main
   npm install
   # Configure .env file (see below)
   ```

3. **Setup Frontend**
   ```bash
   cd ../DB
   npm install
   # Configure .env.local file (see below)
   ```

4. **Setup Database**
   - Create PostgreSQL database: `test`
   - Run `Blockscan-Backend-main/database-schema.sql`
   - Run `Blockscan-Backend-main/generate-dummy-users.js`
   - Run `Blockscan-Backend-main/seed-token-holdings.js`

### Environment Variables

**Backend** (`.env`):
```env
PORT=5000
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=your_password
PG_DATABASE=test
```

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Running the Application

**Option 1: Automated Script**
```powershell
.\start-all.ps1
```

**Option 2: Manual Start**

Backend:
```bash
cd Blockscan-Backend-main
npm start
```

Frontend:
```bash
cd DB
npm run dev
```

## 📚 Documentation

- **[PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)** - Complete project documentation
- **[STARTUP_GUIDE.md](./STARTUP_GUIDE.md)** - Detailed startup instructions
- **[QUICK_START.md](./QUICK_START.md)** - Quick reference guide
- **[DUMMY_USERS_DOCUMENTATION.md](./DUMMY_USERS_DOCUMENTATION.md)** - Test user credentials

## 🔑 Default Credentials

All dummy users use the same password:
- **Password**: `password123`

See `DUMMY_USERS_DOCUMENTATION.md` for complete list of test users.

## 🌐 API Endpoints

### User Management
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users` - Get all users
- `POST /api/users/verify-email` - Verify email

### Wallet Management
- `GET /api/wallets` - Get all wallets
- `POST /api/wallets/:address/deposit` - Deposit tokens
- `POST /api/wallets/:address/withdraw` - Withdraw tokens
- `POST /api/wallets/:address/transfer` - Transfer tokens

### P2P Trading
- `GET /api/p2p/users-with-tokens` - Get users with tokens
- `POST /api/p2p/transactions` - Create transaction
- `POST /api/p2p/transactions/:id/accept` - Accept transaction
- `POST /api/p2p/transactions/:id/reject` - Reject transaction

### Market Data
- `GET /api/market/trading-pairs` - Get trading pairs
- `GET /api/market/pair/:symbol` - Get pair details
- `GET /api/market/price-history/:symbol` - Get price history

See [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) for complete API reference.

## 🗄️ Database Schema

The database includes 10 main tables:
- `users` - User accounts
- `wallets` - User wallets
- `tokens` - Cryptocurrency tokens
- `token_holdings` - Wallet balances
- `transactions` - Blockchain transactions
- `p2p_orders` - P2P buy/sell orders
- `p2p_transactions` - P2P transaction records
- `email_verifications` - Email verification records
- `blocks` - Blockchain blocks
- `validators` - Network validators

See `Blockscan-Backend-main/database-schema.sql` for complete schema.

## 🎨 UI Theme

- **Primary Color**: Red (#DC2626)
- **Background**: Black (#000000)
- **Cards**: Dark Red (#1A0000)
- **Logo**: BTC (Bitcoin) logo

## 📝 Features in Detail

### P2P Trading
- View all users with available tokens
- Create transaction requests
- Seller acceptance/rejection flow
- Automatic token transfer on acceptance
- Blockchain transaction creation

### Wallet Management
- Create multiple wallets per user
- Deposit tokens to wallets
- Withdraw tokens from wallets
- Transfer tokens between wallets
- Real-time balance tracking

### Transaction History
- Complete blockchain transaction records
- P2P transaction records
- Full wallet address display
- Copy-to-clipboard functionality
- Search and filter capabilities

## 🤝 Contributing

This is a personal project. For issues or suggestions, please open an issue on GitHub.

## 📄 License

ISC License

## 👤 Author

**Ashhad Hassan**
- GitHub: [@Ashhadhassan](https://github.com/Ashhadhassan)

## 🙏 Acknowledgments

- Built with Next.js and Express.js
- UI inspired by Binance
- Database design for blockchain applications

---

**Repository**: https://github.com/Ashhadhassan/Blockchain-explorer

