const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.yxqezrvgvfwdgrlwczea:Alliswell12%40%40@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres'
});

async function fixConstraint() {
  await client.connect();
  try {
      await client.query(`ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_attachment_type_check;`);
      console.log("Dropped old constraint.");
      
      await client.query(`ALTER TABLE chat_messages ADD CONSTRAINT chat_messages_attachment_type_check CHECK (attachment_type IN ('image', 'audio', 'document', 'file', 'video'));`);
      console.log("Added new constraint allowing document and file types.");
  } catch (err) {
      console.error(err);
  }
  await client.end();
}

fixConstraint();
