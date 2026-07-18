const { Client } = require('pg');
const fs = require('fs');

function getDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    const envFile = fs.readFileSync('.env.local', 'utf8');
    const match = envFile.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    if (match) return match[1];
  } catch (err) {
    // Ignore error
  }
  return null;
}

const connectionString = getDatabaseUrl() || "postgresql://postgres.yxqezrvgvfwdgrlwczea:Alliswell12%40%40@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres";

const client = new Client({
  connectionString,
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to database...");
    const sql = fs.readFileSync('supabase_schema_parent.sql', 'utf8');
    await client.query(sql);
    console.log("Parent Schema executed successfully!");
  } catch (err) {
    console.error("Error executing parent schema:", err);
  } finally {
    await client.end();
  }
}

run();
