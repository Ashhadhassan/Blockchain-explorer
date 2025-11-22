-- Database Schema for Blockchain Explorer
-- Create all necessary tables

-- Users table
CREATE TABLE IF NOT EXISTS users (
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

-- Tokens table
CREATE TABLE IF NOT EXISTS tokens (
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

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
    wallet_id SERIAL PRIMARY KEY,
    address VARCHAR(100) UNIQUE NOT NULL,
    label VARCHAR(100),
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    public_key VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Token Holdings table
CREATE TABLE IF NOT EXISTS token_holdings (
    holding_id SERIAL PRIMARY KEY,
    wallet_id INTEGER REFERENCES wallets(wallet_id) ON DELETE CASCADE,
    token_id INTEGER REFERENCES tokens(token_id) ON DELETE CASCADE,
    amount NUMERIC(30, 8) DEFAULT 0,
    UNIQUE(wallet_id, token_id)
);

-- Validators table
CREATE TABLE IF NOT EXISTS validators (
    validator_id SERIAL PRIMARY KEY,
    validator_name VARCHAR(100) NOT NULL,
    commission NUMERIC(5, 2) DEFAULT 0,
    total_stake NUMERIC(20, 8) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Blocks table
CREATE TABLE IF NOT EXISTS blocks (
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

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
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

-- P2P Orders table (Binance-style)
CREATE TABLE IF NOT EXISTS p2p_orders (
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

-- P2P Transactions table
CREATE TABLE IF NOT EXISTS p2p_transactions (
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

-- Email Verification table
CREATE TABLE IF NOT EXISTS email_verifications (
    verification_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('signup', 'transaction', 'password_reset')),
    related_id INTEGER, -- transaction_id or null
    verified BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_address ON wallets(address);
CREATE INDEX IF NOT EXISTS idx_token_holdings_wallet_id ON token_holdings(wallet_id);
CREATE INDEX IF NOT EXISTS idx_token_holdings_token_id ON token_holdings(token_id);
CREATE INDEX IF NOT EXISTS idx_transactions_from_wallet ON transactions(from_wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_to_wallet ON transactions(to_wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_token_id ON transactions(token_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tx_hash ON transactions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_p2p_orders_user_id ON p2p_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_p2p_orders_status ON p2p_orders(status);
CREATE INDEX IF NOT EXISTS idx_p2p_orders_type ON p2p_orders(order_type);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);

