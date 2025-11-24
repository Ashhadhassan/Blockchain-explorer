# New Database Components Documentation

This document lists all the new database components (Views, Triggers, and Functions) that were added to the Blockchain Explorer project.

**Date Created:** 2024  
**Database:** PostgreSQL  
**Schema File:** `Blockscan-Backend-main/database-schema.sql`

---

## Table of Contents

1. [Functions](#functions)
2. [Triggers](#triggers)
3. [Views](#views)
4. [Usage Examples](#usage-examples)

---

## Functions

### 1. `update_updated_at_column()`
**Type:** Trigger Function  
**Purpose:** Automatically updates the `updated_at` timestamp column when a record is updated.

**Returns:** `TRIGGER`

**Usage:** Used by triggers to automatically maintain timestamp fields.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### 2. `get_wallet_balance(p_wallet_id INTEGER, p_token_id INTEGER)`
**Type:** Scalar Function  
**Purpose:** Calculates and returns the balance of a specific token for a given wallet.

**Parameters:**
- `p_wallet_id` - Wallet ID
- `p_token_id` - Token ID

**Returns:** `NUMERIC(30, 8)` - Token balance

**Usage Example:**
```sql
SELECT get_wallet_balance(1, 2);  -- Get balance of token 2 in wallet 1
```

---

### 3. `validate_wallet_balance(p_wallet_id INTEGER, p_token_id INTEGER, p_amount NUMERIC)`
**Type:** Boolean Function  
**Purpose:** Validates if a wallet has sufficient balance for a transaction.

**Parameters:**
- `p_wallet_id` - Wallet ID
- `p_token_id` - Token ID
- `p_amount` - Amount to validate

**Returns:** `BOOLEAN` - True if balance is sufficient, False otherwise

**Usage Example:**
```sql
SELECT validate_wallet_balance(1, 2, 100.50);  -- Check if wallet 1 has at least 100.50 of token 2
```

---

### 4. `get_user_statistics(p_user_id INTEGER)`
**Type:** Table Function  
**Purpose:** Returns comprehensive statistics for a user including wallet count, transaction count, P2P orders, and total balance.

**Parameters:**
- `p_user_id` - User ID

**Returns:** Table with columns:
- `total_wallets` - Number of wallets owned
- `total_transactions` - Number of transactions
- `total_p2p_orders` - Number of P2P orders
- `total_balance_usd` - Total USD value of all holdings

**Usage Example:**
```sql
SELECT * FROM get_user_statistics(1);
```

---

### 5. `update_token_volume()`
**Type:** Trigger Function  
**Purpose:** Automatically updates token volume when a transaction status changes to 'confirmed'.

**Returns:** `TRIGGER`

**Usage:** Used by trigger to maintain token trading volume statistics.

---

### 6. `check_transaction_balance()`
**Type:** Trigger Function  
**Purpose:** Validates wallet balance before a transaction is inserted or updated. Logs warnings for insufficient balance.

**Returns:** `TRIGGER`

**Usage:** Used by trigger to monitor and warn about insufficient balances.

---

## Triggers

### 1. `update_users_updated_at`
**Table:** `users`  
**Event:** `BEFORE UPDATE`  
**Purpose:** Automatically updates the `updated_at` column when a user record is modified.

**Function:** `update_updated_at_column()`

---

### 2. `update_p2p_orders_updated_at`
**Table:** `p2p_orders`  
**Event:** `BEFORE UPDATE`  
**Purpose:** Automatically updates the `updated_at` column when a P2P order is modified.

**Function:** `update_updated_at_column()`

---

### 3. `update_p2p_transactions_updated_at`
**Table:** `p2p_transactions`  
**Event:** `BEFORE UPDATE`  
**Purpose:** Automatically updates the `updated_at` column when a P2P transaction is modified.

**Function:** `update_updated_at_column()`

---

### 4. `trigger_update_token_volume`
**Table:** `transactions`  
**Event:** `AFTER INSERT OR UPDATE`  
**Purpose:** Automatically updates the `volume_24h` field in the `tokens` table when a transaction is confirmed.

**Function:** `update_token_volume()`

**Behavior:** Only updates volume when transaction status changes to 'confirmed'.

---

### 5. `trigger_check_transaction_balance`
**Table:** `transactions`  
**Event:** `BEFORE INSERT OR UPDATE`  
**Purpose:** Validates wallet balance before transaction creation. Logs warnings if balance is insufficient.

**Function:** `check_transaction_balance()`

**Behavior:** Does not block transactions, only logs warnings for monitoring purposes.

---

## Views

### 1. `wallet_summary`
**Purpose:** Provides a comprehensive summary of wallets with balances and token counts.

**Columns:**
- `wallet_id` - Wallet ID
- `address` - Wallet address
- `label` - Wallet label
- `user_id` - Owner user ID
- `username` - Owner username
- `email` - Owner email
- `wallet_status` - Wallet status
- `token_count` - Number of different tokens held
- `total_tokens` - Total amount of all tokens
- `total_balance_usd` - Total USD value of all holdings
- `created_at` - Wallet creation timestamp

**Usage Example:**
```sql
SELECT * FROM wallet_summary WHERE user_id = 1;
SELECT * FROM wallet_summary ORDER BY total_balance_usd DESC LIMIT 10;
```

---

### 2. `transaction_history`
**Purpose:** Complete transaction history with all related information (wallets, users, tokens, blocks).

**Columns:**
- `transaction_id` - Transaction ID
- `tx_hash` - Transaction hash
- `amount` - Transaction amount
- `fee` - Transaction fee
- `method` - Transaction method
- `status` - Transaction status
- `timestamp` - Transaction timestamp
- `email_notified` - Email notification status
- `from_address` - Sender wallet address
- `from_label` - Sender wallet label
- `from_username` - Sender username
- `to_address` - Receiver wallet address
- `to_label` - Receiver wallet label
- `to_username` - Receiver username
- `token_symbol` - Token symbol
- `token_name` - Token name
- `token_price` - Token price in USD
- `block_hash` - Block hash
- `block_height` - Block height
- `block_timestamp` - Block timestamp

**Usage Example:**
```sql
SELECT * FROM transaction_history 
WHERE from_username = 'john' OR to_username = 'john'
ORDER BY timestamp DESC;
```

---

### 3. `user_statistics`
**Purpose:** Aggregated statistics for all users including wallet counts, transaction counts, and balances.

**Columns:**
- `user_id` - User ID
- `username` - Username
- `email` - Email address
- `status` - User status
- `email_verified` - Email verification status
- `created_at` - Account creation date
- `total_wallets` - Number of wallets
- `total_transactions` - Number of transactions
- `total_p2p_orders` - Total P2P orders
- `active_p2p_orders` - Active P2P orders
- `total_balance_usd` - Total USD value of holdings
- `unique_tokens_held` - Number of different tokens held

**Usage Example:**
```sql
SELECT * FROM user_statistics ORDER BY total_balance_usd DESC LIMIT 10;
SELECT * FROM user_statistics WHERE total_transactions > 100;
```

---

### 4. `token_market_summary`
**Purpose:** Market summary for all tokens with holder counts and transaction statistics.

**Columns:**
- `token_id` - Token ID
- `token_symbol` - Token symbol
- `token_name` - Token name
- `price_usd` - Current price in USD
- `change_24h` - 24-hour price change percentage
- `volume_24h` - 24-hour trading volume
- `market_cap_usd` - Market capitalization
- `total_supply` - Total token supply
- `holder_count` - Number of unique holders
- `transaction_count` - Total number of transactions
- `circulating_supply` - Circulating supply (sum of all holdings)
- `last_transaction_time` - Timestamp of most recent transaction

**Usage Example:**
```sql
SELECT * FROM token_market_summary ORDER BY market_cap_usd DESC;
SELECT * FROM token_market_summary WHERE holder_count > 100;
```

---

### 5. `p2p_order_summary`
**Purpose:** Summary of P2P orders with user and token information.

**Columns:**
- `order_id` - Order ID
- `user_id` - User ID who created the order
- `username` - Username
- `email` - Email address
- `token_symbol` - Token symbol
- `token_name` - Token name
- `order_type` - Order type ('buy' or 'sell')
- `amount` - Token amount
- `price` - Price per token
- `total` - Total order value
- `payment_method` - Payment method
- `min_limit` - Minimum order limit
- `max_limit` - Maximum order limit
- `status` - Order status
- `created_at` - Order creation time
- `updated_at` - Last update time
- `completed_at` - Completion time (if completed)
- `transaction_count` - Number of transactions for this order

**Usage Example:**
```sql
SELECT * FROM p2p_order_summary WHERE order_type = 'sell' AND status = 'active';
SELECT * FROM p2p_order_summary WHERE token_symbol = 'BTC' ORDER BY price ASC;
```

---

### 6. `block_summary`
**Purpose:** Block information with transaction counts and totals.

**Columns:**
- `block_id` - Block ID
- `block_hash` - Block hash
- `previous_hash` - Previous block hash
- `height` - Block height
- `timestamp` - Block timestamp
- `gas_used` - Gas used
- `gas_limit` - Gas limit
- `size_kb` - Block size in KB
- `reward` - Block reward
- `status` - Block status
- `validator_name` - Validator name who created the block
- `commission` - Validator commission
- `transaction_count` - Number of transactions in block
- `total_transaction_amount` - Total amount of all transactions
- `total_fees` - Total fees collected

**Usage Example:**
```sql
SELECT * FROM block_summary ORDER BY height DESC LIMIT 10;
SELECT * FROM block_summary WHERE validator_name = 'Validator1';
```

---

## Usage Examples

### Using Functions in Queries

```sql
-- Check wallet balance
SELECT get_wallet_balance(1, 2) AS balance;

-- Validate balance before transaction
SELECT validate_wallet_balance(1, 2, 100.50) AS has_sufficient_balance;

-- Get user statistics
SELECT * FROM get_user_statistics(1);
```

### Querying Views

```sql
-- Get top 10 wallets by balance
SELECT * FROM wallet_summary 
ORDER BY total_balance_usd DESC 
LIMIT 10;

-- Get recent transactions for a user
SELECT * FROM transaction_history 
WHERE from_username = 'john' 
ORDER BY timestamp DESC 
LIMIT 20;

-- Get top tokens by market cap
SELECT * FROM token_market_summary 
ORDER BY market_cap_usd DESC 
LIMIT 10;

-- Get active P2P sell orders
SELECT * FROM p2p_order_summary 
WHERE order_type = 'sell' 
  AND status = 'active' 
ORDER BY price ASC;

-- Get latest blocks with transaction info
SELECT * FROM block_summary 
ORDER BY height DESC 
LIMIT 10;
```

### Using Views in Application Code

```javascript
// In your backend controller
const result = await pool.query('SELECT * FROM wallet_summary WHERE user_id = $1', [userId]);

// Get user statistics
const stats = await pool.query('SELECT * FROM user_statistics WHERE user_id = $1', [userId]);

// Get transaction history
const history = await pool.query(
  'SELECT * FROM transaction_history WHERE from_address = $1 OR to_address = $1 ORDER BY timestamp DESC LIMIT 50',
  [walletAddress]
);
```

---

## Benefits

### Performance
- **Views** provide pre-computed joins and aggregations, reducing query complexity
- **Indexes** on underlying tables improve view query performance
- **Functions** encapsulate complex logic for reuse

### Data Integrity
- **Triggers** automatically maintain data consistency (timestamps, volumes)
- **Balance validation** helps prevent invalid transactions

### Developer Experience
- **Views** simplify complex queries into simple SELECT statements
- **Functions** provide reusable business logic
- **Consistent data** through automatic triggers

### Analytics
- **Views** enable easy reporting and analytics
- **User statistics** view provides quick insights
- **Market summaries** for trading analysis

---

## Maintenance Notes

1. **Views** are automatically updated when underlying tables change
2. **Triggers** run automatically on specified events
3. **Functions** can be updated with `CREATE OR REPLACE FUNCTION`
4. All components use `IF EXISTS` or `OR REPLACE` for safe re-execution

---

## File Location

All these components are defined in:
```
Blockscan-Backend-main/database-schema.sql
```

Starting from line 158 (after the table definitions and indexes).

---

**Last Updated:** 2024  
**Database Version:** PostgreSQL 18

