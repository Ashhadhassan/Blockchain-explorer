# Dummy Users Documentation

This document contains login credentials and details for all 20 dummy users created for testing the BlockChain Explorer application.

## User Credentials

**Default Password for ALL users:** `password123`

### User List

| # | Username | Email | Full Name | Phone | Role |
|---|----------|-------|-----------|-------|------|
| 1 | alice_crypto | alice.crypto@example.com | Alice Johnson | +1234567890 | User |
| 2 | bob_trader | bob.trader@example.com | Bob Smith | +1234567891 | User |
| 3 | charlie_investor | charlie.investor@example.com | Charlie Brown | +1234567892 | User |
| 4 | diana_miner | diana.miner@example.com | Diana Williams | +1234567893 | User |
| 5 | edward_holder | edward.holder@example.com | Edward Davis | +1234567894 | User |
| 6 | fiona_validator | fiona.validator@example.com | Fiona Miller | +1234567895 | User |
| 7 | george_dealer | george.dealer@example.com | George Wilson | +1234567896 | User |
| 8 | helen_buyer | helen.buyer@example.com | Helen Moore | +1234567897 | User |
| 9 | ivan_seller | ivan.seller@example.com | Ivan Taylor | +1234567898 | User |
| 10 | julia_whale | julia.whale@example.com | Julia Anderson | +1234567899 | User |
| 11 | kevin_daytrader | kevin.daytrader@example.com | Kevin Thomas | +1234567900 | User |
| 12 | lisa_hodler | lisa.hodler@example.com | Lisa Jackson | +1234567901 | User |
| 13 | mike_swing | mike.swing@example.com | Mike White | +1234567902 | User |
| 14 | nina_scalper | nina.scalper@example.com | Nina Harris | +1234567903 | User |
| 15 | oscar_arbitrage | oscar.arbitrage@example.com | Oscar Martin | +1234567904 | User |
| 16 | patricia_yield | patricia.yield@example.com | Patricia Thompson | +1234567905 | User |
| 17 | quentin_staker | quentin.staker@example.com | Quentin Garcia | +1234567906 | User |
| 18 | rachel_liquidity | rachel.liquidity@example.com | Rachel Martinez | +1234567907 | User |
| 19 | steve_flashloan | steve.flashloan@example.com | Steve Robinson | +1234567908 | User |
| 20 | tina_defi | tina.defi@example.com | Tina Clark | +1234567909 | User |

## Login Instructions

1. Navigate to: http://localhost:3000/login
2. Enter any email from the table above
3. Enter password: `password123`
4. Click "Sign in"

## User Features

All users have:
- ✅ Email verified (ready to use immediately)
- ✅ Active status
- ✅ Default wallet created automatically
- ✅ Access to all user features:
  - P2P Trading (Buy/Sell orders)
  - Wallet Management (Deposit, Withdraw, Transfer)
  - Market Trading
  - Transaction History
  - Profile Settings

## Testing Scenarios

### P2P Trading
- Use different users to create buy/sell orders
- Test order matching and transactions
- Example: Alice creates a sell order, Bob creates a buy order

### Wallet Management
- Test deposits: Add tokens to wallets
- Test withdrawals: Remove tokens from wallets
- Test transfers: Move tokens between user wallets

### Market Trading
- View trading pairs
- Check price history
- View order books

### Email Verification
- All users are pre-verified
- New registrations will require email verification
- Transaction notifications can be tested

## Quick Test Users

**For P2P Testing:**
- Seller: `ivan.seller@example.com` / `password123`
- Buyer: `helen.buyer@example.com` / `password123`

**For Trading:**
- Trader 1: `bob.trader@example.com` / `password123`
- Trader 2: `kevin.daytrader@example.com` / `password123`

**For Wallet Testing:**
- User 1: `alice.crypto@example.com` / `password123`
- User 2: `charlie.investor@example.com` / `password123`

## Notes

- All users are created with the same password for easy testing
- Each user has one default wallet automatically created
- Email verification is set to `true` for all users
- Users can create additional wallets through the UI
- All users have "user" role (no admin access)

## Database Queries

To check users in database:
```sql
SELECT user_id, username, email, full_name, email_verified, status 
FROM users 
ORDER BY created_at DESC;
```

To check user wallets:
```sql
SELECT u.email, w.address, w.label 
FROM users u 
JOIN wallets w ON u.user_id = w.user_id 
ORDER BY u.email;
```
