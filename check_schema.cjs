const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.yxqezrvgvfwdgrlwczea:Alliswell12%40%40@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres' });
client.connect().then(() => {
  return client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'submissions'");
}).then(res => {
  console.log('submissions:', res.rows.map(r => r.column_name));
  return client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'enrollments'");
}).then(res => {
  console.log('enrollments:', res.rows.map(r => r.column_name));
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
