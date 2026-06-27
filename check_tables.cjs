const { Client } = require('pg');
const connectionString = "postgresql://postgres.yxqezrvgvfwdgrlwczea:Alliswell12%40%40@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres";
const client = new Client({ connectionString });

async function run() {
  try {
    await client.connect();
    console.log("Connected to database...");
    
    // Check tables in public schema
    const res = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    console.log("\nTables in public schema:");
    console.log(JSON.stringify(res.rows, null, 2));
    
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

run();
