// Test script to verify the P2P endpoint works
const { pool } = require("./src/config/connectDB");

async function testQuery() {
  try {
    console.log("Testing P2P users-with-tokens query...");
    
    const query = `
      SELECT 
        u.user_id,
        u.username,
        u.full_name,
        u.email,
        u.email_verified,
        u.status AS user_status,
        w.wallet_id,
        w.address AS wallet_address,
        tok.token_id,
        tok.token_symbol,
        tok.token_name,
        tok.decimals,
        th.amount AS available_amount,
        COALESCE(po.price, tok.price_usd, 0) AS selling_price,
        po.order_id,
        po.payment_method,
        po.min_limit,
        po.max_limit
      FROM users u
      JOIN wallets w ON w.user_id = u.user_id
      JOIN token_holdings th ON th.wallet_id = w.wallet_id
      JOIN tokens tok ON th.token_id = tok.token_id
      LEFT JOIN p2p_orders po ON po.user_id = u.user_id 
        AND po.token_id = tok.token_id 
        AND po.order_type = 'sell' 
        AND po.status = 'active'
      WHERE u.status = 'active' AND th.amount > 0
      ORDER BY u.user_id, tok.token_symbol
      LIMIT 10;
    `;

    const result = await pool.query(query);
    console.log(`✅ Query successful! Found ${result.rows.length} rows`);
    
    if (result.rows.length > 0) {
      console.log("\nSample data:");
      console.log(JSON.stringify(result.rows[0], null, 2));
    }
    
    // Group by user
    const usersMap = new Map();
    result.rows.forEach((row) => {
      if (!usersMap.has(row.user_id)) {
        usersMap.set(row.user_id, {
          user_id: row.user_id,
          username: row.username,
          full_name: row.full_name,
          email: row.email,
          email_verified: row.email_verified,
          user_status: row.user_status,
          wallet_address: row.wallet_address,
          tokens: [],
        });
      }

      const user = usersMap.get(row.user_id);
      user.tokens.push({
        token_id: row.token_id,
        token_symbol: row.token_symbol,
        token_name: row.token_name,
        decimals: row.decimals,
        available_amount: parseFloat(row.available_amount),
        selling_price: parseFloat(row.selling_price),
        order_id: row.order_id,
        payment_method: row.payment_method,
        min_limit: row.min_limit ? parseFloat(row.min_limit) : null,
        max_limit: row.max_limit ? parseFloat(row.max_limit) : null,
      });
    });

    const users = Array.from(usersMap.values());
    console.log(`\n✅ Grouped into ${users.length} users`);
    console.log(`First user has ${users[0]?.tokens.length || 0} tokens`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Query failed:", error);
    process.exit(1);
  }
}

testQuery();

