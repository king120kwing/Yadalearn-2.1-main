const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.yxqezrvgvfwdgrlwczea:Alliswell12%40%40@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres'
});

async function checkConstraint() {
  await client.connect();
  const res = await client.query(`
    SELECT pg_get_constraintdef(c.oid) AS constraint_def
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'chat_messages' AND c.conname = 'chat_messages_attachment_type_check';
  `);
  console.log(res.rows);
  await client.end();
}

checkConstraint().catch(console.error);
