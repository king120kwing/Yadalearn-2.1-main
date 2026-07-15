const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.yxqezrvgvfwdgrlwczea:Alliswell12%40%40@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres'
});

async function checkLinks() {
  await client.connect();
  try {
      const res = await client.query(`SELECT * FROM teacher_student_links`);
      console.log("Links:");
      console.table(res.rows);
  } catch (err) {
      console.error(err);
  }
  await client.end();
}

checkLinks();
